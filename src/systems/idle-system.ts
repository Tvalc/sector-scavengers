/**
 * Idle System
 *
 * Handles passive power generation for player-owned ships.
 * Each ship generates 10 Power per minute, capped at 1000 (base).
 */

import type { Game } from '../game/game';
import { Spacecraft } from '../types/spacecraft';
import { POWER_PER_SHIP_PER_MS, BASE_ENERGY_CAP } from '../types/state';
import { getGlobalCrewEfficiencyBonus } from './crew-bonus-system';

/**
 * IdleSystem - manages passive energy generation
 */
export class IdleSystem {
  private game: Game;
  private lastUpdateTime: number = 0;

  /** Power rate constants */
  private static readonly POWER_PER_SHIP_PER_MINUTE = 10;
  private static readonly BASE_ENERGY_CAP = 1000;

  constructor(game: Game) {
    this.game = game;
    this.lastUpdateTime = Date.now();
  }

  /**
   * Get current energy (capped for display)
   */
  get energy(): number {
    return this.game.state.energy;
  }

  /**
   * Get energy cap (base + bonuses)
   */
  get energyCap(): number {
    return this.getEnergyCap();
  }

  /**
   * Update energy generation
   * Called every frame while in idle state
   */
  update(_dt: number): void {
    const now = Date.now();
    const elapsed = now - this.lastUpdateTime;

    // Only process if at least 1 second has passed
    if (elapsed < 1000) return;

    this.lastUpdateTime = now;

    // Get all player-owned ships (defensive null check for corrupted saves)
    const playerShips = (this.game.state.spacecraft ?? []).filter(s => s.owner === 'player');

    if (playerShips.length === 0) return;

    // Get medic efficiency bonus (global +10% per medic assigned)
    const medicBonus = getGlobalCrewEfficiencyBonus(this.game.state.cryoState);
    const efficiencyMultiplier = 1 + medicBonus;

    // Calculate power generated (10 power per ship per minute)
    const powerPerShipPerMs = 10 / 60000; // 10 per minute in ms
    const totalPowerGenerated = playerShips.length * powerPerShipPerMs * elapsed * efficiencyMultiplier;

    // Add power (respects cap with bonuses)
    this.game.addEnergy(totalPowerGenerated);
  }

  /**
   * Get the current energy cap (base + bonuses)
   */
  getEnergyCap(): number {
    const bonusPercent = this.game.getTotalBonus('energy_cap_percent');
    return BASE_ENERGY_CAP * (1 + bonusPercent / 100);
  }

  /**
   * Get power generation rate (power per second)
   */
  getPowerRate(): number {
    // Defensive null check for corrupted saves
    const playerShips = (this.game.state.spacecraft ?? []).filter(s => s.owner === 'player');
    
    // Get medic efficiency bonus
    const medicBonus = getGlobalCrewEfficiencyBonus(this.game.state.cryoState);
    const efficiencyMultiplier = 1 + medicBonus;
    
    // 10 power per minute per ship = 10/60 power per second per ship
    return playerShips.length * (10 / 60) * efficiencyMultiplier;
  }

  /**
   * Reset update timer (call when returning to idle)
   */
  reset(): void {
    this.lastUpdateTime = Date.now();
  }
}
