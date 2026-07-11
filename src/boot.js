/* Boot: apply saved prefs, fill static strings, wire controls and the dev
   bar, land on the title.
   §R19: the whole boot runs inside a guard. If any earlier script in the chain
   failed to load or parse — the R19 launch blocker was a corrupted deploy
   artifact: strings.js / tome.js / nightcap.js shipped byte-corrupt, so STRINGS,
   Tome and NightCap never defined and boot died silently on a flat indigo stage —
   we paint a plain cream notice instead of leaving a beautiful empty room. The
   notice is hardcoded English with inline styles ON PURPOSE: it must not depend
   on the very string table or CSS that may be the thing that failed. */
(function () {
  function bootFailed(err) {
    if (window.console) console.error("Elixir Hour: boot failed —", err);
    try {
      var prev = document.getElementById("boot-error");
      if (prev && prev.parentNode) prev.parentNode.removeChild(prev);
      var box = document.createElement("div");
      box.id = "boot-error";
      box.setAttribute("role", "alert");
      box.style.cssText =
        "position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:99999;" +
        "max-width:340px;padding:22px 26px;border-radius:14px;text-align:center;" +
        "font-family:'Cormorant Garamond',Georgia,serif;color:#2b2536;background:#efe6d3;" +
        "box-shadow:0 18px 50px rgba(0,0,0,.5);border:1px solid rgba(0,0,0,.12);";
      var h = document.createElement("div");
      h.style.cssText = "font-weight:700;font-size:21px;margin-bottom:8px;";
      h.textContent = "The bar didn’t open.";
      var p = document.createElement("div");
      p.style.cssText = "font-size:16px;line-height:1.4;";
      p.textContent = "Something went wrong loading Elixir Hour. Please refresh the page — " +
        "if it keeps happening, try again in a little while.";
      box.appendChild(h); box.appendChild(p);
      (document.body || document.documentElement).appendChild(box);
    } catch (e2) { /* last resort — the console error above is all we can offer */ }
  }
  try {
  /* a script earlier in the chain failed to define its global (corrupt/blocked
     load) → fail loudly HERE, not by dying mid-boot on a silent blank stage */
  var NEED = ["STRINGS", "Prefs", "Save", "Game", "Stage", "Screens", "Brew",
              "Dialogue", "Tome", "NightCap", "Settings", "HUD"];
  var missing = [];
  for (var mi = 0; mi < NEED.length; mi++) if (!window[NEED[mi]]) missing.push(NEED[mi]);
  if (missing.length) throw new Error("core modules failed to load: " + missing.join(", "));

  var prefs = Prefs.get();
  window.LANG = window.STRINGS[prefs.lang] ? prefs.lang : "en";
  document.documentElement.lang = window.LANG;
  Screens.fillStatic();
  Settings.refresh();
  if (window.Sound) Sound.refresh();   /* wire the audio system to the saved prefs + Songbook pick */

  /* --- DEV-PANEL ACCESS GATE (round 22c) ---------------------------------------
     The dev bar (Night jumps, fill-save, character preview) must not be reachable
     by a published player pressing Ctrl+D. It is now gated behind a one-time unlock:
     visit `?dev=sage` once on a device and the flag persists in localStorage; that
     device then gets Ctrl+D (desktop) and a floating ⚙ (mobile). `?dev=off` clears it.
     NB: the repo is public, so this stops a curious player, not a determined
     source-reader — true gating would need a server we don't have. */
  function devUnlocked() { try { return localStorage.getItem("eh-dev") === "1"; } catch (e) { return false; } }
  (function () {
    var m = /[?&]dev=([^&]*)/.exec(window.location.search);
    if (!m) return;
    if (m[1] === "sage") { try { localStorage.setItem("eh-dev", "1"); } catch (e) {} }
    else if (m[1] === "off") { try { localStorage.removeItem("eh-dev"); } catch (e) {} }
  })();

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
  /* round 22: mid-arc (after Night 3) the epilogue continues into the next
     night; only the FINAL epilogue returns to the title. Game decides. */
  document.getElementById("btn-totitle").addEventListener("click", function () { Game.epilogueContinue(); });
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
    if ((e.key === "d" || e.key === "D") && e.ctrlKey && devUnlocked()) { e.preventDefault(); toggleDev(); }
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
        "Ronin": ["Drinks water. Pays for more than he takes.",
                  "Asked why he's allowed in. Nobody here has ever asked me.",
                  "First Elixir in years, maybe ever. Held the tankard like the others do. Like a regular."],
      },
      heralds: [1, 2, 3, 4, 5, 6],
      songs: songs,
    };
    Game.state.consequence = "clear";              /* so the epilogue edition reads */
    Game.state.ronin = "clear";                    /* Ed. LII's line too (Edition 2) */
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

  /* Night jump (round 22c): clean start at any Night's first beat — skip replaying
     1–3 when testing Night 4. "fill save" first if you want a populated Tome. */
  var nsel = document.createElement("select");
  nsel.title = "Jump to a Night (clean start)";
  nsel.add(new Option("Jump to…", ""));
  for (var nj = 1; nj <= 4; nj++) nsel.add(new Option("Night " + nj, String(nj)));
  nsel.addEventListener("change", function () {
    if (this.value) { Game.startAtNight(+this.value); this.value = ""; }
  });
  dev.appendChild(nsel);
  dev.appendChild(cs); dev.appendChild(es);

  document.getElementById("panel-info").addEventListener("click", Game.openTome);

  /* dev panel: unlocked devices only. Show on load when a dev param is present;
     a floating ⚙ toggles it where Ctrl+D can't reach (mobile). */
  if (devUnlocked()) {
    if (/[?&]dev=/.test(window.location.search)) toggleDev(true);
    var gear = document.createElement("button");
    gear.textContent = "⚙";
    gear.title = "Dev panel";
    gear.setAttribute("aria-label", "Dev panel");
    gear.style.cssText = "position:fixed;left:6px;bottom:6px;z-index:99998;width:34px;height:34px;" +
      "border-radius:50%;border:none;background:rgba(20,14,10,.62);color:#e8d9bd;font-size:16px;" +
      "line-height:34px;text-align:center;cursor:pointer;padding:0;";
    gear.addEventListener("click", function () { toggleDev(); });
    document.body.appendChild(gear);
  }

  Game.show("title");
  } catch (bootErr) { bootFailed(bootErr); }
})();
