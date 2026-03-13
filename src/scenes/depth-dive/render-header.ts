/**
 * Depth Dive Header and Minimap Rendering
 */

import { MakkoEngine } from '@makko/engine';
import { MAX_ROUNDS, COLLAPSE_PROBABILITY } from '../../types/state';
import { COLORS, FONTS, LAYOUT } from '../../ui/theme';
import { BatteryCoreDisplay, DangerMeter, ShipVisual, ShipVisualOptions } from '../../ui/visual-components';
import type { Game } from '../../game/game';

/** Creates and configures header visual components */
export function createHeaderComponents(): {
  batteryDisplay: BatteryCoreDisplay;
  dangerMeter: DangerMeter;
} {
  return {
    batteryDisplay: new BatteryCoreDisplay(50, 30, 200, 24),
    dangerMeter: new DangerMeter(960 - 150, 80, 300, 20, 35)
  };
}

export function renderHeader(
  display: typeof MakkoEngine.display,
  game: Game,
  components: { batteryDisplay: BatteryCoreDisplay; dangerMeter: DangerMeter }
): void {
  const run = game.state.currentRun;
  if (!run) return;

  renderRoundCounter(display, run);
  renderShields(display, run);
  renderDangerMeter(display, components.dangerMeter);
  renderHullBar(display, game);
  renderEnergyDisplay(display, game, run, components.batteryDisplay);
}

function renderRoundCounter(
  display: typeof MakkoEngine.display,
  run: NonNullable<typeof Game.prototype.state.currentRun>
): void {
  display.drawText(`ROUND ${run.round}/${MAX_ROUNDS}`, 960, 50, {
    font: FONTS.titleFont,
    fill: COLORS.neonMagenta,
    align: 'center'
  });
}

function renderDangerMeter(
  display: typeof MakkoEngine.display,
  dangerMeter: DangerMeter
): void {
  const collapseRisk = COLLAPSE_PROBABILITY * 100;
  dangerMeter.render(display, collapseRisk);
}

function renderShields(
  display: typeof MakkoEngine.display,
  run: NonNullable<typeof Game.prototype.state.currentRun>
): void {
  const MAX_SHIELDS = 5;
  display.drawText(`SHIELDS: ${run.shields}/${MAX_SHIELDS}`, 700, 50, {
    font: FONTS.headingFont,
    fill: COLORS.neonCyan,
    align: 'center'
  });
}

function renderHullBar(
  display: typeof MakkoEngine.display,
  game: Game
): void {
  const hullBarX = 1200;
  const hullBarY = 45;
  const hullBarWidth = 300;
  const hullBarHeight = 20;

  const playerShips = game.state.spacecraft.filter(s => s.owner === 'player');
  const avgHullIntegrity = playerShips.length > 0
    ? playerShips.reduce((sum, s) => sum + s.hullIntegrity, 0) / playerShips.length
    : 100;

  // Background
  display.drawRoundRect(hullBarX, hullBarY, hullBarWidth, hullBarHeight, hullBarHeight / 2, {
    fill: COLORS.panelBg,
    alpha: 0.8
  });

  // Fill
  const fillWidth = hullBarWidth * (avgHullIntegrity / 100);
  if (fillWidth > 0) {
    const fillColor = avgHullIntegrity > 50 ? COLORS.successGreen : 
                      avgHullIntegrity > 25 ? COLORS.warningYellow : COLORS.warningRed;
    display.drawRoundRect(hullBarX, hullBarY, Math.max(fillWidth, hullBarHeight), hullBarHeight, hullBarHeight / 2, {
      fill: fillColor,
      alpha: 0.9
    });
  }

  // Border
  display.drawRoundRect(hullBarX, hullBarY, hullBarWidth, hullBarHeight, hullBarHeight / 2, {
    stroke: COLORS.dimText,
    lineWidth: 1,
    alpha: 0.5
  });
}

function renderEnergyDisplay(
  display: typeof MakkoEngine.display,
  game: Game,
  run: NonNullable<typeof Game.prototype.state.currentRun>,
  batteryDisplay: BatteryCoreDisplay
): void {
  const energy = Math.floor(game.state.energy);
  const energyCap = 1000;
  const extractedLabel = `EXTRACTED: ${Math.floor(run.extractedRewards)}`;
  batteryDisplay.render(display, energy, energyCap, extractedLabel);
}

export function renderMiniMap(
  display: typeof MakkoEngine.display,
  game: Game
): void {
  const mapX = 1500;
  const mapY = 100;
  const mapWidth = 400;
  const mapHeight = 300;

  // Background
  display.drawRoundRect(mapX, mapY, mapWidth, mapHeight, LAYOUT.borderRadius, {
    fill: COLORS.panelBg,
    alpha: 0.5
  });

  // Border
  display.drawRoundRect(mapX, mapY, mapWidth, mapHeight, LAYOUT.borderRadius, {
    stroke: COLORS.neonCyan,
    lineWidth: LAYOUT.borderWidth,
    alpha: 0.5
  });

  // Title
  display.drawText('SALVAGE SECTOR', mapX + mapWidth / 2, mapY + 20, {
    font: FONTS.bodyFont,
    fill: COLORS.dimText,
    align: 'center'
  });

  renderShipsOnMinimap(display, game, mapX, mapY, mapWidth, mapHeight);
}

function renderShipsOnMinimap(
  display: typeof MakkoEngine.display,
  game: Game,
  mapX: number,
  mapY: number,
  mapWidth: number,
  mapHeight: number
): void {
  const cellWidth = mapWidth / 4;
  const cellHeight = (mapHeight - 40) / 4;

  for (const ship of game.state.spacecraft) {
    const shipX = mapX + (ship.gridPosition.col * cellWidth) + cellWidth / 2;
    const shipY = mapY + 40 + (ship.gridPosition.row * cellHeight) + cellHeight / 2;
    const shipRadius = 8 + (ship.shipClass - 1) * 3;

    const shipVisual = new ShipVisual(shipX, shipY, shipRadius, ship.shipClass);
    const options: ShipVisualOptions = {
      owner: ship.owner === 'player' ? 'player' : 'neutral',
      hullIntegrity: ship.hullIntegrity,
      hovered: false,
      mini: true
    };
    shipVisual.renderShip(display, options);
  }
}

export function renderActionResult(
  display: typeof MakkoEngine.display,
  message: string,
  success: boolean
): void {
  const { width } = display;
  const y = 550;
  const color = success ? COLORS.successGreen : COLORS.warningRed;

  display.drawRoundRect(width / 2 - 300, y - 15, 600, 40, LAYOUT.borderRadius, {
    fill: color,
    alpha: 0.2
  });

  display.drawText(message, width / 2, y, {
    font: FONTS.bodyFont,
    fill: color,
    align: 'center'
  });
}
