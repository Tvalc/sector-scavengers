/**
 * Doctrine System
 *
 * Manages doctrine points, milestones, and locking mechanics.
 */

import { DoctrineType, DoctrinePoints } from '../types/state';
import { signalLogSystem } from '../systems/signal-log-system';
import { GameAccess } from './types';

/**
 * Add doctrine points to a specific doctrine
 */
export function addDoctrinePoints(game: GameAccess, doctrine: DoctrineType, points: number): void {
  if (game.state.meta.doctrine) {
    return; // Already locked
  }
  
  game.state.meta.doctrinePoints[doctrine] += points;
  checkDoctrineMilestones(game, doctrine);
  checkDoctrineLock(game);
}

/**
 * Check for doctrine milestone commentary
 */
function checkDoctrineMilestones(game: GameAccess, doctrine: DoctrineType): void {
  const points = game.state.meta.doctrinePoints[doctrine];
  const milestoneKey = `${doctrine}_${points}`;
  
  if (game.storyState.hasFlag(`doctrine_milestone_${milestoneKey}`)) {
    return;
  }
  
  const doctrineNames = {
    corporate: 'Corporate',
    cooperative: 'Cooperative',
    smuggler: 'Independent'
  };
  
  let message: string | null = null;
  
  if (points === 5) {
    message = `TRENDS ANALYZED: Station showing ${doctrineNames[doctrine]} tendencies`;
    game.storyState.setFlag(`doctrine_milestone_${milestoneKey}`);
  } else if (points === 8) {
    message = `ASSESSMENT: ${doctrineNames[doctrine]} alignment becoming clear`;
    game.storyState.setFlag(`doctrine_milestone_${milestoneKey}`);
  }
  
  if (message) {
    signalLogSystem.addBreakingNews(message);
    console.log(`[Doctrine] Milestone: ${doctrine} at ${points} points`);
  }
}

/**
 * Check if doctrine should lock (10 points with clear majority)
 */
export function checkDoctrineLock(game: GameAccess): void {
  if (game.state.meta.doctrine) {
    return;
  }
  
  const points = game.state.meta.doctrinePoints;
  const corporate = points.corporate;
  const cooperative = points.cooperative;
  const smuggler = points.smuggler;
  
  const maxDoctrine = Math.max(corporate, cooperative, smuggler);
  
  if (maxDoctrine < 10) return;
  
  let leadingDoctrine: DoctrineType | null = null;
  let leadCount = 0;
  
  if (corporate === maxDoctrine) {
    leadingDoctrine = 'corporate';
    leadCount++;
  }
  if (cooperative === maxDoctrine) {
    leadingDoctrine = 'cooperative';
    leadCount++;
  }
  if (smuggler === maxDoctrine) {
    leadingDoctrine = 'smuggler';
    leadCount++;
  }
  
  if (leadCount > 1) return;
  
  game.state.meta.doctrine = leadingDoctrine;
  
  const doctrineNames = {
    corporate: 'CORPORATE CHARTER',
    cooperative: 'COOPERATIVE ALLIANCE',
    smuggler: 'INDEPENDENT CONTRACTOR'
  };
  
  signalLogSystem.addBreakingNews(
    `DOCTRINE ESTABLISHED: Station classified as ${doctrineNames[leadingDoctrine!]}`
  );
  
  console.log(`[Doctrine] Locked in: ${leadingDoctrine}`);
}

/**
 * Get current doctrine progress for display
 */
export function getDoctrineProgress(game: GameAccess): { doctrine: DoctrineType | null; points: DoctrinePoints; total: number } {
  const points = game.state.meta.doctrinePoints;
  const total = points.corporate + points.cooperative + points.smuggler;
  return {
    doctrine: game.state.meta.doctrine,
    points,
    total
  };
}

/**
 * Check if player has a specific doctrine
 */
export function hasDoctrine(game: GameAccess, doctrine: DoctrineType): boolean {
  return game.state.meta.doctrine === doctrine;
}

/**
 * Check if doctrine is locked (any doctrine)
 */
export function isDoctrineLocked(game: GameAccess): boolean {
  return game.state.meta.doctrine !== null;
}
