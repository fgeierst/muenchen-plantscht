<script>
	export let weather = {
		temperature: 0,
		icon: "sunny",
	};
</script>

<p class="weather">
	{weather.temperature}°C
	{weather.icon}
</p>

<style>
	.weather {
		display: inline;
		font-size: 200%;
		margin: 0;
	}
</style>
