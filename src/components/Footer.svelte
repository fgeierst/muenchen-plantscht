<script>
	import Pretzel from "$lib/icons/Pretzel.svelte";
</script>

<footer>
	Made with <span class="icon"><Pretzel /></span> in Munich.
	<a href="https://github.com/fgeierst/muenchen-plantscht">Github</a>
</footer>

<style>
	footer {
		padding-block-end: 4rem;
	}

	.icon :global(svg) {
		display: inline-block;
		height: 0.8em;
	}
</style>
