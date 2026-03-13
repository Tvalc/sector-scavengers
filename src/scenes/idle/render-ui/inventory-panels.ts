/**
 * Inventory Panels Rendering
 *
 * Inventory and crew panels with item slots.
 */

import { IDisplay } from '@makko/engine';
import { COLORS, FONTS, LAYOUT } from '../../../ui/theme';
import { SLOT_LIMITS, InventorySystem } from '../../../systems/inventory-system';
import { renderTooltip } from '../render-utils';
import { Item } from '../../../types/items';

/**
 * Renders inventory and crew panels
 */
export class InventoryPanels {
  /** Render inventory panel */
  renderInventoryPanel(display: IDisplay, inventory: InventorySystem, hoveredSlotIndex: number | null): void {
    const panelX = 1450;
    const panelY = 50;
    const panelWidth = 300;
    const panelHeight = 250;

    this.renderPanelBackground(display, panelX, panelY, panelWidth, panelHeight, COLORS.neonCyan);

    display.drawText('INVENTORY', panelX + LAYOUT.padding, panelY + 25, {
      font: FONTS.labelFont,
      fill: COLORS.neonCyan
    });

    display.drawText('HARDWARE', panelX + LAYOUT.padding, panelY + 60, {
      font: FONTS.tinyFont,
      fill: COLORS.dimText
    });

    const hardwareItems = inventory.getItemsByCategory('hardware');
    for (let i = 0; i < SLOT_LIMITS.hardware; i++) {
      const slotX = panelX + LAYOUT.padding + (i % 2) * 130;
      const slotY = panelY + 80 + Math.floor(i / 2) * 60;
      const isHovered = hoveredSlotIndex === i;
      this.renderSlot(display, slotX, slotY, hardwareItems[i], 'hardware', isHovered);
    }
  }

  /** Render crew panel */
  renderCrewPanel(display: IDisplay, inventory: InventorySystem, hoveredSlotIndex: number | null): void {
    const panelX = 1450;
    const panelY = 50;
    const panelWidth = 300;
    const panelHeight = 200;

    this.renderPanelBackground(display, panelX, panelY, panelWidth, panelHeight, COLORS.neonMagenta);

    display.drawText('CREW', panelX + LAYOUT.padding, panelY + 25, {
      font: FONTS.labelFont,
      fill: COLORS.neonMagenta
    });

    display.drawText('MEMBERS', panelX + LAYOUT.padding, panelY + 60, {
      font: FONTS.tinyFont,
      fill: COLORS.dimText
    });

    const crewItems = inventory.getItemsByCategory('crew');
    for (let i = 0; i < SLOT_LIMITS.crew; i++) {
      const slotX = panelX + LAYOUT.padding + i * 130;
      const slotY = panelY + 80;
      const isHovered = hoveredSlotIndex === i;
      this.renderSlot(display, slotX, slotY, crewItems[i], 'crew', isHovered);
    }
  }

  /** Render tooltip for an item */
  renderTooltipForItem(display: IDisplay, x: number, y: number, item: Item): void {
    renderTooltip(display, x, y, item);
  }

  /** Get screen bounds for a specific slot */
  getSlotBounds(
    panelX: number,
    panelY: number,
    category: 'hardware' | 'crew',
    slotIndex: number
  ): { x: number; y: number; width: number; height: number } | null {
    const slotSize = 50;
    const slotSpacing = 130;
    const slotRowHeight = 60;

    if (category === 'hardware') {
      if (slotIndex < 0 || slotIndex >= SLOT_LIMITS.hardware) return null;
      return {
        x: panelX + LAYOUT.padding + (slotIndex % 2) * slotSpacing,
        y: panelY + 80 + Math.floor(slotIndex / 2) * slotRowHeight,
        width: slotSize,
        height: slotSize
      };
    } else {
      if (slotIndex < 0 || slotIndex >= SLOT_LIMITS.crew) return null;
      return {
        x: panelX + LAYOUT.padding + slotIndex * slotSpacing,
        y: panelY + 80,
        width: slotSize,
        height: slotSize
      };
    }
  }

  /** Render panel background with accent color */
  private renderPanelBackground(display: IDisplay, x: number, y: number, w: number, h: number, accentColor: string): void {
    display.drawRoundRect(x, y, w, h, LAYOUT.borderRadius, {
      fill: COLORS.panelBg,
      alpha: 0.9
    });
    display.drawRoundRect(x, y, w, h, LAYOUT.borderRadius, {
      stroke: accentColor,
      lineWidth: LAYOUT.borderWidth,
      alpha: 0.5
    });
  }

  /** Render a single inventory slot */
  private renderSlot(
    display: IDisplay,
    x: number,
    y: number,
    item: { id: string; name: string; category: string } | undefined,
    category: 'hardware' | 'crew',
    isHovered: boolean
  ): void {
    const slotSize = 50;
    const itemColor = category === 'hardware' ? COLORS.neonCyan : COLORS.neonMagenta;

    display.drawRoundRect(x, y, slotSize, slotSize, LAYOUT.borderRadiusSmall, {
      fill: COLORS.neutralGray,
      alpha: 0.3
    });

    display.drawRoundRect(x, y, slotSize, slotSize, LAYOUT.borderRadiusSmall, {
      stroke: isHovered && item ? itemColor : COLORS.border,
      lineWidth: isHovered && item ? 2 : 1,
      alpha: isHovered && item ? 1 : 0.5
    });

    if (item) {
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
}
