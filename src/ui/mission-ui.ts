/**
 * Mission Panel UI
 *
 * Mission management panel for viewing available missions, starting missions
 * with crew, and tracking active mission progress.
 */

import type { IDisplay } from '@makko/engine';
import { Mission, MissionType, formatDuration } from '../types/mission';
import { CrewMember } from '../types/crew';
import { COLORS, FONTS, LAYOUT } from './theme';

/**
 * Panel dimensions
 */
const PANEL_WIDTH = 800;
const PANEL_HEIGHT = 700;
const PADDING = 20;
const CARD_WIDTH = PANEL_WIDTH - (PADDING * 2);
const CARD_HEIGHT = 120;
const CARD_SPACING = 12;

/**
 * Risk level colors
 */
const RISK_COLORS = {
  low: COLORS.successGreen,
  medium: COLORS.warningYellow,
  high: COLORS.warningRed
};

/**
 * Mission type colors
 */
const TYPE_COLORS = {
  [MissionType.Salvage]: COLORS.neonCyan,
  [MissionType.Patrol]: COLORS.successGreen,
  [MissionType.Trade]: COLORS.warningYellow,
  [MissionType.Exploration]: COLORS.neonMagenta
};

/**
 * Get panel position (centered on screen)
 */
function getPanelPosition(display: IDisplay): { x: number; y: number } {
  const x = (display.width - PANEL_WIDTH) / 2;
  const y = (display.height - PANEL_HEIGHT) / 2;
  return { x, y };
}

/**
 * Render panel background with overlay
 */
function renderPanelBackground(display: IDisplay, x: number, y: number): void {
  // Semi-transparent dark overlay
  display.drawRect(0, 0, display.width, display.height, {
    fill: COLORS.overlay,
    alpha: 1
  });
  
  // Main panel background
  display.drawRoundRect(x, y, PANEL_WIDTH, PANEL_HEIGHT, LAYOUT.borderRadius, {
    fill: COLORS.panelBg,
    stroke: COLORS.border,
    lineWidth: LAYOUT.borderWidth
  });
  
  // Header accent line
  display.drawRect(x, y, PANEL_WIDTH, 3, {
    fill: COLORS.neonCyan
  });
}

/**
 * Render panel title
 */
function renderPanelTitle(display: IDisplay, x: number, y: number): void {
  display.drawText('MISSION CONTROL', x + PANEL_WIDTH / 2, y + 40, {
    font: FONTS.titleFont,
    fill: COLORS.white,
    align: 'center'
  });
}

/**
 * Render section header
 */
function renderSectionHeader(display: IDisplay, x: number, y: number, text: string): void {
  // Header background
  display.drawRect(x, y, CARD_WIDTH, 30, {
    fill: COLORS.cardBg,
    alpha: 0.5
  });
  
  // Header text
  display.drawText(text, x + 10, y + 15, {
    font: FONTS.labelFont,
    fill: COLORS.neonCyan,
    baseline: 'middle'
  });
}

/**
 * Format time remaining
 */
function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return 'Complete';
  
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  } else if (minutes > 0) {
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Calculate mission progress
 */
function calculateProgress(mission: Mission): number {
  if (mission.complete) return 1;
  if (!mission.startTime) return 0;
  
  const elapsed = Date.now() - mission.startTime;
  const progress = elapsed / mission.duration;
  return Math.min(1, Math.max(0, progress));
}

/**
 * Calculate time remaining
 */
function calculateTimeRemaining(mission: Mission): number {
  if (mission.complete || !mission.startTime) return 0;
  
  const elapsed = Date.now() - mission.startTime;
  const remaining = mission.duration - elapsed;
  return Math.max(0, remaining);
}

/**
 * Format rewards for display
 */
function formatRewards(rewards: { metal: number; tech: number; components: number; powerCells: number }): string {
  const parts: string[] = [];
  
  if (rewards.metal > 0) parts.push(`Metal: ${rewards.metal}`);
  if (rewards.tech > 0) parts.push(`Tech: ${rewards.tech}`);
  if (rewards.components > 0) parts.push(`Components: ${rewards.components}`);
  if (rewards.powerCells > 0) parts.push(`Power Cells: ${rewards.powerCells}`);
  
  return parts.join(' | ');
}

/**
 * Render available mission card
 * Returns button bounds for click detection
 */
function renderAvailableMissionCard(
  display: IDisplay,
  x: number,
  y: number,
  mission: Mission,
  awakeCrew: CrewMember[],
  buttonIndex: number
): MissionButton | null {
  // Card background
  display.drawRoundRect(x, y, CARD_WIDTH, CARD_HEIGHT, LAYOUT.borderRadiusSmall, {
    fill: COLORS.cardBg,
    stroke: COLORS.border,
    lineWidth: 1
  });
  
  // Type accent line
  display.drawRect(x, y, 4, CARD_HEIGHT, {
    fill: TYPE_COLORS[mission.type]
  });
  
  // Mission name
  display.drawText(mission.name, x + 15, y + 20, {
    font: FONTS.labelFont,
    fill: COLORS.white
  });
  
  // Mission type badge
  const typeText = mission.type.toUpperCase();
  const typeWidth = 100;
  display.drawRoundRect(x + CARD_WIDTH - typeWidth - 15, y + 10, typeWidth, 24, 4, {
    fill: TYPE_COLORS[mission.type],
    alpha: 0.2
  });
  display.drawText(typeText, x + CARD_WIDTH - typeWidth / 2 - 15, y + 22, {
    font: FONTS.smallFont,
    fill: TYPE_COLORS[mission.type],
    align: 'center',
    baseline: 'middle'
  });
  
  // Description
  display.drawText(mission.description, x + 15, y + 45, {
    font: FONTS.smallFont,
    fill: COLORS.dimText
  });
  
  // Stats row
  const statsY = y + 70;
  const stats = [
    `⏱ ${formatDuration(mission.duration)}`,
    `👥 ${mission.crewRequired} crew`,
    `⚠ ${mission.riskLevel.toUpperCase()}`
  ];
  
  let statsX = x + 15;
  stats.forEach((stat, idx) => {
    const color = idx === 2 ? RISK_COLORS[mission.riskLevel] : COLORS.brightText;
    display.drawText(stat, statsX, statsY, {
      font: FONTS.smallFont,
      fill: color
    });
    statsX += 120;
  });
  
  // Rewards
  const rewardsText = formatRewards(mission.rewards);
  display.drawText(`Rewards: ${rewardsText}`, x + 15, statsY + 20, {
    font: FONTS.smallFont,
    fill: COLORS.neonCyan
  });
  
  // Start button
  const buttonWidth = 120;
  const buttonHeight = 32;
  const buttonX = x + CARD_WIDTH - buttonWidth - 15;
  const buttonY = y + CARD_HEIGHT - buttonHeight - 10;
  
  const availableCrew = awakeCrew.filter(c => !c.assignment).length;
  const canStart = availableCrew >= mission.crewRequired;
  
  display.drawRoundRect(buttonX, buttonY, buttonWidth, buttonHeight, 6, {
    fill: canStart ? COLORS.neonCyan : COLORS.disabled,
    alpha: canStart ? 1 : 0.5
  });
  
  display.drawText(canStart ? 'START' : 'NEED CREW', buttonX + buttonWidth / 2, buttonY + buttonHeight / 2, {
    font: FONTS.labelFont,
    fill: canStart ? COLORS.panelBg : COLORS.dimText,
    align: 'center',
    baseline: 'middle'
  });
  
  return { x: buttonX, y: buttonY, width: buttonWidth, height: buttonHeight, mission, canStart, buttonIndex };
}

/**
 * Collect button tracking for click detection
 */
interface CollectButton {
  x: number;
  y: number;
  width: number;
  height: number;
  mission: Mission;
  buttonIndex: number;
}

let trackedCollectButtons: CollectButton[] = [];

/**
 * Reset collect button tracking
 */
export function resetCollectButtonTracking(): void {
  trackedCollectButtons = [];
}

/**
 * Get tracked collect buttons
 */
export function getTrackedCollectButtons(): CollectButton[] {
  return trackedCollectButtons;
}

/**
 * Render active mission card
 */
function renderActiveMissionCard(
  display: IDisplay,
  x: number,
  y: number,
  mission: Mission,
  buttonIndex: number
): CollectButton | null {
  // Card background
  display.drawRoundRect(x, y, CARD_WIDTH, CARD_HEIGHT, LAYOUT.borderRadiusSmall, {
    fill: COLORS.cardBg,
    stroke: COLORS.neonCyan,
    lineWidth: 2
  });
  
  // Type accent line
  display.drawRect(x, y, 4, CARD_HEIGHT, {
    fill: TYPE_COLORS[mission.type]
  });
  
  // Mission name
  display.drawText(mission.name, x + 15, y + 20, {
    font: FONTS.labelFont,
    fill: COLORS.white
  });
  
  // Progress calculation
  const progress = calculateProgress(mission);
  const timeRemaining = calculateTimeRemaining(mission);
  const progressPercent = Math.round(progress * 100);
  
  // Progress bar background
  const barX = x + 15;
  const barY = y + 45;
  const barWidth = CARD_WIDTH - 30;
  const barHeight = 24;
  
  display.drawRoundRect(barX, barY, barWidth, barHeight, 4, {
    fill: COLORS.neutralGray,
    alpha: 0.3
  });
  
  // Progress bar fill
  const fillWidth = Math.max(4, barWidth * progress);
  display.drawRoundRect(barX, barY, fillWidth, barHeight, 4, {
    fill: COLORS.neonCyan,
    alpha: 0.8
  });
  
  // Progress text
  display.drawText(`${progressPercent}%`, barX + barWidth / 2, barY + barHeight / 2, {
    font: FONTS.labelFont,
    fill: COLORS.white,
    align: 'center',
    baseline: 'middle'
  });
  
  // Time remaining
  display.drawText(`Time Remaining: ${formatTimeRemaining(timeRemaining)}`, x + 15, y + 85, {
    font: FONTS.smallFont,
    fill: COLORS.brightText
  });
  
  // Assigned crew
  const crewText = `Assigned: ${mission.assignedCrew.length} / ${mission.crewRequired} crew`;
  display.drawText(crewText, x + 15, y + 105, {
    font: FONTS.smallFont,
    fill: COLORS.dimText
  });
  
  // Collect button (only for completed missions)
  if (mission.complete) {
    const buttonWidth = 120;
    const buttonHeight = 32;
    const buttonX = x + CARD_WIDTH - buttonWidth - 15;
    const buttonY = y + CARD_HEIGHT - buttonHeight - 10;
    
    display.drawRoundRect(buttonX, buttonY, buttonWidth, buttonHeight, 6, {
      fill: COLORS.successGreen,
      alpha: 1
    });
    
    display.drawText('COLLECT', buttonX + buttonWidth / 2, buttonY + buttonHeight / 2, {
      font: FONTS.labelFont,
      fill: COLORS.panelBg,
      align: 'center',
      baseline: 'middle'
    });
    
    return { x: buttonX, y: buttonY, width: buttonWidth, height: buttonHeight, mission, buttonIndex };
  }
  
  return null;
}

/**
 * Render empty state
 */
function renderEmptyState(display: IDisplay, x: number, y: number, message: string): void {
  display.drawText(message, x, y, {
    font: FONTS.smallFont,
    fill: COLORS.dimText
  });
}

/**
 * Mission button tracking for click detection
 */
interface MissionButton {
  x: number;
  y: number;
  width: number;
  height: number;
  mission: Mission;
  canStart: boolean;
  buttonIndex: number;
}

let trackedButtons: MissionButton[] = [];

/**
 * Reset button tracking
 */
export function resetMissionButtonTracking(): void {
  trackedButtons = [];
}

/**
 * Get tracked mission buttons
 */
export function getTrackedMissionButtons(): MissionButton[] {
  return trackedButtons;
}

/**
 * Render the mission management panel
 */
export function renderMissionPanel(
  display: IDisplay,
  availableMissions: Mission[],
  activeMissions: Mission[],
  awakeCrew: CrewMember[]
): void {
  resetMissionButtonTracking();
  resetCollectButtonTracking();
  
  const { x: panelX, y: panelY } = getPanelPosition(display);
  
  // Panel structure
  renderPanelBackground(display, panelX, panelY);
  renderPanelTitle(display, panelX, panelY);
  
  // Calculate section positions
  const activeSectionY = panelY + 80;
  const activeSectionHeight = 220;
  const availableSectionY = activeSectionY + activeSectionHeight + 30;
  
  // Active missions section
  renderSectionHeader(display, panelX + PADDING, activeSectionY, 'ACTIVE MISSIONS');
  
  if (activeMissions.length === 0) {
    renderEmptyState(
      display,
      panelX + PADDING + 10,
      activeSectionY + 50,
      'No active missions. Start a mission below!'
    );
  } else {
    const activeCardY = activeSectionY + 40;
    activeMissions.forEach((mission, idx) => {
      const cardY = activeCardY + idx * (CARD_HEIGHT + CARD_SPACING);
      if (cardY + CARD_HEIGHT < availableSectionY - 20) {
        const collectButton = renderActiveMissionCard(display, panelX + PADDING, cardY, mission, idx);
        if (collectButton) {
          trackedCollectButtons.push(collectButton);
        }
      }
    });
  }
  
  // Available missions section
  renderSectionHeader(display, panelX + PADDING, availableSectionY, 'AVAILABLE MISSIONS');
  
  if (availableMissions.length === 0) {
    renderEmptyState(
      display,
      panelX + PADDING + 10,
      availableSectionY + 50,
      'No available missions. Check back later!'
    );
  } else {
    const availableCardY = availableSectionY + 40;
    availableMissions.forEach((mission, idx) => {
      const cardY = availableCardY + idx * (CARD_HEIGHT + CARD_SPACING);
      const maxY = panelY + PANEL_HEIGHT - 80;
      
      if (cardY + CARD_HEIGHT < maxY) {
        const buttonInfo = renderAvailableMissionCard(
          display,
          panelX + PADDING,
          cardY,
          mission,
          awakeCrew,
          idx
        );
        if (buttonInfo) {
          trackedButtons.push(buttonInfo as MissionButton);
        }
      }
    });
  }
  
  // Close button
  const closeButtonWidth = 140;
  const closeButtonHeight = 44;
  const closeButtonX = panelX + (PANEL_WIDTH - closeButtonWidth) / 2;
  const closeButtonY = panelY + PANEL_HEIGHT - 60;
  
  display.drawRoundRect(closeButtonX, closeButtonY, closeButtonWidth, closeButtonHeight, LAYOUT.borderRadius, {
    fill: COLORS.panelBg,
    stroke: COLORS.neonCyan,
    lineWidth: LAYOUT.borderWidth
  });
  
  display.drawText('CLOSE', closeButtonX + closeButtonWidth / 2, closeButtonY + closeButtonHeight / 2, {
    font: FONTS.labelFont,
    fill: COLORS.white,
    align: 'center',
    baseline: 'middle'
  });
  
  // Close hint
  display.drawText('Press ESC to close', panelX + PANEL_WIDTH / 2, panelY + PANEL_HEIGHT - 15, {
    font: FONTS.tinyFont,
    fill: COLORS.dimText,
    align: 'center'
  });
}

/**
 * Check if a mission button was clicked
 */
export function checkMissionButtonClick(
  mouseX: number,
  mouseY: number
): { mission: Mission; canStart: boolean } | null {
  for (const button of trackedButtons) {
    if (
      mouseX >= button.x &&
      mouseX <= button.x + button.width &&
      mouseY >= button.y &&
      mouseY <= button.y + button.height
    ) {
      return {
        mission: button.mission,
        canStart: button.canStart
      };
    }
  }
  return null;
}

/**
 * Check if a collect button was clicked
 */
export function checkCollectButtonClick(
  mouseX: number,
  mouseY: number
): Mission | null {
  for (const button of trackedCollectButtons) {
    if (
      mouseX >= button.x &&
      mouseX <= button.x + button.width &&
      mouseY >= button.y &&
      mouseY <= button.y + button.height
    ) {
      return button.mission;
    }
  }
  return null;
}

/**
 * Get close button bounds
 */
export function getMissionPanelCloseButtonBounds(display: IDisplay): { x: number; y: number; width: number; height: number } {
  const { x: panelX, y: panelY } = getPanelPosition(display);
  const closeButtonWidth = 140;
  const closeButtonHeight = 44;
  const closeButtonX = panelX + (PANEL_WIDTH - closeButtonWidth) / 2;
  const closeButtonY = panelY + PANEL_HEIGHT - 60;
  
  return {
    x: closeButtonX,
    y: closeButtonY,
    width: closeButtonWidth,
    height: closeButtonHeight
  };
}
