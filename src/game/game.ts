/**
 * Game Core with Scene Flow
 *
 * Main game class managing:
 * - Persistent game state (power, spacecraft, inventory, viral multiplier)
 * - Scene-based architecture via SceneManager
 * - State machine for game flow (idle → depthDive → results)
 * 
 * Delegates to specialized modules for domain logic.
 */

import { SceneManager } from '../scene/scene-manager';
import { StateMachine } from '../state/state-machine';
import { GameState, createInitialState, DoctrineType } from '../types/state';
import { StoryState } from '../dialogue/story-state';
import { SaveManager } from '../save/save-manager';

import { GameFlowState, SectorScavengersSave, GameAccess } from './types';
import { setupStateMachine, isInFlowState, getCurrentFlowState } from './state-machine-setup';
import { GameLoop } from './game-loop';
import { 
  addEnergy, spendEnergy, 
  activateViralMultiplier, updateViralMultiplier, getViralMultiplier,
  getTotalBonus, getShip, getPlayerShips,
  markTutorialSeen, isTutorialSeen, setTutorialSkipped, isTutorialSkipped
} from './state-management';
import {
  startDepthDive, endDepthDive, returnToIdle, checkSectorUnlock,
  setHubSelectedShips, getHubSelectedShips, clearHubSelectedShips
} from './flow-control';
import {
  getAwakenedAuthoredRecruits, setSelectedLead, setCompanion,
  getSelectedLead, getCompanionSlots
} from './party-selection';
import {
  calculateDebtCeiling, applyDebtPayment, addDebt,
  checkDebtThresholds, isDebtLocked, getDebtRatio,
  advanceBillingCycle, formatCurrency
} from './debt-system';
import {
  addDoctrinePoints, checkDoctrineLock, getDoctrineProgress,
  hasDoctrine, isDoctrineLocked
} from './doctrine-system';
import { createSaveManager, saveGameState, loadGameState } from './persistence';

/**
 * Main Game class
 * 
 * Implements GameAccess interface and delegates domain logic to modules.
 */
export class Game implements GameAccess {
  private scenes: SceneManager = new SceneManager();
  private stateMachine: StateMachine<Game> = new StateMachine<Game>();
  private gameLoop: GameLoop;
  private saveManager: SaveManager<SectorScavengersSave>;
  
  /** Fullscreen toggle callback */
  public fullscreenToggleCallback: (() => void) | null = null;
  
  /** Persistent game state */
  public readonly state: GameState;
  
  /** Narrative story state */
  public readonly storyState: StoryState;
  
  /** Singleton instance */
  private static instance: Game | null = null;

  constructor() {
    this.state = createInitialState();
    this.storyState = new StoryState();
    this.saveManager = createSaveManager();
    this.gameLoop = new GameLoop(this, this.stateMachine as StateMachine<GameAccess>, null);
    Game.instance = this;
    setupStateMachine(this, this.stateMachine as StateMachine<GameAccess>);
  }

  static getInstance(): Game | null {
    return Game.instance;
  }

  // ============================================================================
  // GameAccess Interface Implementation
  // ============================================================================

  getSceneManager(): SceneManager {
    return this.scenes;
  }

  getStateMachine(): StateMachine<Game> {
    return this.stateMachine;
  }

  // ============================================================================
  // Initialization & Lifecycle
  // ============================================================================

  async init(): Promise<void> {
    const { StartScene } = await import('../scenes/start-scene');
    const { IdleScene } = await import('../scenes/idle');
    const { DepthDiveScene } = await import('../scenes/depth-dive-scene');
    const { ResultsScene } = await import('../scenes/results-scene');
    const { TutorialScene } = await import('../scenes/tutorial');
    const { CryoChamberScene } = await import('../scenes/cryo-chamber-scene');

    await this.scenes.register(new StartScene(this));
    await this.scenes.register(new TutorialScene(this));
    await this.scenes.register(new CryoChamberScene(this));
    await this.scenes.register(new IdleScene(this));
    await this.scenes.register(new DepthDiveScene(this));
    await this.scenes.register(new ResultsScene(this));

    loadGameState(this, this.saveManager);
  }

  start(): void {
    this.gameLoop.setFullscreenCallback(this.fullscreenToggleCallback);
    this.scenes.switchTo('start');
    this.gameLoop.start();
  }

  stop(): void {
    this.gameLoop.stop();
  }

  // ============================================================================
  // Flow Control
  // ============================================================================

  startDepthDive(): void { startDepthDive(this); }
  endDepthDive(): void { endDepthDive(this); }
  returnToIdle(): void { returnToIdle(this); }
  checkSectorUnlock(newSector: number): boolean { return checkSectorUnlock(this, newSector); }
  setHubSelectedShips(ids: number[]): void { setHubSelectedShips(this, ids); }
  getHubSelectedShips(): number[] { return getHubSelectedShips(this); }
  clearHubSelectedShips(): void { clearHubSelectedShips(this); }

  // ============================================================================
  // State Management
  // ============================================================================

  addEnergy(amount: number): void { addEnergy(this, amount); }
  spendEnergy(amount: number): boolean { return spendEnergy(this, amount); }
  activateViralMultiplier(): void { activateViralMultiplier(this); }
  updateViralMultiplier(): void { updateViralMultiplier(this); }
  getViralMultiplier(): number { return getViralMultiplier(this); }
  getShip(id: number) { return getShip(this, id); }
  getPlayerShips() { return getPlayerShips(this); }
  getTotalBonus(bonusType: string): number { return getTotalBonus(this, bonusType); }
  markTutorialSeen(): void { markTutorialSeen(this); }
  isTutorialSeen(): boolean { return isTutorialSeen(this); }
  setTutorialSkipped(value: boolean): void { setTutorialSkipped(this, value); }
  isTutorialSkipped(): boolean { return isTutorialSkipped(this); }

  // ============================================================================
  // Party Selection
  // ============================================================================

  getAwakenedAuthoredRecruits() { return getAwakenedAuthoredRecruits(this); }
  setSelectedLead(authoredId: string | null): void { setSelectedLead(this, authoredId); }
  setCompanion(slotIndex: 0 | 1, authoredId: string | null): void { setCompanion(this, slotIndex, authoredId); }
  getSelectedLead(): string | null { return getSelectedLead(this); }
  getCompanionSlots(): [string | null, string | null] { return getCompanionSlots(this); }

  // ============================================================================
  // Debt System
  // ============================================================================

  calculateDebtCeiling(): number { return calculateDebtCeiling(this); }
  applyDebtPayment(amount: number): void { applyDebtPayment(this, amount); }
  addDebt(amount: number, reason: string): void { addDebt(this, amount, reason); }
  checkDebtThresholds(): void { checkDebtThresholds(this); }
  isDebtLocked(): boolean { return isDebtLocked(this); }
  getDebtRatio(): number { return getDebtRatio(this); }
  advanceBillingCycle(): void { advanceBillingCycle(this); }
  formatCurrency(amount: number): string { return formatCurrency(amount); }

  // ============================================================================
  // Doctrine System
  // ============================================================================

  addDoctrinePoints(doctrine: DoctrineType, points: number): void { 
    addDoctrinePoints(this, doctrine, points); 
  }
  checkDoctrineLock(): void { checkDoctrineLock(this); }
  getDoctrineProgress() { return getDoctrineProgress(this); }
  hasDoctrine(doctrine: DoctrineType): boolean { return hasDoctrine(this, doctrine); }
  isDoctrineLocked(): boolean { return isDoctrineLocked(this); }

  // ============================================================================
  // Flow State Queries
  // ============================================================================

  isInFlowState(state: GameFlowState): boolean {
    return isInFlowState(this.stateMachine as StateMachine<GameAccess>, state);
  }

  getCurrentFlowState(): GameFlowState | null {
    return getCurrentFlowState(this.stateMachine as StateMachine<GameAccess>);
  }

  // ============================================================================
  // Persistence
  // ============================================================================

  saveState(): void { saveGameState(this, this.saveManager); }

  // ============================================================================
  // Game Control
  // ============================================================================

  /**
   * Reset game to initial state (restart)
   */
  resetGame(): void {
    // Create fresh state
    const freshState = createInitialState();
    
    // Replace all state properties
    Object.assign(this.state, freshState);
    
    // Reset story state
    this.storyState.clear();
    
    console.log('[Game] Game reset to initial state');
  }

  /**
   * Toggle fullscreen mode
   */
  toggleFullscreen(): void {
    if (this.fullscreenToggleCallback) {
      this.fullscreenToggleCallback();
    }
  }

  // ============================================================================
  // Scene Management
  // ============================================================================

  switchScene(sceneId: string): void {
    this.scenes.switchTo(sceneId);
  }

  getHubSystem(): import('../systems/hub-system').HubSystem | undefined {
    return undefined;
  }
}
