import { HELP_QUESTIONS } from "@/constants/help";
import { PRO_PRICE } from "@/constants/plans";
import { flattenLessons } from "@/lib/lessons";
import { formatTaka } from "@/lib/utils";
import type { AssistantCourseCard, AssistantReply } from "@/types/assistant";
import type { Course } from "@/types/course";
import { COURSES, CURRICULUM } from "../db/courses";
import { bodyOf, ok, str, type MockRequest, type MockRoute } from "../http";
import { findCourse } from "./catalog";
import { invalid } from "./shared";

/*
 * Next AI (F-005, PROVISIONAL). There is no backend or AI model yet, so this mock answers from
 * the site's own content: the catalog, plans and the Help Center questions. The real backend will
 * replace this route with a call to an AI model (the API key must stay on the server).
 */

const card = (c: Course): AssistantCourseCard => ({ id: c.id, title: c.title, price: c.price, free: c.free, level: c.level });

/** topic words → catalog search terms */
const TOPICS: [RegExp, string[]][] = [
  [/\bjava\b|generic/, ["java", "generics", "code smells"]],
  [/python|pandas|data analy/, ["python", "data"]],
  [/\bsql\b|database|query/, ["sql"]],
  [/javascript|\bjs\b|frontend|front-end|web dev/, ["javascript", "react"]],
  [/react/, ["react"]],
  [/design|figma|\bui\b|\bux\b|research/, ["design", "ux"]],
  [/machine learning|\bml\b|\bai\b|llm|prompt|gpt/, ["machine learning", "llm", "prompt"]],
  [/git|github|version control/, ["git"]],
  [/marketing|analytics|product/, ["analytics", "marketing"]],
  [/motion|animation/, ["motion"]],
  [/visuali[sz]|chart/, ["visualization"]],
];

const searchCourses = (terms: string[]) => {
  const hits = COURSES.filter((c) => terms.some((t) => `${c.title} ${c.blurb} ${c.cat}`.toLowerCase().includes(t)));
  // free first, then beginner-friendly
  return hits
    .sort((a, b) => Number(b.free) - Number(a.free) || Number(b.level === "Beginner") - Number(a.level === "Beginner"))
    .slice(0, 3);
};

/** Best Help Center answer by shared words, or undefined when nothing is close. */
const helpAnswer = (q: string) => {
  const words = new Set(q.split(/[^a-z0-9]+/).filter((w) => w.length > 3));
  let best: { score: number; a: string } | undefined;
  for (const h of HELP_QUESTIONS) {
    const score = h.q
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length > 3 && words.has(w)).length;
    if (score > 0 && (!best || score > best.score)) best = { score, a: h.a };
  }
  return best?.a;
};

const lessonContext = (courseId: string, lessonId: string): string | undefined => {
  const course = findCourse(courseId);
  const lesson = flattenLessons(CURRICULUM).find((l) => l.id === lessonId);
  if (!course || !lesson) return undefined;
  return `You're on “${lesson.lesson.title}” (Class ${lesson.number}) in ${course.title}.`;
};

export const answer = (question: string, ctx: { courseId?: string; lessonId?: string } = {}): AssistantReply => {
  const q = question.toLowerCase();

  if (/^(hi|hello|hey|salam|assalam|hlw)\b/.test(q)) {
    return {
      text: "Hi! I'm Next AI, BrainXNext's study assistant. Ask me which course to start, what Pro includes, how payments or refunds work — or about the lesson you're watching.",
    };
  }

  if (ctx.courseId && ctx.lessonId && /lesson|class|this|explain|stuck|understand|help me/.test(q)) {
    const where = lessonContext(ctx.courseId, ctx.lessonId);
    if (where) {
      return {
        text: `${where} Re-watch the part that confused you at 1.0× speed, try the exercise in the Resources tab, and post your question in the Discussion tab — mentors and classmates answer there. A real AI tutor that explains the lesson itself is coming once the backend is connected.`,
        links: [{ label: "Lesson resources", to: `/learn/${ctx.courseId}/${ctx.lessonId}` }],
      };
    }
  }

  if (/promo|coupon|discount|voucher|offer/.test(q)) {
    return {
      text: "Use the code LEARN20 at checkout for 20% off any paid course, cart or the Pro plan. Type it in the Promo code box above the Pay button and press Apply.",
      links: [{ label: "See pricing", to: "/pricing" }],
    };
  }

  if (/\bpro\b|plan|subscription|price|cost|how much|pricing/.test(q)) {
    return {
      text: `Pro is ${formatTaka(PRO_PRICE.monthly)}/month or ${formatTaka(PRO_PRICE.yearly)}/year. It unlocks every course, mentor review of your projects and certificates. Free accounts get all free courses forever. Prices include VAT; pay with bKash, Nagad or card.`,
      links: [
        { label: "Go Pro", to: "/checkout/plan/pro" },
        { label: "Compare plans", to: "/pricing" },
      ],
    };
  }

  const topic = TOPICS.find(([re]) => re.test(q));
  if (topic || /recommend|suggest|which course|start|begin|learn|course/.test(q)) {
    const courses = topic ? searchCourses(topic[1]) : COURSES.filter((c) => c.free && c.level === "Beginner").slice(0, 3);
    if (courses.length > 0) {
      return {
        text: topic
          ? "Here's where I'd start — free courses first, then the deeper paid ones:"
          : "New here? These free, beginner-friendly courses are a great first step:",
        courses: courses.map(card),
        links: [{ label: "Browse all courses", to: "/courses" }],
      };
    }
  }

  if (/human|support|contact|agent|talk to|email/.test(q)) {
    return {
      text: "You can reach the team through the contact form — we reply within one business day.",
      links: [{ label: "Contact us", to: "/contact" }],
    };
  }

  const help = helpAnswer(q);
  if (help) return { text: help, links: [{ label: "Help Center", to: "/help" }] };

  return {
    text: "I'm not sure about that one yet — I'm a demo assistant until the real AI is connected. Try asking about courses, Pro, payments, refunds or certificates, or contact the team.",
    links: [
      { label: "Help Center", to: "/help" },
      { label: "Contact us", to: "/contact" },
    ],
  };
};

const chat = (req: MockRequest) => {
  const b = bodyOf(req);
  const message = str(b.message).trim();
  if (!message) return invalid([{ path: ["message"], message: "Type a question" }]);
  if (message.length > 1000) return invalid([{ path: ["message"], message: "Keep it under 1000 characters" }]);
  const ctx = b.context && typeof b.context === "object" ? (b.context as Record<string, unknown>) : {};
  return ok(answer(message, { courseId: str(ctx.courseId) || undefined, lessonId: str(ctx.lessonId) || undefined }));
};

export const assistantRoutes: MockRoute[] = [{ method: "POST", path: "/assistant/chat", handler: chat }];
