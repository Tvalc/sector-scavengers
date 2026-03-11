# Sector Scavengers
## Debt Is The Engine
**Genre:** Narrative Extraction Roguelite / Tactical Salvage Card Game  |  **Art Style:** Stylized 2D Sci-Fi Illustration + Holographic UI + Animated Character Portraits  
**Target Playtime:** 15–20 Minute Demo  
**A Makko AI Game Design Document**


## 1. Executive Summary
Sector Scavengers is a narrative extraction roguelite set in a corporate salvage frontier where the player wakes from cryo already buried under predatory debt. To survive, they must scavenge derelict spacecraft, extract value before catastrophic hull failure, wake additional crew at severe financial cost, and slowly transform a single survival outpost into a sector-spanning operation. The hook is not just "get stronger" - it is "decide what kind of system you are willing to build in order to survive." The game combines a tight 3-card tactical run loop with a debt-driven macro economy, recruitable story characters, and escalating sector expansion. It is designed to showcase Makko AI's strength in worldbuilding, stateful progression logic, character manifest workflows, UI-rich systems design, and iterative feature implementation inside a living game.

## 2. The Core Loop
Operate from a fragile salvage station while trying to stay ahead of debt, scarcity, and collapse.  
**The Wake-Up Bill (Meta Pressure):**  
Start every campaign already owing the Company a massive debt. Debt, debt ceiling, and billing cycles govern what growth is possible.  
**The Dive (Tactical Run Phase):**  
Select one derelict ship, enter a 10-round Depth Dive, and choose between tactical card actions to extract value before the ship collapses.  
**The Extraction Decision:**  
Push deeper for more value, or extract early and secure what you have. Every extra click risks losing momentum, rewards, and possibly crew.  
**The Settlement (Results + Debt Service):**  
Convert recovered value into debt servicing, resources, power cells, and progression. The player should understand exactly what they earned, what was lost, and what changed.  
**The Expansion Choice (Hub Phase):**  
Wake crew, assign them, run missions, convert ships into stations, and decide whether growth is worth the debt it creates.  
**The Frontier Push:**  
Unlock new sectors, risk larger obligations, and move closer to the late-game question: are you escaping the corporation, or becoming it?

## 3. Gameplay Mechanics
### Tactical Dive System - 3-Card Depth
**Scavenge:** Risk/reward search action. Can yield salvage value, rare hardware, power cells, black-box intel, or catastrophic hull breach.  
**Repair:** Stabilizes the target ship, preserves it for future use, and should visibly improve current survival odds as well as long-term claim progress.  
**Extract:** End the run safely with current gains. The player keeps what was secured and returns to results for debt servicing and progression resolution.  
**Collapse Pressure:** Every run tracks active structural danger. The player must understand what increases it, what reduces it, and why greed is dangerous.  
**Discovery Events:** Triggered at key rounds or ship milestones. These surface rare loot, recruit hooks, hidden logs, and faction/mystery content.  
**Run Identity:** Different leads and companions should alter how runs feel - starting advantages, event options, narration, and tactical modifiers.

### The Salvage Crew (Demo - First Wave of Named Recruits)
| Character | Role | Signature Value | Playstyle Note |
| --- | --- | --- | --- |
| Max | Adaptive scavenger lead | Turns bad outcomes into usable momentum | Best starter lead; balanced and readable |
| Dr. Imani Okoro | Medic / archivist | Preserves crew, survivors, and fragile gains | Defensive, humane, consequence-aware |
| Jax "Wrench" Chen | Engineer / fixer | Converts wrecks into assets, improves repair value | Best for claim/station play |
| Rook Vasquez | Smuggler / high-risk scavenger | Banks value before things go wrong | Aggressive, risky, stylish |

### Future Wave Characters
| Character | Role | Signature Value | Playstyle Note |
| --- | --- | --- | --- |
| Sera Nix | Signal cryptographer | Finds hidden routes, rare events, black-box truth | Discovery and mystery specialist |
| DELTA-7 "Del" | Rogue logistics AI | Spoofs systems, manipulates claims, predicts risk | Corporate infrastructure turned inward |

### Crew Roles (Generic Support Layer)
**Engineer:** Improves repair, ship conversion, and technical stability.  
**Scientist:** Improves discoveries, signal interpretation, and rare-find quality.  
**Medic:** Reduces crew loss and improves global efficiency.  
**Scavenger:** Improves yield and extraction value.  

### Debt and Billing System
**Outstanding Debt:** The total burden currently owed.  
**Debt Ceiling:** The maximum debt the Company will tolerate before expansion is restricted.  
**Billing Cycle:** Periodic debt pressure that must create real consequences, not just flavor.  
**Wake Cost:** Named recruits deepen debt. Waking people should feel morally and financially consequential.  
**Expansion Cost:** Sectors, station conversion, and major infrastructure should come with meaningful financial pressure.

## 4. World & Sector Design
### Frontier Structure
The player operates in a derelict-rich orbital graveyard carved into multiple salvage sectors. Each sector is a new pressure zone with different wreck quality, corporate presence, rumors, and hazards. The player is not just moving to a new biome - they are signing up for a new layer of obligation.

### Derelict Types (Demo Set)
**Medevac Frigate:** Cryo wards, survivor dilemmas, casualty logs.  
**Freight Hauler:** Raw value, cargo risk, better material yield.  
**Survey Vessel:** Signal anomalies, mystery progression, black-box data.  
**Military Wreck:** Dangerous but high-value salvage, better tech.  
**Station Fragment:** Claim/station progression hooks, infrastructure opportunities.  

### Sector Themes (Demo)
**Sector 7 - Opportunity Zone:** Intro sector. Teaches the debt loop, cryo, and extraction logic.  
**Graveyard Belt:** Denser wreck fields, scarier derelicts, stronger payout temptation.  
**Vega Point Approach:** Signal anomalies, black-box progression, and the first real sense that something bigger is wrong.  

### Demo Climax
The demo should culminate in a decision-rich salvage operation where the player can:
- secure a major debt payment,
- rescue or wake a named recruit,
- or unlock access to the next sector at the cost of deeper financial entanglement.

## 5. Technical Requirements
### Art & Animation
**Character Presentation:**  
Each named recruit needs:
- key portrait / bust art
- multiple expressions
- cryo card presentation
- lead-select presentation
- optional animated portrait loops

**Ship / Derelict Presentation:**  
- multiple derelict classes and rarity states  
- station / claimed / damaged variants where relevant  
- sector-specific wreck mood and environmental storytelling  

**UI / Card Presentation:**  
- premium holographic card visuals  
- debt panel / statement UI  
- inventory and item clarity  
- mission control clarity  
- results screen that explains outcomes cleanly  

**Visual Juice:**  
- collapse warning pulse  
- extraction success feedback  
- debt threshold alerts  
- recruit arrival emphasis  
- item pickup / discovery focus  
- signal anomaly overlays for mystery content  

### Permanent Progression
**Debt Relief Layer:** Better extraction efficiency, lower penalty bleed, improved billing resilience.  
**Station Layer:** More useful rooms, better passive generation, new operational capacity.  
**Crew Layer:** Named recruits, generic specialists, stronger assignments.  
**Run Layer:** More card variety, stronger modifiers, more tactical options.  
**Sector Layer:** New salvage spaces, better opportunities, heavier pressure.

### Data / Logic Requirements
- persistent meta state for debt, sector, billing, and story flags  
- persistent recruit and cryo state  
- transparent item resolution from dive -> inventory -> active bonuses  
- no fake unlocks: if a system says a thing unlocked, it must actually be usable  
- no false notifications: if the UI says a panel is actionable, the player must be able to act

## 6. Development Milestones
**Phase 1 (Truth Pass & Loop Repair):**  
Fix misleading UI/UX, make wake flow readable, remove fake card progression, make loot resolve correctly, align help text with real systems.

**Phase 2 (Real Tactical Loop):**  
Expand the dive so Repair matters immediately, extraction value is clear, and the player can understand why each card exists.

**Phase 3 (Debt Becomes Real):**  
Turn debt into the actual macro-pressure loop: meaningful mutation, billing pressure, debt-gated decisions, and visible consequences.

**Phase 4 (Named Recruits & Hub Reactivity):**  
Implement the first wave of authored recruits, recruit arrival beats, lead/companion scaffolding, and stronger post-run reactions.

**Phase 5 (Sector Progression & Identity):**  
Make sectors materially change content, unlock pressure, and narrative framing. Begin route/doctrine identity.

**Phase 6 (Narrative Roguelike Payoff):**  
Lead differentiation, companion-driven runs, loyalty arcs, doctrine routes, and first ending states.

## 7. Risk Assessment
**Fake Systems Risk:**  
The biggest current danger is saying a system exists before it is player-facing and functional. Fix: never mark features complete unless the player can feel the consequence.  

**UI Trust Risk:**  
Players stop trusting the interface when action signals are false. Fix: every notification, button, and label must map to real action or real explanation.  

**Card Variety Risk:**  
The run loop will feel dead if the deck remains functionally fixed. Fix: either implement real unlockable cards or stop pretending unlock progression exists.  

**Macro Loop Drift:**  
Debt can become a flavor panel instead of the game’s engine. Fix: tie debt to growth, recruit waking, billing cycles, and sector expansion in visible ways.  

**Narrative Scope Risk:**  
Too much story planned too early can outpace runtime support. Fix: build first-wave recruit content and reactive surfaces before expanding to full-act narrative complexity.  

## 8. Makko AI Feature Showcase
Key Makko AI capabilities demonstrated during Sector Scavengers development:

| Phase | Makko Feature | What to Demo on Camera |
| --- | --- | --- |
| Phase 1 | Plan Mode | Use Plan Mode to diagnose why the game feels fake from the player's perspective. Have Makko map broken affordances, fake progression, and disconnected systems into a concrete repair order. |
| Phase 1 | Fast Mode | Rapidly tune UI honesty: wake-button feedback, mission notification logic, results labeling, and debt communication through tight conversational iteration. |
| Phase 2 | State-Aware Logic | Demonstrate how Makko handles the relationship between run state, debt state, story flags, inventory transfer, and sector unlock progression without losing consistency. |
| Phase 2 | Debug Workflow | Show Makko tracing a real gameplay bug such as “alien tech found but not in inventory” or “cards unlock but never appear” from symptom to root cause to tested fix. |
| Phase 3 | Manifest / Character System | Show how Makko can evolve generic crew into authored recruits using a consistent data schema, portrait presentation, role identity, and wake-flow integration. |
| Phase 3 | Narrative State Tracking | Demonstrate Makko wiring debt warnings, recruit arrivals, and sector unlocks through persistent story-state logic instead of one-off text hacks. |
| Phase 4 | Sprite Studio / UI Asset Direction | Use Makko to generate card shells, recruit cards, debt statement surfaces, and inventory visuals that make the game feel premium and coherent rather than menu-fragmented. |
| Phase 5 | Save Point / Rollback | Before implementing doctrine routes or endings, create a save point and show rollback after a failed attempt so risky feature work stays safe. |

