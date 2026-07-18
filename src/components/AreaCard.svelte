<script lang="ts">
	import type { AreaWithComparison } from "$lib/pools";

	let { area }: { area: AreaWithComparison } = $props();
</script>

<li>
	<svg viewBox="0 0 200 110" aria-hidden="true">
		{#if area.path2}
			<path d={area.path2} class="path2"></path>
		{/if}
		<path d={area.path}></path>
	</svg>
	<span class="name">{area.area_name}</span>
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

	.name {
		margin-block-start: 0.3rem;
	}
</style>
