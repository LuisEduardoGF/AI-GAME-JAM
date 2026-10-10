import Phaser from 'phaser';
import { GameAudio } from '../audio';
import { BarrioArt, VISUAL, type IconKind } from './diseno';
import { guidePages } from './guia';
import { PATATA_SHEET, PatataVisual, poseForEvents, type PatataPlayback } from './patata-visual';
import {
  BOSSES, PRODUCTS, SKILLS, STYLES, applyAction, chooseStyle, deriveStats, endDay,
  equipSkill, inventoryCapacity, learnSkill, marketPrices, newCampaign, nextEvent, payDebt,
  restoreCampaign, settleBattle, skillStatus, startBattle, tickBattle,
  type CampaignMode, type CampaignState, type Outcome, type StatId, type UpgradeId,
} from './modelo';

const W = 960;
const H = 540;
const COLORS = { ...VISUAL, brown: VISUAL.panel, wood: VISUAL.edge };
const STAT_NAMES: Record<StatId, string> = { strength: 'Fuerza', agility: 'Agilidad', resistance: 'Resistencia' };
const SKILL_HINTS: Record<string, string> = {
  'flame-1': 'Cada 2: +2 daño y quemadura durante 3 s.',
  'flame-2': 'Cada 4: +4 daño, quemadura y +10 calor.',
  'flame-3': 'Cada 6: +7 daño; +2 más al llegar a 85 calor.',
  'ember-1': 'Cada 2: +2 daño y recupera 1 estamina.',
  'ember-2': 'Cada 4: +4 daño y acelera el siguiente golpe.',
  'ember-3': 'Cada 6: +6 daño y guardia de 4.',
  'stone-1': 'Cada 2: +1 daño y guardia de 2.',
  'stone-2': 'Cada 4: +3 daño y guardia de 4.',
  'stone-3': 'Cada 6: +6 daño y recupera 3 de vida.',
};
const PLACES = [
  { id: 'shop', name: 'PUESTO', texture: 'shop-interior', subtitle: 'Un negocio pequeño. Un sueño grande.' },
  { id: 'gym', name: 'GIMNASIO', texture: 'gym-interior', subtitle: 'El ring se gana mucho antes de subir.' },
  { id: 'home', name: 'CASA', texture: '', subtitle: 'También hay que aprender a bajar el fuego.' },
  { id: 'neighborhood', name: 'BARRIO', texture: 'market-alley', subtitle: 'Nadie reconstruye un barrio a solas.' },
] as const;
type Place = typeof PLACES[number]['id'];
type Overlay = 'help' | 'skills' | 'calendar' | 'profile' | 'upgrades' | 'pause' | 'night' | 'surrender' | 'new' | 'intro' | null;
type Button = { box: Phaser.GameObjects.Rectangle; label: Phaser.GameObjects.Text; action: () => void; enabled: boolean; primary: boolean; accent: number; strong: boolean };

/** Independent month/demo saves and a presentation layer over the pure campaign model. */
class MonthScene extends Phaser.Scene {
  private state: CampaignState;
  private mode: CampaignMode;
  private standalone: boolean;
  private saveKey: string;
  private title = true;
  private overlay: Overlay = null;
  private returnOverlay: Overlay = null;
  private guidePage = 0;
  private place: Place = 'shop';
  private root!: Phaser.GameObjects.Container;
  private art!: BarrioArt;
  private header?: Phaser.GameObjects.Container;
  private headerHealth?: Phaser.GameObjects.Text;
  private audio = new GameAudio();
  private buttons: Button[] = [];
  private focus = 0;
  private message = '';
  private warning = '';
  private hasSave = false;
  private speed: 1 | 2 = 1;
  private battleClock = 0;
  private lastSoundEvent = -1;
  private battleUi?: Phaser.GameObjects.Container;
  private battlePlayer?: Phaser.GameObjects.Image;
  private battleEnemy?: Phaser.GameObjects.Image;
  private patataVisual?: PatataVisual;
  private patataPlayback?: PatataPlayback;
  private hidden = document.hidden;
  private readonly onVisibility = (): void => {
    this.hidden = document.hidden;
    this.battleClock = 0;
    if (this.hidden && this.state.phase === 'fight' && !this.title) {
      this.overlay = 'pause';
      this.save();
      this.draw();
    }
    this.audio.setPaused(this.hidden || this.overlay !== null);
  };

  constructor(mode: CampaignMode, standalone = false) {
    super('Month');
    this.mode = mode;
    this.standalone = standalone;
    this.state = newCampaign(mode);
    this.saveKey = mode === 'demo' ? 'patata-demo-v2' : 'patata-mes-v2';
  }

  preload(): void {
    const base = `${import.meta.env.BASE_URL}assets/img/`;
    this.load.spritesheet(PATATA_SHEET.key, base + 'patata-ataques.png', { frameWidth: PATATA_SHEET.width, frameHeight: PATATA_SHEET.height });
    for (const file of ['shop-interior.jpg', 'gym-interior.jpg', 'market-alley.jpg', 'patata-boxer.png', 'yuca-boxer.png', 'rabano-boxer.png', 'batata-boxer.png', 'remolacha-boxer.png', 'esbirro-yuca.png', 'esbirro-rabano.png', 'esbirro-remolacha.png', 'esbirro-batata.png']) {
      this.load.image(file.replace(/\.(jpg|png)$/, ''), base + file);
    }
  }

  create(): void {
    this.root = this.add.container(0, 0);
    this.art = new BarrioArt(this);
    this.loadSave();
    this.input.on('pointerdown', () => this.audio.unlock());
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => this.onKey(event));
    document.addEventListener('visibilitychange', this.onVisibility);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      document.removeEventListener('visibilitychange', this.onVisibility);
      this.audio.dispose();
      if (new URLSearchParams(location.search).has('debug')) delete (window as unknown as { __mes?: unknown }).__mes;
    });
    if (new URLSearchParams(location.search).has('debug')) {
      const scene = this;
      Object.defineProperty(window, '__mes', { configurable: true, value: {
        get state() { return scene.state; },
        get overlay() { return scene.overlay; },
        get title() { return scene.title; },
        get place() { return scene.place; },
        get audio() { return scene.audio.status(); },
        get visual() { return scene.patataVisual ? { ...scene.patataVisual.snapshot(), frame: scene.patataVisual.frame } : null; },
        get layout() { return scene.layoutReport(); },
        replace(raw: unknown) { const state = restoreCampaign(raw); if (state?.mode === scene.mode) { scene.patataVisual = undefined; scene.patataPlayback = undefined; scene.state = state; scene.title = false; scene.overlay = state.phase === 'fight' ? 'pause' : null; scene.lastSoundEvent = state.combat?.events.at(-1)?.id ?? -1; scene.save(); scene.draw(); } },
      } });
    }
    this.draw();
    void Promise.all([document.fonts.load('16px Rubik'), document.fonts.load('16px "Press Start 2P"')]).then(() => {
      if (this.sys.isActive()) this.draw();
    }).catch(() => { /* Existing system fonts keep the interface readable. */ });
  }

  update(_time: number, delta: number): void {
    if (this.title || this.overlay || this.hidden) return;
    this.patataVisual?.update(Math.min(delta, 100) * this.speed);
    if (this.state.phase !== 'fight') return;
    this.battleClock += Math.min(delta, 100) * this.speed;
    if (this.battleClock < 200) return;
    const guarded = (this.state.combat?.player.guard ?? 0) > 0;
    this.state = tickBattle(this.state, this.battleClock);
    this.battleClock = 0;
    const newEvents = (this.state.combat?.events ?? []).filter(event => event.id > this.lastSoundEvent);
    const pose = poseForEvents(newEvents, this.state.style, this.state.combat?.playerAttacks ?? 0, guarded);
    if (pose) this.patataVisual?.play(pose);
    for (const event of newEvents) {
      this.lastSoundEvent = event.id;
      const effect = event.kind === 'block' ? (event.label === 'Patata esquiva.' ? 'dodge' : 'block')
        : event.kind === 'burn' || event.kind === 'skill' ? 'flame' : event.kind === 'recover' ? 'rest' : 'hit';
      this.audio.play(effect);
      if (event.kind === 'hit' || event.kind === 'skill') {
        const sprite = event.side === 'player' ? this.battlePlayer : this.battleEnemy;
        const direction = event.side === 'player' ? 1 : -1;
        if (sprite && (event.side === 'enemy' || !this.patataVisual)) this.tweens.add({ targets: sprite, x: sprite.x + direction * 15, duration: 85, yoyo: true });
        const skill = event.kind === 'skill';
        const number = this.text(skill ? 480 : event.side === 'player' ? 695 : 265, skill ? 207 : 236, skill ? event.label : `−${Math.round(event.amount)}`, skill ? 14 : 22, skill ? COLORS.cream : '#fff0d2', skill ? 260 : undefined).setOrigin(0.5);
        if (skill) number.setBackgroundColor('#3b3034').setPadding(12, 6).setFontStyle('bold');
        this.tweens.add({ targets: number, y: number.y - (skill ? 8 : 29), alpha: 0, duration: skill ? 850 : 600, ease: 'Cubic.easeOut', onComplete: () => number.destroy() });
        if (!skill) this.drawImpact(event.side, newEvents.some(item => item.side === event.side && item.kind === 'skill'));
      }
      if (event.kind === 'hit' && event.amount >= 5) this.cameras.main.shake(60, 0.002);
    }
    this.save();
    if (this.state.phase !== 'fight') { this.audio.play(this.state.combat?.winner === 'player' ? 'win' : 'lose'); this.draw(); }
    else this.drawBattleHud();
  }

  private onKey(event: KeyboardEvent): void {
    this.audio.unlock();
    if (event.repeat) return;
    if (event.code === 'KeyM') { this.audio.toggle(); this.draw(); return; }
    if (event.code === 'Escape') {
      if (this.title && !this.overlay) return;
      if (this.overlay) { this.overlay = this.returnOverlay; this.returnOverlay = null; }
      else this.overlay = 'pause';
      this.battleClock = 0;
      this.draw();
      return;
    }
    if (event.code === 'Tab' || event.code === 'ArrowDown' || event.code === 'ArrowRight' || event.code === 'ArrowUp' || event.code === 'ArrowLeft') {
      event.preventDefault();
      const direction = event.shiftKey || event.code === 'ArrowUp' || event.code === 'ArrowLeft' ? -1 : 1;
      for (let i = 0; i < this.buttons.length; i++) {
        this.focus = (this.focus + direction + this.buttons.length) % this.buttons.length;
        if (this.buttons[this.focus]?.enabled) break;
      }
      this.highlightFocus();
    } else if (event.code === 'Enter' || event.code === 'Space') {
      event.preventDefault();
      const button = this.buttons[this.focus];
      if (button?.enabled) button.action();
    }
  }

  private loadSave(): void {
    try {
      const raw = localStorage.getItem(this.saveKey);
      if (!raw) return;
      const state = restoreCampaign(JSON.parse(raw));
      if (!state || state.mode !== this.mode) throw new Error('Formato incompatible');
      this.state = state;
      this.hasSave = true;
      this.lastSoundEvent = state.combat?.events.at(-1)?.id ?? -1;
    } catch {
      this.warning = 'Tu guardado no se pudo leer. Conservamos una copia de respaldo.';
      try { const raw = localStorage.getItem(this.saveKey); if (raw) localStorage.setItem(`${this.saveKey}-corrupt`, raw); }
      catch { this.warning = 'No se pudo leer ni respaldar el guardado. Puedes comenzar una partida nueva.'; }
      this.state = newCampaign(this.mode);
    }
  }

  private save(): void {
    if (this.title) return;
    try { localStorage.setItem(this.saveKey, JSON.stringify(this.state)); this.hasSave = true; }
    catch { this.warning = 'El navegador no permite guardar. Mantén abierta esta partida.'; }
  }

  private accept(outcome: Outcome, sound: Parameters<GameAudio['play']>[0] = 'confirm'): void {
    if (outcome.ok && outcome.state.phase === 'fight' && this.state.phase !== 'fight') {
      this.lastSoundEvent = -1; this.patataVisual = undefined; this.patataPlayback = undefined;
    }
    this.state = outcome.state;
    this.message = outcome.message;
    this.battleClock = 0;
    if (outcome.ok) this.audio.play(sound);
    this.save();
    this.draw();
  }

  private draw(): void {
    if (this.patataVisual) this.patataPlayback = this.patataVisual.snapshot();
    this.patataVisual = undefined;
    this.tweens.killAll();
    this.root.removeAll(true);
    this.battleUi = undefined;
    this.battlePlayer = undefined;
    this.battleEnemy = undefined;
    this.header = undefined;
    this.headerHealth = undefined;
    this.buttons = [];
    this.focus = 0;
    this.audio.setPaused(this.overlay !== null || this.hidden);
    this.audio.setMode(this.title ? 'menu' : this.state.phase === 'ending' ? 'ending' : this.state.phase === 'fight' || this.state.phase === 'result' ? 'fight' : 'shop');
    this.rect(0, 0, W, H, COLORS.ink);
    if (this.title) this.drawTitle();
    else {
      this.drawHeader();
      if (this.state.phase === 'hub') this.drawHub();
      else if (this.state.phase === 'debt') this.drawDebt();
      else if (this.state.phase === 'prepare') this.drawPrepare();
      else if (this.state.phase === 'fight' || this.state.phase === 'result') this.drawBattle();
      else this.drawEnding();
      if (this.header) this.root.bringToTop(this.header);
    }
    if (this.overlay) this.drawOverlay();
    this.highlightFocus();
  }

  private drawTitle(): void {
    this.image('market-alley', 480, 270, 960, 540, 0.7);
    this.rect(0, 0, 640, 540, COLORS.ink, 0.46);
    this.art.halo(this.root, 770, 281, 300, 367, COLORS.flame);
    this.panel(48, 64, 564, 420, COLORS.edge, 0.97);
    this.rect(49, 65, 563, 5, COLORS.gold);
    this.art.icon(this.root, 'flame', 91, 98, 22, COLORS.gold);
    this.text(112, 90, 'CASI  /  HISTORIAS DEL BARRIO', 13, COLORS.muted);
    this.text(80, 137, 'PATATA\nCALIENTE', 45, '#0b0a10', 510).setFontFamily('"Press Start 2P"').setLineSpacing(8).setPosition(83, 141);
    this.text(78, 132, 'PATATA\nCALIENTE', 45, COLORS.cream, 510).setFontFamily('"Press Start 2P"').setLineSpacing(8);
    this.rect(78, 255, 70, 3, COLORS.gold);
    this.text(78, 271, 'PUESTO, PUÑOS Y UNA DEUDA PENDIENTE', 15, '#f0b45b');
    this.text(78, 305, this.mode === 'demo' ? 'Tres días para plantar cara a la Yuca.\nEntrena, equipa técnicas y defiende tu puesto.' : 'Un mes para recuperar tu barrio. Cuatro jefes.\nTu rutina y tus habilidades deciden cada pelea.', 18, COLORS.cream, 490);
    this.button(78, 379, 232, 46, this.hasSave ? 'NUEVA PARTIDA' : 'EMPEZAR', () => {
      if (this.hasSave) { this.overlay = 'new'; this.draw(); }
      else this.beginNew();
    });
    if (this.hasSave) this.button(326, 379, 232, 46, 'CONTINUAR', () => {
      this.title = false;
      this.overlay = this.state.phase === 'fight' ? 'pause' : null;
      this.battleClock = 0;
      this.draw();
    });
    this.addShadow(772, 430, 161, 28);
    this.rect(677, 438, 188, 6, COLORS.ink, 0.85);
    this.fighter('patata-boxer', 772, 430, 210, 260);
    this.panel(676, 85, 210, 38, COLORS.gold);
    this.text(693, 97, this.mode === 'demo' ? 'DEMO  /  3 DÍAS' : 'CAMPAÑA  /  30 DÍAS', 14, '#f0b45b');
    this.text(78, 448, this.warning || 'Ratón / táctil · Flechas + Enter · Esc: pausa · M: sonido', 14, this.warning ? '#ff9b83' : COLORS.muted, 780);
    this.button(78, 478, 232, 34, 'GUÍA DEL JUEGO', () => this.open('help'), true, false);
    if (!this.standalone) this.button(738, 470, 174, 38, this.mode === 'demo' ? 'VER CAMPAÑA' : 'PROBAR DEMO', () => this.goMode(this.mode === 'demo' ? 'month' : 'demo'), true, false);
  }

  private beginNew(): void {
    this.state = newCampaign(this.mode);
    this.title = false;
    this.overlay = 'intro';
    this.guidePage = 0;
    this.place = 'gym';
    this.lastSoundEvent = -1;
    this.warning = '';
    this.message = 'Primero entrena. Después elige tus habilidades.';
    this.save();
    this.draw();
  }

  private goMode(mode: CampaignMode): void {
    if (this.standalone) { this.title = true; this.overlay = null; this.draw(); return; }
    const url = new URL(location.href);
    for (const key of ['demo', 'mes', 'clasico', 'prueba']) url.searchParams.delete(key);
    url.searchParams.set(mode === 'demo' ? 'demo' : 'mes', '');
    location.href = url.toString();
  }

  private drawHeader(): void {
    const root = this.root;
    this.header = this.add.container(0, 0);
    root.add(this.header);
    this.root = this.header;
    this.rect(0, 0, W, 64, COLORS.ink);
    this.rect(0, 62, W, 2, COLORS.edge);
    this.art.icon(this.root, 'flame', 30, 27, 22, COLORS.gold);
    this.text(49, 12, 'PATATA CALIENTE', 18, COLORS.cream);
    this.text(49, 38, this.mode === 'demo' ? 'DEMO  /  PUESTO Y PUÑOS' : 'CASI  /  PUESTO Y PUÑOS', 11, COLORS.muted);
    for (const x of [333, 514, 698]) this.rect(x, 13, 1, 38, COLORS.edge, 0.7);
    this.text(355, 9, `DÍA ${this.state.day} / ${this.mode === 'demo' ? 3 : 30}`, 20, '#f0b45b');
    for (let i = 0; i < 6; i++) this.rect(357 + i * 15, 41, 10, 7, i < this.state.slot ? COLORS.edge : COLORS.gold, i < this.state.slot ? 0.7 : 1);
    this.text(455, 37, `${6 - this.state.slot}/6`, 11, COLORS.muted);
    this.art.icon(this.root, 'coin', 542, 24, 19, COLORS.gold);
    this.text(559, 9, `$${this.state.coins}`, 21, '#f0b45b');
    this.text(538, 38, `${this.state.xp} PT · técnica`, 12, COLORS.muted);
    const fighter = this.state.phase === 'fight' || this.state.phase === 'result' ? this.state.combat?.player : undefined;
    this.art.icon(this.root, 'heart', 729, 22, 15, COLORS.red);
    this.headerHealth = this.text(746, 12, `${Math.ceil(fighter?.hp ?? this.state.hp)} / ${fighter?.maxHp ?? this.state.maxHp} VIDA`, 13, COLORS.cream);
    this.art.icon(this.root, 'energy', 729, 45, 15, COLORS.gold);
    this.text(746, 39, `${this.state.energy} / ${deriveStats(this.state).maxEnergy} ENERGÍA`, 12, COLORS.muted);
    this.button(899, 13, 42, 39, 'II', () => { this.overlay = 'pause'; this.draw(); }, true, false);
    this.root = root;
  }

  private drawHub(): void {
    PLACES.forEach((place, i) => {
      const x = 18 + i * 236;
      this.button(x, 76, 218, 40, place.name, () => { this.place = place.id; this.audio.play('confirm'); this.draw(); }, true, place.id === this.place);
      this.art.icon(this.root, place.id, x + 27, 96, 20, place.id === this.place ? COLORS.gold : COLORS.edge);
    });
    const place = PLACES.find(item => item.id === this.place)!;
    this.panel(18, 130, 548, 299);
    if (place.texture) this.image(place.texture, 292, 280, 544, 294, 0.82);
    else this.drawHome();
    this.rect(20, 132, 544, 52, COLORS.ink, 0.92);
    this.text(36, 143, place.name === 'PUESTO' ? 'EL PUESTO DE PATATA' : place.name === 'CASA' ? 'UN TECHO PARA VOLVER A EMPEZAR' : place.name, 20);
    this.text(36, 169, place.subtitle, 12, COLORS.muted);
    this.addShadow(154, 378, 85, 13);
    this.fighter('patata-boxer', 154, 378, 108, 133);
    this.rect(34, 382, 516, 33, COLORS.ink, 0.85);
    this.text(45, 390, nextEvent(this.state), 13, '#e8b65f', 486);
    this.panel(583, 130, 359, 299);
    if (this.place === 'shop') this.drawMarket();
    else if (this.place === 'gym') this.drawGym();
    else if (this.place === 'home') this.drawRest();
    else this.drawNeighborhood();
    this.panel(18, 438, 924, 38, this.warning ? COLORS.red : COLORS.edge);
    this.rect(19, 439, 3, 36, this.warning ? COLORS.red : COLORS.gold);
    const receipt = this.text(32, 447, this.warning || this.message || this.state.message, 14, this.warning ? '#ff9b83' : COLORS.cream, 888);
    if (this.message) {
      receipt.setAlpha(0.72);
      this.tweens.add({ targets: receipt, alpha: 1, duration: 170, ease: 'Sine.easeOut' });
    }
    this.button(18, 489, 152, 36, 'HABILIDADES', () => this.open('skills'), true, false);
    this.button(184, 489, 119, 36, 'FICHA', () => this.open('profile'), true, false);
    this.button(317, 489, 132, 36, 'CALENDARIO', () => this.open('calendar'), true, false);
    this.button(463, 489, 110, 36, 'AYUDA', () => this.open('help'), true, false);
    this.button(586, 489, 160, 36, 'GUARDAR', () => { this.save(); this.message = 'Partida guardada en este navegador.'; this.draw(); }, true, false);
    this.button(760, 482, 181, 44, 'CERRAR EL DÍA', () => this.open('night'), true, this.place !== 'gym' || this.state.slot >= 6 || this.state.energy < 2);
  }

  private drawMarket(): void {
    const prices = marketPrices(this.state);
    this.text(601, 142, 'VÍVERES DEL BARRIO', 18);
    this.text(601, 168, `Lotes de 3 · una franja · almacén ${Object.values(this.state.inventory).reduce((sum, value) => sum + value, 0)} / ${inventoryCapacity(this.state)}`, 12, COLORS.muted, 322);
    PRODUCTS.forEach((product, i) => {
      const y = 197 + i * 59;
      const quote = prices[product.id];
      this.rect(596, y - 5, 332, 51, COLORS.ink, 0.55);
      this.art.icon(this.root, product.id, 615, y + 13, 24, product.id === 'tomato' ? COLORS.red : product.id === 'carrot' ? COLORS.flame : COLORS.gold);
      this.text(636, y, `${product.name}  ×${this.state.inventory[product.id]}`, 14);
      this.text(606, y + 28, `$${quote.buy} compra / $${quote.sell} venta · demanda ${quote.demand}`, 12, COLORS.muted, 312);
      this.button(807, y - 1, 60, 26, 'COMPRA', () => this.accept(applyAction(this.state, { type: 'buy', product: product.id, quantity: 3 }), 'restock'), this.state.slot < 6 && this.state.coins >= quote.buy * 3, false);
      this.button(877, y - 1, 50, 26, 'VENDE', () => this.accept(applyAction(this.state, { type: 'sell', product: product.id, quantity: Math.min(3, this.state.inventory[product.id]) }), 'sell'), this.state.slot < 6 && this.state.inventory[product.id] > 0 && quote.demand > 0, false);
    });
    this.button(601, 384, 326, 30, 'MEJORAR EL PUESTO / EQUIPO', () => this.open('upgrades'), true, false);
  }

  private drawGym(): void {
    this.text(601, 145, 'TU RUTINA, TU ESTILO', 18);
    const trainingCost = this.state.upgrades.gym >= 1 ? 3 : 4;
    this.text(601, 174, `Una franja, $${trainingCost} y 2 energía por sesión.\nMejora un atributo y gana técnica.`, 13, COLORS.muted, 310);
    (Object.keys(STAT_NAMES) as StatId[]).forEach((stat, i) => {
      const y = 226 + i * 54;
      const color = stat === 'strength' ? COLORS.flame : stat === 'agility' ? COLORS.ember : COLORS.stone;
      this.rect(597, y - 3, 331, 47, COLORS.ink, 0.55);
      this.art.icon(this.root, stat, 617, y + 18, 23, color);
      this.text(638, y + 3, `${STAT_NAMES[stat]}  ${this.state.stats[stat]}`, 15);
      for (let point = 0; point < 12; point++) this.rect(638 + point * 8, y + 29, 5, 4, point < this.state.stats[stat] ? color : COLORS.edge);
      this.button(765, y, 161, 40, 'ENTRENAR', () => this.accept(applyAction(this.state, { type: 'train', stat }), 'train'), this.state.slot < 6 && this.state.energy >= 2 && this.state.coins >= trainingCost);
    });
    this.text(601, 396, 'Habilidades: aprende y equipa hasta tres.', 12, '#e8b65f');
  }

  private drawRest(): void {
    this.text(601, 145, 'RECUPERAR TAMBIÉN CUENTA', 17);
    this.text(601, 183, 'Descansar recupera vida y energía.\nNo cuesta dinero. Sí una franja.\n\nEl calor se disipa con la calma;\nentrenar agotado no te hace más fuerte.', 16, COLORS.muted, 302);
    this.button(601, 324, 326, 50, 'DESCANSAR', () => this.accept(applyAction(this.state, { type: 'rest' }), 'rest'), this.state.slot < 6);
    this.text(601, 391, 'Cierra el día cuando hayas terminado.', 13, '#e8b65f');
  }

  private drawNeighborhood(): void {
    this.text(601, 145, 'EL BARRIO TIENE MEMORIA', 17);
    this.text(601, 184, 'Hablar con tus vecinos fortalece el vínculo.\nLa mafia cobra cada dos días.\n\nPuedes pagar o plantarte en el ring.\nAntes de pelear, prepara tus habilidades.', 16, COLORS.muted, 306);
    this.button(601, 328, 326, 48, 'HABLAR CON LOS VECINOS', () => this.accept(applyAction(this.state, { type: 'talk' }), 'talk'), this.state.slot < 6);
    this.text(601, 392, `Vínculo con el barrio: ${this.state.heart}`, 14, '#e8b65f');
  }

  private drawDebt(): void {
    this.image('market-alley', 480, 303, 960, 476, 0.5);
    this.panel(72, 115, 817, 349, COLORS.red);
    this.text(105, 145, 'HAN VENIDO A COBRAR', 31, '#e8b65f');
    this.text(105, 195, `${this.state.encounter?.name ?? 'Cobrador'} reclama $${this.state.encounter?.amount ?? 0}.`, 21, COLORS.cream, 550);
    this.text(105, 237, 'Tu negocio sostiene el entrenamiento.\nLa deuda no decide por ti: paga o defiende el puesto.\nSi no tienes dinero, tendrás que pelear.', 18, COLORS.muted, 554);
    this.art.halo(this.root, 787, 287, 153, 195, COLORS.red);
    this.addShadow(787, 372, 99, 16);
    this.fighter(this.state.encounter?.texture ?? 'yuca-boxer', 787, 372, 104, 148);
    this.button(105, 365, 265, 52, 'PAGAR LA DEUDA', () => this.accept(payDebt(this.state), 'sell'), this.state.coins >= (this.state.encounter?.amount ?? 0));
    this.button(397, 365, 282, 52, 'PREPARAR LA PELEA', () => { this.open('skills'); });
    this.button(718, 415, 137, 32, 'IR AL RING', () => this.accept(startBattle(this.state)), true, false);
  }

  private drawPrepare(): void {
    const enemy = this.state.encounter;
    this.image('gym-interior', 480, 303, 960, 476, 0.48);
    this.panel(57, 99, 846, 376, COLORS.gold);
    this.text(87, 122, 'ANTES DE LA CAMPANA', 30, '#e8b65f');
    this.text(87, 177, `${enemy?.name ?? 'Tu rival'} te espera.`, 24);
    this.text(87, 223, 'El combate es automático. Tus atributos marcan el ritmo.\nLas habilidades equipadas se activan solas.\n\nPrepara hasta tres y después observa el resultado.\nPuedes pausar y cambiar la velocidad durante la pelea.', 18, COLORS.muted, 566);
    this.art.halo(this.root, 793, 276, 164, 212, COLORS.red);
    this.addShadow(793, 372, 111, 18);
    this.fighter(enemy?.texture ?? 'yuca-boxer', 793, 372, 139, 175);
    this.text(87, 369, `Estilo: ${STYLES.find(style => style.id === this.state.style)?.name ?? ''}`, 15, '#e8b65f');
    this.button(87, 405, 293, 47, 'PREPARAR HABILIDADES', () => this.open('skills'));
    this.button(402, 405, 294, 47, 'SONAR LA CAMPANA', () => this.accept(startBattle(this.state)));
  }

  private drawBattle(): void {
    this.image('gym-interior', 480, 300, 960, 480, 0.7);
    this.rect(0, 64, W, 476, COLORS.ink, 0.42);
    this.panel(20, 79, 920, 333, COLORS.edge, 0.8);
    this.rect(22, 81, 916, 110, COLORS.ink, 0.96);
    this.text(39, 91, `${this.state.encounter?.name ?? 'Rival'}  /  ${this.state.encounter?.kind === 'boss' ? 'JEFE DEL BARRIO' : 'COBRADOR'}`, 19, '#f0b45b');
    this.art.halo(this.root, 265, 275, 235, 172, this.styleAccent(this.state.style));
    this.art.halo(this.root, 695, 275, 225, 172, COLORS.red);
    this.art.ring(this.root);
    if (this.textures.exists(PATATA_SHEET.key)) {
      this.battlePlayer = this.add.image(265, 345, PATATA_SHEET.key, 0).setOrigin(0.5, 1).setDisplaySize(186, 160);
      this.root.add(this.battlePlayer);
      this.patataVisual = new PatataVisual(this.battlePlayer, this.patataPlayback);
      if (this.state.phase === 'result') this.patataVisual.finish(this.state.combat?.winner === 'player');
    } else this.battlePlayer = this.fighter('patata-boxer', 265, 345, 110, 142);
    this.battleEnemy = this.fighter(this.state.encounter?.texture ?? 'yuca-boxer', 695, 345, 110, 142).setFlipX(true);
    if (this.state.phase === 'result') {
      const loser = this.state.combat?.winner === 'player' ? this.battleEnemy : this.battlePlayer;
      loser?.setAlpha(0.42).setAngle(this.state.combat?.winner === 'player' ? 8 : -6);
    }
    this.text(460, 297, 'VS', 20, COLORS.muted);
    this.rect(22, 367, 916, 43, COLORS.ink, 0.9);
    this.art.icon(this.root, this.state.style, 49, 389, 19, this.styleAccent(this.state.style));
    this.text(65, 377, 'PLAN DE PATATA', 10, COLORS.muted);
    const plan = this.state.equipped.map(id => SKILLS.find(skill => skill.id === id)?.name).filter(Boolean).join('  /  ');
    this.text(65, 391, plan || 'Sin habilidades equipadas · golpes básicos', 12, COLORS.cream, 820);
    this.panel(20, 420, 660, 104);
    this.text(38, 430, 'CRÓNICA DEL ROUND', 10, COLORS.muted);
    this.panel(698, 420, 240, 51, COLORS.edge);
    if (this.state.phase === 'fight') {
      this.button(698, 483, 107, 36, `${this.speed}× RITMO`, () => { this.speed = this.speed === 1 ? 2 : 1; this.draw(); }, true, false);
      this.button(820, 483, 119, 36, 'RENDIRSE', () => this.open('surrender'), true, false);
    } else this.button(627, 476, 311, 47, this.state.combat?.winner === 'player' ? 'VICTORIA · CONTINUAR' : 'DERROTA · CONTINUAR', () => this.accept(settleBattle(this.state), this.state.combat?.winner === 'player' ? 'win' : 'lose'));
    this.drawBattleHud();
  }

  private drawBattleHud(): void {
    this.battleUi?.destroy();
    this.battleUi = this.add.container(0, 0);
    this.root.add(this.battleUi);
    const battle = this.state.combat;
    if (!battle) return;
    this.headerHealth?.setText(`${Math.ceil(battle.player.hp)} / ${battle.player.maxHp} VIDA`);
    const old = this.root;
    this.root = this.battleUi;
    this.bar(44, 137, 318, 18, battle.player.hp, battle.player.maxHp, COLORS.green, `PATATA · ${Math.ceil(battle.player.hp)} / ${battle.player.maxHp}`);
    this.bar(598, 137, 318, 18, battle.enemy.hp, battle.enemy.maxHp, COLORS.red, `${Math.ceil(battle.enemy.hp)} / ${battle.enemy.maxHp} · RIVAL`);
    this.bar(44, 175, 318, 10, battle.player.stamina, battle.player.maxStamina, COLORS.blue, 'ESTAMINA');
    this.bar(598, 175, 318, 10, battle.enemy.stamina, battle.enemy.maxStamina, COLORS.blue, 'ESTAMINA');
    this.text(448, 126, `${Math.floor(battle.elapsedMs / 1000)}s`, 23, '#f0b45b');
    this.text(442, 160, 'TIEMPO', 11, COLORS.muted);
    this.text(38, 449, battle.log.slice(-4).map(line => line.length > 73 ? `${line.slice(0, 72)}…` : line).join('\n'), 12, COLORS.cream, 620).setLineSpacing(3);
    this.art.icon(this.root, 'flame', 715, 438, 18, COLORS.flame);
    this.text(732, 430, `CALOR ${Math.round(this.state.heat)} / 100`, 12, '#f0b45b');
    this.rect(710, 453, 211, 5, COLORS.ink);
    this.rect(710, 453, 211 * Phaser.Math.Clamp(this.state.heat / 100, 0, 1), 5, this.state.heat >= 85 ? COLORS.red : COLORS.flame);
    this.rect(710 + Math.round(211 * 0.85), 451, 2, 9, 0xfff0d2, 0.7);
    if (this.state.phase === 'result') this.text(478, 430, battle.winner === 'player' ? 'EL PUESTO RESISTE' : 'MAÑANA SERÁ OTRO DÍA', 11, battle.winner === 'player' ? '#92c77a' : '#e47b61');
    this.root = old;
  }

  private drawEnding(): void {
    this.image('market-alley', 480, 270, 960, 540, 0.7);
    this.rect(0, 64, W, 476, COLORS.ink, 0.5);
    this.panel(69, 112, 822, 354, COLORS.gold);
    this.text(102, 138, this.mode === 'demo' ? 'TU PRIMER ROUND TERMINA AQUÍ' : 'EL BARRIO RECUERDA', 26, '#f0b45b');
    this.art.halo(this.root, 805, 265, 115, 182, COLORS.flame);
    this.addShadow(805, 329, 72, 13);
    this.fighter('patata-boxer', 805, 329, 89, 119);
    const ending = this.standalone && this.mode === 'demo' && this.state.bossWins.includes('yuca')
      ? 'El barrio vio nacer a su campeón. Has completado esta demo de tres días.'
      : this.state.ending || this.state.message || 'Una nueva mañana espera al puesto de Patata.';
    this.text(102, 198, ending, 21, COLORS.cream, 625);
    const summary: { icon: IconKind; value: string; label: string }[] = [
      { icon: 'strength', value: `${this.state.bossWins.length}`, label: 'JEFES VENCIDOS' },
      { icon: 'heart', value: `${this.state.heart}`, label: 'VÍNCULO' },
      { icon: 'coin', value: `$${this.state.coins}`, label: 'EN CAJA' },
    ];
    summary.forEach((item, i) => {
      const x = 102 + i * 214;
      this.rect(x, 296, 201, 53, COLORS.ink, 0.72);
      this.art.icon(this.root, item.icon, x + 22, 323, 23, COLORS.gold);
      this.text(x + 44, 304, item.value, 20, COLORS.cream);
      this.text(x + 44, 332, item.label, 9, COLORS.muted);
    });
    this.button(102, 369, 266, 50, 'VOLVER A EMPEZAR', () => { this.overlay = 'new'; this.draw(); }, true, false);
    this.button(397, 369, 359, 50, this.mode === 'demo' && !this.standalone ? 'LA CAMPAÑA DE 30 DÍAS' : 'VOLVER AL MENÚ', () => {
      if (this.mode === 'demo' && !this.standalone) this.goMode('month');
      else { this.title = true; this.draw(); }
    });
  }

  private open(overlay: Overlay): void {
    this.returnOverlay = this.overlay === 'pause' && overlay === 'help' ? 'pause' : null;
    if (overlay === 'help') this.guidePage = 0;
    this.overlay = overlay;
    this.battleClock = 0;
    this.draw();
  }

  private closeOverlay(): void {
    this.overlay = this.returnOverlay;
    this.returnOverlay = null;
    this.battleClock = 0;
    this.draw();
  }

  private drawOverlay(): void {
    for (const button of this.buttons) button.box.disableInteractive();
    this.buttons = [];
    this.rect(0, 0, W, H, 0x080605, 0.86);
    this.panel(32, 33, 896, 474, COLORS.gold);
    this.rect(61, 101, 835, 1, COLORS.edge, 0.55);
    if (this.overlay === 'skills') { this.drawSkills(); return; }
    if (this.overlay === 'calendar') { this.drawCalendar(); return; }
    const titles: Partial<Record<NonNullable<Overlay>, string>> = {
      intro: 'TODO EMPIEZA CON UNA RUTINA', help: 'CÓMO SE VIVE EN EL BARRIO', profile: 'TU FICHA', upgrades: 'INVERTIR EN TU FUTURO', pause: 'UN RESPIRO', night: 'ANTES DE BAJAR LA PERSIANA', surrender: '¿DEJAR EL COMBATE?', new: '¿EMPEZAR OTRA PARTIDA?',
    };
    this.text(61, 58, titles[this.overlay!] ?? '', 26, '#e8b65f');
    if (this.overlay === 'pause') {
      this.text(61, 112, 'La pelea y el reloj están detenidos.', 18, COLORS.muted);
      this.button(62, 161, 399, 47, 'CONTINUAR', () => { this.overlay = null; this.battleClock = 0; this.draw(); });
      this.button(62, 225, 399, 47, 'GUARDAR Y SALIR AL MENÚ', () => { this.save(); this.overlay = null; this.title = true; this.draw(); });
      this.button(62, 289, 399, 47, 'AYUDA', () => this.open('help'));
      this.button(502, 161, 393, 47, `MÚSICA ${Math.round(this.audio.volume('music') * 100)}%`, () => { this.audio.cycleVolume('music'); this.draw(); });
      this.button(502, 225, 393, 47, `EFECTOS ${Math.round(this.audio.volume('sfx') * 100)}%`, () => { this.audio.cycleVolume('sfx'); this.draw(); });
      this.button(502, 289, 393, 47, this.audio.isEnabled() ? 'SONIDO ACTIVADO' : 'SONIDO SILENCIADO', () => { this.audio.toggle(); this.draw(); });
      this.text(61, 379, this.warning || 'El guardado conserva tus habilidades y el estado de la pelea.\nAl recuperar un combate, continúas desde esta pausa.', 17, COLORS.muted, 790);
    } else if (this.overlay === 'intro' || this.overlay === 'help') {
      this.drawGuide();
    } else if (this.overlay === 'profile') this.drawProfile();
    else if (this.overlay === 'upgrades') this.drawUpgrades();
    else if (this.overlay === 'night') {
      this.text(62, 127, `Has usado ${this.state.slot} de las seis franjas de hoy.`, 22);
      this.text(62, 187, 'Dormir recupera parte de tu energía y tu vida.\nLos atributos descuidados durante varios días se degradan.\nLos precios y la demanda cambian con la nueva mañana.', 19, COLORS.muted, 810);
      this.text(62, 304, nextEvent(this.state), 22, '#e8b65f', 810);
      this.button(62, 421, 344, 48, 'SEGUIR CON EL DÍA', () => { this.overlay = null; this.draw(); });
      this.button(448, 421, 444, 48, 'CONFIRMAR · CERRAR EL DÍA', () => { this.overlay = null; this.accept(endDay(this.state), 'rest'); });
    } else if (this.overlay === 'new') {
      this.text(62, 149, 'Esta acción reemplaza el guardado de este modo.\nLa demo y la campaña conservan partidas separadas.', 22, COLORS.cream, 809);
      this.button(62, 364, 346, 52, 'CONSERVAR MI PARTIDA', () => { this.overlay = null; this.draw(); });
      this.button(451, 364, 441, 52, 'EMPEZAR DE NUEVO', () => this.beginNew());
    } else if (this.overlay === 'surrender') {
      this.text(62, 150, 'Rendirse cuenta como una derrota.\nPodrás seguir entrenando mañana.', 24, COLORS.cream, 800);
      this.button(62, 364, 346, 52, 'SEGUIR PELEANDO', () => { this.overlay = null; this.draw(); });
      this.button(451, 364, 441, 52, 'ACEPTAR LA DERROTA', () => {
        if (this.state.combat) { this.state.combat.player.hp = 0; this.state.combat.winner = 'enemy'; this.state.phase = 'result'; }
        this.overlay = null;
        this.save();
        this.audio.play('lose');
        this.draw();
      });
    }
    if (!['new', 'night', 'surrender', 'pause', 'help', 'intro'].includes(this.overlay!)) this.button(712, 449, 180, 36, 'VOLVER', () => { this.overlay = null; this.draw(); });
  }

  private drawGuide(): void {
    const pages = guidePages(this.mode);
    const page = pages[this.guidePage] ?? pages[0]!;
    // Registrar primero la salida conserva Enter para empezar o volver.
    this.button(628, 442, 265, 44, this.overlay === 'intro' ? 'VAMOS A ENTRENAR' : 'VOLVER', () => this.closeOverlay());
    this.text(62, 113, 'ELIGE UN TEMA', 13, COLORS.muted);
    pages.forEach((item, index) => {
      this.button(62, 139 + index * 36, 196, 31, `${index + 1}. ${item.label}`, () => { this.guidePage = index; this.draw(); }, true, this.guidePage === index);
    });
    this.text(283, 114, page.title, 18, '#f0b45b');
    page.sections.forEach((section, index) => {
      const y = 151 + index * 82;
      this.text(283, y, section.title, 15, '#f0b45b');
      this.text(283, y + 23, section.body, 17, COLORS.cream, 598).setFontStyle('normal').setLineSpacing(2);
    });
    this.rect(283, 392, 609, 39, COLORS.ink, 0.75);
    this.text(293, 399, page.tip, 13, COLORS.muted, 586);
    this.button(62, 442, 166, 44, 'ANTERIOR', () => { this.guidePage -= 1; this.draw(); }, this.guidePage > 0, false);
    this.button(244, 442, 166, 44, 'SIGUIENTE', () => { this.guidePage += 1; this.draw(); }, this.guidePage < pages.length - 1, false);
    this.text(442, 457, `${this.guidePage + 1} / ${pages.length}`, 14, COLORS.muted);
  }

  private drawSkills(): void {
    this.text(60, 51, 'TRES CAMINOS, TUS PROPIOS PUÑOS', 23, '#f0b45b');
    this.text(60, 82, `${this.state.xp} puntos de técnica · Equipadas ${this.state.equipped.length} / 3 · Aprende y luego equipa`, 14, COLORS.muted);
    STYLES.forEach((style, column) => {
      const x = 60 + column * 286;
      const accent = this.styleAccent(style.id);
      this.button(x, 111, 267, 33, style.name, () => { this.accept(chooseStyle(this.state, style.id)); }, true, this.state.style === style.id);
      this.art.icon(this.root, style.id, x + 19, 127, 18, accent);
      this.rect(x, 141, 267, 3, accent);
      SKILLS.filter(skill => skill.style === style.id).forEach((skill, row) => {
        const y = 155 + row * 88;
        const learned = this.state.learned.includes(skill.id);
        const equipped = this.state.equipped.includes(skill.id);
        const reason = skillStatus(this.state, skill.id);
        this.panel(x, y, 267, 80, equipped ? accent : COLORS.edge);
        this.rect(x + 2, y + 2, 263, 2, accent, learned ? 0.85 : 0.28);
        if (row > 0) this.rect(x + 131, y - 8, 4, 8, accent, 0.7);
        this.art.icon(this.root, !learned && reason ? 'lock' : style.id, x + 18, y + 17, 15, learned ? accent : COLORS.edge);
        this.text(x + 32, y + 8, skill.name, 14, COLORS.cream, 225).setFontStyle('bold');
        this.text(x + 10, y + 29, SKILL_HINTS[skill.id] ?? skill.description, 12, COLORS.muted, 244);
        if (equipped) {
          this.rect(x + 10, y + 56, 117, 18, accent, 0.15);
          this.art.icon(this.root, 'check', x + 19, y + 65, 13, accent);
        }
        this.text(x + (equipped ? 31 : 10), y + 59, learned ? equipped ? 'EQUIPADA' : 'APRENDIDA' : `${skill.cost} PT · ${STAT_NAMES[skill.stat]} ${skill.minimum}`, 12, learned ? COLORS.cream : COLORS.muted, equipped ? 115 : 147);
        this.button(x + 164, y + 50, 94, 24, learned ? equipped ? 'QUITAR' : 'EQUIPAR' : 'APRENDER', () => this.accept(learned ? equipSkill(this.state, skill.id) : learnSkill(this.state, skill.id), 'train'), learned || reason === null, false);
      });
    });
    this.text(60, 426, this.message || 'El requisito de atributo y la técnica anterior desbloquean cada rama.', 12, COLORS.muted, 820);
    this.button(620, 454, 272, 32, 'LISTO · VOLVER', () => { this.overlay = null; this.draw(); });
  }

  private drawCalendar(): void {
    this.text(60, 56, 'LOS DÍAS QUE QUEMAN', 27, '#e8b65f');
    this.text(60, 96, 'Cobro cada dos días · Entrena, descansa y prepara tus encuentros', 15, COLORS.muted);
    const days = this.mode === 'demo' ? 3 : 30;
    for (let day = 1; day <= days; day++) {
      const x = 62 + ((day - 1) % 10) * 84;
      const y = 147 + Math.floor((day - 1) / 10) * 83;
      const boss = this.mode === 'demo' ? day === 3 ? BOSSES[0] : undefined : BOSSES.find(item => item.day === day);
      this.rect(x, y, 75, 69, day === this.state.day ? 0x77513c : COLORS.brown, 1, day === this.state.day ? COLORS.gold : COLORS.wood);
      this.text(x + 10, y + 8, `${day}`, 21, day < this.state.day ? COLORS.muted : COLORS.cream);
      this.art.icon(this.root, day < this.state.day ? 'check' : boss ? 'flame' : day % 2 === 0 ? 'coin' : 'gym', x + 59, y + 20, 10, boss ? COLORS.red : COLORS.gold);
      this.text(x + 6, y + 42, boss ? 'JEFE' : day % 2 === 0 ? 'COBRO' : 'RUTINA', 10, boss ? '#ff9b83' : '#e8b65f');
    }
    const bosses = this.mode === 'demo' ? `${BOSSES[0]?.name ?? 'Yuca'} · día 3` : BOSSES.map(boss => `${boss.name} · ${boss.day}`).join('  /  ');
    this.text(62, 418, bosses, 15, COLORS.muted, 820);
    this.button(625, 454, 268, 32, 'VOLVER', () => { this.overlay = null; this.draw(); });
  }

  private drawProfile(): void {
    const stats = deriveStats(this.state);
    this.art.halo(this.root, 185, 278, 192, 234, this.styleAccent(this.state.style));
    this.addShadow(185, 382, 132, 20);
    this.fighter('patata-boxer', 185, 382, 172, 216);
    this.text(343, 121, `Fuerza ${this.state.stats.strength}  ·  Agilidad ${this.state.stats.agility}  ·  Resistencia ${this.state.stats.resistance}`, 21, COLORS.cream, 535);
    this.text(343, 192, `Daño base: ${stats.damage.toFixed(1)}\nRitmo: ${(stats.intervalMs / 1000).toFixed(2)} s por golpe\nVida máxima: ${stats.maxHp}  ·  Estamina: ${stats.maxStamina.toFixed(1)}\nMitigación de guardia: ${stats.guard.toFixed(1)}\nVínculo con el barrio: ${this.state.heart}`, 18, COLORS.muted, 531).setLineSpacing(8);
    this.text(343, 355, 'Las técnicas aportan ataques, defensa y recuperación.\nCombina un estilo principal con herramientas de otras ramas.', 17, COLORS.cream, 526);
  }

  private drawUpgrades(): void {
    const upgrades: { id: UpgradeId; label: string; description: string }[] = [
      { id: 'gym', label: 'EQUIPO DE ENTRENAMIENTO', description: 'Mejora el progreso de tus próximas sesiones.' },
      { id: 'stall', label: 'PUESTO RENOVADO', description: 'Vende tus víveres con un margen mejor.' },
      { id: 'storage', label: 'CAJAS Y ALMACÉN', description: 'Aumenta la cantidad de productos que puedes guardar.' },
    ];
    upgrades.forEach((upgrade, i) => {
      const y = 127 + i * 91;
      this.text(62, y, `${upgrade.label} · nivel ${this.state.upgrades[upgrade.id]}`, 19);
      this.text(62, y + 31, upgrade.description, 16, COLORS.muted, 610);
      const level = this.state.upgrades[upgrade.id];
      const cost = 25 * (level + 1);
      this.button(703, y, 186, 51, level >= 2 ? 'NIVEL MÁXIMO' : `MEJORAR · $${cost}`, () => this.accept(applyAction(this.state, { type: 'upgrade', upgrade: upgrade.id }), 'restock'), level < 2 && this.state.coins >= cost && this.state.slot < 6);
    });
    this.text(62, 411, this.message || 'La caja de tu negocio financia el equipo y tus entrenamientos.', 15, '#e8b65f', 802);
  }

  private drawHome(): void {
    this.rect(20, 132, 544, 294, COLORS.wood);
    for (let row = 0; row < 5; row++) {
      const y = 193 + row * 28;
      this.rect(31, y, 521, 1, COLORS.ink, 0.2);
      for (let column = 0; column < 7; column++) this.rect(49 + column * 70 + (row % 2) * 24, y, 1, 28, COLORS.ink, 0.16);
    }
    this.rect(20, 340, 544, 86, COLORS.brown);
    for (const y of [351, 375, 403]) this.rect(31, y, 521, 1, COLORS.edge, 0.6);
    this.art.halo(this.root, 379, 249, 171, 127, COLORS.gold);
    this.art.halo(this.root, 254, 309, 118, 98, COLORS.flame);
    this.rect(323, 210, 111, 78, COLORS.ink);
    this.rect(329, 216, 99, 66, 0xb7a17e);
    this.rect(374, 216, 7, 66, COLORS.ink);
    this.rect(329, 244, 99, 7, COLORS.ink);
    this.rect(296, 329, 169, 58, COLORS.ink);
    this.rect(302, 335, 157, 42, 0xd4b894);
    this.rect(335, 335, 124, 42, 0x945f47);
    this.rect(237, 341, 38, 52, COLORS.brown);
    this.rect(252, 304, 5, 37, COLORS.gold);
    this.rect(239, 294, 31, 20, 0xdd8b49);
  }

  private highlightFocus(): void {
    this.buttons.forEach((button, i) => {
      const focused = i === this.focus && button.enabled;
      button.box.setStrokeStyle(focused ? 2 : 1, focused ? button.accent : COLORS.edge);
      button.box.setFillStyle(button.strong ? button.accent : focused ? COLORS.raised : button.primary ? 0x524035 : COLORS.panel, button.enabled ? 1 : 0.75);
      button.label.setColor(!button.enabled ? '#baa994' : button.strong ? '#1b1519' : focused ? '#fff8e6' : COLORS.cream);
    });
  }

  private button(x: number, y: number, width: number, height: number, label: string, action: () => void, enabled = true, primary = true): void {
    const danger = label === 'RENDIRSE' || label === 'ACEPTAR LA DERROTA';
    const accent = danger ? COLORS.red : COLORS.gold;
    const strong = enabled && primary && ['EMPEZAR', 'CONTINUAR', 'SONAR LA CAMPANA', 'CERRAR EL DÍA', 'VICTORIA · CONTINUAR', 'VAMOS A ENTRENAR', 'LA CAMPAÑA DE 30 DÍAS', 'VOLVER AL MENÚ'].includes(label);
    this.rect(x, y + 3, width, height, 0x09080d, 0.85);
    const box = this.add.rectangle(x, y, width, height, strong ? accent : primary ? 0x524035 : COLORS.panel, enabled ? 1 : 0.75).setOrigin(0).setStrokeStyle(1, COLORS.edge);
    const text = this.add.text(x + width / 2, y + height / 2, label, { fontFamily: 'Rubik', fontSize: height <= 30 ? '12px' : height < 42 ? '13px' : '16px', fontStyle: 'bold', color: strong ? '#1b1519' : enabled ? COLORS.cream : '#baa994', align: 'center', wordWrap: { width: width - 12 }, resolution: 2 }).setOrigin(0.5);
    const button: Button = { box, label: text, enabled, primary, accent, strong, action: () => { if (enabled) { this.audio.unlock(); this.audio.play('confirm'); action(); } } };
    const index = this.buttons.length;
    this.buttons.push(button);
    if (enabled) box.setInteractive({ useHandCursor: true }).on('pointerover', () => { this.focus = index; this.highlightFocus(); }).on('pointerdown', (pointer: Phaser.Input.Pointer) => { if (pointer.button === 0) button.action(); });
    this.root.add([box, text]);
    this.rect(x + 2, y + 2, width - 4, 1, accent, strong ? 0.5 : primary ? 0.22 : 0.1);
  }

  private text(x: number, y: number, content: string, size = 18, color: string = COLORS.cream, width?: number): Phaser.GameObjects.Text {
    const text = this.add.text(x, y, content, { fontFamily: 'Rubik', fontSize: `${size}px`, fontStyle: size >= 17 ? 'bold' : 'normal', color, wordWrap: width ? { width } : undefined, resolution: 2 });
    this.root.add(text);
    return text;
  }

  private rect(x: number, y: number, width: number, height: number, color: number, alpha = 1, stroke?: number): Phaser.GameObjects.Rectangle {
    const rectangle = this.add.rectangle(x, y, width, height, color, alpha).setOrigin(0);
    if (stroke !== undefined) rectangle.setStrokeStyle(2, stroke);
    this.root.add(rectangle);
    return rectangle;
  }

  private panel(x: number, y: number, width: number, height: number, accent: number = COLORS.edge, alpha = 1): void {
    this.art.panel(this.root, x, y, width, height, accent, alpha);
  }

  private addShadow(x: number, y: number, width: number, height: number): void {
    this.root.add(this.add.ellipse(x, y - 2, width, height, 0x09080d, 0.68));
  }

  private drawImpact(side: 'player' | 'enemy', strong: boolean): void {
    const x = side === 'player' ? 695 : 265;
    const color = side === 'player' ? this.styleAccent(this.state.style) : COLORS.red;
    const burst = this.add.graphics({ x, y: 267 });
    this.root.add(burst);
    burst.lineStyle(strong ? 3 : 2, color, 0.95);
    for (let ray = 0; ray < 6; ray++) {
      const angle = ray * Math.PI / 3;
      const inner = strong ? 10 : 7;
      const outer = strong ? 26 : 18;
      burst.lineBetween(Math.cos(angle) * inner, Math.sin(angle) * inner, Math.cos(angle) * outer, Math.sin(angle) * outer);
    }
    burst.fillStyle(0xfff0d2, 0.9).fillRect(-3, -3, 6, 6);
    this.tweens.add({ targets: burst, alpha: 0, scaleX: 1.45, scaleY: 1.45, duration: strong ? 230 : 170, ease: 'Cubic.easeOut', onComplete: () => burst.destroy() });
    if (side === 'player' && this.battleEnemy) {
      const enemy = this.battleEnemy;
      enemy.setTintFill(0xfff0d2);
      this.time.delayedCall(75, () => { if (enemy.active) enemy.clearTint(); });
    }
  }

  private styleAccent(style: CampaignState['style']): number {
    return style === 'flame' ? COLORS.flame : style === 'ember' ? COLORS.ember : COLORS.stone;
  }

  private layoutReport(): { outside: string[]; buttonOverflows: string[] } {
    const outside: string[] = [];
    const visit = (object: Phaser.GameObjects.GameObject): void => {
      if (object instanceof Phaser.GameObjects.Text) {
        const bounds = object.getBounds();
        if (bounds.x < -1 || bounds.y < -1 || bounds.right > W + 1 || bounds.bottom > H + 1) outside.push(object.text);
      } else if (object instanceof Phaser.GameObjects.Container) object.list.forEach(visit);
    };
    this.root.list.forEach(visit);
    const buttonOverflows = this.buttons.filter(button => {
      const label = button.label.getBounds();
      const box = button.box.getBounds();
      return label.width > box.width - 2 || label.height > box.height - 2;
    }).map(button => button.label.text);
    return { outside, buttonOverflows };
  }

  private image(texture: string, x: number, y: number, width: number, height: number, alpha = 1): Phaser.GameObjects.Image {
    const image = this.add.image(x, y, texture).setDisplaySize(width, height).setAlpha(alpha);
    this.root.add(image);
    return image;
  }

  private fighter(texture: string, x: number, y: number, width: number, height: number): Phaser.GameObjects.Image {
    if (!this.textures.exists(texture)) {
      const graphics = this.make.graphics({ x: 0, y: 0 });
      const vegetable = texture.includes('batata') ? 0xd69a53 : texture.includes('remolacha') ? 0x8d4b80 : 0x77a066;
      graphics.fillStyle(COLORS.ink).fillEllipse(31, 35, 44, 53);
      graphics.fillStyle(vegetable).fillEllipse(31, 34, 37, 46);
      graphics.fillStyle(0xfff0d2).fillRect(19, 23, 8, 7).fillRect(34, 23, 8, 7);
      graphics.fillStyle(COLORS.ink).fillRect(23, 25, 3, 4).fillRect(34, 25, 3, 4).fillRect(26, 39, 11, 3);
      graphics.fillStyle(COLORS.red).fillEllipse(10, 44, 17, 14).fillEllipse(52, 44, 17, 14);
      graphics.fillStyle(COLORS.ink).fillRect(17, 56, 10, 7).fillRect(35, 56, 10, 7);
      graphics.generateTexture(texture, 64, 64);
      graphics.destroy();
    }
    const sprite = this.add.image(x, y, texture).setOrigin(0.5, 1).setDisplaySize(width, height);
    this.root.add(sprite);
    return sprite;
  }

  private bar(x: number, y: number, width: number, height: number, value: number, max: number, color: number, label: string): void {
    this.rect(x, y, width, height, COLORS.ink, 1, COLORS.wood);
    this.rect(x + 2, y + 2, (width - 4) * Phaser.Math.Clamp(value / Math.max(1, max), 0, 1), height - 4, color);
    this.rect(x + 2, y + 2, (width - 4) * Phaser.Math.Clamp(value / Math.max(1, max), 0, 1), 2, 0xfff0d2, 0.2);
    for (let i = 1; i < 8; i++) this.rect(x + Math.floor(width * i / 8), y + 2, 1, height - 4, COLORS.ink, 0.45);
    this.text(x, y - 18, label, 12, COLORS.cream);
  }
}

export function startMonth(mode: CampaignMode, timeoutMode = false, standalone = false): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO, parent: 'juego', width: W, height: H, backgroundColor: '#211a18', pixelArt: true,
    banner: false, audio: { noAudio: true }, scene: new MonthScene(mode, standalone),
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    fps: { target: 60, forceSetTimeOut: timeoutMode },
  });
}
