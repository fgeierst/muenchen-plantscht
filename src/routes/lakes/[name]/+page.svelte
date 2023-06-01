<script>
	import Sparkline from "../../../components/Sparkline/Sparkline.svelte";

	export let data;
	let url = "/api/temperature?name=" + encodeURIComponent(data.name);
</script>

<Sparkline {url} name={data.name} />

<style>
</style>
