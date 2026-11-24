import { z } from "zod";

/** Admin dialogs and review forms (F-002 Phase 3). */

/* ---------------- promo codes ---------------- */

/** Form values are strings (inputs); `toPromoInput` converts them for the API. */
export const promoSchema = z.object({
  code: z
    .string()
    .trim()
    .transform((v) => v.toUpperCase())
    .pipe(z.string().regex(/^[A-Z0-9]{4,16}$/, "4–16 letters or digits, no spaces")),
  percentOff: z
    .string()
    .trim()
    .regex(/^\d{1,2}$/, "Enter a whole number from 1 to 90")
    .refine((v) => Number(v) >= 1 && Number(v) <= 90, "Enter a whole number from 1 to 90"),
  /** yyyy-mm-dd from <input type="date">, or empty for no expiry */
  expiresAt: z.union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a valid date")]),
  /** empty = unlimited */
  usageLimit: z.union([
    z.literal(""),
    z
      .string()
      .trim()
      .regex(/^\d{1,6}$/, "Enter a whole number")
      .refine((v) => Number(v) >= 1, "At least 1 use"),
  ]),
});
export type PromoFormInput = z.input<typeof promoSchema>;
export type PromoFormValues = z.output<typeof promoSchema>;

export interface PromoInput {
  code: string;
  percentOff: number;
  expiresAt: string | null;
  usageLimit: number | null;
}

export const toPromoInput = (v: PromoFormValues): PromoInput => ({
  code: v.code,
  percentOff: Number(v.percentOff),
  expiresAt: v.expiresAt || null,
  usageLimit: v.usageLimit ? Number(v.usageLimit) : null,
});

/* ---------------- reviews of learner work ---------------- */

export const FEEDBACK_MIN = 20;

export const feedbackSchema = z.object({
  feedback: z
    .string()
    .trim()
    .min(FEEDBACK_MIN, `Write at least ${FEEDBACK_MIN} characters of feedback`)
    .max(2000, "Keep it under 2,000 characters"),
});
export type FeedbackValues = z.infer<typeof feedbackSchema>;

/* ---------------- payments ---------------- */

/** Reason for refunding, or for rejecting a learner's refund request. */
export const refundSchema = z.object({
  reason: z.string().trim().min(5, "Give a short reason (at least 5 characters)").max(300, "Keep it under 300 characters"),
});
export type RefundValues = z.infer<typeof refundSchema>;

/* ---------------- replies (reviews, inbox) ---------------- */

export const replySchema = z.object({
  message: z.string().trim().min(2, "Write a reply").max(2000, "Keep it under 2,000 characters"),
});
export type ReplyValues = z.infer<typeof replySchema>;

/* ---------------- students ---------------- */

export const STUDENT_PLANS = ["free", "pro", "teams"] as const;

export const addStudentSchema = z.object({
  name: z.string().trim().min(2, "Enter the student's name"),
  email: z.email("Enter a valid email address"),
  plan: z.enum(STUDENT_PLANS),
});
export type AddStudentValues = z.infer<typeof addStudentSchema>;

export const grantCourseSchema = z.object({
  courseId: z.string().min(1, "Choose a course"),
});
export type GrantCourseValues = z.infer<typeof grantCourseSchema>;

/* ---------------- notes / handbooks ---------------- */

export const NOTE_TYPES = ["PDF", "DOC"] as const;

export const noteSchema = z.object({
  name: z.string().trim().min(3, "Give the note a title"),
  category: z.string().trim().min(2, "Enter a category"),
  type: z.enum(NOTE_TYPES),
  pages: z
    .string()
    .trim()
    .regex(/^\d{1,4}$/, "Enter the page count")
    .refine((v) => Number(v) >= 1, "At least 1 page"),
  status: z.enum(["published", "draft"]),
});
export type NoteValues = z.infer<typeof noteSchema>;

/** Uploaded handbook file: PDF only, up to 50 MB. */
export const MAX_NOTE_BYTES = 50 * 1024 * 1024;
export const noteFileSchema = z.object({
  name: z.string().regex(/\.pdf$/i, "Choose a PDF file"),
  size: z.number().max(MAX_NOTE_BYTES, "The file must be 50 MB or smaller"),
});
