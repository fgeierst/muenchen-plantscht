<script lang="ts">
	import AreaCard from "../../components/AreaCard.svelte";
	import WaterCard from "../../components/WaterCard.svelte";
	import {
		getFavoriteIds,
		getFavoriteWaterKeys,
		waterKey,
	} from "$lib/favorites.svelte";
	import type { PageData } from "./$types";

	let { data }: { data: PageData } = $props();

	const areas = $derived.by(() => {
		const ids = new Set(getFavoriteIds());
		return data.locations
			.flatMap((loc) => loc.areas)
			.filter((a) => ids.has(a.area_id));
	});

	const favoritedLakes = $derived.by(() => {
		const keys = new Set(getFavoriteWaterKeys());
		return data.lakes.bodies.filter((b) =>
			keys.has(waterKey("lakes", b.slug)),
		);
	});

	const favoritedRivers = $derived.by(() => {
		const keys = new Set(getFavoriteWaterKeys());
		return data.rivers.bodies.filter((b) =>
			keys.has(waterKey("rivers", b.slug)),
		);
	});

	const isEmpty = $derived(
		areas.length === 0 &&
			favoritedLakes.length === 0 &&
			favoritedRivers.length === 0,
	);
</script>

{#if isEmpty}
	<p class="empty">
		No favorites yet. Tap the star next to an area or water body name to add it
		here.
	</p>
{:else}
	<ul>
		{#each areas as area (area.area_id)}
			<AreaCard {area} />
		{/each}
		{#each favoritedLakes as body (body.slug)}
			<WaterCard {body} category="lakes" />
		{/each}
		{#each favoritedRivers as body (body.slug)}
			<WaterCard {body} category="rivers" />
		{/each}
	</ul>
{/if}

<style>
	ul {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 2rem 0.5rem;
	}

	@media (max-width: 600px) {
		ul {
			grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
		}
	}

	.empty {
		margin-block-start: 2rem;
	}
</style>
