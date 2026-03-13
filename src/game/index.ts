/**
 * Game Module - Re-exports
 *
 * This module re-exports the Game class for backward compatibility.
 * The implementation lives in game.ts with domain logic in separate modules.
 */

export { Game } from './game';
export { GameFlowStates, type GameFlowState, type SectorScavengersSave } from './types';
