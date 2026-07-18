<script>
	import Header from "../components/Header.svelte";
	import Footer from "../components/Footer.svelte";
	import "./styles.css";
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
