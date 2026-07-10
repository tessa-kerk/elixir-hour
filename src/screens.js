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
    var completed = window.Game && Game.isCompleted && Game.isCompleted();
    var tomeBtn = el("btn-tome-title");
    el("btn-continue").disabled = !s;
    if (completed) {
      /* §11 (round 10): a finished game — Continue into a re-shown Herald is a dead
         end. Continue becomes Play Again (fresh save, confirmed on click) and the
         finished Tome opens directly from its own button. */
      /* two lines so no word orphans (§11): "Play Again" over a smaller "from Night 1" */
      el("btn-continue").innerHTML = '<span class="btn-main">' + t("title.playagain.main") +
        '</span><span class="btn-sub">' + t("title.playagain.sub") + "</span>";
      el("btn-continue").classList.add("two-line");
      if (tomeBtn) { tomeBtn.hidden = false; tomeBtn.textContent = t("title.opentome"); }
    } else {
      if (tomeBtn) tomeBtn.hidden = true;
      if (s) {
        var n = typeof s.night === "number" ? s.night : 1;
        var nd = null, ns = window.NIGHTS || [];
        for (var i = 0; i < ns.length; i++) if (ns[i].night === n) nd = ns[i];
        var label = t("night.label", { n: n }) + (nd && nd.title ? ": " + nd.title : "");
        /* two lines like Play Again (§R14): "Continue" (Baloo 2) over a smaller
           "Night N: Title" (Nunito) — no orphaned words in any language. */
        el("btn-continue").innerHTML = '<span class="btn-main">' + t("title.continue") +
          '</span><span class="btn-sub">' + label + "</span>";
        el("btn-continue").classList.add("two-line");
      } else {
        el("btn-continue").classList.remove("two-line");
        el("btn-continue").textContent = t("title.continue");
      }
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
     the character dissolves. §R17: placeServeBubble() derives the head-top at draw time
     from the per-character head fraction × the SCENE BAND's height, so it is right in
     both orientations (the band is the whole stage only in landscape). */
  var sceneLayers = null, sceneActive = 0;
  var EMPTY_BAR = "Empty Bar (no characters)";   /* §11: the no-customer backdrop (Sage solo, game start, between visits) — never a bare screen */

  /* §R17 PORTRAIT REFRAME (GDD §11 mobile staging). The scene band is 720×819 and the art is
     1.79:1, so `object-fit:cover` throws away ~51% of the width. The default `center` put the
     cast — hand-grounded at head cx 0.21 — at x = −64px: the Knight half off the left edge.
     Here we compute the object-position that lands the head at `targetX`, then CLAMP it so the
     widest body (the Knight's) can never leave the frame. ONE value for every solo scene,
     including the empty bar: the backgrounds are pixel-identical and cross-fade, so a per-scene
     focal point would jitter the whole bar on every expression swap. */
  function soloFocus() {
    var f = window.SCENE_FRAME;
    if (!f || !sceneLayers) return null;
    var s = f.solo, layer = sceneLayers[0];
    var bw = layer.clientWidth, bh = layer.clientHeight;
    /* the serve screen can be display:none when a beat is armed under the dip cover, and a
       hidden element measures 0. Fall back to the design band (the stage is a fixed size)
       rather than bail out — bailing would clear the focal point and un-frame the character. */
    if (!bw || !bh) { var D = Stage.design(); bw = D.W; bh = D.H * 0.64; }
    var scale = Math.max(bw / f.img.w, bh / f.img.h);
    var sw = f.img.w * scale, over = sw - bw;
    if (over <= 0.5) return { pct: 50, p: 0.5, sw: sw, over: 0, bw: bw, bandH: bh };
    var p = (s.headCx * sw - s.targetX * bw) / over;
    var m = s.edge * bw;
    var pMax = (s.bodyX0 * sw - m) / over;              /* larger p crops more off the LEFT  */
    var pMin = (s.bodyX1 * sw - (bw - m)) / over;       /* smaller p crops more off the RIGHT */
    var lo = Math.max(0, pMin), hi = Math.min(1, pMax);
    /* If the body is wider than the band can hold, the two limits cross and the clamp would
       return nonsense — centre the body instead, so it's cropped evenly rather than shoved
       off one edge. (Unreachable at the locked 720x1280 stage; a taller band could reach it.) */
    if (hi < lo) p = ((s.bodyX0 + s.bodyX1) / 2 * sw - bw / 2) / over;
    else p = Math.min(Math.max(p, lo), hi);
    p = Math.min(Math.max(p, 0), 1);
    return { pct: p * 100, p: p, sw: sw, over: over, bw: bw, bandH: bh };
  }
  /* portrait: pin the focal point on both cross-fade layers. landscape: clear it, so the
     signed-off desktop framing (the CSS default) is exactly what it always was. */
  function applySoloFocus() {
    if (!sceneLayers) sceneLayers = [el("ms-img"), el("ms-img2")];
    var f = Stage.isPortrait() ? soloFocus() : null;
    var pos = f ? (f.pct.toFixed(3) + "% 0%") : "";
    sceneLayers[0].style.objectPosition = pos;
    sceneLayers[1].style.objectPosition = pos;
    return f;
  }
  /* where the speaker's head actually lands on screen, after the reframe */
  function headScreenX(base, f) {
    var F = window.SCENE_FRAME;
    var h = F && F.heads && F.heads[base];
    var cx = (h && h.cx != null) ? h.cx : F.solo.headCx;
    return cx * f.sw - f.over * f.p;
  }

  function setServeCustomer(who, exprName) {
    if (!sceneLayers) sceneLayers = [el("ms-img"), el("ms-img2")];
    applySoloFocus();
    if (!who || !window.CAST[who]) { lastServe = null; crossfadeScene(window.serveScenePath(EMPTY_BAR)); return; }
    var c = window.CAST[who];
    var names = [];
    for (var k in c.exprs) names.push(k);
    if (!exprName || !c.exprs[exprName]) exprName = names[0];
    var base = c.exprs[exprName];
    lastServe = { who: who, expr: exprName, base: base };
    crossfadeScene(window.serveScenePath(base));
  }
  /* True overlapped cross-fade (round-10 fix for the dip-to-empty). The outgoing
     layer stays FULLY OPAQUE while the incoming ramps up on top of it — the scene is
     never less than one solid opaque layer, so it can't dip dark between two faces.
     Once the incoming is up the outgoing sits hidden behind it, ready to be next. */
  function crossfadeScene(path) {
    var cur = sceneLayers[sceneActive], nxt = sceneLayers[1 - sceneActive];
    if (cur.getAttribute("src") === path) return;              /* already showing it */
    if (!cur.getAttribute("src")) { cur.src = path; cur.style.opacity = 1; cur.style.zIndex = 1; return; }
    nxt.onload = function () {
      nxt.style.zIndex = 2;            /* incoming above the still-opaque outgoing */
      cur.style.zIndex = 1;
      nxt.style.opacity = 0;
      void nxt.offsetWidth;            /* commit 0 before transitioning to 1 */
      nxt.style.opacity = 1;
    };
    nxt.src = path;
    sceneActive = 1 - sceneActive;
  }

  /* R13: the layout-change DIP (a deliberate camera cut). Cross-fading two DIFFERENT
     layouts reads as a double-exposure, so instead we fade to a warm near-dark, swap
     the layout UNDER the cover (screen switch + beat start), then reveal. `mid` runs
     at full cover — the screen is display:block there, so bubble pagination still
     measures. Only used for serve<->duo<->group; same-layout swaps keep the cross-fade. */
  var dipTimer = null;
  function dip(mid) {
    var d = el("dip"), stage = document.getElementById("stage");
    if (!d || !stage) { mid(); return; }
    if (dipTimer) { window.clearTimeout(dipTimer); dipTimer = null; }   /* a superseding dip cancels the old one */
    stage.classList.add("dipping");            /* suppress the screenfade while covered */
    d.classList.add("on");                     /* → opaque over ~200ms (covers the old layout) */
    dipTimer = window.setTimeout(function () {
      dipTimer = null;
      mid();                                   /* swap layout + start the beat, hidden under the cover */
      /* Drop `dipping` SYNCHRONOUSLY with the swap: the newly-active screen's ONE
         screenfade now plays as the reveal, under the fading cover — reads as a single
         continuous camera cut. (Removing it later re-triggered a second fade → flicker.) */
      stage.classList.remove("dipping");
      d.classList.remove("on");                /* → cover clears over ~250ms, revealing the new layout */
    }, 210);
  }

  /* One dialogue line in the bubble. html is pre-formatted (escaped) by the
     caller; the bubble sits bottom-anchored just above the figure's
     head/horns (figure top = counterY - charH by construction). The tail
     only shows when the on-screen customer is speaking. */
  /* Bubble geometry, shared by serveLine and the landscape/portrait flip. */
  function placeServeBubble() {
    var comp = Stage.composite();
    var D = Stage.design();
    var bub = el("serve-bubble");
    bub.style.top = "auto";

    /* §R17: the head-top is a fraction of the SCENE BAND, not of the stage. In landscape the
       band IS the stage (720px) so this is identical to the signed-off desktop maths; in
       portrait the band is only 64% tall, and using the stage height dropped the bubble ~108px
       — straight onto the speaker's face. */
    var bandH = (sceneLayers && sceneLayers[0].clientHeight) ||
                (Stage.isPortrait() ? D.H * 0.64 : D.H);   /* hidden screens measure 0 */
    var c = lastServe && window.CAST[lastServe.who];
    var headTop = c ? (c.head || 0.25) * bandH : (comp.counterY - comp.charH);
    bub.style.bottom = (D.H - headTop + 12) + "px";

    /* §R17: in portrait, sit the bubble over the speaker's head with the tail on them —
       it used to be pinned at left:4%, tail pointing at empty counter. Landscape keeps the
       CSS-driven left/width and its fixed 52% tail. */
    var f = Stage.isPortrait() ? applySoloFocus() : null;
    if (f && lastServe) {
      var hx = headScreenX(lastServe.base, f);
      var bw = bub.offsetWidth || D.W * 0.70;   /* CSS width; 0 if the screen is still hidden */
      var left = Math.max(D.W * 0.03, Math.min(hx - bw / 2, D.W * 0.97 - bw));
      bub.style.left = left + "px";
      bub.style.setProperty("--tailx", Math.round(hx - left - 9) + "px");
    } else {
      bub.style.left = "";
      bub.style.removeProperty("--tailx");
    }

    /* clamp (Fix 8): a long line grows the bottom-anchored bubble upward and can
       push its top off the stage. If it would clip, pin the top just inside the
       stage and let the bubble grow downward instead. */
    if (bub.offsetTop < 8) { bub.style.top = "8px"; bub.style.bottom = "auto"; }
  }

  function serveLine(name, colour, html, withTail) {
    var bub = el("serve-bubble");
    el("serve-speaker").textContent = name || "";
    el("serve-speaker").style.color = colour;
    el("serve-speaker").style.display = name ? "" : "none";
    el("serve-line").innerHTML = html;
    bub.classList.toggle("notail", !withTail);
    bub.classList.add("on");                    /* on BEFORE measuring — .on is what makes it display */
    placeServeBubble();
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
    applySoloFocus();                           /* the reframe is mode-dependent, customer or not */
    if (lastServe && document.getElementById("screen-serve").classList.contains("active")) {
      setServeCustomer(lastServe.who, lastServe.expr);
      if (el("serve-bubble").classList.contains("on")) placeServeBubble();
    }
  });

  /* a brief cream toast (e.g. storage-unavailable) — shown in-game, never
     console-only (GDD §13; P0 06-07) */
  var toastTimer = null, toastMsg = null;
  var TOAST_MS = 5600;
  /* §R18 (GDD §11 fresh-player locks): `ms` lets a caller pick its own dwell — the
     brew-gating line uses 3500. Re-triggering the SAME line while it is still up is
     ignored, so a player tapping the locked panel repeatedly can never stack a second
     toast nor hold this one on screen indefinitely; once it has faded, a tap re-summons
     it. A DIFFERENT message still interrupts (a storage error must not wait its turn). */
  function toast(msg, ms) {
    var t2 = el("toast");
    if (!t2 || !msg) return;
    if (toastTimer && toastMsg === msg) return;      /* already saying exactly this */
    toastMsg = msg;
    t2.textContent = msg;
    t2.classList.add("on");
    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      t2.classList.remove("on");
      toastTimer = null; toastMsg = null;
    }, ms || TOAST_MS);
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
      bub.style.top = "auto";                   /* clear a portrait `top` if we just rotated */
      bub.style.bottom = (H - g.topY + 12) + "px";
      bub.classList.remove("notail");
      bub.style.setProperty("--tailx", Math.round(g.cx - left - 9) + "px");
    } else if (portrait) {
      /* §R17: the portrait finale is letterboxed (`contain`, so all five stay in frame — see
         css/main.css), and its scene band ends at 40%. Tuck the name-box straight under it
         instead of stranding it at the foot of a mostly-empty screen. */
      bub.style.left = Math.round((W - bw) / 2) + "px";
      bub.style.top = Math.round(H * 0.42) + "px";
      bub.style.bottom = "auto";
      bub.classList.add("notail");
    } else {
      /* Sage / narration: bottom-centre name-box, no tail */
      bub.style.left = Math.round((W - bw) / 2) + "px";
      bub.style.top = "auto";
      bub.style.bottom = Math.round(H * 0.05) + "px";
      bub.classList.add("notail");
    }
    bub.classList.add("on");
  }

  /* ---- Split duologue (Layout 5, GDD §11): two customers conversing ----
     Diagonal split canvas, one customer per panel, bottom-centre name-box
     in the speaker's colour; the silent half dims a touch. */
  var duoSides = {};                       /* who → 'left' | 'right' */
  var lastDuo = null;
  var duoBg = null;                        /* the Empty Bar backdrop (single, static) */
  var duoL = null, duoR = null;            /* [layerA, layerB] cross-fade pairs — both cutouts */
  var duoLIdx = { a: 0 }, duoRIdx = { a: 0 };

  /* Overlapped cross-fade (round-10): incoming ramps up on top while the outgoing
     holds fully opaque — no dip. zBase keeps the tiers apart so the right cutout
     (zBase 3) always sits above the backdrop serve scene (zBase 1). */
  function crossfadePair(pair, idx, path, zBase) {
    var cur = pair[idx.a], nxt = pair[1 - idx.a];
    if (cur.getAttribute("src") === path) return;
    if (!cur.getAttribute("src")) { cur.src = path; cur.style.opacity = 1; cur.style.zIndex = zBase; return; }
    nxt.onload = function () {
      nxt.style.zIndex = zBase + 1;
      cur.style.zIndex = zBase;
      nxt.style.opacity = 0;
      void nxt.offsetWidth;
      nxt.style.opacity = 1;
    };
    nxt.src = path;
    idx.a = 1 - idx.a;
  }

  /* both characters are grounded cutouts on the Empty Bar backdrop (round 11) — the
     left at its natural position (.duo-l), the right shifted onto the right of the
     same counter (.duo-r). No character is ever baked into the base. */
  function setDuoSide(side, who, exprName) {
    var c = window.CAST[who];
    if (!c) return;
    var names = [];
    for (var k in c.exprs) names.push(k);
    if (!exprName || !c.exprs[exprName]) exprName = names[0];
    var base = c.exprs[exprName];
    if (side === "left") crossfadePair(duoL, duoLIdx, window.cutoutPath(base), 3);
    else crossfadePair(duoR, duoRIdx, window.cutoutPath(base), 5);
  }

  function renderDuo(b) {
    lastDuo = b;
    if (!duoBg) {
      duoBg = el("duo-bg");
      duoL = [el("duo-left"), el("duo-left2")];
      duoR = [el("duo-right"), el("duo-right2")];
    }
    /* reset every cutout layer so a character from a PREVIOUS two-shot can't linger
       behind — the round-10 keep-outgoing-opaque fade otherwise leaves stale cutouts
       on screen (the stray-Knight bug). */
    [duoL[0], duoL[1], duoR[0], duoR[1]].forEach(function (im) { im.removeAttribute("src"); im.style.opacity = 0; });
    duoLIdx.a = 0; duoRIdx.a = 0;
    duoBg.src = window.serveScenePath("Empty Bar (no characters)");   /* §11: the base never contains a character */
    duoBg.style.opacity = 1; duoBg.style.zIndex = 1;                  /* static backdrop (.scene-layer defaults to 0) */
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
    dip: dip,
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
