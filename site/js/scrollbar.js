/* Overlay scrollbar thumb (see css/scrollbar.css for the why).

   Hides the native page bar and draws one fixed <div> at the right edge whose
   height is the viewport/document ratio and whose offset tracks scrollY. Native
   scrolling is untouched: no preventDefault on wheel/keys, no smooth-scroll
   library, no scroll-jacking. Keyboard scrolling and focus outlines are
   unaffected — this is an indicator, and a drag handle, nothing more.

   Guards: fine-pointer + hover only (touch keeps its native overlay bar); if
   this script never runs, `html.sb-overlay` is never set and the native bar
   stays exactly as it was. Any failure degrades to "native scrolling, no
   custom indicator" — never to a broken bar. */
(function () {
  "use strict";

  var mq = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)");
  if (!mq || !mq.matches) return;              /* touch / no mouse: leave it native */

  var doc = document.documentElement;
  var MIN_H = 40;      /* never let the thumb shrink below this */
  var PAD = 8;         /* inset from the top/bottom of the viewport */
  var HOT = 24;        /* right-edge hover zone that summons the thumb */
  var HIDE_MS = 700;   /* fade out this long after scrolling stops */

  var thumb = document.createElement("div");
  thumb.className = "sb-thumb";
  thumb.setAttribute("aria-hidden", "true");

  var maxScroll = 0, trackH = 0, thumbH = 0;
  var raf = 0, hideTO = null, dragging = false, startY = 0, startScroll = 0;

  /* cache the layout metrics — scrollHeight forces a reflow, so don't read it
     every frame; refresh on resize and whenever the document grows (lazy imgs) */
  function refresh() {
    var vh = window.innerHeight;
    var dh = doc.scrollHeight;
    maxScroll = dh - vh;
    if (maxScroll <= 0) { thumb.style.display = "none"; return false; }
    thumb.style.display = "";
    trackH = vh - PAD * 2;
    thumbH = Math.max(MIN_H, Math.round(trackH * (vh / dh)));
    thumb.style.height = thumbH + "px";
    return true;
  }

  function place() {
    raf = 0;
    if (maxScroll <= 0) return;
    var p = window.scrollY / maxScroll;
    if (p < 0) p = 0; else if (p > 1) p = 1;
    thumb.style.transform = "translateY(" + (PAD + p * (trackH - thumbH)) + "px)";
  }

  function schedule() { if (!raf) raf = window.requestAnimationFrame(place); }

  function show() {
    thumb.classList.add("on");
    if (hideTO) { window.clearTimeout(hideTO); hideTO = null; }
  }

  function autoHide() {
    if (hideTO) window.clearTimeout(hideTO);
    hideTO = window.setTimeout(function () {
      if (!dragging) thumb.classList.remove("on");
    }, HIDE_MS);
  }

  function onScroll() { schedule(); show(); autoHide(); }

  function onResize() { if (refresh()) schedule(); }

  function onMouseMove(e) {
    if (dragging) return;
    if (e.clientX >= window.innerWidth - HOT) { show(); autoHide(); }
  }

  /* ---- drag: map pointer travel along the track onto scrollTop ---- */
  function onPointerDown(e) {
    if (e.button !== 0 || maxScroll <= 0) return;
    dragging = true;
    startY = e.clientY;
    startScroll = window.scrollY;
    thumb.classList.add("drag");
    show();
    /* capture so a fast drag that outruns the 8px thumb doesn't drop */
    try { thumb.setPointerCapture(e.pointerId); } catch (err) {}
    e.preventDefault();
  }

  function onPointerMove(e) {
    if (!dragging) return;
    var travel = trackH - thumbH;
    if (travel <= 0) return;
    window.scrollTo(0, startScroll + (e.clientY - startY) * (maxScroll / travel));
  }

  function onPointerUp(e) {
    if (!dragging) return;
    dragging = false;
    thumb.classList.remove("drag");
    try { thumb.releasePointerCapture(e.pointerId); } catch (err) {}
    autoHide();
  }

  function init() {
    doc.classList.add("sb-overlay");     /* only now is the native bar hidden */
    document.body.appendChild(thumb);
    refresh();
    place();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    thumb.addEventListener("pointerdown", onPointerDown);
    thumb.addEventListener("pointermove", onPointerMove);
    thumb.addEventListener("pointerup", onPointerUp);
    thumb.addEventListener("pointercancel", onPointerUp);

    /* the document grows as lazy images decode — keep the thumb honest */
    if (window.ResizeObserver) new window.ResizeObserver(onResize).observe(document.body);
    else window.addEventListener("load", onResize);
  }

  if (document.body) init();
  else document.addEventListener("DOMContentLoaded", init);
}());
