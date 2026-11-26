import { expect, test } from "@playwright/test";
import { STUDENT, payByCard, submitLogin } from "./helpers";

/** F-004: wishlist and cart — guests can fill both; checkout asks them to log in. */
test.describe("wishlist and cart", () => {
  test("heart a course → it shows on the wishlist", async ({ page }) => {
    await page.goto("/courses");
    await page.getByRole("button", { name: "Save UX Research in Five Days to wishlist" }).click();
    await page.goto("/wishlist");
    await expect(page.getByRole("heading", { name: "My wishlist" })).toBeVisible();
    await expect(page.getByText("UX Research in Five Days")).toBeVisible();
  });

  test("guest fills the cart, logs in at checkout and pays once for both courses", async ({ page }) => {
    for (const id of ["modern-javascript", "ux-research"]) {
      await page.goto(`/courses/${id}`);
      await page.getByRole("button", { name: "Add to cart" }).click();
      await expect(page.getByRole("link", { name: "In cart — view cart" })).toBeVisible();
    }
    await page.getByRole("link", { name: "Cart, 2 courses" }).click();
    await expect(page).toHaveURL(/\/cart$/);
    await expect(page.getByText("You save ৳8,000")).toBeVisible();
    await page.getByLabel("PROMO CODE").fill("LEARN20");
    await page.getByRole("button", { name: "Apply" }).click();
    await expect(page.getByText("✓ LEARN20 applied — 20% off")).toBeVisible();
    await page.getByRole("link", { name: "Checkout" }).click();

    // guests sign in, then land straight back on cart checkout
    await expect(page).toHaveURL(/\/login\?next=/);
    await submitLogin(page, STUDENT);
    await expect(page).toHaveURL(/\/checkout\/cart\?promo=LEARN20$/);
    await expect(page.getByText("Subtotal (2 courses)")).toBeVisible();

    await payByCard(page, "৳7,040");

    await expect(page).toHaveURL(/\/orders\/ORD-/);
    await expect(page.getByText(/enrolled in 2 new courses/)).toBeVisible();
    await page.goto("/cart");
    await expect(page.getByText("Your cart is empty")).toBeVisible();

    await page.goto("/dashboard/courses");
    await expect(page.getByText("Modern JavaScript, Properly").first()).toBeVisible();
    await expect(page.getByText("UX Research in Five Days").first()).toBeVisible();
  });
});
