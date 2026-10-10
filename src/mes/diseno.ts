import type Phaser from 'phaser';

/** Colores compartidos por el barrio, sus paneles y sus símbolos. */
export const VISUAL = {
  ink: 0x17151c,
  panel: 0x29232a,
  raised: 0x3b3034,
  edge: 0x6b5148,
  gold: 0xf0b45b,
  cream: '#fff0d2',
  muted: '#cfbda7',
  green: 0x92c77a,
  red: 0xe47b61,
  blue: 0x82bcc7,
  flame: 0xefaa55,
  ember: 0xd97561,
  stone: 0x81afa7,
} as const;

export type IconKind =
  | 'coin' | 'heart' | 'energy' | 'strength' | 'agility' | 'resistance'
  | 'potato' | 'tomato' | 'carrot' | 'flame' | 'ember' | 'stone'
  | 'shop' | 'gym' | 'home' | 'neighborhood' | 'calendar' | 'skill' | 'check' | 'lock';

// Una cuadrícula común mantiene el grosor de trazo y el tamaño óptico.
// x = color principal, s = sombra, h = luz, l = hoja/verde.
const GLYPHS: Record<IconKind, readonly string[]> = {
  coin: [
    '   xxxx   ', '  xhhhhx  ', ' xhxxxxhx ', ' xhxhhxhx ', ' xhxxhxhx ',
    ' xhxhxxhx ', ' xhxhhxhx ', ' xhxxxxhx ', '  xhhhhx  ', '   xxxx   ',
  ],
  heart: [
    '          ', ' xx    xx ', 'xxxx  xxxx', 'xxxxxxxxxx', 'xxxxxxxxxx',
    ' xxxxxxxx ', '  xxxxxx  ', '   xxxx   ', '    xx    ', '          ',
  ],
  energy: [
    '     xxx  ', '    xxx   ', '   xxx    ', '  xxxxxx  ', ' xxxxxx   ',
    '    xxx   ', '   xxx    ', '  xxx     ', '  xx      ', '          ',
  ],
  strength: [
    '          ', '   xxx    ', '   xhx xx ', '   xxx xx ', '   xxx xx ',
    '  xxxxxxx ', ' xxxxxxxx ', ' xxhhxxx  ', '  xxxxx   ', '          ',
  ],
  agility: [
    '   xxx    ', '   xhx    ', '   xxx    ', ' xxxxxxx  ', 'xxx xx xx ',
    '    xx    ', '   xxxx   ', '  xx  xx  ', ' xx    xx ', 'xx      xx',
  ],
  resistance: [
    ' xxxxxxxx ', ' xhhhhhhx ', ' xhxxxxhx ', ' xhxxxxhx ', ' xhxxxxhx ',
    ' xhxxxxhx ', '  xxxxxxx ', '  xxxxxx  ', '   xxxx   ', '    xx    ',
  ],
  potato: [
    '   xxxx   ', '  xhhhhx  ', ' xhhhhhhx ', ' xhshhhhx ', ' xhhhhshx ',
    ' xhhhhhhx ', ' xhhshhhx ', ' xhhhhhhx ', '  xhhhhx  ', '   xxxx   ',
  ],
  tomato: [
    '    ll    ', '   llll   ', '  xxllxx  ', ' xxxxxxxx ', 'xxhhxxxxxx',
    'xxhxxxxxxx', 'xxxxxxxxxx', ' xxxxxxxx ', '  xxxxxx  ', '          ',
  ],
  carrot: [
    ' ll ll ll ', '  llllll  ', '   llll   ', '   xxxx   ', '  xxhxxx  ',
    '  xxxxxx  ', '   xxxx   ', '   xxx    ', '    xx    ', '    x     ',
  ],
  flame: [
    '     x    ', '    xx    ', '  x xxx   ', '  xxxxx x ', ' xxxxxxxx ',
    ' xxxhxxxx ', ' xxxhhxxx ', '  xhhhxx  ', '   xhhx   ', '    xx    ',
  ],
  ember: [
    ' x      x ', '          ', '    xx    ', '   xxxx   ', ' xxxxxxxx ',
    ' xxxhxxxx ', ' xxxhhxxx ', '  xhhhxx  ', '   xxxx   ', ' xxx  xxx ',
  ],
  stone: [
    '          ', '          ', '   xxxx   ', '  xxhhxx  ', ' xxhxxxxx ',
    'xxhxxxxxxx', 'xxxxxxxxxx', 'xxsxxxxsxx', ' xssssssx ', '          ',
  ],
  shop: [
    ' xxxxxxxx ', ' xxhxxhxx ', 'xxhxxhxxhx', 'xxxxxxxxxx', ' xx xx xx ',
    ' x      x ', ' x  xx  x ', ' x  xx  x ', ' xxxxxxxx ', '          ',
  ],
  gym: [
    '          ', ' xx    xx ', 'xxx    xxx', 'xxx    xxx', 'xxxxxxxxxx',
    'xxxxxxxxxx', 'xxx    xxx', 'xxx    xxx', ' xx    xx ', '          ',
  ],
  home: [
    '    xx    ', '   xxxx   ', '  xxxxxx  ', ' xxxxxxxx ', 'xxxxxxxxxx',
    ' xx    xx ', ' xx hh xx ', ' xx xx xx ', ' xx xx xx ', ' xxxxxxxx ',
  ],
  neighborhood: [
    '       xx ', ' xx    xx ', ' xx xxxhx ', 'xxx xxhxx ', 'xhx xxxhx ',
    'xxx xxhxx ', 'xhx xxxhx ', 'xxx xxxxx ', 'xxxxxxxxxx', '          ',
  ],
  calendar: [
    '  xx  xx  ', ' xxxxxxxx ', ' xhxxxxhx ', ' xxxxxxxx ', ' x      x ',
    ' x xx x x ', ' x xx x x ', ' x x xx x ', ' x      x ', ' xxxxxxxx ',
  ],
  skill: [
    '    xx    ', '    xx    ', '   xxxx   ', '  xxxxxx  ', 'xxxhhxxxxx',
    'xxxhhxxxxx', '  xxxxxx  ', '   xxxx   ', '    xx    ', '    xx    ',
  ],
  check: [
    '          ', '        xx', '       xxx', '      xxx ', ' xx  xxx  ',
    ' xxx xxx  ', '  xxxxx   ', '   xxx    ', '    x     ', '          ',
  ],
  lock: [
    '   xxxx   ', '  xx  xx  ', '  xx  xx  ', '  xx  xx  ', ' xxxxxxxx ',
    ' xxxhhxxx ', ' xxxhhxxx ', ' xxxhhxxx ', ' xxxxxxxx ', '          ',
  ],
};

/** Arte estático: cada objeto pertenece al contenedor y se destruye con él. */
export class BarrioArt {
  constructor(private readonly scene: Phaser.Scene) {}

  panel(
    root: Phaser.GameObjects.Container, x: number, y: number, w: number, h: number,
    accent: number = VISUAL.edge, alpha: number = 1,
  ): void {
    const g = this.graphics(root);
    g.fillStyle(VISUAL.ink, 0.65 * alpha).fillRect(x + 4, y + 4, w, h);
    g.fillStyle(VISUAL.panel, alpha).fillRect(x, y, w, h);
    g.lineStyle(1, VISUAL.edge, 0.8 * alpha).strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    g.lineStyle(1, 0xa77d60, 0.22 * alpha).lineBetween(x + 3, y + 3, x + w - 3, y + 3);
    g.lineStyle(1, VISUAL.ink, 0.5 * alpha).lineBetween(x + 3, y + h - 3, x + w - 3, y + h - 3);
    g.fillStyle(accent, 0.9 * alpha).fillRect(x + 1, y + 8, 3, Math.min(24, Math.max(0, h - 16)));
    g.fillStyle(accent, 0.6 * alpha);
    for (const [cx, cy] of [[x + 4, y + 4], [x + w - 6, y + 4], [x + 4, y + h - 6], [x + w - 6, y + h - 6]]) {
      g.fillRect(cx, cy, 2, 2);
    }
  }

  icon(
    root: Phaser.GameObjects.Container, kind: IconKind, x: number, y: number,
    size: number = 20, color: number = VISUAL.gold,
  ): void {
    const g = this.graphics(root);
    const pixel = Math.max(1, Math.round(size / 10));
    const left = Math.round(x - pixel * 5);
    const top = Math.round(y - pixel * 5);
    const colors: Record<string, number> = { x: color, s: VISUAL.edge, h: 0xfff0d2, l: VISUAL.green };
    for (const [rowIndex, row] of GLYPHS[kind].entries()) {
      for (let col = 0; col < row.length; col += 1) {
        const fill = colors[row[col]];
        if (fill === undefined) continue;
        g.fillStyle(fill, 1).fillRect(left + col * pixel, top + rowIndex * pixel, pixel, pixel);
      }
    }
  }

  halo(root: Phaser.GameObjects.Container, x: number, y: number, w: number, h: number, color: number): void {
    const g = this.graphics(root);
    g.fillStyle(color, 0.045).fillEllipse(x, y, w, h, 32);
    g.fillStyle(color, 0.065).fillEllipse(x, y, w * 0.72, h * 0.72, 32);
    g.fillStyle(color, 0.08).fillEllipse(x, y, w * 0.44, h * 0.44, 24);
  }

  /** El ring queda detrás de los luchadores y dentro de la región reservada. */
  ring(root: Phaser.GameObjects.Container): void {
    const g = this.graphics(root);
    g.fillStyle(0x221c23, 0.65).fillRect(22, 198, 916, 165);
    g.fillStyle(0x6b5148, 0.28).fillRect(22, 302, 916, 61);
    g.fillStyle(0x806456, 0.25).fillPoints([
      { x: 91, y: 302 }, { x: 868, y: 302 }, { x: 938, y: 363 }, { x: 22, y: 363 },
    ], true);
    g.lineStyle(1, 0xb39670, 0.14);
    for (const floorY of [317, 337, 361]) g.lineBetween(22, floorY, 938, floorY);
    for (const backX of [180, 330, 480, 630, 780]) {
      g.lineBetween(backX, 302, 480 + (backX - 480) * 1.18, 363);
    }
    // Cuerdas traseras: se dibujan antes de los cuerpos para no tapar las poses.
    for (const ropeY of [238, 264, 291]) {
      g.lineStyle(4, VISUAL.ink, 0.6).lineBetween(69, ropeY + 2, 891, ropeY + 2);
      g.lineStyle(2, ropeY === 264 ? VISUAL.red : 0xb7a083, 0.45).lineBetween(69, ropeY, 891, ropeY);
    }
    for (const postX of [65, 887]) {
      g.fillStyle(VISUAL.ink, 1).fillRect(postX - 3, 225, 15, 88);
      g.fillStyle(VISUAL.edge, 1).fillRect(postX, 226, 9, 85);
      g.fillStyle(VISUAL.gold, 0.5).fillRect(postX, 226, 3, 85);
      g.fillStyle(VISUAL.red, 0.85).fillRect(postX - 3, 236, 15, 13);
      g.fillStyle(VISUAL.red, 0.85).fillRect(postX - 3, 262, 15, 13);
      g.fillStyle(VISUAL.red, 0.85).fillRect(postX - 3, 289, 15, 13);
    }
    // Sombras anclan ambos combatientes al suelo sin efectos de postprocesado.
    g.fillStyle(VISUAL.ink, 0.55).fillEllipse(265, 345, 137, 18, 24);
    g.fillStyle(VISUAL.ink, 0.55).fillEllipse(705, 345, 137, 18, 24);
    g.lineStyle(2, VISUAL.gold, 0.15).lineBetween(22, 362, 938, 362);
  }

  private graphics(root: Phaser.GameObjects.Container): Phaser.GameObjects.Graphics {
    const graphics = this.scene.add.graphics();
    root.add(graphics);
    return graphics;
  }
}
