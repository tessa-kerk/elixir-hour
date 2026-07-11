/* Night/beat structure — the sequencer's fuel (src/state.js walks this;
   src/dialogue.js plays visit/scene/group/duo scripts). All three Nights are
   transcribed VERBATIM from the Hour 1–3 scripts in the parent folder — do
   not edit lines here without editing the script first.

   Entry shapes inside a script[]:
     { who:"Knight", expr:"Warm & Content", line:"..." }  spoken line; expr swaps
                                                          the sprite when who is
                                                          the visit's customer (or
                                                          any cast member in a
                                                          group/duo beat).
                                                          *(...)* renders italic.
     { n:"..." }                                          narration (italic, no name)
     { cue:"sfx"|"art", text:"..." }                      kept for Milestone 7; skipped
     { choice:"...", options:[{label, tone, reply:[entries]}] }
     { brew:{base, mix, dose?, recipe, wrong?, nudge} }    gate: pour must match; a wrong
                                                          pour ALWAYS shows a line, then
                                                          the request stands (gentle beat,
                                                          no fail state, GDD §7). Extras:
                                                          `any:[{base,mix,dose?}…]` = a
                                                          set of acceptable serves (the
                                                          player's read); `wrong:"…"` = the
                                                          customer's spoken reaction to ANY
                                                          wrong pour (no silent rejects);
                                                          `wrongIf:[{has:"Zap", n:"…"}]` =
                                                          a bespoke reaction when a wrong
                                                          pour contains that mixer
                                                          (P.E.K.K.A's flinch — HIGHEST
                                                          priority: wrongIf > wrong >
                                                          generic gentle beat).
     { brew:{consequence:true, right:{base,mix,dose},     THE one consequential brew
             onRight:[entries], onWrong:[entries]} }      (GDD §8): every pour is
                                                          accepted; the result is
                                                          stored in the save and pays
                                                          off in the epilogue Herald.
     { unlock:{recipe:"..."} | {ledger:"...", note:"...", stage:n} | {herald:n} }
       ledger `stage` (1–3, default 1) writes the note to that stage slot —
       the Ledger page shows §10 stages up to the highest slot filled.

   Beat shapes: { type:"scene", script:[...] }            no customer on screen
                { type:"visit", who, expr, script:[...] } customer at the counter
                { type:"herald", ed?:n }                  broadsheet interstitial (the
                                                          current Night's edition; it
                                                          archives into the Tome when
                                                          shown. `ed` names an explicit
                                                          HERALD_EDITIONS key — Night 4
                                                          opens on key 5 (Ed. LI), which
                                                          the plain night lookup can't
                                                          reach: key 4 is Ed. L.)
                { type:"group", cast:[{who,expr}…], script:[...] }  the whole room
                                                          (Layout 3 — no mixing UI).
                                                          Edition 2: `image` + `heads`
                                                          render one of Tessa's baked
                                                          multi-character away scenes
                                                          instead of Group Scene V2 —
                                                          the same route the Night-3
                                                          finale already takes, so away
                                                          "duos" are group beats too.
                { type:"duo", cast:[{who,expr},{who,expr}], script:[...] }  two
                                                          customers conversing (Layout
                                                          5 — split, name-box; home-bar
                                                          cutout compositing — the away
                                                          night never uses it)
                { type:"epilogue", ed:n }                 the morning-after Herald as an
                                                          explicit beat (round 22): key 4
                                                          after Night 3, key 6 after
                                                          Night 4. Mid-arc its button
                                                          reads Continue; end-of-arc it
                                                          returns to the title.
   A night may declare sceneSet:"away" — every solo scene (and the empty bar)
   resolves from assets/scenes/away/ for that night (data/cast.js).
   A consequence gate may declare field:"ronin" — the §8 result stores to that
   save slot instead of `consequence` (src/dialogue.js), so the Knight's last
   cup and Ronin's first pour never overwrite each other.
   group/duo scripts carry lines/narration/cues/unlocks only — choices and
   brew gates belong to serve beats (the mixing panel lives there). */
window.NIGHTS = [
  {
    night: 1,
    title: "Opening Time",
    /* Night Cap (GDD §11): ONE spoiler-safe quote per Night, curated here —
       Tessa approves the list. Never a plot beat, never the consequential brew
       or its outcome. FLAGGED for approval (see PLAN.md). */
    nightcap: { quote: { text: "That's the usual. It's steady, nothing clever about it, and that's the point.", who: "Knight" } },
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
                    /* wrong-pour line — approved 07-07 (GDD §7: the rejection hints the right cup, in voice) */
                    wrong: "Kind of you — but that's not the usual. One drop of Heal, just the one. Two's for a bad day, and this isn't one.",
                    nudge: "Now put in a drop of Heal — just the one, mind you. Two drops is for a bad day, and this isn't one of those.",
                    orderShort: "A drop of Heal — just the one, mind you…" } },
          { who: "Knight", line: "There you go. That's the usual. It's steady, nothing clever about it, and that's the point." },
          { cue: "art", text: "Knight lifts it, the purple glow catching his face." },
          { who: "Knight", line: "*(after a slow sip)* …Yeah. Careful, though — the first one's always right by accident. Don't let it go to your head." },
          { unlock: { recipe: "The Usual" } },
          { who: "Sage", line: "*(she writes it in the Tome)* …and that one's noted down for good." },
          { who: "Sage", line: "You've clearly done this a while." },
          { who: "Knight", line: "Sat on this stool? Years. Out in the arena? A good deal longer — I was one of the first fighters they ever sent out there. My fee's cheap, I'm dependable, and I get the job done. *(a dry tug at the moustache)* The moustache didn't hurt, either. If you believe the old story, it's the only reason they ever knighted me at all." },
          { who: "Sage", line: "Can I ask you something a bit daft?" },
          { who: "Knight", line: "Go on. That's usually the only kind worth asking." },
          { who: "Sage", line: "The two sides — Blue, Red, this whole war going on out there. What's it actually about?" },
          { who: "Knight", expr: "Weary & Wistful", line: "*(a long breath; he's answered this before, but not tonight, not for a newcomer)* The truth? You could ask ten of us and get ten different answers. But if you go back far enough, it comes down to two kings — brothers, if you can believe that — who've been at each other's throats for a few hundred years. Over the arena. Over crowns and towers. Over who gets the Elixir. Over something one of them said at supper once, most likely. *(a tired half-smile)* And the rest of us just clock in, clash, and clock out again." },
          { who: "Sage", line: "And this place? Where does it fit?" },
          { who: "Knight", expr: "Warm & Content", line: "Oh, this place is the clocking-out part. It sits right on the border strip, see, so it doesn't belong to either side — which is exactly why it works. It's about the only place in the whole kingdom where a Blue and a Red can sit this close together and not a single fight breaks out." },
          { n: "He says it like it's the most ordinary thing in the world. It clearly isn't." },
          { unlock: { ledger: "Knight", note: "The anchor. Been fighting a long time." } },
        ],
      },

      /* ---- The Hog Rider crashes in — he greets the Knight (Layout 5 two-shot) ----
         Round 10 (option A): the arrival + the Knight's dry reply is a two-shot; the
         rules-and-order + pour are the solo serve beat below. Verbatim, camera only. */
      {
        type: "duo",
        cast: [ { who: "Hog Rider", expr: "Big Laugh" }, { who: "Knight", expr: "Warm & Content" } ],
        script: [
          { cue: "sfx", text: "an almighty CRASH at the door. Every tankard on the shelf rattles." },
          { who: "Hog Rider", line: "HOG RII— *(spots Sage, and doesn't slow down for a second)* —oh, a new face! We've got a NEW FACE. Knight, mate, you didn't tell me we had a new face!" },
          { who: "Knight", line: "*(not looking up from his drink)* You didn't ask." },
        ],
      },

      /* ---- The Hog Rider — the rules, the order, the pour (solo) ---- */
      {
        type: "visit",
        who: "Hog Rider",
        expr: "Big Laugh",
        script: [
          { who: "Hog Rider", line: "*(slamming onto a stool)* Alright, then, here's the rules for you, newcomer. Number one, I drink the strong stuff — that's Dark Elixir, and don't you be shy with it. Number two, you put a Rage in there for me, because a drink ought to have a bit of personality. And number three —" },
          { who: "Sage", line: "Wait, there's a three?" },
          { who: "Hog Rider", expr: "Warm Grin", line: "There's always a three! I'll think of it. You pour first." },
          { brew: { base: "Dark Elixir", mix: ["Rage"], recipe: "The Strong Stuff",
                    /* wrong-pour line — approved 07-07 (GDD §7: hints the right cup, in voice) */
                    wrong: "HA! Wrong cup, keeper! The STRONG stuff — Dark Elixir, and don't you be shy with it!",
                    nudge: "Alright, then, here's the rules for you, newcomer. Number one, I drink the strong stuff — that's Dark Elixir, and don't you be shy with it. Number two, you put a Rage in there for me, because a drink ought to have a bit of personality. And number three —",
                    orderShort: "Number one, I drink the strong stuff — that's Dark Elixir… Number two, you put a Rage in there for me." } },
          { cue: "art", text: "Hog Rider takes it in one hand, grinning." },
          { who: "Hog Rider", expr: "Big Laugh", line: "*(after an enormous gulp)* HA! Now see, THAT is a drink that's been to a battle and back. You lot honestly don't know what you're missing, sat there being all quiet—" },
          { who: "Knight", line: "There's only two of us." },
          { who: "Hog Rider", line: "—being all quiet, the both of you! *(delighted with himself)* Anyway — I've left the Hog tied up out front, and we're not speaking, him and me. Long story. He knows what he did." },
          { n: "He carries on like that for a while. He's very easy to be around, and you notice he never once looks at the door." },
          { choice: "Sage notices.", options: [
            { label: "\"You're always the last one to leave, aren't you.\"", tone: "gentle" },
            { label: "\"You can stay as long as you keep tipping.\"", tone: "playing" },
            { label: "Say nothing. Just file it away.", tone: "silent" },
          ] },
          { who: "Hog Rider", expr: "Quiet & Wistful", line: "*(if Sage pushes, only the smallest flicker — then straight back to loud)* Me? Nah, nah. I've got places to be, loads of 'em. This one's just the best of the bunch, that's all it is. *(bigger grin)* Anyway — go on, another!" },
          { unlock: { recipe: "The Strong Stuff" } },
          { unlock: { ledger: "Hog Rider", note: "Loud. Always the last to leave." } },
        ],
      },

      /* ---- The Wizard arrives — he performs AT the Knight (Layout 5 two-shot) ----
         Round 10 (option A): the interaction — his entrance and the Knight's dry
         interjection — is a two-shot; the ordering + pour that follow are the solo
         serve beat below. Dialogue is verbatim, only the camera changed. */
      {
        type: "duo",
        cast: [ { who: "Wizard", expr: "Boastful Grin" }, { who: "Knight", expr: "Warm & Content" } ],
        script: [
          { who: "Wizard", line: "Ah, a keeper — a brand-new one, I see. Then you've not yet had the pleasure. The most awesome man ever to set foot in this Arena — and now this bar, too. Handsomeness and fireballs, in roughly that order. And since you won't know my order yet, you get the privilege of making it properly." },
          { who: "Sage", line: "And \"properly\" would be…?" },
          { who: "Wizard", line: "Elixir, a shot of Rage — no, better make that two — and then a Zap to finish. The Zap is the real art of it, keeper. Anyone can pour a drink, but not just anyone can make the thing actually spark." },
          { who: "Knight", line: "*(into his tankard)* Oh, here we go." },
          { who: "Wizard", line: "I heard that, you know." },
        ],
      },

      /* ---- The Wizard — the performance (solo: he orders, you pour) ---- */
      {
        type: "visit",
        who: "Wizard",
        expr: "Boastful Grin",
        script: [
          { brew: { base: "Elixir", mix: ["Rage", "Zap"], dose: 2, recipe: "The Showstopper",
                    /* wrong-pour line — approved 07-07 (GDD §7: hints the right cup, in voice) */
                    wrong: "Mm. Drinkable. But I ordered a performance — double Rage, a Zap. Where's the spark?",
                    nudge: "Elixir, a shot of Rage — no, better make that two — and then a Zap to finish. The Zap is the real art of it, keeper. Anyone can pour a drink, but not just anyone can make the thing actually spark.",
                    orderShort: "Elixir, a shot of Rage — no, make that two — and then a Zap to finish…" } },
          { cue: "art", text: "Wizard catches it and raises it high — a flourish that's half magic trick, half plea." },
          { who: "Wizard", expr: "Deflated", line: "*(to a crowd that is three people)* …and for my next— *(the spark fizzles early, with a small, sad pop)* …ah. Hm. That one was supposed to last a good deal longer than that." },
          { n: "A beat. You can watch him deciding whether or not to laugh it off." },
          { choice: "How does Sage handle it?", options: [
            { label: "\"Go on, do it again — I properly missed it.\"", tone: "kind", reply: [
              { who: "Wizard", expr: "Boastful Grin", line: "*(brightening, absurdly grateful for so small a thing)* You— yes. Yes, alright! An appreciative audience, at last. You've no idea how rare that is 'round here. Watch, watch, I'll get the timing right this time—" },
            ] },
            { label: "\"Honestly, the fizzle's the best bit. Very you.\"", tone: "tease", reply: [
              { who: "Wizard", expr: "Warm Smile", line: "*(a wounded little laugh, but a real one)* …\"Very me,\" she says. Well. I'll take it, I suppose. I've been called worse by better." },
            ] },
            { label: "\"No, that was genuinely good.\"", tone: "sincere", reply: [
              { who: "Wizard", expr: "Warm Smile", line: "*(caught completely off guard; the grin slips into something unpractised)* Oh. Well, I— yes. It was, wasn't it. *(he genuinely doesn't know what to do with a straight compliment)*" },
            ] },
          ] },
          { who: "Wizard", expr: "Boastful Grin", line: "*(recovering, grand again)* The others, you understand — the Electro Wizard, the Ice Wizard, every last one of them pretending to be flashier than me — they'd have brought the whole roof down just to make a point. But subtlety, keeper! Subtlety's a lost art these days." },
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
          { who: "Knight", expr: "Weary & Wistful", line: "No, they never are. *(he's looking past Sage now, out the window, at the banner strung over the arena gates — three words, too far to read, though he knows them by heart)* …Three days." },
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
  {
    night: 2,
    title: "The Draw",
    nightcap: { quote: { text: "A butterfly just… lands. Doesn't ask. Doesn't judge.", who: "P.E.K.K.A" } },
    beats: [

      /* ---- Interstitial — the morning paper: the draw, the decree ---- */
      { type: "herald" },

      /* ---- Cold open ---- */
      {
        type: "scene",
        script: [
          { cue: "art", text: "the bar at dusk. The arena's gone quiet outside, the sky bruising to violet. Inside, the lamps and the taps glow warmer for it." },
          { cue: "sfx", text: "no crowd tonight. Just the taps, and the wind finding the gap under the door." },
          { who: "Sage", line: "*(reading the notice that came pinned to the door)* “…closed for the safety of the realm.” Well, that's one way to put it." },
          { n: "The door opens without a sound. No entrance, no announcement. She's simply there, at the far end of the counter, the way she likes it." },
        ],
      },

      /* ---- The Princess — everything, from a distance ---- */
      {
        type: "visit",
        who: "Princess",
        expr: "Cool & Poised",
        script: [
          { cue: "art", text: "PRINCESS — Poised. She's chosen the stool with the best view of the whole room." },
          { who: "Princess", line: "Two nights in, and you're still standing. The last one didn't last a week." },
          { who: "Sage", line: "I'm told I set a low bar." },
          { who: "Princess", line: "You did. *(the smallest smile)* I like a low bar. Easier to see over." },
          { n: "She hasn't ordered. She's watching the door, the window, the notice, you — all of it at once, without seeming to move her eyes." },
          { who: "Sage", line: "Can I get you something?" },
          { who: "Princess", line: "Give me an Elixir with a drop of Poison in it. I prefer a drink that bites back a little." },
          { brew: { base: "Elixir", mix: ["Poison"], recipe: "The Bittersweet",
                    /* wrong-pour line — approved 07-07 (GDD §7: hints the right cup, in voice) */
                    wrong: "Nice try. Mine's the one that bites back, remember — the one with the Poison in it.",
                    nudge: "Give me an Elixir with a drop of Poison in it. I prefer a drink that bites back a little." } },
          { cue: "art", text: "Princess takes it without looking at it, still reading the room." },
          { who: "Princess", line: "*(after a measured sip)* Mm. Just enough bite. Most people either lose their nerve with the Poison, or they panic and drown the whole thing. You did neither." },
          { unlock: { recipe: "The Bittersweet" } },
          { who: "Sage", line: "You already knew about the notice. Before I did." },
          { who: "Princess", line: "I knew about the draw before the Crown's own herald did. *(she taps her temple, unhurried)* I know most things before most people do. That tends to happen when you spend your life watching from further back than everyone else." },
          { who: "Sage", line: "Is that what you do? Stand back?" },
          { who: "Princess", line: "It's more than what I do — it's how I've always been. I keep to the distance. Further back than the rest of them, where the view's clear and nothing can rush me. That's how my arrows never miss their mark. I've been hitting what I aim at from the far end of the field since before half of them could hold a sword." },
          { n: "There's an edge on that last word. You clock it before she smooths it over." },
          { choice: "Sage pulls the thread, or leaves it.", options: [
            { label: "\"Since before them. But not lately?\"", tone: "gentle", reply: [
              { who: "Princess", expr: "Sharp & Teasing", line: "*(the poise thins, just for a line)* Lately they brought in a hooded boy whose arrows fly straight through everything in their path — one shot, a whole row of them down at once. Very theatrical. *(a thin pause)* And suddenly nobody remembers the one who's been hitting what she aims at, dead straight, for years." },
            ] },
            { label: "\"Sounds lonely, all the way back there.\"", tone: "kind", reply: [
              { who: "Princess", expr: "Sharp & Teasing", line: "*(a cool, deflecting smile)* Lonely. *(she turns the word over, then sets it back down)* Careful, keeper. People who stand this close to me have a habit of catching fire. I'd hate for you to be the next one." },
            ] },
            { label: "Let it go. Pour, and listen.", tone: "silent", reply: [
              { who: "Princess", line: "*(she notices the restraint; something eases, barely)* …You didn't pry. Most people can't help themselves. *(a beat)* I'll remember that." },
            ] },
          ] },
          { n: "Whatever she gives you, it's the most she's let slip in a long while." },
          { unlock: { ledger: "Princess", note: "Sees everything from range. Upstaged by the Magic Archer — a wound she won't name. Lonely at the top and would rather burn than say so.", stage: 1 } },
        ],
      },

      /* ---- P.E.K.K.A — the one in the corner ---- */
      {
        type: "visit",
        who: "P.E.K.K.A",
        expr: "Calm",
        script: [
          { cue: "art", text: "pull focus to the far end of the bar. P.E.K.K.A — Calm. She's been on the corner stool the whole scene. You genuinely didn't notice." },
          { who: "Sage", line: "…Oh. I'm sorry. I didn't see you sitting there." },
          { who: "P.E.K.K.A", line: "*(slow, deep, no offence taken)* No, it's alright. People don't usually notice me. It's better that way, most of the time." },
          { cue: "sfx", text: "a soft tik-tik at the glass. ART: a small moth, or a butterfly, drawn out of the dark to the purple glow of the taps at the window." },
          { who: "P.E.K.K.A", expr: "Shy", line: "…Butterfly." },
          { who: "Sage", line: "You like them?" },
          { who: "P.E.K.K.A", line: "They're the only thing that doesn't run from me. *(a long pause)* Everyone else in the kingdom takes one look and decides what I am — a monster, a thing to be feared, something that's only here to break them. A butterfly just… lands. Doesn't ask. Doesn't judge." },
          { choice: "What does Sage do?", options: [
            { label: "Leave the window open a crack, so it stays.", tone: "wordless" },
            { label: "\"What do they decide you are?\"", tone: "gentle", reply: [
              { who: "P.E.K.K.A", line: "*(simply, no self-pity)* A weapon. That's the word. They'll send me out at dawn against some mountain of a thing everyone's frightened of, and the only question anyone's asking is which of us breaks the other first. Nobody thinks to ask whether I want to." },
              { who: "Sage", line: "Do you?" },
              { who: "P.E.K.K.A", line: "No. *(quieter)* My little one wanted to come and watch. I said no. I don't… I don't want them in the crowd, seeing the face everyone else sees." },
              { n: "She lets that sit. It's the most she's said to anyone in a while." },
            ] },
            { label: "\"What'll you have? On me.\"", tone: "open" },
          ] },
          { who: "Sage", line: "Let me get you something. What's good, for a night like this?" },
          { who: "P.E.K.K.A", line: "Something warm. And gentle — no spark in it, please. I've had enough sharp things pointed at me for one lifetime." },
          { brew: { base: "Elixir", mix: ["Heal"], recipe: "The Gentle One",
                    /* wrong-pour line — approved 07-07 (GDD §7: hints the right cup, in voice; the Zap flinch below still takes priority) */
                    wrong: "…it is a nice cup, but it is not mine. Warm, please. Gentle.",
                    nudge: "Something warm. And gentle — no spark in it, please. I've had enough sharp things pointed at me for one lifetime.",
                    orderShort: "Something warm. And gentle — no spark in it, please…",
                    wrongIf: [{ has: "Zap", n: "P.E.K.K.A flinches, the helmet dipping. A small, wrong beat. Sage can pour it again." }] } },
          { cue: "art", text: "she cups it in both gauntlets, careful, like it might break." },
          { who: "P.E.K.K.A", line: "*(after a moment)* …Thank you. For not making it loud." },
          { cue: "sfx", text: "faint — a soft, tinny music, from somewhere inside the armour. She doesn't seem to notice it's playing." },
          { who: "Sage", line: "Is that… music?" },
          { who: "P.E.K.K.A", line: "*(a beat; if she could be caught blushing, this is it)* Oh. That's just — I keep a little something in here. For the quiet marches. *(the smallest warmth)* Don't tell the others. They'd never let me hear the end of it." },
          { unlock: { recipe: "The Gentle One" } },
          { unlock: { ledger: "P.E.K.K.A", note: "Gentle. Hates being feared. A mother. Loves butterflies — and keeps music where her heart would be.", stage: 1 } },
        ],
      },

      /* ---- The Knight — looking backwards ---- */
      {
        type: "visit",
        who: "Knight",
        expr: "Weary & Wistful",
        script: [
          { cue: "art", text: "the door. KNIGHT — Weary & Wistful. He's seen the draw. It's on him tonight." },
          { who: "Knight", line: "Evening, keeper. *(he doesn't take his usual stool at the middle of the bar; he settles off to one end instead)* Don't fuss the usual tonight. Give me an Elixir, and a splash of Mirror in it. I feel like looking backwards for a bit." },
          { brew: { base: "Elixir", mix: ["Mirror"], recipe: "The Long Look",
                    /* wrong-pour line — approved 07-07 (GDD §7: hints the right cup, in voice) */
                    wrong: "Not that one tonight. Tonight it's the one with Mirror in it — the long look, not my usual.",
                    nudge: "Don't fuss the usual tonight. Give me an Elixir, and a splash of Mirror in it. I feel like looking backwards for a bit.",
                    orderShort: "An Elixir, and a splash of Mirror — not the usual tonight…" } },
          { cue: "art", text: "the surface of the drink shimmers, doubling the lamplight." },
          { who: "Knight", line: "There was a time this all meant something, you know. The clash of it. You'd win, and it *mattered*, and you'd feel it for a week. *(he turns the shimmering drink in his hand)* Now I've a bout at dawn like every other dawn, and I can't for the life of me remember what I'm meant to be fighting *for*." },
          { who: "Sage", line: "You could just… not. Can't you?" },
          { who: "Knight", line: "*(a tired, fond look)* That's the silliest question you've asked yet. *(gentler)* Ask me again tomorrow night. I might have a better answer by then." },
          { n: "He doesn't stay long. He's saving something for the morning — you can see it." },
          { unlock: { recipe: "The Long Look" } },
          { unlock: { ledger: "Knight", note: "Fights at dawn. Can't remember what for. Saving himself for something.", stage: 2 } },
        ],
      },

      /* ---- The Wizard — no applause tonight ---- */
      {
        type: "visit",
        who: "Wizard",
        expr: "Deflated",
        script: [
          { cue: "art", text: "the door bangs, but softer than usual. WIZARD — Deflated. The cloak's still grand. He isn't." },
          { who: "Wizard", line: "Keeper." },
          { who: "Sage", line: "The most awesome man ever to set foot in this bar. Twice, now." },
          { who: "Wizard", line: "*(a wave of the hand that doesn't have its usual flourish)* Don't. Not tonight. *(he sits heavily)* You'll have seen the cards they paint of the great ones — collected, traded, pinned up in every child's bedroom in the realm. The Electro one's got his. The Ice one's got his. Every wizard in the realm, up on a card. *(a breath)* Go on — find mine in amongst that lot. You'll be looking a long time." },
          { n: "He's not performing. That's the strange part. There's no trick coming." },
          { who: "Wizard", line: "Forty years I've been throwing fire in that arena. I was doing it before “Electro” or “Ice” were even words — the pair of them are just me in a fancier coat. And there's a painted card for every last copycat but me." },
          { choice: "How does Sage answer?", options: [
            { label: "\"Then let's put you back together. Give us the showstopper — double Rage, a Zap.\"", tone: "puff", reply: [
              { who: "Wizard", expr: "Boastful Grin", line: "*(a flicker of the old light, grateful for the lifeline)* …Yes. Yes, alright. The showstopper. Let's remind the room who taught the rest of them to spark." },
              { brew: { base: "Elixir", mix: ["Rage", "Zap"], dose: 2, recipe: "The Showstopper",
                        nudge: "…Yes. Yes, alright. The showstopper. Let's remind the room who taught the rest of them to spark." } },
            ] },
            { label: "\"You don't need to be on the card. You're the one they all copied.\"", tone: "see", reply: [
              { who: "Wizard", line: "*(caught off guard; the grand voice drops to something bare)* The one they… copied. *(he turns that over like it's fragile)* Nobody's ever put it quite that way. *(quietly)* Say it again, would you. I want to be sure I heard it." },
              { brew: { any: [ { base: "Elixir", mix: ["Rage", "Zap"], dose: 2 }, { base: "Elixir", mix: ["Heal"], dose: 1 } ],
                        nudge: "*(he waits — the loud Showstopper, or the quiet Usual?)*" } },
            ] },
            { label: "\"Sit. I'll pour. You don't have to be anything in here.\"", tone: "room", reply: [
              { who: "Wizard", line: "*(the shoulders come down an inch)* No performance. No audience. *(a small, tired breath)* Do you know, that might be the only kind offer I've had all week." },
              { brew: { base: "Elixir", mix: ["Heal"], dose: 1, recipe: "The Usual",
                        nudge: "*(no performance, no audience — the quiet Usual)*" } },
            ] },
          ] },
          { who: "Wizard", expr: "Warm Smile", line: "*(whichever; a truer note under the grandeur now)* You're a better keeper than this place deserves. *(a beat)* Don't tell anyone I said anything sincere. It'll ruin me." },
          { unlock: { ledger: "Wizard", note: "Forty years of fire, and not one card to show for it. The boast is the bandage.", stage: 2 } },
        ],
      },

      /* ---- Close of Night ---- */
      {
        type: "visit",
        who: "Princess",
        expr: "Cool & Poised",
        script: [
          { n: "The bar empties. Princess is the last to rise — of course she is; she saw the night ending before it did." },
          { cue: "art", text: "the window full dark now, the sealed-border notice pale against the glass." },
          { who: "Princess", line: "*(at the door, not turning)* You know they mean it. The Crown. Come Championship night, this strip goes dark, and this little room with it. *(a pause)* Enjoy it while it's here, keeper. Nothing neutral lasts. That's the point of it." },
          { who: "Sage", line: "You'll come back, though. Right? After." },
          { who: "Princess", line: "*(the faintest hesitation — the first crack she hasn't smoothed)* …Ask me tomorrow." },
          { cue: "sfx", text: "the door. The wind. That one tap, still hissing." },
          { cue: "art", text: "Sage alone with the notice on the door. The taps glow. Fade." },
        ],
      },
    ],
  },
  {
    night: 3,
    title: "Last Call Before the Crown",
    /* Wizard's quote — deliberately NOT the Knight/consequential beat; no
       Championship outcome, no plot spoiler. FLAGGED for approval. */
    nightcap: { quote: { text: "It turns out the good stuff was the simplest drink all along.", who: "Wizard" } },
    beats: [

      /* ---- Interstitial — the decree lands ---- */
      { type: "herald" },

      /* ---- Cold open — whether to open at all ---- */
      {
        type: "scene",
        script: [
          { cue: "art", text: "the bar, dark. Stools up on the counter. The decree nailed to the door, pale in the candlelight. Sage stands with a hand on the light." },
          { cue: "sfx", text: "no taps humming yet. Just the wind, and the far-off sound of the arena being made ready for the morning." },
          { who: "Sage", line: "*(alone, reading the decree one more time)* “Neutral no longer.” *(a long beat)* We'll see about that." },
          { cue: "art", text: "Sage lights the taps. The purple glow comes up, warm against the cold window. One by one, the stools come down off the counter." },
          { who: "Sage", line: "If anyone's mad enough to come tonight… I'd hate for them to find it dark." },
        ],
      },

      /* ---- The Hog Rider — the quiet one ---- */
      {
        type: "visit",
        who: "Hog Rider",
        expr: "Quiet & Wistful",
        script: [
          { cue: "sfx", text: "the door. No crash tonight. It opens almost carefully." },
          { cue: "art", text: "HOG RIDER — Quiet & Wistful. He comes in without the entrance. It's stranger than any noise he's ever made." },
          { who: "Hog Rider", line: "…Still open, then." },
          { who: "Sage", line: "You're the first one brave enough to break a royal decree tonight. I'm honoured." },
          { who: "Hog Rider", line: "*(a small laugh, nothing like his usual)* Brave. *(he sits, heavy)* Nah. I just didn't fancy being home. It's very quiet at home." },
          { n: "He's not filling the silence tonight. That's the thing you notice. He's just letting it be there." },
          { who: "Sage", line: "No “HOG RIDER” coming through the door?" },
          { who: "Hog Rider", line: "Not tonight. *(he rubs the back of his neck)* You want to know a secret, keeper? All that noise. The shouting, the whole song and dance. It's not for me. It's so nobody looks too close and notices it's really just me and the Hog out here. And this week, he's not even speaking to me." },
          { choice: "What does Sage say?", options: [
            { label: "\"Well, there's the two of us now. Me and you.\"", tone: "welcome" },
            { label: "\"The Hog'll come round. He always does.\"", tone: "gentle" },
            { label: "\"You don't have to be loud in here. Never did.\"", tone: "room" },
          ] },
          { who: "Hog Rider", line: "*(whichever — something in him settles)* …Yeah. *(a breath)* Yeah, alright. Do us a favour — none of the strong stuff tonight. No Dark Elixir, no Rage. I don't need winding up. Just… something easy." },
          { brew: { base: "Elixir", mix: ["Heal"], recipe: "The Easy One",
                    /* wrong-pour line — approved 07-07 (GDD §7: hints the right cup, in voice) */
                    wrong: "Nah — light one tonight, remember? The easy one, just the normal Elixir. …Don't make it weird.",
                    nudge: "Do us a favour — none of the strong stuff tonight. No Dark Elixir, no Rage. I don't need winding up. Just… something easy.",
                    orderShort: "None of the strong stuff tonight — no Dark Elixir, no Rage. Just… something easy." } },
          { cue: "art", text: "he holds it in both hands, no toast, no showing off." },
          { who: "Hog Rider", expr: "Warm Grin", line: "*(after a sip — and then the real one)* You know what? This'll do. This'll do just fine. *(a proper smile, small and true)* Might bring the Hog next time. If he apologises." },
          { unlock: { recipe: "The Easy One" } },
          { unlock: { ledger: "Hog Rider", note: "The noise is a shield. Wants, more than anything, somewhere he doesn't have to be loud.", stage: 3 } },
        ],
      },

      /* ---- P.E.K.K.A arrives — two regulars, side by side (Layout 5) ---- */
      {
        type: "duo",
        cast: [ { who: "P.E.K.K.A", expr: "Calm" }, { who: "Hog Rider", expr: "Warm Grin" } ],
        script: [
          { cue: "art", text: "the door. P.E.K.K.A — Calm, ducking under the frame. She takes the stool beside the Hog Rider, careful not to loom." },
          { who: "P.E.K.K.A", line: "Room for one more?" },
          { who: "Hog Rider", line: "*(shifting up, warm)* For you? Always. You take up less space than anyone I know, and you're the biggest one here." },
          { n: "That lands softly on her. It's exactly the kind of thing she never hears." },
        ],
      },

      /* ---- P.E.K.K.A — one more gentle night ---- */
      {
        type: "visit",
        who: "P.E.K.K.A",
        expr: "Calm",
        script: [
          { who: "Sage", line: "Big morning for you." },
          { who: "P.E.K.K.A", line: "Mm. *(a pause)* I keep thinking about it. Not the fight. What comes before — the walk out, the whole crowd going quiet, everyone deciding what I am before I've done a single thing." },
          { cue: "sfx", text: "soft — that tinny music from inside her armour, playing on its own again." },
          { who: "Sage", line: "You could turn that off, you know. The music. If it gives you away." },
          { who: "P.E.K.K.A", line: "No. *(gently, certain)* No, I think I'll leave it on. It's the one part of me that was never frightening. *(a beat)* My little one picked the tune. Before I said they couldn't come and watch." },
          { choice: "Sage brews for her.", options: [
            { label: "\"Then let's make sure the last drink before dawn is a kind one.\"", tone: "warm" },
            { label: "\"The gentle one? No spark.\"", tone: "remembering" },
            { label: "Leave the window open. The butterflies are drawn to the glow.", tone: "wordless" },
          ] },
          { brew: { base: "Elixir", mix: ["Heal"],
                    nudge: "Something warm. And gentle — no spark in it, please.",
                    wrongIf: [{ has: "Zap", n: "P.E.K.K.A flinches, the helmet dipping. A small, wrong beat. Sage can pour it again." }] } },
          { cue: "sfx", text: "tik-tik at the glass. ART: a butterfly at the window again, drawn to the light." },
          { who: "P.E.K.K.A", line: "*(the helmet turning to it, that stillness)* …There you are. *(the softest thing)* Butterfly." },
          { who: "P.E.K.K.A", expr: "Happy", line: "Thank you, keeper. For seeing the… *(she searches for it)* …for seeing the person, and not the armour." },
          { unlock: { ledger: "P.E.K.K.A", note: "Seen at last. A mother, a music-lover, the gentlest soul in the realm — under the most frightening shell in it.", stage: 3 } },
        ],
      },

      /* ---- The Wizard — nothing to prove ---- */
      {
        type: "visit",
        who: "Wizard",
        expr: "Boastful Grin",
        script: [
          { cue: "art", text: "the door. WIZARD — Boastful Grin on the way in, out of pure habit — then he sees the near-empty room and it fades to something quieter." },
          { who: "Wizard", line: "Keeper! The most awesome man ever to— *(he stops himself; the room's too quiet, too honest tonight for the bit)* …oh, never mind. It's not really the night for it, is it." },
          { who: "Sage", line: "I'm here. Say it to me." },
          { who: "Wizard", line: "*(a real, tired smile)* You've heard it twice already. *(he sits)* Do you know, I've decided something, on the walk over. Tomorrow every wizard with a card to his name will be out there setting the sky on fire, and I shan't be among them. *(a breath)* And for one night, I find I don't mind it." },
          { who: "Sage", line: "No showstopper tonight?" },
          { who: "Wizard", line: "No. No tricks. *(quietly)* Make me whatever you'd make him. The Knight. The plain, steady one that nobody writes songs about. *(a beat)* I think I'd like to know what that feels like — being simple, for an evening." },
          { brew: { base: "Elixir", mix: ["Heal"], dose: 1, recipe: "The Usual",
                    nudge: "Make me whatever you'd make him. The Knight. The plain, steady one that nobody writes songs about.",
                    orderShort: "Make me whatever you'd make the Knight — the plain, steady one…" } },
          { who: "Wizard", expr: "Warm Smile", line: "…Oh. *(genuine surprise)* That's rather nice, isn't it. Quiet. *(he looks at Sage)* Forty years chasing the loud version of everything. And it turns out the good stuff was the simplest drink all along. *(then, mock-stern)* If you quote me on that, I'll deny every word." },
          { unlock: { ledger: "Wizard", note: "Doesn't need the card tonight. Learned the plain cup was the good one all along.", stage: 3 } },
        ],
      },

      /* ---- The Princess — off duty, at last ---- */
      {
        type: "visit",
        who: "Princess",
        expr: "Cool & Poised",
        script: [
          { cue: "art", text: "the door. PRINCESS — Poised, though there's no room to perform for. She takes the far stool, as ever." },
          { who: "Princess", line: "Well. Look at this. The condemned little bar, full to the rafters. *(four people; she says it fondly)*" },
          { who: "Sage", line: "You came back." },
          { who: "Princess", line: "I said ask me tomorrow. *(a thin pause)* It's tomorrow, in about six hours. So. Here I am, ahead of schedule." },
          { n: "She doesn't reach for her usual sharpness. She's too tired, or the night's too late, or she's simply decided to stop, for once." },
          { who: "Princess", line: "Do you know what the tower's like, keeper? Best view in the kingdom. You can see everything from up there. *(a beat)* Everything and everyone, all of it, from very far away. *(quieter)* I've spent so long keeping my distance, I forgot it's the same thing as being alone." },
          { who: "Sage", line: "And down here?" },
          { who: "Princess", expr: "Guard-Down Warmth", line: "Down here nobody's at the right range for me to see properly. *(the smallest, realest smile)* It's terrifying. I think I like it." },
          { choice: "Sage pours.", options: [
            { label: "\"Then come closer. I'll risk catching fire.\"", tone: "warm" },
            { label: "\"No Poison tonight?\"", tone: "gentle" },
            { label: "\"Stay as long as you like. The Crown can wait.\"", tone: "defiant" },
          ] },
          { who: "Princess", line: "No Poison tonight. *(she surprises herself saying it)* Something kind, for a change. I won't tell anyone if you don't." },
          { brew: { base: "Elixir", mix: ["Heal"],
                    /* wrong-pour line — approved 07-07 (GDD §7: hints the right cup, in voice) */
                    wrong: "Tonight I'll take the kind one, no Poison. Just this once — don't write it down.",
                    nudge: "No Poison tonight. Something kind, for a change. I won't tell anyone if you don't.",
                    orderShort: "No Poison tonight. Something kind, for a change…" } },
          { who: "Princess", line: "*(after a sip; she doesn't make a joke of it)* …That's the one, isn't it. That's the drink you give someone you're not trying to keep at arm's length. *(she meets Sage's eye)* Thank you." },
          { unlock: { ledger: "Princess", note: "Lonely at the top and finally said so. Put the Poison down for one night.", stage: 3 } },
        ],
      },

      /* ---- The Knight — the last cup (THE consequential brew, GDD §8) ---- */
      {
        type: "visit",
        who: "Knight",
        expr: "Warm & Content",
        script: [
          { cue: "art", text: "the door, last of all. KNIGHT — Warm & Content, though there's dawn in his eyes. He takes the middle stool. His stool." },
          { who: "Knight", line: "Evening, keeper. *(he looks round the full little room — Hog, P.E.K.K.A, the Wizard, the Princess)* …Well, would you look at that. Every last one of you, on the one night it's forbidden. *(warm)* Good. Very good." },
          { who: "Sage", line: "Big morning, Knight." },
          { who: "Knight", line: "Aye. *(and here, for the first time, he says the true thing)* And I'll tell you what I've not told anyone. I'd like to win it. Not for the Crown, not for the colours. For me. One good morning, to remember why I ever picked up the sword. *(a breath)* Soft, at my age." },
          { who: "Sage", line: "Not soft. Just human. What'll steady you?" },
          { who: "Knight", line: "You know the answer to that better than anyone by now. Pour me the right one, keeper. Send me into the morning the way I ought to go." },
          { brew: { consequence: true, right: { base: "Elixir", mix: ["Heal"], dose: 1 },
                    /* §7 (round-7 fix): this gate USED to hide its Order Strip — with no
                       nudge, orderText() was "" → order-empty → display:none. Tessa's rule:
                       the strip stays for every gate, most of all this one. His own spoken
                       request is the reminder (verbatim, from his line just above) — it names
                       no recipe, so "know it by heart" holds and no §8 outcome leaks. The ✓ is
                       still suppressed (Brew.setOrder(consequence?…:…), untouched). Wording is
                       Tessa's to re-trim. */
                    nudge: "You know the answer to that better than anyone by now. Pour me the right one, keeper. Send me into the morning the way I ought to go.",
                    orderShort: "Pour me the right one, keeper — the way I ought to go…",
                    onRight: [
                      { cue: "art", text: "he drinks slow, the shoulders drop, the eyes clear." },
                      { who: "Knight", line: "…There it is. That's the one. *(settled, sure)* Steady hands, clear head. That's how you walk into a Championship. Thank you, keeper." },
                    ],
                    onWrong: [
                      { cue: "art", text: "he winces, blinks, too wired." },
                      { who: "Knight", line: "Oof. *(shakes his head)* That's got a kick, I'll give it that. *(rattled, over-bright)* Maybe too much of one. I'll be buzzing at the gate now. Well — no undoing it." },
                    ] } },
        ],
      },

      /* ---- The rally, and the close (Layout 3 — the whole room) ---- */
      {
        type: "group",
        cast: [
          { who: "Hog Rider", expr: "Warm Grin" },
          { who: "P.E.K.K.A", expr: "Happy" },
          { who: "Knight", expr: "Hearty Laugh" },
          { who: "Wizard", expr: "Warm Smile" },
          { who: "Princess", expr: "Guard-Down Warmth" },
        ],
        script: [
          { cue: "art", text: "KNIGHT — Hearty Laugh. He stands, cup in hand, and turns to the room." },
          { who: "Knight", line: "Right, you lot. Listen. *(the room turns)* The Crown says this place is shut. Says the ground under our feet has to pick a side by morning. *(he raises the cup)* And yet here we all are. Blue and Red and neither, drinking side by side on the one night we're forbidden to." },
          { who: "Princess", line: "Careful, Knight. That's nearly a speech." },
          { who: "Knight", line: "*(grinning)* Let me have the one. *(to the room)* This ground's neutral because *we* say it is. Not the Crown. Us. And it'll be neutral again tomorrow night, and the night after, as long as somebody's stubborn enough to keep the taps lit. *(to Sage)* And somebody is." },
          { cue: "sfx", text: "a low knock of tankards. A proper laugh from the Hog. Even the Princess lifts hers." },
          { who: "Sage", line: "Same time tomorrow, then?" },
          { who: "Knight", line: "Same time tomorrow, keeper. Decree or no decree." },
          { cue: "art", text: "the full little bar, warm against the cold dark window, the arena waiting for a dawn none of them are thinking about yet. Hold. Fade." },
          { unlock: { ledger: "Knight", note: "", stage: 3 } },
        ],
      },

      /* ---- The morning after (round 22): Ed. L as an explicit epilogue beat.
         Before Edition 2 this screen was the hard-wired end of the game; with
         Night 4 in the data it plays here, then Continue leads on to the
         night-end screen and "Begin Night 4". Old completed saves sit just
         before this beat, so their Continue replays the epilogue once and
         flows into Night 4 — the live-ops "your save carries on" moment. ---- */
      { type: "epilogue", ed: 4 },
    ],
  },

  /* ================================================================== *
   *  NIGHT 4 — "The Long Road" (Edition 2, the Away Night, GDD §16(b)) *
   *  Transcribed VERBATIM from `../Elixir Hour - Night 4 Script (The   *
   *  Long Road).md` (LOCKED for wiring, Tessa's round 4, 11-07).       *
   *  Season 85 "Honor & Exile" — the festival pop-up. Guest: Ronin.    *
   * ================================================================== */
  {
    night: 4,
    title: "The Long Road",
    sceneSet: "away",
    /* Night Cap quote — spoiler-safe (his arrival order, NOT the consequential
       brew). FLAGGED for Tessa's approval, like the first three. */
    nightcap: { quote: { text: "Water, if you please.", who: "Ronin" } },
    beats: [

      /* ---- Interstitial — Ed. LI opens the Night (explicit key 5) ---- */
      { type: "herald", ed: 5 },

      /* ---- Cold open — unfamiliar ground ---- */
      {
        type: "scene",
        script: [
          { cue: "art", text: "the away bar, empty. Lanterns strung on the timber frame, the arena stands far off, blossom high in the dark." },
          { cue: "sfx", text: "festival crowd, distant — a bigger, stranger roar than home. Boards creak." },
          { who: "Sage", line: "*(to no one, pressing a palm flat on the counter)* Right. Same counter, but it is a four days' cart ride from where it usually lives. If anything's going to break, I'd rather know now." },
          { cue: "sfx", text: "a tap hisses — the same wet complaint as the first night, briefer." },
          { who: "Sage", line: "Oh, you as well? We're travelling. Behave." },
          { cue: "sfx", text: "the hiss settles. Somewhere out in the dark, a horn, and a crowd losing its mind about something." },
          { who: "Sage", line: "Ah... festival crowds. Either they've seen the finest bout of their lives out there, or someone's dropped a tray of candied apples." },
          { n: "A blossom petal drifts down and lands, dead centre, in an empty tankard." },
          { who: "Sage", line: "*(fishing it out, not entirely displeased)* …We didn't get that at home." },
        ],
      },

      /* ---- The Hog Rider — festival weather ---- */
      {
        type: "visit",
        who: "Hog Rider",
        expr: "Big Laugh",
        script: [
          { cue: "sfx", text: "no crash this time — the crash is already IN the crowd noise, getting closer." },
          { who: "Hog Rider", line: "HOG RIIIDERRR — *(arms out, spinning once, taking in the lanterns)* — they brought the BAR! You beautiful people, you brought the actual BAR! I said to the Hog, I said, if that's not our counter down by the gate then I'm a goblin's uncle, and it IS! It's the counter!" },
          { who: "Sage", line: "We do travel, apparently. It's a new thing we're trying." },
          { who: "Hog Rider", line: "*(slamming onto a stool like it owes him a good evening)* Best thing this festival's done all week, and I've seen a man juggle six hammers. Go on then — the usual road-trip order. Strong stuff, don't be shy with it, Rage in there for the occasion." },
          { brew: { base: "Dark Elixir", mix: ["Rage"], recipe: "The Strong Stuff",
                    wrong: "HA — nah, this one's had a gentle upbringing! Where's the DARK stuff, keeper? And the Rage! A festival drink needs a bit of personality to it!",
                    nudge: "Go on then — the usual road-trip order. Strong stuff, don't be shy with it, Rage in there for the occasion.",
                    orderShort: "The strong stuff, don't be shy with it — Rage in there for the occasion…" } },
          { cue: "art", text: "he takes it one-handed, already mid-story." },
          { who: "Hog Rider", line: "*(after a gulp that empties half of it)* HA! There it is. Tastes like home and a holiday at the same time, that does. *(leaning in, suddenly confidential, which for him means slightly quieter than a landslide)* Here — you heard about the fella at the gate? He watched two bouts today, and cheered for nobody. NOBODY. And then at the end, right, he bows. *(a pause for effect)* To the LOSER." },
          { who: "Sage", line: "To the loser?" },
          { who: "Hog Rider", line: "To the loser! Deepest bow you ever saw! Winner's stood there doing the arms-up thing, crowd going mad, and this fella's bowing to the one face-down in the dust. *(draining the tankard, philosophical)* Any man that calm wants feeding, you ask me. Or watching. Or maybe both. *(up, already leaving, louder somehow)* Right — the Hog's found the candied-apple stall and we are still NOT speaking, so I'd better go and not speak to him in person. Keep my stool!" },
        ],
      },

      /* ---- Ronin arrives — water (the third tap, GDD v1.6) ---- */
      {
        type: "visit",
        who: "Ronin",
        expr: "Arrival",
        script: [
          { cue: "sfx", text: "nothing. The door-flap moves and the noise of the festival seems to step back a pace." },
          { cue: "art", text: "RONIN — Arrival. Arms folded, hat low, at the end of the counter. He takes the end stool, where the light runs out." },
          { n: "He sits the way other people stand guard." },
          { who: "Ronin", line: "Keeper. Water, if you please." },
          { who: "Sage", line: "Water it is." },
          { brew: { base: "Water", mix: [], recipe: "Water",
                    /* orderShort/nudge here are the MECHANICAL hint, not Ronin's words:
                       water is a brand-new third tap, so the strip teaches how to make it
                       (his bubble already says the in-fiction line). */
                    wrong: "That is generous, keeper, but it is not water. Water only, if you please — nothing in it, straight from the tap.",
                    nudge: "Water — the new third tap, beside Elixir and Dark Elixir. Nothing added, any amount.",
                    orderShort: "Water — the new third tap. Nothing added." } },
          { who: "Ronin", expr: "Guarded", line: "*(a small, precise nod)* Thank you." },
          { unlock: { recipe: "Water" } },
          { unlock: { song: "East of the Mountains" } },
          { n: "He drinks the water the way other people drink the strong stuff — like it's owed the same respect. Then he sets two coins on the wood and squares them with one finger until the edges agree." },
          { who: "Sage", line: "The water's not really a two-coin pour, if I'm honest." },
          { who: "Ronin", line: "The seat is. You are letting me hold a stool a paying drinker could sit on. The difference is accounted for." },
          { choice: "How does Sage take that?", options: [
            { label: "\"The seat comes free with the water. House rule.\"", tone: "warm" },
            { label: "Take one coin, slide one back.", tone: "silent" },
            { label: "\"You've clearly never met our Hog Rider. He runs a tab.\"", tone: "dry" },
          ] },
          { who: "Ronin", line: "*(whichever way it goes, the coins stay where he put them)* You keep an honest counter. I will not unbalance it." },
          { n: "Nobody at the bar makes it a thing. You watch him notice that nobody makes it a thing." },
          { unlock: { ledger: "Ronin", note: "Drinks water. Pays for more than he takes." } },
        ],
      },

      /* ---- The Wizard — a bigger audience (order + pour) ---- */
      {
        type: "visit",
        who: "Wizard",
        expr: "Boastful Grin",
        script: [
          { cue: "art", text: "WIZARD — Boastful Grin. He enters walking backwards, still waving to somebody out in the dark." },
          { who: "Wizard", line: "Keeper! Keeper, you will not BELIEVE the evening I am having. The festival crowds — now there is an audience. Fresh eyes, keeper! Not one of them has spent years being wrong about me. I did the spark cascade by the west gate and they applauded. Actual applause, from actual hands!" },
          { who: "Sage", line: "Go on then, what's the occasion order?" },
          { who: "Wizard", line: "The Showstopper, obviously — tonight of all nights. Elixir, double Rage, and the Zap to finish. And make the Zap count, keeper; I have a reputation now. As of roughly an hour ago." },
          { brew: { base: "Elixir", mix: ["Rage", "Zap"], dose: 2, recipe: "The Showstopper",
                    wrong: "No spark, keeper, please. And add the Rage — two of them, I said — plus the Zap at the end. The Zap is the finale. One does not skip the finale.",
                    nudge: "The Showstopper, obviously — tonight of all nights. Elixir, double Rage, and the Zap to finish. And make the Zap count, keeper; I have a reputation now.",
                    orderShort: "The Showstopper — Elixir, double Rage, and the Zap to finish…" } },
          { cue: "art", text: "he lifts it high — and catches sight of the figure at the end of the counter." },
          { who: "Wizard", line: "*(voice dropping to what he believes is a whisper)* Keeper. Keeper, that's him. The one from the gate. *(straightening his robe, grandeur reloading)* Watch this." },
        ],
      },

      /* ---- The trick and the nod (baked away duo — group route) ---- */
      {
        type: "group",
        image: "Wizard + Ronin - The Nod (away duo)",
        heads: { "Wizard": { x: 269, topY: 189 }, "Ronin": { x: 621, topY: 160 } },
        cast: [ { who: "Wizard", expr: "Boastful Grin" }, { who: "Ronin", expr: "Guarded" } ],
        script: [
          { n: "He carries the drink three stools down, holds it up to the lantern light, and does the spark trick — the good version, the one that half-works. The little light fizzles out with its small, sad pop." },
          { n: "A pause. The stranger looks at the burnt-out spark. Then at the Wizard. And gives him one slow, grave nod." },
        ],
      },

      /* ---- The Wizard — luminous (choice) ---- */
      {
        type: "visit",
        who: "Wizard",
        expr: "Boastful Grin",
        script: [
          { who: "Wizard", line: "*(returning, luminous, barely keeping his voice down)* Did you see that. He NODDED. Keeper, that man has seen the whole wide world and he nodded at MY— *(collecting himself, magnificently failing)* —well. He clearly knows craft when he sees it. I told you, some people simply don't need the roof brought down to recognise subtlety." },
          { choice: "How does Sage play it?", options: [
            { label: "\"He did nod. I saw the whole thing.\"", tone: "kind", reply: [
              { who: "Wizard", line: "*(under his breath, to his drink)* He nodded. The Electro Wizard can juggle his little lightning all he likes — HE'S never been nodded at." },
            ] },
            { label: "\"You should get that in writing.\"", tone: "tease", reply: [
              { who: "Wizard", line: "Laugh all you want, keeper. Tonight I have an audience, a Showstopper, and a nod from a mysterious swordsman. This is, and I say it with all humility, the finest evening of my career." },
            ] },
            { label: "\"What was the trick meant to do, exactly?\"", tone: "craft", reply: [
              { who: "Wizard", line: "*(and here he's suddenly precise, fluent, and actually good)* It's a timing thing, truthfully — the Zap wants to leave the drink the moment the Rage settles, and if you hold it back half a breath too long it dies early. Nobody's ever asked me that before, you know." },
            ] },
          ] },
        ],
      },

      /* ---- The Princess — a gap in the file ---- */
      {
        type: "visit",
        who: "Princess",
        expr: "Sharp & Teasing",
        script: [
          { cue: "art", text: "PRINCESS — Sharp & Teasing. She's simply there, on a stool she wasn't on a moment ago, the way she does." },
          { who: "Princess", line: "Keeper. The usual bitter one, when you have a moment. *(not looking at the end of the counter, which is its own way of looking)* I see the festival's brought you a collector's item." },
          { who: "Sage", line: "He's mostly brought himself, as far as I can tell." },
          { who: "Princess", line: "Mm. That's rather the point of him." },
          { brew: { base: "Elixir", mix: ["Poison"], recipe: "The Bittersweet",
                    wrong: "Sweet, but disappointing. I did say the bitter one, keeper — it wants the Poison. That is the whole point of the drink.",
                    nudge: "Keeper. The usual bitter one, when you have a moment.",
                    orderShort: "The usual bitter one, when you have a moment…" } },
          { cue: "art", text: "she turns the tankard once, tasting it with her eyes first." },
          { who: "Princess", line: "So. What everyone knows, which is to say what I told them: he walks in off the long road, refuses every challenge anyone puts to him, and if you do make him fight — and some fool always does — whatever you give him comes straight back at you, with interest. The arena masters have ruled that a man who will not strike first, cannot be made to. Which I could have told them for free." },
          { who: "Sage", line: "And what doesn't everyone know?" },
          { who: "Princess", line: "*(and here it is — the smallest pause, a flick of ash off her voice)* …That is an excellent question, keeper, and I find I don't love the answer, because the answer is: nearly everything. Where he's from. What he did. Which kingdom threw him out, or whether he threw them out first. There are usually threads, you understand. People trail threads the way the Hog trails mud. This one's been on the road so long the road's all there is." },
          { who: "Sage", line: "That bothers you." },
          { who: "Princess", line: "It fascinates me, which in my case is worse. *(she takes a sip; showing the sharp little smile again)* Warm feelings, keeper — careful with those. People who feel warm around me usually catch on fire, remember?" },
          { choice: "The stranger's three stools away. Does Sage…", options: [
            { label: "Ask him nothing. A man can drink his water in peace.", tone: "silent", reply: [
              { n: "He drinks his water in peace. She notices that too. She notices everything." },
            ] },
            { label: "\"You could just ask him, you know.\"", tone: "gentle" },
            { label: "Ask Ronin, lightly, where the road started.", tone: "press", reply: [
              { who: "Ronin", line: "East of here." },
              { n: "Which is every direction at once, depending where you stand. The Princess raises her tankard a fraction — to the first person who's got even that much out of him." },
            ] },
          ] },
          { who: "Princess", line: "*(examining a nail, transparently delighted)* Oh — and you will have heard about the archer with the vanishing trick. The masters have shortened his little disappearances; apparently catching him is possible now. *(a sip, savoured longer than the drink needs)* I had nothing to do with it, and I have never enjoyed anything more." },
          { who: "Princess", line: "*(rising, the tankard left exactly half-finished)* Do enjoy Monday, keeper. The masters shuffle the carry-lists again come morning, and I already know three fighters who won't like what they read. *(the smile, over her shoulder)* I'd tell you which three, but where would the fun be." },
        ],
      },

      /* ---- Ronin — the middle of the road ---- */
      {
        type: "visit",
        who: "Ronin",
        expr: "Listening",
        script: [
          { cue: "art", text: "RONIN — Listening. The hat's still low, but he's turned a few degrees toward the room. For him that's practically joining the party." },
          { who: "Ronin", line: "Keeper. A question, if the counter permits questions." },
          { who: "Sage", line: "The counter runs on them." },
          { who: "Ronin", line: "You have poured for a soldier of one kingdom, a wizard of another, an archer who misses nothing, and myself. I hold no banner. No lord vouches for me, and no one here can say what I did before I walked in. *(the cup turns once between his hands)* Why does your counter take a man with no side?" },
          { choice: "Sage's answer — the real one.", options: [
            { label: "\"I don't pour for sides. I pour for whoever sits down.\"", tone: "house" },
            { label: "\"Everyone at this counter left their banner at the door. You just arrived without one to take with you when you leave.\"", tone: "longer" },
            { label: "\"Because you said please.\"", tone: "dry" },
          ] },
          { who: "Ronin", line: "*(a silence with actual weight in it — then, softly)* I have been asked to leave better rooms than this one, and also worse ones. It is generally the first thing a room decides about me. *(he looks at the water, and almost — almost — smiles)* Yours has not voted." },
          { who: "Sage", line: "We're not really the voting kind." },
          { who: "Ronin", line: "No. I am beginning to see that. *(a pause; then, with the air of a man crossing a small bridge)* The others. What is it that they drink?" },
          { who: "Sage", line: "Depends who's asking and what kind of night they've had. Steady ones, loud ones, bitter ones. One recipe with an actual spark in it. Mostly it depends what the road's been like on the way in." },
          { who: "Ronin", line: "*(so softly you can hardly hear him over the crackling of the lanterns)* Mine has been long." },
          { n: "He goes back to his water. But he leaves the words on the counter, where you can both see them." },
          { unlock: { ledger: "Ronin", note: "Asked why he's allowed in. Nobody here has ever asked me.", stage: 2 } },
        ],
      },

      /* ---- P.E.K.K.A — the slow one (order + pour) ---- */
      {
        type: "visit",
        who: "P.E.K.K.A",
        expr: "Shy",
        script: [
          { n: "Rule number one of this bar: nobody sits next to P.E.K.K.A. And a newly established rule number two, nobody sits next to the wanderer. The two rules are cancelling each other out now, and the bar holds its breath — she has crossed the whole pop-up to take the stool beside him." },
          { who: "P.E.K.K.A", line: "*(to Sage, the deep voice at its softest)* The slow one. Please." },
          { brew: { base: "Elixir", mix: ["Heal"], recipe: "The Gentle One",
                    wrong: "…This one is loud. *(a pause)* The slow one is the Elixir with the Heal in it. Poured carefully. Please.",
                    nudge: "The slow one. Please.",
                    orderShort: "The slow one, please…",
                    wrongIf: [{ has: "Zap", n: "P.E.K.K.A flinches, the helmet dipping. A small, wrong beat. Sage can pour it again." }] } },
          { cue: "art", text: "the tankard disappears into two enormous gauntlets, held like it might break." },
        ],
      },

      /* ---- Up close (baked away duo — group route) ---- */
      {
        type: "group",
        image: "P.E.K.K.A + Ronin - Up Close (away duo)",
        heads: { "P.E.K.K.A": { x: 264, topY: 199 }, "Ronin": { x: 621, topY: 160 } },
        cast: [ { who: "P.E.K.K.A", expr: "Shy" }, { who: "Ronin", expr: "Guarded" } ],
        script: [
          { who: "P.E.K.K.A", line: "*(not to Sage — to the man beside her, without turning her helm)* They are afraid of you." },
          { who: "Ronin", line: "Yes." },
          { who: "P.E.K.K.A", line: "They are afraid of me also. *(a long pause; the festival roars, far away, about something else)* From far away, people decide what you are. They are very sure. They have never been close enough to check." },
          { who: "Ronin", line: "*(and he turns to look at her — the first time all night he's turned fully toward anyone)* And up close?" },
          { who: "P.E.K.K.A", line: "Up close, I am drinking the slow one. *(a small, careful shrug of the great pauldrons)* It has Heal in it. I like the warm ones." },
          { n: "A blossom petal comes down through the lantern light between them, turning over and over." },
          { who: "P.E.K.K.A", line: "*(watching it, very still, very hopeful)* …Butterfly?" },
          { who: "Ronin", line: "*(gently, the way you'd correct a friend and not a stranger)* Blossom." },
          { who: "P.E.K.K.A", line: "*(watching it land)* …Close." },
        ],
      },

      /* ---- The Knight — the old-soldier welcome (order + pour) ---- */
      {
        type: "visit",
        who: "Knight",
        expr: "Warm & Content",
        script: [
          { cue: "art", text: "KNIGHT — Warm & Content. He arrives dusty from the festival crowds, takes his stool like it followed him here from home." },
          { who: "Knight", line: "Evening, keeper. Evening, all. *(a nod down the counter — one soldier's nod to another, no politics in it)* The usual, when you're ready. It's been a lot of walking, this festival. My shoulder's been giving me the weather report since noon." },
          { brew: { base: "Elixir", mix: ["Heal"], dose: 1, recipe: "The Usual",
                    wrong: "Close, but that's not the usual, is it. One drop of Heal in the Elixir — just the one, same as ever. Steady's the whole point of it.",
                    nudge: "The usual, when you're ready. It's been a lot of walking, this festival.",
                    orderShort: "The usual, when you're ready…" } },
          { cue: "art", text: "the first slow sip; the shoulders come down an inch." },
          { who: "Sage", line: "Decent festival, at least? Beyond your shoulder's opinion of it." },
          { who: "Knight", line: "Better than the month before it, I'll say that much. The masters finally had their word with the heroes — the balloon's little skeleton fellows have been told to land softer when they drop in on you, and the goblin heroes, the ones who arrive with the whole banner parade, were ordered to go gentler on the rest of us. *(a slow, satisfied sip)* First week in a good while where an ordinary fighter like me could take a swing and actually land it." },
        ],
      },

      /* ---- Papers (baked away duo — group route) ---- */
      {
        type: "group",
        image: "Knight + Ronin - Papers (away duo)",
        heads: { "Knight": { x: 274, topY: 169 }, "Ronin": { x: 668, topY: 160 } },
        cast: [ { who: "Knight", expr: "Warm & Content" }, { who: "Ronin", expr: "Listening" } ],
        script: [
          { who: "Knight", line: "*(to Ronin, easy, no preamble — the way old soldiers skip the introductions because the years do it for them)* Saw you at the east bouts today. You stood the whole afternoon and never once reached for those swords." },
          { who: "Ronin", line: "There was nothing this afternoon worth drawing them for." },
          { who: "Knight", line: "*(a short laugh into his tankard)* Ha — no, there wasn't, was there. Two lads with more banner than sense. *(a slower sip; with a question brewing underneath)* How long've you been out there, then? On the road. Not the years — the miles don't care about years. I mean how long since somebody poured for you and you didn't check where the door was first." },
          { who: "Ronin", line: "*(he takes a long pause — he actually tries to count the time, and you watch him give up)* The accounting fails somewhere east of the mountains." },
          { who: "Knight", line: "Aye. That's a long road. *(he raises the tankard a couple of inches — not a toast, nothing so loud; just an old man moving a drink slightly in another man's direction)* They sent me out the gate first, my whole life — the keeper's heard me say this one often enough. First one out, every bell. Nobody ever asks the first one out where his banner is — they're just glad it's you and not them. So as far as this counter goes, that'll do for papers." },
          { n: "The stranger looks down the length of the counter — at the coins he squared, the water, the whole slow evening of nobody making it a thing." },
        ],
      },

      /* ---- Last round (baked away group — the four-hander) ---- */
      {
        type: "group",
        image: "Last Round (away group)",
        heads: { "Knight": { x: 223, topY: 169 }, "Hog Rider": { x: 509, topY: 197 },
                 "P.E.K.K.A": { x: 804, topY: 176 }, "Ronin": { x: 1117, topY: 161 } },
        cast: [
          { who: "Knight", expr: "Hearty Laugh" },
          { who: "Hog Rider", expr: "Big Laugh" },
          { who: "P.E.K.K.A", expr: "Happy" },
          { who: "Ronin", expr: "Listening" },
        ],
        script: [
          { who: "Hog Rider", line: "*(raising what is definitely not his first)* To the travelling counter!" },
          { line: "The counter! — The bar! — *(and P.E.K.K.A, one beat late, deep and completely sincere)* To the warm ones." },
          { who: "Sage", line: "Close enough." },
        ],
      },

      /* ---- Ronin — the first pour (THE consequential brew, GDD §8) ---- */
      {
        type: "visit",
        who: "Ronin",
        expr: "Listening",
        script: [
          { cue: "art", text: "RONIN — Listening, still." },
          { n: "He sets the water cup aside — deliberately, the way other things get sheathed — and lays one coin on the counter." },
          { who: "Ronin", line: "Keeper. You have poured for everyone at this counter tonight." },
          { who: "Sage", line: "That's the job, more or less." },
          { who: "Ronin", line: "Then I am at the counter. *(the coin slides forward one exact inch)* Pour for me." },
          { who: "Sage", line: "Any requests? It's a big board." },
          { who: "Ronin", line: "Something for the road. *(a pause — and there, at last, under the hat brim, the start of a smile forming)* The road behind me. Not the one ahead." },
          { brew: { consequence: true, field: "ronin",
                    right: { base: "Dark Elixir", mix: ["Heal"], dose: 2 },
                    nudge: "Something for the road. The road behind me. Not the one ahead.",
                    orderShort: "Something for the road — the road behind, not the one ahead…",
                    onRight: [
                      { who: "Ronin", expr: "At Ease", line: "*(the pour settles in front of him; he studies the dark glow awhile)* …So that is what it tastes like, like a sense of arriving. *(both hands around the tankard now, the way the others hold theirs; his shoulders come down; like a man who has stopped watching the door)* Keeper. This one has no name on your board." },
                      { who: "Sage", line: "It didn't exist before tonight. I'll have to write it in." },
                      { who: "Ronin", line: "Then I am accounted somewhere. *(and there it is — a small, unguarded smile)* Good." },
                      { unlock: { recipe: "The Long Road" } },
                      { unlock: { ledger: "Ronin", note: "First Elixir in years, maybe ever. Held the tankard like the others do. Like a regular.", stage: 3 } },
                    ],
                    onWrong: [
                      { who: "Ronin", expr: "At Ease", line: "*(not quite the right drink but still, he drinks it without hesitation, and sets it down with care)* Thank you, keeper. It is hard work. *(a pause; and because he never leaves a debt unpaid, not even this one)* Though if a man ever asks you for the road behind him — the miles want something dark under them, I think. And something kind on top. There is no hurry in it. *(he stands, bows — a deep one, like the one from the gate)* The water was the best I have had in many years." },
                      { unlock: { ledger: "Ronin", note: "Asked for something for the road. I got it wrong; he drank it anyway, courteous to the last, and taught me the right one on his way out.", stage: 3 } },
                    ] } },
        ],
      },

      /* ---- Close of Night — packing flat ---- */
      {
        type: "scene",
        script: [
          { cue: "art", text: "the away bar, empty again. The lanterns going out one at a time along the string, the festival down to its last few voices." },
          { cue: "sfx", text: "boards being stacked. A cart shifting its weight. One last tap-hiss, almost affectionate." },
          { who: "Sage", line: "*(folding the counter's boards down, one by one)* Same counter. It comes apart, it rides a cart, it goes back up. Turns out that's all it has ever needed to do." },
          { cue: "sfx", text: "footsteps on the road — several sets, heading home in several directions. One set, unhurried, you can't place the direction of at all." },
          { who: "Sage", line: "Same time at the strip tomorrow, then." },
          { cue: "art", text: "the last lantern goes out. The arena dark, the blossom still drifting. Fade." },
        ],
      },

      /* ---- Ed. LII — the morning after (explicit key 6; `field:"ronin"`
         decides which line prints; archiving key 6 completes the game) ---- */
      { type: "epilogue", ed: 6 },
    ],
  },
];
