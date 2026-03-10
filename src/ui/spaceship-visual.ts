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
  /** Show debug visualization (anchor, hitbox) */
  debug?: boolean;
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
    const debug = options?.debug ?? false;

    // Draw selection ring if selected
    if (selected) {
      this.drawSelectionRing(display, scale);
    }

    // Draw spaceship sprite
    this.drawSprite(display, scale, debug);
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
        
        // Debug: Log character info
        console.log('[SpaceshipVisual] Character loaded:', SPRITE_CHARACTER);
        console.log('[SpaceshipVisual] Target position:', this.x, this.y);
        const hitbox = this.character.getHitbox();
        if (hitbox) {
          console.log('[SpaceshipVisual] Hitbox:', JSON.stringify(hitbox));
        }
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
  private drawSprite(display: IDisplay, scale: number, debug: boolean = false): void {
    if (!this.character || !this.loaded) {
      return;
    }

    // Get hitbox to calculate proper centering
    const hitbox = this.character.getHitbox();
    
    if (hitbox) {
      // Calculate the offset needed to center the sprite's visual on our target position
      // hitbox.x/y are the offset from anchor to top-left of bounding box
      // We want the CENTER of the hitbox to be at (this.x, this.y)
      const centerX = this.x - (hitbox.x + hitbox.width / 2) * scale;
      const centerY = this.y - (hitbox.y + hitbox.height / 2) * scale;
      
      this.character.draw(display, centerX, centerY, {
        scale: scale,
        flipH: false,
        flipV: false,
        alpha: debug ? 0.7 : 1.0,  // Slightly transparent in debug mode
      });

      if (debug) {
        // Draw where we're ACTUALLY drawing the character - WHITE X
        display.drawLine(centerX - 15, centerY - 15, centerX + 15, centerY + 15, {
          stroke: '#ffffff',
          lineWidth: 3
        });
        display.drawLine(centerX + 15, centerY - 15, centerX - 15, centerY + 15, {
          stroke: '#ffffff',
          lineWidth: 3
        });
        
        // Draw target position (node center) - CYAN circle
        display.drawCircle(this.x, this.y, 20, {
          stroke: '#00ffff',
          lineWidth: 3,
          alpha: 1.0
        });
        
        // Draw hitbox at the adjusted position - YELLOW
        const hbX = centerX + hitbox.x * scale;
        const hbY = centerY + hitbox.y * scale;
        const hbW = hitbox.width * scale;
        const hbH = hitbox.height * scale;
        
        display.drawRect(hbX, hbY, hbW, hbH, {
          stroke: '#ffff00',
          lineWidth: 2,
          alpha: 0.8
        });
        
        // Draw hitbox center - GREEN (should overlap with CYAN target)
        const hbCenterX = hbX + hbW / 2;
        const hbCenterY = hbY + hbH / 2;
        display.drawCircle(hbCenterX, hbCenterY, 6, {
          fill: '#00ff00',
          alpha: 1.0
        });
        
        // Text label showing position info
        display.drawText(`Target:(${Math.round(this.x)},${Math.round(this.y)}) Draw:(${Math.round(centerX)},${Math.round(centerY)})`, 
          this.x, this.y + 50, {
          font: '12px monospace',
          fill: '#ffffff',
          align: 'center'
        });
      }
    } else {
      // No hitbox, just draw at target
      this.character.draw(display, this.x, this.y, {
        scale: scale,
        flipH: false,
        flipV: false,
        alpha: 1.0,
      });
    }
  }
}
