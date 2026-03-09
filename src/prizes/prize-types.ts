/**
 * Prize Types
 *
 * Interfaces and types for defining game prizes/outcomes.
 * Prizes represent possible outcomes in luck-based games (slots, gacha, loot).
 *
 * Designed for AI-modifiable visual representation using vector graphics.
 */

/**
 * Prize rarity tier - affects drop rate and visual treatment
 */
export enum RarityTier {
  Common = 'common',
  Uncommon = 'uncommon',
  Rare = 'rare',
  Epic = 'epic',
  Legendary = 'legendary',
  Jackpot = 'jackpot',
}

/**
 * Visual shape for rendering prizes
 */
export type PrizeShape = 'circle' | 'square' | 'diamond' | 'star' | 'hexagon';

/**
 * Visual style configuration for a prize
 */
export interface PrizeVisual {
  /** Primary color (CSS color string) */
  color: string;
  /** Secondary/accent color */
  accentColor?: string;
  /** Icon character (emoji or single char) */
  icon: string;
  /** Shape for background */
  shape?: PrizeShape;
  /** Glow effect color (for rare+ tiers) */
  glowColor?: string;
  /** Scale multiplier for emphasis */
  scale?: number;
}

/**
 * Prize item definition
 */
export interface PrizeItem {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Rarity tier */
  tier: RarityTier;
  /** Weight for random selection (higher = more common) */
  weight: number;
  /** Payout multiplier (1 = 1x bet) */
  payout: number;
  /** Visual representation */
  visual: PrizeVisual;
  /** Special properties */
  special?: PrizeSpecial;
}

/**
 * Special prize properties (for slot-specific features)
 */
export interface PrizeSpecial {
  /** Wild - substitutes for other prizes */
  isWild?: boolean;
  /** Scatter - wins regardless of position */
  isScatter?: boolean;
  /** Bonus - triggers bonus game */
  isBonus?: boolean;
  /** Multiplier - multiplies win amount */
  multiplier?: number;
  /** Prize IDs this wild can substitute for (empty = all) */
  substitutes?: string[];
}

/**
 * Configuration for prize payouts on a payline
 */
export interface PayoutConfig {
  /** Minimum matches in a row to win */
  minMatch: number;
  /** Payout multipliers by match count: [3-match, 4-match, 5-match] */
  multipliers: number[];
}

/**
 * Full prize configuration including payouts
 */
export interface PrizeConfig extends PrizeItem {
  /** Payout configuration for paylines */
  payouts?: PayoutConfig;
}

/**
 * Prize set - a themed collection of prizes
 */
export interface PrizeSet {
  /** Set identifier */
  id: string;
  /** Set name (e.g., "Classic Fruit", "Ancient Egypt") */
  name: string;
  /** Prizes in this set */
  prizes: PrizeConfig[];
  /** Default wild prize ID */
  wildId?: string;
  /** Default scatter prize ID */
  scatterId?: string;
}

// ============================================================================
// Tier Configuration
// ============================================================================

/**
 * Default tier configurations
 */
export const TierConfig: Record<
  RarityTier,
  { defaultWeight: number; payoutRange: [number, number]; glowEnabled: boolean }
> = {
  [RarityTier.Common]: { defaultWeight: 40, payoutRange: [0.5, 1], glowEnabled: false },
  [RarityTier.Uncommon]: { defaultWeight: 25, payoutRange: [1, 2], glowEnabled: false },
  [RarityTier.Rare]: { defaultWeight: 15, payoutRange: [2, 5], glowEnabled: true },
  [RarityTier.Epic]: { defaultWeight: 10, payoutRange: [5, 15], glowEnabled: true },
  [RarityTier.Legendary]: { defaultWeight: 5, payoutRange: [15, 50], glowEnabled: true },
  [RarityTier.Jackpot]: { defaultWeight: 1, payoutRange: [50, 1000], glowEnabled: true },
};

/**
 * Get tier color scheme
 */
export function getTierColors(tier: RarityTier): { border: string; glow: string } {
  switch (tier) {
    case RarityTier.Common:
      return { border: '#888888', glow: '' };
    case RarityTier.Uncommon:
      return { border: '#1eff00', glow: '' };
    case RarityTier.Rare:
      return { border: '#0070dd', glow: '#0070dd' };
    case RarityTier.Epic:
      return { border: '#a335ee', glow: '#a335ee' };
    case RarityTier.Legendary:
      return { border: '#ff8000', glow: '#ff8000' };
    case RarityTier.Jackpot:
      return { border: '#e6cc80', glow: '#ffd700' };
  }
}

/**
 * Get tier display name
 */
export function getTierName(tier: RarityTier): string {
  switch (tier) {
    case RarityTier.Common:
      return 'Common';
    case RarityTier.Uncommon:
      return 'Uncommon';
    case RarityTier.Rare:
      return 'Rare';
    case RarityTier.Epic:
      return 'Epic';
    case RarityTier.Legendary:
      return 'Legendary';
    case RarityTier.Jackpot:
      return 'JACKPOT';
  }
}

/**
 * Sort prizes by tier (rarest first)
 */
export function sortByRarity(prizes: PrizeItem[]): PrizeItem[] {
  const tierOrder: RarityTier[] = [
    RarityTier.Jackpot,
    RarityTier.Legendary,
    RarityTier.Epic,
    RarityTier.Rare,
    RarityTier.Uncommon,
    RarityTier.Common,
  ];
  return [...prizes].sort((a, b) => tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier));
}
