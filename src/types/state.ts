import { Node } from './node';
import { Inventory, createInventory } from './inventory';

/**
 * Current run state during a Depth Dive session
 */
export interface RunState {
  /** Current round (1-10) */
  round: number;
  /** Number of shields (0-2), protects from Rig Collapse */
  shields: number;
  /** Rewards extracted this run */
  extractedRewards: number;
  /** Whether the rig has collapsed this run */
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
  /** Total energy available (max 1000) */
  energy: number;
  /** All 16 nodes in the 4x4 grid */
  nodes: Node[];
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
  /** Total rig collapses experienced */
  totalCollapses: number;
  /** Whether the tutorial has been seen */
  tutorialSeen: boolean;
  /** Whether the tutorial should be skipped (player preference) */
  tutorialSkipped?: boolean;
}

/**
 * Creates the initial game state with 16 neutral nodes
 */
export function createInitialState(): GameState {
  const nodes: Node[] = [];
  for (let id = 0; id < 16; id++) {
    const row = Math.floor(id / 4);
    const col = id % 4;
    // Node 5 (row 1, col 1) starts player-owned for initial energy generation
    const isStarterNode = id === 5;
    nodes.push({
      id,
      gridPosition: { row, col },
      level: 1,
      stability: 100,
      owner: isStarterNode ? 'player' : 'neutral',
      energyAccumulated: 0
    });
  }
  
  return {
    energy: 150,
    nodes,
    inventory: createInventory(),
    viralMultiplier: 1.0,
    viralMultiplierExpiry: null,
    currentRun: null,
    totalPlayEarned: 0,
    totalExtractions: 0,
    totalCollapses: 0,
    tutorialSeen: false,
    tutorialSkipped: false
  };
}

/**
 * Maximum energy cap (base)
 */
export const BASE_ENERGY_CAP = 1000;

/**
 * Energy generated per node per minute (in milliseconds)
 */
export const ENERGY_PER_NODE_PER_MS = 10 / 60000; // 10 per minute

/**
 * Maximum number of shields
 */
export const MAX_SHIELDS = 2;

/**
 * Maximum Depth Dive rounds
 */
export const MAX_ROUNDS = 10;

/**
 * Rig collapse probability (35%)
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
