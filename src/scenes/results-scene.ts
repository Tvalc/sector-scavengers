/**
 * Results Scene
 * 
 * End-of-run summary with tweet receipt button,
 * Play.fun claim button, and return to idle.
 */

import { MakkoEngine } from '@makko/engine';
import type { Scene } from '../scene/interfaces';
import type { Game } from '../game/game';
import { playFunService, ClaimItem } from '../services/playfun-service';
import { SocialMultiplierSystem } from '../systems/social-multiplier-system';
import { MAX_ROUNDS } from '../types/state';
import { COLORS, FONTS, LAYOUT } from '../ui/theme';

/**
 * Additional colors specific to results scene
 */
const RESULTS_COLORS = {
  twitterBlue: '#1DA1F2',
  disabled: '#333344'
};

/**
 * ResultsScene - end-of-run summary
 */
export class ResultsScene implements Scene {
  readonly id = 'results';
  manager?: import('../scene/scene-manager').SceneManager;

  private game: Game;
  private socialSystem: SocialMultiplierSystem;

  // UI state
  private claimInProgress: boolean = false;
  private claimResult: { success: boolean; message: string } | null = null;
  private hoveredButton: string | null = null;

  // Button bounds
  private tweetButtonBounds = { x: 680, y: 700, width: 280, height: 60 };
  private claimButtonBounds = { x: 980, y: 700, width: 280, height: 60 };
  private returnButtonBounds = { x: 860, y: 900, width: 200, height: 60 };

  constructor(game: Game) {
    this.game = game;
    this.socialSystem = new SocialMultiplierSystem(game);
  }

  async init(): Promise<void> {
    // Initialize results resources
  }

  enter(previousScene?: string): void {
    // Reset UI state
    this.claimInProgress = false;
    this.claimResult = null;
    this.socialSystem = new SocialMultiplierSystem(this.game);
  }

  exit(nextScene?: string): void {
    // Cleanup
    this.claimResult = null;
  }

  handleInput(): void {
    const input = MakkoEngine.input;
    // Mouse interaction - input.mouseX/mouseY are already in game coordinates
    const mouseX = input.mouseX;
    const mouseY = input.mouseY;

    // Reset hover state
    this.hoveredButton = null;

    if (mouseX !== undefined && mouseY !== undefined) {
      // Check Tweet button
      if (this.isPointInBounds(mouseX, mouseY, this.tweetButtonBounds)) {
        this.hoveredButton = 'tweet';
        MakkoEngine.display.setCursor('pointer');
        if (input.isMousePressed(0)) {
          this.shareResults();
          return;
        }
      }
      // Check Claim button
      else if (this.isPointInBounds(mouseX, mouseY, this.claimButtonBounds)) {
        if (this.canClaim()) {
          this.hoveredButton = 'claim';
          MakkoEngine.display.setCursor('pointer');
          if (input.isMousePressed(0) && !this.claimInProgress) {
            this.claimRewards();
            return;
          }
        }
      }
      // Check Return button
      else if (this.isPointInBounds(mouseX, mouseY, this.returnButtonBounds)) {
        this.hoveredButton = 'return';
        MakkoEngine.display.setCursor('pointer');
        if (input.isMousePressed(0)) {
          this.game.returnToIdle();
          return;
        }
      }
      else {
        MakkoEngine.display.setCursor('default');
      }
    }

    // Keyboard shortcuts
    if (input.isKeyPressed('Space') || input.isKeyPressed('Enter')) {
      this.game.returnToIdle();
    }

    if (input.isKeyPressed('KeyT')) {
      this.shareResults();
    }

    if (input.isKeyPressed('KeyC') && this.canClaim() && !this.claimInProgress) {
      this.claimRewards();
    }
  }

  private isPointInBounds(x: number, y: number, bounds: { x: number; y: number; width: number; height: number }): boolean {
    return x >= bounds.x && x <= bounds.x + bounds.width &&
           y >= bounds.y && y <= bounds.y + bounds.height;
  }

  private canClaim(): boolean {
    const run = this.game.state.currentRun;
    if (!run) return false;
    
    // Can only claim if completed all 10 rounds and didn't collapse
    const completedAllRounds = run.round > MAX_ROUNDS;
    return completedAllRounds && !run.collapsed;
  }

  private shareResults(): void {
    const run = this.game.state.currentRun;
    if (!run) return;

    const receiptData = {
      amount: run.extractedRewards,
      items: run.collectedItems,
      collapsed: run.collapsed
    };

    const success = this.socialSystem.shareToTwitter(receiptData);
    
    if (success) {
      console.log('[Results] Shared to Twitter, boost activated');
    }
  }

  private async claimRewards(): Promise<void> {
    const run = this.game.state.currentRun;
    if (!run || !this.canClaim()) return;

    this.claimInProgress = true;
    console.log('[Results] Starting claim...');

    // Prepare claim items
    const items: ClaimItem[] = run.collectedItems.map(itemId => {
      const item = this.game.state.inventory.hardware.find(i => i.id === itemId) ||
                   this.game.state.inventory.crew.find(i => i.id === itemId);
      return {
        id: itemId,
        name: item?.name ?? itemId,
        tier: itemId === 'the_viralist' ? 'legendary' : 'rare'
      } as ClaimItem;
    });

    // Submit claim
    const result = await playFunService.submitClaim(run.extractedRewards, items);

    this.claimInProgress = false;

    if (result.success) {
      this.claimResult = { 
        success: true, 
        message: `Claimed! TX: ${result.txHash?.substring(0, 10)}...` 
      };
      this.game.state.totalPlayEarned += run.extractedRewards;
      this.game.saveState();
      console.log('[Results] Claim successful:', result.txHash);
    } else {
      this.claimResult = { 
        success: false, 
        message: result.error ?? 'Claim failed' 
      };
      console.error('[Results] Claim failed:', result.error);
    }
  }

  update(dt: number): void {
    this.socialSystem.update(dt);
  }

  render(): void {
    const display = MakkoEngine.display;
    const { width } = display;
    const run = this.game.state.currentRun;

    // Background
    display.clear(COLORS.background);

    // Render based on run state
    if (run?.collapsed) {
      this.renderCollapsedState(display, run);
    } else {
      this.renderSuccessState(display, run);
    }

    // Render buttons
    this.renderButtons(display, run);

    // Render claim result if any
    if (this.claimResult) {
      this.renderClaimResult(display);
    }

    // Render footer hint
    display.drawText('Press SPACE to return', width / 2, 980, {
      font: FONTS.smallFont,
      fill: COLORS.dimText,
      align: 'center'
    });
  }

  private renderSuccessState(display: typeof MakkoEngine.display, run: typeof this.game.state.currentRun): void {
    const { width } = display;

    // Title - success
    display.drawText('RUN COMPLETE', width / 2, 100, {
      font: 'bold 48px monospace',
      fill: COLORS.neonCyan,
      align: 'center'
    });

    if (!run) return;

    // Decorative line
    display.drawLine(width / 2 - 200, 140, width / 2 + 200, 140, {
      stroke: COLORS.neonCyan,
      lineWidth: LAYOUT.borderWidth,
      alpha: 0.5
    });

    // Rewards summary
    this.renderRewardsSummary(display, run);

    // Viral multiplier status
    this.renderMultiplierStatus(display);
  }

  private renderCollapsedState(display: typeof MakkoEngine.display, run: typeof this.game.state.currentRun): void {
    const { width } = display;

    // Title - collapse
    display.drawText('RIG COLLAPSE', width / 2, 100, {
      font: 'bold 48px monospace',
      fill: COLORS.warningRed,
      align: 'center'
    });

    // Decorative line
    display.drawLine(width / 2 - 200, 140, width / 2 + 200, 140, {
      stroke: COLORS.warningRed,
      lineWidth: LAYOUT.borderWidth,
      alpha: 0.5
    });

    // Collapse message
    display.drawText('All rewards lost to the void...', width / 2, 400, {
      font: FONTS.headingFont,
      fill: COLORS.dimText,
      align: 'center'
    });

    // Items collected before collapse
    if (run && run.collectedItems.length > 0) {
      display.drawText(`Items recovered: ${run.collectedItems.length}`, width / 2, 450, {
        font: FONTS.labelFont,
        fill: COLORS.neonMagenta,
        align: 'center'
      });
    }
  }

  private renderRewardsSummary(display: typeof MakkoEngine.display, run: typeof this.game.state.currentRun): void {
    if (!run) return;

    const { width } = display;
    const summaryY = 250;
    const panelWidth = 500;
    const panelHeight = 280;

    // Summary panel background with rounded corners
    display.drawRoundRect(width / 2 - 250, summaryY - 30, panelWidth, panelHeight, LAYOUT.borderRadiusLarge, {
      fill: COLORS.panelBg,
      alpha: 0.5
    });

    // Extracted nodes breakdown
    const playerNodes = this.game.state.nodes.filter(n => n.owner === 'player');
    let lineY = summaryY;
    const lineHeight = 24;

    display.drawText('EXTRACTED NODES:', width / 2, lineY, {
      font: FONTS.labelFont,
      fill: COLORS.white,
      align: 'center'
    });
    lineY += lineHeight + 10;

    // Show node breakdown (simulated extraction history)
    if (playerNodes.length > 0) {
      const viralMultiplier = this.game.getViralMultiplier();
      for (const node of playerNodes.slice(0, 5)) {
        const nodePayout = Math.floor(100 * (1 + node.level) * viralMultiplier);
        display.drawText(`Node ${node.id} (Level ${node.level}): ${nodePayout}`, width / 2, lineY, {
          font: FONTS.smallFont,
          fill: COLORS.dimText,
          align: 'center'
        });
        lineY += lineHeight;
      }
      if (playerNodes.length > 5) {
        display.drawText(`... and ${playerNodes.length - 5} more`, width / 2, lineY, {
          font: FONTS.tinyFont,
          fill: COLORS.dimText,
          align: 'center'
        });
        lineY += lineHeight;
      }
    } else {
      display.drawText('No nodes extracted', width / 2, lineY, {
        font: FONTS.smallFont,
        fill: COLORS.dimText,
        align: 'center'
      });
      lineY += lineHeight;
    }

    lineY += 10;

    // Total rewards
    display.drawText('TOTAL:', width / 2, lineY, {
      font: FONTS.labelFont,
      fill: COLORS.white,
      align: 'center'
    });
    lineY += 30;

    const totalAmount = Math.floor(run.extractedRewards);
    display.drawText(`${totalAmount}`, width / 2, lineY, {
      font: FONTS.titleFont,
      fill: COLORS.neonMagenta,
      align: 'center'
    });

    // Items collected
    if (run.collectedItems.length > 0) {
      lineY += 40;
      display.drawText(`Items Collected: ${run.collectedItems.length}`, width / 2, lineY, {
        font: FONTS.bodyFont,
        fill: COLORS.neonCyan,
        align: 'center'
      });
    }

    // Rounds completed
    lineY += 35;
    const roundsCompleted = Math.min(run.round - 1, MAX_ROUNDS);
    display.drawText(`Rounds: ${roundsCompleted}/${MAX_ROUNDS}`, width / 2, lineY, {
      font: FONTS.smallFont,
      fill: COLORS.dimText,
      align: 'center'
    });
  }

  private renderMultiplierStatus(display: typeof MakkoEngine.display): void {
    const { width } = display;
    const statusY = 500;

    const status = this.socialSystem.getStatus();

    if (status.active) {
      // Boost active with rounded corners
      display.drawRoundRect(width / 2 - 150, statusY - 15, 300, 40, LAYOUT.borderRadius, {
        fill: COLORS.neonMagenta,
        alpha: 0.2
      });

      display.drawRoundRect(width / 2 - 150, statusY - 15, 300, 40, LAYOUT.borderRadius, {
        stroke: COLORS.neonMagenta,
        lineWidth: LAYOUT.borderWidth,
        alpha: 0.8
      });

      display.drawText(`${status.multiplier}x BOOST ACTIVE`, width / 2, statusY + 5, {
        font: FONTS.labelFont,
        fill: COLORS.neonMagenta,
        align: 'center'
      });

      if (status.remainingFormatted) {
        display.drawText(status.remainingFormatted, width / 2 + 100, statusY + 5, {
          font: FONTS.smallFont,
          fill: COLORS.white,
          align: 'left'
        });
      }
    } else {
      // Boost inactive - prompt to share
      display.drawText('Share to boost 1.5x for 2h!', width / 2, statusY, {
        font: FONTS.bodyFont,
        fill: COLORS.dimText,
        align: 'center'
      });
    }
  }

  private renderButtons(display: typeof MakkoEngine.display, run: typeof this.game.state.currentRun): void {
    // Only show tweet and claim buttons if not collapsed
    if (!run?.collapsed) {
      // Tweet Receipt button
      this.renderButton(
        display,
        this.tweetButtonBounds,
        'TWEET RECEIPT',
        RESULTS_COLORS.twitterBlue,
        this.hoveredButton === 'tweet'
      );

      // Claim button (disabled if can't claim)
      const canClaim = this.canClaim();
      this.renderButton(
        display,
        this.claimButtonBounds,
        this.claimInProgress ? 'CLAIMING...' : 'CLAIM $PLAY',
        canClaim ? COLORS.neonMagenta : RESULTS_COLORS.disabled,
        this.hoveredButton === 'claim' && canClaim,
        !canClaim
      );
    }

    // Return button
    this.renderButton(
      display,
      this.returnButtonBounds,
      'RETURN',
      COLORS.neonCyan,
      this.hoveredButton === 'return'
    );
  }

  private renderButton(
    display: typeof MakkoEngine.display,
    bounds: { x: number; y: number; width: number; height: number },
    text: string,
    color: string,
    isHovered: boolean,
    isDisabled: boolean = false
  ): void {
    const { x, y, width, height } = bounds;

    // Glow effect on hover
    if (isHovered && !isDisabled) {
      display.drawRoundRect(x - 4, y - 4, width + 8, height + 8, LAYOUT.borderRadius + 2, {
        fill: color,
        alpha: 0.15
      });
    }

    // Button background with rounded corners
    display.drawRoundRect(x, y, width, height, LAYOUT.borderRadius, {
      fill: color,
      alpha: isDisabled ? 0.1 : (isHovered ? 0.3 : 0.15)
    });

    // Button border with rounded corners
    display.drawRoundRect(x, y, width, height, LAYOUT.borderRadius, {
      stroke: color,
      lineWidth: isHovered ? LAYOUT.borderWidthThick : LAYOUT.borderWidth,
      alpha: isDisabled ? 0.3 : 1
    });

    // Button text
    display.drawText(text, x + width / 2, y + height / 2, {
      font: isDisabled ? FONTS.bodyFont : FONTS.labelFont,
      fill: isDisabled ? COLORS.dimText : color,
      align: 'center',
      baseline: 'middle'
    });
  }

  private renderClaimResult(display: typeof MakkoEngine.display): void {
    if (!this.claimResult) return;

    const { width } = display;
    const resultY = 800;

    const color = this.claimResult.success ? COLORS.neonCyan : COLORS.warningRed;

    // Background with rounded corners
    display.drawRoundRect(width / 2 - 200, resultY - 15, 400, 40, LAYOUT.borderRadius, {
      fill: color,
      alpha: 0.2
    });

    display.drawText(this.claimResult.message, width / 2, resultY, {
      font: FONTS.bodyFont,
      fill: color,
      align: 'center'
    });
  }

  destroy(): void {
    // Cleanup
  }
}
