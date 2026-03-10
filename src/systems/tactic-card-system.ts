/**
 * Tactic Card System
 *
 * Handles card drafting and execution for Depth Dive sessions.
 * Three core actions: Scavenge (risk/reward), Repair (persist ship), Extract (safe exit).
 *
 * Usage:
 *   const cardSystem = new TacticCardSystem(game);
 *   const cards = cardSystem.draftCards(3);
 *   const result = cardSystem.playCard(card, context);
 */

import type { Game } from '../game/game';
import { TacticCard, CardType, getCardByType, ALL_CARDS } from '../types/cards';
import { SeededRNG } from '../random/seeded-rng';
import { JuiceSystem } from './juice-system';
import {
  getHullRepairMultiplier,
  getGlobalCrewEfficiencyBonus
} from './crew-bonus-system';
import { addCrewXP, checkCrewLoss, XP_REWARDS, CrewRole } from '../types/crew';

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
   * Draft all 3 cards (one of each type)
   * Returns all available cards in random order
   */
  draftCards(count: number): TacticCard[] {
    const cards: TacticCard[] = [];
    
    // Return all 3 cards in shuffled order
    const allCards = [...ALL_CARDS];
    
    // Fisher-Yates shuffle
    for (let i = allCards.length - 1; i > 0; i--) {
      const j = Math.floor(this.rng.next() * (i + 1));
      [allCards[i], allCards[j]] = [allCards[j], allCards[i]];
    }
    
    return allCards.slice(0, Math.min(count, allCards.length));
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
      case 'SCAVENGE':
        result = this.executeScavenge();
        break;
      case 'REPAIR':
        result = this.executeRepair();
        break;
      case 'EXTRACT':
        result = this.executeExtract();
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
   * SCAVENGE: Risk/reward salvage attempt
   * Outcome table:
   *   0-30%: Valuable item (added to run loot)
   *   30-50%: Power cell (added to resources)
   *   50-80%: Small energy (added to run rewards)
   *   80-100%: Hull breach (run ends, lose all rewards)
   */
  private executeScavenge(): CardPlayResult {
    const run = this.game.state.currentRun;
    if (!run) {
      return {
        success: false,
        message: 'No active run',
        energySpent: 0
      };
    }

    // Roll outcome (0-100)
    const roll = Math.floor(this.rng.next() * 100);
    
    if (roll < 30) {
      // Valuable item
      const items = ['rare_circuit', 'alien_tech', 'data_core', 'quantum_chip'];
      const item = items[Math.floor(this.rng.next() * items.length)];
      run.collectedItems.push(item);
      
      this.juice.triggerShake(5, 150);
      
      return {
        success: true,
        message: `Found valuable item: ${item}!`,
        energySpent: 0
      };
    } else if (roll < 50) {
      // Power cell
      this.game.state.resources.powerCells++;
      
      this.juice.triggerShake(3, 100);
      
      return {
        success: true,
        message: 'Found a power cell!',
        energySpent: 0
      };
    } else if (roll < 80) {
      // Small energy reward
      const reward = 50 + Math.floor(this.rng.next() * 50); // 50-100
      run.extractedRewards += reward;
      
      return {
        success: true,
        message: `Salvaged ${reward} energy!`,
        energySpent: 0,
        payout: reward
      };
    } else {
      // Hull breach - death
      run.collapsed = true;
      run.extractedRewards = 0;
      run.collectedItems = [];
      
      // Grant meta progression on death
      run.scrapEarned = 10;
      this.game.state.deathCurrency += 10;
      this.game.state.deckUnlockProgress += 25;
      
      console.log('[Death] Granted +10 Scrap, +25% deck progress');
      
      // Check if we can unlock a card
      if (this.game.state.deckUnlockProgress >= 100) {
        this.unlockNextCard();
      }
      
      // Track claim progress for death for the target ship
      const targetId = run.targetShipId;
      if (targetId !== null) {
        const ship = this.game.getShip(targetId);
        if (ship && ship.owner === 'player') {
          // Death on a claimed ship - increment claim progress
          if (!this.game.state.shipClaimProgress) {
            this.game.state.shipClaimProgress = {};
          }
          this.game.state.shipClaimProgress[targetId] = (this.game.state.shipClaimProgress[targetId] || 0) + 1;
          
          // Check if claimable
          if (this.game.state.shipClaimProgress[targetId] >= 3) {
            ship.claimable = true;
            console.log(`[Claim] Ship ${targetId} is now claimable!`);
          }
          
          // Check for crew loss on death (30% chance, reduced by medic)
          this.handleCrewLossOnDeath(targetId);
        }
      }
      
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
  }

  /**
   * REPAIR: restore hull integrity on the target ship
   * In the one-ship-per-run design, REPAIR only affects the target ship.
   * Marks the ship as repaired so it persists on the board.
   * Tracks claim progress toward claiming the ship.
   */
  private executeRepair(): CardPlayResult {
    const run = this.game.state.currentRun;
    if (!run) {
      return {
        success: false,
        message: 'No active run',
        energySpent: 0
      };
    }

    // Get target ship
    const targetId = run.targetShipId;
    if (targetId === null) {
      return {
        success: false,
        message: 'No target ship selected',
        energySpent: 0
      };
    }

    const ship = this.game.getShip(targetId);
    if (!ship) {
      return {
        success: false,
        message: 'Target ship not found',
        energySpent: 0
      };
    }

    const cryoState = this.game.state.cryoState;
    
    // Get global medic efficiency bonus (+10% per medic)
    const medicEfficiencyBonus = getGlobalCrewEfficiencyBonus(cryoState);
    const efficiencyMultiplier = 1 + medicEfficiencyBonus;
    
    // Base repair amount
    let repairAmount = 20 + (ship.shipClass * 5);
    
    // Apply engineer bonus (+50% if engineer assigned)
    const repairMultiplier = getHullRepairMultiplier(cryoState, ship.id);
    repairAmount = Math.floor(repairAmount * repairMultiplier);
    
    // Apply medic efficiency bonus (global)
    repairAmount = Math.floor(repairAmount * efficiencyMultiplier);
    
    ship.hullIntegrity = Math.min(100, ship.hullIntegrity + repairAmount);
    
    // Mark target as repaired - this ship will persist on the board
    run.targetRepairedThisRun = true;

    // Track claim progress (REPAIR counts toward claiming)
    if (!this.game.state.shipClaimProgress) {
      this.game.state.shipClaimProgress = {};
    }
    this.game.state.shipClaimProgress[targetId] = (this.game.state.shipClaimProgress[targetId] || 0) + 1;
    
    // Check if claimable
    if (this.game.state.shipClaimProgress[targetId] >= 3) {
      ship.claimable = true;
      console.log(`[Claim] Ship ${targetId} is now claimable!`);
    }
    
    // Grant XP to assigned crew (repair action)
    this.grantCrewXP(targetId, 15); // 15 XP for repair action

    // Log efficiency bonus if active
    if (medicEfficiencyBonus > 0) {
      console.log(`[Efficiency] Medic bonus: +${Math.round(medicEfficiencyBonus * 100)}%`);
    }

    return {
      success: true,
      message: `Repaired ship ${ship.id} (+${repairAmount} hull)`,
      energySpent: 0
    };
  }



  /**
   * EXTRACT: Safely end the run with current loot
   * No hull breach risk - this is the safe exit option.
   * Ends the run and returns to results with all collected rewards.
   */
  private executeExtract(): CardPlayResult {
    const run = this.game.state.currentRun;
    if (!run) {
      return {
        success: false,
        message: 'No active run',
        energySpent: 0
      };
    }

    // Safe exit - end the run with loot
    const totalRewards = run.extractedRewards;
    const itemCount = run.collectedItems.length;
    const targetId = run.targetShipId;
    
    // Track claim progress (run completion counts toward claiming)
    if (targetId !== null) {
      if (!this.game.state.shipClaimProgress) {
        this.game.state.shipClaimProgress = {};
      }
      this.game.state.shipClaimProgress[targetId] = (this.game.state.shipClaimProgress[targetId] || 0) + 1;
      
      // Check if claimable
      if (this.game.state.shipClaimProgress[targetId] >= 3) {
        const ship = this.game.getShip(targetId);
        if (ship) {
          ship.claimable = true;
          console.log(`[Claim] Ship ${targetId} is now claimable!`);
        }
      }
      
      // Grant XP to assigned crew (run completion - major XP reward)
      this.grantCrewXP(targetId, XP_REWARDS.RUN_COMPLETION); // 50 XP for completing run
    }
    
    // Schedule end of run after a short delay to show message
    setTimeout(() => {
      this.game.endDepthDive();
    }, 500);
    
    const message = itemCount > 0 
      ? `Extracting ${Math.floor(totalRewards)} energy + ${itemCount} items!`
      : `Extracting ${Math.floor(totalRewards)} energy!`;
    
    return {
      success: true,
      message,
      energySpent: 0,
      payout: totalRewards
    };
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

  /**
   * Handle crew loss on death
   * 30% chance per assigned crew member, reduced by medic presence
   */
  private handleCrewLossOnDeath(targetShipId: number): void {
    const crewRoster = this.game.state.crewRoster;
    if (!crewRoster || crewRoster.length === 0) return;
    
    // Check for medic bonus (reduces loss chance by 50%)
    const hasMedic = crewRoster.some(crew => 
      crew.alive && 
      crew.role === CrewRole.Medic && 
      crew.assignment?.type === 'ship'
    );
    
    // Check each assigned crew member
    for (const crew of crewRoster) {
      if (crew.alive && crew.assignment?.type === 'ship' && crew.assignment.targetId === targetShipId) {
        const lost = checkCrewLoss(crew, hasMedic);
        if (lost) {
          console.log(`[Death] ${crew.name} was lost in the hull breach!`);
        }
      }
    }
  }
  
  /**
   * Grant XP to crew assigned to target ship
   */
  private grantCrewXP(targetShipId: number, xpAmount: number): void {
    const crewRoster = this.game.state.crewRoster;
    if (!crewRoster || crewRoster.length === 0) return;
    
    for (const crew of crewRoster) {
      if (crew.alive && crew.assignment?.type === 'ship' && crew.assignment.targetId === targetShipId) {
        const leveledUp = addCrewXP(crew, xpAmount);
        if (leveledUp) {
          console.log(`[Crew] ${crew.name} leveled up to ${crew.level}!`);
        }
      }
    }
  }
  
  /**
   * Unlock next card when progress reaches 100
   */
  private unlockNextCard(): void {
    // Simple card unlock system - add new card types here as needed
    const availableCards = [
      { id: 'advanced_scavenge', name: 'Advanced Scavenge', description: 'Improved Scavenge card' },
      { id: 'efficient_repair', name: 'Efficient Repair', description: 'Improved Repair card' },
      { id: 'quick_extract', name: 'Quick Extract', description: 'Improved Extract card' }
    ];
    
    // Find next card to unlock
    let nextCard = availableCards.find(card => 
      !this.game.state.unlockedCards.includes(card.id)
    );
    
    if (nextCard) {
      this.game.state.unlockedCards.push(nextCard.id);
      this.game.state.nextUnlockCardId = nextCard.id;
      this.game.state.deckUnlockProgress = 0; // Reset for next card
      console.log(`[Deck] Unlocked: ${nextCard.name}`);
    } else {
      console.log('[Deck] All cards unlocked!');
    }
  }
}
