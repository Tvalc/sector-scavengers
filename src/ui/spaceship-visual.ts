/**
 * SpaceshipVisual
 *
 * Visual component for rendering animated spaceship sprites with rarity-colored glows.
 * Used in the hub board to display populated cells.
 */

import { MakkoEngine, ICharacter, IDisplay } from '@makko/engine';
import { RarityTier, getTierColors } from '../prizes/prize-types';

// ============================================================================
// Types
// ============================================================================

/**
 * Render options for spaceship visualization
 */
export interface SpaceshipRenderOptions {
  /** Whether to show selection ring */
  selected?: boolean;
  /** Scale override (uses instance scale if not provided) */
  scale?: number;
}

/**
 * Rarity color configuration for glow effects
 */
interface RarityColorConfig {
  /** Glow color (CSS color string) */
  color: string;
  /** Glow alpha/transparency */
  alpha: number;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Rarity glow colors with tier-specific alphas
 * Higher rarities get more prominent glows
 */
export const RARITY_COLORS: Record<RarityTier, RarityColorConfig> = {
  [RarityTier.Common]: { color: '#888888', alpha: 0.15 },
  [RarityTier.Uncommon]: { color: '#1eff00', alpha: 0.25 },
  [RarityTier.Rare]: { color: '#0070dd', alpha: 0.35 },
  [RarityTier.Epic]: { color: '#a335ee', alpha: 0.45 },
  [RarityTier.Legendary]: { color: '#ff8000', alpha: 0.55 },
  [RarityTier.Jackpot]: { color: '#e6cc80', alpha: 0.65 },
};

/** Base glow circle radius in pixels */
const GLOW_RADIUS = 80;

/** Selection ring radius in pixels */
const SELECTION_RADIUS = 90;

/** Selection ring line width */
const SELECTION_LINE_WIDTH = 3;

/** Selection ring alpha */
const SELECTION_ALPHA = 0.9;

/** Selection ring color */
const SELECTION_COLOR = '#ffffff';

/** Sprite character name for spaceship */
const SPRITE_CHARACTER = 'derelictcommon_derelict_common_core';

/** Animation name for idle rotation */
const ANIMATION_NAME = 'derelictcommon_idlerotation_default';

// ============================================================================
// SpaceshipVisual Class
// ============================================================================

/**
 * Visual component for rendering an animated spaceship with rarity glow
 */
export class SpaceshipVisual {
  /** X position in screen coordinates */
  readonly x: number;

  /** Y position in screen coordinates */
  readonly y: number;

  /** Rarity tier for glow color */
  readonly rarity: RarityTier;

  /** Scale multiplier */
  readonly scale: number;

  /** Animated character instance */
  private character: ICharacter | null = null;

  /** Whether sprite was successfully loaded */
  private loaded: boolean = false;

  /**
   * Create a new spaceship visual
   * @param x Center X position
   * @param y Center Y position
   * @param rarity Rarity tier for glow color
   * @param scale Scale multiplier (default 1.0)
   */
  constructor(x: number, y: number, rarity: RarityTier, scale: number = 1.0) {
    this.x = x;
    this.y = y;
    this.rarity = rarity;
    this.scale = scale;

    // Initialize sprite
    this.initCharacter();
  }

  // ==========================================================================
  // Public Methods
  // ==========================================================================

  /**
   * Update animation state
   * @param deltaTime Time since last frame in milliseconds
   */
  update(deltaTime: number): void {
    if (this.character && this.loaded) {
      this.character.update(deltaTime);
    }
  }

  /**
   * Render the spaceship with glow and optional selection ring
   * @param display MakkoEngine display instance
   * @param options Render options
   */
  render(display: IDisplay, options?: SpaceshipRenderOptions): void {
    const scale = options?.scale ?? this.scale;
    const selected = options?.selected ?? false;

    // Draw rarity glow circle
    this.drawGlow(display, scale);

    // Draw selection ring if selected
    if (selected) {
      this.drawSelectionRing(display, scale);
    }

    // Draw spaceship sprite
    this.drawSprite(display, scale);
  }

  /**
   * Check if sprite is loaded and ready
   */
  isLoaded(): boolean {
    return this.loaded;
  }

  // ==========================================================================
  // Private Methods
  // ==========================================================================

  /**
   * Initialize the character sprite
   */
  private initCharacter(): void {
    try {
      this.character = MakkoEngine.sprite(SPRITE_CHARACTER);

      if (this.character && this.character.isLoaded()) {
        this.character.play(ANIMATION_NAME, true);
        this.loaded = true;
      } else {
        // Character not available yet
        this.character = null;
        this.loaded = false;
      }
    } catch {
      this.character = null;
      this.loaded = false;
    }
  }

  /**
   * Draw the rarity glow circle
   */
  private drawGlow(display: IDisplay, scale: number): void {
    const config = RARITY_COLORS[this.rarity];
    const radius = GLOW_RADIUS * scale;

    display.drawCircle(this.x, this.y, radius, {
      fill: config.color,
      alpha: config.alpha,
    });
  }

  /**
   * Draw the selection ring
   */
  private drawSelectionRing(display: IDisplay, scale: number): void {
    const radius = SELECTION_RADIUS * scale;

    display.drawCircle(this.x, this.y, radius, {
      stroke: SELECTION_COLOR,
      lineWidth: SELECTION_LINE_WIDTH,
      alpha: SELECTION_ALPHA,
    });
  }

  /**
   * Draw the spaceship sprite
   */
  private drawSprite(display: IDisplay, scale: number): void {
    if (!this.character || !this.loaded) {
      return;
    }

    this.character.draw(display, this.x, this.y, {
      scale: scale,
      flipH: false,
      flipV: false,
      alpha: 1.0,
    });
  }
}
