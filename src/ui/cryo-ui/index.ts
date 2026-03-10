/**
 * Cryo Management UI
 *
 * Modal interface for viewing and managing cryo pods.
 * Allows player to wake frozen crew members using power cells.
 */

// Types
export { ButtonBounds, CryoUIState, MODAL_WIDTH, MODAL_HEIGHT, PADDING, CARD_HEIGHT, CARD_MARGIN, ROLE_COLORS } from './types';

// State management
export {
  getSelectedCrewForAssignment,
  setSelectedCrewForAssignment,
  clearShipSelection,
  checkWakeButtonClick,
  checkCloseButtonClick,
  checkAssignButtonClick,
  checkUnassignButtonClick,
  checkShipButtonClick,
  isClickOutsideShipPanel
} from './state';

// Rendering
export { renderCryoPanel } from './panel';
export { renderShipSelectionPanel } from './ship-panel';
