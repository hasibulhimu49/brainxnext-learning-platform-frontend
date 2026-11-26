import { describe, expect, it } from "vitest";
import { SHOP_STORAGE_KEY, useShopStore } from "./shopStore";

describe("shopStore (F-004)", () => {
  it("toggles the wishlist, newest first", () => {
    const { toggleWishlist } = useShopStore.getState();
    toggleWishlist("a");
    toggleWishlist("b");
    expect(useShopStore.getState().wishlist).toEqual(["b", "a"]);
    toggleWishlist("a");
    expect(useShopStore.getState().wishlist).toEqual(["b"]);
  });

  it("keeps each course in the cart once and removes in bulk", () => {
    const s = useShopStore.getState();
    s.addToCart("a");
    s.addToCart("a");
    s.addToCart("b");
    s.addToCart("c");
    expect(useShopStore.getState().cart).toEqual(["a", "b", "c"]);
    useShopStore.getState().removeManyFromCart(["a", "c"]);
    expect(useShopStore.getState().cart).toEqual(["b"]);
    useShopStore.getState().clearCart();
    expect(useShopStore.getState().cart).toEqual([]);
  });

  it("persists ids in the browser", () => {
    useShopStore.getState().addToCart("x");
    expect(localStorage.getItem(SHOP_STORAGE_KEY)).toContain('"cart":["x"]');
  });
});
