<script>
	import Sparkline from "../../../components/Sparkline/Sparkline.svelte";

	export let data;
	let url = "/api/temperature?name=" + encodeURIComponent(data.lake.name);
</script>

<Sparkline {url} name={data.lake.name} />

<style>
</style>
