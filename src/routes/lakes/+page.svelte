<script>
	/** @type {import('./$types').PageData} */

	export let data;
</script>

<ul>
	{#each data.lakes as lake (lake.id)}
		<li>
			<span class="temperature">{lake.water_temperature}°</span>
			<span class="name">{lake.body_of_water}</span>
			<span class="small">{lake.measurement_site}</span>
			<div class="small">
				<span class="date"
					>{new Date(lake.date).toLocaleDateString("de-DE", {
						day: "numeric",
						month: "short",
					})}</span
				>,
				<span class="time"
					>{new Date(lake.date).toLocaleTimeString("de-DE", {
						hour: "numeric",
						minute: "numeric",
					})}
				</span>
			</div>
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
	}

	.temperature {
		font-size: 2em;
	}

	.name {
		margin-block-end: 0.3em;
	}

	.small {
		font-size: 0.75em;
		text-transform: uppercase;
		letter-spacing: 0.12em;
	}
</style>
