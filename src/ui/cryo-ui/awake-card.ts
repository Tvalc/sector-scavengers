/**
 * Awakened Crew Card Rendering
 * 
 * Renders awake crew cards with assign/unassign buttons and stats.
 */

import type { IDisplay } from '@makko/engine';
import { COLORS, FONTS, LAYOUT } from '../theme';
import { CrewMember } from '../../types/crew';
import { getRoleName } from '../../types/crew';
import { CARD_HEIGHT, MODAL_WIDTH, PADDING, ROLE_COLORS } from './types';
import { registerAssignButton, registerUnassignButton } from './state';
import { renderStatBar } from './render-helpers';

/**
 * Render list of awakened crew members
 */
export function renderAwakeCrewList(
  display: IDisplay,
  startX: number,
  startY: number,
  awakeCrew: CrewMember[]
): void {
  const cardWidth = MODAL_WIDTH - (PADDING * 2);
  
  awakeCrew.forEach((crew, index) => {
    const cardY = startY + index * (CARD_HEIGHT + 12);
    renderAwakeCrewCard(display, startX, cardY, cardWidth, crew);
  });
}

/**
 * Render a single awake crew card
 */
function renderAwakeCrewCard(
  display: IDisplay,
  x: number,
  y: number,
  width: number,
  crew: CrewMember
): void {
  const roleColor = ROLE_COLORS[crew.role];
  const isAssigned = crew.assignment !== undefined;
  
  // Card background
  display.drawRoundRect(x, y, width, CARD_HEIGHT, LAYOUT.borderRadius, {
    fill: COLORS.panelBg,
    stroke: roleColor,
    lineWidth: LAYOUT.borderWidth,
    alpha: 0.9
  });
  
  // Active indicator
  display.drawCircle(x + 30, y + CARD_HEIGHT / 2, 16, { fill: roleColor, alpha: 0.3 });
  display.drawCircle(x + 30, y + CARD_HEIGHT / 2, 8, { fill: roleColor });
  
  // Crew name
  display.drawText(crew.name, x + 60, y + 25, { font: FONTS.labelFont, fill: COLORS.white });
  
  // Role
  display.drawCircle(x + 60, y + 50, 6, { fill: roleColor });
  display.drawText(getRoleName(crew.role), x + 75, y + 50, {
    font: FONTS.smallFont,
    fill: roleColor,
    baseline: 'middle'
  });
  
  // Assignment status
  const assignmentText = isAssigned ? `Assigned to Ship #${crew.assignment!.targetId}` : 'Unassigned';
  display.drawText(assignmentText, x + 60, y + 75, {
    font: FONTS.tinyFont,
    fill: isAssigned ? COLORS.successGreen : COLORS.dimText
  });
  
  // Stats
  renderCrewStats(display, x + width - 200, y, crew, roleColor);
  
  // Assign/Unassign button
  renderAssignmentButton(display, x, y, width, crew);
}

/**
 * Render crew stats bars
 */
function renderCrewStats(display: IDisplay, x: number, y: number, crew: CrewMember, color: string): void {
  const barWidth = 120;
  const barHeight = 8;
  const barSpacing = 14;
  
  renderStatBar(display, x, y + 20, barWidth, barHeight, 'EFF', crew.stats.efficiency, color);
  renderStatBar(display, x, y + 20 + barSpacing, barWidth, barHeight, 'LCK', crew.stats.luck, color);
  renderStatBar(display, x, y + 20 + barSpacing * 2, barWidth, barHeight, 'TCH', crew.stats.technical, color);
  renderStatBar(display, x, y + 20 + barSpacing * 3, barWidth, barHeight, 'SPD', crew.stats.speed, color);
}

/**
 * Render assignment button
 */
function renderAssignmentButton(display: IDisplay, x: number, y: number, width: number, crew: CrewMember): void {
  const buttonWidth = 90;
  const buttonHeight = 32;
  const buttonX = x + width - buttonWidth - 15;
  const buttonY = y + (CARD_HEIGHT - buttonHeight) / 2;
  
  if (crew.assignment !== undefined) {
    registerUnassignButton({ x: buttonX, y: buttonY, width: buttonWidth, height: buttonHeight, crewId: crew.id });
    
    display.drawRoundRect(buttonX, buttonY, buttonWidth, buttonHeight, LAYOUT.borderRadiusSmall, {
      fill: COLORS.panelBg,
      stroke: COLORS.border,
      lineWidth: LAYOUT.borderWidth
    });
    
    display.drawText('UNASSIGN', buttonX + buttonWidth / 2, buttonY + buttonHeight / 2, {
      font: FONTS.smallFont,
      fill: COLORS.brightText,
      align: 'center',
      baseline: 'middle'
    });
  } else {
    registerAssignButton({ x: buttonX, y: buttonY, width: buttonWidth, height: buttonHeight, crewId: crew.id });
    
    display.drawRoundRect(buttonX, buttonY, buttonWidth, buttonHeight, LAYOUT.borderRadiusSmall, {
      fill: COLORS.panelBg,
      stroke: ROLE_COLORS[crew.role],
      lineWidth: LAYOUT.borderWidth
    });
    
    display.drawText('ASSIGN', buttonX + buttonWidth / 2, buttonY + buttonHeight / 2, {
      font: FONTS.smallFont,
      fill: COLORS.white,
      align: 'center',
      baseline: 'middle'
    });
  }
}
