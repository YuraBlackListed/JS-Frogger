/**
 * Frogger game configuration
 * ---------------------------------------------------------------------------
 * All the numbers you are likely to tweak live here, so designers can change
 * difficulty and layout without touching logic code.
 */

// ---- Grid ------------------------------------------------------------------
// The world is a grid of square tiles. Row 0 is the TOP of the screen.
export const TILE_SIZE = 48;                  // pixels per tile (art is drawn 16px and scaled 3x)
export const COLS = 13;
export const ROWS = 11;
export const CANVAS_WIDTH = COLS * TILE_SIZE;  // 624
export const CANVAS_HEIGHT = ROWS * TILE_SIZE; // 528
export const GOAL_ROW = 0;                     // reach this row to win the level
export const START_ROW = ROWS - 1;             // the frog begins here

/** What each row looks like. Names match keys in assets.js. */
export const ROW_TILES = [
  'hedge',                                   // 0  goal
  'road', 'roadLine', 'roadLine', 'roadLine', // 1-4  road (roadLine = dashed divider on top edge)
  'pavement',                                // 5  safe median
  'road', 'roadLine', 'roadLine', 'roadLine', // 6-9  road
  'grass',                                   // 10 start
];

// ---- Controls --------------------------------------------------------------
// Each action maps to one or more physical keys (KeyboardEvent.code).
export const KEYS = {
  up: ['ArrowUp', 'KeyW'],
  down: ['ArrowDown', 'KeyS'],
  left: ['ArrowLeft', 'KeyA'],
  right: ['ArrowRight', 'KeyD'],
  pause: ['KeyP', 'Escape'],
  restart: ['Enter'],
  debug: ['KeyH'],
  restart:['Enter'],
  start: ['Enter', 'Space'],

};

// ---- Player ----------------------------------------------------------------
export const PLAYER = {
  startCol: Math.floor(COLS / 2),
  hopDuration: 0.14,   // seconds for one hop between tiles
  hitboxPadding: 12,   // px trimmed per side: a 48px frog gets a 24px hitbox (forgiving)
};

// ---- Rules -----------------------------------------------------------------
export const RULES = {
  lives: 3,
  stepScore: 10,             // points for each new row reached
  goalScore: 100,            // bonus for reaching the goal
  deathPauseSeconds: 0.9,    // how long the splat stays on screen
  speedIncreasePerLevel: 0.15, // +15% traffic speed each level
};

// ---- Vehicles ----------------------------------------------------------------
// `image` is a key from assets.js. Sprites face RIGHT; the game flips them.
export const VEHICLE_TYPES = {
  carRed: { image: 'carRed', tilesWide: 2, hitboxPadding: 6 },
  carBlue: { image: 'carBlue', tilesWide: 2, hitboxPadding: 6 },
  taxi: { image: 'taxi', tilesWide: 2, hitboxPadding: 6 },
  truck: { image: 'truck', tilesWide: 3, hitboxPadding: 6 },
};

// ---- Lanes -----------------------------------------------------------------
// One entry per lane of traffic. Add, remove or edit entries to redesign the level.
//   row        which grid row the lane occupies
//   vehicle    a key of VEHICLE_TYPES
//   direction  +1 = drives right, -1 = drives left
//   speed      pixels per second at level 1
//   count      how many vehicles share the lane (evenly spaced)
//   offset     optional pixel shift so lanes do not line up
export const LANES = [
  { row: 1, vehicle: 'truck',   direction: -1, speed: 80,  count: 2, offset: 0 },
  { row: 2, vehicle: 'carBlue', direction: 1,  speed: 130, count: 3, offset: 40 },
  { row: 3, vehicle: 'taxi',    direction: -1, speed: 100, count: 3, offset: 90 },
  { row: 4, vehicle: 'carRed',  direction: 1,  speed: 165, count: 2, offset: 10 },

  { row: 6, vehicle: 'truck',   direction: 1,  speed: 90,  count: 2, offset: 60 },
  { row: 7, vehicle: 'carRed',  direction: -1, speed: 145, count: 3, offset: 20 },
  { row: 8, vehicle: 'carBlue', direction: 1,  speed: 115, count: 3, offset: 110 },
  { row: 9, vehicle: 'taxi',    direction: -1, speed: 95,  count: 3, offset: 0 },
];
