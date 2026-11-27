# Performance

## Budgets

| Metric | Target (mobile, 4G) |
| --- | --- |
| Largest Contentful Paint | < 2.5 s |
| Interaction to Next Paint | < 200 ms |
| Cumulative Layout Shift | < 0.1 |
| Initial JS (gzip) | keep the main chunk under ~150 kB |

Check with Lighthouse on `npm run preview` (not the dev server) and with `vite build` output sizes.

## What is already in place

- **Code splitting:** every page except `Home` is `React.lazy` in `AppRoutes.tsx`, behind one `<Suspense>` fallback.
- **Server cache:** TanStack Query with a 60 s `staleTime` and no refetch on window focus, so navigating back to a page does not refetch (see `data-fetching.md`).
- **Theme before paint:** `index.html` applies the saved theme inline, avoiding a light→dark flash.
- **Hashed assets** from Vite, so they can be cached long-term (see `deployment.md`).
- **Mock API on demand:** `src/api/client.ts` loads `src/api/mock/adapter` with a dynamic `import()` (started when the client module loads; requests sent earlier wait for it). The demo database is its own `adapter-*.js` chunk, and a `VITE_USE_MOCK_API=false` build does not emit it at all.
- **Icon font subset:** Material Symbols is requested with `icon_names=…` (fixed axes `opsz 20..48, wght 400..600, FILL 0..1, GRAD 0`), so only the glyphs the app uses are downloaded.
- **Route fallback height:** the lazy-route `<Suspense>` fallback is `min-h-screen`, so the footer does not jump when the page chunk arrives (CLS).

## Rules

- **Don't add dependencies lightly.** Check the size (bundlephobia) and prefer what is already installed.
- **Images**
  - Import images from `src/assets` so Vite hashes them; keep photos ≤ 200 kB, around 1600 px wide for full-width heroes.
  - Prefer WebP/AVIF for new images (the hero, notes and about photos are WebP).
  - Add `loading="lazy"` and `width`/`height` (or a fixed aspect-ratio box) to below-the-fold images to avoid layout shift.
- **Fonts**: Google Fonts with `preconnect` and `display=swap`; load only the weights in use (Plus Jakarta Sans 400–800, Sora 600–800, Material Symbols).
- **New icons must be added to the subset.** The Material Symbols URL in `index.html` lists every icon name in `icon_names` (alphabetical, comma-separated). An icon missing from the list renders as its ligature text (e.g. "school"). To regenerate the list: collect every quoted snake_case string in `src/**/*.{ts,tsx}` and intersect it with the official names list ([codepoints file](https://github.com/google/material-design-icons/tree/master/variablefont)); a few false positives (e.g. `csv`, `title`) are harmless (~1 kB each).
- **Icons in `public/`** are palette PNGs (`icon-512.png` ≤ 60 kB, 192/180 px ≈ 20 kB). Re-quantise if you replace them.
- **Rendering**
  - Keep state as local as possible so updates re-render small trees.
  - Use Zustand selectors (`useAuthStore((s) => s.user)`), not whole-store reads.
  - Memoise only measured hot spots (`useMemo` for filtered lists like the catalog).
- **Lists**: paginate or virtualise when a table could exceed ~100 rows (admin students and payments once the real API is connected).
- **Animations**: animate `transform`/`opacity` only, as the existing hover lifts and floats do.
- **Data**: fetch what the page needs; prefetch the course detail on hover only if it measurably helps.

## Measurements (F-009, workstream D)

Measured on `vite build` + `vite preview` (mock API on). JS numbers are from the HEAD tree before/after the change, so parallel feature work does not skew them.

| Metric | Before | After |
| --- | --- | --- |
| Initial JS (entry + modulepreload), gzip | 197.7 kB | 171.7 kB (170.0 kB with `VITE_USE_MOCK_API=false`) |
| Main `index-*.js` | 277.6 kB / 84.9 kB gzip | 279.7 kB / 85.8 kB gzip |
| Chunk holding the mock DB | `client-*.js` 239.1 kB / 77.2 kB gzip, preloaded on every page | `adapter-*.js` 74.4 kB / 24.9 kB gzip, loaded lazily; not emitted when the mock is off |
| Material Symbols woff2 | 3,132,820 B | ≈ 180 kB (subset) |
| Total font bytes, first visit | 3.19 MB | ≈ 0.23 MB |
| `public/icon-512.png` | 614 kB | 55 kB |
| `public/icon-192.png` | 101 kB | 23 kB |
| `public/apple-touch-icon.png` | 89 kB | 21 kB |
| `src/assets/images/logo.jpg` (256 → 128 px) | 31.5 kB | 8.4 kB |
| hero-study / notes-hero / about-team | 247 / 258 / 150 kB (JPG) | 115 / 114 / 72 kB (WebP, q 0.8) |

After the per-course curricula landed, the `adapter-*.js` chunk is ≈ 95 kB / 33 kB gzip (`npm run build`, 2026-11-27).

## Known opportunities

- The main chunk (~86 kB gzip) is dominated by React DOM and TanStack Query; `Home` and `AssistantWidget` are the largest app modules in it.
