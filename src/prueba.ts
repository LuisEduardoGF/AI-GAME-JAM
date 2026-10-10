import Phaser from 'phaser';

const W = 320;
const H = 180;
const C = { bg: '#0F380F', dark: '#101820', green: '#306230', mid: '#8BAC0F', lime: '#9BBC0F', fire: '#E85D2A', cream: '#F2E8C9', red: '#D94B3D' };
type Mode = 'title' | 'hub' | 'fight' | 'result';

class PruebaScene extends Phaser.Scene {
  mode: Mode = 'title';
  day = 1;
  slots = 0;
  coins = 8;
  stock = 2;
  energy = 5;
  hp = 8;
  strength = 1;
  bossHp = 24;
  cooldown = 1800;
  attackReady = true;
  combatInputReadyAt = 0;
  dodgeReady = false;
  telegraphing = false;
  pointerAt: { x: number; y: number } | null = null;
  pointerDistance = 0;
  message = 'Dos días para preparar el puesto. El tercero, el ring.';
  root!: Phaser.GameObjects.Container;

  constructor() { super('Prueba'); }

  create(): void {
    this.root = this.add.container(0, 0);
    this.cameras.main.setBackgroundColor(C.bg);
    this.input.mouse?.disableContextMenu();
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (this.pointerAt && this.mode === 'fight' && this.telegraphing) {
        this.pointerDistance += Phaser.Math.Distance.Between(this.pointerAt.x, this.pointerAt.y, p.x, p.y);
        if (this.pointerDistance >= 24) {
          this.dodgeReady = true;
          this.pointerDistance = 0;
        }
      }
      this.pointerAt = { x: p.x, y: p.y };
    });
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (this.mode === 'fight' && p.leftButtonDown()) this.attack();
    });
    this.input.keyboard?.on('keydown-SPACE', () => { if (this.mode === 'fight') this.attack(); });
    this.input.keyboard?.on('keydown-ENTER', () => { if (this.mode === 'title') this.start(); });
    this.draw();
  }

  update(_time: number, delta: number): void {
    if (this.mode !== 'fight') return;
    this.cooldown -= delta;
    if (this.cooldown <= 0) {
      if (this.dodgeReady) this.message = '¡Esquiva limpia! El puesto te enseñó a moverte.';
      else {
        this.hp = Math.max(0, this.hp - 2);
        this.message = 'Rábano conecta. Muévete cuando aparezca el aviso.';
      }
      this.dodgeReady = false;
      this.telegraphing = false;
      this.pointerDistance = 0;
      this.pointerAt = null;
      this.cooldown = 1900;
      if (this.hp <= 0) { this.mode = 'result'; this.message = 'Rábano se queda el ring. Ajusta tu preparación y vuelve a probar.'; }
      this.draw();
      return;
    }
    if (this.cooldown <= 900 && !this.telegraphing) {
      this.telegraphing = true;
      this.pointerDistance = 0;
      this.message = '¡CUIDADO! Mueve el ratón para esquivar.';
      this.draw();
    }
  }

  text(x: number, y: number, value: string, size = 7, color = C.cream, font = 'Rubik', wrapWidth = 290): Phaser.GameObjects.Text {
    return this.add.text(x, y, value, { fontFamily: font, fontSize: `${size}px`, color, align: 'center', wordWrap: { width: wrapWidth }, lineSpacing: 2 }).setOrigin(0.5, 0);
  }

  rect(x: number, y: number, w: number, h: number, color: string, stroke = C.mid): Phaser.GameObjects.Rectangle {
    return this.add.rectangle(x, y, w, h, Phaser.Display.Color.HexStringToColor(color).color).setStrokeStyle(1, Phaser.Display.Color.HexStringToColor(stroke).color);
  }

  button(x: number, y: number, w: number, label: string, callback: () => void, color = C.lime): void {
    const box = this.rect(x, y, w, 22, C.dark, color).setInteractive({ useHandCursor: true });
    const text = this.text(x, y - 5, label, 6, color, '"Press Start 2P", monospace').setInteractive();
    box.on('pointerover', () => box.setFillStyle(Phaser.Display.Color.HexStringToColor(C.green).color));
    box.on('pointerout', () => box.setFillStyle(Phaser.Display.Color.HexStringToColor(C.dark).color));
    box.on('pointerdown', callback);
    text.on('pointerdown', callback);
  }

  draw(): void {
    this.root?.removeAll(true);
    this.root = this.add.container(0, 0);
    if (this.mode === 'title') {
      this.root.add(this.rect(160, 90, 300, 164, C.dark, C.lime));
      this.root.add(this.text(160, 27, 'PAPA CALIENTE', 11, C.lime, '"Press Start 2P", monospace'));
      this.root.add(this.text(160, 51, 'PRUEBA CORTA · 3 DÍAS', 7, C.cream, '"Press Start 2P", monospace'));
      this.root.add(this.text(160, 75, 'Prepara el puesto. Enfrenta a Rábano.\nUna primera medida del bucle central.', 8));
      this.button(160, 127, 190, 'EMPEZAR · ENTER', () => this.start());
      return;
    }
    if (this.mode === 'hub') {
      this.root.add(this.rect(160, 91, 304, 168, C.dark));
      this.root.add(this.text(160, 10, `DÍA ${this.day}/2 · PREPARACIÓN ${this.slots}/3`, 7, C.lime, '"Press Start 2P", monospace'));
      this.root.add(this.text(160, 24, `$${this.coins} · STOCK ${this.stock} · ENERGÍA ${this.energy} · VIDA ${this.hp}`, 6, C.cream, '"Press Start 2P", monospace'));
      this.root.add(this.text(160, 40, this.message, 7));
      this.button(82, 76, 128, 'VENDER +$5', () => this.sell(), this.stock ? C.lime : C.mid);
      this.button(238, 76, 128, 'ENTRENAR +FUERZA', () => this.train(), this.coins >= 3 && this.energy >= 2 ? C.lime : C.mid);
      this.button(82, 108, 128, 'DESCANSAR +VIDA', () => this.rest(), C.cream);
      this.button(238, 108, 128, 'CERRAR DÍA', () => this.closeDay(), this.slots >= 3 ? C.fire : C.mid);
      this.root.add(this.text(160, 151, 'La preparación de hoy afecta el combate.', 6, C.mid));
      return;
    }
    if (this.mode === 'fight') {
      this.root.add(this.rect(160, 91, 304, 168, C.dark, C.fire));
      this.root.add(this.text(160, 9, 'DÍA 3 · RING DEL MERCADO', 7, C.fire, '"Press Start 2P", monospace'));
      this.root.add(this.text(160, 25, `TU VIDA ${this.hp}/8 · FUERZA ${this.strength}     RÁBANO ${this.bossHp}/24`, 6, C.cream, '"Press Start 2P", monospace'));
      this.root.add(this.rect(91, 80, 38, 45, C.green, C.lime));
      this.root.add(this.text(91, 72, 'TÚ', 6, C.lime, '"Press Start 2P", monospace'));
      this.root.add(this.rect(229, 80, 38, 45, C.fire, C.cream));
      this.root.add(this.text(229, 72, 'RÁBANO', 6, C.fire, '"Press Start 2P", monospace'));
      this.root.add(this.text(160, 118, this.message, 7, this.telegraphing ? C.fire : C.cream));
      this.button(160, 155, 188, 'ATACAR · CLIC / ESPACIO', () => this.attack(), C.lime);
    }
    if (this.mode === 'result') {
      this.root.add(this.rect(160, 91, 304, 168, C.dark, this.bossHp <= 0 ? C.lime : C.fire));
      this.root.add(this.text(160, 27, this.bossHp <= 0 ? '¡RÁBANO DERROTADO!' : 'FIN DE LA PRUEBA', 8, this.bossHp <= 0 ? C.lime : C.fire, '"Press Start 2P", monospace'));
      this.root.add(this.text(160, 59, this.message, 8));
      this.root.add(this.text(160, 103, `DÍAS 3 · FUERZA ${this.strength} · VIDA ${this.hp}`, 6, C.mid, '"Press Start 2P", monospace'));
      this.button(86, 147, 128, 'REPETIR', () => this.start(), C.lime);
      this.button(234, 147, 128, 'CAMPAÑA', () => { window.location.href = window.location.pathname; }, C.cream);
    }
  }

  start(): void {
    this.day = 1; this.slots = 0; this.coins = 8; this.stock = 2; this.energy = 5; this.hp = 8; this.strength = 1; this.bossHp = 24;
    this.attackReady = true; this.combatInputReadyAt = 0; this.dodgeReady = false; this.telegraphing = false; this.pointerAt = null; this.pointerDistance = 0; this.cooldown = 1800;
    this.message = 'Elige tres acciones. Vender financia el entrenamiento.';
    this.mode = 'hub'; this.draw();
  }

  spend(message: string): void {
    this.slots++;
    this.message = message;
    if (this.slots >= 3) this.message += ' Ya puedes cerrar el día.';
    this.draw();
  }

  sell(): void {
    if (this.slots >= 3) return;
    if (this.stock <= 0) { this.message = 'No queda producto para vender.'; this.draw(); return; }
    this.stock--; this.coins += 5; this.spend('Venta hecha: +$5.');
  }

  train(): void {
    if (this.slots >= 3) return;
    if (this.strength >= 4) { this.message = 'Fuerza al máximo. Prueba descansar o vender.'; this.draw(); return; }
    if (this.coins < 3 || this.energy < 2) { this.message = 'Entrenar cuesta $3 y 2 de energía.'; this.draw(); return; }
    this.coins -= 3; this.energy -= 2; this.strength++; this.spend('Entrenamiento: +1 fuerza.');
  }

  rest(): void {
    if (this.slots >= 3) return;
    if (this.hp >= 8 && this.energy >= 5) { this.message = 'Ya estás descansado. Elige otra acción.'; this.draw(); return; }
    this.hp = Math.min(8, this.hp + 2); this.energy = Math.min(5, this.energy + 2); this.spend('Descanso: +vida y energía.');
  }

  closeDay(): void {
    if (this.slots < 3) return;
    if (this.day === 1) {
      this.day = 2; this.slots = 0; this.energy = Math.min(5, this.energy + 2); this.message = 'Amanece. Un día más para preparar el combate.'; this.draw();
    } else {
      this.mode = 'fight'; this.cooldown = 1800; this.combatInputReadyAt = this.time.now + 180;
      this.telegraphing = false; this.dodgeReady = false; this.pointerAt = null; this.pointerDistance = 0;
      this.message = 'Haz clic o pulsa espacio para atacar. Esquiva al ver el aviso.'; this.draw();
    }
  }

  attack(): void {
    if (!this.attackReady || this.mode !== 'fight' || this.time.now < this.combatInputReadyAt) return;
    this.attackReady = false;
    this.bossHp = Math.max(0, this.bossHp - this.strength);
    this.message = this.telegraphing
      ? `¡CUIDADO! Impacto: ${this.strength} daño. Mueve para esquivar.`
      : `Golpe conectado: ${this.strength} daño.`;
    this.time.delayedCall(550, () => { this.attackReady = true; });
    if (this.bossHp <= 0) {
      this.mode = 'result'; this.message = 'El ring vuelve al barrio. ¿La preparación se sintió útil?';
    }
    this.draw();
  }
}

export function startPrueba(timeoutMode = false): void {
  new Phaser.Game({
    type: Phaser.CANVAS, parent: 'juego', width: W, height: H, backgroundColor: C.bg,
    pixelArt: true, roundPixels: true, fps: { forceSetTimeOut: timeoutMode },
    render: { antialias: false, pixelArt: true, roundPixels: true },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    input: { gamepad: false }, audio: { noAudio: true }, scene: [PruebaScene],
  });
}
