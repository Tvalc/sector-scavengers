/**
 * Cryo UI State Management
 * 
 * Singleton state tracker for button interactions.
 */

import { CryoUIState } from './types';

/**
 * Global UI state instance
 */
const uiState = new CryoUIState();

/**
 * Reset button tracking (call at start of each render)
 */
export function resetButtonTracking(): void {
  uiState.reset();
}

/**
 * Register a wake button
 */
export function registerWakeButton(button: { x: number; y: number; width: number; height: number; crewId: string }): void {
  uiState.wakeButtons.push(button);
}

/**
 * Register an assign button
 */
export function registerAssignButton(button: { x: number; y: number; width: number; height: number; crewId: string }): void {
  uiState.assignButtons.push(button);
}

/**
 * Register an unassign button
 */
export function registerUnassignButton(button: { x: number; y: number; width: number; height: number; crewId: string }): void {
  uiState.unassignButtons.push(button);
}

/**
 * Register ship selection button
 */
export function registerShipButton(button: { x: number; y: number; width: number; height: number; shipId: number; crewId: string }): void {
  uiState.shipButtons.push(button);
}

/**
 * Register close button
 */
export function registerCloseButton(button: { x: number; y: number; width: number; height: number }): void {
  uiState.closeButton = { ...button, isClose: true };
}

/**
 * Get selected crew for assignment
 */
export function getSelectedCrewForAssignment(): string | null {
  return uiState.selectedCrewForAssignment;
}

/**
 * Set selected crew for assignment
 */
export function setSelectedCrewForAssignment(crewId: string | null): void {
  uiState.selectedCrewForAssignment = crewId;
  if (!crewId) {
    uiState.shipButtons = [];
  }
}

/**
 * Clear ship selection
 */
export function clearShipSelection(): void {
  uiState.clearSelection();
}

/**
 * Check if point is inside a button
 */
function isInsideButton(x: number, y: number, button: { x: number; y: number; width: number; height: number }): boolean {
  return x >= button.x && x <= button.x + button.width && y >= button.y && y <= button.y + button.height;
}

/**
 * Check if wake button was clicked
 */
export function checkWakeButtonClick(mouseX: number, mouseY: number, wasClicked: boolean): string | null {
  if (!wasClicked) return null;
  
  for (const button of uiState.wakeButtons) {
    if (isInsideButton(mouseX, mouseY, button)) {
      return button.crewId || null;
    }
  }
  return null;
}

/**
 * Check if close button was clicked
 */
export function checkCloseButtonClick(mouseX: number, mouseY: number, wasClicked: boolean): boolean {
  if (!wasClicked || !uiState.closeButton) return false;
  return isInsideButton(mouseX, mouseY, uiState.closeButton);
}

/**
 * Check if assign button was clicked
 */
export function checkAssignButtonClick(mouseX: number, mouseY: number, wasClicked: boolean): string | null {
  if (!wasClicked) return null;
  
  for (const button of uiState.assignButtons) {
    if (isInsideButton(mouseX, mouseY, button)) {
      return button.crewId || null;
    }
  }
  return null;
}

/**
 * Check if unassign button was clicked
 */
export function checkUnassignButtonClick(mouseX: number, mouseY: number, wasClicked: boolean): string | null {
  if (!wasClicked) return null;
  
  for (const button of uiState.unassignButtons) {
    if (isInsideButton(mouseX, mouseY, button)) {
      return button.crewId || null;
    }
  }
  return null;
}

/**
 * Check if ship button was clicked
 */
export function checkShipButtonClick(mouseX: number, mouseY: number, wasClicked: boolean): { crewId: string; shipId: number } | null {
  if (!wasClicked) return null;
  
  for (const button of uiState.shipButtons) {
    if (isInsideButton(mouseX, mouseY, button)) {
      return { crewId: button.crewId!, shipId: button.shipId! };
    }
  }
  return null;
}

/**
 * Check if click is outside ship selection panel
 */
export function isClickOutsideShipPanel(mouseX: number, mouseY: number): boolean {
  if (!uiState.selectedCrewForAssignment) return false;
  
  const modalX = (1920 - 700) / 2;
  const modalY = (1080 - 650) / 2;
  const panelX = modalX + 700 + 20;
  const panelY = modalY + 140;
  const panelWidth = 250;
  const panelHeight = 200;
  
  return mouseX < panelX || mouseX > panelX + panelWidth || mouseY < panelY || mouseY > panelY + panelHeight;
}
