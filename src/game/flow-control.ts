/**
 * Flow Control
 *
 * Methods for controlling game flow between states, including
 * depth dive operations, sector unlocking, and hub selection.
 */

import { getItemById } from '../types/items';
import { addItem } from '../types/inventory';
import { signalLogSystem } from '../systems/signal-log-system';
import { getAuthoredRecruit } from '../types/crew';
import { GameFlowStates, GameAccess } from './types';
import { formatCurrency } from './debt-system';

/**
 * Start a Depth Dive session
 */
export function startDepthDive(game: GameAccess): void {
  if (game.state.currentRun) {
    console.warn('[Game] Already in a Depth Dive session');
    return;
  }
  
  game.getStateMachine().transition(GameFlowStates.DEPTH_DIVE, game);
  
  // Store the selected ship as the run target
  if (game.state.currentRun && game.state.hubSelectedShips.length > 0) {
    game.state.currentRun.targetShipId = game.state.hubSelectedShips[0];
    console.log(`[Game] Starting dive with target ship ${game.state.currentRun.targetShipId}`);
  }
  
  // Copy party selection into run state
  if (game.state.currentRun) {
    game.state.currentRun.leadId = game.state.selectedLead;
    game.state.currentRun.companionIds = [...game.state.companionSlots] as [string | null, string | null];
    
    const leadName = game.state.selectedLead ? getAuthoredRecruit(game.state.selectedLead)?.name ?? 'Unknown' : 'Generic Captain';
    const companionNames = game.state.companionSlots
      .filter(id => id !== null)
      .map(id => getAuthoredRecruit(id!)?.name ?? 'Unknown')
      .join(', ');
    console.log(`[Game] Party: Lead=${leadName}, Companions=[${companionNames || 'none'}]`);
  }
}

/**
 * End the Depth Dive and show results
 */
export function endDepthDive(game: GameAccess): void {
  if (!game.state.currentRun) {
    console.warn('[Game] No active Depth Dive session');
    return;
  }
  
  const run = game.state.currentRun;
  const targetId = run.targetShipId;
  
  // Transfer collected items to inventory
  if (!run.collapsed && run.collectedItems.length > 0) {
    console.log(`[Game] Transferring ${run.collectedItems.length} items to inventory`);
    for (const itemId of run.collectedItems) {
      const item = getItemById(itemId);
      if (item) {
        addItem(game.state.inventory, item);
        console.log(`[Game] Added ${item.name} to inventory`);
      } else {
        console.warn(`[Game] Unknown item ID: ${itemId}`);
      }
    }
  }
  
  // Handle debt service
  processDebtService(game, run);
  
  // Handle persisted ship logic
  if (targetId !== null) {
    if (run.targetRepairedThisRun) {
      if (!game.state.persistedShips.includes(targetId)) {
        game.state.persistedShips.push(targetId);
        console.log(`[Game] Ship ${targetId} repaired and will persist on board`);
      }
    } else {
      const index = game.state.persistedShips.indexOf(targetId);
      if (index !== -1) {
        game.state.persistedShips.splice(index, 1);
        console.log(`[Game] Ship ${targetId} not repaired, removing from board`);
      }
    }
  }
  
  clearHubSelectedShips(game);
  game.advanceBillingCycle();
  
  if (!run.collapsed) {
    game.storyState.incrementMissionsCompleted();
    const missionsCompleted = game.storyState.getMissionsCompleted();
    
    let threshold = 3;
    if (game.state.meta.doctrine === 'cooperative') {
      threshold = 4;
    }
    
    const nextSector = Math.floor(missionsCompleted / threshold) + 2;
    if (nextSector > game.state.meta.currentSector) {
      checkSectorUnlock(game, nextSector);
    }
  }
  
  game.getStateMachine().transition(GameFlowStates.RESULTS, game);
}

/**
 * Process debt service from successful runs
 */
function processDebtService(game: GameAccess, run: NonNullable<GameAccess['state']['currentRun']>): void {
  if (!run.collapsed && run.extractedRewards > 0) {
    let debtPaymentRate = 0.05;
    if (game.state.meta.doctrine === 'cooperative') {
      debtPaymentRate = 0.03;
    }
    
    const debtPayment = Math.floor(run.extractedRewards * debtPaymentRate);
    if (debtPayment > 0) {
      game.applyDebtPayment(debtPayment);
      signalLogSystem.addBreakingNews(`DEBT SERVICE: ${formatCurrency(debtPayment)} applied to outstanding balance`);
      console.log(`[Debt] Serviced debt: -${formatCurrency(debtPayment)} (${(debtPaymentRate * 100).toFixed(0)}% rate)`);
    }
  } else if (run.collapsed) {
    signalLogSystem.addBreakingNews('RUN FAILED: No debt payment processed. Momentum stalled.');
    console.log('[Debt] No debt payment (run collapsed)');
  }
}

/**
 * Return to idle state from results
 */
export function returnToIdle(game: GameAccess): void {
  game.getStateMachine().transition(GameFlowStates.IDLE, game);
}

/**
 * Check and unlock new sectors based on progress
 */
export function checkSectorUnlock(game: GameAccess, newSector: number): boolean {
  if (newSector < 2 || newSector > 7) return false;
  if (game.storyState.hasSectorUnlocked(newSector)) return false;
  
  const currentSector = game.state.meta.currentSector;
  if (newSector !== currentSector + 1) return false;
  
  game.storyState.markSectorUnlocked(newSector);
  game.state.meta.currentSector = newSector;
  
  signalLogSystem.addBreakingNews(
    `SECTOR UNLOCKED: Access granted to Sector ${newSector}. New salvage opportunities available.`
  );
  
  console.log(`[Narrative] Sector unlocked: ${newSector}`);
  return true;
}

/**
 * Set selected hub ships for the next dive
 */
export function setHubSelectedShips(game: GameAccess, ids: number[]): void {
  game.state.hubSelectedShips = [...ids];
}

/**
 * Get currently selected hub ships
 */
export function getHubSelectedShips(game: GameAccess): number[] {
  return [...game.state.hubSelectedShips];
}

/**
 * Clear hub selection
 */
export function clearHubSelectedShips(game: GameAccess): void {
  game.state.hubSelectedShips = [];
}
