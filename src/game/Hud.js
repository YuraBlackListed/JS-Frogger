import { CANVAS_HEIGHT, CANVAS_WIDTH, TILE_SIZE } from './config.js';

const FONT = '"Courier New", Courier, monospace';

/**
 * Hud (heads-up display)
 * ---------------------------------------------------------------------------
 * Draws score, level, remaining lives and overlay messages. It only DISPLAYS
 * values handed to it and owns no game state.
 */
export class Hud {
  /** @param {HTMLImageElement} frogImage Used to draw one frog icon per life. */
  constructor(frogImage) {
    this.frogImage = frogImage;
    this.frameSize = frogImage.height; // frames are square; frame 0 = idle
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {object} info
   * @param {number} info.score
   * @param {number} info.lives
   * @param {number} info.level
   * @param {string|null} info.banner   Short message in the middle (e.g. "LEVEL 2").
   * @param {{title:string, subtitle:string}|null} info.overlay  Full-screen message.
   * @param {number|null} info.fps      Shown only when not null (debug mode).
   */
  render(ctx, { score, lives, level, banner, overlay, fps }) {
    const barY = TILE_SIZE / 2; // the top bar sits on the hedge row

    this._text(ctx, `SCORE ${String(score).padStart(5, '0')}`, 14, barY, { size: 20 });
    this._text(ctx, `LEVEL ${level}`, CANVAS_WIDTH / 2, barY, { size: 20, align: 'center' });

    const icon = 28;
    for (let i = 0; i < lives; i++) {
      const x = CANVAS_WIDTH - 14 - (i + 1) * (icon + 4) + 4;
      ctx.drawImage(this.frogImage, 0, 0, this.frameSize, this.frameSize, x, barY - icon / 2, icon, icon);
    }

    if (fps !== null) {
      this._text(ctx, `${Math.round(fps)} FPS  (H: hitboxes)`, 10, CANVAS_HEIGHT - 12, { size: 14 });
    }

    if (banner) {
      this._text(ctx, banner, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, { size: 44, align: 'center' });
    }

    if (overlay) {
      ctx.fillStyle = 'rgba(8, 16, 12, 0.72)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      this._text(ctx, overlay.title, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 16, { size: 52, align: 'center' });
      this._text(ctx, overlay.subtitle, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 36, { size: 20, align: 'center' });
    }
  }

  /** Text with a 2px drop shadow so it stays readable on any background. */
  _text(ctx, text, x, y, { size = 20, align = 'left', color = '#f4fbe8' } = {}) {
    ctx.font = `bold ${size}px ${FONT}`;
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#0a140e';
    ctx.fillText(text, x + 2, y + 2);
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  }
}
