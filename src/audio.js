/* The audio system (GDD §14.7 / §16 build note): one looping tavern-ambient
   music channel (the Bard's Songbook pick) + light one-shot SFX (mug clink,
   brew fizz, page turn). Wire the SYSTEM now; the real audio files drop in
   later (§16 — not a build blocker), so with empty file slots this plays
   silently but every hook, pref gate and track switch already works.

   Named `Sound`, not `Audio` — `window.Audio` is the native element ctor,
   which this uses internally. Everything is same-origin and lazy; a missing
   file just fails to play (caught), never crashes. */
window.Sound = (function () {
  var MUSIC_BASE = "assets/audio/";
  /* SFX slots — files land in Milestone 7's audio drop; paths are stable now */
  var SFX = {
    "mug-clink": "assets/audio/sfx/mug-clink.mp3",
    "brew-fizz": "assets/audio/sfx/brew-fizz.mp3",
    "page-turn": "assets/audio/sfx/page-turn.mp3",
  };
  var MUSIC_VOL = 0.5, SFX_VOL = 0.6;

  var music = null;          // the looping music element
  var currentTrack = null;   // the Songbook pick currently loaded
  var sfxCache = {};
  var lastSfx = null;        // last SFX name requested (for tests)
  var noted = {};            // one-time console notes (never spam, never an error)

  function prefs() { return (window.Prefs && Prefs.get) ? Prefs.get() : { music: true, sfx: true, track: null }; }

  /* a silent channel is expected until the audio files land — say so ONCE,
     as an info note, never an error (GDD §16: the game runs clean before the
     files exist; the day they arrive it's a file-drop, zero code) */
  function note(key, msg) {
    if (noted[key] || !window.console) return;
    noted[key] = 1;
    (console.info || console.log).call(console, "Elixir Hour audio: " + msg);
  }

  function ensureMusic() {
    if (music) return music;
    music = new window.Audio();
    music.loop = true;
    music.preload = "auto";
    music.volume = MUSIC_VOL;
    music.addEventListener("error", function () {
      var src = music.getAttribute("src") || "";
      if (src) note("musicerr:" + src, "music track '" + src + "' didn't load — channel stays silent (drop the file at " + MUSIC_BASE + " and it plays, zero code).");
    });
    return music;
  }

  function trackFile(name) {
    var sb = window.SONGBOOK || [];
    for (var i = 0; i < sb.length; i++) if (sb[i].name === name) return sb[i].file || "";
    return "";
  }

  function tryPlay() {
    if (!music) return;
    if (!music.getAttribute("src")) return;        /* no audio file yet — nothing to play */
    var p = music.play();
    if (p && p.catch) p.catch(function () {});      /* autoplay blocked → retried on next gesture */
  }

  /* switch the bar's tune (Bard's Songbook). Remembers the pick even when the
     track has no audio file yet, so the plumbing is correct for the M7 drop. */
  function setTrack(name) {
    ensureMusic();
    currentTrack = name;
    var file = trackFile(name);
    if (!file) {
      music.removeAttribute("src");
      note("nomusic:" + name, "no music file for '" + name + "' yet — channel silent (set SONGBOOK[].file in data/tome.js when the track lands). Expected, not an error.");
      return;
    }
    var full = MUSIC_BASE + file;
    if (music.getAttribute("src") !== full) { music.src = full; }
    if (prefs().music) tryPlay();
  }

  function pauseMusic() { if (music) music.pause(); }

  /* apply the Music on/off pref (called from Settings + on boot) */
  function applyMusicPref() {
    ensureMusic();
    if (prefs().music) tryPlay(); else pauseMusic();
  }

  /* one-shot SFX, gated by the Sound-effects pref. Wrapped whole so audio can
     NEVER throw into its caller — SFX fire from the brew/flip critical path, and
     a sound failure must never stall the game (P0 06-07). */
  function sfx(name) {
    lastSfx = name;
    try {
      if (!prefs().sfx) return;
      var path = SFX[name];
      if (!path) return;
      var a = sfxCache[name];
      if (!a) {
        a = sfxCache[name] = new window.Audio(path);
        a.volume = SFX_VOL;
        a.addEventListener("error", function () {
          note("nosfx:" + name, "no SFX file at " + path + " yet — this cue stays silent (drop the file and it plays, zero code). Expected, not an error.");
        });
      }
      try { a.currentTime = 0; } catch (e) {}
      var p = a.play();
      if (p && p.catch) p.catch(function () {
        note("nosfx:" + name, "no SFX file at " + path + " yet — this cue stays silent (drop the file and it plays, zero code). Expected, not an error.");
      });
    } catch (e) { /* audio never blocks the game */ }
  }

  /* sync to the current prefs + Songbook pick (boot, and after a pref change) */
  function refresh() {
    var pick = prefs().track || (window.SONGBOOK && window.SONGBOOK[0] && window.SONGBOOK[0].name) || null;
    if (pick && pick !== currentTrack) setTrack(pick);
    else applyMusicPref();
  }

  /* browsers block audio until a user gesture — retry the (music) start on the
     first interaction, then stop listening */
  function onFirstGesture() {
    document.removeEventListener("pointerdown", onFirstGesture, true);
    document.removeEventListener("keydown", onFirstGesture, true);
    if (prefs().music) tryPlay();
  }
  document.addEventListener("pointerdown", onFirstGesture, true);
  document.addEventListener("keydown", onFirstGesture, true);

  return {
    setTrack: setTrack, pauseMusic: pauseMusic, applyMusicPref: applyMusicPref,
    sfx: sfx, refresh: refresh,
    /* test/inspection hook */
    _state: function () {
      return { currentTrack: currentTrack, lastSfx: lastSfx,
               musicPaused: music ? music.paused : true,
               musicSrc: music ? (music.getAttribute("src") || "") : "" };
    },
  };
})();
