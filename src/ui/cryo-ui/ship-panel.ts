/**
 * Ship Selection Panel
 * 
 * Renders ship selection UI for crew assignment.
 */

import type { IDisplay } from '@makko/engine';
import { COLORS, FONTS, LAYOUT } from '../theme';
import { MODAL_WIDTH, MODAL_HEIGHT } from './types';
import { getSelectedCrewForAssignment, registerShipButton } from './state';
import { getModalPosition } from './render-helpers';

interface ShipInfo {
  id: number;
  shipClass: number;
  crewAssignments: string[];
}

/**
 * Render ship selection panel for crew assignment
 */
export function renderShipSelectionPanel(
  display: IDisplay,
  playerShips: ShipInfo[]
): void {
  const selectedCrewId = getSelectedCrewForAssignment();
  if (!selectedCrewId) return;
  
  const { x: modalX, y: modalY } = getModalPosition(display);
  
  const panelWidth = 250;
  const panelHeight = Math.max(200, 60 + playerShips.length * 50);
  const panelX = modalX + MODAL_WIDTH + 20;
  const panelY = modalY + 140;
  
  // Panel background
  display.drawRoundRect(panelX, panelY, panelWidth, panelHeight, LAYOUT.borderRadius, {
    fill: COLORS.panelBg,
    stroke: COLORS.neonCyan,
    lineWidth: LAYOUT.borderWidth,
    alpha: 0.98
  });
  
  // Panel title
  display.drawText('SELECT SHIP', panelX + panelWidth / 2, panelY + 25, {
    font: FONTS.labelFont,
    fill: COLORS.neonCyan,
    align: 'center'
  });
  
  // Ship buttons
  playerShips.forEach((ship, index) => {
    renderShipButton(display, panelX, panelY, panelWidth, ship, index, selectedCrewId);
  });
  
  // Empty state
  if (playerShips.length === 0) {
    display.drawText('No ships available', panelX + panelWidth / 2, panelY + panelHeight / 2, {
      font: FONTS.bodyFont,
      fill: COLORS.disabled,
      align: 'center'
    });
  }
}

/**
 * Render individual ship button
 */
function renderShipButton(
  display: IDisplay,
  panelX: number,
  panelY: number,
  panelWidth: number,
  ship: ShipInfo,
  index: number,
  crewId: string
): void {
  const buttonY = panelY + 50 + index * 50;
  const buttonHeight = 40;
  const buttonX = panelX + 10;
  const buttonWidth = panelWidth - 20;
  
  registerShipButton({ x: buttonX, y: buttonY, width: buttonWidth, height: buttonHeight, shipId: ship.id, crewId });
  
  display.drawRoundRect(buttonX, buttonY, buttonWidth, buttonHeight, LAYOUT.borderRadiusSmall, {
    fill: COLORS.cardBg,
    stroke: COLORS.border,
    lineWidth: LAYOUT.borderWidth
  });
  
  display.drawText(`Ship #${ship.id} (Class ${ship.shipClass})`, buttonX + 10, buttonY + 15, {
    font: FONTS.smallFont,
    fill: COLORS.white,
    align: 'left'
  });
  
  const crewText = ship.crewAssignments.length > 0 ? `${ship.crewAssignments.length} crew assigned` : 'No crew assigned';
  display.drawText(crewText, buttonX + 10, buttonY + 30, {
    font: FONTS.tinyFont,
    fill: COLORS.dimText,
    align: 'left'
  });
}
