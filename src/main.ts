import { MakkoEngine } from '@makko/engine';
import { Game } from './game/game';
import { playFunService } from './services/playfun-service';
import { assetMap } from './assets/asset-map';

/**
 * Detect if running in preview/sandbox environment
 */
function isPreviewEnvironment(): boolean {
  const hostname = window.location.hostname;
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.includes('preview') ||
    hostname.includes('sandbox') ||
    hostname.includes('studio') ||
    window.location.protocol === 'file:'
  );
}

/**
 * Initialize Play.fun SDK
 * - Creates mock SDK in preview environments
 * - Dynamically loads real SDK in production
 */
async function initPlayFun(): Promise<void> {
  if (isPreviewEnvironment()) {
    console.warn('[PlayFun] Preview environment detected - using mock SDK');
    
    // Create mock SDK with stub functions
    window.PlayFun = {
      init: () => {
        console.warn('[PlayFun Mock] init() called (offline mode)');
        return Promise.resolve();
      },
      login: () => {
        console.warn('[PlayFun Mock] login() called (offline mode)');
        return Promise.resolve();
      },
      claim: (payload: unknown) => {
        console.warn('[PlayFun Mock] claim() called (offline mode)', payload);
        return Promise.resolve({
          success: true,
          txHash: '0x' + Array.from({ length: 64 }, () =>
            Math.floor(Math.random() * 16).toString(16)
          ).join('')
        });
      },
      refreshPointsAndMultiplier: () => {
        console.warn('[PlayFun Mock] refreshPointsAndMultiplier() called (offline mode)');
        return Promise.resolve();
      },
      isConnected: () => false,
      getWallet: () => null
    };
    
    return;
  }

  // Production: Dynamically load real SDK
  console.log('[PlayFun] Production environment - loading real SDK');
  
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://sdk.play.fun/playfun-sdk.js';
    script.async = true;
    
    script.onload = () => {
      console.log('[PlayFun] Real SDK loaded successfully');
      resolve();
    };
    
    script.onerror = () => {
      console.warn('[PlayFun] Failed to load real SDK - falling back to mock');
      // Create mock as fallback
      window.PlayFun = {
        init: () => Promise.resolve(),
        login: () => Promise.resolve(),
        claim: () => Promise.resolve({ success: true, txHash: '' }),
        refreshPointsAndMultiplier: () => Promise.resolve(),
        isConnected: () => false,
        getWallet: () => null
      };
      resolve(); // Resolve instead of reject to allow game to continue
    };
    
    document.head.appendChild(script);
  });
}

/**
 * Main initialization function
 */
async function main(): Promise<void> {
  try {
    console.log('[Main] Initializing Sector Scavengers...');

    // Initialize MakkoEngine with canvas and assets
    await MakkoEngine.initEngine({
      manifests: ['/sprites-manifest.json', '/static-asset-manifest.json'],
    canvas: document.getElementById('gameCanvas') as HTMLCanvasElement,
    width: 1920,
    height: 1080
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

    // Initialize Play.fun SDK (dynamic injection)
    try {
      await initPlayFun();
      console.log('[Main] PlayFun SDK ready');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.warn(`[Main] PlayFun SDK initialization failed: ${message}`);
    }

    // Initialize PlayFun service (will use mock or real SDK)
    try {
      await playFunService.initialize();
      console.log('[Main] Play.fun service initialized');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.warn(`[Main] Play.fun service initialization failed: ${message}`);
    }

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

    // Shift+F for fullscreen toggle - check in game loop
    (window as Window & { fullscreenKeyCheck?: () => void }).fullscreenKeyCheck = () => {
      if (MakkoEngine.input.isKeyDown('ShiftLeft') && MakkoEngine.input.isKeyPressed('KeyF')) {
        toggleFullscreen();
      }
      if (MakkoEngine.input.isKeyDown('ShiftRight') && MakkoEngine.input.isKeyPressed('KeyF')) {
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
    console.log('[Main] ========== BUILD TEST VERSION 3 ==========');
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
