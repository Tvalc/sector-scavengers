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
import { calculateExtractDropChance } from '../config/economy-config';
import { CrewRole } from '../types/crew';
import {
  hasAssignedEngineer,
  hasAssignedScavenger,
  hasAssignedScientist,
  hasAssignedMedic,
  getHullRepairMultiplier,
  getResourceYieldMultiplier,
  getGlobalCrewEfficiencyBonus,
  getDiscoveryBonus
} from './crew-bonus-system';

/**
 * Card weights for drafting
 */
const CARD_WEIGHTS: Record<CardType, number> = {
  SCAN: 25,
  REPAIR: 20,
  BYPASS: 15,
  UPGRADE: 15,
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
  shipId?: number;
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
        message: 'Hull breach occurred',
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
      case 'UPGRADE':
        result = this.executeUpgrade();
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
   * SCAN: Claim a derelict ship
   */
  private executeScan(): CardPlayResult {
    const neutralShips = this.game.state.spacecraft.filter(s => s.owner === 'neutral');
    
    if (neutralShips.length === 0) {
      return {
        success: false,
        message: 'No derelict ships to scan',
        energySpent: 0
      };
    }

    // Claim a random neutral ship
    const ship = neutralShips[Math.floor(this.rng.next() * neutralShips.length)];
    ship.owner = 'player';

    // Apply hull integrity bonus from items
    const stabilityBonus = this.game.getTotalBonus('stability_percent');
    ship.hullIntegrity = Math.min(100, 100 + stabilityBonus);

    return {
      success: true,
      message: `Ship ${ship.id} claimed!`,
      energySpent: 0
    };
  }

  /**
   * REPAIR: Restore hull integrity
   */
  private executeRepair(): CardPlayResult {
    const playerShips = this.game.state.spacecraft.filter(s => s.owner === 'player');

    if (playerShips.length === 0) {
      return {
        success: false,
        message: 'No ships to repair',
        energySpent: 0
      };
    }

    let totalRepair = 0;
    const cryoState = this.game.state.cryoState;
    
    // Get global medic efficiency bonus (+10% per medic)
    const medicEfficiencyBonus = getGlobalCrewEfficiencyBonus(cryoState);
    const efficiencyMultiplier = 1 + medicEfficiencyBonus;
    
    for (const ship of playerShips) {
      // Base repair amount
      let repairAmount = 15 + (ship.shipClass * 5);
      
      // Apply engineer bonus (+50% if engineer assigned)
      const repairMultiplier = getHullRepairMultiplier(cryoState, ship.id);
      repairAmount = Math.floor(repairAmount * repairMultiplier);
      
      // Apply medic efficiency bonus (global)
      repairAmount = Math.floor(repairAmount * efficiencyMultiplier);
      
      ship.hullIntegrity = Math.min(100, ship.hullIntegrity + repairAmount);
      totalRepair += repairAmount;
    }

    // Log efficiency bonus if active
    if (medicEfficiencyBonus > 0) {
      console.log(`[Efficiency] Medic bonus: +${Math.round(medicEfficiencyBonus * 100)}%`);
    }

    return {
      success: true,
      message: `Repaired ${playerShips.length} ships (+${totalRepair} hull integrity)`,
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
   * UPGRADE: Upgrade ship class
   */
  private executeUpgrade(): CardPlayResult {
    const playerShips = this.game.state.spacecraft.filter(
      s => s.owner === 'player' && s.shipClass < 3
    );

    if (playerShips.length === 0) {
      return {
        success: false,
        message: 'No ships to upgrade',
        energySpent: 0
      };
    }

    const ship = playerShips[Math.floor(this.rng.next() * playerShips.length)];
    ship.shipClass++;

    return {
      success: true,
      message: `Ship ${ship.id} upgraded to class ${ship.shipClass}!`,
      energySpent: 0
    };
  }

  /**
   * EXTRACT: Salvage with hull breach risk
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

    const playerShips = this.game.state.spacecraft.filter(s => s.owner === 'player');
    
    if (playerShips.length === 0) {
      return {
        success: false,
        message: 'No ships to salvage',
        energySpent: 0
      };
    }

    // Get target ship (use context or random)
    const ship = context.shipId !== undefined
      ? this.game.getShip(context.shipId)
      : playerShips[Math.floor(this.rng.next() * playerShips.length)];

    if (!ship || ship.owner !== 'player') {
      return {
        success: false,
        message: 'Invalid salvage target',
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

      // Hull breach!
      run.collapsed = true;
      run.extractedRewards = 0;
      run.collectedItems = [];

      // Reset ship
      ship.owner = 'neutral';
      ship.shipClass = 1;
      ship.hullIntegrity = 100;

      // Trigger effects
      this.juice.triggerHullBreach();
      this.game.state.totalCollapses++;

      return {
        success: true,
        message: 'HULL BREACH! All rewards lost.',
        energySpent: 0,
        collapsed: true,
        payout: 0
      };
    }

    // Successful salvage
    const cryoState = this.game.state.cryoState;
    
    // Apply scavenger bonus (+25% resource yield)
    const scavengerMultiplier = getResourceYieldMultiplier(cryoState, ship.id);
    
    // Apply medic efficiency bonus (global)
    const medicEfficiencyBonus = getGlobalCrewEfficiencyBonus(cryoState);
    const efficiencyMultiplier = 1 + medicEfficiencyBonus;
    
    const viralMultiplier = this.game.getViralMultiplier();
    const payout = Math.floor(EXTRACT_BASE_PAYOUT * (1 + ship.shipClass) * viralMultiplier * scavengerMultiplier * efficiencyMultiplier);
    
    run.extractedRewards += payout;
    this.game.state.totalExtractions++;

    // Check for power cell drop
    this.checkPowerCellDrop(ship);

    // Trigger ion beam
    const screenX = this.getShipScreenX(ship);
    this.juice.triggerIonBeam(screenX);

    return {
      success: true,
      message: `Salvaged ${Math.floor(payout)} from ship ${ship.id}!`,
      energySpent: 0,
      collapsed: false,
      payout
    };
  }

  /**
   * Check for power cell drop on successful extraction
   */
  private checkPowerCellDrop(ship: { id: number; shipClass: 1 | 2 | 3 }): void {
    // Check if any engineer is assigned to this ship
    const hasEngineer = this.hasAssignedEngineer(ship.id);
    const hasScavenger = this.hasAssignedScavenger(ship.id);
    
    // Calculate drop chance using EconomyConfig
    const dropChance = calculateExtractDropChance(ship.shipClass, hasEngineer, hasScavenger);
    
    // Roll for power cell drop
    if (Math.random() < dropChance) {
      this.game.state.resources.powerCells++;
      console.log(`[EXTRACT] Power cell found! (Ship class ${ship.shipClass}, ${dropChance * 100}% chance)`);
    }
  }

  /**
   * Check if any engineer is assigned to a specific ship
   */
  private hasAssignedEngineer(shipId: number): boolean {
    if (!this.game.state.cryoState) return false;
    return hasAssignedEngineer(this.game.state.cryoState, shipId);
  }

  /**
   * Check if any scavenger is assigned to a specific ship
   */
  private hasAssignedScavenger(shipId: number): boolean {
    if (!this.game.state.cryoState) return false;
    return hasAssignedScavenger(this.game.state.cryoState, shipId);
  }

  /**
   * Get ship screen X position (for ion beam)
   */
  private getShipScreenX(ship: { gridPosition: { row: number; col: number } }): number {
    const gridWidth = 600;
    const startX = (1920 - gridWidth) / 2;
    const cellWidth = gridWidth / 4;
    
    return startX + (ship.gridPosition.col * cellWidth) + (cellWidth / 2);
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
