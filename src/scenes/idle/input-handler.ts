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
  CREW_PANEL,
  PARTY_PANEL
} from './render-ui';
import { UIRenderer } from './render-ui';
import { InventorySystem } from '../../systems/inventory-system';
import { NodeDebugger } from './debug';
import { PauseMenu, PauseMenuState } from './pause-menu';

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
  /** Whether dive was triggered (needs transition) */
  diveTriggered: boolean;
  /** Party slot clicked (for selector popup) */
  partySlotClicked: 'lead' | 'companion0' | 'companion1' | null;
  /** Party selector selection (authoredId or null for generic) */
  partySelection: { slotType: 'lead' | 'companion0' | 'companion1'; authoredId: string | null } | null;
}

/** Pause menu action result type */
export type PauseMenuAction = 'resume' | 'fullscreen' | 'restart' | 'saveAndExit' | 'returnToTitle' | null;

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
  private activePartySelector: 'lead' | 'companion0' | 'companion1' | null = null;
  
  /** Pause menu state */
  public pauseMenu: PauseMenu;

  constructor(nodeDebugger: NodeDebugger) {
    this.nodeDebugger = nodeDebugger;
    this.pauseMenu = new PauseMenu();
  }
  
  /** Check if pause menu is showing */
  isPauseMenuShowing(): boolean {
    return this.pauseMenu.isShowing();
  }

  /** Get active party selector */
  getActivePartySelector(): 'lead' | 'companion0' | 'companion1' | null {
    return this.activePartySelector;
  }

  /** Set active party selector */
  setActivePartySelector(value: 'lead' | 'companion0' | 'companion1' | null): void {
    this.activePartySelector = value;
  }

  /** Close party selector */
  closePartySelector(): void {
    this.activePartySelector = null;
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
      showShipManagement: null,
      diveTriggered: false,
      partySlotClicked: null,
      partySelection: null
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

    // Toggle fullscreen with Shift+F
    if (input.isKeyPressed('KeyF') && input.isKeyDown('ShiftLeft')) {
      result.consumed = true;
      (result as InputResult & { pauseMenuAction?: PauseMenuAction }).pauseMenuAction = 'fullscreen';
      return result;
    }

    // Toggle help modal
    if (input.isKeyPressed('KeyH') || input.isKeyPressed('Slash')) {
      this.showHowToPlay = !this.showHowToPlay;
      result.toggleHelp = true;
      result.consumed = true;
      return result;
    }

    // Handle pause menu input if showing
    if (this.pauseMenu.isShowing()) {
      const pauseAction = this.handlePauseMenuInput(game);
      // Pause menu handled the input - store the action for the scene to process
      (result as InputResult & { pauseMenuAction?: PauseMenuAction }).pauseMenuAction = pauseAction;
      result.consumed = true;
      return result;
    }

    // Close modals on Escape (priority: party selector > mission > ship management > cryo > help > pause menu)
    if (input.isKeyPressed('Escape')) {
      if (this.activePartySelector) {
        this.activePartySelector = null;
        result.consumed = true;
        return result;
      }
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
      // No other modal showing - open pause menu
      this.pauseMenu.show();
      result.consumed = true;
      return result;
    }

    // Don't process other input if modal is showing
    if (this.showHowToPlay || this.showCryoModal || this.showShipManagement || this.showMissionModal || this.activePartySelector) {
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
      showShipManagement: null,
      diveTriggered: false,
      partySlotClicked: null,
      partySelection: null
    };

    const input = MakkoEngine.input;

    // Reset hovered slot at start
    this.hoveredInventorySlot = null;

    // Handle party selector if active
    if (this.activePartySelector && inventory) {
      return this.handlePartySelectorClick(game, mouseX, mouseY);
    }

    // Check party panel slots first (only if no modal is showing)
    if (!this.showHowToPlay && !this.showCryoModal && !this.showShipManagement && !this.showMissionModal) {
      const partySlotClicked = this.checkPartySlotClick(mouseX, mouseY, input.isMousePressed(0));
      if (partySlotClicked) {
        result.partySlotClicked = partySlotClicked;
        result.consumed = true;
        return result;
      }
    }

    // Check DIVE button
    if (isPointInBounds(mouseX, mouseY, DIVE_BUTTON_BOUNDS)) {
      MakkoEngine.display.setCursor('pointer');
      if (input.isMousePressed(0)) {
        // Signal dive triggered - scene handles the actual transition
        result.diveTriggered = true;
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

  /**
   * Handle pause menu keyboard navigation and selection
   */
  private handlePauseMenuInput(game: Game): PauseMenuAction {
    const input = MakkoEngine.input;

    // Navigate up
    if (input.isKeyPressed('ArrowUp') || input.isKeyPressed('KeyW')) {
      this.pauseMenu.navigateUp();
      return null;
    }

    // Navigate down
    if (input.isKeyPressed('ArrowDown') || input.isKeyPressed('KeyS')) {
      this.pauseMenu.navigateDown();
      return null;
    }

    // Select option
    if (input.isKeyPressed('Enter') || input.isKeyPressed('Space')) {
      const option = this.pauseMenu.getSelectedOption();
      
      switch (option) {
        case 'Resume':
          this.pauseMenu.hide();
          return 'resume';
          
        case 'Fullscreen':
          return 'fullscreen';
          
        case 'Restart Game':
          this.pauseMenu.hide();
          return 'restart';
          
        case 'Save & Exit':
          return 'saveAndExit';
          
        case 'Return to Title':
          return 'returnToTitle';
          
        default:
          return null;
      }
    }

    return null;
  }

  /**
   * Check if dive can be triggered
   */
  canDive(hubSystem: HubSystem): boolean {
    return hubSystem.getSelectedCount() >= 1;
  }

  /**
   * Get selected ship IDs for dive
   */
  getSelectedShipIds(hubSystem: HubSystem): number[] {
    return hubSystem.getSelectedCellIds();
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

  /** Check if mouse is over a party slot */
  private checkPartySlotClick(
    mouseX: number,
    mouseY: number,
    mousePressed: boolean
  ): 'lead' | 'companion0' | 'companion1' | null {
    const panel = PARTY_PANEL;
    const leadCenterX = panel.x + panel.width / 2;

    // Check lead slot
    const leadSize = panel.leadSlotSize;
    const leadX = leadCenterX - leadSize / 2;
    const leadY = panel.y + panel.leadSlotY;

    if (mouseX >= leadX && mouseX <= leadX + leadSize &&
        mouseY >= leadY && mouseY <= leadY + leadSize + 20) {
      MakkoEngine.display.setCursor('pointer');
      if (mousePressed) {
        return 'lead';
      }
    }

    // Check companion slots
    const compSize = panel.companionSlotSize;
    const compSlotY = panel.y + panel.companionSlotY;
    const compSpacing = 70;
    const compStartX = leadCenterX - compSpacing - compSize / 2;

    // Companion 0
    if (mouseX >= compStartX && mouseX <= compStartX + compSize &&
        mouseY >= compSlotY && mouseY <= compSlotY + compSize + 20) {
      MakkoEngine.display.setCursor('pointer');
      if (mousePressed) {
        return 'companion0';
      }
    }

    // Companion 1
    const comp1X = compStartX + compSpacing + 10;
    if (mouseX >= comp1X && mouseX <= comp1X + compSize &&
        mouseY >= compSlotY && mouseY <= compSlotY + compSize + 20) {
      MakkoEngine.display.setCursor('pointer');
      if (mousePressed) {
        return 'companion1';
      }
    }

    return null;
  }

  /** Handle click within party selector dropdown */
  private handlePartySelectorClick(
    game: Game,
    mouseX: number,
    mouseY: number
  ): InputResult {
    const result: InputResult = {
      consumed: false,
      toggleHelp: false,
      toggleInventory: false,
      hoveredCellId: null,
      showShipManagement: null,
      diveTriggered: false,
      partySlotClicked: null,
      partySelection: null
    };

    const input = MakkoEngine.input;

    // Get available recruits and item bounds
    const awakenedRecruits = game.getAwakenedAuthoredRecruits();
    const selectedLead = game.getSelectedLead();
    const companionSlots = game.getCompanionSlots();

    const uiRenderer = new UIRenderer();
    const items = uiRenderer.getPartySelectorItemBounds(
      this.activePartySelector!,
      awakenedRecruits,
      selectedLead,
      companionSlots as [string | null, string | null]
    );

    // Check if click is outside dropdown (close it)
    const panel = PARTY_PANEL;
    const dropdownWidth = 200;
    const dropdownX = panel.x + panel.width + 10;
    const dropdownY = panel.y + (this.activePartySelector === 'lead' ? panel.leadSlotY : panel.companionSlotY);
    const itemHeight = 40;
    const itemCount = items.length;
    const dropdownHeight = itemCount * itemHeight + 20;

    if (mouseX < dropdownX || mouseX > dropdownX + dropdownWidth ||
        mouseY < dropdownY || mouseY > dropdownY + dropdownHeight) {
      // Click outside - close selector
      if (input.isMousePressed(0)) {
        this.activePartySelector = null;
        result.consumed = true;
        return result;
      }
    }

    // Check each item
    for (const item of items) {
      if (mouseX >= item.bounds.x && mouseX <= item.bounds.x + item.bounds.width &&
          mouseY >= item.bounds.y && mouseY <= item.bounds.y + item.bounds.height) {
        MakkoEngine.display.setCursor('pointer');
        if (input.isMousePressed(0)) {
          result.partySelection = {
            slotType: this.activePartySelector!,
            authoredId: item.authoredId
          };
          this.activePartySelector = null;
          result.consumed = true;
          return result;
        }
      }
    }

    result.consumed = true;
    return result;
  }
}
