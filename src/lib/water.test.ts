// eslint-disable-next-line vite-plus/prefer-vite-plus-imports -- vitest browser mode doesn't support vite-plus/test
import { describe, expect, it, vi } from "vitest";

vi.mock("$env/dynamic/public", () => ({
  env: { PUBLIC_WATER_API: "https://muenchen-plantscht-water.val.run" },
}));

import { fetchWaterTemperatures } from "./water";

function mockFetch(response: unknown, status = 200) {
  let lastUrl = "";
  const fn = async (url: string) => {
    lastUrl = url;
    return new Response(JSON.stringify(response), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  };
  return { fn: fn as typeof fetch, getUrl: () => lastUrl };
}

describe("fetchWaterTemperatures", () => {
  it("appends &date= when date param is provided", async () => {
    const { fn, getUrl } = mockFetch({ category: "lakes", bodies: [] });
    await fetchWaterTemperatures(fn, "lakes", "2026-07-19");
    expect(getUrl()).toContain("&date=2026-07-19");
  });

  it("omits &date= when date param is undefined", async () => {
    const { fn, getUrl } = mockFetch({ category: "lakes", bodies: [] });
    await fetchWaterTemperatures(fn, "lakes");
    expect(getUrl()).not.toContain("&date=");
  });

  it("includes category in the URL", async () => {
    const { fn, getUrl } = mockFetch({ category: "rivers", bodies: [] });
    await fetchWaterTemperatures(fn, "rivers");
    expect(getUrl()).toContain("category=rivers");
  });

  it("throws on non-ok response", async () => {
    const { fn } = mockFetch({ error: "fail" }, 500);
    await expect(fetchWaterTemperatures(fn, "lakes")).rejects.toThrow("Water API 500");
  });

  it("returns parsed JSON on success", async () => {
    const data = {
      category: "lakes",
      bodies: [
        {
          body_of_water: "Testsee",
          slug: "testsee",
          measurement_site: "Teststelle",
          water_temperature: 22.5,
          measured_at: "2026-07-19T17:00:00.000Z",
          path: "M3,50C50,55,100,45,166,40",
          trend_text: "Steadily increased from 20° to 23°.",
        },
      ],
    };
    const { fn } = mockFetch(data);
    const result = await fetchWaterTemperatures(fn, "lakes", "2026-07-19");
    expect(result).toEqual(data);
  });
});
