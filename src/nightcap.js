/* The Night Cap share card (GDD §11, v1.4). At each Night's end the player can
   "Keep Tonight's Page": a 1200×1500 parchment postcard composed on a <canvas>
   from art the game already ships — no new generations — downloaded as a PNG or
   shared via the Web Share API (download fallback).

   Contents: the transparent logo · "Night N — [title]" · the real localised
   date · that Night's met visitors as mini card portraits · the drinks poured
   as tankard icons + recipe names · ONE curated spoiler-safe quote (from the
   Night's `nightcap` block — never the consequential brew or its outcome) ·
   Sage's green Caveat flourish · the game URL.

   Everything is same-origin, so the canvas is never tainted and toBlob works
   offline. UI chrome respects the current language via the string tables; the
   quote and Night title stay in the authored language, like the rest of the
   narrative content. */
window.NightCap = (function () {
  function el(id) { return document.getElementById(id); }

  /* FLAG (Tessa): swap for the hosted landing-page URL when it's live. */
  var GAME_URL = "github.com/tessa-kerk/elixir-hour";
  var W = 1200, H = 1500;

  var PALETTE = {
    cream: "#F4ECDD", creamHi: "#FBF4E4", charcoal: "#241F1B",
    ink: "#4a3a28", inkSoft: "#7a6748", gold: "#c9a55a", sageDeep: "#6B7F5C",
  };
  var LOCALES = { en: "en-GB", ko: "ko-KR", ja: "ja-JP", de: "de-DE", es: "es-ES", fr: "fr-FR", pt: "pt-PT" };

  /* ---- data derivation (all from the save + the Night's beats) ---- */

  function nightData(n) {
    var ns = window.NIGHTS || [];
    for (var i = 0; i < ns.length; i++) if (ns[i].night === n) return ns[i];
    return null;
  }

  function ledgerFor(who) {
    for (var i = 0; i < window.LEDGER.length; i++) if (window.LEDGER[i].who === who) return window.LEDGER[i];
    return null;
  }

  /* the Night's visitors, in first-appearance order, MET only (GDD §11) */
  function visitorsFor(n) {
    var nd = nightData(n);
    if (!nd) return [];
    var out = [], seen = {};
    function add(who) {
      if (!who || seen[who]) return;
      if (!Object.prototype.hasOwnProperty.call(Game.state.unlocks.ledger, who)) return;  /* met only */
      if (!ledgerFor(who)) return;                                                          /* has a card */
      seen[who] = 1; out.push(who);
    }
    (nd.beats || []).forEach(function (b) {
      if (b.type === "visit") add(b.who);
      else if ((b.type === "group" || b.type === "duo") && b.cast) b.cast.forEach(function (c) { add(c.who); });
    });
    return out;
  }

  /* named drinks served THIS Night — the consequential brew was never logged */
  function drinksFor(n) {
    var out = [], seen = {};
    (Game.state.poured || []).forEach(function (p) {
      if (p.night === n && p.recipe && !seen[p.recipe]) { seen[p.recipe] = 1; out.push(p.recipe); }
    });
    return out;
  }

  function dateStr() {
    var loc = LOCALES[window.LANG] || "en-GB";
    var d = new Date();
    try { return d.toLocaleDateString(loc, { year: "numeric", month: "long", day: "numeric" }); }
    catch (e) { return d.toLocaleDateString(); }
  }

  function gather(n) {
    var nd = nightData(n) || {};
    return {
      night: n,
      title: nd.title || "",
      date: dateStr(),
      visitors: visitorsFor(n),
      drinks: drinksFor(n),
      quote: nd.nightcap && nd.nightcap.quote ? nd.nightcap.quote : null,
    };
  }

  /* ---- asset + font loading (same-origin → canvas stays untainted) ---- */

  var imgCache = {};
  function loadImg(src) {
    if (imgCache[src]) return imgCache[src];
    imgCache[src] = new Promise(function (res, rej) {
      var im = new Image();
      im.onload = function () { res(im); };
      im.onerror = function () { rej(new Error("img " + src)); };
      im.src = src;
    });
    return imgCache[src];
  }

  /* Canvas font stacks. The self-hosted faces are Latin-subset only, so every
     stack ends in a generic family: for a non-Latin UI language (ko/ja/…), the
     localised chrome + date fall back to a predictable SYSTEM font instead of
     the browser's uncontrolled default (no tofu) — the same approach the DOM
     chrome already uses. A bundled CJK face for pixel-perfect canvas text is a
     possible M7 polish (flagged in PLAN.md); it isn't worth a multi-MB payload
     on a share card. */
  var F = {
    heading: "700 54px 'Baloo 2', sans-serif",
    label: "700 25px 'Baloo 2', sans-serif",
    date: "italic 600 30px 'Cormorant Garamond', serif",
    name: "600 22px 'Cormorant Garamond', serif",
    drink: "600 30px 'Cormorant Garamond', serif",
    quote: "italic 600 40px 'Cormorant Garamond', serif",
    speaker: "700 30px 'Baloo 2', sans-serif",
    flourish: "700 48px 'Caveat', cursive",
    footer: "700 24px 'Nunito', sans-serif",
  };

  var fontsReady = null;
  function ensureFonts() {
    if (fontsReady) return fontsReady;
    var jobs = [
      "700 58px 'Baloo 2'", "700 26px 'Baloo 2'", "700 30px 'Baloo 2'",
      "600 40px 'Cormorant Garamond'", "italic 600 40px 'Cormorant Garamond'",
      "italic 600 30px 'Cormorant Garamond'", "600 28px 'Cormorant Garamond'",
      "700 46px 'Caveat'", "700 24px 'Nunito'",
    ];
    var loads = jobs.map(function (f) { try { return document.fonts.load(f); } catch (e) { return Promise.resolve(); } });
    fontsReady = Promise.all(loads).then(function () { return document.fonts.ready; }).catch(function () {});
    return fontsReady;
  }

  /* ---- canvas drawing helpers ---- */

  function centre(ctx, text, y, font, colour, spacing) {
    ctx.save();
    ctx.font = font; ctx.fillStyle = colour; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    if (spacing != null && "letterSpacing" in ctx) ctx.letterSpacing = spacing + "px";
    ctx.fillText(text, W / 2, y);
    ctx.restore();
  }

  function wrapLines(ctx, text, font, maxW) {
    ctx.font = font;
    var words = String(text).split(" "), lines = [], line = "";
    for (var i = 0; i < words.length; i++) {
      var test = line ? line + " " + words[i] : words[i];
      if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = words[i]; }
      else line = test;
    }
    if (line) lines.push(line);
    return lines;
  }

  /* draw a card cropped to its measured content box into a dest rect */
  function drawCard(ctx, img, c, dx, dy, dw, dh) {
    var sx = c.box.l * c.px[0], sy = c.box.t * c.px[1];
    var sw = (c.box.r - c.box.l) * c.px[0], sh = (c.box.b - c.box.t) * c.px[1];
    ctx.save();
    /* soft rounded card with a gilt edge */
    roundRect(ctx, dx, dy, dw, dh, 10);
    ctx.shadowColor = "rgba(40,25,12,0.28)"; ctx.shadowBlur = 14; ctx.shadowOffsetY = 6;
    ctx.fillStyle = PALETTE.creamHi; ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.clip();
    ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
    ctx.restore();
    ctx.save();
    roundRect(ctx, dx, dy, dw, dh, 10);
    ctx.lineWidth = 3; ctx.strokeStyle = "rgba(201,165,90,0.85)"; ctx.stroke();
    ctx.restore();
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  /* fit a single line to a max width: pick the largest px size ≤ base that
     fits, down to a floor (long Night titles must not overflow the paper) */
  function centreFit(ctx, text, y, family, maxPx, minPx, colour, maxW, cx) {
    var px = maxPx;
    while (px > minPx) { ctx.font = "700 " + px + "px " + family; if (ctx.measureText(text).width <= maxW) break; px -= 2; }
    ctx.save();
    ctx.font = "700 " + px + "px " + family; ctx.fillStyle = colour; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    ctx.fillText(text, cx, y); ctx.restore();
  }

  /* a centred recipe name beneath a tankard, wrapped to at most two lines */
  function drawDrinkName(ctx, text, cx, y, colour, maxW) {
    var lines = wrapLines(ctx, text, F.name, maxW);
    if (lines.length > 2) lines = [lines[0], lines.slice(1).join(" ")];
    for (var i = 0; i < lines.length; i++) centre2(ctx, lines[i], cx, y + i * 26, F.name, colour);
  }

  /* ---- the composition: the card sits ON the parchment scroll (GDD §11
     updated 06/07), over a night backdrop with an Elixir-glow vignette — a
     share surface never ships as a bare transparent PNG. Content fills the
     flat paper between the rolls (§12 share-quality bar: no dead middle). ---- */

  async function compose(canvas, data) {
    canvas.width = W; canvas.height = H;
    var ctx = canvas.getContext("2d");

    /* 1. night backdrop + soft Elixir-glow vignette behind the scroll */
    ctx.fillStyle = "#1C1B3A"; ctx.fillRect(0, 0, W, H);
    var glow = ctx.createRadialGradient(W / 2, H * 0.45, 40, W / 2, H * 0.48, H * 0.62);
    glow.addColorStop(0, "rgba(140,76,182,0.42)");
    glow.addColorStop(0.55, "rgba(122,63,160,0.15)");
    glow.addColorStop(1, "rgba(122,63,160,0)");
    ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);

    /* 2. the scroll — ~92% of canvas height, centred */
    var scroll = await loadImg("assets/ui/Night Cap Scroll (cutout).png");
    var sH = H * 0.92, sW = sH * scroll.width / scroll.height;
    var sx = (W - sW) / 2, sy = (H - sH) / 2;
    ctx.drawImage(scroll, sx, sy, sW, sH);

    /* 3. the flat-paper safe zone between the rolls (never under the strap or
       on the rolls) — fractions of the scroll, tuned to the art */
    var zx0 = sx + 0.165 * sW, zx1 = sx + 0.835 * sW;
    var zy0 = sy + 0.215 * sH, zy1 = sy + 0.80 * sH;
    var zW = zx1 - zx0, cx = W / 2;

    var y = zy0;

    /* logo — the brand moment, noticeably bigger */
    try {
      var logo = await loadImg("assets/logo/Elixir Hour Logo (transparent).png");
      var s = Math.min((zW * 0.72) / logo.width, 150 / logo.height);
      var lw = logo.width * s, lh = logo.height * s;
      ctx.drawImage(logo, cx - lw / 2, y, lw, lh);
      y += lh + 14;
    } catch (e) { y += 140; }

    /* Night N — [title] (auto-fits so long titles never overflow the paper) */
    var heading = t("nightcap.night", { n: data.night }) + (data.title ? " — " + data.title : "");
    centreFit(ctx, heading, y + 38, "'Baloo 2', sans-serif", 48, 30, PALETTE.charcoal, zW, cx);
    y += 52;
    centre(ctx, data.date, y + 20, F.date, PALETTE.inkSoft);
    y += 36;
    /* thin gold rule with a small centred diamond */
    ctx.save();
    ctx.strokeStyle = PALETTE.gold; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx - 128, y + 8); ctx.lineTo(cx - 16, y + 8); ctx.moveTo(cx + 16, y + 8); ctx.lineTo(cx + 128, y + 8); ctx.stroke();
    ctx.fillStyle = PALETTE.gold;
    ctx.beginPath(); ctx.moveTo(cx, y + 1); ctx.lineTo(cx + 7, y + 8); ctx.lineTo(cx, y + 15); ctx.lineTo(cx - 7, y + 8); ctx.closePath(); ctx.fill();
    ctx.restore();
    y += 34;

    /* Tonight's Regulars — a centred row of mini card portraits, names beneath */
    if (data.visitors.length) {
      centre(ctx, t("nightcap.regulars"), y + 16, F.label, PALETTE.inkSoft, 2);
      y += 30;
      var cardH = 102, gap = 18, cards = [];
      for (var vi = 0; vi < data.visitors.length; vi++) {
        var c = ledgerFor(data.visitors[vi]);
        if (!c) continue;
        var aspect = ((c.box.r - c.box.l) * c.px[0]) / ((c.box.b - c.box.t) * c.px[1]);
        cards.push({ c: c, who: data.visitors[vi], w: cardH * aspect });
      }
      var total = cards.reduce(function (a, k) { return a + k.w; }, 0) + gap * (cards.length - 1);
      if (total > zW) { var f = zW / total; cardH *= f; for (var q = 0; q < cards.length; q++) cards[q].w *= f; total = zW; }
      var x = cx - total / 2;
      for (var k = 0; k < cards.length; k++) {
        var img = await loadImg(cards[k].c.card);
        drawCard(ctx, img, cards[k].c, x, y, cards[k].w, cardH);
        centre2(ctx, cards[k].who, x + cards[k].w / 2, y + cardH + 22,
          F.name, (window.CAST[cards[k].who] || {}).colour || PALETTE.ink);
        x += cards[k].w + gap;
      }
      y += cardH + 42;
    }

    /* Poured Tonight — a CENTRED row of tankard icons with recipe names beneath
       (mirrors the regulars row; never the old left-aligned list) */
    if (data.drinks.length) {
      centre(ctx, t("nightcap.poured"), y + 16, F.label, PALETTE.inkSoft, 2);
      y += 30;
      var tank = null;
      try { tank = await loadImg("assets/ui/Tankard Icon (cutout).png"); } catch (e) {}
      var tW = 52, tH = tank ? tW * tank.height / tank.width : tW;
      var cell = Math.min(zW / data.drinks.length, 168);
      var rowW = cell * data.drinks.length;
      var startX = cx - rowW / 2;
      for (var di = 0; di < data.drinks.length; di++) {
        var ccx = startX + cell * di + cell / 2;
        if (tank) ctx.drawImage(tank, ccx - tW / 2, y, tW, tH);
        drawDrinkName(ctx, data.drinks[di], ccx, y + tH + 20, PALETTE.ink, cell - 8);
      }
      y += tH + 20 + 38;
    }

    /* the one spoiler-safe quote — larger Cormorant, speaker in their colour;
       centred in the space between the drinks and the flourish, and always
       kept clear above it (the speaker baseline never reaches the flourish) */
    var flourishBase = zy1 - 34;
    if (data.quote) {
      var lines = wrapLines(ctx, "“" + data.quote.text + "”", F.quote, zW - 8);
      var lineH = 44, blockH = (lines.length - 1) * lineH, speakerGap = 30;
      var blockTotal = 34 + blockH + speakerGap;              /* ascent + lines + speaker */
      var bandBot = flourishBase - 58;                        /* speaker baseline stays above this */
      var topPad = Math.max(10, (bandBot - y - blockTotal) / 2);
      var firstBase = Math.min(y + topPad + 34, bandBot - speakerGap - blockH);
      for (var li = 0; li < lines.length; li++) centre(ctx, lines[li], firstBase + li * lineH, F.quote, PALETTE.charcoal);
      centre(ctx, "— " + data.quote.who, firstBase + blockH + speakerGap, F.speaker, (window.CAST[data.quote.who] || {}).colour || PALETTE.ink);
    }

    /* Sage's green flourish (Caveat — the ONLY green on the card) */
    ctx.save();
    ctx.translate(cx, flourishBase); ctx.rotate(-3 * Math.PI / 180);
    ctx.font = "700 42px 'Caveat', cursive"; ctx.fillStyle = PALETTE.sageDeep; ctx.textAlign = "center";
    ctx.fillText(t("nightcap.flourish"), 0, 0);
    ctx.restore();

    /* URL — small, at the paper's bottom edge */
    centre(ctx, GAME_URL, zy1 + 6, F.footer, PALETTE.inkSoft, 1);
  }

  function centre2(ctx, text, cx, y, font, colour) {
    ctx.save();
    ctx.font = font; ctx.fillStyle = colour; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    ctx.fillText(text, cx, y);
    ctx.restore();
  }

  /* ---- export / share ---- */

  function fileName(night) { return "elixir-hour-night-" + night + ".png"; }

  function toBlob(canvas) {
    return new Promise(function (res, rej) {
      /* toBlob's callback receives null if the UA can't create the blob —
         fall back to the (synchronous) dataURL path rather than passing null on */
      if (canvas.toBlob) canvas.toBlob(function (b) {
        if (b) res(b);
        else { try { res(dataURLtoBlob(canvas.toDataURL("image/png"))); } catch (e) { rej(e); } }
      }, "image/png");
      else { try { res(dataURLtoBlob(canvas.toDataURL("image/png"))); } catch (e) { rej(e); } }
    });
  }
  function dataURLtoBlob(u) {
    var b = atob(u.split(",")[1]), a = new Uint8Array(b.length);
    for (var i = 0; i < b.length; i++) a[i] = b.charCodeAt(i);
    return new Blob([a], { type: "image/png" });
  }

  function download(canvas, night) {
    toBlob(canvas).then(function (blob) {
      if (!blob) return;
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url; a.download = fileName(night);
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
    }).catch(function (e) { if (window.console) console.warn("Night Cap: download failed", e); });
  }

  function share(canvas, night, data) {
    toBlob(canvas).then(function (blob) {
      if (!blob) return;
      var file = new File([blob], fileName(night), { type: "image/png" });
      var payload = { files: [file], title: "Elixir Hour",
        text: t("nightcap.night", { n: night }) + (data.title ? " — " + data.title : "") };
      if (navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
        navigator.share(payload).catch(function () {});
      } else {
        download(canvas, night);
      }
    }).catch(function (e) { if (window.console) console.warn("Night Cap: share failed", e); });
  }

  /* ---- overlay control ---- */

  var current = { canvas: null, night: 1, data: null };

  async function open(night) {
    var overlay = el("nightcap");
    if (!overlay) return;
    overlay.classList.add("open");                 /* the shared .overlay shows on .open */
    el("nightcap-heading").textContent = t("nightcap.keep");
    var canvas = el("nightcap-canvas");
    var data = gather(night);
    current = { canvas: canvas, night: night, data: data };
    await ensureFonts();
    await compose(canvas, data);
    var shareable = !!(navigator.canShare && navigator.share);
    el("nightcap-share").hidden = !shareable;
  }

  function close() { var o = el("nightcap"); if (o) o.classList.remove("open"); }
  function isOpen() { var o = el("nightcap"); return !!o && o.classList.contains("open"); }

  function wire() {
    var d = el("nightcap-download"), s = el("nightcap-share"), x = el("nightcap-close");
    if (d) d.addEventListener("click", function () { download(current.canvas, current.night); });
    if (s) s.addEventListener("click", function () { share(current.canvas, current.night, current.data); });
    if (x) x.addEventListener("click", close);
    var ov = el("nightcap");
    if (ov) ov.addEventListener("click", function (e) { if (e.target === ov) close(); });
  }

  return { open: open, close: close, isOpen: isOpen, wire: wire,
           /* capture hook: compose to the shared canvas and hand back the blob */
           _composeBlob: function (night) {
             var canvas = el("nightcap-canvas");
             return ensureFonts().then(function () { return compose(canvas, gather(night)); }).then(function () { return toBlob(canvas); });
           } };
})();
