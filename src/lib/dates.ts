/** "2026-06-14T10:00:00.000Z" → "June 14, 2026" (UTC, so tests and the mock agree). */
export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

/** "2026-06-14T10:00:00.000Z" → "Jun 14, 2026" */
export const formatShortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

/** "3 days ago", "just now" — for notifications. */
export const timeAgo = (iso: string, now = Date.now()) => {
  const minutes = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60_000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} ${days === 1 ? "day" : "days"} ago`;
  return formatShortDate(iso);
};

/** Whole days between two instants (b − a). */
export const daysBetween = (a: string | number | Date, b: string | number | Date = Date.now()) =>
  Math.floor((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000);

/** Same day-of-month, `months` later (clamped to the month's last day). */
export const addMonths = (date: Date, months: number) => {
  const d = new Date(date);
  const day = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + months);
  const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, last));
  return d;
};

/*
 * Admin-panel formats (en-GB, "24 Nov 2026"). They differ from the learner-facing ones above on
 * purpose, and accept a missing date ("—").
 */

const dateFmtGB = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });
const dateTimeFmtGB = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const validIso = (iso: string | null | undefined): iso is string => !!iso && !Number.isNaN(new Date(iso).getTime());

/** "24 Nov 2026" */
export const formatDateGB = (iso: string | null | undefined) => (validIso(iso) ? dateFmtGB.format(new Date(iso)) : "—");

/** "24 Nov 2026, 09:36" */
export const formatDateTimeGB = (iso: string | null | undefined) => (validIso(iso) ? dateTimeFmtGB.format(new Date(iso)) : "—");

/** "just now", "12 min ago", "3 h ago", "Yesterday", "2 days ago", then the date. */
export const timeAgoGB = (iso: string | null | undefined, now = Date.now()) => {
  if (!validIso(iso)) return "—";
  const min = Math.round((now - new Date(iso).getTime()) / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  if (d < 7) return d === 1 ? "Yesterday" : `${d} days ago`;
  return formatDateGB(iso);
};
