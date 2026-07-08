/* The audio system (GDD §14.7 / §16). One music channel (the Bard's Songbook pick)
   + light one-shot SFX. Named `Sound`, not `Audio` (window.Audio is the native ctor
   this uses internally). Same-origin, lazy; a missing file just fails to play
   (caught), never crashes — audio must NEVER stall the game (P0 06-07).

   VOLUME (round 12, GDD §11): two independent 0-100 sliders + a mute each, stored
   in Prefs. The slider % scales a per-channel ceiling so the DEFAULT (70%) lands on
   the levels Tessa signed off (music ~0.5, sfx ~0.6) with headroom above. Muted OR
   slider-at-0 = silent. Volume applies LIVE.

   LOOPING: every track ends in a natural fade-out, so a hard `loop` would leave an
   audible gap. Instead each track lives on TWO stacked <audio> elements and loops
   via a ~2s end-to-start CROSSFADE — the tail of one pass overlaps the head of the
   next, so the seam is inaudible. Music fades down/up (~1s) when the bar quiets
   (title, rest); the duck stays applied as a multiplier until play starts — opening
   Settings never lifts it (R13), the slider % just changes the underlying level. */
window.Sound = (function () {
  var MUSIC_BASE = "assets/audio/";
  var SFX = {
    "mug-clink": "assets/audio/sfx/mug-clink.mp3",
    "brew-fizz": "assets/audio/sfx/brew-fizz.mp3",
    "page-turn": "assets/audio/sfx/page-turn.mp3",
    "quill":     "assets/audio/sfx/quill.mp3",
  };
  /* slider% × ceiling = gain. 70% → ~0.5 music / ~0.6 sfx (the approved levels). */
  var MUSIC_CEIL = 0.72, SFX_CEIL = 0.85;
  var DUCK_RATIO = 0.28;   // ducked music = 28% of its live level (~0.14 at default)
  var FADE_MS = 1000;      // duck fade duration
  var XFADE = 2.0;         // seconds of end-to-start loop crossfade

  var layers = null;         // [Audio, Audio] — the crossfade pair
  var active = 0;            // index of the foreground layer
  var ramps = [null, null];  // per-layer volume-ramp timers
  var currentTrack = null;
  var ducked = false, xfading = false;
  var bufTimer = null;
  var sfxCache = {}, lastSfx = null, noted = {};

  function prefs() { return (window.Prefs && Prefs.get) ? Prefs.get() : { musicVol: 70, sfxVol: 70, musicMuted: false, sfxMuted: false, track: null }; }
  function musicGain() { var p = prefs(); return (p.musicMuted || +p.musicVol <= 0) ? 0 : (+p.musicVol / 100) * MUSIC_CEIL; }
  function sfxGain() { var p = prefs(); return (p.sfxMuted || +p.sfxVol <= 0) ? 0 : (+p.sfxVol / 100) * SFX_CEIL; }
  function musicOn() { return musicGain() > 0; }
  /* the duck is a multiplier that stays applied until play starts — opening
     Settings NEVER lifts it (round 13: raising volume is the player's own act). */
  function targetVol() { var g = musicGain(); return ducked ? g * DUCK_RATIO : g; }

  function note(key, msg) {
    if (noted[key] || !window.console) return;
    noted[key] = 1;
    (console.info || console.log).call(console, "Elixir Hour audio: " + msg);
  }

  function ensure() {
    if (layers) return layers;
    layers = [new window.Audio(), new window.Audio()];
    for (var i = 0; i < 2; i++) {
      var m = layers[i];
      m.preload = "metadata"; m.volume = 0; m.loop = false;   /* stream on play; loop is handled by the crossfade */
      m.addEventListener("timeupdate", onTimeUpdate);
      m.addEventListener("error", (function (el) {
        return function () {
          var src = el.getAttribute("src") || "";
          if (src) note("musicerr:" + src, "music '" + src + "' didn't load — channel silent (drop the file at " + MUSIC_BASE + " and it plays).");
        };
      })(m));
    }
    return layers;
  }

  function trackFile(name) {
    var sb = window.SONGBOOK || [];
    for (var i = 0; i < sb.length; i++) if (sb[i].name === name) return sb[i].file || "";
    return "";
  }

  /* ramp layer[idx] volume to `to` over `ms`, then done() (native volume can't CSS-transition) */
  function ramp(idx, to, ms, done) {
    if (ramps[idx]) { clearInterval(ramps[idx]); ramps[idx] = null; }
    var m = layers[idx], from = m.volume, steps = Math.max(1, Math.round(ms / 40)), i = 0;
    if (steps <= 1) { m.volume = Math.max(0, Math.min(1, to)); if (done) done(); return; }
    ramps[idx] = setInterval(function () {
      i++;
      m.volume = Math.max(0, Math.min(1, from + (to - from) * (i / steps)));
      if (i >= steps) { clearInterval(ramps[idx]); ramps[idx] = null; if (done) done(); }
    }, 40);
  }

  /* start the OTHER layer from 0 and crossfade the current tail into it over `remainMs` */
  function beginCrossfade(remainMs) {
    if (xfading || !layers) return;
    xfading = true;
    var old = active, nxt = 1 - active, nel = layers[nxt];
    try { nel.currentTime = 0; } catch (e) {}
    nel.volume = 0;
    var p = nel.play(); if (p && p.catch) p.catch(function () {});
    ramp(old, 0, remainMs);
    ramp(nxt, targetVol(), remainMs, function () {
      try { layers[old].pause(); layers[old].currentTime = 0; } catch (e) {}
      active = nxt; xfading = false;
    });
  }

  /* seamless loop: when the active layer nears its (fading-out) end, crossfade into
     a fresh pass on the other layer — no gap, no restart pop. */
  function onTimeUpdate() {
    if (xfading || !layers) return;
    var m = layers[active];
    if (!m.duration || m.paused) return;
    if (m.duration - m.currentTime <= XFADE) beginCrossfade(Math.max(300, (m.duration - m.currentTime) * 1000));
  }

  /* if the music is meant to play but hasn't actually started shortly after we ask,
     say so (a tiny note) rather than leaving the player with silent nothing (§16 R12) */
  function flagBuffering() {
    var m = layers && layers[active];
    if (bufTimer) { clearTimeout(bufTimer); bufTimer = null; }
    if (!m || !m.getAttribute("src")) return;
    bufTimer = window.setTimeout(function () {
      bufTimer = null;
      /* only when playback is actually under way but under-buffered — NOT when
         autoplay is blocked (pre-gesture) or the file 404s: both leave paused=true,
         so this would otherwise false-fire on the title + spam on every screen change */
      if (!m.paused && m.readyState < 3) {
        var msg = (window.t) ? t("audio.loading") : "Music loading…";
        if (window.Screens && Screens.toast) Screens.toast(msg);
      }
    }, 600);
  }

  /* start (or keep) the music at its current target level, honouring mute/volume */
  function startMusic() {
    if (!layers) return;
    if (!musicOn()) { pauseMusic(); return; }
    var m = layers[active];
    if (!m.getAttribute("src")) return;                 /* no file yet — nothing to play */
    var p = m.play(); if (p && p.catch) p.catch(function () {});   /* autoplay-blocked → retried on gesture */
    ramp(active, targetVol(), 300);
    flagBuffering();
  }
  function pauseMusic() { if (layers) { layers[0].pause(); layers[1].pause(); } }
  function applyMusicPref() { ensure(); startMusic(); }

  /* switch the bar's tune. Loads the SAME file into both layers so the loop can swap. */
  function setTrack(name) {
    ensure();
    currentTrack = name;
    var file = trackFile(name);
    if (!file) {
      layers[0].removeAttribute("src"); layers[1].removeAttribute("src");
      note("nomusic:" + name, "no music file for '" + name + "' — channel silent (set SONGBOOK[].file).");
      return;
    }
    var full = MUSIC_BASE + file;
    xfading = false; layers[0].pause(); layers[1].pause();
    for (var i = 0; i < 2; i++) { if (layers[i].getAttribute("src") !== full) layers[i].src = full; layers[i].volume = 0; }
    active = 0;
    try { layers[0].currentTime = 0; } catch (e) {}
    startMusic();
  }

  /* live volume — re-apply the current music level (drag, mute, screen change) */
  function applyMusicLevel() {
    ensure();
    if (!musicOn()) { pauseMusic(); return; }
    if (layers[active].paused) { startMusic(); return; }
    ramp(active, targetVol(), 90);
  }

  /* fade the bar's music down (~1s) when it quiets, back up on return to play */
  function duck(down) {
    ensure();
    ducked = !!down;
    if (!layers[active].getAttribute("src") || !musicOn()) { if (!musicOn()) pauseMusic(); return; }
    if (layers[active].paused) { startMusic(); return; }
    ramp(active, targetVol(), FADE_MS);
  }
  /* called from the screen switcher: the bar quiets on the title + rest screens */
  function onScreen(name) { duck(name === "title" || name === "nightend"); }

  /* one-shot SFX, gated by the SFX volume, wrapped so it can never throw into the caller */
  function sfx(name) {
    lastSfx = name;
    try {
      var gain = sfxGain();
      if (gain <= 0) return;
      var path = SFX[name];
      if (!path) return;
      var a = sfxCache[name];
      if (!a) {
        a = sfxCache[name] = new window.Audio(path);
        a.addEventListener("error", function () {
          note("nosfx:" + name, "no SFX file at " + path + " yet — this cue stays silent (drop the file and it plays).");
        });
      }
      a.volume = Math.max(0, Math.min(1, gain));
      try { a.currentTime = 0; } catch (e) {}
      var p = a.play();
      if (p && p.catch) p.catch(function () {
        note("nosfx:" + name, "no SFX file at " + path + " yet — this cue stays silent (drop the file and it plays).");
      });
    } catch (e) { /* audio never blocks the game */ }
  }
  /* audible feedback for the SFX slider — a mug-clink at the just-chosen level */
  function previewSfx() { sfx("mug-clink"); }

  function refresh() {
    var pick = prefs().track || (window.SONGBOOK && window.SONGBOOK[0] && window.SONGBOOK[0].name) || null;
    if (pick && pick !== currentTrack) setTrack(pick);
    else applyMusicPref();
  }

  /* browsers block audio until a gesture — retry the music start on first interaction */
  function onFirstGesture() {
    document.removeEventListener("pointerdown", onFirstGesture, true);
    document.removeEventListener("keydown", onFirstGesture, true);
    ensure();
    startMusic();
  }
  document.addEventListener("pointerdown", onFirstGesture, true);
  document.addEventListener("keydown", onFirstGesture, true);

  return {
    setTrack: setTrack, pauseMusic: pauseMusic, applyMusicPref: applyMusicPref,
    applyMusicLevel: applyMusicLevel, previewSfx: previewSfx,
    sfx: sfx, refresh: refresh, duck: duck, onScreen: onScreen,
    _state: function () {
      return { currentTrack: currentTrack, lastSfx: lastSfx, xfading: xfading, active: active,
               ducked: ducked,
               musicGain: +musicGain().toFixed(3), sfxGain: +sfxGain().toFixed(3),
               musicPaused: layers ? layers[active].paused : true,
               musicSrc: layers ? (layers[active].getAttribute("src") || "") : "",
               layerA: layers ? { t: +layers[0].currentTime.toFixed(1), v: +layers[0].volume.toFixed(2), paused: layers[0].paused } : null,
               layerB: layers ? { t: +layers[1].currentTime.toFixed(1), v: +layers[1].volume.toFixed(2), paused: layers[1].paused } : null };
    },
  };
})();
