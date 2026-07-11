/* §R17 — portrait scene framing (GDD §11 "Mobile portrait staging", 10-07).

   MEASURED, NOT EYEBALLED. Every serve scene is 2048x1143 and — by the round-9 canon in
   data/cast.js — shares a pixel-identical background with "Empty Bar (no characters)". So each
   character's bounding box was derived by differencing their scene against that empty plate
   (tools: scratchpad/r17_measure_scenes.py). `cx` is the head-band centroid (arms and tankards
   skew a whole-body centroid sideways); `top` is the head-top, both as fractions of the image.

   WHY PORTRAIT BROKE: the scene band is 720x819 and the art is 1.79:1, so `object-fit:cover`
   crops ~51% of the width. With the default `center`, the cast — hand-grounded at head cx 0.21 —
   landed at x = -64px. That is Tessa's "Knight half off the left edge".

   ONE FOCAL POINT FOR EVERY SOLO SCENE, and it must be one: the backgrounds are pixel-identical
   and cross-fade on an expression swap, so a per-scene focal point would make the whole bar
   jitter every time a face changes. The cast is grounded on a single anchor anyway — head
   centres span only 0.206..0.214 across all 20 scenes. `bodyX0`/`bodyX1` are the widest body
   (the Knight), used to guarantee "always fully in frame". */
window.SCENE_FRAME = {
  img: { w: 2048, h: 1143 },
  solo: {
    headCx: 0.2105,        /* mean head centre across the cast */
    bodyX0: 0.0503,        /* widest body's left edge  (Knight) */
    bodyX1: 0.3794,        /* widest body's right edge (Knight) */
    targetX: 0.40,          /* where the head should land, as a fraction of the band */
    edge: 0.02,             /* keep this much of the band clear of the body, both sides */
  },
  /* Per-expression head, for the speech-bubble tail only. The bubble may move between expressions
     (a face is a different shape); the BACKGROUND may not — which is why `solo` above is a single
     shared focal point and these per-scene values never touch object-position. */
  heads: {
    "Hog Rider - Arrival": { cx: 0.211, top: 0.276 },
    "Hog Rider - Big Laugh Served": { cx: 0.211, top: 0.275 },
    "Hog Rider - Quiet & Wistful Served": { cx: 0.211, top: 0.275 },
    "Hog Rider - Warm Grin Served": { cx: 0.211, top: 0.275 },
    "Knight - Arrival": { cx: 0.211, top: 0.236 },
    "Knight - Hearty Laugh Served": { cx: 0.214, top: 0.235 },
    "Knight - Warm & Content Served": { cx: 0.214, top: 0.235 },
    "Knight - Weary & Wistful": { cx: 0.214, top: 0.235 },
    "P.E.K.K.A - Arrival": { cx: 0.213, top: 0.290 },
    "P.E.K.K.A - Calm Served": { cx: 0.213, top: 0.290 },
    "P.E.K.K.A - Happy Served": { cx: 0.213, top: 0.290 },
    "P.E.K.K.A - Shy Served": { cx: 0.206, top: 0.286 },
    "Princess - Arrival": { cx: 0.206, top: 0.237 },
    "Princess - Cool & Poised Served": { cx: 0.207, top: 0.234 },
    "Princess - Guard Down Warmth Served": { cx: 0.207, top: 0.233 },
    "Princess - Sharp & Teasing Served": { cx: 0.207, top: 0.234 },
    "Wizard - Arrival": { cx: 0.210, top: 0.263 },
    "Wizard - Boastful Grin Served": { cx: 0.210, top: 0.263 },
    "Wizard - Deflated & Insecure Served": { cx: 0.210, top: 0.263 },
    "Wizard - Warm Genuine Smile Served": { cx: 0.210, top: 0.263 },
    /* Edition 2 — Ronin, away set only (measured off the away bakes, diff-vs-empty;
       game/PLAN.md 10-07 table: top .222–.226, cx .211 — inside the cast band, so
       the shared solo focal point holds for the whole away night. The residents'
       away marks match their home rows above within noise, so those rows serve
       both sets. */
    "Ronin - Arrival": { cx: 0.211, top: 0.222 },
    "Ronin - Guarded Served": { cx: 0.211, top: 0.222 },
    "Ronin - Listening Served": { cx: 0.211, top: 0.223 },
    "Ronin - At Ease Served": { cx: 0.211, top: 0.226 },
  },
};
