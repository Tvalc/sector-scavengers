# SYSTEM MECHANICS: Game-to-Story Mapping

## How This Document Works

Every mechanic in the Sector Scavengers game has a direct, literal counterpart in the story world. This document maps each game element to its narrative manifestation, explains how it appears on the page, and provides formatting guidelines for System messages within the prose.

---

## System Interface — What Kael Sees

The System manifests as a translucent blue HUD overlaid on Kael's vision. He can dismiss it with a thought, but it snaps back whenever something important happens. It's not a screen or a hologram — it's a direct neural projection, like a memory he can see.

### System Notification Format

System notifications appear in the prose as indented, formatted blocks:

```
> [SYSTEM] Hull Integrity restored to 78%.
> Repair Card played. Energy remaining: 310/1,000.
```

```
> [SYSTEM — ALERT] Hull Breach detected.
> Structural failure in Sector 7-C. All unextracted salvage lost.
> Crew status: Checking...
> Crew Member JORDAN CHEN — SURVIVED (Luck: 67)
```

```
> [SYSTEM] Level Up!
> KAEL MORROW has reached Level 3.
> Bonus Multiplier: 1.0x → 1.25x
> New XP Threshold: 500
```

The Signal's broadcast commentary appears differently — as italicized voice-over that Kael can hear through the System:

*"And there it is, folks. Our human contestant has just gambled his last fifty Energy on a SCAVENGE play in a ship that's already at thirty-two percent hull integrity. Bold? Stupid? The line between the two has never been thinner. Current odds on survival: fourteen percent. Place your bets."*

---

## Stat Mapping: Game → Story

### Crew Stats

| Game Stat | Range | Story Manifestation | Narrative Feel |
|-----------|-------|---------------------|----------------|
| **Efficiency** | 0-100 | Resource conservation, waste reduction, optimal pathing through problems. High efficiency means Kael can build a room using fewer materials than the System estimates. | Like having an intuition for the "right" way to do things. Almost meditative focus during tasks. |
| **Luck** | 0-100 | Probability manipulation within System-governed space. Not magic — the System literally adjusts drop tables based on this stat. High luck means better loot, favorable encounter rolls, and suspiciously convenient timing. | Things just *work out*. A panel falls open to reveal a cache. A corridor that should be blocked has a gap just wide enough. |
| **Technical** | 0-100 | Comprehension of alien systems. The System provides translation overlays, but Technical determines how deep that comprehension goes. High Technical means repairing things that should be impossible and understanding technology from species that died millennia ago. | Alien schematics resolve from gibberish into clarity. Hands move with confident purpose over consoles that should be incomprehensible. |
| **Speed** | 0-100 | Physical and cognitive reaction time. The System enhances neural processing proportional to this stat. High Speed means faster movement through corridors, quicker decision-making during hull breaches, and the ability to play cards in rapid succession. | Time perception shifts. At high levels, debris from an explosion seems to hang in the air for a moment, giving time to react. |

### Base Stat Generation

When a crew member is woken from cryo, their stats are randomly generated within these ranges:

| Stat | Base Range | Role Bonus Applied |
|------|------------|-------------------|
| Efficiency | 40-70 | Engineer +10, Medic +15, Scavenger +5 |
| Luck | 30-70 | Scientist +20, Medic +5 |
| Technical | 35-70 | Engineer +20, Scientist +10 |
| Speed | 45-70 | Scavenger +25 |

**In-story**: The System scans each person as they wake and assigns stats based on a combination of their existing skills, psychological profile, and some opaque alien metric that nobody fully understands. A former mechanic might get high Technical. A former gambler might get high Luck. But it's never one-to-one — the System's assessment is alien and sometimes surprising.

---

## Resource Mapping: Game → Story

### Metal
**Game**: Common building material, 50-150 per mined ship.
**Story**: Refined hull plating, structural alloys, and processed metals extracted from derelict ships. Kael uses a System-provided nano-forge to reshape raw metal into construction materials. It's heavy, abundant, and the foundation of everything he builds.
**Narrative feel**: Industrial. The clang of metal on metal. The heat of the forge. The satisfaction of watching a bare room take shape.

### Tech
**Game**: Advanced components, 20-60 per mined ship.
**Story**: Alien circuitry, data crystals, functional tech modules from more advanced species. Each piece is a puzzle — the System provides a basic translation layer, but truly utilizing Tech requires high Technical scores. A Science Lab processes Tech into usable schematics.
**Narrative feel**: Wonder mixed with frustration. Holding a glowing crystal that could power a room for a year, if only you could figure out which end is up.

### Components
**Game**: Rare parts, 5-15 per mined ship.
**Story**: Precision-engineered parts that can't be fabricated — they must be salvaged intact. Gyroscopes from alien navigation systems, quantum-entangled relay chips, bio-organic processor cores. Each Component is unique and irreplaceable.
**Narrative feel**: Treasure hunting. The moment of holding something ancient and irreplaceable, knowing it's the difference between upgrading and stalling out.

### Power Cells
**Game**: Precious resource, 5-11% drop rate on EXTRACT, mission rewards.
**Story**: Crystallized energy matrices from an unknown source. They're warm to the touch, faintly luminescent, and the System treats them as a universal fuel. Nothing else can wake a human from cryo-sleep. Nothing else can power the conversion of a ship into a station. They're the rarest, most precious thing in the Scrapline.
**Narrative feel**: Gold. Every Power Cell found is a celebration. Every Power Cell spent is agony. Kael keeps them in a reinforced pouch on his belt and checks the count obsessively.

### Energy
**Game**: 10 per ship per minute, caps at 1,000.
**Story**: Ambient power harvested by the System from ship reactors, solar collectors, and the background radiation of the Scrapline. It flows into Kael's System reserves automatically. He can feel it — a low hum at the base of his skull that strengthens when he's near active ships.
**Narrative feel**: Stamina. A full energy bar is confidence. An empty one is desperation. The difference between having one more play and being forced to extract.

---

## Depth Dive Mapping: Game → Story

### The Experience

A Depth Dive is a first-person, high-tension exploration of a derelict ship. Kael boards through an airlock, and the System activates his HUD, showing hull integrity, energy reserves, and the 10-round countdown.

Each "round" is a distinct section of the ship — a corridor, a cargo bay, a command deck. The ship is dark, cold, and full of surprises. Some sections are merely empty. Others contain hostile automated defenses, alien fauna, or structural hazards.

### Card Plays as Tactical Decisions

The three "cards" are not literal cards — they're tactical options the System presents based on current conditions:

**SCAVENGE (50 Energy)**
```
> [SYSTEM] Tactical Option: SCAVENGE
> Target: Cargo Bay 3-C
> Hull Integrity: 47%
> Breach Probability: 35%
> Estimated Yield: [CLASSIFIED — Luck-dependent]
> 
> WARNING: Structural integrity below recommended threshold.
> Proceed? [Y/N]
```

In the narrative: Kael pushes deeper into a dangerous area, prying open containers, cutting through bulkheads, running his hands along alien consoles looking for anything valuable. The 35% breach chance manifests as groaning metal, hairline cracks spreading across viewports, and the constant threat of explosive decompression.

**REPAIR (40 Energy)**
```
> [SYSTEM] Tactical Option: REPAIR
> Target: Hull Section 7-B
> Current Integrity: 47% → Estimated: 62%
> Energy Cost: 40
> Claim Progress: 1/3 → 2/3
>
> Proceed? [Y/N]
```

In the narrative: Kael patches hull breaches, reinforces structural weak points, and reroutes power to failing systems. It's hard, unglamorous work — welding in zero-G, sealing micro-fractures with nano-paste, realigning load-bearing supports. But it's safe, and it brings the ship one step closer to being claimable.

**EXTRACT (Free)**
```
> [SYSTEM] Tactical Option: EXTRACT
> Salvage in hold: 43 Metal, 12 Tech, 2 Components
> Power Cells found: 1
> 
> Extract and return to station? [Y/N]
```

In the narrative: Kael falls back to the airlock, seals it behind him, and jets back to his station. There's no shame in extracting — but there's always the nagging thought of what was in the next room.

### Hull Breach — The Worst Moment

```
> [SYSTEM — CRITICAL] HULL BREACH DETECTED
> Section 4-A structural failure. Cascade imminent.
> Emergency extraction initiated.
> 
> Salvage status: LOST (all unextracted materials vented to space)
> Crew status: Checking...
> JORDAN CHEN — Roll: 0.42 vs Threshold: 0.30 — SURVIVED
> 
> Scrap earned: 15 (death currency)
```

In the narrative: The ship tears itself apart. Metal screams. Atmosphere vents in a white rush. Kael is thrown against a bulkhead as the System emergency-teleports him to the nearest safe zone — his station. He arrives gasping, bruised, and empty-handed. If crew were aboard, he waits for the System to confirm whether they made it. Those seconds are the longest in the book.

**Shields**: Rare defensive buffers (max 2) that absorb one hull breach each. In the narrative, they manifest as a System-generated energy barrier that flares blue-white when it absorbs an explosion. Using a shield is loud, violent, and terrifying — but it means survival.

---

## Base Building Mapping: Game → Story

### The Claim-Convert Pipeline

1. **Find a derelict** (explore the 4x4 grid)
2. **Run dives on it** (3 qualifying actions: repairs + extractions)
3. **Claim it** (5 Power Cells + 50 Energy)
4. **Choose: Mine or Convert**
   - **Mine**: Immediate resources (50/100/150 Metal based on class). The ship is gutted.
   - **Convert**: Costs 8/11/15 Power Cells based on class. Requires an Engineer and an Engineering Bay on an existing station. The ship becomes a functional station with 3-5 room slots.

### Room Construction

In the narrative, building a room is a multi-day project. Kael and his crew haul materials, fabricate components using the nano-forge, and install systems piece by piece. The System provides blueprints — ghostly blue overlays showing where each piece goes — but the labor is real.

**Room Descriptions:**

| Room | In-Story Description |
|------|---------------------|
| **Crew Quarters** | Insulated sleeping pods, a small common area, water recycling. The first sign that this isn't just survival — it's living. |
| **Science Lab** | Alien-tech analysis stations, a sample vault, holographic displays. Where Tech becomes understanding. |
| **Medical Bay** | Auto-doc stations, cryo-stabilization units, a sterile field generator. The room that keeps everyone alive. |
| **Recreation Deck** | A luxury in the apocalypse. A viewport, a meal synthesizer, a space for people to just *be human* for a while. Crew efficiency goes up because morale matters. |
| **Cargo Hold** | Industrial shelving, magnetic containment for volatile materials, inventory management systems. The difference between scarcity and stockpile. |
| **Engineering Bay** | Heavy fabrication equipment, a ship-grade power router, the conversion apparatus. The key to expansion — without an Engineering Bay, no new stations can be created. |

---

## Crew Waking Mapping: Game → Story

### The Cryo-Pod Discovery

Scattered throughout the Scrapline are cryo-pods containing other humans. The Reclamation took people from Earth during incorporation — seemingly at random. Farmers, engineers, students, retirees. Each pod is a gamble: the System assigns stats on waking, and the role is partially random.

### The Wake Sequence

```
> [SYSTEM] Cryo-Pod detected.
> Species: Human (Terran)
> Status: Viable
> Wake Cost: 8 Power Cells
> 
> WARNING: Power Cell reserves will drop to 3.
> Proceed? [Y/N]
```

```
> [SYSTEM] Cryo-Pod activation in progress...
> Subject: MORGAN REYES
> Assigning role... ENGINEER
> 
> Stats assigned:
>   Efficiency: 63 (+10 role bonus = 73)
>   Luck: 41
>   Technical: 58 (+20 role bonus = 78)
>   Speed: 52
> 
> Level: 1 | XP: 0/100
> 
> Welcome to Sector Scavenge, Morgan.
```

In the narrative: The pod hisses open. Fog rolls out. A person gasps awake, confused, terrified. Kael has to explain everything — the Reclamation, the System, the broadcast, the stakes. It's one of the most emotionally loaded recurring scenes in the series: the moment someone learns the world ended and they're now a contestant on an alien game show.

---

## Mission Mapping: Game → Story

### How Missions Work Narratively

Missions are the B-plots. While Kael runs Depth Dives (the A-plot), his crew handles missions — automated or semi-autonomous tasks that happen during chapter transitions.

| Mission | Narrative Description |
|---------|---------------------|
| **Salvage Run** | A crew member takes a small shuttle to a nearby wreck, spends a couple hours picking through debris, and returns with raw materials. Low risk, low reward, good for new crew to build confidence. |
| **Sector Patrol** | Two crew members sweep the local sectors for threats and opportunities. They might find a new cryo-pod, spot incoming debris, or encounter another species' contestants. Medium risk. |
| **Trade Convoy** | Two crew members make contact with a passing merchant vessel (some alien species trade with contestants for entertainment value). Long journey, moderate risk, excellent Tech yields. |
| **Deep Space Survey** | Three crew members venture beyond the mapped Scrapline into uncharted space. The payoff is enormous — Components, Power Cells, and lore. The risk is proportional. High-stakes B-plot territory. |

### Mission Results as Chapter Breaks

```
> [SYSTEM] Mission Complete: Deep Space Survey
> Duration: 15 minutes [story time: 3 days]
> 
> Rewards:
>   Metal: 20
>   Tech: 20
>   Components: 20
>   Power Cells: 5
> 
> Crew Status:
>   SAM BLACKWOOD (Scavenger, Lv.3) — XP +50 → Level 3 maintained
>   ALEX FROST (Scientist, Lv.2) — XP +50 → Level Up! → Level 3
>   RILEY CHASE (Medic, Lv.2) — XP +50 → Level 2 maintained
```

---

## The Viral Multiplier — Audience Engagement

### Game Mechanic
1.5x resource multiplier for 2 hours after "sharing" (viral engagement).

### Story Mechanic
When Kael does something that spikes viewer engagement — a dramatic escape, a witty quip, a creative solution, an emotional moment — the Signal announces a **Trending Boost**:

```
> [SIGNAL] TRENDING BOOST ACTIVATED
> Viewer engagement spike detected: +847% above baseline
> Resource multiplier: 1.5x for next 2 standard hours
> 
> Sponsor alert: NovaCorp Industries has provided a care package.
> Contents: 2 Power Cells, 50 Tech, Neural Uplink (Hardware)
```

*"Ladies, gentlemen, and sentient gas clouds — our human contestant just sealed a hull breach with nothing but a sheet of cargo plating and his own body weight while making what I'm told is a 'joke.' Viewer engagement is through the roof. NovaCorp is cutting a sponsorship deal as we speak. The human content meta continues to dominate Season 7."*

This creates a delicious feedback loop in the narrative: Kael must be entertaining to survive, but being entertaining often means taking risks that could kill him.

---

## Death Currency & Meta-Progression

### Game Mechanic
Scrap earned from failed runs persists across deaths and unlocks new tactical options.

### Story Mechanic
Every failure teaches the System something about Kael — his pain tolerance, his decision patterns, his breaking points. The System rewards failure with **Scrap Points** that unlock permanent upgrades to his tactical options (new card variants, enhanced SCAVENGE outcomes, reduced breach probability on specific actions).

This is the narrative justification for progression even through failure: the System is *studying* him. Every hull breach, every lost crew member, every failed run adds data to the System's model of what Kael can handle — and the System adjusts accordingly, not out of mercy, but because a contestant who improves is better television.

```
> [SYSTEM — META] Run Failed. Hull breach in Sector 4-C.
> Scrap earned: 15
> Total Scrap: 127/200 (next unlock: Enhanced SCAVENGE variant)
> 
> The System learns from failure.
> Your threshold adjusts.
```

---

## Items & Equipment

### Hardware (Passive Bonuses)

| Item | Game Effect | Story Description |
|------|------------|-------------------|
| **Neural Uplink** | +5% Stability, +10% rewards when shared | A thin, spider-web-like implant that bonds to the base of the skull. Enhances System connectivity. When Kael shares a moment with the audience (narrates his thoughts, reacts to the Signal), the Uplink amplifies viewer engagement, translating attention into tangible rewards. |
| **Meme-Beacon** | +10% Energy Cap, +50 Aura per 5 likes | A small device that attaches to the chest plate of Kael's suit. It broadcasts a personalized signal — his "brand" in the galactic entertainment sphere. The more the audience interacts with his broadcast, the more ambient energy the beacon harvests. |

### Crew Equipment (Active Abilities)

| Item | Game Effect | Story Description |
|------|------------|-------------------|
| **The Viralist** | 1x Auto-Bypass per run, rewards scale with followers | A legendary piece of equipment from a previous species' top-rated contestant. It can bypass one System restriction per dive — open a locked door, skip a hazard, nullify one breach roll. The catch: its effectiveness scales with how many viewers are watching at that exact moment. |

---

## Time Scale Mapping

| Game Time | Story Time | Narrative Beat |
|-----------|-----------|----------------|
| 1 Depth Dive (10 rounds) | 4-8 hours | One chapter or sequence |
| 1 Mission (2-15 min) | 1-3 days | Chapter break / interlude |
| Building a room | 3-7 days | Montage or subplot |
| Waking crew from cryo | Instant (System-managed) | Major scene |
| One season (one book) | 2-4 months | Full story arc |

---

## Progression Pacing per Book

### Book 1 Resources (Starting → End)
| Resource | Start | End of Book 1 |
|----------|-------|---------------|
| Metal | 100 | ~800 |
| Tech | 50 | ~300 |
| Components | 20 | ~80 |
| Power Cells | 0 | ~15 (after spending most) |
| Energy Cap | 1,000 | 1,000 |
| Ships Claimed | 1 (starter) | 3-4 |
| Stations | 1 (starter) | 2 |
| Crew Woken | 0 | 2-3 |
| Rooms Built | 0 | 4-5 |

Each subsequent book roughly doubles the protagonist's resource capacity and infrastructure while introducing threats that scale proportionally.
