import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { orders } from "@/api/mock/db/commerce";
import { authService } from "@/services/authService";
import { checkoutService } from "@/services/checkoutService";
import { useAuthStore } from "@/stores/authStore";
import { renderWithProviders } from "@/test/render";
import type { OrderRecord } from "@/types/commerce";
import OrderHistory from "./OrderHistory";

const CARD = { method: "Card", cardName: "Test", cardNumber: "4242 4242 4242 4242", expiry: "12 / 30", cvc: "123" } as const;

beforeEach(async () => {
  useAuthStore.getState().setSession(await authService.login("hasibulx26@gmail.com", "12345678"));
});

describe("Pending wallet orders (Billing history)", () => {
  it("can be resumed on the approve screen, or cancelled", async () => {
    const user = userEvent.setup();
    const pending = await checkoutService.placeOrder("ux-research", { method: "bKash", walletNumber: "01712345678" });
    const list = orders.all().filter((o): o is OrderRecord => o.userEmail === "hasibulx26@gmail.com");
    renderWithProviders(<OrderHistory orders={list} />, { stubs: ["/orders/:orderId"] });

    await user.click(screen.getByRole("button", { name: "Finish paying for UX Research in Five Days" }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByRole("heading", { name: "Approve on your phone" })).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: "I've approved" }));
    await waitFor(() => expect(orders.all().find((o) => o.id === pending.id)?.status).toBe("paid"));
  }, 20_000);

  it("cancels a pending order", async () => {
    const user = userEvent.setup();
    const pending = await checkoutService.placeOrder("ux-research", { method: "Nagad", walletNumber: "01712345678" });
    const list = orders.all().filter((o): o is OrderRecord => o.userEmail === "hasibulx26@gmail.com");
    renderWithProviders(<OrderHistory orders={list} />);
    await user.click(screen.getByRole("button", { name: "Cancel the payment for UX Research in Five Days" }));
    await waitFor(() => expect(orders.all().find((o) => o.id === pending.id)?.status).toBe("failed"));
  }, 20_000);
});

describe("Refund dialog (Billing history)", () => {
  it("requires a reason and requests the refund", async () => {
    const user = userEvent.setup();
    const order = await checkoutService.placeOrder("applied-ml", CARD);
    const list = orders.all().filter((o): o is OrderRecord => o.userEmail === "hasibulx26@gmail.com");
    renderWithProviders(<OrderHistory orders={list} />);
    // only the fresh order is inside the 30-day window
    const buttons = screen.getAllByRole("button", { name: "Request refund" });
    expect(buttons).toHaveLength(1);
    await user.click(buttons[0] as HTMLElement);
    const dialog = screen.getByRole("dialog", { name: "Request a refund" });
    await user.click(within(dialog).getByRole("button", { name: "Request refund" }));
    expect(await within(dialog).findByText(/at least 10 characters/)).toBeInTheDocument();
    await user.type(within(dialog).getByLabelText("Reason"), "It was not what I expected");
    await user.click(within(dialog).getByRole("button", { name: "Request refund" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(orders.all().find((o) => o.id === order.id)?.status).toBe("refund_requested");
  });
});
