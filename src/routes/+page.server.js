
export async function load({ url, fetch }) {

	const date = url.searchParams.get('date') ? url.searchParams.get('date') : new Date().toISOString().split('T')[0];

	const response = await fetch('/api/pools?date=' + date);

	const pools = await response.json();

	const weather = await fetch('https://api.brightsky.dev/current_weather?dwd_station_id=03379', { method: 'GET', headers: { accept: 'application/json' } })
	const weatherData = await weather.json()

	return {
		locations: pools,
		weather: weatherData.weather
	};
}

