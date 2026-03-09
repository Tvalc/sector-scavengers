/**
 * Play.fun SDK Integration Service
 *
 * Handles SDK initialization and claim submissions for
 * Sector Scavengers rewards.
 *
 * Usage:
 *   import { playFunService } from './services/playfun-service';
 *   
 *   // On startup
 *   playFunService.initialize();
 *   
 *   // Check availability
 *   if (playFunService.isAvailable()) {
 *     const result = await playFunService.submitClaim(500, items);
 *   }
 */

/**
 * Play.fun SDK global interface
 */
declare global {
  interface Window {
    PlayFun?: {
      init: (config: PlayFunConfig) => Promise<void>;
      login: () => Promise<void>;
      claim: (payload: PlayFunClaimPayload) => Promise<PlayFunClaimResult>;
      refreshPointsAndMultiplier: () => Promise<void>;
      isConnected: () => boolean;
      getWallet: () => string | null;
    };
  }
}

/**
 * SDK configuration
 */
interface PlayFunConfig {
  gameId: string;
  environment: 'production' | 'development';
}

/**
 * Item submitted in claim
 */
export interface ClaimItem {
  id: string;
  name: string;
  tier: 'common' | 'rare' | 'legendary';
}

/**
 * Claim payload sent to API
 */
interface PlayFunClaimPayload {
  amount: number;
  items: ClaimItem[];
  timestamp: number;
  gameId: string;
}

/**
 * Result from claim submission
 */
export interface ClaimResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

/**
 * SDK claim result (from Play.fun SDK)
 */
interface PlayFunClaimResult {
  success: boolean;
  txHash?: string;
  tx_hash?: string;
  error?: string;
}

/**
 * PlayFunService - manages SDK interaction
 */
export class PlayFunService {
  private static readonly GAME_ID = 'sector-scavengers';
  private static readonly API_ENDPOINT = '/api/playfun/claim';
  
  private initialized: boolean = false;
  private sdkAvailable: boolean = false;

  /**
   * Initialize the Play.fun SDK
   * Call this on game startup
   */
  async initialize(): Promise<void> {
    console.log('[PlayFun] Initializing SDK...');

    // Check if SDK exists with proper guard
    if (!window.PlayFun || typeof window.PlayFun.init !== 'function') {
      console.warn('[PlayFun] SDK not available - running in offline mode');
      this.sdkAvailable = false;
      return;
    }

    try {
      await window.PlayFun.init({
        gameId: PlayFunService.GAME_ID,
        environment: 'production'
      });

      this.initialized = true;
      this.sdkAvailable = true;
      console.log('[PlayFun] SDK initialized successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('[PlayFun] SDK initialization failed:', message);
      this.sdkAvailable = false;
    }
  }

  /**
   * Check if SDK is available and initialized
   */
  isAvailable(): boolean {
    return this.sdkAvailable && this.initialized;
  }

  /**
   * Check if wallet is connected
   */
  isWalletConnected(): boolean {
    // Guard: Check if SDK and method exist
    if (!window.PlayFun || typeof window.PlayFun.isConnected !== 'function') {
      return false;
    }
    if (!this.isAvailable()) return false;
    return window.PlayFun.isConnected();
  }

  /**
   * Get connected wallet address
   */
  getWalletAddress(): string | null {
    // Guard: Check if SDK and method exist
    if (!window.PlayFun || typeof window.PlayFun.getWallet !== 'function') {
      return null;
    }
    if (!this.isAvailable()) return null;
    return window.PlayFun.getWallet();
  }

  /**
   * Trigger login flow
   */
  async login(): Promise<void> {
    // Guard: Check if SDK and method exist
    if (!window.PlayFun || typeof window.PlayFun.login !== 'function') {
      console.warn('[PlayFun] login() not available - SDK not loaded');
      return;
    }

    try {
      await window.PlayFun.login();
      console.log('[PlayFun] Login successful');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('[PlayFun] Login failed:', message);
      throw error;
    }
  }

  /**
   * Refresh points and multiplier from server
   */
  async refreshPointsAndMultiplier(): Promise<void> {
    // Guard: Check if SDK and method exist
    if (!window.PlayFun || typeof window.PlayFun.refreshPointsAndMultiplier !== 'function') {
      console.warn('[PlayFun] refreshPointsAndMultiplier() not available - SDK not loaded');
      return;
    }

    try {
      await window.PlayFun.refreshPointsAndMultiplier();
      console.log('[PlayFun] Points and multiplier refreshed');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('[PlayFun] Refresh failed:', message);
    }
  }

  /**
   * Submit a claim for rewards
   * 
   * @param amount - Total reward amount ($PLAY)
   * @param items - Items collected during the run
   * @returns Promise with claim result
   */
  async submitClaim(amount: number, items: ClaimItem[]): Promise<ClaimResult> {
    console.log('[PlayFun] Submitting claim:', { amount, items });

    // Validate inputs
    if (amount < 0) {
      return {
        success: false,
        error: 'Invalid claim amount'
      };
    }

    if (!items || items.length === 0) {
      // Allow claims with no items (just $PLAY)
      console.log('[PlayFun] No items in claim, proceeding with amount only');
    }

    // Check SDK availability
    if (!this.isAvailable()) {
      console.warn('[PlayFun] SDK not available, simulating claim');
      return this.simulateClaim(amount, items);
    }

    const payload: PlayFunClaimPayload = {
      amount,
      items,
      timestamp: Date.now(),
      gameId: PlayFunService.GAME_ID
    };

    try {
      // Guard: Check if SDK and claim method exist
      if (window.PlayFun && typeof window.PlayFun.claim === 'function') {
        const result = await window.PlayFun.claim(payload);
        console.log('[PlayFun] SDK claim result:', result);
        return result as ClaimResult;
      }

      // Fallback to direct API POST
      const response = await fetch(PlayFunService.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`;
        console.error('[PlayFun] Claim failed:', errorMessage);
        return {
          success: false,
          error: errorMessage
        };
      }

      const data = await response.json();
      console.log('[PlayFun] Claim successful:', data);

      return {
        success: true,
        txHash: data.txHash || data.tx_hash
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Network error';
      console.error('[PlayFun] Claim error:', message);
      
      return {
        success: false,
        error: `Connection failed: ${message}. Please try again.`
      };
    }
  }

  /**
   * Simulate a claim for offline/testing mode
   */
  private simulateClaim(amount: number, items: ClaimItem[]): Promise<ClaimResult> {
    console.log('[PlayFun] Simulating claim (offline mode)');
    
    return new Promise((resolve) => {
      // Simulate network delay
      setTimeout(() => {
        const mockTxHash = `0x${Array.from({ length: 64 }, () => 
          Math.floor(Math.random() * 16).toString(16)
        ).join('')}`;

        console.log('[PlayFun] Simulated claim successful:', { amount, txHash: mockTxHash });
        
        resolve({
          success: true,
          txHash: mockTxHash
        });
      }, 800);
    });
  }

  /**
   * Validate claim eligibility
   * @param roundCompleted - Whether round 10 was completed
   * @param collapsed - Whether the run collapsed
   */
  canClaim(roundCompleted: boolean, collapsed: boolean): boolean {
    // Can only claim if round 10 completed and didn't collapse
    return roundCompleted && !collapsed;
  }

  /**
   * Get user-friendly error message
   */
  getErrorMessage(error: string): string {
    if (error.includes('network') || error.includes('Network')) {
      return 'Unable to connect to Play.fun. Please check your connection.';
    }
    if (error.includes('wallet')) {
      return 'Please connect your wallet to claim rewards.';
    }
    if (error.includes('insufficient')) {
      return 'Insufficient funds for transaction.';
    }
    return error;
  }
}

/**
 * Singleton instance for global access
 */
export const playFunService = new PlayFunService();
