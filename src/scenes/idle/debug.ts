/**
 * Node Position Debugger
 *
 * Development tool for calibrating hub node positions.
 * Toggle with 'D' key in idle scene.
 */

import { MakkoEngine, IDisplay } from '@makko/engine';
import { SHIP_POSITIONS } from '../../systems/hub-system';

/**
 * NodeDebugger provides interactive node position calibration
 * and debug cheats for testing
 */
export class NodeDebugger {
  private enabled: boolean = false;
  private debugPositions: Array<{ x: number; y: number }> = [];
  private selectedNodeIndex: number = 0;
  private game: any; // Reference to Game for cheats
  private showHitboxes: boolean = false;

  constructor(game?: any) {
    this.game = game;
  }

  /** Check if debugger is active */
  get isEnabled(): boolean {
    return this.enabled;
  }

  /** Toggle debugger on/off */
  toggle(): void {
    this.enabled = !this.enabled;
    if (this.enabled) {
      this.debugPositions = [...SHIP_POSITIONS];
      this.showHitboxes = false;
      console.log('[DEBUG] Ship position debugger enabled');
      console.log('[DEBUG] Press B to toggle hitbox visualization');
      console.log('[DEBUG] Cheat keys:');
      console.log('  E = +100 energy');
      console.log('  Shift+E = +1000 energy');
      console.log('  M = Max energy (1000)');
      console.log('  C = +10 power cells');
      console.log('  Shift+C = +50 power cells');
    } else {
      console.log('[DEBUG] Ship position debugger disabled');
    }
  }

  /** Process input when debugger is active */
  handleInput(): boolean {
    if (!this.enabled) return false;

    const input = MakkoEngine.input;

    // Number keys 0-9 to select node
    this.handleNodeSelection(input);

    // Arrow keys to nudge selected node
    this.handleNudge(input);

    // Mouse click to place node
    this.handleClick(input);

    // P to print positions
    if (input.isKeyPressed('KeyP')) {
      this.printPositions();
    }

    // R to reset
    if (input.isKeyPressed('KeyR')) {
      this.debugPositions = [...SHIP_POSITIONS];
      console.log('[DEBUG] Reset to original positions');
    }

    // Toggle hitbox visualization
    if (input.isKeyPressed('KeyB')) {
      this.showHitboxes = !this.showHitboxes;
      console.log(`[DEBUG] Hitbox visualization: ${this.showHitboxes ? 'ON' : 'OFF'}`);
    }

    // Debug cheats
    this.handleCheats(input);

    return true; // Input consumed
  }

  /** Handle debug cheat keys */
  private handleCheats(input: typeof MakkoEngine.input): void {
    if (!this.game || !this.game.state) return;

    const isShift = input.isKeyDown('ShiftLeft') || input.isKeyDown('ShiftRight');

    // E = Add energy
    if (input.isKeyPressed('KeyE')) {
      const amount = isShift ? 1000 : 100;
      const oldEnergy = this.game.state.energy;
      this.game.addEnergy(amount);
      const gained = this.game.state.energy - oldEnergy;
      console.log(`[DEBUG] Added ${gained} energy (now: ${this.game.state.energy})`);
    }

    // M = Max energy
    if (input.isKeyPressed('KeyM')) {
      const oldEnergy = this.game.state.energy;
      this.game.state.energy = 1000; // Max cap
      const gained = this.game.state.energy - oldEnergy;
      console.log(`[DEBUG] Maxed energy: ${oldEnergy} → ${this.game.state.energy} (+${gained})`);
    }

    // C = Add power cells
    if (input.isKeyPressed('KeyC')) {
      const amount = isShift ? 50 : 10;
      this.game.state.resources.powerCells += amount;
      console.log(`[DEBUG] Added ${amount} power cells (now: ${this.game.state.resources.powerCells})`);
    }

    // G = Add death currency (Scrap)
    if (input.isKeyPressed('KeyG')) {
      const amount = isShift ? 100 : 10;
      this.game.state.deathCurrency += amount;
      console.log(`[DEBUG] Added ${amount} Scrap (now: ${this.game.state.deathCurrency})`);
    }
  }

  private handleNodeSelection(input: typeof MakkoEngine.input): void {
    for (let i = 0; i <= 9; i++) {
      const digitKey = `Digit${i}` as const;
      const numpadKey = `Numpad${i}` as const;
      
      if (input.isKeyPressed(digitKey) || input.isKeyPressed(numpadKey)) {
        const shift = input.isKeyDown('ShiftLeft') || input.isKeyDown('ShiftRight');
        const idx = shift ? 10 + i : i;
        
        if (idx < 16) {
          this.selectedNodeIndex = idx;
          console.log(`[DEBUG] Selected node ${idx}`);
        }
        return;
      }
    }
  }

  private handleNudge(input: typeof MakkoEngine.input): void {
    const nudge = (input.isKeyDown('ShiftLeft') || input.isKeyDown('ShiftRight')) ? 10 : 1;
    const pos = this.debugPositions[this.selectedNodeIndex];

    if (input.isKeyPressed('ArrowLeft')) {
      pos.x -= nudge;
      console.log(`[DEBUG] Node ${this.selectedNodeIndex}: x=${pos.x}`);
    }
    if (input.isKeyPressed('ArrowRight')) {
      pos.x += nudge;
      console.log(`[DEBUG] Node ${this.selectedNodeIndex}: x=${pos.x}`);
    }
    if (input.isKeyPressed('ArrowUp')) {
      pos.y -= nudge;
      console.log(`[DEBUG] Node ${this.selectedNodeIndex}: y=${pos.y}`);
    }
    if (input.isKeyPressed('ArrowDown')) {
      pos.y += nudge;
      console.log(`[DEBUG] Node ${this.selectedNodeIndex}: y=${pos.y}`);
    }
  }

  private handleClick(input: typeof MakkoEngine.input): void {
    const mouseX = input.mouseX;
    const mouseY = input.mouseY;
    
    if (mouseX !== undefined && mouseY !== undefined && input.isMousePressed(0)) {
      this.debugPositions[this.selectedNodeIndex] = { 
        x: Math.round(mouseX), 
        y: Math.round(mouseY) 
      };
      console.log(`[DEBUG] Node ${this.selectedNodeIndex} placed at (${Math.round(mouseX)}, ${Math.round(mouseY)})`);
      
      if (this.selectedNodeIndex < 15) {
        this.selectedNodeIndex++;
      }
    }
  }

  /** Render debug overlay */
  render(display: IDisplay): void {
    if (!this.enabled) return;

    // Render hitboxes if enabled
    if (this.showHitboxes) {
      this.renderHitboxes(display);
    }

    this.renderOriginalPositions(display);
    this.renderDebugPositions(display);
    this.renderPanel(display);
  }

  private renderOriginalPositions(display: IDisplay): void {
    for (let i = 0; i < 16; i++) {
      const pos = SHIP_POSITIONS[i];
      display.drawCircle(pos.x, pos.y, 35, { fill: '#ffff00', alpha: 0.3 });
      display.drawText(`${i}`, pos.x, pos.y + 50, {
        font: '12px monospace',
        fill: '#ffff00',
        align: 'center'
      });
    }
  }

  private renderDebugPositions(display: IDisplay): void {
    for (let i = 0; i < 16; i++) {
      const pos = this.debugPositions[i];
      const isSelected = i === this.selectedNodeIndex;

      display.drawCircle(pos.x, pos.y, isSelected ? 40 : 30, {
        fill: isSelected ? '#ff0000' : '#00ff00',
        alpha: 0.6
      });

      // Crosshair
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

      display.drawText(`${i}`, pos.x, pos.y, {
        font: 'bold 20px monospace',
        fill: '#ffffff',
        align: 'center',
        baseline: 'middle'
      });
    }
  }

  private renderPanel(display: IDisplay): void {
    const panelX = 20;
    const panelY = 200;
    const panelWidth = 320;
    const panelHeight = 340;

    display.drawRoundRect(panelX, panelY, panelWidth, panelHeight, 10, {
      fill: '#000000',
      alpha: 0.85
    });
    display.drawRoundRect(panelX, panelY, panelWidth, panelHeight, 10, {
      stroke: '#00ff00',
      lineWidth: 2
    });

    display.drawText('DEBUG MODE', panelX + 10, panelY + 25, {
      font: 'bold 18px monospace',
      fill: '#00ff00'
    });

    // Current resources (if game available)
    let yOffset = 50;
    if (this.game && this.game.state) {
      const state = this.game.state;
      const resources = [
        `Energy: ${Math.floor(state.energy)}/1000`,
        `Power Cells: ${state.resources?.powerCells || 0}`,
        `Scrap: ${state.deathCurrency || 0}`,
        `Deck Progress: ${state.deckUnlockProgress || 0}%`
      ];
      
      resources.forEach((text, idx) => {
        display.drawText(text, panelX + 10, panelY + yOffset + idx * 16, {
          font: '12px monospace',
          fill: '#ffff00'
        });
      });
      yOffset += resources.length * 16 + 10;
    }

    // Divider
    display.drawLine(panelX + 10, panelY + yOffset, panelX + panelWidth - 10, panelY + yOffset, {
      stroke: '#00ff00',
      lineWidth: 1,
      alpha: 0.5
    });
    yOffset += 10;

    // Node debugger section
    const pos = this.debugPositions[this.selectedNodeIndex];
    const nodeInstructions = [
      `Node ${this.selectedNodeIndex}: (${Math.round(pos.x)}, ${Math.round(pos.y)})`,
      this.getMouseInfo(),
      '',
      'NODE CONTROLS:',
      'Click: Place node',
      '0-9: Select node 0-9',
      'Shift+0-5: Select 10-15',
      'Arrows: Nudge (Shift: 10px)',
      'P: Print positions',
      'R: Reset positions'
    ];

    nodeInstructions.forEach((text, idx) => {
      const isHeader = text.includes('CONTROLS');
      display.drawText(text, panelX + 10, panelY + yOffset + idx * 14, {
        font: isHeader ? 'bold 11px monospace' : '11px monospace',
        fill: isHeader ? '#00ffff' : '#ffffff'
      });
    });
    yOffset += nodeInstructions.length * 14 + 10;

    // Cheat section
    display.drawLine(panelX + 10, panelY + yOffset, panelX + panelWidth - 10, panelY + yOffset, {
      stroke: '#00ff00',
      lineWidth: 1,
      alpha: 0.5
    });
    yOffset += 10;

    const cheatInstructions = [
      'CHEATS:',
      'E: +100 energy (Shift: +1000)',
      'M: Max energy',
      'C: +10 power cells (Shift: +50)',
      'G: +10 Scrap (Shift: +100)',
      'B: Toggle hitbox view',
      'D: Exit debugger'
    ];

    cheatInstructions.forEach((text, idx) => {
      const isHeader = text.includes('CHEATS');
      display.drawText(text, panelX + 10, panelY + yOffset + idx * 14, {
        font: isHeader ? 'bold 11px monospace' : '11px monospace',
        fill: isHeader ? '#ff00ff' : '#ffffff'
      });
    });
  }

  /** Render all UI hitboxes for debugging */
  private renderHitboxes(display: IDisplay): void {
    const input = MakkoEngine.input;
    const mouseX = input.mouseX || 0;
    const mouseY = input.mouseY || 0;

    // Button bounds from render-ui.ts (imported values would be ideal, but keeping in sync manually for debug)
    const buttons = [
      { name: 'DIVE', bounds: { x: 260, y: 821, width: 200, height: 139 }, color: '#00ffff' },
      { name: 'MISSION', bounds: { x: 1670, y: 20, width: 50, height: 50 }, color: '#ffff00' },
      { name: 'CREW', bounds: { x: 1730, y: 20, width: 50, height: 50 }, color: '#ff00ff' },
      { name: 'INVENTORY', bounds: { x: 1790, y: 20, width: 50, height: 50 }, color: '#00ff00' },
      { name: 'HELP', bounds: { x: 1850, y: 20, width: 50, height: 50 }, color: '#ff8800' }
    ];

    // Draw each button's clickable area
    for (const btn of buttons) {
      const b = btn.bounds;
      const isHovered = mouseX >= b.x && mouseX <= b.x + b.width && 
                        mouseY >= b.y && mouseY <= b.y + b.height;

      // Fill
      display.drawRect(b.x, b.y, b.width, b.height, {
        fill: btn.color,
        alpha: isHovered ? 0.4 : 0.15
      });

      // Border
      display.drawRect(b.x, b.y, b.width, b.height, {
        stroke: btn.color,
        lineWidth: 2,
        alpha: 1
      });

      // Label
      display.drawText(btn.name, b.x + b.width / 2, b.y + b.height / 2, {
        font: 'bold 12px monospace',
        fill: btn.color,
        align: 'center',
        baseline: 'middle'
      });

      // Coords
      display.drawText(`${b.x},${b.y}`, b.x + 2, b.y - 5, {
        font: '10px monospace',
        fill: btn.color,
        alpha: 0.8
      });
      display.drawText(`${b.width}x${b.height}`, b.x + b.width - 2, b.y + b.height + 12, {
        font: '10px monospace',
        fill: btn.color,
        align: 'right',
        alpha: 0.8
      });
    }

    // Draw what the visual asset bounds actually are for the Scavenge button
    const diveBounds = { x: 260, y: 900, width: 200, height: 60 };
    const assetWidth = 550 * 0.18;  // 99
    const assetHeight = 548 * 0.18; // ~98.6
    const propX = diveBounds.x + (diveBounds.width - assetWidth) / 2;  // 310.5
    const propY = diveBounds.y - assetHeight + 20;  // ~821.4

    // Draw the actual visual asset area
    display.drawRect(propX, propY, assetWidth, assetHeight, {
      stroke: '#ff0000',
      lineWidth: 2,
      alpha: 0.8
    });

    display.drawText('VISUAL ASSET', propX + assetWidth / 2, propY - 10, {
      font: '10px monospace',
      fill: '#ff0000',
      align: 'center',
      alpha: 0.9
    });

    // Mouse position indicator
    display.drawCircle(mouseX, mouseY, 8, {
      stroke: '#ffffff',
      lineWidth: 2,
      alpha: 0.8
    });
    display.drawLine(mouseX - 15, mouseY, mouseX + 15, mouseY, {
      stroke: '#ffffff',
      lineWidth: 1,
      alpha: 0.5
    });
    display.drawLine(mouseX, mouseY - 15, mouseX, mouseY + 15, {
      stroke: '#ffffff',
      lineWidth: 1,
      alpha: 0.5
    });
  }

  private getMouseInfo(): string {
    const mouseX = MakkoEngine.input.mouseX;
    const mouseY = MakkoEngine.input.mouseY;
    if (mouseX !== undefined && mouseY !== undefined) {
      return `Mouse: (${Math.round(mouseX)}, ${Math.round(mouseY)})`;
    }
    return 'Mouse: --';
  }

  private printPositions(): void {
    console.log('[DEBUG] Current positions:');
    console.log('export const SHIP_POSITIONS: Array<{ x: number; y: number }> = [');
    for (let i = 0; i < 16; i++) {
      const pos = this.debugPositions[i];
      console.log(`  { x: ${Math.round(pos.x)}, y: ${Math.round(pos.y)} },  // ${i}`);
    }
    console.log('];');
  }
}
