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
{#each data.locations as location (location.location_id)}
	<li id={location.location_id}>
		<svg viewBox="0 0 200 110">							  -->
			<path d={location.path}></path>
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
		fill: none;
	}

	path {
		stroke: var(--munich-black);
		stroke-width: 2;
	}

	ul {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 0 .5rem;
	}

	@media (max-width: 600px) {
		ul {
			grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
		}
	}

	li {
		display: flex;
		flex-direction: column;
	}

	li > * {
	}

</style>