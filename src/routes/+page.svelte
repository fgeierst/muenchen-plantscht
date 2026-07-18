<script lang="ts">
	import AreaGrid from "../components/AreaGrid.svelte";
	import type { LocationWithComparison } from "$lib/pools";

	type Data = {
		date: string;
		locations: LocationWithComparison[];
	};

	let { data }: { data: Data } = $props();

	/** All areas across every location, flattened into a single list. */
	const areas = $derived(data.locations.flatMap((loc) => loc.areas));
</script>

<AreaGrid {areas} />
