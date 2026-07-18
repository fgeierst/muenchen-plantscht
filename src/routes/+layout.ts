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
