import { CANVAS_WIDTH, TILE_SIZE, VEHICLE_TYPES } from './config.js';
import { Vehicle } from './Vehicle.js';

/**
 * Lane
 * ---------------------------------------------------------------------------
 * One strip of traffic: creates the lane's vehicles from a LANES config entry,
 * spaces them evenly around the wrap-around loop, and updates/draws them.
 *
 * Keeping this separate from Game means Game never needs to know how a lane
 * is built. To add a river lane later, write a similar `RiverLane` class.
 */
export class Lane {
  /**
   * @param {object} definition  One entry from LANES in config.js.
   * @param {import('../engine/AssetLoader.js').AssetLoader} assets
   */
  constructor(definition, assets) {
    this.definition = definition;
    this.vehicles = [];

    const type = VEHICLE_TYPES[definition.vehicle];
    if (!type) throw new Error(`Unknown vehicle type "${definition.vehicle}"`);

    const width = type.tilesWide * TILE_SIZE;
    const loopLength = CANVAS_WIDTH + width;
    const spacing = loopLength / definition.count;

    for (let i = 0; i < definition.count; i++) {
      this.vehicles.push(
        new Vehicle({
          image: assets.getImage(type.image),
          x: -width + (definition.offset ?? 0) + i * spacing,
          y: definition.row * TILE_SIZE,
          width,
          height: TILE_SIZE,
          direction: definition.direction,
          speed: definition.speed,
          hitboxPadding: type.hitboxPadding,
        })
      );
    }
  }

  /** Used by Game to make traffic faster on higher levels. */
  setSpeedMultiplier(multiplier) {
    for (const vehicle of this.vehicles) vehicle.speed = this.definition.speed * multiplier;
  }

  update(dt) {
    for (const vehicle of this.vehicles) vehicle.update(dt);
  }

  render(ctx) {
    for (const vehicle of this.vehicles) vehicle.render(ctx);
  }
}
