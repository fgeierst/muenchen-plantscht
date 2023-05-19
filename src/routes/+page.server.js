import 'dotenv/config'
import { connect } from '@planetscale/database'

/** @type {import('./about/$types').PageServerLoad} */
export async function load({ params }) {

	const config = {
		host: process.env.DATABASE_HOST,
		username: process.env.DATABASE_USERNAME,
		password: process.env.DATABASE_PASSWORD
	}
	const conn = connect(config)
	// Yesterday DATE_SUB(CURDATE(), INTERVAL 1 DAY) 
	const results = await conn.execute("SELECT *, CONVERT_TZ(timestamp, 'UTC', 'Europe/Paris') AS cest_timestamp FROM person_count_log WHERE DATE(timestamp) = CURDATE() ORDER BY timestamp ASC", [1])

	const locationNames = await conn.execute("SELECT * FROM locations", [1])	

	// Group by location_id
	const locations = results.rows.reduce((acc, obj) => {
		const { location_id, ...rest } = obj;
		const index = acc.findIndex(item => item.location_id === location_id);
		if (index === -1) {
			const location = locationNames.rows.find(l => l.id === location_id); 
			const name = location ? location.name : null; 
			acc.push({ location_id, name, data: [rest] });
		} else {
			acc[index].data.push(rest);
		}
		return acc;
	}, []);

	// Sort by name
	locations.sort((a, b) => a.name.localeCompare(b.name));	

	const weather = await fetch('https://api.brightsky.dev/current_weather?dwd_station_id=03379', {method: 'GET', headers: {accept: 'application/json'}})
	const weatherData = await weather.json()

	return {
		results: results,
		locations: locations,
		weather: weatherData.weather
	};
}

