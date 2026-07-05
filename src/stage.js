/* Responsive stage. Landscape: the mockup's 1280×720 design space, scaled to
   fit and letterboxed. Portrait (phones): the design space swaps to 720×1280
   and the serve screen reflows via body.portrait CSS + the portrait constants
   below (GDD §13 — character, dialogue and mixing panel stay usable).
   Every layout value is a % of the stage, so the mockup maths carry over. */
window.Stage = (function () {
  var LAND = { W: 1280, H: 720 };
  var PORT = { W: 720, H: 1280 };

  /* Two-layer composite constants (GDD §12): ONE counter-line Y and ONE
     horizontal anchor for the whole cast. Characters anchor by the BOTTOM OF
     THE TORSO (per-sprite torsoBase fraction, measured by the keying pipeline)
     to the counter line — never by hands or lowest pixel. Landscape: counter
     at 71.9% (the baked master-scene counter top, §15), cast centred in the
     left zone. Portrait: scene band sits in the top half, counter at 46%.
     (Measured against the locked master scene, Serve Screen - Master Scene V1.) */
  /* charH leaves deliberate headroom above the tallest head/horns so the
     dialogue bubble never overlaps the character (bubble sits bottom-anchored
     just above figure top = counterY - charH; see Screens.renderServe). */
  var COMPOSITE = {
    landscape: { counterY: 0.719 * LAND.H, anchorX: 0.21 * LAND.W, charH: 0.58 * LAND.H },
    portrait:  { counterY: 0.46 * PORT.H,  anchorX: 0.50 * PORT.W, charH: 0.36 * PORT.H },
  };

  var stage = document.getElementById("stage");
  var portrait = false;

  function mode() { return portrait ? "portrait" : "landscape"; }
  function design() { return portrait ? PORT : LAND; }
  function composite() { return COMPOSITE[mode()]; }

  function fit() {
    var vw = window.innerWidth, vh = window.innerHeight;
    var wasPortrait = portrait;
    portrait = vh / vw > 1.25;
    document.body.classList.toggle("portrait", portrait);
    var d = design();
    stage.style.width = d.W + "px";
    stage.style.height = d.H + "px";
    var scale = Math.min(vw / d.W, vh / d.H);
    var x = (vw - d.W * scale) / 2;
    var y = (vh - d.H * scale) / 2;
    stage.style.transform = "translate(" + x + "px," + y + "px) scale(" + scale + ")";
    if (wasPortrait !== portrait) {
      /* let screens re-place anchored elements */
      document.dispatchEvent(new CustomEvent("stagemode", { detail: { mode: mode() } }));
    }
  }

  window.addEventListener("resize", fit);
  window.addEventListener("orientationchange", fit);

  var api = {
    fit: fit, mode: mode, design: design, composite: composite,
    isPortrait: function () { return portrait; },
  };
  fit();
  return api;
})();
