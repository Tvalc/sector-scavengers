/**
 * Portrait Manager
 *
 * Manages visual novel style character portraits with positions.
 * Supports both static assets and animated characters.
 *
 * Standard VN Layout:
 *   +------------------------------------------+
 *   |                                          |
 *   |   [Portrait]              [Portrait]     |  <- Portraits render here
 *   |      Left                   Right        |     (above dialogue box)
 *   |                                          |
 *   +------------------------------------------+
 *   | Speaker: "Dialogue text..."              |  <- Dialogue box area
 *   +------------------------------------------+     (bottomOffset reserves this)
 *
 * Usage:
 *   // Basic setup
 *   const portraits = new PortraitManager(1920, 1080);
 *
 *   // With configuration (recommended for VN layout)
 *   const portraits = new PortraitManager(1920, 1080, {
 *     portraitWidth: 400,      // Portrait box width
 *     portraitHeight: 500,     // Portrait box height
 *     bottomOffset: 200,       // Reserve space for dialogue box
 *   });
 *
 *   // Show static portrait (uses asset name directly)
 *   portraits.show('alice_happy', 'left');
 *   portraits.show('snake_head', 'right');
 *
 *   // Show with scale mode (default is FIT)
 *   portraits.show('wide_portrait', 'center', { scaleMode: PortraitScaleMode.ZOOM_Y });
 *
 *   // Show animated character (character name + animation name)
 *   portraits.show('benenet_core', 'center', { animation: 'benenet_idle_default' });
 *
 *   // Change animation on existing portrait
 *   portraits.setAnimation('benenet_core', 'benenet_flirt_default');
 *
 *   // Highlight active speaker
 *   portraits.setActive('alice_happy');
 *
 *   // In game loop (render order matters!):
 *   backgrounds.render();   // Back
 *   portraits.render();     // Middle
 *   dialogue.render();      // Front (on top)
 *
 * Scale Modes:
 *   - FIT: Scale to fit entirely within box (may have letterboxing)
 *   - ZOOM_X: Scale until width fills box, crops top/bottom overflow
 *   - ZOOM_Y: Scale until height fills box, crops left/right overflow
 */

import { MakkoEngine } from '@makko/engine';

/**
 * Portrait positions on screen
 */
export enum PortraitPosition {
  FAR_LEFT = 'far-left',
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right',
  FAR_RIGHT = 'far-right',
}

/**
 * Portrait scaling modes
 * - FIT: Scale to fit entirely within box (may have letterboxing)
 * - ZOOM_X: Scale until width fills box, crop top/bottom overflow
 * - ZOOM_Y: Scale until height fills box, crop left/right overflow
 */
export enum PortraitScaleMode {
  FIT = 'fit',
  ZOOM_X = 'zoom-x',
  ZOOM_Y = 'zoom-y',
}

/**
 * Portrait configuration for positioning
 */
interface PositionConfig {
  x: number; // X position (0-1 of screen width)
  scale: number; // Scale factor
}

const POSITION_CONFIGS: Record<PortraitPosition, PositionConfig> = {
  [PortraitPosition.FAR_LEFT]: { x: 0.1, scale: 0.8 },
  [PortraitPosition.LEFT]: { x: 0.25, scale: 1.0 },
  [PortraitPosition.CENTER]: { x: 0.5, scale: 1.0 },
  [PortraitPosition.RIGHT]: { x: 0.75, scale: 1.0 },
  [PortraitPosition.FAR_RIGHT]: { x: 0.9, scale: 0.8 },
};

/**
 * Options for showing a portrait
 */
export interface ShowOptions {
  /** Animation name - if provided, asset is treated as character name */
  animation?: string;
  /** Animation to play when portrait is active (speaking) */
  activeAnimation?: string;
  /** Animation to play when portrait is inactive (not speaking) */
  inactiveAnimation?: string;
  /** Scaling mode for the portrait image (default: FIT) */
  scaleMode?: PortraitScaleMode;
}

/**
 * Character portrait state
 */
export interface CharacterPortrait {
  /** Asset key (static asset name or character name for animations) */
  id: string;
  position: PortraitPosition;
  /** Animation name if animated, undefined for static */
  animation?: string;
  /** Animation to play when portrait is active (speaking) */
  activeAnimation?: string;
  /** Animation to play when portrait is inactive (not speaking) */
  inactiveAnimation?: string;
  /** Sprite instance for animations */
  sprite?: ReturnType<typeof MakkoEngine.sprite>;
  /** Scaling mode for the portrait image */
  scaleMode: PortraitScaleMode;
  visible: boolean;
  isActive: boolean;
  alpha: number;
  targetAlpha: number;
  x: number;
  targetX: number;
  scale: number;
}

/**
 * Configuration options for PortraitManager
 */
export interface PortraitManagerOptions {
  /** Portrait box width in pixels (default: 300) */
  portraitWidth?: number;
  /** Portrait box height in pixels (default: 400) */
  portraitHeight?: number;
  /** Space reserved at bottom for dialogue box (default: 0) */
  bottomOffset?: number;
  /** Fade animation speed in alpha per second (default: 5) */
  fadeSpeed?: number;
  /** Slide animation speed in pixels per second (default: 500) */
  slideSpeed?: number;
  /** Alpha for active/speaking portrait (default: 1.0) */
  activeAlpha?: number;
  /** Alpha for inactive portraits (default: 0.5) */
  inactiveAlpha?: number;
}

/**
 * PortraitManager - manages multiple character portraits
 */
export class PortraitManager {
  private portraits: Map<string, CharacterPortrait> = new Map();
  private screenWidth: number;
  private screenHeight: number;

  // Portrait dimensions
  private portraitWidth: number;
  private portraitHeight: number;
  private bottomOffset: number;

  // Animation settings
  private fadeSpeed: number;
  private slideSpeed: number;

  // Dimming
  private activeAlpha: number;
  private inactiveAlpha: number;

  constructor(screenWidth: number, screenHeight: number, options: PortraitManagerOptions = {}) {
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;

    // Apply options with defaults
    this.portraitWidth = options.portraitWidth ?? 300;
    this.portraitHeight = options.portraitHeight ?? 400;
    this.bottomOffset = options.bottomOffset ?? 0;
    this.fadeSpeed = options.fadeSpeed ?? 5;
    this.slideSpeed = options.slideSpeed ?? 500;
    this.activeAlpha = options.activeAlpha ?? 1.0;
    this.inactiveAlpha = options.inactiveAlpha ?? 0.5;
  }

  /**
   * Show a portrait at a position
   * @param asset - Static asset name OR character name (if animation provided)
   * @param position - Screen position
   * @param options - Optional animation name for animated characters
   */
  show(
    asset: string,
    position: PortraitPosition | string,
    options?: ShowOptions
  ): void {
    const pos = position as PortraitPosition;
    const config = POSITION_CONFIGS[pos] || POSITION_CONFIGS[PortraitPosition.CENTER];

    // Hide any other portrait at this position (allows asset swapping)
    for (const [key, portrait] of this.portraits) {
      if (key !== asset && portrait.position === pos && portrait.visible) {
        portrait.targetAlpha = 0;
        portrait.visible = false;
      }
    }

    const existing = this.portraits.get(asset);
    if (existing) {
      // Update existing portrait
      existing.position = pos;
      existing.targetX = this.screenWidth * config.x - this.portraitWidth / 2;
      existing.scale = config.scale;
      existing.visible = true;
      existing.targetAlpha = existing.isActive ? this.activeAlpha : this.inactiveAlpha;

      // Update scale mode if provided
      if (options?.scaleMode) {
        existing.scaleMode = options.scaleMode;
      }

      // Update animation if changed
      if (options?.animation && existing.animation !== options.animation) {
        existing.animation = options.animation;
        if (existing.sprite) {
          existing.sprite.play(options.animation, true);
        }
      }

      // Update active/inactive animations if provided
      if (options?.activeAnimation) existing.activeAnimation = options.activeAnimation;
      if (options?.inactiveAnimation) existing.inactiveAnimation = options.inactiveAnimation;
    } else {
      // Create new portrait
      const x = this.screenWidth * config.x - this.portraitWidth / 2;

      // Create sprite if animated or has active/inactive animations
      const hasAnimations = options?.animation || options?.activeAnimation || options?.inactiveAnimation;
      let sprite: ReturnType<typeof MakkoEngine.sprite> | undefined;
      
      if (hasAnimations) {
        sprite = MakkoEngine.sprite(asset) ?? undefined;
        // Start with inactive animation if available, otherwise use provided animation
        const initialAnim = options?.inactiveAnimation || options?.animation;
        if (initialAnim && sprite) {
          sprite.play(initialAnim, true);
        }
      }

      this.portraits.set(asset, {
        id: asset,
        position: pos,
        animation: options?.animation,
        activeAnimation: options?.activeAnimation,
        inactiveAnimation: options?.inactiveAnimation,
        sprite,
        scaleMode: options?.scaleMode ?? PortraitScaleMode.FIT,
        visible: true,
        isActive: false,
        alpha: 0,
        targetAlpha: this.inactiveAlpha,
        x,
        targetX: x,
        scale: config.scale,
      });
    }
  }

  /**
   * Hide a portrait
   */
  hide(asset: string): void {
    const portrait = this.portraits.get(asset);
    if (portrait) {
      portrait.targetAlpha = 0;
      portrait.visible = false;
    }
  }

  /**
   * Hide all characters
   */
  hideAll(): void {
    for (const portrait of this.portraits.values()) {
      portrait.targetAlpha = 0;
      portrait.visible = false;
    }
  }

  /**
   * Set which portrait is currently active (speaking)
   * Other portraits will be dimmed and switch to inactive animations
   */
  setActive(asset: string | null): void {
    for (const portrait of this.portraits.values()) {
      const wasActive = portrait.isActive;
      portrait.isActive = portrait.id === asset;
      
      if (portrait.visible) {
        portrait.targetAlpha = portrait.isActive ? this.activeAlpha : this.inactiveAlpha;
      }

      // Switch animation based on active state
      if (portrait.sprite && wasActive !== portrait.isActive) {
        if (portrait.isActive && portrait.activeAnimation) {
          portrait.sprite.play(portrait.activeAnimation, true);
        } else if (!portrait.isActive && portrait.inactiveAnimation) {
          portrait.sprite.play(portrait.inactiveAnimation, true);
        }
      }
    }
  }

  /**
   * Set active portrait, swapping expression if asset doesn't exist
   * Use this for the 'active' command which may need to change expressions
   */
  setActiveOrSwap(asset: string | null): void {
    if (!asset) {
      this.setActive(null);
      return;
    }
    
    if (this.portraits.has(asset)) {
      // Asset exists - just highlight
      this.setActive(asset);
      return;
    }

    // Asset doesn't exist - find active visible portrait and swap
    const active = Array.from(this.portraits.values()).find(
      (p) => p.isActive && p.visible
    );

    if (active) {
      // Fade out current active portrait
      const position = active.position;
      active.targetAlpha = 0;
      active.visible = false;

      // Show new portrait at same position
      this.show(asset, position);
    }

    // Set new portrait as active
    this.setActive(asset);
  }

  /**
   * Change animation for an animated portrait
   */
  setAnimation(asset: string, animation: string): void {
    const portrait = this.portraits.get(asset);
    if (portrait && portrait.sprite) {
      portrait.animation = animation;
      portrait.sprite.play(animation, true);
    }
  }

  /**
   * Move a portrait to a new position
   */
  moveTo(asset: string, position: PortraitPosition): void {
    const portrait = this.portraits.get(asset);
    if (!portrait) return;

    const config = POSITION_CONFIGS[position];
    portrait.position = position;
    portrait.targetX = this.screenWidth * config.x - this.portraitWidth / 2;
    portrait.scale = config.scale;
  }

  /**
   * Update portrait animations
   */
  update(dt: number): void {
    const dtSec = dt / 1000;

    for (const portrait of this.portraits.values()) {
      // Update sprite animation if animated
      if (portrait.sprite) {
        portrait.sprite.update(dt);
      }

      // Fade animation
      if (portrait.alpha !== portrait.targetAlpha) {
        const diff = portrait.targetAlpha - portrait.alpha;
        const delta = Math.sign(diff) * this.fadeSpeed * dtSec;

        if (Math.abs(delta) >= Math.abs(diff)) {
          portrait.alpha = portrait.targetAlpha;
        } else {
          portrait.alpha += delta;
        }
      }

      // Slide animation
      if (portrait.x !== portrait.targetX) {
        const diff = portrait.targetX - portrait.x;
        const delta = Math.sign(diff) * this.slideSpeed * dtSec;

        if (Math.abs(delta) >= Math.abs(diff)) {
          portrait.x = portrait.targetX;
        } else {
          portrait.x += delta;
        }
      }

      // Remove fully faded portraits
      if (!portrait.visible && portrait.alpha <= 0) {
        this.portraits.delete(portrait.id);
      }
    }
  }

  /**
   * Render all portraits
   */
  render(): void {
    // Sort by position for proper layering (center on top)
    const sortedPortraits = Array.from(this.portraits.values())
      .filter((p) => p.visible && p.alpha > 0)
      .sort((a, b) => {
        // Center portraits render on top
        const aOrder = this.getPositionOrder(a.position);
        const bOrder = this.getPositionOrder(b.position);
        return aOrder - bOrder;
      });

    for (const portrait of sortedPortraits) {
      this.renderPortrait(portrait);
    }
  }

  private getPositionOrder(position: PortraitPosition): number {
    const orders: Record<PortraitPosition, number> = {
      [PortraitPosition.FAR_LEFT]: 0,
      [PortraitPosition.FAR_RIGHT]: 0,
      [PortraitPosition.LEFT]: 1,
      [PortraitPosition.RIGHT]: 1,
      [PortraitPosition.CENTER]: 2,
    };
    return orders[position] ?? 1;
  }

  /**
   * Calculate scale factor based on scale mode
   */
  private calculateScale(
    imageWidth: number,
    imageHeight: number,
    boxWidth: number,
    boxHeight: number,
    mode: PortraitScaleMode
  ): number {
    const scaleX = boxWidth / imageWidth;
    const scaleY = boxHeight / imageHeight;

    switch (mode) {
      case PortraitScaleMode.ZOOM_X:
        // Scale until width fills box (may crop top/bottom)
        return scaleX;
      case PortraitScaleMode.ZOOM_Y:
        // Scale until height fills box (may crop left/right)
        return scaleY;
      case PortraitScaleMode.FIT:
      default:
        // Scale to fit entirely within box (may have letterboxing)
        return Math.min(scaleX, scaleY);
    }
  }

  private renderPortrait(portrait: CharacterPortrait): void {
    const display = MakkoEngine.display;
    const alpha = portrait.isActive ? portrait.alpha : portrait.alpha * 0.6;

    // Calculate portrait box dimensions (scaled by position)
    const boxWidth = this.portraitWidth * portrait.scale;
    const boxHeight = this.portraitHeight * portrait.scale;
    const boxY = this.screenHeight - boxHeight - this.bottomOffset;

    // Set up clipping for zoom modes that may overflow
    const needsClip = portrait.scaleMode !== PortraitScaleMode.FIT;
    if (needsClip) {
      display.pushClipRect(portrait.x, boxY, boxWidth, boxHeight);
    }

    // Animated portrait - use sprite
    if (portrait.sprite) {
      const frameSize = portrait.sprite.getCurrentFrameSize();
      if (frameSize) {
        const scale = this.calculateScale(
          frameSize.width,
          frameSize.height,
          boxWidth,
          boxHeight,
          portrait.scaleMode
        );

        const width = frameSize.width * scale;
        const height = frameSize.height * scale;

        // Center within box
        const x = portrait.x + (boxWidth - width) / 2;
        const y = boxY + (boxHeight - height) / 2;

        portrait.sprite.draw(display, x, y, {
          scale,
          alpha,
        });

        if (needsClip) display.popClip();
        return;
      }
    }

    // Static portrait - scale and center based on mode
    const asset = MakkoEngine.staticAsset(portrait.id);
    if (asset) {
      const scale = this.calculateScale(
        asset.width,
        asset.height,
        boxWidth,
        boxHeight,
        portrait.scaleMode
      );

      const width = asset.width * scale;
      const height = asset.height * scale;

      // Center within box
      const x = portrait.x + (boxWidth - width) / 2;
      const y = boxY + (boxHeight - height) / 2;

      display.drawImage(
        asset.image,
        x,
        y,
        width,
        height,
        { alpha }
      );

      if (needsClip) display.popClip();
      return;
    }

    // Placeholder: fill box when asset not loaded (border already drawn above)
    if (needsClip) display.popClip();
    display.drawRect(portrait.x, boxY, boxWidth, boxHeight, {
      fill: portrait.isActive ? '#3a5a8a' : '#2a3a5a',
      alpha: portrait.alpha,
    });

    display.drawText(
      portrait.id,
      portrait.x + boxWidth / 2,
      boxY + 20,
      {
        fill: '#ffffff',
        font: '14px monospace',
        align: 'center',
        alpha: portrait.alpha,
      }
    );

    if (portrait.animation) {
      display.drawText(
        `[${portrait.animation}]`,
        portrait.x + boxWidth / 2,
        boxY + boxHeight / 2,
        {
          fill: '#aaaaaa',
          font: '12px monospace',
          align: 'center',
          alpha: portrait.alpha,
        }
      );
    }
  }

  /**
   * Get a portrait by asset key
   */
  getPortrait(asset: string): CharacterPortrait | undefined {
    return this.portraits.get(asset);
  }

  /**
   * Check if a portrait is visible
   */
  isVisible(asset: string): boolean {
    const portrait = this.portraits.get(asset);
    return portrait?.visible ?? false;
  }

  /**
   * Clear all portraits
   */
  clear(): void {
    this.portraits.clear();
  }
}
