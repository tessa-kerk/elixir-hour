/* The dialogue engine (GDD §14.4). Plays a visit/scene/group/duo beat's
   script[]: spoken lines (click to advance, expression swaps), narration,
   tone-shaping choices (with optional inline replies), brew gates (wrong
   pours repeat the request — the gentle beat; no fail state; `any` accepts
   a set of serves, `wrongIf` plays a bespoke reaction to a specific wrong
   mixer), THE consequential brew (every pour accepted, result stored for
   the epilogue — GDD §8), and Tome unlocks. cue entries (sfx/art) are
   skipped until Milestone 7 wires audio/scene dressing.
   Group/duo beats route their lines to their own screens via the ui
   adapter; choices and brew gates stay serve-only (the mixing panel and
   choice stack live on the serve screen). */
window.Dialogue = (function () {
  function el(id) { return document.getElementById(id); }

  var SAGE_COLOUR = "#6B7F5C";
  var NARRATION_COLOUR = "#c9bda6";

  var beat = null;          // the beat being played
  var queue = [];           // remaining entries (reply entries get unshifted)
  var curEntry = null;      // the entry currently displayed/paused on (for within-beat resume, P0-1)
  var mode = "idle";        // idle | line | choice | brew
  var gate = null;          // active brew entry
  var ui = null;            // per-beat-type line/expression router
  var pageState = null;     // { who, colour, narration, sel, pages:[raw], i } — bubble pagination (§11)

  function fmt(text) {
    var s = String(text)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return s.replace(/\*\((.*?)\)\*/g, "<em>($1)</em>");
  }

  function customer() { return beat && beat.who ? beat.who : null; }

  /* the Order Strip text (§7) — the customer's request in their OWN words. The
     gate's `nudge` is exactly that line (it's what a wrong pour re-states), so
     the player never has to remember an order from lines ago. Long nudges carry
     a curated `orderShort` (hand-trimmed, ends "…"); the strip shows that and a
     tap reveals the full request. Empty text (between beats, cleared on pour) hides
     the strip so no blank bar shows; every real gate — including the Night-3
     consequence gate (round-7) — now carries text and keeps the strip up. */
  function orderText(g) { return g ? fmt(g.orderShort || g.nudge || g.wrong || "") : ""; }
  function orderFull(g) { return g ? fmt(g.nudge || g.wrong || "") : ""; }

  /* ---- Bubble pagination (§11) ----------------------------------------------
     A bubble never exceeds ~4 text lines. A long scripted line splits at
     sentence boundaries into pages shown one at a time in the same bubble,
     advanced by the same click/tap with the ▼. The script stays verbatim —
     the engine paginates, nobody rewrites lines, and a bubble never covers the
     speaker's face. */
  var MAX_BUBBLE_LINES = 4;

  function renderPageHtml(raw, narration) {
    var h = fmt(raw);
    return narration ? "<em>" + h + "</em>" : h;
  }

  /* split into sentences, keeping *(stage directions)* whole (an internal
     period must not create a false break) */
  function splitSentences(text) {
    text = String(text);
    var out = [], start = 0, depth = 0;
    for (var i = 0; i < text.length; i++) {
      var ch = text.charAt(i);
      /* track *(stage directions)* so an internal period can't split a sentence */
      if (ch === "*" && text.charAt(i + 1) === "(") { depth++; i++; continue; }
      if (ch === ")" && text.charAt(i + 1) === "*") { if (depth > 0) depth--; i++; continue; }
      if (depth === 0 && ".!?…".indexOf(ch) >= 0) {
        var j = i;
        while (j + 1 < text.length && ".!?…".indexOf(text.charAt(j + 1)) >= 0) j++;
        while (j + 1 < text.length && "\"')]”’".indexOf(text.charAt(j + 1)) >= 0) j++;
        /* break only when the punctuation ends a word (space/end) — not "3.5" or "e.g." */
        if (j + 1 >= text.length || /\s/.test(text.charAt(j + 1))) {
          var seg = text.slice(start, j + 1).replace(/^\s+/, "");
          if (seg) out.push(seg);
          start = j + 1;
        }
        i = j;
      }
    }
    if (start < text.length) { var tail = text.slice(start).replace(/^\s+/, ""); if (tail) out.push(tail); }
    return out.length ? out : [text];
  }

  /* Split a line into BEATS at the preferred split point (§11): immediately
     before a bracketed *(stage direction)* that starts a new beat — i.e. one
     preceded by sentence-ending punctuation or at the very start. A stage
     direction mid-sentence ("settles *(with a grunt)* onto…") is NOT a break. */
  function splitBeats(text) {
    text = String(text);
    var out = [], start = 0, depth = 0;
    for (var i = 0; i < text.length; i++) {
      var ch = text.charAt(i);
      if (ch === "*" && text.charAt(i + 1) === "(") {
        if (depth === 0 && i > start) {
          var j = i - 1;
          while (j >= start && /\s/.test(text.charAt(j))) j--;
          var prev = j >= start ? text.charAt(j) : "";
          if (prev === "" || ".!?…".indexOf(prev) >= 0) {
            var seg = text.slice(start, i).replace(/\s+$/, "");
            if (seg) out.push(seg);
            start = i;
          }
        }
        depth++; i++; continue;
      }
      if (ch === ")" && text.charAt(i + 1) === "*") { if (depth > 0) depth--; i++; continue; }
    }
    var tail = text.slice(start).replace(/^\s+/, "");
    if (tail) out.push(tail);
    return out.length ? out : [text];
  }

  /* Render a spoken/narration line, paginating if it overflows the bubble.
     Renders the FULL text first (so the bubble takes its real width), and only
     splits when it exceeds ~4 lines. Split PREFERENCE (§11): (1) before a
     bracketed stage direction — so each beat gets its own page — then (2) at
     sentence boundaries within a beat that's still too long. */
  function startLine(who, colour, rawText, narration) {
    var sel = (ui.targetSel ? ui.targetSel(who) : { line: "#serve-line" }).line;
    var lineEl = document.querySelector(sel);
    ui.line(who, colour, renderPageHtml(rawText, narration));
    if (Screens.bubbleLineCount(sel) <= MAX_BUBBLE_LINES) { pageState = null; return; }

    function fits(t) { if (lineEl) lineEl.innerHTML = renderPageHtml(t, narration); return Screens.bubbleLineCount(sel) <= MAX_BUBBLE_LINES; }
    var pages = [];
    var beats = splitBeats(rawText);
    for (var b = 0; b < beats.length; b++) {
      if (fits(beats[b])) { pages.push(beats[b]); continue; }
      /* the beat itself is too long → fall back to sentence packing */
      var sentences = splitSentences(beats[b]);
      var cur = "";
      for (var s = 0; s < sentences.length; s++) {
        var trial = cur ? cur + " " + sentences[s] : sentences[s];
        if (cur && !fits(trial)) { pages.push(cur); cur = sentences[s]; }
        else cur = trial;
      }
      if (cur) pages.push(cur);
    }
    if (pages.length <= 1) { pageState = null; ui.line(who, colour, renderPageHtml(rawText, narration)); return; }

    pageState = { who: who, colour: colour, narration: narration, sel: sel, pages: pages, i: 0 };
    ui.line(who, colour, renderPageHtml(pages[0], narration));   /* re-render page 0 (re-positions/clamps) */
  }

  function showPage(n) {
    pageState.i = n;
    ui.line(pageState.who, pageState.colour, renderPageHtml(pageState.pages[n], pageState.narration));
  }

  /* Which screen draws this beat's lines. Group/duo place the words at the
     speaker themselves; serve keeps the single-customer bubble. */
  function uiFor(b) {
    if (b.type === "group") return {
      setup: function () { Screens.renderGroup(b); },
      expr: function (who, expr) { Screens.groupExpr(who, expr); },
      line: function (who, colour, html) { Screens.groupLine(who, colour, html); },
      targetSel: function () { return { line: "#group-bubble .line" }; },
    };
    if (b.type === "duo") return {
      setup: function () { Screens.renderDuo(b); },
      expr: function (who, expr) { Screens.duoExpr(who, expr); },
      line: function (who, colour, html) { Screens.duoLine(who, colour, html); },
      targetSel: function () { return { line: "#duo-box .line" }; },
    };
    return {
      setup: function () { Screens.setServeCustomer(b.who || null, b.expr); },
      expr: function (who, expr) { if (who === customer()) Screens.setServeCustomer(who, expr); },
      line: function (who, colour, html) {
        /* Sage speaks from behind the counter, not above the customer (Fix 4):
           her lines go to the bottom-left sage bubble; the customer (and
           narration) stay in the top bubble. Only one shows at a time. */
        if (who === "Sage") { Screens.sageLine(html); Screens.hideServeBubble(); }
        else { Screens.hideSageBubble(); Screens.serveLine(who, colour, html, who === customer()); }
      },
      targetSel: function (who) { return { line: who === "Sage" ? "#sage-line" : "#serve-line" }; },
    };
  }

  function start(b) {
    beat = b;
    queue = (b.script || []).slice();
    curEntry = null;
    pageState = null;
    gate = null;
    Brew.setOrder(null);         /* no stale gate order from a prior beat (GDD §7) */
    Brew.lock(); Screens.setOrderText("");   /* §7: locked until this beat's customer orders */
    ui = uiFor(b);
    ui.setup();
    Screens.hideServeChoices();
    Screens.hideSageBubble();
    step();
  }

  /* the continue ▼ shows only while a spoken line waits for a click (§11); each
     step clears it, and the two line branches below re-arm it. */
  function setWaiting(on) { var s = document.getElementById("stage"); if (s) s.classList.toggle("waiting", on); }

  function step() {
    setWaiting(false);
    while (queue.length) {
      var e = queue.shift();

      if (e.cue) continue;                                   /* M7: sfx/art */

      /* #11: a choice branch that changed the face has rejoined the trunk —
         restore the pre-branch expression (branch-local swaps don't leak). */
      if (e.restoreExpr !== undefined) {
        if (e.restoreExpr && ui && ui.expr) ui.expr(e.who, e.restoreExpr);
        continue;
      }

      if (e.unlock) { applyUnlock(e.unlock); continue; }

      if (e.n != null) {
        mode = "line"; curEntry = e;
        startLine("", NARRATION_COLOUR, e.n, true);
        setWaiting(true); persist();
        return;
      }

      if (e.line != null) {
        mode = "line"; curEntry = e;
        if (e.expr) ui.expr(e.who, e.expr);
        var colour = e.who === "Sage" ? SAGE_COLOUR
                   : (window.CAST[e.who] ? window.CAST[e.who].colour : SAGE_COLOUR);
        startLine(e.who, colour, e.line, false);
        setWaiting(true); persist();
        return;
      }

      if (e.choice) {
        mode = "choice"; curEntry = e;
        Screens.hideSageBubble();   /* the choice stack owns the bottom-left; never overlap a lingering Sage bubble */
        persist();
        (function (entry) {
          /* the face active as the choice is offered — a reply may swap it, but
             that swap is branch-local and reverts when the trunk resumes (#11). */
          var preExpr = (window.Screens && Screens.currentServeExpr) ? Screens.currentServeExpr() : null;
          Screens.serveChoices(entry.choice, entry.options, function (i) {
            var opt = entry.options[i];
            Game.recordTone(opt.tone);
            var reply = (opt.reply && opt.reply.length) ? opt.reply.slice() : [];
            var branchSetsExpr = false;
            for (var r = 0; r < reply.length; r++) if (reply[r] && reply[r].expr) { branchSetsExpr = true; break; }
            if (branchSetsExpr && preExpr) reply.push({ restoreExpr: preExpr, who: entry.who || (beat && beat.who) || "" });
            if (reply.length) queue = reply.concat(queue);
            Screens.hideServeChoices();
            step();
          });
        })(e);
        return;
      }

      if (e.brew) {
        mode = "brew"; curEntry = e;
        gate = e.brew;
        Brew.reset();
        /* arm the gate-aware ✓ (GDD §7). The consequence brew arms a never-true
           predicate so it shows the name but never a tick — no §8 outcome leak. */
        Brew.setOrder(e.brew.consequence ? function () { return false; } : orderMatcher(e.brew));
        Brew.onPour = onPour;
        /* §7: the customer has ordered — unlock the panel (settle) and light the
           Order Strip with their request in their own words. */
        Brew.unlock();
        Screens.setOrderText(orderText(e.brew), orderFull(e.brew));
        Screens.hideSageBubble();   /* a gate shouldn't inherit a lingering Sage bubble (portrait: it'd sit over the panel band) */
        persist();
        return;                                              /* bubble keeps the request line */
      }
    }
    /* script exhausted → next beat */
    mode = "idle"; curEntry = null;
    beat = null;
    Brew.onPour = null;
    Brew.setOrder(null);   /* the stale-gate safety net: every beat end nulls the order (GDD §7) */
    Game.advance();
  }

  /* Within-beat resume (P0-1). The save persisted only which BEAT you were on,
     so Continue replayed the whole visit from its first line — losing every line
     read, choice made and brew poured mid-conversation (for an early beat, that
     dumped the player at the game's opening). We now persist the remaining queue
     (the current pause entry re-included at the front) on every pause, and
     resume() rebuilds the beat from there. Already-consumed lines/choices/pours
     are NOT in the remaining queue, so nothing re-fires; unlocks already applied
     live in Game.state, so page depth can't inflate. */
  function persist() { try { Save.store(Game.snapshot()); } catch (e) {} }

  function cursor() {
    if (mode === "idle" || !beat || !curEntry) return null;
    return { beatIndex: Game.state.beatIndex, q: [curEntry].concat(queue) };
  }

  function resume(b, cur) {
    beat = b;
    queue = (cur && cur.q) ? cur.q.slice() : (b.script || []).slice();
    curEntry = null;
    pageState = null;
    gate = null;
    Brew.setOrder(null);
    Brew.lock(); Screens.setOrderText("");   /* §7: locked until step() re-hits the brew gate (which unlocks) */
    ui = uiFor(b);
    ui.setup();
    Screens.hideServeChoices();
    Screens.hideSageBubble();
    step();
  }

  /* log a named brew against the current Night for the Night Cap (GDD §11);
     deduped per (night, recipe) so replay-after-reload can't inflate it. The
     consequential brew calls this NEVER — its recipe would leak the outcome. */
  function recordPour(recipe) {
    if (!recipe) return;
    /* resilience: a stale-cached/partial save-state might predate `poured`
       (P0 06-07) — never let a missing field throw and stall the pour */
    if (!Array.isArray(Game.state.poured)) Game.state.poured = [];
    var log = Game.state.poured;
    for (var i = 0; i < log.length; i++) {
      if (log[i].night === Game.state.night && log[i].recipe === recipe) return;
    }
    log.push({ night: Game.state.night, recipe: recipe });
    Save.store(Game.snapshot());
  }

  function pourMatches(spec, result) {
    var wantMix = (spec.mix || []).slice().sort().join("+");
    var gotMix = result.mix.filter(Boolean).sort().join("+");
    return result.base === spec.base && gotMix === wantMix &&
           (spec.dose === undefined || spec.dose === result.dose);
  }

  /* Build the "does this live mix satisfy the gate order?" predicate the brew
     panel uses for its gate-aware ✓ (GDD §7). Reuses pourMatches so the tick
     and the accept decision are ONE rule and can never disagree. an any-gate
     matches if any spec matches. (The consequence brew is armed with a
     never-true predicate by the caller, not this, so its ✓ never leaks §8.) */
  function orderMatcher(g) {
    if (!g) return null;
    return function (mix, base, dose) {
      var result = { base: base, mix: mix, dose: dose };
      if (g.any) {
        for (var i = 0; i < g.any.length; i++) if (pourMatches(g.any[i], result)) return true;
        return false;
      }
      return pourMatches(g, result);
    };
  }

  function onPour(result) {
    if (mode !== "brew" || !gate) return;

    /* THE consequential brew (GDD §8): every pour is accepted; the result
       is stored in the save and pays off as one epilogue Herald line. */
    if (gate.consequence) {
      var right = pourMatches(gate.right, result);
      Game.state.consequence = right ? "clear" : "rattled";
      /* clear the gate BEFORE any side effect, so nothing can leave the
         sequencer stuck in "brew" (P0 06-07) */
      var g = gate;
      gate = null;
      Brew.setOrder(null);
      Brew.onPour = null;
      Brew.reset();
      Brew.lock(); Screens.setOrderText("");   /* §7: the cup's poured — lock the panel + clear the Order Strip */
      mode = "idle";
      try { Save.store(Game.snapshot()); } catch (e) {}
      queue = ((right ? g.onRight : g.onWrong) || []).concat(queue);
      step();
      return;
    }

    var ok;
    if (gate.any) {
      ok = false;
      for (var i = 0; i < gate.any.length; i++) if (pourMatches(gate.any[i], result)) { ok = true; break; }
    } else {
      ok = pourMatches(gate, result);
    }
    if (ok) {
      /* clear the gate FIRST, then record — so a side-effect throw can never
         leave the sequencer stuck in "brew" and block the beat (P0 06-07) */
      gate = null;
      Brew.setOrder(null);
      Brew.onPour = null;
      Brew.reset();
      Brew.lock(); Screens.setOrderText("");   /* §7: the cup's poured — lock the panel + clear the Order Strip */
      mode = "idle";
      try { recordPour(result.recipe); }        /* Night Cap drinks list (GDD §11) */
      catch (e) { if (window.console) console.warn("Elixir Hour: recordPour failed (non-fatal)", e); }
      step();
    } else {
      /* the gentle beat: NO SILENT REJECTION (GDD §7 lock). Every wrong pour
         visibly shows a line; the gate stays open so the request stands (the
         bubble + panel are live for a re-pour). Priority:
           (1) bespoke wrongIf reaction — P.E.K.K.A's Zap flinch;
           (2) the beat's spoken `wrong:` line (which re-states the ask);
           (3) a generic gentle beat, narrated in the speaker's own pronoun. */
      var w = null;
      if (gate.wrongIf) {
        for (var j = 0; j < gate.wrongIf.length; j++) {
          if (result.mix.indexOf(gate.wrongIf[j].has) >= 0) { w = gate.wrongIf[j]; break; }
        }
      }
      var who = customer();
      var colour = who && window.CAST[who] ? window.CAST[who].colour : SAGE_COLOUR;
      if (w && w.n) {
        ui.line("", NARRATION_COLOUR, "<em>" + fmt(w.n) + "</em>");
      } else if (gate.wrong) {
        ui.line(who || "", colour, fmt(gate.wrong));
      } else {
        var pron = who && window.CAST[who] && window.CAST[who].they ? window.CAST[who].they : "They";
        ui.line("", NARRATION_COLOUR, "<em>" + fmt(t("brew.wrong.generic", { they: pron })) + "</em>");
      }
      Brew.reset();
    }
  }

  function applyUnlock(u) {
    var un = Game.state.unlocks;
    var landed = false, onboarded = false;
    if (u.recipe && un.recipes.indexOf(u.recipe) < 0) {
      var firstRecipe = un.recipes.length === 0;
      un.recipes.push(u.recipe); landed = true;
      /* R12: opening the Tome next lands on THIS recipe's page */
      if (window.HUD) HUD.markNewRecipe(u.recipe);
      /* staged reveal (§11): the FIRST recipe is what brings the Tome icon into
         being — it settles in with a glow, and a tap-first chip invites the tap */
      if (window.HUD && firstRecipe) { HUD.revealTome(); HUD.chip("chip.tome", true); onboarded = true; }
    }
    if (u.ledger) {
      /* stage-indexed note slots (writing a slot is idempotent, so a beat
         replayed after a mid-beat reload can't inflate the page depth) */
      var isNew = !Object.prototype.hasOwnProperty.call(un.ledger, u.ledger);
      var arr = un.ledger[u.ledger];
      if (isNew) arr = un.ledger[u.ledger] = [];
      else if (typeof arr === "string") arr = un.ledger[u.ledger] = [arr];
      arr[(u.stage || 1) - 1] = u.note || "";
      landed = true;
      /* R12: a newly MET regular points the next Tome open at the Ledger grid,
         their card right there — not just the Knight, every new face */
      if (window.HUD && isNew) HUD.markNewCharacter(u.ledger);
      /* second onboarding beat (§11): the Knight's first page glows the icon and
         points the next open at the Ledger ribbon */
      if (window.HUD && isNew && u.ledger === "Knight") { HUD.glowLedger(); HUD.chip("chip.ledger", true); onboarded = true; }
    }
    if (u.herald && un.heralds.indexOf(u.herald) < 0) { un.heralds.push(u.herald); landed = true; }
    /* a plain "new entry" pulse — but not on the onboarding beats, whose reveal/
       glow highlight IS the cue (a pulse on top would fight it) */
    if (landed && !onboarded && window.HUD) HUD.pulse();
    Save.store(Game.snapshot());
  }

  function advance() {
    if (mode !== "line") return;
    /* a long line pages within the bubble first (§11); the same tap turns the
       page, and only the final page advances to the next script entry */
    if (pageState && pageState.i < pageState.pages.length - 1) { showPage(pageState.i + 1); return; }
    pageState = null;
    step();
  }

  function active() { return mode !== "idle"; }

  /* click anywhere on the serve scene advances a line; the panel, pickers,
     choices and Tome button keep their own clicks */
  document.getElementById("screen-serve").addEventListener("click", function (ev) {
    if (ev.target.closest("#panel-frame") || ev.target.closest("#brewstrip") ||
        ev.target.closest("#serve-choices") || ev.target.closest("#panel-info")) return;
    advance();
  });
  /* the group and duo screens are pure conversation — any click advances */
  document.getElementById("screen-group").addEventListener("click", advance);
  document.getElementById("screen-duo").addEventListener("click", advance);

  /* §7: tapping the locked panel gets a gentle in-voice line, never a dead click */
  Brew.setBlocked(function () { Screens.toast(t("brew.locked")); });

  return { start: start, resume: resume, cursor: cursor, advance: advance, active: active, mode: function () { return mode; } };
})();
