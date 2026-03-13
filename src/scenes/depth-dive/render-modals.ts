/**
 * Depth Dive Modal Rendering
 */

import { MakkoEngine } from '@makko/engine';
import { DiscoveryEventSystem, DiscoveryEvent, RarityTier } from '../../systems/discovery-event-system';
import { COLORS, FONTS, LAYOUT } from '../../ui/theme';

export function renderCollapsedState(display: typeof MakkoEngine.display): void {
  const { width, height } = display;

  display.drawText('HULL BREACH!', width / 2, height / 2 - 50, {
    font: 'bold 64px monospace',
    fill: COLORS.warningRed,
    align: 'center'
  });

  display.drawText('All rewards lost...', width / 2, height / 2 + 20, {
    font: FONTS.headingFont,
    fill: COLORS.dimText,
    align: 'center'
  });

  display.drawText('Press SPACE to continue', width / 2, height / 2 + 80, {
    font: FONTS.labelFont,
    fill: COLORS.dimText,
    align: 'center'
  });
}

export function renderDiscoveryModal(
  display: typeof MakkoEngine.display,
  discoverySystem: DiscoveryEventSystem
): void {
  const event = discoverySystem.getCurrentEvent();
  if (!event) return;

  const { width, height } = display;
  const modalWidth = 400;
  const modalHeight = 300;
  const modalX = (width - modalWidth) / 2;
  const modalY = (height - modalHeight) / 2 - 50;

  // Darken background
  display.drawRect(0, 0, width, height, {
    fill: '#000000',
    alpha: 0.7
  });

  const rarityColor = DiscoveryEventSystem.getRarityColor(event.tier);

  // Rarity glow
  display.drawRoundRect(modalX - 5, modalY - 5, modalWidth + 10, modalHeight + 10, LAYOUT.borderRadiusLarge + 2, {
    stroke: rarityColor,
    lineWidth: LAYOUT.borderWidth,
    alpha: 0.3
  });

  // Modal background
  display.drawRoundRect(modalX, modalY, modalWidth, modalHeight, LAYOUT.borderRadiusLarge, {
    fill: COLORS.panelBg,
    alpha: 0.95
  });

  // Modal border
  display.drawRoundRect(modalX, modalY, modalWidth, modalHeight, LAYOUT.borderRadiusLarge, {
    stroke: rarityColor,
    lineWidth: LAYOUT.borderWidthThick,
    alpha: 1
  });

  renderModalContent(display, event, modalX, modalY, modalWidth, modalHeight, rarityColor);
}

function renderModalContent(
  display: typeof MakkoEngine.display,
  event: DiscoveryEvent,
  modalX: number,
  modalY: number,
  modalWidth: number,
  modalHeight: number,
  rarityColor: string
): void {
  const centerX = modalX + modalWidth / 2;

  // Title
  const title = event.discoveryType === 'card' ? 'CARD UNLOCKED!' : 'DISCOVERY!';
  display.drawText(title, centerX, modalY + 40, {
    font: FONTS.titleFont,
    fill: rarityColor,
    align: 'center'
  });

  // Icon
  const iconY = modalY + 120;
  display.drawCircle(centerX, iconY, 50, {
    fill: rarityColor,
    alpha: 0.3
  });
  display.drawCircle(centerX, iconY, 40, {
    fill: rarityColor,
    alpha: 0.6
  });

  if (event.discoveryType === 'card' && event.cardType) {
    // Card reward
    const cardName = formatCardName(event.cardType);
    display.drawText(cardName, centerX, iconY + 70, {
      font: FONTS.headingFont,
      fill: COLORS.white,
      align: 'center'
    });
    display.drawText('New tactic card added to deck!', centerX, iconY + 100, {
      font: FONTS.smallFont,
      fill: COLORS.dimText,
      align: 'center'
    });
  } else if (event.item) {
    // Item reward
    display.drawText(event.item.name, centerX, iconY + 70, {
      font: FONTS.headingFont,
      fill: COLORS.white,
      align: 'center'
    });
    display.drawText(event.item.description, centerX, iconY + 100, {
      font: FONTS.smallFont,
      fill: COLORS.dimText,
      align: 'center'
    });
  }

  // Rarity badge
  display.drawText(event.tier.toUpperCase(), centerX, modalY + modalHeight - 60, {
    font: FONTS.bodyFont,
    fill: rarityColor,
    align: 'center'
  });

  // Collect button
  display.drawText('[SPACE] COLLECT', centerX, modalY + modalHeight - 30, {
    font: FONTS.bodyFont,
    fill: COLORS.neonCyan,
    align: 'center'
  });
}

/**
 * Format card type ID as display name
 */
function formatCardName(cardType: string): string {
  return cardType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
