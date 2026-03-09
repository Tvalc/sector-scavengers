/**
 * Character Fader
 *
 * Manages fade transitions between active/inactive character states.
 */

import { MakkoEngine } from '@makko/engine';
import type { Character } from '@makko/engine';
import { FADE_CONFIG } from './constants';
import { FadePhase, type CharacterFadeState, type FadePhaseType } from './types';

type CharacterType = ReturnType<typeof MakkoEngine.sprite>;

export class CharacterFader {
  private fadeState: CharacterFadeState;
  private pendingAnimation: string | null = null;

  constructor(initialAlpha: number = 1.0) {
    this.fadeState = {
      currentAlpha: initialAlpha,
      phase: FadePhase.VISIBLE,
      timer: 0,
      targetAlpha: initialAlpha
    };
  }

  get alpha(): number {
    return this.fadeState.currentAlpha;
  }

  get isTransitioning(): boolean {
    return this.fadeState.phase !== FadePhase.VISIBLE;
  }

  reset(alpha: number): void {
    this.fadeState = {
      currentAlpha: alpha,
      phase: FadePhase.VISIBLE,
      timer: 0,
      targetAlpha: alpha
    };
    this.pendingAnimation = null;
  }

  /**
   * Start fade-out to switch animation while invisible
   */
  startFadeOut(targetAlpha: number, pendingAnimation: string): void {
    this.fadeState.phase = FadePhase.WAITING_TO_FADE;
    this.fadeState.timer = 0;
    this.fadeState.currentAlpha = 1.0;
    this.fadeState.targetAlpha = targetAlpha;
    this.pendingAnimation = pendingAnimation;
  }

  /**
   * Snap to visible with target alpha
   */
  snapToVisible(targetAlpha: number): void {
    this.fadeState.phase = FadePhase.VISIBLE;
    this.fadeState.timer = 0;
    this.fadeState.currentAlpha = targetAlpha;
    this.fadeState.targetAlpha = targetAlpha;
    this.pendingAnimation = null;
  }

  /**
   * Start immediate fade-out (skip waiting)
   */
  startImmediateFadeOut(targetAlpha: number, pendingAnimation: string): void {
    this.fadeState.phase = FadePhase.FADING_OUT;
    this.fadeState.timer = 0;
    this.fadeState.currentAlpha = 1.0;
    this.fadeState.targetAlpha = targetAlpha;
    this.pendingAnimation = pendingAnimation;
  }

  update(dt: number, character: CharacterType | null): void {
    switch (this.fadeState.phase) {
      case FadePhase.WAITING_TO_FADE:
        this.fadeState.timer += dt;
        if (this.fadeState.timer >= FADE_CONFIG.waitDuration) {
          this.fadeState.phase = FadePhase.FADING_OUT;
          this.fadeState.timer = 0;
        }
        break;

      case FadePhase.FADING_OUT:
        this.fadeState.timer += dt;
        const outProgress = Math.min(this.fadeState.timer / FADE_CONFIG.fadeOutDuration, 1.0);
        this.fadeState.currentAlpha = 1.0 - outProgress;

        if (this.fadeState.timer >= FADE_CONFIG.fadeOutDuration) {
          this.fadeState.currentAlpha = 0.0;

          // Switch animation while invisible
          if (character && this.pendingAnimation) {
            character.play(this.pendingAnimation, true);
          }
          this.pendingAnimation = null;

          this.fadeState.phase = FadePhase.FADING_IN;
          this.fadeState.timer = 0;
        }
        break;

      case FadePhase.FADING_IN:
        this.fadeState.timer += dt;
        const inProgress = Math.min(this.fadeState.timer / FADE_CONFIG.fadeInDuration, 1.0);
        this.fadeState.currentAlpha = this.fadeState.targetAlpha * inProgress;

        if (this.fadeState.timer >= FADE_CONFIG.fadeInDuration) {
          this.fadeState.phase = FadePhase.VISIBLE;
          this.fadeState.timer = 0;
          this.fadeState.currentAlpha = this.fadeState.targetAlpha;
        }
        break;

      case FadePhase.VISIBLE:
        break;
    }
  }
}
