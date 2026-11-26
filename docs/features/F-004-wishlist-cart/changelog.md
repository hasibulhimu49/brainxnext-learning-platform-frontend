# F-004 changelog

## 2026-11-26 — shipped

- `shopStore` (`bx-shop`) + `useCart`; heart on every course card and the course page; "Add to cart" / "In cart" on the course page.
- Navbar: cart icon with count (all sizes), wishlist heart (640–1000px and 1200px+; in the mobile menu on phones). On phones the theme toggle moved into the menu; under 400px navbar icon buttons are 36px so a 360px screen fits.
- Pages: `/wishlist` ("Add all to cart"), `/cart` (save for later, remove, total), `/checkout/cart` (card / bKash / Nagad, promo on the subtotal). Dashboard "My wishlist" card.
- Mock: `POST /checkout/orders` `kind: "cart"`; `OrderRecord.items`; receipt, admin payment list/detail show each course.
- Course cards: covers are now 16:9 so thumbnails show in full; 4 per row from 1240px, 3 from 1001px.
- Bug fix (all grids): Tailwind emits `sm:` after custom `min-[1001px]:` rules, so `sm:grid-cols-2` overrode the desktop columns in 8 grids (catalog, home, about, notes, certificates, footer…). Those now use `min-[640px]:`. Don't mix named and custom breakpoints on the same property.
- Tests: store, mock cart orders, pages (Vitest); `e2e/cart.spec.ts`; smoke + 360px checks include /wishlist and /cart.
