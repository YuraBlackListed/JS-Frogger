/**
 * Image manifest: { name: path }. Paths are relative to index.html.
 * To add art, drop a PNG into assets/sprites/ and add a line here.
 */
const DIR = 'assets/sprites/';

export const IMAGE_MANIFEST = {
  // Characters and vehicles
  frog: `${DIR}frog.png`,         // 3-frame strip: idle | hop | dead
  carRed: `${DIR}carRed.png`,
  carBlue: `${DIR}carBlue.png`,
  taxi: `${DIR}taxi.png`,
  truck: `${DIR}truck.png`,

  // Background tiles
  grass: `${DIR}grass.png`,
  road: `${DIR}road.png`,
  roadLine: `${DIR}roadLine.png`,
  pavement: `${DIR}pavement.png`,
  hedge: `${DIR}hedge.png`,
};

/** Same names as IMAGE_MANIFEST, but the files come from assets/sprites/christmas/. */
export const CHRISTMAS_MANIFEST = {};
for (const [name, path] of Object.entries(IMAGE_MANIFEST)) {
  CHRISTMAS_MANIFEST[name] = path.replace(DIR, `${DIR}christmas/`);
}

/** Graphic themes the player can choose on the start screen. */
export const THEMES = [
  { name: 'Classic', manifest: IMAGE_MANIFEST },
  { name: 'Christmas', manifest: CHRISTMAS_MANIFEST },
];