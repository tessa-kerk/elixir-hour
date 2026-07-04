# Elixir Hour — build plan & progress

Milestones from the GDD §14 (`../Elixir Hour - Game Design Document.md`). Each must be runnable in a browser before it's ticked. Design target: the Serve Screen and Ledger Page mockups in the parent folder — copy their layout maths and data shapes, rebuilt responsive and data-driven.

## Milestones

- [x] **0. Repo setup** — `game/` folder, git, locked assets copied into `assets/`, CLAUDE.md + this plan. *(04-07-2026)*
- [ ] **1. Skeleton + state machine.** Screen states (Title/loading → Herald interstitial → Serve → Tome overlay → Group/Split beats → epilogue), Night/visit sequencer, save/load (autosave + Save & Quit/Continue), responsive 16:9 stage. Data-driven from empty content files. Animated loading screen (transparent logo + Elixir-mote/ember particles, GPU-cheap, pauses when tab hidden).
- [ ] **2. Serve screen (Layout 1), correctly layered.** Back wall → character → single front counter → mixing panel. Prove the three-layer composition with placeholder art first. Dialogue bubble above the speaker. **One counter plane only; no stool.**
- [ ] **3. Brew system.** Three slots (base + two mixers), six spells with canon icons, four live meters (Warmth/Kick/Chill/Bite), dose slider (1–3), tankard recipe indicator with ✓ named-brew check, Reset, Pour → brew animation strip (Pour/Spell Drop/Stir panels) → resume dialogue. Six named recipes wired from data.
- [ ] **4. Dialogue system + Night 1 content.** Real Night 1 script loaded from data; speaker sprites with swappable expressions; tone-shaping choices; wrong-brew "gentle beat" reactions. No fail state.
- [ ] **5. The Tome (four tabs).** Brew Book (recipes + "taught by"), Regulars' Ledger (pages unlock on meeting; locked silhouettes; printed bio + Sage's margin notes from GDD §10, verbatim), Arena Herald (per-Night editions + ripple marker), Bard's Songbook (four slots: "Sage's Favourite", "Rain on the Strip", "The Little One's Tune", "Last Call" — earned/locked).
- [ ] **6. Nights 2 and 3.** Remaining scripts, P.E.K.K.A/Princess features, group + split layouts for the finale, the one consequential brew (Knight, Night 3) → epilogue Herald line.
- [ ] **7. Audio, localisation scaffolding, polish.** Ambient loop + SFX wired (real tracks come later); string tables (English populated, 6 languages scaffolded); per-Night light-tint shift; About/Credits screen with the Supercell non-affiliation notice and AI-translation disclaimer.
- [ ] **8. Asset integration.** Final art per GDD §15; regenerate weak scene art to the single-counter composition; transparent logo.

## Acceptance criteria (GDD §14)

Runs in a browser and on a phone; loading screen animates (no static plate, no blue behind the logo); full 3-Night playthrough with saves; brews compute correctly, ✓ on valid named recipes; wrong brews never block; Tome fills in as you play; Knight's Night 3 brew changes exactly one epilogue line; **one** counter on screen; About screen carries the disclaimer.

## Changes & notes

- **04-07-2026 — repo created.** Assets copied are the QA-passed set the Serve Screen Mockup references: 20 character cutouts (current baked-bar versions), Sage anchor, 3 scene plates, 6 UI pieces, 5 cards, logo. Open question carried in from the docs: GDD §12/§15 calls for re-cutting sprites to chest-up/no-bar with a separate counter strip, while the Handoff doc (03-07) locks the baked-bar approach used by the mockup — and `Art/Incoming - No-Bar Renders (2026-07-04)` suggests no-bar renders are now being produced. Resolve with Tessa before Milestone 2's asset pass; the layering code should support both.
- Knight card in `assets/ui/cards/` is the least-damaged placeholder (ghost watermark stars bottom-right); regen pending — Ledger shows it as locked silhouette until then.
- Logo still has the dark-blue plate; transparent version pending (Milestone 8).
