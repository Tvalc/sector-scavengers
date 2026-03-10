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
import { SpaceshipVisual } from '../../ui/spaceship-visual';
import { BOARD_ASSET_NAME, BOARD_WIDTH, BOARD_HEIGHT } from './constants';
import { BackgroundRenderer } from './background';
import { NodeDebugger } from './debug';
import { InputHandler } from './input-handler';
import { UIRenderer } from './render-ui';
import { renderHowToPlayModal } from './render-modals';

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

  constructor(game: Game) {
    this.game = game;
    this.idleSystem = new IdleSystem(game);
    this.hubSystem = new HubSystem();
    this.inventorySystem = new InventorySystem(game);
    this.socialMultiplierSystem = new SocialMultiplierSystem(game);
    this.signalLog = signalLogSystem;

    this.background = new BackgroundRenderer();
    this.debugger = new NodeDebugger();
    this.uiRenderer = new UIRenderer();
    this.inputHandler = new InputHandler(this.debugger);
  }

  async init(): Promise<void> {
    this.inventorySystem.loadFromGameState();
    this.background.loadAssets();
    this.loadBoardAsset();
  }

  enter(previousScene?: string): void {
    this.game.updateViralMultiplier();
    this.idleSystem.reset();
    this.inventorySystem.loadFromGameState();
    this.inputHandler.setHelpShowing(false);

    this.background.loadAssets();
    this.loadBoardAsset();

    this.hubSystem.populate();
    this.createSpaceshipVisuals();
  }

  exit(nextScene?: string): void {
    this.inputHandler.setHelpShowing(false);
    this.spaceshipVisuals.clear();
  }

  handleInput(): void {
    const result = this.inputHandler.handleInput(this.game, this.hubSystem);
    this.hoveredCellId = result.hoveredCellId;
  }

  update(dt: number): void {
    this.background.update(dt);
    this.idleSystem.update(dt);
    this.socialMultiplierSystem.update(dt);
    this.signalLog.update(dt);

    for (const visual of this.spaceshipVisuals.values()) {
      visual.update(dt);
    }
  }

  render(): void {
    const display = MakkoEngine.display;
    display.clear('#0a0e1a');

    // Background layers
    this.background.render(display);
    this.renderBoard(display);

    // Spaceships
    this.renderSpaceships(display);

    // UI
    this.uiRenderer.renderEnergy(
      display, 
      this.idleSystem.energy, 
      this.idleSystem.energyCap, 
      this.idleSystem.getEnergyRate()
    );
    this.uiRenderer.renderInventoryPanel(display, this.inventorySystem);
    this.uiRenderer.renderViralMultiplierBadge(display, this.socialMultiplierSystem);
    this.uiRenderer.renderDiveButton(display, this.hubSystem.getSelectedCount());
    this.uiRenderer.renderHelpButton(display);

    // Signal Log
    this.signalLog.render(display);

    // Modal overlay
    if (this.inputHandler.isHelpShowing) {
      renderHowToPlayModal(display);
    }

    // Debug overlay
    this.debugger.render(display);
  }

  destroy(): void {
    this.spaceshipVisuals.clear();
  }

  // =========================================================================
  // Private helpers
  // =========================================================================

  private loadBoardAsset(): void {
    if (MakkoEngine.hasStaticAsset(BOARD_ASSET_NAME)) {
      this.boardAsset = MakkoEngine.staticAsset(BOARD_ASSET_NAME);
    }
  }

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

  private renderBoard(display: IDisplay): void {
    if (!this.boardAsset && MakkoEngine.hasStaticAsset(BOARD_ASSET_NAME)) {
      this.boardAsset = MakkoEngine.staticAsset(BOARD_ASSET_NAME);
    }
    
    if (!this.boardAsset) return;

    display.drawImage(this.boardAsset.image, 0, 0, BOARD_WIDTH, BOARD_HEIGHT);
  }

  private renderSpaceships(display: IDisplay): void {
    for (const cell of this.hubSystem.cells) {
      if (!cell.hasSpaceship) continue;

      const visual = this.spaceshipVisuals.get(cell.definition.id);
      if (visual) {
        visual.render(display, {
          selected: cell.selected,
          debug: this.debugger.isEnabled
        });
      }
    }
  }
}
