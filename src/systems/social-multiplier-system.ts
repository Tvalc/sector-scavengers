/**
 * Social Multiplier System
 *
 * Manages viral multiplier state for rewards.
 * Base multiplier is 1.0x, boosted to 1.5x for 2 hours after sharing.
 *
 * Usage:
 *   const socialSystem = new SocialMultiplierSystem(game);
 *   
 *   // Activate boost when user shares
 *   socialSystem.activateBoost();
 *   
 *   // In update loop
 *   socialSystem.update(dt);
 *   
 *   // Check status
 *   if (socialSystem.isBoostActive()) {
 *     const multiplier = socialSystem.getMultiplier();
 *   }
 */

import type { Game } from '../game/game';

/**
 * Boost duration in milliseconds (2 hours)
 */
export const BOOST_DURATION = 2 * 60 * 60 * 1000;

/**
 * Boost multiplier value
 */
export const BOOST_MULTIPLIER = 1.5;

/**
 * Base multiplier value
 */
export const BASE_MULTIPLIER = 1.0;

/**
 * SocialMultiplierSystem - manages viral multiplier state
 */
export class SocialMultiplierSystem {
  private game: Game;

  constructor(game: Game) {
    this.game = game;
  }

  /**
   * Get current multiplier value
   * Automatically checks expiry
   */
  getMultiplier(): number {
    this.checkExpiry();
    return this.game.state.viralMultiplier;
  }

  /**
   * Activate the viral boost
   * Sets multiplier to 1.5x for 2 hours
   */
  activateBoost(): boolean {
    if (this.isBoostActive()) {
      console.warn('[SocialMultiplier] Boost already active');
      return false;
    }

    this.game.state.viralMultiplier = BOOST_MULTIPLIER;
    this.game.state.viralMultiplierExpiry = Date.now() + BOOST_DURATION;

    // Save state
    this.game.saveState();

    console.log('[SocialMultiplier] Boost activated: 1.5x for 2 hours');
    return true;
  }

  /**
   * Deactivate the boost manually
   */
  deactivateBoost(): void {
    this.game.state.viralMultiplier = BASE_MULTIPLIER;
    this.game.state.viralMultiplierExpiry = null;

    // Save state
    this.game.saveState();

    console.log('[SocialMultiplier] Boost deactivated');
  }

  /**
   * Check if boost is currently active
   */
  isBoostActive(): boolean {
    this.checkExpiry();
    return this.game.state.viralMultiplier > BASE_MULTIPLIER;
  }

  /**
   * Get remaining time in milliseconds
   * Returns 0 if boost is inactive
   */
  getRemainingTime(): number {
    this.checkExpiry();
    
    const expiry = this.game.state.viralMultiplierExpiry;
    if (!expiry) return 0;

    const remaining = expiry - Date.now();
    return Math.max(0, remaining);
  }

  /**
   * Get remaining time formatted as string
   * e.g., "1h 23m" or "45m 12s"
   */
  getRemainingTimeFormatted(): string {
    const remaining = this.getRemainingTime();
    if (remaining <= 0) return '';

    const totalSeconds = Math.floor(remaining / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${seconds}s`;
  }

  /**
   * Get progress percentage (0-1) of boost duration
   */
  getProgress(): number {
    const expiry = this.game.state.viralMultiplierExpiry;
    if (!expiry) return 0;

    const elapsed = Date.now() - (expiry - BOOST_DURATION);
    const progress = elapsed / BOOST_DURATION;
    
    return Math.max(0, Math.min(1, progress));
  }

  /**
   * Get remaining progress percentage (1-0)
   */
  getRemainingProgress(): number {
    return 1 - this.getProgress();
  }

  /**
   * Update system (check expiry)
   */
  update(_dt: number): void {
    this.checkExpiry();
  }

  /**
   * Check and handle expiry
   */
  private checkExpiry(): void {
    const expiry = this.game.state.viralMultiplierExpiry;
    if (!expiry) return;

    if (Date.now() >= expiry) {
      // Boost expired
      this.game.state.viralMultiplier = BASE_MULTIPLIER;
      this.game.state.viralMultiplierExpiry = null;

      // Save state
      this.game.saveState();

      console.log('[SocialMultiplier] Boost expired');
    }
  }

  /**
   * Get boost status summary
   */
  getStatus(): {
    active: boolean;
    multiplier: number;
    remainingMs: number;
    remainingFormatted: string;
  } {
    return {
      active: this.isBoostActive(),
      multiplier: this.getMultiplier(),
      remainingMs: this.getRemainingTime(),
      remainingFormatted: this.getRemainingTimeFormatted()
    };
  }

  /**
   * Calculate boosted value
   * @param baseValue - The base value to apply multiplier to
   */
  calculateBoostedValue(baseValue: number): number {
    return baseValue * this.getMultiplier();
  }

  /**
   * Calculate bonus amount (difference from base)
   */
  calculateBonus(baseValue: number): number {
    const multiplier = this.getMultiplier();
    return baseValue * (multiplier - BASE_MULTIPLIER);
  }

  /**
   * Generate Twitter share intent URL
   */
  generateShareUrl(receiptData: {
    amount: number;
    items: string[];
    collapsed: boolean;
  }): string {
    const text = this.generateShareText(receiptData);
    const encodedText = encodeURIComponent(text);
    return `https://twitter.com/intent/tweet?text=${encodedText}`;
  }

  /**
   * Generate share text for Twitter
   */
  private generateShareText(data: {
    amount: number;
    items: string[];
    collapsed: boolean;
  }): string {
    if (data.collapsed) {
      return `My rig collapsed in Sector Scavengers! ☠️ Lost it all to the void... Verify: @playdotfun #SectorScavengers`;
    }

    const totalAmount = Math.floor(data.amount);
    return `I extracted ${totalAmount} in Sector Scavengers! 🚀 Verify: @playdotfun #SectorScavengers`;
  }

  /**
   * Open Twitter share dialog
   */
  shareToTwitter(receiptData: {
    amount: number;
    items: string[];
    collapsed: boolean;
  }): boolean {
    const url = this.generateShareUrl(receiptData);
    
    try {
      window.open(url, '_blank', 'width=550,height=420');
      
      // Auto-activate boost on share
      this.activateBoost();
      
      return true;
    } catch (error) {
      console.error('[SocialMultiplier] Failed to open share dialog:', error);
      return false;
    }
  }
}

/**
 * Singleton factory - creates instance with game reference
 */
export function createSocialMultiplierSystem(game: Game): SocialMultiplierSystem {
  return new SocialMultiplierSystem(game);
}
