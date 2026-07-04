/* Boot: apply saved prefs, fill static strings, wire controls and the dev
   bar, land on the title. */
(function () {
  var prefs = Prefs.get();
  window.LANG = window.STRINGS[prefs.lang] ? prefs.lang : "en";
  document.documentElement.lang = window.LANG;
  Screens.fillStatic();
  Settings.refresh();

  document.getElementById("btn-start").addEventListener("click", function () { Game.newGame(); });
  document.getElementById("btn-continue").addEventListener("click", function () { Game.continueGame(); });
  document.getElementById("btn-settings").addEventListener("click", function () { Settings.open(); });
  document.getElementById("broadsheet").addEventListener("click", function () { Game.heraldContinue(); });
  document.getElementById("btn-nextnight").addEventListener("click", function () { Game.startNight(Game.state.night + 1); });
  document.getElementById("btn-savequit").addEventListener("click", function () { Game.saveQuit(); });
  document.getElementById("btn-totitle").addEventListener("click", function () { Game.show("title"); });
  document.getElementById("tomeclose").addEventListener("click", Game.closeTome);

  var adv = document.querySelectorAll("[data-advance]");
  for (var i = 0; i < adv.length; i++) {
    adv[i].addEventListener("click", function () { Game.advance(); });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (Settings.aboutIsOpen()) Settings.closeAbout();
      else if (Settings.isOpen()) Settings.close();
      else Game.closeTome();
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
    Game.state.unlocks = {
      recipes: recipes,
      ledger: {
        "Knight": "The anchor. Been fighting a long time.",
        "Hog Rider": "Loud. Always the last to leave.",
        "Wizard": "Performs. Desperate to be taken seriously.",
        "Princess": "", "P.E.K.K.A": "",
      },
      heralds: [1, 2, 3],
      songs: songs,
    };
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
