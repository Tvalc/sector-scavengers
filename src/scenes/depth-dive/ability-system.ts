/**
 * Character Ability Application
 * 
 * Applies passive bonuses and tracks ability usage for party members.
 */

import { MAX_SHIELDS } from '../../types/state';
import { getAuthoredRecruit } from '../../types/crew';
import { displayBanterToast, getRandomBanter, displayAbilityToast } from '../../dialogue/companion-banter';
import type { Game } from '../../game/game';
import { COLORS } from '../../ui/theme';

/**
 * Apply character abilities from lead and companions at run start
 */
export function applyCharacterAbilities(game: Game): void {
  const run = game.state.currentRun;
  if (!run) return;
  
  // Reset bonuses
  run.appliedPassiveBonuses = {
    shieldBonus: 0,
    repairBonus: 0,
    discoveryBonus: 0,
    extractionBonus: 0
  };
  
  // Reset ability usage flags
  run.abilityUsage = {
    workingMemoryUsed: false,
    triageUsed: false,
    fieldRetrofitUsed: false,
    signalTraceUsed: false,
    deadDropUsed: false,
    ghostCredentialUsed: false
  };
  
  // Collect all party members
  const partyMembers: string[] = [];
  if (run.leadId) partyMembers.push(run.leadId);
  if (run.companionIds[0]) partyMembers.push(run.companionIds[0]);
  if (run.companionIds[1]) partyMembers.push(run.companionIds[1]);
  
  // Apply passive bonuses from each party member
  for (let i = 0; i < partyMembers.length; i++) {
    const authoredId = partyMembers[i];
    const recruit = getAuthoredRecruit(authoredId);
    if (!recruit) continue;
    
    const isLead = (i === 0);
    const ability = recruit.ability;
    
    // Lead gets full effect, companion gets 50%
    const effect = isLead ? ability.leadEffect : ability.companionEffect;
    if (!effect) continue;
    
    applyPassiveEffect(run, recruit.name, authoredId, effect.passive, isLead);
    displayStartBanter(recruit.name, authoredId, i);
  }
  
  console.log('[Abilities] Passive bonuses applied:', run.appliedPassiveBonuses);
}

function applyPassiveEffect(
  run: NonNullable<typeof Game.prototype.state.currentRun>,
  name: string,
  _authoredId: string,
  passive: { type: string; value: number } | undefined,
  isLead: boolean
): void {
  if (!passive) return;
  
  const value = isLead ? passive.value : Math.floor(passive.value);
  const role = isLead ? 'Lead' : 'Companion';
  
  switch (passive.type) {
    case 'shield':
      run.appliedPassiveBonuses.shieldBonus += value;
      run.shields = Math.min(MAX_SHIELDS, run.shields + value);
      console.log(`[Abilities] ${name} (${role}): +${value} SHIELD`);
      break;
    case 'repair':
      run.appliedPassiveBonuses.repairBonus += value;
      console.log(`[Abilities] ${name} (${role}): +${value}% Repair`);
      break;
    case 'discovery':
      run.appliedPassiveBonuses.discoveryBonus += value;
      console.log(`[Abilities] ${name} (${role}): +${value}% Discovery`);
      break;
    case 'extraction':
      run.appliedPassiveBonuses.extractionBonus += value;
      console.log(`[Abilities] ${name} (${role}): +${value}% Extraction`);
      break;
  }
}

function displayStartBanter(name: string, authoredId: string, index: number): void {
  const banter = getRandomBanter(authoredId, 'runStart');
  if (banter) {
    setTimeout(() => {
      displayBanterToast(name, banter);
    }, 1000 + index * 500);
  }
}

/**
 * Check if Jax's Field Retrofit can stabilize a hull breach
 */
export function checkBreachStabilization(game: Game): boolean {
  const run = game.state.currentRun;
  if (!run || run.abilityUsage.fieldRetrofitUsed) return false;
  
  // Check if Jax is lead
  if (run.leadId !== 'jax_vasquez') return false;
  
  // Stabilize breach
  run.abilityUsage.fieldRetrofitUsed = true;
  run.collapsed = false;
  
  // Set hull to 50%
  const targetShip = run.targetShipId !== null ? game.getShip(run.targetShipId) : null;
  if (targetShip) {
    targetShip.hullIntegrity = 50;
  }
  
  // Display ability toast
  const recruit = getAuthoredRecruit('jax_vasquez');
  if (recruit) {
    displayAbilityToast('FIELD RETROFIT', 'Breach stabilized at 50% hull!');
    
    const banter = getRandomBanter('jax_vasquez', 'hullBreach');
    if (banter) {
      setTimeout(() => displayBanterToast(recruit.name, banter), 500);
    }
  }
  
  return true;
}
