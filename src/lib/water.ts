import { env } from "$env/dynamic/public";

const API_BASE = env.PUBLIC_WATER_API ?? "https://muenchen-plantscht-water.val.run";

export interface WaterDataPoint {
  measured_at: string;
  water_temperature: number;
}

export interface WaterBody {
  body_of_water: string;
  slug: string;
  measurement_site: string;
  water_temperature: number;
  measured_at: string;
  path: string;
  data: WaterDataPoint[];
}

export interface WaterResponse {
  category: string;
  bodies: WaterBody[];
}

export type WaterCategory = "lakes" | "rivers";

export async function fetchWaterTemperatures(
  fetchFn: typeof fetch,
  category: WaterCategory,
): Promise<WaterResponse> {
  const res = await fetchFn(`${API_BASE}/?category=${category}`);
  if (!res.ok) throw new Error(`Water API ${res.status}`);
  return (await res.json()) as WaterResponse;
}
