# Component guidelines

- **shadcn/ui first** for primitives: `Button`, `Input`, `Textarea`, `Label`, `Switch`, `Form` in `src/components/ui`. They are themed with the BrainXNext tokens; keep it that way when adding more (`npx shadcn@latest add …`, then restyle).
- **Shared components** in `src/components/common` (`Icon`, `Logo`, `Navbar`, `Footer`, `HeroBand`, `QueryStatus`…), feature components in `auth/`, `admin/`, `learner/`, `course/`, `player/`, `checkout/`, `billing/`, `shop/`, `marketing/`, `assistant/`.
- Components receive data as props or read it from query hooks; they never call services directly.
- Split pages into a small data wrapper (query + `<QueryStatus>`) and a typed view component that receives the loaded data (see `CourseDetail`, `Player`, `Dashboard`).
- Accessibility: icon-only buttons get `aria-label`; toggles are real switches/radios with `aria-checked`/`aria-pressed`; form errors use `role="alert"`.
- Icons are Material Symbols via `<Icon name="…" size={…} />`.
