/**
 * Rendering Helpers
 *
 * Core rendering functions for board, spaceships, and tooltips.
 */

import { MakkoEngine, IDisplay, StaticAsset } from '@makko/engine';
import type { HubSystem } from '../../systems/hub-system';
import type { SpaceshipVisual } from '../../ui/spaceship-visual';
import type { InventorySystem } from '../../systems/inventory-system';
import type { UIRenderer } from './render-ui';
import type { InputHandler } from './input-handler';
import { NodeDebugger } from './debug';
import { BOARD_ASSET_NAME, BOARD_WIDTH, BOARD_HEIGHT } from './constants';

/**
 * Render the game board
 */
export function renderBoard(display: IDisplay, boardAsset: StaticAsset | null): void {
  const asset = boardAsset || loadBoardAsset();
  if (!asset) return;
  
  display.drawImage(asset.image, 0, 0, BOARD_WIDTH, BOARD_HEIGHT);
}

/**
 * Render all spaceships on the board
 */
export function renderSpaceships(
  display: IDisplay,
  hubSystem: HubSystem,
  spaceshipVisuals: Map<number, SpaceshipVisual>,
  debug: NodeDebugger
): void {
  for (const cell of hubSystem.cells) {
    if (!cell.hasSpaceship) continue;
    
    const visual = spaceshipVisuals.get(cell.definition.id);
    if (visual) {
      visual.render(display, {
        selected: cell.selected,
        debug: debug.isEnabled
      });
    }
  }
}

/**
 * Render tooltip if hovering over an inventory item
 */
export function renderTooltipIfNeeded(
  display: IDisplay,
  inputHandler: InputHandler,
  inventorySystem: InventorySystem,
  uiRenderer: UIRenderer
): void {
  const hoveredSlot = inputHandler.getHoveredSlot();
  if (!hoveredSlot) return;
  
  const items = inventorySystem.getItemsByCategory(hoveredSlot.category);
  const item = items[hoveredSlot.index];
  if (!item) return;
  
  const mouseX = MakkoEngine.input.mouseX;
  const mouseY = MakkoEngine.input.mouseY;
  if (mouseX === undefined || mouseY === undefined) return;
  
  uiRenderer.renderTooltipForItem(display, mouseX, mouseY, item);
}

/**
 * Load board asset from manifest
 */
export function loadBoardAsset(): StaticAsset | null {
  if (MakkoEngine.hasStaticAsset(BOARD_ASSET_NAME)) {
    return MakkoEngine.staticAsset(BOARD_ASSET_NAME);
  }
  return null;
}
