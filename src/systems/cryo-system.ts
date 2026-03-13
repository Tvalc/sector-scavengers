/**
 * Cryo System
 * 
 * Manages cryo pods containing frozen crew members.
 * Players can wake crew using power cells.
 */

import { CrewMember, generateCrewMember, AUTHORED_RECRUITS, AUTHORED_RECRUIT_DEBT_COST } from '../types/crew';
import { calculateWakeCost } from '../config/economy-config';
import { signalLogSystem } from './signal-log-system';
import type { StoryState } from '../dialogue/story-state';
import type { Game } from '../game/game';

/**
 * Represents a cryo pod
 */
export interface CryoPod {
  /** Unique identifier */
  id: string;
  /** Crew member inside (frozen until woken) */
  crew: CrewMember;
  /** Power cell cost to wake */
  wakeCost: number;
  /** Pod rarity tier (higher = better crew stats) */
  tier: 1 | 2 | 3;
}

/**
 * Cryo manager state
 */
export interface CryoState {
  /** All cryo pods (frozen and awakened) */
  pods: CryoPod[];
  /** Number of awakened crew */
  awakenedCount: number;
  /** Available cryo slots (can add more pods) */
  maxPods: number;
}

/**
 * Create initial cryo state with authored and generic crew
 */
export function createCryoState(): CryoState {
  const pods: CryoPod[] = [];
  const usedAuthoredIds = new Set<string>();
  
  // Add 2 authored recruits (randomly selected)
  const shuffledAuthored = [...AUTHORED_RECRUITS].sort(() => Math.random() - 0.5);
  for (let i = 0; i < 2 && i < shuffledAuthored.length; i++) {
    const authored = shuffledAuthored[i];
    usedAuthoredIds.add(authored.authoredId);
    pods.push(createAuthoredPod(pods.length, authored));
  }
  
  // Add 2 generic crew members
  for (let i = 0; i < 2; i++) {
    pods.push(createRandomPod(pods.length));
  }
  
  return {
    pods,
    awakenedCount: 1, // Player starts awake
    maxPods: 5  // Can add 2 more pods
  };
}

/**
 * Create a cryo pod for an authored recruit
 */
function createAuthoredPod(index: number, authored: typeof AUTHORED_RECRUITS[0]): CryoPod {
  const crew = generateCrewMember(authored);
  
  // Authored recruits cost more power cells and have tier 3 stats
  return {
    id: `cryopod_authored_${index}_${Date.now()}`,
    crew,
    wakeCost: 12, // Higher power cell cost for authored
    tier: 3
  };
}

/**
 * Create a random cryo pod
 */
function createRandomPod(index: number): CryoPod {
  const crew = generateCrewMember();
  const tier = getRandomTier();
  
  // Adjust wake cost based on tier
  let wakeCost = 5;
  if (tier === 2) wakeCost = 8;
  if (tier === 3) wakeCost = 12;
  
  return {
    id: `cryopod_${index}_${Date.now()}`,
    crew,
    wakeCost,
    tier
  };
}

/**
 * Get random tier
 */
function getRandomTier(): 1 | 2 | 3 {
  const roll = Math.random();
  if (roll < 0.6) return 1;       // 60% chance
  if (roll < 0.9) return 2;       // 30% chance
  return 3;                      // 10% chance
}

/**
 * Wake a crew member from cryo
 * @param pod - The cryo pod containing the crew member
 * @param availablePowerCells - Current power cell count
 * @param awakeCount - Number of currently awake crew (for cost calculation)
 * @param storyState - Story state for tracking recruit introductions (optional)
 * @param game - Game instance for debt management (required)
 * @returns Success status, message, cost (power cells), and debt cost
 */
export function wakeCrewMember(
  pod: CryoPod, 
  availablePowerCells: number,
  awakeCount: number = 0,
  storyState?: StoryState,
  game?: Game
): { success: boolean; message: string; cost: number; debtCost: number } {
  if (pod.crew.awake) {
    return { success: false, message: 'Crew member already awake', cost: 0, debtCost: 0 };
  }
  
  // Check if debt locked (at 100% ceiling) - blocks ALL crew wakes
  if (game && game.isDebtLocked()) {
    return { 
      success: false, 
      message: 'DEBT CEILING REACHED - Cannot wake crew', 
      cost: 0, 
      debtCost: 0 
    };
  }
  
  // Calculate wake cost based on current awake crew count
  const wakeCost = calculateWakeCost(awakeCount);
  
  if (availablePowerCells < wakeCost) {
    return { success: false, message: 'Not enough power cells', cost: wakeCost, debtCost: 0 };
  }
  
  // Check debt ceiling for authored recruits (adds debt, must not exceed ceiling)
  if (pod.crew.isAuthored) {
    if (!game) {
      return { success: false, message: 'Cannot recruit - system error', cost: 0, debtCost: 0 };
    }
    
    const newDebt = game.state.meta.debt + AUTHORED_RECRUIT_DEBT_COST;
    const debtCeiling = game.state.meta.debtCeiling;
    
    if (newDebt > debtCeiling) {
      return { 
        success: false, 
        message: `Cannot recruit - would exceed debt ceiling (need ${AUTHORED_RECRUIT_DEBT_COST.toLocaleString()} space)`, 
        cost: 0,
        debtCost: 0
      };
    }
    
    // Add debt for authored recruit
    game.addDebt(AUTHORED_RECRUIT_DEBT_COST, `Recruited ${pod.crew.name}`);
  }
  
  // Wake the crew member
  pod.crew.awake = true;
  
  // Check if this is an authored recruit with story significance
  if (pod.crew.isAuthored && pod.crew.authoredId && storyState) {
    // Only broadcast if not already introduced
    if (!storyState.hasRecruitBeenIntroduced(pod.crew.authoredId)) {
      // Mark as introduced
      storyState.markRecruitIntroduced(pod.crew.authoredId);
      storyState.incrementRecruitsWoken();
      
      // Broadcast to signal log
      const recruitName = pod.crew.name;
      signalLogSystem.addBreakingNews(`CONTRACT SIGNED: ${recruitName} joins station roster`);
      
      console.log(`[Narrative] Recruit arrived: ${recruitName} (${pod.crew.authoredId})`);
    }
  }
  
  return { 
    success: true, 
    message: `${pod.crew.name} awakened from cryo!`, 
    cost: wakeCost,
    debtCost: pod.crew.isAuthored ? AUTHORED_RECRUIT_DEBT_COST : 0
  };
}

/**
 * Get all frozen pods
 */
export function getFrozenPods(state: CryoState): CryoPod[] {
  return state.pods.filter(p => !p.crew.awake);
}

/**
 * Get all awakened crew
 */
export function getAwakenedCrew(state: CryoState): CrewMember[] {
  return state.pods.filter(p => p.crew.awake).map(p => p.crew);
}

/**
 * Add a new cryo pod
 */
export function addCryoPod(state: CryoState, pod?: CryoPod): boolean {
  if (state.pods.length >= state.maxPods) {
    return false;
  }
  
  const newPod = pod || createRandomPod(state.pods.length + 1);
  state.pods.push(newPod);
  
  return true;
}
