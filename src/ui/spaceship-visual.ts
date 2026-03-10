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
  /** Vertical offset in pixels (negative = up) */
  yOffset?: number;
  /** Horizontal offset in pixels (negative = left) */
  xOffset?: number;
}

// ============================================================================
// Per-Tier Sprite Options
// ============================================================================

/** Common tier options (50/50 random selection) */
const COMMON_OPTIONS: SpriteConfig[] = [
  {
    characterName: 'derelictcommon_derelict_common_core',
    animationName: 'derelictcommon_idlerotation_default',
  },
  {
    characterName: 'derelictcommon2_derelict_common_core2',
    animationName: 'derelictcommon2_idle_default',
    yOffset: -45,
  },
];

/** Uncommon tier options (50/50 random selection) */
const UNCOMMON_OPTIONS: SpriteConfig[] = [
  {
    characterName: 'information_drone_derelict_uncommon_core',
    animationName: 'information_drone_docking_default',
    yOffset: -65,
  },
  {
    characterName: 'derelictuncommon2_derelict_uncommon_core2',
    animationName: 'derelictuncommon2_idle_default',
    yOffset: -50,
    xOffset: -10,
  },
];

/** Rare tier options (50/50 random selection) */
const RARE_OPTIONS: SpriteConfig[] = [
  {
    characterName: 'derelict_military_fighter_rare_militaryfighterrare',
    animationName: 'derelict_military_fighter_rare_idle_default',
    yOffset: -40,
  },
  {
    characterName: 'derelict_shipping_freighter_rare_rarefrieghtercore',
    animationName: 'derelict_shipping_freighter_rare_idle_default',
    yOffset: -40,
  },
];

/** Epic tier (single option) */
const EPIC_OPTION: SpriteConfig = {
  characterName: 'derelict_military_fighter_epic_militaryfighterepic',
  animationName: 'derelict_military_fighter_epic_idle_default',
  yOffset: -55,
};

/** Legendary tier (single option) */
const LEGENDARY_OPTION: SpriteConfig = {
  characterName: 'derelictrare3_derelictstationlegendary',
  animationName: 'derelictrare3_idle_default',
  yOffset: -75,
};

/**
 * Resolve sprite configuration for a given rarity tier.
 * For tiers with multiple options, randomly selects one with 50/50 probability.
 */
function resolveSpriteConfig(rarity: RarityTier): SpriteConfig {
  switch (rarity) {
    case RarityTier.Common:
      return COMMON_OPTIONS[Math.random() < 0.5 ? 0 : 1];
    case RarityTier.Uncommon:
      return UNCOMMON_OPTIONS[Math.random() < 0.5 ? 0 : 1];
    case RarityTier.Rare:
      return RARE_OPTIONS[Math.random() < 0.5 ? 0 : 1];
    case RarityTier.Epic:
      return EPIC_OPTION;
    case RarityTier.Legendary:
      return LEGENDARY_OPTION;
    case RarityTier.Jackpot:
      // Placeholder: uses Legendary sprite
      return LEGENDARY_OPTION;
  }
}

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

  /** Sprite configuration for this instance */
  private spriteConfig: SpriteConfig | null = null;

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
      this.spriteConfig = resolveSpriteConfig(this.rarity);
      this.character = MakkoEngine.sprite(this.spriteConfig.characterName);

      if (this.character && this.character.isLoaded()) {
        this.character.play(this.spriteConfig.animationName, true);
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
    
    // Apply per-sprite offsets
    const yOffset = this.spriteConfig?.yOffset ?? 0;
    const xOffset = this.spriteConfig?.xOffset ?? 0;
    drawY += yOffset * scale;
    drawX += xOffset * scale;
    
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
      
      // Show hitbox bounds visualization
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
