/**
 * Tactic Card System
 *
 * Handles card drafting and execution for Depth Dive sessions.
 * Each round presents 3 random cards with weighted selection.
 *
 * Usage:
 *   const cardSystem = new TacticCardSystem(game);
 *   const cards = cardSystem.draftCards(3);
 *   const result = cardSystem.playCard(card, context);
 */

import type { Game } from '../game/game';
import { TacticCard, CardType, getCardByType, ALL_CARDS } from '../types/cards';
import { COLLAPSE_PROBABILITY, EXTRACT_BASE_PAYOUT, MAX_SHIELDS } from '../types/state';
import { WeightedPicker } from '../random/weighted-picker';
import { SeededRNG } from '../random/seeded-rng';
import { JuiceSystem } from './juice-system';

/**
 * Card weights for drafting
 */
const CARD_WEIGHTS: Record<CardType, number> = {
  SCAN: 25,
  REPAIR: 20,
  BYPASS: 15,
  OVERCLOCK: 15,
  EXTRACT: 25
};

/**
 * Result of playing a card
 */
export interface CardPlayResult {
  success: boolean;
  message: string;
  energySpent: number;
  collapsed?: boolean;
  payout?: number;
}

/**
 * Context for card execution
 */
export interface CardContext {
  nodeId?: number;
  juice: JuiceSystem;
}

/**
 * TacticCardSystem - manages card drafting and execution
 */
export class TacticCardSystem {
  private game: Game;
  private rng: SeededRNG;
  private juice: JuiceSystem;

  constructor(game: Game, juice: JuiceSystem) {
    this.game = game;
    this.juice = juice;
    this.rng = new SeededRNG(Date.now());
  }

  /**
   * Reset RNG for new session
   */
  resetSeed(): void {
    this.rng = new SeededRNG(Date.now());
  }

  /**
   * Draft N random cards using weighted selection
   */
  draftCards(count: number): TacticCard[] {
    const cards: TacticCard[] = [];
    const drawnTypes = new Set<CardType>();

    // Build weighted items
    const items = Object.entries(CARD_WEIGHTS).map(([type, weight]) => ({
      item: type as CardType,
      weight
    }));

    const picker = new WeightedPicker(items, this.rng);

    // Draw unique cards (no duplicates in same draft)
    while (cards.length < count && cards.length < ALL_CARDS.length) {
      const cardType = picker.pick();
      
      if (!drawnTypes.has(cardType)) {
        drawnTypes.add(cardType);
        const card = getCardByType(cardType);
        if (card) {
          cards.push(card);
        }
      }
    }

    return cards;
  }

  /**
   * Play a card
   */
  playCard(cardType: CardType, context: CardContext): CardPlayResult {
    const run = this.game.state.currentRun;
    
    if (!run) {
      return {
        success: false,
        message: 'No active run',
        energySpent: 0
      };
    }

    if (run.collapsed) {
      return {
        success: false,
        message: 'Rig has collapsed',
        energySpent: 0
      };
    }

    const card = getCardByType(cardType);
    if (!card) {
      return {
        success: false,
        message: 'Invalid card',
        energySpent: 0
      };
    }

    // Check energy availability
    if (card.energyCost > 0 && this.game.state.energy < card.energyCost) {
      return {
        success: false,
        message: `Not enough energy (need ${card.energyCost})`,
        energySpent: 0
      };
    }

    // Execute card effect
    let result: CardPlayResult;

    switch (card.type) {
      case 'SCAN':
        result = this.executeScan();
        break;
      case 'REPAIR':
        result = this.executeRepair();
        break;
      case 'BYPASS':
        result = this.executeBypass();
        break;
      case 'OVERCLOCK':
        result = this.executeOverclock();
        break;
      case 'EXTRACT':
        result = this.executeExtract(context);
        break;
      default:
        result = {
          success: false,
          message: 'Unknown card type',
          energySpent: 0
        };
    }

    // Spend energy if successful
    if (result.success && card.energyCost > 0) {
      this.game.spendEnergy(card.energyCost);
      result.energySpent = card.energyCost;
    }

    return result;
  }

  /**
   * SCAN: Control a neutral node
   */
  private executeScan(): CardPlayResult {
    const neutralNodes = this.game.state.nodes.filter(n => n.owner === 'neutral');
    
    if (neutralNodes.length === 0) {
      return {
        success: false,
        message: 'No neutral nodes to scan',
        energySpent: 0
      };
    }

    // Capture a random neutral node
    const node = neutralNodes[Math.floor(this.rng.next() * neutralNodes.length)];
    node.owner = 'player';

    // Apply stability bonus from items
    const stabilityBonus = this.game.getTotalBonus('stability_percent');
    node.stability = Math.min(100, 100 + stabilityBonus);

    return {
      success: true,
      message: `Node ${node.id} captured!`,
      energySpent: 0
    };
  }

  /**
   * REPAIR: Increase stability
   */
  private executeRepair(): CardPlayResult {
    const playerNodes = this.game.state.nodes.filter(n => n.owner === 'player');

    if (playerNodes.length === 0) {
      return {
        success: false,
        message: 'No nodes to repair',
        energySpent: 0
      };
    }

    let totalRepair = 0;
    for (const node of playerNodes) {
      const repairAmount = 15 + (node.level * 5);
      node.stability = Math.min(100, node.stability + repairAmount);
      totalRepair += repairAmount;
    }

    return {
      success: true,
      message: `Repaired ${playerNodes.length} nodes (+${totalRepair} stability)`,
      energySpent: 0
    };
  }

  /**
   * BYPASS: Gain +1 shield (max 2)
   */
  private executeBypass(): CardPlayResult {
    const run = this.game.state.currentRun;
    if (!run) {
      return {
        success: false,
        message: 'No active run',
        energySpent: 0
      };
    }

    if (run.shields >= MAX_SHIELDS) {
      return {
        success: false,
        message: 'Maximum shields reached',
        energySpent: 0
      };
    }

    run.shields++;
    return {
      success: true,
      message: `Shield acquired (${run.shields}/${MAX_SHIELDS})`,
      energySpent: 0
    };
  }

  /**
   * OVERCLOCK: Increase node level
   */
  private executeOverclock(): CardPlayResult {
    const playerNodes = this.game.state.nodes.filter(
      n => n.owner === 'player' && n.level < 3
    );

    if (playerNodes.length === 0) {
      return {
        success: false,
        message: 'No nodes to overclock',
        energySpent: 0
      };
    }

    const node = playerNodes[Math.floor(this.rng.next() * playerNodes.length)];
    node.level++;

    return {
      success: true,
      message: `Node ${node.id} upgraded to level ${node.level}!`,
      energySpent: 0
    };
  }

  /**
   * EXTRACT: Cash out with collapse risk
   */
  private executeExtract(context: CardContext): CardPlayResult {
    const run = this.game.state.currentRun;
    if (!run) {
      return {
        success: false,
        message: 'No active run',
        energySpent: 0
      };
    }

    const playerNodes = this.game.state.nodes.filter(n => n.owner === 'player');
    
    if (playerNodes.length === 0) {
      return {
        success: false,
        message: 'No nodes to extract from',
        energySpent: 0
      };
    }

    // Get target node (use context or random)
    const node = context.nodeId !== undefined
      ? this.game.getNode(context.nodeId)
      : playerNodes[Math.floor(this.rng.next() * playerNodes.length)];

    if (!node || node.owner !== 'player') {
      return {
        success: false,
        message: 'Invalid extraction target',
        energySpent: 0
      };
    }

    // Check for collapse (35% chance)
    const collapseRoll = Math.random();
    if (collapseRoll < COLLAPSE_PROBABILITY) {
      // Check for shield protection
      if (run.shields > 0) {
        run.shields--;
        this.juice.triggerShake(5, 150);
        return {
          success: true,
          message: 'Collapse absorbed by shield!',
          energySpent: 0,
          collapsed: false
        };
      }

      // Rig collapsed!
      run.collapsed = true;
      run.extractedRewards = 0;
      run.collectedItems = [];

      // Reset node
      node.owner = 'neutral';
      node.level = 1;
      node.stability = 100;

      // Trigger effects
      this.juice.triggerRigCollapse();
      this.game.state.totalCollapses++;

      return {
        success: true,
        message: 'RIG COLLAPSED! All rewards lost.',
        energySpent: 0,
        collapsed: true,
        payout: 0
      };
    }

    // Successful extract
    const viralMultiplier = this.game.getViralMultiplier();
    const payout = EXTRACT_BASE_PAYOUT * (1 + node.level) * viralMultiplier;
    
    run.extractedRewards += payout;
    this.game.state.totalExtractions++;

    // Trigger ion beam
    const screenX = this.getNodeScreenX(node);
    this.juice.triggerIonBeam(screenX);

    return {
      success: true,
      message: `Extracted $${Math.floor(payout)} from node ${node.id}!`,
      energySpent: 0,
      collapsed: false,
      payout
    };
  }

  /**
   * Get node screen X position (for ion beam)
   */
  private getNodeScreenX(node: { gridPosition: { row: number; col: number } }): number {
    const gridWidth = 600;
    const startX = (1920 - gridWidth) / 2;
    const cellWidth = gridWidth / 4;
    
    return startX + (node.gridPosition.col * cellWidth) + (cellWidth / 2);
  }

  /**
   * Check if player can afford a card
   */
  canAfford(cardType: CardType): boolean {
    const card = getCardByType(cardType);
    if (!card) return false;
    return this.game.state.energy >= card.energyCost;
  }

  /**
   * Get card cost
   */
  getCardCost(cardType: CardType): number {
    return getCardByType(cardType)?.energyCost ?? 0;
  }

  /**
   * Get all available cards
   */
  getAllCards(): TacticCard[] {
    return [...ALL_CARDS];
  }
}
