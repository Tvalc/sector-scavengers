/**
 * Tactic Card types for Depth Dive sessions
 * Simplified to three core actions: Scavenge, Repair, Extract
 */
export type CardType = 'SCAVENGE' | 'REPAIR' | 'EXTRACT';

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
 * SCAVENGE - Risk/reward salvage attempt
 * Cost: 50 Power
 * Outcomes:
 *   0-30%: Valuable item (added to run loot)
 *   30-50%: Power cell (added to resources)
 *   50-80%: Small energy (added to run rewards)
 *   80-100%: Hull breach (run ends, lose all rewards)
 */
export const SCAVENGE_CARD: TacticCard = {
  type: 'SCAVENGE',
  energyCost: 50,
  description: 'Risk hull breach for rewards',
  hasRisk: true
};

/**
 * REPAIR - Restore Hull Integrity on Target Ship
 * Cost: 40 Power
 * In one-ship-per-run: Only repairs the target ship
 * Sets targetRepairedThisRun flag (ship stays on board after run)
 */
export const REPAIR_CARD: TacticCard = {
  type: 'REPAIR',
  energyCost: 40,
  description: 'Repair target ship hull',
  hasRisk: false
};

/**
 * EXTRACT - Exit run with current loot
 * Cost: Free
 * Safely ends the run and keeps all collected rewards
 * No hull breach risk (safe exit)
 */
export const EXTRACT_CARD: TacticCard = {
  type: 'EXTRACT',
  energyCost: 0,
  description: 'Exit run with loot (safe)',
  hasRisk: false
};

/**
 * All available tactic cards
 */
export const ALL_CARDS: TacticCard[] = [
  SCAVENGE_CARD,
  REPAIR_CARD,
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
