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

/** Selection ring horizontal radius in pixels (width/2) */
const SELECTION_RADIUS_X = 85;

/** Selection ring vertical radius in pixels (height/2) */
const SELECTION_RADIUS_Y = 50;

/** Selection ring line width */
const SELECTION_LINE_WIDTH = 3;

/** Selection ring alpha */
const SELECTION_ALPHA = 0.9;

/** Selection ring color */
const SELECTION_COLOR = '#ffffff';

/** Glow effect configuration */
const GLOW_LAYERS = 4;
const GLOW_MAX_RADIUS_X = 105;
const GLOW_MAX_RADIUS_Y = 70;
const GLOW_PULSE_SPEED = 0.002; // Radians per millisecond

/**
 * Sprite configuration for each rarity tier
 */
interface SpriteConfig {
  characterName: string;
  animationName: string;
}

/**
 * Mapping of rarity tiers to their sprite configurations
 * TODO: Add specific sprites for Rare, Epic, Legendary, and Jackpot tiers
 */
const RARITY_SPRITES: Record<RarityTier, SpriteConfig> = {
  [RarityTier.Common]: {
    characterName: 'derelictcommon_derelict_common_core',
    animationName: 'derelictcommon_idlerotation_default',
  },
  [RarityTier.Uncommon]: {
    characterName: 'Drone_Derelict_UnCommon_Core',
    animationName: 'information_drone_docking_default',
  },
  // Placeholder: using Common sprite
  [RarityTier.Rare]: {
    characterName: 'derelictcommon_derelict_common_core',
    animationName: 'derelictcommon_idlerotation_default',
  },
  // Placeholder: using Uncommon sprite
  [RarityTier.Epic]: {
    characterName: 'Drone_Derelict_UnCommon_Core',
    animationName: 'information_drone_docking_default',
  },
  // Placeholder: using Common sprite
  [RarityTier.Legendary]: {
    characterName: 'derelictcommon_derelict_common_core',
    animationName: 'derelictcommon_idlerotation_default',
  },
  // Placeholder: using Uncommon sprite
  [RarityTier.Jackpot]: {
    characterName: 'Drone_Derelict_UnCommon_Core',
    animationName: 'information_drone_docking_default',
  },
};

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

  /** Animation time for glow pulsing (milliseconds) */
  private animTime: number = 0;

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
    this.animTime += deltaTime;
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

    // Draw selection ring if selected (fixed screen-space size, not scaled)
    if (selected) {
      this.drawSelectionRing(display);
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
   * Initialize the character sprite based on rarity tier
   */
  private initCharacter(): void {
    try {
      const spriteConfig = RARITY_SPRITES[this.rarity];
      this.character = MakkoEngine.sprite(spriteConfig.characterName);

      if (this.character && this.character.isLoaded()) {
        this.character.play(spriteConfig.animationName, true);
        this.loaded = true;
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
   * Draw the selection ring with glowing effect (fixed screen-space oval shape)
   */
  private drawSelectionRing(display: IDisplay): void {
    // Pulse animation (0 to 1 cycle)
    const pulse = (Math.sin(this.animTime * GLOW_PULSE_SPEED) + 1) / 2; // 0.0 to 1.0
    
    // Draw multiple glow layers for a radiating effect (fixed size, not scaled)
    for (let i = 0; i < GLOW_LAYERS; i++) {
      const layerProgress = i / GLOW_LAYERS; // 0.0 to ~1.0
      const expandedProgress = (layerProgress + pulse * 0.3) % 1.0; // Animated expansion
      
      const radiusX = SELECTION_RADIUS_X + (GLOW_MAX_RADIUS_X - SELECTION_RADIUS_X) * expandedProgress;
      const radiusY = SELECTION_RADIUS_Y + (GLOW_MAX_RADIUS_Y - SELECTION_RADIUS_Y) * expandedProgress;
      const alpha = (1 - expandedProgress) * 0.5; // Fade out as it expands
      
      display.drawEllipse(this.x, this.y, radiusX, radiusY, {
        stroke: SELECTION_COLOR,
        lineWidth: SELECTION_LINE_WIDTH,
        alpha: alpha,
      });
    }
    
    // Draw main selection ring (solid, always visible)
    display.drawEllipse(this.x, this.y, SELECTION_RADIUS_X, SELECTION_RADIUS_Y, {
      stroke: SELECTION_COLOR,
      lineWidth: SELECTION_LINE_WIDTH + 1,
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

    const hitbox = this.character.getHitbox();
    
    // Calculate offset to center the hitbox at (this.x, this.y)
    // Hitbox defines bounds relative to anchor point
    // We need to move the anchor so the hitbox center lands at target
    let drawX = this.x;
    let drawY = this.y;
    
    if (hitbox) {
      // Hitbox center offset from anchor (in unscaled pixels)
      const hitboxCenterOffsetX = hitbox.x + hitbox.width / 2;
      const hitboxCenterOffsetY = hitbox.y + hitbox.height / 2;
      
      // Move draw position to compensate (opposite direction)
      drawX = this.x - hitboxCenterOffsetX * scale;
      drawY = this.y - hitboxCenterOffsetY * scale;
    }
    
    this.character.draw(display, drawX, drawY, {
      scale: scale,
      flipH: false,
      flipV: false,
      alpha: debug ? 0.7 : 1.0,
    });

    // Debug visualization
    if (debug) {
      // Target position (CYAN circle) - where we WANT the ship center
      display.drawCircle(this.x, this.y, 20, {
        stroke: '#00ffff',
        lineWidth: 3,
        alpha: 1.0
      });
      
      // Draw position (WHITE X) - where anchor was placed
      display.drawLine(drawX - 15, drawY - 15, drawX + 15, drawY + 15, {
        stroke: '#ffffff',
        lineWidth: 2
      });
      display.drawLine(drawX + 15, drawY - 15, drawX - 15, drawY + 15, {
        stroke: '#ffffff',
        lineWidth: 2
      });
      
      // If we have hitbox data, show where the sprite bounds actually are
      if (hitbox) {
        const scaledWidth = hitbox.width * scale;
        const scaledHeight = hitbox.height * scale;
        const boxX = drawX + hitbox.x * scale;
        const boxY = drawY + hitbox.y * scale;
        
        // Hitbox bounds (MAGENTA rectangle)
        display.drawRect(boxX, boxY, scaledWidth, scaledHeight, {
          stroke: '#ff00ff',
          lineWidth: 2,
          alpha: 0.8
        });
        
        // Hitbox center (RED dot)
        const hitboxCenterX = boxX + scaledWidth / 2;
        const hitboxCenterY = boxY + scaledHeight / 2;
        display.drawCircle(hitboxCenterX, hitboxCenterY, 8, {
          fill: '#ff0000',
          alpha: 1.0
        });
      }
    }
  }
}
