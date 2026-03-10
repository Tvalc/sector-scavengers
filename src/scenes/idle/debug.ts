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
 */
export class NodeDebugger {
  private enabled: boolean = false;
  private debugPositions: Array<{ x: number; y: number }> = [];
  private selectedNodeIndex: number = 0;

  /** Check if debugger is active */
  get isEnabled(): boolean {
    return this.enabled;
  }

  /** Toggle debugger on/off */
  toggle(): void {
    this.enabled = !this.enabled;
    if (this.enabled) {
      this.debugPositions = [...SHIP_POSITIONS];
      console.log('[DEBUG] Ship position debugger enabled');
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

    return true; // Input consumed
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

    display.drawText('NODE DEBUGGER', panelX + 10, panelY + 25, {
      font: 'bold 18px monospace',
      fill: '#00ff00'
    });

    const pos = this.debugPositions[this.selectedNodeIndex];
    const instructions = [
      `Selected: Node ${this.selectedNodeIndex}`,
      `Position: (${Math.round(pos.x)}, ${Math.round(pos.y)})`,
      this.getMouseInfo(),
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
