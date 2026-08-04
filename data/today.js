/* Today's Edition — the live-ops seam, and the only pages of the Arena Herald
   that report the REAL Clash Royale.

   Everything else in HERALD_EDITIONS is story-bound: authored editions that
   unlock with the Nights. These are live items. Written to the bar's own
   rules, not the game's:

     • Nobody in this world knows what a "card" is. Ronin is a PERSON — a
       wandering swordsman who has turned up in the arena. The heroes are
       fighters. The arena has masters, never a "balance team".
     • No percentages, no tile counts, no patch-note grammar. Bar gossip.
     • No Supercell copy is reproduced; event and album names are theirs and
       stay out of the fiction. What's retold here is only what happened.

   ARCHIVE MODEL (wired 24-07-2026, Brief - Herald Live-Ops Loop.md): `live` is
   a LIST, one entry per season, APPENDED never overwritten. Exactly one entry
   is "current" — today falls within its `validUntil`, inclusive, as a local
   date. The rest stay readable in the Herald archive beneath it, so the Tome
   slowly builds an in-world history of the real game. Past that current
   entry's `validUntil`, src/tome.js falls through to `evergreen` for the
   TOP-OF-PAGE slot — which is undated and always true, so a live companion
   never looks abandoned — while the expired entry itself simply becomes
   another archive row. A missing or malformed `validUntil` on any entry drops
   that entry from both current and archive (same fail-safe as before: never a
   broken or stale headline).

   `dated` is the entry's OWN in-world date — one day after the patch it
   retells — used to caption it once it's no longer current. It plays no part
   in picking the current entry; only `validUntil` does that.

   TO REFRESH FOR THE NEXT SEASON: append one new object to `live`. That is
   the whole job — no code changes, no redeploy of anything but this file. Do
   not edit or remove past entries; they're the proving-run's receipts.

   OPTIONAL `gossip` FIELD: one in-world attributed closer, e.g. "Overheard at
   the counter — Knight: …", cast per the Newsroom Protocol §3 table. Renders
   only when present — most editions won't carry one. Write the whole
   attributed line here; there's no code-side prefix.

   Sources for the first live edition (checked 10-07-2026, Tessa): Supercell
   release notes + RoyaleAPI. Season 85 "Honor & Exile", 06-07-2026 →
   03-08-2026; Ronin, the new wandering swordsman; the July balance pass
   reining in the Hero Balloon's skeleton troopers and the Hero Goblins; and
   the weekly Monday reshuffle of what may be brought into the arena. */

window.TODAY_EDITION = {

  /* KEEP EACH ENTRY SHORT. The Tome has NO scrollbars (GDD §11) and the Herald
     detail page does not paginate, so an over-long story is silently CLIPPED.
     Landscape is the tighter of the two orientations by a long way — the
     first draft of the first edition overran it by 58px while fitting
     portrait fine.

     Per-entry budget: ~110 words across the story paragraphs (+ ~25 words if
     `gossip` is set), headline under ~45 characters, and a dateline that fits
     on ONE line. Measured headroom at 1280×720 for the first entry: 71px,
     roughly three spare lines — enough that a failed webfont load can't clip
     it. Re-measure (both orientations) whenever you append or edit an entry. */
  live: [
    {
      validUntil: "2026-08-03",              /* the last day of Honor & Exile, inclusive */
      dated: "2026-07-07",                   /* in-world date: the day after the season's patch */
      ed: "Today's Edition",
      /* the dateline is a SEASON label, never a single day, while this entry is
         CURRENT: the edition is live for the whole of Honor & Exile (to 03-08),
         so "6 July" read as the paper's date and looked stale by mid-season.
         Once this entry ages into the archive, src/tome.js captions it from
         `dated` instead — this field stops being read. */
      dateline: "This season · Honor & Exile",
      head: "A Wandering Swordsman Comes to the Arena",

      story: "He came in off the long road with swords on his back and the dust of three kingdoms on his boots, and asked only for water. They say he never strikes first — he waits, and gives back in kind whatever is given him. The season has brought stranger things through the gates. None so quiet.",

      story2: "The arena masters, meanwhile, have had a word with the heroes: the balloon's skeleton troopers are to fight less fiercely up close, and the goblin heroes to go easier on the rest. It had got so an ordinary fighter could scarcely find room to swing.",

      story3: "And the rules keep turning over: every Monday the masters change what may be carried into the arena.",
    },
    /* DRAFT — Season 86 "Viking Chaos", fit-check only (PM/Tessa, 24-07). NOT
       canon-checked or approved copy yet; here to measure whether it clips the
       Tome page before Tessa signs off. */
    {
      validUntil: "2026-09-06",
      dated: "2026-08-04",
      ed: "Today's Edition",
      dateline: "This season · Viking Chaos",
      head: "The Big Names Are Down to One Trick",

      story: "The arena masters have been round to the big names, and it has not gone down well. Whatever each of them does — the leap, the great swing — they get one go at it now. Only the Boss Bandit was spared: her trick is going again straight away.",

      story2: "Two of the northerners have come back changed. The berserker has a rage in her now, and nothing can put her down while it lasts. The valkyrie spins into a crowd and cuts her way through, though they can still hurt her back.",

      story3: "And the little spirits no longer reach the towers on their own.",

      gossip: "The Knight, into his cup, 'One good blow, then your wits for the rest of the fight. Most of us have always fought that way.'",
    },
  ],

  /* Undated, and true on any night the bar is open. */
  evergreen: {
    ed: "Today's Edition",
    dateline: "From the strip, as ever",
    head: "Neutral Ground Holds",

    story: "No decrees tonight. No closures, no bad news out of either Crown. The lanterns are lit and the door is unlocked, and whatever the arena is doing this week can keep until morning.",

    story2: "There is a stool free at the counter, and the Elixir is on.",
  },

};
