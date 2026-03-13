/**
 * UI Rendering - Main Entry
 *
 * Unified UIRenderer class that delegates to specialized components.
 */

import { IDisplay } from '@makko/engine';
import { InventorySystem } from '../../../systems/inventory-system';
import { SocialMultiplierSystem } from '../../../systems/social-multiplier-system';
import { Item } from '../../../types/items';
import type { CryoState } from '../../../systems/cryo-system';
import { CrewMember } from '../../../types/crew';
import type { DoctrineType } from '../../../types/state';

import { EnergyDisplay } from './energy-display';
import { ToolbarButtons } from './toolbar-buttons';
import { DiveButton } from './dive-button';
import { DebtPanel } from './debt-panel';
import { InventoryPanels } from './inventory-panels';
import { ViralBadge } from './viral-badge';
import { PartyPanel } from './party-panel';
import { DoctrinePanel } from './doctrine-panel';

// Re-export constants for external use
export {
  DIVE_BUTTON_BOUNDS,
  MISSION_BUTTON_BOUNDS,
  CREW_BUTTON_BOUNDS,
  INVENTORY_BUTTON_BOUNDS,
  HELP_BUTTON_BOUNDS,
  INVENTORY_PANEL,
  CREW_PANEL,
  PARTY_PANEL
} from './constants';

// Re-export slot bounds helper
export { InventoryPanels as InventorySlotHelper } from './inventory-panels';

/**
 * UIRenderer handles all UI element rendering
 * Delegates to specialized component classes
 */
export class UIRenderer {
  private energyDisplay: EnergyDisplay;
  private toolbarButtons: ToolbarButtons;
  private diveButton: DiveButton;
  private debtPanel: DebtPanel;
  private inventoryPanels: InventoryPanels;
  private viralBadge: ViralBadge;
  private partyPanel: PartyPanel;
  private doctrinePanel: DoctrinePanel;

  constructor() {
    this.energyDisplay = new EnergyDisplay();
    this.toolbarButtons = new ToolbarButtons();
    this.diveButton = new DiveButton();
    this.debtPanel = new DebtPanel();
    this.inventoryPanels = new InventoryPanels();
    this.viralBadge = new ViralBadge();
    this.partyPanel = new PartyPanel();
    this.doctrinePanel = new DoctrinePanel();
  }

  // Energy display
  renderEnergy(display: IDisplay, energy: number, cap: number, rate: number): void {
    this.energyDisplay.render(display, energy, cap, rate);
  }

  renderEfficiencyBonus(display: IDisplay, cryoState: CryoState): void {
    this.energyDisplay.renderEfficiencyBonus(display, cryoState);
  }

  // Toolbar buttons
  renderInventoryButton(display: IDisplay): void {
    this.toolbarButtons.renderInventoryButton(display);
  }

  renderCrewButton(display: IDisplay, isHovered: boolean): void {
    this.toolbarButtons.renderCrewButton(display, isHovered);
  }

  renderMissionButton(display: IDisplay, hasNotification: boolean): void {
    this.toolbarButtons.renderMissionButton(display, hasNotification);
  }

  renderHelpButton(display: IDisplay): void {
    this.toolbarButtons.renderHelpButton(display);
  }

  // Dive button
  renderDiveButton(display: IDisplay, selectedCount: number): void {
    this.diveButton.render(display, selectedCount);
  }

  // Debt panel
  renderDebtPanel(display: IDisplay, debt: number, debtCeiling: number): void {
    this.debtPanel.render(display, debt, debtCeiling);
  }

  // Inventory panels
  renderInventoryPanel(display: IDisplay, inventory: InventorySystem, hoveredSlotIndex: number | null): void {
    this.inventoryPanels.renderInventoryPanel(display, inventory, hoveredSlotIndex);
  }

  renderCrewPanel(display: IDisplay, inventory: InventorySystem, hoveredSlotIndex: number | null): void {
    this.inventoryPanels.renderCrewPanel(display, inventory, hoveredSlotIndex);
  }

  renderTooltipForItem(display: IDisplay, x: number, y: number, item: Item): void {
    this.inventoryPanels.renderTooltipForItem(display, x, y, item);
  }

  getSlotBounds(
    panelX: number,
    panelY: number,
    category: 'hardware' | 'crew',
    slotIndex: number
  ): { x: number; y: number; width: number; height: number } | null {
    return this.inventoryPanels.getSlotBounds(panelX, panelY, category, slotIndex);
  }

  // Viral badge
  renderViralMultiplierBadge(display: IDisplay, socialSystem: SocialMultiplierSystem): void {
    this.viralBadge.render(display, socialSystem);
  }

  // Party panel
  renderPartyPanel(
    display: IDisplay,
    selectedLead: string | null,
    companionSlots: [string | null, string | null],
    awakenedAuthoredRecruits: CrewMember[]
  ): void {
    this.partyPanel.render(display, selectedLead, companionSlots, awakenedAuthoredRecruits);
  }

  renderPartySelector(
    display: IDisplay,
    slotType: 'lead' | 'companion0' | 'companion1',
    awakenedRecruits: CrewMember[],
    selectedLead: string | null,
    companionSlots: [string | null, string | null]
  ): void {
    this.partyPanel.renderSelector(display, slotType, awakenedRecruits, selectedLead, companionSlots);
  }

  getPartySlotBounds(slotType: 'lead' | 'companion0' | 'companion1'): { x: number; y: number; width: number; height: number } {
    return this.partyPanel.getSlotBounds(slotType);
  }

  getPartySelectorItemBounds(
    slotType: 'lead' | 'companion0' | 'companion1',
    awakenedRecruits: CrewMember[],
    selectedLead: string | null,
    companionSlots: [string | null, string | null]
  ): Array<{ authoredId: string | null; bounds: { x: number; y: number; width: number; height: number } }> {
    return this.partyPanel.getSelectorItemBounds(slotType, awakenedRecruits, selectedLead, companionSlots);
  }

  // Doctrine
  renderDoctrineBadge(display: IDisplay, doctrine: DoctrineType | null): void {
    this.doctrinePanel.renderBadge(display, doctrine);
  }

  renderDoctrineProgress(
    display: IDisplay,
    doctrinePoints: { corporate: number; cooperative: number; smuggler: number },
    doctrine: DoctrineType | null
  ): void {
    this.doctrinePanel.renderProgress(display, doctrinePoints, doctrine);
  }
}
