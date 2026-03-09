/**
 * Tutorial Scene
 *
 * First-time player introduction featuring V.A.L.U. (Valued Asset Logistics Unit)
 * and Max (player character) with branching dialogue.
 * Displays visual demonstrations for danger meter, nodes, and battery.
 * Plays once, then never again (tracked in save data).
 */

import type { Scene } from '../scene/interfaces';
import { DialogueManager } from '../dialogue/dialogue-manager';
import { DialogueUI } from '../dialogue/dialogue-ui';
import { TUTORIAL_DIALOGUE } from '../dialogue/tutorial-dialogue';
import { TutorialVisuals } from '../systems/tutorial-visuals';
import { assetMap } from '../assets/asset-map';
import { MakkoEngine } from '@makko/engine';
import type { Game } from '../game/game';
// Character type from MakkoEngine
type Character = ReturnType<typeof MakkoEngine.sprite>;

/**
 * Narrator animation names
 */
const NARRATOR_ANIMATIONS = {
  entrance: 'sci_fi_narrator_walkturnwave_default',
  flyingHead: 'sci_fi_narrator_flyingheadhover_default',
  talking: 'sci_fi_narrator_zoomnarrate_default'
} as const;

/**
 * Max animation names
 */
const MAX_ANIMATIONS = {
  // Full body animations (used when inactive/listening)
  fullBodyIdle: 'max_sitting_default',
  // Bust portrait talking animations (used when speaking)
  bustTalk: 'max_bustportraitnormaltalk_default',
  // Emotional animations
  upset: 'max_headshotyelling_default',
  disappointed: 'max_disappointmentportrait_default',
  // Legacy animations
  talking: 'max_headshot_talking_default'
} as const;

/**
 * Tutorial layout configuration
 */
const LAYOUT = {
  // Bottom anchor position for characters (sprites have bottom-center anchors)
  portraitBottomY: 860,
  overlayAlpha: 0.7,
  dialogueBoxY: 860,
  dialogueBoxHeight: 200
};

/**
 * Fade configuration for character transitions
 */
const FADE_CONFIG = {
  fadeOutDuration: 400, // ms for fade-out to invisible
  fadeInDuration: 300,  // ms for fade-in to dimmed state
  waitDuration: 200,    // ms to wait before starting fade-out
  narratorTargetAlpha: 0.6,
  maxTargetAlpha: 0.4
};

/**
 * Fade phase for character transitions
 */
const FadePhase = {
  VISIBLE: 'visible',           // Fully visible (active) or dimmed (inactive)
  WAITING_TO_FADE: 'waiting',   // Waiting before fade-out starts
  FADING_OUT: 'fadeOut',        // Fading to invisible (alpha 0)
  FADING_IN: 'fadeIn'           // Fading in to target alpha
} as const;

type FadePhaseType = typeof FadePhase[keyof typeof FadePhase];

/**
 * Tracks fade state for a single character
 */
interface CharacterFadeState {
  currentAlpha: number;
  phase: FadePhaseType;
  timer: number;         // Timer for current phase
  targetAlpha: number;   // Target alpha after fade-in (1.0 for active, 0.6/0.4 for inactive)
};

/**
 * Tutorial Scene - Introduction for new players
 */
export class TutorialScene implements Scene {
  readonly id = 'tutorial';
  manager?: import('../scene/scene-manager').SceneManager;

  private dialogueManager: DialogueManager;
  private dialogueUI: DialogueUI;
  private tutorialVisuals: TutorialVisuals;
  private game: Game;
  private completed: boolean = false;

  // Character sprites
  private narratorSprite: Character | null = null;
  private maxSprite: Character | null = null;

  // Background static assets for animated cryo chamber
  private cryoChamberAsset: import('@makko/engine').StaticAsset | null = null;
  private spacefieldAsset: import('@makko/engine').StaticAsset | null = null;

  // Scroll offset for spacefield parallax
  private spacefieldOffset: number = 0;

  // Clipping mask constants for cryochambernew (1920x1080)
  private static readonly CANVAS_WIDTH = 1920;
  private static readonly CANVAS_HEIGHT = 1080;
  private static readonly MASK_WIDTH = 270;
  private static readonly MASK_HEIGHT = 200;
  // White box center on the 1920x1080 asset (scaled from 1350x1080)
  // Original: (500, 365) on 1350x1080 → Scaled X: 500 * (1920/1350) ≈ 711
  private static readonly WHITE_BOX_CENTER_X = 711;
  private static readonly WHITE_BOX_CENTER_Y = 365;

  // Track narrator entrance sequence state
  private narratorEntranceComplete: boolean = false;
  private dialogueNodeIndex: number = 0;

  // Track current speaker to detect transitions
  private previousSpeaker: string = 'V.A.L.U.';

  // Fade state for each character
  private narratorFadeState: CharacterFadeState = {
    currentAlpha: 1.0,
    phase: FadePhase.VISIBLE,
    timer: 0,
    targetAlpha: 1.0 // Active speaker starts at full alpha
  };

  private maxFadeState: CharacterFadeState = {
    currentAlpha: FADE_CONFIG.maxTargetAlpha,
    phase: FadePhase.VISIBLE,
    timer: 0,
    targetAlpha: FADE_CONFIG.maxTargetAlpha // Inactive listener at dimmed alpha
  };

  // Track pending animation switches (happen while invisible)
  private narratorPendingAnim: string | null = null;
  private maxPendingAnim: string | null = null;

  constructor(game: Game) {
    this.game = game;

    // Initialize dialogue system
    this.dialogueManager = new DialogueManager();
    this.dialogueManager.setTextSpeed(40); // Slightly faster for tutorial

    // Initialize dialogue UI - position at bottom of screen
    this.dialogueUI = new DialogueUI(this.dialogueManager);
    this.dialogueUI.setBox(100, LAYOUT.dialogueBoxY, 1720, LAYOUT.dialogueBoxHeight);

    // Initialize tutorial visuals system
    this.tutorialVisuals = new TutorialVisuals();

    // Setup callback for dialogue completion
    this.dialogueManager.onDialogueEnd = () => this.onDialogueEnd();

    // Setup callback for node changes (update portraits)
    this.dialogueManager.onNodeChange = (node) => this.onDialogueNodeChange(node);

    // Setup callback for action triggers (visual effects)
    this.dialogueManager.onAction = (action) => this.handleAction(action);

    // Load character sprites
    if (MakkoEngine.isCharacterLoaded('sci_fi_narrator_narratorcore')) {
      this.narratorSprite = MakkoEngine.sprite('sci_fi_narrator_narratorcore');
    }
    if (MakkoEngine.isCharacterLoaded('max_maxcore')) {
      this.maxSprite = MakkoEngine.sprite('max_maxcore');
    }

    // Load cryo chamber and spacefield background assets
    if (MakkoEngine.hasStaticAsset('cryochambernew')) {
      this.cryoChamberAsset = MakkoEngine.staticAsset('cryochambernew');
    }
    if (MakkoEngine.hasStaticAsset('spacefield')) {
      this.spacefieldAsset = MakkoEngine.staticAsset('spacefield');
    }
  }

  enter(): void {
    this.completed = false;
    this.narratorEntranceComplete = false;
    this.dialogueNodeIndex = 0;

    // Reset speaker tracking - V.A.L.U. starts as the active speaker
    this.previousSpeaker = 'V.A.L.U.';

    // Reset fade states - narrator active at full alpha, Max inactive at dimmed
    this.narratorFadeState = {
      currentAlpha: 1.0,
      phase: FadePhase.VISIBLE,
      timer: 0,
      targetAlpha: 1.0
    };

    this.maxFadeState = {
      currentAlpha: FADE_CONFIG.maxTargetAlpha,
      phase: FadePhase.VISIBLE,
      timer: 0,
      targetAlpha: FADE_CONFIG.maxTargetAlpha
    };

    // Clear pending animations
    this.narratorPendingAnim = null;
    this.maxPendingAnim = null;

    // Start narrator with entrance animation
    if (this.narratorSprite) {
      this.narratorSprite.play(NARRATOR_ANIMATIONS.entrance, false);
    }

    // Start Max in full body idle (not speaking yet)
    if (this.maxSprite) {
      this.maxSprite.play(MAX_ANIMATIONS.fullBodyIdle, true);
    }

    // Reset spacefield scroll
    this.spacefieldOffset = 0;

    // Start the tutorial dialogue
    this.dialogueManager.startDialogue(TUTORIAL_DIALOGUE);
  }

  exit(): void {
    this.dialogueManager.endDialogue();
    this.tutorialVisuals.hideVisual();
  }

  handleInput(): void {
    if (this.completed) return;

    const input = MakkoEngine.input;

    // Advance on Space or mouse click when text complete
    if (input.isKeyPressed('Space') || input.isMousePressed(0)) {
      this.dialogueManager.advance();
    }

    // Delegate to dialogue UI for keyboard navigation
    this.dialogueUI.handleInput();
  }

  update(dt: number): void {
    if (this.completed) return;

    // Update dialogue manager
    this.dialogueManager.update(dt);

    // Update asset map animations
    assetMap.update(dt);

    // Update tutorial visuals (pulse effects)
    this.tutorialVisuals.update(dt);

    // Update spacefield parallax scroll (1px per frame at 60fps ≈ 60px/second)
    this.spacefieldOffset += 1;
    if (this.spacefieldOffset >= 1620) {
      this.spacefieldOffset = 0;
    }

    // Update character sprites
    if (this.narratorSprite) {
      this.narratorSprite.update(dt);
    }
    if (this.maxSprite) {
      this.maxSprite.update(dt);
    }

    // Update fade states
    this.updateFadeStates(dt);
  }

  /**
   * Update fade states for both characters
   */
  private updateFadeStates(dt: number): void {
    this.updateCharacterFade(this.narratorFadeState, this.narratorSprite, 'narrator', dt);
    this.updateCharacterFade(this.maxFadeState, this.maxSprite, 'max', dt);
  }

  /**
   * Update fade state for a single character
   */
  private updateCharacterFade(
    fadeState: CharacterFadeState,
    character: Character | null,
    characterKey: 'narrator' | 'max',
    dt: number
  ): void {
    switch (fadeState.phase) {
      case FadePhase.WAITING_TO_FADE:
        fadeState.timer += dt;
        if (fadeState.timer >= FADE_CONFIG.waitDuration) {
          fadeState.phase = FadePhase.FADING_OUT;
          fadeState.timer = 0;
        }
        break;

      case FadePhase.FADING_OUT:
        fadeState.timer += dt;
        const outProgress = Math.min(fadeState.timer / FADE_CONFIG.fadeOutDuration, 1.0);
        fadeState.currentAlpha = 1.0 - outProgress; // 1.0 -> 0.0
        
        if (fadeState.timer >= FADE_CONFIG.fadeOutDuration) {
          // Fade out complete - switch animation NOW while invisible
          fadeState.currentAlpha = 0.0;
          
          // Play pending animation while character is invisible
          const pendingAnim = characterKey === 'narrator' ? this.narratorPendingAnim : this.maxPendingAnim;
          if (character && pendingAnim) {
            character.play(pendingAnim, true);
          }
          if (characterKey === 'narrator') {
            this.narratorPendingAnim = null;
          } else {
            this.maxPendingAnim = null;
          }
          
          // Start fade-in
          fadeState.phase = FadePhase.FADING_IN;
          fadeState.timer = 0;
        }
        break;

      case FadePhase.FADING_IN:
        fadeState.timer += dt;
        const inProgress = Math.min(fadeState.timer / FADE_CONFIG.fadeInDuration, 1.0);
        fadeState.currentAlpha = fadeState.targetAlpha * inProgress; // 0.0 -> targetAlpha
        
        if (fadeState.timer >= FADE_CONFIG.fadeInDuration) {
          fadeState.phase = FadePhase.VISIBLE;
          fadeState.timer = 0;
          fadeState.currentAlpha = fadeState.targetAlpha;
        }
        break;

      case FadePhase.VISIBLE:
        // Nothing to update
        break;
    }
  }

  render(): void {
    const display = MakkoEngine.display;
    const screenWidth = display.width;
    const screenHeight = display.height;

    // Draw animated background with clipping mask viewport
    if (this.spacefieldAsset && this.cryoChamberAsset) {
      // For cryochambernew (1920x1080), no scaling needed
      // Calculate mask position relative to canvas center
      const canvasCenterX = TutorialScene.CANVAS_WIDTH / 2; // 960
      const canvasCenterY = TutorialScene.CANVAS_HEIGHT / 2; // 540

      // Offset from canvas center to white box center
      const offsetFromCenterX = TutorialScene.WHITE_BOX_CENTER_X - canvasCenterX;
      const offsetFromCenterY = TutorialScene.WHITE_BOX_CENTER_Y - canvasCenterY;

      // Mask center position on screen
      const maskCenterX = canvasCenterX + offsetFromCenterX;
      const maskCenterY = canvasCenterY + offsetFromCenterY;

      // Mask top-left position
      const maskX = maskCenterX - TutorialScene.MASK_WIDTH / 2;
      const maskY = maskCenterY - TutorialScene.MASK_HEIGHT / 2;

      // Draw with clipping mask:
      // 1. Push clip rect for the viewport
      display.pushClipRect(maskX, maskY, TutorialScene.MASK_WIDTH, TutorialScene.MASK_HEIGHT);

      // 2. Draw spacefield tiles within clipped region
      const drawX1 = -this.spacefieldOffset;
      const drawX2 = 1620 - this.spacefieldOffset;
      display.drawImage(this.spacefieldAsset.image, drawX1, 0, 1620, 1080);
      display.drawImage(this.spacefieldAsset.image, drawX2, 0, 1620, 1080);

      // 3. Pop clip
      display.popClip();

      // 4. Draw CryoChamberNew (1920x1080) - no scaling needed, draw at origin
      display.drawImage(
        this.cryoChamberAsset.image,
        0,
        0,
        this.cryoChamberAsset.width,
        this.cryoChamberAsset.height
      );
    } else if (this.cryoChamberAsset) {
      // Fallback: just cryo chamber without parallax
      display.drawImage(
        this.cryoChamberAsset.image,
        0,
        0,
        this.cryoChamberAsset.width,
        this.cryoChamberAsset.height
      );
    }

    // Semi-transparent black overlay
    display.drawRect(0, 0, screenWidth, screenHeight, {
      fill: '#000000',
      alpha: LAYOUT.overlayAlpha
    });

    // Determine current speaker and choices
    const currentNode = this.dialogueManager.getCurrentNode();
    const speaker = currentNode?.speaker ?? 'V.A.L.U.';
    const hasChoices = this.dialogueManager.hasChoices() && this.dialogueManager.isComplete();

    // Render tutorial visuals
    this.tutorialVisuals.render(display);

    // === RENDER NARRATOR (V.A.L.U.) ===
    const narratorX = screenWidth * 0.25;
    const narratorY = LAYOUT.portraitBottomY;
    
    const narratorAlpha = this.narratorFadeState.currentAlpha;
    
    if (this.narratorSprite) {
      this.narratorSprite.draw(display, narratorX, narratorY, {
        scale: 1,
        alpha: narratorAlpha
      });
    } else {
      assetMap.renderCharacter(display, 'alu', narratorX, narratorY - 200, undefined, {
        scale: 2.5,
        alpha: narratorAlpha
      });
    }

    // === RENDER MAX ===
    const maxX = screenWidth * 0.75;
    const maxY = LAYOUT.portraitBottomY;
    
    // Brighten Max instantly during choice selection, otherwise use fade state
    const maxAlpha = hasChoices ? 1.0 : this.maxFadeState.currentAlpha;
    
    if (this.maxSprite) {
      this.maxSprite.draw(display, maxX, maxY, {
        scale: 1,
        alpha: maxAlpha
      });
    } else {
      assetMap.renderCharacter(display, 'max', maxX, maxY - 200, undefined, {
        scale: 2.5,
        alpha: maxAlpha
      });
    }

    // Render dialogue box
    this.dialogueUI.render();

    // "Click to continue" hint
    if (this.dialogueManager.isComplete() && !this.dialogueManager.hasChoices()) {
      display.drawText(
        'Click or press Space to continue',
        screenWidth / 2,
        screenHeight - 25,
        {
          fill: '#666688',
          font: '14px monospace',
          align: 'center'
        }
      );
    }
  }

  /**
   * Handle action triggers from dialogue
   */
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
      default:
        console.log(`[TutorialScene] Unknown action: ${action}`);
        break;
    }
  }

  /**
   * Called when dialogue finishes
   */
  private onDialogueEnd(): void {
    if (this.completed) return;
    this.completed = true;

    this.tutorialVisuals.hideVisual();
    this.game.state.tutorialSeen = true;
    this.game.saveState();
    this.game.returnToIdle();
  }

  /**
   * Called when dialogue node changes - handle character transitions
   */
  private onDialogueNodeChange(node: import('../dialogue/dialogue-types').DialogueNode): void {
    const speaker = node.speaker;
    this.dialogueNodeIndex++;

    // Handle speaker transitions
    if (speaker !== this.previousSpeaker) {
      // === CHARACTER BECOMING INACTIVE (fade out -> switch -> fade in) ===
      if (this.previousSpeaker === 'V.A.L.U.') {
        // Narrator becoming inactive - start fade-out sequence
        this.narratorFadeState.phase = FadePhase.WAITING_TO_FADE;
        this.narratorFadeState.timer = 0;
        this.narratorFadeState.currentAlpha = 1.0;
        this.narratorFadeState.targetAlpha = FADE_CONFIG.narratorTargetAlpha;
        // Queue the inactive animation (flying head) to play when invisible
        this.narratorPendingAnim = NARRATOR_ANIMATIONS.flyingHead;
      } else if (this.previousSpeaker === 'Max') {
        // Max becoming inactive - start fade-out sequence
        this.maxFadeState.phase = FadePhase.WAITING_TO_FADE;
        this.maxFadeState.timer = 0;
        this.maxFadeState.currentAlpha = 1.0;
        this.maxFadeState.targetAlpha = FADE_CONFIG.maxTargetAlpha;
        // Queue the inactive animation (full body idle) to play when invisible
        this.maxPendingAnim = MAX_ANIMATIONS.fullBodyIdle;
      }

      // === CHARACTER BECOMING ACTIVE ===
      if (speaker === 'V.A.L.U.') {
        // If entrance sequence is complete, fade transition to zoomnarrate
        if (this.narratorEntranceComplete) {
          this.narratorFadeState.phase = FadePhase.FADING_OUT;
          this.narratorFadeState.timer = 0;
          this.narratorFadeState.currentAlpha = 1.0;
          this.narratorFadeState.targetAlpha = 1.0;
          this.narratorPendingAnim = NARRATOR_ANIMATIONS.talking;
        } else {
          // During entrance sequence, stay instantly visible
          this.narratorFadeState.phase = FadePhase.VISIBLE;
          this.narratorFadeState.timer = 0;
          this.narratorFadeState.currentAlpha = 1.0;
          this.narratorFadeState.targetAlpha = 1.0;
          this.narratorPendingAnim = null;
        }
      } else if (speaker === 'Max') {
        this.maxFadeState.phase = FadePhase.VISIBLE;
        this.maxFadeState.timer = 0;
        this.maxFadeState.currentAlpha = 1.0;
        this.maxFadeState.targetAlpha = 1.0;
        this.maxPendingAnim = null;
      }
    }

    // Update previous speaker
    this.previousSpeaker = speaker;

    // Update active character's animation based on dialogue
    if (speaker === 'V.A.L.U.' && this.narratorSprite) {
      this.updateNarratorAnimation();
    }
    if (speaker === 'Max' && this.maxSprite) {
      this.updateMaxAnimation(node.emotion);
    }
  }

  /**
   * Update Narrator animation based on entrance sequence
   */
  private updateNarratorAnimation(): void {
    if (!this.narratorSprite) return;

    if (!this.narratorEntranceComplete) {
      const currentAnim = this.narratorSprite.getCurrentAnimation();

      if (this.dialogueNodeIndex === 1) {
        // Entrance animation already started in enter()
      } else if (this.dialogueNodeIndex === 2) {
        // Line 2: play flying head directly (no fade, entrance animation finished)
        if (currentAnim !== NARRATOR_ANIMATIONS.flyingHead) {
          this.narratorSprite.play(NARRATOR_ANIMATIONS.flyingHead, true);
        }
      } else {
        // Line 3+: fade out from flying head, fade in with zoomnarrate
        if (currentAnim !== NARRATOR_ANIMATIONS.talking) {
          this.narratorFadeState.phase = FadePhase.FADING_OUT;
          this.narratorFadeState.timer = 0;
          this.narratorFadeState.currentAlpha = 1.0;
          this.narratorFadeState.targetAlpha = 1.0;
          this.narratorPendingAnim = NARRATOR_ANIMATIONS.talking;
          this.narratorEntranceComplete = true;
        }
      }
    }
  }

  /**
   * Update Max animation based on emotion
   */
  private updateMaxAnimation(emotion?: string): void {
    if (!this.maxSprite) return;
    const animationToPlay = this.getAnimationForEmotion(emotion);
    this.maxSprite.play(animationToPlay, true);
  }

  /**
   * Map dialogue emotion to Max animation
   */
  private getAnimationForEmotion(emotion?: string): string {
    if (!emotion) return MAX_ANIMATIONS.bustTalk;

    const upsetEmotions = ['shocked', 'alarmed', 'uncertain', 'angry', 'scared'];
    if (upsetEmotions.includes(emotion)) {
      return MAX_ANIMATIONS.upset;
    }

    const disappointedEmotions = ['skeptical', 'confused', 'resigned', 'sad', 'defeated'];
    if (disappointedEmotions.includes(emotion)) {
      return MAX_ANIMATIONS.disappointed;
    }

    return MAX_ANIMATIONS.bustTalk;
  }
}
