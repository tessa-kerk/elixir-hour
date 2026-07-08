/* The in-game HUD + menu (GDD §11, locked 07/07). Two persistent buttons on
   every play screen (serve/group/duo), hidden on the title and interstitials:
   a Menu button (top-right) that opens a pause tray, and a Tome button
   (bottom-right) that opens the Tome and pulses once when something new lands.
   Plus the visible-autosave quill flourish and the onboarding hint chips. */
window.HUD = (function () {
  function el(id) { return document.getElementById(id); }
  var PLAY = { serve: 1, group: 1, duo: 1 };
  var trayOpen = false;

  /* R12: opening the Tome shows whatever landed since it was last open — a newly
     met character → the Ledger grid, a new recipe → that Brew Book page. Set on
     every new unlock; character wins if both land together (it's set last). Cleared
     on open; when null, the Tome restores its last position. */
  var pendingTarget = null;   /* {tab:"ledger"} | {tab:"brew", recipe} | null */
  function markNewRecipe(name) { pendingTarget = { tab: "brew", recipe: name }; }
  function markNewCharacter(who) { pendingTarget = { tab: "ledger", who: who }; }

  /* staged reveal (§11 reworked): the Tome icon does NOT exist until the first
     recipe records — derived from the save so it survives a reload. */
  function isRevealed() {
    return !!(window.Game && Game.state && Game.state.unlocks && Game.state.unlocks.recipes.length);
  }

  /* called from Game.show(name): the two HUD buttons live only on play screens,
     and the tray never survives a screen change. */
  function onShow(name) {
    var play = !!PLAY[name];
    el("hud-menu").classList.toggle("on", play);
    el("hud-tome").classList.toggle("on", play && isRevealed());
    if (!play) closeTray();
  }

  /* first recipe recorded: the icon settles in with a held gold glow (the open
     target is set separately by markNewRecipe). */
  function revealTome() {
    var b = el("hud-tome");
    if (!b) return;
    b.classList.remove("reveal");
    void b.offsetWidth;
    b.classList.add("on", "reveal", "glow");
  }
  /* the Knight's first page: glow again (target set by markNewCharacter) */
  function glowLedger() {
    var b = el("hud-tome");
    if (b) b.classList.add("glow");
  }
  /* open the Tome, honouring whatever landed since it was last open (R12),
     clearing the glow. Nothing new → the Tome restores its own last position. */
  function openTome() {
    var b = el("hud-tome");
    if (b) b.classList.remove("glow", "reveal");
    var target = pendingTarget; pendingTarget = null;
    if (!window.Tome) return;
    if (target && target.tab === "ledger") {
      Tome.openLedgerGrid();
      var t = el("tab-ledger");
      if (t) { t.classList.add("ribbon-hi"); window.setTimeout(function () { t.classList.remove("ribbon-hi"); }, 2600); }
    } else if (target && target.tab === "brew") {
      Tome.openRecipe(target.recipe);
    } else {
      Tome.open();                    /* nothing new → restore last position */
    }
  }

  function openTray() {
    trayOpen = true;
    el("menu-tray").classList.add("open");   /* .overlay show convention */
    if (window.Settings && Settings.syncSound) Settings.syncSound();   /* tray music-mute icon reflects current state */
  }
  function closeTray() {
    trayOpen = false;
    el("menu-tray").classList.remove("open");
  }
  function toggleTray() { if (trayOpen) closeTray(); else openTray(); }
  function isTrayOpen() { return trayOpen; }

  /* pulse the Tome button once — something new landed in the Tome */
  function pulse() {
    var b = el("hud-tome");
    if (!b) return;
    b.classList.remove("pulse");
    void b.offsetWidth;                 /* restart the one-shot animation */
    b.classList.add("pulse");
  }

  /* the visible autosave flourish (Night boundary + Save & Quit) — the player
     should never wonder whether their evening was kept */
  var quillTimer = null;
  function saved() {
    var q = el("autosave-quill");
    if (!q) return;
    if (window.Sound) Sound.sfx("quill");          /* the quill scratch rides the visible flourish */
    el("autosave-word").textContent = t("autosave.saved");
    q.classList.add("on");
    if (quillTimer) window.clearTimeout(quillTimer);
    quillTimer = window.setTimeout(function () { q.classList.remove("on"); }, 1900);
  }

  /* a soft hint chip (tutorial-through-fiction). Dismisses on any input, blocks
     nothing. `once` keys keep an onboarding beat from re-firing in a session. */
  var chipSeen = {};
  var chipTimer = null;
  function chip(key, once) {
    if (once && chipSeen[key]) return;
    chipSeen[key] = 1;
    var c = el("hint-chip");
    if (!c) return;
    c.textContent = t(key);
    c.classList.add("on");
    if (chipTimer) window.clearTimeout(chipTimer);
    chipTimer = window.setTimeout(dismissChip, 6500);
  }
  function dismissChip() { var c = el("hint-chip"); if (c) c.classList.remove("on"); }
  document.addEventListener("pointerdown", dismissChip, true);
  document.addEventListener("keydown", dismissChip, true);

  return {
    onShow: onShow, openTray: openTray, closeTray: closeTray,
    toggleTray: toggleTray, isTrayOpen: isTrayOpen,
    pulse: pulse, saved: saved, chip: chip, dismissChip: dismissChip,
    revealTome: revealTome, glowLedger: glowLedger, openTome: openTome, isRevealed: isRevealed,
    markNewRecipe: markNewRecipe, markNewCharacter: markNewCharacter,
  };
})();
