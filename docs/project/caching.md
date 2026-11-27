# Caching

Server data is cached by TanStack Query only (see `data-fetching.md`): 60 s `staleTime`, keys from `src/queries/keys.ts`. User-scoped data lives under `["me", …]` and admin data under `["admin", …]`:

- **Log out** → `queryClient.clear()` (everything).
- **Session expired (401) or a new sign-in** → `watchSessionChanges` (`src/queries/auth.ts`) removes the `me` and `admin` queries, so another user's data never shows from the cache.
- **Mutations** update the cache in `onSuccess` (e.g. `useUpdateProfile` writes the saved profile with `setQueryData`; a paid order runs `invalidateAfterOrder` in `src/queries/checkout.ts`, which refreshes enrolments, dashboard, subscription and certificates as needed).

Browser storage holds client state only: `bxn-auth` (session; localStorage, or sessionStorage without "Remember me"), `bx-theme` (theme) and `bx-shop` (wishlist and cart ids). The mock API persists its demo database under `bxn-mock-*` keys; those disappear with the mock. Storage key prefixes are kept as they are — renaming them would wipe every user's saved session, theme and cart.
