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

## Do not
- Do not invent narrative or character content. Load dialogue from the Full Script / data files; use the GDD §10 bios and Sage's margin notes verbatim.
- Do not write the characters as playable cards ("drawn", "deployed", "played"). They are people.
- Do not add a second bar counter — **one counter plane only** (GDD §12). No stool in front.
- Do not commit the parent folder's private design docs. Keep a `.gitignore` so only `game/` (code + `assets/` + README + PLAN.md + this CLAUDE.md) is pushed. The Lore Bible, Handoff notes, and the full GDD stay private in the parent workshop folder.

## Always
- Commit after each runnable milestone and **push to GitHub**.
- Keep an **About/Credits screen** with the "Not affiliated with or endorsed by Supercell — original fan concept by Tessa Kerk" notice and the AI-translation disclaimer.
- Ask before big architectural changes.
