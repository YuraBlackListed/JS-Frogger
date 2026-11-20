/**
 * Sprite
 * ---------------------------------------------------------------------------
 * Wraps an Image and knows how to draw it. Handles:
 *   - sprite SHEETS: several equally sized frames laid out in one horizontal
 *     strip (frog.png is 3 frames: idle | hop | dead)
 *   - optional automatic frame animation (fps > 0)
 *   - flipping and rotating when drawing
 *
 * A Sprite holds per-object state (the current frame), so create one Sprite
 * per GameObject. The underlying Image is shared and cheap.
 *
 * Tip: for pixel art, set `ctx.imageSmoothingEnabled = false` once on the
 * canvas context, otherwise scaled-up sprites look blurry.
 */
export class Sprite {
  /**
   * @param {HTMLImageElement} image
   * @param {object} [options]
   * @param {number} [options.frameWidth=image.width]   Width of one frame.
   * @param {number} [options.frameHeight=image.height] Height of one frame.
   * @param {number} [options.fps=0]  Auto-animation speed. 0 = manual frames.
   */
  constructor(image, { frameWidth = image.width, frameHeight = image.height, fps = 0 } = {}) {
    this.image = image;
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.frameCount = Math.max(1, Math.floor(image.width / frameWidth));
    this.fps = fps;
    this.frame = 0;
    this._timer = 0;
  }

  /** Jump to a specific frame (0-based). */
  setFrame(index) {
    this.frame = Math.max(0, Math.min(index, this.frameCount - 1));
  }

  /** Advances the animation. Does nothing when fps is 0. */
  update(dt) {
    if (this.fps <= 0 || this.frameCount < 2) return;
    this._timer += dt;
    const frameTime = 1 / this.fps;
    while (this._timer >= frameTime) {
      this._timer -= frameTime;
      this.frame = (this.frame + 1) % this.frameCount;
    }
  }

  /**
   * Draw the current frame into the box (x, y, width, height).
   * @param {CanvasRenderingContext2D} ctx
   * @param {object} [options]
   * @param {boolean} [options.flipX=false]  Mirror horizontally.
   * @param {number}  [options.rotation=0]   Radians, around the box centre.
   */
  draw(ctx, x, y, width, height, { flipX = false, rotation = 0 } = {}) {
    ctx.save();
    ctx.translate(x + width / 2, y + height / 2); // pivot = centre of the box
    if (rotation) ctx.rotate(rotation);
    if (flipX) ctx.scale(-1, 1);
    ctx.drawImage(
      this.image,
      this.frame * this.frameWidth, 0, this.frameWidth, this.frameHeight, // source rect
      -width / 2, -height / 2, width, height                              // destination rect
    );
    ctx.restore();
  }
}
