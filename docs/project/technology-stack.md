# Technology stack

| Concern | Choice |
| --- | --- |
| Framework | React 19, Vite 8 |
| Language | TypeScript 6, `strict` + `noUncheckedIndexedAccess` |
| Routing | React Router 7 (route tree in `src/routes/AppRoutes.tsx`, lazy pages) |
| Styling | Tailwind CSS 4, shadcn/ui (Radix primitives), Material Symbols icons |
| HTTP | Axios, one client in `src/api/client.ts` |
| Server state | TanStack Query 5 (+ Devtools in dev) |
| Client state | Zustand 5 |
| Forms | React Hook Form 7 + Zod 4 (`@hookform/resolvers`) |
| Unit / component tests | Vitest 5, React Testing Library, jsdom |
| End-to-end tests | Playwright (Chromium desktop + Pixel 7) |
| Quality | ESLint (typescript-eslint strict), Prettier (+ tailwind plugin) |

Environment variables are documented in `.env.example`.
