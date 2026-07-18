# Split Pools and Saunas into Separate Pages — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the single all-areas page into two pages: `/` (pools — indoor + outdoor) and `/saunas` (saunas), using client-side classification of area names.

**Architecture:** The existing `load` function (currently in `+page.ts`) moves to `+layout.ts` so both routes share one fetch. An `AreaGrid` component extracts the shared grid + "last updated" rendering. Each page filters the shared data via a pure `areaType()` helper that matches `/sauna/i` on `area_name`. Nav gains a second entry. No backend changes.

**Tech Stack:** SvelteKit 2 (SPA mode, `ssr = false`, `@sveltejs/adapter-static`), Svelte 5 runes, TypeScript, Playwright e2e tests.

## Global Constraints

- Base path `/mp` set in `svelte.config.js:15` — internal links use `base` from `$app/paths`.
- `ssr = false` in `src/routes/+layout.ts` — app is a client-side SPA.
- API URL defaults to `https://muenchen-plantscht-pools.val.run` (overridable via `PUBLIC_POOLS_API` env var in `.env`).
- Area type derived client-side: `area_name` containing "Sauna" (case-insensitive) → `"sauna"`; everything else (Hallenbad, Freibad, wave pool, etc.) → `"pool"`.
- `.svelte` files use **tab** indentation; `.ts` files use **2-space** indentation (match existing files).
- Component imports are relative (`../components/...`); lib/type imports use `$lib/...` (match existing convention in `+page.svelte`, `AreaCard.svelte`).
- Verification commands: `vp check` (svelte-check typecheck), `pnpm test:e2e` (Playwright e2e — builds + previews + tests).

---

### Task 1: Add `areaType` helper to `pools.ts`

**Files:**

- Modify: `src/lib/pools.ts` (append after existing exports, before EOF at line 66)

**Interfaces:**

- Produces: `AreaType` type (`"pool" | "sauna"`) and `areaType(areaName: string): AreaType` function, exported from `$lib/pools`.

- [ ] **Step 1: Add the helper to `src/lib/pools.ts`**

Append after the `fetchPools` function (after line 66):

```ts
/** Area category for page-level routing. */
export type AreaType = "pool" | "sauna";

/**
 * Derive the area type from its name. The SWM feed has no explicit type
 * field, so we match on the "Sauna" suffix. Everything else (Hallenbad,
 * Freibad, wave pool, ...) is treated as a pool.
 */
export function areaType(areaName: string): AreaType {
  return /sauna/i.test(areaName) ? "sauna" : "pool";
}
```

- [ ] **Step 2: Run typecheck to verify it compiles**

Run: `vp check`
Expected: PASS (no errors). The new exports are unused for now but valid TypeScript.

- [ ] **Step 3: Commit**

```bash
git add src/lib/pools.ts
git commit -m "feat: add areaType helper for client-side area classification"
```

---

### Task 2: Extract `AreaGrid` component

**Files:**

- Create: `src/components/AreaGrid.svelte`
- Modify: `src/routes/+page.svelte` (replace inline grid with `<AreaGrid>`)

**Interfaces:**

- Consumes: `AreaWithComparison` from `$lib/pools` (existing type).
- Produces: `AreaGrid` Svelte component with prop `{ areas: AreaWithComparison[] }`.

**Why:** Both the pools and saunas pages will render the same grid + "last updated" note. Extracting it now (as a pure refactor with no behavior change) keeps the split task focused on routing.

- [ ] **Step 1: Create `src/components/AreaGrid.svelte`**

This is the grid markup and `lastUpdated` / `formatUpdated` logic moved verbatim from the current `+page.svelte`:

```svelte
<script lang="ts">
	import type { AreaWithComparison } from "$lib/pools";
	import AreaCard from "./AreaCard.svelte";

	let { areas }: { areas: AreaWithComparison[] } = $props();

	const hasData = $derived(areas.length > 0);

	/** Most recent recorded_at across all areas, for the "last updated" note. */
	const lastUpdated = $derived.by(() => {
		let latest: string | null = null;
		for (const area of areas) {
			const at = area.latest?.recorded_at;
			if (at && (!latest || at > latest)) latest = at;
		}
		return latest;
	});

	function formatUpdated(iso: string): string {
		const d = new Date(iso);
		const day = d.toLocaleDateString("de-DE", {
			day: "numeric",
			month: "short",
			timeZone: "Europe/Berlin",
		});
		const time = d.toLocaleTimeString("de-DE", {
			hour: "numeric",
			minute: "numeric",
			timeZone: "Europe/Berlin",
		});
		return `${day}, ${time}`;
	}
</script>

{#if hasData}
	<ul>
		{#each areas as area (area.area_id)}
			<AreaCard {area} />
		{/each}
	</ul>

	{#if lastUpdated}
		<p class="last-updated">
			Last updated: {formatUpdated(lastUpdated)}. Comparison data (grey line) is
			from one week earlier.
		</p>
	{/if}
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

	.last-updated {
		margin-block: 4rem 2rem;
	}
</style>
```

- [ ] **Step 2: Replace `src/routes/+page.svelte` to use `AreaGrid`**

Replace the entire file content with:

```svelte
<script lang="ts">
	import AreaGrid from "../components/AreaGrid.svelte";
	import type { LocationWithComparison } from "$lib/pools";

	type Data = {
		date: string;
		locations: LocationWithComparison[];
	};

	let { data }: { data: Data } = $props();

	/** All areas across every location, flattened into a single list. */
	const areas = $derived(data.locations.flatMap((loc) => loc.areas));
</script>

<AreaGrid {areas} />
```

- [ ] **Step 3: Run typecheck**

Run: `vp check`
Expected: PASS — `AreaGrid` props match, `areas` type is `AreaWithComparison[]`.

- [ ] **Step 4: Run existing e2e tests to verify no behavior change**

Run: `pnpm test:e2e`
Expected: Both existing tests in `tests/test.ts` PASS (SPA shell test + axe a11y test). The page renders identically — only the component boundary changed.

- [ ] **Step 5: Commit**

```bash
git add src/components/AreaGrid.svelte src/routes/+page.svelte
git commit -m "refactor: extract AreaGrid component from +page.svelte"
```

---

### Task 3: Move `load` from `+page.ts` to `+layout.ts`

**Files:**

- Modify: `src/routes/+layout.ts` (add load function, keep `export const ssr = false`)
- Delete: `src/routes/+page.ts` (logic moves to layout)

**Interfaces:**

- Produces: `+layout.ts` load returns `{ date: string; locations: LocationWithComparison[] }`, available as `data` prop to all child page components (both `/+page.svelte` and future `/saunas/+page.svelte`).

**Why:** Both pages need the same fetched data. Moving the load to the layout means one fetch shared across route navigations — no duplicate API calls when switching tabs.

- [ ] **Step 1: Replace `src/routes/+layout.ts` with the load function**

Replace the entire file (currently just `export const ssr = false;`) with:

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
    fetchPools(fetch, date),
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

- [ ] **Step 2: Delete `src/routes/+page.ts`**

```bash
git rm src/routes/+page.ts
```

The `+page.svelte` at `/` still receives `data` (SvelteKit merges layout load data into the page's `data` prop), so no changes to `+page.svelte` are needed.

- [ ] **Step 3: Run typecheck**

Run: `vp check`
Expected: PASS. `+page.svelte`'s `Data` type still matches the layout load's return shape.

- [ ] **Step 4: Run e2e tests to verify no behavior change**

Run: `pnpm test:e2e`
Expected: Both existing tests PASS. Data loads identically — only the load location changed.

- [ ] **Step 5: Commit**

```bash
git add src/routes/+layout.ts
git commit -m "refactor: move pool data load from +page.ts to +layout.ts"
```

---

### Task 4: Split into pools + saunas pages with nav and e2e tests

**Files:**

- Modify: `src/routes/+page.svelte` (filter to pool areas only)
- Create: `src/routes/saunas/+page.svelte` (filter to sauna areas)
- Modify: `src/components/Nav.svelte` (add "Saunas" entry)
- Create: `tests/split.test.ts` (e2e tests for filtering + nav)

**Interfaces:**

- Consumes: `areaType` from Task 1, `AreaGrid` from Task 2, layout load data from Task 3.
- Produces: `/` route showing only pool areas; `/saunas` route showing only sauna areas; Nav with two entries.

- [ ] **Step 1: Write the failing e2e test**

Create `tests/split.test.ts`:

```ts
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
  await page.goto("/saunas");
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test:e2e`
Expected: FAIL — `/saunas` route does not exist yet (404 or no data renders), and nav has no "Saunas" link. The "pools page" test may pass if `/` still shows all areas, but the "saunas" and "nav" tests will fail.

- [ ] **Step 3: Modify `src/routes/+page.svelte` to filter pool areas**

Replace the entire file with:

```svelte
<script lang="ts">
	import AreaGrid from "../components/AreaGrid.svelte";
	import { areaType, type LocationWithComparison } from "$lib/pools";

	type Data = {
		date: string;
		locations: LocationWithComparison[];
	};

	let { data }: { data: Data } = $props();

	/** All pool areas (indoor + outdoor), excluding saunas. */
	const areas = $derived(
		data.locations
			.flatMap((loc) => loc.areas)
			.filter((a) => areaType(a.area_name) === "pool"),
	);
</script>

<AreaGrid {areas} />
```

- [ ] **Step 4: Create `src/routes/saunas/+page.svelte`**

```svelte
<script lang="ts">
	import AreaGrid from "../../components/AreaGrid.svelte";
	import { areaType, type LocationWithComparison } from "$lib/pools";

	type Data = {
		date: string;
		locations: LocationWithComparison[];
	};

	let { data }: { data: Data } = $props();

	/** All sauna areas. */
	const areas = $derived(
		data.locations
			.flatMap((loc) => loc.areas)
			.filter((a) => areaType(a.area_name) === "sauna"),
	);
</script>

<AreaGrid {areas} />
```

- [ ] **Step 5: Update `src/components/Nav.svelte` with two entries**

Replace the `items` array (lines 4-9) with:

```svelte
	const items: { href: string; title: string }[] = [
		{
			href: base,
			title: "Pools",
		},
		{
			href: `${base}/saunas`,
			title: "Saunas",
		},
	];
```

The existing `aria-current` logic (line 14) already handles highlighting: `pathname.replace(/\/+$/, "") === href` matches `/mp` for Pools and `/mp/saunas` for Saunas.

- [ ] **Step 6: Run typecheck**

Run: `vp check`
Expected: PASS — `areaType` imported correctly, `AreaGrid` props match, relative paths resolve.

- [ ] **Step 7: Run e2e tests to verify they pass**

Run: `pnpm test:e2e`
Expected: All tests PASS — both the existing `tests/test.ts` tests (SPA shell + axe at `/`) and the new `tests/split.test.ts` tests (filtering + nav).

- [ ] **Step 8: Commit**

```bash
git add src/routes/+page.svelte src/routes/saunas/+page.svelte src/components/Nav.svelte tests/split.test.ts
git commit -m "feat: split pools and saunas into separate pages"
```
