/**
 * Energy Display Rendering
 *
 * Battery core display and efficiency bonus badge.
 */

import { IDisplay } from '@makko/engine';
import { COLORS, FONTS, LAYOUT } from '../../../ui/theme';
import { BatteryCoreDisplay } from '../../../ui/visual-components';
import { getGlobalCrewEfficiencyBonus } from '../../../systems/crew-bonus-system';
import type { CryoState } from '../../../systems/cryo-system';

/**
 * Creates and manages the energy display component
 */
export class EnergyDisplay {
  private batteryDisplay: BatteryCoreDisplay;

  constructor() {
    this.batteryDisplay = new BatteryCoreDisplay(30, 30, 400, 40);
  }

  /** Render energy display */
  render(display: IDisplay, energy: number, cap: number, rate: number): void {
    this.batteryDisplay.render(display, Math.floor(energy), Math.floor(cap), `+${rate.toFixed(1)}/s`);
  }

  /** Render medic efficiency bonus badge */
  renderEfficiencyBonus(display: IDisplay, cryoState: CryoState): void {
    const bonus = getGlobalCrewEfficiencyBonus(cryoState);
    if (bonus <= 0) return;

    const badgeX = 30;
    const badgeY = 90;
    const badgeWidth = 170;
    const badgeHeight = 30;

    display.drawRoundRect(badgeX, badgeY, badgeWidth, badgeHeight, LAYOUT.borderRadius, {
      fill: COLORS.neonMagenta,
      alpha: 0.2
    });
    display.drawRoundRect(badgeX, badgeY, badgeWidth, badgeHeight, LAYOUT.borderRadius, {
      stroke: COLORS.neonMagenta,
      lineWidth: LAYOUT.borderWidth,
      alpha: 0.8
    });

    const percentage = Math.round(bonus * 100);
    display.drawText(`+${percentage}% EFFICIENCY`, badgeX + LAYOUT.padding, badgeY + 20, {
      font: FONTS.smallFont,
      fill: COLORS.neonMagenta
    });
  }
}
