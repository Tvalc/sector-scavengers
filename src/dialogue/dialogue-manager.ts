/**
 * Dialogue Manager
 *
 * Orchestrates dialogue playback with typewriter effect.
 * Manages state, text display, and choice selection.
 *
 * Usage:
 *   const dialogue = new DialogueManager();
 *   dialogue.checkCondition = (cond) => storyState.evaluate(cond);
 *   dialogue.onAction = (action) => handleAction(action);
 *   dialogue.startDialogue(myDialogueTree);
 *   // In game loop: dialogue.update(dt);
 */

import type { DialogueTree, DialogueNode, DialogueChoice } from './dialogue-types';

/**
 * DialogueManager - handles dialogue playback and state
 */
export class DialogueManager {
  private currentTree: DialogueTree | null = null;
  private currentNode: DialogueNode | null = null;
  private isActive: boolean = false;

  // Text display state
  private displayedText: string = '';
  private textProgress: number = 0;
  private textSpeed: number = 30; // Characters per second
  private isTextComplete: boolean = false;

  // Callbacks
  /** Called when dialogue starts */
  onDialogueStart?: (tree: DialogueTree) => void;
  /** Called when dialogue ends */
  onDialogueEnd?: () => void;
  /** Called when node changes */
  onNodeChange?: (node: DialogueNode) => void;
  /** Called when an action should be triggered */
  onAction?: (actionId: string) => void;
  /** Called to check if a condition is met */
  checkCondition?: (conditionId: string) => boolean;

  /**
   * Start a dialogue tree
   */
  startDialogue(tree: DialogueTree): void {
    this.currentTree = tree;
    this.isActive = true;
    this.onDialogueStart?.(tree);
    this.goToNode(tree.startNodeId);
  }

  private goToNode(nodeId: string): void {
    if (!this.currentTree) return;

    const node = this.currentTree.nodes.get(nodeId);
    if (!node) {
      // Node not found - end dialogue
      this.endDialogue();
      return;
    }

    this.currentNode = node;
    this.displayedText = '';
    this.textProgress = 0;
    this.isTextComplete = false;
    this.onNodeChange?.(node);

    // Trigger node action
    if (node.action) {
      this.onAction?.(node.action);
    }
  }

  /**
   * Update dialogue state (call every frame)
   * @param dt - Delta time in milliseconds
   */
  update(dt: number): void {
    if (!this.isActive || !this.currentNode) return;

    // Typewriter effect (convert ms to seconds, textSpeed is chars/sec)
    if (!this.isTextComplete) {
      const dtSec = dt / 1000;
      this.textProgress += dtSec * this.textSpeed;
      const chars = Math.floor(this.textProgress);
      this.displayedText = this.currentNode.text.substring(0, chars);

      if (chars >= this.currentNode.text.length) {
        this.isTextComplete = true;
        this.displayedText = this.currentNode.text;
      }
    }
  }

  /**
   * Player presses continue/advance
   * - If text is incomplete, skip to end
   * - If text is complete and no choices, advance to next node
   * - If text is complete and has choices, do nothing (must select choice)
   */
  advance(): void {
    if (!this.isActive || !this.currentNode) return;

    // If text not complete, skip to end
    if (!this.isTextComplete) {
      this.displayedText = this.currentNode.text;
      this.isTextComplete = true;
      return;
    }

    // If no choices and has next node, go there
    if (!this.currentNode.choices && this.currentNode.nextNodeId) {
      this.goToNode(this.currentNode.nextNodeId);
      return;
    }

    // If no choices and no next, end dialogue
    if (!this.currentNode.choices) {
      this.endDialogue();
    }
  }

  /**
   * Select a choice by index
   */
  selectChoice(index: number): void {
    if (!this.isActive || !this.currentNode?.choices) return;
    if (!this.isTextComplete) return;

    const choices = this.getAvailableChoices();
    if (index < 0 || index >= choices.length) return;

    const choice = choices[index];

    // Trigger choice action
    if (choice.action) {
      this.onAction?.(choice.action);
    }

    this.goToNode(choice.nextNodeId);
  }

  /**
   * Get choices with conditions evaluated (filters out unavailable choices)
   */
  getAvailableChoices(): DialogueChoice[] {
    if (!this.currentNode?.choices) return [];

    return this.currentNode.choices.filter((choice) => {
      if (!choice.condition) return true;
      return this.checkCondition?.(choice.condition) ?? true;
    });
  }

  /**
   * End the current dialogue
   */
  endDialogue(): void {
    this.currentTree = null;
    this.currentNode = null;
    this.isActive = false;
    this.displayedText = '';
    this.textProgress = 0;
    this.isTextComplete = false;
    this.onDialogueEnd?.();
  }

  // ============================================================================
  // Getters for UI
  // ============================================================================

  isDialogueActive(): boolean {
    return this.isActive;
  }

  getCurrentNode(): DialogueNode | null {
    return this.currentNode;
  }

  getDisplayedText(): string {
    return this.displayedText;
  }

  isComplete(): boolean {
    return this.isTextComplete;
  }

  hasChoices(): boolean {
    return (this.currentNode?.choices?.length ?? 0) > 0;
  }

  /**
   * Set text speed (characters per second)
   */
  setTextSpeed(speed: number): void {
    this.textSpeed = speed;
  }
}
