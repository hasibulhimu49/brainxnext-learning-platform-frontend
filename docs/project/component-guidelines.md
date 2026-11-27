# Component guidelines

- **shadcn/ui first** for primitives: `Button`, `Input`, `Textarea`, `Label`, `Switch`, `Dialog`, `Form`, `Toaster` (sonner) in `src/components/ui`. They are themed with the BrainXNext tokens; keep it that way when adding more (`npx shadcn@latest add …`, then restyle).
- **Shared components** in `src/components/common`: `Icon`, `Logo`, `Navbar`, `Footer`, `HeroBand`, `SectionHeading`, `QueryStatus`, `ConfirmDialog`, `ErrorCode`, `FormFeedback` (`Alert`, `FieldError`, `SubmitButton`, `SuccessState`), `useFocusTrap`, `AppErrorBoundary`. Feature components live in `auth/`, `admin/` (incl. `AdminSidebar`, `dialogs/`, `course-editor/`), `learner/`, `course/`, `player/`, `checkout/`, `billing/`, `shop/`, `marketing/`, `assistant/`.
- Components receive data as props or read it from query hooks; they never call services directly.
- Split pages into a small data wrapper (query + `<QueryStatus>`) and a typed view component that receives the loaded data (see `CourseDetail`, `Player`, `Dashboard`).
- Reuse before copying: the three checkout pages share `<CheckoutFlow>` (payment form, wallet pending / failed states via `useWalletCheckout`); pricing cards come from `planCards()` (`components/marketing/planCards.ts`) with prices from `constants/plans.ts`; marketing numbers come from `useCatalogStats()`, never hard-coded.
- Big pages are split by section (`pages/admin/sections/*`, `components/admin/course-editor/*`, `components/learner/settings/*`).
- Accessibility: icon-only buttons get `aria-label`; toggles are real switches/radios with `aria-checked`/`aria-pressed`; form errors use `role="alert"`; overlays use `useFocusTrap` (see `accessibility.md`).
- Icons are Material Symbols via `<Icon name="…" size={…} filled? />` (`filled` sets `FILL 1`). The font is a subset: add every new icon name to `icon_names` in `index.html` (see `performance.md`).
