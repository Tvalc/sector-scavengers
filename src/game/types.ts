/**
 * Game Types and Constants
 *
 * Type definitions for game flow, save data, and related interfaces.
 */

import { Spacecraft } from '../types/spacecraft';
import { Inventory } from '../types/inventory';
import { Resources } from '../types/resources';
import { CryoState } from '../systems/cryo-system';
import { Mission } from '../types/mission';
import { CrewMember } from '../types/crew';
import { GameState, DoctrineType, DoctrinePoints } from '../types/state';
import { StoryState } from '../dialogue/story-state';

/**
 * Game flow states
 */
export const GameFlowStates = {
  IDLE: 'idle',
  DEPTH_DIVE: 'depthDive',
  RESULTS: 'results'
} as const;

export type GameFlowState = typeof GameFlowStates[keyof typeof GameFlowStates];

/**
 * Minimal scene manager interface for game loop
 */
export interface SceneManagerAccess {
  switchTo(sceneId: string): void;
  handleInput(): void;
  update(dt: number): void;
  render(): void;
}

/**
 * Minimal state machine interface for transitions
 */
export interface StateMachineAccess {
  transition(state: GameFlowState, game: unknown): void;
  update(dt: number, game: unknown): void;
  isIn(state: GameFlowState): boolean;
  getCurrent(): string | null;
}

/**
 * Interface for Game access in helper modules
 */
export interface GameAccess {
  readonly state: GameState;
  readonly storyState: StoryState;
  saveState(): void;
  applyDebtPayment(amount: number): void;
  advanceBillingCycle(): void;
  getSceneManager(): SceneManagerAccess;
  getStateMachine(): StateMachineAccess;
}

/**
 * Save data structure for Sector Scavengers
 */
export interface SectorScavengersSave {
  version: number;
  energy: number;
  spacecraft: Spacecraft[];
  inventory: Inventory;
  viralMultiplier: number;
  viralMultiplierExpiry: number | null;
  totalPlayEarned: number;
  totalExtractions: number;
  totalCollapses: number;
  tutorialSeen: boolean;
  tutorialSkipped: boolean;
  hubSelectedShips: number[];
  persistedShips: number[];
  resources: Resources;
  cryoState: CryoState;
  availableCryoPods: number;
  activeMissions: Mission[];
  availableMissions: Mission[];
  completedMissionCount: number;
  deathCurrency: number;
  deckUnlockProgress: number;
  nextUnlockCardId: string | null;
  unlockedCards: string[];
  crewRoster: CrewMember[];
  crewAssignments: Record<number, string>;
  meta: {
    debt: number;
    debtCeiling: number;
    currentSector: number;
    paymentDue: number | null;
    billingTimer: number;
    runsCompleted: number;
    doctrine: DoctrineType | null;
    doctrinePoints: DoctrinePoints;
  };
  storyState: { flags: string[]; variables: [string, number][] };
  shipClaimProgress: Record<number, number>;
  selectedLead: string | null;
  companionSlots: [string | null, string | null];
}
