import type { OrderRecord } from "@/types/commerce";

/** Display formatting shared by the admin screens (English, Asia/Dhaka-agnostic). */

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });
const dateTimeFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const valid = (iso: string | null | undefined): iso is string => !!iso && !Number.isNaN(new Date(iso).getTime());

/** "24 Nov 2026" */
export const formatDate = (iso: string | null | undefined) => (valid(iso) ? dateFmt.format(new Date(iso)) : "—");

/** "24 Nov 2026, 09:36" */
export const formatDateTime = (iso: string | null | undefined) => (valid(iso) ? dateTimeFmt.format(new Date(iso)) : "—");

/** "just now", "12 min ago", "3 h ago", "2 days ago", then the date. */
export const timeAgo = (iso: string | null | undefined, now = Date.now()) => {
  if (!valid(iso)) return "—";
  const min = Math.round((now - new Date(iso).getTime()) / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  if (d < 7) return d === 1 ? "Yesterday" : `${d} days ago`;
  return formatDate(iso);
};

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
