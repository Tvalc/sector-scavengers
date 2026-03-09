/**
 * Idle Scene
 * 
 * Main hub with 4x4 isometric node grid, energy display, inventory panel,
 * viral multiplier badge, Depth Dive trigger, How to Play modal, and Signal Log.
 */

import { MakkoEngine } from '@makko/engine';
import type { Scene } from '../scene/interfaces';
import type { Game } from '../game/game';
import { IdleSystem } from '../systems/idle-system';
import { NodeSystem, ScreenPosition } from '../systems/node-system';
import { InventorySystem, SLOT_LIMITS } from '../systems/inventory-system';
import { SocialMultiplierSystem } from '../systems/social-multiplier-system';
import { SignalLogSystem, signalLogSystem } from '../systems/signal-log-system';
import { Node, NodeOwner } from '../types/node';
import { COLORS, FONTS, LAYOUT } from '../ui/theme';

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

/**
 * IdleScene - main hub scene
 */
export class IdleScene implements Scene {
  readonly id = 'idle';
  manager?: import('../scene/scene-manager').SceneManager;

  private game: Game;
  private idleSystem: IdleSystem;
  private nodeSystem: NodeSystem;
  private inventorySystem: InventorySystem;
  private socialMultiplierSystem: SocialMultiplierSystem;
  private signalLog: SignalLogSystem;

  // UI State
  private showHowToPlay: boolean = false;
  private hoveredNodeId: number | null = null;
  private tooltipNode: Node | null = null;
  private tooltipPosition: { x: number; y: number } = { x: 0, y: 0 };

  // Button bounds
  private diveButtonBounds = { x: 860, y: 900, width: 200, height: 60 };
  private helpButtonBounds = { x: 1850, y: 20, width: 50, height: 50 };

  // Grid config
  private gridConfig = {
    cellWidth: 180,
    cellHeight: 180,
    centerX: 960,
    centerY: 540
  };

  constructor(game: Game) {
    this.game = game;
    this.idleSystem = new IdleSystem(game);
    this.nodeSystem = new NodeSystem(this.gridConfig);
    this.inventorySystem = new InventorySystem(game);
    this.socialMultiplierSystem = new SocialMultiplierSystem(game);
    this.signalLog = signalLogSystem;
  }

  async init(): Promise<void> {
    // Initialize systems
    this.inventorySystem.loadFromGameState();
    
    // Sync node state from game
    this.nodeSystem.importNodes(this.game.state.nodes);
  }

  enter(previousScene?: string): void {
    this.game.updateViralMultiplier();
    this.idleSystem.reset();
    this.nodeSystem.importNodes(this.game.state.nodes);
    this.inventorySystem.loadFromGameState();
    this.showHowToPlay = false;
  }

  exit(nextScene?: string): void {
    this.showHowToPlay = false;
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

    // Start Depth Dive on Space (if not showing modal)
    if (input.isKeyPressed('Space') && !this.showHowToPlay) {
      this.game.startDepthDive();
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
          this.game.startDepthDive();
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
      // Check node hover
      else {
        const nodeId = this.nodeSystem.getNodeIdAtScreen(mouseX, mouseY);
        if (nodeId !== null) {
          this.hoveredNodeId = nodeId;
          this.tooltipNode = this.nodeSystem.getNode(nodeId) ?? null;
          this.tooltipPosition = { x: mouseX, y: mouseY };
          MakkoEngine.display.setCursor('pointer');
        } else {
          this.hoveredNodeId = null;
          this.tooltipNode = null;
          MakkoEngine.display.setCursor('default');
        }
      }
    }
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
    
    // Sync node state back to game
    const exportedNodes = this.nodeSystem.exportNodes();
    for (let i = 0; i < this.game.state.nodes.length; i++) {
      const exported = exportedNodes[i];
      this.game.state.nodes[i] = exported;
    }
  }

  render(): void {
    const display = MakkoEngine.display;
    const { width, height } = display;

    // Clear background
    display.clear(COLORS.background);

    // Render grid
    this.renderGrid(display);

    // Render UI elements
    this.renderEnergyDisplay(display);
    this.renderInventoryPanel(display);
    this.renderViralMultiplierBadge(display);
    this.renderDiveButton(display);
    this.renderHelpButton(display);

    // Render tooltip if hovering node
    if (this.tooltipNode) {
      this.renderNodeTooltip(display);
    }

    // Render Signal Log at bottom
    this.signalLog.render(display);

    // Render How to Play modal on top
    if (this.showHowToPlay) {
      this.renderHowToPlayModal(display);
    }
  }

  /**
   * Render 4x4 isometric grid
   */
  private renderGrid(display: typeof MakkoEngine.display): void {
    const nodes = this.nodeSystem.getAllNodes();

    for (const node of nodes) {
      const pos = this.nodeSystem.idToScreen(node.id);
      this.renderNode(display, node, pos);
    }
  }

  /**
   * Render a single node as procedural hexagon
   */
  private renderNode(display: typeof MakkoEngine.display, node: Node, pos: ScreenPosition): void {
    const isHovered = this.hoveredNodeId === node.id;
    const isPlayer = node.owner === 'player';

    // Level-based heights: 80, 120, 160
    const baseHeight = 80 + (node.level - 1) * 40;
    const radius = 30 + (node.level - 1) * 10;

    // Draw hexagon
    const hexPoints: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2;
      hexPoints.push({
        x: pos.x + Math.cos(angle) * radius,
        y: pos.y + Math.sin(angle) * radius
      });
    }

    // Fill color based on owner
    const fillColor = isPlayer ? COLORS.neonCyan : COLORS.neutralGray;
    const fillAlpha = isHovered ? 0.9 : 0.7;

    // Draw glow for player nodes
    if (isPlayer) {
      display.drawPolygon(hexPoints, {
        fill: COLORS.neonCyan,
        alpha: 0.2
      });
    }

    // Draw hexagon fill
    display.drawPolygon(hexPoints, {
      fill: fillColor,
      alpha: fillAlpha
    });

    // Draw hexagon border
    display.drawPolygon(hexPoints, {
      stroke: isPlayer ? COLORS.neonCyan : COLORS.neutralGray,
      lineWidth: isHovered ? 3 : 2,
      alpha: 1
    });

    // Draw level indicator dots
    for (let i = 0; i < node.level; i++) {
      const dotY = pos.y + radius * 0.6 - (i * 12);
      display.drawCircle(pos.x, dotY, 4, {
        fill: isPlayer ? COLORS.white : COLORS.neutralGray,
        alpha: 0.9
      });
    }

    // Draw stability bar if not 100%
    if (node.stability < 100 && isPlayer) {
      const barWidth = radius * 1.5;
      const barHeight = 4;
      const barX = pos.x - barWidth / 2;
      const barY = pos.y + radius + 10;

      // Background
      display.drawRect(barX, barY, barWidth, barHeight, {
        fill: COLORS.neutralGray,
        alpha: 0.5
      });

      // Fill
      const fillWidth = barWidth * (node.stability / 100);
      display.drawRect(barX, barY, fillWidth, barHeight, {
        fill: node.stability > 30 ? COLORS.neonCyan : COLORS.warningRed,
        alpha: 0.9
      });
    }
  }

  /**
   * Render energy display at top-left
   */
  private renderEnergyDisplay(display: typeof MakkoEngine.display): void {
    const energy = Math.floor(this.idleSystem.energy);
    const cap = Math.floor(this.idleSystem.energyCap);
    const rate = this.idleSystem.getEnergyRate();
    
    // Panel dimensions
    const panelX = 30;
    const panelY = 30;
    const panelWidth = 220;
    const panelHeight = 90;
    
    // Panel background with rounded corners
    display.drawRoundRect(panelX, panelY, panelWidth, panelHeight, LAYOUT.borderRadius, {
      fill: COLORS.panelBg,
      alpha: 0.9
    });
    
    // Panel border
    display.drawRoundRect(panelX, panelY, panelWidth, panelHeight, LAYOUT.borderRadius, {
      stroke: COLORS.neonCyan,
      lineWidth: LAYOUT.borderWidth,
      alpha: 0.5
    });

    // Energy label
    display.drawText('ENERGY', panelX + LAYOUT.padding, panelY + 25, {
      font: FONTS.labelFont,
      fill: COLORS.dimText
    });

    // Energy value
    display.drawText(`${energy} / ${cap}`, panelX + LAYOUT.padding, panelY + 55, {
      font: FONTS.titleFont,
      fill: COLORS.neonCyan
    });

    // Generation rate
    display.drawText(`+${rate.toFixed(1)}/s`, panelX + LAYOUT.padding, panelY + 78, {
      font: FONTS.smallFont,
      fill: COLORS.dimText
    });
  }

  /**
   * Render inventory panel at top-right
   */
  private renderInventoryPanel(display: typeof MakkoEngine.display): void {
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
  private renderInventorySlot(display: typeof MakkoEngine.display, x: number, y: number, item: { id: string; name: string; category: string } | undefined): void {
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
  private renderViralMultiplierBadge(display: typeof MakkoEngine.display): void {
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
  private renderDiveButton(display: typeof MakkoEngine.display): void {
    const { x, y, width, height } = this.diveButtonBounds;
    const mouseX = MakkoEngine.input.mouseX;
    const mouseY = MakkoEngine.input.mouseY;
    const isHovered = mouseX !== undefined && mouseY !== undefined &&
      this.isPointInBounds(mouseX, mouseY, this.diveButtonBounds);

    // Glow effect on hover
    if (isHovered) {
      display.drawRoundRect(x - 4, y - 4, width + 8, height + 8, LAYOUT.borderRadius + 2, {
        fill: COLORS.neonCyan,
        alpha: 0.15
      });
    }

    // Button background with rounded corners
    display.drawRoundRect(x, y, width, height, LAYOUT.borderRadius, {
      fill: COLORS.neonCyan,
      alpha: isHovered ? 0.3 : 0.1
    });

    // Button border with rounded corners
    display.drawRoundRect(x, y, width, height, LAYOUT.borderRadius, {
      stroke: COLORS.neonCyan,
      lineWidth: isHovered ? LAYOUT.borderWidthThick : LAYOUT.borderWidth,
      alpha: 1
    });

    // Button text
    display.drawText('DIVE', x + width / 2, y + height / 2, {
      font: FONTS.headingFont,
      fill: COLORS.neonCyan,
      align: 'center',
      baseline: 'middle'
    });
  }

  /**
   * Render Help button at top-right corner
   */
  private renderHelpButton(display: typeof MakkoEngine.display): void {
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
   * Render node tooltip
   */
  private renderNodeTooltip(display: typeof MakkoEngine.display): void {
    if (!this.tooltipNode) return;

    const tooltipWidth = 180;
    const tooltipHeight = 80;

    let tooltipX = this.tooltipPosition.x + 20;
    let tooltipY = this.tooltipPosition.y - tooltipHeight / 2;

    // Keep tooltip on screen
    if (tooltipX + tooltipWidth > display.width - 10) {
      tooltipX = this.tooltipPosition.x - tooltipWidth - 20;
    }
    if (tooltipY < 10) tooltipY = 10;
    if (tooltipY + tooltipHeight > display.height - 10) {
      tooltipY = display.height - tooltipHeight - 10;
    }

    // Tooltip background with rounded corners
    display.drawRoundRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, LAYOUT.borderRadius, {
      fill: COLORS.panelBg,
      alpha: 0.95
    });

    // Tooltip border with rounded corners
    display.drawRoundRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, LAYOUT.borderRadius, {
      stroke: COLORS.neonCyan,
      lineWidth: 1,
      alpha: 0.8
    });

    const node = this.tooltipNode;
    const textX = tooltipX + LAYOUT.paddingSmall;

    // Node ID
    display.drawText(`NODE ${node.id}`, textX, tooltipY + LAYOUT.paddingSmall + 10, {
      font: FONTS.bodyFont,
      fill: COLORS.white
    });

    // Level
    display.drawText(`Level: ${node.level}`, textX, tooltipY + LAYOUT.paddingSmall + 30, {
      font: FONTS.smallFont,
      fill: COLORS.dimText
    });

    // Owner
    const ownerText = node.owner === 'player' ? 'CONTROLLED' : 'NEUTRAL';
    const ownerColor = node.owner === 'player' ? COLORS.neonCyan : COLORS.neutralGray;
    display.drawText(`Status: ${ownerText}`, textX, tooltipY + LAYOUT.paddingSmall + 50, {
      font: FONTS.smallFont,
      fill: ownerColor
    });

    // Stability
    display.drawText(`Stability: ${node.stability}%`, textX, tooltipY + LAYOUT.paddingSmall + 70, {
      font: FONTS.smallFont,
      fill: node.stability > 50 ? COLORS.dimText : COLORS.warningRed
    });
  }

  /**
   * Render How to Play modal
   */
  private renderHowToPlayModal(display: typeof MakkoEngine.display): void {
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
    display: typeof MakkoEngine.display,
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
  }
}
