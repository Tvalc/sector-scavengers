# NARRATIVE REWORK: Derelict Spacecraft Scavenging

## Status: Phase 6 In Progress ⏳

### Progress Summary
- ✅ Phase 1: Terminology & Narrative Rename - COMPLETE
- ✅ Phase 2: Ship Choice System (Mine vs Keep) - COMPLETE  
- ✅ Phase 3: Room System - COMPLETE
- ✅ Phase 4: Power Cells & Cryo - COMPLETE
- ✅ Phase 5: Crew & Missions - COMPLETE
- ⏳ Phase 6: Progression Economy - IN PROGRESS

### Overview
**Original Theme:** Deep-sea data relay infrastructure ("node/rig" takeover)  
**New Theme:** Derelict spacecraft scavenging in orbital graveyard ("ship/hull" mechanics)

---

## Phase 1: Terminology & Narrative Rename ✓

**Status:** COMPLETE

### Files Changed:

#### Type Definitions
- ✓ `src/types/node.ts` → `src/types/spacecraft.ts`
  - `Node` → `Spacecraft`
  - `NodeOwner` → `SpacecraftOwner` 
  - `createNode()` → `createSpacecraft()`
  - `level` → `shipClass` (1-3)
  - `stability` → `hullIntegrity` (0-100)
  - `energyAccumulated` → `powerAccumulated`
  - Added `mode: ShipMode` ('derelict' | 'claimed' | 'mined' | 'station')
  - Added `maxRooms: number`
  - Added `rooms: Room[]`
  
- ✓ `src/types/resources.ts` (created)
  - `Resources` interface (metal, tech, components)
  - Resource utility functions (add, subtract, hasEnough)

- ✓ `src/types/state.ts`
  - `nodes` → `spacecraft`
  - Added `resources: Resources` field
  - `hubSelectedNodes` → `hubSelectedShips`
  - Comments updated for space theme

- ✓ `src/types/cards.ts`
  - SCAN: "Claim a Derelict Ship" (was "Control a Neutral Node")
  - REPAIR: "Restore Hull Integrity" (was "Increase Rig Stability")
  - UPGRADE: "Upgrade Ship Class" (was "Move signal strength")
  - EXTRACT: "Salvage ship for resources. 35% hull breach risk!" (was "Cash out node... 35% collapse risk")

#### Systems
- ✓ `src/systems/node-system.ts` → `src/systems/spacecraft-system.ts`
  - `NodeSystem` → `SpacecraftSystem`
  - `nodeSystem` → `spacecraftSystem`
  - `controlNode()` → `claimShip()`
  - `upgradeNode()` → `upgradeShip()`
  - `damageNode()` → `damageHull()`
  - `repairNode()` → `repairHull()`
  - `resetNode()` → `resetShip()`
  - `getNode()` → `getShip()`
  - `getNodeAt()` → `getShipAt()`
  - `getAllNodes()` → `getAllSpacecraft()`
  - `getNodesByOwner()` → `getShipsByOwner()`
  - `getPlayerNodes()` → `getPlayerShips()`
  - `getNeutralNodes()` → `getNeutralShips()`
  - `countByOwner()` unchanged
  - `getTotalPlayerLevel()` → `getTotalPlayerClass()`
  - `getAveragePlayerStability()` → `getAveragePlayerHullIntegrity()`
  - Added `mineShip()`, `convertToStation()`, `getShipsByMode()`

- ✓ `src/systems/depth-dive-system.ts`
  - All `node` references → `ship`
  - `selectedNodeId` → `selectedShipId`
  - `nodeId` → `shipId` in ExtractedReward
  - `triggerRigCollapse()` → `triggerHullBreach()`
  - Updated card execution logic for spacecraft terminology

- ✓ `src/systems/idle-system.ts`
  - `getEnergyRate()` → `getPowerRate()`
  - Comments updated (Power per ship instead of Energy per node)

- ✓ `src/systems/hub-system.ts`
  - `NODE_POSITIONS` → `SHIP_POSITIONS`
  - `getNodePosition()` → `getShipPosition()`
  - Comments updated

- ✓ `src/systems/tactic-card-system.ts`
  - All card descriptions updated for spacecraft theme
  - `nodeId` → `shipId` in CardContext
  - Execute functions updated (executeScan, executeRepair, etc.)
  - "No neutral nodes to scan" → "No derelict ships to scan"
  - "No nodes to repair" → "No ships to repair"
  - "No nodes to upgrade" → "No ships to upgrade"
  - "No nodes to extract from" → "No ships to salvage"
  - "Rig collapsed!" → "Hull breach!"

- ✓ `src/systems/juice-system.ts`
  - `triggerRigCollapse()` → `triggerHullBreach()`

- ✓ `src/game/game.ts`
  - `nodes` → `spacecraft` in save data
  - `getNode()` → `getShip()`
  - `getPlayerNodes()` → `getPlayerShips()`
  - `setHubSelectedNodes()` → `setHubSelectedShips()`
  - `getHubSelectedNodes()` → `getHubSelectedShips()`
  - `clearHubSelectedNodes()` → `clearHubSelectedShips()`

#### Scenes
- ✓ `src/scenes/depth-dive-scene.ts`
  - Imported `ShipVisual` instead of `NodeVisual`
  - `playerNodes` → `playerShips`
  - `avgStability` → `avgHullIntegrity`
  - "SECTOR MAP" → "SALVAGE SECTOR"
  - "RIG COLLAPSED!" → "HULL BREACH!"
  - Uses `ShipVisual.renderShip()` for mini-map

- ✓ `src/scenes/results-scene.ts`
  - "RIG COLLAPSE" → "HULL BREACH"
  - "EXTRACTED NODES" → "SALVAGED SHIPS"
  - "No nodes extracted" → "No ships salvaged"
  - All `playerNodes` → `playerShips`

- ✓ `src/scenes/start-scene.ts`
  - HOW_TO_PLAY bullets updated:
    - "Ships generate Power passively (10/min each)"
    - "Spend Power in Salvage Operations to claim ships and extract resources"
    - "Beware Hull Breach (35%) on EXTRACT"

- ✓ `src/scenes/idle/constants.ts`
  - HOW_TO_PLAY_CONTENT updated for spacecraft theme

- ✓ `src/scenes/idle/debug.ts`
  - `NODE_POSITIONS` → `SHIP_POSITIONS`
  - Comments updated

- ✓ `src/scenes/idle/input-handler.ts`
  - `setHubSelectedNodes()` → `setHubSelectedShips()`

- ✓ `src/scenes/idle/index.ts`
  - `getEnergyRate()` → `getPowerRate()`

#### UI
- ✓ `src/ui/visual-components.ts`
  - Added `ShipVisualOptions` interface (hullIntegrity instead of stability)
  - `ShipVisual` extends `NodeVisual` with `renderShip()` method
  - Backward compatible with existing rendering

### Validation
- ✓ Build succeeds with no errors
- ✓ All "node/rig" terminology removed
- ✓ Game state structure updated
- ✓ Save/load compatibility maintained

---

## Phase 2: Ship Choice System (Mine vs Keep) ✓

**Status:** COMPLETE

### New Features Added:

#### Ship Modes
```typescript
type ShipMode = 'derelict' | 'claimed' | 'mined' | 'station';
```

- **derelict**: Initial state, gray, unclaimed
- **claimed**: Player has SCAN'd it, awaiting Mine/Keep decision, cyan
- **mined**: Player chose to strip for resources, dark/disabled
- **station**: Player chose to keep, has room slots, bright with indicators

#### Resources System
```typescript
interface Resources {
  metal: number;      // Common material (50 * shipClass)
  tech: number;       // Advanced components (20 * shipClass)
  components: number; // Rare parts (5 * shipClass)
}
```

#### Ship Methods
- **mineShip()**: Returns Resources, marks ship as mined (disabled)
- **convertToStation()**: Unlocks room slots (2 + shipClass, so 3-5 rooms)

#### Systems Added
- ✓ `mineShip(id)`: Strips ship for immediate resources
- ✓ `convertToStation(id)`: Converts claimed ship to station with rooms
- ✓ `getShipsByMode()`: Filter ships by mode
- ✓ `getDerelictShips()`: Get all unclaimed ships
- ✓ `getStations()`: Get all active stations
- ✓ `getMinedShips()`: Get all disabled ships

#### State Updates
- ✓ Added `resources: Resources` to GameState
- ✓ Ships track mode, maxRooms, and rooms array
- ✓ Initial starter ship is a station (mode: 'station', maxRooms: 3)

### Validation
- ✓ Build succeeds with no errors
- ✓ Resource types defined
- ✓ Ship mode transitions implemented
- ✓ Systems support new features

---

## Phase 3: Room System ✓

**Status:** COMPLETE

### Requirements

#### Room Types
```typescript
type RoomType = 'crew_quarters' | 'science_lab' | 'medical_bay' | 'recreation_deck' | 'cargo_hold';
```

#### Room Bonuses
- **crew_quarters**: +Crew capacity, minor morale bonus
- **science_lab**: +Research speed, tech discovery bonus
- **medical_bay**: +Heal rate, crew recovery
- **recreation_deck**: +Morale boost, crew efficiency
- **cargo_hold**: +Storage capacity for resources

#### Implementation Tasks
- [x] Create `src/types/room.ts`
- [x] Add `buildRoom(shipId, roomType)` to spacecraft-system
- [x] Add `upgradeRoom(shipId, roomId)` 
- [x] Add `removeRoom(shipId, roomId)`
- [x] Calculate room bonuses
- [x] UI for room building (src/ui/room-ui.ts)
- [x] Room cost system
- [x] Room upgrade system

---

## Phase 4: Power Cells & Cryo ✓

**Status:** COMPLETE

### Overview
Power Cells are a RARE and PRECIOUS resource obtained through risky scavenging (EXTRACT) and mission rewards. They're used to wake crew from cryo and convert ships to stations.

### Completed Tasks ✓

#### Economy Configuration
- ✅ Created `src/config/economy-config.ts`
  - Power cell wake costs (tier 1: 5, tier 2: 8, tier 3: 12)
  - Ship conversion costs (class 1: 8, class 2: 11, class 3: 15)
  - EXTRACT drop rates (5% base + 3% per class, engineer +2% bonus, scavenger +1%)
  - Mission power cell rewards (0-5 based on type)
  - Starting resources (0 power cells - must earn them)
  - Helper functions: calculateWakeCost(), calculateConversionCost(), calculateExtractDropChance()

#### Cryo System Updates
- ✅ Created `src/ui/cryo-ui.ts`
  - renderCryoPanel() displays frozen and awakened crew
  - Wake buttons with cost display (disabled if insufficient power cells)
  - checkWakeButtonClick() and checkCloseButtonClick() for interaction
  - Visual feedback for can/cannot afford states
  - Consistent with existing UI theme

#### Save/Load System
- ✅ Updated `src/game/game.ts`
  - SectorScavengersSave interface includes resources, cryoState, availableCryoPods
  - saveState() persists all cryo data
  - loadState() restores cryo pods with awakened status
  - Resources (including powerCells) persist across sessions

#### Narrative Cleanup
- ✅ Renamed OVERCLOCK → UPGRADE across all files:
  - src/types/cards.ts: CardType, UPGRADE_CARD constant
  - src/systems/tactic-card-system.ts: weights, executeUpgrade()
  - src/systems/depth-dive-system.ts: executeUpgrade()
  - src/ui/theme.ts: CARD_COLORS mapping
  - src/scenes/idle/constants.ts: How to Play text
  - src/scenes/start-scene.ts: How to Play text
  - NARRATIVE_REWORK.md: Documentation

#### Power Cell Drops
- ✅ Implemented in `src/systems/tactic-card-system.ts`
  - checkPowerCellDrop() method on successful EXTRACT
  - hasAssignedEngineer() checks for engineer bonuses
  - hasAssignedScavenger() checks for scavenger bonuses
  - Uses calculateExtractDropChance() from EconomyConfig
  - Adds power cells to game.state.resources.powerCells
  - Console logging for drops
  
- ✅ Implemented in `src/systems/depth-dive-system.ts`
  - Same implementation as tactic-card-system
  - Uses calculateExtractDropChance() with crew bonuses
  - Power cells added on successful extraction

### Completed Tasks ✓

#### Crew Assignment System ✅
- ✅ Assign/Unassign buttons on awakened crew cards
- ✅ Ship selection panel shows player-owned ships
- ✅ Ship panel displays ship ID, class, and current crew count
- ✅ Crew assignment updates `crew.assignment = { type: 'ship', targetId: shipId }`
- ✅ Unassign button sets `crew.assignment = undefined`
- ✅ Multiple crew can be assigned to same ship
- ✅ Console logging: `[Crew] Assigned {name} to Ship #{id}`
- ✅ Console logging: `[Crew] Unassigned {name} from Ship #{id}`
- ✅ Game state saved after assignment changes
- ✅ Ship selection panel closes on click-outside
- ✅ Apply crew bonuses to gameplay (Engineer, Scientist, Medic, Scavenger bonuses)
  - ✅ Scientist: +15% discovery chance (applied to discovery item weights in rounds 3/6/9)
  - ✅ Medic: +10% global crew efficiency (applied to hull repair, resource yields, power generation)
  - ✅ Engineer: Already applied to power cell drop rates and hull repair
  - ✅ Scavenger: Already applied to power cell drop rates and resource yield

#### Cryo Wake Integration ✅
- ✅ Integrated cryo modal into idle scene (crew button opens modal)
- ✅ ESC key closes modal
- ✅ Click outside modal or close button dismisses it
- ✅ Modal displays frozen crew with wake costs
- ✅ Modal displays awakened crew with assignment status
- ✅ Wake button deducts power cells and wakes crew
- ✅ Power cell count in modal matches game.state.resources.powerCells
- ✅ Modal renders on top of all other UI elements

#### Ship Conversion ✅
- ✅ Conversion UI added to room-ui.ts
- ✅ Button only visible on claimed ships (mode: 'claimed')
- ✅ Button shows power cell cost based on ship class (8/11/15)
- ✅ Button disabled if requirements not met (shows requirements list)
- ✅ Click calls conversion logic with all parameters
- ✅ Successful conversion deducts power cells from game.state.resources.powerCells
- ✅ Successful conversion shows message: "Ship converted to station! X room slots unlocked"
- ✅ Failed conversion shows error message
- ✅ Ship mode changes from 'claimed' to 'station'
- ✅ Ship management panel integrated into idle scene
- ✅ ESC key closes panel
- ✅ Console logging for conversion events

### Design Decisions
1. **Power Cells are scarce** - Only from EXTRACT (5-11% base) and missions
2. **Crew wake costs scale** - More crew awake = higher costs (5 + 3 per awake crew)
3. **Ship class matters** - Better ships = more power cells to convert
4. **Crew bonuses matter** - Engineers boost drop rates by +2%
5. **Drop rate capped at 20%** - Prevents farming exploitation

---

## Phase 5: Crew & Missions ✓

**Status:** COMPLETE

### Requirements

#### Crew System
- Assign crew to ships/rooms
- Crew provide passive bonuses
- Crew specialties (engineer, scientist, medic, pilot)

#### Mission System
- Send crew on automated missions
- Idle income generation
- Risk/reward mechanics

#### Implementation Tasks
- [x] Create `src/types/crew.ts`
- [x] Create `src/types/mission.ts`
- [x] Mission type definitions and generation config
- [x] Add crew assignment system
- [x] Add mission generation
- [x] Add mission completion
- [x] Mission UI integration
- [x] Balance mission rewards

---

## Phase 6: Progression Economy ⏳

**Status:** IN PROGRESS

### Requirements

#### Resource Balance
- Metal: Common, for basic building
- Tech: Uncommon, for advanced rooms
- Components: Rare, for upgrades and crew

#### Cost Curves
- Room building costs
- Room upgrade costs
- Ship conversion costs
- Crew wake costs

#### Implementation Tasks
- [x] Define cost curves
- [x] Balance room costs
- [x] Balance upgrade costs
- [x] Balance power cell costs
- [ ] Playtest progression
- [ ] Adjust economy

---

## Testing Checklist

### Phase 1 Complete ✓
- [x] Build succeeds with no errors
- [x] All terminology updated consistently
- [x] No references to "node" or "rig" in user-facing text
- [x] Save/load works with new structure

### Phase 2 Complete ✓
- [x] Ships can be claimed with SCAN
- [x] Ships can be mined for resources
- [x] Ships can be converted to stations
- [x] Resources tracked correctly
- [x] Ship modes display correctly

### Phase 3 Complete ✓
- [x] Rooms can be built on stations
- [x] Rooms provide bonuses
- [x] Rooms can be upgraded
- [x] Room costs defined

### Phase 4 Complete ✓
- [x] Power cells configured in economy system
- [x] Cryo UI created
- [x] Save/load for cryo state
- [x] OVERCLOCK renamed to UPGRADE
- [x] Power cell drops on EXTRACT
- [x] Cryo modal integrated into idle scene
- [x] Wake crew with power cell deduction
- [x] Crew assignment to ships
- [x] Ship conversion with power cell costs
- [x] Crew bonuses applied to gameplay

### Phase 5 Complete ✓
- [x] Crew can be assigned
- [x] Missions generate correctly
- [x] Mission completion implemented
- [x] Mission UI integrated into gameplay
- [x] Mission rewards balanced

### Phase 6 (In Progress)
- [x] Cost curves defined
- [x] Room costs balanced
- [x] Upgrade costs balanced
- [x] Power cell costs balanced
- [ ] Economy feels balanced (playtest needed)
- [ ] Progression feels rewarding (playtest needed)
- [ ] No resource bottlenecks (playtest needed)

---

## Notes

### Design Decisions
1. **Ship modes** instead of just owned/unowned - gives more player choice
2. **Resources split into 3 types** - allows for more strategic decisions
3. **Rooms on stations** - provides long-term progression
4. **Starter ship is a station** - gives player immediate access to room system
5. **Room types** - 6 different rooms with unique bonuses (crew_quarters, science_lab, medical_bay, recreation_deck, cargo_hold, engineering)

### Technical Debt
- None currently

### Known Issues
- Room UI not yet integrated into idle scene (Phase 3 complete but not yet hooked into gameplay)

---

## Changelog

### 2025-01-XX - Phase 5 Complete & Phase 6 Economy Started
- **Phase 5 marked COMPLETE ✓**
- All Phase 5 tasks finished:
  - Crew assignment system fully implemented
  - Mission types and generation config complete
  - MissionSystem class integrated into gameplay
  - Mission UI panel created and functional (src/ui/mission-ui.ts)
  - Mission progress tracking in update loop
  - Mission completion with resource rewards
  - Collect button for completed missions
  - Replacement mission generation after completion
  - Notification badge on mission button (available/complete)
- **Phase 6 started ⏳**
  - Economy configuration system created (src/config/economy-config.ts)
  - Room costs defined for all 6 room types
  - Room upgrade cost multipliers (linear scaling)
  - Power cell costs for crew wake (tier-based)
  - Power cell costs for ship conversion (class-based)
  - Starting resources balanced (100 metal, 50 tech, 20 components)
  - Helper functions for cost calculations
- **Documentation updated**
  - NARRATIVE_REWORK.md status accurate for all phases
  - Testing checklists updated
  - Changelog entries added
- Build succeeds with no errors

### 2025-01-XX - Phase 5 Integration & Mission System
- Added mission state to GameState (activeMissions, availableMissions, completedMissionCount)
- Created mission-ui.ts panel with available and active mission cards
- Added mission button to idle scene (x:1670, between crew and inventory buttons)
- Integrated MissionSystem into idle scene for mission generation and progress tracking
- Mission panel shows notification badge when missions available or complete
- Active missions display progress bars and time remaining
- Completed missions show COLLECT button to claim rewards
- Mission completion awards resources and generates replacement missions
- Console logging: `[Mission] Started {name} with {count} crew`
- Console logging: `[Mission] Completed {name}, earned {rewards}`
- Game state saved after mission start and completion
- Added economy cost curves for rooms and upgrades
- Defined ROOM_COSTS and ROOM_UPGRADE_COSTS in economy-config.ts
- Starting resources allow building 1-2 basic rooms immediately
- Build succeeds with no errors

### 2025-01-XX - Documentation Status Update
- Updated Phase 4 status from IN PROGRESS to COMPLETE
- Marked all Phase 4 checklist items as ✅ (all tasks completed)
- Updated Phase 5 task list with accurate implementation status:
  - Crew assignment system marked ✅ (fully implemented)
  - Mission type definitions and generation config marked ✅ (MISSION_CONFIG exists)
  - Mission generation marked ✅ (MissionSystem class exists)
  - Mission completion marked ✅ (completeMission method exists)
  - Mission UI integration marked as ⏳ (not yet integrated into gameplay)
- Updated Phase 5 testing checklist with accurate status
- Build succeeds with no errors

### 2025-01-XX - Phase 5 Integration & Mission System
- Added mission state to GameState (activeMissions, availableMissions, completedMissionCount)
- Created mission-ui.ts panel with available and active mission cards
- Added mission button to idle scene (x:1670, between crew and inventory buttons)
- Integrated MissionSystem into idle scene for mission generation and progress tracking
- Mission panel shows notification badge when missions available or complete
- Active missions display progress bars and time remaining
- Completed missions show COLLECT button to claim rewards
- Mission completion awards resources and generates replacement missions
- Console logging: `[Mission] Started {name} with {count} crew`
- Console logging: `[Mission] Completed {name}, earned {rewards}`
- Game state saved after mission start and completion
- Added economy cost curves for rooms and upgrades
- Defined ROOM_COSTS and ROOM_UPGRADE_COSTS in economy-config.ts
- Starting resources allow building 1-2 basic rooms immediately
- Build succeeds with no errors

### 2025-01-XX - Phase 5 In Progress (Mission Configuration)
- Updated src/types/mission.ts with fixed durations and risk levels
- Removed MISSION_TEMPLATES array (replaced by MISSION_CONFIG constant)
- Removed MissionTemplate interface (no longer needed)
- Added RiskLevel type ('low' | 'medium' | 'high')
- Added riskLevel field to Mission interface
- Created MISSION_CONFIG with:
  - Salvage: 2 min, low risk, metal-focused rewards
  - Patrol: 5 min, medium risk, balanced rewards
  - Trade: 10 min, medium risk, tech-focused rewards
  - Exploration: 15 min, high risk, best rewards including 5 power cells
- generateMission() now uses fixed durations from MISSION_CONFIG
- Power cell base values align with MISSION_POWER_CELL_REWARDS in economy-config.ts
- Build succeeds with no errors

### 2025-01-XX - Phase 4 In Progress (Ship Conversion UI)
- Added ship management panel to idle scene (triggered on claimed/station ship click)
- Created conversion UI in room-ui.ts with requirements display
- Conversion button shows cost (8/11/15 power cells based on class)
- Requirements checklist: Engineer assigned, Engineering Bay built, Power Cells available
- Button disabled with visual feedback when requirements not met
- Click handler calls conversion logic with proper parameter validation
- Success: deducts power cells, converts ship to station, unlocks room slots (3-5 based on class)
- Toast message shows success/error feedback (3 second duration)
- Ship mode visually updates from 'claimed' to 'station'
- ESC key closes ship management panel
- Console logging: `[Conversion] Ship X converted to station (Y power cells, Z slots)`
- Build succeeds with no errors

### 2025-01-XX - Phase 4 In Progress (Ship Conversion UI)
- Added ship management panel to idle scene (triggered on claimed/station ship click)
- Created conversion UI in room-ui.ts with requirements display
- Conversion button shows cost (8/11/15 power cells based on class)
- Requirements checklist: Engineer assigned, Engineering Bay built, Power Cells available
- Button disabled with visual feedback when requirements not met
- Click handler calls conversion logic with proper parameter validation
- Success: deducts power cells, converts ship to station, unlocks room slots (3-5 based on class)
- Toast message shows success/error feedback (3 second duration)
- Ship mode visually updates from 'claimed' to 'station'
- ESC key closes ship management panel
- Console logging: `[Conversion] Ship X converted to station (Y power cells, Z slots)`
- Build succeeds with no errors
- Applied +10% global crew efficiency bonus per medic assigned to any ship
- Bonus multiplies: hull repair amounts, resource yields (EXTRACT), power generation rates
- Updated idle-system.ts to apply efficiency bonus to power generation
- Updated depth-dive-system.ts to apply efficiency bonus to repair and extract
- Updated tactic-card-system.ts to apply efficiency bonus to repair and extract
- Added UI badge in idle scene showing active efficiency bonus ("+10% EFFICIENCY")
- Console log: `[Efficiency] Medic bonus: +10%` when bonus is active
- Bonus stacks: 2 medics = +20%, 3 medics = +30%, etc.
- Build succeeds with no errors

### 2025-01-XX - Phase 4 In Progress (Scientist Discovery Bonus)
- Applied +15% discovery bonus when scientist assigned to active ship
- Updated getDiscoveryItem() in depth-dive-system.ts to check for scientist
- Uses getDiscoveryBonus() from crew-bonus-system.ts
- Bonus multiplies discovery item weights (increases chance of rare items)
- Console log: `[Discovery] Scientist bonus: +15% chance`
- Added getDiscoveryBonus import to tactic-card-system.ts
- Build succeeds with no errors

### 2025-01-XX - Phase 4 In Progress (Crew Assignment UI)
- Added Assign/Unassign buttons to awakened crew cards
- Created ship selection panel showing player-owned ships
- Ship panel displays: Ship ID, Class, current crew assignments
- Implemented handleAssignCrew() and handleUnassignCrew() in idle scene
- Crew assignment updates crew.assignment with type='ship' and targetId
- Unassign button clears crew.assignment
- Multiple crew can be assigned to same ship
- Console logging for assignments and unassignments
- Game state saved after all assignment changes
- Click outside ship selection panel closes it
- Build succeeds with no errors

### 2025-01-XX - Phase 4 In Progress (Wake Crew Implementation)
- Fixed wakeCrewMember() to use calculateWakeCost() for consistent pricing
- Wake cost scales with awake crew count (5 + 3 per awake crew)
- Wake button passes awake crew count to cryo-system.ts
- Power cells properly deducted from game.state.resources.powerCells
- Crew member's awake property set to true
- Game state saved after successful wake
- Console logs wake event: `[Cryo] Woke {name} for {cost} power cells`
- Frozen and awakened crew lists update immediately in UI
- Build succeeds with no errors

### 2025-01-XX - Phase 4 In Progress (Cryo Modal Integration)
- Integrated cryo modal into idle scene via crew button (x:1730)
- Added InputHandler state for cryo modal (showCryoModal flag)
- Implemented handleCryoModalInput() for wake/close interactions
- Implemented handleWakeCrew() to deduct power cells and wake crew
- Implemented renderCryoModal() to display crew and power cell count
- ESC key closes modal (higher priority than help modal)
- Click outside modal dismisses it
- Close button in modal works correctly
- Modal renders on top of all UI elements
- Power cell count matches game.state.resources.powerCells
- Build succeeds with no errors

### 2025-01-XX - Phase 4 In Progress (Earlier)
- Created centralized EconomyConfig in src/config/economy-config.ts
- Power cell costs for wake (tier-based) and ship conversion (class-based)
- EXTRACT drop rates with crew bonuses (engineer +2%, scavenger +1%)
- Mission power cell rewards (0-5 based on type)
- Created Cryo UI in src/ui/cryo-ui.ts with wake buttons
- Updated save/load in game.ts to persist cryo state and resources
- Renamed OVERCLOCK → UPGRADE across entire codebase
- Implemented power cell drops on successful EXTRACT in both card systems
- Added engineer/scavenger bonus checks for improved drop rates
- Build succeeds with no errors

### 2024-01-XX - Phase 3 Complete
- Created room type system with 6 room types
- Created room configuration with costs and bonuses
- Added buildRoom(), upgradeRoom(), removeRoom() to SpacecraftSystem
- Created UI components for room management
- Room bonuses calculate correctly
- Build succeeds with no errors

### 2024-01-XX - Phase 2 Complete
- Added ship mode system (derelict/claimed/mined/station)
- Added resources system (metal, tech, components)
- Added mineShip() and convertToStation() methods
- Added ship mode getters
- Updated all terminology from Phase 1
- Build succeeds with no errors

### 2024-01-XX - Phase 1 Complete
- Renamed all node/rig terminology to ship/hull
- Updated all type definitions
- Updated all systems
- Updated all scenes and UI
- Build succeeds with no errors

---

## Phase 7: Makko-Safe Expansion Roadmap

**Status:** READY FOR EXECUTION

### Goal

Implement the debt-driven macro loop, named recruitable leads, sector progression, and narrative reactivity without destabilizing the live Makko game architecture.

This phase is intentionally designed to:

- touch as few files as possible
- prefer existing hot-path files over unused abstractions
- record progress inside this document so another agent can resume if execution freezes
- keep future expansion possible once the first safe version is in

### Makko / Project Constraints To Respect

These are the current architectural realities of the project and should shape all implementation prompts:

1. **The live game is driven by one mutable `Game.state`**
   - Primary hot path:
     - `src/types/state.ts`
     - `src/game/game.ts`

2. **Save/load is manual**
   - Any new persistent field must be added to:
     - runtime state in `src/types/state.ts`
     - save interface in `src/game/game.ts`
     - `saveState()` in `src/game/game.ts`
     - `loadState()` in `src/game/game.ts`
   - If save shape changes materially, bump save version and wire migration.

3. **The real scene pattern is scene-local and imperative**
   - Use existing active scenes:
     - `src/scenes/idle/index.ts`
     - `src/scenes/depth-dive-scene.ts`
     - `src/scenes/results-scene.ts`
     - `src/scenes/start-scene.ts`
   - Avoid building major features on `BaseScene`, `SystemRegistry`, or other half-unused abstractions.

4. **UI is fixed-layout, immediate-mode, and manually hit-tested**
   - Preferred UI extension points:
     - `src/scenes/idle/render-ui.ts`
     - `src/scenes/idle/input-handler.ts`
     - existing cryo and mission UI modules
   - Do not introduce a new UI framework.

5. **Crew currently has split ownership**
   - Prefer `cryoState.pods[*].crew` as the live source of truth.
   - Do not deepen reliance on `crewRoster` unless first unified.

6. **Avoid using disconnected systems as if they are live foundations**
   - Treat these as reference only unless explicitly brought back into the hot path:
     - `src/systems/node-system.ts`
     - `src/systems/spacecraft-system.ts`
     - `src/systems/room-system.ts`
     - `src/scene/base-scene.ts`
     - `src/scene/system-registry.ts`

7. **Prefer extending existing files before creating new ones**
   - New files are only justified if an existing live file becomes unmanageably large.

### Execution Protocol

Every agent working on Phase 7 must do the following:

1. Read these files first:
   - `NARRATIVE_REWORK.md`
   - `CHARACTER_BIBLE.md`
   - `DEBT_LOOP_AND_SECTOR_ARC.md`
   - `src/types/state.ts`
   - `src/game/game.ts`

2. Before editing, identify the minimum existing files needed.

3. After completing the task:
   - mark the task checkbox below
   - update the **Phase 7 Task Log**
   - add a short note to the **Phase 7 Changelog**
   - include changed file paths
   - include the commit hash if a commit was made
   - list any open risks or incomplete follow-ups

4. If a save schema changed:
   - note the save version change in the log
   - document migration behavior in the changelog entry

5. If execution freezes:
   - the next agent should resume from this section and continue from the first unchecked task or the last incomplete log entry

### Phase 7 Task Checklist

- [x] P7.1 - Persistence hardening and source-of-truth cleanup
  - Save missing runtime fields that already matter
  - Decide crew source of truth and reduce split ownership
  - Do not expand features yet; stabilize the hot path

- [x] P7.2 - Debt/meta state scaffold
  - Add debt, debt ceiling, payment due, billing timer, current sector, and doctrine scaffolding
  - Persist all fields safely
  - Add no major gameplay logic yet

- [x] P7.3 - Debt HUD and statement visibility
  - Surface debt state in the idle hub UI
  - Add countdown/statement visibility without overhauling layout
  - Keep to existing `render-ui.ts` / idle scene structure

- [x] P7.4 - Billing cycle processor
  - Implement cycle rollover and due payments
  - Use existing time patterns compatible with save/load
  - Keep logic centralized rather than scattered across card actions

- [x] P7.5 - Run outcome integration
  - Make run earnings feed the debt loop
  - Show debt-relevant outcomes in results and/or signal log
  - Keep `tactic-card-system.ts` changes focused and minimal

- [x] P7.6 - Named recruit skeleton in cryo flow
  - Add authored recruit metadata
  - Reuse cryo as the recruit acquisition surface
  - Avoid adding a new recruit scene

- [x] P7.7 - Debt-gated recruit waking
  - Waking named recruits adds debt
  - Enforce debt ceiling rules cleanly
  - Make the player feel the cost of bringing people into the station

- [x] P7.8 - Sector progression shell
  - Add current sector and minimal unlock/progression scaffolding
  - Reuse hub population and results flow where possible
  - No giant world-map scene yet

- [ ] P7.9 - Narrative reactivity pass
  - Add debt warnings, recruit arrivals, and sector beats to existing narrative surfaces
  - Prefer signal log, results text, and lightweight hub reactions over a large new dialogue framework

- [ ] P7.10 - Future-expansion cleanup
  - Confirm the implementation can scale
  - Document follow-up seams for doctrine, endings, and additional sectors
  - Avoid premature refactors

### Phase 7 Task Log

Use one line per completed task.

| Task | Status | Changed Files | Save Version | Commit | Notes / Risks |
| --- | --- | --- | --- | --- | --- |
| P7.1 | complete | src/types/state.ts, src/game/game.ts, src/systems/tactic-card-system.ts, src/systems/cryo-system.ts | 1 | (pending commit) | Fixed crew source of truth bug (cryoState.pods is source), added shipClaimProgress persistence, added recalculateAwakenedCount() safety validation |
| P7.2 | complete | src/types/state.ts, src/game/game.ts | 1 | (pending commit) | Additive meta state scaffold with debt/sector/doctrine fields, backward compatible |
| P7.3 | complete | src/scenes/idle/render-ui.ts, src/scenes/idle/index.ts | 1 | (pending commit) | Debt panel rendering with warning visuals, positioned at (30, 180) below existing UI, no overlap or hit-test issues |
| P7.4 | complete | src/systems/idle-system.ts, src/game/game.ts | 1 | (pending commit) | Centralized billing in IdleSystem, timestamp-based processing, offline catchup, signal log hooks |
| P7.5 | complete | src/game/game.ts, src/scenes/results-scene.ts, src/types/state.ts | 1 | (pending commit) | Debt consequences on run completion, results scene displays impact |
| P7.6 | complete | src/types/crew.ts, src/systems/cryo-system.ts, src/ui/cryo-ui/frozen-card.ts, src/ui/cryo-ui/awake-card.ts | 1 | (pending commit) | Authored recruit types with bio field, createAuthoredCrewMember(), createAuthoredPod(), UI visual distinction with ★ badge and golden border |
| P7.7 | complete | src/config/economy-config.ts, src/systems/cryo-system.ts, src/scenes/idle/cryo-handlers.ts, src/ui/cryo-ui/frozen-card.ts, src/ui/cryo-ui/panel.ts | 1 | (pending commit) | Authored recruits add 150 debt on wake, debt ceiling enforced, UI shows debt cost warnings and DEBT CAP indicator |
| P7.8 | complete | src/config/economy-config.ts, src/game/game.ts, src/systems/idle-system.ts, src/systems/hub-system.ts, src/scenes/idle/index.ts, src/scenes/idle/render-ui.ts, src/scenes/results-scene.ts | 1 | (pending commit) | 3-sector progression with mission/debt unlock conditions, hub rarity weights vary by sector, sector displayed in debt panel and results |
| P7.9 | pending |  |  |  |  |
| P7.10 | pending |  |  |  |  |

### Phase 7 Changelog

### 2025-01-XX - P7.5 Complete: Run Outcome Integration
**Summary:**
- Run outcomes now affect debt progression with clear consequence formulas
- Successful EXTRACT: 15% of extracted rewards reduces debt
- Run completion bonus (all 10 rounds): extra 25 debt reduction
- Death/collapse: 25 debt penalty (momentum loss)
- Debt never goes below 0 (floor at 0)
- Signal log announces major financial events (>50 reduction or any penalty)
- Results scene displays debt impact in both success and collapse states
- Console logging for debugging: [Debt] Run consequence: +X/-Y debt (reason)

**Changed Files:**
- src/types/state.ts - Added debtChange field to RunState
- src/game/game.ts - Added applyDebtConsequences() method, integrated signal log system
- src/scenes/results-scene.ts - Added debt service display in success state, penalty display in collapse state

**Validation:**
- Build succeeds (TypeScript compiles with no errors)
- Debt calculations applied correctly based on run outcome
- Results scene displays debt changes without overlapping existing UI
- Signal log receives breaking news for significant debt events
- No save version bump needed (debtChange is optional field, backward compatible)

**Risks:**
- None identified. All debt logic centralized in Game.endDepthDive() for maintainability.

### 2025-01-XX - P7.4 Complete: Billing Cycle Processor
**Summary:**
- Extended IdleSystem with centralized billing cycle processing logic
- Timestamp-based processing survives save/load correctly
- Payment calculation formula: base 50 + 10% of current debt (capped 50-200)
- Cycle rollover sets nextBillingTimestamp to 7 days in future
- Overdue detection when debt >= debt ceiling
- Signal log receives billing events via addBreakingNews()
- Offline processing handles all missed billing cycles on load
- Console logging for debugging: [Billing] Cycle processed, [Billing] Loaded with X cycle(s) to process

**Changed Files:**
- src/systems/idle-system.ts - Added billing cycle constants, processBillingCycles(), processBillingCycle(), calculatePendingCycles(), billing accessors, resetBillingCheck()
- src/game/game.ts - Added billing timestamp validation logging on load

**Validation:**
- Build succeeds (TypeScript compiles with no errors)
- Billing timestamps survive save/load correctly
- Multiple billing cycles process correctly if offline for extended time
- Console logging confirms correct behavior on load and processing
- No save version bump needed (nextBillingTimestamp already persisted in P7.2)

**Risks:**
- None identified. All billing logic is centralized and timestamp-based for persistence safety.

### 2025-01-XX - P7.3 Complete: Debt HUD and Billing Statement Visibility
**Summary:**
- Added debt panel to idle hub UI displaying outstanding debt, debt ceiling, payment due, and billing countdown
- Implemented warning visuals with color-coded states (cyan < 70%, yellow 70-90%, red >= 90%)
- Added pulsing border animations for warning (yellow) and critical (red) debt levels
- Critical state shows "⚠ WARNING" text indicator
- Countdown formatted as "Xd Xh Xm" from nextBillingTimestamp

**Changed Files:**
- src/scenes/idle/render-ui.ts - Added renderDebtPanel() method with debt display and warning visuals
- src/scenes/idle/index.ts - Integrated debt panel into renderMainUI() after viral multiplier badge

**Validation:**
- Build succeeds (TypeScript compiles with no errors)
- Panel positioned at (30, 180) below existing UI elements (energy: y=30, efficiency: y=90, viral: y=135)
- No overlap with existing UI elements verified
- No hit-testing issues (debt panel is display-only, no interaction)
- Warning visual states implemented: normal (cyan), warning 70%+ (yellow pulse), critical 90%+ (red fast pulse)

**Risks:**
- None identified. Debt panel is display-only with no gameplay logic.

### 2025-01-XX - P7.2 Complete: Debt/Meta State Scaffold
**Summary:**
- Added MetaState interface with 6 fields: outstandingDebt, debtCeiling, paymentDue, nextBillingTimestamp, currentSector, operatingModel
- Created createMetaState() factory with defaults (debt: 0, ceiling: 1000, sector: sector-1, doctrine: salvager)
- Integrated MetaState into GameState interface with `meta: MetaState` field
- Added meta persistence to SectorScavengersSave interface
- Implemented save/load with null coalescing for backward compatibility

**Changed Files:**
- src/types/state.ts - Added MetaState interface, createMetaState() factory, and meta field to GameState
- src/game/game.ts - Added MetaState import, meta field to save interface, save/load persistence

**Validation:**
- Build succeeds (TypeScript compiles with no errors)
- Old saves load correctly with default meta state (null coalescing)
- No save version bump needed (additive change, backward compatible)

**Risks:**
- None identified. Pure additive scaffold with no gameplay logic.

### 2025-01-XX - P7.1 Complete: Persistence Hardening & Source-of-Truth Cleanup
**Summary:**
- Fixed crew source of truth: cryoState.pods[*].crew is now the authoritative source
- Added shipClaimProgress to save/load persistence
- Added recalculateAwakenedCount() safety validation function
- Updated tactic-card-system to read crew from cryo pods
- Documented deprecated crewRoster and crewAssignments fields

**Changed Files:**
- src/types/state.ts - Added documentation clarifying crew source of truth, marked crewRoster/crewAssignments as deprecated
- src/game/game.ts - Added shipClaimProgress to save/load, added recalculateAwakenedCount() call on load
- src/systems/tactic-card-system.ts - Updated crew XP/death loss to use pods instead of crewRoster
- src/systems/cryo-system.ts - Added recalculateAwakenedCount() function with desync warning

**Validation:**
- Build succeeds (TypeScript compiles with no errors)
- No breaking changes to save format (version remains 1)
- Safety validation logs warnings if desync detected and auto-corrects

**Risks:**
- None identified. All changes are low-risk and backward-compatible.
- crewRoster and crewAssignments fields remain for P7.2 work but are documented as deprecated.

### 2025-01-XX - P7.8 Complete: Sector Progression Shell
**Summary:**
- Implemented minimal 3-sector progression system with unlock conditions
- Sector unlock formula: missions >= (N-1) * 5 AND debt < ceiling * 0.8
- Sector 1: Starting sector (always unlocked)
- Sector 2: Requires 5 missions + debt < 80% ceiling
- Sector 3: Requires 10 missions + debt < 80% ceiling
- Hub varies ship rarity weights by sector:
  - Sector 1: 40% Common, 25% Uncommon, 15% Rare, 10% Epic, 8% Legendary, 2% Jackpot
  - Sector 2: 30% Common, 25% Uncommon, 20% Rare, 12% Epic, 10% Legendary, 3% Jackpot
  - Sector 3: 20% Common, 25% Uncommon, 25% Rare, 15% Epic, 12% Legendary, 3% Jackpot
- IdleSystem checks sector unlock every 5 seconds
- Signal log announces sector advancement
- Results scene displays current sector number
- Debt panel shows sector indicator

**Changed Files:**
- src/config/economy-config.ts - Added SECTOR_CONFIG with unlock conditions and rarity weights
- src/game/game.ts - Added checkSectorUnlock(), getCurrentSectorNumber() methods
- src/systems/idle-system.ts - Added periodic sector unlock checking
- src/systems/hub-system.ts - Updated populate() to accept sector parameter and vary weights
- src/scenes/idle/index.ts - Pass current sector to hub populate()
- src/scenes/idle/render-ui.ts - Added sector display to debt panel
- src/scenes/results-scene.ts - Added sector display to results summary

**Validation:**
- Build succeeds (TypeScript compiles with no errors)
- Sector unlock logic centralized in Game.checkSectorUnlock()
- Hub varies ship quality appropriately per sector
- No save version bump needed (currentSector already persisted in P7.2)

**Risks:**
- None identified. Sector progression is lightweight and expandable.

### 2025-01-XX - P7.7 Complete: Debt-Gated Recruit Waking
**Summary:**
- Named (authored) recruits add 150 debt when woken
- Debt ceiling (1000) enforced - cannot wake authored recruits if would exceed cap
- Cryo UI shows debt cost warning ("DEBT: +150") for authored recruits
- UI shows "DEBT CAP" warning when player cannot afford debt
- wakeCrewMember() signature updated with debt parameters
- Signal log announces authored recruit contracts
- Console logging for all wake events including debt costs

**Changed Files:**
- src/config/economy-config.ts - Added DEBT_CONFIG with authoredRecruitDebtCost (150) and debtCeiling (1000)
- src/systems/cryo-system.ts - Updated wakeCrewMember() to check debt ceiling, return debtCost
- src/scenes/idle/cryo-handlers.ts - Pass debt params, apply debt on success, import signalLogSystem
- src/ui/cryo-ui/frozen-card.ts - Added debt warning display, debt cap indicator
- src/ui/cryo-ui/panel.ts - Pass debt params through to frozen card rendering

**Validation:**
- Build succeeds (TypeScript compiles with no errors)
- Debt ceiling prevents over-recruiting
- Clear visual feedback for debt costs
- Generic crew remain debt-free
- No save version bump needed (outstandingDebt already persisted in P7.2)

**Risks:**
- None identified. Debt-gated waking creates meaningful resource management choice.

### 2025-01-XX - P7.6 Complete: Named Recruit Skeleton
**Summary:**
- Added AuthoredRecruit interface and AUTHORED_RECRUITS constant with example character (Vera Chen - Engineer)
- Extended CrewMember interface with optional isAuthored, authoredId, and bio fields (backward compatible)
- Created createAuthoredCrewMember() to generate CrewMember from authored definition
- Created createAuthoredPod() in cryo-system to create CryoPods from authored recruits
- Updated frozen-card.ts UI to display authored recruits with:
  - ★ badge after name
  - Golden border (COLORS.warningYellow)
  - Bio text instead of role description (truncated with ...)
- Updated awake-card.ts UI with consistent authored recruit styling
- Generic crew unchanged - no badge, no bio, normal styling

**Changed Files:**
- src/types/crew.ts - Added AuthoredRecruit interface, AUTHORED_RECRUITS constant, createAuthoredCrewMember()
- src/systems/cryo-system.ts - Added createAuthoredPod() function
- src/ui/cryo-ui/frozen-card.ts - Added authored recruit visual distinction
- src/ui/cryo-ui/awake-card.ts - Added authored recruit visual distinction

**Validation:**
- Build succeeds (TypeScript compiles with no errors)
- Generic crew still work (isAuthored === undefined, no authored UI elements)
- Authored recruits display correctly with bio and badge
- No save version bump needed (additive fields, backward compatible)

**Risks:**
- None identified. All changes are additive and backward compatible.

### Prompt Pack: Makko-Safe Execution Order

Each prompt below is designed to be run independently. Every prompt tells the next agent how to work safely in this repo and how to record progress.

#### Prompt 1 - Stabilize the hot path before adding features

```text
You are working in the Sector Scavengers repository.

First read:
- NARRATIVE_REWORK.md
- CHARACTER_BIBLE.md
- DEBT_LOOP_AND_SECTOR_ARC.md
- src/types/state.ts
- src/game/game.ts

Goal:
Complete Phase 7 task P7.1 only: persistence hardening and source-of-truth cleanup.

Requirements:
- Do not add any new files unless absolutely necessary.
- Prefer editing existing hot-path files only.
- Treat the live architecture as:
  - one mutable Game.state
  - manual save/load in src/game/game.ts
  - scene-local UI and input
- Do not refactor toward BaseScene/SystemRegistry.
- Do not add debt gameplay yet.

Focus on:
- saving runtime fields that already matter but are not persisted
- choosing and documenting one crew source of truth
- reducing split ownership between cryoState and crewRoster enough that future named recruit work is safe
- making the least invasive changes possible

Likely files:
- src/types/state.ts
- src/game/game.ts
- src/systems/tactic-card-system.ts
- src/systems/cryo-system.ts

Before finishing:
- run relevant validation/build if available
- update NARRATIVE_REWORK.md:
  - check off P7.1
  - fill in the P7.1 row in the Phase 7 Task Log
  - append a Phase 7 changelog note
- commit and push the change
```

#### Prompt 2 - Add the debt/meta state scaffold

```text
You are working in the Sector Scavengers repository.

First read:
- NARRATIVE_REWORK.md
- DEBT_LOOP_AND_SECTOR_ARC.md
- src/types/state.ts
- src/game/game.ts

Goal:
Complete Phase 7 task P7.2 only: add the debt/meta state scaffold safely.

Requirements:
- Do not add full gameplay logic yet.
- Do not create new systems if the state can live cleanly in existing files.
- Prefer a coherent meta state shape over scattering many top-level fields.
- Persist everything end-to-end.
- If save shape changes materially, bump version and wire migration.

Add the minimum scaffold needed for later work:
- outstanding debt
- debt ceiling
- payment due
- next billing timestamp or cycle timing fields
- current sector
- light doctrine/operating model scaffolding

Likely files:
- src/types/state.ts
- src/game/game.ts

Before finishing:
- validate the game still loads existing/new saves safely
- update NARRATIVE_REWORK.md:
  - check off P7.2
  - fill in the P7.2 log row
  - append a changelog note with save version details
- commit and push
```

#### Prompt 3 - Surface debt cleanly in the hub UI

```text
You are working in the Sector Scavengers repository.

First read:
- NARRATIVE_REWORK.md
- DEBT_LOOP_AND_SECTOR_ARC.md
- src/scenes/idle/index.ts
- src/scenes/idle/render-ui.ts
- src/scenes/idle/input-handler.ts

Goal:
Complete Phase 7 task P7.3 only: add debt HUD and statement visibility in the idle hub.

Requirements:
- Stay inside the existing fixed 1920x1080 layout model.
- Reuse current render/input patterns.
- Do not create a new UI framework or scene.
- Keep the layout additive and low-risk.

Add:
- outstanding debt display
- debt ceiling display
- payment due display
- billing countdown or next statement indicator
- minimal warning visuals near cap

Likely files:
- src/scenes/idle/index.ts
- src/scenes/idle/render-ui.ts

Optional if needed:
- src/scenes/results-scene.ts

Before finishing:
- verify no overlap or broken hit-testing in the idle scene
- update NARRATIVE_REWORK.md:
  - check off P7.3
  - fill in the P7.3 log row
  - append a changelog note
- commit and push
```

#### Prompt 4 - Implement the billing cycle processor

```text
You are working in the Sector Scavengers repository.

First read:
- NARRATIVE_REWORK.md
- DEBT_LOOP_AND_SECTOR_ARC.md
- src/game/game.ts
- src/systems/idle-system.ts
- src/scenes/idle/index.ts

Goal:
Complete Phase 7 task P7.4 only: implement billing cycle processing safely.

Requirements:
- Centralize billing logic; do not scatter it through many card handlers.
- Use a persistence-friendly time model.
- Reuse existing idle/update timing patterns or timestamp-based patterns.
- Keep the first version simple and debuggable.

Implement:
- cycle rollover
- payment due processing
- near-cap warning state
- default/overdue consequences scaffold
- hooks that later prompts can surface in UI/narrative

Likely files:
- src/game/game.ts
- src/systems/idle-system.ts
- src/scenes/idle/index.ts

Optional:
- src/systems/signal-log-system.ts

Before finishing:
- validate save/load behavior around billing timing
- update NARRATIVE_REWORK.md:
  - check off P7.4
  - fill in the P7.4 log row
  - append a changelog note
- commit and push
```

#### Prompt 5 - Make runs feed the debt loop

```text
You are working in the Sector Scavengers repository.

First read:
- NARRATIVE_REWORK.md
- DEBT_LOOP_AND_SECTOR_ARC.md
- src/systems/tactic-card-system.ts
- src/scenes/results-scene.ts
- src/game/game.ts

Goal:
Complete Phase 7 task P7.5 only: integrate run outcomes with debt progression.

Requirements:
- Keep debt resolution concentrated in a small number of places.
- Avoid turning tactic-card-system.ts into an even broader god-object than necessary.
- Preserve the current run/results flow.

Implement the minimum viable loop:
- successful runs contribute to paying or servicing debt
- failed runs meaningfully hurt momentum
- results scene shows debt-relevant consequences
- signal log or other existing text surfaces can announce major financial events

Likely files:
- src/systems/tactic-card-system.ts
- src/scenes/results-scene.ts
- src/game/game.ts
- src/systems/signal-log-system.ts

Before finishing:
- verify current run state still survives into results correctly
- update NARRATIVE_REWORK.md:
  - check off P7.5
  - fill in the P7.5 log row
  - append a changelog note
- commit and push
```

#### Prompt 6 - Add named recruits through the existing cryo flow

```text
You are working in the Sector Scavengers repository.

First read:
- NARRATIVE_REWORK.md
- CHARACTER_BIBLE.md
- DEBT_LOOP_AND_SECTOR_ARC.md
- src/types/crew.ts
- src/systems/cryo-system.ts
- src/scenes/idle/cryo-handlers.ts
- src/ui/cryo-ui/panel.ts

Goal:
Complete Phase 7 task P7.6 only: create a named recruit skeleton using the existing cryo flow.

Requirements:
- Reuse cryo as the recruit surface; do not build a new recruit scene.
- Keep new files to zero if possible.
- Use cryoState as the live source of truth unless Phase 7 log says otherwise.
- Implement only enough authored data and UI to support future named leads cleanly.

Focus on:
- recruit metadata on crew
- a distinction between generic and authored recruits
- displaying named recruit details in the cryo UI
- keeping the implementation future-expandable

Likely files:
- src/types/crew.ts
- src/systems/cryo-system.ts
- src/scenes/idle/cryo-handlers.ts
- src/ui/cryo-ui/panel.ts
- src/ui/cryo-ui/frozen-card.ts
- src/ui/cryo-ui/awake-card.ts

Before finishing:
- verify generic crew still work
- update NARRATIVE_REWORK.md:
  - check off P7.6
  - fill in the P7.6 log row
  - append a changelog note
- commit and push
```

#### Prompt 7 - Make waking named recruits add debt

```text
You are working in the Sector Scavengers repository.

First read:
- NARRATIVE_REWORK.md
- CHARACTER_BIBLE.md
- DEBT_LOOP_AND_SECTOR_ARC.md
- src/systems/cryo-system.ts
- src/scenes/idle/cryo-handlers.ts
- src/game/game.ts
- src/scenes/idle/render-ui.ts

Goal:
Complete Phase 7 task P7.7 only: debt-gated recruit waking.

Requirements:
- Waking named recruits should deepen the debt loop in a way the player can understand.
- Enforce debt ceiling rules cleanly.
- Keep the player-facing UX inside the current cryo and hub UI surfaces.
- Do not create a separate contract or HR scene.

Implement:
- named recruit wake debt
- debt ceiling checks before wake
- clear UI messaging about the financial consequence
- basic narrative feedback through existing surfaces

Likely files:
- src/systems/cryo-system.ts
- src/scenes/idle/cryo-handlers.ts
- src/scenes/idle/render-ui.ts
- src/game/game.ts
- src/systems/signal-log-system.ts

Before finishing:
- verify failed wake attempts are safe and readable
- update NARRATIVE_REWORK.md:
  - check off P7.7
  - fill in the P7.7 log row
  - append a changelog note
- commit and push
```

#### Prompt 8 - Add a minimal sector progression shell

```text
You are working in the Sector Scavengers repository.

First read:
- NARRATIVE_REWORK.md
- CHARACTER_BIBLE.md
- DEBT_LOOP_AND_SECTOR_ARC.md
- src/types/state.ts
- src/systems/hub-system.ts
- src/scenes/idle/index.ts
- src/scenes/results-scene.ts

Goal:
Complete Phase 7 task P7.8 only: add a minimal sector progression shell.

Requirements:
- Do not build a giant map or extra campaign scene yet.
- Reuse the current hub population and run loop.
- Make sectors feel like progression, not just a label.

Implement:
- current sector tracking
- minimal unlock conditions or progression milestones
- hub population variation by sector if safe
- basic UI surfacing in the idle hub and/or results

Likely files:
- src/types/state.ts
- src/game/game.ts
- src/systems/hub-system.ts
- src/scenes/idle/index.ts
- src/scenes/idle/render-ui.ts
- src/scenes/results-scene.ts

Before finishing:
- verify current hub behavior is still stable
- update NARRATIVE_REWORK.md:
  - check off P7.8
  - fill in the P7.8 log row
  - append a changelog note
- commit and push
```

#### Prompt 9 - Add narrative reactivity using existing surfaces

```text
You are working in the Sector Scavengers repository.

First read:
- NARRATIVE_REWORK.md
- CHARACTER_BIBLE.md
- DEBT_LOOP_AND_SECTOR_ARC.md
- src/systems/signal-log-system.ts
- src/scenes/results-scene.ts
- src/scenes/idle/index.ts
- src/dialogue/story-state.ts

Goal:
Complete Phase 7 task P7.9 only: add narrative reactivity for debt, recruits, and sector progression.

Requirements:
- Prefer existing surfaces:
  - signal log
  - results copy
  - hub reactions
- Do not introduce a large new dialogue framework unless absolutely required.
- Keep the first pass lightweight, systemic, and expandable.

Implement:
- debt warnings and statement beats
- recruit arrival beats
- sector progression beats
- a small amount of persistent narrative state if needed

Likely files:
- src/systems/signal-log-system.ts
- src/scenes/results-scene.ts
- src/scenes/idle/index.ts
- src/game/game.ts
- src/dialogue/story-state.ts

Before finishing:
- verify the new text beats do not spam or break flow
- update NARRATIVE_REWORK.md:
  - check off P7.9
  - fill in the P7.9 log row
  - append a changelog note
- commit and push
```

#### Prompt 10 - Clean up for future expansion without over-refactoring

```text
You are working in the Sector Scavengers repository.

First read:
- NARRATIVE_REWORK.md
- CHARACTER_BIBLE.md
- DEBT_LOOP_AND_SECTOR_ARC.md
- the Phase 7 Task Log and Changelog entries

Goal:
Complete Phase 7 task P7.10 only: future-expansion cleanup.

Requirements:
- Do not perform a broad architecture rewrite.
- Improve only the seams needed to support more sectors, more recruits, doctrine, and endings later.
- Keep file count low.

Focus on:
- confirming the final source of truth for crew/meta progression
- documenting extension seams
- cleaning up any dangerous duplication introduced in Phase 7
- leaving the codebase more expandable than before

Likely files:
- NARRATIVE_REWORK.md
- src/types/state.ts
- src/game/game.ts
- any Phase 7 hot-path files that need minor cleanup

Before finishing:
- update NARRATIVE_REWORK.md:
  - check off P7.10
  - fill in the P7.10 log row
  - append a changelog note
- commit and push
```

### Recommended Implementation Order

Run the prompts in order.

Do **not** skip straight to sectors or named recruits before:
- persistence is stable
- debt state exists
- billing is in place

That order is what keeps the Makko project from becoming brittle.
