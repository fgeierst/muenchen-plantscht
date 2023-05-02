<script>
	/** @type {import('./$types').PageData} */
	export let data;
</script>

<svelte:head>
	<title>Log</title>
	<meta name="description" content="Log" />
</svelte:head>

<div class="text-column">
	<h1>Log</h1>
	<table>
		<tr>
			<th>Timestamp
			</th>
			<th>
				Location id
			</th>
			<th>
				Free capacity 
			</th>
		</tr>
		{#each data.results.rows as item}
		<tr>
			<td>
				{item.timestamp} 
			</td>
			<td>
				{item.location_id} 
			</td>
			<td>
				{Math.floor(100 - (item.person_count / item.max_person_count * 100))}% 
			</td>
		</tr>
		{/each}
	</table>
	
	
</div>
