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
| Session token, signed-in user summary, pending sign-up email | `stores/authStore.ts` | written only by auth mutations and the 401 interceptor |
| Theme | `stores/uiStore.ts` | persisted as `bx-theme` |
| Tabs, accordions, filters, form drafts | component state / React Hook Form | not global |

## Folders

See the layout in `CLAUDE.md`. Rule of thumb: `types/` are API contracts, `schemas/` are Zod validation (forms + mock request checks), `constants/` are UI copy that never comes from the server.

## Mock API

`src/api/mock` replaces the Axios adapter, so requests still go through interceptors and the envelope check. Handlers (`routes.ts`) return the same status codes and error codes the backend will. Seeded data lives in `mock/db`. Turn it off with `VITE_USE_MOCK_API=false`.
