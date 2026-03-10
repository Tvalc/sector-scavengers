/**
 * Depth Dive Scene
 * 
 * Active 10-round tactical session with card drafting,
 * shields, stability, discovery events, and juice effects.
 */

import { MakkoEngine } from '@makko/engine';
import type { Scene } from '../scene/interfaces';
import type { Game } from '../game/game';
import { DepthDiveSystem } from '../systems/depth-dive-system';
import { TacticCardSystem, CardPlayResult } from '../systems/tactic-card-system';
import { DiscoveryEventSystem, DiscoveryEvent, RarityTier } from '../systems/discovery-event-system';
import { JuiceSystem } from '../systems/juice-system';
import { TacticCard, CardType } from '../types/cards';
import { MAX_ROUNDS, MAX_SHIELDS } from '../types/state';
import { COLORS, CARD_COLORS, FONTS, LAYOUT } from '../ui/theme';
import { BatteryCoreDisplay, ShipVisual, ShipVisualOptions } from '../ui/visual-components';
import { DangerMeter } from '../ui/visual-components';
import { COLLAPSE_PROBABILITY } from '../types/state';

/**
 * DepthDiveScene - active 10-round session
 */
export class DepthDiveScene implements Scene {
  readonly id = 'depthDive';
  manager?: import('../scene/scene-manager').SceneManager;

  private game: Game;
  private depthDiveSystem: DepthDiveSystem;
  private cardSystem: TacticCardSystem;
  private discoverySystem: DiscoveryEventSystem;
  private juice: JuiceSystem;

  // UI state
  private currentDraft: TacticCard[] = [];
  private hoveredCardIndex: number | null = null;
  private lastPlayedResult: CardPlayResult | null = null;

  // Button bounds
  private fleeButtonBounds = { x: 50, y: 900, width: 150, height: 50 };

  // Card dimensions
  private cardWidth = 160;
  private cardHeight = 240;
  private cardSpacing = 180;

  // Visual components
  private batteryDisplay: BatteryCoreDisplay;
  private dangerMeter: DangerMeter;

  constructor(game: Game) {
    this.game = game;
    this.juice = new JuiceSystem();
    this.depthDiveSystem = new DepthDiveSystem(game, this.juice);
    this.cardSystem = new TacticCardSystem(game, this.juice);
    this.discoverySystem = new DiscoveryEventSystem(game);

    // Initialize visual components
    this.batteryDisplay = new BatteryCoreDisplay(50, 30, 200, 24);
    this.dangerMeter = new DangerMeter(960 - 150, 80, 300, 20, 35);
  }

  async init(): Promise<void> {
    // Initialize resources
  }

  enter(previousScene?: string): void {
    // Reset systems for new run
    this.juice.clear();
    this.discoverySystem.reset();
    this.depthDiveSystem = new DepthDiveSystem(this.game, this.juice);
    this.cardSystem = new TacticCardSystem(this.game, this.juice);
    
    // Generate initial draft
    this.generateNewDraft();
    
    // Clear UI state
    this.lastPlayedResult = null;
    this.hoveredCardIndex = null;
  }

  exit(nextScene?: string): void {
    // Cleanup
    this.juice.clear();
  }

  handleInput(): void {
    const input = MakkoEngine.input;
    const run = this.game.state.currentRun;

    if (!run || run.collapsed) {
      // If collapsed, any key returns to results
      if (input.isKeyPressed('Space') || input.isKeyPressed('Enter')) {
        this.game.endDepthDive();
      }
      return;
    }

    // Handle discovery modal
    if (this.discoverySystem.isShowingModal()) {
      if (input.isKeyPressed('Space') || input.isKeyPressed('Enter')) {
        this.discoverySystem.hideModal();
      }
      return;
    }

    // Mouse interaction - input.mouseX/mouseY are already in game coordinates
    const mouseX = input.mouseX;
    const mouseY = input.mouseY;

    // Reset hover state
    this.hoveredCardIndex = null;

    if (mouseX !== undefined && mouseY !== undefined) {
      // Check card hover
      const cardIndex = this.getCardAtPosition(mouseX, mouseY);
      if (cardIndex !== null && cardIndex < this.currentDraft.length) {
        this.hoveredCardIndex = cardIndex;
        MakkoEngine.display.setCursor('pointer');
        
        if (input.isMousePressed(0)) {
          this.playCard(cardIndex);
          return;
        }
      }
      // Check flee button
      else if (this.isPointInBounds(mouseX, mouseY, this.fleeButtonBounds)) {
        MakkoEngine.display.setCursor('pointer');
        if (input.isMousePressed(0)) {
          this.flee();
          return;
        }
      }
      else {
        MakkoEngine.display.setCursor('default');
      }
    }

    // Keyboard shortcuts for cards (1, 2, 3)
    if (input.isKeyPressed('Digit1') && this.currentDraft.length >= 1) {
      this.playCard(0);
    }
    if (input.isKeyPressed('Digit2') && this.currentDraft.length >= 2) {
      this.playCard(1);
    }
    if (input.isKeyPressed('Digit3') && this.currentDraft.length >= 3) {
      this.playCard(2);
    }

    // Escape to flee
    if (input.isKeyPressed('Escape')) {
      this.flee();
    }
  }

  private isPointInBounds(x: number, y: number, bounds: { x: number; y: number; width: number; height: number }): boolean {
    return x >= bounds.x && x <= bounds.x + bounds.width &&
           y >= bounds.y && y <= bounds.y + bounds.height;
  }

  private getCardAtPosition(x: number, y: number): number | null {
    const centerX = 960;
    const startX = centerX - this.cardSpacing;
    const cardY = 700 - this.cardHeight / 2;

    for (let i = 0; i < this.currentDraft.length; i++) {
      const cardX = startX + (i * this.cardSpacing) - this.cardWidth / 2;
      if (x >= cardX && x <= cardX + this.cardWidth &&
          y >= cardY && y <= cardY + this.cardHeight) {
        return i;
      }
    }
    return null;
  }

  private playCard(index: number): void {
    if (index < 0 || index >= this.currentDraft.length) return;
    
    const card = this.currentDraft[index];
    const result = this.cardSystem.playCard(card.type, { juice: this.juice });
    
    this.lastPlayedResult = result;
    console.log(`[DepthDive] Played ${card.type}: ${result.message}`);

    if (result.success) {
      // Check for collapse
      if (result.collapsed) {
        // Collapsed - transition to results after delay
        setTimeout(() => {
          this.game.endDepthDive();
        }, 1000);
        return;
      }

      // Advance round
      const advanced = this.depthDiveSystem.advanceRound();
      
      if (!advanced) {
        // Run complete
        this.game.endDepthDive();
        return;
      }

      // Check for discovery event
      if (this.discoverySystem.shouldTriggerDiscovery()) {
        const event = this.discoverySystem.triggerDiscovery();
        if (event) {
          console.log(`[DepthDive] Discovery event: ${event.item.name}`);
        }
      }

      // Generate new draft
      this.generateNewDraft();
    }
  }

  private generateNewDraft(): void {
    const draft = this.cardSystem.draftCards(3);
    this.currentDraft = draft;
  }

  private flee(): void {
    const run = this.game.state.currentRun;
    if (!run || run.collapsed) return;

    // Fleeing loses all rewards
    run.extractedRewards = 0;
    run.collectedItems = [];
    
    console.log('[DepthDive] Fled! All rewards lost.');
    
    // End the dive - this handles persisted ship logic and state cleanup
    this.game.endDepthDive();
  }

  update(dt: number): void {
    // Update systems
    this.juice.update(dt);
    this.discoverySystem.update(dt);

    // Update danger meter pulse animation
    this.dangerMeter.update(dt);
  }

  render(): void {
    const display = MakkoEngine.display;
    const { width, height } = display;
    const run = this.game.state.currentRun;

    // Clear background
    display.clear(COLORS.background);

    // Render juice effects (shake offset, etc.)
    this.juice.render(display);

    if (!run) return;

    // Render collapsed state
    if (run.collapsed) {
      this.renderCollapsedState(display);
      this.juice.render(display);
      return;
    }

    // Render header
    this.renderHeader(display, run);

    // Render node mini-map
    this.renderMiniMap(display);

    // Render card draft area
    this.renderCards(display);

    // Render flee button
    this.renderFleeButton(display);

    // Render last action result
    if (this.lastPlayedResult) {
      this.renderActionResult(display);
    }

    // Render discovery modal on top
    if (this.discoverySystem.isShowingModal()) {
      this.renderDiscoveryModal(display);
    }

    // Render juice effects on top
    this.juice.render(display);
  }

  private renderHeader(display: typeof MakkoEngine.display, run: NonNullable<typeof this.game.state.currentRun>): void {
    // Round counter - centered top
    display.drawText(`ROUND ${run.round}/${MAX_ROUNDS}`, 960, 50, {
      font: FONTS.titleFont,
      fill: COLORS.neonMagenta,
      align: 'center'
    });

    // Danger meter - centered below round counter
    const collapseRisk = COLLAPSE_PROBABILITY * 100; // 35%
    this.dangerMeter.render(display, collapseRisk);

    // Shields - left of round
    display.drawText(`SHIELDS: ${run.shields}/${MAX_SHIELDS}`, 700, 50, {
      font: FONTS.headingFont,
      fill: COLORS.neonCyan,
      align: 'center'
    });

    // Hull integrity bar - right of round (with rounded ends)
    const hullBarX = 1020;
    const hullBarY = 45;
    const hullBarWidth = 300;
    const hullBarHeight = 20;

    // Calculate average hull integrity
    const playerShips = this.game.state.spacecraft.filter(s => s.owner === 'player');
    const avgHullIntegrity = playerShips.length > 0
      ? playerShips.reduce((sum, s) => sum + s.hullIntegrity, 0) / playerShips.length
      : 100;

    // Background with rounded corners
    display.drawRoundRect(hullBarX, hullBarY, hullBarWidth, hullBarHeight, hullBarHeight / 2, {
      fill: COLORS.panelBg,
      alpha: 0.8
    });

    // Fill with rounded corners (only if there's fill)
    const fillWidth = hullBarWidth * (avgHullIntegrity / 100);
    if (fillWidth > 0) {
      const fillColor = avgHullIntegrity > 50 ? COLORS.successGreen : 
                        avgHullIntegrity > 25 ? COLORS.warningYellow : COLORS.warningRed;
      display.drawRoundRect(hullBarX, hullBarY, Math.max(fillWidth, hullBarHeight), hullBarHeight, hullBarHeight / 2, {
        fill: fillColor,
        alpha: 0.9
      });
    }

    // Border with rounded corners
    display.drawRoundRect(hullBarX, hullBarY, hullBarWidth, hullBarHeight, hullBarHeight / 2, {
      stroke: COLORS.dimText,
      lineWidth: 1,
      alpha: 0.5
    });

    // Energy display using BatteryCoreDisplay - top-left
    const energy = Math.floor(this.game.state.energy);
    const energyCap = 1000; // BASE_ENERGY_CAP
    const extractedLabel = `EXTRACTED: ${Math.floor(run.extractedRewards)}`;
    this.batteryDisplay.render(display, energy, energyCap, extractedLabel);
  }

  private renderMiniMap(display: typeof MakkoEngine.display): void {
    const mapX = 1500;
    const mapY = 100;
    const mapWidth = 400;
    const mapHeight = 300;

    // Background with rounded corners
    display.drawRoundRect(mapX, mapY, mapWidth, mapHeight, LAYOUT.borderRadius, {
      fill: COLORS.panelBg,
      alpha: 0.5
    });

    // Border with rounded corners
    display.drawRoundRect(mapX, mapY, mapWidth, mapHeight, LAYOUT.borderRadius, {
      stroke: COLORS.neonCyan,
      lineWidth: LAYOUT.borderWidth,
      alpha: 0.5
    });

    // Title
    display.drawText('SALVAGE SECTOR', mapX + mapWidth / 2, mapY + 20, {
      font: FONTS.bodyFont,
      fill: COLORS.dimText,
      align: 'center'
    });

    // Draw ships using ShipVisual component (mini mode)
    const cellWidth = mapWidth / 4;
    const cellHeight = (mapHeight - 40) / 4;

    for (const ship of this.game.state.spacecraft) {
      const shipX = mapX + (ship.gridPosition.col * cellWidth) + cellWidth / 2;
      const shipY = mapY + 40 + (ship.gridPosition.row * cellHeight) + cellHeight / 2;
      const shipRadius = 8 + (ship.shipClass - 1) * 3;

      // Use ShipVisual in mini mode for simplified rendering
      const shipVisual = new ShipVisual(shipX, shipY, shipRadius, ship.shipClass);
      const options: ShipVisualOptions = {
        owner: ship.owner === 'player' ? 'player' : 'neutral',
        hullIntegrity: ship.hullIntegrity,
        hovered: false,
        mini: true
      };
      shipVisual.renderShip(display, options);
    }
  }

  private renderCards(display: typeof MakkoEngine.display): void {
    const centerX = 960;
    const cardY = 700 - this.cardHeight / 2;

    // Draw each card
    for (let i = 0; i < this.currentDraft.length; i++) {
      const card = this.currentDraft[i];
      const cardX = centerX - this.cardSpacing + (i * this.cardSpacing) - this.cardWidth / 2;
      const isHovered = this.hoveredCardIndex === i;
      const canAfford = this.cardSystem.canAfford(card.type);

      this.renderCard(display, card, cardX, cardY, isHovered, canAfford, i + 1);
    }

    // Hint text
    display.drawText('Select a card or press 1-2-3', centerX, cardY + this.cardHeight + 40, {
      font: FONTS.smallFont,
      fill: COLORS.dimText,
      align: 'center'
    });
  }

  private renderCard(
    display: typeof MakkoEngine.display,
    card: TacticCard,
    x: number,
    y: number,
    isHovered: boolean,
    canAfford: boolean,
    keyNumber: number
  ): void {
    const borderColor = CARD_COLORS[card.type];
    const scale = isHovered ? 1.1 : 1;
    const alpha = canAfford ? 1 : 0.5;

    // Calculate scaled dimensions
    const scaledWidth = this.cardWidth * scale;
    const scaledHeight = this.cardHeight * scale;
    const offsetX = (scaledWidth - this.cardWidth) / 2;
    const offsetY = (scaledHeight - this.cardHeight) / 2;
    const cardRadius = LAYOUT.borderRadiusLarge;

    // Glow effect on hover (behind card)
    if (isHovered && canAfford) {
      display.drawRoundRect(x - offsetX - 6, y - offsetY - 6, scaledWidth + 12, scaledHeight + 12, cardRadius + 2, {
        fill: borderColor,
        alpha: 0.15
      });
    }

    // Card background with rounded corners
    display.drawRoundRect(x - offsetX, y - offsetY, scaledWidth, scaledHeight, cardRadius, {
      fill: COLORS.cardBg,
      alpha: alpha * 0.95
    });

    // Card border with rounded corners
    display.drawRoundRect(x - offsetX, y - offsetY, scaledWidth, scaledHeight, cardRadius, {
      stroke: borderColor,
      lineWidth: isHovered ? LAYOUT.borderWidthThick : LAYOUT.borderWidth,
      alpha: alpha
    });

    // Card type label
    display.drawText(card.type, x + this.cardWidth / 2, y + 30, {
      font: FONTS.labelFont,
      fill: borderColor,
      align: 'center',
      alpha
    });

    // Energy cost
    display.drawText(`${card.energyCost}`, x + this.cardWidth / 2, y + 90, {
      font: FONTS.titleFont,
      fill: canAfford ? COLORS.white : COLORS.warningRed,
      align: 'center',
      alpha
    });

    display.drawText('ENERGY', x + this.cardWidth / 2, y + 120, {
      font: FONTS.tinyFont,
      fill: COLORS.dimText,
      align: 'center',
      alpha
    });

    // Description
    const descLines = this.wrapText(card.description, 20);
    let descY = y + 160;
    for (const line of descLines) {
      display.drawText(line, x + this.cardWidth / 2, descY, {
        font: FONTS.tinyFont,
        fill: COLORS.dimText,
        align: 'center',
        alpha
      });
      descY += 16;
    }

    // Risk indicator for EXTRACT
    if (card.type === 'EXTRACT') {
      display.drawText('35% RISK', x + this.cardWidth / 2, y + this.cardHeight - 30, {
        font: FONTS.bodyFont,
        fill: COLORS.warningRed,
        align: 'center',
        alpha
      });
    }

    // Key hint
    display.drawText(`[${keyNumber}]`, x + this.cardWidth / 2, y + this.cardHeight - 10, {
      font: FONTS.tinyFont,
      fill: COLORS.dimText,
      align: 'center',
      alpha: alpha * 0.5
    });
  }

  private wrapText(text: string, maxChars: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      if ((currentLine + ' ' + word).trim().length <= maxChars) {
        currentLine = (currentLine + ' ' + word).trim();
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);

    return lines;
  }

  private renderFleeButton(display: typeof MakkoEngine.display): void {
    const { x, y, width, height } = this.fleeButtonBounds;
    const mouseX = MakkoEngine.input.mouseX;
    const mouseY = MakkoEngine.input.mouseY;
    const isHovered = mouseX !== undefined && mouseY !== undefined &&
      this.isPointInBounds(mouseX, mouseY, this.fleeButtonBounds);

    // Glow effect on hover
    if (isHovered) {
      display.drawRoundRect(x - 3, y - 3, width + 6, height + 6, LAYOUT.borderRadius + 2, {
        fill: COLORS.warningRed,
        alpha: 0.15
      });
    }

    // Button background with rounded corners
    display.drawRoundRect(x, y, width, height, LAYOUT.borderRadius, {
      fill: COLORS.warningRed,
      alpha: isHovered ? 0.2 : 0.1
    });

    // Button border with rounded corners
    display.drawRoundRect(x, y, width, height, LAYOUT.borderRadius, {
      stroke: COLORS.warningRed,
      lineWidth: LAYOUT.borderWidth,
      alpha: 0.8
    });

    display.drawText('FLEE', x + width / 2, y + height / 2, {
      font: FONTS.labelFont,
      fill: COLORS.warningRed,
      align: 'center',
      baseline: 'middle'
    });
  }

  private renderActionResult(display: typeof MakkoEngine.display): void {
    if (!this.lastPlayedResult) return;

    const { width } = display;
    const y = 550;
    const color = this.lastPlayedResult.success ? COLORS.successGreen : COLORS.warningRed;

    // Background with rounded corners
    display.drawRoundRect(width / 2 - 300, y - 15, 600, 40, LAYOUT.borderRadius, {
      fill: color,
      alpha: 0.2
    });

    display.drawText(this.lastPlayedResult.message, width / 2, y, {
      font: FONTS.bodyFont,
      fill: color,
      align: 'center'
    });
  }

  private renderCollapsedState(display: typeof MakkoEngine.display): void {
    const { width, height } = display;

    display.drawText('HULL BREACH!', width / 2, height / 2 - 50, {
      font: 'bold 64px monospace',
      fill: COLORS.warningRed,
      align: 'center'
    });

    display.drawText('All rewards lost...', width / 2, height / 2 + 20, {
      font: FONTS.headingFont,
      fill: COLORS.dimText,
      align: 'center'
    });

    display.drawText('Press SPACE to continue', width / 2, height / 2 + 80, {
      font: FONTS.labelFont,
      fill: COLORS.dimText,
      align: 'center'
    });
  }

  private renderDiscoveryModal(display: typeof MakkoEngine.display): void {
    const event = this.discoverySystem.getCurrentEvent();
    if (!event) return;

    const { width, height } = display;
    const modalWidth = 400;
    const modalHeight = 300;
    const modalX = (width - modalWidth) / 2;
    const modalY = (height - modalHeight) / 2 - 50;

    // Darken background
    display.drawRect(0, 0, width, height, {
      fill: '#000000',
      alpha: 0.7
    });

    // Modal background with rounded corners
    display.drawRoundRect(modalX, modalY, modalWidth, modalHeight, LAYOUT.borderRadiusLarge, {
      fill: COLORS.panelBg,
      alpha: 0.95
    });

    // Modal border with rarity color and rounded corners
    const rarityColor = DiscoveryEventSystem.getRarityColor(event.tier);
    display.drawRoundRect(modalX, modalY, modalWidth, modalHeight, LAYOUT.borderRadiusLarge, {
      stroke: rarityColor,
      lineWidth: LAYOUT.borderWidthThick,
      alpha: 1
    });

    // Rarity glow effect with rounded corners
    display.drawRoundRect(modalX - 5, modalY - 5, modalWidth + 10, modalHeight + 10, LAYOUT.borderRadiusLarge + 2, {
      stroke: rarityColor,
      lineWidth: LAYOUT.borderWidth,
      alpha: 0.3
    });

    // Title
    display.drawText('DISCOVERY!', modalX + modalWidth / 2, modalY + 40, {
      font: FONTS.titleFont,
      fill: rarityColor,
      align: 'center'
    });

    // Item icon placeholder (colored circle)
    const iconY = modalY + 120;
    display.drawCircle(modalX + modalWidth / 2, iconY, 50, {
      fill: rarityColor,
      alpha: 0.3
    });
    display.drawCircle(modalX + modalWidth / 2, iconY, 40, {
      fill: rarityColor,
      alpha: 0.6
    });

    // Item name
    display.drawText(event.item.name, modalX + modalWidth / 2, iconY + 70, {
      font: FONTS.headingFont,
      fill: COLORS.white,
      align: 'center'
    });

    // Item description
    display.drawText(event.item.description, modalX + modalWidth / 2, iconY + 100, {
      font: FONTS.smallFont,
      fill: COLORS.dimText,
      align: 'center'
    });

    // Rarity badge
    const tierText = event.tier.toUpperCase();
    display.drawText(tierText, modalX + modalWidth / 2, modalY + modalHeight - 60, {
      font: FONTS.bodyFont,
      fill: rarityColor,
      align: 'center'
    });

    // Collect button
    const buttonY = modalY + modalHeight - 30;
    display.drawText('[SPACE] COLLECT', modalX + modalWidth / 2, buttonY, {
      font: FONTS.bodyFont,
      fill: COLORS.neonCyan,
      align: 'center'
    });
  }

  destroy(): void {
    this.juice.clear();
  }
}
