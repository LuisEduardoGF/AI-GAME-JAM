import type Phaser from 'phaser';

export type Place = 'shop' | 'gym' | 'home' | 'neighborhood';

export const PLACES = [
  { id: 'shop', label: 'PUESTO', title: 'PUESTO DE PATATA' },
  { id: 'gym', label: 'GIMNASIO', title: 'GIMNASIO DEL BARRIO' },
  { id: 'home', label: 'CASA', title: 'TU CASA' },
  { id: 'neighborhood', label: 'BARRIO', title: 'BARRIO VIEJO' },
] as const satisfies readonly { id: Place; label: string; title: string }[];

const COLORS = {
  coal: 0x211916,
  wood: 0x554338,
  brass: 0xb87946,
  cream: 0xf5e5c8,
  fire: 0xd9533b,
};

const BACKGROUNDS: Record<Exclude<Place, 'home'>, string> = {
  shop: 'shop-interior',
  gym: 'gym-interior',
  neighborhood: 'market-alley',
};

function drawHome(graphics: Phaser.GameObjects.Graphics): void {
  graphics.fillStyle(COLORS.brass).fillRect(0, 0, 320, 117);
  graphics.fillStyle(COLORS.wood, 0.22);
  for (let y = 13; y < 117; y += 26) graphics.fillRect(0, y, 320, 1);
  graphics.fillStyle(COLORS.wood).fillRect(0, 117, 320, 63);
  graphics.fillStyle(COLORS.coal, 0.35);
  for (let y = 132; y < 180; y += 16) graphics.fillRect(0, y, 320, 1);
  for (let x = 20; x < 320; x += 48) graphics.fillRect(x, 117, 1, 63);
  graphics.fillStyle(COLORS.coal).fillRect(0, 114, 320, 4);

  // A small window and bedside lamp give the room its own silhouette.
  graphics.fillStyle(COLORS.coal).fillRect(27, 42, 49, 41);
  graphics.fillStyle(COLORS.cream).fillRect(30, 45, 43, 35);
  graphics.fillStyle(COLORS.wood).fillRect(33, 48, 37, 29);
  graphics.fillStyle(COLORS.brass).fillRect(34, 63, 35, 13);
  graphics.fillStyle(COLORS.cream).fillRect(50, 45, 3, 35).fillRect(30, 61, 43, 3);
  graphics.fillStyle(COLORS.coal).fillRect(23, 82, 57, 3);

  graphics.fillStyle(COLORS.coal).fillRect(115, 127, 10, 22);
  graphics.fillStyle(COLORS.brass).fillRect(116, 128, 8, 12);
  graphics.fillStyle(COLORS.cream).fillRect(119, 104, 2, 21).fillRect(114, 106, 12, 7);
  graphics.fillStyle(COLORS.fire).fillRect(115, 103, 10, 4);
  graphics.fillStyle(COLORS.coal).fillRect(126, 120, 37, 30);
  graphics.fillStyle(COLORS.brass).fillRect(128, 122, 33, 24);
  graphics.fillStyle(COLORS.cream).fillRect(129, 124, 31, 16);
  graphics.fillStyle(COLORS.wood).fillRect(142, 124, 18, 16);
  graphics.fillStyle(COLORS.fire).fillRect(142, 127, 18, 3);
  graphics.fillStyle(COLORS.coal).fillRect(126, 145, 4, 6).fillRect(159, 145, 4, 6);
}

function drawProp(graphics: Phaser.GameObjects.Graphics, place: Place): void {
  if (place === 'shop') {
    graphics.fillStyle(COLORS.coal, 0.45).fillEllipse(141, 148, 45, 6);
    graphics.fillStyle(COLORS.coal).fillRect(118, 128, 45, 20);
    graphics.fillStyle(COLORS.brass).fillRect(120, 130, 41, 16);
    graphics.fillStyle(COLORS.wood).fillRect(123, 130, 3, 16).fillRect(137, 130, 3, 16).fillRect(153, 130, 3, 16);
    graphics.fillStyle(COLORS.coal).fillRect(118, 136, 45, 2);
    graphics.fillStyle(COLORS.cream).fillEllipse(129, 126, 11, 8).fillEllipse(140, 124, 12, 9).fillEllipse(152, 126, 11, 8);
    graphics.fillStyle(COLORS.wood).fillRect(128, 124, 2, 2).fillRect(140, 122, 2, 2).fillRect(151, 125, 2, 2);
  } else if (place === 'gym') {
    graphics.fillStyle(COLORS.coal, 0.45).fillEllipse(141, 149, 33, 6);
    graphics.fillStyle(COLORS.coal).fillRect(139, 87, 3, 23).fillRect(126, 110, 30, 34);
    graphics.fillStyle(COLORS.fire).fillRect(129, 112, 24, 30);
    graphics.fillStyle(COLORS.brass).fillRect(129, 114, 3, 26);
    graphics.fillStyle(COLORS.wood).fillRect(148, 112, 5, 30);
    graphics.fillStyle(COLORS.cream).fillRect(129, 123, 24, 3);
    graphics.fillStyle(COLORS.coal).fillRect(131, 143, 20, 3);
  } else if (place === 'neighborhood') {
    graphics.fillStyle(COLORS.coal, 0.45).fillEllipse(140, 149, 32, 6);
    graphics.fillStyle(COLORS.coal).fillRect(128, 112, 24, 28).fillRect(132, 139, 5, 10).fillRect(145, 139, 5, 10);
    graphics.fillStyle(COLORS.cream).fillRect(130, 116, 20, 21);
    graphics.fillStyle(COLORS.wood).fillRect(127, 120, 4, 13).fillRect(150, 120, 4, 13);
    graphics.fillStyle(COLORS.coal).fillRect(131, 92, 19, 23);
    graphics.fillStyle(COLORS.brass).fillRect(133, 94, 15, 19);
    graphics.fillStyle(COLORS.coal).fillRect(129, 90, 23, 5).fillRect(128, 95, 25, 2);
    graphics.fillStyle(COLORS.cream).fillRect(136, 100, 2, 2).fillRect(144, 100, 2, 2);
    graphics.fillStyle(COLORS.wood).fillRect(139, 107, 6, 1);
    graphics.fillStyle(COLORS.fire).fillRect(132, 113, 17, 3).fillRect(145, 116, 3, 9);
  }
}

export function drawPlace(scene: Phaser.Scene, place: Place): { player: Phaser.GameObjects.Image } {
  const decor = scene.add.graphics();
  if (place === 'home') drawHome(decor);
  else {
    scene.add.image(160, 90, BACKGROUNDS[place]).setDisplaySize(320, 180);
    // Place the foreground graphics above the image in the scene's display list.
    scene.children.bringToTop(decor);
  }

  drawProp(decor, place);
  decor.fillStyle(COLORS.coal, 0.5).fillEllipse(62, 148, 32, 7);
  decor.fillStyle(COLORS.coal, 0.18).fillEllipse(62, 148, 42, 9);
  const player = scene.add.image(62, 148, 'patata-boxer').setOrigin(0.5, 1).setDisplaySize(39, 47);

  const shade = scene.add.graphics();
  for (let y = 0; y < 84; y++) {
    shade.fillStyle(COLORS.coal, 0.88 * (1 - y / 84)).fillRect(0, y, 320, 1);
  }
  for (let y = 153; y < 180; y++) {
    shade.fillStyle(COLORS.coal, 0.4 + 0.5 * (y - 153) / 27).fillRect(0, y, 320, 1);
  }
  scene.add.rectangle(247, 119, 132, 64, COLORS.coal, 0.86).setStrokeStyle(1, COLORS.brass, 0.85);
  return { player };
}
