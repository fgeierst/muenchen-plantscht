<script>
	/** @type {import('./$types').PageData} */

	import Header from './Header.svelte';

	export let data;

	function getTimeValue(timestamp) {
		const time = new Date(timestamp).toLocaleTimeString("de-DE");
		const [hours, minutes] = time.split(":");
		const totalSeconds = parseInt(hours) * 3600 + parseInt(minutes) * 60;
		const value = Math.round((totalSeconds / (24 * 60 * 60)) * 200);
		return value;
	}
	
	function currentCapacity(data) {
		const currentSnapshot = data[data.length - 1];
		const personCount = currentSnapshot.person_count;
		const maxPersonCount = currentSnapshot.max_person_count;
		const capacity = 100 - Math.floor( (personCount / maxPersonCount) * 100)
		return capacity;
	}
</script>

<svelte:head>
	<title>München Plantscht</title>
</svelte:head>

<Header />

<h1>Today</h1>

<p class="weather">{data.weather.temperature}°C
	{data.weather.icon}</p>


<ul>
{#each data.locations as location}
	<li>
		<svg viewBox="0 0 200 110">
			{#each location.data as snapshot}
			<circle cx="{getTimeValue(snapshot.cest_timestamp)}" cy="{100-Math.floor( (snapshot.person_count / snapshot.max_person_count) * 100)}" r="1.3" ></circle>
			{/each} 								 
		</svg>
		
		<span>{location.name ? location.name : location.location_id} </span>
		<span class="capacity">{currentCapacity(location.data)}% free</span>
	</li>
{/each}
</ul>

<style>

 h1 { 
	display: inline;
 }

	.weather {
		display: inline;
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
		display: flex;
		flex-direction: column;
	}

	li > * {
	}

	.content {
		
	}

</style>