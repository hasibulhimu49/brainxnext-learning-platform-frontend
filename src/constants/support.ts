/** Contribution amounts (৳, whole numbers) offered on /support; /thank-you only accepts these. */
export const SUPPORT_AMOUNTS = [49, 69, 99, 149, 499, 999, 1999] as const;

/** "99" → 99; anything not in SUPPORT_AMOUNTS → null */
export const parseSupportAmount = (value: string | null): number | null => {
  if (!value || !/^\d+$/.test(value)) return null;
  const n = Number(value);
  return (SUPPORT_AMOUNTS as readonly number[]).includes(n) ? n : null;
};
