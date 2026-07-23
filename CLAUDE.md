# Elixir Hour — build rules (read me first, every session)

*This file belongs at the root of the `game/` repo. Claude Code reads it automatically each session. It is separate from the Knowledge Base vault's `claude.md`.*

You are building **Elixir Hour**, a cosy conversation game — "Coffee Talk, in the Clash Royale universe."

## Source of truth
- Before doing anything, read the Game Design Document at **`../Elixir Hour - Game Design Document.md`** (in the parent workshop folder). It is the single source of truth. Re-read it whenever you're unsure.
- Follow the build order and acceptance criteria in its **§14**. When a decision is unclear, ask: *what would Coffee Talk do?* (its §3 is the blueprint.)
- Keep **`PLAN.md`** (in this folder) updated: tick off milestones as you finish them, and note anything you changed and why.
- Visual targets: `../Elixir Hour - Serve Screen Mockup.html` (the game screens) and `../Elixir Hour - Ledger Page Mockup (Knight).html` (the Tome handwriting). Match their look; rebuild them properly (responsive, data-driven), don't start from a blank page.

## What to build (Phase 1)
- Web, single-page: **HTML + CSS + JavaScript**. Must run by opening in a browser and be **fully responsive down to mobile** (16:9 reference).
- **Multi-file and data-driven:** keep dialogue, characters, recipes, Herald editions, Ledger bios + Sage's notes, and all UI strings in **separate data files** — never hard-coded in logic. All player-facing text goes through **string tables** (English populated; scaffold the other 6 languages).
- **Assets:** reuse the locked art from `../Art/`; copy the files the game actually uses into `./assets/` so this repo is self-contained. Regenerate only the weak scene art per GDD §12/§15. Wire the audio system + Songbook slots, but leave the real music tracks for later (four slots: "Sage's Favourite", "Rain on the Strip", "The Little One's Tune", "Last Call").
- **Sprite workflow (locked 05-07-2026):** Tessa generates characters on flat grey and background-removes them herself; the PNGs in `assets/characters/` are FINAL cutouts — **never re-key, re-cut or regenerate them**. Placement is programmatic via the per-expression `{file, top, base, tall}` metadata in `data/cast.js`. The transparent logo, title background, nav-arrow icon and all five character cards are likewise final. See PLAN.md's "CURRENT STATE" block for the full locked list.

## Do not
- Do not invent narrative or character content. Load dialogue from the Full Script / data files; use the GDD §10 bios and Sage's margin notes verbatim.
- Do not write the characters as playable cards ("drawn", "deployed", "played"). They are people.
- Do not add a second bar counter — **one counter plane only** (GDD §12). No stool in front.
- Do not commit the parent folder's private design docs. Keep a `.gitignore` so only `game/` (code + `assets/` + README + PLAN.md + this CLAUDE.md) is pushed. The Lore Bible, Handoff notes, and the full GDD stay private in the parent workshop folder.

## Always
- Commit after each runnable milestone and **push to GitHub**.
- **Commit messages are public-facing (rule added 24-07-2026, history curated same day):** write them for a repo visitor — what changed and why it matters. No internal round numbers, no reviewer names, no session references, no co-author trailers. The round-by-round detail belongs in PLAN.md, not the commit message.
- Keep an **About/Credits screen** with the "Not affiliated with or endorsed by Supercell — original fan concept by Tessa Kerk" notice and the AI-translation disclaimer.
- Ask before big architectural changes.

## Regression surfaces (non-negotiable — added 06-07-2026)
**Anything Tessa has signed off is a REGRESSION SURFACE.** When you refactor a shared system — **layout, nav, save, rendering, the Tome, the Night Cap, any exportable/screenshottable surface** — re-render the signed-off states and **diff them against their existing captures BEFORE committing**. Any visual change to an approved surface gets **flagged for approval, never shipped silently**. **"It wasn't broken" is a spec** — a change that "improves" an approved layout without being asked is a regression, not an upgrade. (This rule was written because the 12-card grid pagination silently replaced the signed-off 5-card Ledger grid.)
