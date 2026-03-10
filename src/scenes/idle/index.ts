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

  constructor(game: Game) {
    this.game = game;
    this.idleSystem = new IdleSystem(game);
    this.hubSystem = new HubSystem();
    this.inventorySystem = new InventorySystem(game);
    this.socialMultiplierSystem = new SocialMultiplierSystem(game);
    this.signalLog = signalLogSystem;
    this.missionSystem = new MissionSystem(game.state);

    this.background = new BackgroundRenderer();
    this.debugger = new NodeDebugger();
    this.uiRenderer = new UIRenderer();
    this.inputHandler = new InputHandler(this.debugger);
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

    this.background.loadAssets();
    this.boardAsset = loadBoardAsset();

    this.hubSystem.populate();
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
  }

  render(): void {
    const display = MakkoEngine.display;
    display.clear('#0a0e1a');

    // Background layers
    this.background.render(display);
    renderBoard(display, this.boardAsset);
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

    // Debug overlay
    this.debugger.render(display);
  }

  update(dt: number): void {
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
}
