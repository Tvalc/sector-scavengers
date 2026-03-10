/**
 * Input Handler
 *
 * Centralized input processing for the idle scene.
 */

import { MakkoEngine } from '@makko/engine';
import { HubSystem } from '../../systems/hub-system';
import { Game } from '../../game/game';
import { isPointInBounds } from './render-utils';
import { 
  DIVE_BUTTON_BOUNDS, 
  MISSION_BUTTON_BOUNDS,
  CREW_BUTTON_BOUNDS,
  INVENTORY_BUTTON_BOUNDS, 
  HELP_BUTTON_BOUNDS,
  INVENTORY_PANEL,
  CREW_PANEL
} from './render-ui';
import { InventorySystem } from '../../systems/inventory-system';
import { NodeDebugger } from './debug';

/** Result of input processing */
export interface InputResult {
  /** Whether input was consumed (don't process further) */
  consumed: boolean;
  /** Whether help modal should toggle */
  toggleHelp: boolean;
  /** Whether inventory panel should toggle */
  toggleInventory: boolean;
  /** Cell ID being hovered (null if none) */
  hoveredCellId: number | null;
  /** Ship ID to show management panel for (null if none) */
  showShipManagement: number | null;
}

/** Hovered slot info for tooltip display */
export interface HoveredSlot {
  category: 'hardware' | 'crew';
  index: number;
}

/**
 * InputHandler processes mouse and keyboard input
 */
export class InputHandler {
  private nodeDebugger: NodeDebugger;
  private showHowToPlay: boolean = false;
  private showInventory: boolean = false;
  private showCrew: boolean = false;
  private showCryoModal: boolean = false;
  private showShipManagement: boolean = false;
  private showMissionModal: boolean = false;
  private selectedShipId: number | null = null;
  private hoveredInventorySlot: HoveredSlot | null = null;

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

  /** Get current inventory panel state */
  get isInventoryShowing(): boolean {
    return this.showInventory;
  }

  /** Set inventory panel state */
  setInventoryShowing(value: boolean): void {
    this.showInventory = value;
  }

  /** Get current crew panel state */
  get isCrewShowing(): boolean {
    return this.showCrew;
  }

  /** Set crew panel state */
  setCrewShowing(value: boolean): void {
    this.showCrew = value;
  }

  /** Get current cryo modal state */
  get isCryoModalShowing(): boolean {
    return this.showCryoModal;
  }

  /** Set cryo modal state */
  setCryoModalShowing(value: boolean): void {
    this.showCryoModal = value;
  }

  /** Get current ship management panel state */
  get isShipManagementShowing(): boolean {
    return this.showShipManagement;
  }

  /** Set ship management panel state */
  setShipManagementShowing(value: boolean): void {
    this.showShipManagement = value;
    if (!value) {
      this.selectedShipId = null;
    }
  }

  /** Get current mission modal state */
  get isMissionModalShowing(): boolean {
    return this.showMissionModal;
  }

  /** Set mission modal state */
  setMissionModalShowing(value: boolean): void {
    this.showMissionModal = value;
  }

  /** Get selected ship ID for management */
  getSelectedShipId(): number | null {
    return this.selectedShipId;
  }

  /** Set selected ship ID for management */
  setSelectedShipId(id: number | null): void {
    this.selectedShipId = id;
  }

  /** Get currently hovered slot */
  getHoveredSlot(): HoveredSlot | null {
    return this.hoveredInventorySlot;
  }

  /** Set hovered slot */
  setHoveredSlot(slot: HoveredSlot | null): void {
    this.hoveredInventorySlot = slot;
  }

  /** Process all input for the frame */
  handleInput(game: Game, hubSystem: HubSystem, inventory?: InventorySystem): InputResult {
    const result: InputResult = {
      consumed: false,
      toggleHelp: false,
      toggleInventory: false,
      hoveredCellId: null,
      showShipManagement: null
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

    // Close modals on Escape (priority: mission > ship management > cryo > help)
    if (input.isKeyPressed('Escape')) {
      if (this.showMissionModal) {
        this.showMissionModal = false;
        result.consumed = true;
        return result;
      }
      if (this.showShipManagement) {
        this.showShipManagement = false;
        this.selectedShipId = null;
        result.consumed = true;
        return result;
      }
      if (this.showCryoModal) {
        this.showCryoModal = false;
        result.consumed = true;
        return result;
      }
      if (this.showHowToPlay) {
        this.showHowToPlay = false;
        result.consumed = true;
        return result;
      }
    }

    // Don't process other input if modal is showing
    if (this.showHowToPlay || this.showCryoModal || this.showShipManagement || this.showMissionModal) {
      result.consumed = true;
      return result;
    }

    // Toggle inventory panel on 'I' key
    if (input.isKeyPressed('KeyI')) {
      this.showInventory = !this.showInventory;
      result.toggleInventory = true;
      result.consumed = true;
      return result;
    }

    // Toggle crew panel on 'C' key
    if (input.isKeyPressed('KeyC')) {
      this.showCrew = !this.showCrew;
      result.consumed = true;
      return result;
    }

    // Mouse interaction
    const mouseX = input.mouseX;
    const mouseY = input.mouseY;

    if (mouseX !== undefined && mouseY !== undefined) {
      return this.handleMouseInput(game, hubSystem, mouseX, mouseY, inventory);
    }

    return result;
  }

  private handleMouseInput(
    game: Game, 
    hubSystem: HubSystem, 
    mouseX: number, 
    mouseY: number,
    inventory?: InventorySystem
  ): InputResult {
    const result: InputResult = {
      consumed: false,
      toggleHelp: false,
      toggleInventory: false,
      hoveredCellId: null,
      showShipManagement: null
    };

    const input = MakkoEngine.input;

    // Reset hovered slot at start
    this.hoveredInventorySlot = null;

    // Check DIVE button
    if (isPointInBounds(mouseX, mouseY, DIVE_BUTTON_BOUNDS)) {
      MakkoEngine.display.setCursor('pointer');
      if (input.isMousePressed(0)) {
        this.handleDiveClick(game, hubSystem);
        result.consumed = true;
      }
      return result;
    }

    // Check Mission button - opens mission modal
    if (isPointInBounds(mouseX, mouseY, MISSION_BUTTON_BOUNDS)) {
      MakkoEngine.display.setCursor('pointer');
      if (input.isMousePressed(0)) {
        this.showMissionModal = true;
        result.consumed = true;
      }
      return result;
    }

    // Check Crew button - opens cryo modal
    if (isPointInBounds(mouseX, mouseY, CREW_BUTTON_BOUNDS)) {
      MakkoEngine.display.setCursor('pointer');
      if (input.isMousePressed(0)) {
        this.showCryoModal = true;
        result.consumed = true;
      }
      return result;
    }

    // Check Inventory button
    if (isPointInBounds(mouseX, mouseY, INVENTORY_BUTTON_BOUNDS)) {
      MakkoEngine.display.setCursor('pointer');
      if (input.isMousePressed(0)) {
        this.showInventory = !this.showInventory;
        result.toggleInventory = true;
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

    // Check inventory panel slots for hover
    if (this.showInventory && inventory) {
      const hoveredSlot = this.checkInventorySlotHover(mouseX, mouseY, inventory);
      if (hoveredSlot) {
        this.hoveredInventorySlot = hoveredSlot;
        MakkoEngine.display.setCursor('pointer');
        return result;
      }
    }

    // Check crew panel slots for hover
    if (this.showCrew && inventory) {
      const hoveredSlot = this.checkCrewSlotHover(mouseX, mouseY, inventory);
      if (hoveredSlot) {
        this.hoveredInventorySlot = hoveredSlot;
        MakkoEngine.display.setCursor('pointer');
        return result;
      }
    }

    // Check hub cells
    const cellId = hubSystem.getCellAtPosition(mouseX, mouseY);
    const cell = cellId !== null ? hubSystem.getCell(cellId) : null;

    if (cell && cell.hasSpaceship) {
      result.hoveredCellId = cellId;
      MakkoEngine.display.setCursor('pointer');

      if (input.isMousePressed(0)) {
        // Check if ship is claimed or station - show management panel
        const ship = game.getShip(cellId);
        if (ship && (ship.mode === 'claimed' || ship.mode === 'station')) {
          this.showShipManagement = true;
          this.selectedShipId = cellId;
          result.showShipManagement = cellId;
          result.consumed = true;
        } else {
          // Normal selection for derelict ships (dive selection)
          hubSystem.selectCell(cellId);
          result.consumed = true;
        }
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
    game.setHubSelectedShips(selectedIds);
    game.startDepthDive();
  }

  /** Check if mouse is hovering over an inventory slot */
  private checkInventorySlotHover(
    mouseX: number, 
    mouseY: number,
    inventory: InventorySystem
  ): HoveredSlot | null {
    const panel = INVENTORY_PANEL;
    const slotSize = panel.slotSize;

    // Check hardware slots (up to 4, in 2x2 grid)
    const hardwareItems = inventory.getItemsByCategory('hardware');
    for (let i = 0; i < 4; i++) {
      const slotX = panel.x + 16 + (i % 2) * panel.slotSpacing;
      const slotY = panel.y + panel.hardwareSlotsY + Math.floor(i / 2) * panel.slotRowHeight;
      
      if (isPointInBounds(mouseX, mouseY, { x: slotX, y: slotY, width: slotSize, height: slotSize })) {
        // Only return if slot has an item
        if (hardwareItems[i]) {
          return { category: 'hardware', index: i };
        }
      }
    }

    // Check crew slots (up to 2, single row)
    const crewItems = inventory.getItemsByCategory('crew');
    for (let i = 0; i < 2; i++) {
      const slotX = panel.x + 16 + i * panel.slotSpacing;
      const slotY = panel.y + panel.crewSlotsY;
      
      if (isPointInBounds(mouseX, mouseY, { x: slotX, y: slotY, width: slotSize, height: slotSize })) {
        if (crewItems[i]) {
          return { category: 'crew', index: i };
        }
      }
    }

    return null;
  }

  /** Check if mouse is hovering over a crew panel slot */
  private checkCrewSlotHover(
    mouseX: number, 
    mouseY: number,
    inventory: InventorySystem
  ): HoveredSlot | null {
    const panel = CREW_PANEL;
    const slotSize = panel.slotSize;

    // Check crew slots (up to 2, single row)
    const crewItems = inventory.getItemsByCategory('crew');
    for (let i = 0; i < 2; i++) {
      const slotX = panel.x + 16 + i * panel.slotSpacing;
      const slotY = panel.y + panel.slotsY;
      
      if (isPointInBounds(mouseX, mouseY, { x: slotX, y: slotY, width: slotSize, height: slotSize })) {
        if (crewItems[i]) {
          return { category: 'crew', index: i };
        }
      }
    }

    return null;
  }
}
