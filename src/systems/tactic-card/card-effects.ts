/**
 * Card Effects
 *
 * Individual card execution logic for each card type.
 * Pure functions that don't depend on full game state.
 */

import { checkCrewLoss, XP_REWARDS, addCrewXP, CrewMember, CrewRole } from '../../types/crew';
import { getHullRepairMultiplier, getGlobalCrewEfficiencyBonus } from '../crew-bonus-system';
import { RISK_REDUCTION_PER_REPAIR } from '../../types/state';
import { displayAbilityToast } from '../../dialogue/companion-banter';
import type { Game } from '../../game/game';
import type { CardPlayResult, ExecutionDeps } from './types';

/**
 * Execute SCAVENGE card - risk/reward salvage attempt
 * Outcome table:
 *   0-30%: Valuable item
 *   30-50%: Power cell
 *   50-80%: Small energy reward
 *   80-100%: Hull breach (or shield block)
 */
export function executeScavenge(game: Game, deps: ExecutionDeps): CardPlayResult {
  const run = game.state.currentRun;
  if (!run) return { success: false, message: 'No active run', energySpent: 0 };

  const roll = Math.floor(deps.rng.next() * 100);

  if (roll < 30) {
    const items = ['rare_circuit', 'alien_tech', 'data_core', 'quantum_chip'];
    const item = items[Math.floor(deps.rng.next() * items.length)];
    run.collectedItems.push(item);
    deps.juice.triggerShake(5, 150);
    return { success: true, message: `Found valuable item: ${item}!`, energySpent: 0 };
  }

  if (roll < 50) {
    game.state.resources.powerCells++;
    deps.juice.triggerShake(3, 100);
    return { success: true, message: 'Found a power cell!', energySpent: 0 };
  }

  if (roll < 80) {
    const reward = 50 + Math.floor(deps.rng.next() * 50);
    run.extractedRewards += reward;
    return { success: true, message: `Salvaged ${reward} energy!`, energySpent: 0, payout: reward };
  }

  return handleHullBreach(game, deps);
}

/**
 * Handle hull breach outcome (80-100% roll on Scavenge)
 */
function handleHullBreach(game: Game, deps: ExecutionDeps): CardPlayResult {
  const run = game.state.currentRun!;

  if (run.shields > 0) {
    run.shields--;
    deps.juice.triggerShake(8, 200);
    return {
      success: true, message: `Shield blocked hull breach! (${run.shields} remaining)`,
      energySpent: 0, collapsed: false, payout: 0
    };
  }

  // Death sequence
  run.collapsed = true;
  run.extractedRewards = 0;
  run.collectedItems = [];

  run.scrapEarned = 10;
  game.state.deathCurrency += 10;
  game.state.deckUnlockProgress += 25;
  console.log('[Death] Granted +10 Scrap, +25% deck progress');

  if (game.state.deckUnlockProgress >= 100) {
    unlockNextCard(game);
  }

  const targetId = run.targetShipId;
  if (targetId !== null) {
    const ship = game.getShip(targetId);
    if (ship && ship.owner === 'player') {
      if (!game.state.shipClaimProgress) game.state.shipClaimProgress = {};
      game.state.shipClaimProgress[targetId] = (game.state.shipClaimProgress[targetId] || 0) + 1;

      if (game.state.shipClaimProgress[targetId] >= 3) {
        ship.claimable = true;
        console.log(`[Claim] Ship ${targetId} is now claimable!`);
      }
      handleCrewLossOnDeath(game, targetId);
    }
  }

  deps.juice.triggerHullBreach();
  game.state.totalCollapses++;

  return { success: true, message: 'HULL BREACH! All rewards lost.', energySpent: 0, collapsed: true, payout: 0 };
}

/**
 * Execute REPAIR card - restore hull integrity
 */
export function executeRepair(game: Game): CardPlayResult {
  const run = game.state.currentRun;
  if (!run) return { success: false, message: 'No active run', energySpent: 0 };

  const targetId = run.targetShipId;
  if (targetId === null) return { success: false, message: 'No target ship selected', energySpent: 0 };

  const ship = game.getShip(targetId);
  if (!ship) return { success: false, message: 'Target ship not found', energySpent: 0 };

  const cryoState = game.state.cryoState;
  const medicBonus = getGlobalCrewEfficiencyBonus(cryoState);
  const repairMult = getHullRepairMultiplier(cryoState, ship.id);

  let repairAmount = Math.floor((20 + ship.shipClass * 5) * repairMult * (1 + medicBonus));

  const abilityBonus = run.appliedPassiveBonuses?.repairBonus || 0;
  if (abilityBonus > 0) {
    repairAmount += Math.floor(repairAmount * (abilityBonus / 100));
    console.log(`[Abilities] Repair bonus: +${abilityBonus}%`);
  }

  ship.hullIntegrity = Math.min(100, ship.hullIntegrity + repairAmount);
  run.targetRepairedThisRun = true;
  run.repairsThisRun++;

  console.log(`[Repair] Risk reduction: -${Math.round(run.repairsThisRun * RISK_REDUCTION_PER_REPAIR * 100)}%`);

  if (!game.state.shipClaimProgress) game.state.shipClaimProgress = {};
  game.state.shipClaimProgress[targetId] = (game.state.shipClaimProgress[targetId] || 0) + 1;

  if (game.state.shipClaimProgress[targetId] >= 3) {
    ship.claimable = true;
    console.log(`[Claim] Ship ${targetId} is now claimable!`);
  }

  grantCrewXP(game, targetId, 15);
  return { success: true, message: `Repaired ship ${ship.id} (+${repairAmount} hull)`, energySpent: 0 };
}

/**
 * Execute EXTRACT card - safe exit with current loot
 */
export function executeExtract(game: Game): CardPlayResult {
  const run = game.state.currentRun;
  if (!run) return { success: false, message: 'No active run', energySpent: 0 };

  let total = run.extractedRewards;
  const itemCount = run.collectedItems.length;
  const targetId = run.targetShipId;

  const extractBonus = run.appliedPassiveBonuses?.extractionBonus || 0;
  if (extractBonus > 0 && total > 0) {
    total += Math.floor(total * (extractBonus / 100));
    console.log(`[Abilities] Extraction bonus: +${extractBonus}%`);
  }

  if (run.bankedRewards > 0) {
    total += run.bankedRewards;
    console.log(`[Abilities] Dead Drop banked: +${run.bankedRewards}`);
  }

  run.extractedRewards = total;

  if (targetId !== null) {
    if (!game.state.shipClaimProgress) game.state.shipClaimProgress = {};
    game.state.shipClaimProgress[targetId] = (game.state.shipClaimProgress[targetId] || 0) + 1;

    if (game.state.shipClaimProgress[targetId] >= 3) {
      const ship = game.getShip(targetId);
      if (ship) ship.claimable = true;
    }
    grantCrewXP(game, targetId, XP_REWARDS.RUN_COMPLETION);
  }

  setTimeout(() => game.endDepthDive(), 500);

  const msg = itemCount > 0
    ? `Extracting ${Math.floor(total)} energy + ${itemCount} items!`
    : `Extracting ${Math.floor(total)} energy!`;

  return { success: true, message: msg, energySpent: 0, payout: total };
}

/**
 * Execute SHIELD card - add protection from hull breach
 */
export function executeShield(game: Game): CardPlayResult {
  const run = game.state.currentRun;
  if (!run) return { success: false, message: 'No active run', energySpent: 0 };
  if (run.shields >= 2) return { success: false, message: 'Already at max shields (2)', energySpent: 0 };

  run.shields++;
  return { success: true, message: `Shield activated (${run.shields}/2)`, energySpent: 0 };
}

/**
 * Execute UPGRADE card - increase target ship class
 */
export function executeUpgrade(game: Game, deps: ExecutionDeps): CardPlayResult {
  const run = game.state.currentRun;
  if (!run) return { success: false, message: 'No active run', energySpent: 0 };

  const targetId = run.targetShipId;
  if (targetId === null) return { success: false, message: 'No target ship selected', energySpent: 0 };

  const ship = game.getShip(targetId);
  if (!ship) return { success: false, message: 'Target ship not found', energySpent: 0 };
  if (ship.shipClass >= 5) return { success: false, message: 'Ship already at max class (5)', energySpent: 0 };

  ship.shipClass++;
  deps.juice.triggerShake(6, 150);

  const bonus = ship.shipClass * 20;
  run.extractedRewards += bonus;

  return { success: true, message: `Ship upgraded to Class ${ship.shipClass} (+${bonus} bonus)`, energySpent: 0, payout: bonus };
}

/**
 * Execute ANALYZE card - discover hidden bonus item
 */
export function executeAnalyze(game: Game, deps: ExecutionDeps): CardPlayResult {
  const run = game.state.currentRun;
  if (!run) return { success: false, message: 'No active run', energySpent: 0 };

  const items = ['data_cache', 'signal_booster', 'fuel_cell', 'spare_parts', 'navigation_data'];
  const item = items[Math.floor(deps.rng.next() * items.length)];

  run.collectedItems.push(item);
  const bonus = 30 + Math.floor(deps.rng.next() * 20);
  run.extractedRewards += bonus;

  deps.juice.triggerShake(4, 100);
  return { success: true, message: `Analyzed: Found ${item} +${bonus} energy!`, energySpent: 0, payout: bonus };
}

/**
 * Execute RUSH SCAVENGE card - high-risk high-reward salvage
 * 35% breach chance, but better rewards
 */
export function executeRushScavenge(game: Game, deps: ExecutionDeps): CardPlayResult {
  const run = game.state.currentRun;
  if (!run) return { success: false, message: 'No active run', energySpent: 0 };

  // 35% breach chance
  const roll = Math.floor(deps.rng.next() * 100);
  if (roll >= 65) {
    return handleHullBreach(game, deps);
  }

  // Better rewards than normal scavenge
  if (roll < 25) {
    // Rare item
    const items = ['rare_circuit', 'alien_tech', 'quantum_chip', 'experimental_core'];
    const item = items[Math.floor(deps.rng.next() * items.length)];
    run.collectedItems.push(item);
    deps.juice.triggerShake(6, 150);
    return { success: true, message: `Rush salvage: Found ${item}!`, energySpent: 0 };
  }

  if (roll < 50) {
    // Double power cells
    game.state.resources.powerCells += 2;
    deps.juice.triggerShake(4, 100);
    return { success: true, message: 'Rush salvage: Found 2 power cells!', energySpent: 0 };
  }

  // Better energy reward
  const reward = 80 + Math.floor(deps.rng.next() * 70);
  run.extractedRewards += reward;
  deps.juice.triggerShake(3, 80);
  return { success: true, message: `Rush salvage: ${reward} energy!`, energySpent: 0, payout: reward };
}

/**
 * Execute FULL HAUL card - guaranteed item, 10% breach
 */
export function executeFullHaul(game: Game, deps: ExecutionDeps): CardPlayResult {
  const run = game.state.currentRun;
  if (!run) return { success: false, message: 'No active run', energySpent: 0 };

  // 10% breach chance
  const roll = Math.floor(deps.rng.next() * 100);
  if (roll >= 90) {
    return handleHullBreach(game, deps);
  }

  // Guaranteed valuable item
  const items = ['rare_circuit', 'alien_tech', 'data_core', 'quantum_chip', 'experimental_core'];
  const item = items[Math.floor(deps.rng.next() * items.length)];
  run.collectedItems.push(item);

  // Bonus energy
  const bonus = 40 + Math.floor(deps.rng.next() * 30);
  run.extractedRewards += bonus;

  deps.juice.triggerShake(5, 150);
  return { success: true, message: `Full haul: ${item} +${bonus} energy!`, energySpent: 0, payout: bonus };
}

/**
 * Execute BREAK ROOM RAID card - free supplies (event reward)
 */
export function executeBreakRoomRaid(game: Game, deps: ExecutionDeps): CardPlayResult {
  const run = game.state.currentRun;
  if (!run) return { success: false, message: 'No active run', energySpent: 0 };

  // Random free supplies
  const roll = Math.floor(deps.rng.next() * 100);

  if (roll < 40) {
    // Free power cell
    game.state.resources.powerCells++;
    deps.juice.triggerShake(3, 100);
    return { success: true, message: 'Break room: Found a power cell!', energySpent: 0 };
  }

  if (roll < 70) {
    // Free energy boost
    const bonus = 30 + Math.floor(deps.rng.next() * 30);
    run.extractedRewards += bonus;
    deps.juice.triggerShake(3, 80);
    return { success: true, message: `Break room: ${bonus} energy!`, energySpent: 0, payout: bonus };
  }

  // Supply item
  const items = ['spare_parts', 'fuel_cell', 'navigation_data', 'data_cache'];
  const item = items[Math.floor(deps.rng.next() * items.length)];
  run.collectedItems.push(item);
  deps.juice.triggerShake(4, 100);
  return { success: true, message: `Break room: Found ${item}!`, energySpent: 0 };
}

/**
 * Handle crew loss on death with medic and ability modifiers
 */
function handleCrewLossOnDeath(game: Game, shipId: number): void {
  const roster = game.state.crewRoster;
  if (!roster?.length) return;

  const hasMedic = roster.some(c => c.alive && c.role === CrewRole.Medic && c.assignment?.type === 'ship');

  for (const crew of roster) {
    if (crew.alive && crew.assignment?.type === 'ship' && crew.assignment.targetId === shipId) {
      if (tryTriage(game, crew)) continue;
      checkCrewLoss(crew, hasMedic);
    }
  }
}

/**
 * Try Imani's Triage Protocol ability
 */
function tryTriage(game: Game, crew: CrewMember): boolean {
  const run = game.state.currentRun;
  if (!run || run.abilityUsage.triageUsed) return false;

  const isLead = run.leadId === 'imani_okoro';
  const isComp = run.companionIds.includes('imani_okoro');

  if (!isLead && !isComp) return false;

  if (isLead) {
    run.abilityUsage.triageUsed = true;
    displayAbilityToast('TRIAGE PROTECTED', `${crew.name} saved!`);
    return true;
  }

  if (isComp && Math.random() < 0.5) {
    run.abilityUsage.triageUsed = true;
    displayAbilityToast('TRIAGE PROTECTED', `${crew.name} saved! (50%)`);
    return true;
  }

  return false;
}

/**
 * Grant XP to crew assigned to ship
 */
function grantCrewXP(game: Game, shipId: number, xp: number): void {
  const roster = game.state.crewRoster;
  if (!roster?.length) return;

  for (const crew of roster) {
    if (crew.alive && crew.assignment?.type === 'ship' && crew.assignment.targetId === shipId) {
      if (addCrewXP(crew, xp)) {
        console.log(`[Crew] ${crew.name} leveled up to ${crew.level}!`);
      }
    }
  }
}

/**
 * Unlock next card when progress reaches 100
 * NOTE: Death progression ONLY unlocks SHIELD
 * All other cards are unlocked via rare discovery events
 */
function unlockNextCard(game: Game): void {
  // Only SHIELD unlocks via death progression
  if (!game.state.unlockedCards.includes('shield')) {
    game.state.unlockedCards.push('shield');
    game.state.nextUnlockCardId = 'shield';
    game.state.deckUnlockProgress = 0;
    console.log(`[Deck] Death unlocked: Shield`);
  } else {
    // Already have shield - reset progress, no further death unlocks
    game.state.deckUnlockProgress = 0;
    console.log(`[Deck] Death progression maxed - SHIELD already unlocked`);
  }
}
