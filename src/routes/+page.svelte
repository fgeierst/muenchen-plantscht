<script lang="ts">
	import AreaGrid from "../components/AreaGrid.svelte";
	import { areaType } from "$lib/pools";
	import type { PageData } from "./$types";

	let { data }: { data: PageData } = $props();

	/** All pool areas (indoor + outdoor), excluding saunas. */
	const areas = $derived(
		data.locations
			.flatMap((loc) => loc.areas)
			.filter((a) => areaType(a.area_name) === "pool"),
	);
</script>

<AreaGrid {areas} />
