/* Screen renderers. Title and Herald are real; serve/group/duo/epilogue are
   labelled placeholders until their milestones (2, 5, 6). All text via t(). */
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
    el("ph-group-title").textContent = t("ph.group.title");
    el("ph-group-note").textContent = t("ph.group.note");
    el("ph-duo-title").textContent = t("ph.duo.title");
    el("ph-duo-note").textContent = t("ph.duo.note");
    el("ph-epi-title").textContent = t("ph.epilogue.title");
    el("ph-epi-note").textContent = t("ph.epilogue.note");
    el("btn-totitle").textContent = t("epilogue.totitle");
    el("btn-savequit").textContent = t("night.savequit");
    el("tomeclose").textContent = t("tome.close");
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
  };
})();
