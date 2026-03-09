/**
 * Node Grid System
 *
 * Manages the 4x4 isometric grid of 16 nodes.
 * Handles node levels, stability, ownership, and visual positioning.
 *
 * Usage:
 *   const nodeSystem = new NodeSystem();
 *   
 *   // Control a node
 *   nodeSystem.controlNode(5);
 *   
 *   // Upgrade a node
 *   nodeSystem.upgradeNode(5);
 *   
 *   // Get node at grid position
 *   const node = nodeSystem.getNodeAt(1, 2);
 */

import { Node, NodeOwner, createNode, idToPosition, positionToId } from '../types/node';

/**
 * Grid configuration
 */
interface GridConfig {
  cellWidth: number;
  cellHeight: number;
  centerX: number;
  centerY: number;
  isometricAngle: number;
}

/**
 * Screen position for rendering
 */
export interface ScreenPosition {
  x: number;
  y: number;
}

/**
 * NodeSystem - manages the 4x4 isometric grid
 */
export class NodeSystem {
  private nodes: Node[] = [];
  private gridConfig: GridConfig;

  // Default grid configuration
  private static readonly DEFAULT_CONFIG: GridConfig = {
    cellWidth: 180,
    cellHeight: 180,
    centerX: 960,
    centerY: 540,
    isometricAngle: 30 // degrees
  };

  constructor(config?: Partial<GridConfig>) {
    this.gridConfig = { ...NodeSystem.DEFAULT_CONFIG, ...config };
    this.initializeNodes();
  }

  /**
   * Initialize all 16 nodes
   */
  private initializeNodes(): void {
    this.nodes = [];
    for (let id = 0; id < 16; id++) {
      const pos = idToPosition(id);
      this.nodes.push(createNode(id, pos.row, pos.col));
    }
  }

  /**
   * Reset all nodes to initial state
   */
  resetAll(): void {
    for (const node of this.nodes) {
      node.owner = 'neutral';
      node.level = 1;
      node.stability = 100;
      node.energyAccumulated = 0;
    }
  }

  // ============================================================================
  // Node Actions
  // ============================================================================

  /**
   * Take control of a node (SCAN action)
   * @returns true if successful
   */
  controlNode(id: number): boolean {
    const node = this.getNode(id);
    if (!node || node.owner === 'player') return false;
    
    node.owner = 'player';
    return true;
  }

  /**
   * Upgrade a node's level
   * @returns true if successful
   */
  upgradeNode(id: number): boolean {
    const node = this.getNode(id);
    if (!node || node.level >= 3) return false;
    
    node.level++;
    return true;
  }

  /**
   * Damage a node's stability
   * @param amount - Damage amount (default: 10)
   * @returns true if node still has stability, false if destroyed
   */
  damageNode(id: number, amount: number = 10): boolean {
    const node = this.getNode(id);
    if (!node) return false;
    
    node.stability = Math.max(0, node.stability - amount);
    
    // If stability hits 0, node resets to neutral
    if (node.stability <= 0) {
      this.resetNode(id);
      return false;
    }
    
    return true;
  }

  /**
   * Repair a node's stability
   * @param amount - Repair amount (default: 20)
   */
  repairNode(id: number, amount: number = 20): void {
    const node = this.getNode(id);
    if (!node) return;
    
    node.stability = Math.min(100, node.stability + amount);
  }

  /**
   * Reset a node to neutral state
   */
  resetNode(id: number): void {
    const node = this.getNode(id);
    if (!node) return;
    
    node.owner = 'neutral';
    node.level = 1;
    node.stability = 100;
    node.energyAccumulated = 0;
  }

  /**
   * Set node owner directly
   */
  setOwner(id: number, owner: NodeOwner): void {
    const node = this.getNode(id);
    if (node) {
      node.owner = owner;
    }
  }

  /**
   * Set node stability directly
   */
  setStability(id: number, stability: number): void {
    const node = this.getNode(id);
    if (node) {
      node.stability = Math.max(0, Math.min(100, stability));
    }
  }

  /**
   * Set node level directly
   */
  setLevel(id: number, level: number): void {
    const node = this.getNode(id);
    if (node) {
      node.level = Math.max(1, Math.min(3, level));
    }
  }

  // ============================================================================
  // Node Getters
  // ============================================================================

  /**
   * Get a node by ID
   */
  getNode(id: number): Node | undefined {
    return this.nodes.find(n => n.id === id);
  }

  /**
   * Get a node by grid position
   */
  getNodeAt(row: number, col: number): Node | undefined {
    const id = positionToId(row, col);
    return this.getNode(id);
  }

  /**
   * Get all nodes
   */
  getAllNodes(): Node[] {
    return [...this.nodes];
  }

  /**
   * Get nodes by owner
   */
  getNodesByOwner(owner: NodeOwner): Node[] {
    return this.nodes.filter(n => n.owner === owner);
  }

  /**
   * Get all player-owned nodes
   */
  getPlayerNodes(): Node[] {
    return this.getNodesByOwner('player');
  }

  /**
   * Get all neutral nodes
   */
  getNeutralNodes(): Node[] {
    return this.getNodesByOwner('neutral');
  }

  /**
   * Get neighboring nodes (orthogonal)
   */
  getNeighbors(id: number): Node[] {
    const node = this.getNode(id);
    if (!node) return [];

    const neighbors: Node[] = [];
    const { row, col } = node.gridPosition;

    if (row > 0) neighbors.push(this.getNodeAt(row - 1, col)!);
    if (row < 3) neighbors.push(this.getNodeAt(row + 1, col)!);
    if (col > 0) neighbors.push(this.getNodeAt(row, col - 1)!);
    if (col < 3) neighbors.push(this.getNodeAt(row, col + 1)!);

    return neighbors.filter(n => n !== undefined);
  }

  /**
   * Count nodes by owner
   */
  countByOwner(owner: NodeOwner): number {
    return this.nodes.filter(n => n.owner === owner).length;
  }

  /**
   * Get total level of player nodes
   */
  getTotalPlayerLevel(): number {
    return this.getPlayerNodes().reduce((sum, n) => sum + n.level, 0);
  }

  /**
   * Get average stability of player nodes
   */
  getAveragePlayerStability(): number {
    const playerNodes = this.getPlayerNodes();
    if (playerNodes.length === 0) return 0;
    return playerNodes.reduce((sum, n) => sum + n.stability, 0) / playerNodes.length;
  }

  // ============================================================================
  // Grid Positioning
  // ============================================================================

  /**
   * Convert grid position to screen position (isometric)
   */
  gridToScreen(row: number, col: number): ScreenPosition {
    const { cellWidth, cellHeight, centerX, centerY, isometricAngle } = this.gridConfig;
    
    // Isometric projection
    const isoX = (col - row) * (cellWidth / 2);
    const isoY = (col + row) * (cellHeight / 4);
    
    // Apply rotation for isometric view
    const angle = (isometricAngle * Math.PI) / 180;
    const rotatedX = isoX * Math.cos(angle) - isoY * Math.sin(angle);
    const rotatedY = isoX * Math.sin(angle) + isoY * Math.cos(angle);
    
    // Offset to center
    return {
      x: centerX + rotatedX,
      y: centerY + rotatedY
    };
  }

  /**
   * Convert node ID to screen position
   */
  idToScreen(id: number): ScreenPosition {
    const pos = idToPosition(id);
    return this.gridToScreen(pos.row, pos.col);
  }

  /**
   * Convert screen position to grid position (approximate)
   */
  screenToGrid(x: number, y: number): { row: number; col: number } | null {
    const { cellWidth, cellHeight, centerX, centerY, isometricAngle } = this.gridConfig;
    
    // Reverse the center offset
    const offsetX = x - centerX;
    const offsetY = y - centerY;
    
    // Reverse rotation
    const angle = (-isometricAngle * Math.PI) / 180;
    const rotatedX = offsetX * Math.cos(angle) - offsetY * Math.sin(angle);
    const rotatedY = offsetX * Math.sin(angle) + offsetY * Math.cos(angle);
    
    // Reverse isometric projection
    const col = Math.floor((rotatedX / (cellWidth / 2) + rotatedY / (cellHeight / 4)) / 2);
    const row = Math.floor((rotatedY / (cellHeight / 4) - rotatedX / (cellWidth / 2)) / 2);
    
    // Validate bounds
    if (row < 0 || row > 3 || col < 0 || col > 3) {
      return null;
    }
    
    return { row, col };
  }

  /**
   * Get node ID from screen position
   */
  getNodeIdAtScreen(x: number, y: number): number | null {
    const gridPos = this.screenToGrid(x, y);
    if (!gridPos) return null;
    return positionToId(gridPos.row, gridPos.col);
  }

  /**
   * Get screen bounds for a node (for click detection)
   */
  getNodeBounds(id: number): { x: number; y: number; width: number; height: number } {
    const pos = this.idToScreen(id);
    const { cellWidth, cellHeight } = this.gridConfig;
    
    return {
      x: pos.x - cellWidth / 2,
      y: pos.y - cellHeight / 2,
      width: cellWidth,
      height: cellHeight
    };
  }

  // ============================================================================
  // State Management
  // ============================================================================

  /**
   * Import nodes state (from save)
   */
  importNodes(nodes: Node[]): void {
    for (const node of nodes) {
      const existing = this.getNode(node.id);
      if (existing) {
        existing.level = node.level;
        existing.stability = node.stability;
        existing.owner = node.owner;
        existing.energyAccumulated = node.energyAccumulated;
      }
    }
  }

  /**
   * Export nodes state (for save)
   */
  exportNodes(): Node[] {
    return this.nodes.map(n => ({ ...n }));
  }

  /**
   * Get grid configuration
   */
  getGridConfig(): GridConfig {
    return { ...this.gridConfig };
  }

  /**
   * Update grid configuration
   */
  setGridConfig(config: Partial<GridConfig>): void {
    this.gridConfig = { ...this.gridConfig, ...config };
  }
}

/**
 * Singleton instance for global access
 */
export const nodeSystem = new NodeSystem();
