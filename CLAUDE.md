# brainxnext Frontend - Claude Instructions

React 19 + TypeScript (strict) on Vite, React Router v7. Pixel-matched to the Figma exports (Light/Dark + `BrainXNext_*_Proper` screens).

## 1. General Rules

- Read relevant project documentation before modifying code.
- Do not invent backend APIs.
- Backend API documentation is the source of truth.
- Do not change architecture without approval.
- Do not introduce a new dependency without justification.
- Follow existing project conventions.
- Prefer simple solutions over unnecessary abstractions.

## 2. Before Coding

Always, before writing any code:

1. Understand the requirement.
2. Inspect existing architecture.
3. Read relevant documentation (feature docs and project docs).
4. Inspect existing implementation patterns.
5. Identify backend API dependencies.
6. Identify affected frontend features.
7. Identify state ownership.
8. Identify routing requirements.
9. Identify validation requirements.
10. Identify testing requirements.
11. Create implementation plan (create/update `docs/features/F-XXX-name/implementation-plan.md`).
12. STOP and request approval.

Project documentation lives in `docs/project/`. Each feature has a folder in `docs/features/` (`feature.md`, `implementation-plan.md`, `testing.md`, `review.md`, `changelog.md`) — start new ones by copying `docs/features/_template/` and add them to the index in `docs/features/README.md`. Backend API documentation is not in this repository yet — ask for it instead of guessing.

## 3. Backend Integration

- Base API path is /api/v1.
- Follow the backend response envelope.
- Always check success before reading data.
- Never assume undocumented fields.
- Never modify backend behavior from the frontend.

The base path is set by `VITE_API_BASE_URL` (default `/api/v1`, see `src/api/config.ts` and `.env.example`).

**About the mock API:** `src/api/mock` (on by default via `VITE_USE_MOCK_API`) stands in for the backend while there is none. `src/api/client.ts` loads it with a dynamic `import()`, so it is its own chunk and is left out of builds with `VITE_USE_MOCK_API=false`. Its endpoints, fields and error codes are **provisional placeholders, not backend documentation**. When the backend API docs arrive they win: update `src/types`, `src/services` and the mock to match them, and do not add new mock endpoints that the backend docs don't describe.

## 4. State Management

- Server state must not be duplicated unnecessarily in Zustand.
- Use TanStack Query for server state.
- Use Zustand only for genuine client-side state.
- Do not create global state when local component state is sufficient.

Current owners:

- **Server state** — TanStack Query hooks in `src/queries/*`; keys are centralised in `src/queries/keys.ts`.
- `src/stores/authStore.ts` — session token, signed-in user summary, pending sign-up email (persisted as `bxn-auth`). Written only by the auth mutations (`src/queries/auth.ts`), `useUpdateProfile` (name sync) and the 401 interceptor. When a session expires or another user signs in, `watchSessionChanges` (`src/queries/auth.ts`) removes the cached `me` / `admin` queries.
- `src/stores/uiStore.ts` — theme (persisted as `bx-theme`; `index.html` applies it before first paint).
- Page-local UI state (tabs, accordions, filters) stays in component state.
- `src/stores/shopStore.ts` — wishlist and cart course ids (persisted as `bx-shop`, F-004). Client-only until the backend has a wishlist/cart API; course data and ownership still come from queries (`src/hooks/useCart.ts`).

## 5. Components

- Prefer reusable components.
- Avoid huge components.
- Keep business logic out of presentational components.
- Do not create abstractions without a clear reuse case.

Conventions:

- shadcn/ui primitives live in `src/components/ui`, themed with the design tokens; shared components in `src/components/common` (incl. `FormFeedback` — `Alert`, `FieldError`, `SubmitButton`, `SuccessState` — and `useFocusTrap`), feature components in `auth/`, `admin/`, `learner/`, `course/`, `player/`, `checkout/`, `billing/`, `shop/`, `marketing/`, `assistant/`.
- Pages are split into a data wrapper (query + `<QueryStatus>`) and a typed view that receives the loaded data (see `CourseDetail`, `Player`, `Dashboard`).
- Styling: Tailwind CSS v4. Design tokens in `src/index.css` map to `bg-page`, `bg-surface`, `text-ink`, `text-muted`, `text-soft`, `border-line`, `bg-chip`. Accent text (`text-brand`, `text-teal`, `text-success`, `text-amber`, `text-danger`) uses contrast-safe colours per theme; `text-brand-solid` never switches (for fixed white chips). Add shadcn components with `npx shadcn@latest add <name>` (config: `components.json`) and restyle them to the tokens. `text-muted` is our secondary text colour, so don't use shadcn's `bg-muted` — use `bg-surface2`.

## 6. API Layer

- UI components must not directly call Axios/fetch.
- API calls belong in the designated API/data-access layer.
- API response types must be explicitly defined.
- Error handling must use the centralized API error strategy.

How this is implemented:

- **Client:** the single Axios instance in `src/api/client.ts`. ESLint blocks `axios` imports outside `src/api` and the global `fetch`.
- **Data-access layer:** endpoint functions in `src/services/*Service.ts`, wrapped by TanStack Query hooks in `src/queries/*`. Components only use the hooks.
- **Envelope:** `src/api/envelope.ts` — `{ success: true, data }` or `{ success: false, error: { code, message, details? } }`. `request()` / `api.get|post|put|patch|delete` check `success` before returning `data`; pass a Zod schema as the last argument to validate the payload at runtime.
- **Types:** every service function declares its response type (`api.get<CourseDetail>(...)`) from `src/types`.
- **Errors:** everything becomes an `ApiError` (`code`, `message`, `status`, `details`). Show `errorMessage(error)` to users, branch on `API_ERROR_CODES` (never on message text), render query failures with `<QueryStatus>`. A 401 clears the session automatically. See `docs/project/error-handling.md`.

## 7. Forms, Testing and Code Quality

- **Forms:** React Hook Form + Zod (`zodResolver`). Schemas live in `src/schemas/*`. Labelled forms use the shadcn `Form` components; auth cards use `AuthInput` + `FieldError` (from `components/common/FormFeedback`).
- **Testing:** Vitest + React Testing Library (`*.test.ts(x)` next to the code, `src/test/render.tsx` for providers). Playwright in `e2e/` for critical flows and the all-routes smoke test.
- **Code quality:** TypeScript `strict` (+ `noUncheckedIndexedAccess`), ESLint, Prettier. **No `any`** unless explicitly justified with an `eslint-disable-next-line` comment explaining why. Prefer `unknown` + narrowing.

## 8. Commands

```bash
npm run dev           # Vite dev server (mock API on by default)
npm run build         # tsc -b && vite build
npm run typecheck     # tsc -b
npm run lint          # ESLint (typescript-eslint strict)
npm run format        # Prettier (+ tailwind class sorting)
npm run format:check  # Prettier, check only (CI)
npm test              # Vitest + React Testing Library
npm run test:watch    # Vitest in watch mode
npm run test:e2e      # Playwright (builds + previews the app first)
```

Before finishing any change: `npm run typecheck && npm run lint && npm test`. Run `npm run test:e2e` when a critical flow changes (auth, catalog → course → enroll, checkout).

## 9. Layout

```
src/
  api/          client.ts (Axios), envelope.ts, config.ts, mock/ (adapter, http, routes/, db/ incl. curricula)
  services/     endpoint functions (only place besides api/ that talks to the client)
  queries/      TanStack Query hooks + keys
  stores/       Zustand stores (auth, ui, shop)
  schemas/      Zod schemas + form value types
  types/        domain types (API contracts)
  constants/    UI copy/config that is not server data
  hooks/        shared hooks (useCart, useWalletCheckout, usePathSteps, usePageTitle, useTheme)
  lib/          pure helpers (utils, dates, billing, lessons, csv, admin, queryClient)
  components/
    ui/         shadcn primitives
    common/     app-wide pieces (Navbar, Footer, Icon, QueryStatus, FormFeedback, …)
    auth/       AuthCard / AuthHeader / OrDivider, AuthInputs
    admin/      admin panel (AdminSidebar, DataTable, dialogs/, course-editor/)
    learner/    signed-in learner pieces (dashboard rows, certificates, notifications, settings/)
    course/  player/  checkout/ (CheckoutFlow, …)  billing/  shop/  assistant/   feature components
    marketing/  marketing pieces + planCards (pricing cards) + useCatalogStats (real catalog counts)
  layouts/      PublicLayout, AuthLayout, AdminLayout
  pages/        route screens, one folder per area:
                auth/ courses/ dashboard/ account/ certificates/ billing/ checkout/ shop/
                paths/ support/ marketing/ legal/ admin/ errors/ (+ Home.tsx)
  routes/       AppRoutes.tsx (React Router, lazy-loaded pages — not Next.js), guards, redirects
  test/         Vitest setup + render helper
e2e/            Playwright specs (+ helpers.ts: STUDENT/ADMIN, login, payByCard)
docs/project/   architecture & guideline docs
docs/features/  one folder per feature (F-XXX-name): feature, plan, testing, review, changelog
```

## 10. Design Fidelity

UI must match the Figma exports exactly (spacing, sizes, colours, breakpoints such as 1000/1080/960/640/560px). Images in `src/assets/images` are placeholders (the photos are WebP) — replace files in place, keeping names. Icons are a Material Symbols subset: every new `<Icon name="…">` must also be added to `icon_names` in `index.html`, or it renders as plain text. Prices come from one source, `src/constants/plans.ts`. Demo mode: while the mock API is on, `/admin` is open to everyone (`OPEN_ADMIN`, see `src/api/config.ts`; set `VITE_OPEN_ADMIN=false` to lock it). Demo logins for the mock API: `hasibulx26@gmail.com` / `12345678` (student), `admin@brainxnext.com` / `admin12345` (admin). OTP `000000` simulates a wrong code; promo `LEARN20` gives 20% off.
