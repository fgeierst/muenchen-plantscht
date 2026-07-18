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

import { existsSync } from "node:fs";

test("dead code is removed from the repo", () => {
  expect(existsSync("src/routes/lakes")).toBe(false);
  expect(existsSync("src/routes/rivers")).toBe(false);
  expect(existsSync("src/components/Sparkline")).toBe(false);
  expect(existsSync("src/components/Weather.svelte")).toBe(false);
});
