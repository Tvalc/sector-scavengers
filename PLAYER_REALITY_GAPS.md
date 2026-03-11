# PLAYER REALITY GAPS

## Purpose

This document translates the current game from the player's point of view instead of the system designer's point of view.

It is based on the latest live `main` branch behavior and the actual experience of trying to play the game:

- the dive only offers the same 3 cards
- card unlocks are not understandable
- debt is visible but not meaningful
- mission control signals work that the player cannot do
- wake buttons can appear broken
- inventory and loot do not explain themselves
- repair does not clearly matter in the current run
- the UI communicates menus, not a coherent game

This document does 3 things:

1. explains why the game does **not feel real yet**
2. gives a **concrete implementation order** to fix that
3. provides **Makko prompts** that should bridge these exact player-reality gaps

---

## Executive Summary

Right now, the game has the shape of a game but not the **connected meaning** of one.

The player can click through:

- a hub
- cryo
- missions
- a dive
- a results screen

but the systems do not yet explain each other well enough for the player to understand:

- what matters
- what they are trying to accomplish
- why choices matter
- what changed because of what they did

### The simplest diagnosis

The current build feels like:

> a series of partially connected feature screens

rather than:

> a single economy-and-survival loop where every action feeds the next one

### The 7 biggest player-reality gaps

1. **The card system promises progression, but the player only ever sees the same 3 cards**
2. **The dive UI does not explain what matters or why**
3. **Debt is displayed, but not yet felt as the central game pressure**
4. **Mission and cryo UI can signal action when the player cannot actually act**
5. **Loot and inventory do not form a believable loop**
6. **Repair and extraction do not clearly connect to the player’s real goals**
7. **The game still communicates features separately instead of a single coherent survival economy**

### What must happen first

Before adding more sectors, more narrative, or more art polish, the game needs to become legible and mechanically honest.

The first milestone is not “more content.”

The first milestone is:

> **make every major UI action produce a visible, understandable consequence**

That means:

- if the player cannot do something, the game must explain why
- if the player gains something, the game must show where it went
- if the player is progressing something, the game must show the path
- if a number matters, the game must define what it means

---

## Part 1: What makes the current game feel unreal

## 1. The card loop is hard-locked and misleading

### Reality

The player only sees:

- `SCAVENGE`
- `REPAIR`
- `EXTRACT`

every dive.

That is not a player misunderstanding. It is how the current code works.

### Why it feels fake

The UI and progression imply:

- deck building
- unlockable cards
- evolving tactics

But the live run keeps presenting the same 3 actions forever.

Even worse:
- there is an unlock system in code
- but unlocked “cards” are not integrated into the playable card pool

So the player experiences:

> “the game says I unlock cards, but I never actually get to use different cards”

That destroys trust immediately.

### Player-facing effect

The run feels solved after one session.

---

## 2. The dive UI does not tell the player what the run is for

### Reality

The dive shows:

- a risk meter
- cards
- extracted value
- a tiny map
- a round counter

But it does not answer the player's real questions:

- what is the run goal?
- am I trying to make money?
- am I trying to reduce debt?
- am I trying to claim a ship?
- am I trying to find loot?
- which action is “good” for my long-term outcome?

### Why it feels fake

The systems may have internal logic, but the player cannot build a mental model of:

- present choice -> immediate effect -> long-term consequence

Without that, the dive feels like symbolic buttons instead of strategy.

---

## 3. Debt exists as a display, not yet as a lived gameplay truth

### Reality

Debt is visible in the hub and referenced in the fiction.

But the player does not yet strongly feel:

- how debt changes
- what debt blocks
- what debt forces
- how a run actually affects debt

### Why it feels fake

A visible debt bar with weak consequences reads like:

> decorative economy

not:

> oppressive survival contract

If debt is supposed to be the game’s identity, it cannot just be a panel.

---

## 4. Action signals are untrustworthy

### Reality

Examples:

- mission control shows a red dot even when the player cannot start a mission
- cryo shows wake buttons that may silently fail
- systems present opportunities that are not actually actionable

### Why it feels fake

The UI is telling the player:

> “there is something useful here”

when the actual state is:

> “you cannot do this yet”

That creates repeated false affordances.

The player stops trusting the interface.

---

## 5. Loot does not resolve cleanly into inventory and meaning

### Reality

The player can find things like “alien tech,” but:

- it does not clearly explain what it is
- it does not reliably become a visible item in inventory
- inventory itself is very abstract and abbreviated

### Why it feels fake

Loot is only satisfying when the player can answer:

- what did I find?
- where did it go?
- what does it do?
- why is it good?

If any of those answers are missing, loot feels imaginary.

---

## 6. Repair does not clearly matter enough in the current moment

### Reality

`REPAIR` currently seems tied more to:

- hull value
- persistence
- future ship progression

than to:

- immediate run survival
- immediate risk reduction

### Why it feels fake

The player sees:

- collapse risk still at 35%
- repair message
- no obvious protection gain

So the action reads like:

> “I clicked a maintenance button and a number somewhere maybe changed”

instead of:

> “I bought myself survival and future value”

---

## 7. The game still behaves like separated menus

### Reality

Hub, missions, cryo, cards, inventory, results, debt, and loot all exist, but the causal chain between them is still weak in player experience.

### Why it feels fake

A real game loop feels like:

- I do X because I need Y
- Y unlocks Z
- Z changes how my next run works
- that pushes me toward my next meaningful problem

Right now, too often the player instead experiences:

- open panel
- click thing
- maybe some number changes
- next screen

That is exactly what “unconnected menus” feels like.

---

## Part 2: Concrete implementation order to make the game feel real

This order is intentionally based on **player trust**, not design ambition.

Do not start by adding more big systems.
Start by fixing the places where the current game lies, confuses, or drops consequences.

---

## Priority 1 — Make the existing loop honest

### Goal

Fix the places where the game suggests something that is not actually true, usable, or meaningful.

### Tasks

#### 1. Fix the card/progression lie

The game must do one of these immediately:

- either implement real new playable cards
- or remove/hide card unlock messaging until they exist

**Files to inspect / edit**
- `src/types/cards.ts`
- `src/systems/tactic-card-system.ts`
- `src/scenes/depth-dive-scene.ts`
- `src/scenes/results-scene.ts`
- `src/scenes/start-scene.ts`

**Acceptance criteria**
- if a card can unlock, it must become playable
- if only 3 cards exist, the UI/help must say so honestly
- the player can tell what is currently available and what is future content

#### 2. Fix cryo wake affordance

**Files to inspect / edit**
- `src/systems/cryo-system.ts`
- `src/scenes/idle/cryo-handlers.ts`
- `src/ui/cryo-ui/frozen-card.ts`
- `src/ui/cryo-ui/panel.ts`

**Acceptance criteria**
- wake cost displayed equals wake cost charged
- failed wake attempts show visible feedback
- button disabled state is truthful
- player knows whether failure was:
  - not enough power cells
  - debt cap
  - some other blocker

#### 3. Fix mission notification honesty

**Files to inspect / edit**
- `src/scenes/idle/mission-handlers.ts`
- `src/ui/mission-ui.ts`
- `src/scenes/idle/render-ui.ts`

**Acceptance criteria**
- notification only appears when player can do something meaningful
- mission UI clearly says what is missing if blocked
- “need crew” is visible before opening or clearly inside the panel

#### 4. Fix item resolution and inventory truth

**Files to inspect / edit**
- `src/systems/tactic-card-system.ts`
- `src/types/items.ts`
- `src/types/inventory.ts`
- `src/game/game.ts`
- `src/scenes/idle/render-ui.ts`

**Acceptance criteria**
- all discovered item IDs map to real item definitions
- run loot transfers to inventory visibly and correctly
- player can identify what each item is
- player can see what bonuses are active

---

## Priority 2 — Make the run explain itself

### Goal

Make every dive communicate:

- what the player is doing
- why it matters
- how actions affect immediate and long-term goals

### Tasks

#### 5. Redesign dive UI around meaning

**Files to inspect / edit**
- `src/scenes/depth-dive-scene.ts`
- `src/ui/theme.ts`

**Acceptance criteria**
- player can tell:
  - current run objective
  - extracted value meaning
  - debt relevance
  - claim progress relevance
  - current ship impact
- `REPAIR`, `SCAVENGE`, `EXTRACT` each explain:
  - immediate outcome
  - long-term outcome

#### 6. Make `REPAIR` matter now, not just later

**Files to inspect / edit**
- `src/systems/tactic-card-system.ts`
- `src/scenes/depth-dive-scene.ts`
- `src/types/state.ts`

**Acceptance criteria**
- repair changes something the player can feel in the current run
- ideally collapse risk, safety buffer, or protection state visibly changes
- player can understand why choosing repair over scavenge is rational

#### 7. Make results communicate the economy honestly

**Files to inspect / edit**
- `src/scenes/results-scene.ts`
- `src/game/game.ts`

**Acceptance criteria**
- results clearly say:
  - what was earned
  - what went to debt
  - what was retained
  - what changed for the next loop
- “total” has an understandable label

---

## Priority 3 — Make debt the actual macro loop

### Goal

Turn debt from a themed display into the player’s main strategic pressure.

### Tasks

#### 8. Make debt mutate from real gameplay

**Files to inspect / edit**
- `src/game/game.ts`
- `src/systems/idle-system.ts`
- `src/scenes/results-scene.ts`
- `src/scenes/idle/render-ui.ts`

**Acceptance criteria**
- debt changes from:
  - run outcomes
  - recruit waking
  - major progression actions
- player sees why
- debt affects what the player can do next

#### 9. Make billing cycles create pressure

**Files to inspect / edit**
- `src/systems/idle-system.ts`
- `src/game/game.ts`
- `src/systems/signal-log-system.ts`

**Acceptance criteria**
- billing is not just announced
- unpaid/overdue/near-cap states change the game
- player feels urgency

---

## Priority 4 — Connect cast, progression, and runs

### Goal

Move from generic crew sim to character-driven roguelike.

### Tasks

#### 10. Implement the real cast, not just authored hooks

**Files to inspect / edit**
- `src/types/crew.ts`
- `src/systems/cryo-system.ts`
- `src/scenes/idle/cryo-handlers.ts`
- `src/ui/cryo-ui/*`

**Acceptance criteria**
- first-wave named recruits are live
- they are visibly distinct from generic crew
- they carry authored identity, not just flags

#### 11. Add lead / companion structure

**Files to inspect / edit**
- `src/types/state.ts`
- `src/game/game.ts`
- `src/scenes/idle/index.ts`
- `src/scenes/idle/render-ui.ts`
- `src/scenes/depth-dive-scene.ts`

**Acceptance criteria**
- player can choose who they are playing as
- player can choose who they bring
- those choices visibly matter

#### 12. Add post-run reaction layer

**Files to inspect / edit**
- `src/dialogue/story-state.ts`
- `src/scenes/results-scene.ts`
- `src/scenes/idle/index.ts`
- `src/systems/signal-log-system.ts`

**Acceptance criteria**
- the game remembers what happened
- recruits and systems respond
- the hub feels alive

---

## Priority 5 — Make sectors real

### Goal

A new sector should feel like new territory, not a number.

### Tasks

#### 13. Make sectors materially alter content

**Files to inspect / edit**
- `src/game/game.ts`
- `src/systems/hub-system.ts`
- `src/scenes/results-scene.ts`
- `src/config/economy-config.ts`

**Acceptance criteria**
- sector progression changes:
  - opportunities
  - difficulty
  - rewards
  - world flavor

#### 14. Gate sector growth through actual debt and infrastructure

**Files to inspect / edit**
- `src/game/game.ts`
- `src/types/state.ts`
- `src/scenes/idle/render-ui.ts`

**Acceptance criteria**
- expansion is a real decision
- debt and assets matter
- the player feels the cost of growth

---

## Part 3: Specific Makko prompts to bridge these gaps

These prompts are meant for Makko as an implementation agent, not a brainstorming assistant.

They are grounded in the actual problems you just surfaced.

---

## Master prompt: make the game feel real

```text
You are working on the latest main branch of Sector Scavengers.

Read first:
- NARRATIVE_REWORK.md
- character_bible.md
- Debt_loop_and_sector_arc.md
- IMPLEMENTATION_STATUS_AND_MAKKO_PROMPTS.md
- PLAYER_REALITY_GAPS.md

Your goal is to make the game feel like a real connected game rather than a set of unconnected menus.

The current player-reality problems that must guide your work are:
- the player only sees the same 3 cards every run
- card unlocks are not understandable or truly playable
- wake buttons can fail with no visible explanation
- mission control shows a red notification even when the player cannot act
- “alien tech” and similar loot do not clearly resolve into inventory and value
- repair does not visibly matter enough in the current run
- the results screen does not clearly explain what “total” means or why it matters
- debt is visible but not yet deeply felt as the main macro loop
- the UI is functionally present but the systems still feel disconnected

Rules:
1. Do not trust docs without checking code.
2. Do not mark a system complete unless the player can feel it.
3. Prioritize player comprehension and consequence over adding more surface area.
4. Keep file count low and work inside the current architecture.
5. Commit and push each logical change after updating docs honestly.

Implementation order:
1. Fix lying/misleading UI and dead affordances
2. Make the 3-card loop honest and understandable
3. Make loot and inventory real
4. Make repair matter in the current run
5. Make results and debt consequences readable
6. Strengthen the real debt loop
7. Only then expand into the cast-driven and sector-driven design

When in doubt, prefer:
- fewer fake systems
- more truthful systems
```

---

## Prompt 1: Fix the current player-trust breakers

```text
You are working on Sector Scavengers.

Read first:
- PLAYER_REALITY_GAPS.md
- src/systems/cryo-system.ts
- src/scenes/idle/cryo-handlers.ts
- src/ui/cryo-ui/frozen-card.ts
- src/scenes/idle/mission-handlers.ts
- src/scenes/start-scene.ts

Goal:
Fix the most obvious places where the game lies to the player or silently fails.

Fix:
- wake button cost mismatch and silent failure
- mission notification showing when nothing is actionable
- stale help text that references the wrong card set and wrong risk behavior

Do not add new systems yet.
Just make the existing game more truthful and understandable.

Before finishing:
- validate the UI behavior manually if possible
- update docs honestly
- commit and push
```

---

## Prompt 2: Make card unlocks either real or invisible

```text
You are working on Sector Scavengers.

Read first:
- PLAYER_REALITY_GAPS.md
- src/types/cards.ts
- src/systems/tactic-card-system.ts
- src/scenes/depth-dive-scene.ts
- src/scenes/results-scene.ts

Goal:
Resolve the fake-feeling card progression problem.

The player currently only sees the same 3 cards forever, but the game suggests card unlock progression exists.

Choose one valid path:
1. implement at least the first real unlockable cards so they can actually appear in drafts and be played
OR
2. hide/remove card-unlock messaging until that system is genuinely live

Preferred path: implement the first real unlocks.

Acceptance criteria:
- if the results screen says a card unlocked, the player can actually encounter and use it later
- the player can tell which cards are available vs not yet unlocked

Before finishing:
- update docs honestly
- commit and push
```

---

## Prompt 3: Make loot real and inventory legible

```text
You are working on Sector Scavengers.

Read first:
- PLAYER_REALITY_GAPS.md
- src/systems/tactic-card-system.ts
- src/types/items.ts
- src/types/inventory.ts
- src/game/game.ts
- src/scenes/idle/render-ui.ts

Goal:
Fix the disconnect between discovered loot and actual inventory/value.

Current player problem:
- the game can award things like alien tech that are not meaningfully represented in inventory
- the player does not understand what loot does
- item bonuses are too opaque

Implement:
- real item definitions for run loot, or stop awarding undefined pseudo-items
- visible inventory resolution after runs
- a readable summary of active bonuses from inventory and crew

Acceptance criteria:
- every item found resolves into a real, inspectable object
- the player can answer “what did I get and why does it matter?”

Before finishing:
- update docs honestly
- commit and push
```

---

## Prompt 4: Make repair matter in the current run

```text
You are working on Sector Scavengers.

Read first:
- PLAYER_REALITY_GAPS.md
- src/systems/tactic-card-system.ts
- src/scenes/depth-dive-scene.ts
- src/types/state.ts

Goal:
Make REPAIR feel like a meaningful choice in the current dive, not just future scaffolding.

Current player problem:
- repairing does not visibly reduce present danger enough
- collapse risk appears unchanged, so repair feels abstract

Implement a first real version where repair clearly affects immediate survival.

Possible valid directions:
- reduce current collapse risk
- grant temporary safety buffer / shield-like protection
- reduce chance of catastrophic SCAVENGE failure
- visibly stabilize the run state in a way the UI communicates

Acceptance criteria:
- the player can see and feel why REPAIR matters now

Before finishing:
- update docs honestly
- commit and push
```

---

## Prompt 5: Make the results screen explain the economy honestly

```text
You are working on Sector Scavengers.

Read first:
- PLAYER_REALITY_GAPS.md
- Debt_loop_and_sector_arc.md
- src/scenes/results-scene.ts
- src/game/game.ts

Goal:
Fix the results screen so it explains what happened in terms the player actually cares about.

Current player confusion:
- “total” is unclear
- debt serviced is weakly explained
- value does not feel connected to the larger loop

Implement:
- clear labeling of extracted value
- clear debt impact
- clear retained rewards
- clear future progression impact

Acceptance criteria:
- the player can understand why the run mattered in one glance

Before finishing:
- update docs honestly
- commit and push
```

---

## Prompt 6: Turn debt into a real macro-pressure loop

```text
You are working on Sector Scavengers.

Read first:
- Debt_loop_and_sector_arc.md
- PLAYER_REALITY_GAPS.md
- src/types/state.ts
- src/game/game.ts
- src/systems/idle-system.ts
- src/scenes/idle/render-ui.ts
- src/scenes/results-scene.ts

Goal:
Upgrade debt from a visible shell into the player’s actual macro-pressure system.

Implement:
- meaningful debt mutation through play
- meaningful billing pressure
- meaningful consequences near and at debt cap
- player-facing explanations for each debt change

Do not just add more debt text.
Make the system mechanically consequential.

Acceptance criteria:
- the player feels that debt is the game’s central long-term pressure

Before finishing:
- update docs honestly
- commit and push
```

---

## Prompt 7: Implement the first real named recruits

```text
You are working on Sector Scavengers.

Read first:
- character_bible.md
- PLAYER_REALITY_GAPS.md
- src/types/crew.ts
- src/systems/cryo-system.ts
- src/scenes/idle/cryo-handlers.ts
- src/ui/cryo-ui/*

Goal:
Move from generic crew systems to the first truly authored recruits.

Start with a small but real first wave.
Do not stop at flags/hooks only.

Implement:
- authored recruit definitions from the character bible
- real identity in the UI
- debt-linked waking if intended
- visible narrative arrival beats

Acceptance criteria:
- the player can clearly distinguish a named recruit from generic crew
- waking them feels like a meaningful event

Before finishing:
- update docs honestly
- commit and push
```

---

## Prompt 8: Add lead / companion structure and make runs differ

```text
You are working on Sector Scavengers.

Read first:
- character_bible.md
- PLAYER_REALITY_GAPS.md
- src/types/state.ts
- src/game/game.ts
- src/scenes/idle/index.ts
- src/scenes/depth-dive-scene.ts

Goal:
Implement the first real version of “play as / play with.”

The game should stop feeling like any crew member is interchangeable.

Implement:
- one selected lead
- two companion slots
- visible pre-run selection
- actual run differences based on those choices

Acceptance criteria:
- two different lead choices feel different in the next dive
- companion choices visibly matter

Before finishing:
- update docs honestly
- commit and push
```

---

## Prompt 9: Make sectors and narrative progression feel like expansion

```text
You are working on Sector Scavengers.

Read first:
- Debt_loop_and_sector_arc.md
- character_bible.md
- PLAYER_REALITY_GAPS.md
- src/game/game.ts
- src/systems/hub-system.ts
- src/scenes/idle/index.ts
- src/systems/signal-log-system.ts

Goal:
Make sector progression and narrative progression change the world in a way the player can feel.

Current problem:
- sectors mostly feel like labels
- menus exist, but the world does not feel like it is evolving

Implement:
- stronger sector differences
- stronger hub changes
- stronger narrative aftermath using existing surfaces
- recruit/sector/debt beats that connect the loop

Acceptance criteria:
- moving forward changes what the player sees, risks, and cares about

Before finishing:
- update docs honestly
- commit and push
```

---

## Final Rule For Makko

If the player cannot answer:

- what changed
- why it changed
- why it matters
- what they should do next

then the implementation is not done, even if the code exists.

