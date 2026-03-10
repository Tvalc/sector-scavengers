/**
 * Economy Configuration
 * 
 * Centralized configuration for all game economy values.
 * Modify these values to tune game balance without touching game logic.
 * 
 * Design Philosophy:
 * - Power Cells are RARE and PRECIOUS
 * - Crew acquisition feels momentous - start alone, build community slowly
 * - Ship conversion = late-game tech tree achievement
 */

import { CrewRole } from '../types/crew';
import { MissionType } from '../types/mission';

/**
 * Power Cell Costs
 * 
 * Power cells are the rare currency used for:
 * - Waking crew from cryo (specialized personnel are expensive)
 * - Ship conversion (complex engineering feat)
 */
export const POWER_CELL_COSTS = {
  /**
   * Wake costs scale with crew count to create progression.
   * First crew: 5 cells, second: 8, third: 11, etc.
   * Formula: 5 + (awakeCount * 3)
   */
  wake: {
    /** Base cost to wake first crew member */
    base: 5,
    /** Additional cost per already-awake crew member */
    perAwakeCrew: 3,
    /** Minimum cost (even with 0 awake crew) */
    min: 5,
    /** Maximum cost cap (prevents late-game explosion) */
    max: 12,
  },

  /**
   * Ship conversion costs vary by ship class.
   * Larger ships require more power for structural transformation.
   */
  shipConversion: {
    /** Class 1 (small): 8 cells */
    class1: 8,
    /** Class 2 (medium): 11 cells */
    class2: 11,
    /** Class 3 (large): 15 cells */
    class3: 15,
  },
} as const;

/**
 * EXTRACT Drop Rates
 * 
 * Power cells can be obtained through risky EXTRACT operations.
 * Base chance increases with ship class (better ships have better systems).
 * Engineers boost chance through careful extraction techniques.
 */
export const EXTRACT_DROP_RATES = {
  /**
   * Base drop chance by ship class (percentage as decimal).
   * Class 1: 5%, Class 2: 8%, Class 3: 11%
   */
  baseChance: {
    class1: 0.05,
    class2: 0.08,
    class3: 0.11,
  },

  /**
   * Bonus from crew assignments.
   * Assigned engineer increases extraction efficiency.
   */
  crewBonuses: {
    /** Engineer bonus: +2% chance (careful technique) */
    engineer: 0.02,
    /** Scavenger bonus: +1% chance (luck) */
    scavenger: 0.01,
  },

  /**
   * Minimum and maximum drop chance caps.
   * Prevents 100% farming or impossible extraction.
   */
  limits: {
    /** Minimum chance (even on Class 1 with no crew) */
    min: 0.05,
    /** Maximum chance (even with all bonuses) */
    max: 0.20,
  },
} as const;

/**
 * Mission Power Cell Rewards
 * 
 * Missions can reward power cells as bonus loot.
 * Higher-risk, longer missions give better rewards.
 */
export const MISSION_POWER_CELL_REWARDS = {
  /**
   * Power cell reward ranges by mission type.
   * Format: [min, max] inclusive range.
   */
  byType: {
    /** Salvage: Quick runs, low reward (0-1 cells) */
    [MissionType.Salvage]: [0, 1] as [number, number],
    /** Patrol: Medium risk, medium reward (1-2 cells) */
    [MissionType.Patrol]: [1, 2] as [number, number],
    /** Trade: Long duration, good reward (2-3 cells) */
    [MissionType.Trade]: [2, 3] as [number, number],
    /** Exploration: High risk, best reward (2-5 cells) */
    [MissionType.Exploration]: [2, 5] as [number, number],
  },

  /**
   * Crew bonuses to power cell rewards.
   * Certain roles increase chance of finding cells.
   */
  crewBonuses: {
    /** Scavenger luck bonus: +0.5 cells to max */
    scavenger: 0.5,
    /** Scientist discovery bonus: +0.3 cells to max */
    scientist: 0.3,
  },
} as const;

/**
 * Ship Conversion Requirements
 * 
 * Converting a claimed ship to a functional station requires:
 * - Engineering Bay (specialized room)
 * - Engineer assigned to the ship
 * - Power cells based on ship class
 */
export const SHIP_CONVERSION_REQUIREMENTS = {
  /**
   * Required room type on the ship.
   * Must have Engineering Bay built before conversion.
   */
  requiredRoom: 'engineering',

  /**
   * Required crew assignment.
   * Must have at least one Engineer assigned to ship.
   */
  requiredCrew: {
    /** Minimum engineers required */
    [CrewRole.Engineer]: 1,
    /** Other roles are optional but beneficial */
  },

  /**
   * Unlocked room slots by ship class.
   * Conversion transforms ship into station with buildable space.
   */
  unlockedRoomSlots: {
    /** Class 1: 3 room slots */
    class1: 3,
    /** Class 2: 4 room slots */
    class2: 4,
    /** Class 3: 5 room slots */
    class3: 5,
  },
} as const;

/**
 * Energy System Configuration
 * 
 * Ships generate energy passively for card actions.
 * Energy is distinct from power cells (common vs rare currency).
 */
export const ENERGY_CONFIG = {
  /**
   * Passive energy generation per minute.
   * All ships generate at this rate.
   */
  generationPerMinute: 10,

  /**
   * Maximum energy storage per ship.
   * Prevents infinite accumulation when offline.
   */
  maxPerShip: 1000,

  /**
   * Energy costs for card actions.
   */
  cardCosts: {
    scan: 5,
    repair: 10,
    bypass: 15,
    upgrade: 20,
    extract: 25,
  },
} as const;

/**
 * Crew Bonuses to Ship Operations
 * 
 * Assigned crew provide passive bonuses to ship systems.
 * These values are multipliers or flat bonuses.
 */
export const CREW_OPERATION_BONUSES = {
  /**
   * Engineer bonuses (technical expert).
   */
  [CrewRole.Engineer]: {
    /** Hull repair speed multiplier */
    hullRepairMultiplier: 1.5,
    /** Required for ship conversion */
    canConvertShips: true,
  },

  /**
   * Scientist bonuses (discovery expert).
   */
  [CrewRole.Scientist]: {
    /** Discovery chance bonus */
    discoveryBonus: 0.15,
    /** Required for advanced rooms */
    canBuildAdvancedRooms: true,
  },

  /**
   * Medic bonuses (crew efficiency).
   */
  [CrewRole.Medic]: {
    /** Global crew efficiency boost */
    crewEfficiencyBonus: 0.10,
  },

  /**
   * Scavenger bonuses (resource yield).
   */
  [CrewRole.Scavenger]: {
    /** Resource yield multiplier */
    resourceYieldMultiplier: 1.25,
    /** Extraction speed bonus */
    extractionSpeedBonus: 0.20,
  },
} as const;

/**
 * Room Building Costs
 * 
 * Base costs for constructing each room type on stations.
 * Room costs are balanced around their strategic value:
 * - Basic rooms (crew_quarters, cargo_hold) are metal-heavy and affordable early
 * - Advanced rooms (science_lab, engineering) require tech and components
 * - Support rooms (medical_bay, recreation_deck) have balanced costs
 * 
 * Design Rationale:
 * - First room should be buildable within 5-10 minutes of gameplay
 * - Player starts with enough resources for 1-2 basic rooms
 * - Advanced rooms require salvaging multiple ships
 */
export const ROOM_COSTS = {
  /**
   * Crew Quarters: Basic living space for crew expansion.
   * Metal-heavy construction, minimal tech requirements.
   * Most affordable room - typically first build.
   */
  crew_quarters: {
    metal: 50,
    tech: 20,
    components: 5,
  powerCells: 0,
  },

  /**
   * Science Lab: Research and discovery facility.
   * Tech-heavy, requires advanced equipment.
   * Unlocks discovery bonuses and advanced analysis.
   */
  science_lab: {
    metal: 30,
    tech: 50,
    components: 10,
    powerCells: 0,
  },

  /**
   * Medical Bay: Crew health and recovery.
   * Balanced costs, moderate component requirement.
   * Provides crew efficiency bonuses and healing.
   */
  medical_bay: {
    metal: 40,
    tech: 40,
    components: 15,
    powerCells: 0,
  },

  /**
   * Recreation Deck: Morale and relaxation.
   * Moderate costs across all resource types.
   * Boosts crew efficiency through improved morale.
   */
  recreation_deck: {
    metal: 35,
    tech: 30,
    components: 10,
    powerCells: 0,
  },

  /**
   * Cargo Hold: Storage and logistics.
   * Metal-heavy, minimal tech.
   * Increases resource storage capacity.
   */
  cargo_hold: {
    metal: 60,
    tech: 15,
    components: 5,
    powerCells: 0,
  },

  /**
   * Engineering Bay: Ship systems and conversion.
   * Tech and components heavy, requires expertise.
   * REQUIRED for ship conversion operations.
   */
  engineering: {
    metal: 45,
    tech: 45,
    components: 20,
    powerCells: 0,
  },
} as const;

/**
 * Room Upgrade Costs
 * 
 * Upgrades increase room effectiveness and bonuses.
 * Cost formula: Base cost × Upgrade level
 * 
 * Example: Crew Quarters Level 2
 * Base: 50 metal, 20 tech, 5 components
 * Level 2: 100 metal, 40 tech, 10 components
 * 
 * Design Rationale:
 * - Linear scaling keeps upgrades affordable early
 * - Level 3 upgrades require significant investment
 * - Max level (5) represents late-game optimization
 */
export const ROOM_UPGRADE_COSTS = {
  /**
   * Multiplier applied to base cost for each upgrade level.
   * Level 2 = 2x base, Level 3 = 3x base, etc.
   */
  costMultiplier: 1.0,

  /**
   * Maximum upgrade level for rooms.
   */
  maxLevel: 5,

  /**
   * Bonus increase per upgrade level (percentage).
   * Each level increases room bonus by this amount.
   */
  bonusIncreasePerLevel: 0.25, // 25% increase per level
} as const;

/**
 * Starting Resources
 * 
 * Initial resources for new game.
 * Balanced to allow building 1-2 basic rooms immediately:
 * - Can afford Crew Quarters (50 metal, 20 tech, 5 components)
 * - Can afford Cargo Hold (60 metal, 15 tech, 5 components)
 * - Cannot afford advanced rooms without salvaging
 */
export const STARTING_RESOURCES = {
  /** Metal for basic construction */
  metal: 100,
  /** Tech for upgrades */
  tech: 50,
  /** Components for advanced systems */
  components: 20,
  /** Power cells - START WITH NONE (must earn them) */
  powerCells: 0,
  /** Energy on home ship */
  energy: 500,
} as const;

/**
 * Helper Functions
 * 
 * Utility functions for calculating dynamic values.
 */

/**
 * Calculate wake cost based on current awake crew count.
 * Accounts for min/max caps.
 */
export function calculateWakeCost(awakeCrewCount: number): number {
  const { base, perAwakeCrew, min, max } = POWER_CELL_COSTS.wake;
  const cost = base + (awakeCrewCount * perAwakeCrew);
  return Math.max(min, Math.min(max, cost));
}

/**
 * Calculate ship conversion cost based on ship class.
 */
export function calculateConversionCost(shipClass: 1 | 2 | 3): number {
  const costs = POWER_CELL_COSTS.shipConversion;
  switch (shipClass) {
    case 1: return costs.class1;
    case 2: return costs.class2;
    case 3: return costs.class3;
  }
}

/**
 * Calculate EXTRACT drop chance with all bonuses.
 * @param shipClass Ship class (1-3)
 * @param hasEngineer Whether engineer is assigned
 * @param hasScavenger Whether scavenger is assigned
 */
export function calculateExtractDropChance(
  shipClass: 1 | 2 | 3,
  hasEngineer: boolean,
  hasScavenger: boolean
): number {
  const { baseChance, crewBonuses, limits } = EXTRACT_DROP_RATES;
  
  let chance = 0;
  switch (shipClass) {
    case 1: chance = baseChance.class1; break;
    case 2: chance = baseChance.class2; break;
    case 3: chance = baseChance.class3; break;
  }
  
  if (hasEngineer) chance += crewBonuses.engineer;
  if (hasScavenger) chance += crewBonuses.scavenger;
  
  return Math.max(limits.min, Math.min(limits.max, chance));
}

/**
 * Calculate mission power cell reward.
 * Returns a random value within the type range plus crew bonuses.
 */
export function calculateMissionPowerCellReward(
  missionType: MissionType,
  scavengerCount: number = 0,
  scientistCount: number = 0
): number {
  const [min, max] = MISSION_POWER_CELL_REWARDS.byType[missionType];
  const { scavenger, scientist } = MISSION_POWER_CELL_REWARDS.crewBonuses;
  
  // Calculate bonus to max
  const bonusMax = (scavengerCount * scavenger) + (scientistCount * scientist);
  const adjustedMax = max + bonusMax;
  
  // Random value in range
  return Math.floor(min + Math.random() * (adjustedMax - min + 1));
}

/**
 * Get unlocked room slots for ship class after conversion.
 */
export function getUnlockedRoomSlots(shipClass: 1 | 2 | 3): number {
  const { unlockedRoomSlots } = SHIP_CONVERSION_REQUIREMENTS;
  switch (shipClass) {
    case 1: return unlockedRoomSlots.class1;
    case 2: return unlockedRoomSlots.class2;
    case 3: return unlockedRoomSlots.class3;
  }
}

/**
 * Calculate room upgrade cost based on current level.
 * Formula: Base cost × (level × costMultiplier)
 */
export function calculateRoomUpgradeCost(
  roomType: keyof typeof ROOM_COSTS,
  currentLevel: number
): { metal: number; tech: number; components: number; powerCells: number } {
  const baseCost = ROOM_COSTS[roomType];
  const multiplier = (currentLevel + 1) * ROOM_UPGRADE_COSTS.costMultiplier;
  
  return {
    metal: Math.floor(baseCost.metal * multiplier),
    tech: Math.floor(baseCost.tech * multiplier),
    components: Math.floor(baseCost.components * multiplier),
    powerCells: Math.floor(baseCost.powerCells * multiplier),
  };
}

/**
 * Get room cost by type.
 */
export function getRoomCost(roomType: keyof typeof ROOM_COSTS): typeof ROOM_COSTS[keyof typeof ROOM_COSTS] {
  return ROOM_COSTS[roomType];
}

/**
 * Complete economy configuration object for easy import.
 */
export const EconomyConfig = {
  powerCellCosts: POWER_CELL_COSTS,
  extractDropRates: EXTRACT_DROP_RATES,
  missionPowerCellRewards: MISSION_POWER_CELL_REWARDS,
  shipConversionRequirements: SHIP_CONVERSION_REQUIREMENTS,
  energyConfig: ENERGY_CONFIG,
  crewOperationBonuses: CREW_OPERATION_BONUSES,
  startingResources: STARTING_RESOURCES,
  roomCosts: ROOM_COSTS,
  roomUpgradeCosts: ROOM_UPGRADE_COSTS,
} as const;

export type EconomyConfigType = typeof EconomyConfig;
