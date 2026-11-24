import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { orders } from "@/api/mock/db/commerce";
import OrderHistory from "@/components/billing/OrderHistory";
import NotificationsMenu from "@/components/learner/NotificationsMenu";
import Certificates from "@/pages/dashboard/Certificates";
import OrderReceipt from "@/pages/marketing/OrderReceipt";
import PlanCheckout from "@/pages/marketing/PlanCheckout";
import { authService } from "@/services/authService";
import { checkoutService } from "@/services/checkoutService";
import { useAuthStore } from "@/stores/authStore";
import { renderWithProviders } from "@/test/render";
import type { OrderRecord } from "@/types/commerce";

const CARD = { method: "Card", cardName: "Test", cardNumber: "4242 4242 4242 4242", expiry: "12 / 30", cvc: "123" } as const;

beforeEach(async () => {
  useAuthStore.getState().setSession(await authService.login("hasibulx26@gmail.com", "password123"));
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

describe("<Certificates />", () => {
  it("lists the learner's certificates", async () => {
    renderWithProviders(<Certificates />, { route: "/certificates", path: "/certificates" });
    expect(await screen.findByText("SQL From Query to Model")).toBeInTheDocument();
    expect(screen.getByText("BXN-2026-SQ-08412")).toBeInTheDocument();
    expect(screen.getByText("2 certificates earned")).toBeInTheDocument();
  });

  it("shows the empty state for a learner without certificates", async () => {
    await authService.register("Fresh", "fresh@mail.com", "password123");
    useAuthStore.getState().setSession(await authService.verifyOtp("fresh@mail.com", "123456"));
    renderWithProviders(<Certificates />, { route: "/certificates", path: "/certificates" });
    expect(await screen.findByRole("heading", { name: "No certificates yet" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go Pro" })).toHaveAttribute("href", "/checkout/plan/pro");
  });
});

describe("<NotificationsMenu />", () => {
  it("opens the list, shows unread state and marks all read", async () => {
    const user = userEvent.setup();
    renderWithProviders(<NotificationsMenu />);
    const bell = await screen.findByRole("button", { name: /Notifications \(\d+ unread\)/ });
    await user.click(bell);
    const panel = screen.getByRole("dialog", { name: "Notifications" });
    expect(within(panel).getByText("Project approved")).toBeInTheDocument();
    expect(within(panel).getAllByLabelText("Unread").length).toBeGreaterThan(0);
    await user.click(within(panel).getByRole("button", { name: "Mark all read" }));
    await waitFor(() => expect(within(panel).queryAllByLabelText("Unread")).toHaveLength(0));
    expect(screen.getByRole("button", { name: "Notifications" })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("<PlanCheckout />", () => {
  it("switches the cycle and pays for Pro by card", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PlanCheckout />, { route: "/checkout/plan/pro", path: "/checkout/plan/:plan", stubs: ["/orders/:orderId"] });
    expect(await screen.findByRole("button", { name: "Pay ৳1,900" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Yearly/ }));
    expect(screen.getByRole("button", { name: "Pay ৳16,800" })).toBeInTheDocument();
    await user.type(screen.getByLabelText("Name on card"), "Test User");
    await user.type(screen.getByLabelText("Card number"), "4242424242424242");
    await user.type(screen.getByLabelText("Expiry"), "1230");
    await user.type(screen.getByLabelText("CVC"), "123");
    await user.click(screen.getByRole("button", { name: "Pay ৳16,800" }));
    expect(await screen.findByText(/Stub: \/orders\/:orderId \/orders\/ORD-/)).toBeInTheDocument();
  });

  it("tells a Pro member they are already on Pro", async () => {
    await checkoutService.placePlanOrder("monthly", CARD);
    renderWithProviders(<PlanCheckout />, { route: "/checkout/plan/pro", path: "/checkout/plan/:plan" });
    expect(await screen.findByRole("heading", { name: "You're already on Pro" })).toBeInTheDocument();
  });

  it("sends Teams to the contact form", () => {
    renderWithProviders(<PlanCheckout />, { route: "/checkout/plan/teams", path: "/checkout/plan/:plan" });
    expect(screen.getByRole("link", { name: /Talk to us/ })).toHaveAttribute("href", "/contact?topic=teams");
  });
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
