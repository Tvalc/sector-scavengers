/**
 * Cryo Panel Rendering
 * 
 * Main panel renderer that orchestrates all sub-components.
 */

import type { IDisplay } from '@makko/engine';
import { COLORS, FONTS, LAYOUT } from '../theme';
import { CrewMember } from '../../types/crew';
import { MODAL_WIDTH, MODAL_HEIGHT, CARD_HEIGHT, PADDING } from './types';
import { resetButtonTracking, registerCloseButton } from './state';
import { renderFrozenCrewList } from './frozen-card';
import { renderAwakeCrewList } from './awake-card';
import { getModalPosition, renderModalBackground, renderModalTitle, renderPowerCellCount, renderSectionHeader, renderEmptyState } from './render-helpers';

/**
 * Render the cryo management panel
 */
export function renderCryoPanel(
  display: IDisplay,
  crew: CrewMember[],
  powerCells: number,
  currentDebt: number = 0,
  debtCeiling: number = Infinity,
  isDebtLocked: boolean = false
): void {
  resetButtonTracking();
  
  const { x: modalX, y: modalY } = getModalPosition(display);
  
  renderModalBackground(display, modalX, modalY);
  renderModalTitle(display, modalX, modalY, 'CRYO CHAMBER');
  renderPowerCellCount(display, modalX, modalY, powerCells);
  
  // Debt locked warning
  if (isDebtLocked) {
    display.drawRoundRect(modalX + PADDING, modalY + 85, MODAL_WIDTH - (PADDING * 2), 40, LAYOUT.borderRadiusSmall, {
      fill: '#220000',
      stroke: COLORS.warningRed,
      lineWidth: 2
    });
    display.drawText('⚠ DEBT CEILING REACHED - Cannot wake crew', modalX + MODAL_WIDTH / 2, modalY + 105, {
      font: FONTS.labelFont,
      fill: COLORS.warningRed,
      align: 'center',
      baseline: 'middle'
    });
  }
  
  // Separate crew
  const frozenCrew = crew.filter(c => !c.awake);
  const awakeCrew = crew.filter(c => c.awake);
  
  // Frozen section (shift down if debt warning shown)
  const frozenStartY = modalY + (isDebtLocked ? 145 : 115);
  renderSectionHeader(display, modalX + PADDING, frozenStartY, 'FROZEN CREW');
  
  if (frozenCrew.length === 0) {
    renderEmptyState(display, modalX + PADDING, frozenStartY + 35, 'No crew in cryo storage');
  } else {
    renderFrozenCrewList(display, modalX + PADDING, frozenStartY + 30, frozenCrew, powerCells, awakeCrew.length, currentDebt, debtCeiling, isDebtLocked);
  }
  
  // Awake section
  const awakeStartY = frozenStartY + 50 + (frozenCrew.length * (CARD_HEIGHT + 12));
  renderSectionHeader(display, modalX + PADDING, awakeStartY, 'AWAKENED CREW');
  
  if (awakeCrew.length === 0) {
    renderEmptyState(display, modalX + PADDING, awakeStartY + 35, 'No crew members awake yet');
  } else {
    renderAwakeCrewList(display, modalX + PADDING, awakeStartY + 30, awakeCrew);
  }
  
  // Close button
  const closeButtonWidth = 140;
  const closeButtonHeight = 44;
  const closeButtonX = modalX + (MODAL_WIDTH - closeButtonWidth) / 2;
  const closeButtonY = modalY + MODAL_HEIGHT - 60;
  
  renderCloseButton(display, closeButtonX, closeButtonY, closeButtonWidth, closeButtonHeight);
  
  // Close hint
  display.drawText('Press ESC to close', modalX + MODAL_WIDTH / 2, modalY + MODAL_HEIGHT - 15, {
    font: FONTS.tinyFont,
    fill: COLORS.dimText,
    align: 'center'
  });
}

/**
 * Render close button
 */
function renderCloseButton(display: IDisplay, x: number, y: number, width: number, height: number): void {
  registerCloseButton({ x, y, width, height });
  
  display.drawRoundRect(x, y, width, height, LAYOUT.borderRadius, {
    fill: COLORS.panelBg,
    stroke: COLORS.neonCyan,
    lineWidth: LAYOUT.borderWidth
  });
  
  display.drawText('CLOSE', x + width / 2, y + height / 2, {
    font: FONTS.labelFont,
    fill: COLORS.white,
    align: 'center',
    baseline: 'middle'
  });
}
