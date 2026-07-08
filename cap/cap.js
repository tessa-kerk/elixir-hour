/* §R15 share page (/cap). Reads the encoded Night Cap from the URL fragment and
   rebuilds the SAME card client-side using the game's own renderer (NightCap.renderTo)
   + data + assets. No server, no storage — the card lives in the link. Runs after the
   data + nightcap scripts (classic, in order), so everything it needs is defined. */
(function () {
  function byId(id) { return document.getElementById(id); }
  var canvas = byId("cap-canvas");

  function showErr(msg) {
    var e = byId("cap-err");
    if (e) { e.textContent = msg; e.style.display = "block"; }
    /* hide the whole left column (card AND the Download button) — a dangling Download on an
       error path could otherwise save a blank/partial PNG */
    var left = document.querySelector(".cap-left");
    if (left) left.style.display = "none";
  }

  if (!window.NightCap || !NightCap.decodeState || !NightCap.renderTo) {
    showErr("This Night Cap couldn't load. Head to the bar instead.");
    return;
  }
  var frag = (location.hash || "").replace(/^#/, "").trim();
  if (!frag) {
    showErr("This link has no Night Cap in it. Head to the bar instead.");
    return;
  }
  var data;
  try { data = NightCap.decodeState(frag); }
  catch (e) { showErr("This Night Cap link looks broken. Head to the bar instead."); return; }

  NightCap.renderTo(canvas, data).catch(function () {
    showErr("This Night Cap couldn't be drawn. Head to the bar instead.");
  });

  /* re-render if the hash changes (e.g. two links pasted in one session) */
  window.addEventListener("hashchange", function () { location.reload(); });

  var dl = byId("cap-download");
  if (dl) dl.addEventListener("click", function () {
    try {
      canvas.toBlob(function (blob) {
        if (!blob) return;
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url; a.download = "elixir-hour-night-cap.png";
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
      }, "image/png");
    } catch (e) { /* no-op */ }
  });
})();
