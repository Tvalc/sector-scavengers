/**
 * Ship Conversion Logic
 *
 * Handles ship-to-station conversion requirements, cost calculation, and execution.
 */

import { MakkoEngine, IDisplay } from '@makko/engine';
import type { Game } from '../../game/game';
import type { InputHandler } from './input-handler';
import { hasAssignedEngineer } from '../../systems/crew-bonus-system';
import { calculateConversionCost, getUnlockedRoomSlots } from '../../config/economy-config';
import { checkConversionButtonClick, ROOM_PANEL_BOUNDS } from '../../ui/room-ui';

export interface ConversionResult {
  success: boolean;
  message: string;
  duration: number;
}

/**
 * Handle ship management panel input
 * Returns true if input was consumed
 */
export function handleShipManagementInput(
  game: Game,
  inputHandler: InputHandler,
  onConversion: (result: ConversionResult) => void
): boolean {
  const input = MakkoEngine.input;
  const mouseX = input.mouseX;
  const mouseY = input.mouseY;
  
  if (mouseX === undefined || mouseY === undefined) return false;
  
  const shipId = inputHandler.getSelectedShipId();
  if (shipId === null) return false;
  
  const ship = game.getShip(shipId);
  if (!ship) return false;
  
  // Check for conversion button click
  if (ship.mode === 'claimed') {
    const cryoState = game.state.cryoState;
    const hasEngineer = hasAssignedEngineer(cryoState, shipId);
    const hasEngineeringBay = ship.rooms.some(r => r.type === 'engineering');
    const availablePowerCells = game.state.resources.powerCells;
    
    const clicked = checkConversionButtonClick(
      mouseX,
      mouseY,
      ship.mode,
      ship.shipClass,
      availablePowerCells,
      hasEngineer,
      hasEngineeringBay
    );
    
    if (clicked) {
      const result = performShipConversion(game, shipId);
      onConversion(result);
      return true;
    }
  }
  
  // Check for click outside panel to close
  if (input.isMousePressed(0)) {
    const bounds = ROOM_PANEL_BOUNDS;
    const clickedOutside = 
      mouseX < bounds.x || 
      mouseX > bounds.x + bounds.width ||
      mouseY < bounds.y || 
      mouseY > bounds.y + bounds.height;
    
    if (clickedOutside) {
      inputHandler.setShipManagementShowing(false);
      return true;
    }
  }
  
  return false;
}

/**
 * Perform ship conversion with validation
 */
export function performShipConversion(game: Game, shipId: number): ConversionResult {
  const ship = game.getShip(shipId);
  if (!ship || ship.mode !== 'claimed') {
    return {
      success: false,
      message: 'Invalid ship for conversion',
      duration: 3000
    };
  }
  
  const cryoState = game.state.cryoState;
  const hasEngineer = hasAssignedEngineer(cryoState, shipId);
  const hasEngineeringBay = ship.rooms.some(r => r.type === 'engineering');
  const conversionCost = calculateConversionCost(ship.shipClass);
  const availablePowerCells = game.state.resources.powerCells;
  
  // Validate requirements
  if (!hasEngineeringBay) {
    console.log('[Conversion] Failed: Engineering Bay required');
    return {
      success: false,
      message: 'Engineering Bay required for conversion',
      duration: 3000
    };
  }
  
  if (!hasEngineer) {
    console.log('[Conversion] Failed: Engineer required');
    return {
      success: false,
      message: 'Engineer must be assigned to ship',
      duration: 3000
    };
  }
  
  if (availablePowerCells < conversionCost) {
    console.log(`[Conversion] Failed: Need ${conversionCost} power cells`);
    return {
      success: false,
      message: `Need ${conversionCost} power cells to convert`,
      duration: 3000
    };
  }
  
  // Perform conversion
  game.state.resources.powerCells -= conversionCost;
  const unlockedSlots = getUnlockedRoomSlots(ship.shipClass);
  ship.mode = 'station';
  ship.maxRooms = unlockedSlots;
  
  console.log(`[Conversion] Ship ${shipId} converted to station (${conversionCost} power cells, ${unlockedSlots} slots)`);
  
  // Save state
  game.saveState();
  
  return {
    success: true,
    message: `Ship converted to station! ${unlockedSlots} room slots unlocked`,
    duration: 3000
  };
}

/**
 * Render conversion message toast
 */
export function renderConversionMessage(
  display: IDisplay,
  message: string | null,
  timer: number
): void {
  if (!message || timer <= 0) return;
  
  const messageWidth = 600;
  const messageHeight = 60;
  const x = (display.width - messageWidth) / 2;
  const y = display.height - 150;
  
  display.drawRoundRect(x, y, messageWidth, messageHeight, 10, {
    fill: '#1a1a2e',
    alpha: 0.95
  });
  
  display.drawRoundRect(x, y, messageWidth, messageHeight, 10, {
    stroke: '#00ffff',
    lineWidth: 2
  });
  
  display.drawText(message, x + messageWidth / 2, y + messageHeight / 2, {
    font: 'bold 18px Arial',
    fill: '#ffffff',
    align: 'center',
    baseline: 'middle'
  });
}
