/**
 * Depth Dive Input Handling
 * 
 * Processes mouse and keyboard input for the depth dive scene.
 */

import { MakkoEngine } from '@makko/engine';
import { BUTTON_BOUNDS, CARD_DIMENSIONS } from './types';
import type { DepthDiveScene } from './index';

export function handleInput(scene: DepthDiveScene): void {
  const input = MakkoEngine.input;
  const run = scene.getGame().state.currentRun;

  // Block input during transition
  if (!scene.getTransitionOverlay().isComplete()) {
    return;
  }

  if (!run || run.collapsed) {
    handleCollapsedInput(scene);
    return;
  }

  // Handle discovery modal
  if (scene.getDiscoverySystem().isShowingModal()) {
    if (input.isKeyPressed('Space') || input.isKeyPressed('Enter')) {
      scene.getDiscoverySystem().hideModal();
    }
    return;
  }

  handleMouseInput(scene);
  handleKeyboardInput(scene);
}

function handleCollapsedInput(scene: DepthDiveScene): void {
  const input = MakkoEngine.input;
  if (input.isKeyPressed('Space') || input.isKeyPressed('Enter')) {
    scene.getGame().endDepthDive();
  }
}

function handleMouseInput(scene: DepthDiveScene): void {
  const input = MakkoEngine.input;
  const mouseX = input.mouseX;
  const mouseY = input.mouseY;

  scene.setHoveredCardIndex(null);

  if (mouseX === undefined || mouseY === undefined) return;

  // Check card hover
  const cardIndex = getCardAtPosition(mouseX, mouseY, scene.getCurrentDraft().length);
  if (cardIndex !== null) {
    scene.setHoveredCardIndex(cardIndex);
    MakkoEngine.display.setCursor('pointer');
    
    if (input.isMousePressed(0)) {
      scene.playCard(cardIndex);
    }
    return;
  }

  // Check reroll button
  if (scene.getCardSystem().canShowRerollButton() && 
      isPointInBounds(mouseX, mouseY, BUTTON_BOUNDS.reroll)) {
    MakkoEngine.display.setCursor('pointer');
    if (input.isMousePressed(0) && scene.getCardSystem().rerollHand()) {
      scene.generateNewDraft();
    }
    return;
  }

  // Check Dead Drop button
  if (scene.getCardSystem().canShowDeadDropButton() && 
      isPointInBounds(mouseX, mouseY, BUTTON_BOUNDS.deadDrop)) {
    MakkoEngine.display.setCursor('pointer');
    if (input.isMousePressed(0)) {
      scene.getCardSystem().activateDeadDrop();
    }
    return;
  }

  // Check flee button
  if (isPointInBounds(mouseX, mouseY, BUTTON_BOUNDS.flee)) {
    MakkoEngine.display.setCursor('pointer');
    if (input.isMousePressed(0)) {
      scene.flee();
    }
    return;
  }

  MakkoEngine.display.setCursor('default');
}

function handleKeyboardInput(scene: DepthDiveScene): void {
  const input = MakkoEngine.input;
  const draftLength = scene.getCurrentDraft().length;

  // Keyboard shortcuts for cards (1, 2, 3)
  if (input.isKeyPressed('Digit1') && draftLength >= 1) scene.playCard(0);
  if (input.isKeyPressed('Digit2') && draftLength >= 2) scene.playCard(1);
  if (input.isKeyPressed('Digit3') && draftLength >= 3) scene.playCard(2);

  // R for reroll
  if (input.isKeyPressed('KeyR') && scene.getCardSystem().canShowRerollButton()) {
    if (scene.getCardSystem().rerollHand()) {
      scene.generateNewDraft();
    }
  }

  // D for Dead Drop
  if (input.isKeyPressed('KeyD') && scene.getCardSystem().canShowDeadDropButton()) {
    scene.getCardSystem().activateDeadDrop();
  }

  // Escape to flee
  if (input.isKeyPressed('Escape')) {
    scene.flee();
  }
}

export function isPointInBounds(
  x: number, 
  y: number, 
  bounds: { x: number; y: number; width: number; height: number }
): boolean {
  return x >= bounds.x && x <= bounds.x + bounds.width &&
         y >= bounds.y && y <= bounds.y + bounds.height;
}

function getCardAtPosition(x: number, y: number, cardCount: number): number | null {
  const centerX = 960;
  const startX = centerX - CARD_DIMENSIONS.spacing;
  const cardY = 700 - CARD_DIMENSIONS.height / 2;

  for (let i = 0; i < cardCount; i++) {
    const cardX = startX + (i * CARD_DIMENSIONS.spacing) - CARD_DIMENSIONS.width / 2;
    if (x >= cardX && x <= cardX + CARD_DIMENSIONS.width &&
        y >= cardY && y <= cardY + CARD_DIMENSIONS.height) {
      return i;
    }
  }
  return null;
}
