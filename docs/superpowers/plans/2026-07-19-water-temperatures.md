# Lake & River Water Temperatures Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scrape lake and river water temperatures from gkd.bayern.de into the v2 val's SQLite database on a schedule, and expose them via an HTTP API endpoint.

**Architecture:** A cron job fetches the gkd.bayern.de HTML tables for lakes (`category_id=0`) and rivers (`category_id=1`), parses them into reading records, and upserts into the existing `water_temperatures` table (already defined in `db/schema.ts`). A separate HTTP endpoint serves the latest reading per body of water. Date parsing (German `DD.MM.YYYY HH:MM` Berlin local → ISO-8601 UTC) and HTML table parsing are extracted as pure, tested functions in `lib/`.

**Tech Stack:** Val Town (Deno runtime), TypeScript, `node-html-parser` (HTML parsing via `npm:`), `std/sqlite/main.ts` (SQLite), `std/fetch` (HTTP). Tests run via `run_file` (Val Town's script execution — no separate test runner, matching the existing `lib/time-value.test.ts` pattern).

## Global Constraints

- All code runs on the Val Town Deno runtime. Use `https://esm.sh/` for third-party imports, `https://esm.town/v/std/...` for Val Town stdlib, and `npm:package` for npm packages. No `node:fs`, no `Deno.readFile`.
- ES modules only, with file extensions in relative imports (e.g. `./german-date.ts`, not `./german-date`).
- The val is `fgeierst/muenchen-plantscht-v2`. All file paths in tasks are relative to that val's root.
- Berlin time (`Europe/Berlin`) is the domain timezone. DST must be respected — never assume a fixed UTC offset.
- The org tier is **free** — cron intervals must be ≥15 minutes. An hourly cron (`0 * * * *`) is used.
- The existing `db/schema.ts` already defines the `water_temperatures` table (with `category_id`, `measurement_site`, `body_of_water`, `measured_at` ISO-8601 UTC, `water_temperature` REAL, `updated_at`) and the `bodies_of_water` catalog table (with `category_id`, `name`, `slug`, `geopath`, `created_at`). No schema migration is needed.
- The existing `db/schema.ts` already exports `upsertBodiesOfWater()` and `slugify()`. This plan adds a sibling `upsertWaterTemperatures()`.
- Follow the existing v2 patterns: `lib/` holds pure tested functions, `cron/` holds interval files, `api/` holds HTTP endpoints, `db/schema.ts` holds schema + upsert helpers.
- Tests use the custom `assertEqual` pattern from `lib/time-value.test.ts` (no external test framework). Run via `run_file`.
- Each Val Town file edit is automatically versioned. "Commit" steps in this plan mean "verify the change works" — there is no git repo for val files. The plan document itself is committed to the local repo at the end.

---

## File Structure

- **Create:** `lib/german-date.ts` — pure function `germanDateToUtcIso(dateStr)` that parses a German-format date string (`"24.05.2023 20:00"`) as Berlin local time and returns an ISO-8601 UTC timestamp. DST-correct via `Intl` timezone formatting. Self-contained, no Val Town stdlib deps.
- **Create:** `lib/german-date.test.ts` — `script`-type test asserting summer (CEST), winter (CET), and midnight-boundary conversions. Run via `run_file`.
- **Create:** `lib/parse-water-temperatures.ts` — pure function `parseWaterTemperatures(html, categoryId, dateConverter)` that parses the gkd.bayern.de HTML table into `WaterTemperatureReading[]`. Takes a date-converter function as a parameter so the parser is testable without timezone dependencies.
- **Create:** `lib/parse-water-temperatures.test.ts` — `script`-type test with a small HTML fixture, asserting correct row extraction, `--` skipping, and column mapping.
- **Modify:** `db/schema.ts` — add `upsertWaterTemperatures()` function (mirrors the existing `upsertBathAreas()` pattern: `ON CONFLICT DO UPDATE`).
- **Create:** `cron/water-temperatures.ts` — `interval`-type cron job. Fetches both lakes and rivers URLs, parses, upserts bodies-of-water catalog + readings. Exports `recordWaterTemperatures()` for testability and a default export for the interval trigger.
- **Create:** `api/water-temperatures.ts` — `http`-type endpoint. `?category=lakes|rivers` (default: lakes). Returns the latest reading per body of water, joined with `bodies_of_water` for the `slug`. No `?date=` param in v1 of this feature (latest readings only).

No frontend files change in this plan (the frontend lives in the local repo, not the val).

---

### Task 1: German date parser (`lib/german-date.ts`)

**Files:**

- Create: `lib/german-date.ts`
- Create: `lib/german-date.test.ts`
- Test: `lib/german-date.test.ts` (run via `run_file`)

**Interfaces:**

- Produces: `export function germanDateToUtcIso(dateStr: string): string` — parses `"24.05.2023 20:00"` (Berlin local) and returns `"2023-05-24T18:00:00.000Z"` (UTC, CEST). Consumed by `lib/parse-water-temperatures.ts` (injected as `dateConverter`) and `cron/water-temperatures.ts`.

- [ ] **Step 1: Create `lib/german-date.test.ts` with the failing test**

Create the file in val `fgeierst/muenchen-plantscht-v2` at path `lib/german-date.test.ts` with this exact content:

```ts
import { germanDateToUtcIso } from "./german-date.ts";

function assertEqual(actual: unknown, expected: unknown, label: string): void {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    throw new Error(`FAIL: ${label}\n  expected: ${e}\n  actual:   ${a}`);
  }
  console.log(`PASS: ${label} → ${a}`);
}

// Summer (CEST, UTC+2): 19:00 Berlin → 17:00 UTC
assertEqual(
  germanDateToUtcIso("24.05.2023 20:00"),
  "2023-05-24T18:00:00.000Z",
  "summer CEST 20:00 Berlin → 18:00 UTC",
);

// Winter (CET, UTC+1): 18:00 Berlin → 17:00 UTC
assertEqual(
  germanDateToUtcIso("15.01.2023 18:00"),
  "2023-01-15T17:00:00.000Z",
  "winter CET 18:00 Berlin → 17:00 UTC",
);

// Midnight Berlin → previous day 22:00 UTC (summer)
assertEqual(
  germanDateToUtcIso("19.07.2026 00:00"),
  "2026-07-18T22:00:00.000Z",
  "midnight CEST → previous day 22:00 UTC",
);

// Noon Berlin → 10:00 UTC (summer)
assertEqual(
  germanDateToUtcIso("19.07.2026 12:00"),
  "2026-07-19T10:00:00.000Z",
  "noon CEST → 10:00 UTC",
);

// DST transition spring: 26.03.2023 02:00 (just after spring-forward)
// Berlin is CEST (UTC+2) after 02:00 on 2023-03-26
assertEqual(
  germanDateToUtcIso("26.03.2023 03:00"),
  "2023-03-26T01:00:00.000Z",
  "after spring-forward 03:00 CEST → 01:00 UTC",
);

console.log("\nAll tests passed.");
```

- [ ] **Step 2: Run the test to verify it fails**

Run via `run_file` on `fgeierst/muenchen-plantscht-v2` path `lib/german-date.test.ts`.
Expected: FAIL with error mentioning `german-date.ts` not found or `germanDateToUtcIso` is not a function.

- [ ] **Step 3: Create `lib/german-date.ts` with the implementation**

Create the file in val `fgeierst/muenchen-plantscht-v2` at path `lib/german-date.ts` with this exact content:

```ts
/**
 * Parse a German-format date string ("24.05.2023 20:00") as Berlin local time
 * and return the corresponding UTC ISO-8601 timestamp.
 *
 * Berlin observes CET (UTC+1) in winter and CEST (UTC+2) in summer. The offset
 * is resolved for the specific date via Intl timezone formatting, so DST
 * boundaries are handled correctly — no fixed UTC offset assumption.
 *
 * Used to convert gkd.bayern.de measurement timestamps (which are Berlin
 * wall-clock) into the UTC `measured_at` column stored in SQLite.
 */
export function germanDateToUtcIso(dateStr: string): string {
  const [day, month, year, hour, minute] = dateStr.split(/[.: ]/).map(Number);
  // Treat the components as if they were UTC to get a reference instant.
  const guess = new Date(Date.UTC(year, month - 1, day, hour, minute));
  // Determine Berlin's UTC offset (minutes) at that instant, then shift back.
  const offsetMin = berlinOffsetMinutes(guess);
  return new Date(guess.getTime() - offsetMin * 60000).toISOString();
}

/**
 * Return Berlin's UTC offset (in minutes) at the given instant. Positive means
 * Berlin is ahead of UTC (CEST = +120, CET = +60).
 *
 * Uses the same Intl trick as api/pools.ts's berlinDayUtcBounds: format the
 * instant as Berlin wall-clock, parse back as if UTC, and diff.
 */
function berlinOffsetMinutes(at: Date): number {
  const s = at.toLocaleString("en-US", {
    timeZone: "Europe/Berlin",
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  // s like "07/17/2026, 20:38:04"
  const [d, t] = s.split(", ");
  const [mo, da, yr] = d.split("/").map(Number);
  const [h, mi, se] = t.split(":").map(Number);
  const asUtc = Date.UTC(yr, mo - 1, da, h, mi, se);
  return Math.round((asUtc - at.getTime()) / 60000);
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run via `run_file` on `fgeierst/muenchen-plantscht-v2` path `lib/german-date.test.ts`.
Expected: PASS — console output shows `PASS:` for each assertion and `All tests passed.` at the end.

- [ ] **Step 5: Verify (commit)**

Each Val Town file edit is automatically versioned — no git commit needed. The test passing in Step 4 is the verification gate.

---

### Task 2: HTML table parser (`lib/parse-water-temperatures.ts`)

**Files:**

- Create: `lib/parse-water-temperatures.ts`
- Create: `lib/parse-water-temperatures.test.ts`
- Test: `lib/parse-water-temperatures.test.ts` (run via `run_file`)

**Interfaces:**

- Produces: `export interface WaterTemperatureReading { category_id: number; measurement_site: string; body_of_water: string; measured_at: string; water_temperature: number }` — the shape stored in the `water_temperatures` table.
- Produces: `export function parseWaterTemperatures(html: string, categoryId: number, dateConverter: (s: string) => string): WaterTemperatureReading[]` — pure function. `dateConverter` is injected so the parser is testable in isolation (the test passes a mock converter; the cron passes `germanDateToUtcIso`).
- Consumes: `npm:node-html-parser` (the same HTML parser the original v1 vals used).
- Consumed by: `cron/water-temperatures.ts` (Task 3).

- [ ] **Step 1: Create `lib/parse-water-temperatures.test.ts` with the failing test**

Create the file in val `fgeierst/muenchen-plantscht-v2` at path `lib/parse-water-temperatures.test.ts` with this exact content:

```ts
import {
  parseWaterTemperatures,
  type WaterTemperatureReading,
} from "./parse-water-temperatures.ts";

function assertEqual(actual: unknown, expected: unknown, label: string): void {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    throw new Error(`FAIL: ${label}\n  expected: ${e}\n  actual:   ${a}`);
  }
  console.log(`PASS: ${label} → ${a}`);
}

// Minimal HTML matching the gkd.bayern.de table structure:
// columns = [Measurement site, Body of water, County, Date, Water temperature]
// One valid row, one row with "--" (skipped), one row with missing cells (skipped).
const html = `
<table id="karteTabellen">
  <tr><th>Measurement site</th><th>Body of water</th><th>County</th><th>Date</th><th>Water temperature [°C]</th></tr>
  <tr><td>Starnberg</td><td>StarnbergerSee</td><td>STA</td><td>19.07.2026 19:00</td><td>22.9</td></tr>
  <tr><td>Ammerseeboje</td><td>Ammersee</td><td>LL</td><td>--</td><td>--</td></tr>
  <tr><td>BadRow</td></tr>
</table>`;

// Mock date converter: returns the input unchanged so assertions are stable.
const mockConvert = (s: string) => s;

const readings = parseWaterTemperatures(html, 0, mockConvert);

assertEqual(readings.length, 1, "only the valid row is parsed");

assertEqual(
  readings[0] satisfies WaterTemperatureReading,
  {
    category_id: 0,
    measurement_site: "Starnberg",
    body_of_water: "StarnbergerSee",
    measured_at: "19.07.2026 19:00",
    water_temperature: 22.9,
  },
  "valid row has correct fields",
);

// Verify categoryId flows through for rivers (category_id=1).
const riverReadings = parseWaterTemperatures(html, 1, mockConvert);
assertEqual(riverReadings[0].category_id, 1, "rivers use category_id=1");

console.log("\nAll tests passed.");
```

- [ ] **Step 2: Run the test to verify it fails**

Run via `run_file` on `fgeierst/muenchen-plantscht-v2` path `lib/parse-water-temperatures.test.ts`.
Expected: FAIL with error mentioning `parse-water-temperatures.ts` not found or `parseWaterTemperatures` is not a function.

- [ ] **Step 3: Create `lib/parse-water-temperatures.ts` with the implementation**

Create the file in val `fgeierst/muenchen-plantscht-v2` at path `lib/parse-water-temperatures.ts` with this exact content:

```ts
import { parse } from "npm:node-html-parser";

export interface WaterTemperatureReading {
  category_id: number;
  measurement_site: string;
  body_of_water: string;
  measured_at: string;
  water_temperature: number;
}

/**
 * Parse the gkd.bayern.de water temperature HTML table into reading records.
 * Works for both lakes (category_id=0) and rivers (category_id=1) — the table
 * structure is identical on both pages.
 *
 * Table columns: [0]=Measurement site, [1]=Body of water, [2]=County,
 * [3]=Date (DD.MM.YYYY HH:MM), [4]=Water temperature [°C].
 *
 * Rows with "--" for date or temperature are skipped (no measurement available).
 * `dateConverter` is injected so this function is pure and testable without
 * timezone dependencies — the cron passes `germanDateToUtcIso`.
 */
export function parseWaterTemperatures(
  html: string,
  categoryId: number,
  dateConverter: (s: string) => string,
): WaterTemperatureReading[] {
  const root = parse(html);
  const rows = root.querySelectorAll("#karteTabellen tr:not(:first-child)");
  const readings: WaterTemperatureReading[] = [];
  for (const row of rows) {
    const cells = row.querySelectorAll("td");
    if (cells.length < 5) continue;
    const measurement_site = cells[0].textContent.trim();
    const body_of_water = cells[1].textContent.trim();
    const dateStr = cells[3].textContent.trim();
    const tempStr = cells[4].textContent.trim();
    if (dateStr === "--" || tempStr === "--") continue;
    const temp = parseFloat(tempStr.replace(",", "."));
    if (Number.isNaN(temp)) continue;
    readings.push({
      category_id: categoryId,
      measurement_site,
      body_of_water,
      measured_at: dateConverter(dateStr),
      water_temperature: temp,
    });
  }
  return readings;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run via `run_file` on `fgeierst/muenchen-plantscht-v2` path `lib/parse-water-temperatures.test.ts`.
Expected: PASS — console output shows `PASS:` for each assertion and `All tests passed.` at the end.

- [ ] **Step 5: Verify (commit)**

Each Val Town file edit is automatically versioned — no git commit needed. The test passing in Step 4 is the verification gate.

---

### Task 3: Water-temperature cron job

**Files:**

- Modify: `db/schema.ts` (add `upsertWaterTemperatures` function)
- Create: `cron/water-temperatures.ts`
- Test: `cron/water-temperatures.ts` (run via `run_file` — executes `recordWaterTemperatures` against the live DB and gkd.bayern.de)

**Interfaces:**

- Consumes: `germanDateToUtcIso` from `lib/german-date.ts` (Task 1).
- Consumes: `parseWaterTemperatures` from `lib/parse-water-temperatures.ts` (Task 2).
- Consumes: `migrate`, `upsertBodiesOfWater` from `db/schema.ts` (already exist).
- Produces: `upsertWaterTemperatures(readings)` added to `db/schema.ts` — mirrors the existing `upsertBathAreas` pattern. `ON CONFLICT(category_id, measurement_site, body_of_water, measured_at) DO UPDATE` keeps the row fresh if the temperature changes between scrapes.
- Produces: `export async function recordWaterTemperatures(): Promise<{ lakes: number; rivers: number }>` in `cron/water-temperatures.ts` — orchestrates fetch + parse + upsert for both categories. Exposed for testing via `run_file`.

- [ ] **Step 1: Add `upsertWaterTemperatures` to `db/schema.ts`**

In val `fgeierst/muenchen-plantscht-v2`, edit `db/schema.ts`. Use `replace_in_file` to add the new function immediately after the existing `upsertBodiesOfWater` function (before `upsertBathAreas`).

Find this exact block (the end of `upsertBodiesOfWater`):

```ts
  await sqlite.batch(
    unique.map((b) => ({
      sql: `INSERT OR IGNORE INTO bodies_of_water (category_id, name, slug, created_at)
            VALUES (?, ?, ?, ?)`,
      args: [b.category_id, b.name, slugify(b.name), now],
    })),
  );
}
```

Replace it with:

```ts
  await sqlite.batch(
    unique.map((b) => ({
      sql: `INSERT OR IGNORE INTO bodies_of_water (category_id, name, slug, created_at)
            VALUES (?, ?, ?, ?)`,
      args: [b.category_id, b.name, slugify(b.name), now],
    })),
  );
}

/**
 * Upsert water-temperature readings. On conflict (same category+site+body+time),
 * update the temperature and `updated_at` timestamp so re-scraping is idempotent.
 * Mirrors the upsertBathAreas pattern.
 */
export async function upsertWaterTemperatures(
  readings: {
    category_id: number;
    measurement_site: string;
    body_of_water: string;
    measured_at: string;
    water_temperature: number;
  }[],
): Promise<void> {
  if (readings.length === 0) return;
  const now = new Date().toISOString();
  await sqlite.batch(
    readings.map((r) => ({
      sql: `INSERT INTO water_temperatures
              (category_id, measurement_site, body_of_water, measured_at, water_temperature, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(category_id, measurement_site, body_of_water, measured_at) DO UPDATE SET
              water_temperature = excluded.water_temperature,
              updated_at = excluded.updated_at`,
      args: [r.category_id, r.measurement_site, r.body_of_water, r.measured_at, r.water_temperature, now],
    })),
  );
}
```

- [ ] **Step 2: Create `cron/water-temperatures.ts`**

Create the file in val `fgeierst/muenchen-plantscht-v2` at path `cron/water-temperatures.ts` with this exact content. Set `fileType` to `interval`.

```ts
import { fetch as stdFetch } from "https://esm.town/v/std/fetch";
import { migrate, upsertBodiesOfWater, upsertWaterTemperatures } from "../db/schema.ts";
import { parseWaterTemperatures } from "../lib/parse-water-temperatures.ts";
import { germanDateToUtcIso } from "../lib/german-date.ts";

const SOURCES = [
  { category_id: 0, url: "https://www.gkd.bayern.de/en/lakes/watertemperature/tables" },
  { category_id: 1, url: "https://www.gkd.bayern.de/en/rivers/watertemperature/tables" },
] as const;

async function fetchHtml(url: string): Promise<string> {
  const res = await stdFetch(url, {
    headers: { accept: "text/html", "user-agent": "Mozilla/5.0" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return await res.text();
}

/**
 * One cron pass: fetch both lakes and rivers tables from gkd.bayern.de, parse
 * them into readings, register any newly-seen bodies of water in the catalog
 * (slug auto-generated), and upsert the readings. Idempotent — re-scraping the
 * same measurement just refreshes `updated_at`.
 */
export async function recordWaterTemperatures(): Promise<{
  lakes: number;
  rivers: number;
}> {
  await migrate();
  const counts: Record<number, number> = {};
  for (const source of SOURCES) {
    const html = await fetchHtml(source.url);
    const readings = parseWaterTemperatures(html, source.category_id, germanDateToUtcIso);
    const bodies = readings.map((r) => ({ category_id: r.category_id, name: r.body_of_water }));
    await upsertBodiesOfWater(bodies);
    await upsertWaterTemperatures(readings);
    counts[source.category_id] = readings.length;
  }
  return { lakes: counts[0] ?? 0, rivers: counts[1] ?? 0 };
}

export default async function (interval: Interval) {
  const result = await recordWaterTemperatures();
  console.log(`Scraped ${result.lakes} lake readings and ${result.rivers} river readings.`);
}
```

- [ ] **Step 3: Set the interval schedule to hourly**

Run `write_interval_settings` on `fgeierst/muenchen-plantscht-v2` path `cron/water-temperatures.ts` with:

- `type: "cron"`
- `cron: "0 * * * *"`
- `delay: null`
- `unit: null`

This runs at minute 0 of every hour. Well within the free-tier ≥15min limit. Water temperatures change slowly; hourly is sufficient.

- [ ] **Step 4: Run the cron once via `run_file` to verify it works end-to-end**

Run via `run_file` on `fgeierst/muenchen-plantscht-v2` path `cron/water-temperatures.ts`.
Expected: The run completes without errors. Console output shows something like `Scraped 18 lake readings and 95 river readings.` (exact counts depend on the live gkd.bayern.de data).

- [ ] **Step 5: Verify data was stored in SQLite**

Run this query against the val's database via `sqlite_execute`:

```sql
SELECT category_id, COUNT(*) as count, MIN(measured_at) as oldest, MAX(measured_at) as newest
FROM water_temperatures
GROUP BY category_id
```

Database: `{ type: "val", val: "fgeierst/muenchen-plantscht-v2" }`

Expected: Two rows — `category_id=0` (lakes) and `category_id=1` (rivers), each with `count > 0` and `newest` within the last few hours.

Also verify the catalog was populated:

```sql
SELECT category_id, COUNT(*) as count FROM bodies_of_water GROUP BY category_id
```

Expected: Two rows with counts matching the number of distinct bodies of water scraped.

- [ ] **Step 6: Verify (commit)**

Each Val Town file edit is automatically versioned — no git commit needed. Steps 4–5 passing is the verification gate.

---

### Task 4: Water-temperatures HTTP API endpoint

**Files:**

- Create: `api/water-temperatures.ts`
- Test: `api/water-temperatures.ts` (verify via `fetch_val_endpoint`)

**Interfaces:**

- Consumes: `water_temperatures` and `bodies_of_water` tables (populated by Task 3's cron).
- Produces: `GET https://muenchen-plantscht-water.val.run/?category=lakes|rivers` — returns the latest reading per body of water within the requested category.
- Response shape (200):

```json
{
  "category": "lakes",
  "bodies": [
    {
      "body_of_water": "StarnbergerSee",
      "slug": "starnbergersee",
      "measurement_site": "Starnberg",
      "water_temperature": 22.9,
      "measured_at": "2026-07-19T17:00:00.000Z"
    }
  ]
}
```

- [ ] **Step 1: Create `api/water-temperatures.ts`**

Create the file in val `fgeierst/muenchen-plantscht-v2` at path `api/water-temperatures.ts` with this exact content. Set `fileType` to `http`.

```ts
import { sqlite } from "https://esm.town/v/std/sqlite/main.ts";

/**
 * GET /?category=lakes|rivers
 *
 * Returns the latest water-temperature reading per body of water within the
 * requested category. `category` defaults to "lakes". Unknown categories
 * return 400.
 *
 * The response is cached for 10 minutes (readings update hourly via the cron).
 * Public + CORS-friendly (Val Town adds Access-Control-Allow-Origin: * by
 * default as long as we don't set CORS headers ourselves).
 */

interface Row {
  body_of_water: string;
  slug: string;
  measurement_site: string;
  water_temperature: number;
  measured_at: string;
}

const CATEGORIES: Record<string, number> = { lakes: 0, rivers: 1 };

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

  // All readings for this category, newest first. We dedupe in JS to keep the
  // SQL simple — the dataset is small (~20 lakes, ~100 rivers).
  const { rows } = (await sqlite.execute({
    sql: `
      SELECT w.body_of_water, b.slug, w.measurement_site, w.water_temperature, w.measured_at
      FROM water_temperatures w
      JOIN bodies_of_water b
        ON b.category_id = w.category_id AND b.name = w.body_of_water
      WHERE w.category_id = ?
      ORDER BY w.body_of_water ASC, w.measured_at DESC
    `,
    args: [categoryId],
  })) as unknown as { rows: Row[] };

  // Keep only the latest reading per body_of_water (first occurrence wins
  // because rows are ordered DESC by measured_at within each body).
  const seen = new Set<string>();
  const bodies = rows.filter((r) => {
    if (seen.has(r.body_of_water)) return false;
    seen.add(r.body_of_water);
    return true;
  });

  return Response.json(
    { category: categoryParam, bodies },
    { headers: { "Cache-Control": "public, max-age=600" } },
  );
}
```

- [ ] **Step 2: Set a custom subdomain for the endpoint**

Run `set_custom_subdomain` on `fgeierst/muenchen-plantscht-v2` path `api/water-temperatures.ts` with subdomain `muenchen-plantscht-water`.

After this, the endpoint URL will be `https://muenchen-plantscht-water.val.run/`.

- [ ] **Step 3: Verify the lakes endpoint returns data**

Run `fetch_val_endpoint` on `fgeierst/muenchen-plantscht-v2` path `api/water-temperatures.ts` with `search: "?category=lakes"`.

Expected: HTTP 200 with JSON body `{ "category": "lakes", "bodies": [...] }` containing at least one body of water with `water_temperature`, `measured_at`, `slug`, and `measurement_site` fields. (Requires Task 3 to have run successfully — the DB must contain data.)

- [ ] **Step 4: Verify the rivers endpoint returns data**

Run `fetch_val_endpoint` on `fgeierst/muenchen-plantscht-v2` path `api/water-temperatures.ts` with `search: "?category=rivers"`.

Expected: HTTP 200 with JSON body `{ "category": "rivers", "bodies": [...] }` containing multiple river readings.

- [ ] **Step 5: Verify invalid category returns 400**

Run `fetch_val_endpoint` on `fgeierst/muenchen-plantscht-v2` path `api/water-temperatures.ts` with `search: "?category=puddles"`.

Expected: HTTP 400 with JSON body `{ "error": "Invalid category 'puddles'. Use 'lakes' or 'rivers'." }`.

- [ ] **Step 6: Verify default category (no param) returns lakes**

Run `fetch_val_endpoint` on `fgeierst/muenchen-plantscht-v2` path `api/water-temperatures.ts` (no search params).

Expected: HTTP 200 with `"category": "lakes"`.

- [ ] **Step 7: Verify (commit)**

Each Val Town file edit is automatically versioned — no git commit needed. Steps 3–6 passing is the verification gate.

---

## Self-Review

**1. Spec coverage:** The user asked to "implement lake and river water temperature" in the v2 val, referencing the original v1 implementation. The plan covers: (a) parsing the gkd.bayern.de HTML table for both lakes and rivers — Task 2; (b) converting German dates to UTC — Task 1; (c) storing readings in SQLite — Task 3; (d) serving them via an HTTP API — Task 4. The v1 Feringasee scraper (a separate website, wasserwacht-unterföhring.de) is intentionally out of scope — Feringasee is not in the gkd.bayern.de table and is a separate concern. The existing v2 schema already supports it (just another `measurement_site`/`body_of_water` row) if it's added later.

**2. Placeholder scan:** No TBDs, TODOs, or "add error handling" stubs. Every step has complete code. Test assertions use exact expected values.

**3. Type consistency:** `WaterTemperatureReading` (defined in Task 2) is consumed by `upsertWaterTemperatures` (Task 3) with matching field names: `category_id`, `measurement_site`, `body_of_water`, `measured_at`, `water_temperature`. The `dateConverter` parameter type `(s: string) => string` matches `germanDateToUtcIso`'s signature `(dateStr: string) => string`. The API response field names (`body_of_water`, `slug`, `measurement_site`, `water_temperature`, `measured_at`) match the DB column names.
