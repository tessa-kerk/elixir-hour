/* Night/beat structure — the sequencer's fuel (src/state.js walks this;
   src/dialogue.js plays visit/scene scripts). Night 1 is transcribed VERBATIM
   from "../Elixir Hour - Hour 1 Script.md" (Draft 2) — do not edit lines here
   without editing the script first. Nights 2–3 land in Milestone 6.

   Entry shapes inside a script[]:
     { who:"Knight", expr:"Warm & Content", line:"..." }  spoken line; expr swaps
                                                          the sprite when who is
                                                          the visit's customer.
                                                          *(...)* renders italic.
     { n:"..." }                                          narration (italic, no name)
     { cue:"sfx"|"art", text:"..." }                      kept for Milestone 7; skipped
     { choice:"...", options:[{label, tone, reply:[entries]}] }
     { brew:{base, mix, dose?, recipe, nudge} }           gate: pour must match; a wrong
                                                          pour repeats `nudge` (gentle
                                                          beat — no fail state). Bespoke
                                                          wrong-brew reaction lines are
                                                          a flagged content TODO.
     { unlock:{recipe:"..."} | {ledger:"...", note:"..."} | {herald:n} }

   Beat shapes: { type:"scene", script:[...] }            no customer on screen
                { type:"visit", who, expr, script:[...] } customer at the counter
                { type:"herald" }                         broadsheet interstitial   */
window.NIGHTS = [
  {
    night: 1,
    beats: [

      /* ---- Cold open ---- */
      {
        type: "scene",
        script: [
          { cue: "art", text: "the bar at golden hour. Empty stools. Taps glowing soft purple. The arena bright through the window." },
          { cue: "sfx", text: "low crowd roar outside, muffled. A tap hisses." },
          { who: "Sage", line: "*(to no one, wiping the counter)* Okay. First proper night running this place on my own. How hard can it be, really." },
          { cue: "sfx", text: "the hiss climbs, then a wet *thunk* as the tap settles." },
          { who: "Sage", line: "…That's not meant to do that, is it." },
          { cue: "sfx", text: "a bead of purple light drips into a tankard." },
          { who: "Sage", line: "Huh. That's actually prettier than I expected." },
          { n: "The door swings open. Evening air spills in. Someone big fills the frame." },
        ],
      },

      /* ---- The Knight — "the usual" ---- */
      {
        type: "visit",
        who: "Knight",
        expr: "Warm & Content",
        script: [
          { who: "Knight", line: "Evening. You're new here, then." },
          { who: "Sage", line: "Is it that obvious?" },
          { who: "Knight", line: "Well, you're holding that tap like you think it might bite you. *(settling in with a grunt)* So the old keeper finally hung it up, did he? Good for him. Honestly, that's been a long time coming." },
          { choice: "How does Sage answer?", options: [
            { label: "\"So you knew him well.\"", tone: "warm" },
            { label: "\"You must come here a lot, then.\"", tone: "dry" },
            { label: "Just keep wiping the counter.", tone: "silent" },
          ] },
          { who: "Knight", line: "I'm here most nights the arena's open. And on the nights it's shut, I turn up anyway." },
          { n: "He doesn't order. He just waits, the way regulars wait." },
          { who: "Sage", line: "I'm afraid I don't know your usual yet." },
          { who: "Knight", line: "*(a small, patient smile)* Then I'll teach you. It won't take long, I promise — it never does." },
          { who: "Knight", line: "Start with the Elixir, just the base for now. That stuff's the whole kingdom in a cup, literally. Everyone around here runs on it — some of us are pretty much made of this stuff, if you go back far enough." },
          { who: "Knight", line: "Now put in a drop of Heal — just the one, mind you. Two drops is for a bad day, and this isn't one of those." },
          { brew: { base: "Elixir", mix: ["Heal"], dose: 1, recipe: "The Usual",
                    nudge: "Now put in a drop of Heal — just the one, mind you. Two drops is for a bad day, and this isn't one of those." } },
          { who: "Knight", line: "There you go. That's the usual. It's steady, nothing clever about it, and that's the point." },
          { cue: "art", text: "Knight lifts it, the purple glow catching his face." },
          { who: "Knight", line: "*(after a slow sip)* …Yeah. Careful, though — the first one's always right by accident. Don't let it go to your head." },
          { unlock: { recipe: "The Usual" } },
          { who: "Sage", line: "You've clearly done this a while." },
          { who: "Knight", line: "Sat on this stool? Years. Out in the arena? A good deal longer — I was one of the first fighters they ever sent out there. My fee's cheap, I'm dependable, and I get the job done. *(a dry tug at the moustache)* The moustache didn't hurt, either. If you believe the old story, it's the only reason they ever knighted me at all." },
          { who: "Sage", line: "Can I ask you something a bit daft?" },
          { who: "Knight", line: "Go on. That's usually the only kind worth asking." },
          { who: "Sage", line: "The two sides — Blue, Red, this whole war going on out there. What's it actually about?" },
          { who: "Knight", line: "*(a long breath; he's answered this before, but not tonight, not for a newcomer)* The truth? You could ask ten of us and get ten different answers. But if you go back far enough, it comes down to two kings — brothers, if you can believe that — who've been at each other's throats for a few hundred years. Over the arena. Over crowns and towers. Over who gets the Elixir. Over something one of them said at supper once, most likely. *(a tired half-smile)* And the rest of us just clock in, clash, and clock out again." },
          { who: "Sage", line: "And this place? Where does it fit?" },
          { who: "Knight", line: "Oh, this place is the clocking-out part. It sits right on the border strip, see, so it doesn't belong to either side — which is exactly why it works. It's about the only place in the whole kingdom where a Blue and a Red can sit this close together and not a single fight breaks out." },
          { n: "He says it like it's the most ordinary thing in the world. It clearly isn't." },
          { unlock: { ledger: "Knight", note: "The anchor. Been fighting a long time." } },
        ],
      },

      /* ---- The Hog Rider — "HOG—!" ---- */
      {
        type: "visit",
        who: "Hog Rider",
        expr: "Big Laugh",
        script: [
          { cue: "sfx", text: "an almighty CRASH at the door. Every tankard on the shelf rattles." },
          { who: "Hog Rider", line: "HOG RII— *(spots Sage, and doesn't slow down for a second)* —oh, a new face! We've got a NEW FACE. Knight, mate, you didn't tell me we had a new face!" },
          { who: "Knight", line: "*(not looking up from his drink)* You didn't ask." },
          { who: "Hog Rider", line: "*(slamming onto a stool)* Alright, then, here's the rules for you, newcomer. Number one, I drink the strong stuff — that's Dark Elixir, and don't you be shy with it. Number two, you put a Rage in there for me, because a drink ought to have a bit of personality. And number three —" },
          { who: "Sage", line: "Wait, there's a three?" },
          { who: "Hog Rider", line: "There's always a three! I'll think of it. You pour first." },
          { brew: { base: "Dark Elixir", mix: ["Rage"], recipe: "The Strong Stuff",
                    nudge: "Alright, then, here's the rules for you, newcomer. Number one, I drink the strong stuff — that's Dark Elixir, and don't you be shy with it. Number two, you put a Rage in there for me, because a drink ought to have a bit of personality. And number three —" } },
          { cue: "art", text: "Hog Rider takes it in one hand, grinning." },
          { who: "Hog Rider", line: "*(after an enormous gulp)* HA! Now see, THAT is a drink that's been to a battle and back. You lot honestly don't know what you're missing, sat there being all quiet—" },
          { who: "Knight", line: "There's only two of us." },
          { who: "Hog Rider", line: "—being all quiet, the both of you! *(delighted with himself)* Anyway — I've left the Hog tied up out front, and we're not speaking, him and me. Long story. He knows what he did." },
          { n: "He carries on like that for a while. He's very easy to be around, and you notice he never once looks at the door." },
          { choice: "Sage notices.", options: [
            { label: "\"You're always the last one to leave, aren't you.\"", tone: "gentle" },
            { label: "\"You can stay as long as you keep tipping.\"", tone: "playing" },
            { label: "Say nothing. Just file it away.", tone: "silent" },
          ] },
          { who: "Hog Rider", line: "*(if Sage pushes, only the smallest flicker — then straight back to loud)* Me? Nah, nah. I've got places to be, loads of 'em. This one's just the best of the bunch, that's all it is. *(bigger grin)* Anyway — go on, another!" },
          { unlock: { recipe: "The Strong Stuff" } },
          { unlock: { ledger: "Hog Rider", note: "Loud. Always the last to leave." } },
        ],
      },

      /* ---- The Wizard — a performance ---- */
      {
        type: "visit",
        who: "Wizard",
        expr: "Boastful Grin",
        script: [
          { who: "Wizard", line: "Ah, a keeper — a brand-new one, I see. Then you've not yet had the pleasure. The most awesome man ever to set foot in this Arena — and now this bar, too. Handsomeness and fireballs, in roughly that order. And since you won't know my order yet, you get the privilege of making it properly." },
          { who: "Sage", line: "And \"properly\" would be…?" },
          { who: "Wizard", line: "Elixir, a shot of Rage — no, better make that two — and then a Zap to finish. The Zap is the real art of it, keeper. Anyone can pour a drink, but not just anyone can make the thing actually spark." },
          { who: "Knight", line: "*(into his tankard)* Oh, here we go." },
          { who: "Wizard", line: "I heard that, you know." },
          { brew: { base: "Elixir", mix: ["Rage", "Zap"], recipe: "The Showstopper",
                    nudge: "Elixir, a shot of Rage — no, better make that two — and then a Zap to finish. The Zap is the real art of it, keeper. Anyone can pour a drink, but not just anyone can make the thing actually spark." } },
          { cue: "art", text: "Wizard catches it and raises it high — a flourish that's half magic trick, half plea." },
          { who: "Wizard", line: "*(to a crowd that is three people)* …and for my next— *(the spark fizzles early, with a small, sad pop)* …ah. Hm. That one was supposed to last a good deal longer than that." },
          { n: "A beat. You can watch him deciding whether or not to laugh it off." },
          { choice: "How does Sage handle it?", options: [
            { label: "\"Go on, do it again — I properly missed it.\"", tone: "kind", reply: [
              { who: "Wizard", line: "*(brightening, absurdly grateful for so small a thing)* You— yes. Yes, alright! An appreciative audience, at last. You've no idea how rare that is 'round here. Watch, watch, I'll get the timing right this time—" },
            ] },
            { label: "\"Honestly, the fizzle's the best bit. Very you.\"", tone: "tease", reply: [
              { who: "Wizard", line: "*(a wounded little laugh, but a real one)* …\"Very me,\" she says. Well. I'll take it, I suppose. I've been called worse by better." },
            ] },
            { label: "\"No, that was genuinely good.\"", tone: "sincere", reply: [
              { who: "Wizard", line: "*(caught completely off guard; the grin slips into something unpractised)* Oh. Well, I— yes. It was, wasn't it. *(he genuinely doesn't know what to do with a straight compliment)*" },
            ] },
          ] },
          { who: "Wizard", line: "*(recovering, grand again)* The others, you understand — the Electro Wizard, the Ice Wizard, every last one of them pretending to be flashier than me — they'd have brought the whole roof down just to make a point. But subtlety, keeper! Subtlety's a lost art these days." },
          { who: "Knight", line: "*(quiet, to Sage, almost fond)* He's not a bad guy, you know. He's got real skill in him — he just reckons everyone has to see him pull off the big, flashy stuff to believe it. They don't." },
          { unlock: { recipe: "The Showstopper" } },
          { unlock: { ledger: "Wizard", note: "Performs. Desperate to be taken seriously." } },
        ],
      },

      /* ---- Close of Night ---- */
      {
        type: "visit",
        who: "Knight",
        expr: "Warm & Content",
        script: [
          { n: "The Wizard sweeps out mid-sentence. The Hog Rider follows, somehow louder leaving than arriving. The room empties down to two." },
          { cue: "art", text: "golden light going amber, the window cooling at its edges." },
          { who: "Knight", line: "*(making no move to leave)* You did alright tonight. For your first night, anyway." },
          { who: "Sage", line: "They're not what I expected. None of them, really." },
          { who: "Knight", line: "No, they never are. *(he's looking past Sage now, out the window, at the banner strung over the arena gates — three words, too far to read, though he knows them by heart)* …Three days." },
          { who: "Sage", line: "Three days till what?" },
          { who: "Knight", line: "*(standing, setting the empty tankard down with care)* Oh, you'll hear about it. Everyone will. *(at the door, without turning back)* Get yourself some sleep, keeper. It gets a lot busier from here." },
          { cue: "sfx", text: "the door. Quiet. That one tap, still hissing." },
          { cue: "art", text: "Sage alone, the arena glowing through the glass. Fade." },
          { unlock: { herald: 1 } },
        ],
      },

      /* The Herald front page that just unlocked — end-of-night interstitial */
      { type: "herald" },
    ],
  },
  { night: 2, beats: [] },
  { night: 3, beats: [] },
];
