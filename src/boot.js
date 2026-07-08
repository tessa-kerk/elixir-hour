/* Boot: apply saved prefs, fill static strings, wire controls and the dev
   bar, land on the title. */
(function () {
  var prefs = Prefs.get();
  window.LANG = window.STRINGS[prefs.lang] ? prefs.lang : "en";
  document.documentElement.lang = window.LANG;
  Screens.fillStatic();
  Settings.refresh();
  if (window.Sound) Sound.refresh();   /* wire the audio system to the saved prefs + Songbook pick */

  document.getElementById("btn-start").addEventListener("click", function () { Game.newGame(); });
  document.getElementById("btn-continue").addEventListener("click", function () {
    /* §11 (round 10): on a finished game this button is "Play Again" — confirm before
       replacing the save; otherwise it's the normal Continue. */
    if (Game.isCompleted && Game.isCompleted()) {
      if (window.confirm(t("title.playagain.confirm"))) Game.newGame();
    } else {
      Game.continueGame();
    }
  });
  document.getElementById("btn-tome-title").addEventListener("click", function () { Game.openTomeFromTitle(); });
  document.getElementById("btn-settings").addEventListener("click", function () { Settings.open(); });
  document.getElementById("broadsheet").addEventListener("click", function () { Game.heraldContinue(); });
  document.getElementById("btn-nextnight").addEventListener("click", function () { Game.startNight(Game.state.night + 1); });
  document.getElementById("btn-savequit").addEventListener("click", function () { Game.saveQuit(); });
  document.getElementById("btn-totitle").addEventListener("click", function () { Game.show("title"); });
  document.getElementById("tomeclose").addEventListener("click", Game.closeTome);

  /* in-game menu + Tome HUD (GDD §11) */
  function isPlayScreen() {
    var a = document.querySelector(".screen.active");
    var id = a ? a.id : "";
    return id === "screen-serve" || id === "screen-group" || id === "screen-duo";
  }
  function tomeOpen() { var t = document.getElementById("tome"); return !!(t && t.classList.contains("open")); }
  document.getElementById("hud-menu").addEventListener("click", function () { HUD.toggleTray(); });
  document.getElementById("hud-tome").addEventListener("click", Game.openTome);
  document.getElementById("menu-resume").addEventListener("click", function () { HUD.closeTray(); });
  document.getElementById("menu-tome").addEventListener("click", function () { HUD.closeTray(); Game.openTome(); });
  document.getElementById("menu-settings").addEventListener("click", function () { HUD.closeTray(); Settings.open(); });
  document.getElementById("menu-savequit").addEventListener("click", function () { HUD.closeTray(); Game.saveQuit(); });

  /* Night Cap (GDD §11): compose the current Night's share card */
  function openNightCap() { NightCap.open(Game.state.night); }
  document.getElementById("btn-nightcap-end").addEventListener("click", openNightCap);
  document.getElementById("btn-nightcap-epi").addEventListener("click", openNightCap);
  NightCap.wire();

  var adv = document.querySelectorAll("[data-advance]");
  for (var i = 0; i < adv.length; i++) {
    adv[i].addEventListener("click", function () { Game.advance(); });
  }

  document.addEventListener("keydown", function (e) {
    var typing = e.target && /^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName);
    if (e.key === "Escape") {
      if (NightCap.isOpen()) NightCap.close();
      else if (Settings.aboutIsOpen()) Settings.closeAbout();
      else if (Settings.isOpen()) Settings.close();
      else if (tomeOpen()) Game.closeTome();
      else if (HUD.isTrayOpen()) HUD.closeTray();
      else if (isPlayScreen()) HUD.openTray();          /* Esc pauses when nothing else is open */
    }
    if ((e.key === "t" || e.key === "T") && !e.ctrlKey && !e.metaKey && !typing) {
      /* T opens the Tome from any play screen (GDD §11) */
      if (isPlayScreen() && !tomeOpen() && !HUD.isTrayOpen() && !Settings.isOpen() && !NightCap.isOpen()) Game.openTome();
    }
    if ((e.key === "d" || e.key === "D") && e.ctrlKey) { e.preventDefault(); toggleDev(); }
  });

  /* Dev bar (mirrors the mockup's): ?dev=1 or Ctrl+D. */
  var dev = document.getElementById("dev");
  function toggleDev(force) { dev.hidden = force != null ? !force : !dev.hidden; }
  function devBtn(label, fn) {
    var b = document.createElement("button");
    b.textContent = label;
    b.addEventListener("click", fn);
    dev.appendChild(b);
  }
  var jumps = ["title", "herald", "serve", "group", "duo", "nightend", "epilogue"];
  for (var j = 0; j < jumps.length; j++) {
    (function (name) {
      devBtn(name, function () {
        if (name === "herald") Screens.renderHerald(Game.state.night);
        if (name === "nightend") Screens.renderNightEnd(Game.state.night, Game.hasNight(Game.state.night + 1));
        if (name === "serve") Screens.renderServe(cs.value, es.value);
        Game.show(name);
      });
    })(jumps[j]);
  }
  devBtn("tome", Game.openTome);
  devBtn("wipe save", function () { Save.clear(); Game.show("title"); });
  /* dev-only: populate a fully-unlocked save so the Tome's real layouts can
     be reviewed without replaying (all recipes, all regulars met, all
     published Herald editions, all Songbook tracks) */
  devBtn("fill save", function () {
    var recipes = [];
    for (var i = 0; i < window.BREWBOOK.length; i++) recipes.push(window.BREWBOOK[i].name);
    var songs = [];
    for (var j = 0; j < window.SONGBOOK.length; j++) songs.push(window.SONGBOOK[j].name);
    /* stage-indexed note arrays (v3): all five pages at full depth */
    Game.state.unlocks = {
      recipes: recipes,
      ledger: {
        "Knight": ["The anchor. Been fighting a long time.",
                   "Fights at dawn. Can't remember what for. Saving himself for something.", ""],
        "Hog Rider": ["Loud. Always the last to leave.", "",
                      "The noise is a shield. Wants, more than anything, somewhere he doesn't have to be loud."],
        "Wizard": ["Performs. Desperate to be taken seriously.",
                   "Forty years of fire, and not one card to show for it. The boast is the bandage.",
                   "Doesn't need the card tonight. Learned the plain cup was the good one all along."],
        "Princess": ["Sees everything from range. Upstaged by the Magic Archer — a wound she won't name. Lonely at the top and would rather burn than say so.", "",
                     "Lonely at the top and finally said so. Put the Poison down for one night."],
        "P.E.K.K.A": ["Gentle. Hates being feared. A mother. Loves butterflies — and keeps music where her heart would be.", "",
                      "Seen at last. A mother, a music-lover, the gentlest soul in the realm — under the most frightening shell in it."],
      },
      heralds: [1, 2, 3, 4],
      songs: songs,
    };
    Game.state.consequence = "clear";              /* so the epilogue edition reads */
    Save.store(Game.snapshot());
    Game.openTome();
  });

  /* character / expression pickers (mirrors the mockup's dev bar) */
  var cs = document.createElement("select"), es = document.createElement("select");
  function fillExprs() {
    es.innerHTML = "";
    for (var e in window.CAST[cs.value].exprs) es.add(new Option(e, e));
  }
  for (var ch in window.CAST) cs.add(new Option(ch, ch));
  cs.addEventListener("change", function () {
    fillExprs();
    if (document.getElementById("screen-serve").classList.contains("active")) Screens.renderServe(cs.value, es.value);
  });
  es.addEventListener("change", function () {
    if (document.getElementById("screen-serve").classList.contains("active")) Screens.renderServe(cs.value, es.value);
  });
  fillExprs();
  dev.appendChild(cs); dev.appendChild(es);

  document.getElementById("panel-info").addEventListener("click", Game.openTome);
  if (/[?&]dev=1/.test(window.location.search)) toggleDev(true);

  Game.show("title");
})();
