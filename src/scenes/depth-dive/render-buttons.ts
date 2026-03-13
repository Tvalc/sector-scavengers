/**
 * Depth Dive Button Rendering
 */

import { MakkoEngine } from '@makko/engine';
import { COLORS, FONTS, LAYOUT } from '../../ui/theme';
import { BUTTON_BOUNDS, type ButtonBounds } from './types';
import { isPointInBounds } from './input-handler';

export function renderFleeButton(display: typeof MakkoEngine.display): void {
  renderButton(display, BUTTON_BOUNDS.flee, 'FLEE', COLORS.warningRed);
}

export function renderRerollButton(display: typeof MakkoEngine.display): void {
  renderButton(display, BUTTON_BOUNDS.reroll, 'REROLL [R]', COLORS.neonCyan);
}

export function renderDeadDropButton(display: typeof MakkoEngine.display): void {
  renderButton(display, BUTTON_BOUNDS.deadDrop, 'DEAD DROP [D]', COLORS.neonMagenta);
}

function renderButton(
  display: typeof MakkoEngine.display,
  bounds: ButtonBounds,
  label: string,
  color: string
): void {
  const { x, y, width, height } = bounds;
  const mouseX = MakkoEngine.input.mouseX;
  const mouseY = MakkoEngine.input.mouseY;
  const isHovered = mouseX !== undefined && mouseY !== undefined && 
    isPointInBounds(mouseX, mouseY, bounds);

  // Glow effect on hover
  if (isHovered) {
    display.drawRoundRect(x - 3, y - 3, width + 6, height + 6, LAYOUT.borderRadius + 2, {
      fill: color,
      alpha: 0.15
    });
  }

  // Button background
  display.drawRoundRect(x, y, width, height, LAYOUT.borderRadius, {
    fill: color,
    alpha: isHovered ? 0.2 : 0.1
  });

  // Button border
  display.drawRoundRect(x, y, width, height, LAYOUT.borderRadius, {
    stroke: color,
    lineWidth: LAYOUT.borderWidth,
    alpha: 0.8
  });

  display.drawText(label, x + width / 2, y + height / 2, {
    font: FONTS.labelFont,
    fill: color,
    align: 'center',
    baseline: 'middle'
  });
}
