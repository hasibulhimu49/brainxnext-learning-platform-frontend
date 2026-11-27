# BrainXNext Learning Platform - Frontend

The web frontend of BrainXNext, an online learning platform for learners in Bangladesh (prices in Taka, ৳). Learners browse courses, watch lessons, take quizzes and earn certificates; admins run courses, students, payments and support from an admin panel. Until the backend exists, the app runs against a built-in mock API.

## Features

- **Accounts:** sign up with email OTP, log in ("Remember me"), forgot / reset password, session-expiry handling, profile, email change, notification preferences, account deletion
- **Roles:** guest, student and admin, with route guards (the backend stays the authority)
- **Catalog and course pages:** search and filters, curriculum, reviews, free preview lessons open to guests
- **Learning:** video player with progress, module quizzes, project submission with mentor review, certificates with public verification (`/verify/:id`)
- **Career roadmaps:** guided course sequences (`/paths`)
- **Payments:** single-course, cart and Pro plan checkout (card, bKash, Nagad), promo codes, receipts, billing history, refund requests, donations for handbooks
- **Wishlist and cart** (stored in the browser)
- **Learner dashboard:** continue learning, my courses, my reviews, notifications
- **Next AI:** a chat assistant (demo answers from site content)
- **Admin panel:** overview, courses (create / edit / publish), students, reviews, notes, payments and refunds, submissions, promo codes, support inbox
- Light and dark theme, responsive down to 360px, WCAG 2.2 AA target

## Tech Stack

- React 19 + TypeScript (strict mode)
- Vite
- React Router v7 (lazy-loaded routes)
- Tailwind CSS v4 + shadcn/ui
- Axios (one centralized API client, common response envelope)
- TanStack Query (server state)
- Zustand (client state: auth session, theme, wishlist/cart)
- React Hook Form + Zod (forms and validation)
- Vitest + React Testing Library, Playwright (end-to-end)
- ESLint + Prettier

See [CLAUDE.md](CLAUDE.md) and [docs/project](docs/project) for the architecture rules, and [docs/features](docs/features) for each feature.

## Project Structure

```text
src/
├── api/          # Axios client, response envelope, config, mock API (adapter, routes/, db/)
├── services/     # one function per endpoint
├── queries/      # TanStack Query hooks + query keys
├── stores/       # Zustand stores (auth, ui, shop)
├── schemas/      # Zod schemas for forms and requests
├── types/        # API contract types
├── constants/    # UI copy and config (plans, legal, help, …)
├── hooks/        # shared hooks (useCart, useWalletCheckout, usePathSteps, …)
├── lib/          # pure helpers (utils, dates, billing, lessons, csv, admin)
├── components/   # ui/ (shadcn), common/, auth/, admin/, learner/, course/, player/,
│                 # checkout/, billing/, shop/, marketing/, assistant/
├── layouts/      # PublicLayout, AuthLayout, AdminLayout
├── pages/        # auth/, courses/, dashboard/, account/, certificates/, billing/, checkout/,
│                 # shop/, paths/, support/, marketing/, legal/, admin/, errors/, Home.tsx
├── routes/       # AppRoutes.tsx, guards, redirects
├── test/         # Vitest setup and helpers
├── App.tsx
└── main.tsx
e2e/              # Playwright tests
docs/             # project docs and feature docs
```

## Installation

Requires Node.js 20.19 or newer.

```bash
git clone https://github.com/hasibulhimu49/brainxnext-learning-platform-frontend.git
cd brainxnext-learning-platform-frontend
npm install
```

## Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## Build for Production

```bash
npm run build     # type-checks and builds to dist/
npm run preview   # serves dist/ on http://localhost:4173
```

See [docs/project/deployment.md](docs/project/deployment.md) for hosting.

## Environment Variables

Copy `.env.example` to `.env`:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_USE_MOCK_API=true
VITE_OPEN_ADMIN=true
```

- `VITE_USE_MOCK_API=true` (the default) runs the app against a built-in mock API that speaks the same response envelope as the backend. Set it to `false` to call `VITE_API_BASE_URL`; the mock is then left out of the build.
- `VITE_OPEN_ADMIN=true` (the default while the mock is on) lets anyone open `/admin` to try the admin panel. It is always off when the mock is off; set it to `false` to require an admin account.

Demo logins for the mock API:

| Role    | Email                  | Password     |
| ------- | ---------------------- | ------------ |
| Student | `hasibulx26@gmail.com` | `12345678`   |
| Admin   | `admin@brainxnext.com` | `admin12345` |

OTP `000000` simulates a wrong code (any other 6 digits work); promo code `LEARN20` gives 20% off.

## Available Scripts

| Command                | Description                                                                     |
| ---------------------- | ------------------------------------------------------------------------------- |
| `npm run dev`          | Starts the development server                                                   |
| `npm run build`        | Type-checks and builds for production                                           |
| `npm run preview`      | Previews the production build                                                   |
| `npm run typecheck`    | Runs the TypeScript compiler                                                    |
| `npm run lint`         | Runs ESLint                                                                     |
| `npm run format`       | Formats the code with Prettier                                                  |
| `npm run format:check` | Checks formatting without changing files                                        |
| `npm test`             | Runs unit and component tests (Vitest)                                          |
| `npm run test:watch`   | Runs Vitest in watch mode                                                       |
| `npm run test:e2e`     | Runs end-to-end tests (Playwright; first run `npx playwright install chromium`) |

## Contributing

Read [CLAUDE.md](CLAUDE.md) first. Create a feature folder in `docs/features/` from the template, get the implementation plan approved, then open a pull request. `npm run typecheck && npm run lint && npm test` must pass.

## License

Copyright © 2026 Mohammad Hasibul Hasan. All rights reserved.

## Author

**Mohammad Hasibul Hasan**

Backend Developer | Java | Spring Boot | React | PostgreSQL
