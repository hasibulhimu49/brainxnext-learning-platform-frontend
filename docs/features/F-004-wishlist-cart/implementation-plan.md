# F-004 implementation plan

## State ownership (CLAUDE.md §4)

There is no backend contract for wishlist or cart, so both are **client-side state** in one new
Zustand store, `src/stores/shopStore.ts` (persisted as `bx-shop`), documented in `CLAUDE.md` and
`docs/project/state-management.md`:

- `wishlist: string[]` (course ids) — `toggleWishlist(id)`, `isWishlisted(id)`
- `cart: string[]` (course ids) — `addToCart(id)`, `removeFromCart(id)`, `clearCart()`
- Only ids are stored; course data comes from the existing catalog query (no server state copied).
- Owned/free/Pro-included courses are filtered out when the cart is read (enrolments come from TanStack Query).

When the backend documents wishlist/cart endpoints, the store is replaced by queries + services.

## UI

| Where | Change |
| --- | --- |
| `CourseCard` (home + catalog) | heart button (top-right of the cover), `aria-pressed` |
| `BuyCard` (course page) | heart button + "Add to cart" / "In cart — view cart" under the primary action, paid courses only |
| Navbar | cart icon with item count badge (public + app variants, mobile too) |
| `/wishlist` (new, public) | grid of saved courses, empty state → "Browse courses" |
| `/cart` (new, public) | list with remove, subtotal, promo code, total in ৳ → "Checkout" (login required, `?next=/cart`) |
| `/checkout/cart` (new, auth) | same payment form as course checkout (card / bKash / Nagad, wallet approval) |
| Receipt `/orders/:id` | shows each course line |
| Dashboard | "Wishlist" quick link |

## Data / mock API (provisional, marked in api-guidelines.md)

- `POST /checkout/orders` gets `kind: "cart"` with `courseIds: string[]`. One order record with an
  `items: { courseId, title, price }[]` field (optional on `OrderRecord`); paying enrols every course.
- Promo applies to the cart subtotal. Admin payments list shows "3 courses" for cart orders.

## Validation

- Cart can't be empty at checkout; items that became owned are dropped with a notice.

## Testing

- Unit: store (toggle, dedupe, persistence), cart filtering, mock cart order enrols all courses.
- E2E: heart a course → appears on /wishlist; add two paid courses → cart total → pay → both enrolled.

## Files

New: `stores/shopStore.ts`, `pages/marketing/{Wishlist,Cart,CartCheckout}.tsx`, `components/course/WishlistButton.tsx`,
`components/common/CartButton.tsx`. Changed: `CourseCard`, `BuyCard`, `Navbar`, `AppRoutes`, `checkoutService`,
mock `routes/checkout.ts`, `types/commerce.ts`, `OrderReceipt`, admin payments row label, docs.
