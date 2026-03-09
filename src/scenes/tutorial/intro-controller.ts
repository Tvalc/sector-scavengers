/**
 * Intro Sequence Controller
 *
 * State machine for narrator entrance animation sequence.
 */

import { MakkoEngine } from '@makko/engine';
import type { Character } from '@makko/engine';
import { INTRO_CONFIG, NARRATOR_ANIMATIONS } from './constants';
import { IntroPhase, type IntroPhaseType } from './types';

type CharacterType = ReturnType<typeof MakkoEngine.sprite>;

export class IntroController {
  private phase: IntroPhaseType = IntroPhase.ENTRANCE_FADE_IN;
  private alpha: number = 0;
  private timer: number = 0;

  constructor(
    private narratorSprite: CharacterType | null
  ) {}

  get currentPhase(): IntroPhaseType {
    return this.phase;
  }

  get currentAlpha(): number {
    return this.alpha;
  }

  get isComplete(): boolean {
    return this.phase === IntroPhase.NORMAL;
  }

  get isWaitingForDialogueAdvance(): boolean {
    return this.phase === IntroPhase.TALKING_HEAD_FADE_OUT;
  }

  reset(): void {
    this.phase = IntroPhase.ENTRANCE_FADE_IN;
    this.alpha = 0;
    this.timer = 0;

    if (this.narratorSprite) {
      this.narratorSprite.play(NARRATOR_ANIMATIONS.entrance, false);
    }
  }

  updateNarratorSprite(sprite: CharacterType | null): void {
    this.narratorSprite = sprite;
  }

  update(dt: number): void {
    this.timer += dt;

    switch (this.phase) {
      case IntroPhase.ENTRANCE_FADE_IN:
        this.alpha = Math.min(this.timer / INTRO_CONFIG.fadeDuration, 1.0);
        if (this.timer >= INTRO_CONFIG.fadeDuration) {
          this.phase = IntroPhase.ENTRANCE_PLAY;
          this.timer = 0;
          this.alpha = 1.0;
        }
        break;

      case IntroPhase.ENTRANCE_PLAY:
        if (this.timer >= 2000) {
          this.phase = IntroPhase.ENTRANCE_FADE_OUT;
          this.timer = 0;
        }
        break;

      case IntroPhase.ENTRANCE_FADE_OUT:
        this.alpha = 1.0 - Math.min(this.timer / INTRO_CONFIG.fadeDuration, 1.0);
        if (this.timer >= INTRO_CONFIG.fadeDuration) {
          if (this.narratorSprite) {
            this.narratorSprite.play(NARRATOR_ANIMATIONS.flyingHead, true);
          }
          this.phase = IntroPhase.FLYING_HEAD_FADE_IN;
          this.timer = 0;
          this.alpha = 0;
        }
        break;

      case IntroPhase.FLYING_HEAD_FADE_IN:
        this.alpha = Math.min(this.timer / INTRO_CONFIG.fadeDuration, 1.0);
        if (this.timer >= INTRO_CONFIG.fadeDuration) {
          this.phase = IntroPhase.FLYING_HEAD_PLAY;
          this.timer = 0;
          this.alpha = 1.0;
        }
        break;

      case IntroPhase.FLYING_HEAD_PLAY:
        if (this.timer >= INTRO_CONFIG.flyingHeadDuration) {
          this.phase = IntroPhase.FLYING_HEAD_FADE_OUT;
          this.timer = 0;
        }
        break;

      case IntroPhase.FLYING_HEAD_FADE_OUT:
        this.alpha = 1.0 - Math.min(this.timer / INTRO_CONFIG.fadeDuration, 1.0);
        if (this.timer >= INTRO_CONFIG.fadeDuration) {
          if (this.narratorSprite) {
            this.narratorSprite.play(NARRATOR_ANIMATIONS.talking, true);
          }
          this.phase = IntroPhase.TALKING_HEAD_FADE_IN;
          this.timer = 0;
          this.alpha = 0;
        }
        break;

      case IntroPhase.TALKING_HEAD_FADE_IN:
        this.alpha = Math.min(this.timer / INTRO_CONFIG.fadeDuration, 1.0);
        if (this.timer >= INTRO_CONFIG.fadeDuration) {
          this.phase = IntroPhase.TALKING_HEAD_FADE_OUT;
          this.timer = 0;
          this.alpha = 1.0;
        }
        break;

      case IntroPhase.TALKING_HEAD_FADE_OUT:
      case IntroPhase.NORMAL:
        break;
    }
  }

  skipPhase(): void {
    switch (this.phase) {
      case IntroPhase.ENTRANCE_FADE_IN:
      case IntroPhase.ENTRANCE_PLAY:
        this.phase = IntroPhase.ENTRANCE_FADE_OUT;
        this.timer = INTRO_CONFIG.fadeDuration;
        break;

      case IntroPhase.FLYING_HEAD_FADE_IN:
      case IntroPhase.FLYING_HEAD_PLAY:
        this.phase = IntroPhase.FLYING_HEAD_FADE_OUT;
        this.timer = INTRO_CONFIG.fadeDuration;
        break;

      case IntroPhase.TALKING_HEAD_FADE_IN:
        this.alpha = 1.0;
        break;
    }
  }

  transitionToNormal(): void {
    this.phase = IntroPhase.NORMAL;
    this.alpha = 1.0;
  }

  /**
   * Render intro narrator at centered position
   */
  render(display: typeof MakkoEngine.display, portraitBottomY: number, centerX: number): void {
    if (this.narratorSprite) {
      this.narratorSprite.draw(display, centerX, portraitBottomY, {
        scale: 1,
        alpha: this.alpha
      });
    }
  }
}
