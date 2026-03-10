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
const SPACEFIELD_WIDTH = 1920;
const SPACEFIELD_HEIGHT = 1080;

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
    // Using cryochambernew (1920x1080) instead of cryochambernews (1350x1080) for proper aspect ratio
    this.cryoChamberLoaded = MakkoEngine.hasStaticAsset('cryochambernew');
    this.spacefieldLoaded = MakkoEngine.hasStaticAsset('spacefield2');

    if (!this.cryoChamberLoaded) {
      console.warn('[CryoChamberScene] Cryo chamber asset cryochambernew not loaded');
    }
    if (!this.spacefieldLoaded) {
      console.warn('[CryoChamberScene] Spacefield2 asset not loaded');
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

    // Get assets (using 1920x1080 version for proper aspect ratio)
    const cryoChamber = MakkoEngine.staticAsset('cryochambernew');
    const spacefield = MakkoEngine.staticAsset('spacefield2');

    if (!cryoChamber || !spacefield) {
      // Fallback rendering if assets not loaded
      this.renderFallback(display);
      return;
    }

    // Clear with space black (matches background assets)
    display.clear('#000000');

    // === SCALING CALCULATIONS ===
    const canvasWidth = display.width;
    const canvasHeight = display.height;
    const assetWidth = cryoChamber.width;
    const assetHeight = cryoChamber.height;
    
    const scaleFactor = Math.floor(Math.max(canvasWidth / assetWidth, canvasHeight / assetHeight) * 1000) / 1000;
    const scaledWidth = Math.floor(assetWidth * scaleFactor);
    const scaledHeight = Math.floor(assetHeight * scaleFactor);
    const drawX = Math.floor((canvasWidth - scaledWidth) / 2);
    const drawY = Math.floor((canvasHeight - scaledHeight) / 2);
    
    const whiteBoxCenterX = 675;
    const whiteBoxCenterY = 400;
    const maskWidthOriginal = 350;
    const maskHeightOriginal = 200;
    const cornerRadius = Math.floor(20 * scaleFactor);
    
    const scaledWhiteBoxCenterX = Math.floor(whiteBoxCenterX * scaleFactor);
    const scaledWhiteBoxCenterY = Math.floor(whiteBoxCenterY * scaleFactor);
    const maskCenterX = Math.floor(drawX + scaledWhiteBoxCenterX);
    const maskCenterY = Math.floor(drawY + scaledWhiteBoxCenterY);
    const maskWidth = Math.floor(maskWidthOriginal * scaleFactor);
    const maskHeight = Math.floor(maskHeightOriginal * scaleFactor);
    const maskX = Math.floor(maskCenterX - maskWidth / 2);
    const maskY = Math.floor(maskCenterY - maskHeight / 2);
    
    // STEP 1: Draw scaled CryoChamberNews first (covers canvas, including white box)
    display.drawImage(cryoChamber.image, drawX, drawY, scaledWidth, scaledHeight);
    
    // STEP 2: Draw spacefield ON TOP, but only within the window area
    display.pushClipRect(maskX, maskY, maskWidth, maskHeight);
    
    // Floor scroll offsets to prevent sub-pixel jitter during parallax animation
    const spacefieldOffsetX = -100;
    const spacefieldOffsetY = -5;
    const drawX1 = Math.floor(-this.xOffset + spacefieldOffsetX);
    const drawX2 = Math.floor(SPACEFIELD_WIDTH - this.xOffset + spacefieldOffsetX);
    const spacefieldY = Math.floor(spacefieldOffsetY);
    display.drawImage(spacefield.image, drawX1, spacefieldY, SPACEFIELD_WIDTH, SPACEFIELD_HEIGHT);
    display.drawImage(spacefield.image, drawX2, spacefieldY, SPACEFIELD_WIDTH, SPACEFIELD_HEIGHT);
    
    display.popClip();
    
    // STEP 3: Create rounded corners by covering sharp corners with foreground circles
    // Draw BOTH spacefield copies at each corner to ensure coverage at all scroll positions
    
    // Top-left corner
    display.pushClipRect(maskX, maskY, cornerRadius, cornerRadius);
    display.drawImage(cryoChamber.image, drawX, drawY, scaledWidth, scaledHeight);
    display.popClip();
    display.pushClipCircle(maskX + cornerRadius, maskY + cornerRadius, cornerRadius);
    display.drawImage(spacefield.image, drawX1, spacefieldY, SPACEFIELD_WIDTH, SPACEFIELD_HEIGHT);
    display.drawImage(spacefield.image, drawX2, spacefieldY, SPACEFIELD_WIDTH, SPACEFIELD_HEIGHT);
    display.popClip();
    
    // Top-right corner
    display.pushClipRect(maskX + maskWidth - cornerRadius, maskY, cornerRadius, cornerRadius);
    display.drawImage(cryoChamber.image, drawX, drawY, scaledWidth, scaledHeight);
    display.popClip();
    display.pushClipCircle(maskX + maskWidth - cornerRadius, maskY + cornerRadius, cornerRadius);
    display.drawImage(spacefield.image, drawX1, spacefieldY, SPACEFIELD_WIDTH, SPACEFIELD_HEIGHT);
    display.drawImage(spacefield.image, drawX2, spacefieldY, SPACEFIELD_WIDTH, SPACEFIELD_HEIGHT);
    display.popClip();
    
    // Bottom-left corner
    display.pushClipRect(maskX, maskY + maskHeight - cornerRadius, cornerRadius, cornerRadius);
    display.drawImage(cryoChamber.image, drawX, drawY, scaledWidth, scaledHeight);
    display.popClip();
    display.pushClipCircle(maskX + cornerRadius, maskY + maskHeight - cornerRadius, cornerRadius);
    display.drawImage(spacefield.image, drawX1, spacefieldY, SPACEFIELD_WIDTH, SPACEFIELD_HEIGHT);
    display.drawImage(spacefield.image, drawX2, spacefieldY, SPACEFIELD_WIDTH, SPACEFIELD_HEIGHT);
    display.popClip();
    
    // Bottom-right corner
    display.pushClipRect(maskX + maskWidth - cornerRadius, maskY + maskHeight - cornerRadius, cornerRadius, cornerRadius);
    display.drawImage(cryoChamber.image, drawX, drawY, scaledWidth, scaledHeight);
    display.popClip();
    display.pushClipCircle(maskX + maskWidth - cornerRadius, maskY + maskHeight - cornerRadius, cornerRadius);
    display.drawImage(spacefield.image, drawX1, spacefieldY, SPACEFIELD_WIDTH, SPACEFIELD_HEIGHT);
    display.drawImage(spacefield.image, drawX2, spacefieldY, SPACEFIELD_WIDTH, SPACEFIELD_HEIGHT);
    display.popClip();

    // Draw skip hint
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
