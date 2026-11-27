import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { OrderRecord } from "@/types/commerce";
import WalletPending, { APPROVAL_SECONDS } from "./WalletPending";

const ORDER: OrderRecord = {
  id: "ORD-1",
  userEmail: "a@b.c",
  userName: "A",
  kind: "course",
  itemId: "applied-ml",
  itemTitle: "Applied Machine Learning",
  method: "bKash",
  subtotal: 8900,
  discount: 0,
  total: 8900,
  promoCode: null,
  status: "pending",
  createdAt: "2026-11-01T00:00:00.000Z",
  account: "•••• 5678",
};

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

const props = (onExpire: () => void, approving: boolean) => ({ order: ORDER, approving, onApprove: vi.fn(), onCancel: vi.fn(), onExpire });

describe("<WalletPending />", () => {
  it("expires once when the time runs out", () => {
    const onExpire = vi.fn();
    render(<WalletPending {...props(onExpire, false)} />);
    act(() => void vi.advanceTimersByTime((APPROVAL_SECONDS + 5) * 1000));
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it("doesn't expire while the approval is being checked", () => {
    const onExpire = vi.fn();
    const { rerender } = render(<WalletPending {...props(onExpire, false)} />);
    act(() => void vi.advanceTimersByTime((APPROVAL_SECONDS - 2) * 1000));
    rerender(<WalletPending {...props(onExpire, true)} />);
    act(() => void vi.advanceTimersByTime(60_000));
    expect(onExpire).not.toHaveBeenCalled();
  });
});
