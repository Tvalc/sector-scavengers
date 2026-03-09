import { Item, ItemCategory } from './items';

/**
 * Player inventory tracking Hardware and Crew items
 */
export interface Inventory {
  /** Hardware items equipped */
  hardware: Item[];
  /** Crew members recruited */
  crew: Item[];
}

/**
 * Creates an empty inventory
 */
export function createInventory(): Inventory {
  return {
    hardware: [],
    crew: []
  };
}

/**
 * Add an item to the inventory
 */
export function addItem(inventory: Inventory, item: Item): void {
  if (item.category === 'hardware') {
    inventory.hardware.push(item);
  } else {
    inventory.crew.push(item);
  }
}

/**
 * Check if inventory contains an item by ID
 */
export function hasItem(inventory: Inventory, itemId: string): boolean {
  return (
    inventory.hardware.some(item => item.id === itemId) ||
    inventory.crew.some(item => item.id === itemId)
  );
}

/**
 * Check if inventory contains an item by category and ID
 */
export function hasItemByCategory(inventory: Inventory, itemId: string, category: ItemCategory): boolean {
  const items = category === 'hardware' ? inventory.hardware : inventory.crew;
  return items.some(item => item.id === itemId);
}

/**
 * Remove an item from the inventory by ID
 */
export function removeItem(inventory: Inventory, itemId: string): boolean {
  const hwIndex = inventory.hardware.findIndex(item => item.id === itemId);
  if (hwIndex !== -1) {
    inventory.hardware.splice(hwIndex, 1);
    return true;
  }
  
  const crewIndex = inventory.crew.findIndex(item => item.id === itemId);
  if (crewIndex !== -1) {
    inventory.crew.splice(crewIndex, 1);
    return true;
  }
  
  return false;
}

/**
 * Get all items from inventory
 */
export function getAllItems(inventory: Inventory): Item[] {
  return [...inventory.hardware, ...inventory.crew];
}

/**
 * Get total bonus value for a specific bonus type
 */
export function getTotalBonus(inventory: Inventory, bonusType: string): number {
  return getAllItems(inventory).reduce((total, item) => {
    const matchingBonus = item.bonuses.find(b => b.type === bonusType);
    return total + (matchingBonus?.value ?? 0);
  }, 0);
}
