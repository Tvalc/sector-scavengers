/**
 * Resource types for salvage operations
 */

/**
 * Resource types available in the game
 */
export interface Resources {
  /** Common building material from mining ships */
  metal: number;
  /** Advanced components from higher class ships */
  tech: number;
  /** Rare parts for upgrades and crew */
  components: number;
  /** Power cells for waking crew from cryo */
  powerCells: number;
}

/**
 * Creates initial resources (empty)
 */
export function createResources(): Resources {
  return {
    metal: 0,
    tech: 0,
    components: 0,
    powerCells: 0
  };
}

/**
 * Add resources together
 */
export function addResources(a: Resources, b: Resources): Resources {
  return {
    metal: a.metal + b.metal,
    tech: a.tech + b.tech,
    components: a.components + b.components,
    powerCells: a.powerCells + b.powerCells
  };
}

/**
 * Check if player has enough resources
 */
export function hasEnoughResources(available: Resources, required: Resources): boolean {
  return available.metal >= required.metal &&
         available.tech >= required.tech &&
         available.components >= required.components &&
         available.powerCells >= required.powerCells;
}

/**
 * Subtract resources (returns new resources, doesn't modify original)
 */
export function subtractResources(available: Resources, cost: Resources): Resources | null {
  if (!hasEnoughResources(available, cost)) {
    return null;
  }
  
  return {
    metal: available.metal - cost.metal,
    tech: available.tech - cost.tech,
    components: available.components - cost.components,
    powerCells: available.powerCells - cost.powerCells
  };
}
