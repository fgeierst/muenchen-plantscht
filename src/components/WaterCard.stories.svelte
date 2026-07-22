<script module lang="ts">
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import WaterCard from "./WaterCard.svelte";
	import type { WaterBody, WaterCategory } from "$lib/water";
	import { warmRiver, warmLake } from "./waterCard.fixtures";

	const { Story } = defineMeta({
		component: WaterCard,
		tags: ["autodocs"],
		args: {
			body: warmRiver,
			category: "rivers" as WaterCategory,
		},
		render: template,
	});
</script>

{#snippet template(args: { body: WaterBody; category: WaterCategory })}
	<ul
		style="list-style:none;padding:0;margin:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:2rem 0.5rem;"
	>
		<WaterCard body={args.body} category={args.category} />
	</ul>
{/snippet}

<Story name="Rivers" args={{ body: warmRiver, category: "rivers" }} />

<Story name="Lakes" args={{ body: warmLake, category: "lakes" }} />
