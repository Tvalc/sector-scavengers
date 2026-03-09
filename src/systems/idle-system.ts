/**
 * Idle System
 *
 * Handles passive energy generation for player-owned nodes.
 * Each node generates 10 Energy per minute, capped at 1000 (base).
 */

import type { Game } from '../game/game';
import { Node } from '../types/node';
import { ENERGY_PER_NODE_PER_MS, BASE_ENERGY_CAP } from '../types/state';

/**
 * IdleSystem - manages passive energy generation
 */
export class IdleSystem {
  private game: Game;
  private lastUpdateTime: number = 0;

  /** Energy rate constants */
  private static readonly ENERGY_PER_NODE_PER_MINUTE = 10;
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

    // Get all player-owned nodes
    const playerNodes = this.game.state.nodes.filter(n => n.owner === 'player');

    if (playerNodes.length === 0) return;

    // Calculate energy generated (10 energy per node per minute)
    const energyPerNodePerMs = 10 / 60000; // 10 per minute in ms
    const totalEnergyGenerated = playerNodes.length * energyPerNodePerMs * elapsed;

    // Add energy (respects cap with bonuses)
    this.game.addEnergy(totalEnergyGenerated);
  }

  /**
   * Get the current energy cap (base + bonuses)
   */
  getEnergyCap(): number {
    const bonusPercent = this.game.getTotalBonus('energy_cap_percent');
    return BASE_ENERGY_CAP * (1 + bonusPercent / 100);
  }

  /**
   * Get energy generation rate (energy per second)
   */
  getEnergyRate(): number {
    const playerNodes = this.game.state.nodes.filter(n => n.owner === 'player');
    // 10 energy per minute per node = 10/60 energy per second per node
    return playerNodes.length * (10 / 60);
  }

  /**
   * Reset update timer (call when returning to idle)
   */
  reset(): void {
    this.lastUpdateTime = Date.now();
  }
}
