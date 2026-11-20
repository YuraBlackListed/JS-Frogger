import { findCollision } from '../engine/Collision.js';
import { GameLoop } from '../engine/GameLoop.js';
import { InputHandler } from '../engine/InputHandler.js';
import { Background } from './Background.js';
import { CANVAS_HEIGHT, CANVAS_WIDTH, GOAL_ROW, KEYS, LANES, RULES } from './config.js';
import { Hud } from './Hud.js';
import { Lane } from './Lane.js';
import { Player } from './Player.js';

/** The game is always in exactly one of these states. */
const State = Object.freeze({
  PLAYING: 'playing',
  DYING: 'dying',       // splat is showing, traffic keeps moving
  PAUSED: 'paused',
  GAME_OVER: 'gameOver',
});

/**
 * Game
 * ---------------------------------------------------------------------------
 * The "conductor". It owns the engine pieces (loop, input) and the game
 * objects (player, lanes), and applies the RULES of Frogger:
 *
 *   each frame:  read input -> update objects -> check collisions -> check goal
 *
 * Rule of thumb for the team:
 *   - how something MOVES or LOOKS  -> its own class (Player, Vehicle)
 *   - how objects INTERACT / scoring -> here
 */
export class Game {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {import('../engine/AssetLoader.js').AssetLoader} assets  Already loaded.
   */
  constructor(canvas, assets) {
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false; // crisp pixel art

    // Engine systems
    this.input = new InputHandler();
    this.loop = new GameLoop({
      update: (dt) => this.update(dt),
      render: () => this.render(),
    });

    // Game objects
    this.background = new Background(assets);
    this.hud = new Hud(assets.getImage('frog'));
    this.player = new Player({ image: assets.getImage('frog'), input: this.input });
    this.lanes = LANES.map((definition) => new Lane(definition, assets));
    this.vehicles = this.lanes.flatMap((lane) => lane.vehicles); // flat list for collision checks

    this.showDebug = false;
    this.newGame();
  }

  start() {
    this.loop.start();
  }

  // ---- state management ------------------------------------------------------

  newGame() {
    this.score = 0;
    this.lives = RULES.lives;
    this.level = 1;
    this.state = State.PLAYING;
    this.banner = null; // { text, timer }
    this._applyDifficulty();
    this._resetRound();
  }

  /** Put the frog back at the start (after a death or a completed level). */
  _resetRound() {
    this.player.reset();
    this.bestRow = this.player.row; // furthest-up row reached this round, for scoring
  }

  _applyDifficulty() {
    const multiplier = 1 + (this.level - 1) * RULES.speedIncreasePerLevel;
    for (const lane of this.lanes) lane.setSpeedMultiplier(multiplier);
  }

  // ---- update ----------------------------------------------------------------

  update(dt) {
    this._step(dt);
    this.input.endFrame(); // always last: forget this frame's "just pressed" keys
  }

  _step(dt) {
    if (this.input.wasPressed(...KEYS.debug)) this.showDebug = !this.showDebug;

    if (this.banner) {
      this.banner.timer -= dt;
      if (this.banner.timer <= 0) this.banner = null;
    }

    switch (this.state) {
      case State.PLAYING:
        return this._updatePlaying(dt);
      case State.DYING:
        return this._updateDying(dt);
      case State.PAUSED:
        if (this.input.wasPressed(...KEYS.pause)) this.state = State.PLAYING;
        return;
      case State.GAME_OVER:
        if (this.input.wasPressed(...KEYS.restart)) this.newGame();
        return;
    }
  }

  _updatePlaying(dt) {
    if (this.input.wasPressed(...KEYS.pause)) {
      this.state = State.PAUSED;
      return;
    }

    this.player.update(dt);
    for (const lane of this.lanes) lane.update(dt);

    // 1. Score for reaching a new row (row numbers shrink as the frog goes up).
    if (this.player.row < this.bestRow) {
      this.score += (this.bestRow - this.player.row) * RULES.stepScore;
      this.bestRow = this.player.row;
    }

    // 2. Did a vehicle hit the frog?
    if (findCollision(this.player, this.vehicles)) {
      this._killPlayer();
      return;
    }

    // 3. Did the frog finish its hop onto the goal row?
    if (this.player.row === GOAL_ROW && !this.player.isHopping) {
      this._completeLevel();
    }
  }

  _updateDying(dt) {
    for (const lane of this.lanes) lane.update(dt); // the road does not stop for a dead frog

    this.deathTimer -= dt;
    if (this.deathTimer > 0) return;

    if (this.lives > 0) {
      this._resetRound();
      this.state = State.PLAYING;
    } else {
      this.state = State.GAME_OVER;
    }
  }

  _killPlayer() {
    this.player.die();
    this.lives -= 1;
    this.deathTimer = RULES.deathPauseSeconds;
    this.state = State.DYING;
  }

  _completeLevel() {
    this.score += RULES.goalScore;
    this.level += 1;
    this.banner = { text: `LEVEL ${this.level}`, timer: 1.2 };
    this._applyDifficulty();
    this._resetRound();
  }

  // ---- render ----------------------------------------------------------------

  render() {
    const ctx = this.ctx;

    this.background.render(ctx);
    for (const lane of this.lanes) lane.render(ctx);
    this.player.render(ctx); // drawn after traffic so the splat is visible on top

    if (this.showDebug) {
      for (const vehicle of this.vehicles) vehicle.renderDebug(ctx);
      this.player.renderDebug(ctx);
    }

    this.hud.render(ctx, {
      score: this.score,
      lives: this.lives,
      level: this.level,
      banner: this.banner ? this.banner.text : null,
      overlay: this._overlay(),
      fps: this.showDebug ? this.loop.fps : null,
    });
  }

  _overlay() {
    if (this.state === State.PAUSED) {
      return { title: 'PAUSED', subtitle: 'Press P to keep hopping' };
    }
    if (this.state === State.GAME_OVER) {
      return { title: 'GAME OVER', subtitle: `Score ${this.score}. Press Enter to play again` };
    }
    return null;
  }
}
