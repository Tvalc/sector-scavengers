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
import { HubSystem, HubCellState, NODE_POSITIONS } from '../systems/hub-system';
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
const BOARD_ASSET_NAME = 'sssssboard';

/** Board dimensions (full canvas) */
const BOARD_WIDTH = 1920;
const BOARD_HEIGHT = 1080;
const BOARD_CENTER_X = 960;
const BOARD_CENTER_Y = 540;

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

  // Spacefield scroll offset (pixels)
  private spacefieldScrollOffset: number = 0;

  // Star positions (seeded random, consistent each frame)
  private starPositions: Array<{ x: number; y: number; radius: number; color: string; alpha: number }> = [];

  // DEBUG: Node position debugger mode
  private debugMode: boolean = false;
  private debugPositions: Array<{ x: number; y: number }> = [];
  private selectedNodeIndex: number = 0;

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

    // Generate star positions (seeded, 70 stars)
    this.generateStarPositions(70);
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

    // Load assets
    this.loadBoardAsset();
    
    // Debug: Log asset loading status
    console.log('[IdleScene] Asset status:');
    console.log('  - boardAsset:', this.boardAsset ? 'loaded' : 'MISSING');
    console.log('  - spacefieldAsset:', this.spacefieldAsset ? 'loaded' : 'MISSING');

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

    // DEBUG: Toggle node debugger with 'D' key
    if (input.isKeyPressed('KeyD')) {
      this.debugMode = !this.debugMode;
      if (this.debugMode) {
        this.debugPositions = [...NODE_POSITIONS];
        console.log('[DEBUG] Node position debugger enabled');
        console.log('[DEBUG] Click to place node, 0-9 keys to select node, P to print positions');
      } else {
        console.log('[DEBUG] Node position debugger disabled');
      }
      return;
    }

    // DEBUG: In debug mode, handle node placement
    if (this.debugMode) {
      this.handleDebugInput();
      return;
    }

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

    // Mouse interaction - input.mouseX/mouseY are already in game coordinates (1920x1080 space)
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
   * DEBUG: Handle node position debugger input
   */
  private handleDebugInput(): void {
    const input = MakkoEngine.input;

    // Number keys 0-9 to select node
    for (let i = 0; i <= 9; i++) {
      if (input.isKeyPressed(`Digit${i}` as any) || input.isKeyPressed(`Numpad${i}` as any)) {
        if (input.isKeyDown('ShiftLeft') || input.isKeyDown('ShiftRight')) {
          // Shift+digit for 10-15 (0=10, 1=11, etc.)
          const idx = 10 + i;
          if (idx < 16) {
            this.selectedNodeIndex = idx;
            console.log(`[DEBUG] Selected node ${idx}`);
          }
        } else {
          this.selectedNodeIndex = i;
          console.log(`[DEBUG] Selected node ${i}`);
        }
        return;
      }
    }

    // Arrow keys to nudge selected node
    const nudge = input.isKeyDown('ShiftLeft') || input.isKeyDown('ShiftRight') ? 10 : 1;
    if (input.isKeyPressed('ArrowLeft')) {
      this.debugPositions[this.selectedNodeIndex].x -= nudge;
      console.log(`[DEBUG] Node ${this.selectedNodeIndex}: x=${this.debugPositions[this.selectedNodeIndex].x}`);
    }
    if (input.isKeyPressed('ArrowRight')) {
      this.debugPositions[this.selectedNodeIndex].x += nudge;
      console.log(`[DEBUG] Node ${this.selectedNodeIndex}: x=${this.debugPositions[this.selectedNodeIndex].x}`);
    }
    if (input.isKeyPressed('ArrowUp')) {
      this.debugPositions[this.selectedNodeIndex].y -= nudge;
      console.log(`[DEBUG] Node ${this.selectedNodeIndex}: y=${this.debugPositions[this.selectedNodeIndex].y}`);
    }
    if (input.isKeyPressed('ArrowDown')) {
      this.debugPositions[this.selectedNodeIndex].y += nudge;
      console.log(`[DEBUG] Node ${this.selectedNodeIndex}: y=${this.debugPositions[this.selectedNodeIndex].y}`);
    }

    // Mouse click to place node - mouseX/mouseY are already in game coordinates
    const mouseX = input.mouseX;
    const mouseY = input.mouseY;
    if (mouseX !== undefined && mouseY !== undefined && input.isMousePressed(0)) {
      this.debugPositions[this.selectedNodeIndex] = { x: Math.round(mouseX), y: Math.round(mouseY) };
      console.log(`[DEBUG] Node ${this.selectedNodeIndex} placed at game coords (${Math.round(mouseX)}, ${Math.round(mouseY)})`);
      // Auto-advance to next node
      if (this.selectedNodeIndex < 15) {
        this.selectedNodeIndex++;
      }
    }

    // P to print current positions as code
    if (input.isKeyPressed('KeyP')) {
      this.printDebugPositions();
    }

    // R to reset to original positions
    if (input.isKeyPressed('KeyR')) {
      this.debugPositions = [...NODE_POSITIONS];
      console.log('[DEBUG] Reset to original positions');
    }
  }

  /**
   * DEBUG: Print positions as TypeScript code
   */
  private printDebugPositions(): void {
    console.log('[DEBUG] Current positions:');
    console.log('export const NODE_POSITIONS: Array<{ x: number; y: number }> = [');
    for (let i = 0; i < 16; i++) {
      const pos = this.debugPositions[i];
      const row = Math.floor(i / 4);
      const isFirst = i % 4 === 0;
      const isLast = i % 4 === 3;
      const rowComment = isFirst ? `  // Row ${row}\n  ` : '  ';
      const lineEnd = i < 15 ? ',' : '';
      const comment = isLast ? `  // ${i}` : `  // ${i}`;
      console.log(`  { x: ${Math.round(pos.x)}, y: ${Math.round(pos.y)} },  // ${i}`);
    }
    console.log('];');
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
    // Update spacefield scroll (wraps at asset width)
    this.spacefieldScrollOffset += dt * 0.02;

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

    // Clear with dark background
    display.clear('#0a0e1a');

    // Render scrolling spacefield background
    this.renderSpacefield(display);

    // Render code-drawn starfield
    this.renderStars(display);

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

    // DEBUG: Render node debugger overlay
    if (this.debugMode) {
      this.renderDebugOverlay(display);
    }
  }

  /**
   * Render the spacefield background with horizontal scrolling
   * Spacefield asset is 1620x1080, stretched to cover full canvas
   * Tile horizontally for infinite scroll effect
   */
  private renderSpacefield(display: IDisplay): void {
    // If asset not loaded, try to load it again (MakkoEngine may have loaded it since scene init)
    if (!this.spacefieldAsset) {
      if (MakkoEngine.hasStaticAsset('spacefield')) {
        this.spacefieldAsset = MakkoEngine.staticAsset('spacefield');
        console.log('[IdleScene] Spacefield asset loaded on demand');
      } else {
        // No asset - skip (stars will still show, dark background already cleared)
        return;
      }
    }

    const assetWidth = this.spacefieldAsset.width; // Use actual asset width (1620)
    const scrollX = this.spacefieldScrollOffset % assetWidth;

    // Scale to cover full canvas width (1920 / 1620)
    const scaleX = display.width / assetWidth;
    const drawWidth = assetWidth * scaleX;

    // Draw two copies offset to create seamless infinite scroll, covering full canvas
    // First copy at current scroll position
    display.drawImage(
      this.spacefieldAsset.image,
      -scrollX * scaleX,
      0,
      drawWidth,
      display.height
    );

    // Second copy offset to fill the gap
    display.drawImage(
      this.spacefieldAsset.image,
      -scrollX * scaleX + drawWidth,
      0,
      drawWidth,
      display.height
    );
  }

  /**
   * Generate star positions using seeded random for consistency
   */
  private generateStarPositions(count: number): void {
    this.starPositions = [];

    // Simple seeded RNG (seed: 42)
    let seed = 42;
    const random = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    for (let i = 0; i < count; i++) {
      // 80% white, 20% cyan
      const isCyan = random() < 0.2;
      this.starPositions.push({
        x: random() * 1920,
        y: random() * 1080,
        radius: 1 + random() * 2, // 1-3 pixels
        color: isCyan ? '#00f0ff' : '#ffffff',
        alpha: 0.3 + random() * 0.3, // 0.3-0.6
      });
    }
  }

  /**
   * Render code-drawn starfield after spacefield
   */
  private renderStars(display: IDisplay): void {
    for (const star of this.starPositions) {
      display.drawCircle(star.x, star.y, star.radius, {
        fill: star.color,
        alpha: star.alpha,
      });
    }
  }

  /**
   * Render the board background image (full canvas)
   */
  private renderBoard(display: IDisplay): void {
    // Lazy load if not available
    if (!this.boardAsset) {
      if (MakkoEngine.hasStaticAsset(BOARD_ASSET_NAME)) {
        this.boardAsset = MakkoEngine.staticAsset(BOARD_ASSET_NAME);
        console.log('[IdleScene] Board asset loaded on demand');
      } else {
        return;
      }
    }

    // Draw board filling the canvas (1920x1080)
    display.drawImage(
      this.boardAsset.image,
      0,
      0,
      BOARD_WIDTH,
      BOARD_HEIGHT
    );
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
          selected: cell.selected,
          debug: this.debugMode
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
   * DEBUG: Render node position debugger overlay
   */
  private renderDebugOverlay(display: IDisplay): void {
    // Draw all CURRENT calibrated positions (from NODE_POSITIONS/HUB_CELLS) - YELLOW
    for (let i = 0; i < 16; i++) {
      const originalPos = NODE_POSITIONS[i];
      
      // Draw original position marker (yellow = what's currently saved)
      display.drawCircle(originalPos.x, originalPos.y, 35, {
        fill: '#ffff00',
        alpha: 0.3
      });
      display.drawText(`${i}`, originalPos.x, originalPos.y + 50, {
        font: '12px monospace',
        fill: '#ffff00',
        align: 'center'
      });
    }

    // Draw all DEBUG positions (what you're placing) - GREEN/RED
    for (let i = 0; i < 16; i++) {
      const pos = this.debugPositions[i];
      const isSelected = i === this.selectedNodeIndex;

      // Draw position marker
      display.drawCircle(pos.x, pos.y, isSelected ? 40 : 30, {
        fill: isSelected ? '#ff0000' : '#00ff00',
        alpha: 0.6
      });

      // Draw crosshair
      display.drawLine(pos.x - 20, pos.y, pos.x + 20, pos.y, {
        stroke: isSelected ? '#ffffff' : '#00ff00',
        lineWidth: 2,
        alpha: 0.8
      });
      display.drawLine(pos.x, pos.y - 20, pos.x, pos.y + 20, {
        stroke: isSelected ? '#ffffff' : '#00ff00',
        lineWidth: 2,
        alpha: 0.8
      });

      // Draw node number
      display.drawText(`${i}`, pos.x, pos.y, {
        font: 'bold 20px monospace',
        fill: '#ffffff',
        align: 'center',
        baseline: 'middle'
      });
    }

    // Draw debug UI panel
    const panelX = 20;
    const panelY = 200;
    const panelWidth = 300;
    const panelHeight = 220;

    display.drawRoundRect(panelX, panelY, panelWidth, panelHeight, 10, {
      fill: '#000000',
      alpha: 0.85
    });
    display.drawRoundRect(panelX, panelY, panelWidth, panelHeight, 10, {
      stroke: '#00ff00',
      lineWidth: 2
    });

    // Show current mouse position in both coordinate systems
    const rawMouseX = MakkoEngine.input.mouseX;
    const rawMouseY = MakkoEngine.input.mouseY;
    let mouseInfo = '';
    if (rawMouseX !== undefined && rawMouseY !== undefined) {
      const gamePos = MakkoEngine.display.toGameCoords(rawMouseX, rawMouseY);
      mouseInfo = `Mouse: raw(${rawMouseX}, ${rawMouseY}) game(${Math.round(gamePos.x)}, ${Math.round(gamePos.y)})`;
    }

    // Instructions
    display.drawText('NODE DEBUGGER', panelX + 10, panelY + 25, {
      font: 'bold 18px monospace',
      fill: '#00ff00'
    });

    const instructions = [
      `Selected: Node ${this.selectedNodeIndex}`,
      `Position: (${Math.round(this.debugPositions[this.selectedNodeIndex].x)}, ${Math.round(this.debugPositions[this.selectedNodeIndex].y)})`,
      mouseInfo,
      '',
      'Click: Place node',
      '0-9: Select node 0-9',
      'Shift+0-5: Select node 10-15',
      'Arrows: Nudge (+Shift: 10px)',
      'P: Print positions to console',
      'R: Reset positions',
      'D: Exit debugger'
    ];

    instructions.forEach((text, idx) => {
      display.drawText(text, panelX + 10, panelY + 50 + idx * 16, {
        font: '12px monospace',
        fill: '#ffffff'
      });
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
