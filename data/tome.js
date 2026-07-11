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
    taught: "Hog Rider's, tournament eve — the strong stuff set down",
    note: "Light and warm, none of his usual fire. Just something easy." },
  { name: "The Gentle One", mix: ["Elixir", "Heal ×3"], dots: ["#B26AE0", "#4e9a51"],
    taught: "For P.E.K.K.A — warm and gentle",
    note: "No spark in it. Served slower on purpose." },
  /* Edition 2 (GDD v1.6) — taught/note copy from the Night 4 script's TOME cues */
  { name: "Water", mix: ["Water"], dots: ["#bcd7e6"],
    taught: "Taught by: Ronin, who orders nothing else",
    note: "Water, nothing in it, any pour. The humblest thing the bar owns — served with the same respect as the strong stuff." },
  { name: "The Long Road", mix: ["Dark Elixir", "Heal ×2"], dots: ["#3d2350", "#4e9a51"],
    taught: "Taught by: nobody. Made up on a festival night, for a man off the road",
    note: "The dark base for the miles, the Heal for arriving. There is no hurry in it." },
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
    who: "Knight", card: "assets/ui/cards/Knight Card (cutout).webp", px: [1525, 2048], box: { l: 0.087, t: 0.083, r: 0.915, b: 0.928 },
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
    who: "Wizard", card: "assets/ui/cards/Wizard Card (cutout).webp", px: [1551, 2155], box: { l: 0.023, t: 0.030, r: 0.976, b: 0.969 },
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
    who: "Princess", card: "assets/ui/cards/Princess Card (cutout).webp", px: [774, 1076], box: { l: 0.023, t: 0.030, r: 0.977, b: 0.969 },
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
    who: "P.E.K.K.A", card: "assets/ui/cards/P.E.K.K.A Card (cutout).webp", px: [1689, 2346], box: { l: 0.022, t: 0.030, r: 0.976, b: 0.970 },
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
    who: "Hog Rider", card: "assets/ui/cards/Hog Rider Card (cutout).webp", px: [1698, 2359], box: { l: 0.022, t: 0.030, r: 0.976, b: 0.969 },
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
  /* Edition 2 guest. Card generated 11-07 (gpt-image-2, style-matched to the
     five locked cards) — DRAFT until Tessa signs it off, like the bios below:
     stage notes are verbatim from the Night 4 script's TOME cues; the bio
     paragraphs are Cowork drafts in the §10 register, FLAGGED for her pass. */
  {
    who: "Ronin", card: "assets/ui/cards/Ronin Card (cutout).webp", px: [1056, 1408], box: { l: 0.075, t: 0.050, r: 0.930, b: 0.945 },
    stages: [
      { bio: "A wandering swordsman off the long road — **no banner**, no lord to vouch for him, and no story anyone can trail. Orders **water**, nothing in it, and pays for more than he takes. Never strikes first; answers exactly in kind.",
        notes: [
          { mark: "no banner", note: "Knight said that'll do for papers" },
          { mark: "water", note: "the third tap — nothing in it, ever" },
        ] },
      { bio: "Asked why a counter would take a man with no side — **nobody here has ever asked him** anything, is the thing. The accounting fails somewhere east of the mountains; the road has been all there is, for longer than he can count.",
        notes: [ { mark: "nobody here has ever asked him", note: "the room didn't vote — he noticed" } ] },
      { bio: "One coin, slid forward an exact inch: the first drink he has asked of anyone in years. The Long Road went into the book the same night he stopped watching the door.",
        pinned: "First Elixir in years, maybe ever. Held the tankard like the others do. Like a regular." },
    ],
  },
];

/* Arena Herald — one edition per Night, VERBATIM from the Hour scripts;
   an edition unlocks into the Tome archive the moment its interstitial is
   shown (Night 1's lands end-of-night; Nights 2–3 open on theirs).
   `night: 4` is the epilogue morning-after edition: `consequence` holds the
   two possible lines from the Knight's last cup (GDD §8 — the save decides
   which prints), `story2` the decree-lifted closer, `final` the closing
   card (screen-only, not newspaper copy). `ripple` marks it as the edition
   traced back to a quiet brew. */
window.HERALD_EDITIONS = [
  { night: 1, ed: "Ed. XLVII", head: "Crown Championship in Three Days",
    story: "Blue and Red to settle it under the King's own eye. The greatest bout of the year draws near, and every fighter in the realm feels it — some with hunger, some with dread, and a rare few with nothing but thirst.",
    ripple: false },
  { night: 2, ed: "Ed. XLVIII", head: "The Draw Is Set",
    story: "The champions are paired, and they clash at dawn on the third day. By royal decree: the border strip to be SEALED for Championship night. “Neutral ground” to close, for the safety of the realm.",
    ripple: false },
  { night: 3, ed: "Ed. XLIX", head: "Championship at Dawn",
    story: "By order of the Crown, the border strip is closed this night. All fighters to return to their own kingdoms before the bells. The neutral ground is neutral no longer.",
    ripple: false },
  { night: 4, ed: "Ed. L", head: "The Championship Is Over",
    story: "The Crown has its victor, the stands are empty, and the realm heads home bleary-eyed.",
    consequence: {
      clear: "And a certain veteran fighter — steady, unshowy, no card to his name — came through his opening bout to everyone's surprise but his own.",
      rattled: "And a certain veteran fighter went out in the opening bout, off his game, they say — though he was seen laughing about it by nightfall.",
    },
    story2: "DECREE LIFTED — the border strip is ruled neutral ground once more. The little bar upon it reopens tonight, and the Crown, it is reported, will not press the matter.",
    final: "The victors are crowned. Elixir Hour opens again tonight.",
    ripple: true },
  /* ---- Edition 2 (Night 4, "The Long Road") — keys 5 and 6 continue the
     archive numbering; copy VERBATIM from the Night 4 script's Herald section.
     Key 5 = Ed. LI, the Night 4 opener (its herald beat names it explicitly:
     { type:"herald", ed:5 } — the plain `night` lookup would collide with Ed. L
     above). Key 6 = Ed. LII, the Night 4 epilogue; `field` names the save slot
     its consequence line reads (Ronin's first pour), and archiving key 6 is
     what marks the whole game completed (src/state.js). */
  { night: 5, ed: "Ed. LI", head: "The Bar Goes Travelling",
    dateline: "From the festival grounds — Festival of Honor & Exile",
    story: "The keeper of the strip's own bar has taken the counter to the festival — boards, taps and all — and has set up beneath the lanterns by the east gate. Patrons of both kingdoms are reminded that the rules travel with the furniture: no banners at the counter, no quarrels past the first pour. Neutral ground, delivered.",
    story2: "Elsewhere: the wandering swordsman remains at the festival, still drinking only water, still declining every challenge issued to him. The arena masters have ruled the matter closed: a man who will not strike first cannot be made to. The masters are reported relieved to have a rule that enforces itself.",
    ripple: false },
  { night: 6, ed: "Ed. LII", head: "Festival Closes — Lanterns Down Till Next Year",
    dateline: "From the festival grounds, first light",
    field: "ronin",
    story: "The Festival of Honor & Exile closed its gates at dawn, the banners coming down in the same order they went up. The travelling bar was seen folded flat and cart-bound by sunrise, its keeper reportedly last to leave and first to settle the pitch fee.",
    consequence: {
      clear: "And one item of note for the strip: the wandering swordsman was seen at first light — not on the road. He has taken a room above the bakery, two doors from the bar's home pitch. Locals report he tips generously.",
      rattled: "And one item from the road: the wandering swordsman was gone before first light, walking east, or possibly west — reports differ, as they always will with him. The keeper of the travelling bar reports a coin left on the counter worth ten waters, and no note.",
    },
    ripple: true },
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
  { name: "Sage's Favourite",      when: { always: true },     by: "The default bar loop — the one Sage keeps on.", file: "sages-favourite.mp3" },
  { name: "Rain on the Strip",     when: { heraldOf: 1 },      by: "Softer, late-night.",                            file: "rain-on-the-strip.mp3" },
  { name: "The Little One's Tune", when: { met: "P.E.K.K.A" }, by: "P.E.K.K.A's phonograph track.",                  file: "the-little-ones-tune.mp3" },
  { name: "Last Call",             when: { night: 3 },         by: "The night before the Championship — the bar bracing for the fight ahead.", file: "last-call.mp3" },
  { name: "East of the Mountains", when: { met: "Ronin" },     by: "The wanderer's tune — carried in off the long road.", file: "east-of-the-mountains.mp3" },   /* Edition 2 (GDD v1.6) */
];
