/**
 * Doctrine Panel Rendering
 *
 * Doctrine badge and progress display.
 */

import { IDisplay } from '@makko/engine';
import { COLORS, FONTS, LAYOUT } from '../../../ui/theme';
import type { DoctrineType } from '../../../types/state';

/** Doctrine display colors */
const DOCTRINE_COLORS: Record<DoctrineType, string> = {
  corporate: '#4a90e2',
  cooperative: '#00ff88',
  smuggler: '#ff00ff'
};

const DOCTRINE_LABELS: Record<DoctrineType, string> = {
  corporate: 'CORPORATE MODEL',
  cooperative: 'COOPERATIVE MODEL',
  smuggler: 'SMUGGLER MODEL'
};

/**
 * Renders doctrine badge and progress
 */
export class DoctrinePanel {
  /** Render doctrine badge (when locked in) */
  renderBadge(display: IDisplay, doctrine: DoctrineType | null): void {
    if (!doctrine) return;

    const badgeX = 30;
    const badgeY = 455;
    const badgeWidth = 220;
    const badgeHeight = 30;
    const color = DOCTRINE_COLORS[doctrine];

    display.drawRoundRect(badgeX, badgeY, badgeWidth, badgeHeight, LAYOUT.borderRadius, {
      fill: color,
      alpha: 0.2
    });
    display.drawRoundRect(badgeX, badgeY, badgeWidth, badgeHeight, LAYOUT.borderRadius, {
      stroke: color,
      lineWidth: LAYOUT.borderWidth,
      alpha: 0.8
    });

    display.drawText(DOCTRINE_LABELS[doctrine], badgeX + LAYOUT.padding, badgeY + 20, {
      font: FONTS.smallFont,
      fill: color
    });
  }

  /** Render doctrine progress panel (when not locked) */
  renderProgress(
    display: IDisplay,
    doctrinePoints: { corporate: number; cooperative: number; smuggler: number },
    doctrine: DoctrineType | null
  ): void {
    if (doctrine) return;

    const panelX = 30;
    const panelY = 455;
    const panelWidth = 220;
    const panelHeight = 85;

    this.renderPanelBackground(display, panelX, panelY, panelWidth, panelHeight);

    display.drawText('DOCTRINAL ALIGNMENT', panelX + LAYOUT.padding, panelY + 15, {
      font: FONTS.tinyFont,
      fill: COLORS.dimText
    });

    this.renderDoctrineBars(display, panelX + 10, panelY + 32, doctrinePoints);
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

  /** Render doctrine progress bars */
  private renderDoctrineBars(
    display: IDisplay,
    barStartX: number,
    barStartY: number,
    doctrinePoints: { corporate: number; cooperative: number; smuggler: number }
  ): void {
    const barWidth = 140;
    const barHeight = 16;
    const barSpacing = 22;

    const doctrines: Array<{ type: DoctrineType; color: string; points: number }> = [
      { type: 'corporate', color: DOCTRINE_COLORS.corporate, points: doctrinePoints.corporate },
      { type: 'cooperative', color: DOCTRINE_COLORS.cooperative, points: doctrinePoints.cooperative },
      { type: 'smuggler', color: DOCTRINE_COLORS.smuggler, points: doctrinePoints.smuggler }
    ];

    const maxPoints = Math.max(...doctrines.map(d => d.points));

    let barY = barStartY;
    for (const d of doctrines) {
      this.renderDoctrineBar(display, barStartX, barY, barWidth, barHeight, d, maxPoints);
      barY += barSpacing;
    }
  }

  /** Render single doctrine bar */
  private renderDoctrineBar(
    display: IDisplay,
    x: number,
    y: number,
    width: number,
    height: number,
    doctrine: { type: DoctrineType; color: string; points: number },
    maxPoints: number
  ): void {
    display.drawRoundRect(x, y, width, height, 4, {
      fill: COLORS.neutralGray,
      alpha: 0.3
    });

    const progress = Math.min(doctrine.points / 10, 1);
    const fillWidth = width * progress;
    const isLeading = doctrine.points === maxPoints && doctrine.points > 0;

    if (fillWidth > 0) {
      display.drawRoundRect(x, y, Math.max(fillWidth, 8), height, 4, {
        fill: doctrine.color,
        alpha: isLeading ? 0.8 : 0.4
      });
    }

    display.drawText(doctrine.type.charAt(0).toUpperCase() + doctrine.type.slice(1), x + width + 5, y + height / 2, {
      font: FONTS.tinyFont,
      fill: isLeading ? doctrine.color : COLORS.dimText,
      baseline: 'middle'
    });

    display.drawText(`${doctrine.points}/10`, x + width - 5, y + height / 2, {
      font: FONTS.tinyFont,
      fill: COLORS.white,
      align: 'right',
      baseline: 'middle'
    });
  }
}
