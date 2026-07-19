<script lang="ts">
	import WaterGrid from "../../components/WaterGrid.svelte";
	import type { PageData } from "./$types";

	let { data }: { data: PageData } = $props();
</script>

<WaterGrid bodies={data.water.bodies} category="rivers" />
