import { expect, test } from "@playwright/test";
import { ADMIN, STUDENT, login, submitLogin } from "./helpers";

test.describe("authentication", () => {
  test("a learner logs in and lands on the dashboard", async ({ page }) => {
    await login(page);
    await expect(page.getByRole("heading", { name: /Welcome back, Mohammad/ })).toBeVisible();
  });

  test("a guest opening the dashboard logs in and comes back", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login\?next=%2Fdashboard$/);
    await expect(page.getByText("Log in to continue — we'll take you right back.")).toBeVisible();
    await submitLogin(page, STUDENT);
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole("heading", { name: /Welcome back, Mohammad/ })).toBeVisible();
  });

  test("a wrong password shows the server message", async ({ page }) => {
    await page.goto("/login");
    await submitLogin(page, { email: STUDENT.email, password: "not-my-password" });
    await expect(page.getByRole("alert")).toContainText("Wrong password");
    await expect(page).toHaveURL(/\/login$/);
  });

  // demo mode (VITE_OPEN_ADMIN, on while the mock API is): the admin panel is open to everyone;
  // the real lock (403 for students) is covered by the unit tests, which run with it off
  test("demo mode: anyone can open the admin panel, even signed out", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Admin panel" }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
    await page.goto("/admin/payments");
    await expect(page.getByRole("cell", { name: "ORD-JS-8412", exact: true })).toBeVisible();
  });

  test("an admin logs in to /admin and logs out", async ({ page }) => {
    await login(page, ADMIN);
    await expect(page.getByRole("heading", { name: "Overview" }).first()).toBeVisible();
    await page.getByRole("button", { name: "Log out" }).filter({ visible: true }).first().click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText("You've been logged out")).toBeVisible();
    // demo mode keeps /admin open after logout (see the test above)
    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: "Overview" }).first()).toBeVisible();
  });

  test("a new learner signs up, verifies their email and sees an empty dashboard", async ({ page }) => {
    const email = `e2e-${Date.now()}@email.com`;
    await page.goto("/register");
    await page.getByLabel("Full name").fill("Playwright Learner");
    await page.getByLabel("Email address").fill(email);
    await page.getByLabel("Password", { exact: true }).fill("Password123!");
    await page.getByRole("button", { name: "Create free account" }).click();

    await page.getByRole("link", { name: "Enter the code" }).click();
    await expect(page.getByText(email)).toBeVisible();
    for (const [i, digit] of [..."123456"].entries()) {
      await page.getByLabel(`Digit ${i + 1}`).fill(digit);
    }
    await page.getByRole("button", { name: "Verify code" }).click();
    await expect(page.getByRole("heading", { name: "You're verified!" })).toBeVisible();

    await page.getByRole("link", { name: "Start learning" }).click();
    await expect(page.getByRole("heading", { name: /Welcome back, Playwright/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Your learning starts here" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Browse courses" })).toBeVisible();
  });

  test("forgot password → demo reset link → the new password works", async ({ page }) => {
    await page.goto("/forgot-password");
    await page.getByLabel("Email address").fill(STUDENT.email);
    await page.getByRole("button", { name: "Send reset link" }).click();
    await page.getByRole("link", { name: "Open the reset link (demo)" }).click();
    await expect(page).toHaveURL(/\/reset-password\?token=/);
    await page.getByLabel("New password", { exact: true }).fill("brandnewpass1");
    await page.getByLabel("Confirm new password").fill("brandnewpass1");
    await page.getByRole("button", { name: "Reset password" }).click();
    await expect(page.getByRole("heading", { name: "Password updated!" })).toBeVisible();
    await page.getByRole("link", { name: "Log in", exact: true }).click();
    await submitLogin(page, { email: STUDENT.email, password: "brandnewpass1" });
    await expect(page).toHaveURL(/\/dashboard$/);
  });
});
