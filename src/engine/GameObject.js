/**
 * GameObject
 * ---------------------------------------------------------------------------
 * Base class for anything that lives in the game world: the player, vehicles,
 * and later logs, power-ups, particles...
 *
 * It provides:
 *   - a position and size (x, y, width, height) in canvas pixels
 *   - an optional Sprite to draw
 *   - a collision box ("hitbox") that can be smaller than the picture
 *   - update(dt) / render(ctx), which subclasses override
 *
 * Subclasses should call super.update(dt) / super.render(ctx) when they want
 * the default sprite behaviour, or replace them entirely.
 */
export class GameObject {
  /**
   * @param {object} options
   * @param {number} [options.x=0]
   * @param {number} [options.y=0]
   * @param {number} [options.width=0]
   * @param {number} [options.height=0]
   * @param {import('./Sprite.js').Sprite|null} [options.sprite=null]
   * @param {number} [options.hitboxPadding=0]  Pixels trimmed from every side
   *        of the picture to get the collision box. Bigger = more forgiving.
   */
  constructor({ x = 0, y = 0, width = 0, height = 0, sprite = null, hitboxPadding = 0 } = {}) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.sprite = sprite;
    this.hitboxPadding = hitboxPadding;

    /** Inactive objects are skipped by collision checks. */
    this.active = true;
  }

  /** Advance this object by `dt` seconds. */
  update(dt) {
    if (this.sprite) this.sprite.update(dt);
  }

  /** Draw this object. */
  render(ctx) {
    if (this.sprite) this.sprite.draw(ctx, this.x, this.y, this.width, this.height);
  }

  /** The collision rectangle in world coordinates. */
  getBounds() {
    const p = this.hitboxPadding;
    return {
      x: this.x + p,
      y: this.y + p,
      width: Math.max(0, this.width - p * 2),
      height: Math.max(0, this.height - p * 2),
    };
  }

  /** Draws the collision box. Toggled with the H key in the Frogger game. */
  renderDebug(ctx) {
    const b = this.getBounds();
    ctx.save();
    ctx.strokeStyle = '#ff3b6b';
    ctx.lineWidth = 2;
    ctx.strokeRect(b.x, b.y, b.width, b.height);
    ctx.restore();
  }
}
