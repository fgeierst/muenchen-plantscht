import 'dotenv/config'
import { connect } from '@planetscale/database'
import { line, curveNatural } from 'd3-shape'

/** @type {import('./about/$types').PageServerLoad} */

function timeValue(timestamp) {
	const time = new Date(timestamp).toLocaleTimeString("de-DE");
	const [hours, minutes] = time.split(":");
	const totalSeconds = parseInt(hours) * 3600 + parseInt(minutes) * 60;
	const value = Math.round((totalSeconds / (24 * 60 * 60)) * 200);
	return value;
}

export async function load({ params }) {

	const config = {
		host: process.env.DATABASE_HOST,
		username: process.env.DATABASE_USERNAME,
		password: process.env.DATABASE_PASSWORD
	}
	const conn = connect(config)
	// Yesterday DATE_SUB(CURDATE(), INTERVAL 1 DAY) 
	const results = await conn.execute("SELECT *, CONVERT_TZ(timestamp, 'UTC', 'Europe/Paris') AS cest_timestamp FROM person_count_log WHERE DATE(timestamp) = CURDATE() AND location_id NOT IN (30201, 30195) ORDER BY timestamp ASC", [1])

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

	const weather = await fetch('https://api.brightsky.dev/current_weather?dwd_station_id=03379', { method: 'GET', headers: { accept: 'application/json' } })
	const weatherData = await weather.json()

	const locationsWithGraph = locations.map(location => {
		const points = []
		location.data.forEach(element => {
			const time = timeValue(element.timestamp);
			const capacity = 100 - Math.floor((element.person_count / element.max_person_count) * 100);
			points.push([time, capacity])
		});

		const lineGenerator = line()
			.x(d => d[0])
			.y(d => d[1])
			.curve(curveNatural);
		const path = lineGenerator(points);

		return {
			...location,
			path: path
		}
	})

	return {
		results: results,
		locations: locationsWithGraph,
		weather: weatherData.weather
	};
}

