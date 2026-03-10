/**
 * UI Rendering
 *
 * Buttons, panels, inventory, and other UI elements.
 */

import { MakkoEngine, IDisplay } from '@makko/engine';
import { COLORS, FONTS, LAYOUT } from '../../ui/theme';
import { SLOT_LIMITS } from '../../systems/inventory-system';
import { InventorySystem } from '../../systems/inventory-system';
import { SocialMultiplierSystem } from '../../systems/social-multiplier-system';
import { BatteryCoreDisplay } from '../../ui/visual-components';
import { isPointInBounds } from './render-utils';

/** Button bounds for the scene */
export const DIVE_BUTTON_BOUNDS = { x: 860, y: 900, width: 200, height: 60 };
export const HELP_BUTTON_BOUNDS = { x: 1850, y: 20, width: 50, height: 50 };

/**
 * UIRenderer handles all UI element rendering
 */
export class UIRenderer {
  private batteryDisplay: BatteryCoreDisplay;

  constructor() {
    this.batteryDisplay = new BatteryCoreDisplay(30, 30, 400, 40);
  }

  /** Render energy display */
  renderEnergy(display: IDisplay, energy: number, cap: number, rate: number): void {
    this.batteryDisplay.render(display, Math.floor(energy), Math.floor(cap), `+${rate.toFixed(1)}/s`);
  }

  /** Render inventory panel */
  renderInventoryPanel(display: IDisplay, inventory: InventorySystem): void {
    const panelX = 1450;
    const panelY = 50;
    const panelWidth = 300;
    const panelHeight = 400;

    this.renderPanelBackground(display, panelX, panelY, panelWidth, panelHeight);
    this.renderPanelTitle(display, panelX, panelY, 'INVENTORY');
    
    this.renderCategorySection(display, inventory, panelX, panelY, 'hardware', 60, 80);
    this.renderCategorySection(display, inventory, panelX, panelY, 'crew', 220, 240);
  }

  private renderPanelBackground(display: IDisplay, x: number, y: number, w: number, h: number): void {
    display.drawRoundRect(x, y, w, h, LAYOUT.borderRadius, {
      fill: COLORS.panelBg,
      alpha: 0.9
    });
    display.drawRoundRect(x, y, w, h, LAYOUT.borderRadius, {
      stroke: COLORS.neonCyan,
      lineWidth: LAYOUT.borderWidth,
      alpha: 0.5
    });
  }

  private renderPanelTitle(display: IDisplay, x: number, y: number, title: string): void {
    display.drawText(title, x + LAYOUT.padding, y + 25, {
      font: FONTS.labelFont,
      fill: COLORS.white
    });
  }

  private renderCategorySection(
    display: IDisplay, 
    inventory: InventorySystem,
    panelX: number, 
    panelY: number,
    category: 'hardware' | 'crew',
    labelY: number,
    slotsY: number
  ): void {
    const label = category.toUpperCase();
    display.drawText(label, panelX + LAYOUT.padding, panelY + labelY, {
      font: FONTS.tinyFont,
      fill: COLORS.dimText
    });

    const slots = inventory.getItemsByCategory(category);
    const limit = SLOT_LIMITS[category];

    for (let i = 0; i < limit; i++) {
      const slotX = panelX + LAYOUT.padding + (i % 2) * 130;
      const slotY = panelY + slotsY + Math.floor(i / 2) * 60;
      this.renderInventorySlot(display, slotX, slotY, slots[i]);
    }
  }

  private renderInventorySlot(
    display: IDisplay, 
    x: number, 
    y: number, 
    item: { id: string; name: string; category: string } | undefined
  ): void {
    const slotSize = 50;

    display.drawRoundRect(x, y, slotSize, slotSize, LAYOUT.borderRadiusSmall, {
      fill: COLORS.neutralGray,
      alpha: 0.3
    });
    display.drawRoundRect(x, y, slotSize, slotSize, LAYOUT.borderRadiusSmall, {
      stroke: COLORS.border,
      lineWidth: 1,
      alpha: 0.5
    });

    if (item) {
      const itemColor = item.category === 'hardware' ? COLORS.neonCyan : COLORS.neonMagenta;
      
      display.drawRoundRect(x + 10, y + 10, slotSize - 20, slotSize - 20, 4, {
        fill: itemColor,
        alpha: 0.7
      });

      const abbrev = item.name.substring(0, 2).toUpperCase();
      display.drawText(abbrev, x + slotSize / 2, y + slotSize / 2, {
        font: FONTS.bodyFont,
        fill: COLORS.white,
        align: 'center',
        baseline: 'middle'
      });
    }
  }

  /** Render viral multiplier badge */
  renderViralMultiplierBadge(display: IDisplay, socialSystem: SocialMultiplierSystem): void {
    const status = socialSystem.getStatus();
    if (!status.active) return;

    const badgeX = 30;
    const badgeY = 135;
    const badgeWidth = 170;
    const badgeHeight = 36;

    display.drawRoundRect(badgeX, badgeY, badgeWidth, badgeHeight, LAYOUT.borderRadius, {
      fill: COLORS.neonMagenta,
      alpha: 0.2
    });
    display.drawRoundRect(badgeX, badgeY, badgeWidth, badgeHeight, LAYOUT.borderRadius, {
      stroke: COLORS.neonMagenta,
      lineWidth: LAYOUT.borderWidth,
      alpha: 0.8
    });

    display.drawText(`${status.multiplier}x BOOST`, badgeX + LAYOUT.padding, badgeY + 23, {
      font: FONTS.bodyFont,
      fill: COLORS.neonMagenta
    });

    if (status.remainingFormatted) {
      display.drawText(status.remainingFormatted, badgeX + badgeWidth - LAYOUT.padding - 40, badgeY + 23, {
        font: FONTS.smallFont,
        fill: COLORS.white
      });
    }
  }

  /** Render DIVE button */
  renderDiveButton(display: IDisplay, selectedCount: number): void {
    const canDive = selectedCount >= 1;
    const bounds = DIVE_BUTTON_BOUNDS;

    const mouseX = MakkoEngine.input.mouseX;
    const mouseY = MakkoEngine.input.mouseY;
    const isHovered = mouseX !== undefined && mouseY !== undefined &&
      isPointInBounds(mouseX, mouseY, bounds) && canDive;

    const buttonColor = canDive ? COLORS.neonCyan : COLORS.dimText;
    const alpha = isHovered ? 0.3 : (canDive ? 0.1 : 0.05);
    const borderAlpha = canDive ? 1 : 0.3;

    // Glow effect
    if (isHovered) {
      display.drawRoundRect(bounds.x - 4, bounds.y - 4, bounds.width + 8, bounds.height + 8, LAYOUT.borderRadius + 2, {
        fill: buttonColor,
        alpha: 0.15
      });
    }

    // Button background
    display.drawRoundRect(bounds.x, bounds.y, bounds.width, bounds.height, LAYOUT.borderRadius, {
      fill: buttonColor,
      alpha: alpha
    });

    // Button border
    display.drawRoundRect(bounds.x, bounds.y, bounds.width, bounds.height, LAYOUT.borderRadius, {
      stroke: buttonColor,
      lineWidth: isHovered ? LAYOUT.borderWidthThick : LAYOUT.borderWidth,
      alpha: borderAlpha
    });

    // Button text
    const buttonText = `DIVE${selectedCount > 0 ? ` (${selectedCount})` : ''}`;
    display.drawText(buttonText, bounds.x + bounds.width / 2, bounds.y + bounds.height / 2, {
      font: FONTS.headingFont,
      fill: buttonColor,
      align: 'center',
      baseline: 'middle'
    });
  }

  /** Render Help button */
  renderHelpButton(display: IDisplay): void {
    const bounds = HELP_BUTTON_BOUNDS;
    const mouseX = MakkoEngine.input.mouseX;
    const mouseY = MakkoEngine.input.mouseY;
    const isHovered = mouseX !== undefined && mouseY !== undefined &&
      isPointInBounds(mouseX, mouseY, bounds);

    display.drawRoundRect(bounds.x, bounds.y, bounds.width, bounds.height, LAYOUT.borderRadius, {
      fill: COLORS.panelBg,
      alpha: 0.9
    });
    display.drawRoundRect(bounds.x, bounds.y, bounds.width, bounds.height, LAYOUT.borderRadius, {
      stroke: isHovered ? COLORS.neonCyan : COLORS.dimText,
      lineWidth: LAYOUT.borderWidth,
      alpha: 1
    });

    display.drawText('?', bounds.x + bounds.width / 2, bounds.y + bounds.height / 2, {
      font: FONTS.headingFont,
      fill: isHovered ? COLORS.neonCyan : COLORS.dimText,
      align: 'center',
      baseline: 'middle'
    });
  }
}
