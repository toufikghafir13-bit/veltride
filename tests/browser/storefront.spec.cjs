const { test, expect } = require("@playwright/test");
test("catalogue search, cart quantities, persistence and disabled payment", async ({ page }) => {
  await page.goto("/shop");
  await expect(page.locator("[data-product]")).toHaveCount(22);
  await page.getByRole("searchbox", { name: "Search catalogue" }).fill("BPC");
  const card = page.locator('[data-product="bpc-157"]');
  await card.getByRole("button", { name: "Add to cart" }).click();
  await expect(card.getByRole("status")).toHaveText("BPC-157 added to cart.");
  await page.getByRole("link", { name: /^Cart / }).click();
  await expect(page.getByRole("heading", { name: "Your cart", exact: true })).toBeVisible();
  await page.getByLabel("BPC-157 5mg quantity").selectOption("2");
  await expect(page.locator(".order-summary")).toContainText("$138.00");
  await page.reload();
  await expect(page.getByLabel("BPC-157 5mg quantity")).toHaveValue("2");
  await page.getByRole("link", { name: "Review checkout" }).click();
  await expect(page.getByText("Online checkout is currently unavailable.", { exact: false })).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue to secure payment" })).toBeDisabled();
  await page.getByRole("checkbox").check();
  await expect(page.getByRole("button", { name: "Continue to secure payment" })).toBeDisabled();
});
test("legacy product pages and assets remain reachable", async ({ page, request }) => {
  await page.goto("/shop");
  await page.locator('[data-product="aod-9604"]').getByRole("link", { name: "View details", exact: true }).click();
  await expect(page).toHaveURL(/\/aod-9604$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("AOD-9604");
  for (const url of ["/shipping", "/privacy", "/blog", "/images/vials/retatrutide.png", "/products.js", "/robots.txt"]) {
    expect((await request.get(url)).status()).toBe(200);
  }
  const image = await request.get("/_next/image?url=%2Fimages%2Fvials%2Fbpc-157.png&w=256&q=75");
  expect(image.status()).toBe(200);
  await page.goto("/cart.html");
  await expect(page).toHaveURL(/\/cart$/);
});
test("spoofed payment return and untrusted storage cannot erase or reprice the cart", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.setItem("veltride_cart_v1", JSON.stringify([
    null, { slug: "bpc-157", size: "5mg", quantity: 1, price: 1 }, { slug: "fake", size: "10mg", quantity: 1 }
  ])));
  await page.goto("/cart?checkout=success&session_id=spoofed");
  await expect(page.getByRole("status")).toContainText("could not verify");
  await expect(page.locator(".cart-line")).toHaveCount(1);
  await expect(page.locator(".order-summary")).toContainText("$69.00");
  await page.getByRole("button", { name: "Remove BPC-157 5mg" }).click();
  await expect(page.getByRole("heading", { name: "Your cart is empty" })).toBeVisible();
});
