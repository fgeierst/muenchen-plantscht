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
		display: grid;
		gap: 2rem;
		margin-block-end: 4rem;
	}
</style>
