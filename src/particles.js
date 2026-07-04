/* Title-screen ambience (GDD §13): drifting Elixir motes + amber embers over
   the establishing scene, so the start screen is never static. Modest count,
   GPU-cheap 2D canvas, pauses when the tab is hidden, and honours
   prefers-reduced-motion by not animating at all. */
window.Particles = (function () {
  var canvas = document.getElementById("fx");
  var ctx = canvas.getContext("2d");
  var W = canvas.width, H = canvas.height;
  /* follow the stage's design space (portrait swaps to 720x1280) */
  function syncSize() {
    var d = window.Stage ? Stage.design() : { W: 1280, H: 720 };
    if (d.W !== W || d.H !== H) { W = canvas.width = d.W; H = canvas.height = d.H; build(); }
  }
  document.addEventListener("stagemode", syncSize);
  var MOTES = 26, EMBERS = 14;
  var mq = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  var reduced = mq ? mq.matches : false;

  var parts = [], raf = null, active = false, last = 0;

  function reset(p, kind, anywhere) {
    p.kind = kind;
    p.x = Math.random() * W;
    p.y = anywhere ? Math.random() * H : H + 10 + Math.random() * 30;
    p.phase = Math.random() * Math.PI * 2;
    if (kind === "mote") {                       /* Elixir motes — --glow #B26AE0 */
      p.r = 2.2 + Math.random() * 3.4;
      p.vy = 8 + Math.random() * 14;             /* px/s, drifting up */
      p.sway = 14 + Math.random() * 22;
      p.alpha = 0.25 + Math.random() * 0.4;
      p.rgb = "178,106,224";
    } else {                                     /* embers — --amber #E8B770 */
      p.r = 1 + Math.random() * 1.8;
      p.vy = 22 + Math.random() * 30;
      p.sway = 6 + Math.random() * 10;
      p.alpha = 0.3 + Math.random() * 0.5;
      p.rgb = "232,183,112";
    }
    return p;
  }

  function build() {
    parts = [];
    for (var i = 0; i < MOTES; i++) parts.push(reset({}, "mote", true));
    for (var j = 0; j < EMBERS; j++) parts.push(reset({}, "ember", true));
  }

  function frame(now) {
    raf = null;
    if (!active || reduced || document.hidden) return;
    var dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      p.y -= p.vy * dt;
      p.phase += dt * (p.kind === "ember" ? 2.4 : 1.1);
      if (p.y < -12) reset(p, p.kind, false);
      var x = p.x + Math.sin(p.phase) * p.sway;
      var flicker = p.kind === "ember" ? 0.65 + 0.35 * Math.sin(p.phase * 3.1) : 1;
      ctx.beginPath();
      ctx.fillStyle = "rgba(" + p.rgb + "," + (p.alpha * flicker).toFixed(3) + ")";
      ctx.arc(x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    raf = window.requestAnimationFrame(frame);
  }

  function start() {
    active = true;                     /* remember intent even under reduced motion */
    if (reduced) { ctx.clearRect(0, 0, W, H); return; }
    if (raf == null && !document.hidden) {
      last = performance.now();
      raf = window.requestAnimationFrame(frame);
    }
  }
  function stop() {
    active = false;
    if (raf != null) { window.cancelAnimationFrame(raf); raf = null; }
    ctx.clearRect(0, 0, W, H);
  }

  /* frame() bails (and drops its RAF) while hidden; resume when visible. */
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden && active && !reduced && raf == null) {
      last = performance.now();
      raf = window.requestAnimationFrame(frame);
    }
  });

  /* Honour prefers-reduced-motion changing mid-session, both directions. */
  if (mq) {
    var onMotionPref = function () {
      reduced = mq.matches;
      if (reduced) {
        if (raf != null) { window.cancelAnimationFrame(raf); raf = null; }
        ctx.clearRect(0, 0, W, H);
      } else if (active && raf == null && !document.hidden) {
        last = performance.now();
        raf = window.requestAnimationFrame(frame);
      }
    };
    if (mq.addEventListener) mq.addEventListener("change", onMotionPref);
    else if (mq.addListener) mq.addListener(onMotionPref);
  }

  build();
  syncSize();
  return {
    start: start, stop: stop,
    running: function () { return active && raf != null; },
    count: function () { return parts.length; },
  };
})();
