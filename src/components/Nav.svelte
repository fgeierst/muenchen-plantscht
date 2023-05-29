<script>
	import { page } from "$app/stores";
	let items = [
		{
			href: "/",
			title: "Pools",
		},
		{
			href: "/lakes",
			title: "Lakes",
		},
	];
</script>

<nav>
	{#each items as { href, title }}
		<a {href} aria-current={$page.url.pathname === href ? "page" : undefined}>
			{title}
		</a>
	{/each}
</nav>

<style>
	nav {
		display: flex;
		gap: 0.5rem;
		border-block-end: 1px solid hsla(var(--munich-black-hsl), 0.5);
		padding-inline: 0.7rem;
	}

	a {
		padding: 0.7rem 1.2rem;
		text-decoration: none;
		margin-block-end: -4px;
	}

	[aria-current="page"] {
		border-block-end: 4px solid;
	}
</style>
