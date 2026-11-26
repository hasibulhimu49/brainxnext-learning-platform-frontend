import { expect, test, type Page } from "@playwright/test";
import { login, payByCard } from "./helpers";

/** F-002 Phase 2: plans, failed wallet payments, certificates, verification, project reviews, notifications. */

async function goPro(page: Page) {
  await page.goto("/checkout/plan/pro?cycle=monthly");
  await payByCard(page, "৳1,900");
  await expect(page.getByRole("heading", { name: "Payment successful!" })).toBeVisible();
}

test.describe("learner money and achievements", () => {
  test("Pro plan checkout → billing shows Pro → cancel keeps it until the period ends", async ({ page }) => {
    await login(page);
    await page.goto("/settings/billing");
    await expect(page.getByText("FREE PLAN")).toBeVisible();

    await page.goto("/checkout/plan/pro?cycle=monthly");
    await page.getByRole("button", { name: /Yearly/ }).click();
    await expect(page).toHaveURL(/cycle=yearly/);
    await page.getByRole("button", { name: "Monthly" }).click();
    await payByCard(page, "৳1,900");
    await expect(page).toHaveURL(/\/orders\/ORD-/);
    await expect(page.getByRole("heading", { name: "Payment successful!" })).toBeVisible();

    await page.goto("/settings/billing");
    await expect(page.getByText("PRO PLAN · MONTHLY")).toBeVisible();
    await expect(page.getByText(/Renews on/)).toBeVisible();
    await page.getByRole("button", { name: "Cancel plan" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Cancel plan" }).click();
    await expect(page.getByText(/Cancelled — active until/)).toBeVisible();
    await page.getByRole("button", { name: "Resume Pro" }).click();
    await expect(page.getByText(/Renews on/)).toBeVisible();

    await page.goto("/checkout/plan/pro");
    await expect(page.getByRole("heading", { name: "You're already on Pro" })).toBeVisible();
  });

  test("a declined wallet payment shows the failed state and can be retried", async ({ page }) => {
    await login(page);
    await page.goto("/checkout/ux-research");
    await page.getByRole("button", { name: "Nagad" }).click();
    await page.getByLabel("Nagad account number").fill("01712340000");
    await page.getByRole("button", { name: "Pay ৳3,900" }).click();
    await page.getByRole("button", { name: "I've approved" }).click();
    await expect(page.getByRole("heading", { name: "Payment failed" })).toBeVisible();
    await page.getByRole("button", { name: "Try again" }).click();
    await expect(page.getByRole("heading", { name: "Payment" })).toBeVisible();
  });

  test("complete a course → certificate → public verify page", async ({ page }) => {
    test.setTimeout(90_000); // clicks through all 17 lessons
    await login(page);
    await goPro(page);
    // Pro unlocks paid courses: enrol and finish every class
    await page.goto("/learn/react-architecture/1-1");
    await page.getByRole("button", { name: "Enroll to track progress" }).click();
    for (let i = 0; i < 17; i++) {
      await page.getByRole("button", { name: "Mark as complete" }).click();
      await expect(page.getByText(`${i + 1} of 17 classes completed`)).toBeVisible();
      if (i < 16) await page.getByRole("button", { name: "Next class" }).last().click();
    }
    await expect(page.getByRole("heading", { name: /You finished React Architecture at Scale!/ })).toBeVisible();
    await page.getByRole("link", { name: "Get your certificate" }).click();
    await expect(page).toHaveURL(/\/certificates\/BXN-/);
    await expect(page.getByText("React Architecture at Scale", { exact: true })).toBeVisible();
    const certId = page.url().split("/").pop() ?? "";

    await page.goto("/certificates");
    await expect(page.getByText(certId)).toBeVisible();

    // public, no account needed
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.removeItem("bxn-auth"));
    await page.goto(`/verify/${certId}`);
    await expect(page.getByText("Valid certificate")).toBeVisible();
    await page.goto("/verify/BXN-0000-XX-00000");
    await expect(page.getByText("No valid certificate")).toBeVisible();
  });

  test("submit a project → it appears in My reviews", async ({ page }) => {
    await login(page);
    await page.goto("/learn/java-generics/project");
    await expect(page.getByRole("heading", { name: "Mentor review is part of Pro" })).toBeVisible();

    await goPro(page);
    await page.goto("/learn/java-generics/3-3");
    await page.getByRole("link", { name: "Submit project" }).click();
    await page.getByLabel("Project title").fill("Typed cache with LRU");
    await page.getByLabel("Repository URL").fill("https://github.com/me/typed-cache");
    await page.getByRole("button", { name: "Submit for review" }).click();
    await expect(page.getByRole("heading", { name: "Submitted for review" })).toBeVisible();

    await page.getByRole("link", { name: "See my reviews" }).click();
    await expect(page).toHaveURL(/\/dashboard\/reviews$/);
    await expect(page.getByRole("heading", { name: "Typed cache with LRU" })).toBeVisible();
    await expect(page.getByText("Pending")).toBeVisible();
    // the seeded approved review has mentor feedback behind a toggle
    await page.getByRole("button", { name: "Show mentor feedback" }).click();
    await expect(page.getByText(/Clean model and well-chosen indexes/)).toBeVisible();
  });

  test("notifications: unread dot and mark all read", async ({ page }) => {
    await login(page);
    await page.getByRole("button", { name: /Notifications \(\d+ unread\)/ }).click();
    await expect(page.getByRole("dialog", { name: "Notifications" }).getByText("Project approved")).toBeVisible();
    await page.getByRole("button", { name: "Mark all read" }).click();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: "Notifications", exact: true })).toBeVisible();
  });

  test("donation → thank-you downloads the handbook", async ({ page }) => {
    await page.goto("/notes");
    await page.getByRole("link", { name: "Download" }).first().click();
    await expect(page).toHaveURL(/\/support\?handbook=python$/);
    await page.getByRole("button", { name: "৳99", exact: true }).click();
    await page.getByRole("button", { name: "Support with ৳99" }).click();
    await expect(page).toHaveURL(/\/thank-you\?amount=99&handbook=python$/);
    const download = page.waitForEvent("download");
    await page.getByRole("link", { name: "Download the Python handbook" }).click();
    expect((await download).suggestedFilename()).toBe("brainxnext-python-handbook.pdf");
  });
});
