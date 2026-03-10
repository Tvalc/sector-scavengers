/**
 * Reusable Visual Components
 *
 * Polished visual components extracted from TutorialVisuals for consistent
 * visual quality throughout the game. Used in IdleScene and DepthDiveScene.
 *
 * Components:
 * - BatteryCoreDisplay: Segmented energy bar with glow effects
 * - NodeVisual: Hexagon nodes with level indicators and stability
 * - DangerMeter: Pulsing collapse risk indicator
 */

import type { IDisplay } from '@makko/engine';
import { COLORS, FONTS, LAYOUT } from './theme';

/**
 * BatteryCoreDisplay - Segmented battery bar with glow effects
 *
 * Used for energy display in IdleScene and DepthDiveScene header.
 * Shows 10 segments with glow effects and terminal cap.
 */
export class BatteryCoreDisplay {
  private x: number;
  private y: number;
  private width: number;
  private height: number;

  private static readonly SEGMENT_COUNT = 10;

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  /**
   * Render the battery bar
   * @param display - MakkoEngine display instance
   * @param current - Current energy value
   * @param max - Maximum energy value
   * @param label - Optional label text below bar
   */
  render(display: IDisplay, current: number, max: number, label?: string): void {
    const { x, y, width, height } = this;
    const segmentCount = BatteryCoreDisplay.SEGMENT_COUNT;

    // Calculate fill ratio
    const fillRatio = Math.max(0, Math.min(1, current / max));
    const isFull = fillRatio >= 1;

    // Battery terminal (right side nub)
    const terminalWidth = 10;
    const terminalHeight = height * 0.5;
    const terminalY = y + (height - terminalHeight) / 2;
    display.drawRect(x + width, terminalY, terminalWidth, terminalHeight, {
      stroke: COLORS.border,
      lineWidth: LAYOUT.borderWidth,
    });

    // Background bar with rounded corners
    display.drawRoundRect(x, y, width, height, LAYOUT.borderRadiusSmall, {
      fill: COLORS.panelBg,
      stroke: COLORS.border,
      lineWidth: LAYOUT.borderWidth,
    });

    // Energy segments
    const segmentGap = 4;
    const segmentWidth = (width - (segmentCount + 1) * segmentGap) / segmentCount;
    const filledSegments = Math.ceil(fillRatio * segmentCount);

    for (let i = 0; i < segmentCount; i++) {
      const segX = x + segmentGap + i * (segmentWidth + segmentGap);
      const segY = y + 4;
      const segHeight = height - 8;
      const isFilled = i < filledSegments;

      if (isFilled) {
        // Glow effect for filled segments
        display.drawRect(segX - 2, segY - 2, segmentWidth + 4, segHeight + 4, {
          fill: COLORS.neonCyan,
          alpha: 0.2,
        });

        // Filled segment
        display.drawRect(segX, segY, segmentWidth, segHeight, {
          fill: COLORS.neonCyan,
          alpha: 0.9,
        });
      } else {
        // Empty segment
        display.drawRect(segX, segY, segmentWidth, segHeight, {
          fill: COLORS.neutralGray,
          alpha: 0.3,
        });
      }
    }

    // Label below bar (if provided)
    const labelY = y + height + 25;
    if (label) {
      display.drawText(label, x + width / 2, labelY, {
        font: FONTS.smallFont,
        fill: COLORS.brightText,
        align: 'center',
      });
    }

    // Energy value display (centered in bar)
    const energyText = `${Math.floor(current)} / ${Math.floor(max)}`;
    display.drawText(energyText, x + width / 2, y + height / 2, {
      font: FONTS.bodyFont,
      fill: COLORS.white,
      align: 'center',
      baseline: 'middle',
    });

    // "READY TO DIVE" status when full
    if (isFull) {
      display.drawText('READY TO DIVE', x + width / 2, labelY + (label ? 22 : 0), {
        font: FONTS.smallFont,
        fill: COLORS.neonCyan,
        align: 'center',
      });
    }
  }
}

/**
 * NodeVisual render options
 */
export interface NodeVisualOptions {
  owner: 'player' | 'neutral';
  stability: number; // 0-100
  hovered: boolean;
  mini: boolean; // Simplified rendering for mini-map
}

/**
 * ShipVisual render options
 */
export interface ShipVisualOptions {
  owner: 'player' | 'neutral';
  hullIntegrity: number; // 0-100
  hovered: boolean;
  mini: boolean; // Simplified rendering for mini-map
}

/**
 * NodeVisual - Hexagon node with level indicators
 *
 * Used for main grid nodes and mini-map nodes in DepthDiveScene.
 * Supports player-owned (cyan glow) and neutral (gray) states.
 */
export class NodeVisual {
  protected x: number;
  protected y: number;
  protected radius: number;
  protected level: number; // 1-3

  constructor(x: number, y: number, radius: number, level: number) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.level = Math.max(1, Math.min(3, level));
  }

  /**
   * Generate hexagon points (flat-top orientation)
   */
  protected generateHexagonPoints(centerX: number, centerY: number, radius: number): Array<{ x: number; y: number }> {
    const points: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2;
      points.push({
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      });
    }
    return points;
  }

  /**
   * Render the node
   * @param display - MakkoEngine display instance
   * @param options - Render options (owner, stability, hovered, mini)
   */
  render(display: IDisplay, options: NodeVisualOptions): void {
    // Check if we're being called with ShipVisualOptions (has hullIntegrity instead of stability)
    const stability = 'hullIntegrity' in options ? (options as any).hullIntegrity : options.stability;
    const actualOptions: NodeVisualOptions = {
      owner: options.owner,
      stability: stability,
      hovered: options.hovered,
      mini: options.mini
    };
    this.renderNode(display, actualOptions);
  }

  /**
   * Internal render implementation
   */
  private renderNode(display: IDisplay, options: NodeVisualOptions): void {
    const { x, y, radius, level } = this;
    const { owner, stability, hovered, mini } = options;

    // Mini mode: simplified rendering
    if (mini) {
      this.renderMini(display, owner);
      return;
    }

    const isPlayerOwned = owner === 'player';
    const isDamaged = stability < 100;
    const baseColor = isPlayerOwned ? COLORS.neonCyan : COLORS.neutralGray;
    const glowAlpha = hovered ? 0.2 : 0.1;

    // Outer glow (player-owned only)
    if (isPlayerOwned) {
      const glowPoints = this.generateHexagonPoints(x, y, radius);
      display.drawPolygon(glowPoints, {
        fill: baseColor,
        alpha: glowAlpha,
      });
    }

    // Main hexagon
    const mainPoints = this.generateHexagonPoints(x, y, radius);
    display.drawPolygon(mainPoints, {
      stroke: baseColor,
      lineWidth: hovered ? 3 : 2,
    });

    // Inner hexagon (glow effect)
    const innerRadius = radius * 0.75;
    const innerPoints = this.generateHexagonPoints(x, y, innerRadius);
    display.drawPolygon(innerPoints, {
      stroke: baseColor,
      lineWidth: 1,
      alpha: 0.5,
    });

    // Level indicator dots (1-3)
    const dotRadius = 4;
    const dotSpacing = 12;
    const dotsStartX = x - ((level - 1) * dotSpacing) / 2;
    const dotsY = y + radius * 0.4;

    for (let i = 0; i < level; i++) {
      const dotX = dotsStartX + i * dotSpacing;
      display.drawCircle(dotX, dotsY, dotRadius, {
        fill: baseColor,
        alpha: 0.8,
      });
    }

    // Center dot
    display.drawCircle(x, y, 3, {
      fill: baseColor,
    });

    // Stability bar (damaged player nodes only)
    if (isPlayerOwned && isDamaged) {
      const barWidth = radius * 1.2;
      const barHeight = 6;
      const barX = x - barWidth / 2;
      const barY = y + radius + 15;

      // Background
      display.drawRect(barX, barY, barWidth, barHeight, {
        fill: COLORS.panelBg,
        stroke: COLORS.border,
        lineWidth: 1,
      });

      // Fill
      const fillWidth = barWidth * (stability / 100);
      const fillColor = stability > 50 ? COLORS.successGreen : stability > 25 ? COLORS.warningYellow : COLORS.warningRed;
      display.drawRect(barX, barY, fillWidth, barHeight, {
        fill: fillColor,
        alpha: 0.8,
      });
    }

    // Hover highlight
    if (hovered) {
      const hoverPoints = this.generateHexagonPoints(x, y, radius + 4);
      display.drawPolygon(hoverPoints, {
        stroke: COLORS.neonCyan,
        lineWidth: 2,
        alpha: 0.5,
      });
    }
  }

  /**
   * Simplified rendering for mini-map
   */
  private renderMini(display: IDisplay, owner: 'player' | 'neutral'): void {
    const { x, y, radius } = this;
    const baseColor = owner === 'player' ? COLORS.neonCyan : COLORS.neutralGray;

    // Simple hexagon fill
    const points = this.generateHexagonPoints(x, y, radius);
    display.drawPolygon(points, {
      fill: baseColor,
      alpha: owner === 'player' ? 0.6 : 0.3,
      stroke: baseColor,
      lineWidth: 1,
    });
  }
}

/**
 * ShipVisual - Alias for NodeVisual with ship-specific options
 * 
 * Accepts ShipVisualOptions (hullIntegrity) and converts to NodeVisualOptions (stability)
 */
export class ShipVisual extends NodeVisual {
  constructor(x: number, y: number, radius: number, level: number) {
    super(x, y, radius, level);
  }

  /**
   * Render the ship using ShipVisualOptions
   * Converts hullIntegrity to stability for base class
   */
  renderShip(display: IDisplay, options: ShipVisualOptions): void {
    // Convert ShipVisualOptions to NodeVisualOptions
    const nodeOptions: NodeVisualOptions = {
      owner: options.owner,
      stability: options.hullIntegrity,
      hovered: options.hovered,
      mini: options.mini
    };
    super.render(display, nodeOptions);
  }
}

/**
 * DangerMeter - Pulsing collapse risk indicator
 *
 * Used during Depth Dives to show collapse risk percentage.
 * Features pulsing red fill and highlighted danger threshold.
 */
export class DangerMeter {
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  private dangerThreshold: number;

  private pulseTime: number = 0;

  constructor(x: number, y: number, width: number, height: number, dangerThreshold: number = 35) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.dangerThreshold = dangerThreshold;
  }

  /**
   * Update pulse animation
   * @param dt - Delta time in milliseconds
   */
  update(dt: number): void {
    this.pulseTime += dt;
  }

  /**
   * Render the danger meter
   * @param display - MakkoEngine display instance
   * @param percent - Collapse risk percentage (0-100)
   */
  render(display: IDisplay, percent: number): void {
    const { x, y, width, height, dangerThreshold } = this;

    // Calculate pulse alpha (0.6-1.0 at ~2Hz)
    // 2Hz = 2 cycles per second
    const pulseAlpha = 0.8 + 0.2 * Math.sin(this.pulseTime * Math.PI * 0.004);

    // Background bar with rounded corners
    display.drawRoundRect(x, y, width, height, LAYOUT.borderRadiusSmall, {
      fill: COLORS.panelBg,
      stroke: COLORS.border,
      lineWidth: LAYOUT.borderWidth,
    });

    // Glow effect (behind filled portion)
    const fillWidth = width * (percent / 100);
    const glowPadding = 4;
    display.drawRect(x - glowPadding, y - glowPadding, fillWidth + glowPadding * 2, height + glowPadding * 2, {
      fill: COLORS.warningRed,
      alpha: (pulseAlpha - 0.6) * 0.4,
    });

    // Filled portion with pulse
    display.drawRoundRect(x, y, Math.max(LAYOUT.borderRadiusSmall, fillWidth), height, LAYOUT.borderRadiusSmall, {
      fill: COLORS.warningRed,
      alpha: pulseAlpha,
    });

    // Percentage marker lines (25, 50, 75, 100)
    const tickColor = 'rgba(255, 255, 255, 0.2)';
    for (let pct = 25; pct < 100; pct += 25) {
      const tickX = x + (width * pct) / 100;
      display.drawLine(tickX, y, tickX, y + height, {
        stroke: tickColor,
        lineWidth: 1,
      });
    }

    // Danger threshold line (highlighted)
    const dangerLineX = x + (width * dangerThreshold) / 100;
    display.drawLine(dangerLineX, y - 5, dangerLineX, y + height + 5, {
      stroke: COLORS.warningRed,
      lineWidth: 2,
      alpha: 0.8,
    });

    // Label
    display.drawText(`COLLAPSE RISK: ${Math.round(percent)}%`, x + width / 2, y + height + 25, {
      font: FONTS.labelFont,
      fill: COLORS.white,
      align: 'center',
    });
  }

  /**
   * Set danger threshold percentage
   */
  setDangerThreshold(threshold: number): void {
    this.dangerThreshold = Math.max(0, Math.min(100, threshold));
  }

  /**
   * Reset pulse animation
   */
  resetPulse(): void {
    this.pulseTime = 0;
  }
}
