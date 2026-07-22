# YourCompass site — structure migration

Target structure (agreed): unified `main.css`/`main.js` for everything shared
across pages, a small page-specific CSS/JS file per page, and images split
into `assets/images/main/` (global) vs `assets/<page>/images/` (page-only).

## What changed

**CSS** — the old `css/nav.css` + `css/styles.css` (5,100+ lines) were parsed
rule-by-rule and classified by which page(s) actually use each selector
(checked against real `class=`/`id=` usage in the HTML, not guessed):

- `assets/css/main.css` — nav, tokens, resets, buttons, section furniture,
  and every component used by 2+ pages. This includes the practice-page
  template (`.obs-hero`, `.obs-proof`, `.obs-close`, `.obs-bridge`,
  `.obs-head`, `.obs-case`, `.obs-chips`, `.obs-org__list`) which is shared
  by Observability + Managed + Enterprise, not Observability-only as the
  class prefix might suggest — verified against actual page markup.
- `assets/index/index.css` — homepage-only (hero ornament, reframe, journey,
  compass rose, method, demos, showcase, credentials, partners/clients,
  footprint, trust, team, close variants).
- `assets/observability/observability.css` — partnerships, coverage tiles,
  the closed-loop triangle diagram, recognition strip.
- `assets/managed/managed.css` — service factory, integrations, "why
  different" cards.
- `assets/enterprise/enterprise.css` — capabilities grid, partner wall.
- `assets/foundry/foundry.css` — Foundry's own design system, extracted from
  its 4 embedded `<style>` blocks (was previously inline in the HTML, and
  didn't load `styles.css` at all).

**Foundry reconciliation** — Foundry's own `.wrap` and `.kicker` classes had
different rules than `main.css`'s versions (different max-width, padding,
positioning). Renamed to `.fnd-wrap` / `.fnd-kicker` across both its CSS and
its HTML markup (460 class attributes touched) so Foundry can now safely
load `main.css` alongside its own stylesheet with zero visual change and no
collision risk. `.btn` was NOT a real collision — Foundry uses
`.btn`/`.btn--primary` (BEM), `main.css` uses `.btn-primary`/`.btn-ghost` —
different selectors, left as-is.

**JS** — `assets/js/main.js` is the nav behaviour only (`nav.js` renamed),
since that's the one script that genuinely runs on all 5 pages today,
including Foundry. `assets/js/app.js` (renamed from the old `app.js`) stays
separate and is loaded only by the 4 pages that already use it — Foundry is
**not** newly wired to it, to avoid adding behaviour to that page as a side
effect of a structural reorg. `assets/foundry/foundry.js` is Foundry's own
16.4KB inline script, extracted verbatim.

**Spacing tokens** — the `--sect-y` / `--sect-y-lg` global spacing scale
from the earlier fix is intact in `main.css`; Foundry's local
`--f-sect-y` / `--f-sect-y-lg` scale is intact in `foundry.css`. Both
still route through the same tightened rhythm.

## What did NOT change

- `css/fonts.css` — left where it is; out of scope for this pass.
- No copy, layout, or visual output was intentionally changed. Foundry's
  `.wrap`→`.fnd-wrap` rename is a pure rename (identical CSS rules under a
  new name) specifically so nothing renders differently.

## Flagged for your attention (not fixed, just surfaced)

- **Dead CSS found:** `.compass`, and a handful of related selectors, don't
  match any element in the current HTML — the "One Intelligent Core" section
  was refactored to reuse `.reframe`'s markup at some point, leaving old
  rules orphaned. They're harmless (unused = no effect) and currently sit in
  `main.css`. Worth a cleanup pass, but I didn't delete anything without
  confirming with you first.
- **True design-system unification** (Foundry adopting the *same* tokens/
  tone-classes as the other 4 pages, not just avoiding name collisions) is
  still a separate, bigger task — this pass makes it *possible* to load both
  stylesheets together, not identical in visual language.

## Physical file moves still needed (Gevorg)

I only had the HTML's *referenced* paths, not the actual image binaries —
see `IMAGE_MOVE_MAP.md` for the full old→new mapping (logo, favicon, 30
customer logos, 21 partner logos). Every HTML reference is already updated
to the new path; only the files themselves need to move on disk.
