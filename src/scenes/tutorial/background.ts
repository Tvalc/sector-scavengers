/**
 * Tutorial Background Renderer
 *
 * Handles cryo chamber background with spacefield parallax window.
 */

import { MakkoEngine } from '@makko/engine';
import type { StaticAsset } from '@makko/engine';
import { SPACEFIELD_CONFIG } from './constants';

/**
 * Renders animated cryo chamber background with spacefield viewport
 */
export class TutorialBackground {
  private cryoChamberAsset: StaticAsset | null = null;
  private spacefieldAsset: StaticAsset | null = null;
  private spacefieldOffset: number = 0;

  constructor() {
    if (MakkoEngine.hasStaticAsset('cryochambernews')) {
      this.cryoChamberAsset = MakkoEngine.staticAsset('cryochambernews');
    }
    if (MakkoEngine.hasStaticAsset('spacefield')) {
      this.spacefieldAsset = MakkoEngine.staticAsset('spacefield');
    }
  }

  /**
   * Reset parallax scroll position
   */
  reset(): void {
    this.spacefieldOffset = 0;
  }

  /**
   * Update parallax scroll
   */
  update(_dt: number): void {
    this.spacefieldOffset += 1;
    if (this.spacefieldOffset >= SPACEFIELD_CONFIG.width) {
      this.spacefieldOffset = 0;
    }
  }

  /**
   * Render background with parallax viewport
   */
  render(display: typeof MakkoEngine.display): void {
    display.clear('#000000');

    if (!this.cryoChamberAsset) return;

    if (!this.spacefieldAsset) {
      // Fallback: just cryo chamber without parallax
      display.drawImage(
        this.cryoChamberAsset.image,
        0, 0,
        this.cryoChamberAsset.width,
        this.cryoChamberAsset.height
      );
      return;
    }

    this.renderWithParallax(display);
  }

  private renderWithParallax(display: typeof MakkoEngine.display): void {
    if (!this.cryoChamberAsset || !this.spacefieldAsset) return;

    const canvasWidth = display.width;
    const canvasHeight = display.height;

    // Calculate scale to fill canvas
    const scaleFactor = Math.floor(
      Math.max(canvasWidth / this.cryoChamberAsset.width, canvasHeight / this.cryoChamberAsset.height) * 1000
    ) / 1000;

    const scaledWidth = Math.floor(this.cryoChamberAsset.width * scaleFactor);
    const scaledHeight = Math.floor(this.cryoChamberAsset.height * scaleFactor);
    const drawX = Math.floor((canvasWidth - scaledWidth) / 2);
    const drawY = Math.floor((canvasHeight - scaledHeight) / 2);

    // Viewport mask position (white box in asset)
    const whiteBoxCenterX = 675;
    const whiteBoxCenterY = 400;
    const maskWidthOriginal = 350;
    const maskHeightOriginal = 200;
    const cornerRadius = Math.floor(20 * scaleFactor);

    const maskCenterX = Math.floor(drawX + whiteBoxCenterX * scaleFactor);
    const maskCenterY = Math.floor(drawY + whiteBoxCenterY * scaleFactor);
    const maskWidth = Math.floor(maskWidthOriginal * scaleFactor);
    const maskHeight = Math.floor(maskHeightOriginal * scaleFactor);
    const maskX = Math.floor(maskCenterX - maskWidth / 2);
    const maskY = Math.floor(maskCenterY - maskHeight / 2);

    // Step 1: Draw cryo chamber background
    display.drawImage(this.cryoChamberAsset.image, drawX, drawY, scaledWidth, scaledHeight);

    // Step 2: Draw spacefield within clipped viewport
    this.renderSpacefieldViewport(display, maskX, maskY, maskWidth, maskHeight, cornerRadius, drawX, drawY, scaledWidth, scaledHeight);
  }

  private renderSpacefieldViewport(
    display: typeof MakkoEngine.display,
    maskX: number, maskY: number, maskWidth: number, maskHeight: number,
    cornerRadius: number,
    bgDrawX: number, bgDrawY: number, bgWidth: number, bgHeight: number
  ): void {
    if (!this.cryoChamberAsset || !this.spacefieldAsset) return;

    // Draw spacefield within rectangular clip
    display.pushClipRect(maskX, maskY, maskWidth, maskHeight);

    const drawX1 = Math.floor(-this.spacefieldOffset + SPACEFIELD_CONFIG.offsetX);
    const drawX2 = Math.floor(SPACEFIELD_CONFIG.width - this.spacefieldOffset + SPACEFIELD_CONFIG.offsetX);
    const spacefieldY = Math.floor(SPACEFIELD_CONFIG.offsetY);

    display.drawImage(this.spacefieldAsset.image, drawX1, spacefieldY, SPACEFIELD_CONFIG.width, SPACEFIELD_CONFIG.height);
    display.drawImage(this.spacefieldAsset.image, drawX2, spacefieldY, SPACEFIELD_CONFIG.width, SPACEFIELD_CONFIG.height);

    display.popClip();

    // Create rounded corners by covering sharp corners
    this.renderRoundedCorners(display, maskX, maskY, maskWidth, maskHeight, cornerRadius, bgDrawX, bgDrawY, bgWidth, bgHeight, drawX1, drawX2, spacefieldY);
  }

  private renderRoundedCorners(
    display: typeof MakkoEngine.display,
    maskX: number, maskY: number, maskWidth: number, maskHeight: number,
    cornerRadius: number,
    bgDrawX: number, bgDrawY: number, bgWidth: number, bgHeight: number,
    sfDrawX1: number, sfDrawX2: number, sfDrawY: number
  ): void {
    if (!this.cryoChamberAsset || !this.spacefieldAsset) return;

    const corners = [
      { x: maskX, y: maskY, cx: maskX + cornerRadius, cy: maskY + cornerRadius },
      { x: maskX + maskWidth - cornerRadius, y: maskY, cx: maskX + maskWidth - cornerRadius, cy: maskY + cornerRadius },
      { x: maskX, y: maskY + maskHeight - cornerRadius, cx: maskX + cornerRadius, cy: maskY + maskHeight - cornerRadius },
      { x: maskX + maskWidth - cornerRadius, y: maskY + maskHeight - cornerRadius, cx: maskX + maskWidth - cornerRadius, cy: maskY + maskHeight - cornerRadius }
    ];

    for (const corner of corners) {
      // Cover sharp corner with background
      display.pushClipRect(corner.x, corner.y, cornerRadius, cornerRadius);
      display.drawImage(this.cryoChamberAsset.image, bgDrawX, bgDrawY, bgWidth, bgHeight);
      display.popClip();

      // Draw rounded spacefield corner
      display.pushClipCircle(corner.cx, corner.cy, cornerRadius);
      display.drawImage(this.spacefieldAsset.image, sfDrawX1, sfDrawY, SPACEFIELD_CONFIG.width, SPACEFIELD_CONFIG.height);
      display.drawImage(this.spacefieldAsset.image, sfDrawX2, sfDrawY, SPACEFIELD_CONFIG.width, SPACEFIELD_CONFIG.height);
      display.popClip();
    }
  }
}
