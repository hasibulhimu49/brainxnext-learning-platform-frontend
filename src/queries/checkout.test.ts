import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import type { OrderRecord } from "@/types/commerce";
import { invalidateAfterOrder } from "./checkout";
import { queryKeys } from "./keys";

const order = (patch: Partial<OrderRecord>): OrderRecord => ({
  id: "ORD-1",
  userEmail: "a@b.c",
  userName: "A",
  kind: "plan",
  itemId: "pro",
  itemTitle: "Pro plan (monthly)",
  method: "Card",
  subtotal: 1900,
  discount: 0,
  total: 1900,
  promoCode: null,
  status: "paid",
  createdAt: "2026-11-01T00:00:00.000Z",
  ...patch,
});

const invalidated = async (o: OrderRecord) => {
  const qc = new QueryClient();
  const spy = vi.spyOn(qc, "invalidateQueries");
  await invalidateAfterOrder(qc, o);
  return spy.mock.calls.map(([filters]) => JSON.stringify(filters?.queryKey));
};

describe("invalidateAfterOrder", () => {
  it("going Pro refreshes the subscription, certificates, dashboard and enrolments", async () => {
    const keys = await invalidated(order({}));
    for (const key of [queryKeys.me.subscription, queryKeys.me.certificates, queryKeys.me.dashboard, queryKeys.me.enrollments]) {
      expect(keys).toContain(JSON.stringify(key));
    }
  });

  it("a course order refreshes that course's progress", async () => {
    const keys = await invalidated(order({ kind: "course", itemId: "applied-ml" }));
    expect(keys).toContain(JSON.stringify(queryKeys.me.progress("applied-ml")));
    expect(keys).not.toContain(JSON.stringify(queryKeys.me.subscription));
  });
});
