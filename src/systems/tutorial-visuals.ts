/**
 * Tutorial Visual Effects System
 *
 * Manages triggered visual overlays during tutorial dialogue:
 * - Danger meter (pulsing red bar with collapse risk)
 * - Node visualization (hexagon shape)
 * - Battery bar (full energy display)
 *
 * Usage:
 *   const visuals = new TutorialVisuals();
 *   visuals.showDangerMeter(35); // Show at 35%
 *   visuals.showNode();
 *   visuals.showBatteryFull();
 *   visuals.hideVisual();
 *   
 *   // In game loop:
 *   visuals.update(dt);
 *   visuals.render(display);
 */

import type { IDisplay } from '@makko/engine';

type VisualType = 'none' | 'danger_meter' | 'node' | 'battery';

/**
 * TutorialVisuals - manages tutorial visual overlays
 * Only one visual active at a time (new show hides previous)
 */
export class TutorialVisuals {
  private activeVisual: VisualType = 'none';
  private dangerPercent: number = 35;
  private pulseTime: number = 0;

  // Layout constants
  private static readonly DANGER_METER_WIDTH = 300;
  private static readonly DANGER_METER_HEIGHT = 30;
  private static readonly DANGER_METER_Y = 350;

  private static readonly NODE_RADIUS = 80;
  private static readonly NODE_Y = 400;

  private static readonly BATTERY_WIDTH = 400;
  private static readonly BATTERY_HEIGHT = 40;
  private static readonly BATTERY_Y = 380;

  // Colors
  private static readonly COLOR_DANGER = '#ff3344';
  private static readonly COLOR_DANGER_BG = '#1f2937';
  private static readonly COLOR_DANGER_BORDER = '#374151';
  private static readonly COLOR_CYAN = '#00f0ff';
  private static readonly COLOR_BACKGROUND = '#1f2937';
  private static readonly COLOR_BORDER = '#374151';
  private static readonly COLOR_TEXT = '#ffffff';

  /**
   * Show danger meter with specified percentage
   * @param percent - Collapse risk percentage (default: 35)
   */
  showDangerMeter(percent?: number): void {
    this.activeVisual = 'danger_meter';
    this.dangerPercent = percent ?? 35;
    this.pulseTime = 0;
  }

  /**
   * Show node visualization (hexagon)
   */
  showNode(): void {
    this.activeVisual = 'node';
  }

  /**
   * Show full battery bar
   */
  showBatteryFull(): void {
    this.activeVisual = 'battery';
  }

  /**
   * Hide all active visuals
   */
  hideVisual(): void {
    this.activeVisual = 'none';
  }

  /**
   * Update animations (pulse effects)
   * @param dt - Delta time in milliseconds
   */
  update(dt: number): void {
    if (this.activeVisual === 'danger_meter') {
      this.pulseTime += dt;
    }
  }

  /**
   * Render active overlay centered on screen
   * @param display - MakkoEngine display instance
   */
  render(display: IDisplay): void {
    switch (this.activeVisual) {
      case 'danger_meter':
        this.renderDangerMeter(display);
        break;
      case 'node':
        this.renderNode(display);
        break;
      case 'battery':
        this.renderBattery(display);
        break;
      case 'none':
      default:
        // No visual active
        break;
    }
  }

  /**
   * Check if any visual is currently active
   */
  isVisualActive(): boolean {
    return this.activeVisual !== 'none';
  }

  /**
   * Get current visual type
   */
  getActiveVisual(): VisualType {
    return this.activeVisual;
  }

  // ============================================================================
  // Private: Danger Meter
  // ============================================================================

  private renderDangerMeter(display: IDisplay): void {
    const centerX = display.width / 2;
    const y = TutorialVisuals.DANGER_METER_Y;
    const width = TutorialVisuals.DANGER_METER_WIDTH;
    const height = TutorialVisuals.DANGER_METER_HEIGHT;
    const barX = centerX - width / 2;

    // Calculate pulse alpha (0.6-1.0 at ~2Hz)
    // 2Hz = 2 cycles per second = 4π radians per second
    // For ms: ω = 4π / 1000 rad/ms
    const pulseAlpha = 0.8 + 0.2 * Math.sin(this.pulseTime * Math.PI * 0.004);

    // Background bar
    display.drawRect(barX, y, width, height, {
      fill: TutorialVisuals.COLOR_DANGER_BG,
      stroke: TutorialVisuals.COLOR_DANGER_BORDER,
      lineWidth: 2
    });

    // Glow effect (behind filled portion)
    const fillWidth = width * (this.dangerPercent / 100);
    const glowPadding = 4;
    display.drawRect(
      barX - glowPadding,
      y - glowPadding,
      fillWidth + glowPadding * 2,
      height + glowPadding * 2,
      {
        fill: TutorialVisuals.COLOR_DANGER,
        alpha: (pulseAlpha - 0.6) * 0.4
      }
    );

    // Filled portion with pulse
    display.drawRect(barX, y, fillWidth, height, {
      fill: TutorialVisuals.COLOR_DANGER,
      alpha: pulseAlpha
    });

    // Percentage marker lines
    const tickColor = '#ffffff44';
    for (let pct = 25; pct < 100; pct += 25) {
      const tickX = barX + (width * pct / 100);
      display.drawLine(tickX, y, tickX, y + height, {
        stroke: tickColor,
        lineWidth: 1
      });
    }

    // 35% danger line (highlighted)
    const dangerLineX = barX + (width * 0.35);
    display.drawLine(dangerLineX, y - 5, dangerLineX, y + height + 5, {
      stroke: TutorialVisuals.COLOR_DANGER,
      lineWidth: 2
    });

    // Label
    display.drawText(
      `COLLAPSE RISK: ${this.dangerPercent}%`,
      centerX,
      y + height + 30,
      {
        font: 'bold 20px system-ui, -apple-system, sans-serif',
        fill: TutorialVisuals.COLOR_TEXT,
        align: 'center'
      }
    );
  }

  // ============================================================================
  // Private: Node Visualization
  // ============================================================================

  private renderNode(display: IDisplay): void {
    const centerX = display.width / 2;
    const y = TutorialVisuals.NODE_Y;
    const radius = TutorialVisuals.NODE_RADIUS;

    // Generate hexagon points (flat-top orientation)
    const points: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2;
      points.push({
        x: centerX + radius * Math.cos(angle),
        y: y + radius * Math.sin(angle)
      });
    }

    // Inner glow
    const innerRadius = radius * 0.9;
    const innerPoints: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2;
      innerPoints.push({
        x: centerX + innerRadius * Math.cos(angle),
        y: y + innerRadius * Math.sin(angle)
      });
    }

    // Outer glow
    display.drawPolygon(points, {
      fill: TutorialVisuals.COLOR_CYAN,
      alpha: 0.1
    });

    // Main hexagon border
    display.drawPolygon(points, {
      stroke: TutorialVisuals.COLOR_CYAN,
      lineWidth: 3
    });

    // Inner hexagon
    display.drawPolygon(innerPoints, {
      stroke: TutorialVisuals.COLOR_CYAN,
      lineWidth: 1,
      alpha: 0.5
    });

    // Center dot
    display.drawCircle(centerX, y, 4, {
      fill: TutorialVisuals.COLOR_CYAN
    });

    // Label
    display.drawText('DATA RELAY NODE', centerX, y + radius + 40, {
      font: 'bold 18px system-ui, -apple-system, sans-serif',
      fill: TutorialVisuals.COLOR_TEXT,
      align: 'center'
    });

    // Sub-label
    display.drawText('Rig Level 1 • Passive Income Generator', centerX, y + radius + 65, {
      font: '14px system-ui, -apple-system, sans-serif',
      fill: '#9ca3af',
      align: 'center'
    });
  }

  // ============================================================================
  // Private: Battery Bar
  // ============================================================================

  private renderBattery(display: IDisplay): void {
    const centerX = display.width / 2;
    const y = TutorialVisuals.BATTERY_Y;
    const width = TutorialVisuals.BATTERY_WIDTH;
    const height = TutorialVisuals.BATTERY_HEIGHT;
    const barX = centerX - width / 2;

    // Battery terminal (right side nub)
    const terminalWidth = 10;
    const terminalHeight = height * 0.5;
    const terminalY = y + (height - terminalHeight) / 2;
    display.drawRect(
      barX + width,
      terminalY,
      terminalWidth,
      terminalHeight,
      {
        stroke: TutorialVisuals.COLOR_BORDER,
        lineWidth: 2
      }
    );

    // Background bar
    display.drawRect(barX, y, width, height, {
      fill: TutorialVisuals.COLOR_BACKGROUND,
      stroke: TutorialVisuals.COLOR_BORDER,
      lineWidth: 2
    });

    // Energy segments (visual detail)
    const segmentCount = 10;
    const segmentGap = 4;
    const segmentWidth = (width - (segmentCount + 1) * segmentGap) / segmentCount;
    
    for (let i = 0; i < segmentCount; i++) {
      const segX = barX + segmentGap + i * (segmentWidth + segmentGap);
      const segY = y + 4;
      const segHeight = height - 8;

      // Glow
      display.drawRect(segX - 2, segY - 2, segmentWidth + 4, segHeight + 4, {
        fill: TutorialVisuals.COLOR_CYAN,
        alpha: 0.2
      });

      // Segment
      display.drawRect(segX, segY, segmentWidth, segHeight, {
        fill: TutorialVisuals.COLOR_CYAN,
        alpha: 0.9
      });
    }

    // Label
    display.drawText(
      'BATTERY CORE: 1,000 / 1,000',
      centerX,
      y + height + 30,
      {
        font: 'bold 20px system-ui, -apple-system, sans-serif',
        fill: TutorialVisuals.COLOR_TEXT,
        align: 'center'
      }
    );

    // Sub-label
    display.drawText('READY TO DIVE', centerX, y + height + 55, {
      font: '14px system-ui, -apple-system, sans-serif',
      fill: TutorialVisuals.COLOR_CYAN,
      align: 'center'
    });
  }
}

/**
 * Singleton instance for global access
 */
export const tutorialVisuals = new TutorialVisuals();
