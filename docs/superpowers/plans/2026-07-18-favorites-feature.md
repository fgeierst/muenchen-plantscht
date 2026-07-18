# Favorites Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let users star areas to favorite them, show favorited areas on a dedicated `/favorites` page, and use that page as the landing page when favorites exist.

**Architecture:** A reactive favorites store (`SvelteSet` backed by `localStorage`) is consumed by `AreaCard` (star toggle button), a new `/favorites` route (filtered `AreaGrid`), and `+layout.svelte` (`onMount` redirect to `/favorites` on initial load when favorites exist). The redirect fires only on full page loads — client-side navigation to `/` via the "Pools" nav link is unaffected.

**Tech Stack:** SvelteKit 2 (SPA mode, `ssr = false`), Svelte 5 runes + `svelte/reactivity`, TypeScript, Playwright e2e tests.

## Global Constraints

- Base path `/mp` set in `svelte.config.js` — internal links use `base` from `$app/paths`.
- `ssr = false` in `src/routes/+layout.ts` — app is a client-side SPA; `localStorage` is always available.
- `.svelte` files use **tab** indentation; `.ts` files use **2-space** indentation (match existing files).
- Component imports are relative (`../components/...`); lib/type imports use `$lib/...`.
- Files using Svelte 5 runes (`$state`, `$derived`, etc.) must use `.svelte.ts` extension.
- Verification commands: `vp check` (svelte-check typecheck), `pnpm test:e2e` (Playwright e2e — builds + previews + tests).
- localStorage key: `mp-favorites` (JSON array of `area_id` numbers).
- Existing e2e tests (`tests/test.ts`, `tests/split.test.ts`) run in fresh browser contexts (no localStorage) so the redirect never fires — they continue to pass unchanged.

---

### Task 1: Create favorites store

**Files:**

- Create: `src/lib/favorites.svelte.ts`

**Interfaces:**

- Produces:
  - `getFavoriteIds(): number[]` — returns a snapshot of favorited area IDs.
  - `isFavorite(areaId: number): boolean` — reactive when called inside `$derived` or `$effect`.
  - `toggleFavorite(areaId: number): void` — adds or removes an area ID, then persists to `localStorage`.
  - `hasFavorites(): boolean` — returns `true` if at least one favorite exists.

**Why:** A single reactive module backed by `localStorage` gives every component (AreaCard, favorites page, layout redirect) a shared source of truth without prop-drilling. `SvelteSet` from `svelte/reactivity` makes mutations trackable in Svelte 5 runes.

- [ ] **Step 1: Create `src/lib/favorites.svelte.ts`**

```ts
import { SvelteSet } from "svelte/reactivity";

const STORAGE_KEY = "mp-favorites";

/** Read favorited area IDs from localStorage. Returns [] on any error. */
function load(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const ids = JSON.parse(raw) as unknown;
    if (!Array.isArray(ids)) return [];
    return ids.filter((n): n is number => typeof n === "number");
  } catch {
    return [];
  }
}

const favorites = new SvelteSet<number>(load());

/** Persist the current set to localStorage. */
function persist(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...favorites]));
  } catch {
    // Ignore quota or serialization errors.
  }
}

/** Snapshot of all favorited area IDs. */
export function getFavoriteIds(): number[] {
  return [...favorites];
}

/** Reactive check — safe to call inside `$derived` or `$effect`. */
export function isFavorite(areaId: number): boolean {
  return favorites.has(areaId);
}

/** Toggle an area in/out of favorites and persist. */
export function toggleFavorite(areaId: number): void {
  if (favorites.has(areaId)) {
    favorites.delete(areaId);
  } else {
    favorites.add(areaId);
  }
  persist();
}

/** Whether at least one favorite exists. */
export function hasFavorites(): boolean {
  return favorites.size > 0;
}
```

- [ ] **Step 2: Run typecheck to verify it compiles**

Run: `vp check`
Expected: PASS (no errors). The new module is unused for now but valid TypeScript.

- [ ] **Step 3: Commit**

```bash
git add src/lib/favorites.svelte.ts
git commit -m "feat: add favorites store backed by localStorage"
```

---

### Task 2: Create Star icon and add star button to AreaCard

**Files:**

- Create: `src/lib/icons/Star.svelte`
- Modify: `src/components/AreaCard.svelte`

**Interfaces:**

- Consumes: `isFavorite` and `toggleFavorite` from Task 1 (`$lib/favorites.svelte`).
- Produces: `AreaCard` now renders a star toggle button next to the `<h2>` area name. The button has `aria-pressed` reflecting favorite state and an `aria-label` of `"Favorite {area_name}"` / `"Unfavorite {area_name}"`.

**Why:** The star button is the primary interaction for favoriting. Placing it next to the `<h2>` keeps it visually associated with the area name. A dedicated `Star.svelte` icon keeps the SVG reusable.

- [ ] **Step 1: Create `src/lib/icons/Star.svelte`**

```svelte
<script lang="ts">
	let { filled = false }: { filled?: boolean } = $props();
</script>

<svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">
	<path
		fill={filled ? "currentColor" : "none"}
		stroke="currentColor"
		stroke-width="2"
		stroke-linejoin="round"
		d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
	/>
</svg>
```

- [ ] **Step 2: Replace `src/components/AreaCard.svelte` with star button**

Replace the entire file with:

```svelte
<script lang="ts">
	import type { AreaWithComparison } from "$lib/pools";
	import { isFavorite, toggleFavorite } from "$lib/favorites.svelte";
	import Star from "$lib/icons/Star.svelte";

	let { area }: { area: AreaWithComparison } = $props();
	const favorited = $derived(isFavorite(area.area_id));
</script>

<li>
	<svg viewBox="0 0 200 110" aria-hidden="true">
		{#if area.path2}
			<path d={area.path2} class="path2"></path>
		{/if}
		<path d={area.path}></path>
	</svg>
	<div class="header">
		<h2 class="name">{area.area_name}</h2>
		<button
			class="star-btn"
			type="button"
			aria-pressed={favorited}
			aria-label={favorited
				? `Unfavorite ${area.area_name}`
				: `Favorite ${area.area_name}`}
			onclick={() => toggleFavorite(area.area_id)}
		>
			<Star filled={favorited} />
		</button>
	</div>
	<span class="capacity">
		{area.latest ? `${area.latest.capacity_free_pct}% free` : "–"}
	</span>
</li>

<style>
	li {
		display: flex;
		flex-direction: column;
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

	.path2 {
		opacity: 0.12;
	}

	.header {
		display: flex;
		align-items: baseline;
		gap: 0.3rem;
		margin-block-start: 0.3rem;
	}

	.name {
		font-size: inherit;
		font-weight: inherit;
		margin: 0;
	}

	.star-btn {
		flex-shrink: 0;
		padding: 0;
		border: none;
		background: none;
		cursor: pointer;
		font-size: 1.1em;
		color: var(--munich-black);
		line-height: 1;
	}

	.star-btn:focus-visible {
		outline: 2px solid currentColor;
		outline-offset: 2px;
	}
</style>
```

- [ ] **Step 3: Run typecheck**

Run: `vp check`
Expected: PASS — `isFavorite` / `toggleFavorite` imports resolve, `Star` props match.

- [ ] **Step 4: Run existing e2e tests to verify no regression**

Run: `pnpm test:e2e`
Expected: All existing tests in `tests/test.ts` and `tests/split.test.ts` PASS. The star button is new but doesn't break existing assertions (axe should pass — button has `aria-pressed` + `aria-label`, sufficient contrast via `--munich-black` on `--munich-blue`).

- [ ] **Step 5: Commit**

```bash
git add src/lib/icons/Star.svelte src/components/AreaCard.svelte
git commit -m "feat: add star button to AreaCard for favoriting areas"
```

---

### Task 3: Create favorites page, add Nav entry, redirect on initial load

**Files:**

- Create: `src/routes/favorites/+page.svelte`
- Modify: `src/components/Nav.svelte` (add "Favorites" nav item)
- Modify: `src/routes/+layout.svelte` (add `onMount` redirect)

**Interfaces:**

- Consumes: `getFavoriteIds` from Task 1; layout `data.locations` (all areas, pools + saunas) from `+layout.ts`.
- Produces: `/favorites` route showing favorited areas in an `AreaGrid`; Nav with three entries (Pools, Saunas, Favorites); initial load at `/` redirects to `/favorites` when favorites exist.

**Why:** The favorites page reuses the existing `AreaGrid` for consistent rendering. The redirect lives in `+layout.svelte`'s `onMount` so it fires only on full page loads — clicking "Pools" in the nav (client-side navigation) never triggers the redirect.

- [ ] **Step 1: Create `src/routes/favorites/+page.svelte`**

```svelte
<script lang="ts">
	import AreaGrid from "../../components/AreaGrid.svelte";
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

{#if areas.length > 0}
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

- [ ] **Step 2: Add "Favorites" to `src/components/Nav.svelte`**

Replace the `items` array (lines 4–13) with:

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
    href: `${base}/favorites`,
    title: "Favorites",
  },
];
```

The existing `aria-current` logic on line 18 (`pathname.replace(/\/+$/, "") === href`) already handles highlighting: `/mp/favorites` matches when the favorites page is active.

- [ ] **Step 3: Add redirect-on-initial-load to `src/routes/+layout.svelte`**

Replace the entire `<script>` block (lines 1–5) with:

```ts
import { onMount } from "svelte";
import { base } from "$app/paths";
import { goto } from "$app/navigation";
import { page } from "$app/stores";
import { get } from "svelte/store";
import { hasFavorites } from "$lib/favorites.svelte";
import Header from "../components/Header.svelte";
import Footer from "../components/Footer.svelte";
import "./styles.css";

onMount(() => {
  const rootPath = (base || "/").replace(/\/+$/, "");
  const currentPath = get(page).url.pathname.replace(/\/+$/, "");
  if (currentPath === rootPath && hasFavorites()) {
    goto(`${base}/favorites`, { replaceState: true });
  }
});
```

Keep the existing template (lines 7–26) and `<style>` block unchanged. The `onMount` fires only once per full page load, so client-side navigation to `/` (e.g., clicking "Pools") is never redirected. `replaceState: true` prevents a back-button loop.

- [ ] **Step 4: Run typecheck**

Run: `vp check`
Expected: PASS — `getFavoriteIds` resolves, `goto` and `get(page)` are valid SvelteKit APIs, `PageData` type includes `locations` from layout load.

- [ ] **Step 5: Run existing e2e tests to verify no regression**

Run: `pnpm test:e2e`
Expected: All existing tests PASS — fresh browser contexts have no localStorage, so the redirect never fires. The new "Favorites" nav link doesn't interfere with existing assertions.

- [ ] **Step 6: Commit**

```bash
git add src/routes/favorites/+page.svelte src/components/Nav.svelte src/routes/+layout.svelte
git commit -m "feat: add favorites page with nav entry and startpage redirect"
```

---

### Task 4: Add e2e tests for favorites feature

**Files:**

- Create: `tests/favorites.test.ts`

**Interfaces:**

- Consumes: Star button (`aria-label="Favorite {area_name}"`), Favorites nav link, `/favorites` route, localStorage key `mp-favorites`.

**Why:** End-to-end tests verify the full flow: starring, persistence, page navigation, redirect, and empty state. They reuse the mock API pattern from `tests/split.test.ts`.

- [ ] **Step 1: Create `tests/favorites.test.ts`**

```ts
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
    route.fulfill({ json: mockResponse });
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
  await page.goto("/favorites");
  await expect(page.getByRole("link", { name: "München Plantscht" })).toBeVisible();
  await expect(page.getByText("No favorites yet")).toBeVisible();
});

test("initial load redirects to favorites when favorites exist", async ({ page }) => {
  await mockApi(page);
  await page.addInitScript(() => {
    localStorage.setItem("mp-favorites", JSON.stringify([1]));
  });
  await page.goto("/");
  await expect(page).toHaveURL(/\/favorites$/);
  await expect(page.getByText("Testbad Hallenbad")).toBeVisible();
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

  await expect(page).toHaveURL(/\/favorites$/);
  await expect(page.getByText("Testbad Hallenbad")).toBeVisible();
});
```

- [ ] **Step 2: Run the full e2e suite**

Run: `pnpm test:e2e`
Expected: All tests PASS — the six new favorites tests plus all existing tests in `tests/test.ts` and `tests/split.test.ts`.

- [ ] **Step 3: Run typecheck as a final gate**

Run: `vp check`
Expected: PASS — no type errors anywhere in the project.

- [ ] **Step 4: Commit**

```bash
git add tests/favorites.test.ts
git commit -m "test: add e2e tests for favorites feature"
```
