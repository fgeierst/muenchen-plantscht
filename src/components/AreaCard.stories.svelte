<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import AreaCard from './AreaCard.svelte';
	import { busyArea, mediumArea, quietArea, noDataArea } from './areaCard.fixtures';
	import type { AreaWithComparison } from '$lib/pools';

	const { Story } = defineMeta({
		title: 'Pools/AreaCard',
		component: AreaCard,
		tags: ['autodocs'],
		args: {
			area: busyArea,
		},
		render: template,
	});
</script>

{#snippet template(args: { area: AreaWithComparison })}
	<div style="max-width: 220px;">
		<AreaCard area={args.area} />
	</div>
{/snippet}

<Story name="Busy" />

<Story name="Medium" args={{ area: mediumArea }} />

<Story name="Quiet" args={{ area: quietArea }} />

<Story name="NoData" args={{ area: noDataArea }} />
