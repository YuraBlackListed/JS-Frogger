# Frogger (vanilla JS + HTML5 Canvas)

A small, readable Frogger built to show a clean **engine / game** split.
No build step, no dependencies, no framework.

## Run it

The code uses ES modules, which browsers refuse to load from `file://`.
Serve the folder over http instead. Any of these works:

```bash
python3 -m http.server 8000     # then open http://localhost:8000
# or
npm start                       # uses `npx serve`, no install needed
# or
# VS Code: install "Live Server", right-click index.html -> Open with Live Server
```

**Controls:** arrow keys or WASD to hop, `P` pause, `H` show hitboxes and FPS, `Enter` restart after game over.

## Folder structure

```
frogger/
├── index.html                 Page + <canvas>, loads src/main.js
├── assets/sprites/            PNG art (sprite strips and 16px tiles)
├── tools/generate_sprites.py  Regenerates the placeholder art (needs Pillow)
└── src/
    ├── main.js                Entry point: load assets, create Game, start
    ├── engine/                REUSABLE core. Knows nothing about Frogger.
    │   ├── GameLoop.js        requestAnimationFrame loop, delta time
    │   ├── InputHandler.js    Held keys vs. "just pressed" keys
    │   ├── GameObject.js      Base class: position, size, sprite, hitbox
    │   ├── Sprite.js          Draws images/sprite strips, flip and rotate
    │   ├── AssetLoader.js     Loads images before the game starts
    │   └── Collision.js       AABB rectangle overlap tests
    └── game/                  FROGGER-SPECIFIC logic
        ├── config.js          Grid size, keys, speeds, lane layout, rules
        ├── assets.js          Image manifest (name -> file)
        ├── Game.js            Rules + state machine (the "conductor")
        ├── Player.js          Frog: grid hops, input buffer, death
        ├── Vehicle.js         Moving vehicle with wrap-around
        ├── Lane.js            Builds and updates one lane of traffic
        ├── Background.js      Pre-renders the tile map once
        └── Hud.js             Score, lives, level, overlays
```

### The one rule

> **`engine/` must never import from `game/`.**

If a file in `engine/` needs to know what a frog is, the logic is in the wrong
place. Following this rule means the engine can be reused for the next game
(Pac-Man, Asteroids...) without changes.

## How a frame works

```
GameLoop (engine)
  └─ every frame:
       Game.update(dt)
         ├─ Player.update(dt)        read input, move/hop
         ├─ Lane.update(dt) x 8      vehicles drive and wrap
         ├─ score, collision, goal   the rules (Game.js)
         └─ input.endFrame()         clear "just pressed" keys
       Game.render()
         └─ background -> vehicles -> player -> HUD
```

`dt` is seconds since the last frame. Always write movement as
`speed * dt` (pixels per second), never "pixels per frame".

## Sprites

* All art is PNG, drawn at **16 px per tile** and scaled 3x to 48 px with
  `imageSmoothingEnabled = false`, which keeps the pixels sharp.
* `frog.png` is a horizontal strip of square frames: `idle | hop | dead`.
  Frame numbers are named in `Player.js` (`FRAME`).
* Vehicles are drawn **facing right**; `Vehicle.render` mirrors them for
  left-driving lanes.
* A `Sprite` can also animate itself: `new Sprite(image, { frameWidth: 16, fps: 8 })`
  cycles through the strip.

### Swapping in real art

1. Overwrite the PNGs in `assets/sprites/` (same file names).
2. Keep the proportions: a 2-tile car is `32x16`, a 3-tile truck `48x16`, tiles `16x16`.
   Different pixel sizes also work. The image is stretched to fit the object's box.
3. If you add a new file, add one line to `src/game/assets.js`.

## Extending the game (recipes)

**Add a new vehicle type**
1. Add `bus.png` to `assets/sprites/` and a line to `assets.js`.
2. Add `bus: { image: 'bus', tilesWide: 4, hitboxPadding: 6 }` to `VEHICLE_TYPES` in `config.js`.
3. Use `vehicle: 'bus'` in any `LANES` entry. No logic code to change.

**Change difficulty or layout**
Edit `LANES` (speed, count, direction), `RULES.speedIncreasePerLevel`, or
`PLAYER.hitboxPadding` in `config.js`. Add or remove rows by changing `ROWS`
and `ROW_TILES`.

**Add a river with logs** (the next classic Frogger feature)
1. Add a `water` tile and rows to `ROW_TILES`; add a `log.png`.
2. Create `Log extends Vehicle`, or its own `Platform` class, in `src/game/`.
3. In `Game._updatePlaying`:
   * if the frog is on a water row and `findCollision(player, logs)` is `null`, call `_killPlayer()`;
   * if it is on a log, carry it: `player.x += log.direction * log.speed * dt`.
   (`Player` will need to track `x` without snapping to a tile while riding.)

**Add sound**
Create `src/engine/AudioManager.js` (load and play `Audio` objects by name),
then call it from `Game` on hop, death and level complete. Browsers only allow
audio after a user gesture, so start it from the first key press.

**Add a title screen / more states**
`Game.js` already has a small state machine (`State.PLAYING`, `DYING`,
`PAUSED`, `GAME_OVER`). Add a state, handle it in `_step()` and `_overlay()`.
If it grows, split states into their own classes under `src/game/states/`.

**Add a new engine feature**
Ask: "would the next game need this too?" If yes, put it in `engine/` with no
Frogger names in it. If it mentions frogs, lanes or scores, it belongs in `game/`.

## Debugging tips

* Press `H` to draw hitboxes and show FPS.
* `window.game` is exposed, so in the browser console you can try
  `game.lives = 9`, `game.player.reset()` or `game.vehicles[0].speed = 400`.
* The collision box is the sprite box shrunk by `hitboxPadding` on every side.
  If a hit feels unfair, tweak the padding rather than the sprite.

## Suggested team conventions

* One class per file, file name = class name.
* Constants and tunable numbers go in `config.js`, not inside classes.
* Keep `Game.js` about the *rules*; keep movement and drawing inside the object classes.
* Add JSDoc comments (`/** ... */`) on public methods. Editors then show hints, and new teammates can read the code like documentation.
