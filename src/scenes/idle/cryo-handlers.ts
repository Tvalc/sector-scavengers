/**
 * Cryo Modal Handlers
 *
 * Handles cryo modal input and crew management (wake, assign, unassign).
 */

import { MakkoEngine, IDisplay } from '@makko/engine';
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

/** Modal dimensions for click-outside detection */
const CRYO_MODAL_WIDTH = 700;
const CRYO_MODAL_HEIGHT = 650;

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
  
  // Check for close button click
  const closeButtonClicked = checkCloseButtonClick(mouseX, mouseY, input.isMousePressed(0));
  if (closeButtonClicked) {
    inputHandler.setCryoModalShowing(false);
    clearShipSelection();
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
    handleWakeCrew(game, wakeCrewId);
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
  }
}

/**
 * Handle waking a crew member
 */
export function handleWakeCrew(game: Game, crewId: string): void {
  const cryoState = game.state.cryoState;
  if (!cryoState) return;
  
  const pod = cryoState.pods.find(p => p.crew.id === crewId);
  if (!pod) return;
  
  const powerCells = game.state.resources.powerCells;
  const awakeCount = cryoState.awakenedCount;
  
  const result = wakeCrewMember(pod, powerCells, awakeCount);
  
  if (result.success) {
    game.state.resources.powerCells -= result.cost;
    cryoState.awakenedCount++;
    console.log(`[Cryo] Woke ${pod.crew.name} for ${result.cost} power cells`);
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
  
  renderCryoPanel(display, allCrew, powerCells);
  
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
