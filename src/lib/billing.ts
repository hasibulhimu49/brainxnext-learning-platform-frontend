import { REFUND_WINDOW_DAYS } from "@/constants/plans";
import type { OrderRecord } from "@/types/commerce";
import { daysBetween } from "./dates";

/** Paid course / plan orders can be refunded within the guarantee window (the server checks again). */
export const canRequestRefund = (o: OrderRecord, now = Date.now()) =>
  o.status === "paid" && o.kind !== "donation" && daysBetween(o.createdAt, now) < REFUND_WINDOW_DAYS;
