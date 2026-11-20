import { CANVAS_HEIGHT, CANVAS_WIDTH, COLS, ROW_TILES, TILE_SIZE } from './config.js';

/**
 * Background
 * ---------------------------------------------------------------------------
 * The background never changes, so we paint all its tiles ONCE onto a hidden
 * canvas and then copy that single picture every frame. Drawing 143 tiles
 * every frame would work, but this is a cheap and common optimisation.
 */
export class Background {
  /** @param {import('../engine/AssetLoader.js').AssetLoader} assets */
  constructor(assets) {
    this._canvas = document.createElement('canvas');
    this._canvas.width = CANVAS_WIDTH;
    this._canvas.height = CANVAS_HEIGHT;

    const ctx = this._canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false; // keep pixel art crisp when scaled

    ROW_TILES.forEach((tileName, row) => {
      const tile = assets.getImage(tileName);
      for (let col = 0; col < COLS; col++) {
        ctx.drawImage(tile, col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    });
  }

  render(ctx) {
    ctx.drawImage(this._canvas, 0, 0);
  }
}
