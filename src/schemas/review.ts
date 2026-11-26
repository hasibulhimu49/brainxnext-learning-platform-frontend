import { z } from "zod";

/** Course review form (F-006). */
export const reviewSchema = z.object({
  stars: z.number().int().min(1, "Pick a star rating").max(5),
  text: z.string().trim().min(20, "Write at least 20 characters so other learners know why").max(1000, "Keep it under 1000 characters"),
});

export type ReviewValues = z.infer<typeof reviewSchema>;
