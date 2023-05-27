
export async function load({ url, fetch }) {

	// Pools on specific day
	const date = url.searchParams.get('date') ? url.searchParams.get('date') : new Date().toISOString().split('T')[0];
	const response = await fetch('/api/pools?date=' + date);
	const pools = await response.json();

	// Pools one week earlier 
	const oneWeekAgo = new Date(new Date(date).getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; 
	const response2 = await fetch('/api/pools?date=' + oneWeekAgo);
	const oneWeekAgoPools = await response2.json();

	// Add path from earlier to later
	const combinedPools = pools.map(pool => {
		const poolOneWeekAgo = oneWeekAgoPools.find(p => p.id === pool.id);
		return {
			data: pool.data,
			location_id: pool.location_id,
			name: pool.name,
			path: pool.path,
			path2: poolOneWeekAgo.path
		}
	})

	// Weather
	const weather = await fetch('https://api.brightsky.dev/current_weather?dwd_station_id=03379', { method: 'GET', headers: { accept: 'application/json' } })
	const weatherData = await weather.json()

	return {
		locations: combinedPools,
		weather: weatherData.weather
	};
}

