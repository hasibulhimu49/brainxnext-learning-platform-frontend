import { expect, test } from "@playwright/test";
import { ADMIN, STUDENT, login } from "./helpers";

/** Small phones (360px): no page may scroll sideways. Absolutely positioned text (e.g. `.sr-only`) counts too. */
const PAGES: [account: typeof STUDENT | null, paths: string[]][] = [
  [
    null,
    [
      "/",
      "/courses",
      "/courses/java-generics",
      "/notes",
      "/pricing",
      "/about",
      "/contact",
      "/help",
      "/login",
      "/register",
      "/wishlist",
      "/cart",
    ],
  ],
  [STUDENT, ["/dashboard", "/learn/java-generics/1-1", "/settings/billing", "/checkout/applied-ml", "/certificates"]],
  [ADMIN, ["/admin", "/admin/payments", "/admin/submissions", "/admin/courses/new"]],
];

test.use({ viewport: { width: 360, height: 740 } });

for (const [account, paths] of PAGES) {
  const who = account === null ? "guest" : account === ADMIN ? "admin" : "student";
  test(`no sideways scroll at 360px (${who})`, async ({ page }) => {
    test.setTimeout(60_000);
    if (account) await login(page, account);
    for (const path of paths) {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      const width = await page.locator("html").evaluate((el) => el.scrollWidth);
      expect(width, `${path} is wider than the screen`).toBeLessThanOrEqual(360);
    }
  });
}
