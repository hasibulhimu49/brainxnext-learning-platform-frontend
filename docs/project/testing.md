# Testing

## Unit and component tests — Vitest + React Testing Library

- Files: `*.test.ts(x)` next to the code. Run `npm test` (or `npm run test:watch`).
- Environment: jsdom; setup in `src/test/setup.ts` resets localStorage, mock users and the auth store before each test.
- Render pages with `renderWithProviders(<Page />, { route, path })` from `src/test/render.tsx` (fresh QueryClient without retries + MemoryRouter).
- Tests run against the mock API through the real Axios client, so the envelope handling is exercised too.
- Query by role/label/text the user sees; use `userEvent` for interaction.

Current suites: envelope parsing, API client + interceptors, Zod schemas, Login page, Catalog page.

## End-to-end — Playwright

- Specs in `e2e/`. Run `npm run test:e2e` (builds and serves the app on port 4173). First time: `npx playwright install chromium`.
- Projects: Desktop Chrome and Pixel 7.
- Critical flows covered: log in → dashboard, wrong password, sign up → OTP → dashboard, catalog search → course → enroll → player, checkout with promo + bKash. `smoke.spec.ts` opens every route and fails on runtime or console errors.

Add an e2e test whenever a new critical flow ships (payments, enrolment, auth).
