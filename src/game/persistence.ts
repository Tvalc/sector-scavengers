/**
 * Persistence
 *
 * Save and load operations for game state persistence to localStorage.
 */

import { SaveManager } from '../save/save-manager';
import { SectorScavengersSave, GameAccess } from './types';
import { updateViralMultiplier } from './state-management';

/**
 * Available save slots (1, 2, 3)
 */
export const SAVE_SLOTS = [1, 2, 3] as const;
export type SaveSlotNumber = typeof SAVE_SLOTS[number];

/**
 * Get the localStorage key for a specific save slot
 */
export function getSlotKey(slot: number): string {
  return `sector-scavengers-slot-${slot}`;
}

/**
 * Create a save manager for a specific slot
 */
function createSlotSaveManager(slot: number): SaveManager<SectorScavengersSave> {
  return new SaveManager<SectorScavengersSave>(getSlotKey(slot), 1);
}

/**
 * Check if a save slot has existing save data
 */
export function slotHasSave(slot: number): boolean {
  const saveManager = createSlotSaveManager(slot);
  return saveManager.load() !== null;
}

/**
 * Get display information for a save slot
 */
export function getSlotInfo(slot: number): { exists: boolean; debt: number; sector: number; runsCompleted: number } | null {
  const saveManager = createSlotSaveManager(slot);
  const saveData = saveManager.load();
  
  if (!saveData) {
    return null;
  }
  
  return {
    exists: true,
    debt: saveData.meta?.debt ?? 0,
    sector: saveData.meta?.currentSector ?? 1,
    runsCompleted: saveData.meta?.runsCompleted ?? 0
  };
}

/**
 * Save game state to a specific slot
 */
export function saveToSlot(game: GameAccess, slot: number): void {
  const saveManager = createSlotSaveManager(slot);
  
  saveManager.save({
    energy: game.state.energy,
    spacecraft: game.state.spacecraft,
    inventory: game.state.inventory,
    viralMultiplier: game.state.viralMultiplier,
    viralMultiplierExpiry: game.state.viralMultiplierExpiry,
    totalPlayEarned: game.state.totalPlayEarned,
    totalExtractions: game.state.totalExtractions,
    totalCollapses: game.state.totalCollapses,
    tutorialSeen: game.state.tutorialSeen,
    tutorialSkipped: game.state.tutorialSkipped ?? false,
    hubSelectedShips: game.state.hubSelectedShips,
    persistedShips: game.state.persistedShips,
    resources: game.state.resources,
    cryoState: game.state.cryoState,
    availableCryoPods: game.state.availableCryoPods,
    activeMissions: game.state.activeMissions,
    availableMissions: game.state.availableMissions,
    completedMissionCount: game.state.completedMissionCount,
    deathCurrency: game.state.deathCurrency,
    deckUnlockProgress: game.state.deckUnlockProgress,
    nextUnlockCardId: game.state.nextUnlockCardId,
    unlockedCards: game.state.unlockedCards,
    crewRoster: game.state.crewRoster,
    crewAssignments: game.state.crewAssignments,
    meta: game.state.meta,
    storyState: game.storyState.toJSON(),
    shipClaimProgress: game.state.shipClaimProgress,
    selectedLead: game.state.selectedLead,
    companionSlots: game.state.companionSlots
  });
}

/**
 * Load game state from a specific slot
 * @returns true if load succeeded, false if slot is empty
 */
export function loadFromSlot(game: GameAccess, slot: number): boolean {
  const saveManager = createSlotSaveManager(slot);
  const saveData = saveManager.load();

  if (!saveData) {
    return false;
  }
  
  // Apply loaded data using the same logic as loadGameState
  applySaveData(game, saveData);
  return true;
}

/**
 * Apply save data to game state (shared between slot loading and default loading)
 */
function applySaveData(game: GameAccess, saveData: SectorScavengersSave): void {
  // Primitive values
  game.state.energy = saveData.energy ?? game.state.energy;
  game.state.viralMultiplier = saveData.viralMultiplier ?? 1.0;
  game.state.viralMultiplierExpiry = saveData.viralMultiplierExpiry ?? null;
  game.state.totalPlayEarned = saveData.totalPlayEarned ?? 0;
  game.state.totalExtractions = saveData.totalExtractions ?? 0;
  game.state.totalCollapses = saveData.totalCollapses ?? 0;
  game.state.tutorialSeen = saveData.tutorialSeen ?? false;
  game.state.tutorialSkipped = saveData.tutorialSkipped ?? false;
  game.state.hubSelectedShips = saveData.hubSelectedShips ?? [];
  game.state.persistedShips = saveData.persistedShips ?? [];
  
  // Array/object values with validation
  if (saveData.spacecraft && Array.isArray(saveData.spacecraft)) {
    game.state.spacecraft = saveData.spacecraft;
  }
  
  if (saveData.inventory && 
      typeof saveData.inventory === 'object' &&
      'hardware' in saveData.inventory && 
      'crew' in saveData.inventory) {
    game.state.inventory = saveData.inventory;
  }
  
  if (saveData.resources && typeof saveData.resources === 'object') {
    game.state.resources = saveData.resources;
  }
  
  if (saveData.cryoState && typeof saveData.cryoState === 'object') {
    game.state.cryoState = saveData.cryoState;
  }
  
  if (typeof saveData.availableCryoPods === 'number') {
    game.state.availableCryoPods = saveData.availableCryoPods;
  }
  
  if (saveData.activeMissions && Array.isArray(saveData.activeMissions)) {
    game.state.activeMissions = saveData.activeMissions;
  }
  
  if (saveData.availableMissions && Array.isArray(saveData.availableMissions)) {
    game.state.availableMissions = saveData.availableMissions;
  }
  
  if (typeof saveData.completedMissionCount === 'number') {
    game.state.completedMissionCount = saveData.completedMissionCount;
  }
  
  // Meta progression
  game.state.deathCurrency = saveData.deathCurrency ?? 1;
  game.state.deckUnlockProgress = saveData.deckUnlockProgress ?? 1;
  game.state.nextUnlockCardId = saveData.nextUnlockCardId ?? null;
  game.state.unlockedCards = saveData.unlockedCards ?? [];
  
  game.state.crewRoster = saveData.crewRoster ?? [];
  game.state.crewAssignments = saveData.crewAssignments ?? {};
  
  if (saveData.meta && typeof saveData.meta === 'object') {
    game.state.meta = {
      ...saveData.meta,
      runsCompleted: saveData.meta.runsCompleted ?? 0
    };
  }
  
  if (saveData.storyState && typeof saveData.storyState === 'object') {
    game.storyState.fromJSON(saveData.storyState);
  }
  
  if (saveData.shipClaimProgress && typeof saveData.shipClaimProgress === 'object') {
    game.state.shipClaimProgress = saveData.shipClaimProgress;
  }
  
  if (saveData.selectedLead !== undefined) {
    game.state.selectedLead = saveData.selectedLead;
  }
  if (saveData.companionSlots && Array.isArray(saveData.companionSlots)) {
    game.state.companionSlots = saveData.companionSlots;
  }
  
  updateViralMultiplier(game);
}

/**
 * Create a save manager instance
 */
export function createSaveManager(): SaveManager<SectorScavengersSave> {
  return new SaveManager<SectorScavengersSave>('sector-scavengers', 1);
}

/**
 * Save game state to localStorage
 */
export function saveGameState(game: GameAccess, saveManager: SaveManager<SectorScavengersSave>): void {
  saveManager.save({
    energy: game.state.energy,
    spacecraft: game.state.spacecraft,
    inventory: game.state.inventory,
    viralMultiplier: game.state.viralMultiplier,
    viralMultiplierExpiry: game.state.viralMultiplierExpiry,
    totalPlayEarned: game.state.totalPlayEarned,
    totalExtractions: game.state.totalExtractions,
    totalCollapses: game.state.totalCollapses,
    tutorialSeen: game.state.tutorialSeen,
    tutorialSkipped: game.state.tutorialSkipped ?? false,
    hubSelectedShips: game.state.hubSelectedShips,
    persistedShips: game.state.persistedShips,
    resources: game.state.resources,
    cryoState: game.state.cryoState,
    availableCryoPods: game.state.availableCryoPods,
    activeMissions: game.state.activeMissions,
    availableMissions: game.state.availableMissions,
    completedMissionCount: game.state.completedMissionCount,
    deathCurrency: game.state.deathCurrency,
    deckUnlockProgress: game.state.deckUnlockProgress,
    nextUnlockCardId: game.state.nextUnlockCardId,
    unlockedCards: game.state.unlockedCards,
    crewRoster: game.state.crewRoster,
    crewAssignments: game.state.crewAssignments,
    meta: game.state.meta,
    storyState: game.storyState.toJSON(),
    shipClaimProgress: game.state.shipClaimProgress,
    selectedLead: game.state.selectedLead,
    companionSlots: game.state.companionSlots
  });
}

/**
 * Load game state from localStorage (default slot 1 for backward compatibility)
 */
export function loadGameState(game: GameAccess, saveManager: SaveManager<SectorScavengersSave>): void {
  const saveData = saveManager.load();

  if (!saveData) return;
  
  applySaveData(game, saveData);
}
