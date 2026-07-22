<script module lang="ts">
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import Nav from "./Nav.svelte";
	import MockPage from "./MockPage.svelte";

	const { Story } = defineMeta({
		component: Nav,
		tags: ["autodocs"],
		render: template,
	});
</script>

{#snippet template()}
	<MockPage pathname="/mp">
		<Nav />
	</MockPage>
{/snippet}

<Story name="Default" />
