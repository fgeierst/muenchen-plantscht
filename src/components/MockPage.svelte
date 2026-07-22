<script lang="ts">
	import { setContext } from "svelte";

	let { pathname = "/mp", children }: { pathname?: string; children?: import("svelte").Snippet } = $props();

	setContext("page-ctx", {
		url: new URL(`http://localhost${pathname}`),
		params: {},
		route: { id: null },
		status: 200,
		error: null,
		data: {},
		form: null,
	});
</script>

{@render children?.()}
