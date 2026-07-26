import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

function berlinToday(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Berlin" });
}

async function mockApis(page: import("@playwright/test").Page) {
  await page.route(/muenchen-plantscht-pools\.val\.run/, (route) => {
    void route.fulfill({ json: { date: "2026-07-19", locations: [] } });
  });
  await page.route(/muenchen-plantscht-water\.val\.run/, (route) => {
    const url = new URL(route.request().url());
    const category = url.searchParams.get("category") ?? "lakes";
    void route.fulfill({ json: { category, bodies: [] } });
  });
}

test("date input is visible on the pools page", async ({ page }) => {
  await mockApis(page);
  await page.goto("/");
  await expect(page.getByRole("link", { name: "München Plantscht" })).toBeVisible();
  await expect(page.getByLabel("Date", { exact: true })).toBeVisible();
});

test("date input is visible on the lakes page", async ({ page }) => {
  await mockApis(page);
  await page.goto("lakes");
  await expect(page.getByRole("link", { name: "München Plantscht" })).toBeVisible();
  await expect(page.getByLabel("Date", { exact: true })).toBeVisible();
});

test("selecting a date updates the URL", async ({ page }) => {
  await mockApis(page);
  await page.goto("/");
  await expect(page.getByRole("link", { name: "München Plantscht" })).toBeVisible();
  await page.getByLabel("Date", { exact: true }).fill("2026-07-19");
  await expect(page).toHaveURL(/\?date=2026-07-19/);
});

test("date param persists when navigating between pages", async ({ page }) => {
  await mockApis(page);
  await page.goto("/");
  await expect(page.getByRole("link", { name: "München Plantscht" })).toBeVisible();
  await page.getByLabel("Date", { exact: true }).fill("2026-07-19");
  await expect(page).toHaveURL(/\?date=2026-07-19/);
  await page.getByRole("link", { name: "Lakes" }).click();
  await expect(page).toHaveURL(/\/lakes.*\?date=2026-07-19/);
});

test("nav links include date param when present", async ({ page }) => {
  await mockApis(page);
  await page.goto("/");
  await expect(page.getByRole("link", { name: "München Plantscht" })).toBeVisible();
  await page.getByLabel("Date", { exact: true }).fill("2026-07-19");
  await expect(page).toHaveURL(/\?date=2026-07-19/);
  const lakesLink = page.getByRole("link", { name: "Lakes" });
  await expect(lakesLink).toHaveAttribute("href", /.*\?date=2026-07-19/);
});

test("nav links do not include date param when absent", async ({ page }) => {
  await mockApis(page);
  await page.goto("/");
  await expect(page.getByRole("link", { name: "München Plantscht" })).toBeVisible();
  const lakesLink = page.getByRole("link", { name: "Lakes" });
  const href = await lakesLink.getAttribute("href");
  expect(href).not.toContain("date=");
});

test("date input has max attribute set to today", async ({ page }) => {
  await mockApis(page);
  await page.goto("/");
  await expect(page.getByRole("link", { name: "München Plantscht" })).toBeVisible();
  const max = await page.getByLabel("Date", { exact: true }).getAttribute("max");
  expect(max).toBe(berlinToday());
});

test("date input has no axe accessibility violations", async ({ page }) => {
  await mockApis(page);
  await page.goto("/");
  await expect(page.getByRole("link", { name: "München Plantscht" })).toBeVisible();
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"])
    .analyze();
  expect(results.violations).toEqual([]);
});
