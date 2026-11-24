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

## Rules

- **Don't add dependencies lightly.** Check the size (bundlephobia) and prefer what is already installed.
- **Images**
  - Import images from `src/assets` so Vite hashes them; keep photos ≤ 200 kB, around 1600 px wide for full-width heroes.
  - Prefer WebP/AVIF for new images.
  - Add `loading="lazy"` and `width`/`height` (or a fixed aspect-ratio box) to below-the-fold images to avoid layout shift.
- **Fonts**: Google Fonts with `preconnect` and `display=swap`; load only the weights in use (Plus Jakarta Sans 400–800, Sora 600–800, Material Symbols).
- **Rendering**
  - Keep state as local as possible so updates re-render small trees.
  - Use Zustand selectors (`useAuthStore((s) => s.user)`), not whole-store reads.
  - Memoise only measured hot spots (`useMemo` for filtered lists like the catalog).
- **Lists**: paginate or virtualise when a table could exceed ~100 rows (admin students and payments once the real API is connected).
- **Animations**: animate `transform`/`opacity` only, as the existing hover lifts and floats do.
- **Data**: fetch what the page needs; prefetch the course detail on hover only if it measurably helps.

## Known opportunities

- The large hero/notes photos (~250 kB each) could be converted to WebP.
- Material Symbols loads the full variable icon font; switch to a subset if icon usage stays small.
