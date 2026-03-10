/**
 * Game Core with Scene Flow
 *
 * Main game class managing:
 * - Persistent game state (power, spacecraft, inventory, viral multiplier)
 * - Scene-based architecture via SceneManager
 * - State machine for game flow (idle → depthDive → results)
 */

import { MakkoEngine } from '@makko/engine';
import { SceneManager } from '../scene/scene-manager';
import { StateMachine } from '../state/state-machine';
import { 
  GameState, 
  createInitialState, 
  RunState, 
  createRunState,
  VIRAL_MULTIPLIER_DURATION,
  VIRAL_MULTIPLIER_BOOST
} from '../types/state';
import { Spacecraft } from '../types/spacecraft';
import { Inventory } from '../types/inventory';
import { Resources } from '../types/resources';
import { SaveManager } from '../save/save-manager';
import { CryoState } from '../systems/cryo-system';
import { Mission } from '../types/mission';
import { CrewMember } from '../types/crew';

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
 * Save data structure for Sector Scavengers
 */
interface SectorScavengersSave {
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
}

/**
 * Main Game class
 * 
 * Manages persistent state, scene flow, and game systems.
 * Scenes access game state via the game reference passed to them.
 */
export class Game {
  private scenes = new SceneManager();
  private stateMachine = new StateMachine<Game>();
  private lastTime = 0;
  private running = false;
  
  /** Fullscreen toggle callback */
  public fullscreenToggleCallback: (() => void) | null = null;
  
  /** Persistent game state */
  public state: GameState;
  
  /** Save manager for persistence */
  private saveManager: SaveManager<SectorScavengersSave>;
  
  /** Singleton instance for scene access */
  private static instance: Game | null = null;

  constructor() {
    this.state = createInitialState();
    this.saveManager = new SaveManager<SectorScavengersSave>('sector-scavengers', 1);
    Game.instance = this;
    this.setupStateMachine();
  }

  /**
   * Get the game instance (for scenes to access)
   */
  static getInstance(): Game | null {
    return Game.instance;
  }

  /**
   * Setup the game flow state machine
   */
  private setupStateMachine(): void {
    // IDLE state - main hub
    this.stateMachine.add(GameFlowStates.IDLE, {
      enter: () => {
        this.scenes.switchTo('idle');
      }
    });

    // DEPTH_DIVE state - active session
    this.stateMachine.add(GameFlowStates.DEPTH_DIVE, {
      enter: () => {
        // Initialize a new run
        this.state.currentRun = createRunState();
        this.scenes.switchTo('depthDive');
      },
      exit: () => {
        // Run state cleanup happens in endDepthDive()
      }
    });

    // RESULTS state - end of run summary
    this.stateMachine.add(GameFlowStates.RESULTS, {
      enter: () => {
        this.scenes.switchTo('results');
      },
      exit: () => {
        // Clear run state when leaving results
        this.state.currentRun = null;
      }
    });
  }

  /**
   * Initialize game and register scenes
   */
  async init(): Promise<void> {
    // Register all scenes
    // Scenes will be imported when they're created
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

    // Load saved state if available
    this.loadState();
  }

  /**
   * Start the game loop
   */
  start(): void {
    this.running = true;
    this.lastTime = performance.now();

    // Always start with the title screen
    this.scenes.switchTo('start');

    this.gameLoop();
  }

  /**
   * Stop the game loop
   */
  stop(): void {
    this.running = false;
  }

  private gameLoop(): void {
    if (!this.running) return;

    const currentTime = performance.now();
    const dt = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Update state machine (handles automatic transitions)
    this.stateMachine.update(dt, this);

    // Delegate to scene manager
    this.scenes.handleInput();
    this.scenes.update(dt);
    this.render();

    requestAnimationFrame(() => this.gameLoop());
  }

  private render(): void {
    const display = MakkoEngine.display;

    display.beginFrame();
    display.clear('#0a0e1a'); // Deep space black

    // Render all scenes in stack (for overlays)
    this.scenes.render();

    display.endFrame();

    // Check for fullscreen toggle (Shift+F)
    if (this.fullscreenToggleCallback) {
      this.fullscreenToggleCallback();
    }

    // CRITICAL: Must call at end of each frame
    MakkoEngine.input.endFrame();
  }

  // ============================================================================
  // Game Flow Control
  // ============================================================================

  /**
   * Start a Depth Dive session
   * Uses the first selected hub ship as the target for this run.
   */
  startDepthDive(): void {
    if (this.state.currentRun) {
      console.warn('[Game] Already in a Depth Dive session');
      return;
    }
    
    this.stateMachine.transition(GameFlowStates.DEPTH_DIVE, this);
    
    // Store the selected ship as the run target (one ship per run)
    if (this.state.currentRun && this.state.hubSelectedShips.length > 0) {
      this.state.currentRun.targetShipId = this.state.hubSelectedShips[0];
      console.log(`[Game] Starting dive with target ship ${this.state.currentRun.targetShipId}`);
    }
  }

  /**
   * End the Depth Dive and show results
   * Handles persisted ship logic:
   * - If target was repaired: keep in persistedShips
   * - If target was not repaired: remove from persistedShips (board will reset)
   */
  endDepthDive(): void {
    if (!this.state.currentRun) {
      console.warn('[Game] No active Depth Dive session');
      return;
    }
    
    const run = this.state.currentRun;
    const targetId = run.targetShipId;
    
    // Handle persisted ship logic
    if (targetId !== null) {
      if (run.targetRepairedThisRun) {
        // Ship was repaired - add to persisted ships if not already there
        if (!this.state.persistedShips.includes(targetId)) {
          this.state.persistedShips.push(targetId);
          console.log(`[Game] Ship ${targetId} repaired and will persist on board`);
        }
      } else {
        // Ship was not repaired - remove from persisted ships
        const index = this.state.persistedShips.indexOf(targetId);
        if (index !== -1) {
          this.state.persistedShips.splice(index, 1);
          console.log(`[Game] Ship ${targetId} not repaired, removing from board`);
        }
      }
    }
    
    // Clear hub selection after dive ends
    this.clearHubSelectedShips();
    this.stateMachine.transition(GameFlowStates.RESULTS, this);
  }

  /**
   * Return to idle state from results
   * Note: Run state is cleared by RESULTS state exit handler.
   */
  returnToIdle(): void {
    this.stateMachine.transition(GameFlowStates.IDLE, this);
  }

  /**
   * Check if currently in a specific game flow state
   */
  isInFlowState(state: GameFlowState): boolean {
    return this.stateMachine.isIn(state);
  }

  /**
   * Get current game flow state
   */
  getCurrentFlowState(): GameFlowState | null {
    return this.stateMachine.getCurrent() as GameFlowState | null;
  }

  // ============================================================================
  // State Management
  // ============================================================================

  /**
   * Add energy (respects cap)
   */
  addEnergy(amount: number): void {
    const baseCap = 1000;
    const bonusPercent = this.getTotalBonus('energy_cap_percent');
    const cap = baseCap * (1 + bonusPercent / 100);
    this.state.energy = Math.min(cap, this.state.energy + amount);
  }

  /**
   * Spend energy (returns true if successful)
   */
  spendEnergy(amount: number): boolean {
    if (this.state.energy >= amount) {
      this.state.energy -= amount;
      return true;
    }
    return false;
  }

  /**
   * Mark tutorial as seen (called by TutorialScene)
   */
  markTutorialSeen(): void {
    this.state.tutorialSeen = true;
    this.saveState();
  }

  /**
   * Check if tutorial has been seen
   */
  isTutorialSeen(): boolean {
    return this.state.tutorialSeen;
  }

  /**
   * Set tutorial skip preference
   */
  setTutorialSkipped(value: boolean): void {
    this.state.tutorialSkipped = value;
    this.saveState();
  }

  /**
   * Check if tutorial should be skipped
   */
  isTutorialSkipped(): boolean {
    return this.state.tutorialSkipped ?? false;
  }

  /**
   * Activate viral multiplier (from sharing)
   */
  activateViralMultiplier(): void {
    this.state.viralMultiplier = VIRAL_MULTIPLIER_BOOST;
    this.state.viralMultiplierExpiry = Date.now() + VIRAL_MULTIPLIER_DURATION;
  }

  /**
   * Check and update viral multiplier expiry
   */
  updateViralMultiplier(): void {
    if (this.state.viralMultiplierExpiry && Date.now() >= this.state.viralMultiplierExpiry) {
      this.state.viralMultiplier = 1.0;
      this.state.viralMultiplierExpiry = null;
    }
  }

  /**
   * Get current viral multiplier (checks expiry)
   */
  getViralMultiplier(): number {
    this.updateViralMultiplier();
    return this.state.viralMultiplier;
  }

  /**
   * Get a ship by ID
   */
  getShip(id: number): Spacecraft | undefined {
    return this.state.spacecraft.find(s => s.id === id);
  }

  /**
   * Get all player-owned ships
   */
  getPlayerShips(): Spacecraft[] {
    return this.state.spacecraft.filter(s => s.owner === 'player');
  }

  /**
   * Get total bonus from inventory items
   */
  getTotalBonus(bonusType: string): number {
    const allItems = [...this.state.inventory.hardware, ...this.state.inventory.crew];
    return allItems.reduce((total, item) => {
      const matchingBonus = item.bonuses.find(b => b.type === bonusType);
      return total + (matchingBonus?.value ?? 0);
    }, 0);
  }

  // ============================================================================
  // Hub Selection Management
  // ============================================================================

  /**
   * Set selected hub ships for the next dive
   */
  setHubSelectedShips(ids: number[]): void {
    this.state.hubSelectedShips = [...ids];
  }

  /**
   * Get currently selected hub ships
   */
  getHubSelectedShips(): number[] {
    return [...this.state.hubSelectedShips];
  }

  /**
   * Clear hub selection (called after dive ends)
   */
  clearHubSelectedShips(): void {
    this.state.hubSelectedShips = [];
  }

  // ============================================================================
  // Hub System Access (for IdleScene)
  // ============================================================================

  /**
   * Get the hub system (used by IdleScene)
   * Note: This is a temporary accessor - the HubSystem instance
   * is created and managed by IdleScene.
   */
  getHubSystem(): import('../systems/hub-system').HubSystem | undefined {
    // Return undefined - IdleScene creates its own HubSystem instance
    // This accessor is for future use if needed
    return undefined;
  }
  // ============================================================================
  // Persistence
  // ============================================================================

  /**
   * Save game state to localStorage
   */
  saveState(): void {
    this.saveManager.save({
      energy: this.state.energy,
      spacecraft: this.state.spacecraft,
      inventory: this.state.inventory,
      viralMultiplier: this.state.viralMultiplier,
      viralMultiplierExpiry: this.state.viralMultiplierExpiry,
      totalPlayEarned: this.state.totalPlayEarned,
      totalExtractions: this.state.totalExtractions,
      totalCollapses: this.state.totalCollapses,
      tutorialSeen: this.state.tutorialSeen,
      tutorialSkipped: this.state.tutorialSkipped ?? false,
      hubSelectedShips: this.state.hubSelectedShips,
      persistedShips: this.state.persistedShips,
      resources: this.state.resources,
      cryoState: this.state.cryoState,
      availableCryoPods: this.state.availableCryoPods,
      activeMissions: this.state.activeMissions,
      availableMissions: this.state.availableMissions,
      completedMissionCount: this.state.completedMissionCount,
      deathCurrency: this.state.deathCurrency,
      deckUnlockProgress: this.state.deckUnlockProgress,
      nextUnlockCardId: this.state.nextUnlockCardId,
      unlockedCards: this.state.unlockedCards,
      crewRoster: this.state.crewRoster,
      crewAssignments: this.state.crewAssignments
    });
  }

  /**
   * Load game state from localStorage
   */
  loadState(): void {
    const saveData = this.saveManager.load();

    if (saveData) {
      // Primitive values - use null coalescing for safety
      this.state.energy = saveData.energy ?? this.state.energy;
      this.state.viralMultiplier = saveData.viralMultiplier ?? 1.0;
      this.state.viralMultiplierExpiry = saveData.viralMultiplierExpiry ?? null;
      this.state.totalPlayEarned = saveData.totalPlayEarned ?? 0;
      this.state.totalExtractions = saveData.totalExtractions ?? 0;
      this.state.totalCollapses = saveData.totalCollapses ?? 0;
      this.state.tutorialSeen = saveData.tutorialSeen ?? false;
      this.state.tutorialSkipped = saveData.tutorialSkipped ?? false;
      this.state.hubSelectedShips = saveData.hubSelectedShips ?? [];
      this.state.persistedShips = saveData.persistedShips ?? [];
      
      // Array/object values - validate before assigning to prevent undefined overwrites
      if (saveData.spacecraft && Array.isArray(saveData.spacecraft)) {
        this.state.spacecraft = saveData.spacecraft;
      }
      
      if (saveData.inventory && 
          typeof saveData.inventory === 'object' &&
          'hardware' in saveData.inventory && 
          'crew' in saveData.inventory) {
        this.state.inventory = saveData.inventory;
      }
      
      // Resources
      if (saveData.resources && typeof saveData.resources === 'object') {
        this.state.resources = saveData.resources;
      }
      
      // Cryo state
      if (saveData.cryoState && typeof saveData.cryoState === 'object') {
        this.state.cryoState = saveData.cryoState;
      }
      
      // Available cryo pods
      if (typeof saveData.availableCryoPods === 'number') {
        this.state.availableCryoPods = saveData.availableCryoPods;
      }
      
      // Active missions
      if (saveData.activeMissions && Array.isArray(saveData.activeMissions)) {
        this.state.activeMissions = saveData.activeMissions;
      }
      
      // Available missions
      if (saveData.availableMissions && Array.isArray(saveData.availableMissions)) {
        this.state.availableMissions = saveData.availableMissions;
      }
      
      // Completed mission count
      if (typeof saveData.completedMissionCount === 'number') {
        this.state.completedMissionCount = saveData.completedMissionCount;
      }
      
      // Meta progression
      this.state.deathCurrency = saveData.deathCurrency ?? 0;
      this.state.deckUnlockProgress = saveData.deckUnlockProgress ?? 0;
      this.state.nextUnlockCardId = saveData.nextUnlockCardId ?? null;
      this.state.unlockedCards = saveData.unlockedCards ?? [];
      
      // Crew progression
      this.state.crewRoster = saveData.crewRoster ?? [];
      this.state.crewAssignments = saveData.crewAssignments ?? {};
      
      // Check viral multiplier expiry on load
      this.updateViralMultiplier();
    }
  }

  // ============================================================================
  // Scene Manager Access
  // ============================================================================

  /**
   * Get the scene manager
   */
  getSceneManager(): SceneManager {
    return this.scenes;
  }

  /**
   * Switch to a scene by ID
   */
  switchScene(sceneId: string): void {
    this.scenes.switchTo(sceneId);
  }
}
