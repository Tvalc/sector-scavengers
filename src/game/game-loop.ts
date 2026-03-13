/**
 * Game Loop
 *
 * Core game loop management including timing, rendering,
 * and frame coordination with MakkoEngine.
 */

import { MakkoEngine } from '@makko/engine';
import { StateMachine } from '../state/state-machine';
import { GameAccess } from './types';

/**
 * Manages the main game loop with proper timing and rendering.
 */
export class GameLoop {
  private lastTime = 0;
  private running = false;

  constructor(
    private game: GameAccess,
    private stateMachine: StateMachine<GameAccess>,
    private fullscreenToggleCallback: (() => void) | null = null
  ) {}

  /**
   * Set the fullscreen toggle callback
   */
  setFullscreenCallback(callback: (() => void) | null): void {
    this.fullscreenToggleCallback = callback;
  }

  /**
   * Start the game loop
   */
  start(): void {
    this.running = true;
    this.lastTime = performance.now();
    this.loop();
  }

  /**
   * Stop the game loop
   */
  stop(): void {
    this.running = false;
  }

  /**
   * Check if the loop is running
   */
  isRunning(): boolean {
    return this.running;
  }

  /**
   * Main loop iteration
   */
  private loop(): void {
    if (!this.running) return;

    const currentTime = performance.now();
    const dt = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Update state machine (handles automatic transitions)
    this.stateMachine.update(dt, this.game);

    // Delegate to scene manager
    this.game.getSceneManager().handleInput();
    this.game.getSceneManager().update(dt);
    this.render();

    requestAnimationFrame(() => this.loop());
  }

  /**
   * Render the current frame
   */
  private render(): void {
    const display = MakkoEngine.display;

    display.beginFrame();
    display.clear('#0a0e1a'); // Deep space black

    // Render all scenes in stack (for overlays)
    this.game.getSceneManager().render();

    display.endFrame();

    // Check for fullscreen toggle (Shift+F)
    if (this.fullscreenToggleCallback) {
      this.fullscreenToggleCallback();
    }

    // CRITICAL: Must call at end of each frame
    MakkoEngine.input.endFrame();
  }
}
