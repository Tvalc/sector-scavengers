/**
 * Background Renderer
 *
 * Handles the spacefield and starfield background rendering with
 * infinite horizontal scrolling.
 */

import { MakkoEngine, IDisplay, StaticAsset } from '@makko/engine';
import { SPACEFIELD_SCROLL_SPEED, STAR_COUNT, STAR_SEED } from './constants';

/** Star definition for procedural starfield */
interface Star {
  x: number;
  y: number;
  radius: number;
  color: string;
  alpha: number;
}

/**
 * BackgroundRenderer handles scrolling spacefield and star rendering
 */
export class BackgroundRenderer {
  private spacefieldAsset: StaticAsset | null = null;
  private spacefieldScrollOffset: number = 0;
  private starPositions: Star[] = [];

  constructor() {
    this.generateStarPositions();
  }

  /** Load assets (call from scene init/enter) */
  loadAssets(): void {
    if (MakkoEngine.hasStaticAsset('spacefield')) {
      this.spacefieldAsset = MakkoEngine.staticAsset('spacefield');
    }
  }

  /** Generate star positions using seeded random for consistency */
  private generateStarPositions(): void {
    this.starPositions = [];
    let seed = STAR_SEED;
    
    const random = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    for (let i = 0; i < STAR_COUNT; i++) {
      const isCyan = random() < 0.2;
      this.starPositions.push({
        x: random() * 1920,
        y: random() * 1080,
        radius: 1 + random() * 2,
        color: isCyan ? '#00f0ff' : '#ffffff',
        alpha: 0.3 + random() * 0.3,
      });
    }
  }

  /** Update scroll offset */
  update(dt: number): void {
    this.spacefieldScrollOffset += dt * SPACEFIELD_SCROLL_SPEED;
  }

  /** Render background layers */
  render(display: IDisplay): void {
    this.renderBaseFill(display);
    this.renderSpacefield(display);
    this.renderStars(display);
  }

  /** Render solid base fill to ensure full canvas coverage */
  public renderBaseFill(display: IDisplay): void {
    // Use explicit 1920x1080 dimensions to ensure full coverage
    // This guarantees the entire logical canvas is filled
    display.drawRect(0, 0, 1920, 1080, { fill: '#0a0e1a' });
  }

  /** Render scrolling spacefield */
  public renderSpacefield(display: IDisplay): void {
    // Lazy load if needed
    if (!this.spacefieldAsset && MakkoEngine.hasStaticAsset('spacefield')) {
      this.spacefieldAsset = MakkoEngine.staticAsset('spacefield');
    }
    
    if (!this.spacefieldAsset) return;

    const assetWidth = this.spacefieldAsset.width;
    const scrollX = this.spacefieldScrollOffset % assetWidth;
    const scaleX = display.width / assetWidth;
    const drawWidth = assetWidth * scaleX;

    // Two copies for seamless infinite scroll
    display.drawImage(this.spacefieldAsset.image, -scrollX * scaleX, 0, drawWidth, display.height);
    display.drawImage(this.spacefieldAsset.image, -scrollX * scaleX + drawWidth, 0, drawWidth, display.height);
  }

  /** Render procedural starfield */
  public renderStars(display: IDisplay): void {
    for (const star of this.starPositions) {
      display.drawCircle(star.x, star.y, star.radius, {
        fill: star.color,
        alpha: star.alpha,
      });
    }
  }
}
