# Water Temperature Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show lake and river water temperatures in the frontend using the same SVG sparkline approach as pools/saunas, displaying the last week of data below the current temperature.

**Architecture:** The Val Town backend (`api/water-temperatures.ts`) is extended to return a 7-day time series with precomputed SVG paths (using d3-shape, same as the pools API). The frontend gets two new pages (`/lakes`, `/rivers`), each with a `+page.ts` that fetches from the water API and a `WaterCard` component that renders the current temperature above an SVG sparkline. The x-axis maps a 7-day window to [0, 200]; the y-axis maps 0–35 °C to [100, 0].

**Tech Stack:** Val Town (Deno, d3-shape, std/sqlite) for the backend; SvelteKit (SPA mode, Svelte 5 runes), TypeScript, Playwright for the frontend.

## Global Constraints

- Backend: Val Town val `fgeierst/muenchen-plantscht-v2`. Deno runtime. ES modules with file extensions. `https://esm.sh/` for third-party, `https://esm.town/v/std/...` for stdlib. Tests run via `run_file`.
- Frontend: Local repo at `/Users/florian/Learn/muenchen-plantscht`. SvelteKit SPA (`ssr = false`, `adapter-static`, base path `/mp`). Svelte 5 runes (`$props`, `$derived`). Run `vp check` and `vp test` to validate.
- The SVG viewBox is `0 0 200 110` (same as `AreaCard.svelte`). X-axis [0, 200], y-axis [0, 100] with 10 px bottom padding.
- Berlin time (`Europe/Berlin`) is the domain timezone. DST must be respected.
- The water API endpoint is `https://muenchen-plantscht-water.val.run/?category=lakes|rivers`.
- The `water_temperatures` table stores `measured_at` as ISO-8601 UTC. The cron populates it hourly.
- Follow existing code patterns: `AreaCard.svelte` for card layout, `AreaGrid.svelte` for grid, `+page.ts` for data loading, `tests/*.test.ts` for e2e tests.
- No comments in code unless the surrounding code has them.

---

## File Structure

**Backend (Val Town `fgeierst/muenchen-plantscht-v2`):**

- Create: `lib/week-time-value.ts` — pure function mapping an ISO timestamp to x ∈ [0, 200] over a trailing 7-day window.
- Create: `lib/week-time-value.test.ts` — test for the above.
- Modify: `api/water-temperatures.ts` — query last 7 days, group by body of water, generate SVG path per body, return `{ category, bodies: [{ …, path, data }] }`.

**Frontend (local repo):**

- Create: `src/lib/water.ts` — API types + `fetchWaterTemperatures()` fetch function.
- Create: `src/components/WaterCard.svelte` — card showing temperature, SVG sparkline, and name.
- Create: `src/components/WaterGrid.svelte` — grid layout for water cards (mirrors `AreaGrid.svelte`).
- Create: `src/routes/lakes/+page.ts` — load lakes data from water API.
- Create: `src/routes/lakes/+page.svelte` — render `WaterGrid`.
- Create: `src/routes/rivers/+page.ts` — load rivers data from water API.
- Create: `src/routes/rivers/+page.svelte` — render `WaterGrid`.
- Modify: `src/routes/+layout.ts` — catch pool API failures so water pages work independently.
- Modify: `src/components/Nav.svelte` — add Lakes and Rivers nav entries.
- Modify: `src/components/Header.svelte` — add page titles for lakes and rivers.
- Modify: `src/components/Footer.svelte` — add GKD Bayern data credit.
- Modify: `.env.example` — add `PUBLIC_WATER_API`.
- Create: `tests/water.test.ts` — e2e tests for lakes and rivers pages.

---

### Task 1: Backend — week-time-value function

**Files:**

- Create (val): `lib/week-time-value.ts`
- Create (val): `lib/week-time-value.test.ts`
- Test: `lib/week-time-value.test.ts` (run via `run_file`)

**Interfaces:**

- Produces: `export function weekTimeValue(iso: string, now: Date = new Date()): number` — maps an ISO-8601 timestamp to x ∈ [0, 200], where `now - 7 days` → 0 and `now` → 200. Timestamps outside the window are clamped to the nearest edge.
- Consumed by: `api/water-temperatures.ts` (Task 2).

- [ ] **Step 1: Create `lib/week-time-value.test.ts` with the failing test**

Create the file in val `fgeierst/muenchen-plantscht-v2` with this exact content:

```ts
import { weekTimeValue } from "./week-time-value.ts";

function assertEqual(actual: unknown, expected: unknown, label: string): void {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    throw new Error(`FAIL: ${label}\n  expected: ${e}\n  actual:   ${a}`);
  }
  console.log(`PASS: ${label} → ${a}`);
}

// Fixed "now" for deterministic tests: 2026-07-19T17:00:00Z
const now = new Date("2026-07-19T17:00:00.000Z");
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// "now" itself → x = 200 (right edge)
assertEqual(weekTimeValue("2026-07-19T17:00:00.000Z", now), 200, "now → 200");

// Exactly 7 days ago → x = 0 (left edge)
assertEqual(weekTimeValue("2026-07-12T17:00:00.000Z", now), 0, "7 days ago → 0");

// 3.5 days ago → x = 100 (midpoint)
assertEqual(weekTimeValue("2026-07-16T05:00:00.000Z", now), 100, "3.5 days ago → 100");

// 1 day ago → x = 171 (6/7 of the way across)
assertEqual(weekTimeValue("2026-07-18T17:00:00.000Z", now), 171, "1 day ago → 171");

// 10 days ago (outside window) → clamped to 0
assertEqual(weekTimeValue("2026-07-09T17:00:00.000Z", now), 0, "10 days ago clamps to 0");

// 1 day in the future (outside window) → clamped to 200
assertEqual(weekTimeValue("2026-07-20T17:00:00.000Z", now), 200, "future clamps to 200");

console.log("\nAll tests passed.");
```

- [ ] **Step 2: Run the test to verify it fails**

Run via `run_file` on `fgeierst/muenchen-plantscht-v2` path `lib/week-time-value.test.ts`.
Expected: FAIL with `Module not found` or `weekTimeValue is not a function`.

- [ ] **Step 3: Create `lib/week-time-value.ts`**

Create the file in val `fgeierst/muenchen-plantscht-v2` with this exact content:

```ts
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const CANVAS_WIDTH = 200;

/**
 * Map an ISO timestamp to an x-coordinate in [0, 200] over a trailing 7-day
 * window ending at `now`. `now - 7 days` → 0, `now` → 200.
 * Timestamps outside the window are clamped to the nearest edge.
 *
 * Used by api/water-temperatures.ts to generate the SVG sparkline x-coordinates
 * for the last week of water-temperature readings.
 */
export function weekTimeValue(iso: string, now: Date = new Date()): number {
  const windowEnd = now.getTime();
  const windowStart = windowEnd - WEEK_MS;
  const t = new Date(iso).getTime();
  const clamped = Math.max(windowStart, Math.min(windowEnd, t));
  return Math.round(((clamped - windowStart) / WEEK_MS) * CANVAS_WIDTH);
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run via `run_file` on `fgeierst/muenchen-plantscht-v2` path `lib/week-time-value.test.ts`.
Expected: PASS — all 6 assertions pass, `All tests passed.` at the end.

- [ ] **Step 5: Verify (commit)**

Val Town auto-versions. The test passing is the gate.

---

### Task 2: Backend — extend water-temps API with week data + SVG paths

**Files:**

- Modify (val): `api/water-temperatures.ts`
- Test: `api/water-temperatures.ts` (verify via `fetch_val_endpoint`)

**Interfaces:**

- Consumes: `weekTimeValue` from `lib/week-time-value.ts` (Task 1).
- Consumes: `line`, `curveNatural` from `https://esm.sh/d3-shape@3` (same as `api/pools.ts`).
- Produces: `GET /?category=lakes|rivers` → `{ category: string, bodies: WaterBody[] }` where each `WaterBody` has `{ body_of_water, slug, measurement_site, water_temperature, measured_at, path: string, data: { measured_at: string, water_temperature: number }[] }`.
- Consumed by: `src/lib/water.ts` (Task 3).

- [ ] **Step 1: Replace `api/water-temperatures.ts` with the extended version**

Use `update_file` to replace the entire file content in val `fgeierst/muenchen-plantscht-v2` at path `api/water-temperatures.ts` with:

```ts
import { sqlite } from "https://esm.town/v/std/sqlite/main.ts";
import { line, curveNatural } from "https://esm.sh/d3-shape@3";
import { weekTimeValue } from "../lib/week-time-value.ts";

/**
 * GET /?category=lakes|rivers
 *
 * Returns the latest water-temperature reading per body of water within the
 * requested category, plus a 7-day time series and a precomputed d3 SVG path
 * (y = temperature mapped to 0–35 °C range). `category` defaults to "lakes".
 *
 * The SVG viewBox is 0 0 200 110 (matching AreaCard.svelte). X-axis: 7-day
 * window → [0, 200]. Y-axis: 0 °C → y=100, 35 °C → y=0.
 *
 * Public + CORS-friendly. Cached for 10 minutes.
 */

interface Row {
  body_of_water: string;
  slug: string;
  measurement_site: string;
  water_temperature: number;
  measured_at: string;
}

interface WaterDataPoint {
  measured_at: string;
  water_temperature: number;
}

interface WaterBody {
  body_of_water: string;
  slug: string;
  measurement_site: string;
  water_temperature: number;
  measured_at: string;
  path: string;
  data: WaterDataPoint[];
}

const CATEGORIES: Record<string, number> = { lakes: 0, rivers: 1 };

const MAX_TEMP = 35;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function tempToY(temp: number): number {
  return 100 - (temp / MAX_TEMP) * 100;
}

export default async function (req: Request): Promise<Response> {
  const url = new URL(req.url);
  const categoryParam = url.searchParams.get("category") ?? "lakes";
  const categoryId = CATEGORIES[categoryParam];
  if (categoryId === undefined) {
    return Response.json(
      { error: `Invalid category '${categoryParam}'. Use 'lakes' or 'rivers'.` },
      { status: 400 },
    );
  }

  const now = new Date();
  const weekAgo = new Date(now.getTime() - WEEK_MS).toISOString();

  const { rows } = (await sqlite.execute({
    sql: `
      SELECT w.body_of_water, b.slug, w.measurement_site, w.water_temperature, w.measured_at
      FROM water_temperatures w
      JOIN bodies_of_water b
        ON b.category_id = w.category_id AND b.name = w.body_of_water
      WHERE w.category_id = ?
        AND w.measured_at >= ?
      ORDER BY w.body_of_water ASC, w.measured_at ASC
    `,
    args: [categoryId, weekAgo],
  })) as unknown as { rows: Row[] };

  // Group rows by body_of_water, preserving ASC time order for path generation.
  const bodyMap = new Map<string, { row: Row; data: WaterDataPoint[] }>();
  for (const r of rows) {
    let body = bodyMap.get(r.body_of_water);
    if (!body) {
      body = { row: r, data: [] };
      bodyMap.set(r.body_of_water, body);
    }
    body.data.push({
      measured_at: r.measured_at,
      water_temperature: r.water_temperature,
    });
    // Keep the latest reading as the "current" reading.
    body.row = r;
  }

  const pathGen = line<[number, number]>()
    .x((d) => d[0])
    .y((d) => d[1])
    .curve(curveNatural);

  const bodies: WaterBody[] = [...bodyMap.values()].map(({ row, data }) => {
    const points: [number, number][] = data.map((d) => [
      weekTimeValue(d.measured_at, now),
      tempToY(d.water_temperature),
    ]);
    return {
      body_of_water: row.body_of_water,
      slug: row.slug,
      measurement_site: row.measurement_site,
      water_temperature: row.water_temperature,
      measured_at: row.measured_at,
      path: pathGen(points) ?? "",
      data,
    };
  });

  return Response.json(
    { category: categoryParam, bodies },
    { headers: { "Cache-Control": "public, max-age=600" } },
  );
}
```

- [ ] **Step 2: Verify the lakes endpoint returns week data + paths**

Run `fetch_val_endpoint` on `fgeierst/muenchen-plantscht-v2` path `api/water-temperatures.ts` with `search: "?category=lakes"`.
Expected: HTTP 200. JSON body has `bodies` array where each body has `path` (non-empty string like `"M3,100C…"`) and `data` (array of `{ measured_at, water_temperature }`). The `water_temperature` and `measured_at` fields at the body level hold the latest reading.

- [ ] **Step 3: Verify the rivers endpoint returns week data + paths**

Run `fetch_val_endpoint` on `fgeierst/muenchen-plantscht-v2` path `api/water-temperatures.ts` with `search: "?category=rivers"`.
Expected: HTTP 200. Same shape, with river bodies.

- [ ] **Step 4: Verify invalid category still returns 400**

Run `fetch_val_endpoint` on `fgeierst/muenchen-plantscht-v2` path `api/water-temperatures.ts` with `search: "?category=puddles"`.
Expected: HTTP 400 with `{ "error": "Invalid category 'puddles'. Use 'lakes' or 'rivers'." }`.

- [ ] **Step 5: Verify (commit)**

Val Town auto-versions. Steps 2–4 passing is the gate.

---

### Task 3: Frontend — water API client + WaterCard + WaterGrid

**Files:**

- Create: `src/lib/water.ts`
- Create: `src/components/WaterCard.svelte`
- Create: `src/components/WaterGrid.svelte`
- Modify: `.env.example`
- Test: `vp check` (type checking)

**Interfaces:**

- Consumes: The water API response shape from Task 2.
- Produces: `fetchWaterTemperatures(fetchFn, category)` used by `+page.ts` files (Task 4).
- Produces: `<WaterGrid bodies={…} />` and `<WaterCard body={…} />` components used by `+page.svelte` files (Task 4).

- [ ] **Step 1: Create `src/lib/water.ts`**

```ts
import { env } from "$env/dynamic/public";

const API_BASE = env.PUBLIC_WATER_API ?? "https://muenchen-plantscht-water.val.run";

export interface WaterDataPoint {
  measured_at: string;
  water_temperature: number;
}

export interface WaterBody {
  body_of_water: string;
  slug: string;
  measurement_site: string;
  water_temperature: number;
  measured_at: string;
  path: string;
  data: WaterDataPoint[];
}

export interface WaterResponse {
  category: string;
  bodies: WaterBody[];
}

export type WaterCategory = "lakes" | "rivers";

export async function fetchWaterTemperatures(
  fetchFn: typeof fetch,
  category: WaterCategory,
): Promise<WaterResponse> {
  const res = await fetchFn(`${API_BASE}/?category=${category}`);
  if (!res.ok) throw new Error(`Water API ${res.status}`);
  return (await res.json()) as WaterResponse;
}
```

- [ ] **Step 2: Create `src/components/WaterCard.svelte`**

```svelte
<script lang="ts">
	import type { WaterBody } from "$lib/water";

	let { body }: { body: WaterBody } = $props();
</script>

<li>
	<span class="temperature">{body.water_temperature.toFixed(0)}°</span>
	<svg viewBox="0 0 200 110" aria-hidden="true">
		<path d={body.path} />
	</svg>
	<h2 class="name">{body.body_of_water}</h2>
</li>

<style>
	li {
		display: flex;
		flex-direction: column;
	}

	.temperature {
		font-size: 2em;
	}

	svg {
		width: 100%;
		height: auto;
		fill: none;
	}

	path {
		stroke: var(--munich-black);
		stroke-width: 2;
	}

	.name {
		font-size: inherit;
		font-weight: inherit;
		margin: 0;
		margin-block-start: 0.3rem;
	}
</style>
```

- [ ] **Step 3: Create `src/components/WaterGrid.svelte`**

```svelte
<script lang="ts">
	import type { WaterBody } from "$lib/water";
	import WaterCard from "./WaterCard.svelte";

	let { bodies }: { bodies: WaterBody[] } = $props();

	const hasData = $derived(bodies.length > 0);
</script>

{#if hasData}
	<ul>
		{#each bodies as body (body.slug)}
			<WaterCard {body} />
		{/each}
	</ul>
{:else}
	<p>No data available.</p>
{/if}

<style>
	ul {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 2rem 0.5rem;
	}

	@media (max-width: 600px) {
		ul {
			grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
		}
	}
</style>
```

- [ ] **Step 4: Add `PUBLIC_WATER_API` to `.env.example`**

Append to the existing `.env.example` file:

```
PUBLIC_WATER_API=https://muenchen-plantscht-water.val.run
```

The full file should read:

```
# Public URL of the München Planscht pools API (Val Town backend).
# Override in .env for local/staging; falls back to production if unset.
PUBLIC_POOLS_API=https://muenchen-plantscht-pools.val.run

# Public URL of the water temperatures API (Val Town backend).
PUBLIC_WATER_API=https://muenchen-plantscht-water.val.run
```

- [ ] **Step 5: Run type check**

Run: `vp check`
Expected: PASS — no type errors in the new files.

- [ ] **Step 6: Verify (commit)**

```bash
git add src/lib/water.ts src/components/WaterCard.svelte src/components/WaterGrid.svelte .env.example
git commit -m "feat: add WaterCard, WaterGrid, and water API client"
```

---

### Task 4: Frontend — lakes and rivers routes + nav + header + footer + layout fix

**Files:**

- Create: `src/routes/lakes/+page.ts`
- Create: `src/routes/lakes/+page.svelte`
- Create: `src/routes/rivers/+page.ts`
- Create: `src/routes/rivers/+page.svelte`
- Modify: `src/routes/+layout.ts` — catch pool API failures so water pages work independently.
- Modify: `src/components/Nav.svelte` — add Lakes and Rivers entries.
- Modify: `src/components/Header.svelte` — add page titles.
- Modify: `src/components/Footer.svelte` — add GKD Bayern credit.
- Test: `vp check` + dev server.

**Interfaces:**

- Consumes: `fetchWaterTemperatures` from `$lib/water` (Task 3).
- Consumes: `<WaterGrid>` component (Task 3).

- [ ] **Step 1: Create `src/routes/lakes/+page.ts`**

```ts
import { fetchWaterTemperatures, type WaterResponse } from "$lib/water";
import type { PageLoad } from "./$types";

export const load = (async ({ fetch }) => {
  const water = await fetchWaterTemperatures(fetch, "lakes").catch((): WaterResponse => ({
    category: "lakes",
    bodies: [],
  }));
  return { water };
}) satisfies PageLoad;
```

- [ ] **Step 2: Create `src/routes/lakes/+page.svelte`**

```svelte
<script lang="ts">
	import WaterGrid from "../../components/WaterGrid.svelte";
	import type { PageData } from "./$types";

	let { data }: { data: PageData } = $props();
</script>

<WaterGrid bodies={data.water.bodies} />
```

- [ ] **Step 3: Create `src/routes/rivers/+page.ts`**

```ts
import { fetchWaterTemperatures, type WaterResponse } from "$lib/water";
import type { PageLoad } from "./$types";

export const load = (async ({ fetch }) => {
  const water = await fetchWaterTemperatures(fetch, "rivers").catch((): WaterResponse => ({
    category: "rivers",
    bodies: [],
  }));
  return { water };
}) satisfies PageLoad;
```

- [ ] **Step 4: Create `src/routes/rivers/+page.svelte`**

```svelte
<script lang="ts">
	import WaterGrid from "../../components/WaterGrid.svelte";
	import type { PageData } from "./$types";

	let { data }: { data: PageData } = $props();
</script>

<WaterGrid bodies={data.water.bodies} />
```

- [ ] **Step 5: Modify `src/routes/+layout.ts` — catch pool API failures**

Replace the entire file with:

```ts
import {
  berlinToday,
  daysAgo,
  fetchPools,
  type LocationWithComparison,
  type PoolsResponse,
} from "$lib/pools";
import type { LayoutLoad } from "./$types";

export const ssr = false;

export const load = (async ({ fetch, url }) => {
  const date = url.searchParams.get("date") ?? berlinToday();
  const weekAgo = daysAgo(date, 7);

  const [today, prior] = await Promise.all([
    fetchPools(fetch, date).catch((): PoolsResponse => ({ date, locations: [] })),
    fetchPools(fetch, weekAgo).catch((): PoolsResponse => ({ date: weekAgo, locations: [] })),
  ]);

  // Index prior week's area paths by area_id for the comparison line.
  const priorPath = new Map<number, string | null>();
  for (const loc of prior.locations ?? []) {
    for (const area of loc.areas ?? []) {
      priorPath.set(area.area_id, area.path ?? null);
    }
  }

  const locations: LocationWithComparison[] = (today.locations ?? []).map((loc) => ({
    location_id: loc.location_id,
    location_name: loc.location_name,
    areas: (loc.areas ?? []).map((area) => ({
      ...area,
      path2: priorPath.get(area.area_id) ?? null,
    })),
  }));

  return { date, locations };
}) satisfies LayoutLoad;
```

The only change from the existing file is adding `.catch()` to the first `fetchPools` call (previously only the second had it). This ensures the lakes/rivers pages don't break if the pools API is down.

- [ ] **Step 6: Modify `src/components/Nav.svelte` — add Lakes and Rivers entries**

Replace the `items` array with:

```ts
const items: { href: string; title: string }[] = [
  {
    href: base,
    title: "Pools",
  },
  {
    href: `${base}/saunas`,
    title: "Saunas",
  },
  {
    href: `${base}/lakes`,
    title: "Lakes",
  },
  {
    href: `${base}/rivers`,
    title: "Rivers",
  },
  {
    href: `${base}/favorites`,
    title: "Favorites",
  },
];
```

- [ ] **Step 7: Modify `src/components/Header.svelte` — add page titles**

Replace the `pageTitles` object with:

```ts
const pageTitles: Record<string, string> = {
  [base]: "Pools",
  [`${base}/saunas`]: "Saunas",
  [`${base}/lakes`]: "Lakes",
  [`${base}/rivers`]: "Rivers",
  [`${base}/favorites`]: "Favorites",
};
```

- [ ] **Step 8: Modify `src/components/Footer.svelte` — add GKD Bayern credit**

Replace the `<footer>` content with:

```svelte
<footer>
	Data from <a href="https://www.swm.de/baeder">Stadtwerke München</a> and
	<a href="https://www.gkd.bayern.de">GKD Bayern</a>.
	Made with <span class="icon"><Pretzel /></span> in Munich.
	<a href="https://florian.geierstanger.org/kontakt/">Imprint</a> |
	<a href="https://github.com/fgeierst/muenchen-plantscht">Github</a>
</footer>
```

- [ ] **Step 9: Run type check**

Run: `vp check`
Expected: PASS — no type errors.

- [ ] **Step 10: Verify in dev server**

Run: `vp dev`
Open `http://localhost:5173/mp/lakes` and `http://localhost:5173/mp/rivers`.
Expected: Both pages show a grid of water temperature cards with current temperature, SVG sparkline, and body-of-water name. The nav bar shows Lakes and Rivers links with `aria-current="page"` on the active one.

- [ ] **Step 11: Verify (commit)**

```bash
git add src/routes/lakes/ src/routes/rivers/ src/routes/+layout.ts src/components/Nav.svelte src/components/Header.svelte src/components/Footer.svelte
git commit -m "feat: add lakes and rivers pages with water temperature sparklines"
```

---

### Task 5: Frontend — e2e tests

**Files:**

- Create: `tests/water.test.ts`
- Test: `vp test`

**Interfaces:**

- Consumes: The lakes and rivers pages from Task 4.

- [ ] **Step 1: Create `tests/water.test.ts`**

```ts
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
```

- [ ] **Step 2: Run the tests**

Run: `vp test`
Expected: All 4 tests pass.

- [ ] **Step 3: Verify (commit)**

```bash
git add tests/water.test.ts
git commit -m "test: add e2e tests for lakes and rivers pages"
```

---

## Self-Review

**1. Spec coverage:** The user asked to "show lake and river temperatures in frontend" using "the same svg line approach as in pools/saunas" with "data of last week" displayed "below the current temperature." This is covered by:

- Task 1–2: Backend returns 7-day time series + SVG paths (same d3-shape `line` + `curveNatural` as pools).
- Task 3: `WaterCard` renders current temperature on top, SVG sparkline below, then name — matching the requested layout.
- Task 4: Lakes and rivers routes with nav entries.
- Task 5: E2e tests verify the feature works end-to-end.

**2. Placeholder scan:** No TBDs, TODOs, or "add error handling" stubs. Every step has complete code. Test assertions use exact expected values.

**3. Type consistency:** `WaterBody` (defined in `src/lib/water.ts` in Task 3) has fields `body_of_water`, `slug`, `measurement_site`, `water_temperature`, `measured_at`, `path`, `data` — matching the backend response shape defined in Task 2. `WaterDataPoint` has `measured_at` and `water_temperature` — matching the backend's `data` array. `fetchWaterTemperatures` returns `WaterResponse` with `category` and `bodies` — consumed by `+page.ts` in Task 4. `WaterGrid` takes `bodies: WaterBody[]` — consumed by `+page.svelte`. `WaterCard` takes `body: WaterBody` — consumed by `WaterGrid`.
