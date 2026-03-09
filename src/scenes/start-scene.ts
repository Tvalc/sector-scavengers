/**
 * Start Scene
 * 
 * Title screen with SS:SS:SS2 background image, game title,
 * Play button, and How to Play button.
 */

import { MakkoEngine } from '@makko/engine';
import type { Scene } from '../scene/interfaces';
import type { Game } from '../game/game';

/**
 * Color palette
 */
const COLORS = {
  neonCyan: '#00f0ff',
  neonMagenta: '#ff00aa',
  warningRed: '#ff3344',
  neutralGray: '#3a3f4c',
  background: '#0a0e1a',
  panelBg: '#141824',
  white: '#ffffff',
  dimText: '#666666'
};

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
 * StartScene - title screen with background and menu
 */
export class StartScene implements Scene {
  readonly id = 'start';
  manager?: import('../scene/scene-manager').SceneManager;

  private game: Game;

  // UI State
  private showHowToPlay: boolean = false;

  // Button bounds
  private playButtonBounds = { x: 810, y: 700, width: 300, height: 70 };
  private howToPlayButtonBounds = { x: 810, y: 790, width: 300, height: 70 };
  private skipTutorialBounds = { x: 810, y: 880, width: 300, height: 50 };

  // Background asset
  private backgroundLoaded: boolean = false;

  constructor(game: Game) {
    this.game = game;
  }

  async init(): Promise<void> {
    // Check if background is loaded
    this.backgroundLoaded = MakkoEngine.hasStaticAsset('ss_ss_ss2');
    if (!this.backgroundLoaded) {
      console.warn('[StartScene] Background image ss_ss_ss2 not loaded');
    }
  }

  enter(previousScene?: string): void {
    this.showHowToPlay = false;
  }

  exit(nextScene?: string): void {
    this.showHowToPlay = false;
  }

  handleInput(): void {
    const input = MakkoEngine.input;

    // Close modal on Escape
    if (input.isKeyPressed('Escape') && this.showHowToPlay) {
      this.showHowToPlay = false;
      return;
    }

    // If modal is showing, only allow closing
    if (this.showHowToPlay) {
      if (input.isKeyPressed('Space') || input.isKeyPressed('Enter')) {
        this.showHowToPlay = false;
      }
      return;
    }

    // Start game on Space or Enter
    if (input.isKeyPressed('Space') || input.isKeyPressed('Enter')) {
      this.startGame();
      return;
    }

    // Mouse interaction
    const mouseX = input.mouseX;
    const mouseY = input.mouseY;

    if (mouseX !== undefined && mouseY !== undefined) {
      // Check Play button
      if (this.isPointInBounds(mouseX, mouseY, this.playButtonBounds)) {
        MakkoEngine.display.setCursor('pointer');
        if (input.isMousePressed(0)) {
          this.startGame();
          return;
        }
      }
      // Check How to Play button
      else if (this.isPointInBounds(mouseX, mouseY, this.howToPlayButtonBounds)) {
        MakkoEngine.display.setCursor('pointer');
        if (input.isMousePressed(0)) {
          this.showHowToPlay = true;
          return;
        }
      }
      // Check Skip Tutorial toggle
      else if (this.isPointInBounds(mouseX, mouseY, this.skipTutorialBounds)) {
        MakkoEngine.display.setCursor('pointer');
        if (input.isMousePressed(0)) {
          this.toggleSkipTutorial();
          return;
        }
      }
      else {
        MakkoEngine.display.setCursor('default');
      }
    }
  }

  private isPointInBounds(x: number, y: number, bounds: { x: number; y: number; width: number; height: number }): boolean {
    return x >= bounds.x && x <= bounds.x + bounds.width &&
           y >= bounds.y && y <= bounds.y + bounds.height;
  }

  private toggleSkipTutorial(): void {
    const currentState = this.game.isTutorialSkipped();
    this.game.setTutorialSkipped(!currentState);
  }

  private startGame(): void {
    // Toggle controls tutorial behavior:
    // - Unchecked (default) = show tutorial (even for returning players)
    // - Checked = skip tutorial
    if (this.game.isTutorialSkipped()) {
      this.game.switchScene('idle');
    } else {
      this.game.switchScene('tutorial');
    }
  }

  update(dt: number): void {
    // No continuous updates needed
  }

  render(): void {
    const display = MakkoEngine.display;
    const { width, height } = display;

    // Draw background image
    this.renderBackground(display);

    // Draw title
    this.renderTitle(display);

    // Draw buttons
    this.renderPlayButton(display);
    this.renderHowToPlayButton(display);
    this.renderSkipTutorialToggle(display);

    // Render How to Play modal on top
    if (this.showHowToPlay) {
      this.renderHowToPlayModal(display);
    }
  }

  /**
   * Render background image
   */
  private renderBackground(display: typeof MakkoEngine.display): void {
    // Try to load and render the background
    const bg = MakkoEngine.staticAsset('ss_ss_ss2');
    
    if (bg) {
      // Draw the background image scaled to fit the screen
      display.drawImage(bg.image, 0, 0, display.width, display.height);
    } else {
      // Fallback: dark space background with subtle gradient effect
      display.clear(COLORS.background);
      
      // Draw some decorative elements as fallback
      this.renderFallbackBackground(display);
    }
  }

  /**
   * Render fallback background when image not available
   */
  private renderFallbackBackground(display: typeof MakkoEngine.display): void {
    // Draw scattered "stars"
    const starCount = 100;
    for (let i = 0; i < starCount; i++) {
      // Use deterministic positions based on index
      const x = ((i * 7919) % display.width);
      const y = ((i * 6271) % display.height);
      const size = 1 + (i % 3);
      const alpha = 0.3 + ((i % 7) * 0.1);
      
      display.drawCircle(x, y, size, {
        fill: COLORS.white,
        alpha
      });
    }

    // Draw some nebula-like circles
    display.drawCircle(300, 200, 200, { fill: COLORS.neonCyan, alpha: 0.05 });
    display.drawCircle(1600, 800, 300, { fill: COLORS.neonMagenta, alpha: 0.05 });
    display.drawCircle(960, 540, 400, { fill: '#1a1a2e', alpha: 0.3 });
  }

  /**
   * Render game title
   */
  private renderTitle(display: typeof MakkoEngine.display): void {
    const centerX = display.width / 2;
    
    // Main title
    display.drawText('SECTOR SCAVENGERS', centerX, 200, {
      font: 'bold 72px monospace',
      fill: COLORS.neonCyan,
      align: 'center'
    });

    // Subtitle
    display.drawText('SIGNAL & SALVAGE', centerX, 280, {
      font: 'bold 36px monospace',
      fill: COLORS.neonMagenta,
      align: 'center'
    });

    // Decorative line
    display.drawLine(centerX - 300, 310, centerX + 300, 310, {
      stroke: COLORS.neonCyan,
      lineWidth: 2,
      alpha: 0.5
    });
  }

  /**
   * Render Play button
   */
  private renderPlayButton(display: typeof MakkoEngine.display): void {
    const { x, y, width, height } = this.playButtonBounds;
    const mouseX = MakkoEngine.input.mouseX;
    const mouseY = MakkoEngine.input.mouseY;
    const isHovered = mouseX !== undefined && mouseY !== undefined &&
      this.isPointInBounds(mouseX, mouseY, this.playButtonBounds);

    // Button background
    display.drawRect(x, y, width, height, {
      fill: isHovered ? COLORS.neonCyan : COLORS.panelBg,
      alpha: isHovered ? 0.3 : 0.9
    });

    // Button border
    display.drawRect(x, y, width, height, {
      stroke: COLORS.neonCyan,
      lineWidth: isHovered ? 4 : 2,
      alpha: 1
    });

    // Button text
    display.drawText('PLAY', x + width / 2, y + height / 2, {
      font: 'bold 32px monospace',
      fill: isHovered ? COLORS.white : COLORS.neonCyan,
      align: 'center',
      baseline: 'middle'
    });
  }

  /**
   * Render How to Play button
   */
  private renderHowToPlayButton(display: typeof MakkoEngine.display): void {
    const { x, y, width, height } = this.howToPlayButtonBounds;
    const mouseX = MakkoEngine.input.mouseX;
    const mouseY = MakkoEngine.input.mouseY;
    const isHovered = mouseX !== undefined && mouseY !== undefined &&
      this.isPointInBounds(mouseX, mouseY, this.howToPlayButtonBounds);

    // Button background
    display.drawRect(x, y, width, height, {
      fill: isHovered ? COLORS.neonMagenta : COLORS.panelBg,
      alpha: isHovered ? 0.3 : 0.9
    });

    // Button border
    display.drawRect(x, y, width, height, {
      stroke: COLORS.neonMagenta,
      lineWidth: isHovered ? 4 : 2,
      alpha: 1
    });

    // Button text
    display.drawText('HOW TO PLAY', x + width / 2, y + height / 2, {
      font: 'bold 28px monospace',
      fill: isHovered ? COLORS.white : COLORS.neonMagenta,
      align: 'center',
      baseline: 'middle'
    });
  }

  /**
   * Render Skip Tutorial toggle
   */
  private renderSkipTutorialToggle(display: typeof MakkoEngine.display): void {
    const { x, y, width, height } = this.skipTutorialBounds;
    const mouseX = MakkoEngine.input.mouseX;
    const mouseY = MakkoEngine.input.mouseY;
    const isHovered = mouseX !== undefined && mouseY !== undefined &&
      this.isPointInBounds(mouseX, mouseY, this.skipTutorialBounds);
    const isSkipped = this.game.isTutorialSkipped();

    // Toggle background
    display.drawRect(x, y, width, height, {
      fill: isSkipped 
        ? (isHovered ? '#00b8c4' : COLORS.neonCyan)
        : (isHovered ? '#1e2433' : COLORS.panelBg),
      alpha: isSkipped ? 0.4 : 0.9
    });

    // Toggle border
    display.drawRect(x, y, width, height, {
      stroke: COLORS.neonCyan,
      lineWidth: isHovered ? 3 : 2,
      alpha: 1
    });

    // Toggle text with checkbox symbol
    const checkboxSymbol = isSkipped ? '☑' : '☐';
    const label = `${checkboxSymbol} Skip Tutorial`;
    display.drawText(label, x + width / 2, y + height / 2, {
      font: 'bold 24px monospace',
      fill: isSkipped 
        ? COLORS.white 
        : (isHovered ? COLORS.white : COLORS.neonCyan),
      align: 'center',
      baseline: 'middle'
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

    // Modal background
    display.drawRect(modalX, modalY, modalWidth, modalHeight, {
      fill: COLORS.panelBg,
      alpha: 0.95
    });

    // Modal border
    display.drawRect(modalX, modalY, modalWidth, modalHeight, {
      stroke: COLORS.neonMagenta,
      lineWidth: 3,
      alpha: 1
    });

    // Title
    display.drawText(HOW_TO_PLAY_CONTENT.title, modalX + modalWidth / 2, modalY + 50, {
      font: 'bold 32px monospace',
      fill: COLORS.neonMagenta,
      align: 'center'
    });

    // Decorative line
    display.drawLine(modalX + 100, modalY + 80, modalX + modalWidth - 100, modalY + 80, {
      stroke: COLORS.neonMagenta,
      lineWidth: 2,
      alpha: 0.5
    });

    // Bullet points
    const bulletStartY = modalY + 120;
    const bulletSpacing = 50;

    HOW_TO_PLAY_CONTENT.bullets.forEach((bullet, index) => {
      const bulletY = bulletStartY + index * bulletSpacing;
      
      // Bullet point
      display.drawCircle(modalX + 50, bulletY + 8, 6, {
        fill: COLORS.neonCyan
      });

      // Text (wrapped if needed)
      const maxWidth = modalWidth - 120;
      this.renderWrappedText(display, bullet, modalX + 70, bulletY, maxWidth, {
        font: '16px monospace',
        fill: COLORS.white
      });
    });

    // Close hint
    display.drawText('Press ESC, SPACE, or ENTER to close', modalX + modalWidth / 2, modalY + modalHeight - 40, {
      font: '14px monospace',
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

    for (const word of words) {
      const testLine = line + (line ? ' ' : '') + word;
      const metrics = display.measureText(testLine, { font: style.font });
      
      if (metrics.width > maxWidth && line) {
        display.drawText(line, x, lineY, style);
        line = word;
        lineY += 20;
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
