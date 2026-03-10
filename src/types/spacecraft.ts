import { Room, RoomType } from './room';

/**
 * Grid position for a ship in the 4x4 grid
 */
export interface GridPosition {
  row: number; // 0-3
  col: number; // 0-3
}

/**
 * Spacecraft owner status
 */
export type SpacecraftOwner = 'neutral' | 'player';

/**
 * Ship mode - determines state and available actions
 */
export type ShipMode = 'derelict' | 'claimed' | 'mined' | 'station';

/**
 * Represents a single spacecraft in the 4x4 isometric grid
 * Each ship generates 10 Power per minute, capped at 1000 total
 */
export interface Spacecraft {
  /** Unique ID (0-15 for 4x4 grid) */
  id: number;
  /** Position in the grid */
  gridPosition: GridPosition;
  /** Ship class (1-3), affects Salvage payout */
  shipClass: 1 | 2 | 3;
  /** Hull integrity percentage (0-100) */
  hullIntegrity: number;
  /** Current owner of the ship */
  owner: SpacecraftOwner;
  /** Power accumulated on this ship (for idle generation) */
  powerAccumulated: number;
  /** Ship mode - determines available actions */
  mode: ShipMode;
  /** Maximum room slots (0 for derelict/mined, 2-4 for stations) */
  maxRooms: number;
  /** Rooms built on this ship (stations only) */
  rooms: Room[];
  /** Claim progress: number of qualifying runs/repairs (threshold: 3) */
  claimProgress: number;
  /** Whether ship is ready to claim (claimProgress >= 3) */
  claimable: boolean;
}

// Re-export Room types for convenience
export { Room, RoomType };

/**
 * Creates a new spacecraft with default values
 */
export function createSpacecraft(id: number, row: number, col: number): Spacecraft {
  return {
    id,
    gridPosition: { row, col },
    shipClass: 1,
    hullIntegrity: 100,
    owner: 'neutral',
    powerAccumulated: 0,
    mode: 'derelict',
    maxRooms: 0,
    rooms: [],
    claimProgress: 0,
    claimable: false
  };
}

/**
 * Converts a ship ID (0-15) to grid position
 */
export function idToPosition(id: number): GridPosition {
  return {
    row: Math.floor(id / 4),
    col: id % 4
  };
}

/**
 * Converts grid position to ship ID (0-15)
 */
export function positionToId(row: number, col: number): number {
  return row * 4 + col;
}

/**
 * Gets all neighboring ship IDs (orthogonal only)
 */
export function getNeighborIds(shipId: number): number[] {
  const { row, col } = idToPosition(shipId);
  const neighbors: number[] = [];
  
  if (row > 0) neighbors.push(positionToId(row - 1, col));
  if (row < 3) neighbors.push(positionToId(row + 1, col));
  if (col > 0) neighbors.push(positionToId(row, col - 1));
  if (col < 3) neighbors.push(positionToId(row, col + 1));
  
  return neighbors;
}

/**
 * Mine resources from a ship
 * Returns resources and marks ship as mined (disabled)
 */
export function mineShip(ship: Spacecraft): { metal: number; tech: number; components: number } {
  const resources = {
    metal: 50 * ship.shipClass,
    tech: 20 * ship.shipClass,
    components: 5 * ship.shipClass
  };
  
  ship.mode = 'mined';
  ship.owner = 'neutral';
  ship.maxRooms = 0;
  ship.rooms = [];
  
  return resources;
}

/**
 * Convert claimed ship to station
 * Unlocks room slots based on ship class
 */
export function convertToStation(ship: Spacecraft): boolean {
  if (ship.mode !== 'claimed' || ship.owner !== 'player') {
    return false;
  }
  
  ship.mode = 'station';
  ship.maxRooms = 2 + ship.shipClass; // Class 1: 3 rooms, Class 2: 4 rooms, Class 3: 5 rooms
  ship.rooms = [];
  
  return true;
}
