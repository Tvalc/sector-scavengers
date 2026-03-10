/**
 * Cryo System
 * 
 * Manages cryo pods containing frozen crew members.
 * Players can wake crew using power cells.
 */

import { CrewMember, generateCrewMember } from '../types/crew';
import { calculateWakeCost } from '../config/economy-config';

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
 * Create initial cryo state with 3 frozen pods
 */
export function createCryoState(): CryoState {
  const pods: CryoPod[] = [];
  
  // Start with 3 frozen crew members
  for (let i = 0; i <= 3; i++) {
    pods.push(createRandomPod(i));
  }
  
  return {
    pods,
    awakenedCount: 1, // Player starts awake
    maxPods: 5  // Can add 2 more pods
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
 */
export function wakeCrewMember(
  pod: CryoPod, 
  availablePowerCells: number,
  awakeCount: number = 0
): { success: boolean; message: string; cost: number } {
  if (pod.crew.awake) {
    return { success: false, message: 'Crew member already awake', cost: 0 };
  }
  
  // Calculate wake cost based on current awake crew count
  const wakeCost = calculateWakeCost(awakeCount);
  
  if (availablePowerCells < wakeCost) {
    return { success: false, message: 'Not enough power cells', cost: wakeCost };
  }
  
  // Wake the crew member
  pod.crew.awake = true;
  
  return { success: true, message: `${pod.crew.name} awakened from cryo!`, cost: wakeCost };
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
