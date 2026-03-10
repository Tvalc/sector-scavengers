/**
 * Modal Rendering
 *
 * How to Play modal and other overlay rendering.
 */

import { IDisplay } from '@makko/engine';
import { COLORS, FONTS, LAYOUT } from '../../ui/theme';
import { HOW_TO_PLAY_CONTENT } from './constants';
import { renderWrappedText } from './render-utils';

/**
 * Render How to Play modal overlay
 */
export function renderHowToPlayModal(display: IDisplay): void {
  const modalWidth = 600;
  const modalHeight = 400;
  const modalX = (display.width - modalWidth) / 2;
  const modalY = (display.height - modalHeight) / 2;

  // Darken background
  display.drawRect(0, 0, display.width, display.height, {
    fill: '#000000',
    alpha: 0.7
  });

  // Modal background
  display.drawRoundRect(modalX, modalY, modalWidth, modalHeight, LAYOUT.borderRadiusLarge, {
    fill: COLORS.panelBg,
    alpha: 0.95
  });

  // Modal border
  display.drawRoundRect(modalX, modalY, modalWidth, modalHeight, LAYOUT.borderRadiusLarge, {
    stroke: COLORS.neonCyan,
    lineWidth: LAYOUT.borderWidthThick,
    alpha: 1
  });

  // Title
  display.drawText(HOW_TO_PLAY_CONTENT.title, modalX + modalWidth / 2, modalY + 50, {
    font: FONTS.titleFont,
    fill: COLORS.neonCyan,
    align: 'center'
  });

  // Decorative line
  display.drawLine(modalX + 100, modalY + 80, modalX + modalWidth - 100, modalY + 80, {
    stroke: COLORS.neonCyan,
    lineWidth: LAYOUT.borderWidth,
    alpha: 0.5
  });

  // Bullet points
  const bulletStartY = modalY + 120;
  const bulletSpacing = 50;

  HOW_TO_PLAY_CONTENT.bullets.forEach((bullet, index) => {
    const bulletY = bulletStartY + index * bulletSpacing;
    
    display.drawCircle(modalX + 50, bulletY + 8, 6, {
      fill: COLORS.neonMagenta
    });

    const maxWidth = modalWidth - 120;
    renderWrappedText(display, bullet, modalX + 70, bulletY, maxWidth, {
      font: FONTS.bodyFont,
      fill: COLORS.white
    });
  });

  // Close hint
  display.drawText('Press ESC or H to close', modalX + modalWidth / 2, modalY + modalHeight - 40, {
    font: FONTS.smallFont,
    fill: COLORS.dimText,
    align: 'center'
  });
}
