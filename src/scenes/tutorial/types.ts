/**
 * Tutorial Scene Types
 *
 * Phase enums and state interfaces for tutorial systems.
 */

/**
 * Fade phase for character transitions
 */
export const FadePhase = {
  VISIBLE: 'visible',
  WAITING_TO_FADE: 'waiting',
  FADING_OUT: 'fadeOut',
  FADING_IN: 'fadeIn'
} as const;

export type FadePhaseType = typeof FadePhase[keyof typeof FadePhase];

/**
 * Intro sequence phases
 */
export const IntroPhase = {
  ENTRANCE_FADE_IN: 'entranceFadeIn',
  ENTRANCE_PLAY: 'entrancePlay',
  ENTRANCE_FADE_OUT: 'entranceFadeOut',
  FLYING_HEAD_FADE_IN: 'flyingHeadFadeIn',
  FLYING_HEAD_PLAY: 'flyingHeadPlay',
  FLYING_HEAD_FADE_OUT: 'flyingHeadFadeOut',
  TALKING_HEAD_FADE_IN: 'talkingHeadFadeIn',
  TALKING_HEAD_FADE_OUT: 'talkingHeadFadeOut',
  NORMAL: 'normal'
} as const;

export type IntroPhaseType = typeof IntroPhase[keyof typeof IntroPhase];

/**
 * Tracks fade state for a single character
 */
export interface CharacterFadeState {
  currentAlpha: number;
  phase: FadePhaseType;
  timer: number;
  targetAlpha: number;
}
