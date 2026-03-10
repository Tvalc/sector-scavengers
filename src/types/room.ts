/**
 * Room System Types and Configuration
 * 
 * Defines room types, bonuses, and costs for station ships.
 */

import { Resources } from './resources';

/**
 * Room types available for stations
 */
export type RoomType = 
  | 'crew_quarters'
  | 'science_lab'
  | 'medical_bay'
  | 'recreation_deck'
  | 'cargo_hold'
  | 'engineering';

/**
 * Room bonus types
 */
export interface RoomBonuses {
  /** Additional crew capacity */
  crewCapacity: number;
  /** Bonus to discovery chance (percentage) */
  discoveryBonus: number;
  /** Hull repair rate bonus (percentage) */
  hullRepairBonus: number;
  /** Crew efficiency bonus (percentage) */
  crewEfficiency: number;
  /** Resource storage capacity bonus */
  storageCapacity: number;
  /** Power generation bonus (per minute) */
  powerGeneration: number;
}

/**
 * Room configuration including costs and bonuses
 */
export interface RoomConfig {
  type: RoomType;
  name: string;
  description: string;
  /** Base build cost (for level 1) */
  buildCost: Resources;
  /** Upgrade cost multiplier (level 2 = base * 1.5, level 3 = base * 2) */
  upgradeCostMultiplier: number;
  /** Bonuses per level */
  bonusesPerLevel: RoomBonuses;
  /** Maximum level */
  maxLevel: 3;
}

/**
 * Room built on a station
 */
export interface Room {
  type: RoomType;
  level: 1 | 2 | 3;
}

/**
 * Room configuration database
 */
export const ROOM_CONFIGS: Record<RoomType, RoomConfig> = {
  crew_quarters: {
    type: 'crew_quarters',
    name: 'Crew Quarters',
    description: 'Living space for crew members',
    buildCost: { metal: 50, tech: 20, components: 0, powerCells: 0 },
    upgradeCostMultiplier: 1.5,
    bonusesPerLevel: {
      crewCapacity: 2,
      discoveryBonus: 0,
      hullRepairBonus: 0,
      crewEfficiency: 0,
      storageCapacity: 0,
      powerGeneration: 0
    },
    maxLevel: 3
  },
  
  science_lab: {
    type: 'science_lab',
    name: 'Science Lab',
    description: 'Research facility for tech discovery',
    buildCost: { metal: 80, tech: 60, components: 10, powerCells: 0 },
    upgradeCostMultiplier: 1.5,
    bonusesPerLevel: {
      crewCapacity: 0,
      discoveryBonus: 10,
      hullRepairBonus: 0,
      crewEfficiency: 0,
      storageCapacity: 0,
      powerGeneration: 0
    },
    maxLevel: 3
  },
  
  medical_bay: {
    type: 'medical_bay',
    name: 'Medical Bay',
    description: 'Heals hull integrity over time',
    buildCost: { metal: 100, tech: 40, components: 15, powerCells: 0 },
    upgradeCostMultiplier: 1.5,
    bonusesPerLevel: {
      crewCapacity: 0,
      discoveryBonus: 0,
      hullRepairBonus: 15,
      crewEfficiency: 0,
      storageCapacity: 0,
      powerGeneration: 0
    },
    maxLevel: 3
  },
  
  recreation_deck: {
    type: 'recreation_deck',
    name: 'Recreation Deck',
    description: 'Boosts crew efficiency and morale',
    buildCost: { metal: 60, tech: 30, components: 5, powerCells: 0 },
    upgradeCostMultiplier: 1.5,
    bonusesPerLevel: {
      crewCapacity: 0,
      discoveryBonus: 0,
      hullRepairBonus: 0,
      crewEfficiency: 15,
      storageCapacity: 0,
      powerGeneration: 0
    },
    maxLevel: 3
  },
  
  cargo_hold: {
    type: 'cargo_hold',
    name: 'Cargo Hold',
    description: 'Increases resource storage capacity',
    buildCost: { metal: 40, tech: 10, components: 0, powerCells: 0 },
    upgradeCostMultiplier: 1.5,
    bonusesPerLevel: {
      crewCapacity: 0,
      discoveryBonus: 0,
      hullRepairBonus: 0,
      crewEfficiency: 0,
      storageCapacity: 50,
      powerGeneration: 0
    },
    maxLevel: 3
  },
  
  engineering: {
    type: 'engineering',
    name: 'Engineering Bay',
    description: 'Generates additional power',
    buildCost: { metal: 90, tech: 50, components: 20, powerCells: 0 },
    upgradeCostMultiplier: 1.5,
    bonusesPerLevel: {
      crewCapacity: 0,
      discoveryBonus: 0,
      hullRepairBonus: 0,
      crewEfficiency: 0,
      storageCapacity: 0,
      powerGeneration: 5
    },
    maxLevel: 3
  }
};

/**
 * Get room configuration by type
 */
export function getRoomConfig(type: RoomType): RoomConfig {
  return ROOM_CONFIGS[type];
}

/**
 * Get all room types
 */
export function getAllRoomTypes(): RoomType[] {
  return Object.keys(ROOM_CONFIGS) as RoomType[];
}

/**
 * Calculate upgrade cost for a room
 */
export function getUpgradeCost(room: Room): Resources {
  const config = getRoomConfig(room.type);
  const multiplier = Math.pow(config.upgradeCostMultiplier, room.level);
  
  return {
    metal: Math.floor(config.buildCost.metal * multiplier),
    tech: Math.floor(config.buildCost.tech * multiplier),
    components: Math.floor(config.buildCost.components * multiplier),
    powerCells: Math.floor(config.buildCost.powerCells * multiplier)
  };
}

/**
 * Calculate total bonuses from a room
 */
export function getRoomBonuses(room: Room): RoomBonuses {
  const config = getRoomConfig(room.type);
  const bonuses = config.bonusesPerLevel;
  
  return {
    crewCapacity: bonuses.crewCapacity * room.level,
    discoveryBonus: bonuses.discoveryBonus * room.level,
    hullRepairBonus: bonuses.hullRepairBonus * room.level,
    crewEfficiency: bonuses.crewEfficiency * room.level,
    storageCapacity: bonuses.storageCapacity * room.level,
    powerGeneration: bonuses.powerGeneration * room.level
  };
}

/**
 * Aggregate multiple room bonuses
 */
export function aggregateBonuses(rooms: Room[]): RoomBonuses {
  const total: RoomBonuses = {
    crewCapacity: 0,
    discoveryBonus: 0,
    hullRepairBonus: 0,
    crewEfficiency: 0,
    storageCapacity: 0,
    powerGeneration: 0
  };
  
  for (const room of rooms) {
    const bonuses = getRoomBonuses(room);
    total.crewCapacity += bonuses.crewCapacity;
    total.discoveryBonus += bonuses.discoveryBonus;
    total.hullRepairBonus += bonuses.hullRepairBonus;
    total.crewEfficiency += bonuses.crewEfficiency;
    total.storageCapacity += bonuses.storageCapacity;
    total.powerGeneration += bonuses.powerGeneration;
  }
  
  return total;
}
