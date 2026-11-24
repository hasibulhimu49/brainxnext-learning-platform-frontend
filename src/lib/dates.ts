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
