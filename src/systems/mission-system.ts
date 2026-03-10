/**
 * Mission System
 * 
 * Manages idle missions that crew can be sent on for resource generation.
 */

import { Mission, MissionType, generateMission } from '../types/mission';
import { CrewMember, CrewRole } from '../types/crew';
import { Resources, addResources } from '../types/resources';
import { GameState } from '../types/state';

/**
 * MissionSystem - manages idle missions
 */
export class MissionSystem {
  private gameState: GameState;
  
  constructor(gameState: GameState) {
    this.gameState = gameState;
  }
  
  /**
   * Generate available missions pool (called periodically)
   */
  generateAvailableMissions(count: number = 3): Mission[] {
    const missions: Mission[] = [];
    
    for (let i = 0; i < count; i++) {
      missions.push(generateMission());
    }
    
    return missions;
  }
  
  /**
   * Start a mission with assigned crew
   */
  startMission(mission: Mission, crewIds: string[]): boolean {
    if (mission.assignedCrew.length > 0) {
      return false; // Already started
    }
    
    if (crewIds.length < mission.crewRequired) {
      return false; // Not enough crew
    }
    
    // Assign crew and start mission
    mission.assignedCrew = [...crewIds];
    mission.startTime = Date.now();
    mission.progress = 0;
    mission.complete = false;
    
    return true;
  }
  
  /**
   * Update mission progress
   */
  updateMissionProgress(mission: Mission, dt: number): void {
    if (!mission.startTime || mission.complete) {
      return;
    }
    
    const elapsed = Date.now() - mission.startTime;
    mission.progress = Math.min(1, elapsed / mission.duration);
    
    if (mission.progress >= 1) {
      mission.complete = true;
    }
  }
  
  /**
   * Complete a mission and award rewards
   */
  completeMission(mission: Mission, crew: CrewMember[]): Resources | null {
    if (!mission.complete) {
      return null;
    }
    
    // Calculate efficiency bonus from crew
    const efficiencyBonus = this.calculateEfficiencyBonus(mission, crew);
    
    // Apply efficiency to rewards
    const finalRewards: Resources = {
      metal: Math.floor(mission.rewards.metal * efficiencyBonus),
      tech: Math.floor(mission.rewards.tech * efficiencyBonus),
      components: Math.floor(mission.rewards.components * efficiencyBonus),
      powerCells: Math.floor(mission.rewards.powerCells * efficiencyBonus)
    };
    
    return finalRewards;
  }
  
  /**
   * Calculate efficiency bonus from assigned crew
   */
  private calculateEfficiencyBonus(mission: Mission, crew: CrewMember[]): number {
    const assignedCrew = crew.filter(c => mission.assignedCrew.includes(c.id));
    
    if (assignedCrew.length === 0) {
      return 1.0;
    }
    
    // Base efficiency from crew stats
    let totalEfficiency = 0;
    
    for (const member of assignedCrew) {
      totalEfficiency += member.stats.efficiency / 100;
      
      // Role bonuses
      switch (member.role) {
        case CrewRole.Scavenger:
          totalEfficiency += 0.2; // 20% bonus for salvage missions
          break;
        case CrewRole.Engineer:
          totalEfficiency += 0.15; // 15% bonus for all missions
          break;
        case CrewRole.Scientist:
          if (mission.type === 'exploration') {
            totalEfficiency += 0.25; // 25% bonus for exploration
          }
          break;
        case CrewRole.Medic:
          totalEfficiency += 0.1; // 10% bonus for all missions
          break;
      }
    }
    
    // Average efficiency across all crew
    return 1.0 + (totalEfficiency / assignedCrew.length);
  }
  
  /**
   * Get mission progress percentage
   */
  getMissionProgress(mission: Mission): number {
    return mission.progress;
  }
  
  /**
   * Get remaining time in milliseconds
   */
  getRemainingTime(mission: Mission): number {
    if (!mission.startTime) {
      return mission.duration;
    }
    
    const elapsed = Date.now() - mission.startTime;
    return Math.max(0, mission.duration - elapsed);
  }
}
