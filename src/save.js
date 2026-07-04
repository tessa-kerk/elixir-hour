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
    if (!warned) {
      warned = true;
      console.warn("Elixir Hour: browser storage unavailable — progress won't persist beyond this session.", e);
    }
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
  var PREF_DEFAULTS = { version: 1, lang: "en", music: true, sfx: true };
  window.Prefs = {
    get: function () {
      var raw = prefsBox.load() || {};
      var out = {};
      for (var k in PREF_DEFAULTS) out[k] = raw[k] != null ? raw[k] : PREF_DEFAULTS[k];
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
