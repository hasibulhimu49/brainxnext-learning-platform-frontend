import { expect, test } from "@playwright/test";
import { ADMIN, login } from "./helpers";

/** F-002 Phase 3 — admin operations against the mock API (each test starts from the seed data). */
test.describe("admin operations", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, ADMIN);
  });

  test("courses → detail → edit → save", async ({ page }) => {
    await page.goto("/admin/courses");
    await page.getByRole("link", { name: "View Generics in Java — Basics to Advanced" }).click();
    await expect(page).toHaveURL(/\/admin\/courses\/java-generics$/);
    await expect(page.getByRole("heading", { level: 1, name: "Generics in Java — Basics to Advanced" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Curriculum" })).toBeVisible();

    await page.getByRole("link", { name: "Edit", exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/courses\/java-generics\/edit$/);
    const title = page.getByLabel("Course title");
    await expect(title).toHaveValue("Generics in Java — Basics to Advanced");
    await title.fill("Generics in Java — Revised");
    await page.getByRole("button", { name: "Save changes" }).click();

    await expect(page).toHaveURL(/\/admin\/courses\/java-generics$/);
    await expect(page.getByRole("heading", { level: 1, name: "Generics in Java — Revised" })).toBeVisible();
  });

  test("payments → refund a paid order", async ({ page }) => {
    await page.goto("/admin/payments");
    await page.getByRole("button", { name: "Refund ORD-JS-8412" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Reason for the refund").fill("Charged twice by mistake");
    await dialog.getByRole("button", { name: "Refund", exact: true }).click();
    await expect(page.getByText("ORD-JS-8412 was refunded")).toBeVisible();

    await page.goto("/admin/payments/ORD-JS-8412");
    await expect(page.getByText(/Refunded ৳4,900 by BrainXNext Admin/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Refund" })).toHaveCount(0);
  });

  test("submissions → approve with feedback", async ({ page }) => {
    await page.goto("/admin/submissions");
    await expect(page.getByRole("link", { name: /Submissions.*2 pending/ })).toBeVisible();
    await page.getByRole("link", { name: "Review Bounded container practice" }).click();
    await expect(page).toHaveURL(/\/admin\/submissions\/SUB-1001$/);

    await page.getByRole("button", { name: "Approve" }).click();
    await expect(page.getByText(/Write at least 20 characters/)).toBeVisible();

    await page.getByLabel("Feedback for the learner").fill("Bounds are right and the wildcard on line 42 is fine. Nice work!");
    await page.getByRole("button", { name: "Approve" }).click();
    await expect(page).toHaveURL(/\/admin\/submissions$/);
    await expect(page.getByText("Approved “Bounded container practice”")).toBeVisible();
    await expect(page.getByRole("link", { name: /Submissions.*1 pending/ })).toBeVisible();
  });

  test("promos → create a code", async ({ page }) => {
    await page.goto("/admin/promos");
    await page.getByRole("button", { name: "+ Create code" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Code").fill("spring25");
    await dialog.getByLabel("% off").fill("25");
    await dialog.getByRole("button", { name: "Create code", exact: true }).click();
    await expect(page.getByText("SPRING25 was created")).toBeVisible();
    await expect(page.getByRole("cell", { name: "SPRING25", exact: true })).toBeVisible();
  });

  test("inbox → reply to a message", async ({ page }) => {
    await page.goto("/admin/inbox");
    await page.getByRole("link", { name: "Open message from Nusrat Jahan" }).click();
    await expect(page).toHaveURL(/\/admin\/inbox\/TCK-2041$/);
    await page.getByLabel("Reply").fill("Yes — we invoice teams of five or more. I'll send details.");
    await page.getByRole("button", { name: "Send reply" }).click();
    await expect(page.getByText("Reply sent to nusrat.j@yahoo.com")).toBeVisible();
    await expect(page.getByText("Yes — we invoice teams of five or more. I'll send details.")).toBeVisible();
  });
});
