/**
 * UI Layer System
 *
 * Screen-space UI that renders on top of the game world.
 * UI elements use screen coordinates (not world coordinates) and don't move with the camera.
 *
 * Usage:
 *   const ui = new UILayer();
 *   ui.add(new Button(100, 400, 200, 50, 'Start Game'));
 *   ui.add(new StatusBar(10, 10, 200, 20, 100, 100, 'health'));
 *   // In game loop:
 *   ui.update(dt);
 *   // After game render, reset camera, then:
 *   ui.render();
 */

import { MakkoEngine } from '@makko/engine';

/**
 * UI Element interface - all UI components implement this
 */
export interface UIElement {
  /** Screen X position */
  x: number;
  /** Screen Y position */
  y: number;
  /** Whether element is visible and should update/render */
  visible: boolean;
  /** Optional update method for interactive elements */
  update?(dt: number): void;
  /** Required render method */
  render(): void;
}

/**
 * UILayer - manages a collection of UI elements
 * Render this AFTER the game world, with camera offset reset
 */
export class UILayer {
  private elements: UIElement[] = [];

  /**
   * Add a UI element to the layer
   */
  add(element: UIElement): void {
    this.elements.push(element);
  }

  /**
   * Remove a UI element from the layer
   */
  remove(element: UIElement): void {
    this.elements = this.elements.filter((e) => e !== element);
  }

  /**
   * Update all visible elements
   */
  update(dt: number): void {
    for (const el of this.elements) {
      if (el.visible && el.update) {
        el.update(dt);
      }
    }
  }

  /**
   * Render all visible elements
   * Call AFTER resetting camera transform
   */
  render(): void {
    const display = MakkoEngine.display;

    // Ensure we're in screen-space (no camera offset)
    display.setGlobalOffset(0, 0);

    for (const el of this.elements) {
      if (el.visible) {
        el.render();
      }
    }
  }

  /**
   * Show all elements
   */
  showAll(): void {
    for (const el of this.elements) {
      el.visible = true;
    }
  }

  /**
   * Hide all elements
   */
  hideAll(): void {
    for (const el of this.elements) {
      el.visible = false;
    }
  }

  /**
   * Clear all elements
   */
  clear(): void {
    this.elements = [];
  }

  /**
   * Get element count
   */
  getCount(): number {
    return this.elements.length;
  }
}

// ============================================================================
// UI Theme Constants
// ============================================================================

/**
 * Default UI theme colors
 * Customize for your game by spreading and overriding values
 */
export const UI_THEME = {
  // Backgrounds
  background: '#111827',
  surface: '#1f2937',
  surfaceHover: '#374151',

  // Borders
  border: '#374151',
  borderLight: '#4b5563',

  // Text
  text: '#f9fafb',
  textMuted: '#9ca3af',
  textDim: '#6b7280',

  // Primary (buttons, highlights)
  primary: '#3b82f6',
  primaryHover: '#2563eb',
  primaryActive: '#1d4ed8',

  // Status bars (semantic colors)
  health: '#22c55e',
  healthLow: '#ef4444',
  mana: '#3b82f6',
  stamina: '#eab308',
  xp: '#a855f7',

  // Font
  font: {
    family: 'system-ui, -apple-system, sans-serif',
    sizeXs: 10,
    sizeSm: 12,
    sizeMd: 14,
    sizeLg: 18,
    sizeXl: 24,
  },

  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },

  // Border radius
  radius: {
    sm: 4,
    md: 6,
    lg: 8,
    full: 9999,
  },
} as const;

export type UITheme = typeof UI_THEME;
