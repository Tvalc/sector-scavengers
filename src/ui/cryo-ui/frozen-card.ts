/**
 * Frozen Crew Card Rendering
 * 
 * Renders frozen crew cards with wake buttons.
 */

import type { IDisplay } from '@makko/engine';
import { COLORS, FONTS, LAYOUT } from '../theme';
import { CrewMember, AUTHORED_RECRUIT_DEBT_COST } from '../../types/crew';
import { getRoleName, getRoleDescription } from '../../types/crew';
import { CARD_HEIGHT, MODAL_WIDTH, PADDING, ROLE_COLORS } from './types';
import { registerWakeButton } from './state';
import { calculateWakeCost } from '../../config/economy-config';

/** Format currency for display */
function formatDebtCost(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  }
  return `${amount.toLocaleString()}`;
}

/**
 * Render list of frozen crew members
 */
export function renderFrozenCrewList(
  display: IDisplay,
  startX: number,
  startY: number,
  frozenCrew: CrewMember[],
  powerCells: number,
  awakeCount: number,
  currentDebt: number = 0,
  debtCeiling: number = Infinity,
  isDebtLocked: boolean = false
): void {
  const cardWidth = MODAL_WIDTH - (PADDING * 2);
  
  frozenCrew.forEach((crew, index) => {
    const cardY = startY + index * (CARD_HEIGHT + 12);
    const wakeCost = calculateWakeCost(awakeCount);
    const canAffordPower = powerCells >= wakeCost;
    
    // Check debt ceiling for authored recruits
    let canAffordDebt = true;
    if (crew.isAuthored) {
      const newDebt = currentDebt + AUTHORED_RECRUIT_DEBT_COST;
      canAffordDebt = newDebt <= debtCeiling;
    }
    
    // Debt lock blocks ALL wake actions
    const canAfford = !isDebtLocked && canAffordPower && canAffordDebt;
    
    renderFrozenCrewCard(display, startX, cardY, cardWidth, crew, wakeCost, canAfford, canAffordDebt, isDebtLocked);
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
  canAfford: boolean,
  canAffordDebt: boolean,
  isDebtLocked: boolean
): void {
  const roleColor = ROLE_COLORS[crew.role];
  const isAuthored = crew.isAuthored ?? false;
  
  // Card background - authored cards have special border
  display.drawRoundRect(x, y, width, CARD_HEIGHT, LAYOUT.borderRadius, {
    fill: COLORS.cardBg,
    stroke: isAuthored ? COLORS.neonCyan : COLORS.border,
    lineWidth: isAuthored ? 2 : LAYOUT.borderWidth
  });
  
  // Authored indicator or frozen indicator
  if (isAuthored) {
    display.drawCircle(x + 30, y + CARD_HEIGHT / 2, 16, { fill: COLORS.neonCyan, alpha: 0.2 });
    display.drawText('★', x + 30, y + CARD_HEIGHT / 2, {
      font: FONTS.headingFont,
      fill: COLORS.neonCyan,
      align: 'center',
      baseline: 'middle'
    });
  } else {
    display.drawCircle(x + 30, y + CARD_HEIGHT / 2, 16, { fill: COLORS.neutralGray, alpha: 0.5 });
    display.drawText('❄', x + 30, y + CARD_HEIGHT / 2, {
      font: FONTS.headingFont,
      fill: COLORS.neonCyan,
      align: 'center',
      baseline: 'middle'
    });
  }
  
  // Crew name - authored names highlighted
  display.drawText(crew.name, x + 60, y + 25, { 
    font: FONTS.labelFont, 
    fill: isAuthored ? COLORS.neonCyan : COLORS.white 
  });
  
  // Role with colored indicator
  display.drawCircle(x + 60, y + 50, 6, { fill: roleColor });
  display.drawText(getRoleName(crew.role), x + 75, y + 50, {
    font: FONTS.smallFont,
    fill: COLORS.brightText,
    baseline: 'middle'
  });
  
  // Role description
  display.drawText(getRoleDescription(crew.role), x + 60, y + 75, { font: FONTS.tinyFont, fill: COLORS.dimText });
  
  // Cost display
  const costY = y + CARD_HEIGHT - 15;
  if (isAuthored) {
    // Show both power cells and debt cost
    const debtText = `RECRUIT COST: ${wakeCost} Power Cells + ${formatDebtCost(AUTHORED_RECRUIT_DEBT_COST)} Debt`;
    display.drawText(debtText, x + 60, costY, { 
      font: FONTS.tinyFont, 
      fill: canAffordDebt ? COLORS.warning : COLORS.danger
    });
  } else {
    // Generic crew - just power cells
    display.drawText(`WAKE COST: ${wakeCost} Power Cells`, x + 60, costY, { 
      font: FONTS.tinyFont, 
      fill: COLORS.disabled 
    });
  }
  
  renderWakeButton(display, x, y, width, crew.id, wakeCost, canAfford, roleColor, isAuthored, isDebtLocked);
}

/**
 * Render wake/recruit button
 */
function renderWakeButton(
  display: IDisplay,
  cardX: number,
  cardY: number,
  cardWidth: number,
  crewId: string,
  wakeCost: number,
  canAfford: boolean,
  roleColor: string,
  isAuthored: boolean,
  isDebtLocked: boolean = false
): void {
  const buttonWidth = 100;
  const buttonHeight = 36;
  const buttonX = cardX + cardWidth - buttonWidth - 15;
  const buttonY = cardY + (CARD_HEIGHT - buttonHeight) / 2;
  
  registerWakeButton({ x: buttonX, y: buttonY, width: buttonWidth, height: buttonHeight, crewId });
  
  // Debt locked overrides all affordability
  const effectiveCanAfford = isDebtLocked ? false : canAfford;
  
  // Different visual for debt locked
  let bgColor: string;
  let borderColor: string;
  let labelColor: string;
  let textAlpha: number;
  
  if (isDebtLocked) {
    bgColor = '#331111';
    borderColor = COLORS.danger;
    labelColor = COLORS.danger;
    textAlpha = 0.6;
  } else if (effectiveCanAfford) {
    bgColor = isAuthored ? COLORS.neonCyan : COLORS.panelBg;
    borderColor = isAuthored ? COLORS.neonCyan : roleColor;
    labelColor = isAuthored ? '#000' : COLORS.white;
    textAlpha = 1;
  } else {
    bgColor = COLORS.neutralGray;
    borderColor = COLORS.border;
    labelColor = COLORS.disabled;
    textAlpha = 0.5;
  }
  
  display.drawRoundRect(buttonX, buttonY, buttonWidth, buttonHeight, LAYOUT.borderRadiusSmall, {
    fill: bgColor,
    stroke: borderColor,
    lineWidth: LAYOUT.borderWidth,
    alpha: canAfford ? 1 : 0.6
  });
  
  const buttonText = isAuthored ? 'RECRUIT' : 'WAKE';
  display.drawText(buttonText, buttonX + buttonWidth / 2, buttonY + 12, {
    font: FONTS.labelFont,
    fill: labelColor,
    align: 'center',
    alpha: textAlpha
  });
  
  display.drawText(`⚡${wakeCost}`, buttonX + buttonWidth / 2, buttonY + 28, {
    font: FONTS.tinyFont,
    fill: canAfford ? (isAuthored ? '#000' : COLORS.neonMagenta) : COLORS.disabled,
    align: 'center',
    alpha: textAlpha
  });
}
