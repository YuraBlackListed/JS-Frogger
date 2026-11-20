/**
 * GameLoop
 * ---------------------------------------------------------------------------
 * Drives the game. Once per screen refresh it calls:
 *     update(dt)  -> advance the game state
 *     render()    -> draw the current state
 *
 * "dt" (delta time) is the number of SECONDS since the previous frame.
 * Always scale movement by dt so speed does not depend on frame rate:
 *
 *     this.x += this.speed * dt;      // speed is in pixels per second
 *
 * A 60 Hz and a 144 Hz monitor then move objects at the same real-world speed.
 */
export class GameLoop {
  /**
   * @param {object} options
   * @param {(dt: number) => void} options.update  Advance game state.
   * @param {() => void}           options.render  Draw the current state.
   * @param {number} [options.maxDelta=0.1]        Longest dt allowed (seconds).
   */
  constructor({ update, render, maxDelta = 0.1 }) {
    this.update = update;
    this.render = render;

    // If the tab was in the background (or the machine hiccuped) the next
    // frame could report a huge dt and objects would teleport. We clamp it.
    this.maxDelta = maxDelta;

    this.running = false;
    this.fps = 0; // smoothed frames-per-second, handy for a debug overlay

    this._lastTime = 0;
    this._rafId = 0;
    this._tick = this._tick.bind(this); // keep `this` correct inside requestAnimationFrame
  }

  start() {
    if (this.running) return;
    this.running = true;
    this._lastTime = performance.now();
    this._rafId = requestAnimationFrame(this._tick);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this._rafId);
  }

  /** Called by the browser before every repaint. `now` is in milliseconds. */
  _tick(now) {
    if (!this.running) return;

    const rawDt = Math.max(0, (now - this._lastTime) / 1000);
    this._lastTime = now;
    const dt = Math.min(rawDt, this.maxDelta);

    if (rawDt > 0) this.fps = this.fps * 0.9 + (1 / rawDt) * 0.1;

    this.update(dt);
    this.render();

    this._rafId = requestAnimationFrame(this._tick);
  }
}
