/**
 * Types and constants for Cryo UI
 */

import { CrewRole } from '../../types/crew';
import { COLORS, LAYOUT } from '../theme';

/**
 * Button bounds for click detection
 */
export interface ButtonBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  crewId?: string;
  shipId?: number;
  isClose?: boolean;
  action?: 'wake' | 'assign' | 'unassign';
}

/**
 * State for tracking button interactions
 */
export class CryoUIState {
  wakeButtons: ButtonBounds[] = [];
  assignButtons: ButtonBounds[] = [];
  unassignButtons: ButtonBounds[] = [];
  shipButtons: ButtonBounds[] = [];
  closeButton: ButtonBounds | null = null;
  selectedCrewForAssignment: string | null = null;
  
  reset(): void {
    this.wakeButtons = [];
    this.assignButtons = [];
    this.unassignButtons = [];
    this.shipButtons = [];
    this.closeButton = null;
  }
  
  clearSelection(): void {
    this.selectedCrewForAssignment = null;
    this.shipButtons = [];
  }
}

/**
 * Modal dimensions
 */
export const MODAL_WIDTH = 700;
export const MODAL_HEIGHT = 650;
export const PADDING = LAYOUT.padding;
export const CARD_HEIGHT = 100;
export const CARD_MARGIN = 12;

/**
 * Role colors for visual distinction
 */
export const ROLE_COLORS: Record<CrewRole, string> = {
  engineer: COLORS.successGreen,
  scientist: COLORS.neonCyan,
  medic: COLORS.neonMagenta,
  scavenger: COLORS.warningYellow,
};
