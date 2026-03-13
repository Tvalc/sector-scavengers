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
 * @param authoredRecruit - Optional authored recruit to use instead of random generation
 */
export function generateCrewMember(authoredRecruit?: AuthoredRecruit): CrewMember {
  // If authored recruit provided, use their data
  if (authoredRecruit) {
    const baseStats = generateBaseStats();
    const roleBonus = ROLE_BONUSES[authoredRecruit.role];
    
    // Apply role bonuses (authored characters get slightly better stats)
    const stats: CrewStats = {
      efficiency: Math.min(100, baseStats.efficiency + (roleBonus.efficiency || 0) + 10),
      luck: Math.min(100, baseStats.luck + (roleBonus.luck || 0) + 10),
      technical: Math.min(100, baseStats.technical + (roleBonus.technical || 0) + 10),
      speed: Math.min(100, baseStats.speed + (roleBonus.speed || 0) + 10)
    };
    
    return {
      id: `crew_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: authoredRecruit.name,
      role: authoredRecruit.role,
      stats,
      awake: false,
      experience: 0,
      level: 1,
      alive: true,
      isAuthored: true,
      authoredId: authoredRecruit.authoredId
    };
  }
  
  // Generic crew generation
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
 * Ability effect types
 */
export type PassiveEffectType = 'shield' | 'repair' | 'discovery' | 'extraction' | 'crew_efficiency';
export type ActiveEffectType = 'reroll_hand' | 'triage' | 'breach_stabilize' | 'guaranteed_cache' | 'dead_drop' | 'ghost_credential';

/**
 * Passive ability effect
 */
export interface PassiveEffect {
  type: PassiveEffectType;
  value: number;
}

/**
 * Active ability effect (one-time use per run)
 */
export interface ActiveEffect {
  type: ActiveEffectType;
  trigger: string;
  usage: 'once_per_run' | 'passive';
}

/**
 * Lead ability configuration
 */
export interface LeadAbility {
  passive?: PassiveEffect;
  active?: ActiveEffect;
}

/**
 * Companion ability configuration (50% power or null if not applicable)
 */
export type CompanionAbility = {
  passive?: PassiveEffect;
  active?: ActiveEffect;
} | null;

/**
 * Structured ability definition
 */
export interface AbilityDefinition {
  name: string;
  description: string;
  leadEffect: LeadAbility;
  companionEffect: CompanionAbility;
}

/**
 * Authored recruit data - named story characters with unique abilities
 */
export interface AuthoredRecruit {
  authoredId: string;
  name: string;
  role: CrewRole;
  bio: string;
  signatureAbility: string;
  /** Lead ability description (full power when lead) */
  leadAbility: string;
  /** Companion ability description (50% power when companion) */
  companionAbility: string;
  /** Structured ability definition for mechanical effects */
  ability: AbilityDefinition;
}

/**
 * All authored recruits in the game
 * Each costs $1M debt to recruit
 */
export const AUTHORED_RECRUITS: AuthoredRecruit[] = [
  {
    authoredId: 'max_chen',
    name: 'Max Chen',
    role: CrewRole.Engineer,
    bio: 'Former Nexus Corp systems architect who saw too much and walked away.',
    signatureAbility: 'Working Memory',
    leadAbility: '+1 SHIELD per run, Reroll node layout once per dive',
    companionAbility: '+0.5 SHIELD per run',
    ability: {
      name: 'Working Memory',
      description: '+1 SHIELD per run, one-time hand reroll',
      leadEffect: {
        passive: { type: 'shield', value: 1 },
        active: { type: 'reroll_hand', trigger: 'after_first_hand', usage: 'once_per_run' }
      },
      companionEffect: {
        passive: { type: 'shield', value: 0.5 }
      }
    }
  },
  {
    authoredId: 'imani_okoro',
    name: 'Imani Okoro',
    role: CrewRole.Medic,
    bio: 'Deep-void medic who has saved more lives in the dark than most stations ever see.',
    signatureAbility: 'Triage Protocol',
    leadAbility: 'Prevent first crew loss per dive, +20% crew efficiency',
    companionAbility: 'Prevent first crew loss per dive (50% chance)',
    ability: {
      name: 'Triage Protocol',
      description: 'Prevent first crew loss with TRIAGE PROTECTED message',
      leadEffect: {
        active: { type: 'triage', trigger: 'on_crew_loss', usage: 'once_per_run' }
      },
      companionEffect: {
        active: { type: 'triage', trigger: 'on_crew_loss_50_percent', usage: 'once_per_run' }
      }
    }
  },
  {
    authoredId: 'jax_vasquez',
    name: 'Jax Vasquez',
    role: CrewRole.Engineer,
    bio: 'Hull technician who learned to keep ships together with nothing but scrap and stubbornness.',
    signatureAbility: 'Field Retrofit',
    leadAbility: '+25% repair speed, First hull breach auto-stabilizes',
    companionAbility: '+12% repair speed',
    ability: {
      name: 'Field Retrofit',
      description: '+25% hull repair, first breach auto-stabilizes at 50% hull',
      leadEffect: {
        passive: { type: 'repair', value: 25 },
        active: { type: 'breach_stabilize', trigger: 'on_hull_breach', usage: 'once_per_run' }
      },
      companionEffect: {
        passive: { type: 'repair', value: 12 }
      }
    }
  },
  {
    authoredId: 'sera_kim',
    name: 'Sera Kim',
    role: CrewRole.Scientist,
    bio: 'Xenoarchaeologist chasing signals from the pre-Collapse era.',
    signatureAbility: 'Signal Trace',
    leadAbility: '+20% discovery chance, First discovery reveals hidden cache',
    companionAbility: '+10% discovery chance',
    ability: {
      name: 'Signal Trace',
      description: '+20% discovery chance, first discovery guaranteed good result',
      leadEffect: {
        passive: { type: 'discovery', value: 20 },
        active: { type: 'guaranteed_cache', trigger: 'on_first_discovery', usage: 'once_per_run' }
      },
      companionEffect: {
        passive: { type: 'discovery', value: 10 }
      }
    }
  },
  {
    authoredId: 'rook_stone',
    name: 'Rook Stone',
    role: CrewRole.Scavenger,
    bio: 'Legendary deep-void salvager who has never lost a haul to a hull breach.',
    signatureAbility: 'Dead Drop',
    leadAbility: '+30% extraction yield, Bank 50% of rewards before risky extraction',
    companionAbility: '+15% extraction yield',
    ability: {
      name: 'Dead Drop',
      description: '+30% extraction value, bank 50% of run value before extraction',
      leadEffect: {
        passive: { type: 'extraction', value: 30 },
        active: { type: 'dead_drop', trigger: 'before_extraction', usage: 'once_per_run' }
      },
      companionEffect: {
        passive: { type: 'extraction', value: 15 }
      }
    }
  },
  {
    authoredId: 'del_reyes',
    name: 'Del Reyes',
    role: CrewRole.Scavenger,
    bio: 'Claims specialist with a talent for finding ships that officially do not exist.',
    signatureAbility: 'Ghost Credential',
    leadAbility: 'First SCAN or EXTRACT on claimed ships authorized automatically',
    companionAbility: 'First SCAN on claimed ships authorized (50% chance)',
    ability: {
      name: 'Ghost Credential',
      description: 'First SCAN/EXTRACT on claimed ships treated as authorized',
      leadEffect: {
        active: { type: 'ghost_credential', trigger: 'on_claim_action', usage: 'once_per_run' }
      },
      companionEffect: {
        active: { type: 'ghost_credential', trigger: 'on_claim_action_50_percent', usage: 'once_per_run' }
      }
    }
  }
];

/**
 * Get an authored recruit by ID
 */
export function getAuthoredRecruit(authoredId: string): AuthoredRecruit | undefined {
  return AUTHORED_RECRUITS.find(r => r.authoredId === authoredId);
}

/**
 * Debt cost to recruit an authored character
 */
export const AUTHORED_RECRUIT_DEBT_COST = 1000000;

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
