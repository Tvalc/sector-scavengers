/**
 * Render Utilities
 *
 * Shared rendering helpers for the idle scene.
 */

import { IDisplay } from '@makko/engine';
import { COLORS, FONTS } from '../../ui/theme';
import { Item } from '../../types/items';

/** Check if point is within bounds */
export function isPointInBounds(
  x: number, 
  y: number, 
  bounds: { x: number; y: number; width: number; height: number }
): boolean {
  return x >= bounds.x && 
         x <= bounds.x + bounds.width &&
         y >= bounds.y && 
         y <= bounds.y + bounds.height;
}

/** Render wrapped text within max width */
export function renderWrappedText(
  display: IDisplay,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  style: { font: string; fill: string }
): void {
  const words = text.split(' ');
  let line = '';
  let lineY = y;
  const lineHeight = 20;

  for (const word of words) {
    const testLine = line + (line ? ' ' : '') + word;
    const metrics = display.measureText(testLine, { font: style.font });
    
    if (metrics.width > maxWidth && line) {
      display.drawText(line, x, lineY, style);
      line = word;
      lineY += lineHeight;
    } else {
      line = testLine;
    }
  }
  
  display.drawText(line, x, lineY, style);
}

/**
 * Render tooltip panel for item details
 * 
 * @param display - Display instance from MakkoEngine
 * @param x - Mouse/cursor X position
 * @param y - Mouse/cursor Y position
 * @param item - Item to display tooltip for
 */
export function renderTooltip(
  display: IDisplay,
  x: number,
  y: number,
  item: Item
): void {
  const tooltipWidth = 250;
  const padding = 12;
  const lineHeight = 20;
  const bonusLineHeight = 18;
  const cursorOffset = 10;
  
  // Calculate content height
  let contentHeight = padding * 2; // Top and bottom padding
  
  // Name header
  contentHeight += lineHeight;
  
  // Description (wrapped) - estimate lines needed
  const descLines = estimateWrappedLines(display, item.description, tooltipWidth - padding * 2, FONTS.smallFont);
  contentHeight += descLines * lineHeight;
  
  // Bonuses
  if (item.bonuses.length > 0) {
    contentHeight += 8; // Small gap before bonuses
    contentHeight += item.bonuses.length * bonusLineHeight;
  }
  
  const tooltipHeight = contentHeight;
  
  // Calculate position with clamping to screen bounds
  let tooltipX = x + cursorOffset;
  let tooltipY = y + cursorOffset;
  
  // Clamp to right edge
  if (tooltipX + tooltipWidth > display.width) {
    tooltipX = x - tooltipWidth - cursorOffset;
  }
  
  // Clamp to bottom edge
  if (tooltipY + tooltipHeight > display.height) {
    tooltipY = y - tooltipHeight - cursorOffset;
  }
  
  // Ensure minimum position
  tooltipX = Math.max(0, tooltipX);
  tooltipY = Math.max(0, tooltipY);
  
  // Draw background panel
  display.drawRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, {
    fill: COLORS.panelBg,
    alpha: 0.95,
  });
  
  // Draw border
  display.drawRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, {
    stroke: COLORS.neonCyan,
    lineWidth: 2,
    alpha: 0.8,
  });
  
  // Current Y position for content
  let currentY = tooltipY + padding;
  
  // Draw item name (header)
  display.drawText(item.name, tooltipX + padding, currentY, {
    font: FONTS.labelFont,
    fill: COLORS.white,
  });
  currentY += lineHeight;
  
  // Draw description (wrapped)
  renderWrappedText(
    display,
    item.description,
    tooltipX + padding,
    currentY,
    tooltipWidth - padding * 2,
    { font: FONTS.smallFont, fill: COLORS.brightText }
  );
  currentY += descLines * lineHeight;
  
  // Draw bonuses
  if (item.bonuses.length > 0) {
    currentY += 8; // Gap before bonuses
    
    for (const bonus of item.bonuses) {
      display.drawText(`• ${bonus.description}`, tooltipX + padding, currentY, {
        font: FONTS.smallFont,
        fill: COLORS.neonCyan,
      });
      currentY += bonusLineHeight;
    }
  }
}

/**
 * Estimate number of lines needed for wrapped text
 */
function estimateWrappedLines(
  display: IDisplay,
  text: string,
  maxWidth: number,
  font: string
): number {
  const words = text.split(' ');
  let line = '';
  let lineCount = 1;
  
  for (const word of words) {
    const testLine = line + (line ? ' ' : '') + word;
    const metrics = display.measureText(testLine, { font });
    
    if (metrics.width > maxWidth && line) {
      lineCount++;
      line = word;
    } else {
      line = testLine;
    }
  }
  
  return lineCount;
}
