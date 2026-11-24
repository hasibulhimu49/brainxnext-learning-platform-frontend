# Data fetching

All server data goes through TanStack Query.

- **Reads**: `useQuery` hooks in `src/queries` (`useCourses`, `useCourse(id)`, `useDashboard`, `useAdminSection("students")`…).
- **Writes**: `useMutation` hooks (`useLogin`, `useUpdateProfile`, `usePlaceOrder`…). Update the cache in `onSuccess` (`setQueryData` / `invalidateQueries`) rather than holding results in local or global state.
- **Keys**: only from `src/queries/keys.ts`.
- **Rendering**: wrap query results in `<QueryStatus query={q}>{(data) => …}</QueryStatus>` for consistent loading and error (with retry) states.
- **Defaults** (`src/lib/queryClient.ts`): `staleTime` 60s, no refetch on window focus, no retries for 4xx, up to 2 retries otherwise, no mutation retries.
- Logging out calls `useLogout()`, which clears the session and removes every `["me", …]` query.
