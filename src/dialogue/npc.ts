/**
 * NPC Interaction
 *
 * Interactive NPCs with dialogue triggers based on proximity.
 * Handles interaction prompts and dialogue initiation.
 *
 * Usage:
 *   const npc = new NPC('shopkeeper', 100, 200, 60, 'shop_greeting');
 *   // In game loop:
 *   npc.update(player.x, player.y);
 *   if (npc.canInteract && input.isKeyPressed('Space')) {
 *     dialogueManager.startDialogue(npc.dialogueId);
 *   }
 *   npc.render();
 */

import { MakkoEngine } from '@makko/engine';

/**
 * NPC configuration
 */
export interface NPCConfig {
  id: string;
  x: number;
  y: number;
  interactionRadius: number;
  dialogueId: string;
  name?: string;
  spriteId?: string;
  promptText?: string;
}

/**
 * NPC - interactive character with dialogue trigger
 */
export class NPC {
  readonly id: string;
  x: number;
  y: number;
  interactionRadius: number;
  dialogueId: string;
  name: string;
  spriteId?: string;
  promptText: string;

  private _canInteract: boolean = false;
  private _distanceToPlayer: number = Infinity;

  /**
   * Create an NPC
   */
  constructor(config: NPCConfig) {
    this.id = config.id;
    this.x = config.x;
    this.y = config.y;
    this.interactionRadius = config.interactionRadius;
    this.dialogueId = config.dialogueId;
    this.name = config.name ?? config.id;
    this.spriteId = config.spriteId;
    this.promptText = config.promptText ?? 'Press SPACE to talk';
  }

  /**
   * Check if player can interact with this NPC
   */
  get canInteract(): boolean {
    return this._canInteract;
  }

  /**
   * Get distance to player
   */
  get distanceToPlayer(): number {
    return this._distanceToPlayer;
  }

  /**
   * Update NPC state based on player position
   */
  update(playerX: number, playerY: number): void {
    const dx = this.x - playerX;
    const dy = this.y - playerY;
    this._distanceToPlayer = Math.sqrt(dx * dx + dy * dy);
    this._canInteract = this._distanceToPlayer <= this.interactionRadius;
  }

  /**
   * Render the NPC and interaction prompt
   */
  render(): void {
    const display = MakkoEngine.display;

    // Draw NPC placeholder (replace with sprite rendering)
    if (this.spriteId) {
      // TODO: Use MakkoEngine.sprite() for actual sprite rendering
      display.drawCircle(this.x, this.y, 20, { fill: '#8b5cf6' });
    } else {
      display.drawCircle(this.x, this.y, 20, { fill: '#8b5cf6' });
    }

    // Draw name above NPC
    display.drawText(this.name, this.x, this.y - 35, {
      fill: '#ffffff',
      font: '14px sans-serif',
      align: 'center',
      baseline: 'middle',
    });

    // Draw interaction prompt when in range
    if (this._canInteract) {
      this.renderPrompt();
    }
  }

  /**
   * Render the interaction prompt
   */
  private renderPrompt(): void {
    const display = MakkoEngine.display;
    const promptY = this.y - 55;

    // Background pill
    const textWidth = display.measureText(this.promptText, {
      font: '12px sans-serif',
    }).width;
    const padding = 8;

    display.drawRoundRect(
      this.x - textWidth / 2 - padding,
      promptY - 10,
      textWidth + padding * 2,
      20,
      4,
      { fill: 'rgba(0, 0, 0, 0.7)' }
    );

    // Prompt text
    display.drawText(this.promptText, this.x, promptY, {
      fill: '#ffffff',
      font: '12px sans-serif',
      align: 'center',
      baseline: 'middle',
    });
  }
}

/**
 * NPCManager - manages multiple NPCs and finds nearest interactable
 */
export class NPCManager {
  private npcs: NPC[] = [];

  /**
   * Add an NPC
   */
  add(npc: NPC): void {
    this.npcs.push(npc);
  }

  /**
   * Add NPC from config
   */
  addFromConfig(config: NPCConfig): NPC {
    const npc = new NPC(config);
    this.add(npc);
    return npc;
  }

  /**
   * Remove an NPC by ID
   */
  remove(id: string): void {
    this.npcs = this.npcs.filter((npc) => npc.id !== id);
  }

  /**
   * Get NPC by ID
   */
  get(id: string): NPC | undefined {
    return this.npcs.find((npc) => npc.id === id);
  }

  /**
   * Update all NPCs
   */
  update(playerX: number, playerY: number): void {
    for (const npc of this.npcs) {
      npc.update(playerX, playerY);
    }
  }

  /**
   * Get the nearest interactable NPC (if any)
   */
  getNearestInteractable(): NPC | null {
    let nearest: NPC | null = null;
    let nearestDist = Infinity;

    for (const npc of this.npcs) {
      if (npc.canInteract && npc.distanceToPlayer < nearestDist) {
        nearest = npc;
        nearestDist = npc.distanceToPlayer;
      }
    }

    return nearest;
  }

  /**
   * Get all interactable NPCs
   */
  getInteractable(): NPC[] {
    return this.npcs.filter((npc) => npc.canInteract);
  }

  /**
   * Render all NPCs
   */
  render(): void {
    for (const npc of this.npcs) {
      npc.render();
    }
  }

  /**
   * Get all NPCs
   */
  getAll(): NPC[] {
    return [...this.npcs];
  }

  /**
   * Clear all NPCs
   */
  clear(): void {
    this.npcs = [];
  }
}
