import { expect, test } from "@playwright/test";

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

async function mockApi(page: import("@playwright/test").Page) {
  await page.route(/muenchen-plantscht-pools\.val\.run/, (route) => {
    void route.fulfill({ json: mockResponse });
  });
}

test("star button toggles favorite state", async ({ page }) => {
  await mockApi(page);
  await page.goto("/");
  await expect(page.getByRole("link", { name: "München Plantscht" })).toBeVisible();

  const starBtn = page.getByRole("button", { name: "Favorite Testbad Hallenbad" });
  await expect(starBtn).toHaveAttribute("aria-pressed", "false");

  await starBtn.click();
  await expect(starBtn).toHaveAttribute("aria-pressed", "true");
  await expect(starBtn).toHaveAttribute("aria-label", "Unfavorite Testbad Hallenbad");

  await starBtn.click();
  await expect(starBtn).toHaveAttribute("aria-pressed", "false");
});

test("favorites page shows favorited areas", async ({ page }) => {
  await mockApi(page);
  await page.goto("/");
  await expect(page.getByRole("link", { name: "München Plantscht" })).toBeVisible();

  await page.getByRole("button", { name: "Favorite Testbad Hallenbad" }).click();

  await page.getByRole("link", { name: "Favorites" }).click();
  await expect(page.getByText("Testbad Hallenbad")).toBeVisible();
  await expect(page.getByText("Testbad Sauna")).not.toBeVisible();
});

test("favorites page shows empty state when no favorites", async ({ page }) => {
  await mockApi(page);
  await page.goto("favorites");
  await expect(page.getByRole("link", { name: "München Plantscht" })).toBeVisible();
  await expect(page.getByText("No favorites yet")).toBeVisible();
});

test("un-favoriting removes area from favorites page", async ({ page }) => {
  await mockApi(page);
  await page.goto("/");
  await expect(page.getByRole("link", { name: "München Plantscht" })).toBeVisible();

  await page.getByRole("button", { name: "Favorite Testbad Hallenbad" }).click();
  await page.getByRole("link", { name: "Favorites" }).click();
  await expect(page.getByText("Testbad Hallenbad")).toBeVisible();

  await page.getByRole("button", { name: "Unfavorite Testbad Hallenbad" }).click();
  await expect(page.getByText("Testbad Hallenbad")).not.toBeVisible();
  await expect(page.getByText("No favorites yet")).toBeVisible();
});

test("favorites persist across page reloads", async ({ page }) => {
  await mockApi(page);
  await page.goto("/");
  await expect(page.getByRole("link", { name: "München Plantscht" })).toBeVisible();

  await page.getByRole("button", { name: "Favorite Testbad Hallenbad" }).click();
  await page.reload();

  // After reload, the star button still reflects the favorited state (localStorage persisted).
  await expect(page.getByRole("button", { name: "Unfavorite Testbad Hallenbad" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  // And the area appears on the favorites page.
  await page.getByRole("link", { name: "Favorites" }).click();
  await expect(page.getByText("Testbad Hallenbad")).toBeVisible();
});
