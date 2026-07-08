# SFX still needed — drop-in list

The audio system (`src/audio.js`) is fully wired for four one-shot sound effects.
Each cue already fires at the right game moment; a **missing file just plays
silently** (one quiet console note, never an error). To make a cue audible, drop
an `.mp3` at the exact path below — nothing else to change.

All four should be **CC0** (public-domain) so they can ship inside the game zip
with no attribution burden. Good sources: **freesound.org** (filter licence →
"Creative Commons 0") and **pixabay.com/sound-effects** (free, no-attribution).

| File (place here)                     | Cue — fires when…                          | Feel / length | Search terms |
|---------------------------------------|--------------------------------------------|---------------|--------------|
| `assets/audio/sfx/mug-clink.mp3`      | the finished drink lands on the counter (end of a pour) | one soft ceramic/glass tap, warm not sharp · ~0.3–0.6 s | "mug clink", "ceramic cup set down", "tankard tap" |
| `assets/audio/sfx/brew-fizz.mp3`      | the player hits **Pour** (brew animation starts) | a short liquid pour + gentle fizz/settle · ~0.8–1.5 s | "pour liquid fizz", "soda pour", "potion bubble" |
| `assets/audio/sfx/page-turn.mp3`      | the Tome tab/nav changes (Brew Book, Ledger, Herald, Songbook) | a single soft paper page turn · ~0.4–0.8 s | "page turn", "book page flip" |
| `assets/audio/sfx/quill.mp3`          | the autosave flourish shows (Night boundary "Saved") | one brief quill/pen scratch on paper · ~0.4–0.7 s | "quill write", "pen scratch paper", "ink stroke" |

## Guidance
- **Mono, trimmed, normalised.** Cut leading/trailing silence so the cue lands on
  the frame. Keep each file small (< ~50 KB after the M8 compression sweep).
- **Cosy, not cartoonish.** No synthesised beeps or comedic boings — these should
  sit under Coffee-Talk-style warmth. Physical/foley recordings only.
- **Levels.** They play at 60 % volume in-game (`SFX_VOL`), so pick clips that are
  clear but not startling; the mug-clink especially should be gentle.
- After dropping the files, run them through the same MP3 compression as the music
  (≈112 kbps is plenty for short one-shots) before the launch zip.

The mixer already has a working music channel; these four are the only remaining
audio assets. Once they're in, no code change is required — reload and they play.
