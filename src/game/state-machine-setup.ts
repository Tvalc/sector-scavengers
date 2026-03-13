/**
 * State Machine Setup
 *
 * Configures the game flow state machine for transitions between
 * IDLE, DEPTH_DIVE, and RESULTS states.
 */

import { StateMachine } from '../state/state-machine';
import { GameFlowStates, GameFlowState, GameAccess } from './types';
import { createRunState } from '../types/state';

/**
 * Setup the game flow state machine
 */
export function setupStateMachine(game: GameAccess, stateMachine: StateMachine<GameAccess>): void {
  // IDLE state - main hub
  stateMachine.add(GameFlowStates.IDLE, {
    enter: () => {
      game.getSceneManager().switchTo('idle');
    }
  });

  // DEPTH_DIVE state - active session
  stateMachine.add(GameFlowStates.DEPTH_DIVE, {
    enter: () => {
      // Initialize a new run
      game.state.currentRun = createRunState();
      game.getSceneManager().switchTo('depthDive');
    },
    exit: () => {
      // Run state cleanup happens in endDepthDive()
    }
  });

  // RESULTS state - end of run summary
  stateMachine.add(GameFlowStates.RESULTS, {
    enter: () => {
      game.getSceneManager().switchTo('results');
    },
    exit: () => {
      // Clear run state when leaving results
      game.state.currentRun = null;
    }
  });
}

/**
 * Check if currently in a specific game flow state
 */
export function isInFlowState(stateMachine: StateMachine<GameAccess>, state: GameFlowState): boolean {
  return stateMachine.isIn(state);
}

/**
 * Get current game flow state
 */
export function getCurrentFlowState(stateMachine: StateMachine<GameAccess>): GameFlowState | null {
  return stateMachine.getCurrent() as GameFlowState | null;
}
