<script>
	/** @type {import('./$types').PageData} */

	export let data;
</script>

<ul>
	{#each data.lakes as lake (lake.id)}
		<li>
			<span class="temperature">{lake.water_temperature}°C</span>
			<span>{lake.body_of_water}</span>
			<div>
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
</style>
