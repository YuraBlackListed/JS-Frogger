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
