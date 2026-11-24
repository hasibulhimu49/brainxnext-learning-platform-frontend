import { z } from "zod";
import { DIGEST_OPTIONS } from "@/types/account";

/** /learn/:courseId/project — mentor review submission. */
export const projectSubmissionSchema = z.object({
  title: z.string().trim().min(3, "Give your project a short title").max(80, "Keep the title under 80 characters"),
  repoUrl: z
    .string()
    .trim()
    .min(1, "Paste the link to your repository")
    .pipe(z.url({ protocol: /^https?$/, message: "Enter a full link, e.g. https://github.com/you/project" })),
  notes: z.string().trim().max(1000, "Keep notes under 1,000 characters"),
});
export type ProjectSubmissionValues = z.infer<typeof projectSubmissionSchema>;

/** Settings → Billing → Request a refund. */
export const refundRequestSchema = z.object({
  reason: z.string().trim().min(10, "Tell us a little more (at least 10 characters)").max(500, "Keep it under 500 characters"),
});
export type RefundRequestValues = z.infer<typeof refundRequestSchema>;

/** PATCH /me/preferences — every field optional (send only what changed). */
export const preferencesSchema = z
  .object({
    courseUpdates: z.boolean(),
    assignments: z.boolean(),
    recommendations: z.boolean(),
    community: z.boolean(),
    digest: z.enum(DIGEST_OPTIONS),
    desktop: z.boolean(),
  })
  .partial();
export type PreferencesPatch = z.infer<typeof preferencesSchema>;
