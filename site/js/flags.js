/* Landing-page feature flags.
   Keep a flag OFF until the files it links to are actually deployed, so the live
   site never shows a dead link. The gated section ships in the HTML with a
   `hidden` attribute; flipping the flag on removes it.

   BEHIND_THE_BAR — chapter 9 "Behind the bar" (the maker-voice case-study/deck
   section, brief §2 ch9). Its two CTAs point at /case-study/ and
   /assets/elixir-hour-gtm.pdf. Both ship in the bundle now, so this is ON. */
var BEHIND_THE_BAR = true;

(function () {
  "use strict";
  if (!BEHIND_THE_BAR) return;               /* default: stay hidden, no dead links */
  var el = document.getElementById("behind");
  if (el) el.removeAttribute("hidden");
}());
