import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { CoverSource } from "@/types/course";

/** Merge Tailwind classes (shadcn/ui convention). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** CSS background for a course cover: the photo when present, otherwise the gradient. */
export const courseCover = (c: CoverSource) => (c.img ? `url("${c.img}") center/cover no-repeat` : c.grad);

/** "★★★★☆" for a 0–5 rating */
export const stars = (n: number) => "★".repeat(n) + "☆".repeat(Math.max(0, 5 - n));

export const plural = (n: number, word: string, suffix = "s") => `${n} ${word}${n === 1 ? "" : suffix}`;

const takaFormat = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

/** Whole Bangladeshi Taka with South-Asian (lakh) grouping: 4900 → "৳4,900", 124000 → "৳1,24,000". */
export const formatTaka = (amount: number) => `৳${takaFormat.format(Math.round(amount))}`;

/** Promo discount in whole Taka (shared by checkout and the mock API so they never disagree). */
export const discountFor = (price: number, percentOff: number) => Math.round((price * percentOff) / 100);
