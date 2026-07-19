import { fetchWaterTemperatures, type WaterResponse } from "$lib/water";
import type { PageLoad } from "./$types";

export const load = (async ({ fetch }) => {
  const [lakes, rivers] = await Promise.all([
    fetchWaterTemperatures(fetch, "lakes").catch(
      (): WaterResponse => ({ category: "lakes", bodies: [] }),
    ),
    fetchWaterTemperatures(fetch, "rivers").catch(
      (): WaterResponse => ({ category: "rivers", bodies: [] }),
    ),
  ]);
  return { lakes, rivers };
}) satisfies PageLoad;
