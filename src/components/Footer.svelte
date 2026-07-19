<script>
	import Pretzel from "$lib/icons/Pretzel.svelte";
</script>

<footer>
	Data from <a href="https://www.swm.de/baeder">Stadtwerke München</a>,
	<a href="https://www.gkd.bayern.de">GKD Bayern</a>, and
	<a href="https://xn--wasserwacht-unterfhring-plc.de/aktuelles-wetter/">Wasserwacht Unterföhring</a>.
	Made with <span class="icon"><Pretzel /></span> in Munich.
	<a href="https://florian.geierstanger.org/kontakt/">Imprint</a> |
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
