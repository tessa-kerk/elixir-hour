/* System data locked by the mockup + the Mixing UI Panel Spec.
   Dialogue never lives here — it belongs to data/nights.js beats.
   (demoLine below is the mockup's layout-proofing sample line ONLY;
   real dialogue arrives with the Night scripts in Milestone 4.) */

/* The six spells (mixers) and their meter contributions. */
window.SPELLS = {
  "Rage":   { c: "#7A3FA0", warmth: 0, kick: 3, chill: 0, bite: 0 },
  "Heal":   { c: "#4e9a51", warmth: 3, kick: 0, chill: 0, bite: 0 },
  "Zap":    { c: "#e8c34d", warmth: 0, kick: 2, chill: 0, bite: 0 },
  "Freeze": { c: "#6fa7d8", warmth: 0, kick: 0, chill: 3, bite: 0 },
  "Mirror": { c: "#5fb8a8", warmth: 0, kick: 0, chill: 1, bite: 0 },
  "Poison": { c: "#6d7a3f", warmth: 0, kick: 0, chill: 0, bite: 3 },
};

/* The six named brews. `dose` present = that exact dose required for the ✓. */
window.RECIPES = [
  { name: "The Usual",        base: "Elixir",      mix: ["Heal"],         dose: 1 },
  { name: "The Strong Stuff", base: "Dark Elixir", mix: ["Rage"] },
  { name: "The Showstopper",  base: "Elixir",      mix: ["Rage", "Zap"] },
  { name: "The Bittersweet",  base: "Elixir",      mix: ["Poison"] },
  { name: "The Long Look",    base: "Elixir",      mix: ["Mirror"] },
  { name: "The Easy One",     base: "Elixir",      mix: ["Heal"],         dose: 2 },
];

/* The starter five — no-bar chest-up cutouts for the two-layer composite
   (GDD §12), keyed from Art/Incoming - No-Bar Renders (2026-07-04).
   Each expression: file + the figure's measured vertical extents as fractions
   of the image (top = bbox top, base = BOTTOM OF THE TORSO). The serve screen
   anchors `base` to the stage counter line — never the hands or lowest pixel.
   NOTE: no Knight Arrival exists in the no-bar render set yet — flagged in
   PLAN.md; his Arrival beat reuses "Weary & Wistful" until the render lands. */
window.CAST = {
  "Knight": {
    dir: "assets/characters/Knight",
    colour: "#5f7ea8",
    demoLine: "Don't fuss the usual tonight. Give me an Elixir, and a splash of Mirror in it.",
    exprs: {
      "Warm & Content":  { file: "Knight - Warm & Content Served (no-bar cutout).png",  top: 0.054, base: 0.768 },
      "Weary & Wistful": { file: "Knight - Weary & Wistful Served (no-bar cutout).png", top: 0.053, base: 0.768 },
      "Hearty Laugh":    { file: "Knight - Hearty Laugh Served (no-bar cutout).png",    top: 0.054, base: 0.767 },
    },
  },
  "Wizard": {
    dir: "assets/characters/Wizard",
    colour: "#7A3FA0",
    demoLine: "Elixir, a shot of Rage — no, better make that two — and then a Zap to finish.",
    exprs: {
      "Boastful Grin": { file: "Wizard - Boastful Grin Served (no-bar cutout).png",      top: 0.056, base: 0.768 },
      "Deflated":      { file: "Wizard - Deflated & Insecure Served (no-bar cutout).png", top: 0.045, base: 0.768 },
      "Warm Smile":    { file: "Wizard - Warm Genuine Smile Served (no-bar cutout).png",  top: 0.075, base: 0.768 },
      "Arrival":       { file: "Wizard - Arrival (no-bar cutout).png",                    top: 0.079, base: 0.753 },
    },
  },
  "Princess": {
    dir: "assets/characters/Princess",
    colour: "#c4514a",
    demoLine: "Give me an Elixir with a drop of Poison in it. I prefer a drink that bites back a little.",
    exprs: {
      "Cool & Poised":     { file: "Princess - Cool & Poised (no-bar cutout).png",     top: 0.028, base: 0.768 },
      "Sharp & Teasing":   { file: "Princess - Sharp & Teasing (no-bar cutout).png",   top: 0.033, base: 0.768 },
      /* Guard Down's opaque bbox reaches 93.3% (she holds the tankard low) — base
         set to the cast line, verify against the composite and adjust if she floats */
      "Guard-Down Warmth": { file: "Princess - Guard Down Served (no-bar cutout).png", top: 0.034, base: 0.77 },
      "Arrival":           { file: "Princess - Arrival (no-bar cutout).png",           top: 0.032, base: 0.726 },
    },
  },
  "P.E.K.K.A": {
    dir: "assets/characters/P.E.K.K.A",
    colour: "#b05ec9",
    demoLine: "Something warm. And gentle — no spark in it, please.",
    /* "Shy" and "Arrival" renders carry a real baked counter (not green) and
       could not be keyed — set aside in Art/.../Cutouts (No-Bar)/_review;
       flagged in PLAN.md for re-render with the green counter. */
    exprs: {
      "Calm":    { file: "P.E.K.K.A - Calm Served (no-bar cutout).png",  top: 0.049, base: 0.768 },
      "Happy":   { file: "P.E.K.K.A - Happy Served (no-bar cutout).png", top: 0.052, base: 0.768 },
    },
  },
  "Hog Rider": {
    dir: "assets/characters/Hog Rider",
    colour: "#c07a2e",
    demoLine: "Number one, I drink the strong stuff — that's Dark Elixir, and don't you be shy with it.",
    exprs: {
      "Warm Grin":       { file: "Hog Rider - Warm Grin Served (no-bar cutout).png",       top: 0.045, base: 0.817 },
      "Big Laugh":       { file: "Hog Rider - Laugh Served (no-bar cutout).png",           top: 0.035, base: 0.768 },
      "Quiet & Wistful": { file: "Hog Rider - Quiet & Wistful Served (no-bar cutout).png", top: 0.036, base: 0.768 },
      "Arrival":         { file: "Hog Rider - Arrival (no-bar cutout).png",                top: 0.036, base: 0.766 },
    },
  },
};
