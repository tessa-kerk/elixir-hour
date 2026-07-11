/* The screen state machine + Night/visit sequencer (GDD §14.1).
   Screens: title, herald, serve, group, duo, nightend, epilogue.
   The Tome is an overlay on top of any screen, not a state.
   The sequencer walks NIGHTS[night].beats[] (data/nights.js); with empty
   beats each Night opens on its Herald and then closes up, so the whole
   skeleton runs end-to-end before any content lands. */
window.Game = (function () {
  var current = "title";
  /* the final morning-after edition — archiving it is what marks the game
     completed (Ed. LII, Night 4's epilogue; was Ed. L / key 4 before Edition 2) */
  var FINAL_HERALD = 6;
  var state = {
    night: 1, beatIndex: 0,
    unlocks: { recipes: [], ledger: {}, heralds: [], songs: [] },
    tones: [],
    consequence: null,          /* the Knight's last cup: "clear" | "rattled" (GDD §8) */
    ronin: null,                /* Ronin's first pour (Night 4): "clear" | "rattled" — Ed. LII reads it */
    poured: [],                 /* [{night, recipe}] named drinks served — the Night Cap's drinks list (GDD §11); the consequential brew is NEVER recorded here (spoiler-safety) */
    /* §R18 one-shot onboarding hints (GDD §11 fresh-player locks). `mixer` = the first-brew
       mixer nudge has been retired for good. Lives in the SAVE, not prefs: it is a property
       of this playthrough, and Play Again should teach a new player again. */
    hints: { mixer: false },
  };
  function freshUnlocks() { return { recipes: [], ledger: {}, heralds: [], songs: [] }; }

  function show(name) {
    var screens = document.querySelectorAll(".screen");
    for (var i = 0; i < screens.length; i++) screens[i].classList.remove("active");
    var target = document.getElementById("screen-" + name);
    if (target) target.classList.add("active");
    if (current === "title" && name !== "title") Screens.leaveTitle();
    if (name === "title") Screens.renderTitle();
    current = name;
    if (window.HUD) HUD.onShow(name);   /* the menu + Tome buttons live only on play screens */
    if (window.Sound) Sound.onScreen(name);   /* music ducks on title + rest, lifts back on play */
  }

  function nightData() {
    var ns = window.NIGHTS || [];
    for (var i = 0; i < ns.length; i++) if (ns[i].night === state.night) return ns[i];
    return null;
  }
  function beat() {
    var n = nightData();
    return n ? n.beats[state.beatIndex] : null;
  }
  function hasNight(n) {
    var ns = window.NIGHTS || [];
    for (var i = 0; i < ns.length; i++) if (ns[i].night === n) return true;
    return false;
  }

  function snapshot() {
    return { version: 7, night: state.night, beatIndex: state.beatIndex,
             unlocks: state.unlocks, tones: state.tones,
             consequence: state.consequence, ronin: state.ronin, poured: state.poured,
             hints: state.hints,        /* v6+: one-shot onboarding hints (§R18) */
             /* within-beat resume point (P0-1): where in the current visit's
                script the player was, so Continue lands exactly there, not at
                the start of the beat. null between beats / on non-dialogue screens. */
             cursor: (window.Dialogue && Dialogue.cursor) ? Dialogue.cursor() : null };
  }
  function recordTone(tone) {
    state.tones.push({ night: state.night, beat: state.beatIndex, tone: tone });
    Save.store(snapshot());
  }

  /* An edition archives into the Tome the moment its interstitial is shown
     (Night 1's lands end-of-night; Nights 2–3 open on theirs; the epilogue
     morning-after edition archives with the epilogue). */
  function archiveHerald(n) {
    if (state.unlocks.heralds.indexOf(n) < 0) {
      state.unlocks.heralds.push(n);
      Save.store(snapshot());
    }
  }

  /* The morning-after Herald (GDD §9), as a screen. `b` is the epilogue BEAT
     that summoned it (round 22) — its `ed` names the edition key; with no beat
     (a completed save resuming at rest) the FINAL edition shows. Mid-arc the
     button reads Continue and advances; at the end of the arc it returns to
     the title (see epilogueContinue below). */
  function showEpilogue(b) {
    var key = (b && b.ed) || FINAL_HERALD;
    archiveHerald(key);
    Screens.renderEpilogue(key);
    var btn = document.getElementById("btn-totitle");
    if (btn) btn.textContent = t(epilogueHasMore() ? "epilogue.continue" : "epilogue.totitle");
    show("epilogue");
  }
  /* is there anything to play after the epilogue currently on screen? */
  function epilogueHasMore() {
    var b = beat();
    if (!b || b.type !== "epilogue") return false;
    var n = nightData();
    return (n && state.beatIndex < n.beats.length - 1) || hasNight(state.night + 1);
  }
  /* the epilogue screen's one button (boot.js): onward mid-arc, title at rest */
  function epilogueContinue() {
    if (epilogueHasMore()) { advance(); return; }
    var b = beat();
    if (b && b.type === "epilogue") { state.beatIndex++; Save.store(snapshot()); }  /* step past the final epilogue — the save now rests completed */
    show("title");
  }

  /* per-Night light shift (GDD §8): tag the stage so the scene tint reflects
     the current Night — warm gold (1) → dusk blue (2) → late candlelight (3)
     → festival lanterns (4: the away scenes carry their own grade, no tint).
     Also mirrors the night's sceneSet for the asset-path helpers (Edition 2). */
  function applyNightTint() {
    var nd = nightData();
    window.SCENE_SET = (nd && nd.sceneSet) || null;
    var stage = document.getElementById("stage");
    if (!stage) return;
    stage.classList.remove("night1", "night2", "night3", "night4");
    var n = (state.night >= 1 && state.night <= 4) ? state.night : 1;
    stage.classList.add("night" + n);
  }

  /* Start a dialogue beat — resuming mid-beat when a matching within-beat cursor
     was restored from the save (P0-1), else from the top. */
  var pendingCursor = null;
  function startBeat(b) {
    if (pendingCursor && pendingCursor.beatIndex === state.beatIndex) Dialogue.resume(b, pendingCursor);
    else Dialogue.start(b);
    pendingCursor = null;
  }

  /* R13: switching between two DIFFERENT in-bar layouts (serve/duo/group) uses a
     dip — a warm near-dark camera cut — instead of a cross-fade (which read as a
     double-exposure). Entering a layout from the title/herald keeps the plain
     screenfade; same-layout re-shows and reduced-motion skip the dip. */
  var LAYOUTS = { serve: 1, duo: 1, group: 1 };
  function layoutShow(screen, b) {
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (current !== screen && LAYOUTS[current] && LAYOUTS[screen] && window.Screens && Screens.dip && !reduce) {
      Screens.dip(function () { show(screen); startBeat(b); });
    } else {
      show(screen); startBeat(b);
    }
  }

  function playBeat() {
    applyNightTint();
    var b = beat();
    if (!b) {
      /* This Night's beats are exhausted (or still empty). */
      if (hasNight(state.night + 1)) {
        Screens.renderNightEnd(state.night, true);
        show("nightend");
      } else {
        showEpilogue();
      }
      return;
    }
    switch (b.type) {
      /* a herald beat may name its edition (Night 4 opens on key 5 = Ed. LI);
         without `ed` the night number is the key, as it always was */
      case "herald":   var hk = b.ed || state.night; archiveHerald(hk); Screens.renderHerald(hk); show("herald"); break;
      /* show() BEFORE startBeat so the screen is laid out when the dialogue engine
         measures the bubble for pagination — a hidden screen has offsetHeight 0 and
         the line never paginates (round-4 pagination fix). Synchronous, no flash. */
      case "visit":
      case "scene":    layoutShow("serve", b); break;
      case "group":    layoutShow("group", b); break;
      case "duo":      layoutShow("duo", b); break;
      case "epilogue": showEpilogue(b); break;
      default:
        console.warn("Elixir Hour: unknown beat type, skipping", b);
        advance();
    }
  }

  function advance() {
    state.beatIndex++;
    Save.store(snapshot());                        /* autosave on beat advance */
    playBeat();
  }

  function startNight(n) {
    if (!hasNight(n)) { show("epilogue"); return; }  /* never persist a night that doesn't exist */
    state.night = n;
    state.beatIndex = 0;
    Save.store(snapshot());                        /* autosave at the Night boundary */
    resume();
    if (window.HUD && n > 1) HUD.saved();          /* visible flourish at the Night boundary */
  }

  /* Play from the current state. Empty-beat Nights open on the Herald so the
     Title → Herald → (content) flow is visible before Milestone 4. */
  function resume() {
    var n = nightData();
    if (n && n.beats.length) playBeat();
    else if (state.beatIndex === 0) { Screens.renderHerald(state.night); show("herald"); }
    else playBeat();
  }

  /* Herald tap: if the Herald on screen is a real beat, advance past it;
     if it was the empty-Night opener, just play (falls through to nightend). */
  function heraldContinue() {
    var b = beat();
    if (b && b.type === "herald") advance();
    else { state.beatIndex++; Save.store(snapshot()); playBeat(); }
  }

  function newGame() {
    Save.clear();
    state.unlocks = freshUnlocks();
    state.tones = [];
    state.consequence = null;
    state.ronin = null;
    state.poured = [];
    state.hints = { mixer: false };     /* §R18: a fresh player gets the mixer nudge again */
    startNight(1);
  }

  /* Derive the unlock state of a player who has just FINISHED every Night before
     `n` — walk those nights' data and collect every unlock (recipes, Ledger stages,
     Herald editions) plus the interstitial/epilogue heralds. Data-driven, so it
     can't drift from the scripts. Songs stay derived (src/tome.js gates them off
     heralds/ledger/night), so an explicit songs list isn't needed. */
  function priorUnlocks(n) {
    var u = freshUnlocks();
    function apply(x) {
      if (!x) return;
      if (x.recipe && u.recipes.indexOf(x.recipe) < 0) u.recipes.push(x.recipe);
      if (x.ledger) {
        var arr = u.ledger[x.ledger] || (u.ledger[x.ledger] = []);
        arr[(x.stage || 1) - 1] = x.note || "";
      }
      if (x.herald && u.heralds.indexOf(x.herald) < 0) u.heralds.push(x.herald);
      if (x.song && u.songs.indexOf(x.song) < 0) u.songs.push(x.song);
    }
    function walk(entries) {
      if (!entries) return;
      for (var i = 0; i < entries.length; i++) {
        var e = entries[i];
        if (!e) continue;
        if (e.unlock) apply(e.unlock);
        if (e.options) for (var o = 0; o < e.options.length; o++) walk(e.options[o].reply);  /* choice replies */
        if (e.brew && e.brew.onRight) walk(e.brew.onRight);                                    /* the consequential (right) path */
      }
    }
    var ns = window.NIGHTS || [];
    for (var k = 0; k < ns.length; k++) {
      if (ns[k].night >= n) continue;
      var beats = ns[k].beats || [];
      for (var b = 0; b < beats.length; b++) {
        var beat = beats[b];
        if (beat.type === "herald") { var hk = beat.ed || ns[k].night; if (u.heralds.indexOf(hk) < 0) u.heralds.push(hk); }
        else if (beat.type === "epilogue" && beat.ed) { if (u.heralds.indexOf(beat.ed) < 0) u.heralds.push(beat.ed); }
        walk(beat.script);
      }
    }
    return u;
  }

  /* DEV ONLY (dev-panel Night selector): start any Night as if the player had
     finished the ones before it — the Tome icon reveals (it keys off having any
     recipe) and the Tome/Songbook show the prior nights' content. Testing Night 4
     no longer means replaying 1–3, and it doesn't wrongly look like a fresh save.
     Night 4's own unlocks (Water, The Long Road, Ronin, Ed. LI/LII) stay LOCKED so
     its mechanics — the water gate, the §8 name-hiding — test fresh. Never reachable
     by a normal player (the panel is gated in boot.js). */
  function startAtNight(n) {
    if (!hasNight(n)) return;
    Save.clear();
    state.unlocks = n > 1 ? priorUnlocks(n) : freshUnlocks();
    state.tones = [];
    state.consequence = null;
    state.ronin = null;
    state.poured = [];
    state.hints = { mixer: n > 1 };     /* a player who reached Night n has met the mixer */
    startNight(n);
  }

  /* §R18 first-brew mixer hint. The nudge is retired the moment the player picks a real
     mixer, and never returns for this save. */
  function mixerHintDone() { return !!(state.hints && state.hints.mixer); }
  function completeMixerHint() {
    if (mixerHintDone()) return;
    if (!state.hints) state.hints = { mixer: false };
    state.hints.mixer = true;
    Save.store(snapshot());
  }
  /* hydrate Game.state from a save WITHOUT resuming — shared by Continue and by
     "Open the Tome" from the finished-game title (the keepsake stays browsable). */
  function hydrate(s) {
    state.night = typeof s.night === "number" ? s.night : 1;
    state.beatIndex = typeof s.beatIndex === "number" ? s.beatIndex : 0;
    var u = s.unlocks || {};
    /* v2 saves stored one note string per Ledger character; v3 stores a
       stage-indexed note array (page depth = highest slot filled) */
    var ledger = {};
    var lg = u.ledger || {};
    for (var k in lg) {
      if (!Object.prototype.hasOwnProperty.call(lg, k)) continue;
      ledger[k] = typeof lg[k] === "string" ? [lg[k]] : (lg[k] || []);
    }
    state.unlocks = {
      recipes: u.recipes || [], ledger: ledger,
      heralds: u.heralds || [], songs: u.songs || [],
    };
    state.tones = s.tones || [];
    state.consequence = (s.consequence === "clear" || s.consequence === "rattled") ? s.consequence : null;
    state.ronin = (s.ronin === "clear" || s.ronin === "rattled") ? s.ronin : null;   /* v7+ (Edition 2) */
    state.poured = Array.isArray(s.poured) ? s.poured : [];   /* v3 and earlier had no pour log */
    /* §R18: v5 and earlier have no hints block. Infer it — a save that has already poured a
       drink has plainly found the mixer, so don't nudge a returning player mid-playthrough.
       A pre-v6 save that never reached a brew beat simply gets the hint once, which is right. */
    state.hints = { mixer: s.hints ? !!s.hints.mixer : (Array.isArray(s.poured) && s.poured.length > 0) };
    /* within-beat resume point (P0-1; v5+). v4 and earlier had none → the beat
       replays from its top, the old per-beat behaviour. */
    pendingCursor = (s.cursor && typeof s.cursor.beatIndex === "number" && Array.isArray(s.cursor.q)) ? s.cursor : null;
  }

  function continueGame() {
    var s = Save.load();
    if (!s) { newGame(); return; }
    hydrate(s);
    if (!hasNight(state.night)) { newGame(); return; }
    resume();
  }

  /* completed game = the FINAL morning-after Herald (Ed. LII, key 6) is archived.
     Edition 2 deliberately un-completes old finished saves: a 3-night finisher has
     key 4 but not 6, so their title button reads Continue and leads into Night 4 —
     the "your save carries on" live-ops moment (flagged in PLAN.md). */
  function isCompleted() {
    var s = Save.exists() ? Save.load() : null;
    return !!(s && s.unlocks && s.unlocks.heralds && s.unlocks.heralds.indexOf(FINAL_HERALD) >= 0);
  }
  /* §11 (round 10): from a finished-game title, open the finished Tome directly —
     hydrate the unlocks so it shows the completed keepsake, then open the overlay
     over the title (no game resumed). */
  function openTomeFromTitle() {
    var s = Save.exists() ? Save.load() : null;
    if (!s) return;
    hydrate(s);
    if (window.Tome && Tome.open) Tome.open();
  }
  function saveQuit() { Save.store(snapshot()); if (window.HUD) HUD.saved(); show("title"); }

  /* route through HUD so an onboarding open lands on the right tab + clears the
     reveal glow; falls back to a plain open if the HUD isn't present */
  function openTome() { if (window.HUD && HUD.openTome) HUD.openTome(); else if (window.Tome) Tome.open(); }
  function closeTome() { if (window.Tome) Tome.close(); }

  return {
    show: show, advance: advance, playBeat: playBeat,
    startNight: startNight, startAtNight: startAtNight, newGame: newGame, continueGame: continueGame,
    isCompleted: isCompleted, openTomeFromTitle: openTomeFromTitle,
    heraldContinue: heraldContinue, epilogueContinue: epilogueContinue, saveQuit: saveQuit,
    openTome: openTome, closeTome: closeTome, hasNight: hasNight,
    recordTone: recordTone,
    mixerHintDone: mixerHintDone, completeMixerHint: completeMixerHint,
    state: state, snapshot: snapshot,
  };
})();
