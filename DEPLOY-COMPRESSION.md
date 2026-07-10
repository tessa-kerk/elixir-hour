# Deploy / compression punch-list (M8) — state at build v24

The launch zip needs three passes before it ships. Two are **blocked in the current
environment** (no audio encoder; approved/locked art needs sign-off). This file is
the exact hand-off so they can be finished in one sitting.

Loaded assets today ≈ **65 MB** (excluding ~36 MB of orphan source art, below).
After all three passes: **≈ 24 MB**.

---

## 1. Audio — BLOCKED (no encoder in this environment)

`ffmpeg`, `lame`, `opusenc`, `oggenc` are all absent here, so the four tracks
ship **raw at ~180 kbps** for now. They play and loop correctly (crossfade loop
is wired + verified) — this is purely a size pass.

| File | Now | — |
|------|-----|---|
| `assets/audio/sages-favourite.mp3`     | 5.95 MB (4:26) | |
| `assets/audio/rain-on-the-strip.mp3`   | 7.25 MB (5:29) | |
| `assets/audio/the-little-ones-tune.mp3`| 3.93 MB (2:59) | |
| `assets/audio/last-call.mp3`           | 3.52 MB (2:37) | |
| **Total** | **~21 MB** | → target **~10 MB** |

**Run (GDD §16 target — MP3 path is simplest, no code change needed):**
```
for f in sages-favourite rain-on-the-strip the-little-ones-tune last-call; do
  ffmpeg -i "$f.mp3" -c:a libmp3lame -b:a 112k -ar 44100 "$f.out.mp3" && mv "$f.out.mp3" "$f.mp3"
done
```
Opus (~80 kbps, smaller still) would need a `.webm`/`.opus` fallback wired into
`SONGBOOK[].file` + `audio.js`; MP3 @112k is the no-code-change option and is plenty.
The natural end-fade on each take is preserved by the encode — the loop crossfade
still works. **Do NOT trim the tails** (the crossfade relies on them).

## 2. Loaded UI PNGs — needs Tessa's sign-off (approved / LOCKED surfaces)

These are still PNG and are the bulk of the shippable weight. They live on
**signed-off surfaces** (the Tome, the brew flow, the Ledger cards). The five
character cards are explicitly **"FINAL — never re-key/re-cut/regenerate"**
(game/CLAUDE.md). A **lossless** WebP re-encode is pixel-identical and safe, but
per the regression rule each surface must be re-rendered and diffed before it
ships — so this is flagged, not done unilaterally.

| File | Now | lossless webp ≈ |
|------|-----|-----------------|
| `assets/ui/Tome Spread.png` | 4.4 MB | ~1.2 MB |
| `assets/ui/cards/*.png` (×5) | 16.9 MB | ~5 MB |
| `assets/ui/Brew Panel - *.png` (×3) | 8.1 MB | ~2.5 MB |
| `assets/ui/Songbook Phonograph (cutout).png` | 1.5 MB | ~0.5 MB |
| `assets/ui/Tankard Icon (cutout).png` | 0.5 MB | ~0.2 MB |
| `assets/logo/Elixir Hour Logo (transparent).png` | 0.9 MB | ~0.3 MB |
| `assets/share/night-cap-share.png` (OG meta only) | 2.3 MB | keep PNG* |
| **Total** | **~34.7 MB** | **→ ~10 MB** |

*The share image is referenced only by `og:image`/`twitter:image` meta — some
scrapers reject WebP, so leave it PNG (or add a JPG). Converting the rest means
updating the matching `src`/`url()` + `?v=` refs in `index.html`/`css/main.css`.

## 3. Orphan source PNGs — safe to EXCLUDE from the deploy zip (~36 MB)

Not referenced anywhere in the game (the round-9 pre-baked-scene rewrite made the
game load `assets/cutouts/*.webp` and `assets/scenes/**/*.webp` instead). These are
**Tessa's source art** — keep them in the working folder, just don't ship them.
Per the no-delete rule they have **not** been moved; add them to a deploy exclusion.

- `assets/characters/` — 21 PNGs, **31 MB** (source cutouts, superseded by `assets/cutouts/*.webp`)
- `assets/scenes/*.png` — 2 files, **4.9 MB** (superseded by the webp serve scenes)

Suggested: a `.deployignore` or a zip step that excludes `assets/characters/**`
and top-level `assets/scenes/*.png`. (Also exclude `.git/`, `tools/`, `site/` if
present, and the `*.md` dev docs from the player zip.)

## 4. `captures/readme/` — EXCLUDE from the deploy zip (~8.6 MB, added §R19)

The README is a shop window now (the live site's footer links the repo), so it
carries a hero banner, five feature stills and the page-turn GIF. They live in
`captures/readme/` and are referenced by `README.md` only — **nothing in the game
loads them.** They exist to be rendered by GitHub, so they must ship in the repo
and must NOT ship to the player.

- `captures/readme/` — 7 PNGs + 1 GIF, **9.2 MB** (`tome-page-turn.gif` is 4.3 MB of it)

Same rule as the `*.md` dev docs: the zip step that already drops `README.md`
should drop `captures/` with it.

---

### Done this round (v24)
- Audio system wired + verified: 4 tracks, unlock schedule, seamless ~2 s crossfade
  loop, ~1 s duck on title/rest, Settings toggle governs all.
- SFX cues wired (mug-clink, brew-fizz, page-turn, quill); files still to source
  (see `assets/audio/sfx/SFX-NEEDED.md`) — missing files degrade silently.
- Herald backdrop, duo two-shot rebuild (re-shot), dark-sage hover, mixer lift,
  two-line title button.
