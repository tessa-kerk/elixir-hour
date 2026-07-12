/* Settings + About overlays (GDD §11). Language dropdown (native names) wired
   to the string tables — swaps every player-facing string live and persists
   via Prefs; Music / Sound-effects toggles (persisted now, audio lands in
   Milestone 7); About/Credits carries the §17 disclaimers. */
window.Settings = (function () {
  function el(id) { return document.getElementById(id); }

  function isOpen() { return el("settings").classList.contains("open"); }
  function aboutIsOpen() { return el("about").classList.contains("open"); }
  /* Round 13: opening Settings does NOT lift the music duck — the duck stays as a
     multiplier on the slider level until play starts. The slider still works: its %
     changes the underlying level (heard at the ducked level on the title). */
  function open() { refresh(); el("settings").classList.add("open"); }
  function close() { el("settings").classList.remove("open"); }
  function openAbout() { refresh(); el("about").classList.add("open"); }
  function closeAbout() { el("about").classList.remove("open"); }

  /* ---- text size (WS1 mobile-polish): an iOS-style stepped control -------------
     Four notches map to a --text-scale multiplier the player-facing type ramp derives
     from (see main.css). The scale float is what persists in Prefs (robust); the slider
     works in step index. Applied LIVE on the stage + at boot. */
  var TS_STEPS = [
    { scale: 0.9, key: "settings.textsize.small" },
    { scale: 1.0, key: "settings.textsize.default" },
    { scale: 1.2, key: "settings.textsize.large" },
    { scale: 1.4, key: "settings.textsize.xlarge" },
  ];
  function tsScaleToStep(scale) {
    var best = 1, bd = 1e9;
    for (var i = 0; i < TS_STEPS.length; i++) {
      var d = Math.abs(TS_STEPS[i].scale - scale);
      if (d < bd) { bd = d; best = i; }
    }
    return best;
  }
  /* apply a scale to the stage + repaint the settings control (label + preview). Safe to
     call before Settings is open (the control may not be visible yet) and at boot. */
  function applyTextScale(scale) {
    var s = +scale; if (!(s > 0)) s = 1;
    var stage = el("stage");
    if (stage) stage.style.setProperty("--text-scale", s);
    paintTextSize();
  }
  function paintTextSize() {
    var step = tsScaleToStep(+Prefs.get().textScale);
    if (el("text-scale")) el("text-scale").value = step;
    if (el("ts-step-label")) el("ts-step-label").textContent = t(TS_STEPS[step].key);
    if (el("ts-preview")) el("ts-preview").textContent = t("settings.textsize.preview");
  }

  /* ---- sound: two live 0-100 sliders + a mute each (GDD §11 R12) ---- */
  var lastMusicVol = 70, lastSfxVol = 70;   /* remembered level, so unmute restores it */
  function effMuted(kind) {
    var p = Prefs.get();
    return kind === "music" ? (p.musicMuted || +p.musicVol <= 0) : (p.sfxMuted || +p.sfxVol <= 0);
  }
  function paintSound() {
    var p = Prefs.get();
    if (+p.musicVol > 0) lastMusicVol = +p.musicVol;
    if (+p.sfxVol > 0) lastSfxVol = +p.sfxVol;
    if (el("vol-music")) el("vol-music").value = p.musicVol;
    if (el("vol-sfx")) el("vol-sfx").value = p.sfxVol;
    if (el("pct-music")) el("pct-music").textContent = Math.round(p.musicVol) + "%";
    if (el("pct-sfx")) el("pct-sfx").textContent = Math.round(p.sfxVol) + "%";
    if (el("mute-music")) el("mute-music").classList.toggle("muted", effMuted("music"));
    if (el("mute-sfx")) el("mute-sfx").classList.toggle("muted", effMuted("sfx"));
    if (el("tray-mute-music")) el("tray-mute-music").classList.toggle("muted", effMuted("music"));
  }
  function toggleMusicMute() {
    if (effMuted("music")) { var patch = { musicMuted: false }; if (+Prefs.get().musicVol <= 0) patch.musicVol = lastMusicVol || 70; Prefs.set(patch); }
    else Prefs.set({ musicMuted: true });
    paintSound();
    if (window.Sound) Sound.applyMusicLevel();
  }
  function toggleSfxMute() {
    if (effMuted("sfx")) { var patch = { sfxMuted: false }; if (+Prefs.get().sfxVol <= 0) patch.sfxVol = lastSfxVol || 70; Prefs.set(patch); }
    else Prefs.set({ sfxMuted: true });
    paintSound();
    if (window.Sound && !effMuted("sfx")) Sound.previewSfx();
  }

  /* All texts + control states, re-run on every open and language change. */
  function refresh() {
    el("set-title").textContent = t("settings.title");
    el("set-lang-label").textContent = t("settings.language");
    el("set-disclaimer").textContent = t("settings.disclaimer");
    if (el("set-textsize-label")) el("set-textsize-label").textContent = t("settings.textsize");
    paintTextSize();
    el("set-music-label").textContent = t("settings.music");
    el("set-sfx-label").textContent = t("settings.sfx");
    el("btn-about").textContent = t("settings.about");
    el("btn-set-back").textContent = t("settings.back");
    el("about-title").textContent = t("about.title");
    el("about-p1").textContent = t("about.affiliation");
    el("about-p2").textContent = t("about.translation");
    el("about-p4").textContent = t("about.music");
    el("about-p3").textContent = t("about.inspiration");
    el("btn-about-back").textContent = t("settings.back");
    paintSound();
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
    /* §R14: fillStatic() reset btn-continue to a plain "Continue" label but left the
       two-line class/spans — re-render the title so the two-line Continue (or Play
       Again) rebuilds correctly in the new language instead of a stale single line. */
    if (active && active.id === "screen-title") Screens.renderTitle();
  }

  /* wire up */
  var sel = el("lang-select");
  for (var i = 0; i < window.LANGS.length; i++) {
    sel.add(new Option(window.LANGS[i].native, window.LANGS[i].code));
  }
  sel.addEventListener("change", function () { applyLanguage(sel.value); });

  /* music volume — applies LIVE while dragging (§11 R12) */
  el("vol-music").addEventListener("input", function () {
    var v = +this.value, patch = { musicVol: v };
    if (v > 0) patch.musicMuted = false;          /* dragging up from 0 unmutes */
    Prefs.set(patch); paintSound();
    if (window.Sound) Sound.applyMusicLevel();
  });
  /* sfx volume — persists live; previews a click on release (not mid-drag) */
  el("vol-sfx").addEventListener("input", function () {
    var v = +this.value, patch = { sfxVol: v };
    if (v > 0) patch.sfxMuted = false;
    Prefs.set(patch); paintSound();
  });
  el("vol-sfx").addEventListener("change", function () { if (window.Sound && +this.value > 0) Sound.previewSfx(); });
  /* text size — applies LIVE while dragging (mirrors the volume sliders). Persists the
     scale float in Prefs; the type ramp resizes at once via the --text-scale var. */
  if (el("text-scale")) el("text-scale").addEventListener("input", function () {
    var step = Math.max(0, Math.min(TS_STEPS.length - 1, Math.round(+this.value)));
    var scale = TS_STEPS[step].scale;
    Prefs.set({ textScale: scale });
    applyTextScale(scale);
  });
  el("mute-music").addEventListener("click", toggleMusicMute);
  el("mute-sfx").addEventListener("click", toggleSfxMute);
  var trayMute = el("tray-mute-music");
  if (trayMute) trayMute.addEventListener("click", toggleMusicMute);

  el("btn-about").addEventListener("click", openAbout);
  el("btn-about-back").addEventListener("click", closeAbout);
  el("btn-set-back").addEventListener("click", close);

  /* apply the saved text scale to the stage at module load — before boot even runs its
     first render — so the type ramp is correct from the first frame, and stays correct
     even if the boot sequence changes. Default 1 is a no-op (byte-identical). */
  applyTextScale(Prefs.get().textScale);

  return {
    open: open, close: close, openAbout: openAbout, closeAbout: closeAbout,
    isOpen: isOpen, aboutIsOpen: aboutIsOpen,
    refresh: refresh, applyLanguage: applyLanguage, syncSound: paintSound,
    applyTextScale: applyTextScale,
  };
})();
