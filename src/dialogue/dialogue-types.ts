/**
 * Dialogue Types
 *
 * Type definitions for dialogue trees, nodes, and choices.
 * Used by DialogueManager and DialogueUI.
 */

/**
 * A choice presented to the player during dialogue
 */
export interface DialogueChoice {
  /** Display text for this choice */
  text: string;
  /** Node ID to go to when selected */
  nextNodeId: string;
  /** Optional condition that must be true to show this choice (e.g., "flag:has_key") */
  condition?: string;
  /** Optional action to trigger when this choice is selected (e.g., "give_item:sword") */
  action?: string;
}

/**
 * A single node in a dialogue tree
 */
export interface DialogueNode {
  /** Unique identifier for this node */
  id: string;
  /** Character speaking (or 'narrator' for narration) */
  speaker: string;
  /** The dialogue text to display */
  text: string;
  /** Optional portrait image ID */
  portrait?: string;
  /** Optional emotion for portrait (e.g., 'happy', 'sad', 'angry') */
  emotion?: string;
  /** Choices for the player (if any) */
  choices?: DialogueChoice[];
  /** Auto-advance to this node if no choices (mutually exclusive with choices) */
  nextNodeId?: string;
  /** Action to trigger when this node is displayed */
  action?: string;
}

/**
 * A complete dialogue tree (conversation)
 */
export interface DialogueTree {
  /** Unique identifier for this dialogue */
  id: string;
  /** Node ID to start from */
  startNodeId: string;
  /** Map of node IDs to nodes */
  nodes: Map<string, DialogueNode>;
}

/**
 * Helper to create a DialogueTree from an array of nodes
 */
export function createDialogueTree(
  id: string,
  startNodeId: string,
  nodes: DialogueNode[]
): DialogueTree {
  const nodeMap = new Map<string, DialogueNode>();
  for (const node of nodes) {
    nodeMap.set(node.id, node);
  }
  return { id, startNodeId, nodes: nodeMap };
}

// ============================================================================
// Example Dialogue Tree
// ============================================================================

/**
 * Example dialogue tree - demonstrates structure and features
 */
export const EXAMPLE_DIALOGUE: DialogueTree = createDialogueTree(
  'example_greeting',
  'start',
  [
    {
      id: 'start',
      speaker: 'Mysterious Figure',
      text: 'Greetings, traveler. What brings you to these parts?',
      portrait: 'figure',
      emotion: 'neutral',
      choices: [
        { text: "I'm looking for adventure.", nextNodeId: 'adventure' },
        { text: "I'm lost.", nextNodeId: 'lost' },
        { text: 'Who are you?', nextNodeId: 'who', condition: 'flag:curious' },
        { text: 'Goodbye.', nextNodeId: 'farewell' },
      ],
    },
    {
      id: 'adventure',
      speaker: 'Mysterious Figure',
      text: "Adventure, you say? There's plenty of that in the old ruins to the north. But be careful...",
      emotion: 'intrigued',
      action: 'set_flag:knows_ruins',
      nextNodeId: 'start',
    },
    {
      id: 'lost',
      speaker: 'Mysterious Figure',
      text: "Lost? The village is to the east. Follow the path and you can't miss it.",
      emotion: 'helpful',
      nextNodeId: 'start',
    },
    {
      id: 'who',
      speaker: 'Mysterious Figure',
      text: 'Me? I am but a humble traveler, same as you. Though perhaps I have traveled... further.',
      emotion: 'mysterious',
      nextNodeId: 'start',
    },
    {
      id: 'farewell',
      speaker: 'Mysterious Figure',
      text: 'Safe travels, friend. May our paths cross again.',
      emotion: 'friendly',
      // No nextNodeId = dialogue ends
    },
  ]
);
