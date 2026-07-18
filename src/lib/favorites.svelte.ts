import { SvelteSet } from "svelte/reactivity";

const STORAGE_KEY = "mp-favorites";

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
