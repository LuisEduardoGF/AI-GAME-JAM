type Mode = 'menu' | 'shop' | 'fight' | 'ending';
type Effect = 'sell' | 'restock' | 'train' | 'talk' | 'rest' | 'hit' | 'block' | 'dodge' | 'flame' | 'win' | 'lose' | 'confirm';
type Bus = 'music' | 'sfx';
type MusicLayer = { key: string; source: AudioBufferSourceNode; gain: GainNode };

const TRACKS: Record<Mode, string> = { menu: 'portada', shop: 'barrio', fight: 'ring', ending: 'portada' };
const FILES: Record<Effect, string[]> = {
  sell: ['venta-1', 'venta-2'], restock: ['reponer'], train: ['entrenar'], talk: ['hablar'], rest: ['descansar'],
  hit: ['impacto-1', 'impacto-2', 'impacto-3'], block: ['guardia'], dodge: ['esquiva'], flame: ['fuego'],
  win: ['victoria'], lose: ['derrota'], confirm: ['confirmar'],
};
// A small synth keeps feedback available while files load or if a host loses an asset.
const NOTES: Record<Mode, number[]> = {
  menu: [261.63, 0, 329.63, 392, 0, 329.63, 293.66, 0],
  shop: [196, 246.94, 293.66, 392, 293.66, 246.94, 220, 0],
  fight: [110, 146.83, 164.81, 220, 164.81, 146.83, 123.47, 0],
  ending: [261.63, 329.63, 392, 523.25, 392, 329.63, 293.66, 0],
};
const TONES: Record<Effect, number[]> = {
  sell: [880, 1174.66], restock: [493.88, 659.25], train: [196, 392, 587.33], talk: [523.25, 659.25], rest: [329.63],
  hit: [145, 92], block: [220, 180], dodge: [440, 880], flame: [220, 330, 440, 660],
  win: [523.25, 659.25, 783.99, 1046.5], lose: [293.66, 220, 164.81], confirm: [659.25],
};
const db = (value: number): number => 10 ** (value / 20);
const SETTINGS_KEY = 'patata-audio-volumes';

/** One gesture-created context, bounded one-shots, state music and persistent bus levels. */
export class GameAudio {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private sfxBus: GainNode | null = null;
  private uiBus: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private timer: number | null = null;
  private mode: Mode = 'menu';
  private step = 0;
  private enabled = true;
  private paused = false;
  private disposed = false;
  private volumes: Record<Bus, number> = { music: 0.75, sfx: 1 };
  private buffers = new Map<string, AudioBuffer>();
  private failed = new Set<string>();
  private warnings = new Set<string>();
  private requests: AbortController | null = null;
  private currentMusic: MusicLayer | null = null;
  private musicLayers = new Set<MusicLayer>();
  private voices = new Set<AudioScheduledSourceNode>();
  private envelopes = new Map<AudioScheduledSourceNode, GainNode>();
  private lastPlayed = new Map<Effect, number>();
  private lastVariant = new Map<Effect, number>();
  private duckUntil = 0;
  private onVisibility = (): void => { this.updateGains(); };

  constructor() {
    try {
      this.enabled = localStorage.getItem('patata-audio-enabled') !== 'false';
      const saved: unknown = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? 'null');
      if (saved && typeof saved === 'object') {
        for (const bus of ['music', 'sfx'] as const) {
          const value: unknown = (saved as Record<string, unknown>)[bus];
          if (typeof value === 'number' && Number.isFinite(value)) this.volumes[bus] = Math.max(0, Math.min(1, value));
        }
      }
    } catch { /* Storage is optional; defaults remain playable. */ }
  }

  isEnabled(): boolean { return this.enabled; }
  volume(bus: Bus): number { return this.volumes[bus]; }

  cycleVolume(bus: Bus): void {
    const levels = [0, 0.25, 0.5, 0.75, 1];
    this.volumes[bus] = levels.find(value => value > this.volumes[bus] + 0.001) ?? 0;
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.volumes)); } catch { /* Session controls still work. */ }
    this.updateGains();
  }

  setPaused(paused: boolean): void {
    if (this.paused === paused) return;
    this.paused = paused;
    this.updateGains();
  }

  setMode(mode: Mode): void {
    if (this.mode === mode) return;
    this.mode = mode;
    this.step = 0;
    this.activateMusic();
  }

  unlock(): void {
    if (this.disposed || !this.enabled) return;
    if (!this.context) {
      if (!window.AudioContext) { this.warn('context', 'Este navegador no dispone de Web Audio.'); return; }
      try {
        const context = new AudioContext();
        this.context = context;
        this.master = context.createGain();
        this.musicBus = context.createGain();
        this.sfxBus = context.createGain();
        this.uiBus = context.createGain();
        this.compressor = context.createDynamicsCompressor();
        this.compressor.threshold.value = -4;
        this.compressor.knee.value = 6;
        this.compressor.ratio.value = 12;
        this.compressor.attack.value = 0.004;
        this.compressor.release.value = 0.18;
        this.musicBus.connect(this.master);
        this.sfxBus.connect(this.master);
        this.uiBus.gain.value = db(-6);
        this.uiBus.connect(this.sfxBus);
        this.master.connect(this.compressor);
        this.compressor.connect(context.destination);
        this.master.gain.value = 0;
        this.updateGains();
        document.addEventListener('visibilitychange', this.onVisibility);
        this.requests = new AbortController();
        void this.loadAssets(context, this.requests.signal);
        this.activateMusic();
      } catch (error) {
        this.warn('context', `No se pudo iniciar el audio: ${String(error)}`);
        return;
      }
    }
    if (this.context?.state === 'suspended') {
      void this.context.resume().catch(error => this.warn('resume', `No se pudo reanudar el audio: ${String(error)}`));
    }
  }

  toggle(): boolean {
    this.enabled = !this.enabled;
    try { localStorage.setItem('patata-audio-enabled', String(this.enabled)); } catch { /* Optional persistence. */ }
    if (this.enabled) { this.unlock(); this.activateMusic(); }
    else { this.stopSequence(); this.stopMusic(); }
    this.updateGains();
    return this.enabled;
  }

  play(effect: Effect): void {
    this.unlock();
    const context = this.context;
    if (!context || !this.sfxBus || !this.uiBus || !this.enabled || this.disposed || document.hidden) return;
    const now = context.currentTime;
    if (now - (this.lastPlayed.get(effect) ?? -1) < 0.035 || this.voices.size >= 24) return;
    this.lastPlayed.set(effect, now);
    const variants = FILES[effect];
    let index = Math.floor(Math.random() * variants.length);
    if (variants.length > 1 && index === this.lastVariant.get(effect)) index = (index + 1) % variants.length;
    this.lastVariant.set(effect, index);
    const buffer = this.buffers.get(variants[index]);
    const bus = effect === 'confirm' || effect === 'talk' ? this.uiBus : this.sfxBus;
    if (buffer) {
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.playbackRate.value = effect === 'win' || effect === 'lose' || effect === 'confirm' ? 1 : 0.94 + Math.random() * 0.12;
      this.connectVoice(source, bus);
      source.start();
    } else {
      TONES[effect].forEach((frequency, i) => this.tone(frequency * (0.96 + Math.random() * 0.08), 0.075 + i * 0.015, 0.18, bus, 'square', i * 0.045));
    }
    if (effect === 'hit' || effect === 'block' || effect === 'flame' || effect === 'win' || effect === 'lose') {
      this.duckUntil = Math.max(this.duckUntil, now + (effect === 'win' || effect === 'lose' ? 1.1 : 0.18));
      this.updateGains();
    }
  }

  private async loadAssets(context: AudioContext, signal: AbortSignal): Promise<void> {
    const base = `${import.meta.env.BASE_URL}assets/`;
    const assets = [
      ...Object.values(FILES).flat().map(key => ({ key, url: `${base}sonidos/${key}.wav` })),
      ...['barrio', 'ring', 'portada'].map(key => ({ key, url: `${base}musica/${key}.mp3` })),
    ];
    await Promise.all(assets.map(async ({ key, url }) => {
      try {
        const response = await fetch(url, { signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const buffer = await context.decodeAudioData(await response.arrayBuffer());
        // A completed request must not revive audio after the scene is disposed.
        if (this.disposed || this.context !== context || signal.aborted) return;
        this.buffers.set(key, buffer);
        if (key === TRACKS[this.mode]) this.activateMusic();
      } catch (error) {
        if (signal.aborted || this.disposed) return;
        this.failed.add(key);
        this.warn(key, `Audio ${key}: ${String(error)}. Se usará síntesis de respaldo.`);
      }
    }));
  }

  private updateGains(): void {
    const context = this.context;
    if (!context || !this.master || !this.musicBus || !this.sfxBus || this.disposed) return;
    const now = context.currentTime;
    this.master.gain.cancelAndHoldAtTime(now);
    this.master.gain.setTargetAtTime(this.enabled && !document.hidden ? db(-3) : 0, now, 0.025);
    this.sfxBus.gain.cancelAndHoldAtTime(now);
    this.sfxBus.gain.setTargetAtTime(db(-3) * this.volumes.sfx, now, 0.025);
    const gain = db(-9 + (this.paused ? -9 : 0)) * this.volumes.music;
    const end = Math.max(now, this.duckUntil);
    this.musicBus.gain.cancelAndHoldAtTime(now);
    this.musicBus.gain.setTargetAtTime(gain * (end > now ? db(-7) : 1), now, 0.025);
    if (end > now) this.musicBus.gain.setTargetAtTime(gain, end, 0.22);
  }

  private activateMusic(): void {
    const context = this.context;
    if (!context || !this.musicBus || !this.enabled || this.disposed) return;
    const key = TRACKS[this.mode];
    if (this.currentMusic?.key === key) return;
    const buffer = this.buffers.get(key);
    this.stopMusic();
    if (!buffer) { this.startSequence(); return; }
    this.stopSequence();
    // Rapid screen changes can overlap several fading tracks; keep the graph bounded.
    while (this.musicLayers.size >= 4) {
      const oldest = this.musicLayers.values().next().value;
      if (!oldest) break;
      oldest.source.onended = null;
      oldest.source.stop();
      oldest.source.disconnect();
      oldest.gain.disconnect();
      this.musicLayers.delete(oldest);
    }
    const source = context.createBufferSource();
    const gain = context.createGain();
    source.buffer = buffer;
    source.loop = true;
    gain.gain.value = 0;
    source.connect(gain);
    gain.connect(this.musicBus);
    const layer = { key, source, gain };
    this.currentMusic = layer;
    this.musicLayers.add(layer);
    source.onended = () => { source.disconnect(); gain.disconnect(); this.musicLayers.delete(layer); };
    source.start();
    gain.gain.linearRampToValueAtTime(1, context.currentTime + 0.45);
  }

  private stopMusic(fade = 0.4): void {
    const layer = this.currentMusic;
    if (!layer || !this.context) return;
    this.currentMusic = null;
    const now = this.context.currentTime;
    layer.gain.gain.cancelAndHoldAtTime(now);
    layer.gain.gain.linearRampToValueAtTime(0, now + fade);
    layer.source.stop(now + fade + 0.01);
  }

  private startSequence(): void {
    this.stopSequence();
    if (!this.context || !this.musicBus) return;
    const beatMs = this.mode === 'fight' ? 220 : this.mode === 'ending' ? 360 : this.mode === 'menu' ? 330 : 280;
    this.timer = window.setInterval(() => {
      if (!this.enabled || document.hidden || !this.musicBus || this.disposed) return;
      const note = NOTES[this.mode][this.step++ % NOTES[this.mode].length];
      if (note > 0) this.tone(note, beatMs / 1000 * 0.82, 0.15, this.musicBus, 'triangle');
    }, beatMs);
  }

  private stopSequence(): void {
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
  }

  private connectVoice(source: AudioScheduledSourceNode, destination: AudioNode, envelope?: GainNode): void {
    this.voices.add(source);
    if (envelope) { this.envelopes.set(source, envelope); source.connect(envelope); envelope.connect(destination); }
    else source.connect(destination);
    source.onended = () => { source.disconnect(); envelope?.disconnect(); this.envelopes.delete(source); this.voices.delete(source); };
  }

  private tone(frequency: number, duration: number, peak: number, destination: GainNode, type: OscillatorType, delay = 0): void {
    const context = this.context;
    if (!context || this.voices.size >= 24 || this.disposed) return;
    const start = context.currentTime + delay;
    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    envelope.gain.setValueAtTime(0.0001, start);
    envelope.gain.exponentialRampToValueAtTime(peak, start + 0.008);
    envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    this.connectVoice(oscillator, destination, envelope);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.015);
  }

  private warn(key: string, message: string): void {
    if (this.warnings.has(key)) return;
    this.warnings.add(key);
    console.warn(message);
  }

  /** Read-only diagnostics for development; does not expose an extra global game API. */
  status(): { enabled: boolean; mode: Mode; paused: boolean; context: AudioContextState | 'none'; loaded: number; failed: string[]; music: string | null; voices: number; layers: number } {
    return { enabled: this.enabled, mode: this.mode, paused: this.paused, context: this.context?.state ?? 'none', loaded: this.buffers.size,
      failed: [...this.failed], music: this.currentMusic?.key ?? null, voices: this.voices.size, layers: this.musicLayers.size };
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.stopSequence();
    this.requests?.abort();
    document.removeEventListener('visibilitychange', this.onVisibility);
    for (const voice of this.voices) { voice.onended = null; voice.stop(); voice.disconnect(); }
    for (const envelope of this.envelopes.values()) envelope.disconnect();
    for (const { source, gain } of this.musicLayers) { source.onended = null; source.stop(); source.disconnect(); gain.disconnect(); }
    this.voices.clear();
    this.envelopes.clear();
    this.musicLayers.clear();
    this.currentMusic = null;
    this.buffers.clear();
    this.master?.disconnect(); this.musicBus?.disconnect(); this.sfxBus?.disconnect(); this.uiBus?.disconnect(); this.compressor?.disconnect();
    const context = this.context;
    this.context = null;
    this.master = null; this.musicBus = null; this.sfxBus = null; this.uiBus = null; this.compressor = null;
    if (context && context.state !== 'closed') void context.close().catch(error => this.warn('close', `No se pudo cerrar el audio: ${String(error)}`));
  }
}

