/**
 * Doctrine System
 * 
 * Tracks player choices to determine operational doctrine: Corporate, Cooperative, or Smuggler.
 * Doctrine emerges from play patterns.
 */

import { signalLogSystem } from './signal-log-system';
import { MetaState, DoctrineType, DoctrinePoints } from '../types/state';
import type { StoryState } from '../dialogue/story-state';

/**
 * DOCTRINE_LOCKIN_THRESHOLD - Total points needed before lock-in check
 */
const DOCTRINE_LOCKIN_THRESHOLD = 10;

/**
 * DOCTRINE_MAJORITY_PERCENTAGE - Percentage of total needed for clear majority
 */
const DOCTRINE_MAJORITY_PERCENTAGE = 0.4; // 40%

/**
 * DoctrineSystem - tracks player choices and determines doctrine
 */
export class DoctrineSystem {
  private metaState: MetaState;
  private storyState: StoryState;

  constructor(metaState: MetaState, storyState: StoryState) {
    this.metaState = metaState;
    this.storyState = storyState;
  }

  /**
   * Add doctrine points and check for lock-in
   */
  addPoints(type: DoctrineType, amount: number = 1, reason: string): void {
    // Already locked in - no changes
    if (this.metaState.doctrine !== null) return;
    
    // Add points
    this.metaState.doctrinePoints[type] += amount;
    
    console.log(`[Doctrine] +${amount} ${type} point(s) (${reason})`);
    
    // Check for commentary and lock-in
    this.checkProgress();
  }

  /**
   * Check doctrine progress for commentary and lock-in
   */
  private checkProgress(): void {
    const points = this.metaState.doctrinePoints;
    const total = points.corporate + points.cooperative + points.smuggler;
    
    // 5-point commentary
    if (total >= 5 && !this.storyState.hasFlag('doctrine_5_point_comment')) {
      this.storyState.setFlag('doctrine_5_point_comment');
      signalLogSystem.addBreakingNews('STATION PROFILE: Emerging operational patterns detected...');
    }
    
    // 8-point commentary with hint
    if (total >= 8 && !this.storyState.hasFlag('doctrine_8_point_comment')) {
      this.storyState.setFlag('doctrine_8_point_comment');
      const leading = this.getLeadingType();
      if (leading) {
        const hints: Record<DoctrineType, string> = {
          corporate: 'Corporate efficiency protocols gaining traction',
          cooperative: 'Cooperative frameworks showing strong adoption',
          smuggler: 'Off-network operations becoming prevalent'
        };
        signalLogSystem.addBreakingNews(`STATION PROFILE: ${hints[leading]}`);
      }
    }
    
    // Lock-in check: 10+ points with clear majority (>40% of total)
    if (total >= DOCTRINE_LOCKIN_THRESHOLD) {
      const threshold = total * DOCTRINE_MAJORITY_PERCENTAGE;
      let lockedType: DoctrineType | null = null;
      
      if (points.corporate > threshold) lockedType = 'corporate';
      else if (points.cooperative > threshold) lockedType = 'cooperative';
      else if (points.smuggler > threshold) lockedType = 'smuggler';
      
      if (lockedType && this.metaState.doctrine === null) {
        this.metaState.doctrine = lockedType;
        signalLogSystem.addBreakingNews(
          `STATION PROFILE: ${lockedType.charAt(0).toUpperCase() + lockedType.slice(1)} doctrine confirmed. Station identity established.`
        );
        console.log(`[Doctrine] Locked in: ${lockedType}`);
      }
    }
  }

  /**
   * Get the doctrine type with the most points
   */
  private getLeadingType(): DoctrineType | null {
    const points = this.metaState.doctrinePoints;
    const max = Math.max(points.corporate, points.cooperative, points.smuggler);
    
    if (points.corporate === max) return 'corporate';
    if (points.cooperative === max) return 'cooperative';
    if (points.smuggler === max) return 'smuggler';
    return null;
  }

  /**
   * Get current doctrine (null if not locked)
   */
  getDoctrine(): DoctrineType | null {
    return this.metaState.doctrine;
  }

  /**
   * Get total doctrine points
   */
  getTotalPoints(): number {
    const points = this.metaState.doctrinePoints;
    return points.corporate + points.cooperative + points.smuggler;
  }

  /**
   * Get all doctrine point breakdown
   */
  getPoints(): DoctrinePoints {
    return { ...this.metaState.doctrinePoints };
  }

  /**
   * Check if doctrine is locked in
   */
  isLocked(): boolean {
    return this.metaState.doctrine !== null;
  }
}

// Singleton instance for convenience
let doctrineSystem: DoctrineSystem | null = null;

/**
 * Initialize the doctrine system with meta and story state
 */
export function initDoctrineSystem(metaState: MetaState, storyState: StoryState): DoctrineSystem {
  doctrineSystem = new DoctrineSystem(metaState, storyState);
  return doctrineSystem;
}

/**
 * Get the doctrine system instance
 */
export function getDoctrineSystem(): DoctrineSystem | null {
  return doctrineSystem;
}

/**
 * Convenience function to add doctrine points
 */
export function addDoctrinePoints(type: DoctrineType, amount: number = 1, reason: string): void {
  if (doctrineSystem) {
    doctrineSystem.addPoints(type, amount, reason);
  } else {
    console.warn('[Doctrine] System not initialized');
  }
}
