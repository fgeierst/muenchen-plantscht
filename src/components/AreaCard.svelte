<script lang="ts">
	import type { AreaWithComparison } from "$lib/pools";
	import { isFavorite, toggleFavorite } from "$lib/favorites.svelte";
	import Star from "$lib/icons/Star.svelte";

	let { area }: { area: AreaWithComparison } = $props();
	const favorited = $derived(isFavorite(area.area_id));
</script>

<li>
	<svg viewBox="0 0 200 110" aria-hidden="true">
		{#if area.path2}
			<path d={area.path2} class="path2"></path>
		{/if}
		<path d={area.path}></path>
	</svg>
	<div class="header">
		<h2 class="name">{area.area_name}</h2>
		<button
			class="star-btn"
			type="button"
			aria-pressed={favorited}
			aria-label={`Favorite ${area.area_name}`}
			onclick={() => toggleFavorite(area.area_id)}
		>
			<Star filled={favorited} />
		</button>
	</div>
	<span class="capacity">
		{area.latest ? `${area.latest.capacity_free_pct}% free` : "–"}
	</span>
</li>

<style>
	li {
		display: flex;
		flex-direction: column;
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
		opacity: 0.12;
	}

	.header {
		display: flex;
		align-items: baseline;
		gap: 0.3rem;
		margin-block-start: 0.3rem;
		width: fit-content;
	}

	.name {
		font-size: inherit;
		font-weight: inherit;
		margin: 0;
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
