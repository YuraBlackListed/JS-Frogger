/**
 * InputHandler
 * ---------------------------------------------------------------------------
 * Turns browser keyboard events into something easy to query from game code.
 *
 * It tracks two different things:
 *   - isDown(...)      true for as long as a key is HELD.
 *   - wasPressed(...)  true only on the frame a key went down (a "tap").
 *
 * Keys are identified by `event.code` ("ArrowUp", "KeyW", "Space", ...), which
 * refers to the physical key and ignores the user's keyboard layout.
 *
 * Both methods accept several codes and return true if ANY of them match,
 * so action bindings like [ArrowUp, KeyW] are one-liners:
 *     input.wasPressed('ArrowUp', 'KeyW')
 *
 * IMPORTANT: call endFrame() once at the end of each update, otherwise a
 * single tap would count as "pressed" forever.
 */

// Keys the browser would otherwise use to scroll the page.
const PREVENT_DEFAULT = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space']);

export class InputHandler {
  /** @param {EventTarget} [target=window] Where to listen for key events. */
  constructor(target = window) {
    this._target = target;
    this._down = new Set();
    this._pressed = new Set();

    this._onKeyDown = (event) => {
      if (PREVENT_DEFAULT.has(event.code)) event.preventDefault();
      if (!event.repeat) this._pressed.add(event.code); // ignore OS key-repeat
      this._down.add(event.code);
    };
    this._onKeyUp = (event) => this._down.delete(event.code);

    // If the window loses focus we never receive keyup, so keys would stay
    // "stuck". Clearing everything on blur avoids a frog that runs away.
    this._onBlur = () => {
      this._down.clear();
      this._pressed.clear();
    };

    target.addEventListener('keydown', this._onKeyDown);
    target.addEventListener('keyup', this._onKeyUp);
    window.addEventListener('blur', this._onBlur);
  }

  /** Is ANY of these keys currently held? */
  isDown(...codes) {
    return codes.some((code) => this._down.has(code));
  }

  /** Did ANY of these keys go down since the last endFrame()? */
  wasPressed(...codes) {
    return codes.some((code) => this._pressed.has(code));
  }

  /** Call once per frame, after all game logic has read the input. */
  endFrame() {
    this._pressed.clear();
  }

  /** Remove listeners (useful if you ever tear a game down and rebuild it). */
  destroy() {
    this._target.removeEventListener('keydown', this._onKeyDown);
    this._target.removeEventListener('keyup', this._onKeyUp);
    window.removeEventListener('blur', this._onBlur);
  }
}
