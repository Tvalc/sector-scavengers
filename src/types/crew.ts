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
  /** Experience points toward next level */
  experience: number;
  /** Current level (1-5) */
  level: number;
  /** Whether crew member is alive (can be lost on death) */
  alive: boolean;
  /** Whether this is a named story character */
  isAuthored?: boolean;
  /** Unique identifier for story tracking (e.g., "vera_chen") */
  authoredId?: string;
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
 * XP thresholds for each level (cumulative)
 * Level 1: 0 XP, Level 2: 100 XP, Level 3: 250 XP, Level 4: 500 XP, Level 5: 1000 XP
 */
export const XP_THRESHOLDS = [0, 100, 250, 500, 1000];

/**
 * Maximum crew level
 */
export const MAX_CREW_LEVEL = 5;

/**
 * XP gained from various actions
 */
export const XP_REWARDS = {
  /** Passive XP per minute while assigned */
  ASSIGNMENT_PASSIVE: 2,
  /** XP for completing a run (if crew was assigned to target ship) */
  RUN_COMPLETION: 50,
  /** XP for surviving a dangerous encounter */
  DANGER_SURVIVAL: 25
};

/**
 * Crew loss chance on run death (if assigned to target ship)
 * 30% base chance, reduced by medic presence
 */
export const CREW_LOSS_CHANCE = 0.30;

/**
 * Power cell cost to wake crew from cryo
 * Cost increases with total crew awakened
 */
export function getWakeCost(currentAwakeCrew: number): number {
  // Base cost: 5, increases by 3 for each awake crew
  return 5 + (currentAwakeCrew * 3);
}

/**
 * Calculate level from total XP
 */
export function calculateLevel(experience: number): number {
  for (let level = XP_THRESHOLDS.length - 1; level >= 0; level--) {
    if (experience >= XP_THRESHOLDS[level]) {
      return level + 1;
    }
  }
  return 1;
}

/**
 * Get XP needed for next level (0 if max level)
 */
export function getXPToNextLevel(currentLevel: number): number {
  if (currentLevel >= MAX_CREW_LEVEL) return 0;
  return XP_THRESHOLDS[currentLevel];
}

/**
 * Get level-based bonus multiplier
 * Level 1: 1.0x (base), Level 2: 1.1x, Level 3: 1.25x, Level 4: 1.4x, Level 5: 1.5x
 */
export function getLevelBonusMultiplier(level: number): number {
  const multipliers = [1.0, 1.1, 1.25, 1.4, 1.5];
  return multipliers[Math.min(level - 1, multipliers.length - 1)];
}

/**
 * Add XP to crew member and handle level ups
 * Returns true if leveled up
 */
export function addCrewXP(crew: CrewMember, xpAmount: number): boolean {
  const previousLevel = crew.level;
  crew.experience += xpAmount;
  crew.level = calculateLevel(crew.experience);
  
  if (crew.level > previousLevel) {
    console.log(`[Crew] ${crew.name} leveled up to ${crew.level}!`);
    return true;
  }
  return false;
}

/**
 * Check if crew should be lost on death (30% chance if assigned to target)
 * Returns true if crew is lost
 */
export function checkCrewLoss(crew: CrewMember, hasMedicBonus: boolean = false): boolean {
  if (!crew.alive || !crew.assignment) return false;
  
  let lossChance = CREW_LOSS_CHANCE;
  
  // Medic reduces loss chance by 50%
  if (hasMedicBonus) {
    lossChance *= 0.5;
  }
  
  const roll = Math.random();
  if (roll < lossChance) {
    crew.alive = false;
    crew.assignment = undefined;
    console.log(`[Crew] ${crew.name} was lost in the hull breach!`);
    return true;
  }
  
  return false;
}

/**
 * Get role-specific bonus for node type
 */
export function getRoleBonus(role: CrewRole, nodeType: 'ship' | 'station'): Partial<CrewStats> {
  const baseBonus = ROLE_BONUSES[role];
  
  // Ships benefit more from Scavengers, Stations from Engineers
  if (nodeType === 'ship' && role === CrewRole.Scavenger) {
    return { ...baseBonus, speed: (baseBonus.speed || 0) + 10 };
  }
  if (nodeType === 'station' && role === CrewRole.Engineer) {
    return { ...baseBonus, efficiency: (baseBonus.efficiency || 0) + 10 };
  }
  
  return baseBonus;
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
    awake: false,
    experience: 0,
    level: 1,
    alive: true
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
    [CrewRole.Engineer]: 'Expert in ship systems and repairs. +50% hull repair on assigned ships.',
    [CrewRole.Scientist]: 'Increases discovery chance (+15%) and research speed.',
    [CrewRole.Medic]: 'Improves crew efficiency (+10% global) and reduces crew loss chance.',
    [CrewRole.Scavenger]: 'Fast at salvage. +25% resource yield on assigned ships.'
  };
  return descriptions[role];
}

/**
 * Get crew bonus description for UI
 */
export function getCrewBonusDescription(crew: CrewMember): string {
  const levelMultiplier = getLevelBonusMultiplier(crew.level);
  const baseDesc = getRoleDescription(crew.role);
  const levelBonus = `Level ${crew.level} (${Math.round((levelMultiplier - 1) * 100)}% bonus)`;
  
  if (!crew.alive) {
    return `${crew.name} (DECEASED) - ${baseDesc}`;
  }
  
  return `${crew.name} - ${baseDesc} ${levelBonus}`;
}
