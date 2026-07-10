/* The brew system (GDD §14.3, Mixing UI Panel Spec, mockup port).
   Three slots (base + two mixers), the six spells, four live meters,
   dose slider (1–3), the tankard recipe indicator with the ✓ named-brew
   check, Reset and Pour → the three-panel brew animation strip.
   All system data comes from data/cast.js (SPELLS/RECIPES); nothing here
   is content. Spell/base/recipe names stay English for now — canon terms
   localise with the content milestones (noted in PLAN.md). */
window.Brew = (function () {
  function el(id) { return document.getElementById(id); }

  var state = { base: "Elixir", mix: [null, null], dose: 1 };
  var brewing = false;
  /* During a brew gate the dialogue arms an order predicate here — fn(mix,base,
     dose)->bool = "matches the CURRENT ORDER" (GDD §7 gate-aware ✓). null = free
     brew. Lifecycle is owned by dialogue.js via setOrder(); reset() must NOT
     clear it (reset runs mid-gate: on arm, and after every wrong pour). */
  var activeOrder = null;
  var METERS = ["warmth", "kick", "chill", "bite"];
  var BASE_DOT = { "Elixir": "#B26AE0", "Dark Elixir": "#3d2350" };

  function baseStats(b) {
    return b === "Elixir"
      ? { warmth: 1, kick: 0, chill: 0, bite: 0 }
      : { warmth: 0, kick: 1, chill: 0, bite: 1 };
  }

  function totals() {
    var tl = baseStats(state.base);
    for (var i = 0; i < state.mix.length; i++) {
      var m = state.mix[i];
      if (!m || !window.SPELLS[m]) continue;
      for (var k = 0; k < METERS.length; k++) {
        tl[METERS[k]] += window.SPELLS[m][METERS[k]] * state.dose;
      }
    }
    for (var j = 0; j < METERS.length; j++) tl[METERS[j]] = Math.min(tl[METERS[j]], 6);
    return tl;
  }

  function matchRecipe() {
    var set = state.mix.filter(Boolean).sort().join("+");
    var rs = window.RECIPES || [];
    for (var i = 0; i < rs.length; i++) {
      var r = rs[i];
      if (r.base !== state.base) continue;
      if (r.mix.slice().sort().join("+") !== set) continue;
      if (r.dose !== undefined && r.dose !== state.dose) continue;
      return r;
    }
    return null;
  }

  /* the live "{n} drop(s)" label under the dose slider (Fix 1). Sets the text
     (localised, plural handled by the three brew.drops{n} keys) AND slides it
     to sit over the handle. TH must equal --th in .dose-pips (css) so the label
     lines up with the detent pips. */
  var TH = 14;   /* px, native range-thumb width estimate — keep == CSS --th */
  function updateDoseLabel() {
    var live = el("dose-live");
    if (!live) return;
    var n = state.dose;                        /* 1..3 */
    var txt = t("brew.drops" + n);
    live.textContent = txt;
    var input = el("dose");
    if (input) input.setAttribute("aria-valuetext", txt);
    var frac = (n - 1) / 2;                     /* 1,2,3 → 0,.5,1 */
    live.style.left = "calc(" + (TH / 2) + "px + (100% - " + TH + "px) * " + frac + ")";
  }

  function update() {
    var tl = totals();
    for (var k = 0; k < METERS.length; k++) {
      var name = METERS[k];
      var box = el("m-" + name);
      box.innerHTML = "";
      for (var i = 0; i < 6; i++) {
        var s = document.createElement("div");
        s.className = "seg" + (i < tl[name] ? " on " + name : "");
        box.appendChild(s);
      }
    }
    var hit = matchRecipe();
    var name = hit ? hit.name : null;
    var tick;
    if (activeOrder) {
      /* GDD §7 gate-aware ✓: name any valid recipe you've formed, but tick ONLY
         when the mix matches the CURRENT ORDER. Valid-but-wrong = name, no tick.
         (The consequence brew arms a never-true predicate → name, never a tick,
         so it can't leak the "right" answer — GDD §8.) */
      tick = !!activeOrder(state.mix, state.base, state.dose);
    } else {
      /* free brew: ✓ means "valid named recipe" */
      tick = !!hit;
    }
    el("recipename").textContent = name ? (tick ? name + " ✓" : name) : t("brew.unnamed");
    el("base-name").textContent = canonTerm(state.base);   /* canon term (GDD §13) */
    el("base-dot").style.background = BASE_DOT[state.base];
    for (var n = 1; n <= 2; n++) {
      var m = state.mix[n - 1];
      el("mix" + n + "-name").textContent = m ? canonTerm(m) : t("brew.none");
      el("mix" + n + "-dot").style.background = m ? window.SPELLS[m].c : "transparent";
    }
  }

  function cycleBase() {
    state.base = state.base === "Elixir" ? "Dark Elixir" : "Elixir";
    update();
  }
  function pick(n, name) {
    state.mix[n - 1] = name;
    /* §R18: a REAL mixer (not the "—" clear) retires the first-brew hint for good */
    if (name) retireMixerHint();
    update();
  }
  function reset() {
    state.base = "Elixir";
    state.mix = [null, null];
    state.dose = 1;
    el("dose").value = 1;
    updateDoseLabel();
    update();
  }

  /* Pour → panel tucks up, the three brew panels reveal in sequence, then
     the panel returns. M4 hooks the completion to the visit's reaction beat. */
  function pour(onDone) {
    if (brewing) return;
    onDone = onDone || window.Brew.onPour;   /* the dialogue engine's brew gate */
    brewing = true;
    if (window.Sound) Sound.sfx("brew-fizz");
    var panel = el("panel-frame"), strip = el("brewstrip");
    panel.classList.add("brewing");
    strip.classList.add("on");
    var fills = strip.querySelectorAll(".fill");
    for (var i = 0; i < fills.length; i++) {
      fills[i].style.animation = "none";
      void fills[i].offsetWidth;               /* restart the reveal */
      fills[i].style.animation = "";
    }
    window.setTimeout(function () {
      panel.classList.remove("brewing");
      strip.classList.remove("on");
      brewing = false;
      /* resume the dialogue FIRST (never let a sound hiccup block it), then
         the mug-clink as the drink lands (P0 06-07) */
      if (typeof onDone === "function") onDone(snapshot());
      if (window.Sound) Sound.sfx("mug-clink");
    }, 2400);
  }

  function snapshot() {
    return { base: state.base, mix: state.mix.slice(), dose: state.dose, recipe: (matchRecipe() || {}).name || null };
  }

  function refreshText() {
    el("lbl-base").textContent = t("brew.base");
    var mixLbls = document.querySelectorAll(".lbl-mixer");
    for (var i = 0; i < mixLbls.length; i++) mixLbls[i].textContent = t("brew.mixer");
    el("lbl-warmth").textContent = t("brew.warmth");
    el("lbl-kick").textContent = t("brew.kick");
    el("lbl-chill").textContent = t("brew.chill");
    el("lbl-bite").textContent = t("brew.bite");
    el("lbl-gentle").textContent = t("brew.gentle");
    el("lbl-strong").textContent = t("brew.strong");
    el("brew-reset").textContent = t("brew.reset");
    el("brew-pour").textContent = t("brew.pour");
    updateDoseLabel();
    /* rebuild pickers so the "none" row follows the language */
    for (var n = 1; n <= 2; n++) buildPicker(n);
    update();
  }

  function closePickers() {
    var ps = document.querySelectorAll(".picker");
    for (var i = 0; i < ps.length; i++) ps[i].style.display = "none";
  }
  function buildPicker(n) {
    var p = el("picker" + n);
    p.innerHTML = "";
    var options = [null];
    for (var s in window.SPELLS) options.push(s);
    for (var i = 0; i < options.length; i++) {
      (function (name) {
        var d = document.createElement("div");
        d.textContent = name ? canonTerm(name) : t("brew.none");
        d.addEventListener("click", function (ev) {
          ev.stopPropagation();
          pick(n, name);
          closePickers();
        });
        p.appendChild(d);
      })(options[i]);
    }
  }

  /* Brew gating (GDD §7, locked round 5). The panel is LOCKED outside a brew
     beat — dimmed and non-responsive — so a player can't brew early (which used
     to ✓ then silently wipe the mix), and "am I meant to brew now?" is never
     ambiguous. It unlocks with a settle when the customer actually orders; a mix
     in progress is never silently reset (reset only runs mid-gate). */
  var locked = true;
  var onBlocked = null;          /* dialogue sets the gentle "let them finish" response */
  function blocked() { if (onBlocked) onBlocked(); }

  /* §R18 FIRST-BREW MIXER HINT (GDD §11 fresh-player locks). A player coming to this blind
     cannot tell the empty MIXER rows are tappable. On a fresh save, the first time the panel
     unlocks, both mixer selects take Sage's own sage tint and a slow bounce — her guidance,
     not a system prompt. Never on BASE (it is pre-filled). NO ARROWS: arrows are a proven
     tailspin in this project. Tapping a mixer stops the nudge; picking one retires it for
     the rest of the save. */
  function mixerSlots() { return [el("slot-mix1"), el("slot-mix2")]; }
  function showMixerHint() {
    if (!window.Game || !Game.mixerHintDone || Game.mixerHintDone()) return;
    mixerSlots().forEach(function (s) { if (s) s.classList.add("hint"); });
  }
  function hideMixerHint() {
    mixerSlots().forEach(function (s) { if (s) s.classList.remove("hint"); });
  }
  function retireMixerHint() {
    hideMixerHint();
    if (window.Game && Game.completeMixerHint) Game.completeMixerHint();
  }

  function lock() {
    locked = true;
    hideMixerHint();             /* the nudge belongs to an OPEN panel */
    var p = el("panel-frame"); if (p) { p.classList.add("locked"); p.classList.remove("brew-open"); }
  }
  function unlock() {
    locked = false;
    var p = el("panel-frame"); if (!p) return;
    p.classList.remove("locked");
    p.classList.add("brew-open", "settle");
    void p.offsetWidth;          /* restart the settle animation each order */
    p.classList.remove("settle"); void p.offsetWidth; p.classList.add("settle");
    showMixerHint();
  }

  /* wire up — every interaction is refused while locked (§7). The panel stays
     dimmed-but-clickable (no pointer-events:none) so a tap is never a dead click:
     the individual controls no-op, and one panel-level handler plays the gentle
     "let them finish" line. */
  el("slot-base").addEventListener("click", function () { if (locked) return; cycleBase(); });
  /* §R18: the nudge stops the instant a mixer is tapped (before the picker opens — a bouncing
     slot would drag its own dropdown around). It is only RETIRED once a mixer is actually
     picked, so backing out of the picker leaves the hint available on the next unlock. */
  el("slot-mix1").addEventListener("click", function (ev) { ev.stopPropagation(); if (locked) return; hideMixerHint(); closePickers(); el("picker1").style.display = "block"; });
  el("slot-mix2").addEventListener("click", function (ev) { ev.stopPropagation(); if (locked) return; hideMixerHint(); closePickers(); el("picker2").style.display = "block"; });
  document.addEventListener("click", closePickers);
  el("dose").addEventListener("input", function () { if (locked) { this.value = state.dose; return; } state.dose = +this.value; updateDoseLabel(); update(); });
  el("brew-reset").addEventListener("click", function () { if (locked) return; reset(); });
  el("brew-pour").addEventListener("click", function () { if (locked) return; pour(); });
  el("panel-frame").addEventListener("click", function () { if (locked) blocked(); });   /* any tap on the locked panel → the gentle line */

  lock();   /* default state: locked until a customer orders */

  return {
    update: update, reset: reset, pour: pour, pick: pick, cycleBase: cycleBase,
    refreshText: refreshText, snapshot: snapshot, matchRecipe: matchRecipe, totals: totals,
    setOrder: function (fn) { activeOrder = fn || null; update(); },   /* dialogue arms/clears the gate order (GDD §7) */
    lock: lock, unlock: unlock, isLocked: function () { return locked; },
    setBlocked: function (fn) { onBlocked = fn; },
    state: state,
  };
})();
