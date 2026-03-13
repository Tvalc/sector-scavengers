/**
 * State Management
 *
 * Methods for managing game state including energy, viral multiplier,
 * ships, and bonus calculations.
 */

import { Spacecraft } from '../types/spacecraft';
import { VIRAL_MULTIPLIER_DURATION, VIRAL_MULTIPLIER_BOOST } from '../types/state';
import { GameAccess } from './types';

/**
 * Add energy to the game state (respects cap)
 */
export function addEnergy(game: GameAccess, amount: number): void {
  const baseCap = 1000;
  const bonusPercent = getTotalBonus(game, 'energy_cap_percent');
  const cap = baseCap * (1 + bonusPercent / 100);
  game.state.energy = Math.min(cap, game.state.energy + amount);
}

/**
 * Spend energy (returns true if successful)
 */
export function spendEnergy(game: GameAccess, amount: number): boolean {
  if (game.state.energy >= amount) {
    game.state.energy -= amount;
    return true;
  }
  return false;
}

/**
 * Activate viral multiplier (from sharing)
 */
export function activateViralMultiplier(game: GameAccess): void {
  game.state.viralMultiplier = VIRAL_MULTIPLIER_BOOST;
  game.state.viralMultiplierExpiry = Date.now() + VIRAL_MULTIPLIER_DURATION;
}

/**
 * Check and update viral multiplier expiry
 */
export function updateViralMultiplier(game: GameAccess): void {
  if (game.state.viralMultiplierExpiry && Date.now() >= game.state.viralMultiplierExpiry) {
    game.state.viralMultiplier = 1.0;
    game.state.viralMultiplierExpiry = null;
  }
}

/**
 * Get current viral multiplier (checks expiry)
 */
export function getViralMultiplier(game: GameAccess): number {
  updateViralMultiplier(game);
  return game.state.viralMultiplier;
}

/**
 * Get a ship by ID
 */
export function getShip(game: GameAccess, id: number): Spacecraft | undefined {
  return game.state.spacecraft.find(s => s.id === id);
}

/**
 * Get all player-owned ships
 */
export function getPlayerShips(game: GameAccess): Spacecraft[] {
  return game.state.spacecraft.filter(s => s.owner === 'player');
}

/**
 * Get total bonus from inventory items
 */
export function getTotalBonus(game: GameAccess, bonusType: string): number {
  const allItems = [...game.state.inventory.hardware, ...game.state.inventory.crew];
  return allItems.reduce((total, item) => {
    const matchingBonus = item.bonuses.find(b => b.type === bonusType);
    return total + (matchingBonus?.value ?? 0);
  }, 0);
}

/**
 * Mark tutorial as seen
 */
export function markTutorialSeen(game: GameAccess): void {
  game.state.tutorialSeen = true;
  game.saveState();
}

/**
 * Check if tutorial has been seen
 */
export function isTutorialSeen(game: GameAccess): boolean {
  return game.state.tutorialSeen;
}

/**
 * Set tutorial skip preference
 */
export function setTutorialSkipped(game: GameAccess, value: boolean): void {
  game.state.tutorialSkipped = value;
  game.saveState();
}

/**
 * Check if tutorial should be skipped
 */
export function isTutorialSkipped(game: GameAccess): boolean {
  return game.state.tutorialSkipped ?? false;
}
