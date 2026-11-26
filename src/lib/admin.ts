import type { OrderRecord } from "@/types/commerce";

/** Helpers shared by the admin screens. Their date formatting lives in `@/lib/dates` (`*GB`). */

/** 1536 → "1.5 KB" */
export const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/** Case-insensitive "any field contains q". */
export const matches = (q: string, ...fields: (string | number | null | undefined)[]) => {
  const query = q.trim().toLowerCase();
  return !query || fields.join(" ").toLowerCase().includes(query);
};

/** Hours left before the review SLA runs out (negative = overdue). */
export const slaHoursLeft = (submittedAt: string, slaHours: number, now = Date.now()) =>
  Math.round((new Date(submittedAt).getTime() + slaHours * 3600_000 - now) / 3600_000);

/** Paid orders (and ones with a pending refund request) can be refunded. */
export const isRefundable = (o: OrderRecord) => o.status === "paid" || o.status === "refund_requested";
