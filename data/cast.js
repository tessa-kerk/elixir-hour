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
  /* Edition 2 (GDD v1.6) */
  { name: "Water",         base: "Water",       mix: [] },              /* plain, any dose — mixers make it not-water */
  { name: "The Long Road", base: "Dark Elixir", mix: ["Heal"], dose: 2 },
];

/* The five regulars.

   RENDERING MODEL (round 9, 08-07 — supersedes ALL prior sprite/anchor/scale
   calibration). Tessa hand-grounded the whole cast onto the scene; §12's new
   canon closes the compositing problem at the asset level. There are no more
   size/base/shadow/anchor tables — the engine no longer composites solo beats.

     • Solo serve beats  → a pre-baked FULL scene per expression
       `assets/scenes/serve/<base> (serve scene).webp` (character + counter +
       brew wall in one image). All share a pixel-identical background, so an
       expression change is a whole-image cross-fade (Screens.setServeCustomer).
     • Multi-character (duo / any 3+) → the matching grounded cutout
       `assets/cutouts/<base> (no bg).webp` (character + local counter/shadow,
       room transparent), composed by the two-shot recipe (Screens.renderDuo).
     • The Night-3 finale is its own ready-made image (Group Scene V2).

   Each expression maps to its shared `<base>` filename (both the serve scene and
   the cutout are named from it). `head` = the character's head-top as a fraction
   of scene height (measured from the cutouts; near-constant across a character's
   faces) — the speech bubble anchors just above it so it never covers the face. */
window.CAST = {
  "Knight": {
    colour: "#5f7ea8",
    they: "He",                 /* pronoun for the generic wrong-pour beat (GDD §7) */
    head: 0.235,
    demoLine: "Don't fuss the usual tonight. Give me an Elixir, and a splash of Mirror in it.",
    exprs: {
      "Warm & Content":  "Knight - Warm & Content Served",
      "Weary & Wistful": "Knight - Weary & Wistful",
      "Hearty Laugh":    "Knight - Hearty Laugh Served",
      "Arrival":         "Knight - Arrival",
    },
  },
  "Wizard": {
    colour: "#7A3FA0",
    they: "He",
    head: 0.263,
    demoLine: "Elixir, a shot of Rage — no, better make that two — and then a Zap to finish.",
    exprs: {
      "Boastful Grin": "Wizard - Boastful Grin Served",
      "Deflated":      "Wizard - Deflated & Insecure Served",
      "Warm Smile":    "Wizard - Warm Genuine Smile Served",
      "Arrival":       "Wizard - Arrival",
    },
  },
  "Princess": {
    colour: "#c4514a",
    they: "She",
    head: 0.234,
    demoLine: "Give me an Elixir with a drop of Poison in it. I prefer a drink that bites back a little.",
    exprs: {
      "Cool & Poised":     "Princess - Cool & Poised Served",
      "Sharp & Teasing":   "Princess - Sharp & Teasing Served",
      "Guard-Down Warmth": "Princess - Guard Down Warmth Served",
      "Arrival":           "Princess - Arrival",
    },
  },
  "P.E.K.K.A": {
    colour: "#b05ec9",
    they: "She",
    head: 0.283,   /* horn tips — the bubble clears the whole silhouette */
    demoLine: "Something warm. And gentle — no spark in it, please.",
    exprs: {
      "Calm":    "P.E.K.K.A - Calm Served",
      "Happy":   "P.E.K.K.A - Happy Served",
      "Shy":     "P.E.K.K.A - Shy Served",
      "Arrival": "P.E.K.K.A - Arrival",
    },
  },
  "Hog Rider": {
    colour: "#c07a2e",
    they: "He",
    head: 0.273,
    demoLine: "Number one, I drink the strong stuff — that's Dark Elixir, and don't you be shy with it.",
    exprs: {
      "Warm Grin":       "Hog Rider - Warm Grin Served",
      "Big Laugh":       "Hog Rider - Big Laugh Served",
      "Quiet & Wistful": "Hog Rider - Quiet & Wistful Served",
      "Arrival":         "Hog Rider - Arrival",
    },
  },
  /* Edition 2 guest (GDD v1.5/§16(b)): Ronin — Season 85 "Honor & Exile". His
     scenes exist ONLY in the away set (Night 4); head fraction from the away
     bake measurements (hat top .222, cast band cx .211 — game/PLAN.md table). */
  "Ronin": {
    colour: "#6f6bbf",
    they: "He",
    head: 0.222,
    demoLine: "Water, if you please.",
    exprs: {
      "Arrival":   "Ronin - Arrival",
      "Guarded":   "Ronin - Guarded Served",
      "Listening": "Ronin - Listening Served",
      "At Ease":   "Ronin - At Ease Served",
    },
  },
};

/* Asset-path helpers (round 9): one base filename → its serve scene or its cutout.
   Edition 2 (round 22): a night may declare `sceneSet:"away"` (data/nights.js) —
   state.js mirrors it into window.SCENE_SET each beat, and the SAME base names
   resolve into the away folder. Nights 1–3 pass through the original path
   untouched, including "Empty Bar (no characters)" (the away folder carries a
   plate under the same base name). */
window.serveScenePath = function (base) {
  var v = "?v=" + (window.BUILD ? window.BUILD.n : 0);
  if (window.SCENE_SET === "away") return "assets/scenes/away/" + base + " (away scene).webp" + v;
  return "assets/scenes/serve/" + base + " (serve scene).webp" + v;
};
window.cutoutPath = function (base) {
  return "assets/cutouts/" + base + " (no bg).webp?v=" + (window.BUILD ? window.BUILD.n : 0);
};
