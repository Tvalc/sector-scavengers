/**
 * Input Handler
 *
 * Centralized input processing for the idle scene.
 */

import { MakkoEngine } from '@makko/engine';
import { HubSystem } from '../../systems/hub-system';
import { Game } from '../../game/game';
import { isPointInBounds } from './render-utils';
import { DIVE_BUTTON_BOUNDS, HELP_BUTTON_BOUNDS } from './render-ui';
import { NodeDebugger } from './debug';

/** Result of input processing */
export interface InputResult {
  /** Whether input was consumed (don't process further) */
  consumed: boolean;
  /** Whether help modal should toggle */
  toggleHelp: boolean;
  /** Cell ID being hovered (null if none) */
  hoveredCellId: number | null;
}

/**
 * InputHandler processes mouse and keyboard input
 */
export class InputHandler {
  private nodeDebugger: NodeDebugger;
  private showHowToPlay: boolean = false;

  constructor(nodeDebugger: NodeDebugger) {
    this.nodeDebugger = nodeDebugger;
  }

  /** Get current help modal state */
  get isHelpShowing(): boolean {
    return this.showHowToPlay;
  }

  /** Set help modal state */
  setHelpShowing(value: boolean): void {
    this.showHowToPlay = value;
  }

  /** Process all input for the frame */
  handleInput(game: Game, hubSystem: HubSystem): InputResult {
    const result: InputResult = {
      consumed: false,
      toggleHelp: false,
      hoveredCellId: null
    };

    const input = MakkoEngine.input;

    // Toggle node debugger
    if (input.isKeyPressed('KeyD')) {
      this.nodeDebugger.toggle();
      result.consumed = true;
      return result;
    }

    // Handle debugger input if active
    if (this.nodeDebugger.isEnabled) {
      result.consumed = this.nodeDebugger.handleInput();
      return result;
    }

    // Toggle help modal
    if (input.isKeyPressed('KeyH') || input.isKeyPressed('Slash')) {
      this.showHowToPlay = !this.showHowToPlay;
      result.toggleHelp = true;
      result.consumed = true;
      return result;
    }

    // Close modal on Escape
    if (input.isKeyPressed('Escape') && this.showHowToPlay) {
      this.showHowToPlay = false;
      result.consumed = true;
      return result;
    }

    // Don't process other input if modal is showing
    if (this.showHowToPlay) {
      result.consumed = true;
      return result;
    }

    // Mouse interaction
    const mouseX = input.mouseX;
    const mouseY = input.mouseY;

    if (mouseX !== undefined && mouseY !== undefined) {
      return this.handleMouseInput(game, hubSystem, mouseX, mouseY);
    }

    return result;
  }

  private handleMouseInput(
    game: Game, 
    hubSystem: HubSystem, 
    mouseX: number, 
    mouseY: number
  ): InputResult {
    const result: InputResult = {
      consumed: false,
      toggleHelp: false,
      hoveredCellId: null
    };

    const input = MakkoEngine.input;

    // Check DIVE button
    if (isPointInBounds(mouseX, mouseY, DIVE_BUTTON_BOUNDS)) {
      MakkoEngine.display.setCursor('pointer');
      if (input.isMousePressed(0)) {
        this.handleDiveClick(game, hubSystem);
        result.consumed = true;
      }
      return result;
    }

    // Check Help button
    if (isPointInBounds(mouseX, mouseY, HELP_BUTTON_BOUNDS)) {
      MakkoEngine.display.setCursor('pointer');
      if (input.isMousePressed(0)) {
        this.showHowToPlay = !this.showHowToPlay;
        result.toggleHelp = true;
        result.consumed = true;
      }
      return result;
    }

    // Check hub cells
    const cellId = hubSystem.getCellAtPosition(mouseX, mouseY);
    const cell = cellId !== null ? hubSystem.getCell(cellId) : null;

    if (cell && cell.hasSpaceship) {
      result.hoveredCellId = cellId;
      MakkoEngine.display.setCursor('pointer');

      if (input.isMousePressed(0)) {
        hubSystem.selectCell(cellId);
        result.consumed = true;
      }
    } else {
      MakkoEngine.display.setCursor('default');
    }

    return result;
  }

  private handleDiveClick(game: Game, hubSystem: HubSystem): void {
    const selectedCount = hubSystem.getSelectedCount();
    
    if (selectedCount < 1) return;

    const selectedIds = hubSystem.getSelectedCellIds();
    game.setHubSelectedNodes(selectedIds);
    game.startDepthDive();
  }
}
