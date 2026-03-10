/**
 * Juice System
 *
 * Visual effects for game feedback:
 * - Screen shake (Hull Breach)
 * - Red glitch overlay (Hull Breach)
 * - Ion beam effect (successful Salvage)
 *
 * Usage:
 *   const juice = new JuiceSystem();
 *   juice.triggerShake(10, 300); // Intensity 10, 300ms
 *   juice.triggerGlitch();
 *   juice.triggerIonBeam(playerX);
 *   
 *   // In game loop:
 *   juice.update(dt);
 *   juice.render(display);
 */

import type { IDisplay } from '@makko/engine';

/**
 * Active screen shake state
 */
interface ShakeState {
  intensity: number;
  duration: number;
  elapsed: number;
}

/**
 * Active glitch state
 */
interface GlitchState {
  duration: number;
  elapsed: number;
  flickerCount: number;
  maxFlickers: number;
  flickerInterval: number;
  lastFlickerTime: number;
  visible: boolean;
}

/**
 * Active ion beam state
 */
interface IonBeamState {
  x: number;
  width: number;
  height: number;
  duration: number;
  elapsed: number;
  travelDuration: number;
  fadeDuration: number;
}

/**
 * JuiceSystem - manages visual juice effects
 */
export class JuiceSystem {
  private shake: ShakeState | null = null;
  private glitch: GlitchState | null = null;
  private ionBeams: IonBeamState[] = [];

  // Effect defaults
  private static readonly SHAKE_INTENSITY_MIN = 8;
  private static readonly SHAKE_INTENSITY_MAX = 12;
  private static readonly SHAKE_DURATION_MIN = 200;
  private static readonly SHAKE_DURATION_MAX = 400;

  private static readonly GLITCH_DURATION = 150;
  private static readonly GLITCH_FLICKERS_MIN = 3;
  private static readonly GLITCH_FLICKERS_MAX = 5;

  private static readonly ION_BEAM_WIDTH = 80;
  private static readonly ION_BEAM_HEIGHT = 400;
  private static readonly ION_BEAM_TRAVEL_DURATION = 500;
  private static readonly ION_BEAM_FADE_DURATION = 200;
  private static readonly ION_BEAM_COLOR_START = '#ffffff';
  private static readonly ION_BEAM_COLOR_END = '#00f0ff';
  private static readonly GLITCH_COLOR = '#ff3344';
  private static readonly GLITCH_ALPHA_MIN = 0.3;
  private static readonly GLITCH_ALPHA_MAX = 0.5;

  /**
   * Trigger screen shake effect
   * @param intensity - Shake intensity in pixels (default: 8-12 range)
   * @param duration - Duration in milliseconds (default: 200-400ms)
   */
  triggerShake(intensity?: number, duration?: number): void {
    const finalIntensity = intensity ?? this.randomRange(
      JuiceSystem.SHAKE_INTENSITY_MIN,
      JuiceSystem.SHAKE_INTENSITY_MAX
    );
    const finalDuration = duration ?? this.randomRange(
      JuiceSystem.SHAKE_DURATION_MIN,
      JuiceSystem.SHAKE_DURATION_MAX
    );

    this.shake = {
      intensity: finalIntensity,
      duration: finalDuration,
      elapsed: 0
    };
  }

  /**
   * Trigger red glitch overlay effect
   */
  triggerGlitch(): void {
    const flickerCount = Math.floor(this.randomRange(
      JuiceSystem.GLITCH_FLICKERS_MIN,
      JuiceSystem.GLITCH_FLICKERS_MAX + 1
    ));

    this.glitch = {
      duration: JuiceSystem.GLITCH_DURATION,
      elapsed: 0,
      flickerCount: 0,
      maxFlickers: flickerCount,
      flickerInterval: JuiceSystem.GLITCH_DURATION / (flickerCount * 2),
      lastFlickerTime: 0,
      visible: true
    };
  }

  /**
   * Trigger Hull Breach effect (shake + glitch)
   */
  triggerHullBreach(): void {
    this.triggerShake();
    this.triggerGlitch();
  }

  /**
   * Trigger ion beam effect at position
   * @param x - X position for beam center
   */
  triggerIonBeam(x: number): void {
    this.ionBeams.push({
      x,
      width: JuiceSystem.ION_BEAM_WIDTH,
      height: JuiceSystem.ION_BEAM_HEIGHT,
      duration: JuiceSystem.ION_BEAM_TRAVEL_DURATION + JuiceSystem.ION_BEAM_FADE_DURATION,
      elapsed: 0,
      travelDuration: JuiceSystem.ION_BEAM_TRAVEL_DURATION,
      fadeDuration: JuiceSystem.ION_BEAM_FADE_DURATION
    });
  }

  /**
   * Update all active effects
   * @param dt - Delta time in milliseconds
   */
  update(dt: number): void {
    this.updateShake(dt);
    this.updateGlitch(dt);
    this.updateIonBeams(dt);
  }

  /**
   * Render all active effects
   * @param display - MakkoEngine display instance
   */
  render(display: IDisplay): void {
    // Apply shake offset at start of frame
    this.applyShakeOffset(display);

    // Render ion beams (under other effects)
    this.renderIonBeams(display);

    // Render glitch overlay (on top)
    this.renderGlitch(display);
  }

  /**
   * Clear all active effects
   */
  clear(): void {
    this.shake = null;
    this.glitch = null;
    this.ionBeams = [];
  }

  /**
   * Check if any effects are active
   */
  hasActiveEffects(): boolean {
    return this.shake !== null || this.glitch !== null || this.ionBeams.length > 0;
  }

  // ============================================================================
  // Private: Shake
  // ============================================================================

  private updateShake(dt: number): void {
    if (!this.shake) return;

    this.shake.elapsed += dt;

    if (this.shake.elapsed >= this.shake.duration) {
      this.shake = null;
    }
  }

  private applyShakeOffset(display: IDisplay): void {
    if (!this.shake) {
      display.setGlobalOffset(0, 0);
      return;
    }

    // Calculate progress (0 to 1)
    const progress = this.shake.elapsed / this.shake.duration;
    
    // Decay intensity over time (easing out)
    const decayFactor = 1 - progress;
    const currentIntensity = this.shake.intensity * decayFactor;

    // Random offset each frame
    const offsetX = this.randomRange(-currentIntensity, currentIntensity);
    const offsetY = this.randomRange(-currentIntensity, currentIntensity);

    display.setGlobalOffset(offsetX, offsetY);
  }

  // ============================================================================
  // Private: Glitch
  // ============================================================================

  private updateGlitch(dt: number): void {
    if (!this.glitch) return;

    this.glitch.elapsed += dt;

    // Update flicker state
    if (this.glitch.flickerCount < this.glitch.maxFlickers) {
      if (this.glitch.elapsed - this.glitch.lastFlickerTime >= this.glitch.flickerInterval) {
        this.glitch.visible = !this.glitch.visible;
        this.glitch.lastFlickerTime = this.glitch.elapsed;
        
        if (!this.glitch.visible) {
          this.glitch.flickerCount++;
        }
      }
    }

    // End glitch
    if (this.glitch.elapsed >= this.glitch.duration) {
      this.glitch = null;
    }
  }

  private renderGlitch(display: IDisplay): void {
    if (!this.glitch || !this.glitch.visible) return;

    const alpha = this.randomRange(
      JuiceSystem.GLITCH_ALPHA_MIN,
      JuiceSystem.GLITCH_ALPHA_MAX
    );

    // Full-screen red overlay
    display.drawRect(0, 0, display.width, display.height, {
      fill: JuiceSystem.GLITCH_COLOR,
      alpha
    });
  }

  // ============================================================================
  // Private: Ion Beam
  // ============================================================================

  private updateIonBeams(dt: number): void {
    // Update each beam
    for (const beam of this.ionBeams) {
      beam.elapsed += dt;
    }

    // Remove completed beams
    this.ionBeams = this.ionBeams.filter(beam => beam.elapsed < beam.duration);
  }

  private renderIonBeams(display: IDisplay): void {
    for (const beam of this.ionBeams) {
      this.renderIonBeam(display, beam);
    }
  }

  private renderIonBeam(display: IDisplay, beam: IonBeamState): void {
    const { x, width, height, elapsed, travelDuration, fadeDuration } = beam;

    // Calculate travel progress (0 to 1)
    const travelProgress = Math.min(elapsed / travelDuration, 1);
    
    // Calculate fade progress (after travel completes)
    const fadeElapsed = Math.max(0, elapsed - travelDuration);
    const fadeProgress = Math.min(fadeElapsed / fadeDuration, 1);
    const alpha = 1 - fadeProgress;

    // Beam position (travels from top to bottom)
    const totalTravel = display.height + height;
    const currentY = -height + (totalTravel * travelProgress);

    // Draw beam layers for gradient effect
    const halfWidth = width / 2;

    // Core (brightest, white center)
    const coreWidth = width * 0.3;
    display.drawRect(x - coreWidth / 2, currentY, coreWidth, height, {
      fill: JuiceSystem.ION_BEAM_COLOR_START,
      alpha: alpha * 0.9
    });

    // Mid layer (cyan)
    const midWidth = width * 0.6;
    display.drawRect(x - midWidth / 2, currentY, midWidth, height, {
      fill: JuiceSystem.ION_BEAM_COLOR_END,
      alpha: alpha * 0.6
    });

    // Outer glow (wider, more transparent)
    const glowWidth = width * 1.2;
    display.drawRect(x - glowWidth / 2, currentY, glowWidth, height, {
      fill: JuiceSystem.ION_BEAM_COLOR_END,
      alpha: alpha * 0.3
    });

    // Add bright spot at impact point when beam reaches center
    if (travelProgress > 0.3 && travelProgress < 0.9) {
      const impactY = display.height * 0.6;
      const impactSize = 40 + Math.sin(elapsed * 0.02) * 10;
      
      display.drawCircle(x, impactY, impactSize, {
        fill: JuiceSystem.ION_BEAM_COLOR_START,
        alpha: alpha * 0.8
      });
      
      display.drawCircle(x, impactY, impactSize * 0.5, {
        fill: '#ffffff',
        alpha: alpha
      });
    }
  }

  // ============================================================================
  // Private: Utilities
  // ============================================================================

  private randomRange(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }
}

/**
 * Singleton instance for global access
 */
export const juiceSystem = new JuiceSystem();
