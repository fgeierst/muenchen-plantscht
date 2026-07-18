import { expect, test } from "@playwright/test";

/**
 * Mock API response with one pool area and one sauna area under the same
 * location. Used to verify that each page filters correctly.
 */
const mockResponse = {
  date: "2026-07-18",
  locations: [
    {
      location_id: 1,
      location_name: "Testbad",
      areas: [
        {
          area_id: 1,
          area_name: "Testbad Hallenbad",
          latest: {
            recorded_at: "2026-07-18T10:00:00Z",
            customer_amount: 100,
            customer_amount_max: 500,
            capacity_free_pct: 80,
          },
          data: [
            {
              recorded_at: "2026-07-18T10:00:00Z",
              customer_amount: 100,
              customer_amount_max: 500,
              capacity_free_pct: 80,
            },
          ],
          path: "M3,100L166,51",
        },
        {
          area_id: 2,
          area_name: "Testbad Sauna",
          latest: {
            recorded_at: "2026-07-18T10:00:00Z",
            customer_amount: 5,
            customer_amount_max: 50,
            capacity_free_pct: 90,
          },
          data: [
            {
              recorded_at: "2026-07-18T10:00:00Z",
              customer_amount: 5,
              customer_amount_max: 50,
              capacity_free_pct: 90,
            },
          ],
          path: "M3,100L166,51",
        },
      ],
    },
  ],
};

/** Intercept all API calls to the pools backend and return the mock. */
async function mockApi(page: import("@playwright/test").Page) {
  await page.route(/muenchen-plantscht-pools\.val\.run/, (route) => {
    route.fulfill({ json: mockResponse });
  });
}

test("pools page shows pool areas and hides sauna areas", async ({ page }) => {
  await mockApi(page);
  await page.goto("/");
  // Wait for the SPA to hydrate.
  await expect(page.getByRole("link", { name: "München Plantscht" })).toBeVisible();
  await expect(page.getByText("Testbad Hallenbad")).toBeVisible();
  await expect(page.getByText("Testbad Sauna")).not.toBeVisible();
});

test("saunas page shows sauna areas and hides pool areas", async ({ page }) => {
  await mockApi(page);
  await page.goto("saunas");
  await expect(page.getByRole("link", { name: "München Plantscht" })).toBeVisible();
  await expect(page.getByText("Testbad Sauna")).toBeVisible();
  await expect(page.getByText("Testbad Hallenbad")).not.toBeVisible();
});

test("nav has Pools and Saunas links", async ({ page }) => {
  await mockApi(page);
  await page.goto("/");
  await expect(page.getByRole("link", { name: "München Plantscht" })).toBeVisible();
  const poolsLink = page.getByRole("link", { name: "Pools" });
  const saunasLink = page.getByRole("link", { name: "Saunas" });
  await expect(poolsLink).toBeVisible();
  await expect(saunasLink).toBeVisible();
  // Saunas link is not yet implemented — this will fail until Step 3.
  await saunasLink.click();
  await expect(page.getByText("Testbad Sauna")).toBeVisible();
});
