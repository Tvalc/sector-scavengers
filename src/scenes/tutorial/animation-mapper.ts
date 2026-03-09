/**
 * Animation Mapper
 *
 * Maps dialogue emotions to character animations.
 */

import { NARRATOR_ANIMATIONS, PLAYER_ANIMATIONS } from './constants';

/**
 * Get player animation name based on dialogue emotion
 */
export function getPlayerAnimationForEmotion(emotion?: string): string {
  if (!emotion) return PLAYER_ANIMATIONS.talking;

  const scaredEmotions = ['shocked', 'alarmed', 'uncertain', 'angry', 'scared'];
  if (scaredEmotions.includes(emotion)) {
    return PLAYER_ANIMATIONS.scared;
  }

  const shockedEmotions = ['skeptical', 'confused', 'resigned', 'sad', 'defeated'];
  if (shockedEmotions.includes(emotion)) {
    return PLAYER_ANIMATIONS.shocked;
  }

  return PLAYER_ANIMATIONS.talking;
}

/**
 * Get narrator inactive animation (when not speaking)
 */
export function getNarratorIdleAnimation(): string {
  return NARRATOR_ANIMATIONS.flyingHead;
}

/**
 * Get narrator talking animation
 */
export function getNarratorTalkingAnimation(): string {
  return NARRATOR_ANIMATIONS.talking;
}
