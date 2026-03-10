/**
 * SpaceshipVisual
 *
 * Visual component for rendering animated spaceship sprites.
 * Used in the hub board to display populated cells.
 */

import { MakkoEngine, ICharacter, IDisplay } from '@makko/engine';
import { RarityTier } from '../prizes/prize-types';

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
  /** Show debug visualization */
  debug?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

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
 * Visual component for rendering an animated spaceship
 */
export class SpaceshipVisual {
  /** X position in game coordinates (where we want the ship centered) */
  readonly x: number;

  /** Y position in game coordinates (where we want the ship centered) */
  readonly y: number;

  /** Rarity tier */
  readonly rarity: RarityTier;

  /** Scale multiplier */
  readonly scale: number;

  /** Animated character instance */
  private character: ICharacter | null = null;

  /** Whether sprite was successfully loaded */
  private loaded: boolean = false;

  /**
   * Create a new spaceship visual
   * @param x Center X position (where ship should appear)
   * @param y Center Y position (where ship should appear)
   * @param rarity Rarity tier
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
   * Render the spaceship with optional selection ring
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
        
        // Debug: Log character info once
        const hitbox = this.character.getHitbox();
        if (hitbox) {
          console.log(`[SpaceshipVisual] Hitbox for ${SPRITE_CHARACTER}:`, hitbox);
        }
      } else {
        this.character = null;
        this.loaded = false;
      }
    } catch {
      this.character = null;
      this.loaded = false;
    }
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
   * Draw the spaceship sprite centered on target position
   */
  private drawSprite(display: IDisplay, scale: number, debug: boolean): void {
    if (!this.character || !this.loaded) {
      return;
    }

    // Get the current frame size to center properly
    const frameSize = this.character.getCurrentFrameSize();
    
    // The character draws from its anchor point
    // For this sprite, we want to center it on (this.x, this.y)
    // So we need to offset by half the frame size
    const drawX = this.x - frameSize.width * scale / 2;
    const drawY = this.y - frameSize.height * scale / 2;

    // Draw the sprite
    this.character.draw(display, drawX, drawY, {
      scale: scale,
      flipH: false,
      flipV: false,
      alpha: debug ? 0.7 : 1.0,
    });

    // Debug visualization
    if (debug) {
      // Target position (CYAN circle) - where we WANT the ship
      display.drawCircle(this.x, this.y, 20, {
        stroke: '#00ffff',
        lineWidth: 3,
        alpha: 1.0
      });
      
      // Draw position (WHITE X) - where we're drawing the anchor
      display.drawLine(drawX - 15, drawY - 15, drawX + 15, drawY + 15, {
        stroke: '#ffffff',
        lineWidth: 2
      });
      display.drawLine(drawX + 15, drawY - 15, drawX - 15, drawY + 15, {
        stroke: '#ffffff',
        lineWidth: 2
      });
      
      // Frame bounds (YELLOW rectangle)
      display.drawRect(drawX, drawY, frameSize.width * scale, frameSize.height * scale, {
        stroke: '#ffff00',
        lineWidth: 2,
        alpha: 0.8
      });
      
      // Frame center (GREEN dot) - should overlap with CYAN target
      const frameCenterX = drawX + (frameSize.width * scale) / 2;
      const frameCenterY = drawY + (frameSize.height * scale) / 2;
      display.drawCircle(frameCenterX, frameCenterY, 6, {
        fill: '#00ff00',
        alpha: 1.0
      });
    }
  }
}
