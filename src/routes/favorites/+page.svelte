<script lang="ts">
	import AreaGrid from "../../components/AreaGrid.svelte";
	import { getFavoriteIds } from "$lib/favorites.svelte";
	import type { PageData } from "./$types";

	let { data }: { data: PageData } = $props();

	const areas = $derived.by(() => {
		const ids = new Set(getFavoriteIds());
		return data.locations
			.flatMap((loc) => loc.areas)
			.filter((a) => ids.has(a.area_id));
	});
</script>

{#if areas.length > 0}
	<AreaGrid {areas} />
{:else}
	<p class="empty">No favorites yet. Tap the star next to an area name to add it here.</p>
{/if}

<style>
	.empty {
		margin-block-start: 2rem;
	}
</style>
