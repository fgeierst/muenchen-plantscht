import { SvelteSet } from "svelte/reactivity";
import type { WaterCategory } from "$lib/water";

const STORAGE_KEY = "mp-favorites";
const WATER_STORAGE_KEY = "mp-water-favorites";

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

/** Build the prefixed storage key for a water body. */
export function waterKey(category: WaterCategory, slug: string): string {
  return `${category}:${slug}`;
}

const WATER_CATEGORY_PREFIXES = ["lakes", "rivers"] as const;

/** Parse a prefixed water key back into category + slug. */
export function parseWaterKey(key: string): { category: WaterCategory; slug: string } {
  const idx = key.indexOf(":");
  const cat = idx === -1 ? "" : key.slice(0, idx);
  const slug = idx === -1 ? "" : key.slice(idx + 1);
  const category = WATER_CATEGORY_PREFIXES.includes(cat as WaterCategory)
    ? (cat as WaterCategory)
    : "lakes";
  return { category, slug };
}

/** Read favorited water keys from localStorage. Returns [] on any error. */
function loadWater(): string[] {
  try {
    const raw = localStorage.getItem(WATER_STORAGE_KEY);
    if (!raw) return [];
    const keys = JSON.parse(raw) as unknown;
    if (!Array.isArray(keys)) return [];
    return keys.filter((k): k is string => typeof k === "string");
  } catch {
    return [];
  }
}

const waterFavorites = new SvelteSet<string>(loadWater());

/** Persist the current water set to localStorage. */
function persistWater(): void {
  try {
    localStorage.setItem(WATER_STORAGE_KEY, JSON.stringify([...waterFavorites]));
  } catch {
    // Ignore quota or serialization errors.
  }
}

/** Snapshot of all favorited water keys (e.g. "lakes:amper"). */
export function getFavoriteWaterKeys(): string[] {
  return [...waterFavorites];
}

/** Reactive check — safe to call inside `$derived` or `$effect`. */
export function isWaterFavorite(category: WaterCategory, slug: string): boolean {
  return waterFavorites.has(waterKey(category, slug));
}

/** Toggle a water body in/out of favorites and persist. */
export function toggleWaterFavorite(category: WaterCategory, slug: string): void {
  const key = waterKey(category, slug);
  if (waterFavorites.has(key)) {
    waterFavorites.delete(key);
  } else {
    waterFavorites.add(key);
  }
  persistWater();
}
