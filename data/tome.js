/* The Tome's four tabs (GDD §11/§14.5) — the full content catalogue. What the
   PLAYER sees is gated by the save's unlocks (src/tome.js): recipes appear
   when brewed, Ledger pages when characters are met (stage 1 now; stages 2–3
   raise with Nights 2–3), Herald editions as they unlock.
   Bios and margin notes are VERBATIM from GDD §10; **bold** / *italic* marks
   are the phrases Sage has highlighted; each note pairs with its mark.
   Brew Book taught/note copy is from the locked mockup. */

window.BREWBOOK = [
  { name: "The Usual", mix: ["Elixir", "Heal"], dots: ["#B26AE0", "#4e9a51"],
    taught: "Taught by the Knight, Night 1",
    note: "Warm, no fuss. The drink of a man who has earned a quiet evening." },
  { name: "The Strong Stuff", mix: ["Dark Elixir", "Rage"], dots: ["#3d2350", "#7A3FA0"],
    taught: "Hog Rider's order — 'don't be shy with it'",
    note: "Kicks like a cannon. Serve with a steady hand and clean glassware." },
  { name: "The Showstopper", mix: ["Elixir", "Rage", "Zap"], dots: ["#B26AE0", "#7A3FA0", "#e8c34d"],
    taught: "The Wizard's, obviously",
    note: "Theatrical. Sparks slightly. He watches you make it every time." },
  { name: "The Long Look", mix: ["Elixir", "Mirror"], dots: ["#B26AE0", "#5fb8a8"],
    taught: "Brewed for the Knight's wistful nights",
    note: "For looking backwards a while. Best served without questions." },
  { name: "The Bittersweet", mix: ["Elixir", "Poison"], dots: ["#B26AE0", "#6d7a3f"],
    taught: "Princess's preference",
    note: "A drink that bites back a little. She insists that's the point." },
  { name: "The Easy One", mix: ["Elixir", "Heal ×2"], dots: ["#B26AE0", "#4e9a51"],
    taught: "For P.E.K.K.A — warm and gentle",
    note: "No spark in it. Served slower on purpose." },
];

/* Regulars' Ledger — one growing page per character (GDD §10, verbatim).
   stages[n] = { bio, notes:[{mark, note}] }; stage 3 carries Sage's pinned
   note instead of margin pairs. Which stage shows = src/tome.js gating. */
/* px = the PNG's natural size; box = the card content's bounds as fractions
   (measured alpha>128) — the renderer clips to this box so selection
   highlights hug the card, sizes to a UNIFORM content height, and stays
   correct even if an export carries uneven transparent padding. */
window.LEDGER = [
  {
    who: "Knight", card: "assets/ui/cards/Knight Card (cutout).png", px: [1525, 2048], box: { l: 0.087, t: 0.083, r: 0.915, b: 0.928 },
    stages: [
      { bio: "The everyman of the arena — **no special trick**, no legend to his name, just a steady sword. They send him in first, always have. Orders **the usual** every night and calls it that as if you'd already know it. The warm, steady one; the last to leave.",
        notes: [
          { mark: "no special trick", note: "he likes a compliment" },
          { mark: "the usual", note: "Elixir + Heal — 1 drop, not 2" },
        ] },
      { bio: "Under the easy warmth is a **tiredness he doesn't name** — a lot of years, a lot of dawns, a lot of questioning about what he's still fighting for. Turns out he isn't old-world at all: he's a **Royal**, made for this arena, among the very first they ever sent to the front.",
        notes: [
          { mark: "tiredness he doesn't name", note: "don't push — just pour" },
          { mark: "Royal", note: "wait — he's ROYAL?!" },
        ] },
      { bio: "Younger than he acts, worn out early by always going in first. The moustache story — knighted on it alone, so he'll tell you — he tells loudly, so no one asks how an everyman with no title became the man they trust to go in first.",
        pinned: "He told me the truth tonight: he stays because someone has to be the steady one, and he'd rather it were him than no one." },
    ],
  },
  {
    who: "Wizard", card: "assets/ui/cards/Wizard Card (cutout).png", px: [1551, 2155], box: { l: 0.023, t: 0.030, r: 0.976, b: 0.969 },
    stages: [
      { bio: "By his own account, the most awesome man ever to set foot in the Arena — handsomeness and fireballs, in roughly that order. Performs for **any room that'll watch**. He's the *plain* wizard, though, overshadowed by the flashier ones — an Electro Wizard, an Ice Wizard, a Magic Archer.",
        notes: [
          { mark: "any room that'll watch", note: "clap — it works" },
          { mark: "plain", note: "never say it to his face" },
        ] },
      { bio: "The bravado's a shield, not a thick one — ignore him a moment too long and **the whole act sags**. What he really wants is the one thing showing off can't buy: to be taken seriously.",
        notes: [ { mark: "the whole act sags", note: "don't leave him hanging" } ] },
      { bio: "He's the **original** — the first to ever throw fire, before the Electro, the Ice, the Magic Archer, back when \"wizard\" needed no qualifier. The arena forgot. In a world where a painted likeness is the only proof you ever mattered, no one ever made one of him.",
        pinned: "This page is the first likeness anyone's ever made of him. He asked twice if I'd keep it safe. I will." },
    ],
  },
  {
    who: "Princess", card: "assets/ui/cards/Princess Card (cutout).png", px: [774, 1076], box: { l: 0.023, t: 0.030, r: 0.977, b: 0.969 },
    stages: [
      { bio: "She sees everything before anyone else — a whole life spent watching from further back than the rest. Dry and precise, she lands **the cutting remark** so softly you barely feel it. She knows how the Championship will fall before it's even drawn, and every secret in this room, and she trades the gossip while giving away **nothing of her own**.",
        notes: [
          { mark: "the cutting remark", note: "she teases = she likes you" },
          { mark: "nothing of her own", note: "don't pry — she'll close" },
        ] },
      { bio: "Stand too close and she'll warn you that you're probably on fire. She's a legend, and that's a **lonely** thing to be — the top of a very tall, very empty tower. There's an arena named for P.E.K.K.A and a mountain for the Hog, and nothing, anywhere, named for her.",
        notes: [ { mark: "lonely", note: "the Poison's a front — try a Heal" } ] },
      { bio: "From that range she's watched every regular's unguarded moments and repeated none of them; the gossip she trades is the cheap stuff, and the real things she keeps. This bar is the one place she comes down.",
        pinned: "She told me one true thing about herself tonight — first time, she said. That part I'm not writing down." },
    ],
  },
  {
    who: "P.E.K.K.A", card: "assets/ui/cards/P.E.K.K.A Card (cutout).png", px: [1689, 2346], box: { l: 0.022, t: 0.030, r: 0.976, b: 0.970 },
    stages: [
      { bio: "The armoured mountain they send out at dawn against whatever everyone's most afraid of. Takes up the most space in any room and, somehow, **the least**. Behind the visor, **no fearsome face** — a slow, soft voice and long pauses.",
        notes: [
          { mark: "the least", note: "give her the corner" },
          { mark: "no fearsome face", note: "never flinch when she comes in" },
        ] },
      { bio: "Loves small, gentle things; goes still at the window when a butterfly lands. Whatever you brew, keep it warm and **never harsh** — a Zap makes her flinch.",
        notes: [ { mark: "never harsh", note: "Heal, warm — NO Zap, ever" } ] },
      { bio: "The arena built her a statue that pumps out magma — a monument to the weapon. The truth's smaller: there's a phonograph in her armour, the one part of her that was never frightening. She's spent her whole life being feared and hates it — all she wants is for someone to see the person, not the plating.",
        pinned: "The tune she plays is one her little one used to hum — she let me hear it all the way through tonight. Keep it in the Songbook." },
    ],
  },
  {
    who: "Hog Rider", card: "assets/ui/cards/Hog Rider Card (cutout).png", px: [1698, 2359], box: { l: 0.022, t: 0.030, r: 0.976, b: 0.969 },
    stages: [
      { bio: "You'll hear him before you see him — the call goes up, the door bangs, and he's decided you're **old friends**. Loud, fast, all exclamation; works a room of three like a packed stadium. Best mate's his Hog, who is sentient — and who is currently **not speaking to him**.",
        notes: [
          { mark: "old friends", note: "match his energy — loud is good" },
          { mark: "not speaking to him", note: "don't ask about the Hog — yet" },
        ] },
      { bio: "Goes over walls, over rivers, over anything. But here's what you notice: he never leaves early. He's always the **last one at the bar**.",
        notes: [ { mark: "last one at the bar", note: "he stays so he doesn't have to go home" } ] },
      { bio: "He's older than the arena itself — one of only **nineteen** who crossed over from the old world. The \"we're not speaking\" bit is a cover, so he's got a reason to come in alone. The noise is a shield; under it he's the loneliest of the lot.",
        pinned: "With the noise off: the Hog's getting old, the river's getting wider, and one of these nights the jump won't land. He asked me not to make a thing of it." },
    ],
  },
];

/* Arena Herald — one edition per Night; unlocks as the Nights close.
   `ripple` marks the edition traced back to a quiet brew (Night 3 epilogue). */
window.HERALD_EDITIONS = [
  { night: 1, ed: "Ed. XLVII", head: "Crown Championship in Three Days",
    story: "Blue and Red to settle it under the King's own eye. The greatest bout of the year draws near, and every fighter in the realm feels it — some with hunger, some with dread, and a rare few with nothing but thirst.",
    ripple: false },
  { night: 2, ed: "", head: "", story: "", ripple: false },
  { night: 3, ed: "", head: "", story: "", ripple: false },
];

/* Bard's Songbook — the four tracks (Build Setup doc), progression-gated per
   GDD §11: locked rows reveal NOTHING (no title, no description — "Last Call"
   must not spoil Night 3 on a fresh save). `when` is resolved against the
   save by src/tome.js:
     always     — available from the start
     heraldOf:n — unlocks when Night n's Herald edition unlocks (= end of Night n)
     met:who    — unlocks on meeting that regular
     night:n    — unlocks once the save reaches Night n
   Explicit story unlocks (unlocks.songs) always count too. Audio files are
   sourced separately (GDD §16); the picker works now, sound lands in M7. */
window.SONGBOOK = [
  { name: "Sage's Favourite",      when: { always: true },     by: "The default bar loop — the one Sage keeps on.", file: "" },
  { name: "Rain on the Strip",     when: { heraldOf: 1 },      by: "Softer, late-night.",                            file: "" },
  { name: "The Little One's Tune", when: { met: "P.E.K.K.A" }, by: "P.E.K.K.A's phonograph track.",                  file: "" },
  { name: "Last Call",             when: { night: 3 },         by: "The night before the Championship — the bar bracing for the fight ahead.", file: "" },
];
