/* §R15 share page (/cap). Reads the encoded Night Cap from the URL fragment and
   rebuilds the SAME card client-side using the game's own renderer (NightCap.renderTo)
   + data + assets. No server, no storage — the card lives in the link. Runs after the
   data + nightcap scripts (classic, in order), so everything it needs is defined. */
(function () {
  function byId(id) { return document.getElementById(id); }
  var canvas = byId("cap-canvas");

  function showErr(msg) {
    var e = byId("cap-err");
    if (e) { e.textContent = msg; e.style.display = "block"; }
    /* hide the whole left column (card AND the Download button) — a dangling Download on an
       error path could otherwise save a blank/partial PNG */
    var left = document.querySelector(".cap-left");
    if (left) left.style.display = "none";
  }

  if (!window.NightCap || !NightCap.decodeState || !NightCap.renderTo) {
    showErr("This Night Cap couldn't load. Head to the bar instead.");
    return;
  }
  var frag = (location.hash || "").replace(/^#/, "").trim();
  if (!frag) {
    showErr("This link has no Night Cap in it. Head to the bar instead.");
    return;
  }
  var data;
  try { data = NightCap.decodeState(frag); }
  catch (e) { showErr("This Night Cap link looks broken. Head to the bar instead."); return; }

  /* compose() paints progressively, so Download must stay disabled until the card is finished —
     otherwise an early click saves a blank or truncated PNG with no error (R16 review) */
  var dlBtn = byId("cap-download");
  if (dlBtn) dlBtn.disabled = true;
  NightCap.renderTo(canvas, data).then(function () {
    if (dlBtn) dlBtn.disabled = false;
  }, function () {
    showErr("This Night Cap couldn't be drawn. Head to the bar instead.");
  });

  /* re-render if the hash changes (e.g. two links pasted in one session) */
  window.addEventListener("hashchange", function () { location.reload(); });

  /* §R16: the old empty catch made a failed export look like a dead button. A tainted canvas
     throws SYNCHRONOUSLY from toBlob — which only happens if this page is opened from disk
     (file://); served over http(s) every asset is same-origin and the export is clean. */
  function dlErr(msg) {
    var e = byId("cap-dl-err");
    if (e) { e.textContent = msg; e.style.display = "block"; }
  }
  function saveBlob(blob) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = "elixir-hour-night-cap.png";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  }
  var dl = dlBtn;
  if (dl) dl.addEventListener("click", function () {
    if (dl.disabled) return;
    dlErr("");
    var e = byId("cap-dl-err"); if (e) e.style.display = "none";
    try {
      canvas.toBlob(function (blob) {
        if (blob && blob.size) saveBlob(blob);
        else dlErr(t("nightcap.download.failed"));
      }, "image/png");
    } catch (err) {
      if (window.console) console.warn("cap: download failed", err);
      /* §R17: the share-page download copy is the game's own approved strings (one source of
         truth in strings.js — the page loads it and defaults window.LANG to "en"). SecurityError
         only fires from file://; served over http(s) every asset is same-origin and export is clean. */
      dlErr(t(err && err.name === "SecurityError" ? "nightcap.download.taint" : "nightcap.download.retry"));
    }
  });
})();

/* §R16 — Sage's aside, joined to the sentence it comments on by a single hand-drawn line.
   Lifted from src/tome.js placeArrow(): the same three-curve table and the same rigid
   translate/rotate/scale. Copied rather than re-derived — four rounds of head/tail bugs
   came out of re-deriving it. Two deliberate differences: no stage-scale division (this
   page has no scaled stage), and the stroke takes the aside's ink, since the Tome's
   --sage-deep is tuned for cream paper and would vanish on indigo.
   Lives in its OWN IIFE so the card's error paths above can never skip the marginalia. */
(function () {
  var SVGNS = "http://www.w3.org/2000/svg";
  var SHAFTS = { straight: "M0 0 L100 0", down: "M0 0 Q48 16 100 3", up: "M0 0 Q48 -16 100 -3" };
  var CLEAR = 5;   /* §R18: the line stops a few px short of the sentence — never touches the type, and
                      the same "not welded" convention as the Tome's margin marks (§R18, GAP=4 there) */

  var wrap = document.querySelector(".cap-wrap");
  var svg = document.getElementById("cap-lines");
  var note = document.querySelector(".cap-sage-aside");
  var target = document.getElementById("cap-target");
  if (!wrap || !svg || !note || !target) return;

  function placeLine(x1, y1, x2, y2) {
    var dx = x2 - x1, dy = y2 - y1;
    var dist = Math.sqrt(dx * dx + dy * dy) || 1;
    var ang = Math.atan2(dy, dx) * 180 / Math.PI;
    var kind = Math.abs(dy) > 18 ? "straight" : (dx >= 0 ? "down" : "up");
    var g = document.createElementNS(SVGNS, "g");
    g.setAttribute("transform", "translate(" + x1.toFixed(1) + " " + y1.toFixed(1) +
      ") rotate(" + ang.toFixed(2) + ") scale(" + (dist / 100).toFixed(4) + ")");
    var p = document.createElementNS(SVGNS, "path");
    p.setAttribute("d", SHAFTS[kind]);
    p.setAttribute("vector-effect", "non-scaling-stroke");   /* the <g> carries a scale() */
    g.appendChild(p); svg.appendChild(g);
  }

  /* the point on rect r closest to (x,y) — works whatever side the note ends up on,
     so desktop (note up-right of the sentence) and mobile (note below it) both behave */
  function nearestOn(r, x, y) {
    return { x: Math.min(Math.max(x, r.left), r.right),
             y: Math.min(Math.max(y, r.top), r.bottom) };
  }
  function stepToward(p, tx, ty, pad) {
    var dx = tx - p.x, dy = ty - p.y, L = Math.sqrt(dx * dx + dy * dy) || 1;
    return { x: p.x + dx / L * pad, y: p.y + dy / L * pad };
  }

  /* every GLYPH box on the page that the line must not touch — line boxes, not element
     boxes, so the ragged whitespace beside a short line stays usable */
  function glyphRects(el, out, skipInside) {
    var wk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
    var n;
    while ((n = wk.nextNode())) {
      if (!n.nodeValue.replace(/\s+/g, "")) continue;
      if (skipInside && skipInside.contains(n.parentNode)) continue;
      var rg = document.createRange(); rg.selectNodeContents(n);
      var rs = rg.getClientRects();
      for (var i = 0; i < rs.length; i++) if (rs[i].width > 0.5 && rs[i].height > 0.5) out.push(rs[i]);
    }
  }
  /* text is measured as glyph line boxes (so ragged whitespace beside a short line stays usable),
     but a BUTTON is a painted pill — its box, padding and glow are all visible, so the whole
     element rect blocks. (The R16 review caught the connector crossing the Play pill's padding.) */
  function otherType() {
    var out = [], text = [".cap-wordmark", ".cap-headline", ".cap-body"], pills = [".cap-play", ".cap-dl"];
    var i, els, e;
    for (i = 0; i < text.length; i++) {
      els = document.querySelectorAll(text[i]);
      for (e = 0; e < els.length; e++) glyphRects(els[e], out, target);   /* the target is fair game */
    }
    for (i = 0; i < pills.length; i++) {
      els = document.querySelectorAll(pills[i]);
      for (e = 0; e < els.length; e++) {
        if (els[e].offsetParent === null && getComputedStyle(els[e]).position !== "fixed") continue;
        out.push(els[e].getBoundingClientRect());
      }
    }
    return out;
  }
  /* segment vs padded AABB (slab method) */
  function hitsRect(x1, y1, x2, y2, r, pad) {
    var l = r.left - pad, rt = r.right + pad, tp = r.top - pad, bt = r.bottom + pad;
    var dx = x2 - x1, dy = y2 - y1, t0 = 0, t1 = 1;
    var p = [-dx, dx, -dy, dy], q = [x1 - l, rt - x1, y1 - tp, bt - y1];
    for (var i = 0; i < 4; i++) {
      if (p[i] === 0) { if (q[i] < 0) return false; }
      else {
        var t = q[i] / p[i];
        if (p[i] < 0) { if (t > t1) return false; if (t > t0) t0 = t; }
        else { if (t < t0) return false; if (t < t1) t1 = t; }
      }
    }
    return true;
  }

  function draw() {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var w = wrap.getBoundingClientRect();
    svg.setAttribute("width", Math.round(w.width));
    svg.setAttribute("height", Math.round(w.height));

    var n = note.getBoundingClientRect();
    var rects = target.getClientRects();
    if (!rects.length || !n.width) return;

    var ncx = n.left + n.width / 2, ncy = n.top + n.height / 2;
    var blockers = otherType();

    /* A wrapped clause has several line boxes, and a centred one can sit right above the Play
       button — so don't just take the nearest. Try every line box and a few anchors on each,
       reject any segment that would cross other type, and keep the SHORTEST survivor. That is
       "stays clear of the other text" enforced, not eyeballed. */
    /* The pad relaxes on retry: at a few awkward widths nothing clears 5px, and a MISSING line is
       a worse outcome than a tighter one. It never drops to 0 — the line never touches type. */
    function search(pad) {
      var bestSeg = null, bestLen = Infinity;
      for (var i = 0; i < rects.length; i++) {
        var r = rects[i], my = (r.top + r.bottom) / 2, mx = (r.left + r.right) / 2;
        var anchors = [nearestOn(r, ncx, ncy), { x: r.left, y: my }, { x: r.right, y: my },
                       { x: mx, y: r.top }, { x: mx, y: r.bottom }];
        for (var a = 0; a < anchors.length; a++) {
          var end = stepToward(anchors[a], ncx, ncy, CLEAR);
          var start = stepToward(nearestOn(n, end.x, end.y), end.x, end.y, 4);
          var dx = end.x - start.x, dy = end.y - start.y, len2 = dx * dx + dy * dy;
          if (len2 < 22 * 22 || len2 >= bestLen) continue;   /* too cramped to read as a line */
          var clear = true;
          for (var b = 0; b < blockers.length; b++) {
            if (hitsRect(start.x, start.y, end.x, end.y, blockers[b], pad)) { clear = false; break; }
          }
          if (clear) { bestSeg = { start: start, end: end }; bestLen = len2; }
        }
      }
      return bestSeg;
    }
    var bestSeg = search(5) || search(2);
    if (!bestSeg) {
      if (window.console) console.warn("cap: no clear path for Sage's line — drawing none");
      return;
    }
    placeLine(bestSeg.start.x - w.left, bestSeg.start.y - w.top,
              bestSeg.end.x - w.left, bestSeg.end.y - w.top);
  }

  function schedule() { window.requestAnimationFrame(draw); }
  schedule();
  window.addEventListener("resize", schedule);
  window.addEventListener("orientationchange", schedule);
  /* Caveat loads async — its metrics move the note, so redraw once it lands */
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);
  var sageImg = document.querySelector(".cap-sage-fig img");
  if (sageImg && !sageImg.complete) sageImg.addEventListener("load", schedule);
})();
