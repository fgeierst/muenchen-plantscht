<script lang="ts">
	let { filled = false }: { filled?: boolean } = $props();
</script>

<svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">
	<path
		fill={filled ? "currentColor" : "none"}
		stroke="currentColor"
		stroke-width="2"
		stroke-linejoin="round"
		d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
	/>
</svg>
