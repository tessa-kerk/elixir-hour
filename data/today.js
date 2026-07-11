/* Today's Edition — the live-ops seam, and the only page of the Arena Herald
   that reports the REAL Clash Royale.

   Everything else in HERALD_EDITIONS is story-bound: four authored editions
   that unlock with the three Nights. This one is a live item. It is written to
   the bar's own rules, not the game's:

     • Nobody in this world knows what a "card" is. Ronin is a PERSON — a
       wandering swordsman who has turned up in the arena. The heroes are
       fighters. The arena has masters, never a "balance team".
     • No percentages, no tile counts, no patch-note grammar. Bar gossip.
     • No Supercell copy is reproduced; event and album names are theirs and
       stay out of the fiction. What's retold here is only what happened.

   `live.validUntil` is the season's last day, inclusive, as a local date.
   Past it, src/tome.js falls through to `evergreen` — which is undated and
   always true, so a live companion never looks abandoned. That fallthrough is
   also the failure mode: a missing or malformed validUntil yields evergreen
   rather than a stale headline.

   TO REFRESH FOR THE NEXT SEASON: rewrite `live` and move `validUntil`. That
   is the whole job — no code changes, no redeploy of anything but this file.

   Sources for this edition (checked 10-07-2026, Tessa): Supercell release
   notes + RoyaleAPI. Season 85 "Honor & Exile", 06-07-2026 → 03-08-2026;
   Ronin, the new wandering swordsman; the July balance pass reining in the
   Hero Balloon's skeleton troopers and the Hero Goblins; and the weekly
   Monday reshuffle of what may be brought into the arena. */

window.TODAY_EDITION = {

  /* KEEP IT SHORT. The Tome has NO scrollbars (GDD §11) and the Herald page does
     not paginate, so an over-long story is silently CLIPPED. Landscape is the
     tighter of the two orientations by a long way — the first draft of this
     edition overran it by 58px while fitting portrait fine.

     Budget: ~110 words across the three paragraphs, headline under ~45
     characters, and a dateline that fits on ONE line. Measured headroom at
     1280×720 after this trim: 71px, roughly three spare lines — enough that a
     failed webfont load can't clip it. Re-measure whenever you rewrite this. */
  live: {
    validUntil: "2026-08-03",              /* the last day of Honor & Exile, inclusive */
    ed: "Today's Edition",
    /* the dateline is a SEASON label, never a single day: the edition is live for
       the whole of Honor & Exile (to 03-08), so "6 July" read as the paper's date
       and looked stale by mid-season. Refresh it when `live` is rewritten. */
    dateline: "This season · Honor & Exile",
    head: "A Wandering Swordsman Comes to the Arena",

    story: "He came in off the long road with swords on his back and the dust of three kingdoms on his boots, and asked only for water. They say he never strikes first — he waits, and gives back in kind whatever is given him. The season has brought stranger things through the gates. None so quiet.",

    story2: "The arena masters, meanwhile, have had a word with the heroes: the balloon's skeleton troopers are to fight less fiercely up close, and the goblin heroes to go easier on the rest. It had got so an ordinary fighter could scarcely find room to swing.",

    story3: "And the rules keep turning over: every Monday the masters change what may be carried into the arena.",
  },

  /* Undated, and true on any night the bar is open. */
  evergreen: {
    ed: "Today's Edition",
    dateline: "From the strip, as ever",
    head: "Neutral Ground Holds",

    story: "No decrees tonight. No closures, no bad news out of either Crown. The lanterns are lit and the door is unlocked, and whatever the arena is doing this week can keep until morning.",

    story2: "There is a stool free at the counter, and the Elixir is on.",
  },

};
