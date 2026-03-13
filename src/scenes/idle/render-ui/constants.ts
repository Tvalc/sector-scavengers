/**
 * UI Layout Constants
 *
 * Button bounds, panel dimensions, and layout values for idle scene UI.
 */

/** Button bounds for the scene */
// DIVE button covers both the visual asset (prop) and the text label below it
// Visual asset: y = 900 - 98.6 + 20 = ~821, height = 98.6
// Text area: y = 900, height = 60
// Combined: y = 821, height = 139 (covers 821 to 960)
export const DIVE_BUTTON_BOUNDS = { x: 260, y: 821, width: 200, height: 139 };
export const MISSION_BUTTON_BOUNDS = { x: 1670, y: 20, width: 50, height: 50 };
export const CREW_BUTTON_BOUNDS = { x: 1730, y: 20, width: 50, height: 50 };
export const INVENTORY_BUTTON_BOUNDS = { x: 1790, y: 20, width: 50, height: 50 };
export const HELP_BUTTON_BOUNDS = { x: 1850, y: 20, width: 50, height: 50 };

/** Panel constants for slot detection */
export const INVENTORY_PANEL = {
  x: 1450,
  y: 50,
  width: 300,
  height: 400,
  hardwareLabelY: 60,
  hardwareSlotsY: 80,
  crewLabelY: 220,
  crewSlotsY: 240,
  slotSize: 50,
  slotSpacing: 130,
  slotRowHeight: 60
} as const;

/** Crew panel constants */
export const CREW_PANEL = {
  x: 1450,
  y: 50,
  width: 300,
  height: 200,
  slotsY: 80,
  slotSize: 50,
  slotSpacing: 130
} as const;

/** Party panel constants */
export const PARTY_PANEL = {
  x: 30,
  y: 250,
  width: 220,
  height: 200,
  headerY: 25,
  leadSlotY: 55,
  leadSlotSize: 64,
  companionSlotY: 135,
  companionSlotSize: 48,
  slotSpacing: 75
} as const;
