/**
 * Grid position for a node in the 4x4 grid
 */
export interface GridPosition {
  row: number; // 0-3
  col: number; // 0-3
}

/**
 * Node owner status
 */
export type NodeOwner = 'neutral' | 'player';

/**
 * Represents a single node in the 4x4 isometric grid
 * Each node generates 10 Energy per minute, capped at 1000 total
 */
export interface Node {
  /** Unique ID (0-15 for 4x4 grid) */
  id: number;
  /** Position in the grid */
  gridPosition: GridPosition;
  /** Node level (1-3), affects Extract payout */
  level: number;
  /** Stability percentage (0-100) */
  stability: number;
  /** Current owner of the node */
  owner: NodeOwner;
  /** Energy accumulated on this node (for idle generation) */
  energyAccumulated: number;
}

/**
 * Creates a new node with default values
 */
export function createNode(id: number, row: number, col: number): Node {
  return {
    id,
    gridPosition: { row, col },
    level: 1,
    stability: 100,
    owner: 'neutral',
    energyAccumulated: 0
  };
}

/**
 * Converts a node ID (0-15) to grid position
 */
export function idToPosition(id: number): GridPosition {
  return {
    row: Math.floor(id / 4),
    col: id % 4
  };
}

/**
 * Converts grid position to node ID (0-15)
 */
export function positionToId(row: number, col: number): number {
  return row * 4 + col;
}

/**
 * Gets all neighboring node IDs (orthogonal only)
 */
export function getNeighborIds(nodeId: number): number[] {
  const { row, col } = idToPosition(nodeId);
  const neighbors: number[] = [];
  
  if (row > 0) neighbors.push(positionToId(row - 1, col));
  if (row < 3) neighbors.push(positionToId(row + 1, col));
  if (col > 0) neighbors.push(positionToId(row, col - 1));
  if (col < 3) neighbors.push(positionToId(row, col + 1));
  
  return neighbors;
}
