import { expect, type Page } from "@playwright/test";

export const STUDENT = { email: "hasibulx26@gmail.com", password: "password123" };
export const ADMIN = { email: "admin@brainxnext.com", password: "admin12345" };

/** Fill and submit the login form on the current page (must already be /login). */
export async function submitLogin(page: Page, { email, password }: { email: string; password: string }) {
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Log in" }).click();
}

/** Log in from /login and wait for the default landing page. */
export async function login(page: Page, account = STUDENT) {
  await page.goto("/login");
  await submitLogin(page, account);
  await expect(page).toHaveURL(account === ADMIN ? /\/admin$/ : /\/dashboard$/);
}
