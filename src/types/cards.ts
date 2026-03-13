/**
 * Tactic Card types for Depth Dive sessions
 * Core actions: Scavenge, Repair, Extract
 * Unlockable: Shield, Upgrade, Analyze
 */
export type CardType = 'SCAVENGE' | 'REPAIR' | 'EXTRACT' | 'SHIELD' | 'UPGRADE' | 'ANALYZE' | 'RUSH_SCAVENGE' | 'FULL_HAUL' | 'BREAK_ROOM_RAID';

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
  /** Whether this card must be unlocked before use */
  isUnlockable: boolean;
  /** Selected art variant (set during drafting, persists for hand) */
  selectedArt?: string;
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
  hasRisk: true,
  isUnlockable: false
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
  hasRisk: false,
  isUnlockable: false
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
  hasRisk: false,
  isUnlockable: false
};

/**
 * SHIELD - Add protection from hull breach
 * Cost: 60 Power
 * Adds 1 shield (max 2 shields)
 * Each shield blocks one hull breach event
 */
export const SHIELD_CARD: TacticCard = {
  type: 'SHIELD',
  energyCost: 60,
  description: 'Add 1 shield (blocks breach)',
  hasRisk: false,
  isUnlockable: true
};

/**
 * UPGRADE - Increase target ship class
 * Cost: 80 Power
 * Increases the target ship's class by 1
 * Higher class ships generate more rewards
 */
export const UPGRADE_CARD: TacticCard = {
  type: 'UPGRADE',
  energyCost: 80,
  description: 'Upgrade ship class (+rewards)',
  hasRisk: false,
  isUnlockable: true
};

/**
 * ANALYZE - Reveal hidden bonus
 * Cost: 30 Power
 * Triggers a discovery event for bonus item
 * Lower cost than Scavenge, no breach risk
 */
export const ANALYZE_CARD: TacticCard = {
  type: 'ANALYZE',
  energyCost: 30,
  description: 'Discover hidden item (safe)',
  hasRisk: false,
  isUnlockable: true
};

/**
 * RUSH SCAVENGE - High-risk high-reward scavenge
 * Cost: 30 Power
 * Outcomes:
 *   Higher rewards but 35% hull breach chance
 */
export const RUSH_SCAVENGE_CARD: TacticCard = {
  type: 'RUSH_SCAVENGE',
  energyCost: 30,
  description: 'Fast salvage, 35% breach risk',
  hasRisk: true,
  isUnlockable: true
};

/**
 * FULL HAUL - Guaranteed extra item
 * Cost: 100 Power
 * Expensive but guarantees valuable loot
 */
export const FULL_HAUL_CARD: TacticCard = {
  type: 'FULL_HAUL',
  energyCost: 100,
  description: 'Guaranteed item, 10% breach',
  hasRisk: true,
  isUnlockable: true
};

/**
 * BREAK ROOM RAID - Free supplies (event-only)
 * Cost: Free
 * Discovery event reward: free supplies
 */
export const BREAK_ROOM_RAID_CARD: TacticCard = {
  type: 'BREAK_ROOM_RAID',
  energyCost: 0,
  description: 'Free supplies from break room',
  hasRisk: false,
  isUnlockable: true
};

/**
 * Core cards always available
 */
export const CORE_CARDS: TacticCard[] = [
  SCAVENGE_CARD,
  REPAIR_CARD,
  EXTRACT_CARD
];

/**
 * Unlockable cards (added to draft pool when unlocked)
 */
export const UNLOCKABLE_CARDS: TacticCard[] = [
  SHIELD_CARD,
  UPGRADE_CARD,
  ANALYZE_CARD,
  RUSH_SCAVENGE_CARD,
  FULL_HAUL_CARD,
  BREAK_ROOM_RAID_CARD
];

/**
 * All available tactic cards
 */
export const ALL_CARDS: TacticCard[] = [
  ...CORE_CARDS,
  ...UNLOCKABLE_CARDS
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

/**
 * Get all cards available for drafting (core + unlocked)
 * @param unlockedCardIds - Array of unlocked card IDs
 */
export function getAvailableCards(unlockedCardIds: string[]): TacticCard[] {
  const unlocked = UNLOCKABLE_CARDS.filter(card => 
    unlockedCardIds.includes(card.type.toLowerCase())
  );
  return [...CORE_CARDS, ...unlocked];
}
