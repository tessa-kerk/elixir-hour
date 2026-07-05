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
  }

  function renderTitle() {
    el("btn-continue").disabled = !Save.exists();
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

  /* Place (or clear) the customer: the two-layer composite's top layer plus
     the ONE standardised contact shadow (GDD §12) — soft, near-black, low
     opacity, at the counter line, behind the figure, never in front. Baked
     render shadows are stripped by the keying pipeline. */
  function setServeCustomer(who, exprName) {
    var img = el("serve-char"), sh = el("serve-shadow");
    if (!who || !window.CAST[who]) {
      lastServe = null;
      img.removeAttribute("src");
      img.style.display = "none";
      sh.style.display = "none";
      return;
    }
    var c = window.CAST[who];
    var names = [];
    for (var k in c.exprs) names.push(k);
    if (!exprName || !c.exprs[exprName]) exprName = names[0];
    var e = c.exprs[exprName];
    lastServe = { who: who, expr: exprName };

    var comp = Stage.composite();
    var span = Math.max(e.base - e.top, 0.4);
    var imgH = (comp.charH * (e.tall || 1)) / span;

    img.style.display = "";
    img.src = c.dir + "/" + e.file;
    img.style.height = imgH + "px";
    img.style.width = "auto";
    img.style.left = comp.anchorX + "px";
    img.style.top = (comp.counterY - imgH * e.base) + "px";

    var shW = comp.charH * 0.60, shH = comp.charH * 0.065;
    sh.style.display = "";
    sh.style.width = shW + "px";
    sh.style.height = shH + "px";
    sh.style.left = comp.anchorX + "px";
    sh.style.top = (comp.counterY - shH * 0.5) + "px";
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
    bub.style.bottom = (Stage.design().H - (comp.counterY - comp.charH) + 14) + "px";
    bub.classList.add("on");
  }
  function hideServeBubble() { el("serve-bubble").classList.remove("on"); }

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
  var groupCast = {};          /* who → { img, cx, topY } */
  var groupComp = null;
  var lastGroup = null;

  function groupComposite() {
    var D = Stage.design();
    var portrait = document.body.classList.contains("portrait");
    return portrait
      ? { counterY: 0.52 * D.H, charH: 0.245 * D.H, W: D.W, H: D.H }
      : { counterY: 0.82 * D.H, charH: 0.42 * D.H, W: D.W, H: D.H };
  }

  function renderGroup(b) {
    lastGroup = b;
    var row = el("group-row");
    row.innerHTML = "";
    groupCast = {};
    groupComp = groupComposite();
    var cast = b.cast || [];
    for (var i = 0; i < cast.length; i++) {
      var cx = ((i + 0.5) / cast.length) * groupComp.W;
      placeGroupChar(cast[i].who, cast[i].expr, cx);
    }
    el("group-bubble").classList.remove("on");
  }

  function placeGroupChar(who, exprName, cx) {
    var c = window.CAST[who];
    if (!c) return;
    var names = [];
    for (var k in c.exprs) names.push(k);
    if (!exprName || !c.exprs[exprName]) exprName = names[0];
    var e = c.exprs[exprName];
    var span = Math.max(e.base - e.top, 0.4);
    var imgH = (groupComp.charH * (e.tall || 1)) / span;

    var row = el("group-row");
    var old = groupCast[who];
    var sh = old ? old.sh : document.createElement("div");
    var img = old ? old.img : document.createElement("img");
    if (!old) {
      sh.className = "g-shadow";
      img.className = "g-char";
      row.appendChild(sh);
      row.appendChild(img);
    }
    img.src = c.dir + "/" + e.file;
    img.style.height = imgH + "px";
    img.style.left = cx + "px";
    img.style.top = (groupComp.counterY - imgH * e.base) + "px";
    var shW = groupComp.charH * 0.60, shH = groupComp.charH * 0.065;
    sh.style.width = shW + "px";
    sh.style.height = shH + "px";
    sh.style.left = cx + "px";
    sh.style.top = (groupComp.counterY - shH * 0.5) + "px";
    groupCast[who] = { img: img, sh: sh, cx: cx, expr: exprName,
                       topY: groupComp.counterY - groupComp.charH * (e.tall || 1) };
    /* end figures pull inward so nobody crops at the frame — neighbours
       overlapping reads as a crowded bar; a cut-off face reads as a bug */
    function clampX() {
      var half = img.offsetWidth / 2;
      if (!half) return;
      var cxc = Math.max(half + groupComp.W * 0.004, Math.min(cx, groupComp.W * 0.996 - half));
      if (Math.abs(cxc - cx) < 1) return;
      img.style.left = cxc + "px";
      sh.style.left = cxc + "px";
      if (groupCast[who]) groupCast[who].cx = cxc;
    }
    if (img.complete) clampX(); else img.onload = clampX;
  }

  function groupExpr(who, exprName) {
    var g = groupCast[who];
    if (g) placeGroupChar(who, exprName, g.cx);
  }

  function groupLine(who, colour, html) {
    var bub = el("group-bubble");
    bub.querySelector(".speaker").textContent = who || "";
    bub.querySelector(".speaker").style.color = colour;
    bub.querySelector(".speaker").style.display = who ? "" : "none";
    bub.querySelector(".line").innerHTML = html;
    var g = who && groupCast[who];
    var W = groupComp.W, H = groupComp.H;
    var bw = Math.round(W * 0.34);
    bub.style.width = bw + "px";
    if (g) {
      /* above the speaker, clamped to the stage, tail on */
      var left = Math.max(W * 0.01, Math.min(g.cx - bw / 2, W * 0.99 - bw));
      bub.style.left = left + "px";
      bub.style.bottom = (H - g.topY + 12) + "px";
      bub.classList.remove("notail");
      bub.style.setProperty("--tailx", Math.round(g.cx - left - 9) + "px");
    } else {
      /* Sage / narration: bottom-centre, no tail (the keeper is the camera) */
      bub.style.left = Math.round((W - bw) / 2) + "px";
      bub.style.bottom = Math.round(H * 0.05) + "px";
      bub.classList.add("notail");
    }
    bub.classList.add("on");
  }

  /* ---- Split duologue (Layout 5, GDD §11): two customers conversing ----
     Diagonal split canvas, one customer per panel, bottom-centre name-box
     in the speaker's colour; the silent half dims a touch. */
  var duoCast = {};            /* who → side index (0 left, 1 right) */
  var lastDuo = null;

  /* Chest-up framing with stature kept honest: the same tall factors and
     measured spans as the serve composite, torso-base carried just below
     the panel's bottom edge (landscape) or the split line (portrait). */
  function placeDuoChar(i, who, exprName) {
    var c = window.CAST[who];
    if (!c) return;
    var names = [];
    for (var k in c.exprs) names.push(k);
    if (!exprName || !c.exprs[exprName]) exprName = names[0];
    var e = c.exprs[exprName];
    var D = Stage.design();
    var portrait = document.body.classList.contains("portrait");
    var charH = (portrait ? 0.33 : 0.56) * D.H;
    var baseY = portrait ? (i === 0 ? 0.545 : 1.04) * D.H : 1.04 * D.H;
    var span = Math.max(e.base - e.top, 0.4);
    var imgH = (charH * (e.tall || 1)) / span;
    var half = document.querySelector("#screen-duo .duo-half." + (i === 0 ? "left" : "right"));
    var img = half.querySelector("img");
    img.src = c.dir + "/" + e.file;
    img.style.height = imgH + "px";
    img.style.top = (baseY - imgH * e.base) + "px";
    half.classList.remove("dim");
    duoCast[who] = i;
  }

  function renderDuo(b) {
    lastDuo = b;
    duoCast = {};
    var cast = b.cast || [];
    for (var i = 0; i < 2 && i < cast.length; i++) placeDuoChar(i, cast[i].who, cast[i].expr);
    el("duo-box").classList.remove("on");
  }

  function duoExpr(who, exprName) {
    var i = duoCast[who];
    if (i === undefined) return;
    placeDuoChar(i, who, exprName);
  }

  function duoLine(who, colour, html) {
    var box = el("duo-box");
    box.querySelector(".speaker").textContent = who || "";
    box.querySelector(".speaker").style.color = colour;
    box.querySelector(".speaker").style.display = who ? "" : "none";
    box.querySelector(".line").innerHTML = html;
    var halves = document.querySelectorAll("#screen-duo .duo-half");
    for (var i = 0; i < halves.length; i++) halves[i].classList.remove("dim");
    if (who && duoCast[who] !== undefined) {
      halves[duoCast[who] === 0 ? 1 : 0].classList.add("dim");
    }
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

  return {
    fillStatic: fillStatic,
    renderTitle: renderTitle,
    leaveTitle: leaveTitle,
    renderHerald: renderHerald,
    renderServe: renderServe,
    setServeCustomer: setServeCustomer,
    serveLine: serveLine,
    hideServeBubble: hideServeBubble,
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
  };
})();
