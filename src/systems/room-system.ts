/**
 * Room System
 * 
 * Manages room building and upgrades for station-type ships.
 * Provides bonuses and passive benefits.
 * 
 * Usage:
 *   const roomSystem = new RoomSystem(spacecraftSystem);
 *   roomSystem.buildRoom(shipId, 'crew_quarters');
 *   roomSystem.upgradeRoom(shipId, roomIndex);
 *   const bonuses = roomSystem.getShipBonuses(shipId);
 */

import { SpacecraftSystem } from './spacecraft-system';
import { Spacecraft } from '../types/spacecraft';
import { Room, RoomType, RoomBonuses, getRoomConfig, getUpgradeCost, aggregateBonuses } from '../types/room';
import { Resources, hasEnoughResources, subtractResources } from '../types/resources';

/**
 * Result of room build/upgrade operation
 */
export interface RoomOperationResult {
  success: boolean;
  message: string;
  cost?: Resources;
}

/**
 * RoomSystem - manages rooms on station ships
 */
export class RoomSystem {
  private spacecraftSystem: SpacecraftSystem;

  constructor(spacecraftSystem: SpacecraftSystem) {
    this.spacecraftSystem = spacecraftSystem;
  }

  // ============================================================================
  // Room Building
  // ============================================================================

  /**
   * Build a new room on a station ship
   * @param shipId - Ship ID (0-15)
   * @param roomType - Type of room to build
   * @param availableResources - Player's current resources
   * @returns Operation result with success status and cost
   */
  buildRoom(
    shipId: number,
    roomType: RoomType,
    availableResources: Resources
  ): RoomOperationResult {
    const ship = this.spacecraftSystem.getShip(shipId);
    
    // Validation
    if (!ship) {
      return { success: false, message: 'Ship not found' };
    }
    
    if (ship.mode !== 'station') {
      return { success: false, message: 'Can only build rooms on stations' };
    }
    
    if (ship.rooms.length >= ship.maxRooms) {
      return { success: false, message: 'No available room slots' };
    }
    
    // Check resources
    const config = getRoomConfig(roomType);
    const cost = config.buildCost;
    
    if (!hasEnoughResources(availableResources, cost)) {
      return { 
        success: false, 
        message: `Insufficient resources. Need: ${cost.metal} metal, ${cost.tech} tech, ${cost.components} components`
      };
    }
    
    // Build room
    const room: Room = {
      type: roomType,
      level: 1
    };
    
    ship.rooms.push(room);
    
    return {
      success: true,
      message: `Built ${config.name} on ship ${shipId}`,
      cost
    };
  }

  /**
   * Upgrade an existing room
   * @param shipId - Ship ID (0-15)
   * @param roomIndex - Index of room in ship's rooms array
   * @param availableResources - Player's current resources
   * @returns Operation result with success status and cost
   */
  upgradeRoom(
    shipId: number,
    roomIndex: number,
    availableResources: Resources
  ): RoomOperationResult {
    const ship = this.spacecraftSystem.getShip(shipId);
    
    // Validation
    if (!ship) {
      return { success: false, message: 'Ship not found' };
    }
    
    if (ship.mode !== 'station') {
      return { success: false, message: 'Can only upgrade rooms on stations' };
    }
    
    if (roomIndex < 0 || roomIndex >= ship.rooms.length) {
      return { success: false, message: 'Invalid room index' };
    }
    
    const room = ship.rooms[roomIndex];
    
    if (room.level >= 3) {
      const config = getRoomConfig(room.type);
      return { success: false, message: `${config.name} is already at maximum level` };
    }
    
    // Check resources
    const cost = getUpgradeCost(room);
    
    if (!hasEnoughResources(availableResources, cost)) {
      return {
        success: false,
        message: `Insufficient resources. Need: ${cost.metal} metal, ${cost.tech} tech, ${cost.components} components`
      };
    }
    
    // Upgrade room
    room.level = (room.level + 1) as 1 | 2 | 3;
    
    const config = getRoomConfig(room.type);
    return {
      success: true,
      message: `Upgraded ${config.name} to level ${room.level}`,
      cost
    };
  }

  /**
   * Remove a room from a station
   * @param shipId - Ship ID (0-15)
   * @param roomIndex - Index of room in ship's rooms array
   * @returns Operation result
   */
  removeRoom(shipId: number, roomIndex: number): RoomOperationResult {
    const ship = this.spacecraftSystem.getShip(shipId);
    
    if (!ship) {
      return { success: false, message: 'Ship not found' };
    }
    
    if (ship.mode !== 'station') {
      return { success: false, message: 'Can only remove rooms from stations' };
    }
    
    if (roomIndex < 0 || roomIndex >= ship.rooms.length) {
      return { success: false, message: 'Invalid room index' };
    }
    
    const room = ship.rooms[roomIndex];
    const config = getRoomConfig(room.type);
    
    ship.rooms.splice(roomIndex, 1);
    
    return {
      success: true,
      message: `Removed ${config.name} from ship ${shipId}`
    };
  }

  // ============================================================================
  // Room Queries
  // ============================================================================

  /**
   * Get available room slots on a ship
   * @param shipId - Ship ID (0-15)
   * @returns Number of available slots
   */
  getAvailableRoomSlots(shipId: number): number {
    const ship = this.spacecraftSystem.getShip(shipId);
    if (!ship || ship.mode !== 'station') return 0;
    return ship.maxRooms - ship.rooms.length;
  }

  /**
   * Calculate total bonuses from all rooms on a ship
   * @param shipId - Ship ID (0-15)
   * @returns Aggregated bonuses
   */
  getShipBonuses(shipId: number): RoomBonuses {
    const ship = this.spacecraftSystem.getShip(shipId);
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

  /**
   * Get total bonuses across all stations
   * @returns Aggregated bonuses from all player stations
   */
  getTotalBonuses(): RoomBonuses {
    const stations = this.spacecraftSystem.getStations();
    const allRooms: Room[] = [];
    
    for (const station of stations) {
      allRooms.push(...station.rooms);
    }
    
    return aggregateBonuses(allRooms);
  }

  /**
   * Get rooms on a specific ship
   * @param shipId - Ship ID (0-15)
   * @returns Array of rooms (copy)
   */
  getShipRooms(shipId: number): Room[] {
    const ship = this.spacecraftSystem.getShip(shipId);
    if (!ship) return [];
    return [...ship.rooms];
  }

  /**
   * Check if a ship can build a specific room type
   * @param shipId - Ship ID (0-15)
   * @param roomType - Room type to check
   * @param availableResources - Player's current resources
   * @returns true if ship can build this room
   */
  canBuildRoom(
    shipId: number,
    roomType: RoomType,
    availableResources: Resources
  ): boolean {
    const ship = this.spacecraftSystem.getShip(shipId);
    
    if (!ship || ship.mode !== 'station') return false;
    if (ship.rooms.length >= ship.maxRooms) return false;
    
    const config = getRoomConfig(roomType);
    return hasEnoughResources(availableResources, config.buildCost);
  }

  /**
   * Check if a room can be upgraded
   * @param shipId - Ship ID (0-15)
   * @param roomIndex - Index of room in ship's rooms array
   * @param availableResources - Player's current resources
   * @returns true if room can be upgraded
   */
  canUpgradeRoom(
    shipId: number,
    roomIndex: number,
    availableResources: Resources
  ): boolean {
    const ship = this.spacecraftSystem.getShip(shipId);
    
    if (!ship || ship.mode !== 'station') return false;
    if (roomIndex < 0 || roomIndex >= ship.rooms.length) return false;
    
    const room = ship.rooms[roomIndex];
    if (room.level >= 3) return false;
    
    const cost = getUpgradeCost(room);
    return hasEnoughResources(availableResources, cost);
  }
}
