# München Plantscht → Static FTP-Subfolder App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert muenchen-plantscht from a Cloudflare-Workers SSR SvelteKit app into a self-contained static SPA that deploys via its own GitHub Action over FTP to the `/mp/` subfolder of florian.geierstanger.org, independently from the Astro site's own FTP deploy.

**Architecture:** Replace `@sveltejs/adapter-cloudflare` with `@sveltejs/adapter-static` running in SPA mode (`ssr = false` + `fallback: "index.html"`) so the single live route — the pools index, which already fetches from the Val Town backend client-side — keeps serving fresh data without a server runtime and without baking a build-time fetch into the prerender. Set `kit.paths.base = "/mp"` so all generated asset URLs and internal links resolve under the subfolder. Strip the acknowledged dead code (lakes/rivers routes, Sparkline, Weather, the `d3` dependency) so the shipped artifact is truly self-contained. Add a `.github/workflows/deploy.yml` that builds with Vite+ and uploads `build/` to FTP `server-dir: /mp/` — a separate deploy target that the Astro site's FTP action (which uploads to `/` without `dangerously-clean-slur`) will not touch or overwrite.

**Tech Stack:** SvelteKit 2.70, Svelte 5, `@sveltejs/adapter-static` 3, Vite+ (`vp build`), GitHub Actions (`FTP-Deploy-Action@v4.4.0`, `setup-vp@v1`), Playwright 1.61 for e2e.

## Global Constraints

- **Base path:** `/mp` (no trailing slash) — set in `svelte.config.js` `kit.paths.base`.
- **FTP target dir:** `/mp/` — set as `server-dir` in the plantscht deploy workflow. The Astro site's workflow keeps `server-dir: /`; the two never overlap, and the Astro workflow does not set `dangerously-clean-slur`, so it cannot delete `/mp/`.
- **Build command:** `vp build` (via `vp run build` in CI), static output dir `build/` (adapter-static default).
- **Runtime:** Node 24.18.0, pnpm 11.13.1 (from `package.json` `devEngines`). Keep using the Vite+ toolchain (`vp`); do not switch to bare vite/pnpm scripts.
- **No SSR:** `export const ssr = false;` in `src/routes/+layout.ts`. The pools page fetches live data client-side from `https://muenchen-plantscht-pools.val.run` (CORS is already open on that Val Town endpoint). This also keeps `vp build` from prerendering a build-time fetch to the API.
- **Dead code is removed, not preserved:** lakes/rivers routes, Sparkline, Weather, the `d3` dependency, `wrangler`, and `adapter-cloudflare` are all deleted. The tsconfig already documents these as dead ("pending the frontend rewrite").
- **No new dependencies except adapter-static.** DRY, YAGNI.
- **Commit style:** lower-case Conventional Commits (`feat:`, `chore:`, `ci:`, `docs:`).
- **Verification gates:** after every code task, run `pnpm check` (lint + typecheck via `vp check`) and `pnpm test:e2e`. Do not commit red.

---

## File Structure

Files created or modified, with their single responsibility:

- **`svelte.config.js`** (MODIFY) — swap adapter to `adapter-static` with `fallback: "index.html"`, set `kit.paths.base = "/mp"`. Single source of SvelteKit build config.
- **`package.json`** (MODIFY) — replace `@sveltejs/adapter-cloudflare` with `@sveltejs/adapter-static`, remove `wrangler` devDep and the `d3` dependency, drop the `deploy` script (deploy is now CI-only), keep `prepare: vp config`.
- **`wrangler.jsonc`** (DELETE) — Cloudflare-specific, no longer used.
- **`src/routes/+layout.ts`** (CREATE) — one line: `export const ssr = false;`. Turns the app into a client-side SPA so adapter-static emits a single fallback shell and never prerenders a build-time fetch.
- **`src/routes/+layout.server.ts`** (DELETE) — contains only a commented-out weather fetch; dead.
- **`src/routes/lakes/`** (DELETE, recursive) — dead routes (`+page.svelte` reads `data.lakes` from a load function that does not exist; `[name]/+page.svelte` fetches `/api/temperature` which does not exist).
- **`src/routes/rivers/`** (DELETE, recursive) — dead route, same shape as lakes.
- **`src/components/Sparkline/`** (DELETE, recursive) — only consumer is the dead `lakes/[name]` page; depends on `d3`.
- **`src/components/Weather.svelte`** (DELETE) — not imported anywhere.
- **`src/components/Header.svelte`** (MODIFY) — prefix the home link with `base` from `$app/paths` so it resolves under `/mp`.
- **`src/components/Nav.svelte`** (MODIFY) — prefix nav `href` with `base`; fix `aria-current` comparison to match the new pathname.
- **`tsconfig.json`** (MODIFY) — remove the `exclude` block (the excluded files no longer exist).
- **`tests/test.ts`** (MODIFY) — replace the dead `/about` assertion with real tests covering the SPA shell, the base path, and the removal of dead code.
- **`playwright.config.ts`** (MODIFY) — add `baseURL` so tests resolve under the base path.
- **`.github/workflows/deploy.yml`** (CREATE) — build with Vite+ and FTP-upload `build/` to `/mp/`.
- **`README.md`** (MODIFY) — replace the Cloudflare Workers deployment section with the static + FTP story.

---

## Task 1: Switch to a static SPA at the /mp base path

**Files:**

- Modify: `svelte.config.js`
- Modify: `package.json`
- Modify: `playwright.config.ts`
- Create: `src/routes/+layout.ts`
- Delete: `wrangler.jsonc`
- Delete: `src/routes/+layout.server.ts`
- Test: `tests/test.ts`

**Interfaces:**

- Consumes: nothing.
- Produces: a SvelteKit build that emits `build/index.html` (a client-only SPA shell) with all asset URLs prefixed by `/mp`. Later tasks rely on `kit.paths.base` being set so `$app/paths` `base` returns `/mp`, and on `ssr = false` so `vp build` never prerenders a fetch to the Val Town API.

- [ ] **Step 1: Write the failing test**

Replace `tests/test.ts` with:

```ts
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
```

- [ ] **Step 2: Point Playwright at the base path**

Replace `playwright.config.ts` with:

```ts
import type { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
  baseURL: "http://localhost:4173/mp/",
  webServer: {
    command: "npm run build && npm run preview",
    port: 4173,
  },
  testDir: "tests",
  testMatch: /(.+\.)?(test|spec)\.[jt]s/,
};

export default config;
```

- [ ] **Step 3: Run the test to verify it fails**

```bash
pnpm test:e2e
```

Expected: FAIL. The current adapter is `adapter-cloudflare`, which does not emit a previewable static `build/index.html`, and even if it did, `ssr` is on so the HTML payload would contain the server-rendered "München Plantscht" header text, violating the `not.toContain` assertion. Either the build step or the assertion fails — both are acceptable red states.

- [ ] **Step 4: Swap adapters and remove Cloudflare tooling**

```bash
pnpm remove @sveltejs/adapter-cloudflare wrangler
pnpm add -D @sveltejs/adapter-static@^3.0.0
rm wrangler.jsonc
```

- [ ] **Step 5: Rewrite `svelte.config.js`**

Replace the entire file with:

```js
import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      // SPA fallback: a single shell HTML file is generated and the router
      // takes over in the browser. Named index.html so directory requests
      // to /mp/ resolve on a plain FTP host.
      fallback: "index.html",
    }),
    paths: {
      base: "/mp",
    },
  },
};

export default config;
```

- [ ] **Step 6: Create `src/routes/+layout.ts`**

Create the file with exactly:

```ts
export const ssr = false;
```

- [ ] **Step 7: Delete the dead `+layout.server.ts`**

```bash
rm src/routes/+layout.server.ts
```

- [ ] **Step 8: Update `package.json` scripts**

In `package.json`, replace the `scripts` block so the `deploy` line is removed (deploy is now CI-only) and `build`/`preview` remain:

```json
"scripts": {
  "dev": "vp dev",
  "build": "vp build",
  "preview": "vp preview",
  "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
  "check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
  "test:e2e": "playwright test",
  "prepare": "vp config"
},
```

Leave the rest of `package.json` (dependencies, devEngines, packageManager) untouched — the `d3` dependency is removed in Task 2.

- [ ] **Step 9: Run checks, build, and the test**

```bash
pnpm check
pnpm test:e2e
```

Expected: `pnpm check` passes (SvelteKit regenerates `.svelte-kit`, `svelte-check` finds no errors). The Playwright webServer runs `pnpm build`, which now succeeds because `ssr = false` prevents a prerender-time fetch, and `build/index.html` is produced. The test passes: the shell HTML does not contain "München Plantscht" (it is rendered by JS), and the link becomes visible after hydration.

Verify the build artifact exists:

```bash
ls build/index.html
```

- [ ] **Step 10: Commit**

```bash
git add svelte.config.js package.json pnpm-lock.yaml playwright.config.ts src/routes/+layout.ts tests/test.ts
git rm wrangler.jsonc src/routes/+layout.server.ts
git commit -m "feat: switch to static SPA with /mp base path"
```

---

## Task 2: Remove dead code and the d3 dependency

**Files:**

- Delete: `src/routes/lakes/` (recursive)
- Delete: `src/routes/rivers/` (recursive)
- Delete: `src/components/Sparkline/` (recursive)
- Delete: `src/components/Weather.svelte`
- Modify: `package.json` (remove `d3` from dependencies)
- Modify: `tsconfig.json` (remove the now-unnecessary `exclude` block)
- Test: `tests/test.ts`

**Interfaces:**

- Consumes: nothing.
- Produces: a lean, self-contained app whose only live route is `/` (the pools index). `d3` is gone from the dependency tree, shrinking the shipped bundle. `tsconfig.json` no longer needs to exclude dead files.

- [ ] **Step 1: Write the failing test**

Append to `tests/test.ts`:

```ts
import { existsSync } from "node:fs";

test("dead code is removed from the repo", () => {
  expect(existsSync("src/routes/lakes")).toBe(false);
  expect(existsSync("src/routes/rivers")).toBe(false);
  expect(existsSync("src/components/Sparkline")).toBe(false);
  expect(existsSync("src/components/Weather.svelte")).toBe(false);
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
pnpm test:e2e
```

Expected: FAIL — all four paths still exist, so the `toBe(false)` assertions fail.

- [ ] **Step 3: Delete the dead files**

```bash
rm -rf src/routes/lakes src/routes/rivers src/components/Sparkline
rm src/components/Weather.svelte
```

- [ ] **Step 4: Remove `d3` from `package.json`**

```bash
pnpm remove d3
```

- [ ] **Step 5: Remove the `exclude` block from `tsconfig.json`**

In `tsconfig.json`, delete the `exclude` array and its comment (lines 14–21). The final `tsconfig.json`:

```json
{
  "extends": "./.svelte-kit/tsconfig.json",
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "sourceMap": true,
    "strict": true,
    "moduleResolution": "bundler"
  }
}
```

- [ ] **Step 6: Run checks and tests**

```bash
pnpm check
pnpm test:e2e
```

Expected: both pass. `pnpm check` confirms no dangling imports of the deleted modules and no `d3` references. The e2e test confirms the files are gone and the shell still renders (Task 1's test).

- [ ] **Step 7: Commit**

```bash
git rm -r src/routes/lakes src/routes/rivers src/components/Sparkline
git rm src/components/Weather.svelte
git add package.json pnpm-lock.yaml tsconfig.json tests/test.ts
git commit -m "chore: remove dead lakes/rivers routes, Sparkline, Weather and d3"
```

---

## Task 3: Prefix internal links with the base path

**Files:**

- Modify: `src/components/Header.svelte`
- Modify: `src/components/Nav.svelte`
- Test: `tests/test.ts`

**Interfaces:**

- Consumes: `kit.paths.base = "/mp"` from Task 1, exposed via `$app/paths`.
- Produces: home and nav links that resolve under `/mp/` instead of `/`. Without this, clicking the logo navigates to the Astro site's root.

- [ ] **Step 1: Write the failing test**

Append to `tests/test.ts`:

```ts
test("logo link points to the base path", async ({ page }) => {
  await page.goto("/");
  const logo = page.getByRole("link", { name: "München Plantscht" });
  await expect(logo).toHaveAttribute("href", "/mp");
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
pnpm test:e2e
```

Expected: FAIL — `Header.svelte` renders `href="/"`, so the assertion against `/mp` fails.

- [ ] **Step 3: Update `Header.svelte`**

Replace the entire file with:

```svelte
<script>
	import { base } from "$app/paths";
	import Logo from "$lib/icons/Logo.svelte";
	import Nav from "./Nav.svelte";
</script>

<svelte:head>
	<title>München Plantscht</title>
</svelte:head>

<header>
	<a href={base} class="title">
		<div class="title__logo"><Logo /></div>
		<div class="title__text">München Plantscht</div>
	</a>

	<Nav />
</header>

<style>
	.title {
		display: flex;
		color: var(--munich-white);
		gap: 0.7rem;
		margin-block-end: 0.5rem;
		align-items: center;
		text-decoration: none;
		font-size: 200%;
	}

	.title__logo {
		width: 1.6em;
	}
</style>
```

The only change from the original is `import { base } from "$app/paths";` and `href={base}` (was `href="/"`).

- [ ] **Step 4: Update `Nav.svelte`**

Replace the entire file with:

```svelte
<script lang="ts">
	import { base } from "$app/paths";
	import { page } from "$app/stores";
	const items: { href: string; title: string }[] = [
		{
			href: base,
			title: "Pools",
		},
	];
</script>

<nav>
	{#each items as { href, title }}
		<a {href} aria-current={$page.url.pathname === href ? "page" : undefined}>
			{title}
		</a>
	{/each}
</nav>

<style>
	nav {
		display: flex;
		gap: 0.5rem;
		border-block-end: 1px solid hsla(var(--munich-black-hsl), 0.5);
		padding-inline: 0.7rem;
	}

	a {
		padding: 0.7rem 1.2rem;
		text-decoration: none;
		margin-block-end: -4px;
	}

	[aria-current="page"] {
		border-block-end: 4px solid;
	}
</style>
```

`$page.url.pathname` includes the base segment (`/mp`), and `href = base` resolves to `/mp`, so the equality holds on the pools page. SvelteKit's default `trailingSlash: "never"` keeps both sides without a trailing slash.

- [ ] **Step 5: Run the test to verify it passes**

```bash
pnpm test:e2e
```

Expected: PASS — the logo link's `href` is `/mp`.

- [ ] **Step 6: Run checks**

```bash
pnpm check
```

Expected: passes.

- [ ] **Step 7: Commit**

```bash
git add src/components/Header.svelte src/components/Nav.svelte tests/test.ts
git commit -m "fix: prefix internal links with the /mp base path"
```

---

## Task 4: Add the FTP deploy GitHub Action

**Files:**

- Create: `.github/workflows/deploy.yml`

**Interfaces:**

- Consumes: the static `build/` output produced by `vp build` (Task 1).
- Produces: a workflow that, on every push to `main`, uploads `build/` to `/mp/` on the FTP server that also hosts florian.geierstanger.org. Independent from the Astro site's own FTP action (which uploads to `/` and does not set `dangerously-clean-slur`, so it never touches `/mp/`).

- [ ] **Step 1: Create the workflow file**

Create `.github/workflows/deploy.yml` with:

```yaml
name: Deploy via FTP

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  deploy:
    name: Deploy to FTP server
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Vite+
        uses: voidzero-dev/setup-vp@v1
        with:
          node-version-file: package.json
          cache: true

      - name: Build site
        run: vp run build

      - name: Deploy to FTP
        uses: SamKirkland/FTP-Deploy-Action@v4.4.0
        with:
          server: ${{ secrets.FTP_SERVER }}
          username: ${{ secrets.FTP_USERNAME }}
          password: ${{ secrets.FTP_PASSWORD }}
          protocol: ftps
          server-dir: /mp/
          local-dir: ./build/
          exclude: |
            **/.git*
            **/.git*/**
            **/node_modules/**
            .github/**
```

This mirrors the structure of `florian-geierstanger-org/.github/workflows/deploy.yml` so the two repos stay consistent. The only differences are `server-dir: /mp/` (vs `/`) and `local-dir: ./build/` (vs `./dist/`).

- [ ] **Step 2: Add the required repository secrets**

Go to the GitHub repo settings for `fgeierst/muenchen-plantscht`:

1. Open https://github.com/fgeierst/muenchen-plantscht/settings/secrets/actions
2. Click **New repository secret** and add three secrets with the same values the Astro site repo already uses:
   - `FTP_SERVER` — the FTP host.
   - `FTP_USERNAME` — the FTP user.
   - `FTP_PASSWORD` — the FTP password.

These cannot be added programmatically; they must be entered in the UI. The `/mp/` subfolder will be created by the action on first run if it does not already exist.

- [ ] **Step 3: Verify the workflow file is well-formed YAML**

```bash
npx --yes yaml-lint .github/workflows/deploy.yml
```

Expected: no output, exit code 0. (If `yaml-lint` cannot be fetched, skip this step — the file is small enough to eyeball. Do not block on it.)

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add FTP deploy to /mp/ subfolder"
```

- [ ] **Step 5: Trigger and verify the first deploy**

Push the branch and watch the run:

```bash
git push
gh run watch
```

Expected: the **Deploy via FTP** workflow completes successfully. Open `https://florian.geierstanger.org/mp/` in a browser and confirm the München Plantscht shell renders with the pools list loading from the Val Town backend.

If the build step fails in CI with an adapter error, confirm `svelte.config.js` imports `adapter-static` (Task 1) and `src/routes/+layout.ts` has `export const ssr = false;` (Task 1). If the FTP step fails with a path error, confirm `server-dir: /mp/` has a leading slash and trailing slash, and that the three secrets are set.

---

## Task 5: Update the README

**Files:**

- Modify: `README.md`

**Interfaces:**

- Consumes: the final deployment story from Tasks 1–4.
- Produces: accurate docs so a future reader understands the static + FTP setup and the relationship to florian.geierstanger.org.

- [ ] **Step 1: Replace the Deployment section of `README.md`**

Open `README.md` and replace everything from the `## Deployment` heading (line 31) through the end of the file with:

````markdown
## Deployment

The frontend is a static SPA built with
[`@sveltejs/adapter-static`](https://kit.svelte.dev/docs/adapter-static) in SPA
mode (`ssr = false`, fallback `index.html`). It deploys via GitHub Actions over
FTPS to the `/mp/` subfolder of the florian.geierstanger.org server.

Live URL: <https://florian.geierstanger.org/mp/>

The deploy workflow lives in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).
On every push to `main` it runs `vp run build` and uploads `build/` to
`server-dir: /mp/`. The Astro site at the server root has its own FTP
action that uploads to `/` and does not delete unknown files, so the two
deploys never interfere.

### Required repository secrets

- `FTP_SERVER`
- `FTP_USERNAME`
- `FTP_PASSWORD`

Add them at <https://github.com/fgeierst/muenchen-plantscht/settings/secrets/actions>.

### Base path

`kit.paths.base = "/mp"` is set in [`svelte.config.js`](svelte.config.js).
Internal links use `base` from `$app/paths`. When running locally with `pnpm dev`,
the app is served at `http://localhost:5173/mp/`.

### Previewing the production build locally

```bash
pnpm build
pnpm preview
```
````

Then open `http://localhost:4173/mp/`.

````

Leave the `# München Planscht`, screenshot, `## Architecture`, and `## Quickstart` sections above unchanged.

- [ ] **Step 2: Verify the README links resolve**

Read the file back and confirm the two markdown links (`.github/workflows/deploy.yml`, `svelte.config.js`) point at files that exist after Tasks 1–4.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: replace Cloudflare deployment section with static + FTP story"
````

---

## Self-Review

**1. Spec coverage.** The user's goal: a self-contained static Svelte app reusable in another project, deployed to a subfolder without being overwritten by the host site's FTP action. Covered by: Task 1 (static adapter + base path + SPA so live data still works without SSR), Task 4 (separate FTP action to `/mp/`, which the Astro site's non-cleaning `/` deploy cannot overwrite), Task 5 (docs). The "reusable in another project" angle is satisfied because the app is now a static artifact with a configurable base path — pointing it at a different subfolder is a one-line change in `svelte.config.js` plus the FTP `server-dir`. No gaps.

**2. Placeholder scan.** No "TBD", "add error handling", "similar to Task N", or undescribed steps. Every code step contains the full file or a full replacement block. Secret values are intentionally not inlined (they are UI-entered); the exact secret names and the settings URL are given.

**3. Type consistency.** `base` is imported from `$app/paths` and used as a string (`href={base}`, `href: base`) consistently in Task 3. The `+layout.ts` export is `ssr = false` (boolean) — the only symbol it defines. Test assertions reference the same link name ("München Plantscht") used in `Header.svelte`. `adapter-static`'s `fallback: "index.html"` matches the `build/index.html` path checked in Task 1 Step 9 and the preview URL in Task 5. The `baseURL` in `playwright.config.ts` (`http://localhost:4173/mp/`) matches the preview base path. No naming drift across tasks.
