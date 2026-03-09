/**
 * Tactic Card types for Depth Dive sessions
 */
export type CardType = 'SCAN' | 'REPAIR' | 'BYPASS' | 'OVERCLOCK' | 'EXTRACT';

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
 * SCAN - Control a Neutral Node
 * Cost: 60 Energy
 */
export const SCAN_CARD: TacticCard = {
  type: 'SCAN',
  energyCost: 60,
  description: 'Control a Neutral Node',
  hasRisk: false
};

/**
 * REPAIR - Increase Rig Stability
 * Cost: 40 Energy
 */
export const REPAIR_CARD: TacticCard = {
  type: 'REPAIR',
  energyCost: 40,
  description: 'Increase Rig Stability (Level 1-3)',
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
 * OVERCLOCK - Move signal strength between tiles
 * Cost: 25 Energy
 */
export const OVERCLOCK_CARD: TacticCard = {
  type: 'OVERCLOCK',
  energyCost: 25,
  description: 'Move signal strength between tiles',
  hasRisk: false
};

/**
 * EXTRACT - Cash out node for points
 * Cost: Free
 * Risk: 35% Rig Collapse (resets node, empties run loot unless Shielded)
 * Payout: $100 × (1 + Level) × viralMultiplier
 */
export const EXTRACT_CARD: TacticCard = {
  type: 'EXTRACT',
  energyCost: 0,
  description: 'Cash out node for points. 35% collapse risk!',
  hasRisk: true
};

/**
 * All available tactic cards
 */
export const ALL_CARDS: TacticCard[] = [
  SCAN_CARD,
  REPAIR_CARD,
  BYPASS_CARD,
  OVERCLOCK_CARD,
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
