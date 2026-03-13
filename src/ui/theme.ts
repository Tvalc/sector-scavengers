/**
 * Shared UI Theme System
 *
 * Centralized theme constants for consistent styling across all game scenes.
 * Extracted from tutorial/dialogue styling patterns.
 */

/**
 * Main color palette
 */
export const COLORS = {
  // Primary accent colors
  neonCyan: '#00f0ff',
  neonMagenta: '#ff00aa',
  warningRed: '#ff3344',
  successGreen: '#00ff88',
  warningYellow: '#ffdd00',
  
  // Aliases for semantic use
  warning: '#ffdd00',   // Alias for warningYellow
  danger: '#ff3344',    // Alias for warningRed
  success: '#00ff88',   // Alias for successGreen
  
  // Background colors
  background: '#0a0e1a',
  panelBg: '#141824',
  cardBg: '#1a1f2e',
  neutralGray: '#3a3f4c',
  
  // Text colors
  white: '#ffffff',
  brightText: '#e0e0e0',
  dimText: '#666666',
  disabled: '#444444',
  
  // UI element colors
  border: '#2a2f3e',
  borderHighlight: '#4a4a6a',
  overlay: 'rgba(0, 0, 0, 0.7)',
} as const;

/**
 * Card type to color mapping
 * Maps tactic card types to their corresponding accent colors
 * Core actions: Scavenge (risk), Repair (persist), Extract (safe)
 * Unlockable: Shield (protection), Upgrade (growth), Analyze (discovery)
 */
export const CARD_COLORS = {
  // Core cards
  SCAVENGE: COLORS.warningYellow,  // Risk/reward - caution
  REPAIR: COLORS.successGreen,      // Persistence - positive
  EXTRACT: COLORS.neonCyan,         // Safe exit - neutral/safe
  // Unlockable cards
  SHIELD: COLORS.neonCyan,          // Protection - blue/cyan safety
  UPGRADE: COLORS.neonMagenta,      // Improvement - special/rare
  ANALYZE: COLORS.successGreen,     // Discovery - positive outcome
  // New sub-type cards
  RUSH_SCAVENGE: COLORS.warningRed, // High risk - danger
  FULL_HAUL: COLORS.neonMagenta,    // Guaranteed loot - special
  BREAK_ROOM_RAID: COLORS.successGreen, // Free supplies - positive
} as const;

/**
 * Layout constants
 */
export const LAYOUT = {
  // Border radius for rounded corners
  borderRadius: 10,
  borderRadiusSmall: 6,
  borderRadiusLarge: 12,
  
  // Border widths
  borderWidth: 2,
  borderWidthThick: 3,
  
  // Padding
  padding: 16,
  paddingSmall: 8,
  paddingLarge: 24,
  
  // Margins
  margin: 16,
  marginSmall: 8,
  marginLarge: 24,
} as const;

/**
 * Font settings
 */
export const FONTS = {
  fontFamily: 'monospace',
  
  // Font sizes
  title: '32px',
  heading: '24px',
  label: '18px',
  body: '16px',
  small: '14px',
  tiny: '12px',
  
  // Convenience font strings
  titleFont: '32px monospace',
  headingFont: '24px monospace',
  labelFont: '18px monospace',
  bodyFont: '16px monospace',
  smallFont: '14px monospace',
  tinyFont: '12px monospace',
} as const;

/**
 * Animation timings
 */
export const ANIMATION = {
  transitionFast: 150,
  transitionNormal: 250,
  transitionSlow: 400,
  pulseSpeed: 2000,
  glowSpeed: 1500,
} as const;

/**
 * Composite theme object combining all theme elements
 */
export const GAME_THEME = {
  colors: COLORS,
  cardColors: CARD_COLORS,
  layout: LAYOUT,
  fonts: FONTS,
  animation: ANIMATION,
} as const;

/**
 * Helper function to get card color with fallback
 */
export function getCardColor(cardType: string): string {
  return CARD_COLORS[cardType as keyof typeof CARD_COLORS] ?? COLORS.neonCyan;
}

/**
 * Helper function to create a panel style object
 */
export function panelStyle(fill?: string, alpha?: number) {
  return {
    fill: fill ?? COLORS.panelBg,
    alpha: alpha ?? 1,
  };
}

/**
 * Helper function to create a button style object
 */
export function buttonStyle(hovered: boolean = false) {
  return {
    fill: hovered ? COLORS.cardBg : COLORS.panelBg,
    stroke: hovered ? COLORS.neonCyan : COLORS.border,
    lineWidth: LAYOUT.borderWidth,
    alpha: hovered ? 1 : 0.9,
  };
}

/**
 * Helper function to create text style
 */
export function textStyle(size: keyof typeof FONTS = 'body', color?: string) {
  const sizeMap: Record<keyof typeof FONTS, string> = {
    fontFamily: FONTS.fontFamily,
    title: FONTS.title,
    heading: FONTS.heading,
    label: FONTS.label,
    body: FONTS.body,
    small: FONTS.small,
    tiny: FONTS.tiny,
    titleFont: FONTS.titleFont,
    headingFont: FONTS.headingFont,
    labelFont: FONTS.labelFont,
    bodyFont: FONTS.bodyFont,
    smallFont: FONTS.smallFont,
    tinyFont: FONTS.tinyFont,
  };
  
  return {
    font: sizeMap[size],
    fill: color ?? COLORS.white,
  };
}
