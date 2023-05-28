<script>
	import Logo from "$lib/icons/Logo.svelte";
	import Nav from "./Nav.svelte";
</script>

<svelte:head>
	<title>München Plantscht</title>
</svelte:head>

<header>
	<a href="/" class="title">
		<div class="title__logo"><Logo /></div>
		<div class="title__text">München Plantscht</div>
	</a>

	<Nav />
</header>

<style>
	.title {
		display: flex;
		color: var(--munich-white);
		gap: 0.7rem;
		margin-block-end: 0.5rem;
		align-items: center;
		text-decoration: none;
		font-size: 200%;
	}

	.title__logo {
		width: 1.6em;
	}
</style>
