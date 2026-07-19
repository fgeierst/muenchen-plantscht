<script lang="ts">
	import type { WaterBody, WaterCategory } from "$lib/water";
	import { isWaterFavorite, toggleWaterFavorite } from "$lib/favorites.svelte";
	import Star from "$lib/icons/Star.svelte";

	let { body, category }: { body: WaterBody; category: WaterCategory } =
		$props();
	const favorited = $derived(isWaterFavorite(category, body.slug));
</script>

<li>
	<span class="temperature">{body.water_temperature.toFixed(0)}°</span>
	<svg viewBox="0 0 200 110" aria-hidden="true">
		<path d={body.path} />
	</svg>
	<div class="header">
		<h2 class="name">
			{body.body_of_water}{body.measurement_site ? ` (${body.measurement_site})` : ""}
		</h2>
		<button
			class="star-btn"
			type="button"
			aria-pressed={favorited}
			aria-label={`Favorite ${body.body_of_water}`}
			onclick={() => toggleWaterFavorite(category, body.slug)}
		>
			<Star filled={favorited} />
		</button>
	</div>
</li>

<style>
	li {
		display: flex;
		flex-direction: column;
	}

	.temperature {
		font-size: 2em;
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

	.header {
		display: flex;
		align-items: baseline;
		gap: 0.3rem;
		margin-block-start: 0.3rem;
		width: fit-content;
		max-width: 100%;
	}

	.name {
		font-size: inherit;
		font-weight: inherit;
		margin: 0;
		overflow-wrap: anywhere;
	}

	.star-btn {
		flex-shrink: 0;
		padding: 0.3em;
		border: none;
		background: none;
		cursor: pointer;
		font-size: 1.1em;
		color: var(--munich-black);
		line-height: 1;
		border-radius: 50%;
		display: inline-grid;
		place-items: center;
	}
</style>
