/**
 * Dive Button Rendering
 *
 * Scavenge/DIVE button with asset rendering and fallback.
 */

import { MakkoEngine, IDisplay } from '@makko/engine';
import { COLORS, FONTS, LAYOUT } from '../../../ui/theme';
import { isPointInBounds } from '../render-utils';
import { DIVE_BUTTON_BOUNDS } from './constants';

/**
 * Renders the DIVE/Scavenge button
 */
export class DiveButton {
  /** Render DIVE button with Scavenge prop */
  render(display: IDisplay, selectedCount: number): void {
    const canDive = selectedCount >= 1;
    const bounds = DIVE_BUTTON_BOUNDS;
    const isHovered = this.isHovered(bounds) && canDive;
    const buttonColor = canDive ? COLORS.neonCyan : COLORS.dimText;

    const scavengeAsset = MakkoEngine.staticAsset('scavenge_button');
    
    if (scavengeAsset) {
      this.renderWithAsset(display, scavengeAsset, bounds, isHovered, canDive, buttonColor, selectedCount);
    } else {
      this.renderFallback(display, bounds, isHovered, canDive, buttonColor, selectedCount);
    }
  }

  /** Render with scavenge button asset */
  private renderWithAsset(
    display: IDisplay,
    asset: { image: HTMLImageElement; width: number; height: number },
    bounds: { x: number; y: number; width: number; height: number },
    isHovered: boolean,
    canDive: boolean,
    buttonColor: string,
    selectedCount: number
  ): void {
    const scale = 0.18;
    const scaledWidth = asset.width * scale;
    const scaledHeight = asset.height * scale;
    const propX = bounds.x + (bounds.width - scaledWidth) / 2;
    const propY = bounds.y;

    if (isHovered) {
      display.drawCircle(propX + scaledWidth / 2, propY + scaledHeight / 2, scaledWidth * 0.7, {
        fill: buttonColor,
        alpha: 0.15
      });
    }

    display.drawImage(asset.image, propX, propY, scaledWidth, scaledHeight, {
      alpha: canDive ? (isHovered ? 1 : 0.85) : 0.4
    });

    const textY = propY + scaledHeight + 18;
    const text = selectedCount > 0 ? `Scavenge (${selectedCount})` : 'Scavenge';
    display.drawText(text, bounds.x + bounds.width / 2, textY, {
      font: FONTS.labelFont,
      fill: buttonColor,
      align: 'center',
      baseline: 'top'
    });
  }

  /** Render fallback button style */
  private renderFallback(
    display: IDisplay,
    bounds: { x: number; y: number; width: number; height: number },
    isHovered: boolean,
    canDive: boolean,
    buttonColor: string,
    selectedCount: number
  ): void {
    const alpha = isHovered ? 0.3 : (canDive ? 0.1 : 0.05);
    const borderAlpha = canDive ? 1 : 0.3;

    if (isHovered) {
      display.drawRoundRect(bounds.x - 4, bounds.y - 4, bounds.width + 8, bounds.height + 8, LAYOUT.borderRadius + 2, {
        fill: buttonColor,
        alpha: 0.15
      });
    }

    display.drawRoundRect(bounds.x, bounds.y, bounds.width, bounds.height, LAYOUT.borderRadius, {
      fill: buttonColor,
      alpha: alpha
    });

    display.drawRoundRect(bounds.x, bounds.y, bounds.width, bounds.height, LAYOUT.borderRadius, {
      stroke: buttonColor,
      lineWidth: isHovered ? LAYOUT.borderWidthThick : LAYOUT.borderWidth,
      alpha: borderAlpha
    });

    const buttonText = `DIVE${selectedCount > 0 ? ` (${selectedCount})` : ''}`;
    display.drawText(buttonText, bounds.x + bounds.width / 2, bounds.y + bounds.height / 2, {
      font: FONTS.headingFont,
      fill: buttonColor,
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
}
