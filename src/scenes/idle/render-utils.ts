/**
 * Render Utilities
 *
 * Shared rendering helpers for the idle scene.
 */

import { IDisplay } from '@makko/engine';

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
