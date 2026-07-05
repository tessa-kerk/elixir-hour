/* System data locked by the mockup + the Mixing UI Panel Spec.
   Dialogue never lives here — it belongs to data/nights.js beats.
   (demoLine below is the mockup's layout-proofing sample line ONLY;
   real dialogue arrives from the Night scripts.) */

/* The six spells (mixers) and their meter contributions. */
window.SPELLS = {
  "Rage":   { c: "#7A3FA0", warmth: 0, kick: 3, chill: 0, bite: 0 },
  "Heal":   { c: "#4e9a51", warmth: 3, kick: 0, chill: 0, bite: 0 },
  "Zap":    { c: "#e8c34d", warmth: 0, kick: 2, chill: 0, bite: 0 },
  "Freeze": { c: "#6fa7d8", warmth: 0, kick: 0, chill: 3, bite: 0 },
  "Mirror": { c: "#5fb8a8", warmth: 0, kick: 0, chill: 1, bite: 0 },
  "Poison": { c: "#6d7a3f", warmth: 0, kick: 0, chill: 0, bite: 3 },
};

/* The named brews. `dose` present = that exact dose required for the ✓.
   The three Elixir + Heal drinks are dose-distinct: 1 drop = The Usual
   (Knight), 2 = The Easy One (Hog Rider, tournament eve), 3 = The Gentle
   One (P.E.K.K.A — the big, slow, warm pour). "The Gentle One" comes from
   GDD §10 + the Hour 2 script (the §7 table lists six — the scripts win;
   dose 3 is a build call, flagged in PLAN.md for Tessa). */
window.RECIPES = [
  { name: "The Usual",        base: "Elixir",      mix: ["Heal"],         dose: 1 },
  { name: "The Strong Stuff", base: "Dark Elixir", mix: ["Rage"] },
  { name: "The Showstopper",  base: "Elixir",      mix: ["Rage", "Zap"],  dose: 2 },
  { name: "The Bittersweet",  base: "Elixir",      mix: ["Poison"] },
  { name: "The Long Look",    base: "Elixir",      mix: ["Mirror"] },
  { name: "The Easy One",     base: "Elixir",      mix: ["Heal"],         dose: 2 },
  { name: "The Gentle One",   base: "Elixir",      mix: ["Heal"],         dose: 3 },
];

/* The starter five — Tessa's regenerated no-bg cutouts (2026-07-05), used
   AS-IS (already background-removed; never re-key them). Per expression:
   file + the calibrated anchor metadata:
     top  — figure top as a fraction of image height (measured, alpha>128)
     base — the COUNTER-ANCHOR fraction: where the figure meets the bar line
            (calibrated on the cast contact sheet — the torso/hand line, NOT
            the lowest pixel; content below it overlays the baked counter)
     tall — on-screen size multiplier. One value per character so heads stay
            constant across expressions (head/span ratios are constant within
            each character). Knight's Arrival is deliberately taller: he is
            STANDING — head matched to his seated self, not squashed to fit.
   Princess reads petite and P.E.K.K.A huge on purpose (canon staging). */
window.CAST = {
  "Knight": {
    dir: "assets/characters/Knight",
    colour: "#5f7ea8",
    demoLine: "Don't fuss the usual tonight. Give me an Elixir, and a splash of Mirror in it.",
    exprs: {
      "Warm & Content":  { file: "Knight - Warm & Content Served (no bg).png",  top: 0.114, base: 0.816 },
      "Weary & Wistful": { file: "Knight - Weary & Wistful (no bg).png",        top: 0.114, base: 0.816 },
      "Hearty Laugh":    { file: "Knight - Hearty Laugh Served (no bg).png",    top: 0.114, base: 0.816 },
      "Arrival":         { file: "Knight - Arrival (no bg).png",                top: 0.123, base: 0.870, tall: 1.17 },
    },
  },
  "Wizard": {
    dir: "assets/characters/Wizard",
    colour: "#7A3FA0",
    demoLine: "Elixir, a shot of Rage — no, better make that two — and then a Zap to finish.",
    exprs: {
      "Boastful Grin": { file: "Wizard - Boastful Grin Served (no bg).png",       top: 0.132, base: 0.763 },
      "Deflated":      { file: "Wizard - Deflated & Insecure Served (no bg).png", top: 0.131, base: 0.732 },
      "Warm Smile":    { file: "Wizard - Warm Genuine Smile Served (no bg).png",  top: 0.132, base: 0.763 },
      "Arrival":       { file: "Wizard - Arrival (no bg).png",                    top: 0.132, base: 0.763 },
    },
  },
  "Princess": {
    dir: "assets/characters/Princess",
    colour: "#c4514a",
    demoLine: "Give me an Elixir with a drop of Poison in it. I prefer a drink that bites back a little.",
    exprs: {
      "Cool & Poised":     { file: "Princess - Cool & Poised Served (no bg).png",     top: 0.030, base: 0.840, tall: 1.06 },
      "Sharp & Teasing":   { file: "Princess - Sharp & Teasing Served (no bg).png",   top: 0.069, base: 0.820, tall: 1.06 },
      "Guard-Down Warmth": { file: "Princess - Guard Down Warmth Served (no bg).png", top: 0.050, base: 0.720, tall: 1.06 },
      "Arrival":           { file: "Princess Arrival (no bg).png",                    top: 0.050, base: 0.720, tall: 1.06 },
    },
  },
  "P.E.K.K.A": {
    dir: "assets/characters/P.E.K.K.A",
    colour: "#b05ec9",
    demoLine: "Something warm. And gentle — no spark in it, please.",
    exprs: {
      "Calm":    { file: "P.E.K.K.A - Calm Served (no bg).png",  top: 0.082, base: 0.840, tall: 1.12 },
      "Happy":   { file: "P.E.K.K.A - Happy Served (no bg).png", top: 0.083, base: 0.840, tall: 1.12 },
      "Shy":     { file: "P.E.K.K.A - Shy Served (no bg).png",   top: 0.066, base: 0.840, tall: 1.12 },
      "Arrival": { file: "P.E.K.K.A - Arrival (no bg).png",      top: 0.083, base: 0.800, tall: 1.12 },
    },
  },
  "Hog Rider": {
    dir: "assets/characters/Hog Rider",
    colour: "#c07a2e",
    demoLine: "Number one, I drink the strong stuff — that's Dark Elixir, and don't you be shy with it.",
    exprs: {
      "Warm Grin":       { file: "Hog Rider - Warm Grin Served (no bg).png",       top: 0.110, base: 0.759 },
      "Big Laugh":       { file: "Hog Rider - Big Laugh Served (no bg).png",       top: 0.110, base: 0.758 },
      "Quiet & Wistful": { file: "Hog Rider - Quiet & Wistful Served (no bg).png", top: 0.110, base: 0.758 },
      "Arrival":         { file: "Hog Rider - Arrival (no bg).png",                top: 0.110, base: 0.726 },
    },
  },
};
