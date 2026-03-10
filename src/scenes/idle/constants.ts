/**
 * Idle Scene Constants
 *
 * Centralized configuration for the idle hub scene.
 */

/** How to Play modal content */
export const HOW_TO_PLAY_CONTENT = {
  title: 'SCAVENGER PROTOCOL',
  bullets: [
    'Ships generate Power passively (10/min each)',
    'Spend Power in Salvage Operations to claim ships and extract resources',
    'Use Tactic Cards: SCAN, REPAIR, BYPASS, UPGRADE, EXTRACT',
    'Beware Hull Breach (35%) on EXTRACT—use Shields to protect your run!',
    'Open Inventory (I) to view Hardware—equipment that boosts power, hull integrity, and rewards',
    'Open Crew (C) to manage your team—members provide abilities like Auto-Bypass',
    'Hover over items in Inventory or Crew to see what they do—bonuses apply automatically!'
  ]
};

/** Board asset name from manifest */
export const BOARD_ASSET_NAME = 'sssssboard';

/** Board dimensions (full canvas) */
export const BOARD_WIDTH = 1920;
export const BOARD_HEIGHT = 1080;
export const BOARD_CENTER_X = 960;
export const BOARD_CENTER_Y = 540;

/** Spacefield configuration */
export const SPACEFIELD_SCROLL_SPEED = 0.02;
export const STAR_COUNT = 70;
export const STAR_SEED = 42;
