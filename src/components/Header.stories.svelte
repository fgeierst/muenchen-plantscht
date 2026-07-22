<script module lang="ts">
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import Header from "./Header.svelte";
	import MockPage from "./MockPage.svelte";

	const { Story } = defineMeta({
		component: Header,
		tags: ["autodocs"],
		render: template,
	});
</script>

{#snippet template()}
	<MockPage pathname="/mp">
		<Header />
	</MockPage>
{/snippet}

<Story name="Default" />
