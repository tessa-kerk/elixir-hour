/* Scroll engine — the whole scrollytelling mechanism, dependency-free.
   Each [data-scene] is a tall wrapper with a sticky pin inside. As the wrapper
   scrolls through its pinned range we compute progress 0..1 and write it to
   --p on the wrapper; the CSS maps --p to opacity/transform (GPU-safe).
   No scroll-jacking: native scroll + position:sticky only.
   Reduced motion / no-JS -> each scene shows its composed frame (data-static). */
(function () {
  var docEl = document.documentElement;
  var mq = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  var reduced = mq ? mq.matches : false;
  var scenes = [].slice.call(document.querySelectorAll("[data-scene]"));
  var breakers = [].slice.call(document.querySelectorAll("[data-breaker]"));
  if (!scenes.length && !breakers.length) return;
  var ticking = false;

  function setStatic() {
    docEl.classList.add("reduce");
    for (var i = 0; i < scenes.length; i++) {
      scenes[i].style.setProperty("--p", scenes[i].getAttribute("data-static") || "1");
    }
    for (var b = 0; b < breakers.length; b++) {
      breakers[b].style.setProperty("--bp", "0");   /* settled, no scroll-scale */
    }
  }

  function update() {
    ticking = false;
    var vh = window.innerHeight || docEl.clientHeight;
    for (var i = 0; i < scenes.length; i++) {
      var w = scenes[i];
      var span = w.offsetHeight - vh;              /* scroll distance while pinned */
      var top = w.getBoundingClientRect().top;
      var p;
      if (span > 0) p = Math.min(Math.max(-top / span, 0), 1);
      else p = top <= 0 ? 1 : 0;
      w.style.setProperty("--p", p.toFixed(4));
    }
    /* breakers: settle from scale 1.03 (--bp 1, entering at the viewport bottom)
       to 1.0 (--bp 0, once the top reaches the viewport top) — a slow scroll
       scale, transform-only */
    for (var b = 0; b < breakers.length; b++) {
      var bt = breakers[b].getBoundingClientRect().top;
      var t = Math.min(Math.max(bt / vh, 0), 1);
      breakers[b].style.setProperty("--bp", t.toFixed(4));
    }
  }

  function onScroll() {
    if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
  }

  function live() {
    docEl.classList.remove("reduce");
    update();
  }

  function apply() {
    /* set the capability flag only once the engine actually wires up — if this
       script fails to load/parse, html stays :not(.js) and the CSS collapses
       the pins to composed frames */
    docEl.classList.add("js");
    if (reduced) setStatic(); else live();
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () { if (reduced) setStatic(); else onScroll(); }, { passive: true });
  window.addEventListener("orientationchange", function () { if (!reduced) onScroll(); }, { passive: true });

  if (mq) {
    var onPref = function () { reduced = mq.matches; apply(); };
    if (mq.addEventListener) mq.addEventListener("change", onPref);
    else if (mq.addListener) mq.addListener(onPref);
  }

  apply();
})();
