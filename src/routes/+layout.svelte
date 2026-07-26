<script>
	import Header from "../components/Header.svelte";
	import DateSelect from "../components/DateSelect.svelte";
	import Footer from "../components/Footer.svelte";
	import "./styles.css";
</script>

<div class="app">
	<Header />
	<DateSelect />
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
