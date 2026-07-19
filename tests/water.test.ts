import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const mockWaterResponse = {
  category: "lakes",
  bodies: [
    {
      body_of_water: "Testsee",
      slug: "testsee",
      measurement_site: "Teststelle",
      water_temperature: 22.5,
      measured_at: "2026-07-19T17:00:00.000Z",
      path: "M3,50C50,55,100,45,166,40",
      data: [
        { measured_at: "2026-07-13T17:00:00.000Z", water_temperature: 20.1 },
        { measured_at: "2026-07-19T17:00:00.000Z", water_temperature: 22.5 },
      ],
    },
  ],
};

const mockPoolsResponse = {
  date: "2026-07-19",
  locations: [],
};

async function mockApis(page: import("@playwright/test").Page, category: string) {
  await page.route(/muenchen-plantscht-pools\.val\.run/, (route) => {
    void route.fulfill({ json: mockPoolsResponse });
  });
  await page.route(/muenchen-plantscht-water\.val\.run/, (route) => {
    void route.fulfill({ json: { ...mockWaterResponse, category } });
  });
}

test("lakes page shows lake names and temperatures", async ({ page }) => {
  await mockApis(page, "lakes");
  await page.goto("lakes");
  await expect(page.getByRole("link", { name: "München Plantscht" })).toBeVisible();
  await expect(page.getByText("Testsee")).toBeVisible();
  await expect(page.getByText("23°")).toBeVisible();
});

test("rivers page shows river names and temperatures", async ({ page }) => {
  await mockApis(page, "rivers");
  await page.goto("rivers");
  await expect(page.getByRole("link", { name: "München Plantscht" })).toBeVisible();
  await expect(page.getByText("Testsee")).toBeVisible();
  await expect(page.getByText("23°")).toBeVisible();
});

test("nav has Lakes and Rivers links", async ({ page }) => {
  await mockApis(page, "lakes");
  await page.goto("lakes");
  await expect(page.getByRole("link", { name: "München Plantscht" })).toBeVisible();
  const lakesLink = page.getByRole("link", { name: "Lakes" });
  const riversLink = page.getByRole("link", { name: "Rivers" });
  await expect(lakesLink).toBeVisible();
  await expect(riversLink).toBeVisible();
  await riversLink.click();
  await expect(page).toHaveURL(/\/rivers$/);
});

test("lakes page has no axe accessibility violations", async ({ page }) => {
  await mockApis(page, "lakes");
  await page.goto("lakes");
  await expect(page.getByRole("link", { name: "München Plantscht" })).toBeVisible();
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"])
    .analyze();
  expect(results.violations).toEqual([]);
});
