# Sector Scavengers: LitRPG Series Concept

## Overview

A LitRPG isekai series where the main character **Max** wakes up in a system-governed world—an orbital graveyard of derelict spacecraft—indentured to The Company with a crushing debt. The universe operates on explicit game mechanics: stats, levels, skills, and notifications that everyone can see. Each book targets **~100,000–120,000 words** (comparable to Dungeon Crawler Carl: ~110k words / ~450 pages per book).

---

## The Isekai Hook

**Max** doesn't remember dying. They remember Earth—or something like it—and then: cold, darkness, and the hum of cryo systems. When they wake, a blue notification blinks in their vision:

```
[SYSTEM] Welcome, Valued Asset #864.
[SYSTEM] You have been successfully integrated into the Sector 7 Salvage Protocol.
[SYSTEM] Your Opportunity Balance: $1,000,000 (deferred productivity contributions)
[SYSTEM] Begin your productivity journey to clear your debt and achieve generational wealth!
```

The world is **literally** run by the System. Stats determine everything: how fast you repair hulls, how much you extract, whether you survive a breach. NPCs have levels. Ships have classes. Crew have roles and XP. The rules are visible, exploitable, and brutal.

---

## Core System Mechanics (Stats That Govern the World)

### Character Stats (Visible to All)

| Stat | Effect | How to Raise |
|------|--------|--------------|
| **Efficiency** | Affects repair speed, power generation, task completion | Level ups, equipment, crew bonuses |
| **Luck** | Discovery chance, rare drops, critical success rolls | Level ups, Scientist crew, items |
| **Technical** | Hull repair bonus, upgrade success, engineering tasks | Level ups, Engineer crew, training |
| **Speed** | Salvage speed, extraction yield, mission duration | Level ups, Scavenger crew, augments |

### Level & Progression

- **Player Level**: 1–99. XP from salvaging, missions, discoveries.
- **Crew Level**: 1–5. XP from assignments, run completions, survival.
- **Ship Class**: 1–3. Determines room slots, resource yield, power generation.

### The Notification System

Everyone sees the same blue boxes. No hiding. No lying about your stats. When you extract:

```
[EXTRACT] Success! +150 Scrap, +3 Metal, +1 Tech
[HULL BREACH] Roll: 67/100. Threshold: 35. BREACH AVOIDED.
```

When you fail:

```
[HULL BREACH] Roll: 28/100. Threshold: 35. BREACH TRIGGERED.
[SYSTEM] Run terminated. Assets liquidated. Crew loss roll: 2/3 survived.
```

---

## Setting: The Orbital Graveyard

**Sector 7** is a debris field of derelict spacecraft—hulks from wars, failed colonies, and corporate write-offs. The Company owns the sector and runs the Salvage Protocol: indentured "Valued Assets" wake from cryo, claim ships, extract resources, and work off their debt.

- **The Hub**: A 4×4 grid of 16 ship positions. Derelicts drift, get claimed, mined, or converted to stations.
- **Depth Dives**: 10-round operations where you SCAN, REPAIR, UPGRADE, and EXTRACT. Each round risks a 35% hull breach.
- **Stations**: Claimed ships converted to bases with room slots (Crew Quarters, Science Lab, Medical Bay, Recreation Deck, Cargo Hold, Engineering).

---

## Main Character: Max

- **Origin**: Isekai'd—doesn't remember the transition. Wakes in cryo as Valued Asset #864.
- **Personality**: Sarcastic, pragmatic, resistant to corporate speak. Choices in dialogue (from the game) define tone: worried, sarcastic, or confused.
- **Arc**: From confused survivor → competent scavenger → someone who starts asking *why* the System exists and who benefits.

---

## Key Characters & Entities

### V.A.L.U. (Valued Asset Logistics Unit)
- Pathologically optimistic AI/System interface
- Delivers corporate onboarding, euphemisms, and "helpful" guidance
- May be more than it appears—tied to the System's rules?

### Crew (Awakened from Cryo)
- **Engineer**: +50% hull repair, +2% power cell drop
- **Scientist**: +15% discovery chance
- **Medic**: +10% global efficiency, -50% crew loss on breach
- **Scavenger**: +25% resource yield, +1% power cell drop

Crew have names, stats, levels, and can be **lost** on hull breach (30% base chance). They're people—or were—with their own histories in the graveyard.

---

## Tactic Cards (Depth Dive Actions)

The System governs actions via "cards":

| Card | Effect | Risk |
|------|--------|------|
| **SCAN** | Claim a derelict ship | None |
| **REPAIR** | Restore hull integrity | None |
| **UPGRADE** | Raise ship class | None |
| **EXTRACT** | Salvage for resources | 35% hull breach |

Shields (0–2) can absorb breach rolls. Power cells (rare) wake crew and convert ships to stations.

---

## Series Structure (Per Book: ~100k–120k Words)

### Book 1: *Debt Protocol*
- **Hook**: Max wakes. Tutorial-as-story: V.A.L.U. onboarding, first Depth Dive, first crew wake, first breach.
- **Stakes**: Survival, understanding the rules, clearing the first chunk of debt.
- **End**: Max has a small fleet, awakened crew, and a growing suspicion that The Company is hiding something.

### Book 2: *Station Zero*
- **Hook**: A derelict station appears in the sector—older than the Protocol, with different System rules.
- **Stakes**: Competing factions, rival Valued Assets, discovery of pre-Company history.
- **End**: Max learns the System wasn't always here. Someone built it.

### Book 3: *Hull Breach*
- **Hook**: A sector-wide breach event. Ships go dark. Crew go missing.
- **Stakes**: Survival in a broken sector, rescuing crew, finding the cause.
- **End**: The breach was triggered deliberately. There's a faction that wants to break the System.

### Book 4+: *[TBD]*
- Escalation: System origins, Company vs. rebels, Max's role in the larger conflict.
- Each book: ~100k–120k words, self-contained arc, series-long mystery.

---

## Tone & Style

- **Dark comedy**: Corporate dystopia meets LitRPG. V.A.L.U.'s cheerfulness vs. 35% death chance.
- **Progression focus**: Stats matter. Level ups feel earned. Crew bonds matter.
- **System integration**: Notifications, stat blocks, and skill descriptions are part of the prose—not just flavor.
- **Comparable**: Dungeon Crawler Carl (tone, length, system visibility), The Wandering Inn (crew/community), Defiance of the Fall (progression scale).

---

## Word Count Target: Dungeon Crawler Carl Parity

| Metric | Dungeon Crawler Carl | This Series (Target) |
|--------|----------------------|----------------------|
| Words per book | ~100,000–110,000 | ~100,000–120,000 |
| Pages (est.) | ~400–450 | ~400–480 |
| Chapters | ~40–50 | ~40–50 |
| Chapter length | ~2,000–2,500 words | ~2,000–2,500 words |

**Practical target**: 100,000 words minimum per book. 120,000 words gives room for world-building and system exposition without bloat.

---

## Appendix: Direct Mappings from Game → Novel

| Game Element | Novel Element |
|--------------|---------------|
| `GameState.energy` | Power/Energy resource, cap 1000 |
| `Spacecraft` (16 ships) | Hub grid, derelicts, stations |
| `RunState` (rounds 1–10) | Depth Dive structure |
| `COLLAPSE_PROBABILITY` (35%) | Hull breach risk |
| `CrewMember` + `CrewRole` | Awakened crew with specialties |
| `Resources` (metal, tech, components) | Salvage yields |
| Power cells | Rare currency for crew wake, conversion |
| `V.A.L.U.` tutorial | In-world onboarding, recurring guide |
| `$1,000,000` debt | Central motivator, "Opportunity Balance" |

---

*Use this document as the series bible. Stats, setting, and tone are defined; plot details can evolve as you write.*
