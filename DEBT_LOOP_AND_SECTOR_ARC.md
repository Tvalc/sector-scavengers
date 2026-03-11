# DEBT LOOP AND SECTOR ARC: Sector Scavengers

## Core Thesis

Debt should not be a joke in the tutorial. Debt should be the **macro loop**.

The player is not simply collecting rewards. The player is operating under a predatory salvage contract where:

- waking up costs money
- growth costs money
- expansion costs money
- safety costs money
- every new life brought into the station deepens obligation

That makes the game feel larger, more roguelike, and more on-brand at the same time.

The emotional fantasy becomes:

> "I am not escaping debt by playing runs. I am deciding what kind of system I am willing to build in order to survive it."

---

## North Star

The core loop should be:

1. **Wake into debt**
2. **Take runs to stay solvent**
3. **Choose whether to pay down debt or leverage harder**
4. **Wake more people, which deepens the debt**
5. **Expand the station to increase debt capacity**
6. **Expand into new sectors, which can either free you or turn you into management**

This gives the game a stronger long-form question than "get stronger":

> "Can you build enough power to escape the system without becoming the next layer of it?"

---

## The Three Debt Numbers

To make debt readable and gameable, split it into three values.

### 1. Outstanding Debt

The total amount the player currently owes the Company.

This is the number on the bill.

Examples:
- start of game: **$1,000,000**
- wake a named recruit: **+ $1,000,000 debt**
- sign a new sector charter: **+ $2,000,000 debt**
- buy emergency corporate insurance: **+ debt instead of resource cost**

This number is the emotional anchor.

### 2. Debt Ceiling

The maximum debt the Company will currently allow you to carry.

This is the number that determines whether you are allowed to grow.

This solves the user's proposed rule:

> you can only carry up to X debt at a time, and X increases with the assets you control

If debt is near or above the ceiling, you can still run, but you cannot safely:

- wake new crew
- claim new stations
- sign new charters
- take certain premium contracts

### 3. Payment Due

The amount due at the end of each cycle.

This prevents debt from becoming a passive late-game goal and makes it part of every run decision.

Examples:
- minimum payment every 3 runs
- minimum payment every sector week
- minimum payment after every major extraction streak

Without this, debt becomes just another long-term number. With it, debt becomes the pulse of the game.

---

## Recommended Formula

Keep the first version simple.

### Starting State

- **Outstanding Debt:** $1,000,000
- **Debt Ceiling:** $1,000,000
- **Payment Due:** $50,000 after first 3 runs

This means the player begins fully leveraged.

That is good. It immediately creates pressure.

### Core Growth Rule

Each major growth action adds debt:

- Wake named recruit: **+ $1,000,000**
- Convert derelict to station: **+ $250,000 in permits, towing, licensing, and "safety compliance"**
- Secure a new sector charter: **+ $2,000,000**
- Emergency reconstruction after catastrophe: optional debt-financed bailout

### Debt Ceiling Rule

Debt ceiling should scale with productive control, not with goodwill.

Recommended first-pass formula:

**Debt Ceiling =**
- **$1,000,000 base franchise line**
- **+ $750,000 per active station**
- **+ $250,000 per upgraded room tier across all stations**
- **+ $2,000,000 per secured sector**

This creates the right feeling:

- waking people is only possible if you build productive infrastructure
- building infrastructure increases capacity, but also tempts you into more leverage
- sectors feel like genuine scale jumps, not just map unlocks

### Payment Due Rule

Every cycle, the player owes:

**Payment Due = max($50,000, 5% of Outstanding Debt)**

This keeps the bill meaningful at all stages.

Examples:
- $1,000,000 debt -> $50,000 due
- $3,000,000 debt -> $150,000 due
- $8,000,000 debt -> $400,000 due

Now every expansion move has teeth.

---

## Why This Feels Roguelike

This debt model creates a macro-roguelike loop above the existing run loop.

### The Existing Loop

- choose a derelict
- take a risky run
- extract or collapse
- return to hub

### The New Meta Loop

- survive a cycle of bills
- decide whether to pay down, invest, or leverage
- unlock more characters by accepting more debt
- risk hitting the ceiling and triggering enforcement
- secure enough infrastructure to enter the next sector

This creates recurring tension similar to other great roguelikes:

- **"Can I survive this run?"**
- **"Can I survive this billing cycle?"**
- **"Can I expand without locking myself into a worse future?"**

That is where the game starts to feel expansive.

---

## Cycle Structure

The game should be paced in **billing cycles**.

Recommended first-pass cycle:

- **1 cycle = 3 Depth Dives + mission updates + one Company statement**

At the end of the cycle:

1. The Company issues a statement
2. Minimum payment is due
3. Interest, penalties, or audits resolve
4. New offers appear:
   - wake contract
   - station permit
   - sector charter
   - bailout
   - predatory sponsorship

This creates a clean rhythm:

- run
- run
- run
- consequences
- choice

It also gives V.A.L.U. a reason to keep talking.

---

## What Happens If The Player Ignores The Bill

Debt needs failure states that are painful, but interesting.

Do not make non-payment an instant game over. Make it create roguelike pressure.

### At 80% of Ceiling

Trigger:
- warning state
- V.A.L.U. pressure
- worse contract offers

Effects:
- fewer safe mission options
- more hostile corporate encounters
- higher audit chance

### At 100% of Ceiling

Trigger:
- player is debt-locked

Effects:
- cannot wake new crew
- cannot claim or convert new assets
- cannot enter sector-expansion contracts
- some rooms or services shut down unless paid manually

### Over Ceiling / Default

This should only happen from penalties, interest, catastrophe, or emergency borrowing.

Effects:
- repossession threats
- emergency "compliance runs"
- registrars seize claim rights
- one station may be lien-marked
- named characters argue about what to sacrifice

This is excellent narrative fuel.

Default is not "you lose." It is "the Company starts making decisions for you."

---

## How Crew Waking Becomes A Real Story Choice

The user's instinct here is exactly right:

> waking a new person should deepen the debt

That makes recruitment dramatic instead of purely aspirational.

### Current Feeling

- wake crew because more crew is good

### Proposed Feeling

- wake crew because you need them
- hesitate because waking them costs another million
- feel responsible because you have effectively signed them into the same system

That creates a much stronger question:

> Are you rescuing them from cryo, or indenturing them under your command?

This is one of the best thematic pressure points in the entire game.

### Best Practice

Treat named recruits differently from generic staff.

Recommended:
- **Named lead recruits:** + $1,000,000 debt each
- **Generic support crew:** lower debt or resource-only wake cost

Why:
- keeps named recruit decisions dramatic
- avoids absurd total debt scaling from every random support body
- preserves room for high-value story recruitment moments

If you want every wake-up to matter, a softer alternative is:

- named recruits: + $1,000,000
- generic specialists: + $250,000 to $500,000

---

## Debt As Permission To Grow

The most important shift is conceptual:

Debt is not just a punishment.
Debt is a **growth gate**.

The Company is not saying:
- "Do not owe us money."

It is saying:
- "You may owe us money only in ways that make us more money."

That means the debt ceiling should unlock based on assets because the Company is collateralizing your labor and salvage network.

This is more on-brand than a simple rising wake cost.

It makes the player feel:
- financed
- tolerated
- monitored
- expandable
- disposable

All at once.

---

## Sector Expansion

Sector expansion is where the game becomes truly expansive.

A new sector should never be "the next biome."
It should be a **new franchise frontier**.

### Suggested Rule

To unlock a new sector, the player must satisfy both:

1. **Operational requirement**
   - enough stations / crew / salvage throughput

2. **Financial requirement**
   - either pay a charter bond
   - or accept a new sector debt package

This creates a meaningful fork:

### Option A: Pay Your Way In

- slower
- safer
- more independent
- lower future penalties

### Option B: Sign The Expansion Contract

- immediate access
- bigger debt ceiling
- more crew opportunities
- heavier Company control

This is exactly the kind of macro decision that gives roguelikes replay value.

---

## Are We The Corporation?

This should not have a single fixed answer.
It should be the **central late-game question**.

The best version of Sector Scavengers is not one where the answer is simply:

- yes
or
- no

The best version is one where the player can see themselves sliding into corporate logic and must decide whether to continue.

### Thematic Truth

By the time you:

- wake multiple workers into debt
- optimize room output
- assign risk
- collateralize stations
- manage multiple sectors

you are already doing managerial labor.

That is good drama.

The game should force the player to confront:

> "I started as a worker trapped by debt. Why does my station now run on the same terms?"

### Recommended Endgame Stances

The player should be able to drift toward one of three operational identities.

#### 1. Corporate Franchise

You take the Company's expansion deals, scale fastest, and become an officially recognized sector operator.

Pros:
- highest debt ceiling
- easiest access to new sectors
- strongest infrastructure growth

Cost:
- more surveillance
- harsher labor logic
- worst moral ending unless resisted late

#### 2. Worker Cooperative

You cap expansion speed, lower debt dependence, and convert stations into a mutual survival network.

Pros:
- lower payment pressure long-term
- better crew loyalty and survival
- best human ending

Cost:
- slower scaling
- fewer premium contracts
- harder early game

#### 3. Smuggler Confederation

You build a semi-illicit network outside formal Company logic.

Pros:
- flexible
- high-risk, high-reward
- can dodge some debt rules

Cost:
- unstable supplies
- more hostile factions
- volatile events and betrayals

This gives the late game a real ideological shape.

---

## A Better Long-Term Meter Than "Good or Evil"

Do not use a morality bar.

Use an **Operating Doctrine** track that measures how the station is being run.

For example:

- **Compliance**: obey contracts, accept official charters, take sanctioned debt
- **Solidarity**: protect crew, forgive losses, publish truths, spread risk fairly
- **Predation**: exploit debt, black-market labor, squeeze every run

This doctrine can be hidden under the hood at first, then revealed through character reactions and ending branches.

That way the player does not just ask:

- "Did I win?"

They ask:

- "What did my operation become?"

---

## How Named Characters Plug Into This

The debt loop gets much stronger if every main recruit has an opinion about leverage.

### Max
- asks whether growth is survival or surrender

### Imani
- pushes back against waking people into debt without consent

### Jax
- argues infrastructure must exist before more liabilities do

### Sera
- supports expansion when it opens access to truth, even at financial risk

### Rook
- sees debt as just another weapon and wants you to use it before it uses you

### Del
- can model the exact efficiency benefits of exploitative growth, making its advice useful and unsettling

This is how mechanics become drama.

---

## Recommended First Implementation

If this is introduced in stages, the cleanest order is:

### Stage 1: Make Debt Visible

Add:
- Outstanding Debt
- Debt Ceiling
- Payment Due
- Billing cycle countdown

No deep penalties yet. Just make the bill real and ever-present.

### Stage 2: Tie Recruitment To Debt

Add:
- named recruit wake debt
- ceiling requirement to wake them
- V.A.L.U. language around "authorized labor expansion"

### Stage 3: Add Debt Service Pressure

Add:
- minimum payment every cycle
- warning state near cap
- light default penalties

### Stage 4: Gate Sector Expansion Through Finance

Add:
- charter debt package vs self-funded expansion
- station asset requirements

### Stage 5: Add Endgame Ideology

Add:
- operating doctrine tracking
- faction and crew reactions
- endings based on what kind of operator the player became

---

## Why This Is Better Than A Flat Unlock Tree

A normal unlock tree says:
- do runs -> get resources -> unlock more content

This debt model says:
- do runs -> earn breathing room -> choose what burden to accept next

That is more narrative.
That is more replayable.
That is more on-brand.

It turns progression into a series of uneasy bargains.

---

## Final Recommendation

Yes: make the **$1,000,000 bill** the core of the game.

But do it with structure:

- **Outstanding Debt** is the burden
- **Debt Ceiling** is the leash
- **Payment Due** is the heartbeat

Then make every meaningful growth decision add debt:

- waking named recruits
- converting stations
- expanding sectors
- taking emergency bailouts

And make the late game ask:

> "Did you beat the corporation, or did you simply become a more intimate version of it?"

That is the strongest thematic frame currently available to Sector Scavengers.
