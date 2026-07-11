/* Persistence (GDD §13): one continuous autosave + Save & Quit / Continue,
   plus player preferences (language, sound). Preferences live under their own
   key so starting a New Game never resets your language.
   Every storage touch is wrapped — localStorage can throw on file:// or when
   the browser blocks storage, and that must never crash the game. When it's
   unavailable we fall back to in-memory stores: play works normally, it just
   doesn't persist beyond the session (one quiet console warning). */
(function () {
  var warned = false;
  function warn(e) {
    if (warned) return;
    warned = true;
    console.warn("Elixir Hour: browser storage unavailable — progress won't persist beyond this session.", e);
    /* Say it in-game too, not console-only (P0 06-07): a player on file:// or in
       private mode must SEE that tonight won't be remembered. Deferred to a
       microtask-ish tick so the toast infra (Screens + strings) is live even if
       the very first storage touch happens during boot. */
    function tell() {
      try {
        var msg = (window.t) ? t("toast.nosave") : "This browser can't keep saves — tonight won't be remembered.";
        if (window.Screens && Screens.toast) Screens.toast(msg);
        else if (window.setTimeout) window.setTimeout(tell, 400);
      } catch (x) { /* never let the warning itself throw */ }
    }
    tell();
  }

  /* A safe localStorage box with an in-memory fallback. */
  function storageBox(key) {
    var memory = null;
    return {
      load: function () {
        try {
          var raw = window.localStorage.getItem(key);
          if (raw != null) return JSON.parse(raw);
        } catch (e) { warn(e); }
        return memory;
      },
      store: function (data) {
        memory = data;
        try { window.localStorage.setItem(key, JSON.stringify(data)); } catch (e) { warn(e); }
      },
      clear: function () {
        memory = null;
        try { window.localStorage.removeItem(key); } catch (e) { warn(e); }
      },
      exists: function () { return this.load() != null; },
    };
  }

  var saveBox = storageBox("elixirHour.save.v1");
  window.Save = {
    load: function () { return saveBox.load(); },
    store: function (d) { saveBox.store(d); },
    clear: function () { saveBox.clear(); },
    exists: function () { return saveBox.exists(); },
  };

  var prefsBox = storageBox("elixirHour.prefs.v1");
  /* Round 12 (GDD §11): sound is two 0-100 volume sliders + a mute each, not
     on/off toggles. Old saves carried music/sfx booleans — migrated below so a
     previously-muted player stays muted.
     §R18 (GDD §11 fresh-player locks): MUSIC now defaults to 50 — 70 was too loud a first
     impression. §R21 (10/07 live phone pass): SFX joins it at 50; R18 deliberately left it at
     70, and the call now is both at 50. A default only ever fills a key the player has never
     set, so anyone who has touched either slider keeps their value. */
  var PREF_DEFAULTS = { version: 1, lang: "en", musicVol: 50, sfxVol: 50, musicMuted: false, sfxMuted: false, track: "Sage's Favourite" };
  window.Prefs = {
    get: function () {
      var raw = prefsBox.load() || {};
      var out = {};
      for (var k in PREF_DEFAULTS) out[k] = raw[k] != null ? raw[k] : PREF_DEFAULTS[k];
      /* migrate the retired on/off booleans → mute states */
      if (raw.musicMuted == null && raw.music === false) out.musicMuted = true;
      if (raw.sfxMuted == null && raw.sfx === false) out.sfxMuted = true;
      return out;
    },
    set: function (patch) {
      var cur = this.get();
      for (var k in patch) cur[k] = patch[k];
      prefsBox.store(cur);
      return cur;
    },
  };
})();
