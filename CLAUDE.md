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

## New UI elements: reuse the visual vocabulary (non-negotiable — added 04-08-2026)
The regression rule above guards APPROVED surfaces from silent change. This rule guards the opposite failure: a **brand-new** element built in isolation that doesn't match the design system. **Before shipping any new Tome / Herald / UI element, find the closest existing analogue and reuse its vocabulary — dividers, colours, type, spacing. Never invent a one-off style.** Name the analogue you matched to in your PLAN.md note so the reuse is auditable. (Written because the first Herald live-ops edition shipped its gossip-line divider as a new solid pale-sage line, when the Tome's established sage-aside divider is the dashed hand-note rule — caught only by Tessa's eye at ship time. New elements are exactly where the fit-check gate is blind: it tests overflow, not style consistency, so this check is on you.)

## Sage's identity in the Tome (art-direction lock — solidified 04-08-2026)
Sage speaks in ONE consistent visual voice everywhere she appears in the Tome, and it must never be reinvented:
- **Pen/quill icon + green Caveat handwriting** (`color: var(--sage-deep)`). This is her signature wherever she adds her OWN voice — the Brew Book's "Taught by …" notes, the Ledger's margin notes, and the Herald live-ops **gossip closer**. Same icon, same hand, same colour, every time.
- **Everything printed in the Tome is Cormorant Garamond** (the paper's / Herald's voice). The CSS already states it: *"only Sage's hand is Caveat."* A line in Sage's voice set in Cormorant — even tinted green — is WRONG. That was the first-edition gossip-closer bug.
- **Sage's notes carry NO dashed divider or one-off separator.** The pen icon + handwriting IS the marker, exactly like the Brew Book note. Don't add a rule/line to set a Sage note off.
- **Don't confuse the two Herald markers:** the small *figure* icon means "this edition references a pour"; the *pen* icon means "this is Sage." Different signals — use the pen for Sage's voice.

(Solidified after the first Herald live-ops edition: its gossip closer shipped first as printed serif + a one-off pale divider, then a dashed-sage line, before landing on the correct pen + Caveat Sage-note treatment. This lock exists so no future edition or new Tome surface reinvents Sage's voice.)
