/**
 * Card Art Asset Mapping
 *
 * Maps card types to their static asset names and variants.
 * Primary art + visual variants for variety.
 */

import { CardType } from '../types/cards';

/**
 * Card art configuration
 */
export interface CardArtConfig {
  /** Primary asset name */
  primary: string;
  /** Visual variant asset names (random selection) */
  variants: string[];
  /** Asset dimensions (from manifest) */
  width: number;
  height: number;
}

/**
 * Card type to asset mapping
 * 
 * Primary mapping + variants for visual variety
 */
export const CARD_ART_MAP: Record<CardType, CardArtConfig> = {
  // Core cards
  SCAVENGE: {
    primary: 'ss-card-tactic-scavenge',
    variants: ['ss-card-tactic-risky-scavenge', 'ss-card-tactic-rush-scavenge'],
    width: 415,
    height: 620
  },
  REPAIR: {
    primary: 'ss-tactic-card-repair',
    variants: ['ss-card-tactic-patch-and-hold', 'ss-card-tactic-salvage-parts'],
    width: 413,
    height: 629
  },
  EXTRACT: {
    primary: 'ss-card-tactic-extract',
    variants: ['ss-card-tactic-secure-extract', 'ss-card-tactic-quick-extract'],
    width: 416,
    height: 615
  },

  // Unlockable cards
  SHIELD: {
    primary: 'ss-card-tactic-reinforce-v2',
    variants: [],
    width: 415,
    height: 623
  },
  UPGRADE: {
    primary: 'ss-card-tactic-upgrade',
    variants: ['ss-card-tactic-full-haul'],
    width: 434,
    height: 649
  },
  ANALYZE: {
    primary: 'ss-card-tactic-deep-scan',
    variants: ['ss-card-tactic-compliance-scan'],
    width: 424,
    height: 625
  },

  // New sub-type cards
  RUSH_SCAVENGE: {
    primary: 'ss-card-tactic-rush-scavenge',
    variants: ['ss-card-tactic-risky-scavenge'],
    width: 415,
    height: 620
  },
  FULL_HAUL: {
    primary: 'ss-card-tactic-full-haul',
    variants: [],
    width: 415,
    height: 631
  },
  BREAK_ROOM_RAID: {
    primary: 'ss-card-tactic-break-room-raid',
    variants: [],
    width: 418,
    height: 626
  }
};

/**
 * Card display dimensions (scaled for UI)
 */
export const CARD_DISPLAY = {
  /** Target card width in UI */
  width: 180,
  /** Target card height in UI */
  height: 270,
  /** Spacing between cards */
  spacing: 200,
  /** Footer height for energy cost (single line) */
  footerHeight: 35
};

/**
 * Get a random art variant for a card type
 */
export function getRandomCardArt(cardType: CardType, rng: () => number): string {
  const config = CARD_ART_MAP[cardType];
  if (!config) return '';

  if (config.variants.length === 0) {
    return config.primary;
  }

  // 60% chance for primary, 40% split among variants
  const roll = rng();
  if (roll < 0.6) {
    return config.primary;
  }

  const variantIndex = Math.floor((roll - 0.6) / (0.4 / config.variants.length));
  return config.variants[Math.min(variantIndex, config.variants.length - 1)];
}

/**
 * Get the primary art for a card type
 */
export function getCardArt(cardType: CardType): string {
  return CARD_ART_MAP[cardType]?.primary ?? '';
}
