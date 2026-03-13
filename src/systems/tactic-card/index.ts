/**
 * Tactic Card System
 *
 * Handles card drafting and execution for Depth Dive sessions.
 * Three core actions: Scavenge (risk/reward), Repair (persist ship), Extract (safe exit).
 *
 * Usage:
 *   const cardSystem = new TacticCardSystem(game, juice);
 *   const cards = cardSystem.draftCards(3);
 *   const result = cardSystem.playCard(cardType, context);
 */

import type { Game } from '../../game/game';
import { TacticCard, CardType, getCardByType, getAvailableCards } from '../../types/cards';
import { JuiceSystem } from '../juice-system';
import { CardDrafter } from './card-drafting';
import {
  executeScavenge,
  executeRepair,
  executeExtract,
  executeShield,
  executeUpgrade,
  executeAnalyze,
  executeRushScavenge,
  executeFullHaul,
  executeBreakRoomRaid
} from './card-effects';
import {
  activateWorkingMemory,
  canShowRerollButton,
  activateDeadDrop,
  canShowDeadDropButton
} from './abilities';
import type { CardPlayResult, CardContext } from './types';

/**
 * TacticCardSystem - main entry point for card gameplay
 */
export class TacticCardSystem {
  private game: Game;
  private drafter: CardDrafter;
  private juice: JuiceSystem;

  constructor(game: Game, juice: JuiceSystem) {
    this.game = game;
    this.juice = juice;
    this.drafter = new CardDrafter();
  }

  /**
   * Reset RNG for new session
   */
  resetSeed(): void {
    this.drafter.resetSeed();
  }

  /**
   * Draft 3 cards from available pool
   */
  draftCards(count: number): TacticCard[] {
    return this.drafter.draftCards(this.game, count);
  }

  /**
   * Reroll the current hand (Max Chen's Working Memory)
   */
  rerollHand(): boolean {
    return activateWorkingMemory(this.game);
  }

  /**
   * Check if reroll button should be visible
   */
  canShowRerollButton(): boolean {
    return canShowRerollButton(this.game);
  }

  /**
   * Play a card
   */
  playCard(cardType: CardType, context: CardContext): CardPlayResult {
    const run = this.game.state.currentRun;

    if (!run) {
      return { success: false, message: 'No active run', energySpent: 0 };
    }

    if (run.collapsed) {
      return { success: false, message: 'Hull breach occurred', energySpent: 0 };
    }

    const card = getCardByType(cardType);
    if (!card) {
      return { success: false, message: 'Invalid card', energySpent: 0 };
    }

    if (card.energyCost > 0 && this.game.state.energy < card.energyCost) {
      return { success: false, message: `Not enough energy (need ${card.energyCost})`, energySpent: 0 };
    }

    // Execute card effect
    const deps = { rng: this.drafter.getRNG(), juice: this.juice };
    let result: CardPlayResult;

    switch (card.type) {
      case 'SCAVENGE':
        result = executeScavenge(this.game, deps);
        break;
      case 'REPAIR':
        result = executeRepair(this.game);
        break;
      case 'EXTRACT':
        result = executeExtract(this.game);
        break;
      case 'SHIELD':
        result = executeShield(this.game);
        break;
      case 'UPGRADE':
        result = executeUpgrade(this.game, deps);
        break;
      case 'ANALYZE':
        result = executeAnalyze(this.game, deps);
        break;
      case 'RUSH_SCAVENGE':
        result = executeRushScavenge(this.game, deps);
        break;
      case 'FULL_HAUL':
        result = executeFullHaul(this.game, deps);
        break;
      case 'BREAK_ROOM_RAID':
        result = executeBreakRoomRaid(this.game, deps);
        break;
      default:
        result = { success: false, message: 'Unknown card type', energySpent: 0 };
    }

    // Spend energy if successful
    if (result.success && card.energyCost > 0) {
      this.game.spendEnergy(card.energyCost);
      result.energySpent = card.energyCost;
    }

    return result;
  }

  /**
   * Activate Dead Drop (Rook's ability)
   */
  activateDeadDrop(): boolean {
    return activateDeadDrop(this.game);
  }

  /**
   * Check if Dead Drop button should be visible
   */
  canShowDeadDropButton(): boolean {
    return canShowDeadDropButton(this.game);
  }

  /**
   * Check if player can afford a card
   */
  canAfford(cardType: CardType): boolean {
    const card = getCardByType(cardType);
    return card ? this.game.state.energy >= card.energyCost : false;
  }

  /**
   * Get card cost
   */
  getCardCost(cardType: CardType): number {
    return getCardByType(cardType)?.energyCost ?? 0;
  }

  /**
   * Get all available cards (core + unlocked)
   */
  getAllCards(): TacticCard[] {
    return getAvailableCards(this.game.state.unlockedCards);
  }
}

// Re-export types for consumers
export { CardPlayResult, CardContext } from './types';
