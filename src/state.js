/* The screen state machine + Night/visit sequencer (GDD §14.1).
   Screens: title, herald, serve, group, duo, nightend, epilogue.
   The Tome is an overlay on top of any screen, not a state.
   The sequencer walks NIGHTS[night].beats[] (data/nights.js); with empty
   beats each Night opens on its Herald and then closes up, so the whole
   skeleton runs end-to-end before any content lands. */
window.Game = (function () {
  var current = "title";
  var state = {
    night: 1, beatIndex: 0,
    unlocks: { recipes: [], ledger: {}, heralds: [], songs: [] },
    tones: [],
    consequence: null,          /* the Knight's last cup: "clear" | "rattled" (GDD §8) */
    poured: [],                 /* [{night, recipe}] named drinks served — the Night Cap's drinks list (GDD §11); the consequential brew is NEVER recorded here (spoiler-safety) */
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
    return { version: 4, night: state.night, beatIndex: state.beatIndex,
             unlocks: state.unlocks, tones: state.tones,
             consequence: state.consequence, poured: state.poured };
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

  function showEpilogue() {
    archiveHerald(4);
    Screens.renderEpilogue();
    show("epilogue");
  }

  /* per-Night light shift (GDD §8): tag the stage so the scene tint reflects
     the current Night — warm gold (1) → dusk blue (2) → late candlelight (3) */
  function applyNightTint() {
    var stage = document.getElementById("stage");
    if (!stage) return;
    stage.classList.remove("night1", "night2", "night3");
    var n = (state.night >= 1 && state.night <= 3) ? state.night : 1;
    stage.classList.add("night" + n);
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
      case "herald":   archiveHerald(state.night); Screens.renderHerald(state.night); show("herald"); break;
      case "visit":
      case "scene":    Dialogue.start(b); show("serve"); break;
      case "group":    Dialogue.start(b); show("group"); break;
      case "duo":      Dialogue.start(b); show("duo"); break;
      case "epilogue": showEpilogue(); break;
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
    state.poured = [];
    startNight(1);
  }
  function continueGame() {
    var s = Save.load();
    if (!s) { newGame(); return; }
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
    state.poured = Array.isArray(s.poured) ? s.poured : [];   /* v3 and earlier had no pour log */
    if (!hasNight(state.night)) { newGame(); return; }
    resume();
  }
  function saveQuit() { Save.store(snapshot()); show("title"); }

  function openTome() { if (window.Tome) Tome.open(); }
  function closeTome() { if (window.Tome) Tome.close(); }

  return {
    show: show, advance: advance, playBeat: playBeat,
    startNight: startNight, newGame: newGame, continueGame: continueGame,
    heraldContinue: heraldContinue, saveQuit: saveQuit,
    openTome: openTome, closeTome: closeTome, hasNight: hasNight,
    recordTone: recordTone,
    state: state, snapshot: snapshot,
  };
})();
