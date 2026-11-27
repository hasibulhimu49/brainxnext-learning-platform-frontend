# Data fetching

All server data goes through TanStack Query.

- **Reads**: `useQuery` hooks in `src/queries` (`useCourses`, `useCourse(id)`, `useDashboard`, `useAdminSection("students")`…).
- **Writes**: `useMutation` hooks (`useLogin`, `useUpdateProfile`, `usePlaceOrder`…). Update the cache in `onSuccess` (`setQueryData` / `invalidateQueries`) rather than holding results in local or global state.
- **Keys**: only from `src/queries/keys.ts`.
- **Rendering**: wrap query results in `<QueryStatus query={q}>{(data) => …}</QueryStatus>` for consistent loading and error (with retry) states.
- **Derived data** stays derived: e.g. `useCatalogStats()` (`src/components/marketing/useCatalogStats.ts`) counts courses, free courses and tracks from `useCourses`; `useCart()` and `usePathSteps()` join store ids / roadmap steps with the catalog and enrolment queries.
- **Defaults** (`src/lib/queryClient.ts`): `staleTime` 60 s, no refetch on window focus, no retries for 4xx, up to 2 retries otherwise, no mutation retries.
- **Session changes**: logging out clears the whole cache; an expired session or a new sign-in removes the `["me", …]` and `["admin", …]` queries (see `caching.md`).
