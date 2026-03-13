/**
 * Depth Dive Card Rendering
 *
 * Renders tactic cards with actual art assets.
 * Energy cost and risk warnings appear below the card art.
 */

import { MakkoEngine, StaticAsset } from '@makko/engine';
import { COLORS, CARD_COLORS, FONTS, LAYOUT } from '../../ui/theme';
import { TacticCard, CardType } from '../../types/cards';
import { getCardArt, CARD_DISPLAY } from '../../assets/card-art-map';

/** Cached card art assets */
const cardArtCache: Map<string, StaticAsset> = new Map();

/**
 * Preload card art assets
 */
export function preloadCardArt(): void {
  const assetNames = [
    'ss-card-tactic-scavenge',
    'ss-card-tactic-risky-scavenge',
    'ss-card-tactic-rush-scavenge',
    'ss-tactic-card-repair',
    'ss-card-tactic-patch-and-hold',
    'ss-card-tactic-salvage-parts',
    'ss-card-tactic-extract',
    'ss-card-tactic-secure-extract',
    'ss-card-tactic-quick-extract',
    'ss-card-tactic-reinforce-v2',
    'ss-card-tactic-upgrade',
    'ss-card-tactic-full-haul',
    'ss-card-tactic-deep-scan',
    'ss-card-tactic-compliance-scan',
    'ss-card-tactic-break-room-raid'
  ];

  for (const name of assetNames) {
    if (MakkoEngine.hasStaticAsset(name)) {
      cardArtCache.set(name, MakkoEngine.staticAsset(name));
    }
  }
}

/**
 * Get cached card art asset
 * Uses selectedArt if provided (from drafting), otherwise falls back to primary
 */
function getCardArtAsset(card: TacticCard): StaticAsset | null {
  // Use selected variant if available, otherwise use primary
  const assetName = card.selectedArt || getCardArt(card.type);
  if (!assetName) return null;

  // Check cache first
  if (cardArtCache.has(assetName)) {
    return cardArtCache.get(assetName) ?? null;
  }

  // Load and cache
  if (MakkoEngine.hasStaticAsset(assetName)) {
    const asset = MakkoEngine.staticAsset(assetName);
    cardArtCache.set(assetName, asset);
    return asset;
  }

  return null;
}

export function renderCards(
  display: typeof MakkoEngine.display,
  cards: TacticCard[],
  hoveredIndex: number | null,
  canAffordFn: (type: CardType) => boolean
): void {
  // Preload assets on first render
  if (cardArtCache.size === 0) {
    preloadCardArt();
  }

  const centerX = 960;
  // Card positions - account for footer space below
  const cardY = 1025 - CARD_DISPLAY.height - CARD_DISPLAY.footerHeight;

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const cardX = centerX - CARD_DISPLAY.spacing + (i * CARD_DISPLAY.spacing) - CARD_DISPLAY.width / 2;
    const isHovered = hoveredIndex === i;
    const canAfford = canAffordFn(card.type);

    renderCard(display, card, cardX, cardY, isHovered, canAfford, i + 1);
  }

  // Hint text
  display.drawText('Select a card', centerX, cardY + CARD_DISPLAY.height + CARD_DISPLAY.footerHeight + 40, {
    font: FONTS.smallFont,
    fill: COLORS.dimText,
    align: 'center'
  });
}

function renderCard(
  display: typeof MakkoEngine.display,
  card: TacticCard,
  x: number,
  y: number,
  isHovered: boolean,
  canAfford: boolean,
  keyNumber: number
): void {
  const borderColor = CARD_COLORS[card.type] || COLORS.neonCyan;
  const scale = isHovered ? 1.1 : 1;
  const alpha = canAfford ? 1 : 0.5;

  const scaledWidth = CARD_DISPLAY.width * scale;
  const scaledHeight = CARD_DISPLAY.height * scale;
  const offsetX = (scaledWidth - CARD_DISPLAY.width) / 2;
  const offsetY = (scaledHeight - CARD_DISPLAY.height) / 2;
  const cardRadius = LAYOUT.borderRadiusLarge;

  // Glow effect on hover
  if (isHovered && canAfford) {
    display.drawRoundRect(x - offsetX - 6, y - offsetY - 6, scaledWidth + 12, scaledHeight + 12, cardRadius + 2, {
      fill: borderColor,
      alpha: 0.2
    });
  }

  // Card background
  display.drawRoundRect(x - offsetX, y - offsetY, scaledWidth, scaledHeight, cardRadius, {
    fill: COLORS.cardBg,
    alpha: alpha * 0.95
  });

  // Card border
  display.drawRoundRect(x - offsetX, y - offsetY, scaledWidth, scaledHeight, cardRadius, {
    stroke: borderColor,
    lineWidth: isHovered ? LAYOUT.borderWidthThick : LAYOUT.borderWidth,
    alpha
  });

  // Render card art
  renderCardArt(display, card, x - offsetX, y - offsetY, scaledWidth, scaledHeight - 40, alpha);

  // Render footer (cost only) below the card art area
  renderCardFooter(display, card, x - offsetX, y - offsetY + scaledHeight - 35, scaledWidth, canAfford, alpha);

  // Key hint (bottom right corner)
  display.drawText(`[${keyNumber}]`, x - offsetX + scaledWidth - 25, y - offsetY + scaledHeight - 12, {
    font: FONTS.tinyFont,
    fill: COLORS.dimText,
    align: 'right',
    alpha: alpha * 0.6
  });
}

/**
 * Render the card art image
 */
function renderCardArt(
  display: typeof MakkoEngine.display,
  card: TacticCard,
  x: number,
  y: number,
  width: number,
  height: number,
  alpha: number
): void {
  const asset = getCardArtAsset(card);

  if (asset) {
    // Calculate aspect-fit dimensions
    const aspectRatio = asset.width / asset.height;
    let drawWidth = width;
    let drawHeight = width / aspectRatio;

    // If too tall, scale by height instead
    if (drawHeight > height) {
      drawHeight = height;
      drawWidth = height * aspectRatio;
    }

    // Center the image in the card area
    const drawX = x + (width - drawWidth) / 2;
    const drawY = y + (height - drawHeight) / 2;

    display.drawImage(asset.image, drawX, drawY, drawWidth, drawHeight, { alpha });
  } else {
    // Fallback: placeholder with card type name (fills to edges)
    display.drawRect(x, y, width, height, {
      fill: COLORS.panelBg,
      alpha: alpha * 0.8
    });

    display.drawText(card.type, x + width / 2, y + height / 2, {
      font: FONTS.labelFont,
      fill: COLORS.dimText,
      align: 'center',
      baseline: 'middle',
      alpha
    });
  }
}

/**
 * Render card footer with energy cost only
 */
function renderCardFooter(
  display: typeof MakkoEngine.display,
  card: TacticCard,
  x: number,
  y: number,
  width: number,
  canAfford: boolean,
  alpha: number
): void {
  const centerX = x + width / 2;

  // Energy cost (centered)
  const costText = card.energyCost === 0 ? 'FREE' : `${card.energyCost} ENERGY`;
  const costColor = card.energyCost === 0
    ? COLORS.success
    : canAfford
      ? COLORS.white
      : COLORS.warningRed;

  display.drawText(costText, centerX, y, {
    font: FONTS.smallFont,
    fill: costColor,
    align: 'center',
    alpha
  });
}

// End of card rendering module
