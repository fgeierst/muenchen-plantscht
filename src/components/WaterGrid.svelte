<script lang="ts">
	import type { WaterBody, WaterCategory } from "$lib/water";
	import WaterCard from "./WaterCard.svelte";

	let { bodies, category }: { bodies: WaterBody[]; category: WaterCategory } =
		$props();

	const hasData = $derived(bodies.length > 0);
</script>

{#if hasData}
	<ul>
		{#each bodies as body (body.slug)}
			<WaterCard {body} {category} />
		{/each}
	</ul>
{:else}
	<p>No data available.</p>
{/if}

<style>
	ul {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 2rem 0.5rem;
	}

	@media (max-width: 600px) {
		ul {
			grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
		}
	}
</style>
