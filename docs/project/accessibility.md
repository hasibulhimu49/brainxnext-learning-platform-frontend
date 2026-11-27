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
- **Colour** never carries meaning alone — status pills also show text (`PAID`, `DRAFT`, `OVERDUE 2H`). Text tokens (`ink`, `muted`, `soft`) reach 4.5:1 on `page`, `surface`, `surface2` and `chip` in both themes; check any new colour with a contrast tool.
- **Accent text vs fills.** `text-brand`, `text-teal`, `text-success`, `text-amber` and `text-danger` read theme-aware text colours (`--brand-text`, `--success-text`, … via Tailwind's `--text-color-*` keys in `src/index.css`): darker in light mode, lighter in dark mode (`text-brand` is `#6FB7FF` in dark). `bg-`/`border-` utilities keep the Figma fills; `bg-success` is a deeper green (`#2D8444`) so white text on it passes. On a fixed white chip use `text-brand-solid` (never switches theme). Don't hard-code `#1B6FD0` for text — use `text-brand` or `var(--brand-text)`.
- **Keyboard**: everything clickable is reachable with Tab and works with Enter/Space; the mobile menu and OTP inputs support Backspace/paste. Never remove focus outlines without a replacement.
- **Disabled-looking submit buttons** stay focusable and clickable (55% opacity) and use `aria-disabled`, so users can trigger the validation messages.

## Built-in support

- **Focus ring.** `src/index.css` sets a global `:focus-visible` outline (2px `var(--brand-text)`, 2px offset) in `@layer base`, so it only shows for keyboard focus and components with their own ring (shadcn inputs, `.field`) override it. Never add `outline-none` without a visible replacement.
- **Reduced motion.** Under `prefers-reduced-motion: reduce` animations and transitions are cut to ~0, smooth scrolling is off and hover lifts (`.card-hover`, `hover:-translate-y-*`) are disabled. JS `scrollIntoView({ behavior: "smooth" })` calls should check the media query too.
- **Skip link.** `PublicLayout`, `AuthLayout`, `AdminLayout`, the player (`Player`) and the standalone course editor (`AdminNewCourse`) render `<a href="#main" class="skip-link">Skip to content</a>` first; the target is `id="main"` (the `<main>` landmark, or the content wrapper in `AdminLayout` because admin pages render their own `<main>`). Standalone pages that do not use a layout need their own.
- **Overlays.** The mobile menu (Navbar) and the Next AI chat panel use `useFocusTrap` (`src/components/common/useFocusTrap.ts`): Tab/Shift+Tab wrap inside, Escape closes and returns focus to the opener. The chat panel is `role="dialog"` + `aria-modal="true"`.
- **Page titles.** Every page calls `usePageTitle("Name")` (`src/hooks/usePageTitle.ts`) → "Name · BrainXNext"; Home uses `usePageTitle()`.

## Known gaps

None known. Fixed in F-009: low-contrast `soft` text, dark-mode brand/danger text, green/amber text and white-on-green buttons, footer grey on navy, missing `<h1>` on the certificate and course-editor pages, focus trap for the mobile menu and Next AI panel, the unread-notification dot (now real sr-only text), Next AI ping widening the page at 360px and the circle covering the last footer row, and `ScrollToTop` ignoring reduced motion for #hash links.

## Checking

- Playwright e2e uses role/label queries, which catches missing labels.
- Before merging UI work: tab through the page, test with the screen reader you have (NVDA / VoiceOver), and run Lighthouse or axe DevTools on the changed routes in both themes.
