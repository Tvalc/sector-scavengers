/**
 * HubSystem
 *
 * Manages the 16-ship hub board, random spaceship population, and player selection state.
 * The board uses the SSSSBoards2 static image with clickable cell regions.
 */

import { RarityTier } from '../prizes/prize-types';

// ============================================================================
// Types
// ============================================================================

/**
 * Definition of a single hub cell (static configuration)
 */
export interface HubCellDefinition {
  /** Unique cell ID (0-15) */
  id: number;
  /** Center X position in screen coordinates (1920x1080) */
  centerX: number;
  /** Center Y position in screen coordinates (1920x1080) */
  centerY: number;
  /** Click detection radius in pixels */
  clickRadius: number;
}

/**
 * Runtime state of a hub cell
 */
export interface HubCellState {
  /** Cell definition reference */
  readonly definition: HubCellDefinition;
  /** Whether this cell has a spaceship */
  hasSpaceship: boolean;
  /** Rarity tier of the spaceship (null if no spaceship) */
  rarity: RarityTier | null;
  /** Whether the player has selected this cell */
  selected: boolean;
}

/**
 * Weighted entry for rarity selection
 */
interface RarityWeight {
  tier: RarityTier;
  weight: number;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Board layout configuration
 * SSSSSBoard image (1920x1080) - full canvas
 */
export const BOARD_WIDTH = 1920;
export const BOARD_HEIGHT = 1080;
export const CENTER_X = 960;
export const CENTER_Y = 540;
export const CLICK_RADIUS = 70;

/**
 * SHIP_POSITIONS - Single source of truth for all ship positions
 * 
 * These are screen coordinates for the 16 circle centers on SSSSSBoard board.
 * Board is drawn at (0, 0) filling the full canvas (1920x1080).
 * 
 * Ship ID layout (row-major):
 *   0  1  2  3   (row 0, top of diamond)
 *   4  5  6  7   (row 1)
 *   8  9 10 11   (row 2)
 *  12 13 14 15   (row 3, bottom of diamond)
 * 
 * Positions form an isometric diamond pattern matching the board's circular depressions.
 * USE THE DEBUGGER (press 'D' in IdleScene) to calibrate these positions!
 */
export const SHIP_POSITIONS: Array<{ x: number; y: number }> = [
  // Calibrated positions from debugger - SSSSSBoard (1920x1080)
  { x: 965, y: 174 },  // 0 - top center
  { x: 746, y: 290 },  // 1
  { x: 531, y: 405 },  // 2
  { x: 313, y: 522 },  // 3
  { x: 529, y: 645 },  // 4
  { x: 748, y: 530 },  // 5
  { x: 960, y: 416 },  // 6 - center
  { x: 1174, y: 288 }, // 7
  { x: 1394, y: 405 }, // 8
  { x: 1178, y: 526 }, // 9
  { x: 965, y: 647 },  // 10
  { x: 748, y: 765 },  // 11
  { x: 963, y: 884 },  // 12
  { x: 1181, y: 764 }, // 13
  { x: 1397, y: 651 }, // 14
  { x: 1607, y: 529 }, // 15 - right edge
];

/**
 * 16 hub cell definitions
 * Uses SHIP_POSITIONS as the single source of truth
 */
export const HUB_CELLS: HubCellDefinition[] = SHIP_POSITIONS.map((pos, id) => ({
  id,
  centerX: pos.x,
  centerY: pos.y,
  clickRadius: CLICK_RADIUS,
}));

/**
 * Get screen position for a ship by ID
 * Single source of truth - same positions used for rendering and click detection
 */
export function getShipPosition(id: number): { x: number; y: number } {
  if (id < 0 || id >= SHIP_POSITIONS.length) {
    return { x: CENTER_X, y: CENTER_Y };
  }
  return SHIP_POSITIONS[id];
}

/**
 * Rarity weights for random spaceship assignment
 * Task-specified: Common 40%, Uncommon 25%, Rare 15%, Epic 10%, Legendary 8%, Jackpot 2%
 */
const RARITY_WEIGHTS: RarityWeight[] = [
  { tier: RarityTier.Common, weight: 40 },
  { tier: RarityTier.Uncommon, weight: 25 },
  { tier: RarityTier.Rare, weight: 15 },
  { tier: RarityTier.Epic, weight: 10 },
  { tier: RarityTier.Legendary, weight: 8 },
  { tier: RarityTier.Jackpot, weight: 2 },
];

const TOTAL_RARITY_WEIGHT = RARITY_WEIGHTS.reduce((sum, rw) => sum + rw.weight, 0);

// ============================================================================
// HubSystem Class
// ============================================================================

/**
 * System managing hub board population and selection
 */
export class HubSystem {
  /** Cell states indexed by cell ID */
  private _cells: HubCellState[] = [];

  /** Number of spaceships currently on the board (set by populate) */
  private _spaceshipCount: number = 0;

  constructor() {
    // Initialize cell states from definitions
    this._cells = HUB_CELLS.map((def) => ({
      definition: def,
      hasSpaceship: false,
      rarity: null,
      selected: false,
    }));
  }

  // ==========================================================================
  // Properties
  // ==========================================================================

  /** Number of spaceships currently populated on the board */
  get spaceshipCount(): number {
    return this._spaceshipCount;
  }

  /** All cell states (read-only access) */
  get cells(): readonly HubCellState[] {
    return this._cells;
  }

  // ==========================================================================
  // Public Methods
  // ==========================================================================

  /**
   * Populate the board with random spaceships
   * - Clears all existing spaceships and selections
   * - Randomly picks 4-8 cells to have spaceships
   * - Assigns weighted rarity tiers to each spaceship
   */
  populate(): void {
    // Reset all cells
    for (const cell of this._cells) {
      cell.hasSpaceship = false;
      cell.rarity = null;
      cell.selected = false;
    }

    // Randomly decide how many spaceships (4-8)
    this._spaceshipCount = 4 + Math.floor(Math.random() * 5); // 4, 5, 6, 7, or 8

    // Pick random cells to have spaceships
    const availableCellIds = HUB_CELLS.map((c) => c.id);
    const selectedCellIds: number[] = [];

    for (let i = 0; i < this._spaceshipCount && availableCellIds.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * availableCellIds.length);
      const cellId = availableCellIds.splice(randomIndex, 1)[0];
      selectedCellIds.push(cellId);
    }

    // Assign rarity to each selected cell
    for (const cellId of selectedCellIds) {
      const rarity = this.pickRandomRarity();
      this._cells[cellId].hasSpaceship = true;
      this._cells[cellId].rarity = rarity;
    }
  }

  /**
   * Toggle selection on a cell
   * Only works if the cell has a spaceship
   * @param cellId The cell ID to toggle
   * @returns True if selection was toggled, false if cell has no spaceship
   */
  selectCell(cellId: number): boolean {
    if (cellId < 0 || cellId >= this._cells.length) {
      return false;
    }

    const cell = this._cells[cellId];
    if (!cell.hasSpaceship) {
      return false;
    }

    cell.selected = !cell.selected;
    return true;
  }

  /**
   * Clear all selections (keep spaceships)
   */
  clearSelection(): void {
    for (const cell of this._cells) {
      cell.selected = false;
    }
  }

  /**
   * Get array of selected cell IDs
   * @returns Array of cell IDs that are currently selected
   */
  getSelectedCellIds(): number[] {
    return this._cells.filter((c) => c.selected).map((c) => c.definition.id);
  }

  /**
   * Get count of currently selected cells
   */
  getSelectedCount(): number {
    return this._cells.filter((c) => c.selected).length;
  }

  /**
   * Get cell ID at a screen position
   * @param x Screen X coordinate (1920x1080 space)
   * @param y Screen Y coordinate (1920x1080 space)
   * @returns Cell ID if within click radius of a cell, null otherwise
   */
  getCellAtPosition(x: number, y: number): number | null {
    for (const cell of this._cells) {
      const dx = x - cell.definition.centerX;
      const dy = y - cell.definition.centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= cell.definition.clickRadius) {
        return cell.definition.id;
      }
    }
    return null;
  }

  /**
   * Get a specific cell state by ID
   * @param cellId Cell ID (0-15)
   * @returns Cell state or undefined if invalid ID
   */
  getCell(cellId: number): HubCellState | undefined {
    return this._cells[cellId];
  }

  // ==========================================================================
  // Private Methods
  // ==========================================================================

  /**
   * Pick a random rarity tier based on weighted probabilities
   */
  private pickRandomRarity(): RarityTier {
    let roll = Math.random() * TOTAL_RARITY_WEIGHT;

    for (const rw of RARITY_WEIGHTS) {
      roll -= rw.weight;
      if (roll <= 0) {
        return rw.tier;
      }
    }

    // Fallback to Common (should never reach here if weights are correct)
    return RarityTier.Common;
  }
}
