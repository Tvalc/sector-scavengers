import { MakkoEngine, combo } from '@makko/engine';
import { Game } from './game/game';
import { playFunService } from './services/playfun-service';
import { assetMap } from './assets/asset-map';

/**
 * Initialize Play.fun SDK
 * Uses mock SDK with full stub implementation
 * Real SDK integration can be enabled when available
 */
async function initPlayFun(): Promise<void> {
  // Create mock SDK with full stub implementation
  // This provides complete offline functionality while maintaining API compatibility
  window.PlayFun = {
    init: () => {
      console.log('[PlayFun] SDK initialized (offline mode)');
      return Promise.resolve();
    },
    login: () => {
      console.log('[PlayFun] Login requested (offline mode)');
      return Promise.resolve();
    },
    claim: (payload: unknown) => {
      console.log('[PlayFun] Claim submitted (offline mode)', payload);
      // Generate realistic mock transaction hash
      const mockTxHash = '0x' + Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('');
      return Promise.resolve({
        success: true,
        txHash: mockTxHash
      });
    },
    refreshPointsAndMultiplier: () => {
      console.log('[PlayFun] Points refresh requested (offline mode)');
      return Promise.resolve();
    },
    isConnected: () => false,
    getWallet: () => null
  };
}

/**
 * Main initialization function
 */
async function main(): Promise<void> {
  try {
    console.log('[Main] Initializing Sector Scavengers...');

    // Initialize MakkoEngine with canvas and assets
    // Use canvas2d renderer for reliable rendering
    await MakkoEngine.initEngine({
      manifests: ['/sprites-manifest.json', '/static-asset-manifest.json'],
      canvas: document.getElementById('gameCanvas') as HTMLCanvasElement,
      width: 1920,
      height: 1080,
      renderer: 'canvas2d',
      onError: (error) => {
        // Log warning but don't fail - allows game to continue with missing assets
        console.warn('[Main] Asset load warning (non-fatal):', error instanceof Error ? error.message : String(error));
      }
    });

    console.log('[Main] MakkoEngine initialized');

    // Disable image smoothing for pixel art
    MakkoEngine.display.setImageSmoothing(false);

    // Stretch to fill window - no aspect ratio preservation to avoid letterboxing
    MakkoEngine.display.fitToWindow(false);
    MakkoEngine.display.setAutoFit('window');
    
    // Log canvas size for debugging
    console.log('[Main] Canvas size:', MakkoEngine.display.canvas.width, 'x', MakkoEngine.display.canvas.height);
    console.log('[Main] Display size:', MakkoEngine.display.width, 'x', MakkoEngine.display.height);
    
    // Set cursor to default
    MakkoEngine.display.setCursor('default');

    // Initialize Play.fun SDK
    await initPlayFun();
    console.log('[Main] PlayFun SDK ready');

    // Initialize PlayFun service
    await playFunService.initialize();
    console.log('[Main] Play.fun service initialized');

    // Load assets
    try {
      await assetMap.load();
      console.log('[Main] Asset map loaded');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.warn(`[Main] Asset map load failed: ${message}`);
    }

    // Capture game keys
    // Fullscreen toggle (Shift+F)
    let isFullscreen = false;
    const toggleFullscreen = async (): Promise<void> => {
      try {
        if (isFullscreen) {
          await MakkoEngine.display.exitFullscreen();
          isFullscreen = false;
        } else {
          await MakkoEngine.display.requestFullscreen();
          isFullscreen = true;
        }
      } catch (error) {
        console.warn('[Main] Fullscreen toggle failed:', error instanceof Error ? error.message : error);
      }
    };

    // Track fullscreen state changes (user pressing Escape, etc.)
    MakkoEngine.display.onFullscreenChange = (fullscreen: boolean) => {
      isFullscreen = fullscreen;
    };

    MakkoEngine.input.capture([
      'Space',
      'Enter',
      'Escape',
      'ArrowUp',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'KeyH',
      'KeyS',
      'KeyC',
      'KeyT',
      'KeyD',
      'KeyP',
      'KeyR',
      'KeyF',
      'Digit0',
      'Digit1',
      'Digit2',
      'Digit3',
      'Digit4',
      'Digit5',
      'Digit6',
      'Digit7',
      'Digit8',
      'Digit9'
    ]);

    // Shift+F for fullscreen toggle - check in game loop using combo detection
    (window as Window & { fullscreenKeyCheck?: () => void }).fullscreenKeyCheck = () => {
      if (MakkoEngine.input.isKeyPressed(combo('Shift', 'KeyF'))) {
        toggleFullscreen();
      }
    };

    // Initialize and start game
    const game = new Game();
    await game.init();
    game.start();

    // Hook fullscreen toggle into game loop
    game.fullscreenToggleCallback = () => {
      (window as Window & { fullscreenKeyCheck?: () => void }).fullscreenKeyCheck?.();
    };

    console.log('[Main] Game started successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Main] Initialization error: ${message}`);
    
    // Show error screen
    showErrorScreen(message);
  }
}

/**
 * Show error screen with message
 */
function showErrorScreen(message: string): void {
  const display = MakkoEngine.display;
  const { width, height } = display;

  // Clear and draw error overlay
  display.clear('#0a0e1a');

  display.drawRect(0, 0, width, height, {
    fill: '#000000',
    alpha: 0.7
  });

  display.drawRect(width / 2 - 200, height / 2 - 100, 400, 200, {
    fill: '#141824',
    stroke: '#ff3344',
    lineWidth: 3
  });

  display.drawText('INITIALIZATION ERROR', width / 2, height / 2 - 60, {
    font: 'bold 32px monospace',
    fill: '#ff3344',
    align: 'center'
  });

  display.drawText(message, width / 2, height / 2, {
    font: '18px monospace',
    fill: '#ffffff',
    align: 'center'
  });

  display.drawText('Please refresh the page to try again', width / 2, height / 2 + 40, {
    font: '14px monospace',
    fill: '#666666',
    align: 'center'
  });
}

// Handle window resize - MakkoEngine's setAutoFit handles this automatically

// Entry point - start the game
main().catch((error) => {
  console.error('[Main] Fatal error:', error instanceof Error ? error.message : error);
});
