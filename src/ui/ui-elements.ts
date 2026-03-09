/**
 * UI Elements
 *
 * Common UI components: Button, StatusBar, Text.
 * All use screen-space coordinates and the UI theme.
 */

import { MakkoEngine } from '@makko/engine';
import { type UIElement, UI_THEME } from './ui-layer';

// ============================================================================
// Button
// ============================================================================

/**
 * Button - clickable UI element with hover/press states
 */
export class Button implements UIElement {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  visible: boolean = true;

  private wasDown: boolean = false;
  private isHovered: boolean = false;
  private isPressed: boolean = false;

  constructor(x: number, y: number, width: number, height: number, label: string) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.label = label;
  }

  update(_dt: number): void {
    const input = MakkoEngine.input;
    const mx = input.mouseX;
    const my = input.mouseY;

    this.isHovered =
      mx >= this.x &&
      mx <= this.x + this.width &&
      my >= this.y &&
      my <= this.y + this.height;

    this.isPressed = this.isHovered && input.isMouseDown();
  }

  /**
   * Returns true only on the frame the mouse is released over the button
   */
  isClicked(): boolean {
    const input = MakkoEngine.input;
    const isOver =
      input.mouseX >= this.x &&
      input.mouseX <= this.x + this.width &&
      input.mouseY >= this.y &&
      input.mouseY <= this.y + this.height;

    const clicked = this.wasDown && !input.isMouseDown() && isOver;
    this.wasDown = input.isMouseDown() && isOver;
    return clicked;
  }

  render(): void {
    const display = MakkoEngine.display;

    // Background with state-based color
    let bgColor: string = UI_THEME.primary;
    if (this.isPressed) {
      bgColor = UI_THEME.primaryActive;
    } else if (this.isHovered) {
      bgColor = UI_THEME.primaryHover;
    }

    display.drawRoundRect(this.x, this.y, this.width, this.height, UI_THEME.radius.md, {
      fill: bgColor,
    });

    // Label
    display.drawText(this.label, this.x + this.width / 2, this.y + this.height / 2, {
      font: `${UI_THEME.font.sizeMd}px ${UI_THEME.font.family}`,
      fill: UI_THEME.text,
      align: 'center',
      baseline: 'middle',
    });
  }
}

// ============================================================================
// StatusBar
// ============================================================================

export type StatusBarType = 'health' | 'mana' | 'stamina' | 'xp';

/**
 * StatusBar - horizontal bar for health, mana, stamina, etc.
 */
export class StatusBar implements UIElement {
  x: number;
  y: number;
  width: number;
  height: number;
  current: number;
  max: number;
  type: StatusBarType;
  visible: boolean = true;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    current: number,
    max: number,
    type: StatusBarType = 'health'
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.current = current;
    this.max = max;
    this.type = type;
  }

  private getBarColor(): string {
    if (this.type === 'health') {
      return this.current / this.max < 0.25 ? UI_THEME.healthLow : UI_THEME.health;
    }
    const colors: Record<StatusBarType, string> = {
      health: UI_THEME.health,
      mana: UI_THEME.mana,
      stamina: UI_THEME.stamina,
      xp: UI_THEME.xp,
    };
    return colors[this.type];
  }

  render(): void {
    const display = MakkoEngine.display;

    // Background track
    display.drawRoundRect(this.x, this.y, this.width, this.height, UI_THEME.radius.sm, {
      fill: UI_THEME.surface,
      stroke: UI_THEME.border,
      lineWidth: 1,
    });

    // Fill bar
    const padding = 2;
    const fillWidth = Math.max(0, (this.width - padding * 2) * (this.current / this.max));

    if (fillWidth > 0) {
      display.drawRoundRect(
        this.x + padding,
        this.y + padding,
        fillWidth,
        this.height - padding * 2,
        UI_THEME.radius.sm - 1,
        { fill: this.getBarColor() }
      );
    }
  }
}

// ============================================================================
// Text
// ============================================================================

export type TextSize = 'sm' | 'md' | 'lg';
export type TextColor = 'text' | 'muted' | 'dim';

/**
 * Text - static or dynamic text display
 */
export type TextAlign = 'left' | 'center' | 'right';

export class Text implements UIElement {
  x: number;
  y: number;
  text: string;
  size: TextSize;
  color: TextColor;
  align: TextAlign;
  visible: boolean = true;

  constructor(
    x: number,
    y: number,
    text: string,
    options: {
      size?: TextSize;
      color?: TextColor;
      align?: TextAlign;
    } = {}
  ) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.size = options.size ?? 'md';
    this.color = options.color ?? 'text';
    this.align = options.align ?? 'left';
  }

  private getFontSize(): number {
    const sizes = {
      sm: UI_THEME.font.sizeSm,
      md: UI_THEME.font.sizeMd,
      lg: UI_THEME.font.sizeLg,
    };
    return sizes[this.size];
  }

  private getColor(): string {
    const colors = {
      text: UI_THEME.text,
      muted: UI_THEME.textMuted,
      dim: UI_THEME.textDim,
    };
    return colors[this.color];
  }

  render(): void {
    const display = MakkoEngine.display;

    display.drawText(this.text, this.x, this.y, {
      font: `${this.getFontSize()}px ${UI_THEME.font.family}`,
      fill: this.getColor(),
      align: this.align,
    });
  }
}

// ============================================================================
// Panel
// ============================================================================

/**
 * Panel - container with background for grouping UI elements
 */
export class Panel implements UIElement {
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean = true;

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  render(): void {
    const display = MakkoEngine.display;

    display.drawRoundRect(this.x, this.y, this.width, this.height, UI_THEME.radius.lg, {
      fill: UI_THEME.surface,
      stroke: UI_THEME.border,
      lineWidth: 1,
    });
  }
}
