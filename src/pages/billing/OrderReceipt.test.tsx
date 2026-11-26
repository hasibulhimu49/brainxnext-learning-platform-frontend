import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { authService } from "@/services/authService";
import { checkoutService } from "@/services/checkoutService";
import { useAuthStore } from "@/stores/authStore";
import { renderWithProviders } from "@/test/render";
import OrderReceipt from "./OrderReceipt";

const CARD = { method: "Card", cardName: "Test", cardNumber: "4242 4242 4242 4242", expiry: "12 / 30", cvc: "123" } as const;

beforeEach(async () => {
  useAuthStore.getState().setSession(await authService.login("hasibulx26@gmail.com", "12345678"));
});

describe("<OrderReceipt />", () => {
  it("shows the receipt with totals and VAT", async () => {
    const order = await checkoutService.placeOrder("applied-ml", CARD, "LEARN20");
    renderWithProviders(<OrderReceipt />, { route: `/orders/${order.id}`, path: "/orders/:orderId" });
    expect(await screen.findByRole("heading", { name: "Payment successful!" })).toBeInTheDocument();
    expect(screen.getByText(order.id)).toBeInTheDocument();
    expect(screen.getByText("৳7,120")).toBeInTheDocument();
    expect(screen.getByText("−৳1,780")).toBeInTheDocument();
    expect(screen.getByText("VAT included")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Start learning now/ })).toHaveAttribute("href", "/learn/applied-ml");
  });

  it("shows not found for someone else's order", async () => {
    renderWithProviders(<OrderReceipt />, { route: "/orders/ORD-JS-8412", path: "/orders/:orderId" });
    expect(await screen.findByRole("heading", { name: "Order not found" })).toBeInTheDocument();
  });
});
