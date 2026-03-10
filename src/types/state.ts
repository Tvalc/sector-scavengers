import { Spacecraft } from './spacecraft';
import { Resources, createResources } from './resources';
import { Inventory, createInventory } from './inventory';
import { CryoState, createCryoState } from '../systems/cryo-system';
import { Mission } from './mission';

/**
 * Current run state during a Salvage Operation session
 */
export interface RunState {
  /** Current round (1-10) */
  round: number;
  /** Number of shields (0-2), protects from Hull Breach */
  shields: number;
  /** Rewards extracted this run */
  extractedRewards: number;
  /** Whether the ship has suffered a hull breach this run */
  collapsed: boolean;
  /** Items collected this run (not yet added to inventory) */
  collectedItems: string[];
}

/**
 * Creates a fresh run state for a new Depth Dive
 */
export function createRunState(): RunState {
  return {
    round: 1,
    shields: 0,
    extractedRewards: 0,
    collapsed: false,
    collectedItems: []
  };
}

/**
 * Global game state
 */
export interface GameState {
  /** Total power available (max 1000) */
  energy: number;
  /** All 16 ships in the 4x4 grid */
  spacecraft: Spacecraft[];
  /** Player resources */
  resources: Resources;
  /** Player's inventory of Hardware and Crew */
  inventory: Inventory;
  /** Current viral multiplier (1.0 base, 1.5 for 2 hours after sharing) */
  viralMultiplier: number;
  /** Timestamp when viral multiplier expires (null if not active) */
  viralMultiplierExpiry: number | null;
  /** Current Depth Dive run state (null if not in a run) */
  currentRun: RunState | null;
  /** Total $PLAY earned across all sessions */
  totalPlayEarned: number;
  /** Total extractions completed */
  totalExtractions: number;
  /** Total hull breaches experienced */
  totalCollapses: number;
  /** Whether the tutorial has been seen */
  tutorialSeen: boolean;
  /** Whether the tutorial should be skipped (player preference) */
  tutorialSkipped?: boolean;
  /** Selected hub ship IDs for next dive (0-15) */
  hubSelectedShips: number[];
  /** Cryo system state */
  cryoState: CryoState;
  /** Available cryo pod slots to discover */
  availableCryoPods: number;
  /** Missions currently in progress */
  activeMissions: Mission[];
  /** Missions available to start */
  availableMissions: Mission[];
  /** Total missions completed (for progression) */
  completedMissionCount: number;
}

/**
 * Creates the initial game state with 16 neutral ships
 */
export function createInitialState(): GameState {
  const spacecraft: Spacecraft[] = [];
  for (let id = 0; id < 16; id++) {
    const row = Math.floor(id / 4);
    const col = id % 4;
    // Ship 5 (row 1, col 1) starts player-owned for initial power generation
    const isStarterShip = id === 5;
    spacecraft.push({
      id,
      gridPosition: { row, col },
      shipClass: 1,
      hullIntegrity: 100,
      owner: isStarterShip ? 'player' : 'neutral',
      powerAccumulated: 0,
      mode: isStarterShip ? 'station' : 'derelict',
      maxRooms: isStarterShip ? 3 : 0,
      rooms: []
    });
  }
  
  return {
    energy: 150,
    spacecraft,
    resources: createResources(),
    inventory: createInventory(),
    viralMultiplier: 1.0,
    viralMultiplierExpiry: null,
    currentRun: null,
    totalPlayEarned: 0,
    totalExtractions: 0,
    totalCollapses: 0,
    tutorialSeen: false,
    tutorialSkipped: false,
    hubSelectedShips: [],
    cryoState: createCryoState(),
    availableCryoPods: 2,
    activeMissions: [],
    availableMissions: [],
    completedMissionCount: 0
  };
}

/**
 * Maximum energy cap (base)
 */
export const BASE_ENERGY_CAP = 1000;

/**
 * Power generated per ship per minute (in milliseconds)
 */
export const POWER_PER_SHIP_PER_MS = 10 / 60000; // 10 per minute

/**
 * Maximum number of shields
 */
export const MAX_SHIELDS = 2;

/**
 * Maximum Depth Dive rounds
 */
export const MAX_ROUNDS = 10;

/**
 * Hull breach probability (35%)
 */
export const COLLAPSE_PROBABILITY = 0.35;

/**
 * Extract base payout
 */
export const EXTRACT_BASE_PAYOUT = 100;

/**
 * Viral multiplier boost amount
 */
export const VIRAL_MULTIPLIER_BOOST = 1.5;

/**
 * Viral multiplier duration in milliseconds (2 hours)
 */
export const VIRAL_MULTIPLIER_DURATION = 2 * 60 * 60 * 1000;
