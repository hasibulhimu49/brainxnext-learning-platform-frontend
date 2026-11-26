import { expect, test, type Page } from "@playwright/test";
import { ADMIN, STUDENT, login } from "./helpers";

type Account = typeof STUDENT | null;

/** Every route renders its main heading without runtime or console errors (as a guest, student or admin). */
const ROUTES: [path: string, heading: RegExp, account: Account][] = [
  ["/", /Learn skills that/, null],
  ["/courses", /Explore all/, null],
  ["/courses/java-generics", /Generics in Java/, null],
  ["/notes", /Download/, null],
  ["/pricing", /Simple, honest/, null],
  ["/about", /Free where it counts/, null],
  ["/contact", /Get in/, null],
  ["/support", /Support Our Platform/, null],
  ["/thank-you?amount=99", /Thank you so much/, null],
  ["/thank-you?amount=99&handbook=python", /Thank you so much/, null],
  ["/support?handbook=java", /Support Our Platform/, null],
  ["/privacy", /Privacy Policy/, null],
  ["/terms", /Terms of Service/, null],
  ["/refunds", /Refund/, null],
  ["/help", /How can we/, null],
  ["/verify", /Verify a/, null],
  ["/wishlist", /My wishlist/, null],
  ["/cart", /My cart/, null],
  ["/paths", /Learning/, null],
  ["/paths/backend-developer", /Backend Developer/, null],
  ["/verify/BXN-2026-SQ-08412", /Verify a/, null],
  // no valid amount → back to /support
  ["/thank-you", /Support Our Platform/, null],
  ["/login", /Welcome back/, null],
  ["/register", /Create your account/, null],
  ["/forgot-password", /Forgot your password/, null],
  ["/reset-password", /This reset link isn't valid/, null],
  ["/reset-password?token=abc", /Set a new password/, null],
  // no pending sign-up → back to register
  ["/verify-otp", /Create your account/, null],
  // signed-in only → login
  ["/dashboard", /Welcome back/, null],
  ["/checkout", /Simple, honest/, null],
  ["/403", /This area is for admins/, null],
  ["/no-such-page", /This page skipped class/, null],

  ["/dashboard", /Welcome back, Mohammad/, STUDENT],
  ["/settings/notifications", /Mohammad Hasibul Hasan/, STUDENT],
  ["/settings/billing", /Mohammad Hasibul Hasan/, STUDENT],
  ["/learn", /super \(consumer\)/, STUDENT],
  ["/learn/java-generics/1-1", /Why generics exist/, STUDENT],
  ["/settings/account", /Mohammad Hasibul Hasan/, STUDENT],
  ["/dashboard/courses", /My courses/, STUDENT],
  ["/dashboard/reviews", /My reviews/, STUDENT],
  ["/certificates", /My certificates/, STUDENT],
  // old link → the list
  ["/certificate", /My certificates/, STUDENT],
  ["/certificates/BXN-2026-SQ-08412", /Share/, STUDENT],
  ["/certificates/BXN-0000-XX-00000", /Certificate not found/, STUDENT],
  ["/orders/ORD-PRO-0801", /Order|Payment/, STUDENT],
  ["/orders/ORD-JS-8412", /Order not found/, STUDENT],
  ["/learn/java-generics/project", /Mentor review is part of Pro/, STUDENT],
  ["/learn/java-generics/quiz/1", /Module 1 quiz/, STUDENT],
  ["/checkout/applied-ml", /Payment/, STUDENT],
  ["/checkout/plan/pro?cycle=yearly", /^Payment$/, STUDENT],
  ["/checkout/plan/teams", /Teams is set up with us/, STUDENT],
  // empty cart → back to the cart page
  ["/checkout/cart", /My cart/, STUDENT],
  // demo mode: the admin panel is open to everyone until the backend exists
  ["/admin", /Overview/, STUDENT],
  ["/admin", /Overview/, null],

  ["/admin", /Overview/, ADMIN],
  ["/admin/courses", /Courses/, ADMIN],
  ["/admin/students", /Students/, ADMIN],
  ["/admin/reviews", /Reviews/, ADMIN],
  ["/admin/payments", /Payments/, ADMIN],
  ["/admin/notes", /Notes/, ADMIN],
  ["/admin/courses/new", /Basics/, ADMIN],
];

const watchProblems = (page: Page) => {
  const problems: string[] = [];
  page.on("pageerror", (e) => problems.push(e.message));
  page.on("console", (m) => {
    // external icon CDNs may be blocked in CI; everything else must be clean
    if (m.type() === "error" && !m.text().includes("cdn.simpleicons.org")) problems.push(m.text());
  });
  return problems;
};

for (const [path, heading, account] of ROUTES) {
  const who = account === null ? "guest" : account === ADMIN ? "admin" : "student";
  test(`renders ${path} as ${who}`, async ({ page }) => {
    if (account) await login(page, account);
    const problems = watchProblems(page);
    await page.goto(path);
    await expect(page.getByRole("heading", { name: heading }).first()).toBeVisible();
    expect(problems).toEqual([]);
  });
}
