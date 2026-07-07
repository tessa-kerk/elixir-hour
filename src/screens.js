/* Screen renderers. All screens are real as of Milestone 6 (title, herald,
   serve composite, group ensemble, split duologue, night end, epilogue
   Herald). All UI chrome text via t(); dialogue/content stays English until
   the M7 content-localisation pass. */
window.Screens = (function () {
  function el(id) { return document.getElementById(id); }

  /* One-time static text fill (called from boot). */
  function fillStatic() {
    el("btn-start").textContent = t("title.start");
    el("btn-continue").textContent = t("title.continue");
    el("btn-settings").textContent = t("title.settings");
    el("herald-continue").textContent = t("herald.continue");
    el("panel-info").textContent = "i";
    el("panel-info").title = t("panel.tome.tooltip");
    if (window.Brew) Brew.refreshText();
    el("btn-totitle").textContent = t("epilogue.totitle");
    el("btn-savequit").textContent = t("night.savequit");
    el("tomeclose").textContent = t("tome.close");
    el("btn-nightcap-end").textContent = t("nightcap.keep");
    el("btn-nightcap-epi").textContent = t("nightcap.keep");
    el("nightcap-download").textContent = t("nightcap.download");
    el("nightcap-share").textContent = t("nightcap.share");
    el("nightcap-close").textContent = t("nightcap.close");
    var adv = document.querySelectorAll("[data-advance]");
    for (var i = 0; i < adv.length; i++) adv[i].textContent = t("advance");
    /* visible build stamp (title corner) — lets Tessa confirm which build
       loaded; bumped in lockstep with the ?v= cache token (see strings.js). */
    var stamp = el("build-stamp");
    if (stamp && window.buildLabel) stamp.textContent = buildLabel();
    /* in-game menu tray (§11) */
    el("menu-title").textContent = t("menu.title");
    el("menu-resume").textContent = t("menu.resume");
    el("menu-tome").textContent = t("menu.tome");
    el("menu-settings").textContent = t("menu.settings");
    el("menu-savequit").textContent = t("menu.savequit");
    el("menu-note").textContent = t("menu.note");
  }

  /* the title's Continue button names where you left off — "Continue — Night 2:
     The Draw" (GDD §11) — so a returning player knows what they're resuming. */
  function renderTitle() {
    var s = Save.exists() ? Save.load() : null;
    el("btn-continue").disabled = !s;
    if (s) {
      var n = typeof s.night === "number" ? s.night : 1;
      var nd = null, ns = window.NIGHTS || [];
      for (var i = 0; i < ns.length; i++) if (ns[i].night === n) nd = ns[i];
      var label = t("night.label", { n: n }) + (nd && nd.title ? ": " + nd.title : "");
      el("btn-continue").textContent = t("continue.named", { label: label });
    } else {
      el("btn-continue").textContent = t("title.continue");
    }
    Particles.start();
  }
  function leaveTitle() { Particles.stop(); }

  function renderHerald(night) {
    var ed = null;
    var eds = window.HERALD_EDITIONS || [];
    for (var i = 0; i < eds.length; i++) if (eds[i].night === night) ed = eds[i];
    el("herald-masthead").textContent = t("herald.masthead");
    el("herald-ed").textContent = ed ? ed.ed : "";
    el("herald-head").textContent = ed ? ed.head : "";
    el("herald-story").textContent = ed ? ed.story : "";
  }

  /* ---- Serve screen: the two-layer composite (GDD §12) ----
     One counter-line Y and one horizontal anchor for the whole cast
     (Stage.composite()). Each cutout is anchored by its measured torso-base
     fraction to the counter line — never by hands or the lowest pixel — and
     sized so the figure (top→base span) fills the cast height. A standardised
     contact-shadow ellipse sits on the counter beneath. */
  var lastServe = null;
  var orderFullHtml = "";   /* full request behind a trimmed Order Strip line (§7 tap-for-full) */

  /* Solo serve customer (§12 new canon, round 9). The whole screen is one of Tessa's
     pre-baked, hand-grounded scenes — no compositing, no anchors, no shadows. An
     expression change swaps the whole image, cross-faded between two stacked #ms
     layers; the backgrounds are pixel-identical so the bar stays dead still and only
     the character dissolves. lastServe.headTopY (from the per-character head fraction)
     anchors the speech bubble just above the face. */
  var sceneLayers = null, sceneActive = 0;
  function setServeCustomer(who, exprName) {
    if (!sceneLayers) sceneLayers = [el("ms-img"), el("ms-img2")];
    if (!who || !window.CAST[who]) { lastServe = null; return; }
    var c = window.CAST[who];
    var names = [];
    for (var k in c.exprs) names.push(k);
    if (!exprName || !c.exprs[exprName]) exprName = names[0];
    var base = c.exprs[exprName];
    lastServe = { who: who, expr: exprName, headTopY: (c.head || 0.25) * Stage.design().H };
    crossfadeScene(window.serveScenePath(base));
  }
  /* fade a new scene in over the current one (~160ms via .scene-layer transition) */
  function crossfadeScene(path) {
    var cur = sceneLayers[sceneActive], nxt = sceneLayers[1 - sceneActive];
    if (cur.getAttribute("src") === path) return;              /* already showing it */
    if (!cur.getAttribute("src")) { cur.src = path; cur.style.opacity = 1; return; }   /* first show: no fade */
    nxt.style.opacity = 0;
    nxt.onload = function () { nxt.style.opacity = 1; cur.style.opacity = 0; };
    nxt.src = path;
    sceneActive = 1 - sceneActive;
  }

  /* One dialogue line in the bubble. html is pre-formatted (escaped) by the
     caller; the bubble sits bottom-anchored just above the figure's
     head/horns (figure top = counterY - charH by construction). The tail
     only shows when the on-screen customer is speaking. */
  function serveLine(name, colour, html, withTail) {
    var comp = Stage.composite();
    var bub = el("serve-bubble");
    el("serve-speaker").textContent = name || "";
    el("serve-speaker").style.color = colour;
    el("serve-speaker").style.display = name ? "" : "none";
    el("serve-line").innerHTML = html;
    bub.classList.toggle("notail", !withTail);
    bub.style.top = "auto";
    /* anchor the bubble bottom just above the speaker's head-top (#3): never
       covers the face, and tracks the head when the cast is lowered. */
    var headTop = (lastServe && lastServe.headTopY != null) ? lastServe.headTopY : (comp.counterY - comp.charH);
    bub.style.bottom = (Stage.design().H - headTop + 12) + "px";
    bub.classList.add("on");
    /* clamp (Fix 8): a long line grows the bottom-anchored bubble upward and can
       push its top off the stage. If it would clip, pin the top just inside the
       stage and let the bubble grow downward instead. */
    if (bub.offsetTop < 8) { bub.style.top = "8px"; bub.style.bottom = "auto"; }
  }
  function hideServeBubble() { el("serve-bubble").classList.remove("on"); }
  /* the Order Strip text (§7) — the customer's order in their own words, shown
     on the strip above the mixing panel while a brew beat is live. `shortHtml`
     is the curated trimmed line (or the full nudge when short enough); `fullHtml`
     is the complete request. When they differ, the strip is tappable and a tap
     opens a popover with the full request (grows UPWARD over the scene so it never
     reflows the panel — a reflow would re-open the Pour-overflow P0). Empty text
     (between beats / cleared on pour) hides the strip rather than showing a blank bar;
     every live gate carries text, including the Night-3 consequence gate (round-7). */
  function setOrderText(shortHtml, fullHtml) {
    var e = el("order-text"); if (e) e.innerHTML = shortHtml || "";
    orderFullHtml = (fullHtml && fullHtml !== shortHtml) ? fullHtml : "";
    var f = el("order-full"); if (f) f.innerHTML = orderFullHtml;
    var strip = el("order-strip");
    if (strip) {
      strip.classList.toggle("order-empty", !shortHtml);
      strip.classList.toggle("has-more", !!orderFullHtml);
    }
    var pf = el("panel-frame"); if (pf) pf.classList.remove("order-open");   /* collapse any open popover on a new/blank order */
  }
  /* the face currently shown on the serve customer — the dialogue engine reads
     it to restore a pre-choice expression after a branch-local swap (#11). */
  function currentServeExpr() { return lastServe ? lastServe.expr : null; }
  /* how many rendered lines a bubble's text element currently occupies — the
     dialogue engine's paginator measures the real, laid-out element (bubble
     already visible at its final width) so pagination works for every bubble
     type (§11 bubble pagination). */
  function bubbleLineCount(sel) {
    var e = document.querySelector(sel);
    if (!e) return 1;
    var cs = window.getComputedStyle(e);
    var lh = parseFloat(cs.lineHeight);
    if (!lh || isNaN(lh)) lh = parseFloat(cs.fontSize) * 1.4;
    return Math.max(1, Math.round(e.offsetHeight / lh));
  }

  /* Sage's own spoken bubble (Fix 4): bottom-LEFT, sage-tinted, no tail toward
     the customer — the keeper is behind the counter, not the customer above it.
     CSS-positioned (fixed bottom-left), decoupled from the cast anchor, so it
     renders correctly even with no customer figure (e.g. the opening monologue). */
  function sageLine(html) {
    el("sage-line").innerHTML = html;
    el("sage-bubble").classList.add("on");
  }
  function hideSageBubble() { el("sage-bubble").classList.remove("on"); }

  function serveChoices(prompt, options, cb) {
    var box = el("serve-choices");
    box.innerHTML = "";
    var p = document.createElement("div");
    p.className = "choice-prompt";
    p.textContent = prompt;
    box.appendChild(p);
    for (var i = 0; i < options.length; i++) {
      (function (idx) {
        var b = document.createElement("button");
        b.className = "choice-btn";
        b.textContent = options[idx].label;
        b.addEventListener("click", function (ev) { ev.stopPropagation(); cb(idx); });
        box.appendChild(b);
      })(i);
    }
    box.classList.add("on");
  }
  function hideServeChoices() { el("serve-choices").classList.remove("on"); }

  /* dev-bar preview (Milestone 2 behaviour) */
  function renderServe(who, exprName) {
    setServeCustomer(who, exprName);
    var c = window.CAST[who];
    if (c) serveLine(who, c.colour, (c.demoLine || "").replace(/&/g, "&amp;").replace(/</g, "&lt;"), true);
  }

  /* re-place the anchored layers when the stage flips landscape/portrait */
  document.addEventListener("stagemode", function () {
    if (lastServe && document.getElementById("screen-serve").classList.contains("active")) {
      setServeCustomer(lastServe.who, lastServe.expr);
    }
  });

  /* a brief cream toast (e.g. storage-unavailable) — shown in-game, never
     console-only (GDD §13; P0 06-07) */
  var toastTimer = null;
  function toast(msg) {
    var t2 = el("toast");
    if (!t2 || !msg) return;
    t2.textContent = msg;
    t2.classList.add("on");
    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { t2.classList.remove("on"); }, 5600);
  }

  function renderNightEnd(night, hasNext) {
    el("nightend-title").textContent = t("night.complete", { n: night });
    var next = el("btn-nextnight");
    next.hidden = !hasNext;
    if (hasNext) next.textContent = t("night.begin", { n: night + 1 });
  }

  /* ---- Group screen (Layout 3, GDD §11): the whole room at the bar ----
     Wide ensemble, no mixing UI. Same composite discipline as the serve
     screen: every cutout anchored by its measured torso-base to ONE counter
     line, one standardised contact shadow each; the row spreads across the
     counter. The bubble sits above whoever is speaking. */
  var groupCast = {};          /* who → { cx, topY } head anchors */
  var lastGroup = null;

  /* Round 9: the finale is Tessa's ready-made Group Scene V2 (all five hand-grounded
     in ONE image). No per-character placement — just the image, the bubble anchored
     above whoever speaks. Head anchors measured off the V2 art (design px, landscape). */
  var GROUP_HEADS = {
    "Hog Rider": { x: 134, topY: 249 },
    "P.E.K.K.A":  { x: 359, topY: 221 },
    "Knight":    { x: 625, topY: 227 },
    "Wizard":    { x: 916, topY: 274 },
    "Princess":  { x: 1134, topY: 208 },
  };

  function renderGroup(b) {
    lastGroup = b;
    var g = el("group-row"); if (g) g.innerHTML = "";
    el("g-img").src = "assets/scenes/Group Scene V2.webp?v=" + (window.BUILD ? window.BUILD.n : 0);
    groupCast = {};
    var D = Stage.design(), sx = D.W / 1280, sy = D.H / 720;
    for (var who in GROUP_HEADS) {
      groupCast[who] = { cx: GROUP_HEADS[who].x * sx, topY: GROUP_HEADS[who].topY * sy };
    }
    el("group-bubble").classList.remove("on");
  }

  /* expressions are baked into the finale image — nothing to swap at runtime */
  function groupExpr() {}

  function groupLine(who, colour, html) {
    var bub = el("group-bubble");
    bub.querySelector(".speaker").textContent = who || "";
    bub.querySelector(".speaker").style.color = colour;
    bub.querySelector(".speaker").style.display = who ? "" : "none";
    bub.querySelector(".line").innerHTML = html;
    var D = Stage.design(), W = D.W, H = D.H;
    var portrait = document.body.classList.contains("portrait");
    var g = who && groupCast[who];
    var bw = Math.round(W * (portrait ? 0.9 : 0.34));
    bub.style.width = bw + "px";
    if (g && !portrait) {
      /* above the speaker, clamped to the stage, tail on */
      var left = Math.max(W * 0.01, Math.min(g.cx - bw / 2, W * 0.99 - bw));
      bub.style.left = left + "px";
      bub.style.bottom = (H - g.topY + 12) + "px";
      bub.classList.remove("notail");
      bub.style.setProperty("--tailx", Math.round(g.cx - left - 9) + "px");
    } else {
      /* Sage / narration / portrait (heads reflow): bottom-centre name-box, no tail */
      bub.style.left = Math.round((W - bw) / 2) + "px";
      bub.style.bottom = Math.round(H * (portrait ? 0.03 : 0.05)) + "px";
      bub.classList.add("notail");
    }
    bub.classList.add("on");
  }

  /* ---- Split duologue (Layout 5, GDD §11): two customers conversing ----
     Diagonal split canvas, one customer per panel, bottom-centre name-box
     in the speaker's colour; the silent half dims a touch. */
  var duoSides = {};                       /* who → 'left' | 'right' */
  var lastDuo = null;
  var duoBg = null, duoRt = null;          /* [layerA, layerB] pairs for cross-fade */
  var duoBgIdx = { a: 0 }, duoRtIdx = { a: 0 };

  /* cross-fade a stacked pair of layers to a new image (~160ms) */
  function crossfadePair(pair, idx, path) {
    var cur = pair[idx.a], nxt = pair[1 - idx.a];
    if (cur.getAttribute("src") === path) return;
    if (!cur.getAttribute("src")) { cur.src = path; cur.style.opacity = 1; return; }
    nxt.style.opacity = 0;
    nxt.onload = function () { nxt.style.opacity = 1; cur.style.opacity = 0; };
    nxt.src = path;
    idx.a = 1 - idx.a;
  }

  /* left = the character's whole serve scene (backdrop); right = the character's
     grounded cutout, shifted onto the right of the same counter (CSS translateX) */
  function setDuoSide(side, who, exprName) {
    var c = window.CAST[who];
    if (!c) return;
    var names = [];
    for (var k in c.exprs) names.push(k);
    if (!exprName || !c.exprs[exprName]) exprName = names[0];
    var base = c.exprs[exprName];
    if (side === "left") crossfadePair(duoBg, duoBgIdx, window.serveScenePath(base));
    else crossfadePair(duoRt, duoRtIdx, window.cutoutPath(base));
  }

  function renderDuo(b) {
    lastDuo = b;
    if (!duoBg) { duoBg = [el("duo-bg"), el("duo-bg2")]; duoRt = [el("duo-right"), el("duo-right2")]; }
    duoSides = {};
    var cast = b.cast || [];
    if (cast[0]) { duoSides[cast[0].who] = "left"; setDuoSide("left", cast[0].who, cast[0].expr); }
    if (cast[1]) { duoSides[cast[1].who] = "right"; setDuoSide("right", cast[1].who, cast[1].expr); }
    el("duo-box").classList.remove("on");
    el("screen-duo").classList.remove("speak-left", "speak-right");
  }

  function duoExpr(who, exprName) {
    var side = duoSides[who];
    if (side) setDuoSide(side, who, exprName);
  }

  function duoLine(who, colour, html) {
    var box = el("duo-box");
    box.querySelector(".speaker").textContent = who || "";
    box.querySelector(".speaker").style.color = colour;
    box.querySelector(".speaker").style.display = who ? "" : "none";
    box.querySelector(".line").innerHTML = html;
    var sd = el("screen-duo");
    sd.classList.remove("speak-left", "speak-right");   /* the diagonal lighting dims the silent half */
    var side = who && duoSides[who];
    if (side) sd.classList.add("speak-" + side);
    box.classList.add("on");
  }

  /* ---- Epilogue: the morning-after Herald (GDD §9) ----
     One edition, one consequence line from the Knight's last cup, the
     decree lifted, and the closing card. */
  function renderEpilogue() {
    var ed = null;
    var eds = window.HERALD_EDITIONS || [];
    for (var i = 0; i < eds.length; i++) if (eds[i].night === 4) ed = eds[i];
    if (!ed) return;
    el("epi-masthead").textContent = t("herald.masthead");
    el("epi-ed").textContent = ed.ed;
    el("epi-head").textContent = ed.head;
    el("epi-story").textContent = ed.story;
    var key = Game.state.consequence === "rattled" ? "rattled" : "clear";
    el("epi-conseq").textContent = ed.consequence ? ed.consequence[key] : "";
    el("epi-story2").textContent = ed.story2 || "";
    el("epi-final").textContent = ed.final || "";
  }

  /* re-place anchored layers when the stage flips landscape/portrait */
  document.addEventListener("stagemode", function () {
    if (lastGroup && document.getElementById("screen-group").classList.contains("active")) {
      renderGroup(lastGroup);
    }
    if (lastDuo && document.getElementById("screen-duo").classList.contains("active")) {
      renderDuo(lastDuo);
    }
  });

  /* §7 tap-for-full: a tap on a trimmed Order Strip toggles the full-request
     popover. The (i) button keeps its own click (opens the Tome), and a tap on
     the open popover dismisses it. */
  (function wireOrderStrip() {
    var strip = el("order-strip"), full = el("order-full");
    if (strip) strip.addEventListener("click", function (ev) {
      if (ev.target.closest("#panel-info")) return;   /* (i) → Tome, handled in boot.js */
      if (!orderFullHtml) return;                       /* nothing more to reveal */
      var pf = el("panel-frame"); if (pf) pf.classList.toggle("order-open");
    });
    if (full) full.addEventListener("click", function () {
      var pf = el("panel-frame"); if (pf) pf.classList.remove("order-open");
    });
  })();

  return {
    fillStatic: fillStatic,
    renderTitle: renderTitle,
    leaveTitle: leaveTitle,
    renderHerald: renderHerald,
    renderServe: renderServe,
    setServeCustomer: setServeCustomer,
    currentServeExpr: currentServeExpr,
    bubbleLineCount: bubbleLineCount,
    setOrderText: setOrderText,
    serveLine: serveLine,
    hideServeBubble: hideServeBubble,
    sageLine: sageLine,
    hideSageBubble: hideSageBubble,
    serveChoices: serveChoices,
    hideServeChoices: hideServeChoices,
    renderNightEnd: renderNightEnd,
    renderGroup: renderGroup,
    groupExpr: groupExpr,
    groupLine: groupLine,
    renderDuo: renderDuo,
    duoExpr: duoExpr,
    duoLine: duoLine,
    renderEpilogue: renderEpilogue,
    toast: toast,
  };
})();
