# UI guidelines

The Figma exports (Light/Dark pages + `BrainXNext_*_Proper` screens) are the source of truth. Match their values exactly; when the design and this document disagree, the design wins and this document gets updated.

## Themes

- Two themes, `light` (default) and `dark`, set as `data-theme` on `<html>` by `uiStore`.
- Every colour comes from a token, so both themes work automatically. Never hard-code `#fff` or `#13293F` for surfaces or text inside themed areas.
- Navy sections (hero bands, the Pro pricing card, "continue learning", CTA banners) are dark in **both** themes and use fixed white/light-blue text.
- Use the `dark:` variant only for exceptions the tokens can't express.

## Colour tokens (Tailwind names)

| Token | Use |
| --- | --- |
| `page`, `page-soft` | page background (`page-soft` on single-card/auth screens) |
| `surface`, `surface2` | cards; inputs, nested rows, hover backgrounds |
| `ink`, `muted`, `soft` | primary text, secondary text, captions/meta |
| `line` | borders and dividers |
| `chip` | active nav item, eyebrow chips, selected options |
| `brand` `#1B6FD0`, `teal` `#0E97B0` | primary actions, links, the brand gradient |
| `gold` `#F7C948`, `amber` `#E9A21B` | highlight CTAs, streaks, "Featured"/"NOW" badges |
| `success` `#3FA457`, `danger` `#D9302C` | free/completed/paid; errors, refunds, destructive actions |
| `navy`, `navy-deep` | dark bands and the footer |

Gradients: `.bg-grad-brand` (primary), `.bg-grad-gold` (highlight), `.text-grad` / `.text-grad-hero` (highlighted heading words).

## Typography

- **Sora** (`font-display`, 600–800) for headings, numbers, prices and the logo.
- **Plus Jakarta Sans** (`font-sans`, 400–800) for everything else.
- Headings are `font-extrabold` with tight tracking (`-0.02em`). Page heroes use `clamp()` sizes, e.g. `text-[clamp(32px,4.4vw,52px)]`.
- Body 14–16 px, meta text 12–13.5 px bold in `soft`, eyebrow labels 11–12 px `tracking-[0.1em]` uppercase.

## Shape and depth

- Radius: buttons and pills are fully rounded; inputs 13 px; cards 20–24 px; single-card screens 26–28 px.
- Shadows: `shadow-card` (default), `shadow-card-lg` (hover / raised), `shadow-pop` (auth and checkout cards).
- Hover: cards lift (`.card-hover`, −6 px), buttons lift −2 px. Animate only transform/opacity.

## Components to reuse

| Need | Use |
| --- | --- |
| Buttons | shadcn `Button`, or `.btn` + `.btn-primary` / `.btn-gold` / `.btn-outline` / `.btn-danger` |
| Square icon button | `.icon-btn` |
| Card | `.card` (+ `.card-hover`) |
| Inputs | shadcn `Input`/`Textarea`, or `.field` + `.field-label` |
| Filter chips | `.filter-chip` with `data-active` |
| Section eyebrow | `.eyebrow` (light areas), `.eyebrow-dark` (navy bands) |
| Status tags | `.pill` + tone classes (`STATUS_TONE` in `src/constants/admin.ts`) |
| Page header band | `HeroBand`; section title `SectionHeading` |
| Legal / long-form text page | `LegalPage` (`src/components/marketing/LegalPage.tsx`) with a `LegalDoc` from `src/constants/legal.ts` |
| FAQ accordion | `FaqItem` (Pricing, Help) |
| Icons | `<Icon name="…" size={…} />` (Material Symbols Rounded) |
| Loading/error | `QueryStatus` |
| Info / error / success banner | `Alert` with `tone="info"`, `"error"` or `"success"` |
| Error pages | `ErrorCode` (big gradient 404 / 403 / 500) inside `AuthLayout` |
| Confirmations | `ConfirmDialog` (shadcn `Dialog`, restyled to the tokens) |
| Toasts | `toast()` from `sonner` (themed `Toaster` in `src/components/ui/sonner.tsx`) |

## Layout

- Content widths: 1240 px (site), 1100 px (pricing/about/settings), 1400 px (player).
- Side padding 24 px on desktop, 16–18 px on phones; sections usually 72–88 px vertical padding.
- Breakpoints: 640 px (`sm`), 1000/1024 px (`lg`, nav links collapse to the menu), 1080/1280 px (`xl`, admin sidebar and player sidebar).
- Grids collapse 4 → 2 → 1 and 3 → 2 → 1 columns. No horizontal page scroll at 360 px; wide admin tables scroll inside their card.

## Content and states

- **Language: English only.** No i18n library and no Bangla UI translation. A course's language label ("Bangla" or "English") describes the course content, not the interface.
- **Currency: Bangladeshi Taka (৳) only** (implemented, F-001). Format every amount with `formatTaka()` from `src/lib/utils.ts`: whole taka, `৳` before the number with no space, South-Asian grouping (`৳4,900`, `৳1,24,000`). Free courses say `Free`, never `৳0`. Prices are VAT-inclusive (checkout says "VAT included"). Promo discounts use `discountFor()` so the UI and the API agree.
- Copy comes from the design; keep the tone short and friendly.
- Prices show `Free` in `success` green, paid prices in `ink` with the old price struck through in `soft`.
- Every data view handles loading, empty (dashed-border box with a "Clear filters"-style action) and error (`QueryStatus` with retry).
- Success confirmations replace the form inside the same card (green circle icon + title + next action), as in the designs.

## Checklist for new UI

- [ ] Uses tokens and existing component classes only
- [ ] Looks right in light **and** dark
- [ ] Works at 360 px, 768 px and 1366 px
- [ ] Meets `accessibility.md`
