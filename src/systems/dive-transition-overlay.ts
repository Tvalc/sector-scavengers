/**
 * Dive Transition Overlay
 *
 * Cinematic transition animation when starting a Scavenge dive.
 * Two-phase sequence: NAVIGATING (in IdleScene) → DOCKING (in DepthDiveScene)
 *
 * Flow:
 * 1. Frame fades in
 * 2. Wait 1 second
 * 3. Ship animation plays (3x slower)
 * 4. Nameplate fades in during animation
 * 5. Everything fades out together over 3 seconds
 * 6. Complete - triggers scene change or gameplay activation
 *
 * Usage:
 *   const overlay = new DiveTransitionOverlay();
 *   overlay.start('navigating'); // or 'docking'
 *   
 *   // In game loop:
 *   overlay.update(dt);
 *   overlay.render(display);
 *   
 *   if (overlay.isComplete()) {
 *     // Transition finished
 *   }
 */

import { MakkoEngine, type IDisplay, type ICharacter, type StaticAsset } from '@makko/engine';
import { BackgroundRenderer } from '../scenes/idle/background';

// =============================================================================
// Types
// =============================================================================

type Phase = 'navigating' | 'docking' | 'complete';
type SinglePhase = 'navigating' | 'docking';
type State = 'background-fade' | 'frame-fade-in' | 'wait' | 'animating' | 'fade-out';

interface PhaseConfig {
  text: string;
  color: string;
  animation: string;
}

// =============================================================================
// Constants
// =============================================================================

// Layout - center of screen
const CENTER_X = 960;
const CENTER_Y = 540;

// Frame (container) - larger to fit content
const CONTAINER_SCALE = 1.6; // Original 594x582 → ~950x931

// Character - 25% smaller, positioned per animation
const CHARACTER_SCALE = 0.9;

// Nameplate - smaller, below character
const NAMEPLATE_SCALE = 0.45;
const NAMEPLATE_Y_OFFSET = 100; // Below character

// Animation speed - smooth cinematic feel
const ANIMATION_SPEED = 0.4; // 2.5x slower for smooth animation

// Timing - balanced cinematic feel
const BACKGROUND_FADE_DURATION = 300; // ms - background fade to/from black
const FRAME_FADE_IN_DURATION = 400; // ms
const WAIT_DURATION = 400; // ms - pause after frame appears
const NAMEPLATE_FADE_IN_DURATION = 400; // ms - during animation
const ANIMATION_DURATION = 2000; // ms - how long animation plays
const FADE_OUT_DURATION = 600; // ms - smooth fade out

// Phase configs
const PHASE_CONFIGS: Record<'navigating' | 'docking', PhaseConfig> = {
  navigating: {
    text: 'NAVIGATING',
    color: '#009955',
    animation: 'single-man-scav_flying_default' // Randomly selected
  },
  docking: {
    text: 'DOCKING',
    color: '#ff4444',
    animation: 'single-man-scav_airlock2_default'
  }
};

const FLYING_ANIMATIONS = [
  'single-man-scav_flying_default',
  'single-man-scav_flying2_default'
];

const ASSET_NAMES = {
  character: 'single-man-scav_singlemanscavcore',
  container: 'squarescifiuicontainer',
  nameplate: 'emptynameplate'
};

const TEXT_FONT = 'bold 28px monospace';

// =============================================================================
// DiveTransitionOverlay Class
// =============================================================================

export class DiveTransitionOverlay {
  // State
  private phase: Phase = 'complete';
  private state: State = 'frame-fade-in';
  private stateElapsed: number = 0;
  private selectedFlyingAnimation: string = '';

  // Opacity values
  private frameOpacity: number = 0;
  private nameplateOpacity: number = 0;
  private backgroundOpacity: number = 0;

  // Assets
  private character: ICharacter | null = null;
  private containerAsset: StaticAsset | null = null;
  private nameplateAsset: StaticAsset | null = null;
  private assetsLoaded: boolean = false;

  // Parallax background
  private background: BackgroundRenderer;

  constructor() {
    this.background = new BackgroundRenderer();
    this.background.loadAssets();
    this.loadAssets();
  }

  /**
   * Begin a single-phase transition
   * @param phase - Which phase to play ('navigating' or 'docking')
   */
  start(phase?: SinglePhase): void {
    // Randomly select flying animation for navigating phase
    this.selectedFlyingAnimation = FLYING_ANIMATIONS[Math.floor(Math.random() * FLYING_ANIMATIONS.length)];
    
    this.phase = phase ?? 'navigating';
    this.stateElapsed = 0;
    this.frameOpacity = 0;
    this.nameplateOpacity = 0;

    // Different initial state based on phase
    if (this.phase === 'navigating') {
      // Navigating: background fades to black first, then overlay appears
      this.backgroundOpacity = 0;
      this.state = 'background-fade';
    } else {
      // Docking: background already black from scene change, overlay appears immediately
      this.backgroundOpacity = 1;
      this.state = 'frame-fade-in';
    }

    // Start playing the animation (will be slowed down)
    this.playCurrentPhaseAnimation();
  }

  /**
   * Update animation frame, timers, and state
   */
  update(dt: number): void {
    if (this.phase === 'complete') return;

    // Update parallax background scrolling
    this.background.update(dt);

    // Update character animation (always)
    if (this.character) {
      this.character.update(dt);
    }

    this.stateElapsed += dt;

    // Update based on current state
    switch (this.state) {
      case 'background-fade':
        this.updateBackgroundFade();
        break;
      case 'frame-fade-in':
        this.updateFrameFadeIn();
        break;
      case 'wait':
        this.updateWait();
        break;
      case 'animating':
        this.updateAnimating();
        break;
      case 'fade-out':
        this.updateFadeOut();
        break;
    }
  }

  /**
   * Render container, character, nameplate, and text
   */
  render(display: IDisplay): void {
    if (this.phase === 'complete' || !this.assetsLoaded) return;

    // Render parallax background behind everything
    this.background.render(display);

    // Render container background
    this.renderContainer(display, this.frameOpacity);

    // Render character (uses frame opacity for fade-out)
    this.renderCharacter(display, this.frameOpacity);

    // Render nameplate (has its own opacity for staggered fade-in)
    const nameplateAlpha = this.nameplateOpacity * this.frameOpacity;
    this.renderNameplate(display, nameplateAlpha);

    // Render text
    this.renderText(display, nameplateAlpha);
  }

  /**
   * Returns true when transition completes
   */
  isComplete(): boolean {
    return this.phase === 'complete';
  }

  /**
   * Returns current background opacity (0-1) for scenes to render black overlay
   */
  getBackgroundOpacity(): number {
    return this.backgroundOpacity;
  }

  /**
   * Reset overlay to initial state
   * Call this when entering a scene to ensure clean state
   */
  reset(): void {
    this.phase = 'complete';
    this.state = 'frame-fade-in';
    this.stateElapsed = 0;
    this.frameOpacity = 0;
    this.nameplateOpacity = 0;
    this.backgroundOpacity = 0;
    
    if (this.character) {
      this.character.stop();
    }
  }

  // =============================================================================
  // Private: Asset Loading
  // =============================================================================

  private loadAssets(): void {
    try {
      // Load character sprite
      if (MakkoEngine.isCharacterLoaded(ASSET_NAMES.character)) {
        this.character = MakkoEngine.sprite(ASSET_NAMES.character);
      } else {
        console.warn(`[DiveTransitionOverlay] Character not loaded: ${ASSET_NAMES.character}`);
      }

      // Load container asset
      if (MakkoEngine.hasStaticAsset(ASSET_NAMES.container)) {
        this.containerAsset = MakkoEngine.staticAsset(ASSET_NAMES.container);
      } else {
        console.warn(`[DiveTransitionOverlay] Container asset not loaded: ${ASSET_NAMES.container}`);
      }

      // Load nameplate asset
      if (MakkoEngine.hasStaticAsset(ASSET_NAMES.nameplate)) {
        this.nameplateAsset = MakkoEngine.staticAsset(ASSET_NAMES.nameplate);
      } else {
        console.warn(`[DiveTransitionOverlay] Nameplate asset not loaded: ${ASSET_NAMES.nameplate}`);
      }

      this.assetsLoaded = !!(this.character || this.containerAsset || this.nameplateAsset);
    } catch (error) {
      console.warn(`[DiveTransitionOverlay] Failed to load assets: ${error instanceof Error ? error.message : String(error)}`);
      this.assetsLoaded = false;
    }
  }

  // =============================================================================
  // Private: State Updates
  // =============================================================================

  private updateFrameFadeIn(): void {
    this.frameOpacity = Math.min(1, this.stateElapsed / FRAME_FADE_IN_DURATION);

    if (this.stateElapsed >= FRAME_FADE_IN_DURATION) {
      this.frameOpacity = 1;
      this.transitionToState('wait');
    }
  }

  private updateWait(): void {
    // Just wait, frame is fully visible
    if (this.stateElapsed >= WAIT_DURATION) {
      this.transitionToState('animating');
    }
  }

  private updateAnimating(): void {
    // Nameplate fades in during animation
    this.nameplateOpacity = Math.min(1, this.stateElapsed / NAMEPLATE_FADE_IN_DURATION);

    // Animation plays for ANIMATION_DURATION
    if (this.stateElapsed >= ANIMATION_DURATION) {
      this.nameplateOpacity = 1;
      this.transitionToState('fade-out');
    }
  }

  private updateFadeOut(): void {
    // Everything fades out together
    this.frameOpacity = Math.max(0, 1 - (this.stateElapsed / FADE_OUT_DURATION));

    if (this.stateElapsed >= FADE_OUT_DURATION) {
      this.frameOpacity = 0;
      this.nameplateOpacity = 0;
      
      // Different flow based on phase
      if (this.phase === 'docking') {
        // Docking: fade background from black to reveal game
        this.transitionToState('background-fade');
      } else {
        // Navigating: keep background black for scene change, complete
        this.completeTransition();
      }
    }
  }

  private updateBackgroundFade(): void {
    if (this.phase === 'navigating') {
      // Navigating: fade background TO black (0 → 1)
      this.backgroundOpacity = Math.min(1, this.stateElapsed / BACKGROUND_FADE_DURATION);

      if (this.stateElapsed >= BACKGROUND_FADE_DURATION) {
        this.backgroundOpacity = 1;
        this.transitionToState('frame-fade-in');
      }
    } else {
      // Docking: fade background FROM black (1 → 0)
      this.backgroundOpacity = Math.max(0, 1 - (this.stateElapsed / BACKGROUND_FADE_DURATION));

      if (this.stateElapsed >= BACKGROUND_FADE_DURATION) {
        this.backgroundOpacity = 0;
        this.completeTransition();
      }
    }
  }

  private transitionToState(newState: State): void {
    this.state = newState;
    this.stateElapsed = 0;
  }

  private completeTransition(): void {
    this.phase = 'complete';
    this.state = 'frame-fade-in';
    this.stateElapsed = 0;
    
    if (this.character) {
      this.character.stop();
    }
  }

  private playCurrentPhaseAnimation(): void {
    if (!this.character) return;

    const animationName = this.phase === 'navigating'
      ? this.selectedFlyingAnimation
      : PHASE_CONFIGS.docking.animation;

    if (this.character.hasAnimation?.(animationName)) {
      // Play at 1/3 speed (3x longer)
      this.character.play(animationName, true, 0, { speed: ANIMATION_SPEED });
    } else {
      console.warn(`[DiveTransitionOverlay] Animation not found: ${animationName}`);
      // Fallback to first available animation
      const anims = this.character.getAvailableAnimations?.() ?? [];
      if (anims.length > 0) {
        this.character.play(anims[0], true, 0, { speed: ANIMATION_SPEED });
      }
    }
  }

  // =============================================================================
  // Private: Rendering
  // =============================================================================

  private renderContainer(display: IDisplay, alpha: number): void {
    if (!this.containerAsset || alpha <= 0) return;

    const { width, height } = this.containerAsset;
    const scaledWidth = width * CONTAINER_SCALE;
    const scaledHeight = height * CONTAINER_SCALE;
    const x = CENTER_X - scaledWidth / 2;
    const y = CENTER_Y - scaledHeight / 2;

    display.drawImage(
      this.containerAsset.image,
      x,
      y,
      scaledWidth,
      scaledHeight,
      { alpha }
    );
  }

  /**
   * Get position offset based on specific animation
   */
  private getCharacterPosition(): { x: number; y: number } {
    const animationName = this.phase === 'navigating'
      ? this.selectedFlyingAnimation
      : PHASE_CONFIGS.docking.animation;

    // Animation-specific offsets from center
    switch (animationName) {
      case 'single-man-scav_flying_default':
        // Move down 20px from base position
        return { x: CENTER_X - 25, y: CENTER_Y + 45 };
      case 'single-man-scav_flying2_default':
        // Keep current position
        return { x: CENTER_X - 25, y: CENTER_Y + 25 };
      case 'single-man-scav_airlock2_default':
        // Move right 10px, down 10px
        return { x: CENTER_X + 10, y: CENTER_Y + 10 };
      default:
        // Fallback to center
        return { x: CENTER_X, y: CENTER_Y };
    }
  }

  private renderCharacter(display: IDisplay, alpha: number): void {
    if (!this.character || alpha <= 0) return;

    // Use animation-specific position
    const { x, y } = this.getCharacterPosition();

    this.character.draw(display, x, y, {
      scale: CHARACTER_SCALE,
      alpha
    });
  }

  private renderNameplate(display: IDisplay, alpha: number): void {
    if (!this.nameplateAsset || alpha <= 0) return;

    const { width, height } = this.nameplateAsset;
    const scaledWidth = width * NAMEPLATE_SCALE;
    const scaledHeight = height * NAMEPLATE_SCALE;
    
    // Get character position for current animation
    const charPos = this.getCharacterPosition();
    
    // Position below character, centered
    const x = CENTER_X - scaledWidth / 2;
    const y = charPos.y + NAMEPLATE_Y_OFFSET;

    display.drawImage(
      this.nameplateAsset.image,
      x,
      y,
      scaledWidth,
      scaledHeight,
      { alpha }
    );
  }

  private renderText(display: IDisplay, alpha: number): void {
    if (alpha <= 0) return;

    const config = PHASE_CONFIGS[this.phase];
    if (!config) return;

    const text = config.text;
    
    // Get character position for current animation
    const charPos = this.getCharacterPosition();
    
    // Position text in center of nameplate area
    const nameplateHeight = 343 * NAMEPLATE_SCALE;
    const textY = charPos.y + NAMEPLATE_Y_OFFSET + nameplateHeight / 2;

    // Measure text for centering
    const metrics = display.measureText(text, { font: TEXT_FONT });
    const textX = CENTER_X - metrics.width / 2;

    display.drawText(text, textX, textY, {
      font: TEXT_FONT,
      fill: config.color,
      align: 'left',
      baseline: 'middle',
      alpha
    });
  }
}
