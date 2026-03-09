/**
 * Story State
 *
 * Tracks story flags (boolean) and variables (numeric) for branching narratives.
 * Supports condition evaluation for dialogue choices.
 *
 * Usage:
 *   const story = new StoryState();
 *   story.setFlag('met_wizard');
 *   story.setVariable('reputation', 10);
 *   if (story.evaluate('flag:met_wizard')) { ... }
 *   if (story.evaluate('var:reputation>=5')) { ... }
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
