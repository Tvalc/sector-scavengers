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
