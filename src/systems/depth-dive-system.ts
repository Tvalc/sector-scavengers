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
import { Spacecraft } from '../types/spacecraft';
import { JuiceSystem } from './juice-system';
import { SeededRNG } from '../random/seeded-rng';
import { WeightedPicker } from '../random/weighted-picker';
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
      collectedItems: []
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
  // Extract
  // ============================================================================

  /**
   * Extract from a ship
   */
  extract(shipId: number, shipClass: number, multiplier: number): number {
    const run = this.getRun();
    if (!run || run.collapsed) return 0;

    const payout = EXTRACT_BASE_PAYOUT * (1 + shipClass) * multiplier;
    run.extractedRewards += payout;
    this.game.state.totalExtractions++;

    const ship = this.game.getShip(shipId);
    if (ship) {
      const screenX = this.getShipScreenX(ship);
      this.juice.triggerIonBeam(screenX);
    }

    console.log(`[DepthDive] Extracted ${payout} from ship ${shipId}`);
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
      case 'UPGRADE':
        return this.executeUpgrade();
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
    const neutralShips = this.game.state.spacecraft.filter(s => s.owner === 'neutral');
    if (neutralShips.length === 0) return false;

    const ship = neutralShips[Math.floor(this.rng.next() * neutralShips.length)];
    ship.owner = 'player';
    
    const stabilityBonus = this.game.getTotalBonus('stability_percent');
    ship.hullIntegrity = Math.min(100, 100 + stabilityBonus);

    return true;
  }

  private executeRepair(): boolean {
    const playerShips = this.game.state.spacecraft.filter(s => s.owner === 'player');
    if (playerShips.length === 0) return false;
    
    const cryoState = this.game.state.cryoState;
    
    // Get global medic efficiency bonus (+10% per medic)
    const medicEfficiencyBonus = getGlobalCrewEfficiencyBonus(cryoState);
    const efficiencyMultiplier = 1 + medicEfficiencyBonus;
    
    for (const ship of playerShips) {
      // Base repair
      let repairAmount = 15 + (ship.shipClass * 5);
      
      // Apply engineer bonus (+50% if engineer assigned)
      const repairMultiplier = getHullRepairMultiplier(cryoState, ship.id);
      repairAmount = Math.floor(repairAmount * repairMultiplier);
      
      // Apply medic efficiency bonus (global)
      repairAmount = Math.floor(repairAmount * efficiencyMultiplier);
      
      ship.hullIntegrity = Math.min(100, ship.hullIntegrity + repairAmount);
    }

    // Log efficiency bonus if active
    if (medicEfficiencyBonus > 0) {
      console.log(`[Efficiency] Medic bonus: +${Math.round(medicEfficiencyBonus * 100)}%`);
    }

    return true;
  }

  private executeBypass(): boolean {
    return this.addShield();
  }

  private executeUpgrade(): boolean {
    const playerShips = this.game.state.spacecraft.filter(
      s => s.owner === 'player' && s.shipClass < 3
    );

    if (playerShips.length === 0) return false;

    const ship = playerShips[Math.floor(this.rng.next() * playerShips.length)];
    ship.shipClass = Math.min(3, ship.shipClass + 1) as 1 | 2 | 3;

    return true;
  }

  private executeExtract(): boolean {
    const run = this.getRun();
    if (!run) return false;

    const playerShips = this.game.state.spacecraft.filter(s => s.owner === 'player');
    if (playerShips.length === 0) return false;

    const ship = playerShips[Math.floor(this.rng.next() * playerShips.length)];

    if (this.rng.next() < COLLAPSE_PROBABILITY) {
      if (run.shields > 0) {
        run.shields--;
        this.juice.triggerShake(5, 150);
      } else {
        run.collapsed = true;
        run.extractedRewards = 0;
        run.collectedItems = [];
        
        ship.owner = 'neutral';
        ship.shipClass = 1;
        ship.hullIntegrity = 100;

        this.juice.triggerHullBreach();
        this.game.state.totalCollapses++;
        
        return true;
      }
    }

    const cryoState = this.game.state.cryoState;
    
    // Apply scavenger bonus (+25% resource yield)
    const scavengerMultiplier = getResourceYieldMultiplier(cryoState, ship.id);
    
    // Apply medic efficiency bonus (global)
    const medicEfficiencyBonus = getGlobalCrewEfficiencyBonus(cryoState);
    const efficiencyMultiplier = 1 + medicEfficiencyBonus;
    
    const viralMultiplier = this.game.getViralMultiplier();
    const basePayout = EXTRACT_BASE_PAYOUT * (1 + ship.shipClass);
    const payout = Math.floor(basePayout * viralMultiplier * scavengerMultiplier * efficiencyMultiplier);
    
    run.extractedRewards += payout;
    this.game.state.totalExtractions++;

    // Check for power cell drop
    this.checkPowerCellDrop(ship);

    const shipScreenX = this.getShipScreenX(ship);
    this.juice.triggerIonBeam(shipScreenX);

    return true;
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

  /**
   * Check for power cell drop on successful extraction
   */
  private checkPowerCellDrop(ship: Spacecraft): void {
    // Check if any engineer is assigned to this ship
    const hasEngineer = this.hasAssignedEngineer(ship.id);
    const hasScavenger = this.hasAssignedScavenger(ship.id);
    
    // Calculate drop chance using EconomyConfig
    const dropChance = calculateExtractDropChance(ship.shipClass, hasEngineer, hasScavenger);
    
    // Roll for power cell drop
    if (Math.random() < dropChance) {
      this.game.state.resources.powerCells++;
      console.log(`[EXTRACT] Power cell found! (Ship class ${ship.shipClass}, ${Math.round(dropChance * 100)}% chance)`);
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

  private getShipScreenX(ship: Spacecraft): number {
    const gridWidth = 600;
    const startX = (1920 - gridWidth) / 2;
    const cellWidth = gridWidth / 4;
    
    return startX + (ship.gridPosition.col * cellWidth) + (cellWidth / 2);
  }
}

