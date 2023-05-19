<script>
	/** @type {import('./$types').PageData} */
	export let data;

	function getTimeValue(timestamp) {
		const time = new Date(timestamp).toLocaleTimeString("de-DE");
		const [hours, minutes] = time.split(":");
		const totalSeconds = parseInt(hours) * 3600 + parseInt(minutes) * 60;
		const value = Math.round((totalSeconds / (24 * 60 * 60)) * 200);
		return value;
	}
</script>

<svelte:head>
	<title>Today's Log</title>
</svelte:head>
<h1>Today's log</h1>

<p class="weather">{data.weather.temperature}° C
	{data.weather.icon}</p>

<ul>
{#each data.locations as location}
	<li>
		<span>{location.location_id}</span>
		
		<svg viewBox="0 0 200 110">
						
			{#each location.data as snapshot}
				<circle cx="{getTimeValue(snapshot.cest_timestamp)}" cy="{100-Math.floor( (snapshot.person_count / snapshot.max_person_count) * 100)}" r="1.3" ></circle>
			{/each} 								 
					
		</svg>
		<!-- {#each location.data as snapshot}
			<span class="snapshot" style="--top: {Math.floor( (snapshot.person_count / snapshot.max_person_count) * 100)}px">
			</span>
		{/each} -->

	</li>
{/each}
</ul>

<style>
	.weather {
		font-size: 200%;
		margin: 0;
	}

	svg {
		width: 100%;
		height: auto;
	}

	ul {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
		gap: .5rem;
	}

	li {
		display: grid;
		align-items: end;
	}

	li > * {
		grid-area: 1 / 1;
	}

	span {
		padding: 1rem .2rem;
	}
</style>