/**
 * Depth Dive Scene
 * 
 * Active 10-round tactical session with card drafting,
 * shields, stability, discovery events, and juice effects.
 */

import { MakkoEngine } from '@makko/engine';
import type { Scene } from '../../scene/interfaces';
import type { Game } from '../../game/game';
import { DepthDiveSystem } from '../../systems/depth-dive-system';
import { TacticCardSystem, CardPlayResult } from '../../systems/tactic-card';
import { DiscoveryEventSystem } from '../../systems/discovery-event-system';
import { JuiceSystem } from '../../systems/juice-system';
import { DiveTransitionOverlay } from '../../systems/dive-transition-overlay';
import { TacticCard } from '../../types/cards';
import { COLORS } from '../../ui/theme';
import { renderToast } from '../../dialogue/companion-banter';

// Module imports
import { applyCharacterAbilities, checkBreachStabilization } from './ability-system';
import { displayDiscoveryBanter, displayCollapseBanter } from './banter-display';
import { handleInput } from './input-handler';
import { createHeaderComponents, renderHeader, renderMiniMap, renderActionResult } from './render-header';
import { renderCards } from './render-cards';
import { renderFleeButton, renderRerollButton, renderDeadDropButton } from './render-buttons';
import { renderCollapsedState, renderDiscoveryModal } from './render-modals';
import { selectRandomBackground, renderDiveBackground } from './background';

/**
 * DepthDiveScene - active 10-round session
 */
export class DepthDiveScene implements Scene {
  readonly id = 'depthDive';
  manager?: import('../../scene/scene-manager').SceneManager;

  private game: Game;
  private depthDiveSystem: DepthDiveSystem;
  private cardSystem: TacticCardSystem;
  private discoverySystem: DiscoveryEventSystem;
  private juice: JuiceSystem;
  private transitionOverlay: DiveTransitionOverlay;

  // UI state
  private currentDraft: TacticCard[] = [];
  private hoveredCardIndex: number | null = null;
  private lastPlayedResult: CardPlayResult | null = null;

  // Visual components
  private headerComponents: ReturnType<typeof createHeaderComponents>;
  private currentBackground: string | null = null;

  constructor(game: Game) {
    this.game = game;
    this.juice = new JuiceSystem();
    this.depthDiveSystem = new DepthDiveSystem(game, this.juice);
    this.cardSystem = new TacticCardSystem(game, this.juice);
    this.discoverySystem = new DiscoveryEventSystem(game);
    this.transitionOverlay = new DiveTransitionOverlay();
    this.headerComponents = createHeaderComponents();
  }

  async init(): Promise<void> {}

  enter(previousScene?: string): void {
    this.resetSystems();
    applyCharacterAbilities(this.game);
    this.generateNewDraft();
    this.lastPlayedResult = null;
    this.hoveredCardIndex = null;
    this.currentBackground = selectRandomBackground();
    this.transitionOverlay.start('docking');
  }

  private resetSystems(): void {
    this.juice.clear();
    this.discoverySystem.reset();
    this.depthDiveSystem = new DepthDiveSystem(this.game, this.juice);
    this.cardSystem = new TacticCardSystem(this.game, this.juice);
  }

  exit(nextScene?: string): void {
    this.juice.clear();
  }

  // Public accessors for input handler
  getGame(): Game { return this.game; }
  getTransitionOverlay(): DiveTransitionOverlay { return this.transitionOverlay; }
  getDiscoverySystem(): DiscoveryEventSystem { return this.discoverySystem; }
  getCardSystem(): TacticCardSystem { return this.cardSystem; }
  getCurrentDraft(): TacticCard[] { return this.currentDraft; }
  
  setHoveredCardIndex(index: number | null): void { this.hoveredCardIndex = index; }
  
  generateNewDraft(): void {
    this.currentDraft = this.cardSystem.draftCards(3);
  }

  handleInput(): void {
    handleInput(this);
  }

  playCard(index: number): void {
    if (index < 0 || index >= this.currentDraft.length) return;
    
    const card = this.currentDraft[index];
    const result = this.cardSystem.playCard(card.type, { juice: this.juice });
    
    this.lastPlayedResult = result;
    console.log(`[DepthDive] Played ${card.type}: ${result.message}`);

    if (!result.success) return;

    this.markFirstHandDealt();
    
    if (result.collapsed) {
      this.handleCollapse();
      return;
    }

    if (!this.depthDiveSystem.advanceRound()) {
      this.game.endDepthDive();
      return;
    }

    this.checkDiscovery();
    this.generateNewDraft();
  }

  private markFirstHandDealt(): void {
    const run = this.game.state.currentRun;
    if (run && !run.firstHandDealt) {
      run.firstHandDealt = true;
    }
  }

  private handleCollapse(): void {
    const stabilized = checkBreachStabilization(this.game);
    
    if (stabilized) {
      console.log('[DepthDive] Breach stabilized by Field Retrofit');
      return;
    }

    displayCollapseBanter(this.game);
    setTimeout(() => this.game.endDepthDive(), 1000);
  }

  private checkDiscovery(): void {
    if (this.discoverySystem.shouldTriggerDiscovery()) {
      const event = this.discoverySystem.triggerDiscovery();
      if (event) {
        console.log(`[DepthDive] Discovery event: ${event.item.name}`);
        displayDiscoveryBanter(this.game);
      }
    }
  }

  flee(): void {
    const run = this.game.state.currentRun;
    if (!run || run.collapsed) return;

    run.extractedRewards = 0;
    run.collectedItems = [];
    console.log('[DepthDive] Fled! All rewards lost.');
    this.game.endDepthDive();
  }

  update(dt: number): void {
    this.transitionOverlay.update(dt);
    this.juice.update(dt);
    this.discoverySystem.update(dt);
    this.headerComponents.dangerMeter.update(dt);
  }

  render(): void {
    const display = MakkoEngine.display;
    const { width, height } = display;
    const run = this.game.state.currentRun;

    if (!run) {
      display.clear(COLORS.background);
      this.transitionOverlay.render(display);
      return;
    }

    if (run.collapsed) {
      renderCollapsedState(display);
      this.juice.render(display);
      return;
    }

    this.renderActiveState(display, run);

    // Transition overlay background
    const bgOpacity = this.transitionOverlay.getBackgroundOpacity();
    if (bgOpacity > 0) {
      display.drawRect(0, 0, width, height, { fill: '#000000', alpha: bgOpacity });
    }

    this.juice.render(display);
    this.transitionOverlay.render(display);
    renderToast(display);
  }

  private renderActiveState(
    display: typeof MakkoEngine.display,
    run: NonNullable<typeof this.game.state.currentRun>
  ): void {
    // Render background first (behind all other UI)
    renderDiveBackground(display, this.currentBackground);
    
    renderHeader(display, this.game, this.headerComponents);
    renderMiniMap(display, this.game);

    if (this.cardSystem.canShowDeadDropButton()) {
      renderDeadDropButton(display);
    }

    if (this.cardSystem.canShowRerollButton()) {
      renderRerollButton(display);
    }

    renderCards(display, this.currentDraft, this.hoveredCardIndex, 
      (type) => this.cardSystem.canAfford(type));

    renderFleeButton(display);

    if (this.lastPlayedResult) {
      renderActionResult(display, this.lastPlayedResult.message, this.lastPlayedResult.success);
    }

    if (this.discoverySystem.isShowingModal()) {
      renderDiscoveryModal(display, this.discoverySystem);
    }
  }

  destroy(): void {
    this.juice.clear();
  }
}
