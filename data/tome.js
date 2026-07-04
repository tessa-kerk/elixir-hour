/* The Tome's four tabs (GDD §14.5) — data shells that fill in as you play.
   The full tab UI lands in Milestone 5; these shapes are locked now so the
   state machine and save system can grow into them. */

/* Brew Book — records recipes as they're taught ("taught by" + Sage's note). */
window.BREWBOOK = [];

/* Regulars' Ledger — one page per regular; unlocks on meeting (got:true).
   `printed` is the printed bio; `notes` are Sage's margin notes that fill in
   over the Nights (GDD §10 two-layer bios — content lands in Milestone 5). */
window.LEDGER = [
  { who: "Knight",    card: "assets/ui/cards/Knight Card (cutout).png",    got: false, printed: "", notes: [] },
  { who: "Wizard",    card: "assets/ui/cards/Wizard Card (cutout).png",    got: false, printed: "", notes: [] },
  { who: "Princess",  card: "assets/ui/cards/Princess Card (cutout).png",  got: false, printed: "", notes: [] },
  { who: "P.E.K.K.A", card: "assets/ui/cards/P.E.K.K.A Card (cutout).png", got: false, printed: "", notes: [] },
  { who: "Hog Rider", card: "assets/ui/cards/Hog Rider Card (cutout).png", got: false, printed: "", notes: [] },
];

/* Arena Herald — one edition per Night. Night 1's copy is locked (mockup);
   Nights 2–3 land with their scripts in Milestone 6. `ripple` marks the
   edition that traces back to a quiet brew. */
window.HERALD_EDITIONS = [
  { night: 1, ed: "Ed. XLVII", head: "Crown Championship in Three Days",
    story: "Blue and Red to settle it under the King's own eye. The greatest bout of the year draws near, and every fighter in the realm feels it — some with hunger, some with dread, and a rare few with nothing but thirst.",
    ripple: false },
  { night: 2, ed: "", head: "", story: "", ripple: false },
  { night: 3, ed: "", head: "", story: "", ripple: false },
];

/* Bard's Songbook — the four locked tracks (Build Setup doc). Audio files are
   sourced separately (GDD §16); the system is wired now and plays nothing
   until real files exist in assets/audio/. */
window.SONGBOOK = [
  { name: "Sage's Favourite",      got: true,  by: "The default bar loop — the one Sage keeps on.", file: "" },
  { name: "Rain on the Strip",     got: false, by: "Softer, late-night.",                            file: "" },
  { name: "The Little One's Tune", got: false, by: "P.E.K.K.A's phonograph track.",                  file: "" },
  { name: "Last Call",             got: false, by: "The Night-3 finale mood.",                       file: "" },
];
