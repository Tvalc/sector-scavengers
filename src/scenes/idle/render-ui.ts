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
import { isPointInBounds, renderTooltip } from './render-utils';
import { Item } from '../../types/items';
import { getGlobalCrewEfficiencyBonus } from '../../systems/crew-bonus-system';
import type { CryoState } from '../../systems/cryo-system';

/** Button bounds for the scene */
export const DIVE_BUTTON_BOUNDS = { x: 560, y: 900, width: 200, height: 60 };
export const MISSION_BUTTON_BOUNDS = { x: 1670, y: 20, width: 50, height: 50 };
export const CREW_BUTTON_BOUNDS = { x: 1730, y: 20, width: 50, height: 50 };
export const INVENTORY_BUTTON_BOUNDS = { x: 1790, y: 20, width: 50, height: 50 };
export const HELP_BUTTON_BOUNDS = { x: 1850, y: 20, width: 50, height: 50 };

/** Panel constants for slot detection */
export const INVENTORY_PANEL = {
  x: 1450,
  y: 50,
  width: 300,
  height: 400,
  hardwareLabelY: 60,
  hardwareSlotsY: 80,
  crewLabelY: 220,
  crewSlotsY: 240,
  slotSize: 50,
  slotSpacing: 130,
  slotRowHeight: 60
} as const;

/** Crew panel constants */
export const CREW_PANEL = {
  x: 1450,
  y: 50,
  width: 300,
  height: 200,
  slotsY: 80,
  slotSize: 50,
  slotSpacing: 130
} as const;

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

  /** Render medic efficiency bonus badge */
  renderEfficiencyBonus(display: IDisplay, cryoState: CryoState): void {
    const bonus = getGlobalCrewEfficiencyBonus(cryoState);
    if (bonus <= 0) return;

    const badgeX = 30;
    const badgeY = 90;
    const badgeWidth = 170;
    const badgeHeight = 30;

    display.drawRoundRect(badgeX, badgeY, badgeWidth, badgeHeight, LAYOUT.borderRadius, {
      fill: COLORS.neonMagenta,
      alpha: 0.2
    });
    display.drawRoundRect(badgeX, badgeY, badgeWidth, badgeHeight, LAYOUT.borderRadius, {
      stroke: COLORS.neonMagenta,
      lineWidth: LAYOUT.borderWidth,
      alpha: 0.8
    });

    const percentage = Math.round(bonus * 100);
    display.drawText(`+${percentage}% EFFICIENCY`, badgeX + LAYOUT.padding, badgeY + 20, {
      font: FONTS.smallFont,
      fill: COLORS.neonMagenta
    });
  }

  /** Render inventory button */
  renderInventoryButton(display: IDisplay): void {
    const bounds = INVENTORY_BUTTON_BOUNDS;
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

    display.drawText('I', bounds.x + bounds.width / 2, bounds.y + bounds.height / 2, {
      font: FONTS.headingFont,
      fill: isHovered ? COLORS.neonCyan : COLORS.dimText,
      align: 'center',
      baseline: 'middle'
    });
  }

  /** Render crew button */
  renderCrewButton(display: IDisplay, isHovered: boolean): void {
    const bounds = CREW_BUTTON_BOUNDS;

    display.drawRoundRect(bounds.x, bounds.y, bounds.width, bounds.height, LAYOUT.borderRadius, {
      fill: COLORS.panelBg,
      alpha: 0.9
    });
    display.drawRoundRect(bounds.x, bounds.y, bounds.width, bounds.height, LAYOUT.borderRadius, {
      stroke: isHovered ? COLORS.neonMagenta : COLORS.dimText,
      lineWidth: LAYOUT.borderWidth,
      alpha: 1
    });

    display.drawText('C', bounds.x + bounds.width / 2, bounds.y + bounds.height / 2, {
      font: FONTS.headingFont,
      fill: isHovered ? COLORS.neonMagenta : COLORS.dimText,
      align: 'center',
      baseline: 'middle'
    });
  }

  /** Render inventory panel */
  renderInventoryPanel(display: IDisplay, inventory: InventorySystem, hoveredSlotIndex: number | null): void {
    const panelX = 1450;
    const panelY = 50;
    const panelWidth = 300;
    const panelHeight = 250;

    // Panel background with cyan accent for inventory
    display.drawRoundRect(panelX, panelY, panelWidth, panelHeight, LAYOUT.borderRadius, {
      fill: COLORS.panelBg,
      alpha: 0.9
    });
    display.drawRoundRect(panelX, panelY, panelWidth, panelHeight, LAYOUT.borderRadius, {
      stroke: COLORS.neonCyan,
      lineWidth: LAYOUT.borderWidth,
      alpha: 0.5
    });

    // Title
    display.drawText('INVENTORY', panelX + LAYOUT.padding, panelY + 25, {
      font: FONTS.labelFont,
      fill: COLORS.neonCyan
    });

    // Hardware section label
    display.drawText('HARDWARE', panelX + LAYOUT.padding, panelY + 60, {
      font: FONTS.tinyFont,
      fill: COLORS.dimText
    });

    // Hardware slots (4 max)
    const hardwareItems = inventory.getItemsByCategory('hardware');
    for (let i = 0; i < SLOT_LIMITS.hardware; i++) {
      const slotX = panelX + LAYOUT.padding + (i % 2) * 130;
      const slotY = panelY + 80 + Math.floor(i / 2) * 60;
      const isHovered = hoveredSlotIndex === i;
      this.renderInventorySlot(display, slotX, slotY, hardwareItems[i], 'hardware', isHovered);
    }
  }

  /** Render crew panel */
  renderCrewPanel(display: IDisplay, inventory: InventorySystem, hoveredSlotIndex: number | null): void {
    const panelX = 1450;
    const panelY = 50;
    const panelWidth = 300;
    const panelHeight = 200;

    // Panel background with magenta accent for crew
    display.drawRoundRect(panelX, panelY, panelWidth, panelHeight, LAYOUT.borderRadius, {
      fill: COLORS.panelBg,
      alpha: 0.9
    });
    display.drawRoundRect(panelX, panelY, panelWidth, panelHeight, LAYOUT.borderRadius, {
      stroke: COLORS.neonMagenta,
      lineWidth: LAYOUT.borderWidth,
      alpha: 0.5
    });

    // Title
    display.drawText('CREW', panelX + LAYOUT.padding, panelY + 25, {
      font: FONTS.labelFont,
      fill: COLORS.neonMagenta
    });

    // Crew section label
    display.drawText('MEMBERS', panelX + LAYOUT.padding, panelY + 60, {
      font: FONTS.tinyFont,
      fill: COLORS.dimText
    });

    // Crew slots (2 max)
    const crewItems = inventory.getItemsByCategory('crew');
    for (let i = 0; i < SLOT_LIMITS.crew; i++) {
      const slotX = panelX + LAYOUT.padding + i * 130;
      const slotY = panelY + 80;
      const isHovered = hoveredSlotIndex === i;
      this.renderInventorySlot(display, slotX, slotY, crewItems[i], 'crew', isHovered);
    }
  }

  /** Render tooltip for an item at specified position */
  renderTooltipForItem(display: IDisplay, x: number, y: number, item: Item): void {
    renderTooltip(display, x, y, item);
  }

  /** Get screen bounds for a specific inventory or crew slot */
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
      // Hardware slots: 4 max, in 2x2 grid, starting at y offset 80
      if (slotIndex < 0 || slotIndex >= SLOT_LIMITS.hardware) return null;
      return {
        x: panelX + LAYOUT.padding + (slotIndex % 2) * slotSpacing,
        y: panelY + 80 + Math.floor(slotIndex / 2) * slotRowHeight,
        width: slotSize,
        height: slotSize
      };
    } else {
      // Crew slots: 2 max, single row, starting at y offset 80
      if (slotIndex < 0 || slotIndex >= SLOT_LIMITS.crew) return null;
      return {
        x: panelX + LAYOUT.padding + slotIndex * slotSpacing,
        y: panelY + 80,
        width: slotSize,
        height: slotSize
      };
    }
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

  private renderInventorySlot(
    display: IDisplay, 
    x: number, 
    y: number, 
    item: { id: string; name: string; category: string } | undefined,
    category: 'hardware' | 'crew',
    isHovered: boolean
  ): void {
    const slotSize = 50;
    const itemColor = category === 'hardware' ? COLORS.neonCyan : COLORS.neonMagenta;

    // Slot background
    display.drawRoundRect(x, y, slotSize, slotSize, LAYOUT.borderRadiusSmall, {
      fill: COLORS.neutralGray,
      alpha: 0.3
    });
    
    // Slot border - highlight if hovered
    display.drawRoundRect(x, y, slotSize, slotSize, LAYOUT.borderRadiusSmall, {
      stroke: isHovered && item ? itemColor : COLORS.border,
      lineWidth: isHovered && item ? 2 : 1,
      alpha: isHovered && item ? 1 : 0.5
    });

    if (item) {
      // Item icon background
      display.drawRoundRect(x + 10, y + 10, slotSize - 20, slotSize - 20, 4, {
        fill: itemColor,
        alpha: 0.7
      });

      // Item abbreviation
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

  /** Render Mission button */
  renderMissionButton(display: IDisplay, hasNotification: boolean): void {
    const bounds = MISSION_BUTTON_BOUNDS;
    const mouseX = MakkoEngine.input.mouseX;
    const mouseY = MakkoEngine.input.mouseY;
    const isHovered = mouseX !== undefined && mouseY !== undefined &&
      isPointInBounds(mouseX, mouseY, bounds);

    display.drawRoundRect(bounds.x, bounds.y, bounds.width, bounds.height, LAYOUT.borderRadius, {
      fill: COLORS.panelBg,
      alpha: 0.9
    });
    display.drawRoundRect(bounds.x, bounds.y, bounds.width, bounds.height, LAYOUT.borderRadius, {
      stroke: isHovered ? COLORS.warningYellow : COLORS.dimText,
      lineWidth: LAYOUT.borderWidth,
      alpha: 1
    });

    // Mission icon (lightning bolt)
    display.drawText('⚡', bounds.x + bounds.width / 2, bounds.y + bounds.height / 2, {
      font: '20px Arial',
      fill: isHovered ? COLORS.warningYellow : COLORS.dimText,
      align: 'center',
      baseline: 'middle'
    });

    // Notification badge
    if (hasNotification) {
      const badgeRadius = 8;
      const badgeX = bounds.x + bounds.width - badgeRadius - 2;
      const badgeY = bounds.y + badgeRadius + 2;

      display.drawCircle(badgeX, badgeY, badgeRadius, {
        fill: COLORS.warningRed
      });
    }
  }
}
