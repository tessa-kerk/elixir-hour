/* Hero ambience — drifting Elixir motes + amber embers over the establishing
   scene, ported from the game's title screen (src/particles.js, GDD §13).
   GPU-cheap 2D canvas, pauses when the tab is hidden OR the hero is scrolled
   out of view, and honours prefers-reduced-motion (no animation) live. */
(function () {
  var canvas = document.getElementById("hero-fx");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");
  var W = 0, H = 0, dpr = 1;
  var mq = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  var reduced = mq ? mq.matches : false;
  var parts = [], raf = null, active = true, onscreen = true, last = 0;

  function counts() {
    var area = W * H;                       /* density scales with the hero area */
    var motes = Math.max(16, Math.min(40, Math.round(area / 32000)));
    var embers = Math.round(motes * 0.55);
    return { motes: motes, embers: embers };
  }

  function reset(p, kind, anywhere) {
    p.kind = kind;
    p.x = Math.random() * W;
    p.y = anywhere ? Math.random() * H : H + 10 + Math.random() * 30;
    p.phase = Math.random() * Math.PI * 2;
    if (kind === "mote") {                   /* Elixir motes — --glow #B26AE0 */
      p.r = (2.2 + Math.random() * 3.4);
      p.vy = 8 + Math.random() * 14;
      p.sway = 14 + Math.random() * 22;
      p.alpha = 0.22 + Math.random() * 0.38;
      p.rgb = "178,106,224";
    } else {                                 /* embers — --amber #E8B770 */
      p.r = (1 + Math.random() * 1.8);
      p.vy = 22 + Math.random() * 30;
      p.sway = 6 + Math.random() * 10;
      p.alpha = 0.28 + Math.random() * 0.48;
      p.rgb = "232,183,112";
    }
    return p;
  }

  function build() {
    var c = counts();
    parts = [];
    for (var i = 0; i < c.motes; i++) parts.push(reset({}, "mote", true));
    for (var j = 0; j < c.embers; j++) parts.push(reset({}, "ember", true));
  }

  function size() {
    var r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(1, Math.round(r.width));
    H = Math.max(1, Math.round(r.height));
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
  }

  function running() { return active && onscreen && !reduced && !document.hidden; }

  function frame(now) {
    raf = null;
    if (!running()) return;
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

  function kick() {
    if (raf == null && running()) {
      last = window.performance ? performance.now() : Date.now();
      raf = window.requestAnimationFrame(frame);
    }
    if (reduced) ctx.clearRect(0, 0, W, H);
  }
  function halt() { if (raf != null) { window.cancelAnimationFrame(raf); raf = null; } }

  /* pause when the hero canvas leaves the viewport */
  if (window.IntersectionObserver) {
    new IntersectionObserver(function (es) {
      onscreen = es[0].isIntersecting;
      if (onscreen) kick(); else halt();
    }, { threshold: 0 }).observe(canvas);
  }
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) halt(); else kick();
  });
  if (mq) {
    var onPref = function () {
      reduced = mq.matches;
      if (reduced) { halt(); ctx.clearRect(0, 0, W, H); } else kick();
    };
    if (mq.addEventListener) mq.addEventListener("change", onPref);
    else if (mq.addListener) mq.addListener(onPref);
  }
  var rt;
  window.addEventListener("resize", function () {
    clearTimeout(rt); rt = setTimeout(function () { size(); }, 160);
  }, { passive: true });

  size();
  kick();

  /* small control handle — lets tooling freeze the drift for a stable
     screenshot; no effect on normal use */
  window.HeroFX = {
    stop: function () { active = false; halt(); },
    start: function () { active = true; kick(); }
  };
})();
