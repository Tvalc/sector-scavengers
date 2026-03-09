/**
 * Depth Dive System
 *
 * Handles the 10-round tactical card drafting session.
 * Each round presents 3 random cards to choose from.
 * Discovery events trigger on rounds 3, 6, and 9.
 */

import type { Game } from '../game/game';
import { TacticCard, ALL_CARDS, CardType, getCardByType } from '../types/cards';
import { RunState, MAX_ROUNDS, MAX_SHIELDS, COLLAPSE_PROBABILITY, EXTRACT_BASE_PAYOUT } from '../types/state';
import { Node } from '../types/node';
import { JuiceSystem } from './juice-system';
import { SeededRNG } from '../random/seeded-rng';
import { WeightedPicker } from '../random/weighted-picker';

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
  nodeId: number;
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
  private selectedNodeId: number | null = null;
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
      collectedItems: []
    };
    this.sessionStability = 100;
    this.selectedNodeId = null;
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
   * Trigger Rig Collapse
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
    
    this.juice.triggerRigCollapse();
    this.game.state.totalCollapses++;
    console.log('[DepthDive] Rig collapsed!');
  }

  // ============================================================================
  // Extract
  // ============================================================================

  /**
   * Extract from a node
   */
  extract(nodeId: number, level: number, multiplier: number): number {
    const run = this.getRun();
    if (!run || run.collapsed) return 0;

    const payout = EXTRACT_BASE_PAYOUT * (1 + level) * multiplier;
    run.extractedRewards += payout;
    this.game.state.totalExtractions++;

    const node = this.game.getNode(nodeId);
    if (node) {
      const screenX = this.getNodeScreenX(node);
      this.juice.triggerIonBeam(screenX);
    }

    console.log(`[DepthDive] Extracted ${payout} from node ${nodeId}`);
    return payout;
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
   */
  playCard(cardType: CardType): boolean {
    const run = this.getRun();
    if (!run || run.collapsed) return false;

    const card = getCardByType(cardType);
    if (!card) return false;

    if (card.energyCost > 0 && this.game.state.energy < card.energyCost) {
      return false;
    }

    if (card.energyCost > 0) {
      this.game.spendEnergy(card.energyCost);
    }

    switch (card.type) {
      case 'SCAN':
        return this.executeScan();
      case 'REPAIR':
        return this.executeRepair();
      case 'BYPASS':
        return this.executeBypass();
      case 'OVERCLOCK':
        return this.executeOverclock();
      case 'EXTRACT':
        return this.executeExtract();
      default:
        return false;
    }
  }

  // ============================================================================
  // Card Execution
  // ============================================================================

  private executeScan(): boolean {
    const neutralNodes = this.game.state.nodes.filter(n => n.owner === 'neutral');
    if (neutralNodes.length === 0) return false;

    const node = neutralNodes[Math.floor(this.rng.next() * neutralNodes.length)];
    node.owner = 'player';
    
    const stabilityBonus = this.game.getTotalBonus('stability_percent');
    node.stability = Math.min(100, 100 + stabilityBonus);

    return true;
  }

  private executeRepair(): boolean {
    const playerNodes = this.game.state.nodes.filter(n => n.owner === 'player');
    
    for (const node of playerNodes) {
      const repairAmount = 15 + (node.level * 5);
      node.stability = Math.min(100, node.stability + repairAmount);
    }

    return true;
  }

  private executeBypass(): boolean {
    return this.addShield();
  }

  private executeOverclock(): boolean {
    const playerNodes = this.game.state.nodes.filter(
      n => n.owner === 'player' && n.level < 3
    );

    if (playerNodes.length === 0) return false;

    const node = playerNodes[Math.floor(this.rng.next() * playerNodes.length)];
    node.level = Math.min(3, node.level + 1);

    return true;
  }

  private executeExtract(): boolean {
    const run = this.getRun();
    if (!run) return false;

    const playerNodes = this.game.state.nodes.filter(n => n.owner === 'player');
    if (playerNodes.length === 0) return false;

    const node = playerNodes[Math.floor(this.rng.next() * playerNodes.length)];

    if (this.rng.next() < COLLAPSE_PROBABILITY) {
      if (run.shields > 0) {
        run.shields--;
        this.juice.triggerShake(5, 150);
      } else {
        run.collapsed = true;
        run.extractedRewards = 0;
        run.collectedItems = [];
        
        node.owner = 'neutral';
        node.level = 1;
        node.stability = 100;

        this.juice.triggerRigCollapse();
        this.game.state.totalCollapses++;
        
        return true;
      }
    }

    const viralMultiplier = this.game.getViralMultiplier();
    const payout = EXTRACT_BASE_PAYOUT * (1 + node.level) * viralMultiplier;
    
    run.extractedRewards += payout;
    this.game.state.totalExtractions++;

    const nodeScreenX = this.getNodeScreenX(node);
    this.juice.triggerIonBeam(nodeScreenX);

    return true;
  }

  // ============================================================================
  // Discovery
  // ============================================================================

  /**
   * Get discovery item for this round
   */
  getDiscoveryItem(): string | null {
    if (!this.isDiscoveryRound()) return null;

    const picker = new WeightedPicker<string>([
      { item: 'neural_uplink', weight: 30 },
      { item: 'meme_beacon', weight: 25 },
      { item: 'the_viralist', weight: 15 }
    ], this.rng);

    return picker.pick();
  }

  // ============================================================================
  // Node Selection
  // ============================================================================

  getSelectedNode(): number | null {
    return this.selectedNodeId;
  }

  setSelectedNode(id: number | null): void {
    this.selectedNodeId = id;
  }

  // ============================================================================
  // Helpers
  // ============================================================================

  private getNodeScreenX(node: Node): number {
    const gridWidth = 600;
    const startX = (1920 - gridWidth) / 2;
    const cellWidth = gridWidth / 4;
    
    return startX + (node.gridPosition.col * cellWidth) + (cellWidth / 2);
  }
}
