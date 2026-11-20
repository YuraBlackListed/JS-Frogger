/**
 * AssetLoader
 * ---------------------------------------------------------------------------
 * Loads images up front so the game never tries to draw a picture that has
 * not arrived yet. Usage:
 *
 *     const assets = new AssetLoader();
 *     await assets.loadImages({ frog: 'assets/sprites/frog.png' });
 *     const img = assets.getImage('frog');
 *
 * Paths are relative to index.html, not to this file.
 */
export class AssetLoader {
  constructor() {
    this._images = new Map();
  }

  /**
   * Load every image in a { name: url } manifest in parallel.
   * Rejects with a readable error naming the file that failed.
   * @param {Record<string, string>} manifest
   */
  loadImages(manifest) {
    const jobs = Object.entries(manifest).map(([name, url]) => this._loadImage(name, url));
    return Promise.all(jobs);
  }

  /** Fetch a previously loaded image by name. */
  getImage(name) {
    const image = this._images.get(name);
    if (!image) throw new Error(`Image "${name}" was never loaded. Is it in the asset manifest?`);
    return image;
  }

  _loadImage(name, url) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        this._images.set(name, image);
        resolve(image);
      };
      image.onerror = () => reject(new Error(`Could not load image "${name}" from "${url}"`));
      image.src = url;
    });
  }
}
