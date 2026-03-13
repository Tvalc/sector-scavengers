/**
 * Crew Bonus System
 * 
 * Provides helper functions to check crew assignments and calculate bonuses.
 * Centralizes all crew-related bonus logic for use by card systems.
 */

import { CryoState } from './cryo-system';
import { CrewRole } from '../types/crew';
import { CREW_OPERATION_BONUSES } from '../config/economy-config';
import type { GameState, DoctrineType } from '../types/state';

/**
 * Check if a specific role is assigned to a ship
 */
export function hasAssignedRole(cryoState: CryoState, shipId: number, role: CrewRole): boolean {
  const awakenedCrew = cryoState.pods
    .filter(p => p.crew.awake)
    .map(p => p.crew);
  
  return awakenedCrew.some(crew => 
    crew.role === role &&
    crew.assignment &&
    crew.assignment.type === 'ship' &&
    crew.assignment.targetId === shipId
  );
}

/**
 * Check if any engineer is assigned to a ship
 */
export function hasAssignedEngineer(cryoState: CryoState, shipId: number): boolean {
  return hasAssignedRole(cryoState, shipId, CrewRole.Engineer);
}

/**
 * Check if any scientist is assigned to a ship
 */
export function hasAssignedScientist(cryoState: CryoState, shipId: number): boolean {
  return hasAssignedRole(cryoState, shipId, CrewRole.Scientist);
}

/**
 * Check if any medic is assigned to a ship
 */
export function hasAssignedMedic(cryoState: CryoState, shipId: number): boolean {
  return hasAssignedRole(cryoState, shipId, CrewRole.Medic);
}

/**
 * Check if any scavenger is assigned to a ship
 */
export function hasAssignedScavenger(cryoState: CryoState, shipId: number): boolean {
  return hasAssignedRole(cryoState, shipId, CrewRole.Scavenger);
}

/**
 * Get hull repair multiplier from engineer bonus
 * Returns 1.5 if engineer assigned, 1.0 otherwise
 */
export function getHullRepairMultiplier(cryoState: CryoState, shipId: number): number {
  if (hasAssignedEngineer(cryoState, shipId)) {
    return CREW_OPERATION_BONUSES[CrewRole.Engineer].hullRepairMultiplier;
  }
  return 1.0;
}

/**
 * Get discovery bonus from scientist
 * Returns 0.15 (15%) if scientist assigned, 0 otherwise
 */
export function getDiscoveryBonus(cryoState: CryoState, shipId: number): number {
  if (hasAssignedScientist(cryoState, shipId)) {
    return CREW_OPERATION_BONUSES[CrewRole.Scientist].discoveryBonus;
  }
  return 0;
}

/**
 * Get global crew efficiency bonus from medics
 * Returns 0.10 (10%) per medic assigned to any ship
 * This is a global bonus, not per-ship
 * 
 * Doctrine effects:
 * - Corporate: -10% penalty
 * - Cooperative: +10% bonus
 * - Smuggler: No modifier
 */
export function getGlobalCrewEfficiencyBonus(cryoState: CryoState, gameState?: GameState): number {
  const awakenedCrew = cryoState.pods
    .filter(p => p.crew.awake)
    .map(p => p.crew);
  
  const medicCount = awakenedCrew.filter(crew => 
    crew.role === CrewRole.Medic &&
    crew.assignment &&
    crew.assignment.type === 'ship'
  ).length;
  
  // Each medic provides 10% bonus
  let bonus = medicCount * CREW_OPERATION_BONUSES[CrewRole.Medic].crewEfficiencyBonus;
  
  // Apply doctrine modifiers
  if (gameState && gameState.meta.doctrine) {
    const doctrine = gameState.meta.doctrine;
    
    if (doctrine === 'corporate') {
      bonus -= 0.10; // -10% penalty
    } else if (doctrine === 'cooperative') {
      bonus += 0.10; // +10% bonus
    }
  }
  
  return Math.max(0, bonus); // Ensure bonus is never negative
}

/**
 * Get resource yield multiplier from scavenger bonus
 * Returns 1.25 if scavenger assigned, 1.0 otherwise
 */
export function getResourceYieldMultiplier(cryoState: CryoState, shipId: number): number {
  if (hasAssignedScavenger(cryoState, shipId)) {
    return CREW_OPERATION_BONUSES[CrewRole.Scavenger].resourceYieldMultiplier;
  }
  return 1.0;
}

/**
 * Get count of assigned crew of a specific role
 */
export function getAssignedRoleCount(cryoState: CryoState, role: CrewRole): number {
  const awakenedCrew = cryoState.pods
    .filter(p => p.crew.awake)
    .map(p => p.crew);
  
  return awakenedCrew.filter(crew => 
    crew.role === role &&
    crew.assignment &&
    crew.assignment.type === 'ship'
  ).length;
}

/**
 * Check if ship has engineer (required for conversion)
 */
export function canConvertShip(cryoState: CryoState, shipId: number): boolean {
  return hasAssignedEngineer(cryoState, shipId);
}
