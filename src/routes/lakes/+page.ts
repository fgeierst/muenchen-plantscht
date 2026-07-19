import { fetchWaterTemperatures, type WaterResponse } from "$lib/water";
import type { PageLoad } from "./$types";

export const load = (async ({ fetch }) => {
  const water = await fetchWaterTemperatures(fetch, "lakes").catch(
    (): WaterResponse => ({ category: "lakes", bodies: [] }),
  );
  return { water };
}) satisfies PageLoad;
