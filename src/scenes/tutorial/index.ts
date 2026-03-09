/**
 * Tutorial Scene
 *
 * First-time player introduction featuring V.A.L.U. and Software Developer.
 * Orchestrates intro sequence, character transitions, and dialogue.
 */

import type { Scene } from '../../scene/interfaces';
import { DialogueManager } from '../../dialogue/dialogue-manager';
import { DialogueUI } from '../../dialogue/dialogue-ui';
import { TUTORIAL_DIALOGUE } from '../../dialogue/tutorial-dialogue';
import { TutorialVisuals } from '../../systems/tutorial-visuals';
import { assetMap } from '../../assets/asset-map';
import { MakkoEngine } from '@makko/engine';
import type { Game } from '../../game/game';
import type { DialogueNode } from '../../dialogue/dialogue-types';

import { LAYOUT, INTRO_CONFIG, FADE_CONFIG, NARRATOR_ANIMATIONS, PLAYER_ANIMATIONS } from './constants';
import { IntroPhase } from './types';
import { TutorialBackground } from './background';
import { IntroController } from './intro-controller';
import { CharacterFader } from './character-fader';
import { getPlayerAnimationForEmotion, getNarratorIdleAnimation, getNarratorTalkingAnimation } from './animation-mapper';

type Character = ReturnType<typeof MakkoEngine.sprite>;

export class TutorialScene implements Scene {
  readonly id = 'tutorial';
  manager?: import('../../scene/scene-manager').SceneManager;

  private dialogueManager: DialogueManager;
  private dialogueUI: DialogueUI;
  private tutorialVisuals: TutorialVisuals;
  private game: Game;
  private completed: boolean = false;

  // Character sprites
  private narratorSprite: Character | null = null;
  private playerSprite: Character | null = null;

  // Subsystems
  private background: TutorialBackground;
  private introController: IntroController;
  private narratorFader: CharacterFader;
  private playerFader: CharacterFader;

  // Dialogue state
  private dialogueStarted: boolean = false;
  private dialogueNodeIndex: number = 0;
  private previousSpeaker: string = 'V.A.L.U.';
  private narratorEntranceComplete: boolean = false;

  constructor(game: Game) {
    this.game = game;

    // Initialize dialogue system
    this.dialogueManager = new DialogueManager();
    this.dialogueManager.setTextSpeed(40);
    this.dialogueUI = new DialogueUI(this.dialogueManager);
    this.dialogueUI.setBox(100, LAYOUT.dialogueBoxY, 1720, LAYOUT.dialogueBoxHeight);

    // Initialize tutorial visuals
    this.tutorialVisuals = new TutorialVisuals();

    // Initialize subsystems
    this.background = new TutorialBackground();
    this.introController = new IntroController(null);
    this.narratorFader = new CharacterFader(1.0);
    this.playerFader = new CharacterFader(FADE_CONFIG.playerTargetAlpha);

    // Setup callbacks
    this.dialogueManager.onDialogueEnd = () => this.onDialogueEnd();
    this.dialogueManager.onNodeChange = (node) => this.onDialogueNodeChange(node);
    this.dialogueManager.onAction = (action) => this.handleAction(action);

    // Load character sprites
    if (MakkoEngine.isCharacterLoaded('sci_fi_narrator_narratorcore')) {
      this.narratorSprite = MakkoEngine.sprite('sci_fi_narrator_narratorcore');
      this.introController.updateNarratorSprite(this.narratorSprite);
    }
    if (MakkoEngine.isCharacterLoaded('software_developer_devcore')) {
      this.playerSprite = MakkoEngine.sprite('software_developer_devcore');
    }
  }

  enter(): void {
    this.completed = false;
    this.dialogueStarted = false;
    this.dialogueNodeIndex = 0;
    this.narratorEntranceComplete = false;
    this.previousSpeaker = 'V.A.L.U.';

    this.background.reset();
    this.introController.reset();
    this.narratorFader.reset(1.0);
    this.playerFader.reset(FADE_CONFIG.playerTargetAlpha);

    if (this.playerSprite) {
      this.playerSprite.play(PLAYER_ANIMATIONS.idle, true);
    }
  }

  exit(): void {
    this.dialogueManager.endDialogue();
    this.tutorialVisuals.hideVisual();
  }

  handleInput(): void {
    if (this.completed) return;

    const input = MakkoEngine.input;

    // Skip intro phases
    if (!this.introController.isComplete && !this.introController.isWaitingForDialogueAdvance) {
      if (input.isKeyPressed('Space') || input.isMousePressed(0)) {
        this.introController.skipPhase();
      }
      return;
    }

    if (input.isKeyPressed('Space') || input.isMousePressed(0)) {
      this.dialogueManager.advance();
    }

    this.dialogueUI.handleInput();
  }

  update(dt: number): void {
    if (this.completed) return;

    if (!this.introController.isComplete) {
      this.introController.update(dt);
      this.checkStartDialogue();
    }

    this.dialogueManager.update(dt);
    assetMap.update(dt);
    this.tutorialVisuals.update(dt);
    this.background.update(dt);

    if (this.narratorSprite) this.narratorSprite.update(dt);
    if (this.playerSprite) this.playerSprite.update(dt);

    if (this.introController.isComplete) {
      this.narratorFader.update(dt, this.narratorSprite);
      this.playerFader.update(dt, this.playerSprite);
    }
  }

  private checkStartDialogue(): void {
    if (!this.dialogueStarted && this.introController.currentPhase === IntroPhase.TALKING_HEAD_FADE_IN) {
      this.dialogueStarted = true;
      this.dialogueManager.startDialogue(TUTORIAL_DIALOGUE);
    }
  }

  render(): void {
    const display = MakkoEngine.display;
    const screenWidth = display.width;
    const screenHeight = display.height;

    this.background.render(display);
    this.tutorialVisuals.render(display);

    if (!this.introController.isComplete) {
      this.renderIntroPhase(display, screenWidth, screenHeight);
      return;
    }

    this.renderNormalPhase(display, screenWidth, screenHeight);
  }

  private renderIntroPhase(display: typeof MakkoEngine.display, screenWidth: number, screenHeight: number): void {
    this.introController.render(display, LAYOUT.portraitBottomY, INTRO_CONFIG.centerPosition);

    // Render dialogue box during talking head phase
    if (this.introController.isWaitingForDialogueAdvance) {
      this.dialogueUI.render();
    }

    // Skip hint
    if (!this.introController.isWaitingForDialogueAdvance) {
      this.renderHint(display, screenWidth, screenHeight, 'Click or press Space to skip');
    } else if (this.dialogueManager.isComplete() && !this.dialogueManager.hasChoices()) {
      this.renderHint(display, screenWidth, screenHeight, 'Click or press Space to continue');
    }
  }

  private renderNormalPhase(display: typeof MakkoEngine.display, screenWidth: number, screenHeight: number): void {
    const hasChoices = this.dialogueManager.hasChoices() && this.dialogueManager.isComplete();

    // Narrator (left side)
    const narratorX = screenWidth * 0.25 - 10;
    this.renderCharacter(display, this.narratorSprite, 'alu', narratorX, this.narratorFader.alpha);

    // Player (right side)
    const playerX = screenWidth * 0.75;
    const playerAlpha = hasChoices ? 1.0 : this.playerFader.alpha;
    this.renderCharacter(display, this.playerSprite, 'software_developer', playerX, playerAlpha);

    this.dialogueUI.render();

    if (this.dialogueManager.isComplete() && !hasChoices) {
      this.renderHint(display, screenWidth, screenHeight, 'Click or press Space to continue');
    }
  }

  private renderCharacter(
    display: typeof MakkoEngine.display,
    sprite: Character | null,
    fallbackKey: string,
    x: number,
    alpha: number
  ): void {
    const y = LAYOUT.portraitBottomY;

    if (sprite) {
      sprite.draw(display, x, y, { scale: 1, alpha });
    } else {
      assetMap.renderCharacter(display, fallbackKey, x, y - 200, undefined, { scale: 2.5, alpha });
    }
  }

  private renderHint(display: typeof MakkoEngine.display, screenWidth: number, screenHeight: number, text: string): void {
    display.drawText(text, screenWidth / 2, screenHeight - 25, {
      fill: '#666688',
      font: '14px monospace',
      align: 'center'
    });
  }

  private handleAction(action: string): void {
    switch (action) {
      case 'show_danger_meter':
        this.tutorialVisuals.showDangerMeter(35);
        break;
      case 'show_node':
        this.tutorialVisuals.showNode();
        break;
      case 'show_battery_full':
        this.tutorialVisuals.showBatteryFull();
        break;
      case 'hide_visual':
        this.tutorialVisuals.hideVisual();
        break;
    }
  }

  private onDialogueEnd(): void {
    if (this.completed) return;
    this.completed = true;

    this.tutorialVisuals.hideVisual();
    this.game.state.tutorialSeen = true;
    this.game.saveState();
    this.game.returnToIdle();
  }

  private onDialogueNodeChange(node: DialogueNode): void {
    const speaker = node.speaker;
    this.dialogueNodeIndex++;

    // Transition intro to normal phase after first line
    if (this.dialogueNodeIndex === 2 && this.introController.isWaitingForDialogueAdvance) {
      this.introController.transitionToNormal();
      this.narratorEntranceComplete = true;
      this.previousSpeaker = speaker;
      return;
    }

    if (!this.introController.isComplete) {
      this.previousSpeaker = speaker;
      return;
    }

    // Handle speaker transitions
    if (speaker !== this.previousSpeaker) {
      this.handleSpeakerTransition(speaker);
    }

    this.previousSpeaker = speaker;

    // Update animations
    if (speaker === 'V.A.L.U.' && this.narratorSprite) {
      this.updateNarratorAnimation();
    }
    if (speaker === 'Player' && this.playerSprite) {
      this.playerSprite.play(getPlayerAnimationForEmotion(node.emotion), true);
    }
  }

  private handleSpeakerTransition(newSpeaker: string): void {
    // Fade out previous speaker
    if (this.previousSpeaker === 'V.A.L.U.') {
      this.narratorFader.startFadeOut(FADE_CONFIG.narratorTargetAlpha, getNarratorIdleAnimation());
    } else if (this.previousSpeaker === 'Player') {
      this.playerFader.startFadeOut(FADE_CONFIG.playerTargetAlpha, PLAYER_ANIMATIONS.idle);
    }

    // Snap new speaker to visible
    if (newSpeaker === 'V.A.L.U.') {
      if (this.narratorEntranceComplete) {
        this.narratorFader.startImmediateFadeOut(1.0, getNarratorTalkingAnimation());
      } else {
        this.narratorFader.snapToVisible(1.0);
      }
    } else if (newSpeaker === 'Player') {
      this.playerFader.snapToVisible(1.0);
    }
  }

  private updateNarratorAnimation(): void {
    if (!this.narratorSprite || this.narratorEntranceComplete) return;

    const currentAnim = this.narratorSprite.getCurrentAnimation();

    if (this.dialogueNodeIndex === 2) {
      if (currentAnim !== NARRATOR_ANIMATIONS.flyingHead) {
        this.narratorSprite.play(NARRATOR_ANIMATIONS.flyingHead, true);
      }
    } else if (this.dialogueNodeIndex >= 3) {
      if (currentAnim !== NARRATOR_ANIMATIONS.talking) {
        this.narratorFader.startImmediateFadeOut(1.0, getNarratorTalkingAnimation());
        this.narratorEntranceComplete = true;
      }
    }
  }
}
