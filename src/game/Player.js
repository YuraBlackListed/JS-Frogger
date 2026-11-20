import { GameObject } from '../engine/GameObject.js';
import { Sprite } from '../engine/Sprite.js';
import { COLS, GOAL_ROW, KEYS, PLAYER, START_ROW, TILE_SIZE } from './config.js';

// Frame numbers inside the frog sprite strip (frog.png).
const FRAME = { IDLE: 0, HOP: 1, DEAD: 2 };

// The sprite artwork faces UP, so `angle` rotates it to face each direction.
const DIRECTIONS = {
  up: { dCol: 0, dRow: -1, angle: 0 },
  right: { dCol: 1, dRow: 0, angle: Math.PI / 2 },
  down: { dCol: 0, dRow: 1, angle: Math.PI },
  left: { dCol: -1, dRow: 0, angle: -Math.PI / 2 },
};

/**
 * Player (the frog)
 * ---------------------------------------------------------------------------
 * Grid-based movement with a smooth hop animation:
 *   - The frog always rests exactly on a tile (col, row).
 *   - A key press starts a short hop to the neighbouring tile; while hopping,
 *     x/y are interpolated between the two tiles.
 *   - If the player taps another direction mid-hop we remember it (a tiny
 *     "input buffer") and start that hop as soon as this one lands. This makes
 *     fast play feel responsive instead of dropping key presses.
 *
 * The Player only knows how to move itself. Winning, dying and scoring are
 * decided by Game, which keeps this class easy to reuse and test.
 */
export class Player extends GameObject {
  /**
   * @param {object} options
   * @param {HTMLImageElement} options.image  The frog sprite strip.
   * @param {import('../engine/InputHandler.js').InputHandler} options.input
   */
  constructor({ image, input }) {
    super({
      width: TILE_SIZE,
      height: TILE_SIZE,
      hitboxPadding: PLAYER.hitboxPadding,
      // Frames in the strip are square, so frame width = image height.
      sprite: new Sprite(image, { frameWidth: image.height, frameHeight: image.height }),
    });
    this.input = input;
    this.reset();
  }

  /** Put the frog back on the start tile, alive and facing up. */
  reset() {
    this.col = PLAYER.startCol;
    this.row = START_ROW;
    this.x = this.col * TILE_SIZE;
    this.y = this.row * TILE_SIZE;
    this.facing = 'up';
    this.dead = false;
    this._hop = null;     // data for the hop in progress, or null when resting
    this._queued = null;  // direction buffered during a hop
    this.sprite.setFrame(FRAME.IDLE);
  }

  get isHopping() {
    return this._hop !== null;
  }

  /** Called by Game when a vehicle hits us. */
  die() {
    this.dead = true;
    this._hop = null;
    this._queued = null;
    this.sprite.setFrame(FRAME.DEAD);
  }

  update(dt) {
    if (this.dead) return;

    const requested = this._readDirection();

    if (this._hop) {
      if (requested) this._queued = requested;
      this._advanceHop(dt);
    } else if (requested) {
      this._startHop(requested);
    }
  }

  render(ctx) {
    this.sprite.draw(ctx, this.x, this.y, this.width, this.height, {
      rotation: DIRECTIONS[this.facing].angle,
    });
  }

  // ---- internals -----------------------------------------------------------

  /** Which direction key was tapped this frame, if any. */
  _readDirection() {
    for (const name of Object.keys(DIRECTIONS)) {
      if (this.input.wasPressed(...KEYS[name])) return name;
    }
    return null;
  }

  _startHop(direction) {
    const d = DIRECTIONS[direction];
    this.facing = direction;

    // Stay inside the grid. Hopping into a wall just turns the frog.
    const toCol = Math.min(Math.max(this.col + d.dCol, 0), COLS - 1);
    const toRow = Math.min(Math.max(this.row + d.dRow, GOAL_ROW), START_ROW);
    if (toCol === this.col && toRow === this.row) return;

    this._hop = { fromX: this.x, fromY: this.y, toCol, toRow, elapsed: 0 };
    this.sprite.setFrame(FRAME.HOP);
  }

  _advanceHop(dt) {
    const hop = this._hop;
    hop.elapsed += dt;

    const t = Math.min(hop.elapsed / PLAYER.hopDuration, 1); // 0 -> 1 progress
    const eased = 1 - (1 - t) * (1 - t);                    // ease-out: quick start, soft landing
    const toX = hop.toCol * TILE_SIZE;
    const toY = hop.toRow * TILE_SIZE;
    this.x = hop.fromX + (toX - hop.fromX) * eased;
    this.y = hop.fromY + (toY - hop.fromY) * eased;

    if (t >= 1) {
      // Landed: snap exactly onto the tile so rounding errors never accumulate.
      this.col = hop.toCol;
      this.row = hop.toRow;
      this.x = toX;
      this.y = toY;
      this._hop = null;
      this.sprite.setFrame(FRAME.IDLE);

      if (this._queued) {
        const next = this._queued;
        this._queued = null;
        this._startHop(next);
      }
    }
  }
}
