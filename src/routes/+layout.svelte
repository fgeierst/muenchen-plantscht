<script>
	import { onMount } from "svelte";
	import { base } from "$app/paths";
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import { get } from "svelte/store";
	import { hasFavorites } from "$lib/favorites.svelte";
	import Header from "../components/Header.svelte";
	import Footer from "../components/Footer.svelte";
	import "./styles.css";

	onMount(() => {
		const rootPath = (base || "/").replace(/\/+$/, "");
		const currentPath = get(page).url.pathname.replace(/\/+$/, "");
		if (currentPath === rootPath && hasFavorites()) {
			goto(`${base}/favorites`, { replaceState: true });
		}
	});
</script>

<div class="app">
	<Header />
	<main>
		<slot />
	</main>
	<Footer />
</div>

<style>
	.app {
		height: 120vh;
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	main {
		flex-grow: 1;
	}
</style>
