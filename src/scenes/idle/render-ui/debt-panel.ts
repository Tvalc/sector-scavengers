/**
 * Debt Panel Rendering
 *
 * Debt display with progress bar and contextual warnings.
 */

import { IDisplay } from '@makko/engine';
import { COLORS, FONTS, LAYOUT } from '../../../ui/theme';

/**
 * Renders the debt panel with progress bar
 */
export class DebtPanel {
  /** Render debt panel with contextual warnings */
  render(display: IDisplay, debt: number, debtCeiling: number): void {
    const panelX = 30;
    const panelY = 180;
    const panelWidth = 220;
    const panelHeight = 60;
    const barHeight = 8;
    const barY = panelY + 38;

    const percentage = debt / debtCeiling;
    const barWidth = panelWidth - LAYOUT.padding * 2;

    this.renderPanelBackground(display, panelX, panelY, panelWidth, panelHeight);
    this.renderLabels(display, panelX, panelY, panelWidth, debt);
    this.renderProgressBar(display, panelX, barY, barWidth, barHeight, percentage);
  }

  /** Render panel background */
  private renderPanelBackground(display: IDisplay, x: number, y: number, w: number, h: number): void {
    display.drawRoundRect(x, y, w, h, LAYOUT.borderRadius, {
      fill: COLORS.panelBg,
      alpha: 0.9
    });
    display.drawRoundRect(x, y, w, h, LAYOUT.borderRadius, {
      stroke: COLORS.border,
      lineWidth: LAYOUT.borderWidth,
      alpha: 0.5
    });
  }

  /** Render labels */
  private renderLabels(display: IDisplay, panelX: number, panelY: number, panelWidth: number, debt: number): void {
    display.drawText('DEBT', panelX + LAYOUT.padding, panelY + 20, {
      font: FONTS.tinyFont,
      fill: COLORS.dimText
    });

    const formattedDebt = this.formatDebt(debt);
    display.drawText(formattedDebt, panelX + panelWidth - LAYOUT.padding, panelY + 20, {
      font: FONTS.smallFont,
      fill: COLORS.white,
      align: 'right'
    });
  }

  /** Render progress bar with warning states */
  private renderProgressBar(
    display: IDisplay,
    barX: number,
    barY: number,
    barWidth: number,
    barHeight: number,
    percentage: number
  ): void {
    // Background
    display.drawRoundRect(barX, barY, barWidth, barHeight, LAYOUT.borderRadiusSmall, {
      fill: COLORS.neutralGray,
      alpha: 0.5
    });

    // Determine color and message based on percentage
    let barColor: string = COLORS.successGreen;
    let message = '';

    if (percentage > 0.9) {
      barColor = COLORS.warningRed;
      message = 'Expansion restricted.';
    } else if (percentage > 0.7) {
      barColor = COLORS.warningYellow;
      message = 'Credit strain detected.';
    }

    // Fill
    const fillWidth = Math.max(4, barWidth * Math.min(1, percentage));
    display.drawRoundRect(barX, barY, fillWidth, barHeight, LAYOUT.borderRadiusSmall, {
      fill: barColor,
      alpha: 0.8
    });

    // Warning message if applicable
    if (message) {
      display.drawText(message, barX, barY + 17, {
        font: FONTS.tinyFont,
        fill: barColor
      });
    }
  }

  /** Format debt number for display */
  private formatDebt(debt: number): string {
    if (debt >= 1000000) {
      return `${(debt / 1000000).toFixed(1)}M`;
    } else if (debt >= 1000) {
      return `${(debt / 1000).toFixed(0)}K`;
    }
    return `${debt}`;
  }
}
