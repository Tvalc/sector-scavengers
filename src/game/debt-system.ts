/**
 * Debt System
 *
 * Manages debt mechanics including ceiling calculations, payments,
 * thresholds, billing cycles, and warnings.
 */

import { signalLogSystem } from '../systems/signal-log-system';
import { GameAccess } from './types';

/**
 * Calculate dynamic debt ceiling based on stations and sectors
 */
export function calculateDebtCeiling(game: GameAccess): number {
  const BASE_CEILING = 1000000;
  const PER_STATION = 750000;
  const PER_SECTOR = 2000000;
  
  const stationCount = game.state.spacecraft.filter(s => s.mode === 'station').length;
  const sectorCount = game.state.meta.currentSector;
  
  let ceiling = BASE_CEILING + (stationCount * PER_STATION) + (sectorCount * PER_SECTOR);
  
  if (game.state.meta.doctrine === 'corporate') {
    ceiling += 1000000;
  }
  
  console.log(`[Debt] Ceiling calculated: ${formatCurrency(ceiling)} (${stationCount} stations, Sector ${sectorCount})`);
  
  return ceiling;
}

/**
 * Apply a payment to debt (reduces debt)
 */
export function applyDebtPayment(game: GameAccess, amount: number): void {
  game.state.meta.debt = Math.max(0, game.state.meta.debt - amount);
  checkDebtThresholds(game);
}

/**
 * Add to debt (increases debt)
 */
export function addDebt(game: GameAccess, amount: number, reason: string): void {
  game.state.meta.debt += amount;
  game.state.meta.debtCeiling = calculateDebtCeiling(game);
  checkDebtThresholds(game);
  
  signalLogSystem.addBreakingNews(`DEBT INCREASED: ${formatCurrency(amount)} - ${reason}`);
  console.log(`[Debt] +${formatCurrency(amount)} (${reason}). Total: ${formatCurrency(game.state.meta.debt)} / ${formatCurrency(game.state.meta.debtCeiling)}`);
}

/**
 * Check and announce debt threshold warnings
 */
export function checkDebtThresholds(game: GameAccess): void {
  const ratio = game.state.meta.debt / game.state.meta.debtCeiling;
  const percentage = Math.round(ratio * 100);
  
  if (percentage >= 100 && !game.storyState.hasDebtThresholdBeenAnnounced(100)) {
    game.storyState.markDebtThreshold(100);
    signalLogSystem.addBreakingNews('CRITICAL: Debt ceiling reached! Operations restricted.');
    console.log('[Debt] CRITICAL: 100% threshold reached');
  } else if (percentage >= 90 && !game.storyState.hasDebtThresholdBeenAnnounced(90)) {
    game.storyState.markDebtThreshold(90);
    signalLogSystem.addBreakingNews('WARNING: Debt at 90% capacity. Restricted operations.');
    console.log('[Debt] WARNING: 90% threshold reached');
  } else if (percentage >= 80 && !game.storyState.hasDebtThresholdBeenAnnounced(80)) {
    game.storyState.markDebtThreshold(80);
    signalLogSystem.addBreakingNews('CAUTION: Debt at 80% capacity.');
    console.log('[Debt] CAUTION: 80% threshold reached');
  }
}

/**
 * Check if player is debt-locked
 */
export function isDebtLocked(game: GameAccess): boolean {
  return game.state.meta.debt >= game.state.meta.debtCeiling;
}

/**
 * Get debt ratio (0.0 to 1.0+)
 */
export function getDebtRatio(game: GameAccess): number {
  return game.state.meta.debt / game.state.meta.debtCeiling;
}

/**
 * Advance billing cycle (called after each run)
 */
export function advanceBillingCycle(game: GameAccess): void {
  game.state.meta.billingTimer++;
  
  console.log(`[Debt] Billing cycle: ${game.state.meta.billingTimer}/3`);
  
  if (game.state.meta.billingTimer >= 3) {
    processBillingPayment(game);
    game.state.meta.billingTimer = 0;
  }
}

/**
 * Process billing payment (called every 3 runs)
 */
function processBillingPayment(game: GameAccess): void {
  const minimumPayment = 50000;
  const percentagePayment = game.state.meta.debt * 0.05;
  const paymentDue = Math.max(minimumPayment, Math.floor(percentagePayment));
  
  game.state.meta.paymentDue = paymentDue;
  
  signalLogSystem.addBreakingNews(`BILLING CYCLE: Payment of ${formatCurrency(paymentDue)} due.`);
  console.log(`[Debt] Billing cycle complete. Payment due: ${formatCurrency(paymentDue)}`);
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return amount.toLocaleString('en-US');
}
