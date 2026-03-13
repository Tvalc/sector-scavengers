/**
 * Party Selection
 *
 * Methods for managing party selection (lead and companions)
 * for depth dive runs.
 */

import { CrewMember } from '../types/crew';
import { getAwakenedCrew } from '../systems/cryo-system';
import { GameAccess } from './types';

/**
 * Get all awakened authored recruits available for party selection
 */
export function getAwakenedAuthoredRecruits(game: GameAccess): CrewMember[] {
  if (!game.state.cryoState) return [];
  const awakenedCrew = getAwakenedCrew(game.state.cryoState);
  return awakenedCrew.filter(c => c.isAuthored && c.alive);
}

/**
 * Set the lead character for the next run
 */
export function setSelectedLead(game: GameAccess, authoredId: string | null): void {
  // If selecting a character already in companion slots, remove them
  if (authoredId !== null) {
    if (game.state.companionSlots[0] === authoredId) {
      game.state.companionSlots[0] = null;
    }
    if (game.state.companionSlots[1] === authoredId) {
      game.state.companionSlots[1] = null;
    }
  }
  game.state.selectedLead = authoredId;
  game.saveState();
}

/**
 * Set a companion character for the next run
 */
export function setCompanion(game: GameAccess, slotIndex: 0 | 1, authoredId: string | null): void {
  // If selecting a character already as lead or in other slot, remove them
  if (authoredId !== null) {
    if (game.state.selectedLead === authoredId) {
      game.state.selectedLead = null;
    }
    if (game.state.companionSlots[0] === authoredId) {
      game.state.companionSlots[0] = null;
    }
    if (game.state.companionSlots[1] === authoredId) {
      game.state.companionSlots[1] = null;
    }
  }
  game.state.companionSlots[slotIndex] = authoredId;
  game.saveState();
}

/**
 * Get current lead selection
 */
export function getSelectedLead(game: GameAccess): string | null {
  return game.state.selectedLead;
}

/**
 * Get current companion selections
 */
export function getCompanionSlots(game: GameAccess): [string | null, string | null] {
  return [...game.state.companionSlots] as [string | null, string | null];
}
