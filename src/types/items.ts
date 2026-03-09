/**
 * Item category - Hardware provides passive bonuses, Crew provides abilities
 */
export type ItemCategory = 'hardware' | 'crew';

/**
 * Base item interface
 */
export interface Item {
  /** Unique item identifier */
  id: string;
  /** Display name */
  name: string;
  /** Item category */
  category: ItemCategory;
  /** Item description */
  description: string;
  /** Passive bonuses provided by this item */
  bonuses: ItemBonus[];
}

/**
 * Types of bonuses items can provide
 */
export interface ItemBonus {
  type: BonusType;
  value: number;
  description: string;
}

export type BonusType = 
  | 'stability_percent'      // +% to stability
  | 'play_reward_percent'    // +% to $PLAY rewards
  | 'energy_cap_percent'     // +% to energy cap
  | 'aura_per_likes'         // +Aura per N likes
  | 'auto_bypass'            // Free bypass uses
  | 'follower_multiplier';   // Scales with follower tier

/**
 * Neural Uplink - Hardware
 * +5% Stability, +10% $PLAY if tweeted
 */
export const NEURAL_UPLINK: Item = {
  id: 'neural_uplink',
  name: 'Neural Uplink',
  category: 'hardware',
  description: 'Direct neural interface for enhanced salvage operations',
  bonuses: [
    { type: 'stability_percent', value: 5, description: '+5% Stability' },
    { type: 'play_reward_percent', value: 10, description: '+10% $PLAY when shared' }
  ]
};

/**
 * Meme-Beacon - Hardware
 * +10% Energy cap, +50 Aura per 5 likes
 */
export const MEME_BEACON: Item = {
  id: 'meme_beacon',
  name: 'Meme-Beacon',
  category: 'hardware',
  description: 'Viral signal amplifier for maximum reach',
  bonuses: [
    { type: 'energy_cap_percent', value: 10, description: '+10% Energy Cap' },
    { type: 'aura_per_likes', value: 50, description: '+50 Aura per 5 likes' }
  ]
};

/**
 * The Viralist - Crew
 * 1x Auto-Bypass, reward multiplier scales with follower tier
 */
export const THE_VIRALIST: Item = {
  id: 'the_viralist',
  name: 'The Viralist',
  category: 'crew',
  description: 'Legendary content creator with viral influence',
  bonuses: [
    { type: 'auto_bypass', value: 1, description: '1x Auto-Bypass per run' },
    { type: 'follower_multiplier', value: 1, description: 'Rewards scale with followers' }
  ]
};

/**
 * All available items in the game
 */
export const ALL_ITEMS: Item[] = [
  NEURAL_UPLINK,
  MEME_BEACON,
  THE_VIRALIST
];

/**
 * Get an item by ID
 */
export function getItemById(id: string): Item | undefined {
  return ALL_ITEMS.find(item => item.id === id);
}

/**
 * Get all items of a specific category
 */
export function getItemsByCategory(category: ItemCategory): Item[] {
  return ALL_ITEMS.filter(item => item.category === category);
}
