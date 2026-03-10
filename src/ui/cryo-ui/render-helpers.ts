/**
 * Cryo UI Render Helpers
 * 
 * Shared rendering utilities for drawing UI elements.
 */

import type { IDisplay } from '@makko/engine';
import { COLORS, FONTS, LAYOUT } from '../theme';
import { CARD_HEIGHT, PADDING, MODAL_WIDTH } from './types';

/**
 * Calculate modal position (centered)
 */
export function getModalPosition(display: IDisplay): { x: number; y: number } {
  return {
    x: (display.width - MODAL_WIDTH) / 2,
    y: (display.height - 650) / 2
  };
}

/**
 * Render modal background overlay and panel
 */
export function renderModalBackground(display: IDisplay, modalX: number, modalY: number): void {
  // Darken background
  display.drawRect(0, 0, display.width, display.height, {
    fill: '#000000',
    alpha: 0.75
  });
  
  // Modal background
  display.drawRoundRect(modalX, modalY, MODAL_WIDTH, 650, LAYOUT.borderRadiusLarge, {
    fill: COLORS.panelBg,
    alpha: 0.98
  });
  
  // Modal border
  display.drawRoundRect(modalX, modalY, MODAL_WIDTH, 650, LAYOUT.borderRadiusLarge, {
    stroke: COLORS.neonCyan,
    lineWidth: LAYOUT.borderWidthThick,
    alpha: 1
  });
}

/**
 * Render modal title with decorative line
 */
export function renderModalTitle(display: IDisplay, modalX: number, modalY: number, title: string): void {
  display.drawText(title, modalX + MODAL_WIDTH / 2, modalY + 45, {
    font: FONTS.titleFont,
    fill: COLORS.neonCyan,
    align: 'center'
  });
  
  display.drawLine(modalX + 100, modalY + 75, modalX + MODAL_WIDTH - 100, modalY + 75, {
    stroke: COLORS.neonCyan,
    lineWidth: LAYOUT.borderWidth,
    alpha: 0.5
  });
}

/**
 * Render power cell count display
 */
export function renderPowerCellCount(display: IDisplay, modalX: number, modalY: number, powerCells: number): void {
  display.drawText(`⚡ POWER CELLS: ${powerCells}`, modalX + MODAL_WIDTH / 2, modalY + 105, {
    font: FONTS.headingFont,
    fill: COLORS.neonMagenta,
    align: 'center'
  });
}

/**
 * Render a stat bar with label
 */
export function renderStatBar(
  display: IDisplay,
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  value: number,
  color: string
): void {
  display.drawText(label, x, y, { font: FONTS.tinyFont, fill: COLORS.dimText });
  
  const barX = x + 35;
  display.drawRect(barX, y - 3, width, height, { fill: COLORS.neutralGray, alpha: 0.3 });
  
  const fillWidth = width * (value / 100);
  display.drawRect(barX, y - 3, fillWidth, height, { fill: color, alpha: 0.8 });
  
  display.drawText(`${value}`, barX + width + 8, y, { font: FONTS.tinyFont, fill: COLORS.brightText });
}

/**
 * Render section header
 */
export function renderSectionHeader(display: IDisplay, x: number, y: number, title: string): void {
  display.drawText(title, x, y, { font: FONTS.labelFont, fill: COLORS.dimText });
}

/**
 * Render empty state message
 */
export function renderEmptyState(display: IDisplay, x: number, y: number, message: string): void {
  display.drawText(message, x, y, { font: FONTS.bodyFont, fill: COLORS.disabled, align: 'left' });
}

/**
 * Calculate card positions for a list
 */
export function calculateCardPositions(startY: number, count: number): number[] {
  const positions: number[] = [];
  for (let i = 0; i < count; i++) {
    positions.push(startY + i * (CARD_HEIGHT + 12));
  }
  return positions;
}
