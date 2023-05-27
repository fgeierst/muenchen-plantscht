<script>
	/** @type {import('./$types').PageData} */

	import Header from '../../components/Header.svelte';

	export let data;
	
</script>

<Header />

<h1>Lakes</h1>

<ul>
{#each data.lakes as lake (lake.id)}
	<li>
		<span class="temperature">{lake.temperature}°C</span>
		<span>{lake.location_name}</span>
		<span class="date">{new Date(lake.timestamp).toLocaleDateString("de-DE", { day: 'numeric', month: 'short' })}</span>
	</li>
{/each}
</ul>



<style>

 h1 { 
	margin-block-end: 2em;	
 }

	ul {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 3rem .5rem;
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

	.temperature {
		font-size: 2em;
	}
</style>