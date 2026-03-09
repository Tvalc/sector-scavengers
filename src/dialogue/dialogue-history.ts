/**
 * Dialogue History
 *
 * Tracks past dialogue for a "log" or "history" feature in visual novels.
 * Stores speaker, text, and choices made.
 *
 * Usage:
 *   const history = new DialogueHistory(50);
 *   history.add({ speaker: 'Alice', text: 'Hello!', timestamp: Date.now() });
 *   const recent = history.getRecent(10);
 */

/**
 * A single history entry
 */
export interface HistoryEntry {
  speaker: string;
  text: string;
  portrait?: string;
  emotion?: string;
  timestamp: number;
  isChoice?: boolean;
  choiceText?: string;
}

/**
 * DialogueHistory - stores and retrieves past dialogue entries
 */
export class DialogueHistory {
  private entries: HistoryEntry[] = [];
  private maxEntries: number;

  /**
   * Create a dialogue history with a maximum capacity
   */
  constructor(maxEntries: number = 100) {
    this.maxEntries = maxEntries;
  }

  /**
   * Add an entry to history
   */
  add(entry: HistoryEntry): void {
    this.entries.push(entry);

    // Trim old entries if over capacity
    while (this.entries.length > this.maxEntries) {
      this.entries.shift();
    }
  }

  /**
   * Add a dialogue line to history
   */
  addDialogue(
    speaker: string,
    text: string,
    options?: { portrait?: string; emotion?: string }
  ): void {
    this.add({
      speaker,
      text,
      portrait: options?.portrait,
      emotion: options?.emotion,
      timestamp: Date.now(),
      isChoice: false,
    });
  }

  /**
   * Add a choice selection to history
   */
  addChoice(choiceText: string): void {
    this.add({
      speaker: '',
      text: '',
      timestamp: Date.now(),
      isChoice: true,
      choiceText,
    });
  }

  /**
   * Get the most recent N entries
   */
  getRecent(count: number): HistoryEntry[] {
    const start = Math.max(0, this.entries.length - count);
    return this.entries.slice(start);
  }

  /**
   * Get all entries
   */
  getAll(): HistoryEntry[] {
    return [...this.entries];
  }

  /**
   * Get total entry count
   */
  getCount(): number {
    return this.entries.length;
  }

  /**
   * Clear all history
   */
  clear(): void {
    this.entries = [];
  }

  /**
   * Search history for entries containing text
   */
  search(query: string): HistoryEntry[] {
    const lowerQuery = query.toLowerCase();
    return this.entries.filter(
      (entry) =>
        entry.text.toLowerCase().includes(lowerQuery) ||
        entry.speaker.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get entries by speaker
   */
  getBySpeaker(speaker: string): HistoryEntry[] {
    return this.entries.filter(
      (entry) => entry.speaker.toLowerCase() === speaker.toLowerCase()
    );
  }

  // ============================================================================
  // Serialization (for save/load)
  // ============================================================================

  /**
   * Convert history to JSON-serializable format
   */
  toJSON(): HistoryEntry[] {
    return this.entries;
  }

  /**
   * Load history from serialized data
   */
  fromJSON(data: HistoryEntry[]): void {
    this.entries = data.slice(-this.maxEntries);
  }
}
