/* The dialogue engine (GDD §14.4). Plays a visit/scene beat's script[]:
   spoken lines (click to advance, expression swaps), narration, tone-shaping
   choices (with optional inline replies), brew gates (wrong pours repeat the
   request — the gentle beat; no fail state), and Tome unlocks. cue entries
   (sfx/art) are skipped until Milestone 7 wires audio/scene dressing. */
window.Dialogue = (function () {
  function el(id) { return document.getElementById(id); }

  var SAGE_COLOUR = "#6B7F5C";
  var NARRATION_COLOUR = "#c9bda6";

  var beat = null;          // the visit/scene beat being played
  var queue = [];           // remaining entries (reply entries get unshifted)
  var mode = "idle";        // idle | line | choice | brew
  var gate = null;          // active brew entry

  function fmt(text) {
    var s = String(text)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return s.replace(/\*\((.*?)\)\*/g, "<em>($1)</em>");
  }

  function customer() { return beat && beat.who ? beat.who : null; }

  function start(b) {
    beat = b;
    queue = (b.script || []).slice();
    gate = null;
    if (b.who) Screens.setServeCustomer(b.who, b.expr);
    else Screens.setServeCustomer(null);
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
        Screens.serveLine("", NARRATION_COLOUR, "<em>" + fmt(e.n) + "</em>", false);
        return;
      }

      if (e.line != null) {
        mode = "line";
        if (e.expr && e.who === customer()) Screens.setServeCustomer(e.who, e.expr);
        var colour = e.who === "Sage" ? SAGE_COLOUR
                   : (window.CAST[e.who] ? window.CAST[e.who].colour : SAGE_COLOUR);
        Screens.serveLine(e.who, colour, fmt(e.line), e.who === customer());
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

  function onPour(result) {
    if (mode !== "brew" || !gate) return;
    var wantMix = gate.mix.slice().sort().join("+");
    var gotMix = result.mix.filter(Boolean).sort().join("+");
    var ok = result.base === gate.base && gotMix === wantMix &&
             (gate.dose === undefined || gate.dose === result.dose);
    if (ok) {
      gate = null;
      Brew.onPour = null;
      Brew.reset();
      mode = "idle";
      step();
    } else {
      /* the gentle beat: no fail state — the customer repeats the request.
         Bespoke wrong-brew reaction lines are a flagged content TODO; the
         engine will play gate.wrong[] entries here once they're written. */
      var who = customer();
      var colour = who && window.CAST[who] ? window.CAST[who].colour : SAGE_COLOUR;
      Screens.serveLine(who || "", colour, fmt(gate.nudge || ""), !!who);
      Brew.reset();
    }
  }

  function applyUnlock(u) {
    var un = Game.state.unlocks;
    if (u.recipe && un.recipes.indexOf(u.recipe) < 0) un.recipes.push(u.recipe);
    if (u.ledger && !un.ledger[u.ledger]) un.ledger[u.ledger] = u.note || "";
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

  return { start: start, advance: advance, active: active, mode: function () { return mode; } };
})();
