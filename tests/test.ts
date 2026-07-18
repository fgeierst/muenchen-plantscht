import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("pools page ships a client-only shell at the /mp base path", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  const html = (await response?.text()) ?? "";
  // SPA mode (ssr = false): the header is rendered by JS in the browser, so
  // it must NOT appear in the initial HTML payload.
  expect(html).not.toContain("München Plantscht");
  // ...and it appears once the app hydrates.
  await expect(page.getByRole("link", { name: "München Plantscht" })).toBeVisible();
});

test("pools page has no axe accessibility violations", async ({ page }) => {
  await page.goto("/");
  // Wait for the SPA to hydrate before scanning.
  await expect(page.getByRole("link", { name: "München Plantscht" })).toBeVisible();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
