# Business-Hours SVG X-Axis Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remap the SVG path's x-axis so the 7:00–23:00 business-hours window fills the full 0–200 viewBox width, instead of wasting ~30% of the canvas on overnight hours that have no data.

**Architecture:** The SVG path is generated server-side in the Val Town val `fgeierst/muenchen-plantscht-v2`. The `timeValue` function in `api/pools.ts` currently maps 0–24h onto x=0–200. We extract it into a testable `lib/time-value.ts` module, change the mapping to 7h→x=0 and 23h→x=200, write a runnable test script, and update the HTTP endpoint to import the new module. The frontend (`AreaCard.svelte`) needs no changes — its `viewBox="0 0 200 110"` stays the same; only the time→x mapping behind the path data changes.

**Tech Stack:** Val Town (Deno runtime), TypeScript, d3-shape (`line` + `curveNatural`), `std/sqlite/main.ts`. Tests run via `run_file` (Val Town's script execution — no separate test runner).

## Global Constraints

- All code runs on the Val Town Deno runtime. Use `https://esm.sh/` for third-party imports and `https://esm.town/v/std/...` for Val Town stdlib. No `node:fs`, no `Deno.readFile`.
- ES modules only, with file extensions in imports (e.g. `./time-value.ts`, not `./time-value`).
- The val is `fgeierst/muenchen-plantscht-v2`. All file paths in tasks are relative to that val's root.
- Berlin time (`Europe/Berlin`) is the domain timezone. DST must be respected — never assume a fixed UTC offset.
- Business hours are 07:00–23:00 Berlin local time (matching `lib/business-hours.ts`'s `isGermanBusinessHours`: `hours >= 7 && hours < 23`).
- The SVG viewBox is `0 0 200 110` (defined client-side in `AreaCard.svelte`). The x-axis range 0–200 must not change; only the time→x mapping changes.
- The frontend consumes the `path` string opaquely — no client-side changes are part of this plan.
- Existing data in `occupancy_log` was only logged during business hours (cron guard via `isGermanBusinessHours`), so all stored `recorded_at` timestamps fall within 7–23h Berlin. Defensive clamping to [0, 200] is still required in case of clock skew or future cron changes.

---

## File Structure

- **Create:** `lib/time-value.ts` — pure function `timeValue(iso: string): number` that maps an ISO timestamp's Berlin-local time-of-day onto x∈[0,200], with 07:00→0 and 23:00→200. Exports the hour constants for reuse. Self-contained, no side effects, no Val Town stdlib deps.
- **Create:** `lib/time-value.test.ts` — a `script`-type test that imports `timeValue`, asserts on known timestamps, and `throw`s on failure. Run via `run_file`.
- **Modify:** `api/pools.ts` — remove the inline `timeValue` function (lines 36–41), add `import { timeValue } from "../lib/time-value.ts";` at the top, keep everything else identical.

No frontend files change in this plan.

---

### Task 1: Extract `timeValue` to a testable module with the new 7–23h mapping

**Files:**

- Create: `lib/time-value.ts`
- Create: `lib/time-value.test.ts`
- Test: `lib/time-value.test.ts` (run via `run_file`)

**Interfaces:**

- Produces: `export function timeValue(iso: string): number` — maps an ISO 8601 timestamp to an x-coordinate in [0, 200], where 07:00 Berlin → 0 and 23:00 Berlin → 200. Values outside the window are clamped to 0 or 200.
- Produces: `export const BUSINESS_HOURS_START_HOUR = 7` and `export const BUSINESS_HOURS_END_HOUR = 23` — the hour boundaries, for reuse by `lib/business-hours.ts` in a future refactor (not part of this plan).

- [ ] **Step 1: Create `lib/time-value.ts` with the new mapping**

Create the file in val `fgeierst/muenchen-plantscht-v2` at path `lib/time-value.ts` with this exact content:

```ts
/**
 * Business-hours window in Berlin local time. Matches the cron guard in
 * lib/business-hours.ts (isGermanBusinessHours: hours >= 7 && hours < 23).
 */
export const BUSINESS_HOURS_START_HOUR = 7;
export const BUSINESS_HOURS_END_HOUR = 23;

const SECONDS_PER_HOUR = 3600;
const CANVAS_WIDTH = 200;

const windowStartSeconds = BUSINESS_HOURS_START_HOUR * SECONDS_PER_HOUR; // 25200
const windowEndSeconds = BUSINESS_HOURS_END_HOUR * SECONDS_PER_HOUR; // 82800
const windowDurationSeconds = windowEndSeconds - windowStartSeconds; // 57600

/**
 * Map an ISO timestamp to an x-coordinate in [0, CANVAS_WIDTH] (0–200),
 * where 07:00 Europe/Berlin → 0 and 23:00 Europe/Berlin → 200.
 *
 * Timestamps outside the business-hours window are clamped to the nearest
 * edge so a stray overnight point never produces a negative or >200 x.
 *
 * The Berlin timezone is resolved from the timestamp itself via
 * toLocaleTimeString("de-DE", { timeZone: "Europe/Berlin" }), so DST is
 * handled correctly — no fixed UTC offset assumption.
 */
export function timeValue(iso: string): number {
  const time = new Date(iso).toLocaleTimeString("de-DE", {
    timeZone: "Europe/Berlin",
  });
  const [hours, minutes] = time.split(":");
  const totalSeconds = parseInt(hours) * SECONDS_PER_HOUR + parseInt(minutes) * 60;
  const clamped = Math.max(windowStartSeconds, Math.min(windowEndSeconds, totalSeconds));
  return Math.round(((clamped - windowStartSeconds) / windowDurationSeconds) * CANVAS_WIDTH);
}
```

- [ ] **Step 2: Create the test script `lib/time-value.test.ts`**

Create the file at path `lib/time-value.test.ts` with this exact content. It is a `script`-type file (not `http`), runnable via `run_file`:

```ts
import { timeValue, BUSINESS_HOURS_START_HOUR, BUSINESS_HOURS_END_HOUR } from "./time-value.ts";

function assertEqual(actual: unknown, expected: unknown, label: string): void {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    throw new Error(`FAIL: ${label}\n  expected: ${e}\n  actual:   ${a}`);
  }
  console.log(`PASS: ${label} → ${a}`);
}

// Constants
assertEqual(BUSINESS_HOURS_START_HOUR, 7, "start hour is 7");
assertEqual(BUSINESS_HOURS_END_HOUR, 23, "end hour is 23");

// 07:00 Berlin (summer, UTC+2) → x = 0
// 2026-07-18T05:00:00.000Z is 07:00 CEST
assertEqual(timeValue("2026-07-18T05:00:00.000Z"), 0, "07:00 CEST maps to 0");

// 07:00 Berlin (winter, UTC+1) → x = 0
// 2026-01-15T06:00:00.000Z is 07:00 CET
assertEqual(timeValue("2026-01-15T06:00:00.000Z"), 0, "07:00 CET maps to 0");

// 15:00 Berlin (summer) → x = 100 (midpoint of 7–23h window)
// 2026-07-18T13:00:00.000Z is 15:00 CEST
assertEqual(timeValue("2026-07-18T13:00:00.000Z"), 100, "15:00 CEST maps to 100");

// 23:00 Berlin (summer) → x = 200
// 2026-07-18T21:00:00.000Z is 23:00 CEST
assertEqual(timeValue("2026-07-18T21:00:00.000Z"), 200, "23:00 CEST maps to 200");

// 22:59 Berlin (summer) → x ≈ 199 (just before the end)
// 2026-07-18T20:59:00.000Z is 22:59 CEST
assertEqual(timeValue("2026-07-18T20:59:00.000Z"), 199, "22:59 CEST maps to 199");

// Overnight point (03:00 Berlin) is clamped to x = 0 (left edge)
// 2026-07-18T01:00:00.000Z is 03:00 CEST
assertEqual(timeValue("2026-07-18T01:00:00.000Z"), 0, "03:00 CEST clamps to 0");

// Midnight Berlin → clamped to 0
// 2026-07-17T22:00:00.000Z is 00:00 CEST on 2026-07-18
assertEqual(timeValue("2026-07-17T22:00:00.000Z"), 0, "00:00 CEST clamps to 0");

console.log("\nAll tests passed.");
```

- [ ] **Step 3: Run the test to verify it passes**

Run the test script via the Val Town MCP `run_file` tool:

- val: `fgeierst/muenchen-plantscht-v2`
- path: `lib/time-value.test.ts`

Expected: the run returns without throwing, and logs include:

```
PASS: start hour is 7 → 7
PASS: end hour is 23 → 23
PASS: 07:00 CEST maps to 0 → 0
PASS: 07:00 CET maps to 0 → 0
PASS: 15:00 CEST maps to 100 → 100
PASS: 23:00 CEST maps to 200 → 200
PASS: 22:59 CEST maps to 199 → 199
PASS: 03:00 CEST clamps to 0 → 0
PASS: 00:00 CEST clamps to 0 → 0

All tests passed.
```

If any assertion fails, do NOT proceed — fix `lib/time-value.ts` and re-run until all pass.

- [ ] **Step 4: Commit**

There is no git repo for a Val Town val. Instead, the "commit" for a Val Town val is implicit — each file edit creates a new version. Verify both files exist by calling `list_files` on `lib/`:

```
val: fgeierst/muenchen-plantscht-v2
path: lib
```

Expected: the listing includes `business-hours.ts`, `time-value.ts`, and `time-value.test.ts`.

---

### Task 2: Update `api/pools.ts` to import the new `timeValue`

**Files:**

- Modify: `api/pools.ts` (remove inline `timeValue` at lines 36–41, add import at top)

**Interfaces:**

- Consumes: `import { timeValue } from "../lib/time-value.ts"` — the function from Task 1. Same signature as the old inline `timeValue(iso: string): number`, so no other code in `api/pools.ts` changes.
- Produces: an HTTP endpoint at `https://muenchen-plantscht-pools.val.run/` whose `path` fields now span x=0–200 for the 7–23h window.

- [ ] **Step 1: Edit `api/pools.ts` — add the import**

In val `fgeierst/muenchen-plantscht-v2`, edit file `api/pools.ts`. The file currently starts with:

```ts
import { sqlite } from "https://esm.town/v/std/sqlite/main.ts";
import { line, curveNatural } from "https://esm.sh/d3-shape@3";
```

Change it to:

```ts
import { sqlite } from "https://esm.town/v/std/sqlite/main.ts";
import { line, curveNatural } from "https://esm.sh/d3-shape@3";
import { timeValue } from "../lib/time-value.ts";
```

- [ ] **Step 2: Edit `api/pools.ts` — remove the inline `timeValue` function**

The inline function currently lives at lines 32–41 of `api/pools.ts`:

```ts
/**
 * Map an ISO timestamp to v1's 0..200 time-of-day scale (Berlin local time),
 * used as the x coordinate of the d3 path.
 */
function timeValue(iso: string): number {
  const time = new Date(iso).toLocaleTimeString("de-DE", { timeZone: "Europe/Berlin" });
  const [hours, minutes] = time.split(":");
  const totalSeconds = parseInt(hours) * 3600 + parseInt(minutes) * 60;
  return Math.round((totalSeconds / (24 * 60 * 60)) * 200);
}
```

Delete this entire block (the comment, the blank line, and the function). The import added in Step 1 replaces it.

- [ ] **Step 3: Verify the endpoint returns paths that span the full 0–200 x-range**

Fetch today's data from the live endpoint and check that at least one area's `path` starts at or near `M0,` (x=0) rather than `M58,` (the old 7:00 mapping):

Run this bash command (replacing the date with today's Berlin date if needed):

```bash
curl -s "https://muenchen-plantscht-pools.val.run/?date=$(TZ=Europe/Berlin date +%Y-%m-%d)" \
  | node -e '
    let s = "";
    process.stdin.on("data", c => s += c);
    process.stdin.on("end", () => {
      const data = JSON.parse(s);
      const areas = data.locations.flatMap(l => l.areas);
      console.log("Areas:", areas.length);
      for (const a of areas.slice(0, 3)) {
        // Extract the first M<x>,<y> coordinate from the path
        const m = a.path.match(/^M([\d.]+)/);
        console.log(`  ${a.area_name}: path starts with x=${m ? m[1] : "?"} (len ${a.path.length})`);
      }
      // Check that no path starts with x > 10 (old behavior had x≈58 for 07:00)
      const badStarts = areas.filter(a => {
        const m = a.path.match(/^M([\d.]+)/);
        return m && parseFloat(m[1]) > 10;
      });
      if (badStarts.length > 0) {
        console.error(`FAIL: ${badStarts.length} paths start with x > 10`);
        process.exit(1);
      }
      console.log("OK: all sampled paths start at x ≤ 10");
    });
  '
```

Expected output: paths start with `x=0` (or close to it), and the script prints `OK: all sampled paths start at x ≤ 10`. If the script exits with code 1, the import or deletion was wrong — re-read `api/pools.ts` and fix.

- [ ] **Step 4: Verify the prior-week comparison (`path2`) still aligns**

The frontend (`src/routes/+page.ts` in the muenchen-plantscht frontend repo) fetches yesterday/last-week's data and uses each area's `path` as `path2` for the grey comparison overlay. Since both today's and the prior week's data now go through the new `timeValue`, they should align on the same x-scale.

Fetch last week's data and confirm it also starts near x=0:

```bash
LAST_WEEK=$(node -e 'const d=new Date();d.setDate(d.getDate()-7);console.log(d.toLocaleDateString("en-CA",{timeZone:"Europe/Berlin"}))')
curl -s "https://muenchen-plantscht-pools.val.run/?date=$LAST_WEEK" \
  | node -e '
    let s = "";
    process.stdin.on("data", c => s += c);
    process.stdin.on("end", () => {
      const data = JSON.parse(s);
      const areas = data.locations.flatMap(l => l.areas);
      for (const a of areas.slice(0, 3)) {
        const m = a.path.match(/^M([\d.]+)/);
        console.log(`  ${a.area_name}: path starts with x=${m ? m[1] : "?"}`);
      }
    });
  '
```

Expected: prior-week paths also start at x≈0. (If last week's data is empty — the cron may not have been running a week ago — skip this step and note it.)

- [ ] **Step 5: Visually verify in the Storybook (optional but recommended)**

In the muenchen-plantscht frontend repo, the Storybook `AreaCard.stories.svelte` uses fixture data captured from the live API. The old fixtures contain paths with the old 0–24h mapping. To see the new mapping, either:

a. Re-capture fixtures from the live API (run the fixture-generation node script from the previous session against today's data), OR
b. Just load the live page (`vp dev` → navigate to the pools page) and confirm the SVG curves now start at the left edge of each card and span the full width.

Expected: the curve fills the card horizontally, no empty space on the left.

- [ ] **Step 6: "Commit" (verify the final state of `api/pools.ts`)**

Read back `api/pools.ts` and confirm:

1. The import line `import { timeValue } from "../lib/time-value.ts";` is present near the top.
2. The inline `function timeValue(...)` block is gone.
3. The rest of the file (the `line()` generator usage, the `pathGen(points)` call, the response shape) is unchanged.

Use `read_file` on `api/pools.ts` and eyeball it. If anything looks off, fix it.

---

## Self-Review

**1. Spec coverage:** The spec is "the graph should only show 7-23h". Task 1 creates the new mapping function with tests. Task 2 wires it into the live endpoint and verifies the output. No gaps.

**2. Placeholder scan:** No TBDs, no "handle edge cases" without code, no "similar to Task N". Every code step contains the full code. The clamping logic (`Math.max`/`Math.min`) is explicit, not described.

**3. Type consistency:** `timeValue(iso: string): number` — same signature in the new module, the test, and the import in `api/pools.ts`. The constants `BUSINESS_HOURS_START_HOUR` / `BUSINESS_HOURS_END_HOUR` are exported as `const number` and used only in the test for assertion. No naming drift.
