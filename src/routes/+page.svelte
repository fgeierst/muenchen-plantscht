<script lang="ts">
	import AreaCard from "../components/AreaCard.svelte";
	import type { LocationWithComparison } from "$lib/pools";

	type Data = {
		date: string;
		locations: LocationWithComparison[];
	};

	let { data }: { data: Data } = $props();

	/** All areas across every location, flattened into a single list. */
	const areas = $derived(data.locations.flatMap((loc) => loc.areas));

	const hasData = $derived(areas.length > 0);

	/** Most recent recorded_at across all areas, for the "last updated" note. */
	const lastUpdated = $derived.by(() => {
		let latest: string | null = null;
		for (const area of areas) {
			const at = area.latest?.recorded_at;
			if (at && (!latest || at > latest)) latest = at;
		}
		return latest;
	});

	function formatUpdated(iso: string): string {
		const d = new Date(iso);
		const day = d.toLocaleDateString("de-DE", {
			day: "numeric",
			month: "short",
			timeZone: "Europe/Berlin",
		});
		const time = d.toLocaleTimeString("de-DE", {
			hour: "numeric",
			minute: "numeric",
			timeZone: "Europe/Berlin",
		});
		return `${day}, ${time}`;
	}
</script>

{#if hasData}
	<ul>
		{#each areas as area (area.area_id)}
			<AreaCard {area} />
		{/each}
	</ul>

	{#if lastUpdated}
		<p class="last-updated">
			Last updated: {formatUpdated(lastUpdated)}. Comparison data (grey line) is
			from one week earlier.
		</p>
	{/if}
{:else}
	<p>No data available.</p>
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

	.last-updated {
		margin-block: 4rem 2rem;
	}
</style>
