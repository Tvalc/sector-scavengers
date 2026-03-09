/**
 * Inventory System
 *
 * Manages Hardware and Crew items with passive bonuses.
 * Hardware: max 4 slots, Crew: max 2 slots.
 *
 * Usage:
 *   const inventory = new InventorySystem(game);
 *   
 *   // Add item
 *   inventory.addItem(NEURAL_UPLINK);
 *   
 *   // Check if item exists
 *   if (inventory.hasItem('neural_uplink')) { ... }
 *   
 *   // Get bonus
 *   const stabilityBonus = inventory.getBonus('stability_percent');
 */

import type { Game } from '../game/game';
import { Item, ItemCategory, BonusType, ALL_ITEMS } from '../types/items';
import { Inventory, createInventory } from '../types/inventory';

/**
 * Inventory slot limits
 */
export const SLOT_LIMITS = {
  hardware: 4,
  crew: 2
} as const;

/**
 * InventorySystem - manages items and bonuses
 */
export class InventorySystem {
  private game: Game;
  private inventory: Inventory;

  constructor(game: Game) {
    this.game = game;
    this.inventory = createInventory();
  }

  // ============================================================================
  // Item Management
  // ============================================================================

  /**
   * Add an item to inventory
   * @returns true if added successfully, false if no slot available
   */
  addItem(item: Item): boolean {
    const slots = item.category === 'hardware' ? this.inventory.hardware : this.inventory.crew;
    const limit = item.category === 'hardware' ? SLOT_LIMITS.hardware : SLOT_LIMITS.crew;

    // Check slot limit
    if (slots.length >= limit) {
      console.warn(`[Inventory] No ${item.category} slot available`);
      return false;
    }

    // Check for duplicates
    if (this.hasItem(item.id)) {
      console.warn(`[Inventory] Item ${item.id} already exists`);
      return false;
    }

    // Add item
    slots.push(item);
    
    // Sync with game state
    this.syncToGameState();
    
    // Save
    this.save();
    
    console.log(`[Inventory] Added ${item.name} (${item.category})`);
    return true;
  }

  /**
   * Remove an item from inventory
   * @returns true if removed successfully
   */
  removeItem(itemId: string): boolean {
    const hwIndex = this.inventory.hardware.findIndex(i => i.id === itemId);
    if (hwIndex !== -1) {
      this.inventory.hardware.splice(hwIndex, 1);
      this.syncToGameState();
      this.save();
      return true;
    }

    const crewIndex = this.inventory.crew.findIndex(i => i.id === itemId);
    if (crewIndex !== -1) {
      this.inventory.crew.splice(crewIndex, 1);
      this.syncToGameState();
      this.save();
      return true;
    }

    return false;
  }

  /**
   * Check if item exists in inventory
   */
  hasItem(itemId: string): boolean {
    return (
      this.inventory.hardware.some(i => i.id === itemId) ||
      this.inventory.crew.some(i => i.id === itemId)
    );
  }

  /**
   * Check if item exists in specific category
   */
  hasItemInCategory(itemId: string, category: ItemCategory): boolean {
    const items = category === 'hardware' ? this.inventory.hardware : this.inventory.crew;
    return items.some(i => i.id === itemId);
  }

  /**
   * Get item by ID
   */
  getItem(itemId: string): Item | undefined {
    return (
      this.inventory.hardware.find(i => i.id === itemId) ||
      this.inventory.crew.find(i => i.id === itemId)
    );
  }

  /**
   * Get all items
   */
  getAllItems(): Item[] {
    return [...this.inventory.hardware, ...this.inventory.crew];
  }

  /**
   * Get items by category
   */
  getItemsByCategory(category: ItemCategory): Item[] {
    return category === 'hardware' 
      ? [...this.inventory.hardware] 
      : [...this.inventory.crew];
  }

  // ============================================================================
  // Bonus Calculations
  // ============================================================================

  /**
   * Get total bonus for a specific type
   */
  getBonus(bonusType: BonusType): number {
    let total = 0;

    for (const item of this.getAllItems()) {
      for (const bonus of item.bonuses) {
        if (bonus.type === bonusType) {
          total += bonus.value;
        }
      }
    }

    return total;
  }

  /**
   * Get stability bonus percentage
   */
  getStabilityBonus(): number {
    return this.getBonus('stability_percent');
  }

  /**
   * Get energy cap bonus percentage
   */
  getEnergyCapBonus(): number {
    return this.getBonus('energy_cap_percent');
  }

  /**
   * Get $PLAY reward bonus percentage
   */
  getPlayRewardBonus(): number {
    return this.getBonus('play_reward_percent');
  }

  /**
   * Get auto-bypass count (from The Viralist)
   */
  getAutoBypassCount(): number {
    return this.getBonus('auto_bypass');
  }

  /**
   * Get aura per likes bonus
   */
  getAuraPerLikes(): number {
    return this.getBonus('aura_per_likes');
  }

  /**
   * Check if has follower multiplier (The Viralist)
   */
  hasFollowerMultiplier(): boolean {
    return this.getBonus('follower_multiplier') > 0;
  }

  /**
   * Get all active bonuses as a summary
   */
  getBonusSummary(): Record<string, number> {
    const summary: Record<string, number> = {};

    for (const item of this.getAllItems()) {
      for (const bonus of item.bonuses) {
        if (!summary[bonus.type]) {
          summary[bonus.type] = 0;
        }
        summary[bonus.type] += bonus.value;
      }
    }

    return summary;
  }

  // ============================================================================
  // Slot Management
  // ============================================================================

  /**
   * Get available hardware slots
   */
  getAvailableHardwareSlots(): number {
    return SLOT_LIMITS.hardware - this.inventory.hardware.length;
  }

  /**
   * Get available crew slots
   */
  getAvailableCrewSlots(): number {
    return SLOT_LIMITS.crew - this.inventory.crew.length;
  }

  /**
   * Check if hardware slots are full
   */
  isHardwareFull(): boolean {
    return this.inventory.hardware.length >= SLOT_LIMITS.hardware;
  }

  /**
   * Check if crew slots are full
   */
  isCrewFull(): boolean {
    return this.inventory.crew.length >= SLOT_LIMITS.crew;
  }

  /**
   * Get total slot usage
   */
  getSlotUsage(): { hardware: number; crew: number } {
    return {
      hardware: this.inventory.hardware.length,
      crew: this.inventory.crew.length
    };
  }

  // ============================================================================
  // Persistence
  // ============================================================================

  /**
   * Sync inventory to game state
   */
  private syncToGameState(): void {
    this.game.state.inventory.hardware = [...this.inventory.hardware];
    this.game.state.inventory.crew = [...this.inventory.crew];
  }

  /**
   * Load inventory from game state
   */
  loadFromGameState(): void {
    this.inventory.hardware = [...this.game.state.inventory.hardware];
    this.inventory.crew = [...this.game.state.inventory.crew];
    console.log(`[Inventory] Loaded ${this.inventory.hardware.length} hardware, ${this.inventory.crew.length} crew`);
  }

  /**
   * Save to game state
   */
  private save(): void {
    this.game.saveState();
  }

  /**
   * Clear all items
   */
  clear(): void {
    this.inventory.hardware = [];
    this.inventory.crew = [];
    this.syncToGameState();
    this.save();
  }

  // ============================================================================
  // Item Lookup Helpers
  // ============================================================================

  /**
   * Get item definition by ID (from ALL_ITEMS)
   */
  static getItemDefinition(itemId: string): Item | undefined {
    return ALL_ITEMS.find(i => i.id === itemId);
  }

  /**
   * Get all available item definitions
   */
  static getAllItemDefinitions(): Item[] {
    return [...ALL_ITEMS];
  }

  /**
   * Check if item ID is valid
   */
  static isValidItemId(itemId: string): boolean {
    return ALL_ITEMS.some(i => i.id === itemId);
  }

  // ============================================================================
  // Debug
  // ============================================================================

  /**
   * Get inventory debug info
   */
  getDebugInfo(): string {
    const hw = this.inventory.hardware.map(i => i.name).join(', ') || 'none';
    const crew = this.inventory.crew.map(i => i.name).join(', ') || 'none';
    const bonuses = Object.entries(this.getBonusSummary())
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ') || 'none';

    return `Hardware: [${hw}] | Crew: [${crew}] | Bonuses: {${bonuses}}`;
  }
}
