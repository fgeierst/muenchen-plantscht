<script lang="ts">
	import type { WaterBody } from "$lib/water";

	let { body }: { body: WaterBody } = $props();
</script>

<li>
	<span class="temperature">{body.water_temperature.toFixed(0)}°</span>
	<svg viewBox="0 0 200 110" aria-hidden="true">
		<path d={body.path} />
	</svg>
	<h2 class="name">{body.body_of_water}</h2>
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

	.name {
		font-size: inherit;
		font-weight: inherit;
		margin: 0;
		margin-block-start: 0.3rem;
	}
</style>
