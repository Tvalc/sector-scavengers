/**
 * Spacecraft Grid System
 *
 * Manages the 4x4 isometric grid of 16 spacecraft.
 * Handles ship classes, hull integrity, ownership, and visual positioning.
 *
 * Usage:
 *   const spacecraftSystem = new SpacecraftSystem();
 *   
 *   // Claim a ship
 *   spacecraftSystem.claimShip(5);
 *   
 *   // Upgrade a ship
 *   spacecraftSystem.upgradeShip(5);
 *   
 *   // Get ship at grid position
 *   const ship = spacecraftSystem.getShipAt(1, 2);
 */

import { Spacecraft, SpacecraftOwner, ShipMode, Room, RoomType, createSpacecraft, idToPosition, positionToId } from '../types/spacecraft';
import { Resources, addResources } from '../types/resources';
import { getRoomConfig, getRoomBonuses, aggregateBonuses, RoomBonuses } from '../types/room';

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
 * SpacecraftSystem - manages the 4x4 isometric grid
 */
export class SpacecraftSystem {
  private spacecraft: Spacecraft[] = [];
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
    this.gridConfig = { ...SpacecraftSystem.DEFAULT_CONFIG, ...config };
    this.initializeSpacecraft();
  }

  /**
   * Initialize all 16 spacecraft
   */
  private initializeSpacecraft(): void {
    this.spacecraft = [];
    for (let id = 0; id < 16; id++) {
      const pos = idToPosition(id);
      this.spacecraft.push(createSpacecraft(id, pos.row, pos.col));
    }
  }

  /**
   * Reset all ships to initial state
   */
  resetAll(): void {
    for (const ship of this.spacecraft) {
      ship.owner = 'neutral';
      ship.shipClass = 1;
      ship.hullIntegrity = 100;
      ship.powerAccumulated = 0;
    }
  }

  // ============================================================================
  // Ship Actions
  // ============================================================================

  /**
   * Take control of a ship (SCAN action)
   * @returns true if successful
   */
  claimShip(id: number): boolean {
    const ship = this.getShip(id);
    if (!ship || ship.owner === 'player') return false;
    
    ship.owner = 'player';
    return true;
  }

  /**
   * Upgrade a ship's class
   * @returns true if successful
   */
  upgradeShip(id: number): boolean {
    const ship = this.getShip(id);
    if (!ship || ship.shipClass >= 3) return false;
    
    ship.shipClass++;
    return true;
  }

  /**
   * Damage a ship's hull integrity
   * @param amount - Damage amount (default: 10)
   * @returns true if ship still has hull integrity, false if destroyed
   */
  damageHull(id: number, amount: number = 10): boolean {
    const ship = this.getShip(id);
    if (!ship) return false;
    
    ship.hullIntegrity = Math.max(0, ship.hullIntegrity - amount);
    
    // If hull integrity hits 0, ship resets to neutral
    if (ship.hullIntegrity <= 0) {
      this.resetShip(id);
      return false;
    }
    
    return true;
  }

  /**
   * Repair a ship's hull integrity
   * @param amount - Repair amount (default: 20)
   */
  repairHull(id: number, amount: number = 20): void {
    const ship = this.getShip(id);
    if (!ship) return;
    
    ship.hullIntegrity = Math.min(100, ship.hullIntegrity + amount);
  }

  /**
   * Reset a ship to neutral state
   */
  resetShip(id: number): void {
    const ship = this.getShip(id);
    if (!ship) return;
    
    ship.owner = 'neutral';
    ship.shipClass = 1;
    ship.hullIntegrity = 100;
    ship.powerAccumulated = 0;
  }

  /**
   * Set ship owner directly
   */
  setOwner(id: number, owner: SpacecraftOwner): void {
    const ship = this.getShip(id);
    if (ship) {
      ship.owner = owner;
    }
  }

  /**
   * Set ship hull integrity directly
   */
  setHullIntegrity(id: number, hullIntegrity: number): void {
    const ship = this.getShip(id);
    if (ship) {
      ship.hullIntegrity = Math.max(0, Math.min(100, hullIntegrity));
    }
  }

  /**
   * Set ship class directly
   */
  setShipClass(id: number, shipClass: number): void {
    const ship = this.getShip(id);
    if (ship) {
      ship.shipClass = Math.max(1, Math.min(3, shipClass)) as 1 | 2 | 3;
    }
  }

  /**
   * Mine a ship for resources
   * Strips ship completely, returns resources, marks as mined
   */
  mineShip(id: number): Resources | null {
    const ship = this.getShip(id);
    if (!ship || ship.mode === 'mined') return null;

    // Calculate resources based on ship class
    const resources: Resources = {
      metal: 50 * ship.shipClass,
      tech: 20 * ship.shipClass,
      components: 5 * ship.shipClass,
      powerCells: 0
    };

    // Mark ship as mined
    ship.mode = 'mined';
    ship.owner = 'neutral';
    ship.hullIntegrity = 0;
    ship.maxRooms = 0;
    ship.rooms = [];

    return resources;
  }

  /**
   * Convert claimed ship to a station
   * Unlocks room slots for building
   */
  convertToStation(id: number): boolean {
    const ship = this.getShip(id);
    if (!ship || ship.mode !== 'claimed') return false;

    // Convert to station with room slots
    ship.mode = 'station';
    ship.maxRooms = 2 + ship.shipClass; // 3-5 rooms based on class

    return true;
  }

  /**
   * Convert claimed ship to a station with requirements check
   * Returns detailed result with success status and error message
   */
  convertToStationWithRequirements(
    id: number,
    hasEngineer: boolean,
    hasEngineeringBay: boolean,
    powerCellCost: number,
    availablePowerCells: number
  ): { success: boolean; message: string } {
    const ship = this.getShip(id);
    
    if (!ship) {
      return { success: false, message: 'Ship not found' };
    }
    
    if (ship.mode !== 'claimed') {
      return { success: false, message: 'Ship must be claimed first' };
    }
    
    if (!hasEngineeringBay) {
      return { success: false, message: 'Engineering Bay required for conversion' };
    }
    
    if (!hasEngineer) {
      return { success: false, message: 'Engineer must be assigned to ship' };
    }
    
    if (availablePowerCells < powerCellCost) {
      return { success: false, message: `Need ${powerCellCost} power cells to convert` };
    }
    
    // Convert to station with room slots
    ship.mode = 'station';
    ship.maxRooms = 2 + ship.shipClass; // 3-5 rooms based on class

    return { success: true, message: `Ship ${id} converted to station!` };
  }

  /**
   * Get ships by mode
   */
  getShipsByMode(mode: ShipMode): Spacecraft[] {
    return this.spacecraft.filter(s => s.mode === mode);
  }

  /**
   * Get all derelict ships
   */
  getDerelictShips(): Spacecraft[] {
    return this.getShipsByMode('derelict');
  }

  /**
   * Get all stations
   */
  getStations(): Spacecraft[] {
    return this.getShipsByMode('station');
  }

  /**
   * Get all mined ships
   */
  getMinedShips(): Spacecraft[] {
    return this.getShipsByMode('mined');
  }

  // ============================================================================
  // Room Management
  // ============================================================================

  /**
   * Build a new room on a station
   * @returns true if successful
   */
  buildRoom(id: number, roomType: RoomType): boolean {
    const ship = this.getShip(id);
    if (!ship || ship.mode !== 'station') return false;
    if (ship.rooms.length >= ship.maxRooms) return false;

    ship.rooms.push({
      type: roomType,
      level: 1
    });

    return true;
  }

  /**
   * Check if ship has engineering bay room built
   */
  hasEngineeringBay(id: number): boolean {
    const ship = this.getShip(id);
    if (!ship) return false;
    return ship.rooms.some(room => room.type === 'engineering');
  }

  /**
   * Upgrade an existing room
   * @param roomIndex - Index of the room in the ship's rooms array
   * @returns true if successful
   */
  upgradeRoom(id: number, roomIndex: number): boolean {
    const ship = this.getShip(id);
    if (!ship || ship.mode !== 'station') return false;
    if (roomIndex < 0 || roomIndex >= ship.rooms.length) return false;

    const room = ship.rooms[roomIndex];
    const config = getRoomConfig(room.type);
    if (room.level >= config.maxLevel) return false;

    room.level = Math.min(config.maxLevel, room.level + 1) as 1 | 2 | 3;
    return true;
  }

  /**
   * Remove a room from a station
   * @param roomIndex - Index of the room to remove
   * @returns true if successful
   */
  removeRoom(id: number, roomIndex: number): boolean {
    const ship = this.getShip(id);
    if (!ship || ship.mode !== 'station') return false;
    if (roomIndex < 0 || roomIndex >= ship.rooms.length) return false;

    ship.rooms.splice(roomIndex, 1);
    return true;
  }

  /**
   * Get room at specific index
   */
  getRoom(id: number, roomIndex: number): Room | null {
    const ship = this.getShip(id);
    if (!ship) return null;
    return ship.rooms[roomIndex] || null;
  }

  /**
   * Get all rooms on a ship
   */
  getRooms(id: number): Room[] {
    const ship = this.getShip(id);
    if (!ship) return [];
    return [...ship.rooms];
  }

  // ============================================================================
  // Ship Getters
  // ============================================================================

  /**
   * Get a ship by ID
   */
  getShip(id: number): Spacecraft | undefined {
    return this.spacecraft.find(s => s.id === id);
  }

  /**
   * Get a ship by grid position
   */
  getShipAt(row: number, col: number): Spacecraft | undefined {
    const id = positionToId(row, col);
    return this.getShip(id);
  }

  /**
   * Get all spacecraft
   */
  getAllSpacecraft(): Spacecraft[] {
    return [...this.spacecraft];
  }

  /**
   * Get ships by owner
   */
  getShipsByOwner(owner: SpacecraftOwner): Spacecraft[] {
    return this.spacecraft.filter(s => s.owner === owner);
  }

  /**
   * Get all player-owned ships
   */
  getPlayerShips(): Spacecraft[] {
    return this.getShipsByOwner('player');
  }

  /**
   * Get all neutral ships
   */
  getNeutralShips(): Spacecraft[] {
    return this.getShipsByOwner('neutral');
  }

  /**
   * Get neighboring ships (orthogonal)
   */
  getNeighbors(id: number): Spacecraft[] {
    const ship = this.getShip(id);
    if (!ship) return [];

    const neighbors: Spacecraft[] = [];
    const { row, col } = ship.gridPosition;

    if (row > 0) neighbors.push(this.getShipAt(row - 1, col)!);
    if (row < 3) neighbors.push(this.getShipAt(row + 1, col)!);
    if (col > 0) neighbors.push(this.getShipAt(row, col - 1)!);
    if (col < 3) neighbors.push(this.getShipAt(row, col + 1)!);

    return neighbors.filter(s => s !== undefined);
  }

  /**
   * Count ships by owner
   */
  countByOwner(owner: SpacecraftOwner): number {
    return this.spacecraft.filter(s => s.owner === owner).length;
  }

  /**
   * Get total class of player ships
   */
  getTotalPlayerClass(): number {
    return this.getPlayerShips().reduce((sum, s) => sum + s.shipClass, 0);
  }

  /**
   * Get average hull integrity of player ships
   */
  getAveragePlayerHullIntegrity(): number {
    const playerShips = this.getPlayerShips();
    if (playerShips.length === 0) return 0;
    return playerShips.reduce((sum, s) => sum + s.hullIntegrity, 0) / playerShips.length;
  }

  /**
   * Get aggregated bonuses from all rooms on a ship
   */
  getShipBonuses(id: number): RoomBonuses {
    const ship = this.getShip(id);
    if (!ship || ship.mode !== 'station') {
      return {
        crewCapacity: 0,
        discoveryBonus: 0,
        hullRepairBonus: 0,
        crewEfficiency: 0,
        storageCapacity: 0,
        powerGeneration: 0
      };
    }
    return aggregateBonuses(ship.rooms);
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
   * Convert ship ID to screen position
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
   * Get ship ID from screen position
   */
  getShipIdAtScreen(x: number, y: number): number | null {
    const gridPos = this.screenToGrid(x, y);
    if (!gridPos) return null;
    return positionToId(gridPos.row, gridPos.col);
  }

  /**
   * Get screen bounds for a ship (for click detection)
   */
  getShipBounds(id: number): { x: number; y: number; width: number; height: number } {
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
   * Import spacecraft state (from save)
   */
  importSpacecraft(spacecraft: Spacecraft[]): void {
    for (const ship of spacecraft) {
      const existing = this.getShip(ship.id);
      if (existing) {
        existing.shipClass = ship.shipClass;
        existing.hullIntegrity = ship.hullIntegrity;
        existing.owner = ship.owner;
        existing.powerAccumulated = ship.powerAccumulated;
      }
    }
  }

  /**
   * Export spacecraft state (for save)
   */
  exportSpacecraft(): Spacecraft[] {
    return this.spacecraft.map(s => ({ ...s }));
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
export const spacecraftSystem = new SpacecraftSystem();
