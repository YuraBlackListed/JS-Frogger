/**
 * Entry point. Loads the images, then builds and starts the game.
 * Everything else lives in src/engine (reusable) and src/game (Frogger only).
 */
import { AssetLoader } from './engine/AssetLoader.js';
import { THEMES } from './game/assets.js';
import { Game } from './game/Game.js';

async function main() {
  const canvas = document.getElementById('game');
  const status = document.getElementById('status');

  // Load the images of every theme, each into its own AssetLoader.
  const themes = [];
  try {
    for (const theme of THEMES) {
      const assets = new AssetLoader();
      await assets.loadImages(theme.manifest);
      themes.push({ name: theme.name, assets });
    }
  } catch (error) {
    console.error(error);
    status.textContent = error.message;
    status.hidden = false;
    return;
  }

  const game = new Game(canvas, themes);
  game.start();
  status.hidden = true;

  // Handy in the browser console while developing: window.game.player, etc.
  window.game = game;
}

main();