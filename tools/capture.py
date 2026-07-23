#!/usr/bin/env python
"""Elixir Hour capture rig (rebuilt 07-07, kept in the repo, excluded from deploy).

Renders the game at NATIVE design scale with NO letterboxing by launching headless
Chromium at an exact viewport (1280x720 landscape, 720x1280 portrait) — the stage's
scale-to-fit resolves to scale 1, so a screenshot is pixel-exact design space.

Requires: a local server on :8641 serving game/ (the repo's dev server), and
`python -m pip install playwright && python -m playwright install chromium`.

Usage:
  python tools/capture.py all            # the four marketing shots
  python tools/capture.py serve-screen   # one shot
  python tools/capture.py contact        # the 5-character counter-contact sheet (for the float calibration)
"""
import sys, os
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))          # project root (…/Elixir Hour (Clash Royale))
CAPS = os.path.join(ROOT, "captures")
URL = "http://localhost:8641/index.html"
LAND = (1280, 720)
PORT = (720, 1280)

# --- per-shot scene drivers (deterministic, via the game's own render fns) ---
# Each sets up a clean, spoiler-safe marketing moment. The HUD (menu/Tome) is left
# ON — it is part of the real game now; pass hide_hud=True to a shot to drop it.
DRIVERS = {
    "serve-screen": ("land", """
        localStorage.clear();
        Game.show('serve');
        Screens.setServeCustomer('Wizard','Boastful Grin');
        (function(){var B=window.Brew;B.reset();B.pick(1,'Rage');B.pick(2,'Zap');
          var d=document.getElementById('dose'); if(d){d.value=2; d.dispatchEvent(new Event('input',{bubbles:true}));} B.update();})();
        Screens.serveLine('Wizard', window.CAST['Wizard'].colour,
          'The Zap is the real art of it, keeper. Anyone can pour a drink — not just anyone can make the thing actually spark.', true);
    """),
    "serve-portrait": ("port", """
        localStorage.clear();
        Game.show('serve');
        Screens.setServeCustomer('P.E.K.K.A','Calm');
        (function(){var B=window.Brew;B.reset();B.pick(1,'Heal');
          var d=document.getElementById('dose'); if(d){d.value=3; d.dispatchEvent(new Event('input',{bubbles:true}));} B.update();})();
        Screens.serveLine('P.E.K.K.A', window.CAST['P.E.K.K.A'].colour,
          'Something warm. And gentle — no spark in it, please.', true);
    """),
    "group-rally": ("land", """
        localStorage.clear();
        var b=null, ns=window.NIGHTS||[];
        for(var i=0;i<ns.length;i++) for(var j=0;j<ns[i].beats.length;j++) if(ns[i].beats[j].type==='group'){b=ns[i].beats[j];}
        if(b){ Game.state.night=3; Game.show('group'); Dialogue.start(b); }
    """),
    "split-duologue": ("land", """
        localStorage.clear();
        var b=null, ns=window.NIGHTS||[];
        for(var i=0;i<ns.length;i++) for(var j=0;j<ns[i].beats.length;j++) if(ns[i].beats[j].type==='duo'){b=ns[i].beats[j];}
        if(b){ Game.state.night=3; Game.show('duo'); Dialogue.start(b); }
    """),
    # Edition 2 (away bar, README §"Edition 2 — The Long Road"): Ronin alone at the
    # travelling counter — a cast portrait like group-rally, not a gameplay shot, so
    # HUD/panel/bubbles are dropped and only the baked away scene + character carry it.
    "away-night-ronin": ("land", """
        localStorage.clear();
        window.SCENE_SET = 'away';
        Game.show('serve');
        Screens.setServeCustomer('Ronin','Guarded');
        if (Screens.hideServeBubble) Screens.hideServeBubble();
        ['panel-frame','serve-choices','hud-menu','hud-tome','sage-bubble'].forEach(function(id){var e=document.getElementById(id); if(e) e.style.display='none';});
    """),
}


def _new_page(browser, viewport):
    w, h = viewport
    return browser.new_page(viewport={"width": w, "height": h}, device_scale_factor=1)


def _prep(page):
    page.goto(URL, wait_until="networkidle")
    page.wait_for_function("typeof window.Game!=='undefined' && typeof window.Screens!=='undefined' && typeof window.Brew!=='undefined'")
    page.evaluate("document.fonts && document.fonts.ready")


def shot(browser, name, out=None):
    mode, js = DRIVERS[name]
    viewport = PORT if mode == "port" else LAND
    page = _new_page(browser, viewport)
    _prep(page)
    page.evaluate(js)
    page.wait_for_timeout(800)          # let the character/scene images + fonts settle
    out = out or os.path.join(CAPS, name + ".png")
    page.screenshot(path=out, clip={"x": 0, "y": 0, "width": viewport[0], "height": viewport[1]})
    page.close()
    print("  %-16s %5dx%-4d  %6.1f KB  %s" % (name, viewport[0], viewport[1], os.path.getsize(out)/1024, out))


def contact_sheet(browser):
    """Render each of the five at the counter and crop a strip around the counter
    line, tiled with a marked counter-Y — the proof surface for the float re-anchor."""
    from PIL import Image, ImageDraw
    page = _new_page(browser, LAND)
    _prep(page)
    counterY = int(page.evaluate("Stage.composite().counterY"))
    frontY = int(0.735 * 720)          # counter FRONT edge (measured on the V3 scene: lit surface ends ~0.735; band now runs 0.63→0.735)
    cast = page.evaluate("Object.keys(window.CAST)")
    band_top, band_h = max(0, counterY - 180), 420
    strips = []
    for who in cast:
        # default (first) expression; clean scene — hide panel/bubbles/HUD so only the figure + counter show
        page.evaluate("""(who) => {
            Game.show('serve');
            if (Screens.hideServeBubble) Screens.hideServeBubble();
            var ex = Object.keys(window.CAST[who].exprs)[0];
            Screens.setServeCustomer(who, ex);
            ['panel-frame','serve-choices','hud-menu','hud-tome','sage-bubble'].forEach(function(id){var e=document.getElementById(id); if(e) e.style.display='none';});
        }""", who)
        page.wait_for_timeout(500)
        raw = os.path.join(CAPS, "_contact_%s.png" % who.replace(".", ""))
        page.screenshot(path=raw, clip={"x": 0, "y": band_top, "width": 1280, "height": band_h})
        im = Image.open(raw).convert("RGB")
        d = ImageDraw.Draw(im)
        cy = counterY - band_top
        fy = frontY - band_top
        d.line([(0, cy), (1280, cy)], fill=(255, 60, 60), width=2)      # RED = counter TOP (plant elbows here)
        d.line([(0, fy), (1280, fy)], fill=(90, 170, 255), width=2)     # BLUE = counter FRONT edge (mug must not pass)
        d.text((8, 6), who + "   red=counter-top  blue=front-edge", fill=(255, 255, 255))
        strips.append(im)
        os.remove(raw)
    sheet = Image.new("RGB", (1280, band_h * len(strips)), (20, 16, 24))
    for i, im in enumerate(strips):
        sheet.paste(im, (0, i * band_h))
    out = os.path.join(CAPS, "contact-sheet-counter.png")
    sheet.save(out)
    page.close()
    print("  contact sheet    counterY=%d  ->  %s" % (counterY, out))


def main():
    which = sys.argv[1] if len(sys.argv) > 1 else "all"
    os.makedirs(CAPS, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch()
        print("Elixir Hour capture rig — native design scale")
        if which == "all":
            for name in ("serve-screen", "serve-portrait", "group-rally", "split-duologue"):
                shot(browser, name)
        elif which == "contact":
            contact_sheet(browser)
        elif which in DRIVERS:
            shot(browser, which)
        else:
            print("unknown shot:", which)
        browser.close()


if __name__ == "__main__":
    main()
