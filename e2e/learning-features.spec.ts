import { expect, test } from "@playwright/test";
import { login } from "./helpers";

/** F-006 reviews · F-007 module quizzes · F-008 learning paths. */
test.describe("learning features", () => {
  test("a student reviews a course they're 35% through", async ({ page }) => {
    await login(page);
    await page.goto("/courses/python-data-analysis#reviews");
    await page.getByRole("radio", { name: "5 stars" }).click();
    await page.getByLabel("Your review").fill("Real datasets and clear pandas explanations — loved it.");
    await page.getByRole("button", { name: "Post review" }).click();
    await expect(page.getByText("YOUR REVIEW")).toBeVisible();
    await expect(page.getByText("Real datasets and clear pandas explanations — loved it.")).toBeVisible();
  });

  test("a student takes a module quiz from the player", async ({ page }) => {
    await login(page);
    await page.goto("/learn/java-generics/3-1");
    await page
      .getByRole("link", { name: /Module quiz/ })
      .first()
      .click();
    await expect(page).toHaveURL(/\/learn\/java-generics\/quiz\/3$/);
    for (let q = 1; q <= 4; q++) {
      await page
        .getByRole("radiogroup", { name: `Question ${q}` })
        .getByRole("radio")
        .first()
        .click();
    }
    await page.getByRole("button", { name: "Submit answers" }).click();
    await expect(page.getByText(/\/4 — (Passed!|Not passed yet)/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
  });

  test("a guest follows a learning path and adds its paid courses to the cart", async ({ page }) => {
    await page.goto("/courses");
    await page.getByRole("link", { name: /Not sure where to start/ }).click();
    await expect(page).toHaveURL(/\/paths$/);
    await page.getByRole("link", { name: /Product Designer/ }).click();
    await expect(page.getByRole("heading", { name: "Product Designer" })).toBeVisible();
    await page.getByRole("button", { name: /Add 3 paid courses to cart/ }).click();
    await page.goto("/cart");
    await expect(page.getByText("UX Research in Five Days")).toBeVisible();
    await expect(page.getByText("Motion Design", { exact: false }).first()).toBeVisible();
  });
});
