/**
 * Companion Banter Display
 * 
 * Displays contextual banter for discovery and hull breach events.
 */

import { getAuthoredRecruit } from '../../types/crew';
import { displayBanterToast, getRandomBanter } from '../../dialogue/companion-banter';
import { COLORS } from '../../ui/theme';
import type { Game } from '../../game/game';

/**
 * Display banter for discovery events
 */
export function displayDiscoveryBanter(game: Game): void {
  const run = game.state.currentRun;
  if (!run) return;
  
  const partyMembers = getPartyMembers(run);
  
  for (const authoredId of partyMembers) {
    const recruit = getAuthoredRecruit(authoredId);
    if (!recruit) continue;
    
    const banter = getRandomBanter(authoredId, 'discovery');
    if (banter) {
      displayBanterToast(recruit.name, banter, COLORS.neonCyan);
      break;
    }
  }
}

/**
 * Display banter for hull breach events
 */
export function displayCollapseBanter(game: Game): void {
  const run = game.state.currentRun;
  if (!run) return;
  
  const partyMembers = getPartyMembers(run);
  
  for (const authoredId of partyMembers) {
    const recruit = getAuthoredRecruit(authoredId);
    if (!recruit) continue;
    
    const banter = getRandomBanter(authoredId, 'hullBreach');
    if (banter) {
      displayBanterToast(recruit.name, banter, COLORS.warningRed);
      break;
    }
  }
}

function getPartyMembers(run: NonNullable<typeof Game.prototype.state.currentRun>): string[] {
  const members: string[] = [];
  if (run.leadId) members.push(run.leadId);
  if (run.companionIds[0]) members.push(run.companionIds[0]);
  if (run.companionIds[1]) members.push(run.companionIds[1]);
  return members;
}
