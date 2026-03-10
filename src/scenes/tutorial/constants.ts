/**
 * Tutorial Scene Constants
 *
 * Animation names, layout configuration, and timing values.
 */

/**
 * Narrator animation names
 */
export const NARRATOR_ANIMATIONS = {
  entrance: 'sci_fi_narrator_walkturnwave_default',
  flyingHead: 'sci_fi_narrator_flyingheadhover_default',
  talking: 'sci_fi_narrator_zoomnarrate_default'
} as const;

/**
 * Software Developer animation names
 */
export const PLAYER_ANIMATIONS = {
  idle: 'software_developer_drowsy_default',
  talking: 'software_developer_talking_normal_default',
  scared: 'software_developer_scared_default',
  shocked: 'software_developer_shocked_default'
} as const;

/**
 * Tutorial layout configuration
 */
export const LAYOUT = {
  portraitBottomY: 860,
  overlayAlpha: 0.7,
  dialogueBoxY: 860,
  dialogueBoxHeight: 200
} as const;

/**
 * Fade configuration for character transitions
 */
export const FADE_CONFIG = {
  fadeOutDuration: 400,
  fadeInDuration: 300,
  waitDuration: 200,
  narratorTargetAlpha: 0.6,
  playerTargetAlpha: 0.4
} as const;

/**
 * Intro sequence configuration
 */
export const INTRO_CONFIG = {
  fadeDuration: 500,
  flyingHeadDuration: 2000,
  centerPosition: 950
} as const;

/**
 * Spacefield parallax configuration
 */
export const SPACEFIELD_CONFIG = {
  width: 1920,
  height: 1080,
  offsetX: -100,
  offsetY: -5
} as const;
