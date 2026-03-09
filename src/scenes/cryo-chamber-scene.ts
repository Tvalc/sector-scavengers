/**
 * Cryo Chamber Scene
 *
 * Displays a parallax window effect - a static cryo chamber interior
 * with an infinitely scrolling spacefield visible through a clipped viewport window.
 */

import { MakkoEngine } from '@makko/engine';
import type { Scene } from '../scene/interfaces';
import type { Game } from '../game/game';

/**
 * Duration to show the cryo chamber intro before auto-transitioning (ms)
 */
const INTRO_DURATION = 3000;

/**
 * Scroll speed in pixels per frame
 */
const SCROLL_SPEED = 1;

/**
 * Spacefield asset dimensions
 */
const SPACEFIELD_WIDTH = 1620;
const SPACEFIELD_HEIGHT = 1080;

/**
 * Canvas dimensions
 */
const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;

/**
 * Mask/viewport dimensions (the white box "window")
 */
const MASK_WIDTH = 270;
const MASK_HEIGHT = 200;

/**
 * White box center position on cryochambernew (1920x1080)
 * Scaled from original (500, 365) on 1350x1080 asset
 * X: 500 * (1920/1350) ≈ 711
 */
const WHITE_BOX_CENTER_X = 711;
const WHITE_BOX_CENTER_Y = 365;

/**
 * CryoChamberScene - parallax window view into space using clipping mask
 */
export class CryoChamberScene implements Scene {
  readonly id = 'cryoChamber';
  manager?: import('../scene/scene-manager').SceneManager;

  private game: Game;

  // Scroll offset for spacefield (increases = scrolls left)
  private xOffset: number = 0;

  // Time spent in this scene (for auto-transition)
  private elapsedTime: number = 0;

  // Asset loaded state
  private cryoChamberLoaded: boolean = false;
  private spacefieldLoaded: boolean = false;

  constructor(game: Game) {
    this.game = game;
  }

  async init(): Promise<void> {
    // Check if assets are loaded
    this.cryoChamberLoaded = MakkoEngine.hasStaticAsset('cryochambernew');
    this.spacefieldLoaded = MakkoEngine.hasStaticAsset('spacefield');

    if (!this.cryoChamberLoaded) {
      console.warn('[CryoChamberScene] Cryo chamber asset cryochambernew not loaded');
    }
    if (!this.spacefieldLoaded) {
      console.warn('[CryoChamberScene] Spacefield asset not loaded');
    }
  }

  enter(previousScene?: string): void {
    // Reset scroll position and timer on entry
    this.xOffset = 0;
    this.elapsedTime = 0;
  }

  exit(nextScene?: string): void {
    // Cleanup if needed
  }

  handleInput(): void {
    const input = MakkoEngine.input;

    // Allow any key/click to skip the intro and go to tutorial
    if (input.isKeyPressed('Space') || input.isKeyPressed('Enter') || input.isMousePressed(0)) {
      this.transitionToTutorial();
      return;
    }

    // Escape skips directly to idle
    if (input.isKeyPressed('Escape')) {
      this.game.switchScene('idle');
      return;
    }
  }

  update(dt: number): void {
    // Update scroll offset (scrolling left)
    this.xOffset += SCROLL_SPEED;

    // Wrap at spacefield width for seamless loop
    if (this.xOffset >= SPACEFIELD_WIDTH) {
      this.xOffset = 0;
    }

    // Track elapsed time for auto-transition
    this.elapsedTime += dt;
    if (this.elapsedTime >= INTRO_DURATION) {
      this.transitionToTutorial();
    }
  }

  render(): void {
    const display = MakkoEngine.display;

    // Get assets
    const cryoChamber = MakkoEngine.staticAsset('cryochambernew');
    const spacefield = MakkoEngine.staticAsset('spacefield');

    if (!cryoChamber || !spacefield) {
      // Fallback rendering if assets not loaded
      this.renderFallback(display);
      return;
    }

    // Clear with dark background
    display.clear('#0a0e1a');

    // For cryochambernew (1920x1080), no scaling needed
    // Calculate mask position relative to canvas center
    const canvasCenterX = CANVAS_WIDTH / 2; // 960
    const canvasCenterY = CANVAS_HEIGHT / 2; // 540

    // Offset from canvas center to white box center
    const offsetFromCenterX = WHITE_BOX_CENTER_X - canvasCenterX;
    const offsetFromCenterY = WHITE_BOX_CENTER_Y - canvasCenterY;

    // Mask center position on screen
    const maskCenterX = canvasCenterX + offsetFromCenterX;
    const maskCenterY = canvasCenterY + offsetFromCenterY;

    // Mask top-left position
    const maskX = maskCenterX - MASK_WIDTH / 2;
    const maskY = maskCenterY - MASK_HEIGHT / 2;

    // Draw with clipping mask:
    // 1. Push clip rect for the viewport
    display.pushClipRect(maskX, maskY, MASK_WIDTH, MASK_HEIGHT);

    // 2. Draw spacefield tiles within clipped region
    const drawX1 = -this.xOffset;
    const drawX2 = SPACEFIELD_WIDTH - this.xOffset;
    display.drawImage(spacefield.image, drawX1, 0, SPACEFIELD_WIDTH, SPACEFIELD_HEIGHT);
    display.drawImage(spacefield.image, drawX2, 0, SPACEFIELD_WIDTH, SPACEFIELD_HEIGHT);

    // 3. Pop clip
    display.popClip();

    // 4. Draw CryoChamberNew (1920x1080) - no scaling needed, draw at origin
    display.drawImage(cryoChamber.image, 0, 0, cryoChamber.width, cryoChamber.height);

    // 5. Draw skip hint
    this.renderSkipHint(display);
  }

  /**
   * Transition to tutorial scene
   */
  private transitionToTutorial(): void {
    // Only transition once
    if (this.elapsedTime < 0) return;
    this.elapsedTime = -1;

    // Check if tutorial should be skipped
    if (this.game.isTutorialSkipped()) {
      this.game.switchScene('idle');
    } else {
      this.game.switchScene('tutorial');
    }
  }

  /**
   * Render skip hint overlay
   */
  private renderSkipHint(display: typeof MakkoEngine.display): void {
    display.drawText('Press SPACE or click to continue', display.width / 2, display.height - 80, {
      font: '20px monospace',
      fill: '#666666',
      align: 'center'
    });
  }

  /**
   * Fallback rendering when assets are not available
   */
  private renderFallback(display: typeof MakkoEngine.display): void {
    // Clear with dark background
    display.clear('#0a0e1a');

    // Draw placeholder text
    display.drawText('CRYO CHAMBER', display.width / 2, display.height / 2 - 40, {
      font: 'bold 48px monospace',
      fill: '#00f0ff',
      align: 'center'
    });

    display.drawText('Loading cryo chamber view...', display.width / 2, display.height / 2 + 20, {
      font: '24px monospace',
      fill: '#666666',
      align: 'center'
    });
  }

  destroy(): void {
    // Cleanup scene resources
  }
}
