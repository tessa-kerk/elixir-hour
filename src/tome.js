/* The Tome (GDD §11/§14.5): four ribbon tabs over the Tome Spread art —
   Brew Book, Regulars' Ledger, Arena Herald, Bard's Songbook. Tab hotspot
   geometry comes from the locked mockup (the ribbons are painted INTO the
   art; we place clickable zones + vector glyphs on top). Everything the
   player sees is gated by Game.state.unlocks.
   Marginalia rule (§11): printed page copy in the serif body font — only
   Sage's own notes are in the green Caveat hand. The deeper marked-up-page
   treatment (arrows to circled phrases, per the Ledger Page Mockup) is
   Milestone 7 polish; v1 highlights the marked phrases and scatters the
   notes in the margin column. */
window.Tome = (function () {
  function el(id) { return document.getElementById(id); }

  var current = "brew";
  var sel = { brew: 0, ledger: 0, herald: 0, song: 0 };

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  /* **mark** / *mark* → highlighted phrases (already escaped) */
  function marked(s) {
    return esc(s)
      .replace(/\*\*(.+?)\*\*/g, '<span class="marked">$1</span>')
      .replace(/\*(.+?)\*/g, '<span class="marked">$1</span>');
  }

  function open(tab) {
    el("tome").classList.add("open");
    render(tab || current);
  }
  function close() { el("tome").classList.remove("open"); }
  function isOpen() { return el("tome").classList.contains("open"); }

  function render(tab) {
    /* arriving at the Ledger from elsewhere always opens the book on the grid */
    if (tab === "ledger" && current !== "ledger") { ledgerNav.view = "grid"; ledgerNav.sheet = 0; }
    current = tab;
    var sp = el("spread");
    if (sp) sp.hidden = true;                     /* only the ledger spread unhides it */
    var tabs = ["brew", "ledger", "herald", "song"];
    for (var i = 0; i < tabs.length; i++) {
      el("tab-" + tabs[i]).classList.toggle("on", tabs[i] === tab);
    }
    if (tab === "brew") renderBrew();
    if (tab === "ledger") renderLedger();
    if (tab === "herald") renderHerald();
    if (tab === "song") renderSong();
  }

  /* ---- Brew Book: only recipes the player has actually brewed ---- */
  function renderBrew() {
    var known = [];
    for (var i = 0; i < window.BREWBOOK.length; i++) {
      if (Game.state.unlocks.recipes.indexOf(window.BREWBOOK[i].name) >= 0) known.push(window.BREWBOOK[i]);
    }
    if (sel.brew >= known.length) sel.brew = 0;
    var L = '<div class="tometitle">Brew Book</div>' +
      '<div class="tome-epigraph">Recipes are not bought. They are taught, confided, or left behind on napkins.</div>';
    for (var j = 0; j < known.length; j++) {
      L += '<div class="entry' + (j === sel.brew ? " sel" : "") + '" data-i="' + j + '"><b>' + esc(known[j].name) + "</b><span>" + esc(known[j].mix.join(" + ")) + "</span></div>";
    }
    el("pageL").innerHTML = L;
    wireEntries("pageL", function (i) { sel.brew = i; renderBrew(); });

    if (!known.length) { el("pageR").innerHTML = ""; return; }
    var r = known[sel.brew];
    var dots = "";
    for (var d = 0; d < r.dots.length; d++) dots += '<i style="background:' + r.dots[d] + '"></i>';
    el("pageR").innerHTML =
      '<div class="tometitle centre">' + esc(r.name) + "</div>" +
      '<img class="tome-tankard" src="assets/ui/Tankard Icon (cutout).png" alt="">' +
      '<div class="ingdots">' + dots + "</div>" +
      '<div class="rp-caption strong">' + esc(r.mix.join(" + ")) + "</div>" +
      '<div class="rp-caption">' + esc(r.note) + "</div>" +
      '<div class="hand-note">✎ ' + esc(r.taught) + "</div>";
  }

  /* ---- Regulars' Ledger: met = card + growing page; unmet = silhouette ---- */
  var SVGNS = "http://www.w3.org/2000/svg";

  /* Clip a card PNG to its measured content box at a UNIFORM content height —
     the selection outline hugs the card itself, never its transparent padding,
     and uneven export padding can't off-centre it. */
  function cardClipHTML(c, targetH, cls) {
    var bw = c.box.r - c.box.l, bh = c.box.b - c.box.t;
    var imgH = targetH / bh;
    var imgW = imgH * c.px[0] / c.px[1];
    return '<div class="' + cls + '" style="width:' + Math.round(imgW * bw) + "px;height:" + Math.round(targetH) + 'px">' +
      '<img style="height:' + Math.round(imgH) + "px;left:" + (-Math.round(imgW * c.box.l)) + "px;top:" + (-Math.round(imgH * c.box.t)) + 'px" src="' + c.card.replace(/"/g, "&quot;") + '"></div>';
  }

  /* The Ledger is a BOOK (GDD §11): the grid of cards, then clicking a met
     card page-flips to a full two-page character spread. No scrollbars
     anywhere — content that outgrows the spread turns to the next sheet via
     a hand-drawn arrow. */
  var ledgerNav = { view: "grid", who: 0, sheet: 0 };

  function renderLedger() {
    if (ledgerNav.view === "spread") renderLedgerSpread();
    else renderLedgerGrid();
  }

  function renderLedgerGrid() {
    el("spread").hidden = true;
    var oldNav = el("spread").querySelectorAll(".hand-nav");
    for (var oo = 0; oo < oldNav.length; oo++) oldNav[oo].parentNode.removeChild(oldNav[oo]);
    var L = '<div class="tometitle">Regulars’ Ledger</div>' +
      '<div class="tome-epigraph">Cards land in the ledger as tokens of trust — earned, never asked for.</div>' +
      '<div id="cardgrid">';
    for (var i = 0; i < window.LEDGER.length; i++) {
      var c = window.LEDGER[i];
      /* met = the key EXISTS (the note may legitimately be empty) */
      var met = Object.prototype.hasOwnProperty.call(Game.state.unlocks.ledger, c.who);
      L += '<div class="cardthumb' + (met ? "" : " locked") + '" data-i="' + i + '">' +
           cardClipHTML(c, 86, "cardclip") + "<small>" + (met ? esc(c.who) : "—") + "</small></div>";
    }
    L += "</div>";
    el("pageL").innerHTML = L;
    el("pageR").innerHTML = "";                    /* a blank facing page */
    var thumbs = el("pageL").querySelectorAll(".cardthumb");
    for (var t = 0; t < thumbs.length; t++) {
      (function (node) {
        node.addEventListener("click", function () {
          var i = +node.getAttribute("data-i");
          if (!Object.prototype.hasOwnProperty.call(Game.state.unlocks.ledger, window.LEDGER[i].who)) return;
          flipTo(function () {
            ledgerNav.view = "spread";
            ledgerNav.who = i;
            ledgerNav.sheet = 0;
            renderLedgerSpread();
          }, "fwd");
        });
      })(thumbs[t]);
    }
  }

  /* The character spread is a real BOOK FLOW (GDD §11 "reading order and
     balance"): the two pages are two CSS columns of one continuous flow, so
     the bio ALWAYS starts on the left page under the card and the browser
     itself carries the text onto the right page (mid-paragraph if needed).
     Balance comes from the notes in both margins and the text filling the
     pages as it grows — never from re-ordering blocks. Extra growth turns
     onto further sheets (the strip slides two columns per turn). */
  function renderLedgerSpread() {
    var c = window.LEDGER[ledgerNav.who];
    var stage = ledgerStage(c.who);
    el("pageL").innerHTML = "";
    el("pageR").innerHTML = "";
    var spread = el("spread");
    spread.hidden = false;
    var vp = el("spreadvp"), flow = el("spreadflow");
    flow.style.transform = "none";

    var vpW = vp.clientWidth, pageH = vp.clientHeight;
    var gap = Math.round(vpW * 0.19);            /* the spine/gutter */
    var colW = Math.floor((vpW - gap) / 2);
    flow.style.columnWidth = colW + "px";
    flow.style.columnGap = gap + "px";

    var html = '<div class="spread-head">' + cardClipHTML(c, 150, "bigclip") +
      '<div class="nameplate">' + esc(c.who) + "</div></div>";
    for (var s = 0; s < stage && s < c.stages.length; s++) {
      var st = c.stages[s];
      html += '<div class="flow-annot" data-s="' + s + '"><div class="ledger-bio">' + marked(st.bio) + "</div>" +
        (st.pinned ? '<div class="hand-note pinned">' + esc(st.pinned) + "</div>" : "") + "</div>";
    }
    flow.innerHTML = html;

    /* notes + arrows live on one absolute overlay in STRIP coordinates
       (absolute children of a multicol container aren't fragmented) */
    var overlay = document.createElement("div");
    overlay.id = "spreadnotes";
    overlay.innerHTML = '<svg class="note-arrows"></svg>';
    flow.appendChild(overlay);
    layoutSpreadNotes(c, stage, flow, overlay, colW, gap, pageH);

    /* sheets: a view shows two columns; turning slides the strip */
    var stripW = flow.scrollWidth;
    var nCols = Math.max(1, Math.round((stripW + gap) / (colW + gap)));
    var nSheets = Math.max(1, Math.ceil(nCols / 2));
    if (ledgerNav.sheet >= nSheets) ledgerNav.sheet = nSheets - 1;
    flow.style.transform = "translateX(" + (-ledgerNav.sheet * 2 * (colW + gap)) + "px)";

    /* nav — game UI, pinned to the spread corners */
    var oldNav = spread.querySelectorAll(".hand-nav");
    for (var o = 0; o < oldNav.length; o++) oldNav[o].parentNode.removeChild(oldNav[o]);
    var back = handNavEl("back");
    back.classList.add("back");
    back.addEventListener("click", function () {
      flipTo(function () { closeSpread(); renderLedgerGrid(); }, "rev");
    });
    spread.appendChild(back);
    if (ledgerNav.sheet > 0) {
      var prev = handNavEl("prev");
      prev.classList.add("prev");
      prev.addEventListener("click", function () {
        flipTo(function () { ledgerNav.sheet--; renderLedgerSpread(); }, "rev");
      });
      spread.appendChild(prev);
    }
    if (ledgerNav.sheet < nSheets - 1) {
      var next = handNavEl("next");
      next.classList.add("next");
      next.addEventListener("click", function () {
        flipTo(function () { ledgerNav.sheet++; renderLedgerSpread(); }, "fwd");
      });
      spread.appendChild(next);
    }
  }

  function closeSpread() {
    el("spread").hidden = true;
    ledgerNav.view = "grid";
  }

  /* Place Sage's notes on the overlay in strip coordinates: consecutive notes
     alternate margins, each level with its phrase's line, arrows to the
     underlined words. Rect maths are transform-safe (everything divides by
     the stage scale) and column-aware via each mark's first line box. */
  function layoutSpreadNotes(c, stage, flow, overlay, colW, gap, pageH) {
    var svg = overlay.querySelector("svg.note-arrows");
    var stageEl = document.getElementById("stage");
    var scale = stageEl.getBoundingClientRect().width / Stage.design().W || 1;
    var flowRect = flow.getBoundingClientRect();
    var railW = Math.max(colW * 0.19 - 4, 44);
    var alt = 0;
    var lastBottom = {};
    var noteI = 0;

    var annots = flow.querySelectorAll(".flow-annot");
    for (var a = 0; a < annots.length; a++) {
      var st = c.stages[+annots[a].getAttribute("data-s")];
      if (!st || !st.notes) continue;
      var marks = annots[a].querySelectorAll(".marked");
      for (var n = 0; n < st.notes.length; n++) {
        var note = st.notes[n];
        var span = null;
        for (var m = 0; m < marks.length; m++) {
          if (normText(marks[m].textContent) === normText(note.mark)) { span = marks[m]; break; }
        }
        if (!span) continue;
        var rects = span.getClientRects();
        var r0 = rects.length ? rects[0] : span.getBoundingClientRect();
        var sx = (r0.left - flowRect.left) / scale;
        var sRight = (r0.right - flowRect.left) / scale;
        var sTop = (r0.top - flowRect.top) / scale;
        var sH = r0.height / scale;
        var col = Math.max(0, Math.floor((sx + gap / 2) / (colW + gap)));
        var colLeft = col * (colW + gap);

        /* the note goes in the margin NEAREST its phrase (GDD §11: an arrow
           must never cross other text — short beats scattered) */
        var side = ((sx + sRight) / 2 - colLeft) < colW / 2 ? "left" : "right";
        var key = col + "|" + side;
        var noteEl = document.createElement("div");
        noteEl.className = "hand-note margin-note tilt" + (noteI++ % 3);
        noteEl.textContent = note.note;
        noteEl.style.width = railW + "px";
        overlay.appendChild(noteEl);
        var top = Math.max(sTop + 2, (lastBottom[key] || -1e9) + 6);
        top = Math.min(top, pageH - noteEl.offsetHeight - 4);
        noteEl.style.top = top + "px";
        noteEl.style.left = (side === "left" ? colLeft : colLeft + colW - railW) + "px";
        lastBottom[key] = top + noteEl.offsetHeight;

        /* short arrow to the NEAREST edge of the phrase, routed through the
           inter-line gap BELOW the line so it never crosses other words */
        var x1 = side === "left" ? colLeft + railW - 2 : colLeft + colW - railW + 2;
        var x2 = side === "left" ? sx - 2 : sRight + 2;
        var yEnd = sTop + sH + 2;                  /* just under the underline */
        var bow = (yEnd + 5) - ((top + 10) + yEnd) / 2;   /* control point sits in the gap */
        drawArrow(svg, x1, top + 10, x2, yEnd, bow);
      }
    }
    var w = Math.max(flow.scrollWidth, colW);
    overlay.style.width = w + "px";
    svg.setAttribute("width", w);
    svg.setAttribute("height", pageH);
  }

  /* stages 2–3 unlock in Milestone 6; DEV_LEDGER_STAGE lets Tessa preview */
  function ledgerStage() { return window.DEV_LEDGER_STAGE || 1; }

  /* Page navigation is GAME UI, not Sage's hand (GDD §11): the ornate
     fletched-arrow icon (Art/UI). It points left as drawn — the next-page
     arrow flips it horizontally. */
  function handNavEl(kind, title) {
    var d = document.createElement("div");
    d.className = "hand-nav";
    if (title) d.title = title;
    d.innerHTML = '<img src="assets/ui/Nav Arrow (icon).png" alt=""' + (kind === "next" ? ' class="flip"' : "") + ">";
    return d;
  }

  /* the 3D page-turn: opaque page-art covers occlude BOTH pages for the whole
     turn (the destination is never visible early); the full-page leaf, hinged
     at the spine, rotates over them. The content swap happens under the
     covers; everything lifts together the moment the leaf lands. dir is
     "fwd" (turning onward) or "rev" (turning back). */
  function flipTo(cb, dir) {
    var f = el("pageflip");
    f.classList.remove("go", "fwd", "rev");
    f.classList.add(dir === "rev" ? "rev" : "fwd");
    f.style.display = "block";
    void f.offsetWidth;
    f.classList.add("go");
    window.setTimeout(cb, 300);                    /* hidden beneath the covers */
    window.setTimeout(function () {
      f.classList.remove("go", "fwd", "rev");
      f.style.display = "none";
    }, 640);                                       /* just after the leaf lands */
  }

  /* GDD §11 marginalia: the printed bio sits in a narrower centre column; each
     green note goes in the margin BESIDE the phrase it marks, with a short
     hand-drawn arrow to the underlined words; longer notes drop to the foot
     of the page with an arrow. Never stacked in a list. */
  function normText(s) { return String(s).toLowerCase().replace(/\s+/g, " ").trim(); }


  /* a gently curved, hand-drawn-feel arrow with a small open head */
  function drawArrow(svg, x1, y1, x2, y2, bow) {
    var mx = (x1 + x2) / 2, my = (y1 + y2) / 2 + (bow || -8);
    var p = document.createElementNS(SVGNS, "path");
    p.setAttribute("d", "M" + x1 + " " + y1 + " Q" + mx + " " + my + " " + x2 + " " + y2);
    svg.appendChild(p);
    var ang = Math.atan2(y2 - my, x2 - mx) + Math.PI;
    for (var k = -1; k <= 1; k += 2) {
      var a = ang + k * 0.5;
      var h = document.createElementNS(SVGNS, "path");
      h.setAttribute("d", "M" + x2 + " " + y2 + " L" + (x2 + Math.cos(a) * 7) + " " + (y2 + Math.sin(a) * 7));
      svg.appendChild(h);
    }
  }

  /* ---- Arena Herald: unlocked back editions; ripple marker ---- */
  function renderHerald() {
    var eds = [];
    for (var i = 0; i < window.HERALD_EDITIONS.length; i++) {
      var e = window.HERALD_EDITIONS[i];
      if (e.head && Game.state.unlocks.heralds.indexOf(e.night) >= 0) eds.push(e);
    }
    if (sel.herald >= eds.length) sel.herald = 0;
    var L = '<div class="tometitle">Arena Herald</div>' +
      '<div class="tome-epigraph">Back editions. Some mornings, the news pours both ways.</div>';
    for (var j = 0; j < eds.length; j++) {
      L += '<div class="entry' + (j === sel.herald ? " sel" : "") + '" data-i="' + j + '"><b>' + esc(eds[j].head) + "</b><span>" + esc(eds[j].ed) + (eds[j].ripple ? " · ⚗" : "") + "</span></div>";
    }
    el("pageL").innerHTML = L;
    wireEntries("pageL", function (i) { sel.herald = i; renderHerald(); });

    if (!eds.length) { el("pageR").innerHTML = ""; return; }
    var h = eds[sel.herald];
    el("pageR").innerHTML =
      '<div class="masthead">The Arena Herald</div>' +
      '<div class="rp-caption">' + esc(h.ed) + "</div>" +
      '<div class="headline">' + esc(h.head) + "</div>" +
      '<div class="story">' + esc(h.story) + "</div>" +
      (h.ripple ? '<div class="ripple">⚗ Traced to a quiet brew poured at a certain bar the night before.</div>' : "");
  }

  /* ---- Bard's Songbook: pick the bar's tune (audio lands in M7) ----
     Progression-gated (GDD §11): a locked track is a greyed row revealing
     NOTHING — no title, no description — so later Nights aren't spoiled. */
  function songUnlocked(s) {
    if (Game.state.unlocks.songs.indexOf(s.name) >= 0) return true;   /* explicit story unlock */
    var w = s.when || {};
    if (w.always) return true;
    if (w.heraldOf != null && Game.state.unlocks.heralds.indexOf(w.heraldOf) >= 0) return true;
    if (w.met && Object.prototype.hasOwnProperty.call(Game.state.unlocks.ledger, w.met)) return true;
    if (w.night != null && Game.state.night >= w.night) return true;
    return false;
  }
  function renderSong() {
    var picked = Prefs.get().track || "Sage's Favourite";
    var L = '<div class="tometitle">Bard’s Songbook</div>' +
      '<div class="tome-epigraph">P.E.K.K.A shares her phonograph tunes as she warms to you. The bar fills with them.</div>';
    for (var i = 0; i < window.SONGBOOK.length; i++) {
      var s = window.SONGBOOK[i];
      if (songUnlocked(s)) {
        L += '<div class="entry' + (s.name === picked ? " sel" : "") + '" data-i="' + i + '"><b>♪ ' + esc(s.name) + "</b><span>" + esc(s.by) + "</span></div>";
      } else {
        L += '<div class="entry locked"><b>—</b><span>—</span></div>';
      }
    }
    el("pageL").innerHTML = L;
    var rows = el("pageL").querySelectorAll(".entry");
    for (var t = 0; t < rows.length; t++) {
      (function (node) {
        node.addEventListener("click", function () {
          if (!node.hasAttribute("data-i")) return;                   /* locked rows carry no index */
          var i = +node.getAttribute("data-i");
          var s = window.SONGBOOK[i];
          if (!songUnlocked(s)) return;
          Prefs.set({ track: s.name });
          renderSong();
        });
      })(rows[t]);
    }
    el("pageR").innerHTML =
      '<div id="phonowrap"><div id="phonoglow"></div><img src="assets/ui/Songbook Phonograph (cutout).png" alt=""></div>' +
      '<div class="plaque">Now playing — “' + esc(picked) + '”</div>';
  }

  function wireEntries(pageId, cb) {
    var rows = el(pageId).querySelectorAll(".entry");
    for (var t = 0; t < rows.length; t++) {
      (function (node) {
        node.addEventListener("click", function () { cb(+node.getAttribute("data-i")); });
      })(rows[t]);
    }
  }

  /* tab hotspots */
  var tabIds = { "tab-brew": "brew", "tab-ledger": "ledger", "tab-herald": "herald", "tab-song": "song" };
  for (var id in tabIds) {
    (function (nodeId, tab) {
      el(nodeId).addEventListener("click", function () { render(tab); });
    })(id, tabIds[id]);
  }

  return { open: open, close: close, isOpen: isOpen, render: render };
})();
