import { GameObject } from '../engine/GameObject.js';
import { Sprite } from '../engine/Sprite.js';
import { CANVAS_WIDTH } from './config.js';

/**
 * Vehicle (cars, taxis, trucks)
 * ---------------------------------------------------------------------------
 * Drives in a straight line at a constant speed and WRAPS around: when it has
 * completely left one side of the screen it re-enters from the other.
 *
 * Wrapping uses subtraction/addition of the loop length instead of snapping to
 * an exact edge. That keeps the spacing between vehicles in a lane perfectly
 * even, because any "overshoot" past the edge is preserved.
 */
export class Vehicle extends GameObject {
  /**
   * @param {object} options
   * @param {HTMLImageElement} options.image
   * @param {number} options.x
   * @param {number} options.y
   * @param {number} options.width
   * @param {number} options.height
   * @param {1|-1}   options.direction  +1 = right, -1 = left
   * @param {number} options.speed      Pixels per second (always positive).
   * @param {number} [options.hitboxPadding]
   */
  constructor({ image, x, y, width, height, direction, speed, hitboxPadding = 0 }) {
    super({ x, y, width, height, hitboxPadding, sprite: new Sprite(image) });
    this.direction = direction;
    this.speed = speed;
  }

  update(dt) {
    this.x += this.direction * this.speed * dt;
    this._wrap();
  }

  render(ctx) {
    // Artwork faces right, so mirror it for vehicles driving left.
    this.sprite.draw(ctx, this.x, this.y, this.width, this.height, {
      flipX: this.direction < 0,
    });
  }

  _wrap() {
    const loopLength = CANVAS_WIDTH + this.width; // distance from "just off left" to "just off right"
    if (this.direction > 0 && this.x > CANVAS_WIDTH) {
      this.x -= loopLength;                       // left the right edge -> re-enter from the left
    } else if (this.direction < 0 && this.x + this.width < 0) {
      this.x += loopLength;                       // left the left edge -> re-enter from the right
    }
  }
}
