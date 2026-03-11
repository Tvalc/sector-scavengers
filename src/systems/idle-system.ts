/**
 * Idle System
 *
 * Handles passive power generation for player-owned ships.
 * Each ship generates 10 Power per minute, capped at 1000 (base).
 */

import type { Game } from '../game/game';
import { BASE_ENERGY_CAP } from '../types/state';
import { getGlobalCrewEfficiencyBonus } from './crew-bonus-system';
import { signalLogSystem } from './signal-log-system';
import type { StoryState } from '../dialogue/story-state';

/**
 * Billing cycle configuration
 */
const BILLING_CYCLE_INTERVAL_MS = 60000; // 1 minute billing cycles

/**
 * IdleSystem - manages passive energy generation and billing cycles
 */
export class IdleSystem {
  private game: Game;
  private lastUpdateTime: number = 0;
  private lastBillingTime: number = 0;

  /** Power rate constants */
  private static readonly POWER_PER_SHIP_PER_MINUTE = 10;
  private static readonly BASE_ENERGY_CAP = 1000;

  constructor(game: Game) {
    this.game = game;
    this.lastUpdateTime = Date.now();
    this.lastBillingTime = Date.now();
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
   * Update energy generation and billing cycles
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

    // Process billing cycles and debt warnings
    this.processBillingCycle();
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
    this.lastBillingTime = Date.now();
  }

  /**
   * Process billing cycles and debt threshold warnings
   * Broadcasts warnings at 80%, 90%, 100% of debt ceiling
   */
  private processBillingCycle(): void {
    const now = Date.now();
    const meta = this.game.state.meta;
    const storyState = this.game.storyState;
    
    // Calculate debt percentage (0.0 to 1.0+ range)
    const debtRatio = meta.debt / meta.debtCeiling;
    const percentage = Math.floor(debtRatio * 100);
    
    // Check debt thresholds and broadcast warnings if not yet announced
    this.checkDebtThreshold(80, percentage, storyState);
    this.checkDebtThreshold(90, percentage, storyState);
    this.checkDebtThreshold(100, percentage, storyState);
    
    // Check billing cycle interval
    const billingElapsed = now - this.lastBillingTime;
    if (billingElapsed >= BILLING_CYCLE_INTERVAL_MS) {
      this.lastBillingTime = now;
      
      // Increment debt cycles counter
      storyState.incrementDebtCycles();
      
      // Broadcast billing cycle statement
      const paymentAmount = this.formatDebt(meta.debt * 0.01); // 1% of debt as payment
      signalLogSystem.addBreakingNews(`BILLING CYCLE: Payment of ${paymentAmount} processed`);
    }
  }

  /**
   * Check a specific debt threshold and broadcast warning if crossed and not yet announced
   */
  private checkDebtThreshold(
    threshold: 80 | 90 | 100,
    currentPercentage: number,
    storyState: StoryState
  ): void {
    // Only broadcast if we've crossed the threshold
    if (currentPercentage < threshold) return;
    
    // Only broadcast if we haven't already announced this threshold
    if (storyState.hasDebtThresholdBeenAnnounced(threshold)) return;
    
    // Mark as announced
    storyState.markDebtThreshold(threshold);
    
    // Broadcast appropriate message
    let message: string;
    if (threshold === 80) {
      message = 'DEBT WARNING: Station operating at 80% credit limit';
    } else if (threshold === 90) {
      message = 'CRITICAL: Station at 90% debt capacity. Expansion restricted.';
    } else {
      message = 'DEBT CAP REACHED: Station frozen. No new contracts.';
    }
    
    signalLogSystem.addBreakingNews(message);
    console.log(`[Narrative] Debt warning broadcast: ${threshold}%`);
  }

  /**
   * Format debt number for display
   */
  private formatDebt(amount: number): string {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`;
    }
    return `${Math.floor(amount)}`;
  }
}
