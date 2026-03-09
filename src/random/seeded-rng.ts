/**
 * Seeded Random Number Generator
 *
 * Deterministic RNG using mulberry32 algorithm.
 * Same seed always produces same sequence - perfect for:
 * - Replay systems
 * - Provably fair gambling
 * - Reproducible procedural generation
 * - Testing random mechanics
 *
 * Usage:
 *   const rng = new SeededRNG(12345);
 *   rng.next();      // 0.0-1.0
 *   rng.nextInt(10); // 0-9
 *   rng.nextRange(5, 10); // 5-10
 */

/**
 * SeededRNG - Deterministic random number generator
 */
export class SeededRNG {
  private state: number;
  private readonly initialSeed: number;

  /**
   * Create a seeded RNG
   * @param seed - Numeric seed (default: current timestamp)
   */
  constructor(seed?: number) {
    this.initialSeed = seed ?? Date.now();
    this.state = this.initialSeed;
  }

  /**
   * Get next random number in range [0, 1)
   * Uses mulberry32 algorithm
   */
  next(): number {
    // mulberry32 algorithm
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Get random integer in range [0, max)
   */
  nextInt(max: number): number {
    return Math.floor(this.next() * max);
  }

  /**
   * Get random integer in range [min, max] (inclusive)
   */
  nextRange(min: number, max: number): number {
    return min + Math.floor(this.next() * (max - min + 1));
  }

  /**
   * Get random float in range [min, max)
   */
  nextFloat(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  /**
   * Get random boolean with given probability of true
   */
  nextBool(probability: number = 0.5): boolean {
    return this.next() < probability;
  }

  /**
   * Shuffle array in place using Fisher-Yates
   */
  shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = this.nextInt(i + 1);
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /**
   * Pick random element from array
   */
  pick<T>(array: readonly T[]): T | undefined {
    if (array.length === 0) return undefined;
    return array[this.nextInt(array.length)];
  }

  /**
   * Pick multiple unique elements from array
   */
  pickMultiple<T>(array: readonly T[], count: number): T[] {
    const shuffled = [...array];
    this.shuffle(shuffled);
    return shuffled.slice(0, Math.min(count, array.length));
  }

  /**
   * Reset RNG to initial seed
   */
  reset(): void {
    this.state = this.initialSeed;
  }

  /**
   * Get current seed for saving state
   */
  getSeed(): number {
    return this.initialSeed;
  }

  /**
   * Get current internal state for saving/restoring
   */
  getState(): number {
    return this.state;
  }

  /**
   * Restore internal state
   */
  setState(state: number): void {
    this.state = state;
  }

  /**
   * Create new RNG with random seed from current RNG
   */
  fork(): SeededRNG {
    return new SeededRNG(this.nextInt(0x7fffffff));
  }
}

/**
 * Create a SeededRNG with current timestamp
 */
export function createRNG(): SeededRNG {
  return new SeededRNG();
}

/**
 * Create a SeededRNG with specific seed
 */
export function createSeededRNG(seed: number): SeededRNG {
  return new SeededRNG(seed);
}

/**
 * Generate a random seed value
 */
export function generateSeed(): number {
  return Math.floor(Math.random() * 0x7fffffff);
}
