<script lang="ts">
	import AreaGrid from "../../components/AreaGrid.svelte";
	import { areaType, type LocationWithComparison } from "$lib/pools";

	type Data = {
		date: string;
		locations: LocationWithComparison[];
	};

	let { data }: { data: Data } = $props();

	/** All sauna areas. */
	const areas = $derived(
		data.locations
			.flatMap((loc) => loc.areas)
			.filter((a) => areaType(a.area_name) === "sauna"),
	);
</script>

<AreaGrid {areas} />
