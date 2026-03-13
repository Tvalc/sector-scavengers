/**
 * Card Drafting
 *
 * RNG-based card selection and hand generation.
 * Assigns random art variants to drafted cards.
 */

import { getAvailableCards, TacticCard } from '../../types/cards';
import { SeededRNG } from '../../random/seeded-rng';
import { getRandomCardArt } from '../../assets/card-art-map';
import type { Game } from '../../game/game';

/**
 * Card Drafter - manages RNG and card selection
 */
export class CardDrafter {
  private rng: SeededRNG;

  constructor(seed?: number) {
    this.rng = new SeededRNG(seed ?? Date.now());
  }

  /**
   * Reset RNG for new session
   */
  resetSeed(): void {
    this.rng = new SeededRNG(Date.now());
  }

  /**
   * Get the RNG instance (for card effects)
   */
  getRNG(): SeededRNG {
    return this.rng;
  }

  /**
   * Draft N cards from available pool
   * Returns cards in random order via Fisher-Yates shuffle
   */
  draftCards(game: Game, count: number): TacticCard[] {
    const available = getAvailableCards(game.state.unlockedCards);

    // Fisher-Yates shuffle
    const shuffled = [...available];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(this.rng.next() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Select cards and assign random art variants
    const selected = shuffled.slice(0, Math.min(count, shuffled.length));
    for (const card of selected) {
      card.selectedArt = getRandomCardArt(card.type, () => this.rng.next());
    }

    return selected;
  }
}
