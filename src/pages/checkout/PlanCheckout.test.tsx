import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { authService } from "@/services/authService";
import { checkoutService } from "@/services/checkoutService";
import { useAuthStore } from "@/stores/authStore";
import { renderWithProviders } from "@/test/render";
import PlanCheckout from "./PlanCheckout";

const CARD = { method: "Card", cardName: "Test", cardNumber: "4242 4242 4242 4242", expiry: "12 / 30", cvc: "123" } as const;

beforeEach(async () => {
  useAuthStore.getState().setSession(await authService.login("hasibulx26@gmail.com", "12345678"));
});

describe("<PlanCheckout />", () => {
  it("switches the cycle and pays for Pro by card", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PlanCheckout />, { route: "/checkout/plan/pro", path: "/checkout/plan/:plan", stubs: ["/orders/:orderId"] });
    expect(await screen.findByRole("button", { name: "Pay ৳1,900" }, { timeout: 10_000 })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Yearly/ }));
    expect(screen.getByRole("button", { name: "Pay ৳16,800" })).toBeInTheDocument();
    await user.type(screen.getByLabelText("Name on card"), "Test User");
    await user.type(screen.getByLabelText("Card number"), "4242424242424242");
    await user.type(screen.getByLabelText("Expiry"), "1230");
    await user.type(screen.getByLabelText("CVC"), "123");
    await user.click(screen.getByRole("button", { name: "Pay ৳16,800" }));
    expect(await screen.findByText(/Stub: \/orders\/:orderId \/orders\/ORD-/)).toBeInTheDocument();
  }, 20_000);

  it("tells a Pro member they are already on Pro", async () => {
    await checkoutService.placePlanOrder("monthly", CARD);
    renderWithProviders(<PlanCheckout />, { route: "/checkout/plan/pro", path: "/checkout/plan/:plan" });
    expect(await screen.findByRole("heading", { name: "You're already on Pro" })).toBeInTheDocument();
  }, 20_000);

  it("sends Teams to the contact form", () => {
    renderWithProviders(<PlanCheckout />, { route: "/checkout/plan/teams", path: "/checkout/plan/:plan" });
    expect(screen.getByRole("link", { name: /Talk to us/ })).toHaveAttribute("href", "/contact?topic=teams");
  });
});
