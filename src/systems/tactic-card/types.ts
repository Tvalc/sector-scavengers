/**
 * Tactic Card System Types
 *
 * Shared interfaces for card drafting and execution.
 */

import type { JuiceSystem } from '../juice-system';
import type { SeededRNG } from '../../random/seeded-rng';

/**
 * Result of playing a card
 */
export interface CardPlayResult {
  success: boolean;
  message: string;
  energySpent: number;
  collapsed?: boolean;
  payout?: number;
}

/**
 * Context for card execution
 */
export interface CardContext {
  juice: JuiceSystem;
}

/**
 * Internal execution context passed to card effect functions
 */
export interface ExecutionDeps {
  rng: SeededRNG;
  juice: JuiceSystem;
}
