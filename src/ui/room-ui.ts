/**
 * Room UI Components
 * 
 * UI for building and managing rooms on station ships.
 */

import type { IDisplay } from '@makko/engine';
import { Room, RoomType, RoomBonuses, getRoomConfig, getAllRoomTypes, getUpgradeCost } from '../types/room';
import { Resources } from '../types/resources';
import { COLORS, FONTS, LAYOUT } from './theme';
import { calculateConversionCost, getUnlockedRoomSlots } from '../config/economy-config';
import { ShipMode } from '../types/spacecraft';

/**
 * Room panel bounds
 */
export const ROOM_PANEL_BOUNDS = {
  x: 560,
  y: 200,
  width: 800,
  height: 680
};

/**
 * Room slot configuration
 */
const ROOM_SLOT_SIZE = 120;
const ROOM_SLOT_GAP = 20;
const ROOM_SLOTS_PER_ROW = 5;

/**
 * Conversion button bounds
 */
export const CONVERSION_BUTTON_BOUNDS = {
  x: ROOM_PANEL_BOUNDS.x + 40,
  y: ROOM_PANEL_BOUNDS.y + 120,
  width: ROOM_PANEL_BOUNDS.width - 80,
  height: 80
};

/**
 * Room type button configuration
 */
const ROOM_BUTTON_HEIGHT = 50;
const ROOM_BUTTON_GAP = 10;

/**
 * Render ship management panel
 * Shows conversion UI for claimed ships, room management for stations
 */
export function renderShipManagementPanel(
  display: IDisplay,
  shipId: number,
  shipMode: ShipMode,
  shipClass: 1 | 2 | 3,
  rooms: Room[],
  maxRooms: number,
  availableResources: Resources,
  selectedRoomType: RoomType | null,
  availablePowerCells: number,
  hasEngineer: boolean,
  hasEngineeringBay: boolean
): void {
  if (shipMode === 'claimed') {
    // Show conversion UI for claimed ships
    renderConversionPanel(
      display,
      shipId,
      shipClass,
      availablePowerCells,
      hasEngineer,
      hasEngineeringBay
    );
  } else if (shipMode === 'station') {
    // Show room management for stations
    renderRoomPanel(
      display,
      shipId,
      rooms,
      maxRooms,
      availableResources,
      selectedRoomType
    );
  }
}

/**
 * Render conversion panel for claimed ships
 */
function renderConversionPanel(
  display: IDisplay,
  shipId: number,
  shipClass: 1 | 2 | 3,
  availablePowerCells: number,
  hasEngineer: boolean,
  hasEngineeringBay: boolean
): void {
  const { x, y, width, height } = ROOM_PANEL_BOUNDS;
  
  // Background
  display.drawRoundRect(x, y, width, height, LAYOUT.borderRadiusLarge, {
    fill: COLORS.panelBg,
    alpha: 0.95
  });
  
  // Border
  display.drawRoundRect(x, y, width, height, LAYOUT.borderRadiusLarge, {
    stroke: COLORS.neonCyan,
    lineWidth: LAYOUT.borderWidthThick
  });
  
  // Title
  display.drawText(`SHIP ${shipId} - CONVERSION`, x + width / 2, y + 40, {
    font: FONTS.titleFont,
    fill: COLORS.neonCyan,
    align: 'center'
  });
  
  // Ship class info
  display.drawText(`Class ${shipClass} Vessel`, x + width / 2, y + 80, {
    font: FONTS.labelFont,
    fill: COLORS.white,
    align: 'center'
  });
  
  // Render conversion button
  const conversionCost = calculateConversionCost(shipClass);
  const unlockedSlots = getUnlockedRoomSlots(shipClass);
  const canConvert = hasEngineer && hasEngineeringBay && availablePowerCells >= conversionCost;
  
  renderConversionButton(
    display,
    CONVERSION_BUTTON_BOUNDS.x,
    CONVERSION_BUTTON_BOUNDS.y,
    CONVERSION_BUTTON_BOUNDS.width,
    CONVERSION_BUTTON_BOUNDS.height,
    shipClass,
    conversionCost,
    unlockedSlots,
    canConvert,
    hasEngineer,
    hasEngineeringBay,
    availablePowerCells
  );
  
  // Requirements text
  const reqY = CONVERSION_BUTTON_BOUNDS.y + CONVERSION_BUTTON_BOUNDS.height + 30;
  display.drawText('REQUIREMENTS:', x + 40, reqY, {
    font: FONTS.labelFont,
    fill: COLORS.neonMagenta
  });
  
  // Engineer requirement
  const engineerColor = hasEngineer ? COLORS.neonCyan : COLORS.dimText;
  const engineerText = hasEngineer ? '✓ Engineer Assigned' : '✗ Engineer Required';
  display.drawText(engineerText, x + 40, reqY + 30, {
    font: FONTS.bodyFont,
    fill: engineerColor
  });
  
  // Engineering Bay requirement
  const bayColor = hasEngineeringBay ? COLORS.neonCyan : COLORS.dimText;
  const bayText = hasEngineeringBay ? '✓ Engineering Bay Built' : '✗ Engineering Bay Required';
  display.drawText(bayText, x + 40, reqY + 55, {
    font: FONTS.bodyFont,
    fill: bayColor
  });
  
  // Power cells requirement
  const cellsColor = availablePowerCells >= conversionCost ? COLORS.neonCyan : COLORS.dimText;
  const cellsText = `✓ ${conversionCost} Power Cells (${availablePowerCells} available)`;
  display.drawText(cellsText, x + 40, reqY + 80, {
    font: FONTS.bodyFont,
    fill: cellsColor
  });
}

/**
 * Render conversion button
 */
function renderConversionButton(
  display: IDisplay,
  x: number,
  y: number,
  width: number,
  height: number,
  shipClass: 1 | 2 | 3,
  cost: number,
  unlockedSlots: number,
  canConvert: boolean,
  hasEngineer: boolean,
  hasEngineeringBay: boolean,
  availablePowerCells: number
): void {
  // Button background
  let fillColor: string = COLORS.panelBg;
  let alpha = 0.9;
  
  if (canConvert) {
    fillColor = COLORS.neonCyan;
    alpha = 0.2;
  }
  
  display.drawRoundRect(x, y, width, height, LAYOUT.borderRadius, {
    fill: fillColor,
    alpha
  });
  
  // Border
  const borderColor = canConvert ? COLORS.neonCyan : COLORS.dimText;
  display.drawRoundRect(x, y, width, height, LAYOUT.borderRadius, {
    stroke: borderColor,
    lineWidth: canConvert ? 3 : 1,
    alpha: canConvert ? 1 : 0.5
  });
  
  // Button text
  const textColor = canConvert ? COLORS.white : COLORS.dimText;
  display.drawText('CONVERT TO STATION', x + width / 2, y + 25, {
    font: FONTS.headingFont,
    fill: textColor,
    align: 'center',
    baseline: 'middle',
    alpha: canConvert ? 1 : 0.5
  });
  
  // Cost info
  display.drawText(`${cost} Power Cells`, x + width / 2, y + 45, {
    font: FONTS.bodyFont,
    fill: textColor,
    align: 'center',
    baseline: 'middle',
    alpha: canConvert ? 0.9 : 0.4
  });
  
  // Slots unlocked info
  display.drawText(`Unlocks ${unlockedSlots} room slots`, x + width / 2, y + 65, {
    font: FONTS.smallFont,
    fill: textColor,
    align: 'center',
    baseline: 'middle',
    alpha: canConvert ? 0.7 : 0.3
  });
}

/**
 * Render room management panel for a station ship
 */
export function renderRoomPanel(
  display: IDisplay,
  shipId: number,
  rooms: Room[],
  maxRooms: number,
  availableResources: Resources,
  selectedRoomType: RoomType | null
): void {
  const { x, y, width, height } = ROOM_PANEL_BOUNDS;
  
  // Background
  display.drawRoundRect(x, y, width, height, LAYOUT.borderRadiusLarge, {
    fill: COLORS.panelBg,
    alpha: 0.95
  });
  
  // Border
  display.drawRoundRect(x, y, width, height, LAYOUT.borderRadiusLarge, {
    stroke: COLORS.neonCyan,
    lineWidth: LAYOUT.borderWidthThick
  });
  
  // Title
  display.drawText(`STATION ${shipId} - ROOMS`, x + width / 2, y + 40, {
    font: FONTS.titleFont,
    fill: COLORS.neonCyan,
    align: 'center'
  });
  
  // Room slots header
  display.drawText(`Slots: ${rooms.length}/${maxRooms}`, x + width / 2, y + 80, {
    font: FONTS.labelFont,
    fill: COLORS.white,
    align: 'center'
  });
  
  // Render existing rooms
  renderExistingRooms(display, x + 40, y + 120, rooms);
  
  // Render available room types to build
  const buildY = y + 300;
  display.drawText('BUILD ROOM:', x + 40, buildY, {
    font: FONTS.labelFont,
    fill: COLORS.neonMagenta
  });
  
  renderRoomTypeButtons(display, x + 40, buildY + 30, width - 80, availableResources, selectedRoomType, rooms.length >= maxRooms);
}

/**
 * Render existing rooms in slots
 */
function renderExistingRooms(
  display: IDisplay,
  startX: number,
  startY: number,
  rooms: Room[]
): void {
  const config = { size: ROOM_SLOT_SIZE, gap: ROOM_SLOT_GAP, perRow: ROOM_SLOTS_PER_ROW };
  
  for (let i = 0; i < rooms.length; i++) {
    const room = rooms[i];
    const row = Math.floor(i / config.perRow);
    const col = i % config.perRow;
    const slotX = startX + col * (config.size + config.gap);
    const slotY = startY + row * (config.size + config.gap);
    
    renderRoomSlot(display, slotX, slotY, room);
  }
  
  // Show empty slots
  const maxSlots = 5; // Show up to 5 slots
  for (let i = rooms.length; i < maxSlots; i++) {
    const row = Math.floor(i / config.perRow);
    const col = i % config.perRow;
    const slotX = startX + col * (config.size + config.gap);
    const slotY = startY + row * (config.size + config.gap);
    
    renderEmptySlot(display, slotX, slotY);
  }
}

/**
 * Render a room slot
 */
function renderRoomSlot(
  display: IDisplay,
  x: number,
  y: number,
  room: Room
): void {
  const config = getRoomConfig(room.type);
  const size = ROOM_SLOT_SIZE;
  
  // Slot background
  display.drawRoundRect(x, y, size, size, LAYOUT.borderRadius, {
    fill: COLORS.neonCyan,
    alpha: 0.1
  });
  
  // Border
  display.drawRoundRect(x, y, size, size, LAYOUT.borderRadius, {
    stroke: COLORS.neonCyan,
    lineWidth: LAYOUT.borderWidth
  });
  
  // Room name (first word)
  const nameParts = config.name.split(' ');
  const shortName = nameParts[0];
  display.drawText(shortName, x + size / 2, y + 30, {
    font: FONTS.bodyFont,
    fill: COLORS.white,
    align: 'center',
    baseline: 'middle'
  });
  
  // Level indicator
  display.drawText(`LV ${room.level}`, x + size / 2, y + 55, {
    font: FONTS.smallFont,
    fill: COLORS.neonCyan,
    align: 'center',
    baseline: 'middle'
  });
  
  // Level dots
  const dotY = y + 75;
  for (let i = 0; i < 3; i++) {
    const filled = i < room.level;
    display.drawCircle(x + size / 2 - 15 + i * 15, dotY, 4, {
      fill: filled ? COLORS.neonCyan : COLORS.neutralGray,
      alpha: filled ? 1 : 0.3
    });
  }
  
  // Upgrade cost (if not maxed)
  if (room.level < 3) {
    const cost = getUpgradeCost(room);
    const costText = `${cost.metal}M ${cost.tech}T ${cost.components}C`;
    display.drawText(costText, x + size / 2, y + 95, {
      font: FONTS.tinyFont,
      fill: COLORS.dimText,
      align: 'center',
      baseline: 'middle'
    });
  }
}

/**
 * Render an empty room slot
 */
function renderEmptySlot(
  display: IDisplay,
  x: number,
  y: number
): void {
  const size = ROOM_SLOT_SIZE;
  
  // Slot background
  display.drawRoundRect(x, y, size, size, LAYOUT.borderRadius, {
    fill: COLORS.panelBg,
    alpha: 0.5
  });
  
  // Dashed border
  display.drawRoundRect(x, y, size, size, LAYOUT.borderRadius, {
    stroke: COLORS.dimText,
    lineWidth: 1,
    alpha: 0.5
  });
  
  // Empty indicator
  display.drawText('EMPTY', x + size / 2, y + size / 2, {
    font: FONTS.smallFont,
    fill: COLORS.dimText,
    align: 'center',
    baseline: 'middle',
    alpha: 0.5
  });
}

/**
 * Render room type selection buttons
 */
function renderRoomTypeButtons(
  display: IDisplay,
  x: number,
  y: number,
  width: number,
  resources: Resources,
  selectedType: RoomType | null,
  atMaxRooms: boolean
): void {
  const roomTypes = getAllRoomTypes();
  const buttonWidth = width;
  
  for (let i = 0; i < roomTypes.length; i++) {
    const roomType = roomTypes[i];
    const config = getRoomConfig(roomType);
    const buttonY = y + i * (ROOM_BUTTON_HEIGHT + ROOM_BUTTON_GAP);
    
    const canAfford = !atMaxRooms && 
      resources.metal >= config.buildCost.metal &&
      resources.tech >= config.buildCost.tech &&
      resources.components >= config.buildCost.components;
    
    const isSelected = selectedType === roomType;
    const isDisabled = !canAfford || atMaxRooms;
    
    renderRoomButton(
      display,
      x,
      buttonY,
      buttonWidth,
      config,
      canAfford,
      isSelected,
      isDisabled
    );
  }
}

/**
 * Render a single room type button
 */
function renderRoomButton(
  display: IDisplay,
  x: number,
  y: number,
  width: number,
  config: ReturnType<typeof getRoomConfig>,
  canAfford: boolean,
  isSelected: boolean,
  isDisabled: boolean
): void {
  const height = ROOM_BUTTON_HEIGHT;
  
  // Button background
  let fillColor: string = COLORS.panelBg;
  let alpha = 0.9;
  
  if (isSelected) {
    fillColor = COLORS.neonMagenta;
    alpha = 0.3;
  } else if (canAfford) {
    fillColor = COLORS.neutralGray;
    alpha = 0.5;
  }
  
  display.drawRoundRect(x, y, width, height, LAYOUT.borderRadius, {
    fill: fillColor,
    alpha
  });
  
  // Border
  const borderColor = isDisabled ? COLORS.dimText : 
                      isSelected ? COLORS.neonMagenta : COLORS.neonCyan;
  display.drawRoundRect(x, y, width, height, LAYOUT.borderRadius, {
    stroke: borderColor,
    lineWidth: isSelected ? 3 : 1,
    alpha: isDisabled ? 0.3 : 1
  });
  
  // Room name and cost
  const textColor = isDisabled ? COLORS.dimText : COLORS.white;
  const costText = `${config.buildCost.metal}M ${config.buildCost.tech}T ${config.buildCost.components}C`;
  const text = `${config.name} (${costText})`;
  
  display.drawText(text, x + 15, y + height / 2, {
    font: FONTS.bodyFont,
    fill: textColor,
    align: 'left',
    baseline: 'middle',
    alpha: isDisabled ? 0.5 : 1
  });
  
  // Description on right side
  display.drawText(config.description, x + width - 15, y + height / 2, {
    font: FONTS.smallFont,
    fill: textColor,
    align: 'right',
    baseline: 'middle',
    alpha: isDisabled ? 0.3 : 0.7
  });
}

/**
 * Check if conversion button is clicked
 * Returns ship ID if clicked, null otherwise
 */
export function checkConversionButtonClick(
  mouseX: number,
  mouseY: number,
  shipMode: ShipMode,
  shipClass: 1 | 2 | 3,
  availablePowerCells: number,
  hasEngineer: boolean,
  hasEngineeringBay: boolean
): boolean {
  // Only show for claimed ships
  if (shipMode !== 'claimed') return false;
  
  const conversionCost = calculateConversionCost(shipClass);
  const canConvert = hasEngineer && hasEngineeringBay && availablePowerCells >= conversionCost;
  
  if (!canConvert) return false;
  
  const bounds = CONVERSION_BUTTON_BOUNDS;
  
  return mouseX >= bounds.x && mouseX <= bounds.x + bounds.width &&
         mouseY >= bounds.y && mouseY <= bounds.y + bounds.height;
}

/**
 * Check if a room type button is clicked
 */
export function checkRoomButtonClick(
  mouseX: number,
  mouseY: number,
  resources: Resources,
  atMaxRooms: boolean
): RoomType | null {
  const { x, y, width } = ROOM_PANEL_BOUNDS;
  const roomTypes = getAllRoomTypes();
  const buttonX = x + 40;
  const buttonStartY = y + 330;
  
  for (let i = 0; i < roomTypes.length; i++) {
    const roomType = roomTypes[i];
    const config = getRoomConfig(roomType);
    const buttonY = buttonStartY + i * (ROOM_BUTTON_HEIGHT + ROOM_BUTTON_GAP);
    
    const canAfford = !atMaxRooms &&
      resources.metal >= config.buildCost.metal &&
      resources.tech >= config.buildCost.tech &&
      resources.components >= config.buildCost.components;
    
    if (!canAfford || atMaxRooms) continue;
    
    // Check bounds
    if (mouseX >= buttonX && mouseX <= buttonX + width - 80 &&
        mouseY >= buttonY && mouseY <= buttonY + ROOM_BUTTON_HEIGHT) {
      return roomType;
    }
  }
  
  return null;
}

/**
 * Check if a room slot is clicked (for upgrading)
 */
export function checkRoomSlotClick(
  mouseX: number,
  mouseY: number,
  rooms: Room[]
): number | null {
  const { x, y } = ROOM_PANEL_BOUNDS;
  const startX = x + 40;
  const startY = y + 120;
  const size = ROOM_SLOT_SIZE;
  const gap = ROOM_SLOT_GAP;
  const perRow = ROOM_SLOTS_PER_ROW;
  
  for (let i = 0; i < rooms.length; i++) {
    const row = Math.floor(i / perRow);
    const col = i % perRow;
    const slotX = startX + col * (size + gap);
    const slotY = startY + row * (size + gap);
    
    if (mouseX >= slotX && mouseX <= slotX + size &&
        mouseY >= slotY && mouseY <= slotY + size) {
      return i;
    }
  }
  
  return null;
}
