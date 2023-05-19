<script>
	/** @type {import('./$types').PageData} */
	export let data;
</script>

<svelte:head>
	<title>Todays Log</title>
	<meta name="description" content="Log" />
</svelte:head>
<h1>Today's log</h1>
<h2>Weather</h2>

{data.weather.temperature}° C
{data.weather.icon}

<h2>Graph view</h2>

<ul>
{#each data.locations as location}
	<li>
		{location.location_id}
		
		{#each location.data as snapshot}
			<span class="snapshot" style="--top: {Math.floor( (snapshot.person_count / snapshot.max_person_count) * 100)}px">
			</span>
		{/each}

		
	</li>
{/each}
</ul>

<h2>Table view</h2>
<table>
	<tr>
		<th>Record id</th>
		<th>Timestamp </th>
		<th> Location id </th>
		<th> Free capacity </th>
	</tr>
	{#each data.results.rows as item}
		<tr>
			<td>
				{item.id}
			</td>
			<td>
				{item.cest_timestamp}
			</td>
			<td>
				{item.location_id}
			</td>
			<td>
				{Math.floor(100 - (item.person_count / item.max_person_count) * 100)}%
			</td>
		</tr>
	{/each}
</table>

<style>
	.snapshot {
		display: inline-block;
		width: 2px;
		background-color: black;
		height: 2px;
		margin-bottom: var(--top);
		border-radius: 50%;
		margin-left: 2px;
	}
</style>