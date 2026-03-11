# IMPLEMENTATION STATUS AND MAKKO PROMPTS

## Snapshot Audited

This document reflects the latest `main` branch snapshot inspected during this audit:

- **Commit:** `494a3b5`
- **Commit Name:** `Narrative_Rework_Complete`

It compares the live code against:

- `NARRATIVE_REWORK.md`
- `character_bible.md`
- `Debt_loop_and_sector_arc.md`

This document is meant to replace guesswork with a simple truth table:

- what is **implemented**
- what is **partially implemented**
- what is **not implemented**

It also provides the exact **Makko prompt sequence** to finish implementation without skipping critical pieces or repeating the “doc says complete, code says otherwise” problem.

---

## Single Master Prompt To Paste Into Makko

Use the prompt below if you want **one entry point** instead of manually feeding Makko each numbered prompt.

```text
You are working in the Sector Scavengers repository.

Your job is to bring the live game implementation into alignment with the intended design described in:
- NARRATIVE_REWORK.md
- character_bible.md
- Debt_loop_and_sector_arc.md
- IMPLEMENTATION_STATUS_AND_MAKKO_PROMPTS.md

Before making any changes, read all four files above plus the current codebase hot-path files that they reference.

IMPORTANT OPERATING RULES

1. Treat IMPLEMENTATION_STATUS_AND_MAKKO_PROMPTS.md as the current truth source for:
   - what is implemented
   - what is partial
   - what is missing

2. Do not assume a feature is complete just because a design doc says it is.
   You must verify the live code before acting.

3. Do not skip ahead to later-stage features if earlier foundational items are incomplete.

4. Keep file count low.
   Prefer extending existing hot-path files over creating new architecture.

5. Keep the implementation Makko-safe:
   - one mutable Game.state
   - manual save/load in src/game/game.ts
   - scene-local, imperative UI
   - fixed 1920x1080 layout assumptions
   - existing cryo / mission / idle / results surfaces

6. After each completed stage:
   - update NARRATIVE_REWORK.md honestly
   - reflect real completion status only
   - document changed files
   - commit and push

7. Never mark a system complete unless:
   - it exists in runtime
   - it is visible or mechanically consequential to the player
   - it is persisted if it affects progression
   - the docs now truthfully reflect the implementation

EXECUTION PLAN

Execute the work in the exact order defined in IMPLEMENTATION_STATUS_AND_MAKKO_PROMPTS.md:

Step 1. Reality reset and source-of-truth cleanup
- verify/fix persistence gaps
- verify/fix shipClaimProgress persistence
- verify/fix stale terminology and cryo wake-cost mismatches
- verify crew source of truth
- update docs to match reality

Step 2. Make debt a real gameplay system
- turn debt from a UI/story shell into an actual macro loop
- make debt mutate through gameplay
- make billing and thresholds matter

Step 3. Finish debt-gated recruit waking
- make authored recruits materially interact with debt
- enforce debt gating cleanly in cryo flow

Step 4. Implement the actual authored cast
- add the first real set of named recruits from character_bible.md
- do not stop at support hooks only

Step 5. Add recruitment missions and arrival beats
- make named recruits feel acquired through story, not just flagged

Step 6. Implement lead selection and companion slots
- one selected lead
- two companion slots
- persistent, visible, and used by runs

Step 7. Make runs feel different by character
- lead-specific differences
- companion-specific effects
- real run consequences

Step 8. Make sector progression materially change the world
- sectors must change content, not just a number

Step 9. Finish narrative reactivity
- debt, recruit, sector, and aftermath reactions using existing surfaces first

Step 10. Implement doctrine / route identity
- begin the “are we the corporation?” layer as a real system

Step 11. Implement endgame routes and endings
- make the game have an actual narrative destination

Step 12. Final truth pass
- re-audit code vs docs
- correct docs and status honestly
- leave a reliable source of truth

DELIVERY REQUIREMENTS

At each stage:
- explain what was actually implemented
- explain what remains partial
- name the files changed
- run validation/build if available
- commit and push before moving on

If you discover that a later step depends on an incomplete earlier step, stop and finish the earlier dependency first.

If a design target is too large for one pass, implement the smallest real player-facing version and document exactly what remains.
```

---

## Executive Summary

The game is no longer just an early prototype.

It now has:

- the space-scavenger theme shift
- a functioning one-ship-per-run loop
- generic crew / cryo / mission systems
- some station and claim scaffolding
- a real debt/meta/story-state scaffold
- a sector-number scaffold
- narrative announcement hooks via signal log

However, it is **still not fully implemented as designed**.

The most important gap is this:

> The game has the shell of the designed macro loop, but not yet the full player-facing, mechanically consequential version of that loop.

The second biggest gap is:

> The character bible’s cast-driven roguelike layer is still mostly absent from the live game.

### Short verdict

- **Core prototype:** real
- **Debt/meta framework:** started
- **Cast-driven narrative roguelike:** not yet truly live

---

## Status Matrix

## A. Theme / Terminology / Setting Shift

### Implemented
- `spacecraft` / `ship` / `hullIntegrity` terminology in core runtime
- one-ship-per-run state model
- space-salvage setting in tutorial and UI framing

### Partially implemented
- some stale user-facing help text still references old or mismatched card vocabulary

### Not implemented
- none at the core runtime level; theme shift is fundamentally in place

---

## B. Core Run Loop

### Implemented
- select one derelict in hub
- launch one 10-round run
- play tactical cards
- risk collapse
- extract / flee / fail
- discovery events on fixed cadence
- results screen and return to hub

### Partially implemented
- card loop is extremely small and repetitive
- runs do not yet feel heavily differentiated by story, crew, or sector

### Not implemented
- authored derelict event chains
- meaningful run identity based on cast or faction context

---

## C. Card System

### Implemented
- live card model exists
- current cards:
  - `SCAVENGE`
  - `REPAIR`
  - `EXTRACT`
- card costs and resolution exist

### Partially implemented
- risk/reward balance is live but simple
- some card/UI messaging is stale or inconsistent

### Not implemented
- broader card pool
- lead-specific starting cards
- companion/event-specific card modifications

---

## D. Generic Crew / Cryo / Missions

### Implemented
- random crew generation
- cryo pods
- wake flow
- assignments
- role bonuses
- crew XP / loss systems
- generic timed missions

### Partially implemented
- wake-cost UX still appears inconsistent in at least one cryo UI path
- crew source-of-truth remains a little messy (`cryoState` vs legacy arrays)

### Not implemented
- nothing major at the generic crew layer; this part is mostly there

---

## E. Station / Claim / Room Progression

### Implemented
- claim progress scaffolding
- `claimable` ship flag
- ship mode scaffolding
- station conversion helpers
- room data / room costs / room UI helpers

### Partially implemented
- player-facing mine/keep/claim loop is not yet as strong as the docs imply
- room loop still feels more like scaffolding than a central play habit
- some economy and room values are duplicated across files

### Not implemented
- a polished, obviously complete “mine / keep / convert / build / expand station” loop that matches the docs

---

## F. Debt Loop

### Implemented
- `meta` state exists
- debt fields exist
- debt panel exists in hub
- debt threshold warning hooks exist
- billing-cycle announcement hooks exist
- debt/state persistence exists

### Partially implemented
- debt currently behaves more like a **tracked layer** than a fully enforced macro loop
- billing seems to announce more than it truly pressures
- debt consequences are not yet fully integrated into all major growth choices

### Not implemented
- fully live “Outstanding Debt / Debt Ceiling / Payment Due” gameplay pressure
- meaningful debt mutation from all major actions
- debt as the dominant progression gate
- debt-funded station conversion / charter / bailout decisions
- strong default / repossession / freeze consequences

---

## G. Sector Progression

### Implemented
- current sector state exists
- sector unlock tracking exists
- sector number displays in UI/results
- simple unlock progression exists

### Partially implemented
- sector progression is currently more of a **numeric shell** than a meaningful frontier expansion layer
- the world does not yet feel dramatically different by sector

### Not implemented
- charter choice
- financially gated sector expansion
- sector-specific event pools
- materially different hub ecology per sector
- faction pressure escalating by sector

---

## H. Story State / Narrative Tracking

### Implemented
- `StoryState` exists
- save/load integration exists
- debt threshold flags exist
- recruit introduction flags exist
- sector unlock flags exist
- milestone counters exist

### Partially implemented
- story-state infrastructure is stronger than the actual authored narrative using it

### Not implemented
- a large amount of authored story content consuming these flags

---

## I. Authored Recruit Infrastructure

### Implemented
- `CrewMember` has authored hooks (`isAuthored`, `authoredId`)
- cryo system can treat some recruits as story-significant
- recruit-introduction tracking exists

### Partially implemented
- authored recruit support is infrastructural, not content-complete

### Not implemented
- the actual six-character cast from `character_bible.md`
- authored recruit content breadth
- unique recruit mechanics at the gameplay level

---

## J. Character Bible / Playable Cast

### Implemented
- almost nothing from the full character-bible fantasy as a runtime player system

### Partially implemented
- only the authored-recruit hook layer

### Not implemented
- Max / Imani / Jax / Sera / Rook / Del as live in-game recruit content
- play-as lead selection
- 2 companion slots
- lead-specific run packages
- recruit-specific missions
- relationship friction systems
- loyalty arcs
- late-game character voting / alignment / endings

---

## K. Narrative Reactivity

### Implemented
- tutorial voice and premise
- signal log ambient worldbuilding
- some narrative warning/announcement hooks
- some sector/debt text in results

### Partially implemented
- signal-log and results reactivity exist, but are still lightweight
- narrative beats are more broadcast-style than relationship-driven

### Not implemented
- strong post-run hub reactions
- recurring cast conversations
- companion banter
- recruit arrival scenes with real follow-through
- debt statement scenes
- major authored branch consequences

---

## L. Endgame / Doctrine / “Are we the corporation?”

### Implemented
- not meaningfully implemented

### Partially implemented
- only thematic setup in docs and some meta-state direction

### Not implemented
- doctrine tracking
- corporate/co-op/smuggler route identity
- endgame route lock-in
- route-specific endings

---

## M. Persistence / Technical Debt

### Implemented
- save/load exists
- meta state persists
- story state persists

### Partially implemented
- not all runtime progression appears consistently persisted
- some systems still show split ownership or drift

### Not implemented
- a fully trustworthy “all major progression is saved cleanly” guarantee

---

## Critical Inconsistencies To Fix Before Claiming Full Implementation

These are the things most likely to create false confidence:

1. **Docs overstate completion**
   - Phase 7 in `NARRATIVE_REWORK.md` currently reads as far more complete than the player experience likely supports.

2. **Help/UI card terminology is stale**
   - start screen still references old card set language.

3. **Cryo wake-cost display mismatch**
   - at least one cryo UI path still appears inconsistent with actual cost logic.

4. **Ship claim persistence still needs verification/fix**
   - runtime tracks ship claim progress, but save coverage must be verified and fixed if missing.

5. **Debt appears more presentational than systemic**
   - debt fields and warnings exist, but the macro loop still needs real consequences and mutations.

6. **Sector progression is still thin**
   - sector number exists, but sectors do not yet strongly change the world.

7. **Authored recruits are hooks, not cast**
   - support for authored recruits is not the same as implementing the character bible.

---

## Practical Reading: What is Actually “Done”

If you want the most honest shorthand:

### Done enough to build on
- theme shift
- prototype run loop
- generic crew/missions/cryo
- story-state scaffold
- debt/meta scaffold

### Started, but not done
- debt as macro loop
- sector progression
- narrative reactivity
- station/claim loop maturity

### Barely started
- playable/recruitable core cast
- lead/companion system
- loyalty structure
- doctrine/endgame identity

---

## Makko Prompt Pack To Finish The Game Properly

These prompts are written to avoid the earlier problem where docs claimed completion before the player-facing feature was genuinely implemented.

### Global rule for every prompt

Every prompt below assumes the agent must:

1. Read first:
   - `NARRATIVE_REWORK.md`
   - `character_bible.md`
   - `Debt_loop_and_sector_arc.md`
   - `IMPLEMENTATION_STATUS_AND_MAKKO_PROMPTS.md`

2. Compare docs against actual code before changing anything.

3. Not mark a feature complete unless it is:
   - actually implemented in runtime
   - visible or consequential to the player
   - persisted correctly if it affects progression
   - reflected truthfully in docs

4. Update `NARRATIVE_REWORK.md` honestly after completion.

5. Commit and push each logical change.

---

## Prompt 1 — Reality Reset and Source-of-Truth Cleanup

```text
You are working in the Sector Scavengers repository.

First read:
- NARRATIVE_REWORK.md
- character_bible.md
- Debt_loop_and_sector_arc.md
- IMPLEMENTATION_STATUS_AND_MAKKO_PROMPTS.md
- src/types/state.ts
- src/game/game.ts
- src/systems/cryo-system.ts
- src/systems/tactic-card-system.ts

Goal:
Perform a reality-reset and source-of-truth cleanup pass before adding more features.

Requirements:
- Compare code to docs first.
- Fix any doc/code mismatches that would cause future implementation confusion.
- Verify all major progression fields are persisted.
- Verify the single source of truth for crew and ship-claim progression.
- Do not add brand-new gameplay systems yet unless needed to fix broken assumptions.

Specifically:
- verify and fix shipClaimProgress persistence if it is missing
- verify and fix cryo wake-cost display vs actual calculation
- verify and fix any stale start-screen/help-card terminology
- confirm which structures are authoritative for:
  - crew
  - debt/meta state
  - story-state
  - ship claim progress
- update NARRATIVE_REWORK.md so status/checklists reflect reality

Likely files:
- src/game/game.ts
- src/types/state.ts
- src/systems/cryo-system.ts
- src/ui/cryo-ui/frozen-card.ts
- src/scenes/start-scene.ts
- src/systems/tactic-card-system.ts
- NARRATIVE_REWORK.md

Before finishing:
- run validation/build
- document exactly what was fixed
- commit and push
```

---

## Prompt 2 — Make Debt a Real Gameplay System, Not a Display Layer

```text
You are working in the Sector Scavengers repository.

First read:
- Debt_loop_and_sector_arc.md
- IMPLEMENTATION_STATUS_AND_MAKKO_PROMPTS.md
- src/types/state.ts
- src/game/game.ts
- src/systems/idle-system.ts
- src/scenes/idle/render-ui.ts
- src/scenes/results-scene.ts
- src/scenes/idle/cryo-handlers.ts

Goal:
Turn the existing debt/meta scaffold into a real macro loop.

Requirements:
- Debt must mutate through real gameplay, not just appear in UI text.
- Implement the three functional debt numbers where relevant:
  - current debt
  - debt ceiling
  - payment due / billing pressure
- Keep the implementation centralized and persistence-safe.

Implement:
- debt increase on meaningful growth actions
- debt service or debt reduction on successful runs
- billing-cycle effects that do more than announce
- actual consequences at key thresholds (80%, 90%, cap)
- player-facing clarity about what changed and why

Do not mark complete unless:
- debt changes from real actions
- debt affects available options
- results and hub both reflect those consequences
- save/load preserves it

Likely files:
- src/game/game.ts
- src/types/state.ts
- src/systems/idle-system.ts
- src/scenes/results-scene.ts
- src/scenes/idle/render-ui.ts
- src/scenes/idle/cryo-handlers.ts
- src/systems/signal-log-system.ts

Before finishing:
- update docs honestly
- commit and push
```

---

## Prompt 3 — Finish Debt-Gated Recruit Waking Properly

```text
You are working in the Sector Scavengers repository.

First read:
- Debt_loop_and_sector_arc.md
- character_bible.md
- IMPLEMENTATION_STATUS_AND_MAKKO_PROMPTS.md
- src/systems/cryo-system.ts
- src/scenes/idle/cryo-handlers.ts
- src/ui/cryo-ui/*

Goal:
Finish the recruit-waking system so named recruits genuinely deepen the debt loop.

Requirements:
- Named/story recruits must materially increase debt when awakened.
- Generic crew and authored recruits should be clearly distinguished.
- Debt ceiling must be enforced in the wake flow if intended by design.
- UI must explain the consequence before the player commits.

Implement:
- authored recruit debt cost logic
- authored recruit-specific warnings
- debt-based wake denial if over the cap
- signal-log / narrative acknowledgment
- save/load consistency

Do not mark complete unless:
- authored recruit waking changes debt
- the player can see the cost in the cryo UI
- the action is blocked when it should be

Likely files:
- src/systems/cryo-system.ts
- src/scenes/idle/cryo-handlers.ts
- src/ui/cryo-ui/frozen-card.ts
- src/ui/cryo-ui/panel.ts
- src/game/game.ts
- src/systems/signal-log-system.ts

Before finishing:
- update docs honestly
- commit and push
```

---

## Prompt 4 — Implement the Actual Authored Recruit Cast

```text
You are working in the Sector Scavengers repository.

First read:
- character_bible.md
- IMPLEMENTATION_STATUS_AND_MAKKO_PROMPTS.md
- src/types/crew.ts
- src/systems/cryo-system.ts
- src/scenes/idle/cryo-handlers.ts
- src/ui/cryo-ui/*

Goal:
Replace the current minimal authored-recruit hook layer with the real initial cast implementation.

Requirements:
- Start with a smaller production-safe subset if needed, but it must be based on the actual character bible.
- The cast should not just be flags; each recruit needs real authored metadata and visible identity.
- Reuse existing cryo/recruit surfaces where practical.

Implement at minimum:
- authored recruit definitions for the first wave of named characters
- names, bios, roles, authored IDs
- recruit-specific cryo presentation
- clear distinction from generic crew
- the data structure needed for later recruitment missions and party selection

Likely files:
- src/types/crew.ts
- src/systems/cryo-system.ts
- src/ui/cryo-ui/frozen-card.ts
- src/ui/cryo-ui/awake-card.ts
- src/ui/cryo-ui/panel.ts

Before finishing:
- update docs honestly
- commit and push
```

---

## Prompt 5 — Add Recruitment Missions and Arrival Beats

```text
You are working in the Sector Scavengers repository.

First read:
- character_bible.md
- IMPLEMENTATION_STATUS_AND_MAKKO_PROMPTS.md
- src/scenes/idle/index.ts
- src/scenes/idle/cryo-handlers.ts
- src/scenes/results-scene.ts
- src/dialogue/story-state.ts
- src/systems/signal-log-system.ts

Goal:
Make named recruits feel like rescued people and story events, not upgraded generic crew.

Requirements:
- Recruits should arrive through authored conditions, not just existing as preloaded cryo flavor.
- Use existing UI/narrative surfaces where possible.
- Keep file count low.

Implement:
- first-wave recruit acquisition conditions
- recruit arrival beats
- story-state tracking of recruit arrival and follow-up
- post-recruit hub feedback

Do not mark complete unless:
- at least one named recruit has a real arrival path
- that arrival changes what the player sees and knows

Likely files:
- src/game/game.ts
- src/dialogue/story-state.ts
- src/scenes/idle/cryo-handlers.ts
- src/scenes/results-scene.ts
- src/systems/signal-log-system.ts
- src/scenes/idle/index.ts

Before finishing:
- update docs honestly
- commit and push
```

---

## Prompt 6 — Implement Lead Selection and Companion Slots

```text
You are working in the Sector Scavengers repository.

First read:
- character_bible.md
- IMPLEMENTATION_STATUS_AND_MAKKO_PROMPTS.md
- src/types/state.ts
- src/scenes/idle/index.ts
- src/scenes/depth-dive-scene.ts
- src/types/cards.ts
- src/game/game.ts

Goal:
Implement the actual “play as / play with” structure from the character bible.

Requirements:
- Support one selected lead and two companion slots.
- The system must be persistent and visible in the hub.
- The run should know who is leading and who is accompanying.
- Start with a simple but real implementation rather than a placeholder.

Implement:
- lead selection state
- companion slot state
- pre-run setup UI in the hub
- state passed into runs
- minimal mechanical differences by lead/companion

Do not mark complete unless:
- the player can choose a lead before a run
- the player can assign companions
- those choices alter the run in a visible way

Likely files:
- src/types/state.ts
- src/game/game.ts
- src/scenes/idle/index.ts
- src/scenes/idle/render-ui.ts
- src/scenes/idle/input-handler.ts
- src/scenes/depth-dive-scene.ts
- src/types/crew.ts

Before finishing:
- update docs honestly
- commit and push
```

---

## Prompt 7 — Make Runs Feel Different by Character

```text
You are working in the Sector Scavengers repository.

First read:
- character_bible.md
- IMPLEMENTATION_STATUS_AND_MAKKO_PROMPTS.md
- src/scenes/depth-dive-scene.ts
- src/systems/tactic-card-system.ts
- src/systems/discovery-event-system.ts
- src/types/cards.ts

Goal:
Add real run differentiation driven by lead and companion identity.

Requirements:
- This must be more than flavor text.
- Lead/companion choice should affect what the player can do, find, or survive.
- Keep the first pass focused and maintainable.

Implement:
- lead-specific starting advantages
- companion-based modifiers or event hooks
- at least one visible run-level choice or branch unlocked by character identity

Do not mark complete unless:
- two different leads feel mechanically different in a run
- companion choice matters in a real scenario

Likely files:
- src/scenes/depth-dive-scene.ts
- src/systems/tactic-card-system.ts
- src/systems/discovery-event-system.ts
- src/types/cards.ts
- src/types/crew.ts

Before finishing:
- update docs honestly
- commit and push
```

---

## Prompt 8 — Make Sector Progression Change the World, Not Just the Number

```text
You are working in the Sector Scavengers repository.

First read:
- Debt_loop_and_sector_arc.md
- IMPLEMENTATION_STATUS_AND_MAKKO_PROMPTS.md
- src/game/game.ts
- src/systems/hub-system.ts
- src/scenes/results-scene.ts
- src/scenes/idle/index.ts

Goal:
Upgrade sector progression from a thin shell into meaningful world progression.

Requirements:
- Sector progression must change what the player sees and does.
- It should not just increment a number after a mission count threshold.
- Tie progression to both gameplay progress and macro pressure where possible.

Implement:
- sector-specific hub population behavior
- sector-specific opportunity/risk changes
- stronger sector unlock conditions
- clearer sector arrival feedback

Do not mark complete unless:
- moving to a new sector materially changes the game experience

Likely files:
- src/game/game.ts
- src/systems/hub-system.ts
- src/scenes/idle/index.ts
- src/scenes/idle/render-ui.ts
- src/scenes/results-scene.ts
- src/config/economy-config.ts

Before finishing:
- update docs honestly
- commit and push
```

---

## Prompt 9 — Finish Narrative Reactivity with Existing Surfaces

```text
You are working in the Sector Scavengers repository.

First read:
- NARRATIVE_REWORK.md
- character_bible.md
- Debt_loop_and_sector_arc.md
- IMPLEMENTATION_STATUS_AND_MAKKO_PROMPTS.md
- src/dialogue/story-state.ts
- src/scenes/results-scene.ts
- src/scenes/idle/index.ts
- src/systems/signal-log-system.ts

Goal:
Turn the current narrative shell into a real reactive layer using the existing UI and scene architecture.

Requirements:
- Prefer existing surfaces:
  - signal log
  - results scene
  - hub UI
  - lightweight modal or scene-local reactions
- Do not add a huge new narrative framework unless absolutely necessary.

Implement:
- debt statement beats
- recruit reaction beats
- sector unlock beats
- hub reactions tied to story-state
- at least light companion/lead commentary after major outcomes

Do not mark complete unless:
- the player clearly feels that the game remembers what happened

Likely files:
- src/dialogue/story-state.ts
- src/scenes/results-scene.ts
- src/scenes/idle/index.ts
- src/scenes/idle/render-ui.ts
- src/systems/signal-log-system.ts
- src/game/game.ts

Before finishing:
- update docs honestly
- commit and push
```

---

## Prompt 10 — Implement Doctrine / Route Identity

```text
You are working in the Sector Scavengers repository.

First read:
- Debt_loop_and_sector_arc.md
- character_bible.md
- IMPLEMENTATION_STATUS_AND_MAKKO_PROMPTS.md
- src/types/state.ts
- src/game/game.ts
- src/dialogue/story-state.ts

Goal:
Implement the first real version of the long-term operating identity system.

Requirements:
- Avoid a simplistic morality bar.
- Use the doctrine/route framing from the design:
  - corporate / compliance
  - solidarity / co-op
  - predatory / smuggler / exploitative route
- This system must influence real outcomes.

Implement:
- doctrine tracking
- doctrine shifts caused by player choices
- lightweight gameplay or narrative consequences of doctrine

Do not mark complete unless:
- the player can begin steering the station toward a route identity
- the game acknowledges that route

Likely files:
- src/types/state.ts
- src/game/game.ts
- src/dialogue/story-state.ts
- src/scenes/results-scene.ts
- src/scenes/idle/index.ts

Before finishing:
- update docs honestly
- commit and push
```

---

## Prompt 11 — Implement Endgame Routes and Endings

```text
You are working in the Sector Scavengers repository.

First read:
- character_bible.md
- Debt_loop_and_sector_arc.md
- IMPLEMENTATION_STATUS_AND_MAKKO_PROMPTS.md
- src/game/game.ts
- src/scenes/results-scene.ts
- src/dialogue/story-state.ts

Goal:
Implement the first real endgame payoff for the designed narrative structure.

Requirements:
- Endings must emerge from:
  - debt and sector progression
  - route/doctrine identity
  - character-state / recruit-state
- Keep the first pass achievable, but real.

Implement:
- ending conditions
- ending route recognition
- at least one real endgame branch with player-facing payoff

Do not mark complete unless:
- the game has a visible narrative destination beyond endless repetition

Likely files:
- src/game/game.ts
- src/scenes/results-scene.ts
- src/dialogue/story-state.ts
- new scene files only if absolutely necessary

Before finishing:
- update docs honestly
- commit and push
```

---

## Prompt 12 — Final Truth Pass

```text
You are working in the Sector Scavengers repository.

First read:
- NARRATIVE_REWORK.md
- character_bible.md
- Debt_loop_and_sector_arc.md
- IMPLEMENTATION_STATUS_AND_MAKKO_PROMPTS.md

Goal:
Perform a final truth pass so the docs, code, and player-facing implementation all agree.

Requirements:
- Do not accept “scaffold exists” as equivalent to “feature complete.”
- Re-audit the code against the three design docs.
- Correct any status claims that are still too optimistic.
- Document exactly what remains partial or future work.

Deliver:
- a final implemented / partial / missing checklist
- corrected status in NARRATIVE_REWORK.md
- any final cleanup needed for maintainability

Before finishing:
- validate build
- commit and push
```

---

## Recommended Order

Run the prompts in this order:

1. Reality reset
2. Make debt real
3. Finish debt-gated waking
4. Implement the actual cast
5. Add recruitment missions and arrival beats
6. Lead + companion system
7. Character-driven run differentiation
8. Make sectors materially different
9. Finish narrative reactivity
10. Add doctrine / route identity
11. Implement endings
12. Final truth pass

---

## Final Advice

The main way to avoid “missing stuff like we just did” is:

- never trust the design doc’s completion state without checking code
- never treat scaffolding as full implementation
- never mark a system complete unless the player can actually feel it

That rule matters more than any single prompt.

