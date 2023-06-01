<script>
	import RoundArrowForward from "$lib/icons/RoundArrowForward.svelte";
	import { slugify } from "$lib/slugify";
	/** @type {import('./$types').PageData} */

	export let data;
</script>

<ul>
	{#each data.lakes as lake}
		<li>
			<span class="temperature">{lake.water_temperature}°</span>
			<a href={`lakes/${slugify(lake.body_of_water)}`}>
				<span class="name">{lake.body_of_water}</span>
				<RoundArrowForward />
			</a>
		</li>
	{/each}
</ul>

<style>
	ul {
		list-style: none;
		padding: 0;
		margin: 2rem 0 3rem;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 3rem 0.5rem;
	}

	@media (max-width: 600px) {
		ul {
			grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
		}
	}

	li {
		display: flex;
		flex-direction: column;
		position: relative;
	}

	.temperature {
		font-size: 2em;
	}

	.name {
		margin-block-end: 0.3em;
	}

	a {
		text-decoration: none;
	}

	a::after {
		content: "";
		position: absolute;
		inset: 0;
	}
</style>
