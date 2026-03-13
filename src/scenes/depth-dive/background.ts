/**
 * Depth Dive Background System
 * 
 * Selects and renders random SS-Background images for the dive scene.
 */

import { MakkoEngine, IDisplay } from '@makko/engine';

/**
 * Get all available dive background asset names from the manifest
 */
export function getDiveBackgroundAssets(): string[] {
  const allAssets = MakkoEngine.getLoadedStaticAssets();
  
  return allAssets.filter(name => {
    const lowerName = name.toLowerCase();
    return (
      lowerName.startsWith('ss-background-') ||
      lowerName.startsWith('ss-bridge-') ||
      lowerName.startsWith('ss-hallway-')
    );
  });
}

/**
 * Select a random background asset for the dive
 */
export function selectRandomBackground(): string | null {
  const backgrounds = getDiveBackgroundAssets();
  
  if (backgrounds.length === 0) {
    console.warn('[DepthDive] No background assets found');
    return null;
  }
  
  const index = Math.floor(Math.random() * backgrounds.length);
  return backgrounds[index];
}

/**
 * Render the dive background full-screen with cover fit
 * Centers the image and scales to cover the entire canvas
 */
export function renderDiveBackground(display: IDisplay, assetName: string | null): void {
  if (!assetName) {
    // Fallback to dark background
    display.clear('#0a0c12');
    return;
  }
  
  const asset = MakkoEngine.staticAsset(assetName);
  if (!asset) {
    display.clear('#0a0c12');
    return;
  }
  
  const canvasWidth = display.width;
  const canvasHeight = display.height;
  const imgWidth = asset.width;
  const imgHeight = asset.height;
  
  // Calculate scale to cover (contain would use Math.min, cover uses Math.max)
  const scaleX = canvasWidth / imgWidth;
  const scaleY = canvasHeight / imgHeight;
  const scale = Math.max(scaleX, scaleY);
  
  // Calculate dimensions
  const drawWidth = imgWidth * scale;
  const drawHeight = imgHeight * scale;
  
  // Center the image
  const drawX = (canvasWidth - drawWidth) / 2;
  const drawY = (canvasHeight - drawHeight) / 2;
  
  // Draw the background image
  display.drawImage(asset.image, drawX, drawY, drawWidth, drawHeight);
}
