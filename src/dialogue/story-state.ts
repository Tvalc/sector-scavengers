/**
 * Story State
 *
 * Tracks story flags (boolean) and variables (numeric) for branching narratives.
 * Supports condition evaluation for dialogue choices.
 *
 * Narrative Event Types:
 *
 * Debt Threshold Flags:
 * - debt_warning_80: Player reached 80% debt capacity
 * - debt_warning_90: Player reached 90% debt capacity
 * - debt_critical_100: Player hit debt limit (game over threshold)
 *
 * Recruit Introduction Flags:
 * - recruit_met_{authoredId}: Named recruit has been introduced
 *   e.g., recruit_met_vera_chen, recruit_met_marcus_kim
 *
 * Sector Unlock Flags:
 * - sector_unlocked_{sectorId}: Sector has been unlocked
 *   e.g., sector_unlocked_2, sector_unlocked_3
 *
 * Milestone Variables:
 * - debt_cycles_completed: Number of billing cycles processed
 * - recruits_woken: Total recruits awakened from cryo
 * - missions_completed_total: Total depth dive missions completed
 *
 * Usage:
 *   const story = new StoryState();
 *   story.setFlag('met_wizard');
 *   story.setVariable('reputation', 10);
 *   if (story.evaluate('flag:met_wizard')) { ... }
 *   if (story.evaluate('var:reputation>=5')) { ... }
 *
 *   // Narrative helpers:
 *   story.markDebtThreshold(80);
 *   story.markRecruitIntroduced('vera_chen');
 *   story.markSectorUnlocked(2);
 *   story.incrementDebtCycles();
 */

/**
 * StoryState - tracks flags and variables for branching narratives
 */
export class StoryState {
  private flags: Set<string> = new Set();
  private variables: Map<string, number> = new Map();

  // ============================================================================
  // Flags (boolean states)
  // ============================================================================

  /**
   * Set a flag (mark as true)
   */
  setFlag(flag: string): void {
    this.flags.add(flag);
  }

  /**
   * Clear a flag (mark as false)
   */
  clearFlag(flag: string): void {
    this.flags.delete(flag);
  }

  /**
   * Check if a flag is set
   */
  hasFlag(flag: string): boolean {
    return this.flags.has(flag);
  }

  /**
   * Toggle a flag
   */
  toggleFlag(flag: string): void {
    if (this.hasFlag(flag)) {
      this.clearFlag(flag);
    } else {
      this.setFlag(flag);
    }
  }

  // ============================================================================
  // Variables (numeric values)
  // ============================================================================

  /**
   * Set a variable value
   */
  setVariable(name: string, value: number): void {
    this.variables.set(name, value);
  }

  /**
   * Get a variable value (returns 0 if not set)
   */
  getVariable(name: string): number {
    return this.variables.get(name) ?? 0;
  }

  /**
   * Add to a variable value
   */
  addVariable(name: string, amount: number): void {
    const current = this.getVariable(name);
    this.setVariable(name, current + amount);
  }

  /**
   * Increment a variable by 1
   */
  incrementVariable(name: string): void {
    this.addVariable(name, 1);
  }

  /**
   * Decrement a variable by 1
   */
  decrementVariable(name: string): void {
    this.addVariable(name, -1);
  }

  // ============================================================================
  // Condition Evaluation
  // ============================================================================

  /**
   * Evaluate a condition string
   *
   * Supported formats:
   * - "flag:name" - true if flag is set
   * - "!flag:name" - true if flag is NOT set
   * - "var:name>=10" - compare variable (supports >=, <=, >, <, ==, !=)
   */
  evaluate(condition: string): boolean {
    // Flag check: "flag:name"
    if (condition.startsWith('flag:')) {
      return this.hasFlag(condition.substring(5));
    }

    // Negated flag check: "!flag:name"
    if (condition.startsWith('!flag:')) {
      return !this.hasFlag(condition.substring(6));
    }

    // Variable comparison: "var:name>=10"
    if (condition.startsWith('var:')) {
      return this.evaluateVarCondition(condition.substring(4));
    }

    // Unknown condition format - default to true
    return true;
  }

  private evaluateVarCondition(expr: string): boolean {
    // Parse "name>=value" or "name<value" etc.
    const match = expr.match(/^(\w+)(>=|<=|>|<|==|!=)(-?\d+)$/);
    if (!match) return false;

    const [, name, op, valueStr] = match;
    const current = this.getVariable(name);
    const target = parseInt(valueStr, 10);

    switch (op) {
      case '>=':
        return current >= target;
      case '<=':
        return current <= target;
      case '>':
        return current > target;
      case '<':
        return current < target;
      case '==':
        return current === target;
      case '!=':
        return current !== target;
      default:
        return false;
    }
  }

  // ============================================================================
  // Narrative Event Helpers
  // ============================================================================

  /**
   * Mark a debt threshold as announced
   * Sets flags: debt_warning_80, debt_warning_90, debt_critical_100
   */
  markDebtThreshold(threshold: 80 | 90 | 100): void {
    if (threshold === 80) this.setFlag('debt_warning_80');
    else if (threshold === 90) this.setFlag('debt_warning_90');
    else if (threshold === 100) this.setFlag('debt_critical_100');
  }

  /**
   * Check if a debt threshold has been announced
   */
  hasDebtThresholdBeenAnnounced(threshold: 80 | 90 | 100): boolean {
    if (threshold === 80) return this.hasFlag('debt_warning_80');
    if (threshold === 90) return this.hasFlag('debt_warning_90');
    if (threshold === 100) return this.hasFlag('debt_critical_100');
    return false;
  }

  /**
   * Mark a recruit as introduced
   * Sets flag: recruit_met_{authoredId}
   */
  markRecruitIntroduced(authoredId: string): void {
    this.setFlag(`recruit_met_${authoredId}`);
  }

  /**
   * Check if a recruit has been introduced
   */
  hasRecruitBeenIntroduced(authoredId: string): boolean {
    return this.hasFlag(`recruit_met_${authoredId}`);
  }

  /**
   * Mark a sector as unlocked
   * Sets flag: sector_unlocked_{sectorId}
   */
  markSectorUnlocked(sectorId: number): void {
    this.setFlag(`sector_unlocked_${sectorId}`);
  }

  /**
   * Check if a sector has been unlocked
   */
  hasSectorUnlocked(sectorId: number): boolean {
    return this.hasFlag(`sector_unlocked_${sectorId}`);
  }

  /**
   * Increment debt cycles completed counter
   */
  incrementDebtCycles(): void {
    this.incrementVariable('debt_cycles_completed');
  }

  /**
   * Increment recruits woken counter
   */
  incrementRecruitsWoken(): void {
    this.incrementVariable('recruits_woken');
  }

  /**
   * Increment total missions completed counter
   */
  incrementMissionsCompleted(): void {
    this.incrementVariable('missions_completed_total');
  }

  /**
   * Get total debt cycles completed
   */
  getDebtCyclesCompleted(): number {
    return this.getVariable('debt_cycles_completed');
  }

  /**
   * Get total recruits woken
   */
  getRecruitsWoken(): number {
    return this.getVariable('recruits_woken');
  }

  /**
   * Get total missions completed
   */
  getMissionsCompleted(): number {
    return this.getVariable('missions_completed_total');
  }

  /**
   * Increment consecutive debt ceiling violations counter
   */
  incrementConsecutiveDebtOverCeiling(): void {
    this.incrementVariable('consecutive_debt_over_ceiling');
  }

  /**
   * Get consecutive debt ceiling violations count
   */
  getConsecutiveDebtOverCeiling(): number {
    return this.getVariable('consecutive_debt_over_ceiling');
  }

  /**
   * Reset consecutive debt ceiling violations counter
   */
  resetConsecutiveDebtOverCeiling(): void {
    this.setVariable('consecutive_debt_over_ceiling', 0);
  }

  /**
   * Increment consecutive hull collapses counter
   */
  incrementConsecutiveCollapses(): void {
    this.incrementVariable('consecutive_collapses');
  }

  /**
   * Get consecutive hull collapses count
   */
  getConsecutiveCollapses(): number {
    return this.getVariable('consecutive_collapses');
  }

  /**
   * Reset consecutive hull collapses counter
   */
  resetConsecutiveCollapses(): void {
    this.setVariable('consecutive_collapses', 0);
  }

  // ============================================================================
  // Serialization (for save/load)
  // ============================================================================

  /**
   * Convert state to JSON-serializable object
   */
  toJSON(): { flags: string[]; variables: [string, number][] } {
    return {
      flags: Array.from(this.flags),
      variables: Array.from(this.variables.entries()),
    };
  }

  /**
   * Load state from serialized object
   */
  fromJSON(data: { flags: string[]; variables: [string, number][] }): void {
    this.flags = new Set(data.flags);
    this.variables = new Map(data.variables);
  }

  /**
   * Clear all state
   */
  clear(): void {
    this.flags.clear();
    this.variables.clear();
  }

  // ============================================================================
  // Debugging
  // ============================================================================

  /**
   * Get all flags (for debugging)
   */
  getAllFlags(): string[] {
    return Array.from(this.flags);
  }

  /**
   * Get all variables (for debugging)
   */
  getAllVariables(): Record<string, number> {
    return Object.fromEntries(this.variables);
  }
}

// ============================================================================
// Action Parser
// ============================================================================

/**
 * Parse and execute a story action string
 *
 * Supported actions:
 * - "set_flag:name" - Set a flag
 * - "clear_flag:name" - Clear a flag
 * - "add_var:name:amount" - Add to a variable
 * - "set_var:name:value" - Set a variable
 */
export function executeStoryAction(action: string, state: StoryState): void {
  const [command, ...args] = action.split(':');

  switch (command) {
    case 'set_flag':
      if (args[0]) state.setFlag(args[0]);
      break;
    case 'clear_flag':
      if (args[0]) state.clearFlag(args[0]);
      break;
    case 'add_var':
      if (args[0] && args[1]) state.addVariable(args[0], parseInt(args[1], 10));
      break;
    case 'set_var':
      if (args[0] && args[1]) state.setVariable(args[0], parseInt(args[1], 10));
      break;
    default:
      // Unknown action - could log warning
      break;
  }
}

// ============================================================================
// Inline Conditional Text Processing
// ============================================================================

/**
 * Process inline conditionals in dialogue text (Ink-style syntax)
 *
 * Supported formats:
 * - "{flag:name?text if true|text if false}"
 * - "{!flag:name?text if false|text if true}"
 * - "{var:name>=10?text if true|text if false}"
 *
 * Examples:
 * - "Hello{flag:knows_name?, [name]|, stranger}!"
 *   → "Hello, [name]!" or "Hello, stranger!"
 *
 * - "You have {var:coins>=100?enough|not enough} gold."
 *   → "You have enough gold." or "You have not enough gold."
 *
 * @param text The text containing inline conditionals
 * @param state The story state to evaluate conditions against
 * @returns Processed text with conditionals resolved
 */
export function processDialogueText(text: string, state: StoryState): string {
  // Pattern: {condition?trueText|falseText}
  const pattern = /\{([^?]+)\?([^|]*)\|([^}]*)\}/g;

  return text.replace(pattern, (_, condition: string, trueText: string, falseText: string) => {
    const result = state.evaluate(condition.trim());
    return result ? trueText : falseText;
  });
}

/**
 * Check if text contains inline conditionals
 */
export function hasInlineConditionals(text: string): boolean {
  return /\{[^?]+\?[^|]*\|[^}]*\}/.test(text);
}
