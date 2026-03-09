/**
 * Prize Table
 *
 * Manages a collection of prizes with weighted random selection.
 * Integrates with WeightedPicker for provably fair selection.
 *
 * Usage:
 *   const table = new PrizeTable(prizes);
 *   const prize = table.pickPrize();
 *
 * With seeded RNG:
 *   const rng = new SeededRNG(12345);
 *   const table = new PrizeTable(prizes, rng);
 *   const results = table.pickMultiple(15); // 5x3 grid
 */

import { WeightedPicker, WeightedItem } from '../random/weighted-picker';
import { SeededRNG } from '../random/seeded-rng';
import { PrizeItem, PrizeConfig, RarityTier, TierConfig } from './prize-types';

/**
 * PrizeTable - Manages prizes with weighted selection
 */
export class PrizeTable {
  private prizes: Map<string, PrizeConfig>;
  private picker: WeightedPicker<PrizeItem>;
  private rng: SeededRNG | null;

  /**
   * Create a prize table
   * @param prizes - Array of prize configurations
   * @param rng - Optional SeededRNG for deterministic picks
   */
  constructor(prizes: PrizeConfig[], rng?: SeededRNG) {
    this.prizes = new Map();
    this.rng = rng ?? null;

    // Build prize map
    for (const prize of prizes) {
      this.prizes.set(prize.id, prize);
    }

    // Create weighted picker
    const items: WeightedItem<PrizeItem>[] = prizes.map((p) => ({
      item: p,
      weight: p.weight,
    }));
    this.picker = new WeightedPicker(items, rng);
  }

  /**
   * Pick a single random prize
   */
  pickPrize(): PrizeItem {
    return this.picker.pick();
  }

  /**
   * Pick multiple prizes (with replacement)
   */
  pickMultiple(count: number): PrizeItem[] {
    return this.picker.pickMultiple(count);
  }

  /**
   * Pick prizes for a slot grid
   * @param reels - Number of reels (columns)
   * @param rows - Number of rows
   * @returns 2D array [reel][row]
   */
  pickGrid(reels: number, rows: number): PrizeItem[][] {
    const grid: PrizeItem[][] = [];
    for (let r = 0; r < reels; r++) {
      grid.push(this.picker.pickMultiple(rows));
    }
    return grid;
  }

  /**
   * Get a prize by ID
   */
  getPrize(id: string): PrizeConfig | undefined {
    return this.prizes.get(id);
  }

  /**
   * Get all prizes
   */
  getAllPrizes(): PrizeConfig[] {
    return Array.from(this.prizes.values());
  }

  /**
   * Get prizes by tier
   */
  getPrizesByTier(tier: RarityTier): PrizeConfig[] {
    return this.getAllPrizes().filter((p) => p.tier === tier);
  }

  /**
   * Get the wild prize (if any)
   */
  getWildPrize(): PrizeConfig | undefined {
    return this.getAllPrizes().find((p) => p.special?.isWild);
  }

  /**
   * Get the scatter prize (if any)
   */
  getScatterPrize(): PrizeConfig | undefined {
    return this.getAllPrizes().find((p) => p.special?.isScatter);
  }

  /**
   * Check if two prizes match (considering wilds)
   */
  prizesMatch(a: PrizeItem, b: PrizeItem): boolean {
    // Same prize always matches
    if (a.id === b.id) return true;

    // Check if either is a wild
    const aWild = a.special?.isWild;
    const bWild = b.special?.isWild;

    if (aWild) {
      // Wild matches everything or specific substitutes
      const subs = a.special?.substitutes;
      return !subs || subs.length === 0 || subs.includes(b.id);
    }

    if (bWild) {
      const subs = b.special?.substitutes;
      return !subs || subs.length === 0 || subs.includes(a.id);
    }

    return false;
  }

  /**
   * Get probability of picking a specific prize
   */
  getProbability(prizeId: string): number {
    const prize = this.prizes.get(prizeId);
    if (!prize) return 0;
    return this.picker.getProbability(prize);
  }

  /**
   * Get all probabilities
   */
  getAllProbabilities(): Array<{ prize: PrizeConfig; probability: number }> {
    return this.getAllPrizes().map((prize) => ({
      prize,
      probability: this.picker.getProbability(prize),
    }));
  }

  /**
   * Create a new WeightedPicker from this table
   * Useful for creating modified pickers (e.g., bonus rounds)
   */
  createPicker(rng?: SeededRNG): WeightedPicker<PrizeItem> {
    const items: WeightedItem<PrizeItem>[] = this.getAllPrizes().map((p) => ({
      item: p,
      weight: p.weight,
    }));
    return new WeightedPicker(items, rng ?? this.rng ?? undefined);
  }

  /**
   * Create a modified table with adjusted weights
   */
  withModifiedWeights(modifier: (prize: PrizeConfig) => number): PrizeTable {
    const modified = this.getAllPrizes().map((p) => ({
      ...p,
      weight: Math.max(0, modifier(p)),
    }));
    return new PrizeTable(modified, this.rng ?? undefined);
  }

  /**
   * Create a table with only specific tiers
   */
  filterByTiers(tiers: RarityTier[]): PrizeTable {
    const filtered = this.getAllPrizes().filter((p) => tiers.includes(p.tier));
    return new PrizeTable(filtered, this.rng ?? undefined);
  }

  /**
   * Set the RNG instance
   */
  setRNG(rng: SeededRNG | null): void {
    this.rng = rng;
    this.picker.setRNG(rng);
  }

  /**
   * Get prize count
   */
  get size(): number {
    return this.prizes.size;
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create a basic prize from minimal config
 */
export function createPrize(
  id: string,
  name: string,
  tier: RarityTier,
  icon: string,
  color: string,
  options?: {
    weight?: number;
    payout?: number;
    special?: PrizeConfig['special'];
    payouts?: PrizeConfig['payouts'];
  }
): PrizeConfig {
  const tierConfig = TierConfig[tier];

  return {
    id,
    name,
    tier,
    weight: options?.weight ?? tierConfig.defaultWeight,
    payout: options?.payout ?? tierConfig.payoutRange[0],
    visual: {
      icon,
      color,
      shape: 'circle',
      glowColor: tierConfig.glowEnabled ? color : undefined,
    },
    special: options?.special,
    payouts: options?.payouts,
  };
}

/**
 * Create a wild prize
 */
export function createWildPrize(
  id: string,
  name: string,
  icon: string,
  color: string,
  weight: number = 5
): PrizeConfig {
  return createPrize(id, name, RarityTier.Rare, icon, color, {
    weight,
    payout: 0, // Wilds typically don't pay on their own
    special: { isWild: true },
  });
}

/**
 * Create a scatter prize
 */
export function createScatterPrize(
  id: string,
  name: string,
  icon: string,
  color: string,
  weight: number = 3
): PrizeConfig {
  return createPrize(id, name, RarityTier.Epic, icon, color, {
    weight,
    payout: 2,
    special: { isScatter: true },
  });
}
