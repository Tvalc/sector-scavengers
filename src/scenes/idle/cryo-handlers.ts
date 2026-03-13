/**
 * Cryo Modal Handlers
 *
 * Handles cryo modal input and crew management (wake, assign, unassign).
 */

import { MakkoEngine, IDisplay } from '@makko/engine';
import { COLORS, FONTS, LAYOUT } from '../../ui/theme';
import type { Game } from '../../game/game';
import type { InputHandler } from './input-handler';
import { 
  renderCryoPanel,
  checkWakeButtonClick, 
  checkCloseButtonClick,
  checkAssignButtonClick,
  checkUnassignButtonClick,
  renderShipSelectionPanel,
  checkShipButtonClick,
  setSelectedCrewForAssignment,
  clearShipSelection,
  isClickOutsideShipPanel
} from '../../ui/cryo-ui';
import { wakeCrewMember, getFrozenPods, getAwakenedCrew } from '../../systems/cryo-system';
import { AUTHORED_RECRUIT_DEBT_COST, getAuthoredRecruit } from '../../types/crew';

/** Modal dimensions for click-outside detection */
const CRYO_MODAL_WIDTH = 700;
const CRYO_MODAL_HEIGHT = 650;

/** Confirmation dialog state */
let pendingAuthoredWake: { crewId: string; crewName: string } | null = null;
let confirmDialogVisible = false;

/** Button bounds for confirmation dialog */
let confirmYesButton = { x: 0, y: 0, width: 0, height: 0 };
let confirmNoButton = { x: 0, y: 0, width: 0, height: 0 };

/**
 * Handle cryo modal input
 */
export function handleCryoModalInput(
  game: Game,
  inputHandler: InputHandler
): void {
  const input = MakkoEngine.input;
  const mouseX = input.mouseX;
  const mouseY = input.mouseY;
  
  if (mouseX === undefined || mouseY === undefined) return;
  
  // Handle confirmation dialog if visible
  if (confirmDialogVisible && pendingAuthoredWake) {
    // Check YES button
    if (isClickInBounds(mouseX, mouseY, confirmYesButton) && input.isMousePressed(0)) {
      // Proceed with wake
      handleWakeCrewConfirmed(game, pendingAuthoredWake.crewId);
      confirmDialogVisible = false;
      pendingAuthoredWake = null;
      return;
    }
    
    // Check NO button
    if (isClickInBounds(mouseX, mouseY, confirmNoButton) && input.isMousePressed(0)) {
      confirmDialogVisible = false;
      pendingAuthoredWake = null;
      return;
    }
    
    return; // Block other input while dialog is open
  }
  
  // Check for close button click
  const closeButtonClicked = checkCloseButtonClick(mouseX, mouseY, input.isMousePressed(0));
  if (closeButtonClicked) {
    inputHandler.setCryoModalShowing(false);
    clearShipSelection();
    confirmDialogVisible = false;
    pendingAuthoredWake = null;
    return;
  }
  
  // Check for ship selection (if panel is open)
  const shipSelection = checkShipButtonClick(mouseX, mouseY, input.isMousePressed(0));
  if (shipSelection) {
    handleAssignCrew(game, shipSelection.crewId, shipSelection.shipId);
    clearShipSelection();
    return;
  }
  
  // Check for wake button click
  const wakeCrewId = checkWakeButtonClick(mouseX, mouseY, input.isMousePressed(0));
  if (wakeCrewId) {
    // Check if this is an authored recruit
    const cryoState = game.state.cryoState;
    if (cryoState) {
      const pod = cryoState.pods.find(p => p.crew.id === wakeCrewId);
      if (pod && pod.crew.isAuthored) {
        // Show confirmation dialog
        pendingAuthoredWake = { crewId: wakeCrewId, crewName: pod.crew.name };
        confirmDialogVisible = true;
        return;
      }
    }
    
    // Generic crew - wake immediately
    handleWakeCrewConfirmed(game, wakeCrewId);
    return;
  }
  
  // Check for assign button click
  const assignCrewId = checkAssignButtonClick(mouseX, mouseY, input.isMousePressed(0));
  if (assignCrewId) {
    setSelectedCrewForAssignment(assignCrewId);
    return;
  }
  
  // Check for unassign button click
  const unassignCrewId = checkUnassignButtonClick(mouseX, mouseY, input.isMousePressed(0));
  if (unassignCrewId) {
    handleUnassignCrew(game, unassignCrewId);
    return;
  }
  
  // Check for click outside ship selection panel
  if (input.isMousePressed(0) && isClickOutsideShipPanel(mouseX, mouseY)) {
    clearShipSelection();
  }
  
  // Check for click outside modal
  if (input.isMousePressed(0) && isClickOutsideCryoPanel(mouseX, mouseY)) {
    inputHandler.setCryoModalShowing(false);
    clearShipSelection();
    confirmDialogVisible = false;
    pendingAuthoredWake = null;
  }
}

/**
 * Handle waking a crew member (with confirmation check)
 */
export function handleWakeCrew(game: Game, crewId: string): void {
  const cryoState = game.state.cryoState;
  if (!cryoState) return;
  
  const pod = cryoState.pods.find(p => p.crew.id === crewId);
  if (!pod) return;
  
  // Check if this is an authored recruit - show confirmation
  if (pod.crew.isAuthored) {
    pendingAuthoredWake = { crewId, crewName: pod.crew.name };
    confirmDialogVisible = true;
    return;
  }
  
  // Generic crew - wake immediately
  handleWakeCrewConfirmed(game, crewId);
}

/**
 * Handle confirmed wake (after dialog for authored, or immediate for generic)
 */
function handleWakeCrewConfirmed(game: Game, crewId: string): void {
  const cryoState = game.state.cryoState;
  if (!cryoState) return;
  
  const pod = cryoState.pods.find(p => p.crew.id === crewId);
  if (!pod) return;
  
  const powerCells = game.state.resources.powerCells;
  const awakeCount = cryoState.awakenedCount;
  
  const result = wakeCrewMember(pod, powerCells, awakeCount, game.storyState, game);
  
  if (result.success) {
    game.state.resources.powerCells -= result.cost;
    cryoState.awakenedCount++;
    console.log(`[Cryo] Woke ${pod.crew.name} for ${result.cost} power cells${result.debtCost > 0 ? ` + ${result.debtCost.toLocaleString()} debt` : ''}`);
    game.saveState();
  }
}

/**
 * Handle assigning a crew member to a ship
 */
export function handleAssignCrew(game: Game, crewId: string, shipId: number): void {
  const cryoState = game.state.cryoState;
  if (!cryoState) return;
  
  const pod = cryoState.pods.find(p => p.crew.id === crewId);
  if (!pod) return;
  
  const crew = pod.crew;
  if (!crew.awake) return;
  
  const ship = game.getShip(shipId);
  if (!ship || ship.owner !== 'player') return;
  
  crew.assignment = {
    type: 'ship',
    targetId: shipId
  };
  
  console.log(`[Crew] Assigned ${crew.name} to Ship #${shipId}`);
  game.saveState();
}

/**
 * Handle unassigning a crew member
 */
export function handleUnassignCrew(game: Game, crewId: string): void {
  const cryoState = game.state.cryoState;
  if (!cryoState) return;
  
  const pod = cryoState.pods.find(p => p.crew.id === crewId);
  if (!pod) return;
  
  const crew = pod.crew;
  if (!crew.awake || !crew.assignment) return;
  
  console.log(`[Crew] Unassigned ${crew.name} from Ship #${crew.assignment.targetId}`);
  crew.assignment = undefined;
  game.saveState();
}

/**
 * Render the cryo modal
 */
export function renderCryoModal(display: IDisplay, game: Game): void {
  const cryoState = game.state.cryoState;
  if (!cryoState) return;
  
  const frozenPods = getFrozenPods(cryoState);
  const awakeCrew = getAwakenedCrew(cryoState);
  const allCrew = [...frozenPods.map(p => p.crew), ...awakeCrew];
  const powerCells = game.state.resources.powerCells;
  const currentDebt = game.state.meta.debt;
  const debtCeiling = game.state.meta.debtCeiling;
  const isDebtLocked = game.isDebtLocked();
  
  renderCryoPanel(display, allCrew, powerCells, currentDebt, debtCeiling, isDebtLocked);
  
  // Render ship selection panel
  const playerShips = game.getPlayerShips();
  const shipsWithCrew = playerShips.map(ship => {
    const crewAssignments = awakeCrew
      .filter(c => c.assignment && c.assignment.type === 'ship' && c.assignment.targetId === ship.id)
      .map(c => c.id);
    
    return {
      id: ship.id,
      shipClass: ship.shipClass,
      crewAssignments
    };
  });
  
  renderShipSelectionPanel(display, shipsWithCrew);
  
  // Render confirmation dialog if visible
  if (confirmDialogVisible && pendingAuthoredWake) {
    renderConfirmationDialog(display, pendingAuthoredWake.crewName);
  }
}

// Helper functions

function isClickOutsideCryoPanel(mouseX: number, mouseY: number): boolean {
  const modalX = (MakkoEngine.display.width - CRYO_MODAL_WIDTH) / 2;
  const modalY = (MakkoEngine.display.height - CRYO_MODAL_HEIGHT) / 2;
  
  return (
    mouseX < modalX || 
    mouseX > modalX + CRYO_MODAL_WIDTH ||
    mouseY < modalY || 
    mouseY > modalY + CRYO_MODAL_HEIGHT
  );
}

function isClickInBounds(x: number, y: number, bounds: { x: number; y: number; width: number; height: number }): boolean {
  return x >= bounds.x && x <= bounds.x + bounds.width &&
         y >= bounds.y && y <= bounds.y + bounds.height;
}

/**
 * Render the confirmation dialog for authored recruits
 */
function renderConfirmationDialog(display: IDisplay, crewName: string): void {
  const displayWidth = MakkoEngine.display.width;
  const displayHeight = MakkoEngine.display.height;
  
  const dialogWidth = 450;
  const dialogHeight = 200;
  const dialogX = (displayWidth - dialogWidth) / 2;
  const dialogY = (displayHeight - dialogHeight) / 2;
  
  // Dark overlay
  display.drawRect(0, 0, displayWidth, displayHeight, {
    fill: '#000',
    alpha: 0.7
  });
  
  // Dialog background
  display.drawRoundRect(dialogX, dialogY, dialogWidth, dialogHeight, LAYOUT.borderRadius, {
    fill: COLORS.cardBg,
    stroke: COLORS.neonCyan,
    lineWidth: 2
  });
  
  // Warning icon
  display.drawText('⚠️', dialogX + dialogWidth / 2, dialogY + 35, {
    font: '32px sans-serif',
    align: 'center',
    baseline: 'middle'
  });
  
  // Title
  display.drawText('RECRUITMENT CONTRACT', dialogX + dialogWidth / 2, dialogY + 70, {
    font: FONTS.labelFont,
    fill: COLORS.neonCyan,
    align: 'center'
  });
  
  // Message
  display.drawText(`Recruiting ${crewName} will add`, dialogX + dialogWidth / 2, dialogY + 100, {
    font: FONTS.smallFont,
    fill: COLORS.white,
    align: 'center'
  });
  
  display.drawText(`$1,000,000 to your debt. Proceed?`, dialogX + dialogWidth / 2, dialogY + 120, {
    font: FONTS.smallFont,
    fill: COLORS.warning,
    align: 'center'
  });
  
  // Buttons
  const buttonY = dialogY + dialogHeight - 55;
  const buttonWidth = 120;
  const buttonHeight = 40;
  const buttonSpacing = 20;
  
  // YES button
  confirmYesButton = {
    x: dialogX + (dialogWidth / 2) - buttonWidth - (buttonSpacing / 2),
    y: buttonY,
    width: buttonWidth,
    height: buttonHeight
  };
  
  display.drawRoundRect(confirmYesButton.x, confirmYesButton.y, buttonWidth, buttonHeight, LAYOUT.borderRadiusSmall, {
    fill: COLORS.neonCyan,
    stroke: COLORS.neonCyan,
    lineWidth: 1
  });
  
  display.drawText('YES', confirmYesButton.x + buttonWidth / 2, confirmYesButton.y + buttonHeight / 2, {
    font: FONTS.labelFont,
    fill: '#000',
    align: 'center',
    baseline: 'middle'
  });
  
  // NO button
  confirmNoButton = {
    x: dialogX + (dialogWidth / 2) + (buttonSpacing / 2),
    y: buttonY,
    width: buttonWidth,
    height: buttonHeight
  };
  
  display.drawRoundRect(confirmNoButton.x, confirmNoButton.y, buttonWidth, buttonHeight, LAYOUT.borderRadiusSmall, {
    fill: COLORS.panelBg,
    stroke: COLORS.border,
    lineWidth: 1
  });
  
  display.drawText('NO', confirmNoButton.x + buttonWidth / 2, confirmNoButton.y + buttonHeight / 2, {
    font: FONTS.labelFont,
    fill: COLORS.white,
    align: 'center',
    baseline: 'middle'
  });
}
