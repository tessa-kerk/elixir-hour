/* Settings + About overlays (GDD §11). Language dropdown (native names) wired
   to the string tables — swaps every player-facing string live and persists
   via Prefs; Music / Sound-effects toggles (persisted now, audio lands in
   Milestone 7); About/Credits carries the §17 disclaimers. */
window.Settings = (function () {
  function el(id) { return document.getElementById(id); }

  function isOpen() { return el("settings").classList.contains("open"); }
  function aboutIsOpen() { return el("about").classList.contains("open"); }
  function open() { refresh(); el("settings").classList.add("open"); }
  function close() { el("settings").classList.remove("open"); }
  function openAbout() { refresh(); el("about").classList.add("open"); }
  function closeAbout() { el("about").classList.remove("open"); }

  /* All texts + control states, re-run on every open and language change. */
  function refresh() {
    el("set-title").textContent = t("settings.title");
    el("set-lang-label").textContent = t("settings.language");
    el("set-disclaimer").textContent = t("settings.disclaimer");
    el("set-music-label").textContent = t("settings.music");
    el("set-sfx-label").textContent = t("settings.sfx");
    el("btn-about").textContent = t("settings.about");
    el("btn-set-back").textContent = t("settings.back");
    el("about-title").textContent = t("about.title");
    el("about-p1").textContent = t("about.affiliation");
    el("about-p2").textContent = t("about.translation");
    el("about-p3").textContent = t("about.inspiration");
    el("btn-about-back").textContent = t("settings.back");
    var p = Prefs.get();
    el("tgl-music").textContent = t(p.music ? "settings.on" : "settings.off");
    el("tgl-sfx").textContent = t(p.sfx ? "settings.on" : "settings.off");
    el("lang-select").value = window.LANG;
  }

  function applyLanguage(code) {
    if (!window.STRINGS[code]) code = "en";
    window.LANG = code;
    document.documentElement.lang = code;
    Prefs.set({ lang: code });
    Screens.fillStatic();
    refresh();
    /* live-refresh whatever dynamic screen is showing */
    var active = document.querySelector(".screen.active");
    if (active && active.id === "screen-herald") Screens.renderHerald(Game.state.night);
    if (active && active.id === "screen-nightend") Screens.renderNightEnd(Game.state.night, Game.hasNight(Game.state.night + 1));
  }

  /* wire up */
  var sel = el("lang-select");
  for (var i = 0; i < window.LANGS.length; i++) {
    sel.add(new Option(window.LANGS[i].native, window.LANGS[i].code));
  }
  sel.addEventListener("change", function () { applyLanguage(sel.value); });
  el("tgl-music").addEventListener("click", function () { Prefs.set({ music: !Prefs.get().music }); refresh(); if (window.Sound) Sound.applyMusicPref(); });
  el("tgl-sfx").addEventListener("click", function () { Prefs.set({ sfx: !Prefs.get().sfx }); refresh(); });
  el("btn-about").addEventListener("click", openAbout);
  el("btn-about-back").addEventListener("click", closeAbout);
  el("btn-set-back").addEventListener("click", close);

  return {
    open: open, close: close, openAbout: openAbout, closeAbout: closeAbout,
    isOpen: isOpen, aboutIsOpen: aboutIsOpen,
    refresh: refresh, applyLanguage: applyLanguage,
  };
})();
