/**
 * Results Scene
 * 
 * End-of-run summary with broadcast receipt button,
 * Play.fun claim button, and return to idle.
 */

import { MakkoEngine } from '@makko/engine';
import type { Scene } from '../scene/interfaces';
import type { Game } from '../game/game';
import { playFunService, ClaimItem } from '../services/playfun-service';
import { SocialMultiplierSystem } from '../systems/social-multiplier-system';
import { MAX_ROUNDS } from '../types/state';
import { COLORS, FONTS, LAYOUT } from '../ui/theme';
import { getAuthoredRecruit } from '../types/crew';

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
  private broadcastButtonBounds = { x: 680, y: 700, width: 280, height: 60 };
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
      // Check Broadcast button
      if (this.isPointInBounds(mouseX, mouseY, this.broadcastButtonBounds)) {
        this.hoveredButton = 'broadcast';
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

    // Rewards summary - returns bottom Y of panel
    const panelBottom = this.renderRewardsSummary(display, run);

    // Viral multiplier status - positioned below rewards panel
    const multiplierY = panelBottom + 40;
    this.renderMultiplierStatus(display, multiplierY);

    // Ability trigger summary - positioned below multiplier status
    const abilityY = multiplierY + 60;
    this.renderAbilitySummary(display, run, abilityY);
  }
  
  /**
   * Render ability trigger summary showing which abilities activated
   */
  private renderAbilitySummary(display: typeof MakkoEngine.display, run: typeof this.game.state.currentRun, startY: number): void {
    if (!run) return;
    
    const { width } = display;
    const lineHeight = 28;
    
    const abilities: string[] = [];
    
    // Check each ability usage flag
    if (run.abilityUsage.workingMemoryUsed) {
      abilities.push("MAX'S WORKING MEMORY: Hand rerolled for better options");
    }
    if (run.abilityUsage.triageUsed) {
      abilities.push("IMANI'S TRIAGE PROTOCOL: Crew saved from hull breach");
    }
    if (run.abilityUsage.fieldRetrofitUsed) {
      abilities.push("JAX'S FIELD RETROFIT: Breach stabilized at 50% hull");
    }
    if (run.abilityUsage.signalTraceUsed) {
      abilities.push("SERA'S SIGNAL TRACE: Hidden cache revealed");
    }
    if (run.abilityUsage.deadDropUsed) {
      abilities.push(`ROOK'S DEAD DROP: ${Math.floor(run.bankedRewards)} energy banked safely`);
    }
    if (run.abilityUsage.ghostCredentialUsed) {
      abilities.push("DEL'S GHOST CREDENTIAL: Ship action authorized");
    }
    
    // Check passive bonuses
    const bonusMessages: string[] = [];
    if (run.appliedPassiveBonuses.shieldBonus > 0) {
      bonusMessages.push(`+${run.appliedPassiveBonuses.shieldBonus} SHIELD`);
    }
    if (run.appliedPassiveBonuses.repairBonus > 0) {
      bonusMessages.push(`+${run.appliedPassiveBonuses.repairBonus}% Repair`);
    }
    if (run.appliedPassiveBonuses.discoveryBonus > 0) {
      bonusMessages.push(`+${run.appliedPassiveBonuses.discoveryBonus}% Discovery`);
    }
    if (run.appliedPassiveBonuses.extractionBonus > 0) {
      bonusMessages.push(`+${run.appliedPassiveBonuses.extractionBonus}% Extraction`);
    }
    
    if (abilities.length === 0 && bonusMessages.length === 0) return;
    
    // Panel header
    display.drawText('ABILITIES ACTIVATED', width / 2, startY, {
      font: FONTS.labelFont,
      fill: COLORS.neonMagenta,
      align: 'center'
    });
    
    let y = startY + 30;
    
    // Render passive bonuses
    if (bonusMessages.length > 0) {
      display.drawText(`Passive: ${bonusMessages.join(' | ')}`, width / 2, y, {
        font: FONTS.smallFont,
        fill: COLORS.dimText,
        align: 'center'
      });
      y += lineHeight;
    }
    
    // Render active abilities
    for (const ability of abilities) {
      display.drawText(ability, width / 2, y, {
        font: FONTS.smallFont,
        fill: COLORS.neonCyan,
        align: 'center'
      });
      y += lineHeight;
    }
  }

  private renderCollapsedState(display: typeof MakkoEngine.display, run: typeof this.game.state.currentRun): void {
    const { width } = display;

    // Title - collapse
    display.drawText('HULL BREACH', width / 2, 100, {
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

    // Current sector display
    const currentSector = this.game.state.meta.currentSector;
    display.drawText(`Operating in Sector ${currentSector}`, width / 2, 350, {
      font: FONTS.labelFont,
      fill: COLORS.warningYellow,
      align: 'center'
    });
    
    // Collapse message
    display.drawText('All rewards lost to the void...', width / 2, 400, {
      font: FONTS.headingFont,
      fill: COLORS.dimText,
      align: 'center'
    });
    
    // Narrative context for collapse
    display.drawText('Crew lost. Momentum stalled. The debt remains.', width / 2, 425, {
      font: FONTS.bodyFont,
      fill: COLORS.warningYellow,
      alpha: 0.8,
      align: 'center'
    });

    // Show meta progression earned
    if (run && run.scrapEarned > 0) {
      const progressY = 450;
      display.drawText(`Scrap earned: +${run.scrapEarned}`, width / 2, progressY, {
        font: FONTS.labelFont,
        fill: COLORS.neonCyan,
        align: 'center'
      });
      
      // Show deck unlock progress
      const progressPercent = this.game.state.deckUnlockProgress;
      display.drawText(`Deck Progress: ${progressPercent}%`, width / 2, progressY + 30, {
        font: FONTS.smallFont,
        fill: COLORS.dimText,
        align: 'center'
      });
      
      // Show if a card was unlocked
      if (this.game.state.nextUnlockCardId) {
        display.drawText(`NEW CARD UNLOCKED!`, width / 2, progressY + 60, {
          font: FONTS.labelFont,
          fill: COLORS.neonMagenta,
          align: 'center'
        });
      }
    }
  }

  private renderRewardsSummary(display: typeof MakkoEngine.display, run: typeof this.game.state.currentRun): number {
    if (!run) return 500;

    const { width } = display;
    const summaryY = 250;
    const panelWidth = 500;
    const lineHeight = 24;

    // Calculate required panel height based on content
    const playerShips = this.game.state.spacecraft.filter(s => s.owner === 'player');
    const shipCount = Math.min(playerShips.length, 5);
    const hasMoreShips = playerShips.length > 5;
    const hasItems = run.collectedItems.length > 0;

    // Base height calculation:
    // - Header: 34 (label + gap)
    // - Ships section: (shipCount + hasMoreShips) * 24
    // - Gap after ships: 10
    // - TOTAL section: 30
    // - Items section (if any): 40
    // - Rounds: 35
    // - Sector: 30
    // - Debt service: 35
    // - Billing: 25
    // - Debt status: 30
    // - Top padding: 30
    // - Bottom padding: 20
    const baseHeight = 34 + 10 + 30 + 35 + 30 + 35 + 25 + 30 + 30 + 20;
    const shipsHeight = (shipCount === 0 ? 1 : shipCount) * lineHeight + (hasMoreShips ? lineHeight : 0);
    const itemsHeight = hasItems ? 40 : 0;
    const panelHeight = baseHeight + shipsHeight + itemsHeight;

    // Summary panel background with rounded corners
    display.drawRoundRect(width / 2 - 250, summaryY - 30, panelWidth, panelHeight, LAYOUT.borderRadiusLarge, {
      fill: COLORS.panelBg,
      alpha: 0.5
    });

    let lineY = summaryY;

    display.drawText('SALVAGED SHIPS:', width / 2, lineY, {
      font: FONTS.labelFont,
      fill: COLORS.white,
      align: 'center'
    });
    lineY += lineHeight + 10;

    // Show ship breakdown (simulated salvage history)
    if (playerShips.length > 0) {
      const viralMultiplier = this.game.getViralMultiplier();
      for (const ship of playerShips.slice(0, 5)) {
        const shipPayout = Math.floor(100 * (1 + ship.shipClass) * viralMultiplier);
        display.drawText(`Ship ${ship.id} (Class ${ship.shipClass}): ${shipPayout}`, width / 2, lineY, {
          font: FONTS.smallFont,
          fill: COLORS.dimText,
          align: 'center'
        });
        lineY += lineHeight;
      }
      if (playerShips.length > 5) {
        display.drawText(`... and ${playerShips.length - 5} more`, width / 2, lineY, {
          font: FONTS.tinyFont,
          fill: COLORS.dimText,
          align: 'center'
        });
        lineY += lineHeight;
      }
    } else {
      display.drawText('No ships salvaged', width / 2, lineY, {
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
    
    // Current sector display
    lineY += 30;
    const currentSector = this.game.state.meta.currentSector;
    display.drawText(`Operating in Sector ${currentSector}`, width / 2, lineY, {
      font: FONTS.labelFont,
      fill: COLORS.neonCyan,
      align: 'center'
    });
    
    // Debt service message (narrative context for debt payment)
    lineY += 35;
    const debtServiced = run && !run.collapsed && run.extractedRewards > 0 ? Math.floor(run.extractedRewards * 0.1) : 0; // 10% of rewards go to debt
    if (debtServiced > 0) {
      display.drawText(`Debt serviced: -${this.game.formatCurrency(debtServiced)}`, width / 2, lineY, {
        font: FONTS.smallFont,
        fill: COLORS.neonCyan,
        align: 'center'
      });
    } else if (run?.collapsed) {
      display.drawText('No debt payment (run failed)', width / 2, lineY, {
        font: FONTS.smallFont,
        fill: COLORS.warningYellow,
        align: 'center'
      });
    }
    
    // Billing cycle status
    lineY += 25;
    const billingProgress = this.game.state.meta.billingTimer;
    const cycleMessage = billingProgress >= 2 
      ? `BILLING DUE NEXT RUN (${billingProgress}/3)`
      : `Billing cycle: ${billingProgress}/3`;
    const cycleColor = billingProgress >= 2 ? COLORS.warningYellow : COLORS.dimText;
    display.drawText(cycleMessage, width / 2, lineY, {
      font: FONTS.smallFont,
      fill: cycleColor,
      align: 'center'
    });
    
    // Debt status
    lineY += 30;
    const debtRatio = this.game.getDebtRatio();
    const debtPercent = Math.round(debtRatio * 100);
    const formattedDebt = this.game.formatCurrency(this.game.state.meta.debt);
    const formattedCeiling = this.game.formatCurrency(this.game.state.meta.debtCeiling);
    
    let debtColor: string = COLORS.dimText;
    if (debtPercent >= 100) debtColor = COLORS.warningRed;
    else if (debtPercent >= 90) debtColor = COLORS.warningYellow;
    else if (debtPercent >= 80) debtColor = '#ffaa00';
    
    display.drawText(`DEBT: ${formattedDebt} / ${formattedCeiling} (${debtPercent}%)`, width / 2, lineY, {
      font: FONTS.labelFont,
      fill: debtColor,
      align: 'center'
    });

    // Return bottom Y of panel for positioning subsequent elements
    return summaryY - 30 + panelHeight;
  }

  private renderMultiplierStatus(display: typeof MakkoEngine.display, statusY: number): void {
    const { width } = display;

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
      // Broadcast Receipt button
      this.renderButton(
        display,
        this.broadcastButtonBounds,
        'BROADCAST RECEIPT',
        RESULTS_COLORS.twitterBlue,
        this.hoveredButton === 'broadcast'
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
