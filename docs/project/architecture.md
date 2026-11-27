# Architecture

A Vite + React 19 single-page app written in strict TypeScript, routed with React Router v7.

## Data flow

```
Page / component
  └─ TanStack Query hook          src/queries/*        (cache, loading, errors)
       └─ service function        src/services/*       (one function per endpoint)
            └─ api.get/post/...   src/api/client.ts    (Axios instance + interceptors)
                 └─ envelope      src/api/envelope.ts  (checks `success`, returns `data` or throws ApiError)
                      └─ HTTP     real backend, or src/api/mock when VITE_USE_MOCK_API=true
```

Components never import Axios or call `fetch`; ESLint enforces this.

## State ownership

| State | Owner | Notes |
| --- | --- | --- |
| Server data (courses, dashboard, admin tables, profile…) | TanStack Query | never copied into Zustand |
| Session token, signed-in user summary, pending sign-up email | `stores/authStore.ts` | written only by auth mutations, `useUpdateProfile` and the 401 interceptor; `watchSessionChanges` drops cached `me`/`admin` queries on expiry or a new sign-in |
| Theme | `stores/uiStore.ts` | persisted as `bx-theme` |
| Wishlist and cart course ids | `stores/shopStore.ts` | persisted as `bx-shop`; client-only until the backend has a cart API |
| Tabs, accordions, filters, form drafts | component state / React Hook Form | not global |

## Folders

Layer-based: `pages → queries → services → api`. The full tree is in `CLAUDE.md` §9. Rule of thumb: `types/` are API contracts, `schemas/` are Zod validation (forms + mock request checks), `constants/` are UI copy that never comes from the server, `lib/` holds pure helpers (dates, CSV, admin filters), `hooks/` shared hooks.

- **Pages** (`src/pages/<area>/`): `auth`, `courses` (catalog, course, player, quiz, project), `dashboard` (Dashboard, My courses, My reviews), `account` (Settings), `certificates` (list, single, public verify), `billing` (order receipt), `checkout` (course, cart, plan), `shop` (cart, wishlist), `paths`, `support` (support form, thank-you), `marketing`, `legal`, `admin`, `errors` (403 / 404 / 500).
- **Components** (`src/components/<area>/`): `ui` (shadcn), `common` (app-wide, incl. `FormFeedback` — `Alert`, `FieldError`, `SubmitButton`, `SuccessState`), `auth` (`AuthCard`, `AuthHeader`, `OrDivider`, inputs), `admin` (`AdminSidebar`, tables, `dialogs/`, `course-editor/`), `learner`, `course`, `player`, `checkout`, `billing`, `shop` (cart + wishlist buttons), `marketing`, `assistant`.
- **Tests** sit next to the code they cover (`Foo.test.tsx` beside `Foo.tsx`; mock API tests beside the route file, e.g. `mock/routes/orders.test.ts`). Playwright specs in `e2e/` are named by flow (`enroll-checkout`, `billing`, `cart`, `reviews-quizzes-paths`, …).

## Mock API

`src/api/mock` replaces the Axios adapter, so requests still go through interceptors and the envelope check. `client.ts` loads the adapter with a dynamic `import()`, so the mock and its demo database are a separate chunk that a `VITE_USE_MOCK_API=false` build does not emit. Handlers (`mock/routes/*.ts`) return the same status codes and error codes the backend will. Seeded data and lookups (e.g. `findCourse`, per-course curricula in `db/curricula.ts`) live in `mock/db`. Everything in the mock is provisional (CLAUDE.md §3).
