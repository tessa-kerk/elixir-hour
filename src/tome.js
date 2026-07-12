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
  /* R12 open-targets: a newly-met character opens the Ledger on its GRID (their
     card right there to tap); a new recipe opens the Brew Book ON that page. */
  function openLedgerGrid() {
    ledgerNav.view = "grid"; ledgerNav.sheet = 0; ledgerNav.gridSheet = 0;
    el("tome").classList.add("open");
    current = null;                          /* force render() to treat this as arriving at the grid */
    render("ledger");
  }
  function openRecipe(name) {
    var known = [];
    for (var i = 0; i < window.BREWBOOK.length; i++)
      if (Game.state.unlocks.recipes.indexOf(window.BREWBOOK[i].name) >= 0) known.push(window.BREWBOOK[i]);
    sel.brew = 0;
    for (var j = 0; j < known.length; j++) if (known[j].name === name) { sel.brew = j; break; }
    el("tome").classList.add("open");
    render("brew");
  }
  function close() { el("tome").classList.remove("open"); }
  function isOpen() { return el("tome").classList.contains("open"); }

  /* the nav overlay hosts ALL page furniture (grid button + fletched arrows);
     clearing it on every render is what guarantees no arrow ever lingers */
  function navHost() { return el("tomenav"); }
  function clearNav() { var h = navHost(); while (h.firstChild) h.removeChild(h.firstChild); }

  function render(tab) {
    /* arriving at the Ledger from elsewhere always opens the book on the grid */
    if (tab === "ledger" && current !== "ledger") { ledgerNav.view = "grid"; ledgerNav.sheet = 0; ledgerNav.gridSheet = 0; }
    current = tab;
    clearNav();                                   /* no stray nav from the previous tab/view */
    var sp = el("spread");
    if (sp) sp.hidden = true;                     /* only the ledger spread unhides it */
    var tabs = ["brew", "ledger", "herald", "song"];
    for (var i = 0; i < tabs.length; i++) {
      el("tab-" + tabs[i]).classList.toggle("on", tabs[i] === tab);
    }
    el("pageR").classList.remove("herald-paper");   /* R12: the Tome Herald tab is text-only — the 3D paper is reserved for the full-screen interstitial (too large for the book page, and text-only scales to any article length) */
    el("pageR").style.top = "";                      /* clear any portrait inline top (rotate / tab change) */
    if (tab === "brew") renderBrew();
    if (tab === "ledger") renderLedger();
    if (tab === "herald") renderHerald();
    if (tab === "song") renderSong();
    /* PORTRAIT list+detail tabs: drop the detail (pageR) directly beneath the list's ACTUAL
       content, so a short list (e.g. one Herald edition early game) has no blank gap before
       it, and the detail slides down as more entries fill in (Tessa 12-07). Ledger uses the
       full-height spread, not the list/detail split, so it's left alone. */
    if (tab !== "ledger" && window.Stage && Stage.isPortrait && Stage.isPortrait()) positionPortraitDetail();
  }
  function positionPortraitDetail() {
    var pl = el("pageL"), pr = el("pageR");
    if (!pl || !pr) return;
    pl.style.maxHeight = "";                                  /* natural (CSS max-height still caps) */
    var top = pl.offsetTop;
    pr.style.top = (top + pl.offsetHeight + 12) + "px";
    /* keep the detail ON the parchment: a full list at a large text size pushed the article past
       the paper's lower torn edge (Tessa 12-07). If it runs over, shrink the list so it scrolls,
       pulling the detail back up above the deckle (~95% of the stage = where the parchment ends). */
    var usableBottom = (window.Stage ? Stage.design().H : 1280) * 0.95;
    var over = (pr.offsetTop + pr.offsetHeight) - usableBottom;
    if (over > 0) {
      var cap = Math.max(90, pl.offsetHeight - over);
      pl.style.maxHeight = cap + "px";
      pr.style.top = (top + cap + 12) + "px";
    }
    /* the Songbook's phonograph is an <img> that grows pageR AFTER this runs, so re-measure once
       it loads (else the tall phono overflows unchecked). {once} + completeness guard = no loop. */
    var imgs = pr.querySelectorAll("img");
    for (var i = 0; i < imgs.length; i++) {
      if (!imgs[i].complete) imgs[i].addEventListener("load", positionPortraitDetail, { once: true });
    }
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
      L += '<div class="entry' + (j === sel.brew ? " sel" : "") + '" data-i="' + j + '"><b>' + esc(known[j].name) + "</b><span>" + esc(known[j].mix.map(canonTerm).join(" + ")) + "</span></div>";
    }
    el("pageL").innerHTML = L;
    wireEntries("pageL", function (i) { sel.brew = i; renderBrew(); });

    if (!known.length) { el("pageR").innerHTML = ""; return; }
    var r = known[sel.brew];
    var dots = "";
    for (var d = 0; d < r.dots.length; d++) dots += '<i style="background:' + r.dots[d] + '"></i>';
    el("pageR").innerHTML =
      '<div class="tometitle centre">' + esc(r.name) + "</div>" +
      '<img class="tome-tankard" src="assets/ui/Tankard Icon (cutout).webp" alt="">' +
      '<div class="ingdots">' + dots + "</div>" +
      '<div class="rp-caption strong">' + esc(r.mix.map(canonTerm).join(" + ")) + "</div>" +
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
  var ledgerNav = { view: "grid", who: 0, sheet: 0, gridSheet: 0 };
  /* Ledger grid layout (GDD §11 LOCKED 06/07 — regression guard): met cards
     fill a FIXED 3-column grid on the LEFT page first (uniform cells, top of
     the page down), THEN the right page, in join order. Pagination to a second
     sheet exists but stays invisible until the spread's real capacity (both
     pages) is exceeded — so the current five cards render IDENTICALLY to the
     signed-off single-page layout (all on the left, right page blank), and new
     characters slot into the next free cell without ever reflowing the earlier
     ones. 3 cols × 3 rows per page. */
  var GRID_LEFT_CAP = 9, GRID_RIGHT_CAP = 9, GRID_SPREAD_CAP = 18;

  function renderLedger() {
    if (ledgerNav.view === "spread") renderLedgerSpread();
    else renderLedgerGrid();
  }

  function gridCardHTML(c, idx) {
    var met = Object.prototype.hasOwnProperty.call(Game.state.unlocks.ledger, c.who);
    return '<div class="cardthumb' + (met ? "" : " locked") + '" data-i="' + idx + '">' +
           cardClipHTML(c, 86, "cardclip") + "<small>" + (met ? esc(c.who) : "—") + "</small></div>";
  }

  function renderLedgerGrid() {
    el("spread").hidden = true;
    clearNav();
    var all = window.LEDGER;
    var nSheets = Math.max(1, Math.ceil(all.length / GRID_SPREAD_CAP));
    if (ledgerNav.gridSheet >= nSheets) ledgerNav.gridSheet = nSheets - 1;
    if (ledgerNav.gridSheet < 0) ledgerNav.gridSheet = 0;
    var start = ledgerNav.gridSheet * GRID_SPREAD_CAP;
    var sheetCards = all.slice(start, start + GRID_SPREAD_CAP);
    var leftCards = sheetCards.slice(0, GRID_LEFT_CAP);          /* LEFT page fills first */
    var rightCards = sheetCards.slice(GRID_LEFT_CAP);            /* then spills onto the right */

    var head = '<div class="tometitle">Regulars’ Ledger</div>' +
      (ledgerNav.gridSheet === 0 ? '<div class="tome-epigraph">Cards land in the ledger as tokens of trust — earned, never asked for.</div>' : '');
    var L = head + '<div class="cardgrid">';
    for (var i = 0; i < leftCards.length; i++) L += gridCardHTML(leftCards[i], start + i);
    L += "</div>";
    el("pageL").innerHTML = L;

    if (rightCards.length) {
      var R = '<div class="cardgrid facing">';
      for (var j = 0; j < rightCards.length; j++) R += gridCardHTML(rightCards[j], start + GRID_LEFT_CAP + j);
      R += "</div>";
      el("pageR").innerHTML = R;
      /* align the right grid's first row with the left grid's first row (drop
         it below where the header sits on the left page) */
      var lg = el("pageL").querySelector(".cardgrid");
      var rg = el("pageR").querySelector(".cardgrid");
      if (lg && rg) rg.style.paddingTop = lg.offsetTop + "px";
    } else {
      el("pageR").innerHTML = "";                                /* blank facing page (signed-off 5-card layout) */
    }
    wireGridThumbs("pageL");
    wireGridThumbs("pageR");

    /* grid pagination — fletched prev/next only when a neighbouring sheet exists */
    if (ledgerNav.gridSheet > 0) {
      var gp = handNavEl("prev"); gp.classList.add("prev");
      gp.addEventListener("click", function () {
        flipTo(function () { ledgerNav.gridSheet--; renderLedgerGrid(); }, "rev");
      });
      navHost().appendChild(gp);
    }
    if (ledgerNav.gridSheet < nSheets - 1) {
      var gn = handNavEl("next"); gn.classList.add("next");
      gn.addEventListener("click", function () {
        flipTo(function () { ledgerNav.gridSheet++; renderLedgerGrid(); }, "fwd");
      });
      navHost().appendChild(gn);
    }
  }

  function wireGridThumbs(pageId) {
    var thumbs = el(pageId).querySelectorAll(".cardthumb");
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
    /* §R16 the page's horizontal budget, per page:
         [ lane ][ printed body text = colW ][ lane ]
       The two OUTER lanes are the flow's left/right margins; the two INNER lanes live inside
       the gutter, either side of the painted spine. Sage's notes sit in the lanes, never in
       the text column — which is why the body can now use the full column width. */
    var L = laneMetrics(vpW);
    var gap = 2 * L.LANE + 2 * L.SPINE;          /* the spine/gutter, wide enough for two lanes */
    var flowW = vpW - 2 * L.LANE;
    /* PORTRAIT: one WIDE readable column per page (Tessa 12-07 — two narrow columns read
       poorly on a phone). The page-turn advances one column instead of two; Sage's notes
       still sit in the outer lanes. Landscape keeps the signed-off two-page book spread. */
    var portrait = !!(window.Stage && Stage.isPortrait && Stage.isPortrait());
    var perView = portrait ? 1 : 2;
    var colW = portrait ? flowW : Math.floor((flowW - gap) / 2);
    flow.style.marginLeft = L.LANE + "px";
    flow.style.marginRight = L.LANE + "px";
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
    layoutSpreadNotes(c, stage, flow, overlay, colW, gap, pageH, L);

    /* sheets: a view shows `perView` columns (2 landscape / 1 portrait); turning slides the strip */
    var stripW = flow.scrollWidth;
    var nCols = Math.max(1, Math.round((stripW + gap) / (colW + gap)));
    var nSheets = Math.max(1, Math.ceil(nCols / perView));
    if (ledgerNav.sheet >= nSheets) ledgerNav.sheet = nSheets - 1;
    flow.style.transform = "translateX(" + (-ledgerNav.sheet * perView * (colW + gap)) + "px)";

    /* nav (GDD §11 final): the fletched arrow is RESERVED for page-turns —
       prev/next, and only when that sheet exists (prev never on sheet 0).
       Back-to-grid is a DISTINCT round grid button, never a second arrow. */
    clearNav();
    var back = gridBtnEl();
    back.addEventListener("click", function () {
      flipTo(function () { closeSpread(); renderLedgerGrid(); }, "rev");
    });
    navHost().appendChild(back);
    if (ledgerNav.sheet > 0) {
      var prev = handNavEl("prev");
      prev.classList.add("prev");
      prev.addEventListener("click", function () {
        flipTo(function () { ledgerNav.sheet--; renderLedgerSpread(); }, "rev");
      });
      navHost().appendChild(prev);
    }
    if (ledgerNav.sheet < nSheets - 1) {
      var next = handNavEl("next");
      next.classList.add("next");
      next.addEventListener("click", function () {
        flipTo(function () { ledgerNav.sheet++; renderLedgerSpread(); }, "fwd");
      });
      navHost().appendChild(next);
    }
  }

  function closeSpread() {
    el("spread").hidden = true;
    ledgerNav.view = "grid";
  }

  /* §R16 — the note lane, derived once from the viewport width.
       LANE   = the full lane, measured outward from the body-text edge (Tessa's blue) to the
                outer limit near the page edge (her red).
       CLEAR  = the untouchable gutter between printed text and ANY note or connector (≥12px).
       STROKE = the run the connector gets to draw across, between the note and CLEAR.
       EDGE   = a sliver held back at the outer limit, so a tilted note never bleeds into the
                viewport's clip (the tilts rotate ±2.4° and offsetHeight ignores that).
       NOTEW  = whatever is left — the handwriting's own column.
     Because LANE = NOTEW + STROKE + CLEAR + EDGE by construction, a note can never come closer
     than CLEAR to the type, and the connector always has a real line to be. */
  /* the player's --text-scale (WS1 mobile-polish): Sage's margin notes scale with the rest
     of the type ramp, so at Large/Extra Large the handwriting column must GROW with the text
     or the hand wraps to ribbons. Default 1 → unchanged geometry (signed-off pages intact). */
  function textScale() {
    var stage = document.getElementById("stage");
    var s = stage ? parseFloat(getComputedStyle(stage).getPropertyValue("--text-scale")) : 1;
    return s > 0 ? s : 1;
  }
  function laneMetrics(vpW) {
    /* the 80px floor is what keeps PORTRAIT's notes at their old ~46px width — a bare
       proportional lane there collapses NOTEW to 38px and Sage's hand wraps to ribbons */
    var LANE0 = Math.max(80, Math.min(94, Math.round(vpW * 0.108)));
    var CLEAR = 13;                                   /* Tessa's ~12px minimum, with a hair spare */
    var STROKE = Math.max(14, Math.round(vpW * 0.023));
    var EDGE = 5;
    var NOTEW0 = LANE0 - STROKE - CLEAR - EDGE;
    /* widen the handwriting column WITH the text scale so larger notes never wrap to ribbons
       or overflow the lane; the extra width comes out of the body column, which just paginates
       onto more sheets. At scale 1, NOTEW === NOTEW0 and LANE === LANE0 (byte-identical). The
       STROKE/CLEAR/EDGE guarantees (§R16) hold because LANE stays NOTEW + STROKE + CLEAR + EDGE. */
    var NOTEW = Math.round(NOTEW0 * textScale());
    var LANE = NOTEW + STROKE + CLEAR + EDGE;
    return { LANE: LANE, CLEAR: CLEAR, STROKE: STROKE, EDGE: EDGE,
             NOTEW: NOTEW, SPINE: 10 };
  }

  /* §R17 — every glyph LINE box under `root` except the ones belonging to `skipEl` (so a
     connector may land on its own target phrase but must stay clear of everything else —
     other marks, plain body text, even other notes' handwriting). Coordinates come back in
     STRIP-local space ((screen-flowRect)/scale), the same space sx/sTop/colLeft already use.
     Text is measured as line boxes (getClientRects), not element boxes, so ragged whitespace
     beside a short phrase stays usable — the exact technique the share page's connector uses
     (cap.js glyphRects, §R16), lifted here rather than re-derived. */
  function glyphLineRects(root, flowRect, scale, skipEl) {
    var wk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    var out = [], n;
    while ((n = wk.nextNode())) {
      if (!n.nodeValue.replace(/\s+/g, "")) continue;
      if (skipEl && skipEl.contains(n.parentNode)) continue;
      var rg = document.createRange(); rg.selectNodeContents(n);
      var rs = rg.getClientRects();
      for (var i = 0; i < rs.length; i++) {
        if (rs[i].width < 0.5 || rs[i].height < 0.5) continue;
        out.push({ l: (rs[i].left - flowRect.left) / scale, r: (rs[i].right - flowRect.left) / scale,
                   t: (rs[i].top - flowRect.top) / scale, b: (rs[i].bottom - flowRect.top) / scale });
      }
    }
    return out;
  }

  /* segment vs padded AABB (slab method) — same test cap.js's hitsRect runs for its one line. */
  function segHitsRect(x1, y1, x2, y2, r, pad) {
    var l = r.l - pad, rt = r.r + pad, tp = r.t - pad, bt = r.b + pad;
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

  /* Place Sage's notes on the overlay in strip coordinates: each note sits in the lane
     nearest its phrase, level with that phrase's line, joined to it by one plain line.
     Rect maths are transform-safe (everything divides by the stage scale) and column-aware
     via each mark's first line box. Two passes: first place every note (unchanged from R16 —
     positions are signed off), THEN draw every connector once all notes exist, so each line's
     collision check sees the whole page, not just the notes placed before it. */
  function layoutSpreadNotes(c, stage, flow, overlay, colW, gap, pageH, L) {
    var svg = overlay.querySelector("svg.note-arrows");
    var stageEl = document.getElementById("stage");
    var scale = stageEl.getBoundingClientRect().width / Stage.design().W || 1;
    var flowRect = flow.getBoundingClientRect();
    var lastBottom = {};
    var noteI = 0;
    var items = [];

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

        /* the note goes in the lane NEAREST its phrase (GDD §11: a line must never cross
           other text — short beats scattered) */
        var side = ((sx + sRight) / 2 - colLeft) < colW / 2 ? "left" : "right";
        var key = col + "|" + side;
        var noteEl = document.createElement("div");
        noteEl.className = "hand-note margin-note tilt" + (noteI++ % 3);
        noteEl.textContent = note.note;
        noteEl.style.width = L.NOTEW + "px";
        /* the note hugs the edge FACING its phrase (right-align in the left lane, left-align in
           the right lane) so the line's tail starts AT the handwriting, never in the ragged
           whitespace beside it (§R14 "tail must sit at its note"). */
        noteEl.style.textAlign = side === "left" ? "right" : "left";
        overlay.appendChild(noteEl);
        /* stacked-note breathing room: when two notes fall in the same lane, the
           second sits at least this far below the first (round 22c: 6→14 — Ronin's
           short bio put two marks a line apart and the notes read cramped). Only
           binds on notes that would collide, so well-spread pages are untouched. */
        var top = Math.max(sTop + 2, (lastBottom[key] || -1e9) + 14);
        top = Math.min(top, pageH - noteEl.offsetHeight - 4);
        var noteH = noteEl.offsetHeight;
        noteEl.style.top = top + "px";
        /* the note box is pushed OUT to the lane's outer limit (Tessa's red, held back by EDGE),
           so the whole lane between it and the body text belongs to the connector + the clearance */
        noteEl.style.left = (side === "left" ? colLeft - L.LANE + L.EDGE
                                             : colLeft + colW + L.CLEAR + L.STROKE) + "px";
        lastBottom[key] = top + noteH;
        items.push({ span: span, side: side, top: top, noteH: noteH,
                     sx: sx, sRight: sRight, sTop: sTop, sH: sH, colLeft: colLeft });
      }
    }

    /* §R17: the connector LANDS ON its underlined phrase — the ONE piece of type a line is
       allowed, meant, to touch; the CLEAR gutter keeps it off everything else, including OTHER
       notes' own handwriting when collision-stacking has pushed one note far from its phrase's
       line (the P.E.K.K.A case: two marks a line apart, but the first note's height pushes the
       second note's box well below its target). R16's fix clamped the line's endpoint to the
       pushed-down note's OWN vertical band, so it never crossed anything — but for a note pushed
       far from its phrase, that clamp also meant the line could never REACH the phrase, which is
       the regression Tessa caught. The x-boundary each note's connector starts from (x1 below) is
       identical for every note in a lane and sits exactly at every note's own right/left edge, so
       a straight line from there can never re-enter another note's box — the only remaining risk
       is the short final approach into the text column grazing a DIFFERENT line of body text.
       Fixed with the same technique the share page's connector already uses (§R16 cap.js): try a
       few start/end anchors, reject any segment that crosses text that isn't the target, keep the
       shortest survivor.
       §R18: the tip stops GAP px SHORT of the phrase's near edge, not on it — a real margin mark
       reads as separate from the printed line, never welded to the underline. The phrase's own
       underline still pairs the two, so the small gap is unambiguous. */
    var GAP = 4;   /* px short of the phrase's near edge (native scale) — visibly separate, still paired */
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var x1 = it.side === "left" ? it.colLeft - L.CLEAR - L.STROKE : it.colLeft + colW + L.CLEAR + L.STROKE;
      var x2 = it.side === "left" ? it.sx - GAP : it.sRight + GAP;
      var y1cands = [it.top + Math.min(it.noteH * 0.5, 13), it.top + 4, it.top + it.noteH - 6];
      var y2cands = [it.sTop + it.sH - 3, it.sTop + it.sH * 0.5, it.sTop + 3];
      var blockers = glyphLineRects(flow, flowRect, scale, it.span);
      var best = null, bestLen = Infinity;
      for (var pass = 0; pass < 2 && !best; pass++) {
        var pad = pass === 0 ? 4 : 1;
        for (var yi = 0; yi < y1cands.length; yi++) {
          for (var yj = 0; yj < y2cands.length; yj++) {
            var yy1 = y1cands[yi], yy2 = y2cands[yj];
            var len2 = (x2 - x1) * (x2 - x1) + (yy2 - yy1) * (yy2 - yy1);
            if (len2 >= bestLen) continue;
            var clear = true;
            for (var b = 0; b < blockers.length; b++) {
              if (segHitsRect(x1, yy1, x2, yy2, blockers[b], pad)) { clear = false; break; }
            }
            if (clear) { best = { y1: yy1, y2: yy2 }; bestLen = len2; }
          }
        }
      }
      if (!best) {
        if (window.console) console.warn("Tome: no clear path for a note's line — drawing the default anyway");
        best = { y1: y1cands[0], y2: y2cands[0] };
      }
      placeArrow(svg, x1, best.y1, x2, best.y2);
    }

    var w = Math.max(flow.scrollWidth, colW);
    overlay.style.width = w + "px";
    svg.setAttribute("width", w);
    svg.setAttribute("height", pageH);
  }

  /* A character's page depth = the highest stage slot their Ledger unlocks
     have filled (the beats write stage-indexed notes — see data/nights.js).
     v2 saves carried one note string = stage 1. DEV_LEDGER_STAGE still
     overrides for layout preview. */
  function ledgerStage(who) {
    if (window.DEV_LEDGER_STAGE) return window.DEV_LEDGER_STAGE;
    var l = Game.state.unlocks.ledger;
    if (!Object.prototype.hasOwnProperty.call(l, who)) return 1;
    var v = l[who];
    var n = typeof v === "string" ? 1 : (v && v.length ? v.length : 1);
    return Math.max(1, Math.min(3, n));
  }

  /* Page-TURN navigation only (GDD §11): the ornate fletched-arrow icon
     (Art/UI). It points left as drawn — the next-page arrow flips it. This
     icon is RESERVED for turning to a prev/next sheet, on both the character
     spread and the paginated grid — never for jumping back to the grid. */
  function handNavEl(kind, title) {
    var d = document.createElement("div");
    d.className = "hand-nav";
    if (title) d.title = title;
    d.innerHTML = '<img src="assets/ui/Nav Arrow (icon).webp" alt=""' + (kind === "next" ? ' class="flip"' : "") + ">";
    return d;
  }

  /* Back-to-grid is a DISTINCT affordance (GDD §11, locked art): the Card
     Select icon — a fanned hand of sage-green cards with gold character
     embossing — top-left on the left page's paper, sitting directly on the
     paper with a soft contact shadow and a hover/press lift. Never the fletched
     page-turn arrow, never Sage's green hand. */
  function gridBtnEl() {
    var d = document.createElement("div");
    d.className = "grid-btn";
    d.title = "Back to the regulars";
    d.innerHTML = '<img src="assets/ui/Card Select (icon).webp" alt="Back to the regulars">';
    return d;
  }

  /* the 3D page-turn: opaque page-art covers occlude BOTH pages for the whole
     turn (the destination is never visible early); the full-page leaf, hinged
     at the spine, rotates over them. The content swap happens under the
     covers; everything lifts together the moment the leaf lands. dir is
     "fwd" (turning onward) or "rev" (turning back). */
  function flipTo(cb, dir) {
    if (window.Sound) Sound.sfx("page-turn");
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


  /* §R15 — NO ARROWHEAD (Tessa's final call after four rounds of head/tail bugs):
     each annotation is ONE hand-drawn line only — a single green stroke with a gentle
     organic curve, running from the note to the printed phrase. No head, no tick, no
     fork = nothing left to misalign. The phrase stays underlined (that marks it), so
     direction is never ambiguous and the note→phrase rule is retired. Three shaft
     curves (straight / bow-down / bow-up) placed by a rigid translate+rotate+scale;
     the belly always dips into the inter-line gap so it never crosses other words. */
  var ARROW_SHAFTS = {
    straight: "M0 0 L100 0",
    down:     "M0 0 Q48 16 100 3",
    up:       "M0 0 Q48 -16 100 -3",
  };
  function placeArrow(svg, x1, y1, x2, y2) {
    var dx = x2 - x1, dy = y2 - y1;
    var dist = Math.sqrt(dx * dx + dy * dy) || 1;
    var ang = Math.atan2(dy, dx) * 180 / Math.PI;
    /* belly falls BELOW the line (down curve rightward, up curve leftward which after
       its ~180° rotation also bows down); a STEEP line (|dy|>18) goes straight — no C-bow. */
    var kind = Math.abs(dy) > 18 ? "straight" : (dx >= 0 ? "down" : "up");
    var g = document.createElementNS(SVGNS, "g");
    g.setAttribute("transform", "translate(" + x1.toFixed(1) + " " + y1.toFixed(1) +
      ") rotate(" + ang.toFixed(2) + ") scale(" + (dist / 100).toFixed(4) + ")");
    var p = document.createElementNS(SVGNS, "path");
    p.setAttribute("d", ARROW_SHAFTS[kind]);
    p.setAttribute("vector-effect", "non-scaling-stroke");   /* keep the 1.8px stroke constant despite the scale */
    g.appendChild(p);
    svg.appendChild(g);
  }

  /* ---- Today's Edition (§R20) --------------------------------------------
     The one page of the Herald that reports the REAL Clash Royale. Ungated: a
     live companion always has today's paper, even on a fresh save.

     `live.validUntil` is the season's last day, INCLUSIVE, compared as a local
     calendar date — never `new Date(iso)`, which parses "YYYY-MM-DD" as UTC.
     That would retire the edition a full day early for every player WEST of
     Greenwich: on 3 Aug in New York, local midnight is already 3 Aug 05:00 UTC,
     which sorts after the parsed 3 Aug 00:00 UTC. Half the player base would
     lose the last day of the season.

     Anything unexpected — no file, no live item, a missing, malformed or
     rolled-over date — falls through to `evergreen`. The failure mode is an
     undated page that is always true, never a stale headline. */
  function localMidnight(iso) {
    var p = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ""));
    if (!p) return null;
    var y = +p[1], m = +p[2], d = +p[3];
    var dt = new Date(y, m - 1, d);
    /* reject 2026-02-31 and friends — JS would silently roll them forward */
    if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null;
    return dt;
  }
  function todayEdition() {
    var T = window.TODAY_EDITION;
    if (!T) return null;
    var live = T.live, end = live && localMidnight(live.validUntil);
    if (live && live.head && end) {
      var n = new Date();
      var today = new Date(n.getFullYear(), n.getMonth(), n.getDate());
      if (today.getTime() <= end.getTime()) return live;      /* inclusive of the last day */
    }
    return (T.evergreen && T.evergreen.head) ? T.evergreen : null;
  }

  /* ---- Arena Herald: today's edition, then unlocked back editions ---- */
  function renderHerald() {
    var eds = [];
    var live = todayEdition();
    if (live) eds.push(live);                     /* always first, never progression-gated */
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
    /* the epilogue edition prints the ONE line the Knight's last cup wrote
       (GDD §8) plus the decree-lifted closer */
    var story = esc(h.story);
    if (h.consequence) {
      story += "<br><br>" + esc(h.consequence[Game.state.consequence === "rattled" ? "rattled" : "clear"]);
    }
    if (h.story2) story += "<br><br>" + esc(h.story2);
    if (h.story3) story += "<br><br>" + esc(h.story3);
    el("pageR").innerHTML =
      /* text-only (R12): edition line → headline → story, on the plain page.
         Today's Edition carries a dateline after its edition mark; the four
         story editions have none, so the caption is unchanged for them. */
      '<div class="rp-caption">' + esc(h.ed) + (h.dateline ? " · " + esc(h.dateline) : "") + "</div>" +
      '<div class="headline">' + esc(h.head) + "</div>" +
      '<div class="story">' + story + "</div>" +
      (h.ripple ? '<div class="ripple">⚗ Traced to a quiet brew poured at a certain bar the night before.</div>' : "");
  }

  /* ---- Bard's Songbook: pick the bar's tune (wired to Sound, round 11) ----
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
          if (window.Sound) Sound.setTrack(s.name);   /* switch the bar's tune */
          renderSong();
        });
      })(rows[t]);
    }
    el("pageR").innerHTML =
      '<div id="phonowrap"><div id="phonoglow"></div><img src="assets/ui/Songbook Phonograph (cutout).webp" alt=""></div>' +
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

  /* §R15 auto-hiding scrollbar: flag #pageL "scrolling" while it scrolls (fades the
     slim bar in), clear it ~700ms after the last scroll (fades it back out). */
  (function () {
    var pl = el("pageL");
    if (!pl) return;
    var to = null;
    pl.addEventListener("scroll", function () {
      pl.classList.add("scrolling");
      if (to) window.clearTimeout(to);
      to = window.setTimeout(function () { pl.classList.remove("scrolling"); }, 700);
    });
  })();

  return { open: open, openLedgerGrid: openLedgerGrid, openRecipe: openRecipe, close: close, isOpen: isOpen, render: render };
})();
