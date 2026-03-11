# IMPLEMENTATION VS DESIGN GAPS

## Executive Summary

This report compares the latest `main` branch implementation against the intended design captured in:

- `NARRATIVE_REWORK.md`
- `character_bible.md`
- `Debt_loop_and_sector_arc.md`

Based on the latest `origin/main` snapshot inspected for this report (`6c99993`, `pre7.9`), the game is still much closer to a **systems-first prototype** than to the designed **debt-driven narrative roguelike**.

### Quick Read: What the game actually is today

Right now, the live game is:

- a **single-target 10-round salvage run**
- launched from a **hub with passive energy generation**
- supported by **generic cryo crew**
- expanded by **generic missions**
- flavored by a strong **tutorial premise** and a **random signal ticker**
- lightly extended by **station / room / claim scaffolding**

### Quick Read: What it is not yet

It is **not yet** the designed version where:

- debt is the macro loop
- named recruits drive the story
- sectors unlock through pressure and progression
- the hub reacts narratively to what happened
- runs feel distinct because of lead selection, companion friction, and authored events

### The 5 biggest gaps

1. **Debt is still fiction, not system**
   - The tutorial talks about a $1M debt, but the live runtime has no debt, debt ceiling, payment due, billing cycle, or debt-gated growth loop.

2. **The playable cast does not exist yet**
   - The character bible defines a six-character ensemble with lead/companion structure, but the game still uses generic random crew in cryo pods.

3. **Sector progression is not live**
   - There is no real current-sector runtime, no charter choice, and no sector-based world progression in the actual hub loop.

4. **Narrative reactivity is still very thin**
   - Outside the tutorial, the game mostly communicates through a random signal log and mechanical results screens rather than authored reactions, arrivals, warnings, or consequences.

5. **Some features marked complete in the docs are only partial in code**
   - The docs now imply major Phase 7 progress is done, but the live code does not match those claims in several core areas.

### Bottom line

The current implementation has a strong **theme**, a clear **prototype loop**, and useful **progression scaffolding**, but it has **not yet crossed into the designed identity** of:

> a debt-fueled, character-driven, sector-spanning roguelike with real narrative consequence

---

## What the game actually does today

To understand the gaps clearly, it helps to state the current loop plainly.

### Current live loop

1. Start at title screen
2. Play tutorial or skip it
3. Enter idle hub
4. Let owned ships generate passive energy
5. Wake generic cryo crew with power cells
6. Send generic crew on timed missions
7. Select one derelict ship from the board
8. Start a 10-round Depth Dive
9. Play from a tiny card set:
   - `SCAVENGE`
   - `REPAIR`
   - `EXTRACT`
10. Trigger fixed discovery beats on rounds 3/6/9
11. End in success or hull breach
12. Return to results screen
13. Optionally share / claim `$PLAY`
14. Return to hub and repeat

This loop is coherent enough to play, but it does not yet deliver the long-form fantasy the design docs describe.

---

## Detailed Gap Analysis

## 1. Macro Loop / Debt

### Designed target

The intended game loop in `Debt_loop_and_sector_arc.md` is:

- wake into debt
- take runs to stay solvent
- pay debt down or leverage harder
- wake more people into debt
- expand stations to increase debt capacity
- expand into new sectors under financial pressure

The docs describe three core debt numbers:

- **Outstanding Debt**
- **Debt Ceiling**
- **Payment Due**

plus:

- billing cycles
- debt pressure
- over-cap/default states
- debt-gated recruit waking
- debt-gated expansion

### Actual implementation

The live `GameState` still contains:

- energy
- resources
- inventory
- missions
- cryo state
- death currency
- deck unlock progress
- ship claim progress

It does **not** contain:

- debt
- debt ceiling
- billing timer
- payment due
- sector debt package logic
- doctrine / operating model

### Gap

This is the single largest mismatch in the project.

The designed game says:

> debt is the macro loop

The live game says:

> energy and generic progression are the macro loop

### Why this matters

Without debt as a real runtime system:

- the $1M opening premise has no gameplay consequence
- waking crew remains mostly upside
- expansion has no moral or financial tension
- late-game identity drift (“are we the corporation?”) has no mechanical support

### Status

**Major missing system**

---

## 2. Run Loop / Cards

### Designed target

The intended run loop evolves into something more distinctive through:

- lead selection
- companion slots
- event choices
- story-driven derelicts
- authored outcomes
- different narration tones

### Actual implementation

The live run loop is still:

- one derelict per run
- ten rounds
- tiny card draft
- fixed discovery cadence
- flee / extract / collapse

The actual card set remains:

- `SCAVENGE`
- `REPAIR`
- `EXTRACT`

### Gap

Mechanically, the prototype loop works.

Narratively, it is still underpowered compared to the design target because:

- there is no playable lead selection
- no companion structure
- no authored event branches
- no derelict-specific story payloads
- no character-specific run feel

### Additional mismatch

Some UI/help copy and documentation still imply older or broader card logic than the live card set supports.

### Status

**Prototype loop exists, but designed differentiation layer is missing**

---

## 3. Crew / Recruits / Playable Characters

### Designed target

The character bible defines:

- 6 core recruitable characters
- V.A.L.U. as anchor
- 2 companion slots
- lead-based run identity
- recruitment hooks
- loyalty arcs
- relationship friction
- endings shaped by the cast

### Actual implementation

Crew are still:

- random names
- random stats
- generic roles
- awake/asleep
- assignable to ship / room / mission

Cryo pods generate generic crew procedurally.

### Gap

The live game has **crew systems**, but not a **cast system**.

That means:

- no authored recruits
- no named lead selection
- no companion dynamics
- no personal mission chains
- no strong social web in the hub

### Important technical note

There is still crew-state drift in the underlying architecture:

- cryo pod crew is one live source of truth
- `crewRoster` still exists separately

That makes this area especially risky to expand until cleaned up properly.

### Status

**Generic crew system exists; authored recruit system is absent**

---

## 4. Ship / Station / Room Progression

### Designed target

The rework doc frames these as largely complete:

- mine vs keep
- ship claim progress
- station conversion
- room system
- room bonuses

### Actual implementation

Pieces exist:

- `claimable` ship state
- ship claim progress
- conversion helpers
- room UI helpers
- room system code

But the live player-facing loop still appears incomplete in important ways:

- claim progression is not surfaced strongly
- mine/keep does not feel like a full decision loop
- room build/upgrade interaction appears only partially wired
- station management is not yet a strong live pillar of play

### Gap

This is best described as:

**implemented scaffolding, partially realized player loop**

### Why this matters

The debt and sector designs both assume station ownership is a core progression pillar.

If station flow is still partial or awkward:

- debt ceiling logic won’t feel grounded
- sector growth won’t feel earned
- the “becoming management” question loses force

### Status

**Partially implemented / partially surfaced**

---

## 5. Sector Progression

### Designed target

The debt/sector design wants:

- current sector state
- sector unlock conditions
- charter decisions
- risk/reward differences
- broader frontier expansion
- sector identity

### Actual implementation

The live game currently has:

- sector references in flavor text
- “Sector Patrol” mission naming
- tutorial mention of Sector 7

But no robust sector runtime system.

### Gap

There is no meaningful difference yet between:

- playing in one place
and
- expanding across a frontier

### Why this matters

Without sectors:

- the game remains local rather than expansive
- the debt loop has nowhere to scale
- long-form world progression remains flat

### Status

**Mostly absent**

---

## 6. Narrative / Reactivity

### Designed target

The intended game relies on:

- post-run hub reactions
- recruit arrival scenes
- debt warnings
- billing statements
- sector progression beats
- V.A.L.U. continuity
- character friction
- authored aftermath

### Actual implementation

Current narrative strength is concentrated in:

- the tutorial
- V.A.L.U.’s voice
- ambient ticker flavor

Outside that, the game is mostly:

- systemic
- UI-driven
- mechanically informative

rather than narratively reactive.

### Gap

This is the second biggest content gap after debt.

The game has a good setup, but not enough ongoing authored response.

### Why this matters

Right now the game’s best-written material is front-loaded.

A premium narrative roguelike needs the opposite:

- hook in the opening
- deepen in the middle
- pay off in repetition

### Status

**Strong premise, weak post-tutorial narrative follow-through**

---

## 7. UI / UX

### Designed target

The Phase 7 design implies the hub should eventually surface:

- debt status
- payment due
- billing countdown
- recruit consequences
- sector progression
- later doctrine / route identity

### Actual implementation

The current UI is still centered on:

- energy
- crew
- inventory
- missions
- viral multiplier
- dive actions

### Gap

The current UI still communicates:

> “optimize your systems”

more than:

> “survive the weight of your decisions”

### Additional UX issue

Some current UI copy and interaction details appear inconsistent or stale:

- card/help terminology drift
- cryo wake-cost display mismatch
- system/UI assumptions not always aligned

### Status

**Functional prototype UI, but not yet aligned with the target macro fantasy**

---

## 8. Persistence / Technical Debt

### Designed claim

The rework doc says:

- technical debt: none currently

### Actual reality

There is meaningful tech debt in:

- manual save/load coverage
- duplicated systems
- crew source-of-truth drift
- room/economy duplication
- incomplete station/claim surfacing

### Why this matters

The Phase 7 design assumes the codebase can safely absorb:

- debt systems
- recruit metadata
- sector progression
- narrative flags

But those additions will be fragile unless core state and ownership are made more reliable first.

### Status

**Real technical debt exists and should be acknowledged explicitly**

---

## Places Where the Docs Overstate Progress

This is important, because it changes how future work should be planned.

## 1. Phase 7 completion status is misleading

The docs in `main` now show:

- P7.1 through P7.8 completed

But the live code still does not show those systems in the way the docs describe.

### Most obvious examples

- no debt meta state in runtime
- no authored recruit fields in live crew
- no debt HUD
- no billing loop
- no sector shell in live runtime

## 2. Room/station system is overstated

The docs present it as complete, but live interaction still appears partial.

## 3. Power-cell and wake-cost UX is overstated

The logic and display are not fully aligned.

## 4. “Technical debt: none” is not credible anymore

That line should be removed or replaced.

---

## What is actually in good shape

This report is mostly about gaps, but several foundations are good:

### Strong existing strengths

- tutorial premise and tone
- V.A.L.U. voice
- one-ship-per-run clarity
- generic crew/mission systems
- cryo concept
- station/scavenger fantasy foundations
- signal log as a cheap reactive surface
- save system that is at least understandable, even if manual

These are good prototype foundations.

The issue is not that the game lacks structure.
The issue is that the **designed identity layer has not yet been fully built on top of that structure**.

---

## Recommended Priority Order From Here

If the goal is to bring implementation back in line with the design docs, the next priorities should be:

## 1. Make the docs truthful again

Before anything else:

- update `NARRATIVE_REWORK.md` so it reflects actual implementation
- stop marking systems complete if they are still scaffolding

This matters because bad status docs create bad implementation planning.

## 2. Finish the macro loop before broadening content

In order:

- debt state
- billing cycle
- debt HUD
- debt consequences

Without these, the rest of the design will not feel coherent.

## 3. Unify crew before adding the authored cast

Then:

- clean source of truth
- add authored recruit metadata
- add recruitment hooks
- add basic post-run reactions

## 4. Make station/claim progression truly playable

This is required before:

- debt ceilings tied to assets
- sector progression tied to infrastructure

## 5. Add sector shell only after the above

Sectors should come after:

- debt exists
- assets matter
- recruits matter

Otherwise sector progression will just be another label.

---

## Final Assessment

The current main branch has:

- strong thematic direction
- a real playable prototype
- useful scaffolding for crew, missions, cryo, ships, and results

But it does **not yet match the design documents’ implied state of completion**.

The biggest truth to hold onto is:

> The game is not missing polish first. It is still missing core identity systems.

Those systems are:

- debt as progression pressure
- authored recruits as the emotional core
- sectors as true expansion
- reactive narrative as the glue between runs

Until those are live, the game will continue to feel more like:

- a promising systems prototype with strong worldbuilding

than:

- the premium narrative roguelike the design docs describe

