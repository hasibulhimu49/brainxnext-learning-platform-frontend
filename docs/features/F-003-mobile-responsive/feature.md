# F-003 — Mobile responsiveness pass

**Status:** Done — 2026-11-25

## Goal

Every screen works on a small phone (360px) without sideways scrolling, with tappable controls and no dead ends.

## Audit (before)

All 47 routes (guest, student, admin) were measured at 360px and 390px:

- Public and student navbar was 2–32px wider than the screen at ≤390px (every public page).
- Admin course editor header cut off "Publish" at 360px; the title wrapped to four lines.
- Home page was ~12,000px tall on a phone (all 12 course cards stacked).
- Course detail: the enrol button scrolled away with no way back except scrolling to the top.
- Player prev/play/next controls were ~21px wide.
- Decorative hero dots overlapped the hero text.

## Changes

- **Navbar:** tighter gaps below 400px; below 381px the theme toggle moves into the mobile menu ("Dark mode / Light mode").
- **Course editor header:** compact buttons, subtitle hidden below 421px, title hidden below 380px.
- **Home:** phones show the first 4 courses (the count text matches) + "See full catalog"; section padding 56px instead of 88px on phones; hero dots hidden on phones.
- **Course detail:** a sticky bottom bar (title, price, primary action) appears on screens below 1001px once the buy card's button scrolls out of view; the page gets bottom padding while it shows. Lives in `BuyCard`.
- **Player:** prev/play/next have 36px hit areas.
- Related fix from F-002 integration: `.sr-only` text inside horizontal scrollers stretched the page — scrollers are now `relative`.

## Testing

- `e2e/responsive.spec.ts` — 19 routes across guest/student/admin must not exceed 360px width.
- Full suite: typecheck, lint, format clean · Vitest 159/159 · Playwright 152/152 + 6 responsive.

## Not changed

- Admin data tables stay horizontally scrollable on phones (no card layout).
- Small inline text links and the design's 10–11px badges were left as designed.
