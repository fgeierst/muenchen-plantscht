<script>
	/** @type {import('./$types').PageData} */

	export let data;	
	
	function currentCapacity(data) {
		const currentSnapshot = data[data.length - 1];
		const personCount = currentSnapshot.person_count;
		const maxPersonCount = currentSnapshot.max_person_count;
		const capacity = 100 - Math.floor( (personCount / maxPersonCount) * 100)
		return capacity;
	}
</script>

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

	<p class="last-updated">Last updated: {new Date(data.locations[0].data[data.locations[0].data.length - 1].cest_timestamp).toLocaleDateString("de-DE", { day: 'numeric', month: 'short' })}, {new Date(data.locations[0].data[data.locations[0].data.length - 1].cest_timestamp).toLocaleTimeString("de-DE", { hour: 'numeric', minute: 'numeric' })}. Comparison data (grey line) is from one week earlier.</p>

{:else}
	<p>No data avavailable.</p>
{/if}

<style>

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