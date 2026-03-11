# CARDS DESIGN: Makko-Safe Prompt Pack

## Goal

Create card visuals and card-like animations in Makko that reliably look like **UI objects**, not character art.

The core rule is:

**Do not ask Makko to invent a "card animation" as if it were a character sprite.**

Instead, ask for:

- a **single sci-fi UI prop**
- a **rectangular holographic panel**
- a **non-character interface object**

Then, if possible, animate the final behavior in-engine rather than relying on Makko to generate the entire active-state motion.

---

## Why Makko Keeps Failing

The word **card** often gets interpreted as:

- trading card
- character card
- illustrated hero card
- portrait inside a frame

The word **animation** also pushes Makko toward:

- a subject performing
- a character moving
- cinematic framing

So if the prompt is vague, the model fills the empty space with a person.

---

## Non-Negotiable Prompt Rules

Every prompt for card assets should include all of the following:

### Asset identity

- single object only
- non-character UI prop
- rectangular holographic panel
- card-like interface object

### Camera / composition

- front-facing
- orthographic
- centered
- full object visible
- vertical 2:3 proportions
- transparent background

### Visual constraints

- empty center field
- edge detailing only
- no text
- no numbers
- no icons unless explicitly requested

### Hard negatives

- no character
- no human
- no humanoid
- no face
- no portrait
- no hands
- no creature
- no astronaut
- no pilot
- no cockpit
- no trading card illustration
- no scene background
- no subject inside the card

---

## Best Production Workflow

### Preferred workflow

1. Generate **static card shell**
2. Generate **active glow overlay**
3. Generate **scanline / shimmer overlay**
4. Generate **corner FX overlay**
5. Animate final hover/pulse behavior in code

This is the most reliable approach for this project because the current cards are already rendered in code.

### Avoid

- one-shot "make me an animated premium card"
- prompts that prioritize style over object type
- prompts that leave room for an internal illustration

---

## Style Target

Use this style language consistently:

- premium indie sci-fi UI
- clean readable silhouette
- matte dark navy body
- neon cyan primary edge light
- optional magenta accent trim
- subtle panel depth
- rounded corners
- minimal technical detailing
- elegant, not noisy

This should feel like:

- high-end tactical UI
- holographic salvage tech
- diegetic spaceship interface

Not:

- fantasy trading card
- comic card
- gacha portrait card

---

## Master Prompt Template

Use this as the base for all card prompts:

```text
Create a single non-character sci-fi UI panel prop.

One object only. Front-facing orthographic view. Perfectly centered. Full object visible. Vertical 2:3 proportions. Transparent background.

The object is a rectangular holographic ability panel with rounded corners, a dark matte navy body, subtle inner depth, neon cyan edge lighting, thin magenta accent lines, and minimal technical detailing only around the outer border. The central field is empty and clean for game text and symbols. Premium indie sci-fi UI style. Clean silhouette. High readability.

No text, no numbers, no logo, no icon, no illustration inside the panel.

Do not include any character, person, human, humanoid, face, portrait, hands, creature, astronaut, pilot, cockpit, environment, scene background, trading card artwork, or subject art inside the panel.
```

---

## Prompt 1: Base Card Shell

Use this first.

```text
Create a single non-character sci-fi UI card frame as a prop asset.

One object only. Front-facing orthographic view. Perfectly centered. Full card visible. Vertical 2:3 proportions. Transparent background.

The object is a premium salvage-operations interface panel: rectangular, rounded corners, dark matte navy surface, subtle beveled depth, thin neon cyan outer border, faint magenta corner accents, and restrained technical detailing along the edge only. The middle of the card is intentionally empty and quiet for gameplay text. Clean premium indie UI. Elegant, minimal, readable.

No text, no numbers, no symbols, no art inside the center field.

Do not include any person, character, human, humanoid, face, portrait, creature, astronaut, pilot, hands, cockpit, scene, background, trading card illustration, or internal subject image.
```

---

## Prompt 2: Active Card Glow Overlay

Use this to create an overlay, not a full new card concept.

```text
Create a transparent overlay for an active sci-fi UI card.

One object only. Front-facing orthographic view. Perfectly centered. Full vertical 2:3 card shape visible. Transparent background.

This is not a full card illustration. This is a visual effects overlay for a rectangular holographic interface panel. Show a clean neon cyan energy pulse hugging the border, subtle corner flares, and a faint inner glow concentrated near the edges. Keep the center mostly empty and readable. Premium tactical UI effect. Clean and controlled.

No character, no portrait, no person, no humanoid, no creature, no scene, no background, no internal illustration, no card art subject.
```

---

## Prompt 3: Scanline / Shimmer Overlay

```text
Create a transparent visual effects overlay for a premium sci-fi UI card.

Front-facing orthographic composition. Centered. Full vertical 2:3 card area visible. Transparent background.

This asset is a subtle animated-looking scanline and shimmer layer for a rectangular holographic panel. Include faint horizontal scanlines, light interference bands, and a soft moving-tech sheen. Keep the effect restrained, elegant, and readable. The center should remain mostly clear. This is UI polish, not an illustration.

No character, no human, no portrait, no face, no object inside the panel, no environment, no trading-card artwork.
```

---

## Prompt 4: Corner FX Overlay

```text
Create a transparent corner-effects overlay for a premium sci-fi UI card.

Single centered object, front-facing orthographic view, full vertical 2:3 card area visible, transparent background.

Show small controlled tech flares only at the corners and border joints of a rectangular holographic panel. Include micro-sparks, tiny emissive nodes, and elegant cyan-magenta circuitry accents. Keep the center empty. Clean premium UI polish.

No character, no portrait, no person, no humanoid, no creature, no subject inside the panel, no scene background.
```

---

## Prompt 5: Active Animation Prompt

Only use this after generating the base shell and only if you must ask Makko for motion.

```text
Animate this exact sci-fi UI card prop only.

Preserve the silhouette, framing, proportions, and front-facing orthographic view exactly. Keep the card centered and fully visible for the entire animation. Transparent background.

Allowed motion only:
- gentle neon border pulse
- subtle emissive light sweep from top to bottom
- faint scanline shimmer
- tiny hover bob
- occasional micro-spark at the corners

The object remains a single rectangular interface panel for the entire animation. The center stays empty and readable. Premium indie tactical UI style.

Do not introduce any person, character, human, humanoid, face, portrait, creature, astronaut, pilot, hands, cockpit, scene, trading-card art, internal subject image, or camera move.
```

---

## Prompt 6: Scavenge Variant

```text
Create a single non-character sci-fi UI card frame variant for SCAVENGE.

One object only. Front-facing orthographic view. Centered. Full vertical 2:3 card visible. Transparent background.

Use the same premium salvage interface panel language: dark matte navy body, rounded corners, clean rectangular silhouette, minimal edge detailing, and an empty center field. This SCAVENGE variant should emphasize risky opportunity using warning-yellow energy accents with small cyan support lights. The object should feel volatile, salvage-focused, and high-stakes without becoming noisy.

No text, no icon, no illustration inside the panel.

Do not include any character, face, portrait, creature, astronaut, pilot, cockpit, environment, or trading-card art.
```

---

## Prompt 7: Repair Variant

```text
Create a single non-character sci-fi UI card frame variant for REPAIR.

One object only. Front-facing orthographic view. Centered. Full vertical 2:3 card visible. Transparent background.

Use the same premium salvage interface panel language: dark matte navy body, rounded corners, clean silhouette, empty center field, minimal edge detailing. This REPAIR variant should emphasize stabilization and restoration using clean green energy accents with subtle cyan support lights. The object should feel reliable, technical, and controlled.

No text, no icon, no illustration inside the panel.

Do not include any character, face, portrait, creature, astronaut, pilot, cockpit, environment, or trading-card art.
```

---

## Prompt 8: Extract Variant

```text
Create a single non-character sci-fi UI card frame variant for EXTRACT.

One object only. Front-facing orthographic view. Centered. Full vertical 2:3 card visible. Transparent background.

Use the same premium salvage interface panel language: dark matte navy body, rounded corners, clean silhouette, empty center field, minimal edge detailing. This EXTRACT variant should emphasize clean disengagement and secure retrieval using neon cyan energy accents, subtle pathing lines, and restrained high-tech clarity. The object should feel safe, precise, and final.

No text, no icon, no illustration inside the panel.

Do not include any character, face, portrait, creature, astronaut, pilot, cockpit, environment, or trading-card art.
```

---

## Prompt 9: Rare / Premium Card Shell

```text
Create a single non-character premium sci-fi UI card frame for a rare gameplay card.

One object only. Front-facing orthographic view. Centered. Full vertical 2:3 card visible. Transparent background.

This is a rarer, more prestigious version of the same tactical interface panel language: dark matte navy body, elegant layered border geometry, neon cyan primary lighting, magenta accent filaments, subtle gold-white micro highlights, and an empty central field. It should feel valuable and sophisticated, but still clean and readable. Premium indie sci-fi UI.

No text, no numbers, no icon, no illustration inside the center field.

Do not include any character, portrait, human, humanoid, creature, astronaut, pilot, cockpit, environment, or trading-card artwork.
```

---

## If Makko Still Gives You Characters

Use this stronger wording:

```text
This asset is a UI prop, not character art.
Do not depict a subject of any kind.
The card must be empty in the middle.
There must be no person or portrait anywhere in or on the object.
```

Also replace the word **card** with:

- interface panel
- holo-panel
- tactical UI plate
- rectangular UI prop

If needed, remove the word **animation** from the first generation pass entirely.

---

## Best Practice For This Repo

For this project specifically, the safest approach is:

### Generate in Makko

- base shell
- active glow overlay
- scanline overlay
- corner FX overlay

### Animate in code

Use the existing card render path in `src/scenes/depth-dive-scene.ts` to add:

- border pulse
- alpha pulse
- hover scale
- vertical light sweep
- occasional corner spark

This will be more consistent than trying to make Makko generate the complete active-state behavior as a single animated asset.

---

## Final Rule

If the prompt can be interpreted as "put a subject inside a frame," Makko will often do exactly that.

If the prompt clearly says "single rectangular UI prop, front-facing, empty center, no subject," you will get much closer to what you want.
