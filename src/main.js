/**
 * Entry point. Loads the images, then builds and starts the game.
 * Everything else lives in src/engine (reusable) and src/game (Frogger only).
 */
import { AssetLoader } from './engine/AssetLoader.js';
import { IMAGE_MANIFEST } from './game/assets.js';
import { Game } from './game/Game.js';

async function main() {
  const canvas = document.getElementById('game');
  const status = document.getElementById('status');

  const assets = new AssetLoader();
  try {
    await assets.loadImages(IMAGE_MANIFEST);
  } catch (error) {
    console.error(error);
    status.textContent = error.message;
    status.hidden = false;
    return;
  }

  const game = new Game(canvas, assets);
  game.start();
  status.hidden = true;

  // Handy in the browser console while developing: window.game.player, etc.
  window.game = game;
}

main();
