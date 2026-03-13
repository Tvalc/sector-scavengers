/**
 * Signal Log System
 *
 * 60fps scrolling ticker at bottom of screen broadcasting salvage network transmissions.
 * Format: "[Entity] + [Action] + [Impact]"
 *
 * Usage:
 *   const signalLog = new SignalLogSystem();
 *
 *   // In game loop:
 *   signalLog.update(dt);
 *   signalLog.render(display);
 */

import type { IDisplay } from '@makko/engine';
import type { DoctrineType } from '../types/state';

/**
 * Headline generators - salvage network transmissions
 */
const ENTITIES = [
  // Salvage crews and operators
  "Hull Rat crew",
  "Deep-void scavenger",
  "Solo salvager",
  "Derelict hunter",
  "Scrap merchant",
  // Corporations
  "Nexus Corp",
  "Helix Consortium",
  "Kessler Dynamic",
  "Vacton Industries",
  "Outer Rim Supply Co",
  // Ship types
  "Tramp freighter",
  "Survey vessel",
  "Ore barge",
  "Recovery drone swarm",
  "Cutter-class tug",
  // Frontier roles
  "Station master",
  "Claims registrar",
  "Hull technician",
  "Jump coordinator",
  "Void medic",
  // Mysterious entities
  "Ghost signal source",
  "Unknown contact",
  "Automated beacon",
  "Derelict AI",
  "Black box transmission"
];

const ACTIONS = [
  // Claims and discovery
  "stakes claim on",
  "locates",
  "discovers",
  "charts",
  "registers claim for",
  // Loss and danger
  "loses contact with",
  "declares emergency in",
  "reports hull breach in",
  "vanishes near",
  "broadcasts distress from",
  // Economics
  "auctions off",
  "purchases",
  "undercuts market on",
  "liquidates",
  "corners market on",
  // Corporate maneuvers
  "seizes",
  "annexes",
  "repossesses",
  "quarantines",
  "blacklists",
  // Operations
  "salvages",
  "recovers",
  "strips",
  "scuttles",
  "declares sovereign right to"
];

const IMPACTS = [
  // Valuables
  "47 kilotons refined ore",
  "intact jump core",
  "xenotech cache",
  "pre-Collapse nav data",
  "grade-A hull plating",
  // Locations
  "Sector 9",
  "the Kessler Belt",
  "derelict station Delta-7",
  "the Graveyard Belt",
  "ghost fleet at Vega Point",
  // Quantities
  "3000 units scrap metal",
  "entire cargo manifest",
  "three months supplies",
  "12 metric tons copper",
  "six cryo-stored crew",
  // Corporate assets
  "corporate mining rights",
  "exclusive salvage permit",
  "station docking privileges",
  "fuel depot reserves",
  "orbital refinery output",
  // Hazards
  "radioactive debris field",
  "unstable reactor core",
  "venting atmo in Node 4",
  "class-4 ion storm",
  "unknown biological hazard"
];

/**
 * Individual headline entry
 */
interface Headline {
  text: string;
  x: number;
  width: number;
}

/**
 * SignalLogSystem - scrolling headline ticker
 */
export class SignalLogSystem {
  // Doctrine milestone tracking
  private doctrineMilestonesAnnounced: Set<string> = new Set();
  // Display settings
  private static readonly TICKER_Y = 1020;
  private static readonly TICKER_HEIGHT = 60;
  private static readonly SCROLL_SPEED = 60; // pixels per second
  private static readonly BACKGROUND_COLOR = '#0a0e1a';
  private static readonly BACKGROUND_ALPHA = 0.8;
  private static readonly TEXT_COLOR = '#00f0ff';
  private static readonly FONT = '14px monospace';
  private static readonly HEADLINE_SPACING = 100; // pixels between headlines

  // Queue settings
  private static readonly MAX_HEADLINES = 10;
  private static readonly VISIBLE_HEADLINES = 5;
  private static readonly GENERATION_INTERVAL = 8000; // 8 seconds

  private headlines: Headline[] = [];
  private lastGenerationTime: number = 0;
  private displayWidth: number = 1920;
  private measureCanvas: HTMLCanvasElement;
  private measureCtx: CanvasRenderingContext2D;

  constructor() {
    // Create reusable canvas for text measurement
    this.measureCanvas = document.createElement('canvas');
    const ctx = this.measureCanvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to create 2D context for text measurement');
    }
    this.measureCtx = ctx;
    // Initialize with headlines
    for (let i = 0; i < SignalLogSystem.VISIBLE_HEADLINES + 2; i++) {
      this.generateAndAddHeadline();
    }
    this.lastGenerationTime = Date.now();
  }

  /**
   * Generate a random headline
   */
  generateHeadline(): string {
    const entity = ENTITIES[Math.floor(Math.random() * ENTITIES.length)];
    const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
    const impact = IMPACTS[Math.floor(Math.random() * IMPACTS.length)];

    return `⚡ ${entity} ${action} ${impact} ⚡`;
  }

  /**
   * Generate and add a new headline to the queue
   */
  private generateAndAddHeadline(): void {
    const text = this.generateHeadline();

    // Calculate width using reusable context
    this.measureCtx.font = SignalLogSystem.FONT;
    const width = this.measureCtx.measureText(text).width;

    // Position after last headline
    let startX = 0;
    if (this.headlines.length > 0) {
      const lastHeadline = this.headlines[this.headlines.length - 1];
      startX = lastHeadline.x + lastHeadline.width + SignalLogSystem.HEADLINE_SPACING;
    }

    this.headlines.push({
      text,
      x: startX,
      width
    });

    // Trim to max headlines
    while (this.headlines.length > SignalLogSystem.MAX_HEADLINES) {
      this.headlines.shift();
    }
  }

  /**
   * Update ticker state
   * @param dt - Delta time in milliseconds
   */
  update(dt: number): void {
    const dtSeconds = dt / 1000;

    // Scroll headlines
    const scrollAmount = SignalLogSystem.SCROLL_SPEED * dtSeconds;

    for (const headline of this.headlines) {
      headline.x -= scrollAmount;
    }

    // Remove headlines that have scrolled off screen
    this.headlines = this.headlines.filter(h => h.x + h.width > -100);

    // Rebase positions if needed to prevent float drift
    if (this.headlines.length > 0) {
      const firstHeadline = this.headlines[0];
      if (firstHeadline.x < -firstHeadline.width - SignalLogSystem.HEADLINE_SPACING) {
        // Shift all headlines so first starts at 0
        const shiftAmount = firstHeadline.x;
        for (const h of this.headlines) {
          h.x -= shiftAmount;
        }
      }
    }

    // Generate new headline on interval
    const now = Date.now();
    if (now - this.lastGenerationTime >= SignalLogSystem.GENERATION_INTERVAL) {
      this.generateAndAddHeadline();
      this.lastGenerationTime = now;
    }

    // Ensure we always have enough headlines
    while (this.headlines.length < SignalLogSystem.VISIBLE_HEADLINES + 2) {
      this.generateAndAddHeadline();
    }
  }

  /**
   * Render the signal log ticker
   * @param display - MakkoEngine display instance
   */
  render(display: IDisplay): void {
    const { width } = display;
    this.displayWidth = width;

    // Draw ticker background
    display.drawRect(
      0,
      SignalLogSystem.TICKER_Y,
      width,
      SignalLogSystem.TICKER_HEIGHT,
      {
        fill: SignalLogSystem.BACKGROUND_COLOR,
        alpha: SignalLogSystem.BACKGROUND_ALPHA
      }
    );

    // Draw top border line
    display.drawLine(
      0,
      SignalLogSystem.TICKER_Y,
      width,
      SignalLogSystem.TICKER_Y,
      {
        stroke: SignalLogSystem.TEXT_COLOR,
        lineWidth: 1,
        alpha: 0.5
      }
    );

    // Clip to ticker area
    display.pushClipRect(
      0,
      SignalLogSystem.TICKER_Y,
      width,
      SignalLogSystem.TICKER_HEIGHT
    );

    // Draw headlines
    const textY = SignalLogSystem.TICKER_Y + 35;

    for (const headline of this.headlines) {
      // Only render if potentially visible
      if (headline.x + headline.width > 0 && headline.x < width) {
        display.drawText(
          headline.text,
          headline.x,
          textY,
          {
            font: SignalLogSystem.FONT,
            fill: SignalLogSystem.TEXT_COLOR,
            baseline: 'middle'
          }
        );
      }
    }

    // Pop clip
    display.popClip();

    // Draw fade gradients on edges
    this.drawEdgeFades(display);
  }

  /**
   * Draw fade effects on left and right edges
   */
  private drawEdgeFades(display: IDisplay): void {
    const fadeWidth = 60;
    const y = SignalLogSystem.TICKER_Y;
    const h = SignalLogSystem.TICKER_HEIGHT;

    // Left fade (dark to transparent = into content)
    for (let i = 0; i < fadeWidth; i += 2) {
      const alpha = 0.8 * (1 - i / fadeWidth);
      display.drawRect(i, y, 2, h, {
        fill: SignalLogSystem.BACKGROUND_COLOR,
        alpha
      });
    }

    // Right fade
    for (let i = 0; i < fadeWidth; i += 2) {
      const alpha = 0.8 * (i / fadeWidth);
      display.drawRect(this.displayWidth - fadeWidth + i, y, 2, h, {
        fill: SignalLogSystem.BACKGROUND_COLOR,
        alpha
      });
    }
  }

  /**
   * Force generate a new headline immediately
   */
  addBreakingNews(text: string): void {
    // Calculate width using reusable context
    this.measureCtx.font = SignalLogSystem.FONT;
    const width = this.measureCtx.measureText(text).width;

    // Add to front of queue
    this.headlines.unshift({
      text: `⚠️ ${text} ⚠️`,
      x: 0,
      width
    });

    // Shift other headlines
    for (let i = 1; i < this.headlines.length; i++) {
      this.headlines[i].x += width + SignalLogSystem.HEADLINE_SPACING;
    }
  }

  /**
   * Clear all headlines
   */
  clear(): void {
    this.headlines = [];
    for (let i = 0; i < SignalLogSystem.VISIBLE_HEADLINES + 2; i++) {
      this.generateAndAddHeadline();
    }
  }
}

/**
 * Singleton instance for global access
 */
export const signalLogSystem = new SignalLogSystem();
