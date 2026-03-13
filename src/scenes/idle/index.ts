/**
 * Idle Scene
 * 
 * Main hub with SSSSBoards2 board, spaceship selection, energy display, 
 * inventory panel, viral multiplier badge, Depth Dive trigger, How to Play modal, and Signal Log.
 */

import { MakkoEngine, IDisplay, StaticAsset } from '@makko/engine';
import type { Scene } from '../../scene/interfaces';
import type { Game } from '../../game/game';
import { IdleSystem } from '../../systems/idle-system';
import { HubSystem } from '../../systems/hub-system';
import { InventorySystem } from '../../systems/inventory-system';
import { SocialMultiplierSystem } from '../../systems/social-multiplier-system';
import { SignalLogSystem, signalLogSystem } from '../../systems/signal-log-system';
import { MissionSystem } from '../../systems/mission-system';
import { DiveTransitionOverlay } from '../../systems/dive-transition-overlay';
import { SpaceshipVisual } from '../../ui/spaceship-visual';
import { BackgroundRenderer } from './background';
import { NodeDebugger } from './debug';
import { InputHandler } from './input-handler';
import { UIRenderer, CREW_BUTTON_BOUNDS, MISSION_BUTTON_BOUNDS } from './render-ui';
import { renderHowToPlayModal } from './render-modals';
import { isPointInBounds } from './render-utils';
import { renderShipManagementPanel, ROOM_PANEL_BOUNDS } from '../../ui/room-ui';
import { hasAssignedEngineer } from '../../systems/crew-bonus-system';

// New modular handlers
import { 
  handleShipManagementInput, 
  performShipConversion,
  renderConversionMessage,
  type ConversionResult 
} from './ship-conversion';
import { 
  hasMissionNotification, 
  handleMissionModalInput, 
  updateMissionProgress,
  renderMissionModal 
} from './mission-handlers';
import { 
  handleCryoModalInput, 
  renderCryoModal 
} from './cryo-handlers';
import { 
  renderBoard, 
  renderSpaceships, 
  renderTooltipIfNeeded, 
  loadBoardAsset 
} from './rendering';

/**
 * IdleScene - main hub scene with board and spaceship selection
 */
export class IdleScene implements Scene {
  readonly id = 'idle';
  manager?: import('../../scene/scene-manager').SceneManager;

  private game: Game;
  private idleSystem: IdleSystem;
  private hubSystem: HubSystem;
  private inventorySystem: InventorySystem;
  private socialMultiplierSystem: SocialMultiplierSystem;
  private signalLog: SignalLogSystem;
  private missionSystem: MissionSystem;

  // Renderers
  private background: BackgroundRenderer;
  private uiRenderer: UIRenderer;
  private debugger: NodeDebugger;
  private inputHandler: InputHandler;

  // Spaceship visuals
  private spaceshipVisuals: Map<number, SpaceshipVisual> = new Map();

  // Board asset
  private boardAsset: StaticAsset | null = null;

  // Hover state
  private hoveredCellId: number | null = null;
  
  // Conversion message state
  private conversionMessage: string | null = null;
  private conversionMessageTimer: number = 0;

  // Transition overlay for navigating phase
  private transitionOverlay: DiveTransitionOverlay;
  private pendingDiveTransition: boolean = false;

  constructor(game: Game) {
    this.game = game;
    this.idleSystem = new IdleSystem(game);
    this.hubSystem = new HubSystem();
    this.inventorySystem = new InventorySystem(game);
    this.socialMultiplierSystem = new SocialMultiplierSystem(game);
    this.signalLog = signalLogSystem;
    this.missionSystem = new MissionSystem(game.state);

    this.background = new BackgroundRenderer();
    this.debugger = new NodeDebugger(game);
    this.uiRenderer = new UIRenderer();
    this.inputHandler = new InputHandler(this.debugger);
    this.transitionOverlay = new DiveTransitionOverlay();
  }

  async init(): Promise<void> {
    this.inventorySystem.loadFromGameState();
    this.background.loadAssets();
    this.boardAsset = loadBoardAsset();
  }

  enter(previousScene?: string): void {
    this.game.updateViralMultiplier();
    this.idleSystem.reset();
    this.inventorySystem.loadFromGameState();
    this.inputHandler.setHelpShowing(false);

    // Reset transition overlay to ensure clean state (fixes black screen on return from results)
    this.transitionOverlay.reset();
    this.pendingDiveTransition = false;

    this.background.loadAssets();
    this.boardAsset = loadBoardAsset();

    // Get persisted ships (repaired ships that stay on board)
    const persistedShipIds = this.game.state.persistedShips;
    
    // Get owned ship IDs to exclude from board
    const ownedShipIds = this.game.state.spacecraft
      .filter(s => s.owner === 'player')
      .map(s => s.id);
    
    // Populate board with persisted ships + new random derelicts
    this.hubSystem.populate(persistedShipIds, ownedShipIds);
    this.createSpaceshipVisuals();
    
    // Generate available missions if empty
    if (this.game.state.availableMissions.length === 0) {
      const missions = this.missionSystem.generateAvailableMissions(3);
      this.game.state.availableMissions.push(...missions);
      console.log(`[Mission] Generated ${missions.length} available missions`);
    }
  }

  exit(nextScene?: string): void {
    this.inputHandler.setHelpShowing(false);
    this.spaceshipVisuals.clear();
  }

  handleInput(): void {
    // Block input during transition
    if (!this.transitionOverlay.isComplete()) {
      return;
    }

    // Mission modal
    if (this.inputHandler.isMissionModalShowing) {
      handleMissionModalInput(this.game, this.inputHandler);
      return;
    }
    
    // Cryo modal
    if (this.inputHandler.isCryoModalShowing) {
      handleCryoModalInput(this.game, this.inputHandler);
      return;
    }
    
    // Ship management panel
    if (this.inputHandler.isShipManagementShowing) {
      const consumed = handleShipManagementInput(
        this.game, 
        this.inputHandler,
        (result: ConversionResult) => {
          this.conversionMessage = result.message;
          this.conversionMessageTimer = result.duration;
          if (result.success) {
            this.inputHandler.setShipManagementShowing(false);
          }
        }
      );
      if (consumed) return;
    }
    
    const result = this.inputHandler.handleInput(this.game, this.hubSystem, this.inventorySystem);
    this.hoveredCellId = result.hoveredCellId;

    // Handle pause menu actions
    const pauseAction = (result as any).pauseMenuAction;
    if (pauseAction) {
      this.handlePauseMenuAction(pauseAction);
      return;
    }

    // Handle party slot click - open selector
    if (result.partySlotClicked) {
      this.inputHandler.setActivePartySelector(result.partySlotClicked);
      return;
    }

    // Handle party selection from dropdown
    if (result.partySelection) {
      const { slotType, authoredId } = result.partySelection;
      if (slotType === 'lead') {
        this.game.setSelectedLead(authoredId);
      } else if (slotType === 'companion0') {
        this.game.setCompanion(0, authoredId);
      } else if (slotType === 'companion1') {
        this.game.setCompanion(1, authoredId);
      }
      console.log(`[Party] ${slotType} set to: ${authoredId || 'Generic'}`);
      return;
    }

    // Handle dive trigger - start navigating transition
    if (result.diveTriggered && this.inputHandler.canDive(this.hubSystem)) {
      const selectedIds = this.inputHandler.getSelectedShipIds(this.hubSystem);
      this.game.setHubSelectedShips(selectedIds);
      this.transitionOverlay.start('navigating');
      this.pendingDiveTransition = true;
    }
  }

  render(): void {
    const display = MakkoEngine.display;
    
    // Clear canvas (reset to transparent, then we fill with base color)
    display.clear();
    
    // Background layers (stars on top of board for depth)
    // Explicitly draw base fill to cover entire canvas with solid color
    this.background.renderBaseFill(display);
    
    // Draw spacefield (scrolling background)
    this.background.renderSpacefield(display);
    
    // Draw board overlay
    renderBoard(display, this.boardAsset);
    
    // Draw stars on top of board for visual depth
    this.background.renderStars(display);
    renderSpaceships(display, this.hubSystem, this.spaceshipVisuals, this.debugger as NodeDebugger);

    // UI
    this.renderMainUI(display);
    this.renderPanels(display);
    renderTooltipIfNeeded(display, this.inputHandler, this.inventorySystem, this.uiRenderer);

    // Signal Log
    this.signalLog.render(display);

    // Modals
    if (this.inputHandler.isHelpShowing) {
      renderHowToPlayModal(display);
    }
    if (this.inputHandler.isCryoModalShowing) {
      renderCryoModal(display, this.game);
    }
    if (this.inputHandler.isShipManagementShowing) {
      this.renderShipManagementPanel(display);
    }
    if (this.inputHandler.isMissionModalShowing) {
      renderMissionModal(display, this.game);
    }
    
    // Toast
    renderConversionMessage(display, this.conversionMessage, this.conversionMessageTimer);

    // Pause menu (render on top of everything except transition overlay)
    if (this.inputHandler.isPauseMenuShowing()) {
      this.inputHandler.pauseMenu.render(display, this.game);
    }

    // Black background overlay for transition (fades game to black)
    const bgOpacity = this.transitionOverlay.getBackgroundOpacity();
    if (bgOpacity > 0) {
      display.drawRect(0, 0, display.width, display.height, { fill: '#000000', alpha: bgOpacity });
    }

    // Transition overlay on top
    this.transitionOverlay.render(display);

    // Debug overlay
    this.debugger.render(display);
  }

  update(dt: number): void {
    // Update transition overlay
    this.transitionOverlay.update(dt);

    // Check if navigating transition complete - trigger scene change
    if (this.pendingDiveTransition && this.transitionOverlay.isComplete()) {
      this.pendingDiveTransition = false;
      this.game.startDepthDive();
      return;
    }

    this.background.update(dt);
    this.idleSystem.update(dt);
    this.socialMultiplierSystem.update(dt);
    this.signalLog.update(dt);

    for (const visual of this.spaceshipVisuals.values()) {
      visual.update(dt);
    }
    
    // Update conversion message timer
    if (this.conversionMessageTimer > 0) {
      this.conversionMessageTimer -= dt;
      if (this.conversionMessageTimer <= 0) {
        this.conversionMessage = null;
      }
    }
    
    // Update mission progress
    updateMissionProgress(this.game, this.missionSystem, dt);
  }

  destroy(): void {
    this.spaceshipVisuals.clear();
  }
  
  // =========================================================================
  // Private helpers
  // =========================================================================

  private createSpaceshipVisuals(): void {
    this.spaceshipVisuals.clear();

    for (const cell of this.hubSystem.cells) {
      if (cell.hasSpaceship && cell.rarity) {
        const visual = new SpaceshipVisual(
          cell.definition.centerX,
          cell.definition.centerY,
          cell.rarity,
          0.28
        );
        this.spaceshipVisuals.set(cell.definition.id, visual);
      }
    }
  }

  private renderMainUI(display: IDisplay): void {
    this.uiRenderer.renderEnergy(
      display, 
      this.idleSystem.energy, 
      this.idleSystem.energyCap, 
      this.idleSystem.getPowerRate()
    );
    
    if (this.game.state.cryoState) {
      this.uiRenderer.renderEfficiencyBonus(display, this.game.state.cryoState);
    }
    
    // Debt panel
    this.uiRenderer.renderDebtPanel(
      display,
      this.game.state.meta.debt,
      this.game.state.meta.debtCeiling
    );
    
    // Party selection panel - only show when crew members are awakened
    const awakenedRecruits = this.game.getAwakenedAuthoredRecruits();
    if (awakenedRecruits.length > 0) {
      this.uiRenderer.renderPartyPanel(
        display,
        this.game.getSelectedLead(),
        this.game.getCompanionSlots(),
        awakenedRecruits
      );
      
      // Party selector dropdown if active
      const activeSelector = this.inputHandler.getActivePartySelector();
      if (activeSelector) {
        this.uiRenderer.renderPartySelector(
          display,
          activeSelector,
          awakenedRecruits,
          this.game.getSelectedLead(),
          this.game.getCompanionSlots()
        );
      }
    }
    
    this.uiRenderer.renderViralMultiplierBadge(display, this.socialMultiplierSystem);
    this.uiRenderer.renderDiveButton(display, this.hubSystem.getSelectedCount());
    this.uiRenderer.renderCrewButton(display, this.isCrewButtonHovered());
    this.uiRenderer.renderInventoryButton(display);
    this.uiRenderer.renderHelpButton(display);
    this.uiRenderer.renderMissionButton(display, hasMissionNotification(this.game));
  }

  private renderPanels(display: IDisplay): void {
    // Crew panel
    if (this.inputHandler.isCrewShowing) {
      const hoveredSlot = this.inputHandler.getHoveredSlot();
      const hoveredIndex = hoveredSlot && hoveredSlot.category === 'crew' ? hoveredSlot.index : null;
      this.uiRenderer.renderCrewPanel(display, this.inventorySystem, hoveredIndex);
    }

    // Inventory panel
    if (this.inputHandler.isInventoryShowing) {
      const hoveredSlot = this.inputHandler.getHoveredSlot();
      const hoveredIndex = hoveredSlot && hoveredSlot.category === 'hardware' ? hoveredSlot.index : null;
      this.uiRenderer.renderInventoryPanel(display, this.inventorySystem, hoveredIndex);
    }
  }

  private renderShipManagementPanel(display: IDisplay): void {
    const shipId = this.inputHandler.getSelectedShipId();
    if (shipId === null) return;
    
    const ship = this.game.getShip(shipId);
    if (!ship) return;
    
    const cryoState = this.game.state.cryoState;
    const hasEngineer = hasAssignedEngineer(cryoState, shipId);
    const hasEngineeringBay = ship.rooms.some(r => r.type === 'engineering');
    const availablePowerCells = this.game.state.resources.powerCells;
    
    renderShipManagementPanel(
      display,
      shipId,
      ship.mode,
      ship.shipClass,
      ship.rooms,
      ship.maxRooms,
      this.game.state.resources,
      null,
      availablePowerCells,
      hasEngineer,
      hasEngineeringBay
    );
  }

  private isCrewButtonHovered(): boolean {
    const mouseX = MakkoEngine.input.mouseX;
    const mouseY = MakkoEngine.input.mouseY;
    if (mouseX === undefined || mouseY === undefined) return false;
    
    return isPointInBounds(mouseX, mouseY, CREW_BUTTON_BOUNDS);
  }

  /** Handle pause menu actions */
  private handlePauseMenuAction(action: string): void {
    switch (action) {
      case 'resume':
        this.inputHandler.pauseMenu.hide();
        break;
      case 'fullscreen':
        if (MakkoEngine.display.isFullscreen) {
          MakkoEngine.display.exitFullscreen();
        } else {
          MakkoEngine.display.requestFullscreen();
        }
        this.inputHandler.pauseMenu.setFullscreenState(!MakkoEngine.display.isFullscreen);
        break;
      case 'restart':
        this.inputHandler.pauseMenu.hide();
        // Restart game from beginning
        this.game.resetGame();
        break;
      case 'saveAndExit':
        // TODO: Implement save slot selection
        console.log('[Pause] Save & Exit not yet implemented');
        break;
      case 'returnToTitle':
        this.inputHandler.pauseMenu.hide();
        if (this.manager) {
          this.manager.switchTo('start');
        }
        break;
    }
  }
}
