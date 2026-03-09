/**
 * Asset Map System
 *
 * Organizes and provides access to all game sprites and static assets.
 * Includes procedural fallback rendering for missing sprites,
 * ready for Makko Art Studio injection.
 *
 * Usage:
 *   import { assetMap } from './assets/asset-map';
 *   
 *   await assetMap.load();
 *   const character = assetMap.getCharacter('scavenger');
 *   
 *   // Render with fallback
 *   assetMap.renderCharacter(display, 'scavenger', x, y, 'idle', { scale: 2 });
 */

import { MakkoEngine } from '@makko/engine';

/**
 * Display interface for rendering
 */
export interface IDisplay {
  width: number;
  height: number;
  drawCircle(x: number, y: number, radius: number, style?: { fill?: string; stroke?: string; lineWidth?: number; alpha?: number }): void;
  drawEllipse(x: number, y: number, radiusX: number, radiusY: number, style?: { fill?: string; stroke?: string; lineWidth?: number; alpha?: number }): void;
  drawLine(x1: number, y1: number, x2: number, y2: number, style?: { stroke?: string; lineWidth?: number; alpha?: number }): void;
  drawPolygon(points: Array<{ x: number; y: number }>, style?: { fill?: string; stroke?: string; lineWidth?: number; alpha?: number }): void;
  drawText(text: string, x: number, y: number, style?: { font?: string; fill?: string; align?: 'left' | 'center' | 'right'; baseline?: 'top' | 'middle' | 'bottom' | 'alphabetic'; alpha?: number }): void;
  drawRect(x: number, y: number, width: number, height: number, style?: { fill?: string; stroke?: string; lineWidth?: number; alpha?: number }): void;
  drawImage(image: HTMLImageElement, x: number, y: number, width?: number, height?: number, style?: { scale?: number; flipH?: boolean; flipV?: boolean; rotation?: number; alpha?: number }): void;
}

/**
 * Character interface from MakkoEngine
 */
export interface ICharacter {
  characterName: string;
  play(animation: string, loop?: boolean, frameOffset?: number, options?: { speed?: number }): unknown;
  update(deltaTime: number): void;
  draw(display: IDisplay, x: number, y: number, options?: { scale?: number; flipH?: boolean; flipV?: boolean; alpha?: number; debug?: boolean }): void;
  getCurrentAnimation(): string | null;
  isLoaded(): boolean;
}

/**
 * Static asset interface
 */
export interface IStaticAsset {
  image: HTMLImageElement;
  width: number;
  height: number;
  name: string;
}

/**
 * Asset categories
 */
export type AssetCategory = 'scavenger' | 'viralist' | 'alu' | 'max' | 'node';

/**
 * Animation states for scavenger
 */
export type ScavengerAnimation = 'idle' | 'celebrate' | 'cooked';

/**
 * Node levels
 */
export type NodeLevel = 1 | 2 | 3;

/**
 * Character asset info
 */
interface CharacterAsset {
  name: string;
  category: AssetCategory;
  loaded: boolean;
}

/**
 * Draw options for fallback rendering
 */
interface FallbackOptions {
  scale?: number;
  flipH?: boolean;
  alpha?: number;
  animation?: string;
}

/**
 * AssetMap - manages game sprites and provides fallback rendering
 */
export class AssetMap {
  private loaded: boolean = false;
  private characters: Map<string, CharacterAsset> = new Map();
  private pulseTime: number = 0;

  // Character names from manifest (or expected)
  private static readonly CHARACTER_NAMES = {
    scavenger: 'scavenger',
    viralist: 'viralist',
    alu: 'alu',
    max: 'max',
    node_level1: 'node_level1',
    node_level2: 'node_level2',
    node_level3: 'node_level3'
  };

  // Fallback colors
  private static readonly COLORS = {
    cyan: '#00f0ff',
    magenta: '#ff00aa',
    red: '#ff3344',
    gray: '#333344',
    white: '#ffffff'
  };

  /**
   * Load assets from manifest
   */
  async load(): Promise<void> {
    console.log('[AssetMap] Loading assets...');

    // Register expected characters
    this.registerCharacter('scavenger', 'scavenger');
    this.registerCharacter('viralist', 'viralist');
    this.registerCharacter('alu', 'alu');
    this.registerCharacter('max', 'max');
    this.registerCharacter('node_level1', 'node');
    this.registerCharacter('node_level2', 'node');
    this.registerCharacter('node_level3', 'node');

    // Check which characters are actually loaded
    const loadedNames = MakkoEngine.getLoadedCharacters();
    for (const [key, asset] of this.characters) {
      asset.loaded = loadedNames.includes(asset.name);
    }

    this.loaded = true;
    console.log('[AssetMap] Assets loaded');
  }

  /**
   * Register a character asset
   */
  private registerCharacter(key: string, category: AssetCategory): void {
    this.characters.set(key, {
      name: key,
      category,
      loaded: false
    });
  }

  /**
   * Get a character by name
   * Returns null if not loaded
   */
  getCharacter(name: string): ICharacter | null {
    if (!MakkoEngine.isCharacterLoaded(name)) {
      return null;
    }
    return MakkoEngine.sprite(name) as unknown as ICharacter;
  }

  /**
   * Get a static asset by name
   */
  getStaticAsset(name: string): IStaticAsset | null {
    if (!MakkoEngine.hasStaticAsset(name)) {
      return null;
    }
    return MakkoEngine.staticAsset(name) as unknown as IStaticAsset;
  }

  /**
   * Check if a character is loaded
   */
  isCharacterLoaded(name: string): boolean {
    return MakkoEngine.isCharacterLoaded(name);
  }

  /**
   * Update animation state (call each frame)
   */
  update(dt: number): void {
    this.pulseTime += dt;
  }

  /**
   * Render a character with fallback
   */
  renderCharacter(
    display: IDisplay,
    name: string,
    x: number,
    y: number,
    animation?: string,
    options?: FallbackOptions
  ): void {
    const { scale = 1, flipH = false, alpha = 1 } = options || {};

    // Try to render actual sprite
    if (this.isCharacterLoaded(name)) {
      const character = this.getCharacter(name);
      if (character) {
        // Play animation if specified
        if (animation && character.getCurrentAnimation() !== animation) {
          character.play(animation, true);
        }
        
        character.update(16); // Approximate dt
        character.draw(display, x, y, { scale, flipH, alpha });
        return;
      }
    }

    // Render procedural fallback
    this.renderFallback(display, name, x, y, animation, options);
  }

  /**
   * Render procedural fallback for missing sprites
   */
  private renderFallback(
    display: IDisplay,
    name: string,
    x: number,
    y: number,
    animation?: string,
    options?: FallbackOptions
  ): void {
    const { scale = 1, alpha = 1 } = options || {};

    // Determine asset type and render appropriate fallback
    if (name === 'scavenger') {
      this.renderScavengerFallback(display, x, y, animation as ScavengerAnimation, scale, alpha);
    } else if (name === 'viralist' || name === 'alu' || name === 'max') {
      this.renderAluFallback(display, x, y, scale, alpha);
    } else if (name.startsWith('node_level')) {
      const level = parseInt(name.replace('node_level', '')) as NodeLevel;
      this.renderNodeFallback(display, x, y, level, scale, alpha);
    } else {
      // Generic fallback: simple circle
      display.drawCircle(x, y, 30 * scale, {
        fill: AssetMap.COLORS.gray,
        alpha
      });
    }
  }

  /**
   * Render scavenger fallback
   */
  private renderScavengerFallback(
    display: IDisplay,
    x: number,
    y: number,
    animation: ScavengerAnimation = 'idle',
    scale: number,
    alpha: number
  ): void {
    const radius = 30 * scale;

    switch (animation) {
      case 'celebrate':
        // Pulsing cyan circle
        const pulse = Math.sin(this.pulseTime * 0.01) * 0.3 + 0.7;
        display.drawCircle(x, y, radius * (1 + pulse * 0.2), {
          fill: AssetMap.COLORS.cyan,
          alpha: alpha * pulse
        });
        // Glow effect
        display.drawCircle(x, y, radius * 1.5, {
          fill: AssetMap.COLORS.cyan,
          alpha: alpha * 0.2
        });
        break;

      case 'cooked':
        // Red X mark
        const size = radius * 0.7;
        display.drawCircle(x, y, radius, {
          fill: '#220000',
          alpha
        });
        display.drawLine(x - size, y - size, x + size, y + size, {
          stroke: AssetMap.COLORS.red,
          lineWidth: 4 * scale,
          alpha
        });
        display.drawLine(x + size, y - size, x - size, y + size, {
          stroke: AssetMap.COLORS.red,
          lineWidth: 4 * scale,
          alpha
        });
        break;

      case 'idle':
      default:
        // Simple cyan circle
        display.drawCircle(x, y, radius, {
          fill: AssetMap.COLORS.cyan,
          alpha
        });
        // Inner detail
        display.drawCircle(x, y, radius * 0.5, {
          fill: AssetMap.COLORS.white,
          alpha: alpha * 0.5
        });
        break;
    }
  }

  /**
   * Render A.L.U. fallback (sci-fi floating head with holographic glow)
   */
  private renderAluFallback(
    display: IDisplay,
    x: number,
    y: number,
    scale: number,
    alpha: number
  ): void {
    const radius = 45 * scale;
    const pulse = Math.sin(this.pulseTime * 0.003) * 0.15 + 0.85;

    // Outer holographic glow rings
    for (let i = 3; i >= 0; i--) {
      const ringRadius = radius * (1.3 + i * 0.15);
      const ringAlpha = (0.08 - i * 0.02) * pulse;
      display.drawCircle(x, y, ringRadius, {
        fill: '#00ffcc',
        alpha: alpha * ringAlpha
      });
    }

    // Main head (smooth oval)
    display.drawEllipse(x, y, radius, radius * 1.2, {
      fill: '#1a3a4a',
      alpha: alpha * 0.9
    });

    // Face plate (inner oval)
    display.drawEllipse(x, y - radius * 0.1, radius * 0.75, radius * 0.9, {
      fill: '#0d1f28',
      alpha: alpha
    });

    // Eyes (glowing horizontal bars)
    const eyeY = y - radius * 0.2;
    const eyeWidth = radius * 0.35;
    const eyeHeight = 4 * scale;

    // Left eye glow
    display.drawRect(x - radius * 0.35 - eyeWidth / 2, eyeY - eyeHeight / 2, eyeWidth, eyeHeight, {
      fill: '#00ffcc',
      alpha: alpha * pulse
    });

    // Right eye glow
    display.drawRect(x + radius * 0.35 - eyeWidth / 2, eyeY - eyeHeight / 2, eyeWidth, eyeHeight, {
      fill: '#00ffcc',
      alpha: alpha * pulse
    });

    // Speech indicator light (pulsing)
    const indicatorPulse = Math.sin(this.pulseTime * 0.008) * 0.5 + 0.5;
    display.drawCircle(x, y + radius * 0.5, 6 * scale, {
      fill: '#00ffcc',
      alpha: alpha * indicatorPulse
    });

    // Holographic scan lines
    for (let i = 0; i < 5; i++) {
      const scanY = y - radius * 0.8 + (i * radius * 0.4);
      const scanAlpha = (0.1 + Math.sin(this.pulseTime * 0.005 + i) * 0.05);
      display.drawLine(x - radius * 0.6, scanY, x + radius * 0.6, scanY, {
        stroke: '#00ffcc',
        lineWidth: 1,
        alpha: alpha * scanAlpha
      });
    }
  }

  /**
   * Render node fallback (hexagon based on level)
   */
  private renderNodeFallback(
    display: IDisplay,
    x: number,
    y: number,
    level: NodeLevel,
    scale: number,
    alpha: number
  ): void {
    // Size based on level
    const sizes = { 1: 60, 2: 80, 3: 100 };
    const radius = (sizes[level] || 60) * scale * 0.5;

    // Draw hexagon
    const hexPoints: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2;
      hexPoints.push({
        x: x + Math.cos(angle) * radius,
        y: y + Math.sin(angle) * radius
      });
    }

    // Level-based color intensity
    const intensity = 0.3 + (level * 0.2);

    display.drawPolygon(hexPoints, {
      fill: AssetMap.COLORS.gray,
      alpha: alpha * intensity
    });

    // Border based on level
    display.drawPolygon(hexPoints, {
      stroke: AssetMap.COLORS.cyan,
      lineWidth: level * 2,
      alpha
    });

    // Level indicator dots
    for (let i = 0; i < level; i++) {
      const dotY = y + radius * 0.5 - (i * 15 * scale);
      display.drawCircle(x, dotY, 5 * scale, {
        fill: AssetMap.COLORS.cyan,
        alpha
      });
    }
  }

  /**
   * Render node by level (convenience method)
   */
  renderNode(
    display: IDisplay,
    x: number,
    y: number,
    level: NodeLevel,
    options?: FallbackOptions
  ): void {
    const name = `node_level${level}`;
    this.renderCharacter(display, name, x, y, undefined, options);
  }

  /**
   * Check if all assets are loaded
   */
  isFullyLoaded(): boolean {
    return this.loaded;
  }

  /**
   * Get list of missing assets
   */
  getMissingAssets(): string[] {
    const missing: string[] = [];
    for (const [key, asset] of this.characters) {
      if (!asset.loaded) {
        missing.push(key);
      }
    }
    return missing;
  }
}

/**
 * Singleton instance
 */
export const assetMap = new AssetMap();
