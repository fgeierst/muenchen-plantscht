# Prerendered Routes with Skeleton (Islands-Style) Implementation Plan

> **STATUS: ON HOLD — DO NOT IMPLEMENT YET**
> User has decided to hold off on implementation. The plan remains valid as a design reference, but no tasks should be executed until the hold is lifted.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 404 on deep-link reloads (e.g. `/mp/saunas`, `/mp/favorites`) by switching from SPA fallback to prerendered routes, while avoiding stale data by showing a skeleton in the prerendered HTML and fetching real data client-side after hydration.

**Architecture:** Replace `adapter-static`'s `fallback: "index.html"` (single SPA shell) with `prerender = true` + `ssr = true` so each route emits its own `index.html`. The layout's `load` function checks `browser` from `$app/environment`: during prerender it returns `{ locations: [], loading: true }` (no API fetch, no stale data baked in); on the client it runs the existing fetch logic. A `Skeleton.svelte` component renders placeholder cards during loading. `+layout.svelte`'s `onMount` calls `invalidateAll()` when `data.loading` is true, triggering the client-side refetch on first hydration of a prerendered page.

**Tech Stack:** SvelteKit 2.70, Svelte 5 runes, `@sveltejs/adapter-static` 3, TypeScript, Playwright e2e, Storybook.

## Global Constraints

- `kit.paths.base = "/mp"` in `svelte.config.js` — must be preserved (deploy target is `/mp/` subfolder on florian.geierstanger.org via FTP).
- `adapter-static` is already a devDependency — no new deps.
- Deploy target is a plain FTP host with no server-side rewrite capability (no `.htaccess`, no nginx config) — this is why prerendered files per route are the fix.
- Testing: `pnpm test:e2e` (Playwright, builds + previews), Storybook for component dev.
- Lint/format/typecheck: `vp check --fix` and `vp test`.
- No comments in code unless explicitly requested.
- Existing convention: commit messages use `feat:`, `fix:`, `test:`, `docs:` prefixes.

---

## File Structure

- **Create: `src/components/Skeleton.svelte`** — Reusable skeleton grid that mimics `AreaGrid`'s layout (grid of placeholder cards with pulsing animation). Used by all three page components during loading state.
- **Create: `src/components/Skeleton.stories.svelte`** — Storybook story for the Skeleton component, following the existing `AreaCard.stories.svelte` pattern.
- **Modify: `svelte.config.js`** — Remove `fallback: "index.html"` from adapter-static options. Keep `paths.base = "/mp"`.
- **Modify: `src/routes/+layout.ts`** — Replace `export const ssr = false` with `export const prerender = true` and `export const ssr = true`. Split `load` on `browser`: return skeleton on server, fetch on client. Add `loading` boolean to the return type. Harden the primary `today` fetch with `.catch()`.
- **Modify: `src/routes/+layout.svelte`** — Add `onMount` that calls `invalidateAll()` when `data.loading` is true (fires once on initial hydration of prerendered pages).
- **Modify: `src/routes/+page.svelte`** — Show `<Skeleton>` when `data.loading`, else `<AreaGrid>`.
- **Modify: `src/routes/saunas/+page.svelte`** — Show `<Skeleton>` when `data.loading`, else `<AreaGrid>`.
- **Modify: `src/routes/favorites/+page.svelte`** — Show `<Skeleton>` when `data.loading`, else existing favorites/empty-state logic.
- **Modify: `tests/test.ts`** — Replace the SPA-shell assertion (header NOT in HTML) with prerender assertions (header IN HTML, skeleton visible). Add deep-link reload tests for `/saunas` and `/favorites`.
- **Modify: `README.md`** — Update Deployment section to reflect prerender mode instead of SPA mode.

---

## Task 1: Create Skeleton Component

**Files:**

- Create: `src/components/Skeleton.svelte`
- Create: `src/components/Skeleton.stories.svelte`

**Interfaces:**

- Consumes: CSS variables `--munich-black` (defined in `src/routes/styles.css:3`), `--munich-blue` (defined in `src/routes/styles.css:2`).
- Produces: `<Skeleton />` Svelte 5 component with optional `count` prop (default `12`), renders a `<ul data-testid="skeleton">` of placeholder `<li>` cards matching `AreaGrid`'s grid layout.

- [ ] **Step 1: Create `src/components/Skeleton.svelte`**

```svelte
<script lang="ts">
	let { count = 12 }: { count?: number } = $props();
</script>

<ul class="skeleton-grid" aria-hidden="true" data-testid="skeleton">
	{#each Array(count) as _, i (i)}
		<li class="skeleton-card">
			<div class="skeleton-svg"></div>
			<div class="skeleton-header">
				<div class="skeleton-name"></div>
				<div class="skeleton-star"></div>
			</div>
			<div class="skeleton-capacity"></div>
		</li>
	{/each}
</ul>

<style>
	.skeleton-grid {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 2rem 0.5rem;
	}

	@media (max-width: 600px) {
		.skeleton-grid {
			grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
		}
	}

	.skeleton-card {
		display: flex;
		flex-direction: column;
	}

	.skeleton-svg,
	.skeleton-name,
	.skeleton-capacity,
	.skeleton-star {
		background: color-mix(in oklch, var(--munich-black) 8%, transparent);
		border-radius: 4px;
	}

	.skeleton-svg {
		aspect-ratio: 200 / 110;
	}

	.skeleton-header {
		display: flex;
		align-items: baseline;
		gap: 0.3rem;
		margin-block-start: 0.3rem;
	}

	.skeleton-name {
		height: 1.2em;
		width: 70%;
	}

	.skeleton-star {
		width: 1.2em;
		height: 1.2em;
		flex-shrink: 0;
		border-radius: 50%;
	}

	.skeleton-capacity {
		height: 1em;
		width: 40%;
		margin-block-start: 0.2rem;
	}

	@media (prefers-reduced-motion: no-preference) {
		.skeleton-svg,
		.skeleton-name,
		.skeleton-capacity,
		.skeleton-star {
			animation: skeleton-pulse 1.5s ease-in-out infinite;
		}
	}

	@keyframes skeleton-pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}
</style>
```

- [ ] **Step 2: Create `src/components/Skeleton.stories.svelte`**

```svelte
<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Skeleton from './Skeleton.svelte';

	const { Story } = defineMeta({
		title: 'Pools/Skeleton',
		component: Skeleton,
		tags: ['autodocs'],
		args: {
			count: 12,
		},
	});
</script>

<Story name="Default" />

<Story name="Few" args={{ count: 3 }} />
```

- [ ] **Step 3: Run `vp check` to verify types and formatting**

Run: `vp check --fix`
Expected: No errors. The Skeleton component compiles cleanly.

- [ ] **Step 4: Verify the story renders in Storybook**

Run: `pnpm storybook`
Expected: Storybook loads at `http://localhost:6006`, the `Pools/Skeleton` story shows a grid of 12 pulsing placeholder cards. The `Few` story shows 3 cards.

- [ ] **Step 5: Commit**

```bash
git add src/components/Skeleton.svelte src/components/Skeleton.stories.svelte
git commit -m "feat: add Skeleton component for loading state"
```

---

## Task 2: Switch to Prerendered Routes with Client-Side Data Fetch

**Files:**

- Modify: `svelte.config.js:8-13`
- Modify: `src/routes/+layout.ts` (full rewrite of the file)
- Modify: `src/routes/+layout.svelte` (add onMount + invalidateAll)
- Modify: `src/routes/+page.svelte` (add skeleton branch)
- Modify: `src/routes/saunas/+page.svelte` (add skeleton branch)
- Modify: `src/routes/favorites/+page.svelte` (add skeleton branch)
- Modify: `tests/test.ts` (replace SPA test, add deep-link reload tests)
- Modify: `README.md:33-36` (update Deployment section)

**Interfaces:**

- Consumes: `<Skeleton />` from Task 1 (component with optional `count` prop, `data-testid="skeleton"` on the `<ul>`).
- Consumes: `browser` from `$app/environment` (boolean — `false` during SSR/prerender, `true` in browser).
- Consumes: `invalidateAll` from `$app/navigation` (returns `Promise<void>`, re-runs all load functions on the client).
- Produces: `data.loading` boolean on `LayoutData` / `PageData` — `true` when the layout's load returned skeleton state (prerendered HTML or pre-hydration), `false` after client-side refetch completes.

- [ ] **Step 1: Write the failing e2e tests**

Replace the entire contents of `tests/test.ts` with:

```ts
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("pools page prerenders header and skeleton in initial HTML", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  const html = (await response?.text()) ?? "";
  // Prerender mode: header IS in the initial HTML (not an empty SPA shell).
  expect(html).toContain("München Plantscht");
  // Skeleton is prerendered — no stale API data baked in.
  await expect(page.getByTestId("skeleton")).toBeVisible();
});

test("reloading /saunas serves a prerendered page (no 404)", async ({ page }) => {
  const response = await page.goto("saunas");
  expect(response?.status()).toBe(200);
  const html = (await response?.text()) ?? "";
  expect(html).toContain("München Plantscht");
  await expect(page.getByTestId("skeleton")).toBeVisible();
});

test("reloading /favorites serves a prerendered page (no 404)", async ({ page }) => {
  const response = await page.goto("favorites");
  expect(response?.status()).toBe(200);
  const html = (await response?.text()) ?? "";
  expect(html).toContain("München Plantscht");
});

test("pools page has no axe accessibility violations", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "München Plantscht" })).toBeVisible();
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"])
    .analyze();
  expect(results.violations).toEqual([]);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test:e2e`
Expected: FAIL. The first test fails because `expect(html).toContain("München Plantscht")` fails — the current SPA mode emits an empty shell with no header. The second and third tests fail because `getByTestId("skeleton")` finds no element (Skeleton component doesn't exist yet in the rendered output).

- [ ] **Step 3: Remove `fallback` from `svelte.config.js`**

In `svelte.config.js`, replace the adapter block. Change:

```js
    adapter: adapter({
      // SPA fallback: a single shell HTML file is generated and the router
      // takes over in the browser. Named index.html so directory requests
      // to /mp/ resolve on a plain FTP host.
      fallback: "index.html",
    }),
```

To:

```js
    adapter: adapter(),
```

- [ ] **Step 4: Rewrite `src/routes/+layout.ts`**

Replace the entire file with:

```ts
import { browser } from "$app/environment";
import {
  berlinToday,
  daysAgo,
  fetchPools,
  type LocationWithComparison,
  type PoolsResponse,
} from "$lib/pools";
import type { LayoutLoad } from "./$types";

export const prerender = true;
export const ssr = true;

export const load = (async ({ fetch, url }) => {
  const date = url.searchParams.get("date") ?? berlinToday();

  if (!browser) {
    return { date, locations: [], loading: true };
  }

  const weekAgo = daysAgo(date, 7);

  const [today, prior] = await Promise.all([
    fetchPools(fetch, date).catch((): PoolsResponse => ({ date, locations: [] })),
    fetchPools(fetch, weekAgo).catch((): PoolsResponse => ({ date: weekAgo, locations: [] })),
  ]);

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

  return { date, locations, loading: false };
}) satisfies LayoutLoad;
```

- [ ] **Step 5: Add `onMount` + `invalidateAll` to `src/routes/+layout.svelte`**

Replace the entire file with:

```svelte
<script>
	import { onMount } from "svelte";
	import { invalidateAll } from "$app/navigation";
	import Header from "../components/Header.svelte";
	import Footer from "../components/Footer.svelte";
	import "./styles.css";

	let { data } = $props();

	onMount(() => {
		if (data.loading) {
			void invalidateAll();
		}
	});
</script>

<div class="app">
	<Header />
	<main>
		<slot />
	</main>
	<Footer />
</div>

<style>
	.app {
		height: 120vh;
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	main {
		flex-grow: 1;
	}
</style>
```

- [ ] **Step 6: Add skeleton branch to `src/routes/+page.svelte`**

Replace the entire file with:

```svelte
<script lang="ts">
	import AreaGrid from "../components/AreaGrid.svelte";
	import Skeleton from "../components/Skeleton.svelte";
	import { areaType } from "$lib/pools";
	import type { PageData } from "./$types";

	let { data }: { data: PageData } = $props();

	const areas = $derived(
		data.locations
			.flatMap((loc) => loc.areas)
			.filter((a) => areaType(a.area_name) === "pool"),
	);
</script>

{#if data.loading}
	<Skeleton />
{:else}
	<AreaGrid {areas} />
{/if}
```

- [ ] **Step 7: Add skeleton branch to `src/routes/saunas/+page.svelte`**

Replace the entire file with:

```svelte
<script lang="ts">
	import AreaGrid from "../../components/AreaGrid.svelte";
	import Skeleton from "../../components/Skeleton.svelte";
	import { areaType } from "$lib/pools";
	import type { PageData } from "../$types";

	let { data }: { data: PageData } = $props();

	const areas = $derived(
		data.locations
			.flatMap((loc) => loc.areas)
			.filter((a) => areaType(a.area_name) === "sauna"),
	);
</script>

{#if data.loading}
	<Skeleton />
{:else}
	<AreaGrid {areas} />
{/if}
```

- [ ] **Step 8: Add skeleton branch to `src/routes/favorites/+page.svelte`**

Replace the entire file with:

```svelte
<script lang="ts">
	import AreaGrid from "../../components/AreaGrid.svelte";
	import Skeleton from "../../components/Skeleton.svelte";
	import { getFavoriteIds } from "$lib/favorites.svelte";
	import type { PageData } from "./$types";

	let { data }: { data: PageData } = $props();

	const areas = $derived.by(() => {
		const ids = new Set(getFavoriteIds());
		return data.locations
			.flatMap((loc) => loc.areas)
			.filter((a) => ids.has(a.area_id));
	});
</script>

{#if data.loading}
	<Skeleton />
{:else if areas.length > 0}
	<AreaGrid {areas} />
{:else}
	<p class="empty">No favorites yet. Tap the star next to an area name to add it here.</p>
{/if}

<style>
	.empty {
		margin-block-start: 2rem;
	}
</style>
```

- [ ] **Step 9: Run `vp check` to verify types and formatting**

Run: `vp check --fix`
Expected: No errors. The `data.loading` property is inferred from the layout's `load` return type and available on `PageData` in all page components.

- [ ] **Step 10: Run the e2e tests to verify they pass**

Run: `pnpm test:e2e`
Expected: PASS. All four tests in `tests/test.ts` pass. The existing tests in `tests/favorites.test.ts` and `tests/split.test.ts` also pass — they mock the API via `page.route()`, which intercepts the client-side fetch triggered by `invalidateAll()` after hydration.

- [ ] **Step 11: Verify the build output structure**

Run: `pnpm build`
Then verify that each route has its own `index.html`:

```bash
ls build/index.html build/saunas/index.html build/favorites/index.html
```

Expected: All three files exist. This is the fix — the FTP host serves real files at each path, no 404.

- [ ] **Step 12: Update `README.md` Deployment section**

In `README.md`, replace lines 33-36. Change:

```markdown
The frontend is a static SPA built with
[`@sveltejs/adapter-static`](https://kit.svelte.dev/docs/adapter-static) in SPA
mode (`ssr = false`, fallback `index.html`). It deploys via GitHub Actions over
FTPS to the `/mp/` subfolder of the florian.geierstanger.org server.
```

To:

```markdown
The frontend is a prerendered static site built with
[`@sveltejs/adapter-static`](https://kit.svelte.dev/docs/adapter-static). Each
route is prerendered to its own `index.html` (skeleton shell — real data is
fetched client-side after hydration via `invalidateAll`). It deploys via GitHub
Actions over FTPS to the `/mp/` subfolder of the florian.geierstanger.org server.
```

- [ ] **Step 13: Commit**

```bash
git add svelte.config.js src/routes/+layout.ts src/routes/+layout.svelte \
  src/routes/+page.svelte src/routes/saunas/+page.svelte src/routes/favorites/+page.svelte \
  tests/test.ts README.md
git commit -m "feat: switch to prerendered routes with client-side data fetch"
```
