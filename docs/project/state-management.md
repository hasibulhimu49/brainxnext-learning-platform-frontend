# State management

| Kind | Tool | Where |
| --- | --- | --- |
| Server state | TanStack Query | `src/queries` |
| Global client state | Zustand | `src/stores` |
| Local UI state | `useState` | the component |
| Toasts | `sonner` (its own store) | `toast("…")`; `<Toaster />` mounted once in `App.tsx` |
| Form state | React Hook Form | the form component |

**Never store API responses in Zustand.** If several components need the same server data, call the same query hook — the cache is shared.

## Stores and their owners

### `authStore` (`bxn-auth`)
- `token`, `user` (name, email, role), `pendingEmail`, `remember`; plus `sessionExpired` (not persisted).
- **Remember me:** a custom storage persists the session to `localStorage` when `remember` is true (default) and to `sessionStorage` (this tab only) when the box was unticked; the copy in the other storage is removed so only one exists.
- Written by: auth mutations in `src/queries/auth.ts` (incl. `useLogoutListener`, which runs `clearSession` after logout has navigated home), `useUpdateProfile` (keeps the name in sync), and the 401 interceptor (`expireSession` sets `sessionExpired`, so the guard adds `reason=expired`).
- `watchSessionChanges` (`src/queries/auth.ts`, subscribed in `useLogoutListener`) watches the store: when the session expires or a new user signs in it removes the cached `["me", …]` and `["admin", …]` queries.
- Read with selectors: `useSessionUser()`, `useIsSignedIn()`, or `useAuthStore((s) => s.pendingEmail)`.

### `uiStore` (`bx-theme` in localStorage)
- `theme`, `setTheme`, `toggleTheme`. Applies `data-theme` on `<html>`; `index.html` applies the saved theme before first paint.
- Read through `useTheme()`.

### `shopStore` (`bx-shop` in localStorage, F-004)

Wishlist and cart **course ids only** (`wishlist`, `cart`, `toggleWishlist`, `addToCart`, `removeFromCart`, `removeManyFromCart`, `clearCart`). Guests can use both. Course data, prices and ownership are server state: `useCart()` (`src/hooks/useCart.ts`) joins the ids with the catalog and enrolment queries and reports items that can no longer be bought (owned, free, gone), which the cart page drops. Paying a cart order removes its courses from the cart. Replace with queries once the backend documents wishlist/cart endpoints.

### Enrolments and progress
Server state (TanStack Query): `useEnrollments`, `useProgress(courseId)`, `useEnroll`, `useUpdateProgress` in `src/queries/learning.ts`, keys `["me", "enrollments"]` and `["me", "progress", courseId]`. Enrolling, buying or saving progress invalidates the enrolments, the dashboard and that course's progress; going Pro also refreshes certificates, dashboard and enrolments (`invalidateAfterOrder`). Logout clears the whole query cache.

### Reviews, quizzes, roadmaps (F-006 – F-008)
Server state: `["me", "reviews", courseId]`, `["me", "quizzes", courseId]`, `["quiz", courseId, module]`, `["paths"]` / `["paths", id]`. `usePathSteps()` derives each roadmap step's status from the catalog and enrolment queries.

### Billing, certificates, submissions, notifications (F-002 Phase 2)
All server state under `["me", …]` in `src/queries/keys.ts`: `subscription`, `orders` / `order(id)`, `certificates` / `myCertificate(id)`, `submissions`, `notifications`, `preferences` (plus the public `certificate(id)` lookup). Hooks: `src/queries/account.ts`, `checkout.ts`, `learning.ts`, `notifications.ts`.
- A placed or confirmed order writes itself to `order(id)` and invalidates orders, notifications and — by kind — the learning queries (course) or the subscription (plan).
- Saving progress also invalidates certificates and notifications (finishing a course can issue a certificate).
- `useIsPro()` and `useCourseExtras(courseId)` (Pro, or bought that course) are derived from the subscription and enrolment queries — nothing is copied into a store.
- The email change swaps in the new session through `authStore.setSession` and invalidates `["me"]`.
- Page-local state only: the wallet-checkout phase (`src/hooks/useWalletCheckout.ts`, used by `<CheckoutFlow>`), dialog open/close, the Next AI conversation, the My courses tab, and questions posted in the player's Discussion tab (no discussion endpoint yet, so they vanish on reload).
