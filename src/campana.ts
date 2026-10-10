import Phaser from 'phaser';
import { GameAudio } from './audio';
import { FIRST_DAY_LESSONS, GUIDE_PAGES, type RoutineAction } from './orientacion';
import { drawPlace, PLACES, type Place } from './lugares';
import '@fontsource/press-start-2p/latin-400.css';
import '@fontsource/rubik/latin-400.css';
import './style.css';

const W = 320;
const H = 180;
const C = { bg: '#211916', dark: '#2D2522', green: '#554338', mid: '#B87946', lime: '#E7B96E', fire: '#D9533B', cream: '#F5E5C8', red: '#B8423C', leaf: '#6F9653', blue: '#59A9B8' };
const AJUSTES = {
  campaign: { days: 7, slotsPerDay: 6, fightDays: [3, 5, 7] as const },
  player: { coins: 12, stock: 3, energy: 5, maxEnergy: 6, hp: 8, strength: 2, speed: 2, maxStat: 15, maxHeart: 5, maxHeat: 5, minStat: 1, statDecay: 1 },
  economy: { saleCoins: 5, saleHeat: 1, restockCost: 4, restockAmount: 2, trainingCost: 3, trainingEnergy: 2, trainingStrength: 1, winReward: 6, lossPenalty: 3 },
  recovery: { restEnergy: 3, restHp: 2, nightEnergy: 2, nightHp: 1, winHp: 2, lossHp: 2, nightlyHeat: 1 },
  story: { heartPerTalk: 1, brothersThreshold: 3 },
  combat: { dodgeDistance: 18, dodgeWindowMs: 450, dodgeRecoveryMs: 900, speedDodgeBonusMs: 35, telegraphMs: 900, regularAttackMs: 1700, rabanPhaseTwoMs: 1350, bossAttackMs: 1300, startDelayMs: 1200, playerAttackMs: 700, hitResponseRatio: 0.5, blockResponseRatio: 0.3, enemyDamage: 2, minDamage: 1, blockReduction: 2, speedPerDefense: 3, flameThreshold: 3, flameBonus: 2, flameEnergy: 1, blockEnergy: 1, hitShakeMs: 45, hitShake: 0.0015, damageShakeMs: 100, damageShake: 0.002, winShakeMs: 140, winShake: 0.004, enemyHp: { 3: 7, 5: 10, 7: 8 }, enemyByDay: { 3: 'Yuca', 5: 'Rábano', 7: 'Batata' } },
} as const;
const HISTORIA_DIA: Record<number, { aviso: string; charla: string }> = {
  1: { aviso: 'Abre el puesto y recupera la confianza del barrio.', charla: 'La vecina ofrece cuidar el puesto.' },
  2: { aviso: 'La Yuca reclama intereses a todo el barrio.', charla: 'La deuda crece aunque pagues a tiempo.' },
  3: { aviso: 'Matones amenazan con cerrar el puesto.', charla: 'Los clientes prometen ayudarte hoy.' },
  4: { aviso: 'Una nota apunta a la guarida de la Yuca.', charla: 'Encontraron la entrada bajo el mercado.' },
  5: { aviso: 'Rábano protege la entrada clandestina.', charla: 'El Rábano conoce el ring clandestino.' },
  6: { aviso: 'El barrio revela dónde está Batata.', charla: 'Batata pregunta por ti en la noche.' },
  7: { aviso: 'Batata te espera en el ring clandestino.', charla: 'Hoy volverás a ver a tu hermano.' },
};
const RESPUESTAS = [
  { id: 'heart', label: '1 · CONTARLO · VÍNCULO +1' },
  { id: 'train', label: '2 · ENTRENAR · FUERZA +1' },
  { id: 'rest', label: '3 · RESPIRAR · VIDA / ENERGÍA +1' },
] as const;
type Respuesta = (typeof RESPUESTAS)[number]['id'];
type Screen = 'title' | 'warning' | 'hub' | 'dialogue' | 'training' | 'fight' | 'pause' | 'choice' | 'ending' | 'guide' | 'agenda' | 'night' | 'combatLesson' | 'profile';
type State = { day: number; slot: number; coins: number; stock: number; energy: number; hp: number; maxHp: number; strength: number; speed: number; trainedStrength: boolean; trainedSpeed: boolean; heart: number; heat: number; wins: number; screen: Screen; enemyHp: number; enemyMax: number; enemyName: string; fightDay: number; cooldown: number; playerCooldown: number; message: string; endingOutcome: 'brothers' | 'community' | 'promise' | 'defeat' | null; savedAt: number; tutorialStep: number; combatTutorialSeen: boolean; place: Place; fightPhaseTwo: boolean; rabanAttackCount: number };
const fresh = (): State => ({ day: 1, slot: 0, coins: AJUSTES.player.coins, stock: AJUSTES.player.stock, energy: AJUSTES.player.energy, hp: AJUSTES.player.hp, maxHp: AJUSTES.player.hp, strength: AJUSTES.player.strength, speed: AJUSTES.player.speed, trainedStrength: false, trainedSpeed: false, heart: 0, heat: 0, wins: 0, screen: 'title', enemyHp: 0, enemyMax: 0, enemyName: '', fightDay: 0, cooldown: 0, playerCooldown: 0, message: 'Tu puesto vuelve a abrir. Esta vez nadie se lleva a Batata.', endingOutcome: null, savedAt: Date.now(), tutorialStep: 0, combatTutorialSeen: false, place: 'shop', fightPhaseTwo: false, rabanAttackCount: 0 });
const ACTION_PLACES: Record<RoutineAction, Place> = { sell: 'shop', restock: 'shop', train: 'gym', rest: 'home', talk: 'neighborhood', close: 'home' };
const FONT = '"Press Start 2P", monospace';
const SAVE = 'patata-caliente-save-v1';

function savedInteger(value: unknown, fallback: number, min: number, max: number): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Phaser.Math.Clamp(Math.trunc(value), min, max) : fallback;
}

function recoverState(value: unknown): State {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Guardado inválido');
  const data = value as Partial<Record<keyof State, unknown>>;
  const state = fresh();
  state.day = savedInteger(data.day, state.day, 1, AJUSTES.campaign.days);
  state.slot = savedInteger(data.slot, state.slot, 0, AJUSTES.campaign.slotsPerDay);
  state.coins = savedInteger(data.coins, state.coins, 0, 999999);
  state.stock = savedInteger(data.stock, state.stock, 0, 999999);
  state.energy = savedInteger(data.energy, state.energy, 0, AJUSTES.player.maxEnergy);
  state.hp = savedInteger(data.hp, state.hp, 0, state.maxHp);
  state.strength = savedInteger(data.strength, state.strength, AJUSTES.player.minStat, AJUSTES.player.maxStat);
  state.speed = savedInteger(data.speed, state.speed, AJUSTES.player.minStat, AJUSTES.player.maxStat);
  state.heart = savedInteger(data.heart, 0, 0, AJUSTES.player.maxHeart);
  state.heat = savedInteger(data.heat, 0, 0, AJUSTES.player.maxHeat);
  state.wins = savedInteger(data.wins, 0, 0, AJUSTES.campaign.fightDays.length);
  state.trainedStrength = data.trainedStrength === true;
  state.trainedSpeed = data.trainedSpeed === true;
  state.tutorialStep = Number.isInteger(data.tutorialStep)
    ? savedInteger(data.tutorialStep, FIRST_DAY_LESSONS.length, 0, FIRST_DAY_LESSONS.length) : FIRST_DAY_LESSONS.length;
  state.combatTutorialSeen = typeof data.combatTutorialSeen === 'boolean' ? data.combatTutorialSeen : true;
  state.place = PLACES.find(place => place.id === data.place)?.id ?? 'shop';
  state.screen = data.screen === 'fight' || data.screen === 'combatLesson' || data.screen === 'choice' || data.screen === 'ending'
    ? data.screen : 'hub';
  state.endingOutcome = data.endingOutcome === 'brothers' || data.endingOutcome === 'community'
    || data.endingOutcome === 'promise' || data.endingOutcome === 'defeat' ? data.endingOutcome : null;
  state.message = typeof data.message === 'string' ? data.message.slice(0, 500) : state.message;
  const fightDay = AJUSTES.campaign.fightDays.find(day => day === data.fightDay && day === state.day);
  if (state.screen === 'fight' || state.screen === 'combatLesson') {
    if (!fightDay) state.screen = 'hub';
    else {
      state.fightDay = fightDay;
      state.enemyName = AJUSTES.combat.enemyByDay[fightDay];
      state.enemyMax = AJUSTES.combat.enemyHp[fightDay];
      state.enemyHp = savedInteger(data.enemyHp, state.enemyMax, 1, state.enemyMax);
      state.hp = Math.max(1, state.hp);
      state.fightPhaseTwo = state.enemyName === 'Rábano' && state.enemyHp <= state.enemyMax / 2;
      state.rabanAttackCount = savedInteger(data.rabanAttackCount, 0, 0, 999999);
      // A short grace period makes resuming safe without applying another night.
      state.cooldown = savedInteger(data.cooldown, AJUSTES.combat.startDelayMs, AJUSTES.combat.startDelayMs, AJUSTES.combat.regularAttackMs);
      state.playerCooldown = savedInteger(data.playerCooldown, 0, 0, AJUSTES.combat.playerAttackMs);
    }
  }
  return state;
}

class GameScene extends Phaser.Scene {
  state: State = fresh();
  private guardReady = false;
  private dodgeReady = false;
  private dodgeCooldown = 0;
  private dodgeTimer: Phaser.Time.TimerEvent | null = null;
  private lastPointer: { x: number; y: number } | null = null;
  private pointerTravel = 0;
  private attackTelegraphed = false;
  private nextRabanRain = false;
  private pausedFrom: 'hub' | 'fight' | null = null;
  private guideFrom: 'title' | 'hub' | 'pause' = 'hub';
  private guidePage = 0;
  private roomPlayer: Phaser.GameObjects.Image | null = null;
  private attackPrompt: Phaser.GameObjects.Text | null = null;
  private titleNotice = '';
  private audio = new GameAudio();
  root!: Phaser.GameObjects.Container;
  keys!: Record<string, Phaser.Input.Keyboard.Key>;
  constructor() { super('Game'); }
  preload(): void {
    const assets = `${import.meta.env.BASE_URL}assets/img/`;
    this.load.image('market-alley', `${assets}market-alley.jpg`);
    this.load.image('shop-interior', `${assets}shop-interior.jpg`);
    this.load.image('gym-interior', `${assets}gym-interior.jpg`);
    this.load.image('patata-boxer', `${assets}patata-boxer.png`);
    this.load.image('yuca-boxer', `${assets}yuca-boxer.png`);
    this.load.image('rabano-boxer', `${assets}rabano-boxer.png`);
  }
  create(): void {
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.audio.dispose());
    this.cameras.main.setBackgroundColor(C.bg);
    this.root = this.add.container(0, 0);
    this.keys = this.input.keyboard!.addKeys('SPACE,ENTER,ESC,ONE,TWO,THREE') as Record<string, Phaser.Input.Keyboard.Key>;
    this.input.mouse?.disableContextMenu();
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => { if (this.state.screen === 'fight' && p.button === 2) this.block(); });
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (this.lastPointer && this.state.screen === 'fight') {
        this.pointerTravel += Phaser.Math.Distance.Between(this.lastPointer.x, this.lastPointer.y, p.x, p.y);
        if (this.pointerTravel >= AJUSTES.combat.dodgeDistance && this.dodgeCooldown === 0) {
          this.pointerTravel = 0;
          this.dodgeReady = true;
          this.dodgeCooldown = AJUSTES.combat.dodgeRecoveryMs;
          if (this.dodgeTimer) this.time.removeEvent(this.dodgeTimer);
          const speedBonus = Math.max(0, this.state.speed - AJUSTES.player.speed) * AJUSTES.combat.speedDodgeBonusMs;
          this.dodgeTimer = this.time.delayedCall(AJUSTES.combat.dodgeWindowMs + speedBonus, () => {
            this.dodgeReady = false;
            this.pointerTravel = 0;
          });
        }
      }
      this.lastPointer = { x: p.x, y: p.y };
    });
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => { if (event.code === 'Space' && this.state.screen === 'fight') { this.audio.unlock(); this.attack(); } });
    this.input.keyboard?.on('keydown-M', () => { const enabled = this.audio.toggle(); this.state.message = enabled ? 'Audio activado.' : 'Audio silenciado.'; this.draw(); });
    this.input.keyboard?.on('keydown-ONE', () => {
      if (this.state.screen === 'training') this.chooseTraining('strength');
      else if (this.state.screen === 'dialogue') this.chooseDialogue('heart');
    });
    this.input.keyboard?.on('keydown-TWO', () => {
      if (this.state.screen === 'training') this.chooseTraining('speed');
      else if (this.state.screen === 'dialogue') this.chooseDialogue('train');
    });
    this.input.keyboard?.on('keydown-THREE', () => { if (this.state.screen === 'dialogue') this.chooseDialogue('rest'); });
    this.input.keyboard?.on('keydown-ESC', () => {
      if (this.state.screen === 'pause') {
        this.state.screen = this.pausedFrom ?? 'hub';
        this.pausedFrom = null;
      } else if (this.state.screen === 'hub' || this.state.screen === 'fight') {
        this.pausedFrom = this.state.screen;
        this.state.screen = 'pause';
      } else if (this.state.screen === 'dialogue' || this.state.screen === 'training') {
        this.state.screen = 'hub';
        this.save();
      } else if (this.state.screen === 'guide') {
        this.state.screen = this.guideFrom;
      } else if (this.state.screen === 'agenda' || this.state.screen === 'night' || this.state.screen === 'profile') {
        this.state.screen = 'hub';
      }
      this.draw();
    });
    this.draw();
  }
  update(_time: number, delta: number): void {
    if (this.state.screen !== 'fight') return;
    this.dodgeCooldown = Math.max(0, this.dodgeCooldown - delta);
    this.state.playerCooldown = Math.max(0, this.state.playerCooldown - delta);
    this.attackPrompt?.setText(this.state.playerCooldown > 0 ? `RECUPERA ${(this.state.playerCooldown / 1000).toFixed(1)}s` : 'GOLPE LISTO');
    this.state.cooldown -= delta;
    if (this.state.cooldown <= 0) {
      this.attackTelegraphed = false;
      this.enemyAttack();
      return;
    }
    if (!this.attackTelegraphed && this.state.cooldown <= AJUSTES.combat.telegraphMs) {
      this.attackTelegraphed = true;
      this.nextRabanRain = this.state.enemyName === 'Rábano' && this.state.fightPhaseTwo && this.state.rabanAttackCount % 2 === 0;
      this.state.message = this.nextRabanRain
        ? '¡LLUVIA DE RÁBANOS! Muévete para esquivar.'
        : `¡Cuidado! ${this.state.enemyName} prepara un golpe. Esquiva o bloquea.`;
      this.draw();
    }
  }
  text(x: number, y: number, s: string, size = 8, color = C.cream, font = 'Rubik', wrapWidth = 290): Phaser.GameObjects.Text {
    return this.add.text(x, y, s, { fontFamily: font, fontSize: `${size}px`, color, wordWrap: { width: wrapWidth }, lineSpacing: 2 }).setOrigin(0.5, 0);
  }
  box(x: number, y: number, w: number, h: number, fill = C.dark, stroke = C.mid, fillAlpha = 1): Phaser.GameObjects.Rectangle {
    const fillColor = Phaser.Display.Color.HexStringToColor(fill).color;
    const strokeColor = Phaser.Display.Color.HexStringToColor(stroke).color;
    const r = this.add.rectangle(x, y, w, h, fillColor, fillAlpha).setStrokeStyle(1, strokeColor);
    this.add.rectangle(x, y, w - 4, h - 4, Phaser.Display.Color.HexStringToColor(fill).color, 0)
      .setStrokeStyle(1, strokeColor, 0.45);
    return r;
  }
  backdrop(key: string, alpha = 1): void {
    this.add.image(W / 2, H / 2, key).setDisplaySize(W, H).setAlpha(alpha);
  }
  meter(x: number, y: number, w: number, value: number, max: number, color: string, label: string): void {
    this.text(x, y - 9, label, 5, C.cream, FONT);
    const segments = 10;
    const gap = 1;
    const segmentWidth = (w - 4 - gap * (segments - 1)) / segments;
    const filled = max > 0 ? Math.ceil(Phaser.Math.Clamp(value / max, 0, 1) * segments) : 0;
    this.box(x, y + 3, w, 9, C.dark, C.mid);
    for (let i = 0; i < segments; i++) {
      const segmentX = x - w / 2 + 2 + i * (segmentWidth + gap) + segmentWidth / 2;
      this.add.rectangle(segmentX, y + 3, segmentWidth, 4, Phaser.Display.Color.HexStringToColor(i < filled ? color : '#493A34').color);
    }
  }
  button(x: number, y: number, w: number, h: number, label: string, callback: () => void, color = C.mid, size = 7): void {
    const bg = this.box(x, y, w, h, C.dark, color).setInteractive({ useHandCursor: true });
    const t = this.text(x, y - 1, label, size, color, FONT).setOrigin(0.5, 0.5);
    bg.on('pointerover', () => bg.setFillStyle(Phaser.Display.Color.HexStringToColor(C.green).color));
    bg.on('pointerout', () => bg.setFillStyle(Phaser.Display.Color.HexStringToColor(C.dark).color));
    const activate = (pointer: Phaser.Input.Pointer) => { if (pointer.button !== 0) return; this.audio.unlock(); if (this.state.screen !== 'hub' && this.state.screen !== 'fight') this.audio.play('confirm'); callback(); };
    bg.on('pointerdown', activate); t.setInteractive(); t.on('pointerdown', activate);
  }
  draw(): void {
    const viewingPause = this.state.screen === 'pause' || (this.state.screen === 'guide' && this.guideFrom === 'pause');
    const activeScreen = viewingPause ? this.pausedFrom : this.state.screen;
    const audioMode = activeScreen === 'fight' || activeScreen === 'combatLesson' ? 'fight'
      : activeScreen === 'choice' || activeScreen === 'ending' ? 'ending'
      : activeScreen === 'title' || activeScreen === 'warning' || (activeScreen === 'guide' && this.guideFrom === 'title') ? 'menu' : 'shop';
    this.audio.setMode(audioMode);
    this.audio.setPaused(viewingPause);
    if (this.dodgeTimer) this.dodgeTimer.paused = this.state.screen !== 'fight';
    this.tweens.killAll();
    this.roomPlayer = null;
    this.attackPrompt = null;
    this.root.removeAll(true);
    const old = this.add.container(0, 0); this.root.add(old);
    // Drawing helpers add to the scene display list; move each new object into the redraw container.
    const start = this.children.length;
    if (this.state.screen === 'title') this.title();
    else if (this.state.screen === 'warning') this.contentWarning();
    else if (this.state.screen === 'hub') this.hub();
    else if (this.state.screen === 'dialogue') this.dialogue();
    else if (this.state.screen === 'training') this.trainingMenu();
    else if (this.state.screen === 'fight') this.fight();
    else if (this.state.screen === 'pause') this.pauseMenu();
    else if (this.state.screen === 'guide') this.guide();
    else if (this.state.screen === 'agenda') this.agenda();
    else if (this.state.screen === 'night') this.nightPreview();
    else if (this.state.screen === 'combatLesson') this.combatLesson();
    else if (this.state.screen === 'profile') this.profile();
    else if (this.state.screen === 'choice') this.endingChoice();
    else this.ending();
    const added = this.children.list.slice(start) as Phaser.GameObjects.GameObject[];
    for (const item of added) { this.children.remove(item); old.add(item); }
  }
  title(): void {
    this.backdrop('market-alley', 0.68);
    this.box(160, 90, 278, 164, C.dark, C.mid, 0.78);
    this.text(160, 15, 'PATATA', 12, C.lime, FONT); this.text(160, 31, 'CALIENTE', 12, C.fire, FONT);
    this.text(160, 48, 'TIEMPO DE BARRIO', 7, C.cream, FONT);
    this.text(160, 66, 'La Mafia de la Yuca se llevó el puesto\ny a tu hermano Batata. Reconstruye,\nprepárate y pelea por tu familia.', 7);
    if (this.titleNotice) this.text(160, 95, this.titleNotice, 6, C.lime, 'Rubik', 246);
    this.button(160, 119, 170, 20, 'NUEVA PARTIDA', () => { this.titleNotice = ''; this.state.screen = 'warning'; this.draw(); });
    this.button(160, 143, 170, 18, 'CONTINUAR', () => this.loadGame(), C.cream);
    this.button(160, 163, 170, 14, 'CÓMO JUGAR', () => this.openGuide('title'), C.mid, 5);
  }
  contentWarning(): void {
    this.box(160, 90, 286, 150, C.dark, C.fire);
    this.text(160, 27, 'AVISO DE CONTENIDO', 8, C.fire, FONT);
    this.text(160, 57, 'Violencia fantástica, amenazas, deuda\ny separación familiar. Los combates\nson estilizados y sin gore explícito.', 8, C.cream);
    this.button(160, 119, 170, 22, 'ENTENDIDO · JUGAR', () => { this.state = fresh(); this.state.screen = 'hub'; this.save(); this.draw(); }, C.lime);
    this.button(160, 147, 170, 18, 'VOLVER', () => { this.state.screen = 'title'; this.draw(); }, C.cream);
  }
  pauseMenu(): void {
    this.box(160, 90, 286, 164, C.dark, C.cream);
    this.text(160, 18, 'PAUSA', 10, C.lime, FONT);
    this.text(160, 36, `DÍA ${this.state.day} · ${this.pausedFrom === 'fight' ? 'COMBATE' : 'PUESTO'}`, 7, C.cream, FONT);
    this.button(89, 57, 132, 15, `MÚSICA ${Math.round(this.audio.volume('music') * 100)}%`, () => { this.audio.cycleVolume('music'); this.draw(); }, C.blue, 5);
    this.button(231, 57, 132, 15, `EFECTOS ${Math.round(this.audio.volume('sfx') * 100)}%`, () => { this.audio.cycleVolume('sfx'); this.draw(); }, C.fire, 5);
    this.button(160, 77, 200, 14, this.audio.isEnabled() ? 'SONIDO: ACTIVADO · M' : 'SONIDO: SILENCIADO · M', () => { this.audio.toggle(); this.draw(); }, C.mid, 5);
    this.button(160, 100, 200, 20, 'CONTINUAR', () => {
      this.state.screen = this.pausedFrom ?? 'hub';
      this.pausedFrom = null;
      this.draw();
    }, C.lime);
    this.button(160, 126, 200, 18, 'GUARDAR Y SALIR', () => {
      this.state.screen = this.pausedFrom ?? 'hub';
      this.pausedFrom = null;
      this.save();
      this.state.screen = 'title';
      this.draw();
    }, C.cream);
    this.button(160, 149, 200, 16, 'GUÍA DE JUEGO', () => this.openGuide('pause'), C.mid, 6);
    this.text(160, 165, 'ESC: CONTINUAR · M: SILENCIO', 5, C.mid, FONT);
  }
  hud(): void {
    this.text(7, 5, `DÍA ${this.state.day}/${AJUSTES.campaign.days}  ·  TURNO ${this.state.slot}/${AJUSTES.campaign.slotsPerDay}`, 7, C.lime, FONT).setOrigin(0, 0);
    this.text(313, 5, `$${this.state.coins}  ●${this.state.stock}`, 7, C.cream, FONT).setOrigin(1, 0);
  }
  hub(): void {
    this.roomPlayer = drawPlace(this, this.state.place).player;
    this.tweens.add({ targets: this.roomPlayer, y: this.roomPlayer.y - 1, duration: 650, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.hud();
    this.text(160, 18, PLACES.find(place => place.id === this.state.place)!.title, 6, C.lime, FONT);
    const lesson = FIRST_DAY_LESSONS[this.state.tutorialStep];
    if (lesson) this.button(278, 17, 61, 10, 'OMITIR GUÍA', () => {
      this.state.tutorialStep = FIRST_DAY_LESSONS.length;
      this.save(); this.draw();
    }, C.mid, 4);
    this.meter(55, 32, 72, this.state.hp, this.state.maxHp, C.red, `VIDA ${this.state.hp}/${this.state.maxHp}`);
    this.meter(266, 32, 72, this.state.energy, AJUSTES.player.maxEnergy, C.blue, `ENERGÍA ${this.state.energy}/${AJUSTES.player.maxEnergy}`);
    PLACES.forEach((place, index) => {
      const target = lesson && ACTION_PLACES[lesson.action] === place.id;
      const label = `${target && place.id !== this.state.place ? '> ' : ''}${place.label}`;
      this.button(40 + index * 80, 49, 74, 16, label, () => this.switchPlace(place.id),
        place.id === this.state.place ? C.cream : target ? C.lime : C.mid, 5);
    });
    this.add.rectangle(160, 72, 308, 27, Phaser.Display.Color.HexStringToColor(C.bg).color, 0.84);
    if (lesson) {
      this.text(160, 61, `${this.state.tutorialStep + 1}/${FIRST_DAY_LESSONS.length} · ${lesson.title.toUpperCase()}`, 5, C.lime, FONT);
      const body = lesson.action === 'close'
        ? `Quedan ${AJUSTES.campaign.slotsPerDay - this.state.slot} franjas. Úsalas o cierra el día desde CASA.`
        : lesson.body;
      this.text(160, 71, body, 6, C.cream, 'Rubik', 294);
    } else {
      this.text(160, 61, this.state.message, 6, C.cream, 'Rubik', 294);
      this.text(160, 78, this.routineAdvice(), 5, C.lime, 'Rubik', 294);
    }
    if (this.state.place === 'shop') {
      this.actionCard(247, 102, 'VENDER', `−1 papa / +$${AJUSTES.economy.saleCoins} / +calor`, () => this.sell(), lesson?.action === 'sell', C.lime, 132);
      this.actionCard(247, 132, 'REPONER', `−$${AJUSTES.economy.restockCost} / +${AJUSTES.economy.restockAmount} papas`, () => this.restock(), false, C.lime, 132);
    } else if (this.state.place === 'gym') {
      const cost = `−$${AJUSTES.economy.trainingCost} / −${AJUSTES.economy.trainingEnergy} energía / +1`;
      this.actionCard(247, 102, 'ENTRENAR FUERZA', cost, () => this.train('strength'), lesson?.action === 'train', C.fire, 132);
      this.actionCard(247, 132, 'VELOCIDAD', cost, () => this.train('speed'), false, C.lime, 132);
    } else if (this.state.place === 'home') {
      this.actionCard(247, 102, 'DESCANSAR', `+${AJUSTES.recovery.restEnergy} energía / +${AJUSTES.recovery.restHp} vida`, () => this.rest(), lesson?.action === 'rest', C.lime, 132);
      this.actionCard(247, 132, 'CERRAR DÍA', 'Revisar noche antes de confirmar', () => this.endDay(), lesson?.action === 'close', C.fire, 132);
    } else {
      this.actionCard(247, 102, 'HABLAR', 'Vínculo, fuerza o recuperación', () => this.talk(), lesson?.action === 'talk', C.lime, 132);
      this.actionCard(247, 132, 'VER RIVALES', 'Calendario y pistas de combate', () => { this.state.screen = 'agenda'; this.draw(); }, false, C.mid, 132);
    }
    const footer = lesson ? this.state.message.slice(0, 96)
      : `FUE ${this.state.strength} · VEL ${this.state.speed} · VÍNC ${this.state.heart} · CALOR ${this.state.heat}`;
    this.text(160, 153, footer, 5, C.cream, lesson ? 'Rubik' : FONT);
    this.button(40, 170, 64, 15, 'GUARDAR', () => { this.state.message = 'Partida guardada.'; this.save(); this.draw(); }, C.cream, 5);
    this.button(119, 170, 76, 15, 'AGENDA', () => { this.state.screen = 'agenda'; this.draw(); }, C.lime, 5);
    this.button(204, 170, 68, 15, 'FICHA', () => { this.state.screen = 'profile'; this.draw(); }, C.cream, 5);
    this.button(283, 170, 58, 15, 'GUÍA', () => this.openGuide('hub'), C.mid, 5);
  }
  switchPlace(place: Place): void {
    if (this.state.screen !== 'hub') return;
    this.state.place = place; this.save(); this.draw();
  }
  actionCard(x: number, y: number, label: string, detail: string, callback: () => void, highlighted: boolean, color: string, width = 144): void {
    const border = highlighted ? C.cream : color;
    const bg = this.box(x, y, width, 24, highlighted ? C.green : C.dark, border).setInteractive({ useHandCursor: true });
    this.text(x, y - 8, `${highlighted ? '> ' : ''}${label}`, 6, border, FONT);
    this.text(x, y + 3, detail, 6, C.cream, 'Rubik', width - 6);
    bg.on('pointerover', () => bg.setFillStyle(Phaser.Display.Color.HexStringToColor(C.green).color));
    bg.on('pointerout', () => bg.setFillStyle(Phaser.Display.Color.HexStringToColor(highlighted ? C.green : C.dark).color));
    bg.on('pointerdown', (pointer: Phaser.Input.Pointer) => { if (pointer.button !== 0) return; this.audio.unlock(); callback(); });
  }
  advanceTutorial(action: RoutineAction): void {
    if (FIRST_DAY_LESSONS[this.state.tutorialStep]?.action !== action) return;
    this.state.tutorialStep++;
  }
  routineAdvice(): string {
    if (this.state.slot >= AJUSTES.campaign.slotsPerDay) return 'Sin franjas: revisa la noche y cierra el día.';
    if (this.state.hp <= this.state.maxHp / 2 || this.state.energy < AJUSTES.economy.trainingEnergy) return 'Consejo: descansa antes de entrenar o pelear.';
    if (this.state.stock === 0) return this.state.coins >= AJUSTES.economy.restockCost
      ? 'Sin papas: repón para seguir financiando el gimnasio.' : 'Sin monedas ni papas: habla con el barrio para prepararte.';
    if (!this.state.trainedStrength) return 'Entrena fuerza hoy: más daño y evita perder un punto esta noche.';
    if (!this.state.trainedSpeed) return 'Entrena velocidad hoy: mejora la defensa y conserva el atributo.';
    const nextFight = AJUSTES.campaign.fightDays.find(day => day >= this.state.day);
    return `Próximo combate: día ${nextFight ?? AJUSTES.campaign.days}. Cada acción usa una franja.`;
  }
  profile(): void {
    this.backdrop('gym-interior', 0.35);
    this.box(160, 90, 304, 168, C.dark, C.lime, 0.95);
    this.text(160, 12, 'FICHA DE PATATA', 8, C.lime, FONT);
    this.add.image(55, 94, 'patata-boxer').setDisplaySize(55, 66);
    this.text(55, 39, `${this.state.wins} VICTORIAS`, 5, C.lime, FONT);
    this.text(55, 132, `VIDA ${this.state.hp}/${this.state.maxHp}\nENERGÍA ${this.state.energy}/${AJUSTES.player.maxEnergy}`, 5, C.cream, FONT, 90);
    this.box(207, 60, 190, 42, C.green, C.fire);
    this.text(207, 43, `FUERZA ${this.state.strength}`, 7, C.fire, FONT);
    this.text(207, 58, `Daño normal: ${this.state.strength} · en Llamas: ${this.state.strength + AJUSTES.combat.flameBonus}`, 7, C.cream, 'Rubik', 178);
    this.text(207, 71, `Esta noche: ${this.nightStat('strength')} · ${this.state.trainedStrength ? 'entrenada' : 'sin entrenar'}`, 6, C.lime);
    this.box(207, 107, 190, 42, C.green, C.blue);
    this.text(207, 90, `VELOCIDAD ${this.state.speed}`, 7, C.blue, FONT);
    const dodgeWindow = AJUSTES.combat.dodgeWindowMs + Math.max(0, this.state.speed - AJUSTES.player.speed) * AJUSTES.combat.speedDodgeBonusMs;
    this.text(207, 105, `Esquiva: ${(dodgeWindow / 1000).toFixed(2)} s · defensa ${Math.floor(this.state.speed / AJUSTES.combat.speedPerDefense)}`, 7, C.cream, 'Rubik', 178);
    this.text(207, 118, `Esta noche: ${this.nightStat('speed')} · ${this.state.trainedSpeed ? 'entrenada' : 'sin entrenar'}`, 6, C.lime);
    const nextFight = AJUSTES.campaign.fightDays.find(day => day >= this.state.day) ?? AJUSTES.campaign.days;
    const hits = Math.ceil(AJUSTES.combat.enemyHp[nextFight] / this.nightStat('strength'));
    this.text(207, 135, `${AJUSTES.combat.enemyByDay[nextFight]} · aprox. ${hits} golpes normales con tu fuerza nocturna`, 7, C.cream, 'Rubik', 180);
    this.button(160, 162, 184, 18, 'VOLVER A MI RUTINA', () => { this.state.screen = 'hub'; this.draw(); }, C.lime, 6);
  }
  showReceipt(label: string): void {
    if (this.state.screen !== 'hub' || !this.roomPlayer) return;
    const receipt = this.text(80, 98, label, 7, C.lime, FONT, 158);
    this.children.remove(receipt); this.root.add(receipt);
    this.tweens.add({ targets: receipt, y: 88, alpha: 0, delay: 180, duration: 500, ease: 'Cubic.easeOut', onComplete: () => receipt.destroy() });
    this.tweens.add({ targets: this.roomPlayer, x: this.roomPlayer.x + 5, duration: 100, yoyo: true, ease: 'Quad.easeOut' });
  }
  openGuide(from: 'title' | 'hub' | 'pause'): void {
    this.guideFrom = from; this.guidePage = 0; this.state.screen = 'guide'; this.draw();
  }
  guide(): void {
    this.backdrop('market-alley', 0.35);
    this.box(160, 90, 304, 168, C.dark, C.lime, 0.95);
    const page = GUIDE_PAGES[this.guidePage];
    this.text(160, 13, `GUÍA ${this.guidePage + 1}/${GUIDE_PAGES.length}`, 7, C.lime, FONT);
    this.text(160, 30, page.title, 6, C.cream, FONT);
    page.lines.forEach((line, index) => {
      this.box(160, 62 + index * 30, 278, 26, C.green, C.mid);
      this.text(160, 53 + index * 30, line, 7, C.cream, 'Rubik', 248);
    });
    this.button(65, 158, 88, 18, 'ANTERIOR', () => {
      this.guidePage = (this.guidePage + GUIDE_PAGES.length - 1) % GUIDE_PAGES.length; this.draw();
    }, C.mid, 5);
    this.button(160, 158, 86, 18, 'VOLVER', () => { this.state.screen = this.guideFrom; this.draw(); }, C.cream, 5);
    this.button(255, 158, 88, 18, 'SIGUIENTE', () => {
      this.guidePage = (this.guidePage + 1) % GUIDE_PAGES.length; this.draw();
    }, C.lime, 5);
  }
  agenda(): void {
    this.backdrop('market-alley', 0.4);
    this.box(160, 90, 304, 168, C.dark, C.lime, 0.92);
    this.text(160, 11, 'AGENDA DEL BARRIO', 7, C.lime, FONT);
    this.text(160, 27, `Día ${this.state.day} · ${AJUSTES.campaign.slotsPerDay - this.state.slot} franjas · vínculo ${this.state.heart}/${AJUSTES.story.brothersThreshold} para Batata`, 7, C.cream);
    AJUSTES.campaign.fightDays.forEach((day, index) => {
      const y = 55 + index * 31;
      const status = day < this.state.day ? 'PASADO' : day === this.state.day ? 'ESTA NOCHE' : `EN ${day - this.state.day} DÍAS`;
      const color = day === this.state.day ? C.fire : day < this.state.day ? C.mid : C.lime;
      this.box(160, y, 278, 27, C.green, color);
      this.text(31, y - 9, `DÍA ${day} · ${AJUSTES.combat.enemyByDay[day].toUpperCase()}`, 6, color, FONT).setOrigin(0, 0);
      this.text(286, y - 9, status, 5, color, FONT).setOrigin(1, 0);
      const hint = day === 3 ? 'Tu primera prueba: fuerza y vida antes de cerrar.'
        : day === 5 ? 'Al perder media vida acelera y anuncia lluvia de rábanos.' : 'Tu hermano. El vínculo influye en la decisión final.';
      this.text(160, y + 3, hint, 6, C.cream);
    });
    this.text(160, 135, this.routineAdvice(), 7, C.cream, 'Rubik', 276);
    this.button(160, 160, 170, 18, 'VOLVER A MI RUTINA', () => { this.state.screen = 'hub'; this.draw(); }, C.lime, 6);
  }
  nightStat(stat: 'strength' | 'speed'): number {
    const trained = stat === 'strength' ? this.state.trainedStrength : this.state.trainedSpeed;
    return trained ? this.state[stat] : Math.max(AJUSTES.player.minStat, this.state[stat] - AJUSTES.player.statDecay);
  }
  nightPreview(): void {
    this.box(160, 90, 304, 168, C.dark, C.mid);
    const fightDay = AJUSTES.campaign.fightDays.find(day => day === this.state.day);
    this.text(160, 12, `CIERRE DEL DÍA ${this.state.day}`, 8, C.lime, FONT);
    this.text(160, 33, `${AJUSTES.campaign.slotsPerDay - this.state.slot} franjas sin usar. Confirmar termina la jornada.`, 7, C.cream);
    this.box(160, 73, 278, 52, C.green, C.mid);
    this.text(160, 52, `FUERZA ${this.state.strength} → ${this.nightStat('strength')}  ·  VELOCIDAD ${this.state.speed} → ${this.nightStat('speed')}`, 6, C.lime, FONT);
    this.text(160, 67, 'Lo entrenado se conserva. El resto pierde un punto (mínimo 1).', 7, C.cream);
    const hp = Math.min(this.state.maxHp, this.state.hp + AJUSTES.recovery.nightHp);
    const energy = Math.min(AJUSTES.player.maxEnergy, this.state.energy + AJUSTES.recovery.nightEnergy);
    this.text(160, 83, `Vida ${this.state.hp} → ${hp}  ·  Energía ${this.state.energy} → ${energy}`, 7, C.cream);
    this.text(160, 109, fightDay ? `AL CERRAR: PELEA CON ${AJUSTES.combat.enemyByDay[fightDay].toUpperCase()}` : `Mañana: día ${this.state.day + 1} · el puesto vuelve a abrir`, 6, fightDay ? C.fire : C.lime, FONT);
    this.text(160, 122, fightDay ? 'Comprueba tu fuerza y vida antes de ir al ring.' : 'El calor baja al descansar por la noche.', 7, C.cream);
    this.button(88, 157, 130, 20, 'VOLVER', () => { this.state.screen = 'hub'; this.draw(); }, C.cream, 6);
    this.button(232, 157, 130, 20, fightDay ? 'AL RING' : 'DORMIR', () => this.confirmEndDay(), C.lime, 6);
  }
  dialogue(): void {
    this.box(160, 91, 300, 166, C.dark, C.green);
    this.text(160, 12, `HABLAR · DÍA ${this.state.day}`, 8, C.lime, FONT);
    const line = HISTORIA_DIA[this.state.day]?.charla ?? 'El barrio espera que vuelvas a abrir.';
    this.text(160, 31, line, 7, C.cream, 'Rubik', 270);
    this.text(160, 46, `Una respuesta usa 1 franja · vínculo ${this.state.heart}/${AJUSTES.story.brothersThreshold} para reconciliarte`, 6, C.mid);
    RESPUESTAS.forEach((respuesta, index) => {
      const color = index === 0 ? C.lime : index === 1 ? C.fire : C.cream;
      this.button(160, 70 + index * 27, 272, 20, respuesta.label, () => this.chooseDialogue(respuesta.id), color);
    });
    this.button(160, 157, 92, 16, 'VOLVER', () => { this.state.screen = 'hub'; this.save(); this.draw(); }, C.mid);
    this.text(160, 167, 'ESC: VOLVER', 5, C.mid, FONT);
  }
  trainingMenu(): void {
    this.backdrop('gym-interior', 0.62);
    this.box(160, 91, 300, 166, C.dark, C.fire, 0.72);
    this.text(160, 12, 'ENTRENAMIENTO', 8, C.fire, FONT);
    this.text(160, 34, `Coste: $${AJUSTES.economy.trainingCost} · ${AJUSTES.economy.trainingEnergy} energía`, 7, C.cream, FONT);
    this.text(160, 49, `Hoy: fuerza ${this.state.trainedStrength ? 'conservada' : 'sin entrenar'} · velocidad ${this.state.trainedSpeed ? 'conservada' : 'sin entrenar'}`, 7, C.lime);
    const strengthLabel = this.state.strength >= AJUSTES.player.maxStat ? '1 · FUERZA · MÁXIMO' : `1 · FUERZA ${this.state.strength} → ${this.state.strength + 1} · MÁS DAÑO`;
    const speedLabel = this.state.speed >= AJUSTES.player.maxStat ? '2 · VELOCIDAD · MÁXIMO' : `2 · VELOCIDAD ${this.state.speed} → ${this.state.speed + 1} · MEJOR ESQUIVA`;
    this.button(160, 80, 264, 24, strengthLabel, () => this.chooseTraining('strength'), C.fire);
    this.button(160, 115, 264, 24, speedLabel, () => this.chooseTraining('speed'), C.lime);
    this.button(160, 157, 92, 16, 'VOLVER', () => { this.state.screen = 'hub'; this.save(); this.draw(); }, C.mid);
    this.text(160, 136, 'Cada sesión usa 1 franja. El atributo entrenado no baja esta noche.', 7, C.cream, 'Rubik', 274);
    this.text(160, 167, 'ESC: VOLVER', 5, C.mid, FONT);
  }
  hasAvailableSlot(): boolean {
    if (this.state.slot < AJUSTES.campaign.slotsPerDay) return true;
    this.state.message = 'Se acabaron las franjas. Cierra el día.';
    this.draw();
    return false;
  }
  useSlot(message: string, action?: RoutineAction, receipt?: string): boolean {
    if (!this.hasAvailableSlot()) return false;
    if (action) this.advanceTutorial(action);
    this.state.slot++; this.state.message = message;
    if (this.state.slot === AJUSTES.campaign.slotsPerDay) this.state.message += ' Ya puedes cerrar el día.';
    this.save();
    this.draw();
    if (receipt) this.showReceipt(receipt);
    return true;
  }
  sell(): void {
    if (!this.hasAvailableSlot()) return;
    if (this.state.stock <= 0) { this.state.message = 'No queda papa. Repón antes de vender.'; this.draw(); return; }
    this.audio.play('sell');
    this.state.stock--; this.state.coins += AJUSTES.economy.saleCoins; this.state.heat = Math.min(AJUSTES.player.maxHeat, this.state.heat + AJUSTES.economy.saleHeat);
    this.useSlot(`¡Pedido servido! +$${AJUSTES.economy.saleCoins} y sube el calor del barrio.`, 'sell', `+$${AJUSTES.economy.saleCoins}`);
  }
  restock(): void {
    if (!this.hasAvailableSlot()) return;
    if (this.state.coins < AJUSTES.economy.restockCost) { this.state.message = `Necesitas $${AJUSTES.economy.restockCost} para reponer.`; this.draw(); return; }
    this.audio.play('restock'); this.state.coins -= AJUSTES.economy.restockCost; this.state.stock += AJUSTES.economy.restockAmount; this.useSlot(`Mercado: ${AJUSTES.economy.restockAmount} papas frescas listas para vender.`, undefined, `+${AJUSTES.economy.restockAmount} PAPAS`);
  }
  train(stat?: 'strength' | 'speed'): void {
    if (!this.hasAvailableSlot()) return;
    if (this.state.coins < AJUSTES.economy.trainingCost || this.state.energy < AJUSTES.economy.trainingEnergy) { this.state.message = `Entrenar cuesta $${AJUSTES.economy.trainingCost} y ${AJUSTES.economy.trainingEnergy} de energía.`; this.draw(); return; }
    if (this.state.strength >= AJUSTES.player.maxStat && this.state.speed >= AJUSTES.player.maxStat) { this.state.message = 'Fuerza y velocidad ya están al máximo.'; this.draw(); return; }
    this.state.screen = 'training';
    if (stat) this.chooseTraining(stat);
    else { this.save(); this.draw(); }
  }
  chooseTraining(stat: 'strength' | 'speed'): void {
    if (this.state.screen !== 'training' || !this.hasAvailableSlot()) return;
    if (this.state[stat] >= AJUSTES.player.maxStat) {
      this.state.screen = 'hub'; this.state.message = `${stat === 'strength' ? 'Fuerza' : 'Velocidad'} ya está al máximo.`; this.save(); this.draw(); return;
    }
    if (this.state.coins < AJUSTES.economy.trainingCost || this.state.energy < AJUSTES.economy.trainingEnergy) {
      this.state.screen = 'hub'; this.state.message = `Entrenar cuesta $${AJUSTES.economy.trainingCost} y ${AJUSTES.economy.trainingEnergy} de energía.`; this.save(); this.draw(); return;
    }
    this.audio.play('train'); this.state.coins -= AJUSTES.economy.trainingCost; this.state.energy -= AJUSTES.economy.trainingEnergy;
    this.state[stat] += AJUSTES.economy.trainingStrength;
    if (stat === 'strength') this.state.trainedStrength = true;
    else this.state.trainedSpeed = true;
    this.state.screen = 'hub';
    if (stat === 'strength') this.advanceTutorial('train');
    this.useSlot(stat === 'strength' ? 'Golpes al saco: fuerza +1.' : 'Trabajo de pies: velocidad +1; mejoras tu ventana de esquiva.', undefined, stat === 'strength' ? 'FUERZA +1' : 'VELOCIDAD +1');
  }
  rest(): void {
    if (!this.hasAvailableSlot()) return;
    const energyGain = Math.min(AJUSTES.recovery.restEnergy, AJUSTES.player.maxEnergy - this.state.energy);
    const hpGain = Math.min(AJUSTES.recovery.restHp, this.state.maxHp - this.state.hp);
    if (energyGain === 0 && hpGain === 0) {
      this.state.message = 'Ya estás descansado. Conservas la franja; elige otra acción.'; this.draw(); return;
    }
    this.audio.play('rest'); this.state.energy = Math.min(AJUSTES.player.maxEnergy, this.state.energy + AJUSTES.recovery.restEnergy); this.state.hp = Math.min(this.state.maxHp, this.state.hp + AJUSTES.recovery.restHp);
    this.useSlot(`Un respiro: +${energyGain} energía y +${hpGain} vida.`, 'rest', `+${energyGain} ENERGÍA`);
  }
  talk(): void {
    if (!this.hasAvailableSlot()) return;
    this.audio.play('talk'); this.state.screen = 'dialogue'; this.save(); this.draw();
  }
  chooseDialogue(choice: Respuesta): void {
    if (this.state.screen !== 'dialogue' || !this.hasAvailableSlot()) return;
    const line = HISTORIA_DIA[this.state.day]?.charla ?? 'El barrio espera que vuelvas a abrir.';
    this.state.screen = 'hub';
    if (choice === 'heart') {
      this.state.heart = Math.min(AJUSTES.player.maxHeart, this.state.heart + AJUSTES.story.heartPerTalk);
      this.useSlot(`${line} Vínculo +${AJUSTES.story.heartPerTalk}.`, 'talk', 'VÍNCULO +1');
    } else if (choice === 'train') {
      this.state.strength = Math.min(AJUSTES.player.maxStat, this.state.strength + AJUSTES.economy.trainingStrength);
      this.state.trainedStrength = true;
      this.useSlot(`${line} La conversación te devuelve determinación: fuerza +${AJUSTES.economy.trainingStrength}.`, undefined, 'FUERZA +1');
    } else {
      this.state.energy = Math.min(AJUSTES.player.maxEnergy, this.state.energy + 1);
      this.state.hp = Math.min(this.state.maxHp, this.state.hp + 1);
      this.useSlot(`${line} Respiras con el barrio: +1 vida y +1 energía.`, undefined, 'UN RESPIRO');
    }
  }
  endDay(): void {
    if (this.state.slot === 0) { this.state.message = 'Usa al menos una franja antes de cerrar.'; this.draw(); return; }
    this.state.screen = 'night'; this.draw();
  }
  confirmEndDay(): void {
    if (this.state.screen !== 'night') return;
    this.state.tutorialStep = FIRST_DAY_LESSONS.length;
    this.state.strength = this.nightStat('strength');
    this.state.speed = this.nightStat('speed');
    this.state.trainedStrength = false; this.state.trainedSpeed = false;
    this.state.energy = Math.min(AJUSTES.player.maxEnergy, this.state.energy + AJUSTES.recovery.nightEnergy); this.state.hp = Math.min(this.state.maxHp, this.state.hp + AJUSTES.recovery.nightHp); this.state.heat = Math.max(0, this.state.heat - AJUSTES.recovery.nightlyHeat);
    const completed = this.state.day; this.state.slot = 0;
    if (AJUSTES.campaign.fightDays.includes(completed as (typeof AJUSTES.campaign.fightDays)[number])) { this.startFight(completed); return; }
    if (completed >= AJUSTES.campaign.days) { this.finish(); return; }
    this.state.day++;
    this.state.screen = 'hub';
    this.state.place = 'shop';
    this.state.message = HISTORIA_DIA[this.state.day]?.aviso ?? `Cae la noche del día ${completed}; tus fuerzas se enfrían.`;
    this.save(); this.draw();
  }
  startFight(day: number): void {
    this.resetDefense();
    this.state.fightDay = day; this.state.screen = this.state.combatTutorialSeen ? 'fight' : 'combatLesson'; this.state.cooldown = AJUSTES.combat.startDelayMs;
    this.attackTelegraphed = false;
    this.state.fightPhaseTwo = false;
    this.state.rabanAttackCount = 0;
    this.state.playerCooldown = 0;
    this.nextRabanRain = false;
    this.state.enemyName = AJUSTES.combat.enemyByDay[day as keyof typeof AJUSTES.combat.enemyByDay];
    this.state.enemyMax = AJUSTES.combat.enemyHp[day as keyof typeof AJUSTES.combat.enemyHp]; this.state.enemyHp = this.state.enemyMax;
    this.state.message = day === AJUSTES.campaign.days ? 'No quieres derrotar a Batata: quieres llegar hasta él.' : 'El rival te corta el paso. ¡Lee su ataque y responde!';
    this.save(); this.draw();
  }
  resetDefense(): void {
    this.guardReady = false; this.dodgeReady = false; this.pointerTravel = 0; this.lastPointer = null;
    this.dodgeCooldown = 0;
    if (this.dodgeTimer) this.time.removeEvent(this.dodgeTimer);
    this.dodgeTimer = null;
  }
  combatLesson(): void {
    this.box(160, 90, 304, 168, C.dark, C.fire);
    this.text(160, 12, 'TU PRIMER ASALTO', 8, C.lime, FONT);
    this.text(160, 32, `${this.state.enemyName}: ${this.state.enemyMax} vida · tú: fuerza ${this.state.strength}, vida ${this.state.hp}`, 7, C.cream);
    const lessons = [
      ['GOLPEAR / ESPACIO', `Daño ${this.state.strength}. Espera ${(AJUSTES.combat.playerAttackMs / 1000).toFixed(1)} s entre golpes y lee al rival.`],
      ['BLOQUEAR / CLIC DERECHO', 'Reduce el próximo golpe; al recibirlo recuperas energía.'],
      ['MOVER EL RATÓN', 'Al ver el aviso, muévete para esquivar. La ventana dura poco.'],
      ['MODO EN LLAMAS', `Calor ${AJUSTES.combat.flameThreshold}+: +${AJUSTES.combat.flameBonus} daño. Gasta calor y ${AJUSTES.combat.flameEnergy} energía.`],
    ];
    lessons.forEach(([title, body], index) => {
      this.text(160, 50 + index * 23, title, 5, index === 3 ? C.fire : C.lime, FONT);
      this.text(160, 60 + index * 23, body, 7, C.cream, 'Rubik', 282);
    });
    this.button(160, 158, 170, 22, 'ENTENDIDO · AL RING', () => {
      this.state.combatTutorialSeen = true; this.state.screen = 'fight'; this.state.cooldown = AJUSTES.combat.startDelayMs;
      this.resetDefense(); this.save(); this.draw();
    }, C.lime, 6);
  }
  fight(): void {
    this.box(160, 92, 300, 160, C.dark, C.fire);
    this.text(160, 2, `ASALTO ${this.state.fightDay}  ·  RING DEL BARRIO`, 7, C.fire, FONT);
    this.meter(62, 21, 88, this.state.hp, this.state.maxHp, C.red, `PATATA ${this.state.hp}/${this.state.maxHp}`);
    this.meter(258, 21, 88, this.state.enemyHp, this.state.enemyMax, C.fire, `${this.state.enemyName.toUpperCase()} ${this.state.enemyHp}/${this.state.enemyMax}`);
    this.meter(62, 38, 64, this.state.energy, AJUSTES.player.maxEnergy, C.blue, `ENERGÍA ${this.state.energy}`);
    this.box(160, 85, 250, 56, '#46362F', '#9A704E');
    const ropes = this.add.graphics();
    ropes.lineStyle(1, Phaser.Display.Color.HexStringToColor('#C49A69').color, 0.72);
    ropes.lineBetween(38, 72, 282, 72); ropes.lineBetween(38, 94, 282, 94);
    this.fighter(62, 53, 'Patata', false);
    this.fighter(205, 53, this.state.enemyName, true);
    this.text(160, 112, this.state.message, 8, C.cream);
    this.button(88, 145, 105, 24, 'GOLPEAR', () => this.attack(), C.lime);
    this.button(231, 145, 105, 24, 'BLOQUEAR', () => this.block(), C.cream);
    this.text(160, 161, 'Mueve ratón: esquiva · clic: golpea · der: guarda', 5, C.mid);
    this.attackPrompt = this.text(160, 43, this.state.playerCooldown > 0 ? 'RECUPERANDO GOLPE' : 'GOLPE LISTO', 4, C.lime, FONT);
    this.text(258, 43, this.guardReady ? 'GUARDIA ACTIVA' : 'GUARDIA DISPONIBLE', 4, C.cream, FONT);
  }
  fighter(x: number, y: number, name: string, isEnemy: boolean): void {
    const sprite = name === 'Patata' ? 'patata-boxer' : name === 'Yuca' ? 'yuca-boxer' : name === 'Rábano' ? 'rabano-boxer' : null;
    if (sprite) {
      const height = name === 'Patata' ? 55 : 52;
      const width = name === 'Patata' ? 47 : name === 'Yuca' ? 36 : 34;
      this.add.image(x + 18, y + height / 2, sprite).setDisplaySize(width, height);
      return;
    }
    const g = this.add.graphics();
    const fill = (color: string, dx: number, dy: number, w: number, h: number) => {
      g.fillStyle(Phaser.Display.Color.HexStringToColor(color).color);
      g.fillRect(x + dx, y + dy, w, h);
    };
    const body = name === 'Batata' ? '#D27635' : name === 'Rábano' ? '#B34260' : name === 'Yuca' ? '#D4C47A' : '#C9A45C';
    const glove = isEnemy ? C.fire : C.lime;
    fill(C.dark, 5, 46, 26, 3); // sombra
    fill(body, 9, 10, 16, 8); fill(body, 6, 16, 22, 17); fill(body, 8, 31, 18, 8); // cuerpo
    fill('#F2E8C9', 10, 14, 3, 2); fill('#A97942', 8, 28, 18, 2); // brillo y cinturón
    fill(C.dark, 10, 38, 5, 6); fill(C.dark, 20, 38, 5, 6); // botas
    fill('#101820', 10, 43, 7, 3); fill('#101820', 19, 43, 8, 3);
    fill(body, 11, 3, 12, 9); // cabeza
    fill(glove, 3, 19, 7, 7); fill(glove, 27, 19, 7, 7); // guantes
    fill(C.dark, 3, 25, 7, 2); fill(C.dark, 27, 25, 7, 2);
    if (isEnemy) {
      fill(C.leaf, 12, 0, 4, 5); fill(C.leaf, 16, 1, 4, 6); fill(C.lime, 20, 0, 4, 5); // hojas
      fill(C.fire, 9, 10, 15, 3); // cinta de combate
    } else {
      fill(C.fire, 9, 8, 16, 3); fill(C.cream, 22, 8, 5, 3); // cinta del protagonista
    }
    const eyeX = isEnemy ? 13 : 19;
    fill(C.cream, eyeX, 14, 3, 4); fill(C.dark, eyeX + 1, 15, 2, 3);
    fill(C.dark, isEnemy ? 12 : 21, 21, 5, 2); // expresión
  }
  attack(): void {
    if (this.state.screen !== 'fight' || this.state.playerCooldown > 0) return;
    this.state.playerCooldown = AJUSTES.combat.playerAttackMs;
    const hot = this.state.heat >= AJUSTES.combat.flameThreshold && this.state.energy > 0;
    this.audio.play(hot ? 'flame' : 'hit');
    this.cameras.main.shake(AJUSTES.combat.hitShakeMs, AJUSTES.combat.hitShake);
    const damage = this.state.strength + (hot ? AJUSTES.combat.flameBonus : 0);
    const crossedRabanPhase = this.state.enemyName === 'Rábano' && !this.state.fightPhaseTwo
      && this.state.enemyHp > this.state.enemyMax / 2 && this.state.enemyHp - damage <= this.state.enemyMax / 2;
    this.state.enemyHp -= damage; if (hot) { this.state.energy -= AJUSTES.combat.flameEnergy; this.state.heat -= AJUSTES.combat.flameThreshold; }
    if (this.state.enemyHp <= 0) { this.winFight(); return; }
    if (crossedRabanPhase) {
      this.state.fightPhaseTwo = true;
      this.attackTelegraphed = false;
      this.state.message = '¡RÁBANO CAMBIA DE FASE! Ahora ataca más rápido.';
    } else {
      this.state.message = hot ? `¡MODO EN LLAMAS! ${damage} de daño. Consume ${AJUSTES.combat.flameEnergy} energía.` : `Impacto: ${damage} de daño. ${this.state.enemyName} prepara su respuesta.`;
    }
    this.state.cooldown = Math.min(this.state.cooldown, this.enemyInterval() * AJUSTES.combat.hitResponseRatio); this.save(); this.draw();
  }
  block(): void {
    if (this.state.screen !== 'fight' || this.guardReady) return;
    this.audio.play('block'); this.guardReady = true; this.state.message = 'Guardia alta: reducirás el próximo golpe.';
    this.state.cooldown = Math.min(this.state.cooldown, this.enemyInterval() * AJUSTES.combat.blockResponseRatio); this.save(); this.draw();
  }
  enemyInterval(): number {
    return this.state.enemyName === 'Batata' ? AJUSTES.combat.bossAttackMs
      : this.state.fightPhaseTwo ? AJUSTES.combat.rabanPhaseTwoMs : AJUSTES.combat.regularAttackMs;
  }
  enemyAttack(blocked = false): void {
    if (this.state.screen !== 'fight') return;
    const guarded = blocked || this.guardReady; const dodged = this.dodgeReady; this.guardReady = false; this.dodgeReady = false;
    if (this.dodgeTimer) this.time.removeEvent(this.dodgeTimer);
    this.dodgeTimer = null;
    const rabanRain = this.nextRabanRain;
    if (this.state.enemyName === 'Rábano' && this.state.fightPhaseTwo) this.state.rabanAttackCount++;
    this.nextRabanRain = false;
    const incomingDamage = AJUSTES.combat.enemyDamage + (rabanRain ? 1 : 0);
    const damage = dodged ? 0 : Math.max(AJUSTES.combat.minDamage, incomingDamage - (guarded ? AJUSTES.combat.blockReduction : 0) - Math.floor(this.state.speed / AJUSTES.combat.speedPerDefense));
    if (guarded && !dodged) this.state.energy = Math.min(AJUSTES.player.maxEnergy, this.state.energy + AJUSTES.combat.blockEnergy);
    this.state.hp -= damage;
    if (damage > 0) this.cameras.main.shake(AJUSTES.combat.damageShakeMs, AJUSTES.combat.damageShake);
    if (this.state.hp <= 0) {
      this.state.hp = 0;
      if (this.state.fightDay === AJUSTES.campaign.days) { this.audio.play('lose'); this.state.endingOutcome = 'defeat'; this.state.screen = 'ending'; this.state.message = 'Derrotado al borde del ring, Batata toma tu mano. La familia sigue separada.'; this.save(); this.draw(); }
      else { this.audio.play('lose'); this.state.hp = Math.max(AJUSTES.recovery.lossHp, Math.floor(this.state.maxHp / 2)); this.state.coins = Math.max(0, this.state.coins - AJUSTES.economy.lossPenalty); this.state.message = `Caíste, pero el barrio te levantó. Pierdes $${AJUSTES.economy.lossPenalty} y vuelves con media vida.`; this.state.screen = 'hub'; this.state.place = 'shop'; this.state.day++; this.save(); this.draw(); }
      return;
    }
    this.audio.play(dodged ? 'dodge' : guarded ? 'block' : 'hit');
    this.state.message = dodged ? `¡Esquivas ${rabanRain ? 'la lluvia de rábanos' : 'el golpe'} por un pelo!` : `${guarded ? 'Bloqueaste parte del golpe. ' : ''}${rabanRain ? 'La lluvia de rábanos' : this.state.enemyName} te alcanza: -${damage} vida.`;
    this.state.cooldown = this.enemyInterval(); this.save(); this.draw();
  }
  winFight(): void {
    this.state.wins++; this.state.coins += this.state.fightDay === AJUSTES.campaign.days ? 0 : AJUSTES.economy.winReward; this.state.hp = Math.min(this.state.maxHp, this.state.hp + AJUSTES.recovery.winHp);
    this.audio.play('win');
    this.cameras.main.shake(AJUSTES.combat.winShakeMs, AJUSTES.combat.winShake);
    if (this.state.fightDay === AJUSTES.campaign.days) { this.finish(); return; }
    this.state.day++; this.state.screen = 'hub'; this.state.place = 'shop'; this.state.message = `¡Victoria! +$${AJUSTES.economy.winReward}, +${AJUSTES.recovery.winHp} vida. ${HISTORIA_DIA[this.state.day]?.aviso ?? 'Vuelve al puesto.'}`; this.save(); this.draw();
  }
  finish(): void {
    this.state.screen = 'choice'; this.state.message = 'La pelea termina. Con vínculo 3+ Batata puede volver; decide qué familia construir.'; this.save(); this.draw();
  }
  endingChoice(): void {
    this.box(160, 91, 300, 160, C.dark, C.fire);
    this.text(160, 18, 'LA PELEA TERMINÓ', 8, C.lime, FONT);
    this.text(160, 38, `Vínculo ${this.state.heart}/${AJUSTES.player.maxHeart} · monedas $${this.state.coins}`, 7, C.cream, FONT);
    this.text(160, 50, this.state.message, 7, C.cream);
    this.button(160, 82, 264, 22, 'PERDONAR Y VOLVER', () => this.chooseEnding('brothers'), C.lime);
    this.button(160, 116, 264, 22, 'REPARTIR EL PUESTO', () => this.chooseEnding('community'), C.cream);
    this.button(160, 150, 264, 22, 'DEJARLO IR EN PAZ', () => this.chooseEnding('promise'), C.fire);
  }
  chooseEnding(choice: 'brothers' | 'community' | 'promise'): void {
    this.state.endingOutcome = choice;
    if (choice === 'brothers' && this.state.heart >= AJUSTES.story.brothersThreshold) { this.state.message = 'Le extiendes la mano a Batata. Él la acepta. Juntos reabren el puesto para el barrio. FINAL: HERMANOS.'; }
    else if (choice === 'brothers') { this.state.endingOutcome = 'promise'; this.state.message = 'Intentas abrazarlo, pero Batata todavía no puede confiar. Se marcha; dejas abierta la puerta. FINAL: PROMESA.'; }
    else if (choice === 'community') { this.state.message = 'Convierten el puesto en una cooperativa del barrio. Batata vuelve poco a poco; nadie vuelve a cargar solo con la deuda. FINAL: MERCADO COMÚN.'; }
    else { this.state.message = 'Lo dejas marchar sin rencor. El puesto vuelve a ser tuyo y la puerta queda abierta. FINAL: PROMESA.'; }
    this.state.screen = 'ending'; this.save(); this.draw();
  }
  ending(): void {
    this.box(160, 91, 286, 145, C.dark, this.state.endingOutcome === 'defeat' ? C.fire : C.lime);
    const headlines = { brothers: 'FINAL: HERMANOS', community: 'FINAL: MERCADO', promise: 'FINAL: PROMESA', defeat: 'HASTA PRONTO' };
    this.text(160, 31, headlines[this.state.endingOutcome ?? 'promise'], 8, this.state.endingOutcome === 'defeat' ? C.fire : C.lime, FONT);
    this.text(160, 62, this.state.message, 7, C.cream, 'Rubik', 250);
    this.text(160, 111, `DÍAS: ${this.state.day}   VICTORIAS: ${this.state.wins}\nVÍNCULO: ${this.state.heart}   PUESTO: $${this.state.coins}`, 7, C.mid, FONT);
    this.button(91, 151, 132, 18, 'REINTENTAR', () => { this.state = fresh(); this.state.screen = 'warning'; this.save(); this.draw(); }, C.lime);
    this.button(229, 151, 132, 18, 'TÍTULO', () => { this.state.screen = 'title'; this.draw(); }, C.cream);
  }
  save(): void { this.state.savedAt = Date.now(); try { localStorage.setItem(SAVE, JSON.stringify(this.state)); } catch { this.state.message = 'No se pudo guardar en este navegador.'; } }
  loadGame(): void {
    let raw: string | null = null;
    try { raw = localStorage.getItem(SAVE); if (!raw) { this.titleNotice = 'Aún no hay una partida guardada.'; this.draw(); return; }
      this.state = recoverState(JSON.parse(raw));
      this.titleNotice = '';
      this.resetDefense();
      this.attackTelegraphed = false; this.nextRabanRain = false; this.pausedFrom = null;
      if (this.state.screen === 'fight') this.state.message = `Combate recuperado: ${this.state.enemyName} conserva ${this.state.enemyHp} de vida. Prepárate.`;
      else if (this.state.screen === 'hub') this.state.message = 'Partida recuperada. El barrio te esperaba.';
      this.save(); this.draw();
    } catch {
      let backedUp = false;
      if (raw) try { localStorage.setItem(`${SAVE}-corrupt`, raw); backedUp = true; } catch { /* Keep the original save if storage is unavailable. */ }
      this.state = fresh();
      this.titleNotice = backedUp ? 'Guardado inválido; copia conservada. Inicia una nueva partida.' : 'No se pudo leer el guardado. Inicia una nueva partida.';
      this.draw();
    }
  }
}

const timeoutMode = new URLSearchParams(window.location.search).has('timeout');
export function startCampaign(timeout = timeoutMode): void {
  new Phaser.Game({ type: Phaser.CANVAS, parent: 'juego', width: W, height: H, backgroundColor: C.bg, pixelArt: true, roundPixels: true, fps: { forceSetTimeOut: timeout }, render: { antialias: false, pixelArt: true, roundPixels: true }, scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }, input: { gamepad: true }, audio: { noAudio: true }, scene: [GameScene] });
}












