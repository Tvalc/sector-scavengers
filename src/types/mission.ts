/**
 * Mission Types and Configuration
 * 
 * Defines idle missions that crew can be sent on for resource generation.
 */

import { Resources } from './resources';

/**
 * Mission types available
 */
export enum MissionType {
  Salvage = 'salvage',
  Patrol = 'patrol',
  Trade = 'trade',
  Exploration = 'exploration'
}

/**
 * Risk level for missions
 */
export type RiskLevel = 'low' | 'medium' | 'high';

/**
 * Mission configuration for each mission type
 */
export interface MissionTypeConfig {
  /** Fixed duration in milliseconds */
  duration: number;
  /** Base rewards on completion */
  baseRewards: Resources;
  /** Risk level */
  riskLevel: RiskLevel;
  /** Display name */
  name: string;
  /** Description */
  description: string;
  /** Number of crew required */
  crewRequired: number;
}

/**
 * Configuration for all mission types
 * 
 * Durations are fixed (no randomization):
 * - Salvage: 2 minutes (quick runs)
 * - Patrol: 5 minutes (medium duration)
 * - Trade: 10 minutes (long duration)
 * - Exploration: 15 minutes (longest)
 */
export const MISSION_CONFIG: Record<MissionType, MissionTypeConfig> = {
  [MissionType.Salvage]: {
    duration: 2 * 60 * 1000,  // 2 minutes
    baseRewards: { metal: 30, tech: 10, components: 5, powerCells: 0 },
    riskLevel: 'low',
    name: 'Salvage Run',
    description: 'Search for valuable materials',
    crewRequired: 1
  },
  [MissionType.Patrol]: {
    duration: 5 * 60 * 1000,  // 5 minutes
    baseRewards: { metal: 20, tech: 20, components: 5, powerCells: 2 },
    riskLevel: 'medium',
    name: 'Sector Patrol',
    description: 'Patrol local sector for threats and opportunities',
    crewRequired: 2
  },
  [MissionType.Trade]: {
    duration: 10 * 60 * 1000,  // 10 minutes
    baseRewards: { metal: 10, tech: 30, components: 10, powerCells: 3 },
    riskLevel: 'medium',
    name: 'Trade Convoy',
    description: 'Trade resources at nearby station',
    crewRequired: 2
  },
  [MissionType.Exploration]: {
    duration: 15 * 60 * 1000,  // 15 minutes
    baseRewards: { metal: 20, tech: 20, components: 20, powerCells: 5 },
    riskLevel: 'high',
    name: 'Deep Space Survey',
    description: 'Explore uncharted regions for rare finds',
    crewRequired: 3
  }
};

/**
 * Represents an active or available mission
 */
export interface Mission {
  /** Unique identifier */
  id: string;
  /** Mission name */
  name: string;
  /** Mission type */
  type: MissionType;
  /** Description */
  description: string;
  /** Duration in milliseconds */
  duration: number;
  /** Number of crew required */
  crewRequired: number;
  /** Rewards on completion */
  rewards: Resources;
  /** Risk level */
  riskLevel: RiskLevel;
  /** Crew IDs assigned to this mission */
  assignedCrew: string[];
  /** Progress (0-1) */
  progress: number;
  /** Start time (null if not started) */
  startTime: number | null;
  /** Whether mission is complete */
  complete: boolean;
}

/**
 * Generate a mission of the specified type (or random if not specified)
 * Uses fixed durations from MISSION_CONFIG
 */
export function generateMission(type?: MissionType): Mission {
  const missionTypes = Object.values(MissionType);
  const selectedType = type || missionTypes[Math.floor(Math.random() * missionTypes.length)];
  const config = MISSION_CONFIG[selectedType];
  
  return {
    id: `mission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: config.name,
    type: selectedType,
    description: config.description,
    duration: config.duration,
    crewRequired: config.crewRequired,
    rewards: { ...config.baseRewards },
    riskLevel: config.riskLevel,
    assignedCrew: [],
    progress: 0,
    startTime: null,
    complete: false
  };
}

/**
 * Get mission type display name
 */
export function getMissionTypeName(type: MissionType): string {
  return MISSION_CONFIG[type].name;
}

/**
 * Format duration for display
 */
export function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}
