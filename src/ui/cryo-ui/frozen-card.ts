/**
 * Frozen Crew Card Rendering
 * 
 * Renders frozen crew cards with wake buttons.
 */

import type { IDisplay } from '@makko/engine';
import { COLORS, FONTS, LAYOUT } from '../theme';
import { CrewMember } from '../../types/crew';
import { getRoleName, getRoleDescription } from '../../types/crew';
import { CARD_HEIGHT, MODAL_WIDTH, PADDING, ROLE_COLORS } from './types';
import { registerWakeButton } from './state';

/**
 * Render list of frozen crew members
 */
export function renderFrozenCrewList(
  display: IDisplay,
  startX: number,
  startY: number,
  frozenCrew: CrewMember[],
  powerCells: number,
  awakeCount: number
): void {
  const cardWidth = MODAL_WIDTH - (PADDING * 2);
  
  frozenCrew.forEach((crew, index) => {
    const cardY = startY + index * (CARD_HEIGHT + 12);
    const wakeCost = awakeCount === 0 ? 1 : awakeCount + 1;
    const canAfford = powerCells >= wakeCost;
    
    renderFrozenCrewCard(display, startX, cardY, cardWidth, crew, wakeCost, canAfford);
  });
}

/**
 * Render a single frozen crew card
 */
function renderFrozenCrewCard(
  display: IDisplay,
  x: number,
  y: number,
  width: number,
  crew: CrewMember,
  wakeCost: number,
  canAfford: boolean
): void {
  const roleColor = ROLE_COLORS[crew.role];
  
  // Card background
  display.drawRoundRect(x, y, width, CARD_HEIGHT, LAYOUT.borderRadius, {
    fill: COLORS.cardBg,
    stroke: COLORS.border,
    lineWidth: LAYOUT.borderWidth
  });
  
  // Frozen indicator
  display.drawCircle(x + 30, y + CARD_HEIGHT / 2, 16, { fill: COLORS.neutralGray, alpha: 0.5 });
  display.drawText('❄', x + 30, y + CARD_HEIGHT / 2, {
    font: FONTS.headingFont,
    fill: COLORS.neonCyan,
    align: 'center',
    baseline: 'middle'
  });
  
  // Crew name
  display.drawText(crew.name, x + 60, y + 25, { font: FONTS.labelFont, fill: COLORS.white });
  
  // Role with colored indicator
  display.drawCircle(x + 60, y + 50, 6, { fill: roleColor });
  display.drawText(getRoleName(crew.role), x + 75, y + 50, {
    font: FONTS.smallFont,
    fill: COLORS.brightText,
    baseline: 'middle'
  });
  
  // Role description
  display.drawText(getRoleDescription(crew.role), x + 60, y + 75, { font: FONTS.tinyFont, fill: COLORS.dimText });
  
  // Stats preview
  const statsText = `EFF ${crew.stats.efficiency}  LCK ${crew.stats.luck}  TCH ${crew.stats.technical}  SPD ${crew.stats.speed}`;
  display.drawText(statsText, x + 60, y + CARD_HEIGHT - 15, { font: FONTS.tinyFont, fill: COLORS.disabled });
  
  renderWakeButton(display, x, y, width, crew.id, wakeCost, canAfford, roleColor);
}

/**
 * Render wake button
 */
function renderWakeButton(
  display: IDisplay,
  cardX: number,
  cardY: number,
  cardWidth: number,
  crewId: string,
  wakeCost: number,
  canAfford: boolean,
  roleColor: string
): void {
  const buttonWidth = 100;
  const buttonHeight = 36;
  const buttonX = cardX + cardWidth - buttonWidth - 15;
  const buttonY = cardY + (CARD_HEIGHT - buttonHeight) / 2;
  
  registerWakeButton({ x: buttonX, y: buttonY, width: buttonWidth, height: buttonHeight, crewId });
  
  const bgColor = canAfford ? COLORS.panelBg : COLORS.neutralGray;
  const borderColor = canAfford ? roleColor : COLORS.border;
  const textAlpha = canAfford ? 1 : 0.5;
  
  display.drawRoundRect(buttonX, buttonY, buttonWidth, buttonHeight, LAYOUT.borderRadiusSmall, {
    fill: bgColor,
    stroke: borderColor,
    lineWidth: LAYOUT.borderWidth,
    alpha: canAfford ? 1 : 0.6
  });
  
  display.drawText('WAKE', buttonX + buttonWidth / 2, buttonY + 12, {
    font: FONTS.labelFont,
    fill: canAfford ? COLORS.white : COLORS.disabled,
    align: 'center',
    alpha: textAlpha
  });
  
  display.drawText(`⚡${wakeCost}`, buttonX + buttonWidth / 2, buttonY + 28, {
    font: FONTS.tinyFont,
    fill: canAfford ? COLORS.neonMagenta : COLORS.disabled,
    align: 'center',
    alpha: textAlpha
  });
}
