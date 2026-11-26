import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import CourseCard from "@/components/course/CourseCard";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/stores/authStore";
import { useShopStore } from "@/stores/shopStore";
import { renderWithProviders } from "@/test/render";
import type { Course } from "@/types/course";
import Cart from "./Cart";
import Wishlist from "./Wishlist";

const COURSE = {
  id: "ux-research",
  cat: "Design",
  icon: "search",
  title: "UX Research in Five Days",
  blurb: "b",
  level: "Beginner",
  lessons: 20,
  hours: "5h",
  mentor: "M",
  free: false,
  price: 3900,
  grad: "#000",
} as Course;

describe("wishlist and cart (F-004)", () => {
  it("the heart on a course card saves and unsaves it", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CourseCard course={COURSE} />);
    await user.click(screen.getByRole("button", { name: "Save UX Research in Five Days to wishlist" }));
    expect(useShopStore.getState().wishlist).toEqual(["ux-research"]);
    expect(screen.getByRole("button", { name: "Remove UX Research in Five Days from wishlist" })).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("button", { name: "Remove UX Research in Five Days from wishlist" }));
    expect(useShopStore.getState().wishlist).toEqual([]);
  });

  it("shows saved courses and adds the paid ones to the cart", async () => {
    useShopStore.setState({ wishlist: ["ux-research", "java-generics"] });
    renderWithProviders(<Wishlist />, { route: "/wishlist" });
    expect(await screen.findByText("UX Research in Five Days")).toBeInTheDocument();
    expect(screen.getByText(/Generics in Java/)).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole("button", { name: "Add all to cart" }));
    expect(useShopStore.getState().cart).toEqual(["ux-research"]);
  });

  it("lists cart courses with the total and removes them", async () => {
    useShopStore.setState({ cart: ["modern-javascript", "ux-research"] });
    renderWithProviders(<Cart />, { route: "/cart" });
    const summary = (await screen.findByRole("heading", { name: "Summary" })).closest("aside") as HTMLElement;
    // original ৳8,900 + ৳7,900, the courses' own discounts, total and savings
    expect(within(summary).getByText("৳16,800")).toBeInTheDocument();
    expect(within(summary).getByText("−৳8,000")).toBeInTheDocument();
    expect(within(summary).getByText("৳8,800")).toBeInTheDocument();
    expect(within(summary).getByText("You save ৳8,000")).toBeInTheDocument();
    expect(within(summary).getByRole("link", { name: "Checkout" })).toHaveAttribute("href", "/checkout/cart");

    // a promo applied in the cart lowers the total and travels to checkout
    const user = userEvent.setup();
    await user.type(within(summary).getByLabelText("PROMO CODE"), "learn20");
    await user.click(within(summary).getByRole("button", { name: "Apply" }));
    expect(await within(summary).findByText("✓ LEARN20 applied — 20% off")).toBeInTheDocument();
    expect(within(summary).getByText("৳7,040")).toBeInTheDocument();
    expect(within(summary).getByRole("link", { name: "Checkout" })).toHaveAttribute("href", "/checkout/cart?promo=LEARN20");

    await user.click(screen.getByRole("button", { name: "Remove Modern JavaScript, Properly from cart" }));
    expect(useShopStore.getState().cart).toEqual(["ux-research"]);
    expect(within(summary).getByText("৳7,900")).toBeInTheDocument();
  });

  it("drops courses the learner already owns", async () => {
    useAuthStore.getState().setSession(await authService.login("hasibulx26@gmail.com", "12345678"));
    useShopStore.setState({ cart: ["sql-query-to-model", "ux-research"] });
    renderWithProviders(<Cart />, { route: "/cart" });
    expect(await screen.findByText("UX Research in Five Days")).toBeInTheDocument();
    expect(useShopStore.getState().cart).toEqual(["ux-research"]);
  });

  it("shows the empty state", async () => {
    renderWithProviders(<Cart />, { route: "/cart" });
    expect(await screen.findByText("Your cart is empty")).toBeInTheDocument();
  });
});
