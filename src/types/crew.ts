/**
 * Crew Types and Configuration
 * 
 * Defines crew members, roles, and management functions.
 */

/**
 * Crew roles available in the game
 */
export enum CrewRole {
  Engineer = 'engineer',
  Scientist = 'scientist',
  Medic = 'medic',
  Scavenger = 'scavenger'
}

/**
 * Crew member stats
 */
export interface CrewStats {
  /** Efficiency in tasks (0-100) */
  efficiency: number;
  /** Luck factor for discoveries (0-100) */
  luck: number;
  /** Technical skill for repairs/upgrades (0-100) */
  technical: number;
  /** Scavenging speed (0-100) */
  speed: number;
}

/**
 * Represents a single crew member
 */
export interface CrewMember {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Crew role/specialization */
  role: CrewRole;
  /** Current stats */
  stats: CrewStats;
  /** Whether crew is awake from cryo */
  awake: boolean;
  /** Current assignment (ship ID, room index, or mission ID) */
  assignment?: {
    type: 'ship' | 'room' | 'mission';
    targetId: string | number;
    roomIndex?: number;
  };
}

/**
 * Role-specific stat bonuses
 */
export const ROLE_BONUSES: Record<CrewRole, Partial<CrewStats>> = {
  [CrewRole.Engineer]: {
    technical: 20,
    efficiency: 10
  },
  [CrewRole.Scientist]: {
    luck: 20,
    technical: 10
  },
  [CrewRole.Medic]: {
    efficiency: 15,
    luck: 5
  },
  [CrewRole.Scavenger]: {
    speed: 25,
    efficiency: 5
  }
};

/**
 * Power cell cost to wake crew from cryo
 * Cost increases with total crew awakened
 */
export function getWakeCost(currentAwakeCrew: number): number {
  // Base cost: 5, increases by 3 for each awake crew
  return 5 + (currentAwakeCrew * 3);
}

/**
 * Random name generator parts
 */
const FIRST_NAMES = [
  'Alex', 'Jordan', 'Sam', 'Morgan', 'Casey', 'Riley', 'Quinn', 'Avery',
  'Taylor', 'Reese', 'Jamie', 'Drew', 'Blake', 'Sage', 'Phoenix', 'River',
  'Nova', 'Len', 'Kai', 'Zara', 'Rook', 'Haze', 'Echo', 'Nix'
];

const LAST_NAMES = [
  'Chen', 'Okoro', 'Vasquez', 'Kim', 'Patel', 'Nguyen', 'Singh', 'Andersen',
  'Yamamoto', 'Reyes', 'Stone', 'Blackwood', 'Storm', 'Frost', 'Ashford',
  'Chase', 'Cross', 'Cole', 'Wright', 'Dayne', 'Rook', 'Vance'
];

/**
 * Generate a random crew member
 */
export function generateCrewMember(): CrewMember {
  const role = getRandomRole();
  const baseStats = generateBaseStats();
  const roleBonus = ROLE_BONUSES[role];
  
  // Apply role bonuses
  const stats: CrewStats = {
    efficiency: baseStats.efficiency + (roleBonus.efficiency || 0),
    luck: baseStats.luck + (roleBonus.luck || 0),
    technical: baseStats.technical + (roleBonus.technical || 0),
    speed: baseStats.speed + (roleBonus.speed || 0)
  };
  
  return {
    id: `crew_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: `${FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]} ${LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]}`,
    role,
    stats,
    awake: false
  };
}

/**
 * Get a random crew role
 */
function getRandomRole(): CrewRole {
  const roles = Object.values(CrewRole);
  return roles[Math.floor(Math.random() * roles.length)];
}

/**
 * Generate base stats (randomized within range)
 */
function generateBaseStats(): CrewStats {
  return {
    efficiency: 40 + Math.floor(Math.random() * 30), // 40-70
    luck: 30 + Math.floor(Math.random() * 40),       // 30-70
    technical: 35 + Math.floor(Math.random() * 35),  // 35-70
    speed: 45 + Math.floor(Math.random() * 25)      // 45-70
  };
}

/**
 * Get role display name
 */
export function getRoleName(role: CrewRole): string {
  const names: Record<CrewRole, string> = {
    [CrewRole.Engineer]: 'Engineer',
    [CrewRole.Scientist]: 'Scientist',
    [CrewRole.Medic]: 'Medic',
    [CrewRole.Scavenger]: 'Scavenger'
  };
  return names[role];
}

/**
 * Get role description
 */
export function getRoleDescription(role: CrewRole): string {
  const descriptions: Record<CrewRole, string> = {
    [CrewRole.Engineer]: 'Expert in ship systems and repairs',
    [CrewRole.Scientist]: 'Increases discovery chance and research speed',
    [CrewRole.Medic]: 'Improves crew efficiency and health',
    [CrewRole.Scavenger]: 'Fast and efficient at salvage operations'
  };
  return descriptions[role];
}
