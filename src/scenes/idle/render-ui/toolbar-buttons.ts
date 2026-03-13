/**
 * Toolbar Button Rendering
 *
 * Inventory, crew, mission, and help toolbar buttons.
 */

import { MakkoEngine, IDisplay } from '@makko/engine';
import { COLORS, FONTS, LAYOUT } from '../../../ui/theme';
import { isPointInBounds } from '../render-utils';
import { INVENTORY_BUTTON_BOUNDS, CREW_BUTTON_BOUNDS, MISSION_BUTTON_BOUNDS, HELP_BUTTON_BOUNDS } from './constants';

/**
 * Renders all toolbar buttons in the top-right corner
 */
export class ToolbarButtons {
  /** Render inventory button */
  renderInventoryButton(display: IDisplay): void {
    const bounds = INVENTORY_BUTTON_BOUNDS;
    const isHovered = this.isHovered(bounds);

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

  /** Render mission button */
  renderMissionButton(display: IDisplay, hasNotification: boolean): void {
    const bounds = MISSION_BUTTON_BOUNDS;
    const isHovered = this.isHovered(bounds);

    display.drawRoundRect(bounds.x, bounds.y, bounds.width, bounds.height, LAYOUT.borderRadius, {
      fill: COLORS.panelBg,
      alpha: 0.9
    });
    display.drawRoundRect(bounds.x, bounds.y, bounds.width, bounds.height, LAYOUT.borderRadius, {
      stroke: isHovered ? COLORS.warningYellow : COLORS.dimText,
      lineWidth: LAYOUT.borderWidth,
      alpha: 1
    });

    display.drawText('⚡', bounds.x + bounds.width / 2, bounds.y + bounds.height / 2, {
      font: '20px Arial',
      fill: isHovered ? COLORS.warningYellow : COLORS.dimText,
      align: 'center',
      baseline: 'middle'
    });

    if (hasNotification) {
      this.renderNotificationBadge(display, bounds);
    }
  }

  /** Render help button */
  renderHelpButton(display: IDisplay): void {
    const bounds = HELP_BUTTON_BOUNDS;
    const isHovered = this.isHovered(bounds);

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

  /** Check if mouse is hovered over bounds */
  private isHovered(bounds: { x: number; y: number; width: number; height: number }): boolean {
    const mouseX = MakkoEngine.input.mouseX;
    const mouseY = MakkoEngine.input.mouseY;
    return mouseX !== undefined && mouseY !== undefined && isPointInBounds(mouseX, mouseY, bounds);
  }

  /** Render notification badge */
  private renderNotificationBadge(display: IDisplay, bounds: { x: number; y: number; width: number; height: number }): void {
    const badgeRadius = 8;
    const badgeX = bounds.x + bounds.width - badgeRadius - 2;
    const badgeY = bounds.y + badgeRadius + 2;

    display.drawCircle(badgeX, badgeY, badgeRadius, {
      fill: COLORS.warningRed
    });
  }
}
