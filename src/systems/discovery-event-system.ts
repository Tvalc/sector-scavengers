/**
 * Discovery Event System
 *
 * Manages discovery events on rounds 3, 6, and 9.
 * Uses WeightedPicker for fair weighted selection.
 * Awards items from the Asset Manifest.
 */

import type { Game } from '../game/game';
import { WeightedPicker } from '../random/weighted-picker';
import { SeededRNG } from '../random/seeded-rng';
import { Item, getItemById, ALL_ITEMS, NEURAL_UPLINK, MEME_BEACON, THE_VIRALIST } from '../types/items';

/**
 * Discovery rounds configuration
 */
const DISCOVERY_ROUNDS = [3, 6, 9] as const;

/**
 * Item weights for discovery
 */
const DISCOVERY_WEIGHTS = [
  { itemId: 'neural_uplink', weight: 30 },
  { itemId: 'meme_beacon', weight: 25 },
  { itemId: 'the_viralist', weight: 10 }
] as const;

/**
 * Rarity tier for visual treatment
 */
export type RarityTier = 'common' | 'rare' | 'legendary';

/**
 * Get rarity tier for an item
 */
function getRarityTier(itemId: string): RarityTier {
  switch (itemId) {
    case 'the_viralist':
      return 'legendary';
    case 'neural_uplink':
    case 'meme_beacon':
      return 'rare';
    default:
      return 'common';
  }
}

/**
 * Get rarity color
 */
function getRarityColor(tier: RarityTier): string {
  switch (tier) {
    case 'legendary':
      return '#ff00aa'; // Neon magenta
    case 'rare':
      return '#00f0ff'; // Neon cyan
    default:
      return '#666666'; // Gray
  }
}

/**
 * Discovery event result
 */
export interface DiscoveryEvent {
  item: Item;
  tier: RarityTier;
  round: number;
}

/**
 * DiscoveryEventSystem - manages discovery events
 */
export class DiscoveryEventSystem {
  private game: Game;
  private rng: SeededRNG;
  private picker: WeightedPicker<string>;
  private triggeredRounds: Set<number> = new Set();
  private currentEvent: DiscoveryEvent | null = null;
  private showingModal: boolean = false;

  constructor(game: Game) {
    this.game = game;
    this.rng = new SeededRNG(Date.now());
    
    // Initialize weighted picker with item IDs
    const weightedItems = DISCOVERY_WEIGHTS.map(w => ({
      item: w.itemId,
      weight: w.weight
    }));
    this.picker = new WeightedPicker<string>(weightedItems, this.rng);
  }

  /**
   * Check if a discovery event should trigger this round
   */
  shouldTriggerDiscovery(): boolean {
    const run = this.game.state.currentRun;
    if (!run) return false;
    
    // Check if this is a discovery round
    if (!DISCOVERY_ROUNDS.includes(run.round as typeof DISCOVERY_ROUNDS[number])) {
      return false;
    }
    
    // Check if already triggered for this round
    return !this.triggeredRounds.has(run.round);
  }

  /**
   * Trigger a discovery event
   * @returns The discovery event, or null if not applicable
   */
  triggerDiscovery(): DiscoveryEvent | null {
    // Check if we should trigger
    if (!this.shouldTriggerDiscovery()) {
      return null;
    }

    const run = this.game.state.currentRun;
    if (!run) return null;

    // Mark this round as triggered
    this.triggeredRounds.add(run.round);

    // Pick a random item
    const itemId = this.pickItem();
    if (!itemId) return null;

    const item = getItemById(itemId);
    if (!item) return null;

    // Create discovery event
    const event: DiscoveryEvent = {
      item,
      tier: getRarityTier(itemId),
      round: run.round
    };

    // Store current event
    this.currentEvent = event;
    this.showingModal = true;

    console.log(`[Discovery] Round ${run.round}: Discovered ${item.name} (${event.tier})`);

    return event;
  }

  /**
   * Pick a random item using weighted selection
   */
  private pickItem(): string | null {
    // Filter out items already owned
    const availableItems = DISCOVERY_WEIGHTS.filter(w => 
      !this.game.state.inventory.hardware.some(i => i.id === w.itemId) &&
      !this.game.state.inventory.crew.some(i => i.id === w.itemId)
    );

    if (availableItems.length === 0) {
      console.log('[Discovery] All items already owned');
      return null;
    }

    // Create new picker with available items
    const picker = new WeightedPicker<string>(
      availableItems.map(w => ({ item: w.itemId, weight: w.weight })),
      this.rng
    );

    return picker.pick();
  }

  /**
   * Award item to inventory
   */
  awardItem(item: Item): boolean {
    // Import inventory system to add item
    const inventory = this.game.state.inventory;
    
    // Check slot limits
    if (item.category === 'hardware' && inventory.hardware.length >= 4) {
      console.warn('[Discovery] Hardware inventory full');
      return false;
    }
    if (item.category === 'crew' && inventory.crew.length >= 2) {
      console.warn('[Discovery] Crew inventory full');
      return false;
    }

    // Add to inventory
    if (item.category === 'hardware') {
      inventory.hardware.push(item);
    } else {
      inventory.crew.push(item);
    }

    // Add to current run's collected items
    const run = this.game.state.currentRun;
    if (run) {
      run.collectedItems.push(item.id);
    }

    // Save state
    this.game.saveState();

    console.log(`[Discovery] Awarded ${item.name} to inventory`);
    return true;
  }

  /**
   * Award current event's item
   */
  awardCurrentItem(): boolean {
    if (!this.currentEvent) return false;
    return this.awardItem(this.currentEvent.item);
  }

  /**
   * Get current event
   */
  getCurrentEvent(): DiscoveryEvent | null {
    return this.currentEvent;
  }

  /**
   * Check if showing modal
   */
  isShowingModal(): boolean {
    return this.showingModal;
  }

  /**
   * Show the modal
   */
  showModal(): void {
    this.showingModal = true;
  }

  /**
   * Hide the modal
   */
  hideModal(): void {
    this.showingModal = false;
    // Award item when closing modal
    if (this.currentEvent) {
      this.awardItem(this.currentEvent.item);
      this.currentEvent = null;
    }
  }

  /**
   * Dismiss current event without awarding (for cleanup)
   */
  dismissEvent(): void {
    this.currentEvent = null;
    this.showingModal = false;
  }

  /**
   * Reset triggered rounds (for new run)
   */
  reset(): void {
    this.triggeredRounds.clear();
    this.currentEvent = null;
    this.showingModal = false;
  }

  /**
   * Get discovery rounds
   */
  static getDiscoveryRounds(): readonly number[] {
    return DISCOVERY_ROUNDS;
  }

  /**
   * Get rarity color for display
   */
  static getRarityColor(tier: RarityTier): string {
    return getRarityColor(tier);
  }

  /**
   * Get available items for discovery (not already owned)
   */
  getAvailableItems(): Item[] {
    return DISCOVERY_WEIGHTS
      .filter(w => 
        !this.game.state.inventory.hardware.some(i => i.id === w.itemId) &&
        !this.game.state.inventory.crew.some(i => i.id === w.itemId)
      )
      .map(w => getItemById(w.itemId))
      .filter((item): item is Item => item !== undefined);
  }

  /**
   * Check if all items have been discovered
   */
  allItemsDiscovered(): boolean {
    return this.getAvailableItems().length === 0;
  }

  /**
   * Update discovery system (for animations)
   */
  update(_dt: number): void {
    // Placeholder for future animation updates
  }
}

/**
 * Singleton factory
 */
export function createDiscoveryEventSystem(game: Game): DiscoveryEventSystem {
  return new DiscoveryEventSystem(game);
}
