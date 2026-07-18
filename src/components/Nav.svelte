<script lang="ts">
	import { base } from "$app/paths";
	import { page } from "$app/stores";
	const items: { href: string; title: string }[] = [
		{
			href: base,
			title: "Pools",
		},
	];
</script>

<nav>
	{#each items as { href, title }}
		<a {href} aria-current={$page.url.pathname.replace(/\/+$/, "") === href ? "page" : undefined}>
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
