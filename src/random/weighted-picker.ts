/**
 * Weighted Random Picker
 *
 * Generic weighted random selection with optional seeded RNG.
 * Supports any item type with associated weights.
 *
 * Usage:
 *   const picker = new WeightedPicker([
 *     { item: 'common', weight: 70 },
 *     { item: 'rare', weight: 25 },
 *     { item: 'legendary', weight: 5 }
 *   ]);
 *   const result = picker.pick(); // Returns item based on weights
 *
 * With seeded RNG for reproducibility:
 *   const rng = new SeededRNG(12345);
 *   const picker = new WeightedPicker(items, rng);
 */

import { SeededRNG } from './seeded-rng';

/**
 * Item with associated weight for random selection
 */
export interface WeightedItem<T> {
  item: T;
  weight: number;
}

/**
 * Result of a weighted pick including probability info
 */
export interface RandomOutcome<T> {
  item: T;
  weight: number;
  probability: number;
  roll: number;
}

/**
 * WeightedPicker - Generic weighted random selection
 */
export class WeightedPicker<T> {
  private items: WeightedItem<T>[];
  private totalWeight: number;
  private rng: SeededRNG | null;
  private cumulativeWeights: number[];

  /**
   * Create a weighted picker
   * @param items - Array of items with weights
   * @param rng - Optional SeededRNG for deterministic picks
   */
  constructor(items: WeightedItem<T>[], rng?: SeededRNG) {
    if (items.length === 0) {
      throw new Error('WeightedPicker requires at least one item');
    }

    // Filter out zero/negative weights
    this.items = items.filter((i) => i.weight > 0);
    if (this.items.length === 0) {
      throw new Error('WeightedPicker requires at least one item with positive weight');
    }

    this.rng = rng ?? null;

    // Calculate total weight and cumulative weights for binary search
    this.totalWeight = 0;
    this.cumulativeWeights = [];
    for (const item of this.items) {
      this.totalWeight += item.weight;
      this.cumulativeWeights.push(this.totalWeight);
    }
  }

  /**
   * Pick a single random item based on weights
   */
  pick(): T {
    const roll = this.getRandom() * this.totalWeight;
    const index = this.findIndex(roll);
    return this.items[index].item;
  }

  /**
   * Pick a single item with full outcome details
   */
  pickWithDetails(): RandomOutcome<T> {
    const roll = this.getRandom() * this.totalWeight;
    const index = this.findIndex(roll);
    const item = this.items[index];

    return {
      item: item.item,
      weight: item.weight,
      probability: item.weight / this.totalWeight,
      roll: roll / this.totalWeight,
    };
  }

  /**
   * Pick multiple items (with replacement - same item can be picked multiple times)
   */
  pickMultiple(count: number): T[] {
    const results: T[] = [];
    for (let i = 0; i < count; i++) {
      results.push(this.pick());
    }
    return results;
  }

  /**
   * Pick multiple items with full outcome details
   */
  pickMultipleWithDetails(count: number): RandomOutcome<T>[] {
    const results: RandomOutcome<T>[] = [];
    for (let i = 0; i < count; i++) {
      results.push(this.pickWithDetails());
    }
    return results;
  }

  /**
   * Pick multiple unique items (without replacement)
   * Stops early if not enough unique items available
   */
  pickUnique(count: number): T[] {
    const available = [...this.items];
    const results: T[] = [];
    let remainingWeight = this.totalWeight;

    for (let i = 0; i < count && available.length > 0; i++) {
      const roll = this.getRandom() * remainingWeight;

      let cumulative = 0;
      for (let j = 0; j < available.length; j++) {
        cumulative += available[j].weight;
        if (roll < cumulative) {
          results.push(available[j].item);
          remainingWeight -= available[j].weight;
          available.splice(j, 1);
          break;
        }
      }
    }

    return results;
  }

  /**
   * Get probability of picking a specific item
   */
  getProbability(item: T): number {
    const found = this.items.find((i) => i.item === item);
    return found ? found.weight / this.totalWeight : 0;
  }

  /**
   * Get all items with their probabilities
   */
  getProbabilities(): Array<{ item: T; probability: number }> {
    return this.items.map((i) => ({
      item: i.item,
      probability: i.weight / this.totalWeight,
    }));
  }

  /**
   * Get the total weight
   */
  getTotalWeight(): number {
    return this.totalWeight;
  }

  /**
   * Get number of items in the picker
   */
  getItemCount(): number {
    return this.items.length;
  }

  /**
   * Check if picker contains an item
   */
  hasItem(item: T): boolean {
    return this.items.some((i) => i.item === item);
  }

  /**
   * Add an item to the picker (creates new picker)
   */
  withItem(item: T, weight: number): WeightedPicker<T> {
    return new WeightedPicker([...this.items, { item, weight }], this.rng ?? undefined);
  }

  /**
   * Remove an item from the picker (creates new picker)
   */
  withoutItem(item: T): WeightedPicker<T> {
    const filtered = this.items.filter((i) => i.item !== item);
    if (filtered.length === 0) {
      throw new Error('Cannot remove last item from picker');
    }
    return new WeightedPicker(filtered, this.rng ?? undefined);
  }

  /**
   * Create new picker with modified weights
   */
  withModifiedWeights(modifier: (item: T, weight: number) => number): WeightedPicker<T> {
    const modified = this.items.map((i) => ({
      item: i.item,
      weight: Math.max(0, modifier(i.item, i.weight)),
    }));
    return new WeightedPicker(modified, this.rng ?? undefined);
  }

  /**
   * Set the RNG instance
   */
  setRNG(rng: SeededRNG | null): void {
    this.rng = rng;
  }

  private getRandom(): number {
    return this.rng ? this.rng.next() : Math.random();
  }

  private findIndex(roll: number): number {
    // Binary search for efficiency with large item counts
    let low = 0;
    let high = this.cumulativeWeights.length - 1;

    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      if (roll < this.cumulativeWeights[mid]) {
        high = mid;
      } else {
        low = mid + 1;
      }
    }

    return low;
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create a weighted picker from an array of [item, weight] tuples
 */
export function createPicker<T>(items: Array<[T, number]>, rng?: SeededRNG): WeightedPicker<T> {
  return new WeightedPicker(
    items.map(([item, weight]) => ({ item, weight })),
    rng
  );
}

/**
 * Create a weighted picker where all items have equal weight
 */
export function createEqualPicker<T>(items: T[], rng?: SeededRNG): WeightedPicker<T> {
  return new WeightedPicker(
    items.map((item) => ({ item, weight: 1 })),
    rng
  );
}

/**
 * Create a picker from a weight map
 */
export function createPickerFromMap<T extends string>(
  weights: Record<T, number>,
  rng?: SeededRNG
): WeightedPicker<T> {
  const items = Object.entries(weights).map(([item, weight]) => ({
    item: item as T,
    weight: weight as number,
  }));
  return new WeightedPicker(items, rng);
}
