<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import AreaCard from './AreaCard.svelte';
	import { mediumArea } from './areaCard.fixtures';
	import type { AreaWithComparison } from '$lib/pools';

	const { Story } = defineMeta({
		component: AreaCard,
		tags: ['autodocs'],
		args: {
			area: mediumArea,
		},
		render: template,
	});
</script>

{#snippet template(args: { area: AreaWithComparison })}
	<div style="max-width: 220px;">
		<AreaCard area={args.area} />
	</div>
{/snippet}

<Story name="Default" />
