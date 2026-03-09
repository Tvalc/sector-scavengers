/**
 * Dialogue UI
 *
 * Renders dialogue box, speaker name, text, and choices.
 * Handles input for advancing dialogue and selecting choices.
 *
 * Usage:
 *   const dialogueUI = new DialogueUI(dialogueManager);
 *   // In game loop:
 *   dialogueUI.handleInput();
 *   dialogueUI.render();
 */

import { MakkoEngine } from '@makko/engine';
import type { DialogueManager } from './dialogue-manager';

/**
 * UI Theme for dialogue (customize for your game)
 */
const DIALOGUE_THEME = {
  // Box
  boxColor: '#1a1a2e',
  boxBorder: '#4a4a6a',
  boxRadius: 8,

  // Text
  speakerColor: '#4a90d9',
  textColor: '#ffffff',
  textMuted: '#aaaacc',

  // Choices
  choiceColor: '#ffffff',
  choiceSelected: '#4a90d9',

  // Font
  fontFamily: 'monospace',
  fontSizeSpeaker: 18,
  fontSizeText: 16,
  fontSizeChoice: 14,

  // Padding
  padding: 16,
} as const;

/**
 * DialogueUI - renders and handles input for dialogue
 */
export class DialogueUI {
  // Box position and size (customize for your game's resolution)
  private boxX: number = 50;
  private boxY: number = 400;
  private boxWidth: number = 700;
  private boxHeight: number = 150;

  private dialogueManager: DialogueManager;
  private selectedChoice: number = 0;

  constructor(dialogueManager: DialogueManager) {
    this.dialogueManager = dialogueManager;
  }

  /**
   * Set dialogue box position and size
   */
  setBox(x: number, y: number, width: number, height: number): void {
    this.boxX = x;
    this.boxY = y;
    this.boxWidth = width;
    this.boxHeight = height;
  }

  /**
   * Handle input for dialogue navigation
   */
  handleInput(): void {
    if (!this.dialogueManager.isDialogueActive()) return;

    const input = MakkoEngine.input;
    const choices = this.dialogueManager.getAvailableChoices();

    if (choices.length > 0 && this.dialogueManager.isComplete()) {
      // Navigate choices with arrow keys
      if (input.isKeyPressed('ArrowUp') || input.isKeyPressed('KeyW')) {
        this.selectedChoice = Math.max(0, this.selectedChoice - 1);
      }
      if (input.isKeyPressed('ArrowDown') || input.isKeyPressed('KeyS')) {
        this.selectedChoice = Math.min(choices.length - 1, this.selectedChoice + 1);
      }

      // Select choice with Enter or Space
      if (input.isKeyPressed('Enter') || input.isKeyPressed('Space')) {
        this.dialogueManager.selectChoice(this.selectedChoice);
        this.selectedChoice = 0;
      }
    } else {
      // Advance dialogue with Enter or Space
      if (input.isKeyPressed('Enter') || input.isKeyPressed('Space')) {
        this.dialogueManager.advance();
      }
    }
  }

  /**
   * Render the dialogue UI
   */
  render(): void {
    const display = MakkoEngine.display;

    if (!this.dialogueManager.isDialogueActive()) return;

    const node = this.dialogueManager.getCurrentNode();
    if (!node) return;

    const padding = DIALOGUE_THEME.padding;

    // Reset camera offset for screen-space rendering
    display.setGlobalOffset(0, 0);

    // Draw dialogue box
    display.drawRoundRect(
      this.boxX,
      this.boxY,
      this.boxWidth,
      this.boxHeight,
      DIALOGUE_THEME.boxRadius,
      {
        fill: DIALOGUE_THEME.boxColor,
        stroke: DIALOGUE_THEME.boxBorder,
        lineWidth: 1,
      }
    );

    // Draw speaker name
    display.drawText(
      node.speaker,
      this.boxX + padding,
      this.boxY + padding + DIALOGUE_THEME.fontSizeSpeaker,
      {
        fill: DIALOGUE_THEME.speakerColor,
        font: `bold ${DIALOGUE_THEME.fontSizeSpeaker}px ${DIALOGUE_THEME.fontFamily}`,
        align: 'left',
      }
    );

    // Draw text with word wrapping
    const textY = this.boxY + padding + DIALOGUE_THEME.fontSizeSpeaker + 24;
    this.wrapText(
      this.dialogueManager.getDisplayedText(),
      this.boxX + padding,
      textY,
      this.boxWidth - padding * 2,
      20
    );

    // Draw choices or continue prompt
    if (this.dialogueManager.isComplete()) {
      const choices = this.dialogueManager.getAvailableChoices();

      if (choices.length > 0) {
        const choiceY = this.boxY + 90;
        choices.forEach((choice, i) => {
          const isSelected = i === this.selectedChoice;
          const color = isSelected
            ? DIALOGUE_THEME.choiceSelected
            : DIALOGUE_THEME.choiceColor;
          const prefix = isSelected ? '> ' : '  ';

          display.drawText(
            prefix + choice.text,
            this.boxX + padding + 10,
            choiceY + i * 20,
            {
              fill: color,
              font: `${DIALOGUE_THEME.fontSizeChoice}px ${DIALOGUE_THEME.fontFamily}`,
            }
          );
        });
      } else {
        // Continue prompt
        display.drawText(
          '[Enter]',
          this.boxX + this.boxWidth - padding,
          this.boxY + this.boxHeight - padding,
          {
            fill: DIALOGUE_THEME.textMuted,
            font: `${DIALOGUE_THEME.fontSizeChoice}px ${DIALOGUE_THEME.fontFamily}`,
            align: 'right',
          }
        );
      }
    }

    // Portrait rendering is handled by PortraitManager
    // No placeholder needed - animated portraits render separately
  }

  /**
   * Word-wrap text rendering
   */
  private wrapText(
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ): void {
    const display = MakkoEngine.display;
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    const font = `${DIALOGUE_THEME.fontSizeText}px ${DIALOGUE_THEME.fontFamily}`;

    for (const word of words) {
      const testLine = line + word + ' ';
      const metrics = display.measureText(testLine, { font });

      if (metrics.width > maxWidth && line !== '') {
        display.drawText(line, x, currentY, {
          fill: DIALOGUE_THEME.textColor,
          font,
        });
        line = word + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }

    display.drawText(line, x, currentY, {
      fill: DIALOGUE_THEME.textColor,
      font,
    });
  }
}
