import { expect, test } from "@playwright/test";
import { STUDENT, login, submitLogin } from "./helpers";

test.describe("finding, enrolling and buying a course", () => {
  test("search the catalog and open a course", async ({ page }) => {
    await page.goto("/courses");
    await page.getByLabel("Search courses").fill("generics");
    await expect(page.getByText("1 course found")).toBeVisible();
    await page.getByRole("link", { name: /Generics in Java/ }).click();
    await expect(page).toHaveURL(/\/courses\/java-generics$/);
    await expect(page.getByRole("heading", { name: "What you'll learn" })).toBeVisible();
  });

  test("enroll in a free course, mark a class complete, and it survives a reload", async ({ page }) => {
    await login(page);
    await page.goto("/courses/product-analytics");
    await page.getByRole("button", { name: "Enroll for free" }).click();
    await page.getByRole("button", { name: "Go to course" }).click();
    await expect(page).toHaveURL(/\/learn\/product-analytics\/1-1$/);
    await expect(page.getByText("Course content")).toBeVisible();

    await page.getByRole("button", { name: "Mark as complete" }).click();
    await expect(page.getByRole("button", { name: "Completed" })).toBeVisible();
    await expect(page.getByText("1 of 17 classes completed")).toBeVisible();

    await page.reload();
    await expect(page.getByRole("button", { name: "Completed" })).toBeVisible();
    // the outline button under the title (the video bar has an icon-only "Next class" control too)
    await page.getByRole("button", { name: "Next class" }).last().click();
    await expect(page).toHaveURL(/\/learn\/product-analytics\/1-2$/);
  });

  test("a paid course is locked in the player until bought", async ({ page }) => {
    await login(page);
    await page.goto("/learn/applied-ml/1-3");
    await expect(page.getByRole("heading", { name: "This class is part of the full course" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Buy for ৳8,900" })).toHaveAttribute("href", "/checkout/applied-ml");
  });

  test("checkout applies LEARN20, pays with bKash (pending → approve → receipt) and enrols", async ({ page }) => {
    await page.goto("/checkout/modern-javascript");
    await expect(page).toHaveURL(/\/login\?next=%2Fcheckout%2Fmodern-javascript$/);
    await expect(page.getByText(/Log in to finish your purchase/)).toBeVisible();
    await submitLogin(page, STUDENT);

    await expect(page).toHaveURL(/\/checkout\/modern-javascript$/);
    await expect(page.getByText("Order summary")).toBeVisible();
    await expect(page.getByText("VAT included")).toBeVisible();

    await page.getByLabel("PROMO CODE").fill("LEARN20");
    await page.getByRole("button", { name: "Apply" }).click();
    await expect(page.getByText("✓ LEARN20 applied — 20% off")).toBeVisible();

    await page.getByRole("button", { name: "bKash" }).click();
    await page.getByLabel("bKash account number").fill("01712345678");
    await page.getByRole("button", { name: "Pay ৳3,920" }).click();

    // wallet payments wait for approval on the phone, then open the receipt
    await expect(page.getByRole("heading", { name: "Approve on your phone" })).toBeVisible();
    await page.getByRole("button", { name: "I've approved" }).click();
    await expect(page).toHaveURL(/\/orders\/ORD-/);
    await expect(page.getByRole("heading", { name: "Payment successful!" })).toBeVisible();
    await expect(page.getByText("VAT included")).toBeVisible();

    await page.getByRole("link", { name: "Start learning now" }).click();
    await expect(page).toHaveURL(/\/learn\/modern-javascript/);
    await expect(page.getByRole("button", { name: "Mark as complete" })).toBeVisible();

    await page.goto("/checkout/modern-javascript");
    await expect(page.getByRole("heading", { name: "You already own this course" })).toBeVisible();
  });
});
