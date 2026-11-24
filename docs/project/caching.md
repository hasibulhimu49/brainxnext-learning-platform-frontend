# Caching

Server data is cached by TanStack Query only (see `data-fetching.md`): 60s `staleTime`, keys from `src/queries/keys.ts`, `["me", …]` queries removed on logout. Mutations update the cache in `onSuccess` (e.g. `useUpdateProfile` writes the saved profile with `setQueryData`).

localStorage holds client state only: `bxn-auth` (session) and `bx-theme` (theme). The mock API also persists sign-ups under `bxn-mock-users`; that key disappears with the mock.
