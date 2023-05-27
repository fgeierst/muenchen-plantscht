<script>
	/** @type {import('./$types').PageData} */

	import Header from '../components/Header.svelte';

	export let data;	
	
	function currentCapacity(data) {
		const currentSnapshot = data[data.length - 1];
		const personCount = currentSnapshot.person_count;
		const maxPersonCount = currentSnapshot.max_person_count;
		const capacity = 100 - Math.floor( (personCount / maxPersonCount) * 100)
		return capacity;
	}
</script>

<Header />

<h1>Today</h1>

<p class="weather">
	{data.weather.temperature}°C
	{data.weather.icon}
</p>

{#if data.locations.length > 0}
	<ul>
	{#each data.locations as location (location.location_id)}
		<li id={location.location_id}>
			<svg viewBox="0 0 200 110">
				<path d={location.path2} class="path2"></path>
				<path d={location.path}></path>
			</svg>
			
			<span>{location.name ? location.name : location.location_id} </span>
			<span class="capacity">{currentCapacity(location.data)}% free</span>
		</li>
	{/each}
	</ul>

	<p class="last-updated">Last updated: {new Date(data.locations[0].data[data.locations[0].data.length - 1].cest_timestamp).toLocaleDateString("de-DE", { day: 'numeric', month: 'short' })}, {new Date(data.locations[0].data[data.locations[0].data.length - 1].cest_timestamp).toLocaleTimeString("de-DE", { hour: 'numeric', minute: 'numeric' })}</p>

{:else}
	<p>No data avavailable.</p>
{/if}

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

	.path2 {
		opacity: .12;
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

	.last-updated {
		margin-block: 4rem 2rem;
	}
</style>