# Deployment

The app is a static single-page app: `npm run build` produces `dist/` (HTML, hashed JS/CSS, images) that any static host or CDN can serve.

## Build

Node.js 20.19 or newer (`engines` in `package.json`).

```bash
npm ci
npm run typecheck && npm run lint && npm test   # must pass before deploying
npm run build                                     # tsc -b && vite build → dist/
npm run preview                                   # serve dist/ locally on :4173 to check it
```

## Environment variables

Vite inlines `VITE_*` variables **at build time** — rebuild after changing them. See `.env.example`:

| Variable | Production value |
| --- | --- |
| `VITE_API_BASE_URL` | the real API base, e.g. `https://api.brainxnext.com/api/v1` |
| `VITE_USE_MOCK_API` | `false` — never ship the mock API to production (the build then leaves the mock chunk out) |
| `VITE_OPEN_ADMIN` | `false` — the admin demo mode is already off when the mock is off; set it anyway so the intent is explicit |

Never put secrets in `VITE_*` variables; everything in them is visible in the browser bundle. Keep real values in the host's environment settings, not in committed `.env` files.

## Hosting requirements

- **SPA fallback:** every unknown path must serve `index.html` so React Router can handle `/courses/java-generics`, `/settings/billing`, etc. (Netlify `_redirects`: `/* /index.html 200`; Vercel rewrite to `/index.html` — already set in `vercel.json` (real files like `/assets/*` and `/favicon.ico` are still served first); Nginx `try_files $uri /index.html;`).
- **Caching:** `assets/*` files are content-hashed — cache them for a year (`Cache-Control: public, max-age=31536000, immutable`). Serve `index.html` with `no-cache` so new releases are picked up.
- **HTTPS** everywhere; enable gzip/brotli compression.
- **CORS:** the API must allow the site's origin (or serve both from the same domain behind a reverse proxy at `/api/v1`).

## Environments

| Environment | Branch | API |
| --- | --- | --- |
| Local | any | mock API (default) or local backend |
| Staging | `develop` (proposed) | staging API, `VITE_USE_MOCK_API=false`, `VITE_OPEN_ADMIN=false` |
| Production | `main` | production API, `VITE_USE_MOCK_API=false`, `VITE_OPEN_ADMIN=false` |

## CI (to set up)

On every pull request: `npm ci`, typecheck, lint, `format:check`, unit tests, build, then `npm run test:e2e`. Deploy only from a green `main` build. Roll back by redeploying the previous build.

No hosting provider has been chosen yet — record the choice and its config file here when it is.
