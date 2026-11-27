import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { orders } from "@/api/mock/db/commerce";
import { authService } from "@/services/authService";
import { checkoutService } from "@/services/checkoutService";
import { useAuthStore } from "@/stores/authStore";
import { renderWithProviders } from "@/test/render";
import Checkout from "./Checkout";

const CARD = { method: "Card", cardName: "Test", cardNumber: "4242 4242 4242 4242", expiry: "12 / 30", cvc: "123" } as const;
const route = { route: "/checkout/applied-ml", path: "/checkout/:courseId", stubs: ["/orders/:orderId"] };

beforeEach(async () => {
  useAuthStore.getState().setSession(await authService.login("hasibulx26@gmail.com", "12345678"));
});

const fillCard = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText("Name on card"), "Test User");
  await user.type(screen.getByLabelText("Card number"), "4242424242424242");
  await user.type(screen.getByLabelText("Expiry"), "1230");
  await user.type(screen.getByLabelText("CVC"), "123");
};

describe("<Checkout /> (course)", () => {
  it("tells a Pro member the course is included instead of taking payment", async () => {
    await checkoutService.placePlanOrder("monthly", CARD);
    renderWithProviders(<Checkout />, route);
    expect(await screen.findByRole("heading", { name: "Included in your Pro plan" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Start learning/ })).toHaveAttribute("href", "/learn/applied-ml");
    expect(screen.queryByRole("button", { name: /^Pay/ })).not.toBeInTheDocument();
  }, 20_000);

  it("has a close link back to the course page", async () => {
    renderWithProviders(<Checkout />, route);
    await screen.findByRole("button", { name: "Pay ৳8,900" });
    expect(document.querySelector('a[href="/courses/applied-ml"]')).not.toBeNull();
  }, 20_000);

  it("applies a typed promo code when Pay is pressed", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Checkout />, route);
    await screen.findByRole("button", { name: "Pay ৳8,900" });
    await fillCard(user);
    await user.type(screen.getByLabelText("PROMO CODE"), "learn20");
    await user.click(screen.getByRole("button", { name: "Pay ৳8,900" }));
    expect(await screen.findByText(/Stub: \/orders\/:orderId/)).toBeInTheDocument();
    expect(orders.all()[0]).toMatchObject({ itemId: "applied-ml", promoCode: "LEARN20", total: 7120 });
  }, 20_000);

  it("blocks Pay when the typed promo code is invalid", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Checkout />, route);
    await screen.findByRole("button", { name: "Pay ৳8,900" });
    await fillCard(user);
    const before = orders.all().length;
    await user.type(screen.getByLabelText("PROMO CODE"), "NOPE");
    await user.click(screen.getByRole("button", { name: "Pay ৳8,900" }));
    expect(await screen.findByText(/isn't valid or has expired/)).toBeInTheDocument();
    expect(orders.all()).toHaveLength(before);
  }, 20_000);

  it("keeps the applied promo after a failed wallet payment", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Checkout />, route);
    await screen.findByRole("button", { name: "Pay ৳8,900" });
    await user.type(screen.getByLabelText("PROMO CODE"), "LEARN20");
    await user.click(screen.getByRole("button", { name: "Apply" }));
    expect(await screen.findByRole("button", { name: "Pay ৳7,120" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /bKash/ }));
    await user.type(screen.getByLabelText("bKash account number"), "01712340000");
    await user.click(screen.getByRole("button", { name: "Pay ৳7,120" }));
    await user.click(await screen.findByRole("button", { name: "I've approved" }));
    await user.click(await screen.findByRole("button", { name: "Try again" }));
    expect(await screen.findByRole("button", { name: "Pay ৳7,120" })).toBeInTheDocument();
    expect(screen.getByLabelText("PROMO CODE")).toHaveValue("LEARN20");
  }, 20_000);
});
