/**
 * Mission Modal Handlers
 *
 * Handles mission modal input, progress tracking, and reward collection.
 */

import { MakkoEngine, IDisplay } from '@makko/engine';
import type { Game } from '../../game/game';
import type { InputHandler } from './input-handler';
import type { Mission } from '../../types/mission';
import { MissionSystem } from '../../systems/mission-system';
import { getAwakenedCrew } from '../../systems/cryo-system';
import { 
  renderMissionPanel, 
  checkMissionButtonClick,
  checkCollectButtonClick,
  getMissionPanelCloseButtonBounds
} from '../../ui/mission-ui';

/**
 * Check if there's a mission notification (available or complete)
 */
export function hasMissionNotification(game: Game): boolean {
  const { availableMissions, activeMissions } = game.state;
  
  if (availableMissions.length > 0) return true;
  
  const completedMissions = activeMissions.filter(m => m.complete);
  return completedMissions.length > 0;
}

/**
 * Handle mission modal input
 */
export function handleMissionModalInput(
  game: Game,
  inputHandler: InputHandler
): void {
  const input = MakkoEngine.input;
  const mouseX = input.mouseX;
  const mouseY = input.mouseY;
  
  if (mouseX === undefined || mouseY === undefined) return;
  
  // Check for close button click
  const closeButtonBounds = getMissionPanelCloseButtonBounds(MakkoEngine.display);
  if (
    input.isMousePressed(0) &&
    mouseX >= closeButtonBounds.x &&
    mouseX <= closeButtonBounds.x + closeButtonBounds.width &&
    mouseY >= closeButtonBounds.y &&
    mouseY <= closeButtonBounds.y + closeButtonBounds.height
  ) {
    inputHandler.setMissionModalShowing(false);
    return;
  }
  
  // Check for mission button click (start mission)
  const missionClick = checkMissionButtonClick(mouseX, mouseY);
  if (missionClick && input.isMousePressed(0)) {
    if (missionClick.canStart) {
      handleStartMission(game, missionClick.mission);
    }
    return;
  }
  
  // Check for collect button click
  const collectMission = checkCollectButtonClick(mouseX, mouseY);
  if (collectMission && input.isMousePressed(0)) {
    handleCollectMissionReward(game, collectMission);
    return;
  }
  
  // Check for click outside modal to close
  if (input.isMousePressed(0)) {
    if (isClickOutsideMissionPanel(mouseX, mouseY)) {
      inputHandler.setMissionModalShowing(false);
    }
  }
}

/**
 * Update active missions progress
 */
export function updateMissionProgress(
  game: Game,
  missionSystem: MissionSystem,
  dt: number
): void {
  const cryoState = game.state.cryoState;
  if (!cryoState) return;
  
  const awakeCrew = getAwakenedCrew(cryoState);
  
  for (const mission of game.state.activeMissions) {
    if (mission.complete) continue;
    
    // Update progress
    missionSystem.updateMissionProgress(mission, dt);
    
    // Check if mission just completed
    if (mission.progress >= 1.0 && !mission.complete) {
      mission.complete = true;
      console.log(`[Mission] ${mission.name} completed!`);
    }
  }
}

/**
 * Handle starting a mission
 */
export function handleStartMission(
  game: Game,
  mission: Mission
): void {
  const cryoState = game.state.cryoState;
  if (!cryoState) return;
  
  const awakeCrew = getAwakenedCrew(cryoState);
  const availableCrew = awakeCrew.filter(c => !c.assignment);
  
  if (availableCrew.length < mission.crewRequired) {
    console.log('[Mission] Not enough crew to start mission');
    return;
  }
  
  // Assign crew to mission
  const assignedCrewIds: string[] = [];
  for (let i = 0; i < mission.crewRequired; i++) {
    const crew = availableCrew[i];
    crew.assignment = {
      type: 'mission',
      targetId: mission.id
    };
    assignedCrewIds.push(crew.id);
  }
  
  // Update mission state
  mission.assignedCrew = assignedCrewIds;
  mission.startTime = Date.now();
  mission.progress = 0;
  
  // Move from available to active
  const missionIndex = game.state.availableMissions.findIndex(m => m.id === mission.id);
  if (missionIndex >= 0) {
    game.state.availableMissions.splice(missionIndex, 1);
    game.state.activeMissions.push(mission);
  }
  
  console.log(`[Mission] Started ${mission.name} with ${assignedCrewIds.length} crew`);
  game.saveState();
}

/**
 * Handle collecting completed mission rewards
 */
export function handleCollectMissionReward(
  game: Game,
  mission: Mission,
  missionSystem?: MissionSystem
): { rewards: { metal: number; tech: number; components: number; powerCells: number }; message: string } {
  const cryoState = game.state.cryoState;
  if (!cryoState) {
    return { rewards: { metal: 0, tech: 0, components: 0, powerCells: 0 }, message: 'No cryo state' };
  }
  
  const awakeCrew = getAwakenedCrew(cryoState);
  const assignedCrew = awakeCrew.filter(c => 
    c.assignment && 
    c.assignment.type === 'mission' && 
    c.assignment.targetId === mission.id
  );
  
  // Calculate rewards
  const system = missionSystem || new MissionSystem(game.state);
  const rewards = system.completeMission(mission, assignedCrew);
  
  // Add rewards to game state
  game.state.resources.metal += rewards.metal;
  game.state.resources.tech += rewards.tech;
  game.state.resources.components += rewards.components;
  game.state.resources.powerCells += rewards.powerCells;
  
  // Unassign crew
  for (const crew of assignedCrew) {
    crew.assignment = undefined;
  }
  
  // Remove mission from active missions
  const missionIndex = game.state.activeMissions.findIndex(m => m.id === mission.id);
  if (missionIndex >= 0) {
    game.state.activeMissions.splice(missionIndex, 1);
  }
  
  game.state.completedMissionCount++;
  
  // Generate replacement mission
  const newMissions = system.generateAvailableMissions(1);
  game.state.availableMissions.push(...newMissions);
  
  // Build reward text
  const rewardText = buildRewardText(rewards);
  
  console.log(`[Mission] Completed ${mission.name}, earned ${rewardText}`);
  game.saveState();
  
  return { rewards, message: `Mission complete! Earned: ${rewardText}` };
}

/**
 * Render mission modal
 */
export function renderMissionModal(display: IDisplay, game: Game): void {
  const cryoState = game.state.cryoState;
  const awakeCrew = cryoState ? getAwakenedCrew(cryoState) : [];
  
  renderMissionPanel(
    display,
    game.state.availableMissions,
    game.state.activeMissions,
    awakeCrew
  );
}

// Helper functions

function isClickOutsideMissionPanel(mouseX: number, mouseY: number): boolean {
  const panelWidth = 800;
  const panelHeight = 700;
  const panelX = (MakkoEngine.display.width - panelWidth) / 2;
  const panelY = (MakkoEngine.display.height - panelHeight) / 2;
  
  return (
    mouseX < panelX || 
    mouseX > panelX + panelWidth ||
    mouseY < panelY || 
    mouseY > panelY + panelHeight
  );
}

function buildRewardText(rewards: { metal: number; tech: number; components: number; powerCells: number }): string {
  const parts: string[] = [];
  if (rewards.metal > 0) parts.push(`${rewards.metal} metal`);
  if (rewards.tech > 0) parts.push(`${rewards.tech} tech`);
  if (rewards.components > 0) parts.push(`${rewards.components} components`);
  if (rewards.powerCells > 0) parts.push(`${rewards.powerCells} power cells`);
  return parts.join(', ');
}
