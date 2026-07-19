import { fetchWaterTemperatures, type WaterResponse } from "$lib/water";
import type { PageLoad } from "./$types";

export const load = (async ({ fetch }) => {
  const water = await fetchWaterTemperatures(fetch, "rivers").catch(
    (): WaterResponse => ({ category: "rivers", bodies: [] }),
  );
  return { water };
}) satisfies PageLoad;
