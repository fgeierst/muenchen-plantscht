import { env } from "$env/dynamic/public";

const API_BASE = env.PUBLIC_POOLS_API ?? "https://muenchen-plantscht-pools.val.run";

export interface AreaLatest {
  customer_amount: number;
  customer_amount_max: number;
  capacity_free_pct: number;
  recorded_at: string;
}

export interface AreaDataPoint {
  recorded_at: string;
  customer_amount: number;
  customer_amount_max: number;
  capacity_free_pct: number;
}

export interface Area {
  area_id: number;
  area_name: string;
  latest: AreaLatest | null;
  data: AreaDataPoint[];
  path: string;
}

export interface Location {
  location_id: number;
  location_name: string;
  areas: Area[];
}

export interface PoolsResponse {
  date: string;
  locations: Location[];
}

/** An area enriched with the prior-week comparison path. */
export interface AreaWithComparison extends Area {
  path2: string | null;
}

export interface LocationWithComparison {
  location_id: number;
  location_name: string;
  areas: AreaWithComparison[];
}

/** YYYY-MM-DD in Europe/Berlin. */
export function berlinToday(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Berlin" });
}

/** Shift a YYYY-MM-DD string back by `days`. */
export function daysAgo(date: string, days: number): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

/** Fetch a single day of pool occupancy from the Val Town backend. */
export async function fetchPools(fetchFn: typeof fetch, date: string): Promise<PoolsResponse> {
  const res = await fetchFn(`${API_BASE}/?date=${date}`);
  if (!res.ok) throw new Error(`Pools API ${res.status}`);
  return res.json() as Promise<PoolsResponse>;
}

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
