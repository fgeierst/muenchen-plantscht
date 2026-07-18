<script lang="ts">
	import AreaGrid from "../../components/AreaGrid.svelte";
	import { areaType } from "$lib/pools";
	import type { PageData } from "../$types";

	let { data }: { data: PageData } = $props();

	/** All sauna areas. */
	const areas = $derived(
		data.locations
			.flatMap((loc) => loc.areas)
			.filter((a) => areaType(a.area_name) === "sauna"),
	);
</script>

<AreaGrid {areas} />
