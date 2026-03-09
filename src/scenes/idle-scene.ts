/**
 * Idle Scene
 * 
 * Main hub with SSSSBoards2 board, spaceship selection, energy display, 
 * inventory panel, viral multiplier badge, Depth Dive trigger, How to Play modal, and Signal Log.
 */

import { MakkoEngine, IDisplay, StaticAsset } from '@makko/engine';
import type { Scene } from '../scene/interfaces';
import type { Game } from '../game/game';
import { IdleSystem } from '../systems/idle-system';
import { HubSystem, HubCellState } from '../systems/hub-system';
import { InventorySystem, SLOT_LIMITS } from '../systems/inventory-system';
import { SocialMultiplierSystem } from '../systems/social-multiplier-system';
import { SignalLogSystem, signalLogSystem } from '../systems/signal-log-system';
import { COLORS, FONTS, LAYOUT } from '../ui/theme';
import { BatteryCoreDisplay } from '../ui/visual-components';
import { SpaceshipVisual } from '../ui/spaceship-visual';

/**
 * How to Play modal content
 */
const HOW_TO_PLAY_CONTENT = {
  title: 'SCAVENGER PROTOCOL',
  bullets: [
    'Nodes generate Energy passively (10/min each)',
    'Spend Energy in Depth Dive to control nodes and extract rewards',
    'Use Tactic Cards: SCAN, REPAIR, BYPASS, OVERCLOCK, EXTRACT',
    'Beware Rig Collapse (35%) on EXTRACT—use Shields to protect your run!'
  ]
};

/** Board asset name from manifest */
const BOARD_ASSET_NAME = 'ssssboards2';

/** Board position on screen (x offset) */
const BOARD_X = 285;

/**
 * IdleScene - main hub scene with board and spaceship selection
 */
export class IdleScene implements Scene {
  readonly id = 'idle';
  manager?: import('../scene/scene-manager').SceneManager;

  private game: Game;
  private idleSystem: IdleSystem;
  private hubSystem: HubSystem;
  private inventorySystem: InventorySystem;
  private socialMultiplierSystem: SocialMultiplierSystem;
  private signalLog: SignalLogSystem;

  // Spaceship visuals for cells with spaceships
  private spaceshipVisuals: Map<number, SpaceshipVisual> = new Map();

  // UI State
  private showHowToPlay: boolean = false;
  private hoveredCellId: number | null = null;

  // Button bounds
  private diveButtonBounds = { x: 860, y: 900, width: 200, height: 60 };
  private helpButtonBounds = { x: 1850, y: 20, width: 50, height: 50 };

  // Visual components
  private batteryDisplay: BatteryCoreDisplay;

  // Board static asset
  private boardAsset: StaticAsset | null = null;

  // Spacefield background asset
  private spacefieldAsset: StaticAsset | null = null;

  constructor(game: Game) {
    this.game = game;
    this.idleSystem = new IdleSystem(game);
    this.hubSystem = new HubSystem();
    this.inventorySystem = new InventorySystem(game);
    this.socialMultiplierSystem = new SocialMultiplierSystem(game);
    this.signalLog = signalLogSystem;

    // Initialize visual components
    this.batteryDisplay = new BatteryCoreDisplay(30, 30, 400, 40);
  }

  async init(): Promise<void> {
    // Initialize systems
    this.inventorySystem.loadFromGameState();
    
    // Load board asset
    this.loadBoardAsset();
  }

  /**
   * Load the board and spacefield static assets
   */
  private loadBoardAsset(): void {
    if (MakkoEngine.hasStaticAsset(BOARD_ASSET_NAME)) {
      this.boardAsset = MakkoEngine.staticAsset(BOARD_ASSET_NAME);
    }
    if (MakkoEngine.hasStaticAsset('spacefield')) {
      this.spacefieldAsset = MakkoEngine.staticAsset('spacefield');
    }
  }

  enter(previousScene?: string): void {
    this.game.updateViralMultiplier();
    this.idleSystem.reset();
    this.inventorySystem.loadFromGameState();
    this.showHowToPlay = false;

    // Reload board asset if needed
    if (!this.boardAsset) {
      this.loadBoardAsset();
    }

    // Populate the board with random spaceships
    this.hubSystem.populate();

    // Create spaceship visuals for populated cells
    this.createSpaceshipVisuals();
  }

  exit(nextScene?: string): void {
    this.showHowToPlay = false;
    this.spaceshipVisuals.clear();
  }

  /**
   * Create spaceship visual instances for cells with spaceships
   */
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

  handleInput(): void {
    const input = MakkoEngine.input;

    // Check for How to Play toggle
    if (input.isKeyPressed('KeyH') || input.isKeyPressed('Slash')) {
      this.showHowToPlay = !this.showHowToPlay;
    }

    // Close modal on Escape
    if (input.isKeyPressed('Escape') && this.showHowToPlay) {
      this.showHowToPlay = false;
      return;
    }

    // If modal is showing, don't process other input
    if (this.showHowToPlay) {
      return;
    }

    // Mouse interaction - input.mouseX/mouseY are already in game coordinates
    const mouseX = input.mouseX;
    const mouseY = input.mouseY;

    if (mouseX !== undefined && mouseY !== undefined) {
      // Check DIVE button
      if (this.isPointInBounds(mouseX, mouseY, this.diveButtonBounds)) {
        MakkoEngine.display.setCursor('pointer');
        if (input.isMousePressed(0)) {
          this.handleDiveClick();
          return;
        }
      }
      // Check Help button
      else if (this.isPointInBounds(mouseX, mouseY, this.helpButtonBounds)) {
        MakkoEngine.display.setCursor('pointer');
        if (input.isMousePressed(0)) {
          this.showHowToPlay = !this.showHowToPlay;
          return;
        }
      }
      // Check hub cells
      else {
        const cellId = this.hubSystem.getCellAtPosition(mouseX, mouseY);
        const cell = cellId !== null ? this.hubSystem.getCell(cellId) : null;

        if (cell && cell.hasSpaceship) {
          this.hoveredCellId = cellId;
          MakkoEngine.display.setCursor('pointer');

          if (input.isMousePressed(0)) {
            this.hubSystem.selectCell(cellId);
          }
        } else {
          this.hoveredCellId = null;
          MakkoEngine.display.setCursor('default');
        }
      }
    }
  }

  /**
   * Handle DIVE button click
   */
  private handleDiveClick(): void {
    const selectedCount = this.hubSystem.getSelectedCount();
    
    // Require at least 1 selected cell
    if (selectedCount < 1) {
      return;
    }

    // Store selected cell IDs in game state
    const selectedIds = this.hubSystem.getSelectedCellIds();
    this.game.setHubSelectedNodes(selectedIds);

    // Start the depth dive
    this.game.startDepthDive();
  }

  private isPointInBounds(x: number, y: number, bounds: { x: number; y: number; width: number; height: number }): boolean {
    return x >= bounds.x && x <= bounds.x + bounds.width &&
           y >= bounds.y && y <= bounds.y + bounds.height;
  }

  update(dt: number): void {
    // Update systems
    this.idleSystem.update(dt);
    this.socialMultiplierSystem.update(dt);
    this.signalLog.update(dt);

    // Update spaceship animations
    for (const visual of this.spaceshipVisuals.values()) {
      visual.update(dt);
    }
  }

  render(): void {
    const display = MakkoEngine.display;

    // Clear background
    display.clear(COLORS.background);

    // Render spacefield background (full canvas)
    this.renderSpacefield(display);

    // Render board background on top of starfield
    this.renderBoard(display);

    // Render spaceships with selection
    this.renderSpaceships(display);

    // Render UI elements
    this.renderEnergyDisplay(display);
    this.renderInventoryPanel(display);
    this.renderViralMultiplierBadge(display);
    this.renderDiveButton(display);
    this.renderHelpButton(display);

    // Render Signal Log at bottom
    this.signalLog.render(display);

    // Render How to Play modal on top
    if (this.showHowToPlay) {
      this.renderHowToPlayModal(display);
    }
  }

  /**
   * Render the spacefield background scaled to fill canvas
   */
  private renderSpacefield(display: IDisplay): void {
    if (this.spacefieldAsset) {
      display.drawImage(
        this.spacefieldAsset.image,
        0,
        0,
        display.width,
        display.height
      );
    }
  }

  /**
   * Render the board background image
   */
  private renderBoard(display: IDisplay): void {
    if (this.boardAsset) {
      display.drawImage(
        this.boardAsset.image,
        BOARD_X,
        0,
        this.boardAsset.width,
        this.boardAsset.height
      );
    }
  }

  /**
   * Render all spaceships with selection highlights
   */
  private renderSpaceships(display: IDisplay): void {
    for (const cell of this.hubSystem.cells) {
      if (!cell.hasSpaceship) continue;

      const visual = this.spaceshipVisuals.get(cell.definition.id);
      if (visual) {
        visual.render(display, {
          selected: cell.selected
        });
      }
    }
  }

  /**
   * Render energy display at top-left using BatteryCoreDisplay
   */
  private renderEnergyDisplay(display: IDisplay): void {
    const energy = Math.floor(this.idleSystem.energy);
    const cap = Math.floor(this.idleSystem.energyCap);
    const rate = this.idleSystem.getEnergyRate();
    
    // Use polished BatteryCoreDisplay component
    this.batteryDisplay.render(display, energy, cap, `+${rate.toFixed(1)}/s`);
  }

  /**
   * Render inventory panel at top-right
   */
  private renderInventoryPanel(display: IDisplay): void {
    const panelX = 1450;
    const panelY = 50;
    const panelWidth = 300;
    const panelHeight = 400;

    // Panel background with rounded corners
    display.drawRoundRect(panelX, panelY, panelWidth, panelHeight, LAYOUT.borderRadius, {
      fill: COLORS.panelBg,
      alpha: 0.9
    });

    // Panel border with rounded corners
    display.drawRoundRect(panelX, panelY, panelWidth, panelHeight, LAYOUT.borderRadius, {
      stroke: COLORS.neonCyan,
      lineWidth: LAYOUT.borderWidth,
      alpha: 0.5
    });

    // Panel title
    display.drawText('INVENTORY', panelX + LAYOUT.padding, panelY + 25, {
      font: FONTS.labelFont,
      fill: COLORS.white
    });

    // Hardware section
    const hwSlots = this.inventorySystem.getItemsByCategory('hardware');
    display.drawText('HARDWARE', panelX + LAYOUT.padding, panelY + 60, {
      font: FONTS.tinyFont,
      fill: COLORS.dimText
    });

    for (let i = 0; i < SLOT_LIMITS.hardware; i++) {
      const slotX = panelX + LAYOUT.padding + (i % 2) * 130;
      const slotY = panelY + 80 + Math.floor(i / 2) * 60;
      const item = hwSlots[i];

      this.renderInventorySlot(display, slotX, slotY, item);
    }

    // Crew section
    const crewSlots = this.inventorySystem.getItemsByCategory('crew');
    display.drawText('CREW', panelX + LAYOUT.padding, panelY + 220, {
      font: FONTS.tinyFont,
      fill: COLORS.dimText
    });

    for (let i = 0; i < SLOT_LIMITS.crew; i++) {
      const slotX = panelX + LAYOUT.padding + (i % 2) * 130;
      const slotY = panelY + 240 + Math.floor(i / 2) * 60;
      const item = crewSlots[i];

      this.renderInventorySlot(display, slotX, slotY, item);
    }
  }

  /**
   * Render an inventory slot
   */
  private renderInventorySlot(display: IDisplay, x: number, y: number, item: { id: string; name: string; category: string } | undefined): void {
    const slotSize = 50;

    // Slot background with rounded corners
    display.drawRoundRect(x, y, slotSize, slotSize, LAYOUT.borderRadiusSmall, {
      fill: COLORS.neutralGray,
      alpha: 0.3
    });

    // Slot border
    display.drawRoundRect(x, y, slotSize, slotSize, LAYOUT.borderRadiusSmall, {
      stroke: COLORS.border,
      lineWidth: 1,
      alpha: 0.5
    });

    if (item) {
      // Item color based on category
      const itemColor = item.category === 'hardware' ? COLORS.neonCyan : COLORS.neonMagenta;
      
      display.drawRoundRect(x + 10, y + 10, slotSize - 20, slotSize - 20, 4, {
        fill: itemColor,
        alpha: 0.7
      });

      // Item name (abbreviated)
      const abbrev = item.name.substring(0, 2).toUpperCase();
      display.drawText(abbrev, x + slotSize / 2, y + slotSize / 2, {
        font: FONTS.bodyFont,
        fill: COLORS.white,
        align: 'center',
        baseline: 'middle'
      });
    }
  }

  /**
   * Render viral multiplier badge
   */
  private renderViralMultiplierBadge(display: IDisplay): void {
    const status = this.socialMultiplierSystem.getStatus();

    if (!status.active) return;

    const badgeX = 30;
    const badgeY = 135;
    const badgeWidth = 170;
    const badgeHeight = 36;

    // Badge background with rounded corners
    display.drawRoundRect(badgeX, badgeY, badgeWidth, badgeHeight, LAYOUT.borderRadius, {
      fill: COLORS.neonMagenta,
      alpha: 0.2
    });

    // Badge border with rounded corners
    display.drawRoundRect(badgeX, badgeY, badgeWidth, badgeHeight, LAYOUT.borderRadius, {
      stroke: COLORS.neonMagenta,
      lineWidth: LAYOUT.borderWidth,
      alpha: 0.8
    });

    // Multiplier text
    display.drawText(`${status.multiplier}x BOOST`, badgeX + LAYOUT.padding, badgeY + 23, {
      font: FONTS.bodyFont,
      fill: COLORS.neonMagenta
    });

    // Remaining time
    if (status.remainingFormatted) {
      display.drawText(status.remainingFormatted, badgeX + badgeWidth - LAYOUT.padding - 40, badgeY + 23, {
        font: FONTS.smallFont,
        fill: COLORS.white
      });
    }
  }

  /**
   * Render DIVE button at bottom-center
   */
  private renderDiveButton(display: IDisplay): void {
    const selectedCount = this.hubSystem.getSelectedCount();
    const canDive = selectedCount >= 1;

    const { x, y, width, height } = this.diveButtonBounds;
    const mouseX = MakkoEngine.input.mouseX;
    const mouseY = MakkoEngine.input.mouseY;
    const isHovered = mouseX !== undefined && mouseY !== undefined &&
      this.isPointInBounds(mouseX, mouseY, this.diveButtonBounds) && canDive;

    // Determine button colors based on state
    const buttonColor = canDive ? COLORS.neonCyan : COLORS.dimText;
    const alpha = isHovered ? 0.3 : (canDive ? 0.1 : 0.05);
    const borderAlpha = canDive ? 1 : 0.3;

    // Glow effect on hover
    if (isHovered) {
      display.drawRoundRect(x - 4, y - 4, width + 8, height + 8, LAYOUT.borderRadius + 2, {
        fill: buttonColor,
        alpha: 0.15
      });
    }

    // Button background with rounded corners
    display.drawRoundRect(x, y, width, height, LAYOUT.borderRadius, {
      fill: buttonColor,
      alpha: alpha
    });

    // Button border with rounded corners
    display.drawRoundRect(x, y, width, height, LAYOUT.borderRadius, {
      stroke: buttonColor,
      lineWidth: isHovered ? LAYOUT.borderWidthThick : LAYOUT.borderWidth,
      alpha: borderAlpha
    });

    // Button text - show selection count
    const buttonText = `DIVE${selectedCount > 0 ? ` (${selectedCount})` : ''}`;
    display.drawText(buttonText, x + width / 2, y + height / 2, {
      font: FONTS.headingFont,
      fill: buttonColor,
      align: 'center',
      baseline: 'middle'
    });
  }

  /**
   * Render Help button at top-right corner
   */
  private renderHelpButton(display: IDisplay): void {
    const { x, y, width, height } = this.helpButtonBounds;
    const mouseX = MakkoEngine.input.mouseX;
    const mouseY = MakkoEngine.input.mouseY;
    const isHovered = mouseX !== undefined && mouseY !== undefined &&
      this.isPointInBounds(mouseX, mouseY, this.helpButtonBounds);

    // Button background with rounded corners
    display.drawRoundRect(x, y, width, height, LAYOUT.borderRadius, {
      fill: COLORS.panelBg,
      alpha: 0.9
    });

    // Button border with rounded corners
    display.drawRoundRect(x, y, width, height, LAYOUT.borderRadius, {
      stroke: isHovered ? COLORS.neonCyan : COLORS.dimText,
      lineWidth: LAYOUT.borderWidth,
      alpha: 1
    });

    // Button text
    display.drawText('?', x + width / 2, y + height / 2, {
      font: FONTS.headingFont,
      fill: isHovered ? COLORS.neonCyan : COLORS.dimText,
      align: 'center',
      baseline: 'middle'
    });
  }

  /**
   * Render How to Play modal
   */
  private renderHowToPlayModal(display: IDisplay): void {
    const modalWidth = 600;
    const modalHeight = 400;
    const modalX = (display.width - modalWidth) / 2;
    const modalY = (display.height - modalHeight) / 2;

    // Darken background
    display.drawRect(0, 0, display.width, display.height, {
      fill: '#000000',
      alpha: 0.7
    });

    // Modal background with rounded corners
    display.drawRoundRect(modalX, modalY, modalWidth, modalHeight, LAYOUT.borderRadiusLarge, {
      fill: COLORS.panelBg,
      alpha: 0.95
    });

    // Modal border with rounded corners
    display.drawRoundRect(modalX, modalY, modalWidth, modalHeight, LAYOUT.borderRadiusLarge, {
      stroke: COLORS.neonCyan,
      lineWidth: LAYOUT.borderWidthThick,
      alpha: 1
    });

    // Title
    display.drawText(HOW_TO_PLAY_CONTENT.title, modalX + modalWidth / 2, modalY + 50, {
      font: FONTS.titleFont,
      fill: COLORS.neonCyan,
      align: 'center'
    });

    // Decorative line
    display.drawLine(modalX + 100, modalY + 80, modalX + modalWidth - 100, modalY + 80, {
      stroke: COLORS.neonCyan,
      lineWidth: LAYOUT.borderWidth,
      alpha: 0.5
    });

    // Bullet points
    const bulletStartY = modalY + 120;
    const bulletSpacing = 50;

    HOW_TO_PLAY_CONTENT.bullets.forEach((bullet, index) => {
      const bulletY = bulletStartY + index * bulletSpacing;
      
      // Bullet point
      display.drawCircle(modalX + 50, bulletY + 8, 6, {
        fill: COLORS.neonMagenta
      });

      // Text (wrapped if needed)
      const maxWidth = modalWidth - 120;
      this.renderWrappedText(display, bullet, modalX + 70, bulletY, maxWidth, {
        font: FONTS.bodyFont,
        fill: COLORS.white
      });
    });

    // Close hint
    display.drawText('Press ESC or H to close', modalX + modalWidth / 2, modalY + modalHeight - 40, {
      font: FONTS.smallFont,
      fill: COLORS.dimText,
      align: 'center'
    });
  }

  /**
   * Render wrapped text helper
   */
  private renderWrappedText(
    display: IDisplay,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    style: { font: string; fill: string }
  ): void {
    // Simple word wrap
    const words = text.split(' ');
    let line = '';
    let lineY = y;
    const lineHeight = 20;

    for (const word of words) {
      const testLine = line + (line ? ' ' : '') + word;
      const metrics = display.measureText(testLine, { font: style.font });
      
      if (metrics.width > maxWidth && line) {
        display.drawText(line, x, lineY, style);
        line = word;
        lineY += lineHeight;
      } else {
        line = testLine;
      }
    }
    
    display.drawText(line, x, lineY, style);
  }

  destroy(): void {
    // Cleanup scene resources
    this.spaceshipVisuals.clear();
  }
}
