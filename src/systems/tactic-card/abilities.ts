/**
 * Character Abilities
 *
 * Lead character special abilities that modify card gameplay.
 * - Max Chen: Working Memory (reroll hand)
 * - Rook Stone: Dead Drop (bank 50% rewards)
 */

import { displayAbilityToast } from '../../dialogue/companion-banter';
import type { Game } from '../../game/game';

/**
 * Activate Working Memory (Max Chen's ability) - reroll current hand
 * @returns true if ability was activated
 */
export function activateWorkingMemory(game: Game): boolean {
  const run = game.state.currentRun;
  if (!run) return false;

  if (run.leadId !== 'max_chen') return false;
  if (run.abilityUsage.workingMemoryUsed) return false;
  if (!run.firstHandDealt) return false;

  run.abilityUsage.workingMemoryUsed = true;
  displayAbilityToast('WORKING MEMORY', 'Hand rerolled for better options!');

  console.log('[Abilities] Max Chen: Working Memory activated');
  return true;
}

/**
 * Check if reroll button should be visible
 */
export function canShowRerollButton(game: Game): boolean {
  const run = game.state.currentRun;
  if (!run) return false;

  return (
    run.leadId === 'max_chen' &&
    !run.abilityUsage.workingMemoryUsed &&
    run.firstHandDealt
  );
}

/**
 * Activate Dead Drop (Rook's ability) - bank 50% of current rewards
 * @returns true if ability was activated
 */
export function activateDeadDrop(game: Game): boolean {
  const run = game.state.currentRun;
  if (!run) return false;

  if (run.leadId !== 'rook_stone') return false;
  if (run.abilityUsage.deadDropUsed) return false;
  if (run.extractedRewards <= 0) return false;

  const bankAmount = Math.floor(run.extractedRewards * 0.5);
  run.bankedRewards += bankAmount;
  run.extractedRewards -= bankAmount;
  run.abilityUsage.deadDropUsed = true;

  displayAbilityToast('DEAD DROP', `Banked ${bankAmount} energy safely!`);
  console.log(`[Abilities] Rook Stone: Dead Drop - banked ${bankAmount}`);

  return true;
}

/**
 * Check if Dead Drop button should be visible
 */
export function canShowDeadDropButton(game: Game): boolean {
  const run = game.state.currentRun;
  if (!run) return false;

  return (
    run.leadId === 'rook_stone' &&
    !run.abilityUsage.deadDropUsed &&
    run.extractedRewards > 0
  );
}
