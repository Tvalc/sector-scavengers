/**
 * Tactic Card types for Depth Dive sessions
 */
export type CardType = 'SCAN' | 'REPAIR' | 'BYPASS' | 'UPGRADE' | 'EXTRACT';

/**
 * Represents a tactic card that can be drafted during Depth Dive
 */
export interface TacticCard {
  /** Card type identifier */
  type: CardType;
  /** Energy cost to play this card */
  energyCost: number;
  /** Card description for UI */
  description: string;
  /** Whether this card has a risk of Rig Collapse */
  hasRisk: boolean;
}

/**
 * SCAN - Claim a Derelict Ship
 * Cost: 60 Power
 */
export const SCAN_CARD: TacticCard = {
  type: 'SCAN',
  energyCost: 60,
  description: 'Claim a Derelict Ship',
  hasRisk: false
};

/**
 * REPAIR - Restore Hull Integrity
 * Cost: 40 Power
 */
export const REPAIR_CARD: TacticCard = {
  type: 'REPAIR',
  energyCost: 40,
  description: 'Restore Hull Integrity',
  hasRisk: false
};

/**
 * BYPASS - Gain +1 Shield
 * Cost: 30 Energy
 * Max Shields: 2
 */
export const BYPASS_CARD: TacticCard = {
  type: 'BYPASS',
  energyCost: 30,
  description: 'Gain +1 Shield (Max 2)',
  hasRisk: false
};

/**
 * UPGRADE - Upgrade Ship Class
 * Cost: 25 Power
 */
export const UPGRADE_CARD: TacticCard = {
  type: 'UPGRADE',
  energyCost: 25,
  description: 'Upgrade Ship Class',
  hasRisk: false
};

/**
 * EXTRACT - Salvage ship for resources
 * Cost: Free
 * Risk: 35% Hull Breach (resets ship, empties run loot unless Shielded)
 * Payout: $100 × (1 + Ship Class) × viralMultiplier
 */
export const EXTRACT_CARD: TacticCard = {
  type: 'EXTRACT',
  energyCost: 0,
  description: 'Salvage ship for resources. 35% hull breach risk!',
  hasRisk: true
};

/**
 * All available tactic cards
 */
export const ALL_CARDS: TacticCard[] = [
  SCAN_CARD,
  REPAIR_CARD,
  BYPASS_CARD,
  UPGRADE_CARD,
  EXTRACT_CARD
];

/**
 * Get a card by type
 */
export function getCardByType(type: CardType): TacticCard | undefined {
  return ALL_CARDS.find(card => card.type === type);
}

/**
 * Get card energy cost by type
 */
export function getCardCost(type: CardType): number {
  return getCardByType(type)?.energyCost ?? 0;
}
