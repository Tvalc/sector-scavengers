/**
 * Party Panel Rendering
 *
 * Party selection panel with lead and companion slots.
 */

import { IDisplay } from '@makko/engine';
import { COLORS, FONTS, LAYOUT } from '../../../ui/theme';
import { CrewMember, getAuthoredRecruit, CrewRole, getRoleName } from '../../../types/crew';
import { PARTY_PANEL } from './constants';

/** Role colors for party portraits */
const ROLE_COLORS: Record<CrewRole, string> = {
  [CrewRole.Engineer]: COLORS.successGreen,
  [CrewRole.Scientist]: COLORS.neonCyan,
  [CrewRole.Medic]: COLORS.neonMagenta,
  [CrewRole.Scavenger]: COLORS.warningYellow
};

/**
 * Renders party selection panel
 */
export class PartyPanel {
  /** Render party panel */
  render(
    display: IDisplay,
    selectedLead: string | null,
    companionSlots: [string | null, string | null],
    awakenedAuthoredRecruits: CrewMember[]
  ): void {
    const panel = PARTY_PANEL;

    this.renderPanelBackground(display);

    display.drawText('RUN PARTY', panel.x + LAYOUT.padding, panel.y + panel.headerY, {
      font: FONTS.smallFont,
      fill: COLORS.neonCyan
    });

    this.renderLeadSlot(display, selectedLead, awakenedAuthoredRecruits);
    this.renderCompanionSlots(display, companionSlots, awakenedAuthoredRecruits);
    this.renderSummary(display, selectedLead, companionSlots);
  }

  /** Render party selector dropdown */
  renderSelector(
    display: IDisplay,
    slotType: 'lead' | 'companion0' | 'companion1',
    awakenedRecruits: CrewMember[],
    selectedLead: string | null,
    companionSlots: [string | null, string | null]
  ): void {
    const availableRecruits = this.getAvailableRecruits(slotType, awakenedRecruits, selectedLead, companionSlots);
    const panel = PARTY_PANEL;
    const dropdownWidth = 200;
    const dropdownX = panel.x + panel.width + 10;
    const dropdownY = panel.y + (slotType === 'lead' ? panel.leadSlotY : panel.companionSlotY);
    const itemHeight = 40;
    const dropdownHeight = (availableRecruits.length + 1) * itemHeight + 20;

    this.renderSelectorBackground(display, dropdownX, dropdownY, dropdownWidth, dropdownHeight, slotType);
    this.renderNoneOption(display, dropdownX, dropdownY);
    this.renderRecruitOptions(display, dropdownX, dropdownY, itemHeight, availableRecruits);
  }

  /** Get bounds for party slots */
  getSlotBounds(slotType: 'lead' | 'companion0' | 'companion1'): { x: number; y: number; width: number; height: number } {
    const panel = PARTY_PANEL;
    const leadCenterX = panel.x + panel.width / 2;

    if (slotType === 'lead') {
      const size = panel.leadSlotSize;
      return {
        x: leadCenterX - size / 2,
        y: panel.y + panel.leadSlotY,
        width: size,
        height: size + 20
      };
    } else {
      const size = panel.companionSlotSize;
      const compSpacing = 70;
      const startX = leadCenterX - compSpacing - size / 2;
      const offsetX = slotType === 'companion0' ? 0 : compSpacing + 10;

      return {
        x: startX + offsetX,
        y: panel.y + panel.companionSlotY,
        width: size,
        height: size + 20
      };
    }
  }

  /** Get bounds for selector items */
  getSelectorItemBounds(
    slotType: 'lead' | 'companion0' | 'companion1',
    awakenedRecruits: CrewMember[],
    selectedLead: string | null,
    companionSlots: [string | null, string | null]
  ): Array<{ authoredId: string | null; bounds: { x: number; y: number; width: number; height: number } }> {
    const availableRecruits = this.getAvailableRecruits(slotType, awakenedRecruits, selectedLead, companionSlots);
    const panel = PARTY_PANEL;
    const dropdownWidth = 200;
    const dropdownX = panel.x + panel.width + 10;
    const dropdownY = panel.y + (slotType === 'lead' ? panel.leadSlotY : panel.companionSlotY);
    const itemHeight = 40;

    const items: Array<{ authoredId: string | null; bounds: { x: number; y: number; width: number; height: number } }> = [];

    items.push({
      authoredId: null,
      bounds: { x: dropdownX + 5, y: dropdownY + 35, width: dropdownWidth - 10, height: itemHeight - 4 }
    });

    availableRecruits.forEach((crew, index) => {
      items.push({
        authoredId: crew.authoredId!,
        bounds: {
          x: dropdownX + 5,
          y: dropdownY + 35 + (index + 1) * itemHeight,
          width: dropdownWidth - 10,
          height: itemHeight - 4
        }
      });
    });

    return items;
  }

  /** Get available recruits for a slot */
  private getAvailableRecruits(
    slotType: 'lead' | 'companion0' | 'companion1',
    awakenedRecruits: CrewMember[],
    selectedLead: string | null,
    companionSlots: [string | null, string | null]
  ): CrewMember[] {
    return awakenedRecruits.filter(c => {
      if (slotType === 'lead' && companionSlots.includes(c.authoredId!)) return false;
      if (slotType === 'companion0' && (selectedLead === c.authoredId || companionSlots[1] === c.authoredId)) return false;
      if (slotType === 'companion1' && (selectedLead === c.authoredId || companionSlots[0] === c.authoredId)) return false;
      return true;
    });
  }

  /** Render panel background */
  private renderPanelBackground(display: IDisplay): void {
    const panel = PARTY_PANEL;
    display.drawRoundRect(panel.x, panel.y, panel.width, panel.height, LAYOUT.borderRadius, {
      fill: COLORS.panelBg,
      alpha: 0.9
    });
    display.drawRoundRect(panel.x, panel.y, panel.width, panel.height, LAYOUT.borderRadius, {
      stroke: COLORS.neonCyan,
      lineWidth: LAYOUT.borderWidth,
      alpha: 0.5
    });
  }

  /** Render lead slot */
  private renderLeadSlot(
    display: IDisplay,
    selectedLead: string | null,
    awakenedAuthoredRecruits: CrewMember[]
  ): void {
    const panel = PARTY_PANEL;
    const leadCenterX = panel.x + panel.width / 2;
    const leadSlotY = panel.y + panel.leadSlotY;
    const leadSize = panel.leadSlotSize;

    this.renderSlot(
      display,
      leadCenterX - leadSize / 2,
      leadSlotY,
      leadSize,
      selectedLead,
      'lead',
      awakenedAuthoredRecruits
    );

    display.drawText('LEAD', leadCenterX, leadSlotY - 8, {
      font: FONTS.tinyFont,
      fill: COLORS.dimText,
      align: 'center'
    });
  }

  /** Render companion slots */
  private renderCompanionSlots(
    display: IDisplay,
    companionSlots: [string | null, string | null],
    awakenedAuthoredRecruits: CrewMember[]
  ): void {
    const panel = PARTY_PANEL;
    const leadCenterX = panel.x + panel.width / 2;
    const compSize = panel.companionSlotSize;
    const compSlotY = panel.y + panel.companionSlotY;
    const compSpacing = 70;
    const compStartX = leadCenterX - compSpacing - compSize / 2;

    this.renderSlot(display, compStartX, compSlotY, compSize, companionSlots[0], 'companion0', awakenedAuthoredRecruits);
    this.renderSlot(display, compStartX + compSpacing + 10, compSlotY, compSize, companionSlots[1], 'companion1', awakenedAuthoredRecruits);

    display.drawText('COMPANIONS', leadCenterX, compSlotY - 8, {
      font: FONTS.tinyFont,
      fill: COLORS.dimText,
      align: 'center'
    });
  }

  /** Render summary line */
  private renderSummary(
    display: IDisplay,
    selectedLead: string | null,
    companionSlots: [string | null, string | null]
  ): void {
    const panel = PARTY_PANEL;
    const leadCenterX = panel.x + panel.width / 2;
    const summaryY = panel.y + panel.height - 20;

    const leadName = selectedLead ? (getAuthoredRecruit(selectedLead)?.name?.split(' ')[0] ?? '???') : 'Generic';
    const comp1Name = companionSlots[0] ? (getAuthoredRecruit(companionSlots[0])?.name?.split(' ')[0] ?? '???') : null;
    const comp2Name = companionSlots[1] ? (getAuthoredRecruit(companionSlots[1])?.name?.split(' ')[0] ?? '???') : null;

    let summary = leadName;
    if (comp1Name || comp2Name) {
      const comps = [comp1Name, comp2Name].filter(n => n).join(' + ');
      summary += ` + ${comps}`;
    }

    display.drawText(summary, leadCenterX, summaryY, {
      font: FONTS.tinyFont,
      fill: COLORS.brightText,
      align: 'center'
    });
  }

  /** Render a single slot */
  private renderSlot(
    display: IDisplay,
    x: number,
    y: number,
    size: number,
    authoredId: string | null,
    slotType: 'lead' | 'companion0' | 'companion1',
    awakenedRecruits: CrewMember[]
  ): void {
    const recruit = authoredId ? getAuthoredRecruit(authoredId) : null;
    const crew = authoredId ? awakenedRecruits.find(c => c.authoredId === authoredId) : null;
    const isFilled = recruit !== null && crew !== null;

    if (isFilled) {
      this.renderFilledSlot(display, x, y, size, recruit!.name, crew!);
    } else {
      this.renderEmptySlot(display, x, y, size, slotType);
    }
  }

  /** Render filled slot */
  private renderFilledSlot(
    display: IDisplay,
    x: number,
    y: number,
    size: number,
    name: string,
    crew: CrewMember
  ): void {
    const roleColor = ROLE_COLORS[crew.role];

    display.drawCircle(x + size / 2, y + size / 2, size / 2 - 2, {
      fill: COLORS.cardBg,
      stroke: roleColor,
      lineWidth: 2
    });

    const initial = name.charAt(0);
    display.drawText(initial, x + size / 2, y + size / 2, {
      font: `bold ${Math.floor(size * 0.5)}px monospace`,
      fill: roleColor,
      align: 'center',
      baseline: 'middle'
    });

    const firstName = name.split(' ')[0];
    display.drawText(firstName, x + size / 2, y + size + 12, {
      font: FONTS.tinyFont,
      fill: COLORS.white,
      align: 'center'
    });
  }

  /** Render empty slot */
  private renderEmptySlot(
    display: IDisplay,
    x: number,
    y: number,
    size: number,
    slotType: 'lead' | 'companion0' | 'companion1'
  ): void {
    display.drawCircle(x + size / 2, y + size / 2, size / 2 - 2, {
      fill: COLORS.neutralGray,
      alpha: 0.2,
      stroke: COLORS.border,
      lineWidth: 1
    });

    display.drawText(slotType === 'lead' ? 'Lead' : '+', x + size / 2, y + size / 2, {
      font: FONTS.smallFont,
      fill: COLORS.disabled,
      align: 'center',
      baseline: 'middle'
    });

    display.drawText(slotType === 'lead' ? '[Select]' : '[Empty]', x + size / 2, y + size + 12, {
      font: FONTS.tinyFont,
      fill: COLORS.disabled,
      align: 'center'
    });
  }

  /** Render selector background */
  private renderSelectorBackground(
    display: IDisplay,
    x: number,
    y: number,
    width: number,
    height: number,
    slotType: 'lead' | 'companion0' | 'companion1'
  ): void {
    display.drawRoundRect(x, y, width, height, LAYOUT.borderRadius, {
      fill: COLORS.cardBg,
      stroke: COLORS.neonCyan,
      lineWidth: 2
    });

    display.drawText(slotType === 'lead' ? 'SELECT LEAD' : 'SELECT COMPANION', x + 10, y + 15, {
      font: FONTS.smallFont,
      fill: COLORS.neonCyan
    });
  }

  /** Render none option */
  private renderNoneOption(display: IDisplay, dropdownX: number, dropdownY: number): void {
    const noneY = dropdownY + 35;
    display.drawRoundRect(dropdownX + 5, noneY, 190, 36, LAYOUT.borderRadiusSmall, {
      fill: COLORS.neutralGray,
      alpha: 0.3
    });
    display.drawText('None (Generic Captain)', dropdownX + 15, noneY + 18, {
      font: FONTS.smallFont,
      fill: COLORS.dimText,
      baseline: 'middle'
    });
  }

  /** Render recruit options */
  private renderRecruitOptions(
    display: IDisplay,
    dropdownX: number,
    dropdownY: number,
    itemHeight: number,
    availableRecruits: CrewMember[]
  ): void {
    availableRecruits.forEach((crew, index) => {
      const recruit = getAuthoredRecruit(crew.authoredId!);
      if (!recruit) return;

      const itemY = dropdownY + 35 + (index + 1) * itemHeight;
      const roleColor = ROLE_COLORS[crew.role];

      display.drawRoundRect(dropdownX + 5, itemY, 190, itemHeight - 4, LAYOUT.borderRadiusSmall, {
        fill: COLORS.neutralGray,
        alpha: 0.2
      });

      display.drawCircle(dropdownX + 25, itemY + itemHeight / 2, 8, { fill: roleColor });

      display.drawText(recruit.name, dropdownX + 40, itemY + itemHeight / 2, {
        font: FONTS.smallFont,
        fill: COLORS.white,
        baseline: 'middle'
      });

      display.drawText(getRoleName(crew.role), dropdownX + 185, itemY + itemHeight / 2, {
        font: FONTS.tinyFont,
        fill: COLORS.dimText,
        align: 'right',
        baseline: 'middle'
      });
    });
  }
}
