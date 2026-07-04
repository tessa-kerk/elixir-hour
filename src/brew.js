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
    el("recipename").textContent = hit ? hit.name + " ✓" : t("brew.unnamed");
    el("base-name").textContent = state.base;
    el("base-dot").style.background = BASE_DOT[state.base];
    for (var n = 1; n <= 2; n++) {
      var m = state.mix[n - 1];
      el("mix" + n + "-name").textContent = m || t("brew.none");
      el("mix" + n + "-dot").style.background = m ? window.SPELLS[m].c : "transparent";
    }
  }

  function cycleBase() {
    state.base = state.base === "Elixir" ? "Dark Elixir" : "Elixir";
    update();
  }
  function pick(n, name) {
    state.mix[n - 1] = name;
    update();
  }
  function reset() {
    state.base = "Elixir";
    state.mix = [null, null];
    state.dose = 1;
    el("dose").value = 1;
    update();
  }

  /* Pour → panel tucks up, the three brew panels reveal in sequence, then
     the panel returns. M4 hooks the completion to the visit's reaction beat. */
  function pour(onDone) {
    if (brewing) return;
    onDone = onDone || window.Brew.onPour;   /* the dialogue engine's brew gate */
    brewing = true;
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
      if (typeof onDone === "function") onDone(snapshot());
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
        d.textContent = name || t("brew.none");
        d.addEventListener("click", function (ev) {
          ev.stopPropagation();
          pick(n, name);
          closePickers();
        });
        p.appendChild(d);
      })(options[i]);
    }
  }

  /* wire up */
  el("slot-base").addEventListener("click", cycleBase);
  el("slot-mix1").addEventListener("click", function (ev) { ev.stopPropagation(); closePickers(); el("picker1").style.display = "block"; });
  el("slot-mix2").addEventListener("click", function (ev) { ev.stopPropagation(); closePickers(); el("picker2").style.display = "block"; });
  document.addEventListener("click", closePickers);
  el("dose").addEventListener("input", function () { state.dose = +this.value; update(); });
  el("brew-reset").addEventListener("click", reset);
  el("brew-pour").addEventListener("click", function () { pour(); });

  return {
    update: update, reset: reset, pour: pour, pick: pick, cycleBase: cycleBase,
    refreshText: refreshText, snapshot: snapshot, matchRecipe: matchRecipe, totals: totals,
    state: state,
  };
})();
