#!/usr/bin/env python3
"""
Elixir Hour — Cloudflare Pages build script.

Stages this repo into `dist/`: the landing page (site/) at dist root, the
game itself at dist/play/, and the Night Cap share page at dist/cap/ (its
<base href> rewritten onto /play/). Byte-equivalent to what the legacy
per-release bundler, Tools/build_deploy_zip.py (one level up, outside this
repo), has always zipped — same staging, same transforms, same prunes —
just written to a directory instead of a zip, so Cloudflare Pages can build
straight from a git push instead of Tessa drag-dropping a zip by hand.

Wired 24-07-2026 (cross-session request, game/PLAN.md). Never edits the
working tree — every transform runs on the copy in dist/.

Run:     python3 tools/build_site.py
Output:  dist/  (repo-local, gitignored — Cloudflare Pages build command
         `python3 tools/build_site.py`, output directory `dist`)
"""
import os, re, shutil, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)                       # game/ — this script's own repo root
DIST = os.path.join(REPO, "dist")
CANON = "https://elixirhour.tessa-kerk.com"

# tools/ and dist/ are excluded from the /play copy same as the legacy script
# excluded them from the zip's play/ copy — dev-only, never shipped.
EXCLUDE_DIRS = {".git", "captures", "scratchpad", "tools", "site", "node_modules", "dist", "__pycache__"}
EXCLUDE_FILES = {"PLAN.md", "CLAUDE.md", "README.md", ".gitignore",
                 # superseded, unreferenced (verified 09-07-2026, carried over from the zip script):
                 "Serve Screen - Left BG No Stool.png",
                 "Serve Screen - Right (Brewing Wall) V3.png",
                 "Elixir Hour Logo (Final).png"}
KEEP_PNG = {"night-cap-share.png"}  # og:image — some scrapers reject WebP


def copytree(src, dst, exclude_dirs=(), exclude_files=()):
    for root, dirs, files in os.walk(src):
        dirs[:] = [d for d in dirs if d not in exclude_dirs and not d.startswith(".")]
        rel = os.path.relpath(root, src)
        for f in files:
            if f in exclude_files or f.endswith(".md"):
                continue
            if f.lower().endswith(".png") and f not in KEEP_PNG:
                # a .png with a .webp twin is a source file — refs point at the twin;
                # any .png under assets/characters/ is a superseded sprite source
                if (os.path.exists(os.path.join(root, f[:-4] + ".webp"))
                        or "assets/characters" in root.replace(os.sep, "/")):
                    continue
            d = os.path.join(dst, rel, f)
            os.makedirs(os.path.dirname(d), exist_ok=True)
            shutil.copy2(os.path.join(root, f), d)


def check_dirty():
    """Cloudflare Pages always builds from a clean checkout of the pushed commit, so
    this never fires there. It's a courtesy for a local run: the same guard the zip
    script used, so a preview build here can't silently ship mid-flight work either."""
    try:
        r = subprocess.run(["git", "-C", REPO, "status", "--porcelain"], capture_output=True, text=True)
        dirty = r.stdout.strip()
        if dirty and "--force" not in sys.argv:
            print("ABORT: uncommitted changes in the repo — a build now would ship mid-flight work.")
            print("Commit (or stash) first, or rerun with --force:")
            print(dirty)
            return True
    except Exception as e:
        print(f"(git check skipped: {e})")
    return False


def integrity_gates(root):
    """No null bytes in any staged text file; every staged .js parses. Cloudflare
    Pages' build image carries Node, so this runs there; a local run without Node
    on PATH just skips the parse check and says so."""
    problems = []
    for r, _, files in os.walk(root):
        for f in files:
            if f.endswith((".html", ".css", ".js", ".json")):
                p = os.path.join(r, f)
                with open(p, "rb") as fh:
                    if b"\x00" in fh.read():
                        problems.append(f"NULL BYTE: {os.path.relpath(p, root)}")
    node = shutil.which("node")
    if node:
        for r, _, files in os.walk(root):
            for f in files:
                if f.endswith(".js"):
                    p = os.path.join(r, f)
                    res = subprocess.run([node, "--check", p], capture_output=True, text=True)
                    if res.returncode != 0:
                        problems.append(f"JS SYNTAX: {os.path.relpath(p, root)}\n{res.stderr.strip()}")
    else:
        print("WARN: node not found on PATH — skipping `node --check` (a local run without Node just skips this gate).")
    return problems


def main():
    if check_dirty():
        return 2

    if os.path.exists(DIST):
        shutil.rmtree(DIST)
    os.makedirs(DIST)

    # landing page -> dist root
    copytree(os.path.join(REPO, "site"), DIST)
    # game -> dist/play
    play = os.path.join(DIST, "play")
    copytree(REPO, play, exclude_dirs=EXCLUDE_DIRS, exclude_files=EXCLUDE_FILES)

    # --- transforms on copies (identical to Tools/build_deploy_zip.py) ---
    idx = os.path.join(DIST, "index.html")
    html = open(idx, encoding="utf-8").read()
    html = html.replace('href="../index.html"', 'href="play/"')
    # absolute og/twitter image URLs (og:url is already absolute in source — round M3)
    html = re.sub(r'(property="og:image" content=")(assets/[^"]+)',
                  lambda m: m.group(1) + f"{CANON}/" + m.group(2), html)
    html = re.sub(r'(name="twitter:image" content=")(assets/[^"]+)',
                  lambda m: m.group(1) + f"{CANON}/" + m.group(2), html)
    if 'property="og:url"' not in html:
        html = html.replace('<meta property="og:image"',
              f'<meta property="og:url" content="{CANON}/">\n<meta property="og:image"', 1)
    open(idx, "w", encoding="utf-8").write(html)

    # GAME_URL ships canonical in the repo since round 10 — verify, don't transform
    nc = os.path.join(play, "src", "nightcap.js")
    js = open(nc, encoding="utf-8").read()
    if 'var GAME_URL = "elixirhour.tessa-kerk.com"' not in js:
        print("WARN: nightcap.js GAME_URL is not the canonical domain — check before shipping")

    # --- /cap at ROOT: shareLink() emits origin + "/cap#...", so the share page must
    # resolve at the domain root even though the game lives at /play/. Only the
    # index.html is staged at /cap — its <base href="../"> (game root, in-repo) is
    # rewritten to /play/ so every relative subresource (css, strings, data, src,
    # cap/cap.js, assets) resolves into the game copy. og:* URLs are already
    # absolute (crawlers ignore <base>). ---
    cap_src = os.path.join(REPO, "cap", "index.html")
    cap_html = open(cap_src, encoding="utf-8").read()
    if '<base href="../">' not in cap_html:
        print('ABORT: cap/index.html no longer carries <base href="../"> — update this script\'s /cap staging')
        return 3
    cap_dst = os.path.join(DIST, "cap", "index.html")
    os.makedirs(os.path.dirname(cap_dst), exist_ok=True)
    open(cap_dst, "w", encoding="utf-8").write(
        cap_html.replace('<base href="../">', '<base href="/play/">'))

    # --- prune superseded source PNGs (belt-and-suspenders on top of copytree's
    # own skip — catches an assets/scenes/*.png that has no .webp twin) ---
    pruned_n, pruned_mb = 0, 0
    for sub in ("characters", "scenes"):
        top = os.path.join(play, "assets", sub)
        for r, _, files in os.walk(top):
            for f in files:
                if f.endswith(".png"):
                    p = os.path.join(r, f)
                    pruned_mb += os.path.getsize(p)
                    os.remove(p); pruned_n += 1
    print(f"pruned {pruned_n} superseded source PNGs ({pruned_mb // (1024*1024)} MB) from play/assets/")

    # --- link check: every referenced local asset must exist in the stage ---
    missing, warnings = [], []
    pat = re.compile(r'(?:src|href)="([^"#][^":]*?)(?:\?[^"]*)?"')
    strpat = re.compile(r'["\'](assets/[^"\']+?)(?:\?[^"\']*)?["\']')
    for r, _, files in os.walk(DIST):
        for f in files:
            if not f.endswith((".html", ".css", ".js")):
                continue
            p = os.path.join(r, f)
            txt = open(p, encoding="utf-8", errors="ignore").read()
            refs = set(pat.findall(txt)) if f.endswith(".html") else set()
            refs |= set(strpat.findall(txt))
            rel = os.path.relpath(p, DIST)
            approot = os.path.join(DIST, "play") if rel.startswith("play" + os.sep) else DIST
            basehref = None
            if f.endswith(".html"):
                bm = re.search(r'<base href="([^"]+)"', txt)
                if bm:
                    basehref = bm.group(1)
            for ref in refs:
                if ref.startswith(("http", "//", "data:", "mailto")) or ref.endswith("/"):
                    continue
                if ref.startswith("/"):
                    tgt = os.path.normpath(os.path.join(DIST, ref.lstrip("/")))
                else:
                    base = os.path.dirname(p) if f.endswith(".html") else approot
                    if basehref:
                        base = (os.path.normpath(os.path.join(DIST, basehref.strip("/")))
                                if basehref.startswith("/")
                                else os.path.normpath(os.path.join(os.path.dirname(p), basehref)))
                    tgt = os.path.normpath(os.path.join(base, ref))
                if os.path.exists(tgt):
                    continue
                if "assets/audio" in ref.replace(os.sep, "/"):
                    warnings.append(f"{rel} -> {ref} (audio pending by design)")
                else:
                    missing.append(f"{rel} -> {ref}")
    print(f"LINK CHECK: {'OK — all referenced files present' if not missing else 'MISSING:'}")
    for m in missing:
        print("  ", m)
    for w in warnings:
        print("   warn:", w)

    # --- integrity gates (cross-session request, 24-07): no null bytes, every JS parses ---
    problems = integrity_gates(DIST)
    if problems:
        print("INTEGRITY GATE FAILED:")
        for p in problems:
            print("  ", p)

    total_files, total_bytes = 0, 0
    for r, _, files in os.walk(DIST):
        for f in files:
            total_files += 1
            total_bytes += os.path.getsize(os.path.join(r, f))
    print(f"dist/: {total_bytes / (1024 * 1024):.1f} MB, {total_files} files")

    return 0 if (not missing and not problems) else 1


if __name__ == "__main__":
    sys.exit(main())
