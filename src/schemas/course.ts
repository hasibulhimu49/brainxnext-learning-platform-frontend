import { z } from "zod";
import { COURSE_CATEGORIES, COURSE_LEVELS } from "@/types/course";

export const COURSE_LANGUAGES = ["Bangla", "English"] as const;

const lessonSchema = z.object({
  title: z.string(),
  dur: z.string(),
});

const moduleSchema = z.object({
  title: z.string(),
  lessons: z.array(lessonSchema).min(1),
});

/** Everything the editor holds. Drafts may be incomplete, so only shapes are enforced here. */
export const courseDraftSchema = z.object({
  title: z.string(),
  blurb: z.string(),
  track: z.enum(COURSE_CATEGORIES),
  level: z.enum(COURSE_LEVELS),
  lang: z.enum(COURSE_LANGUAGES),
  pricing: z.enum(["free", "paid"]),
  /** whole BDT, up to ৳999,999 */
  price: z.string().regex(/^\d{0,6}$/),
  discount: z.string().regex(/^\d{0,2}$/),
  modules: z.array(moduleSchema).min(1),
});
export type CourseDraftValues = z.infer<typeof courseDraftSchema>;

/** Publishing requires a title, a description and at least one module with one titled class. */
export const coursePublishSchema = courseDraftSchema
  .extend({
    title: z.string().trim().min(1, "Add a course title"),
    blurb: z.string().trim().min(1, "Add a short description"),
  })
  .refine((v) => v.modules.some((m) => m.title.trim() && m.lessons.some((l) => l.title.trim())), {
    path: ["modules"],
    message: "Add at least one module with one class",
  })
  .refine((v) => v.pricing === "free" || Number(v.price) > 0, { path: ["price"], message: "Set a price for a paid course" });

export const emptyLesson = () => ({ title: "", dur: "" });
export const emptyModule = () => ({ title: "", lessons: [emptyLesson()] });

export const defaultCourseDraft: CourseDraftValues = {
  title: "",
  blurb: "",
  track: "Engineering",
  level: "Beginner",
  lang: "Bangla",
  pricing: "free",
  price: "4900",
  discount: "",
  modules: [emptyModule()],
};
