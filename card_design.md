# Run Deck — Card List for Implementation

Cards players **unlock** over time to build their **run deck**. Each run they **draw 3** per round from this deck. Starter deck is small; death and events add cards permanently.

**Reference:** `TARGET_LOOP_DESIGN.md` §3 and §5.

---

## Tone: Fallout / Outer Worlds — Tongue-in-Cheek Corpo Hell

The world is **corporations have fucked everything**. Space is full of derelicts, debt, and branded disasters. Cards should feel **super fun and zany**: darkly funny, satirical, euphemism-heavy. Think Fallout’s Vault-Tec, Outer Worlds’ Halcyon, and “synergistic asset liquidation” as a way to say “you died.” Names and flavor can be absurd, corporate, or bleakly cheerful. Death is “mandatory offboarding” or “reduction in force”; repair is “temporary permanent solution”; loot is “unclaimed company property.” Keep mechanics clear for gameplay, but **names and one-liners** should land the tone.

---

## Starter deck (everyone starts with these)

| Card ID | Name | Effect | Notes |
|--------|------|--------|--------|
| `scavenge` | Scavenge | Roll outcome table: **Loot** (small resources/power cell), **Death** (run ends, meta progress), **Skill** (meta progress), **Story** (rare). | Base risk/reward. |
| `repair` | Repair | Mark run target ship as **repaired** so it stays on board for re-run. No run end. | Required to re-run same ship. |
| `extract` | Extract | **End run** with current loot. No death. Player keeps all run rewards. | Safe exit. |

These three are always in the deck from run 1. All other cards are **unlocked** (death or events) and then **added to the deck** permanently.

---

## Scavenge family (unlockable)

| Card ID | Name | Effect | Unlock |
|--------|------|--------|--------|
| `scavenge_risky` | Risky Scavenge | Like Scavenge but **better loot table** and **higher death chance**. | Death pool (early unlock). |
| `scavenge_cautious` | Cautious Scavenge | Like Scavenge but **no death outcome**; loot is weaker. | Event: first successful Extract. |
| `scavenge_deep` | Deep Scan | Outcome table includes **story progress** or **skill progress**; rare. Loot/death still possible. | Event: story beat or milestone (e.g. 5 power cells found). |
| `scavenge_rush` | Rush Scavenge | Fast: **two** outcome rolls in one card (more reward, more risk). | Death pool (mid). |

---

## Repair family (unlockable)

| Card ID | Name | Effect | Unlock |
|--------|------|--------|--------|
| `repair_reinforce` | Reinforce | Repair **and** add a small **hull buffer** for next run on this ship (e.g. ship starts next run with +X hull). | Event: repair same ship twice. |
| `repair_salvage` | Salvage Parts | Repair **and** gain **one random resource** (e.g. metal/tech/components). | Death pool (mid). |
| `repair_patch` | Patch & Hold | Repair; **this run** the ship cannot be lost (e.g. next hazard that would remove ship is ignored once). | Event: milestone (e.g. 10 runs completed). |

---

## Extract family (unlockable)

| Card ID | Name | Effect | Unlock |
|--------|------|--------|--------|
| `extract_quick` | Quick Extract | End run with loot; **rewards reduced** (e.g. 70%) but **guaranteed** no hazard on the way out. | Death pool (early). |
| `extract_full` | Full Haul | End run; **double** current run loot, but **one extra hazard roll** (e.g. 20% death) before you leave. | Death pool (mid). |
| `extract_secure` | Secure Extract | End run with loot; **no hazard**; rewards at 100%. One-time per run (if you have it in deck). | Event: first Extract from a ship you later claimed. |

---

## Zany / Corpo Scavenge cards (unlockable)

| Card ID | Name | Effect | Unlock |
|--------|------|--------|--------|
| `scavenge_compliance` | Compliance Scan | Scavenge in “filing cabinet” flavor. Loot table + small chance of **story** (“HR found you”). | Death pool (early). |
| `scavenge_break_room` | Break Room Raid | Raid the break room. **No death**; loot weaker. Possible “mandatory wellness” outcome (tiny debuff or joke). | Event: first Extract. |
| `scavenge_hostile` | Hostile Takeover | Go deep. **Better loot**, much **higher death** chance. “Restructuring risk.” | Death pool (mid). |
| `scavenge_survey` | Customer Experience Survey | Find a survey. Outcomes: **coupon** (small loot), **complaint** (nothing), **story progress** (rare). | Event: milestone. |
| `scavenge_unclaimed` | Unclaimed Company Property | “It’s not stealing if it’s abandoned.” Standard Scavenge with **slightly better** loot odds. | Death pool (early). |
| `scavenge_performance` | Performance Review | Open the file. Could be a **raise** (good loot) or **separation** (death). High variance. | Death pool (mid). |
| `scavenge_synergy` | Synergize | Roll **twice**, combine outcomes. Can be great or “synergistic asset liquidation” (death). | Event: story beat. |

---

## Zany / Corpo Repair cards (unlockable)

| Card ID | Name | Effect | Unlock |
|--------|------|--------|--------|
| `repair_temporary` | Temporary Permanent Fix | Repair so ship stays. “It’ll hold.” (No extra effect; flavor.) | Death pool (early). |
| `repair_reorg` | Reorg the Wiring | Repair **and** gain one random resource. “Messy but effective.” | Death pool (mid). |
| `repair_open_plan` | Open Plan Hull | Repair **and** hull buffer for next run. “Collaborative space.” | Event: repair same ship twice. |
| `repair_life_support` | Optimize Life Support | Repair; **this run** ship can’t be lost once. “Efficiency.” | Event: milestone (10 runs). |
| `repair_duct_tape` | Duct Tape & Dreams | Repair **and** scrap/resource. “Not OSHA-approved.” | Death pool (mid). |
| `repair_mandatory` | Mandatory Maintenance | Repair. If you skip repair next round, small penalty (or just flavor). | Event: milestone. |

---

## Zany / Corpo Extract cards (unlockable)

| Card ID | Name | Effect | Unlock |
|--------|------|--------|--------|
| `extract_voluntary` | Voluntary Separation | “We’re sorry to see you go.” Leave with loot. Standard Extract. | Death pool (early). |
| `extract_severance` | Take the Severance | Leave **now**. 70% loot. **No hazard.** “No exit interview.” | Death pool (early). |
| `extract_exit_interview` | Exit Interview | Leave. Full loot. **One hazard roll.** “Any feedback for the company?” | Death pool (mid). |
| `extract_retreat` | Corporate Retreat | Leave safely. Full loot. “Team-building complete.” Once per run. | Event: first Extract from ship you later claimed. |
| `extract_rif` | Reduction in Force | Leave. **Double loot.** 20% chance “workplace incident” (death) on the way out. | Death pool (mid). |
| `extract_bohica` | BOHICA Protocol | “Bend Over, Here It Comes Again.” Leave; **random event** (small bonus, small curse, or nothing). | Event: story beat. |

---

## Chaos / Wild cards (unlockable)

| Card ID | Name | Effect | Unlock |
|--------|------|--------|--------|
| `chaos_mandatory_fun` | Mandatory Fun™ | **Random:** small buff, small curse, or “team spirit” (nothing). Zany. | Death pool (mid). |
| `chaos_pivot` | Pivot | “We’re pivoting.” **Discard hand**, draw 3 new cards. No other effect. | Event: milestone. |
| `chaos_lean_in` | Lean In | **Repair and Scavenge** in one play. Exhausting: next round draw one fewer card (or small penalty). | Event: repair same ship twice. |
| `chaos_quiet_quit` | Quiet Quitting | Do the bare minimum. **Extract at 50%** loot. **No hazard.** Safe but weak. | Death pool (early). |
| `chaos_disrupt` | Disrupt | “Disruption is a value.” **High risk** Scavenge: roll twice, take **worse** death chance, **better** loot if you live. | Death pool (mid). |

---

## Design prompts for Makko (copy one at a time)

Use these prompts in Makko to create each card. After each card, document what you made (e.g. in a changelog or in this repo) so the next prompt stays consistent.

**Tone for all cards:** Sector Scavengers is **Fallout / Outer Worlds** style: tongue-in-cheek, darkly funny, **corporations have fucked everything**. Cards should feel **super fun and zany**—satirical, euphemism-heavy, bleakly cheerful. Death = “mandatory offboarding” or “reduction in force”; repair = “temporary permanent solution”; loot = “unclaimed company property.” Visuals can be absurd, corporate, or grimly comic. Create cards in this order: starter first, then Scavenge/Repair/Extract families, then zany/corpo/chaos cards.

---

**Prompt: Starter card — Scavenge**

Create a tactic card for the game Sector Scavengers.

- **Card ID (use exactly in code):** `scavenge`
- **Display name:** Scavenge
- **One-line effect (for card face):** “Roll for loot, death, or progress.”
- **Mood:** Risk/reward, exploring a derelict. Sci-fi salvage. Slightly dangerous, tempting.
- **Visual:** Fits a run deck (tactic card). Style consistent with other Sector Scavengers cards. Can include a small icon or scene suggesting “searching a ship.”

After creating the card, document it (name, ID, where the asset lives or how it’s referenced).

---

**Prompt: Starter card — Repair**

Create a tactic card for the game Sector Scavengers.

- **Card ID (use exactly in code):** `repair`
- **Display name:** Repair
- **One-line effect (for card face):** “Ship stays on the board for your next run.”
- **Mood:** Steady, technical. Fixing the hull so the derelict doesn’t drift away.
- **Visual:** Fits a run deck (tactic card). Style consistent with other Sector Scavengers cards. Can include a wrench, hull patch, or repair scene.

After creating the card, document it (name, ID, where the asset lives or how it’s referenced).

---

**Prompt: Starter card — Extract**

Create a tactic card for the game Sector Scavengers.

- **Card ID (use exactly in code):** `extract`
- **Display name:** Extract
- **One-line effect (for card face):** “Leave with your loot. Run ends safely.”
- **Mood:** Get out, cash out. Escape with what you’ve got.
- **Visual:** Fits a run deck (tactic card). Style consistent with other Sector Scavengers cards. Can include a pod, cargo, or “leaving” vibe.

After creating the card, document it (name, ID, where the asset lives or how it’s referenced).

---

**Prompt: Unlockable card — Risky Scavenge**

Create a tactic card for the game Sector Scavengers.

- **Card ID (use exactly in code):** `scavenge_risky`
- **Display name:** Risky Scavenge
- **One-line effect (for card face):** “Better loot, higher chance of death.”
- **Mood:** High risk, high reward. Deeper into the derelict, more danger.
- **Visual:** Same run-deck style. Feels more dangerous than base Scavenge (darker, hazard, or “deeper” look).

After creating the card, document it.

---

**Prompt: Unlockable card — Cautious Scavenge**

Create a tactic card for the game Sector Scavengers.

- **Card ID (use exactly in code):** `scavenge_cautious`
- **Display name:** Cautious Scavenge
- **One-line effect (for card face):** “No death outcome. Weaker loot.”
- **Mood:** Safe, careful. Staying near the airlock, quick grab.
- **Visual:** Same run-deck style. Feels safer than base Scavenge (lighter, guarded, or “shallow” look).

After creating the card, document it.

---

**Prompt: Unlockable card — Deep Scan**

Create a tactic card for the game Sector Scavengers.

- **Card ID (use exactly in code):** `scavenge_deep`
- **Display name:** Deep Scan
- **One-line effect (for card face):** “Chance for story or skill progress. Rare.”
- **Mood:** Discovery, lore, long-term progress. Scanning the core, finding logs or data.
- **Visual:** Same run-deck style. Feels “deeper” or more narrative (data, screens, mystery).

After creating the card, document it.

---

**Prompt: Unlockable card — Rush Scavenge**

Create a tactic card for the game Sector Scavengers.

- **Card ID (use exactly in code):** `scavenge_rush`
- **Display name:** Rush Scavenge
- **One-line effect (for card face):** “Two outcome rolls. More reward, more risk.”
- **Mood:** Fast, greedy. Two quick grabs in one go.
- **Visual:** Same run-deck style. Feels fast or “double” (twin icons, speed lines, or double grab).

After creating the card, document it.

---

**Prompt: Unlockable card — Reinforce**

Create a tactic card for the game Sector Scavengers.

- **Card ID (use exactly in code):** `repair_reinforce`
- **Display name:** Reinforce
- **One-line effect (for card face):** “Repair and add a hull buffer for the next run.”
- **Mood:** Stronger repair. Reinforcing the hull so next time you start in better shape.
- **Visual:** Same run-deck style. Repair family; can show extra plating or “+buffer.”

After creating the card, document it.

---

**Prompt: Unlockable card — Salvage Parts**

Create a tactic card for the game Sector Scavengers.

- **Card ID (use exactly in code):** `repair_salvage`
- **Display name:** Salvage Parts
- **One-line effect (for card face):** “Repair and gain one random resource.”
- **Mood:** Repair plus loot. Stripping parts while you fix.
- **Visual:** Same run-deck style. Repair + resource (metal/tech/components vibe).

After creating the card, document it.

---

**Prompt: Unlockable card — Patch & Hold**

Create a tactic card for the game Sector Scavengers.

- **Card ID (use exactly in code):** `repair_patch`
- **Display name:** Patch & Hold
- **One-line effect (for card face):** “Repair. This run, ship can’t be lost once.”
- **Mood:** Emergency patch. One-time safety for the ship.
- **Visual:** Same run-deck style. Repair + shield or “hold” (patch + lock).

After creating the card, document it.

---

**Prompt: Unlockable card — Quick Extract**

Create a tactic card for the game Sector Scavengers.

- **Card ID (use exactly in code):** `extract_quick`
- **Display name:** Quick Extract
- **One-line effect (for card face):** “Leave now. 70% rewards, no hazard.”
- **Mood:** Fast exit. Get out safe, take less.
- **Visual:** Same run-deck style. Extract family; quick/light (small cargo, fast pod).

After creating the card, document it.

---

**Prompt: Unlockable card — Full Haul**

Create a tactic card for the game Sector Scavengers.

- **Card ID (use exactly in code):** `extract_full`
- **Display name:** Full Haul
- **One-line effect (for card face):** “Double loot. One hazard roll before you leave.”
- **Mood:** Greedy exit. Take everything, risk one more roll.
- **Visual:** Same run-deck style. Extract family; heavy (full cargo, risk).

After creating the card, document it.

---

**Prompt: Unlockable card — Secure Extract**

Create a tactic card for the game Sector Scavengers.

- **Card ID (use exactly in code):** `extract_secure`
- **Display name:** Secure Extract
- **One-line effect (for card face):** “Leave with full loot. No hazard. Once per run.”
- **Mood:** Safe, professional exit. Locked-down extraction.
- **Visual:** Same run-deck style. Extract family; secure (armored pod, lock icon).

After creating the card, document it.

---

### Zany / Corpo cards — Scavenge

**Compliance Scan** — `scavenge_compliance`. “Loot the filing cabinet. 10% chance it’s HR.” Mood: Corpo bureaucracy, paperwork, darkly funny. Visual: Filing cabinet, clipboard, or “compliance approved” stamp.

**Break Room Raid** — `scavenge_break_room`. “Take the coffee. Roll for loot or ‘mandatory wellness.’” Mood: Sad break room, stale donuts, corporate “wellness.” Visual: Coffee machine, empty break room, wellness poster.

**Hostile Takeover** — `scavenge_hostile`. “Go deep. Better loot, way higher ‘restructuring’ risk.” Mood: Aggressive, greedy, “restructuring” euphemism for death. Visual: Boardroom, hostile, or takeover vibe.

**Customer Experience Survey** — `scavenge_survey`. “Find a survey. Outcomes: coupon, complaint, or story.” Mood: Absurd customer service, feedback forms. Visual: Survey, clipboard, “How did we do?” star rating.

**Unclaimed Company Property** — `scavenge_unclaimed`. “It’s not stealing if it’s abandoned. Right?” Mood: Justification, loophole, darkly funny. Visual: “Property of [Company]” sticker, abandoned crate.

**Performance Review** — `scavenge_performance`. “Open the file. Could be a raise. Could be ‘separation.’” Mood: Dread, HR, high stakes. Visual: Folder, performance graph, or “termination” stamp.

**Synergize** — `scavenge_synergy`. “Roll twice, combine outcomes. Synergistic asset liquidation possible.” Mood: Corporate buzzword, “synergy” as danger. Visual: Venn diagram, handshake, or explosion.

---

### Zany / Corpo cards — Repair

**Temporary Permanent Fix** — `repair_temporary`. “It’ll hold. (It won’t.)” Mood: Self-aware, duct-tape solution, darkly funny. Visual: Duct tape, “temporary” sign, shrug.

**Reorg the Wiring** — `repair_reorg`. “Repair + one random resource. Messy but effective.” Mood: Chaotic repair, reorg as chaos. Visual: Tangled wires, “reorg in progress” sign.

**Open Plan Hull** — `repair_open_plan`. “Repair + hull buffer. ‘Collaborative space.’” Mood: Open plan = bad, corporate speak. Visual: Open hull, no walls, “collaboration” poster.

**Optimize Life Support** — `repair_life_support`. “Repair; ship can’t be lost once this run. ‘Efficiency.’” Mood: Dark “optimization,” life support as cost-cutting. Visual: Life support panel, “optimized” sticker.

**Duct Tape & Dreams** — `repair_duct_tape`. “Repair + scrap. Not OSHA-approved.” Mood: Zany, unapproved, scrappy. Visual: Duct tape everywhere, “OSHA?” crossed out.

**Mandatory Maintenance** — `repair_mandatory`. “Repair. If you skip repair next round, small penalty.” Mood: Corporate mandatory, paperwork. Visual: Checklist, “mandatory” stamp.

---

### Zany / Corpo cards — Extract

**Voluntary Separation** — `extract_voluntary`. “We’re sorry to see you go.” Standard leave with loot. Mood: Euphemism for “you’re fired,” fake sadness. Visual: Handshake, box of belongings, “good luck.”

**Take the Severance** — `extract_severance`. “Leave now. 70% loot. No exit interview.” Mood: Quick exit, severance package. Visual: Envelope, “severance” stamp, door.

**Exit Interview** — `extract_exit_interview`. “Leave with full loot. One hazard roll. ‘Any feedback?’” Mood: Uncomfortable interview, risk on the way out. Visual: Interview room, feedback form, awkward.

**Corporate Retreat** — `extract_retreat`. “Leave safely. Full loot. Team-building complete.” Once per run. Mood: Ironic “retreat,” safe exit. Visual: Retreat brochure, trust fall, safe pod.

**Reduction in Force** — `extract_rif`. “Leave. Double loot. 20% chance ‘workplace incident’ on the way out.” Mood: RIF = layoffs, workplace violence euphemism. Visual: “RIF” memo, double loot, hazard sign.

**BOHICA Protocol** — `extract_bohica`. “Bend Over, Here It Comes Again. Leave; random event.” Mood: Military/corpo acronym, something weird happens. Visual: Absurd, “BOHICA” branding, chaos.

---

### Chaos / Wild cards

**Mandatory Fun™** — `chaos_mandatory_fun`. “Random: small buff, small curse, or ‘team spirit.’” Mood: Corporate “fun,” forced enthusiasm. Visual: Party hat, “fun” trademark, eye roll.

**Pivot** — `chaos_pivot`. “We’re pivoting. Discard hand, draw 3 new.” Mood: Startup/corpo pivot, change direction. Visual: Pivot arrow, U-turn, “new direction.”

**Lean In** — `chaos_lean_in`. “Repair and Scavenge in one. Exhausting.” Small penalty next round. Mood: Corporate “lean in,” overwork. Visual: Leaning figure, double action, tired.

**Quiet Quitting** — `chaos_quiet_quit`. “Bare minimum. Extract at 50%. No hazard.” Mood: Doing the minimum, safe exit. Visual: Minimal effort, 50%, shrug.

**Disrupt** — `chaos_disrupt`. “Disruption is a value. High risk, better loot if you live.” Mood: “Disruption” buzzword, high risk. Visual: Explosion, “disrupt” logo, chaos.

---

## Unlock sources (summary)

- **Death pool:** When the player dies, they get one random card from a pool. Pools can be “early” (first 5 deaths) vs “mid” (after) so order of unlocks is somewhat controlled. Duplicates = skip or convert to small currency.
- **Events:** First successful Extract, repair same ship twice, story beat, milestones (5 power cells, 10 runs, first claim, etc.). Each event grants a **specific** card or a **choice of 2**.
- **Milestones:** Same as events; use for rarer cards (e.g. Patch & Hold, Deep Scan).

---

## Implementation notes

- **Card ID** = unique string for state/save (e.g. `scavenge`, `scavenge_risky`).
- **Deck** = list of card IDs. Starter = `['scavenge', 'repair', 'extract']`. New cards are **appended** when unlocked (or add to a “pool” and draw from pool each run; design doc says “add to deck”).
- **Draw:** Each round, draw 3 from deck (shuffle or random 3 without replacement so you don’t see the same 3 every time). If deck has &lt; 3 cards, draw all and refill from discard or allow duplicates for that round.
- **Effect:** Each card’s effect is implemented in run logic (e.g. when card is played, call `executeScavenge()`, `executeRepair()`, etc., with card ID so variants can branch).

**Card count:** 3 starter + 10 original unlockable + 24 zany/corpo/chaos = **37 cards** total. Unlock pools (death/events/milestones) can assign which of the zany cards appear when; duplicate unlocks can grant a small currency or “already owned” skip.

You can add more cards later by adding rows to the tables and an unlock source.
