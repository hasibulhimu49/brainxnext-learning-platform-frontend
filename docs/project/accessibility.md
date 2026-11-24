# Accessibility

Target: **WCAG 2.2 AA** in both light and dark themes, on desktop and mobile.

## Rules

- **Semantics first.** Use real elements: `<button>` for actions, `<Link>`/`<a>` for navigation, `<nav>`, `<main>`, `<aside>`, one `<h1>` per page, headings in order.
- **Icon-only controls** (theme toggle, close, back, row actions) need an `aria-label`. The `<Icon>` component renders `aria-hidden="true"`, so the label must sit on the button.
- **Toggles and choices** are real switches/radios: shadcn `Switch`, or buttons with `role="radio"` + `aria-checked` / `aria-pressed`. Accordions use `aria-expanded`; tabs use `role="tab"` + `aria-selected`.
- **Forms**
  - Labelled forms use shadcn `FormLabel` (Settings, admin editor).
  - Auth cards have placeholders only (per the design), so every `AuthInput` needs an `aria-label`.
  - Field errors render under the field with `role="alert"`; success messages use `role="status"`.
  - Keep native `type`, `autoComplete` and `inputMode` (email, current-password, one-time-code, cc-number…).
- **Images**: content images get meaningful `alt`; decorative backgrounds (hero photos, course covers) use `alt=""` or CSS backgrounds.
- **Charts** (dashboard week chart, admin revenue) carry `role="img"` and an `aria-label` describing the data.
- **Colour** never carries meaning alone — status pills also show text (`PAID`, `DRAFT`, `OVERDUE 2H`). Text tokens (`ink`, `muted`, `soft`) are tuned for contrast on `page`/`surface` in both themes; check any new colour with a contrast tool.
- **Keyboard**: everything clickable is reachable with Tab and works with Enter/Space; the mobile menu and OTP inputs support Backspace/paste. Never remove focus outlines without a replacement.
- **Disabled-looking submit buttons** stay focusable and clickable (55% opacity) and use `aria-disabled`, so users can trigger the validation messages.

## Built-in support

- **Focus ring.** `src/index.css` sets a global `:focus-visible` outline (2px `#1B6FD0`, 2px offset) in `@layer base`, so it only shows for keyboard focus and components with their own ring (shadcn inputs, `.field`) override it. Never add `outline-none` without a visible replacement.
- **Reduced motion.** Under `prefers-reduced-motion: reduce` animations and transitions are cut to ~0, smooth scrolling is off and hover lifts (`.card-hover`, `hover:-translate-y-*`) are disabled. JS `scrollIntoView({ behavior: "smooth" })` calls should check the media query too.
- **Skip link.** `PublicLayout`, `AuthLayout` and `AdminLayout` render `<a href="#main" class="skip-link">Skip to content</a>` first; the target is `id="main"` (the `<main>` landmark, or the content wrapper in `AdminLayout` because admin pages render their own `<main>`). Standalone pages that do not use a layout need their own.
- **Page titles.** Every page calls `usePageTitle("Name")` (`src/hooks/usePageTitle.ts`) → "Name · BrainXNext"; Home uses `usePageTitle()`.

## Known gaps

- Mobile menu: Escape to close and focus trap (Navbar, Phase 4 follow-up).
- `ScrollToTop` always scrolls smoothly to a #hash, even with reduced motion.

## Checking

- Playwright e2e uses role/label queries, which catches missing labels.
- Before merging UI work: tab through the page, test with the screen reader you have (NVDA / VoiceOver), and run Lighthouse or axe DevTools on the changed routes in both themes.
