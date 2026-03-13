/**
 * Pause Menu Component
 *
 * Rendering and state management for the in-game pause menu.
 * Provides access to resume, fullscreen toggle, restart, save, and exit options.
 */

import { IDisplay } from '@makko/engine';
import { COLORS, FONTS, LAYOUT } from '../../ui/theme';
import { getSlotInfo, SAVE_SLOTS } from '../../game/persistence';
import type { GameAccess } from '../../game/types';

/**
 * Pause menu visibility states
 */
export type PauseMenuState = 'hidden' | 'main' | 'saveSlots' | 'warning';

/**
 * Main menu options (in display order)
 */
const MAIN_MENU_OPTIONS = [
  'Resume',
  'Fullscreen',
  'Restart Game',
  'Save & Exit',
  'Return to Title'
] as const;

/**
 * Menu layout constants
 */
const MENU_ITEM_WIDTH = 400;
const MENU_ITEM_HEIGHT = 50;
const MENU_ITEM_SPACING = 10;

/**
 * Pause Menu class
 * Manages state and rendering for the pause menu overlay
 */
export class PauseMenu {
  state: PauseMenuState = 'hidden';
  selectedIndex: number = 0;
  selectedSlot: number = 1;
  
  private _isFullscreen: boolean = false;

  /**
   * Show the pause menu (main state)
   */
  show(): void {
    this.state = 'main';
    this.selectedIndex = 0;
  }

  /**
   * Hide the pause menu and reset selection
   */
  hide(): void {
    this.state = 'hidden';
    this.selectedIndex = 0;
    this.selectedSlot = 1;
  }

  /**
   * Check if pause menu is currently visible
   */
  isShowing(): boolean {
    return this.state !== 'hidden';
  }

  /**
   * Update fullscreen state for display
   */
  setFullscreenState(isFullscreen: boolean): void {
    this._isFullscreen = isFullscreen;
  }

  /**
   * Navigate selection up
   */
  navigateUp(): void {
    if (this.state === 'main') {
      this.selectedIndex = (this.selectedIndex - 1 + MAIN_MENU_OPTIONS.length) % MAIN_MENU_OPTIONS.length;
    } else if (this.state === 'saveSlots') {
      // Navigate through 3 slots + back button
      if (this.selectedSlot > 1) {
        this.selectedSlot--;
      } else {
        this.selectedSlot = 0; // Back button
      }
    } else if (this.state === 'warning') {
      this.selectedIndex = this.selectedIndex === 0 ? 1 : 0;
    }
  }

  /**
   * Navigate selection down
   */
  navigateDown(): void {
    if (this.state === 'main') {
      this.selectedIndex = (this.selectedIndex + 1) % MAIN_MENU_OPTIONS.length;
    } else if (this.state === 'saveSlots') {
      // Navigate through 3 slots + back button
      if (this.selectedSlot === 0) {
        this.selectedSlot = 1;
      } else if (this.selectedSlot < 3) {
        this.selectedSlot++;
      }
      // If at slot 3, stay there (back button is at 0)
    } else if (this.state === 'warning') {
      this.selectedIndex = this.selectedIndex === 0 ? 1 : 0;
    }
  }

  /**
   * Get the currently selected main menu option
   */
  getSelectedOption(): string {
    return MAIN_MENU_OPTIONS[this.selectedIndex];
  }

  /**
   * Render the pause menu overlay
   */
  render(display: IDisplay, _game: GameAccess): void {
    if (this.state === 'hidden') return;

    // Darken background
    display.drawRect(0, 0, display.width, display.height, {
      fill: '#000000',
      alpha: 0.7
    });

    switch (this.state) {
      case 'main':
        this.renderMainMenu(display);
        break;
      case 'saveSlots':
        this.renderSaveSlots(display);
        break;
      case 'warning':
        this.renderWarning(display);
        break;
    }
  }

  /**
   * Render the main pause menu
   */
  private renderMainMenu(display: IDisplay): void {
    const totalHeight = MAIN_MENU_OPTIONS.length * MENU_ITEM_HEIGHT + 
                        (MAIN_MENU_OPTIONS.length - 1) * MENU_ITEM_SPACING;
    const startY = (display.height - totalHeight) / 2;
    const startX = (display.width - MENU_ITEM_WIDTH) / 2;

    // Render each menu option
    MAIN_MENU_OPTIONS.forEach((option, index) => {
      const y = startY + index * (MENU_ITEM_HEIGHT + MENU_ITEM_SPACING);
      const isSelected = index === this.selectedIndex;

      // Get display text (add fullscreen state for that option)
      const displayText = option === 'Fullscreen'
        ? (this._isFullscreen ? 'Fullscreen: On' : 'Fullscreen: Off')
        : option;

      this.renderMenuItem(display, startX, y, displayText, isSelected);
    });
  }

  /**
   * Render the save slot picker
   */
  private renderSaveSlots(display: IDisplay): void {
    const modalWidth = 500;
    const modalHeight = 450;
    const modalX = (display.width - modalWidth) / 2;
    const modalY = (display.height - modalHeight) / 2;

    // Modal background
    display.drawRoundRect(modalX, modalY, modalWidth, modalHeight, LAYOUT.borderRadiusLarge, {
      fill: COLORS.panelBg,
      alpha: 0.95
    });

    // Modal border
    display.drawRoundRect(modalX, modalY, modalWidth, modalHeight, LAYOUT.borderRadiusLarge, {
      stroke: COLORS.neonCyan,
      lineWidth: LAYOUT.borderWidthThick,
      alpha: 1
    });

    // Title
    display.drawText('Select Save Slot', modalX + modalWidth / 2, modalY + 40, {
      font: FONTS.titleFont,
      fill: COLORS.neonCyan,
      align: 'center'
    });

    // Render 3 save slots
    const slotWidth = 420;
    const slotHeight = 80;
    const slotStartY = modalY + 90;
    const slotSpacing = 15;

    SAVE_SLOTS.forEach((slot, index) => {
      const slotY = slotStartY + index * (slotHeight + slotSpacing);
      const isSelected = this.selectedSlot === slot;
      const slotInfo = getSlotInfo(slot);

      this.renderSaveSlot(
        display,
        modalX + (modalWidth - slotWidth) / 2,
        slotY,
        slotWidth,
        slotHeight,
        slot,
        slotInfo,
        isSelected
      );
    });

    // Back button
    const backY = modalY + modalHeight - 60;
    const isBackSelected = this.selectedSlot === 0;
    this.renderMenuItem(
      display,
      modalX + (modalWidth - 200) / 2,
      backY,
      'Back',
      isBackSelected,
      200
    );
  }

  /**
   * Render the warning confirmation dialog
   */
  private renderWarning(display: IDisplay): void {
    const modalWidth = 500;
    const modalHeight = 280;
    const modalX = (display.width - modalWidth) / 2;
    const modalY = (display.height - modalHeight) / 2;

    // Modal background
    display.drawRoundRect(modalX, modalY, modalWidth, modalHeight, LAYOUT.borderRadiusLarge, {
      fill: COLORS.panelBg,
      alpha: 0.95
    });

    // Modal border (warning color)
    display.drawRoundRect(modalX, modalY, modalWidth, modalHeight, LAYOUT.borderRadiusLarge, {
      stroke: COLORS.warningRed,
      lineWidth: LAYOUT.borderWidthThick,
      alpha: 1
    });

    // Title
    display.drawText('Unsaved Progress', modalX + modalWidth / 2, modalY + 40, {
      font: FONTS.titleFont,
      fill: COLORS.warningRed,
      align: 'center'
    });

    // Warning text
    const warningLines = [
      'Returning to title will lose all progress',
      'since your last save.',
      '',
      'Continue?'
    ];
    const lineStartY = modalY + 90;
    const lineHeight = 28;

    warningLines.forEach((line, index) => {
      display.drawText(line, modalX + modalWidth / 2, lineStartY + index * lineHeight, {
        font: FONTS.bodyFont,
        fill: COLORS.white,
        align: 'center'
      });
    });

    // Buttons
    const buttonWidth = 220;
    const buttonHeight = 50;
    const buttonY = modalY + modalHeight - 70;
    const buttonSpacing = 20;
    const totalButtonWidth = buttonWidth * 2 + buttonSpacing;
    const buttonStartX = modalX + (modalWidth - totalButtonWidth) / 2;

    // Yes button
    this.renderMenuItem(
      display,
      buttonStartX,
      buttonY,
      'Yes, Return to Title',
      this.selectedIndex === 0,
      buttonWidth,
      COLORS.warningRed
    );

    // No button
    this.renderMenuItem(
      display,
      buttonStartX + buttonWidth + buttonSpacing,
      buttonY,
      'No, Go Back',
      this.selectedIndex === 1,
      buttonWidth
    );
  }

  /**
   * Render a single menu item button
   */
  private renderMenuItem(
    display: IDisplay,
    x: number,
    y: number,
    text: string,
    isSelected: boolean,
    width: number = MENU_ITEM_WIDTH,
    accentColor: string = COLORS.neonCyan
  ): void {
    // Button background
    display.drawRoundRect(x, y, width, MENU_ITEM_HEIGHT, LAYOUT.borderRadius, {
      fill: isSelected ? COLORS.cardBg : COLORS.panelBg,
      alpha: isSelected ? 1 : 0.9
    });

    // Button border
    display.drawRoundRect(x, y, width, MENU_ITEM_HEIGHT, LAYOUT.borderRadius, {
      stroke: isSelected ? accentColor : COLORS.border,
      lineWidth: isSelected ? LAYOUT.borderWidthThick : LAYOUT.borderWidth,
      alpha: 1
    });

    // Button text
    display.drawText(text, x + width / 2, y + MENU_ITEM_HEIGHT / 2, {
      font: FONTS.labelFont,
      fill: isSelected ? COLORS.white : COLORS.dimText,
      align: 'center',
      baseline: 'middle'
    });
  }

  /**
   * Render a save slot button with info
   */
  private renderSaveSlot(
    display: IDisplay,
    x: number,
    y: number,
    width: number,
    height: number,
    slot: number,
    slotInfo: { exists: boolean; debt: number; sector: number; runsCompleted: number } | null,
    isSelected: boolean
  ): void {
    // Slot background
    display.drawRoundRect(x, y, width, height, LAYOUT.borderRadius, {
      fill: isSelected ? COLORS.cardBg : COLORS.panelBg,
      alpha: isSelected ? 1 : 0.9
    });

    // Slot border
    display.drawRoundRect(x, y, width, height, LAYOUT.borderRadius, {
      stroke: isSelected ? COLORS.neonCyan : COLORS.border,
      lineWidth: isSelected ? LAYOUT.borderWidthThick : LAYOUT.borderWidth,
      alpha: 1
    });

    // Slot number
    display.drawText(`Slot ${slot}`, x + 20, y + height / 2 - 12, {
      font: FONTS.labelFont,
      fill: isSelected ? COLORS.neonCyan : COLORS.brightText,
      align: 'left',
      baseline: 'middle'
    });

    // Slot info
    if (slotInfo) {
      const infoText = `Debt: ${slotInfo.debt.toLocaleString()} | Sector: ${slotInfo.sector} | Runs: ${slotInfo.runsCompleted}`;
      display.drawText(infoText, x + 20, y + height / 2 + 12, {
        font: FONTS.smallFont,
        fill: COLORS.dimText,
        align: 'left',
        baseline: 'middle'
      });
    } else {
      display.drawText('Empty', x + 20, y + height / 2 + 12, {
        font: FONTS.smallFont,
        fill: COLORS.disabled,
        align: 'left',
        baseline: 'middle'
      });
    }
  }
}
