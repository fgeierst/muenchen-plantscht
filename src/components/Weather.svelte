<script>
	export let weather;
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