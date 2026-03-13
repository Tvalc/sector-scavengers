/**
 * Ending Scene
 * 
 * Fullscreen ending cards with:
 * - Title (ending name)
 * - Description (1-2 sentences)
 * - Stats panel (relevant metrics)
 * - Continue button
 */

import { MakkoEngine, IDisplay } from '@makko/engine';
import type { Scene } from '../scene/interfaces';
import type { Game } from '../game/game';
import { COLORS, FONTS, LAYOUT } from '../ui/theme';
import { EndingType } from '../types/state';

/**
 * Ending configuration
 */
interface EndingConfig {
  id: EndingType;
  title: string;
  subtitle: string;
  description: string[];
  stats: string[];
  continueText: string;
}

/**
 * Ending definitions
 */
const ENDINGS: Record<EndingType, EndingConfig> = {
  corporate: {
    id: 'corporate',
    title: 'CORPORATE APPROVAL',
    subtitle: 'Your operations caught the Company\'s eye.',
    description: [
      'The Board approves your expansion request.',
      'Debt ceiling increased by $2M.',
      'They offered you a seat on the Board of Directors.'
    ],
    stats: [
      'Stations built: 3',
      'Debt serviced: $12.5M',
      'Sectors unlocked: 5',
      'Total runs: 156'
    ],
    continueText: 'Your legacy continues in the led...'
  },
  cooperative: {
    id: 'cooperative',
    title: 'COMMUNITY BUILDER',
    subtitle: 'You built something worth protecting.',
    description: [
      'Station secedes from Company control.',
      'Independent salvagers unite under your banner.',
      'They will remember.'
    ],
    stats: [
      'Crew saved: 12',
      'Co-op missions: 89',
      'Community events: 47',
      'All 6 recruits awakened'
    ],
    continueText: 'A new chapter begins...'
  },
  smuggler: {
    id: 'smuggler',
    title: 'THE GHOST THEY COULDN\'T CATCH',
    subtitle: 'You became a legend of the deep void.',
    description: [
      'Station declared sovereign salvage entity.',
      'No Company jurisdiction applies.',
      'You answer to no one.'
    ],
    stats: [
      'Black-market deals: 234',
      'Debt dodged: $8.2M',
      'High-risk runs: 156',
      'All 6 recruits alive'
    ],
    continueText: 'Work the black market...'
  },
  debt: {
    id: 'debt',
    title: 'THE COMPANY ALWAYS COLLECTS',
    subtitle: 'You knew the terms.',
    description: [
      'Station assets seized by Company receivership.',
      'License revoked.',
      'Dissolved into the void.'
    ],
    stats: [
      'Final debt: $4.2M',
      'Runs completed: 89',
      'Crew lost: 7',
      'Assets seized: All'
    ],
    continueText: 'There is no escape...'
  },
  collapse: {
    id: 'collapse',
    title: 'SOME WRECKS CAN\'T BE SALVAGED',
    subtitle: 'Not even your own.',
    description: [
      'Station structural integrity failed.',
      'Three hull breaches in quick succession.',
      'The void claims another station.'
    ],
    stats: [
      'Hull breaches: 3',
      'Runs attempted: 156',
      'Crew lost: 12',
      'Final sector: 1'
    ],
    continueText: 'Start over...'
  }
};

/**
 * EndingScene - displays final ending screen
 */
export class EndingScene implements Scene {
  readonly id = 'ending';
  manager?: import('../scene/scene-manager').SceneManager;

  private game: Game;
  private ending: EndingType | null = null;
  private fadeInAlpha: number = 0;

  constructor(game: Game) {
    this.game = game;
  }

  async init(): Promise<void> {
    // No async initialization needed
  }

  enter(previousScene?: string): void {
    // Determine which ending to show
    this.ending = this.determineEnding();
    this.fadeInAlpha = 0;
  }

  exit(nextScene?: string): void {
    this.fadeInAlpha = 1;
  }

  handleInput(): void {
    const input = MakkoEngine.input;

    // Any key continues
    if (input.isKeyPressed('Space') || 
        input.isKeyPressed('Enter') ||
        input.isKeyPressed('Escape')) {
      this.continueToStart();
    }
  }

  update(dt: number): void {
    // Fade in
    if (this.fadeInAlpha < 1) {
    this.fadeInAlpha = Math.min(1, this.fadeInAlpha + dt / 1000);
  }
  }

  render(): void {
    const display = MakkoEngine.display;
    const { width, height } = display;

    // Clear with dark background
    display.clear('#0a0a1a');

    // Fade in overlay
    if (this.fadeInAlpha < 1) {
      display.drawRect(0, 1, width, height, {
        fill: '#000000',
        alpha: 1 - this.fadeInAlpha
      });
    }

    if (!this.ending || !ENDINGS[this.ending]) {
      this.renderError(display);
      return;
    }

    const config = ENDINGS[this.ending];

    // Centered content
    const centerX = width / 2;
    let currentY = height / 2 - 200;

    // Title
    display.drawText(config.title, centerX, currentY, {
      font: 'bold 72px monospace',
      fill: this.getTitleColor(),
      align: 'center'
    });
    currentY += 100;

    // Subtitle
    display.drawText(config.subtitle, centerX, currentY, {
      font: 'italic 28px monospace',
      fill: COLORS.dimText,
      align: 'center'
    });
    currentY += 60;

    // Description lines
    for (const line of config.description) {
      display.drawText(line, centerX, currentY, {
        font: FONTS.bodyFont,
        fill: COLORS.brightText,
        align: 'center'
      });
      currentY += 30;
    }
    currentY += 40;

    // Stats panel
    this.renderStatsPanel(display, centerX, currentY, config);

    // Continue button
    this.renderContinueButton(display, centerX, height - 100, config);
  }

  private determineEnding(): EndingType | null {
    const meta = this.game.state.meta;
    const storyState = this.game.storyState;

    // Check victory conditions first
    // Corporate victory
    if (meta.doctrine === 'corporate' && 
        meta.currentSector >= 7 && 
        meta.debt < 500000) {
      return 'corporate';
    }

    // Cooperative victory
    if (meta.doctrine === 'cooperative' && 
        meta.currentSector >= 7 && 
        this.allRecruitsWoken()) {
      return 'cooperative';
    }

    // Smuggler victory
    if (meta.doctrine === 'smuggler' && 
        meta.currentSector >= 7 && 
        this.hasRookAndDel()) {
      return 'smuggler';
    }

    // Check game over conditions
    // Debt game over
    if (storyState.getConsecutiveDebtOverCeiling() >= 3) {
      return 'debt';
    }

    // Collapse game over
    if (storyState.getConsecutiveCollapses() >= 3) {
      return 'collapse';
    }

    // Default to collapse if no other ending triggered
    return 'collapse';
  }

  private allRecruitsWoken(): boolean {
    const cryoState = this.game.state.cryoState;
    if (!cryoState) return false;

    const awakenedCrew = cryoState.pods.filter(p => p.crew.awake && p.crew.isAuthored);
    return awakenedCrew.length === 6;
  }

  private hasRookAndDel(): boolean {
    const cryoState = this.game.state.cryoState;
    if (!cryoState) return false;

    const awakened = cryoState.pods.filter(p => p.crew.awake && p.crew.isAuthored);
    return awakened.some(p => 
      p.crew.authoredId === 'rook_stone' || p.crew.authoredId === 'del_reyes'
    );
  }

  private getTitleColor(): string {
    switch (this.ending) {
      case 'corporate':
        return COLORS.neonCyan;
      case 'cooperative':
        return COLORS.successGreen;
      case 'smuggler':
        return COLORS.warningYellow;
      case 'debt':
      case 'collapse':
        return COLORS.warningRed;
      default:
        return COLORS.white;
    }
  }

  private renderStatsPanel(
    display: IDisplay, 
    centerX: number, 
    y: number, 
    config: EndingConfig
  ): void {
    const panelWidth = 400;
    const panelHeight = 40 * config.stats.length + 20;
    const panelX = centerX - panelWidth / 2;

    // Panel background
    display.drawRoundRect(panelX, y, panelWidth, panelHeight, LAYOUT.borderRadius, {
      fill: COLORS.panelBg,
      alpha: 0.8
    });

    // Stats
    config.stats.forEach((stat, index) => {
      display.drawText(stat, centerX, y + 30 + index * 40, {
        font: FONTS.smallFont,
        fill: COLORS.dimText,
        align: 'center'
      });
    });
  }

  private renderContinueButton(
    display: IDisplay, 
    centerX: number, 
    y: number, 
    config: EndingConfig
  ): void {
    const buttonWidth = 200;
    const buttonHeight = 50;
    const buttonX = centerX - buttonWidth / 2;

    // Button background
    display.drawRoundRect(buttonX, y, buttonWidth, buttonHeight, LAYOUT.borderRadius, {
      fill: COLORS.panelBg,
      stroke: COLORS.neonCyan,
      lineWidth: LAYOUT.borderWidth,
      alpha: 0.8
    });

    // Button text
    display.drawText(config.continueText, centerX, y + buttonHeight / 2, {
      font: FONTS.labelFont,
      fill: COLORS.neonCyan,
      align: 'center',
      baseline: 'middle'
    });
  }

  private renderError(display: IDisplay): void {
    const { width, height } = display;
    const centerX = width / 2;
    const centerY = height / 2;

    display.drawText('NO ENDING DATA', centerX, centerY - 50, {
      font: 'bold 48px monospace',
      fill: COLORS.warningRed,
      align: 'center'
    });

    display.drawText('Unable to determine ending state.', centerX, centerY, {
      font: FONTS.bodyFont,
      fill: COLORS.dimText,
      align: 'center'
    });
  }

  private continueToStart(): void {
    this.game.switchScene('start');
  }
}
