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
  var mode = "idle";        // idle | line | choice | brew
  var gate = null;          // active brew entry
  var ui = null;            // per-beat-type line/expression router

  function fmt(text) {
    var s = String(text)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return s.replace(/\*\((.*?)\)\*/g, "<em>($1)</em>");
  }

  function customer() { return beat && beat.who ? beat.who : null; }

  /* Which screen draws this beat's lines. Group/duo place the words at the
     speaker themselves; serve keeps the single-customer bubble. */
  function uiFor(b) {
    if (b.type === "group") return {
      setup: function () { Screens.renderGroup(b); },
      expr: function (who, expr) { Screens.groupExpr(who, expr); },
      line: function (who, colour, html) { Screens.groupLine(who, colour, html); },
    };
    if (b.type === "duo") return {
      setup: function () { Screens.renderDuo(b); },
      expr: function (who, expr) { Screens.duoExpr(who, expr); },
      line: function (who, colour, html) { Screens.duoLine(who, colour, html); },
    };
    return {
      setup: function () { Screens.setServeCustomer(b.who || null, b.expr); },
      expr: function (who, expr) { if (who === customer()) Screens.setServeCustomer(who, expr); },
      line: function (who, colour, html) { Screens.serveLine(who, colour, html, who === customer()); },
    };
  }

  function start(b) {
    beat = b;
    queue = (b.script || []).slice();
    gate = null;
    ui = uiFor(b);
    ui.setup();
    Screens.hideServeChoices();
    step();
  }

  function step() {
    while (queue.length) {
      var e = queue.shift();

      if (e.cue) continue;                                   /* M7: sfx/art */

      if (e.unlock) { applyUnlock(e.unlock); continue; }

      if (e.n != null) {
        mode = "line";
        ui.line("", NARRATION_COLOUR, "<em>" + fmt(e.n) + "</em>");
        return;
      }

      if (e.line != null) {
        mode = "line";
        if (e.expr) ui.expr(e.who, e.expr);
        var colour = e.who === "Sage" ? SAGE_COLOUR
                   : (window.CAST[e.who] ? window.CAST[e.who].colour : SAGE_COLOUR);
        ui.line(e.who, colour, fmt(e.line));
        return;
      }

      if (e.choice) {
        mode = "choice";
        (function (entry) {
          Screens.serveChoices(entry.choice, entry.options, function (i) {
            var opt = entry.options[i];
            Game.recordTone(opt.tone);
            if (opt.reply && opt.reply.length) queue = opt.reply.concat(queue);
            Screens.hideServeChoices();
            step();
          });
        })(e);
        return;
      }

      if (e.brew) {
        mode = "brew";
        gate = e.brew;
        Brew.reset();
        Brew.onPour = onPour;
        return;                                              /* bubble keeps the request line */
      }
    }
    /* script exhausted → next beat */
    mode = "idle";
    beat = null;
    Brew.onPour = null;
    Game.advance();
  }

  /* log a named brew against the current Night for the Night Cap (GDD §11);
     deduped per (night, recipe) so replay-after-reload can't inflate it. The
     consequential brew calls this NEVER — its recipe would leak the outcome. */
  function recordPour(recipe) {
    if (!recipe) return;
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

  function onPour(result) {
    if (mode !== "brew" || !gate) return;

    /* THE consequential brew (GDD §8): every pour is accepted; the result
       is stored in the save and pays off as one epilogue Herald line. */
    if (gate.consequence) {
      var right = pourMatches(gate.right, result);
      Game.state.consequence = right ? "clear" : "rattled";
      Save.store(Game.snapshot());
      var g = gate;
      gate = null;
      Brew.onPour = null;
      Brew.reset();
      mode = "idle";
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
      recordPour(result.recipe);   /* Night Cap drinks list — named brews only (GDD §11) */
      gate = null;
      Brew.onPour = null;
      Brew.reset();
      mode = "idle";
      step();
    } else {
      /* the gentle beat: no fail state. A bespoke reaction plays when the
         wrong pour contains a flagged mixer (P.E.K.K.A's Zap flinch);
         otherwise the customer repeats the request. */
      var w = null;
      if (gate.wrongIf) {
        for (var j = 0; j < gate.wrongIf.length; j++) {
          if (result.mix.indexOf(gate.wrongIf[j].has) >= 0) { w = gate.wrongIf[j]; break; }
        }
      }
      if (w && w.n) {
        ui.line("", NARRATION_COLOUR, "<em>" + fmt(w.n) + "</em>");
      } else {
        var who = customer();
        var colour = who && window.CAST[who] ? window.CAST[who].colour : SAGE_COLOUR;
        ui.line(who || "", colour, fmt(gate.nudge || ""));
      }
      Brew.reset();
    }
  }

  function applyUnlock(u) {
    var un = Game.state.unlocks;
    if (u.recipe && un.recipes.indexOf(u.recipe) < 0) un.recipes.push(u.recipe);
    if (u.ledger) {
      /* stage-indexed note slots (writing a slot is idempotent, so a beat
         replayed after a mid-beat reload can't inflate the page depth) */
      var arr = un.ledger[u.ledger];
      if (!Object.prototype.hasOwnProperty.call(un.ledger, u.ledger)) arr = un.ledger[u.ledger] = [];
      else if (typeof arr === "string") arr = un.ledger[u.ledger] = [arr];
      arr[(u.stage || 1) - 1] = u.note || "";
    }
    if (u.herald && un.heralds.indexOf(u.herald) < 0) un.heralds.push(u.herald);
    Save.store(Game.snapshot());
  }

  function advance() {
    if (mode === "line") step();
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

  return { start: start, advance: advance, active: active, mode: function () { return mode; } };
})();
