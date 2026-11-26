import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * Wishlist and cart (F-004) — owned by this store, persisted in the browser as `bx-shop`.
 * Client-side only because the backend has no wishlist/cart API yet; replace with queries once it does.
 * Holds course ids only: course data comes from the catalog query, ownership from the enrolments query
 * (see `useCart` in src/hooks/useCart.ts), so no server state is copied here.
 * Guests can use both; checkout asks them to log in.
 */
interface ShopState {
  wishlist: string[];
  cart: string[];
  toggleWishlist: (courseId: string) => void;
  addToCart: (courseId: string) => void;
  removeFromCart: (courseId: string) => void;
  /** drop several ids at once (bought, or no longer buyable) */
  removeManyFromCart: (courseIds: string[]) => void;
  clearCart: () => void;
}

export const SHOP_STORAGE_KEY = "bx-shop";

export const useShopStore = create<ShopState>()(
  persist(
    (set) => ({
      wishlist: [],
      cart: [],
      toggleWishlist: (id) =>
        set((s) => ({ wishlist: s.wishlist.includes(id) ? s.wishlist.filter((x) => x !== id) : [id, ...s.wishlist] })),
      addToCart: (id) => set((s) => (s.cart.includes(id) ? s : { cart: [...s.cart, id] })),
      removeFromCart: (id) => set((s) => ({ cart: s.cart.filter((x) => x !== id) })),
      removeManyFromCart: (ids) => set((s) => ({ cart: s.cart.filter((x) => !ids.includes(x)) })),
      clearCart: () => set({ cart: [] }),
    }),
    { name: SHOP_STORAGE_KEY, storage: createJSONStorage(() => localStorage), partialize: (s) => ({ wishlist: s.wishlist, cart: s.cart }) }
  )
);

export const useIsWishlisted = (courseId: string) => useShopStore((s) => s.wishlist.includes(courseId));
export const useInCart = (courseId: string) => useShopStore((s) => s.cart.includes(courseId));
export const useCartCount = () => useShopStore((s) => s.cart.length);
