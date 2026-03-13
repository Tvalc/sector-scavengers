/**
 * Depth Dive System
 *
 * Handles the 10-round tactical card drafting session.
 * Each round presents 3 random cards to choose from.
 * Discovery events trigger on rounds 3, 6, and 9.
 */

import type { Game } from '../game/game';
import { TacticCard, ALL_CARDS, CardType } from '../types/cards';
import { RunState, MAX_ROUNDS, MAX_SHIELDS } from '../types/state';
import { JuiceSystem } from './juice-system';
import { SeededRNG } from '../random/seeded-rng';
import { WeightedPicker } from '../random/weighted-picker';
import { getDiscoveryBonus } from './crew-bonus-system';

/**
 * Card draft offer (3 cards presented to player)
 */
export interface CardDraft {
  cards: TacticCard[];
  round: number;
}

/**
 * Discovery event result
 */
export interface DiscoveryEvent {
  round: number;
  itemId: string;
}

/**
 * Extracted reward entry
 */
export interface ExtractedReward {
  shipId: number;
  points: number;
}

/**
 * Session state for external access
 */
export interface SessionState {
  currentRound: number;
  shields: number;
  stability: number;
  extractedRewards: ExtractedReward[];
  collapsed: boolean;
}

/**
 * DepthDiveSystem - manages the active dive session
 */
export class DepthDiveSystem {
  private game: Game;
  private juice: JuiceSystem;
  private rng: SeededRNG;
  private selectedShipId: number | null = null;
  private sessionStability: number = 100;

  // Discovery rounds
  private static readonly DISCOVERY_ROUNDS = [3, 6, 9];

  constructor(game: Game, juice: JuiceSystem) {
    this.game = game;
    this.juice = juice;
    this.rng = new SeededRNG(Date.now());
  }

  // ============================================================================
  // Getters
  // ============================================================================

  /**
   * Get current run state
   */
  getRun(): RunState | null {
    return this.game.state.currentRun;
  }

  /**
   * Get current round number (1-10)
   */
  getCurrentRound(): number {
    return this.game.state.currentRun?.round ?? 0;
  }

  /**
   * Current round getter
   */
  get currentRound(): number {
    return this.getCurrentRound();
  }

  /**
   * Shields getter
   */
  get shields(): number {
    return this.game.state.currentRun?.shields ?? 0;
  }

  /**
   * Extracted rewards getter
   */
  get extractedRewards(): number {
    return this.game.state.currentRun?.extractedRewards ?? 0;
  }

  /**
   * Collapsed getter
   */
  get collapsed(): boolean {
    return this.game.state.currentRun?.collapsed ?? false;
  }

  /**
   * Check if run is complete
   */
  get isComplete(): boolean {
    const run = this.getRun();
    if (!run) return true;
    return run.round > MAX_ROUNDS || run.collapsed;
  }

  /**
   * Check if should trigger discovery (rounds 3, 6, 9)
   */
  get shouldTriggerDiscovery(): boolean {
    return this.isDiscoveryRound();
  }

  // ============================================================================
  // Session Management
  // ============================================================================

  /**
   * Start a new session
   */
  startSession(): void {
    this.game.state.currentRun = {
      round: 1,
      shields: 0,
      extractedRewards: 0,
      collapsed: false,
      collectedItems: [],
      targetShipId: null,
      targetRepairedThisRun: false,
      repairsThisRun: 0,
      scrapEarned: 0,
      leadId: null,
      companionIds: [null, null],
      abilityUsage: {
        workingMemoryUsed: false,
        triageUsed: false,
        fieldRetrofitUsed: false,
        signalTraceUsed: false,
        deadDropUsed: false,
        ghostCredentialUsed: false
      },
      appliedPassiveBonuses: {
        shieldBonus: 0,
        repairBonus: 0,
        discoveryBonus: 0,
        extractionBonus: 0
      },
      bankedRewards: 0,
      firstHandDealt: false
    };
    this.sessionStability = 100;
    this.selectedShipId = null;
    this.rng = new SeededRNG(Date.now());
    console.log('[DepthDive] Session started');
  }

  /**
   * Get session state
   */
  getSessionState(): SessionState {
    const run = this.getRun();
    if (!run) {
      return {
        currentRound: 0,
        shields: 0,
        stability: 100,
        extractedRewards: [],
        collapsed: true
      };
    }

    return {
      currentRound: run.round,
      shields: run.shields,
      stability: this.sessionStability,
      extractedRewards: [],
      collapsed: run.collapsed
    };
  }

  /**
   * End session and return final rewards
   */
  endSession(): { rewards: number; items: string[]; collapsed: boolean } {
    const run = this.getRun();
    if (!run) {
      return { rewards: 0, items: [], collapsed: true };
    }

    const result = {
      rewards: run.extractedRewards,
      items: [...run.collectedItems],
      collapsed: run.collapsed
    };

    this.game.endDepthDive();
    console.log('[DepthDive] Session ended:', result);
    return result;
  }

  // ============================================================================
  // Round Management
  // ============================================================================

  /**
   * Advance to next round
   */
  advanceRound(): boolean {
    const run = this.getRun();
    if (!run || run.collapsed) return false;

    run.round++;

    if (run.round > MAX_ROUNDS) {
      this.game.endDepthDive();
      return false;
    }

    return true;
  }

  /**
   * Check if this is a discovery round
   */
  isDiscoveryRound(): boolean {
    const round = this.getCurrentRound();
    return DepthDiveSystem.DISCOVERY_ROUNDS.includes(round);
  }

  /**
   * Check if run is complete (method version)
   */
  isRunComplete(): boolean {
    return this.isComplete;
  }

  // ============================================================================
  // Shield Management
  // ============================================================================

  /**
   * Add a shield (max 2)
   */
  addShield(): boolean {
    const run = this.getRun();
    if (!run || run.shields >= MAX_SHIELDS) return false;
    run.shields++;
    return true;
  }

  // ============================================================================
  // Stability Management
  // ============================================================================

  /**
   * Damage session stability
   */
  damageStability(amount: number): boolean {
    this.sessionStability = Math.max(0, this.sessionStability - amount);
    
    if (this.sessionStability <= 0) {
      this.collapse();
      return false;
    }
    return true;
  }

  // ============================================================================
  // Collapse
  // ============================================================================

  /**
   * Trigger Hull Breach
   */
  collapse(): void {
    const run = this.getRun();
    if (!run) return;

    if (run.shields > 0) {
      run.shields--;
      this.sessionStability = 50;
      this.juice.triggerShake(5, 150);
      console.log('[DepthDive] Collapse absorbed by shield');
      return;
    }

    run.collapsed = true;
    run.extractedRewards = 0;
    run.collectedItems = [];
    
    this.juice.triggerHullBreach();
    this.game.state.totalCollapses++;
    console.log('[DepthDive] Hull breach!');
  }

  // ============================================================================
  // Card Drafting
  // ============================================================================

  /**
   * Generate 3 random cards for drafting
   */
  generateDraft(): CardDraft {
    const round = this.getCurrentRound();
    const cards: TacticCard[] = [];

    const shuffled = [...ALL_CARDS].sort(() => this.rng.next() - 0.5);
    
    for (let i = 0; i < 3 && i < shuffled.length; i++) {
      cards.push(shuffled[i]);
    }

    return { cards, round };
  }

  /**
   * Play a card
   * Note: Card execution is handled by TacticCardSystem
   * This method is kept for compatibility but redirects to TacticCardSystem
   */
  playCard(cardType: CardType): boolean {
    // Card execution is handled by TacticCardSystem in the scene
    // This method should not be called directly
    console.warn('[DepthDiveSystem] playCard should be handled by TacticCardSystem');
    return false;
  }

  // ============================================================================
  // Discovery
  // ============================================================================

  /**
   * Get discovery item for this round
   * Applies scientist bonus (+15%) if scientist is assigned to active ship
   */
  getDiscoveryItem(): string | null {
    if (!this.isDiscoveryRound()) return null;

    // Get active ship for scientist bonus
    const activeShipId = this.selectedShipId;
    const cryoState = this.game.state.cryoState;
    
    // Calculate discovery bonus (0% or 15%)
    const discoveryBonus = activeShipId !== null 
      ? getDiscoveryBonus(cryoState, activeShipId) 
      : 0;
    
    if (discoveryBonus > 0) {
      console.log(`[Discovery] Scientist bonus: +${Math.round(discoveryBonus * 100)}% chance`);
    }
    
    // Apply bonus to weights (multiply by 1 + bonus)
    const weightMultiplier = 1 + discoveryBonus;
    
    const picker = new WeightedPicker<string>([
      { item: 'neural_uplink', weight: 30 * weightMultiplier },
      { item: 'meme_beacon', weight: 25 * weightMultiplier },
      { item: 'the_viralist', weight: 15 * weightMultiplier }
    ], this.rng);

    return picker.pick();
  }

  // ============================================================================
  // Node Selection
  // ============================================================================

  getSelectedShip(): number | null {
    return this.selectedShipId;
  }

  setSelectedShip(id: number | null): void {
    this.selectedShipId = id;
  }

  // ============================================================================
  // Helpers
  // ============================================================================
}

