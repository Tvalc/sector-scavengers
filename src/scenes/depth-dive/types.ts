/**
 * Depth Dive Scene Types and Constants
 */

/** Button dimensions and positions */
export const BUTTON_BOUNDS = {
  flee: { x: 50, y: 975, width: 150, height: 50 },
  reroll: { x: 50, y: 915, width: 150, height: 50 },
  deadDrop: { x: 50, y: 855, width: 150, height: 50 }
} as const;

/** Card visual dimensions (matches CARD_DISPLAY in card-art-map.ts) */
export const CARD_DIMENSIONS = {
  width: 180,
  height: 270,
  spacing: 200
} as const;

/** Card footer height for cost/risk display */
export const CARD_FOOTER_HEIGHT = 50;

/** Generic button bounds type */
export interface ButtonBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}
