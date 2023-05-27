import { json } from '@sveltejs/kit'
import db from '$lib/database'
import { line, curveNatural } from 'd3-shape'

export async function GET(event) {

	event.setHeaders({
		'Cache-Control': 'max-age=604800'
	})

	const date = event.url.searchParams.get('date');

	const { rows: snapshots } = await db.execute("SELECT *, CONVERT_TZ(timestamp, 'UTC', 'Europe/Paris') AS cest_timestamp FROM person_count_log WHERE DATE(timestamp) = ? AND location_id NOT IN (30201, 30195) ORDER BY timestamp ASC", [date]);

	const locationNames = await db.execute("SELECT * FROM locations", [1])

	const groups = groupByLocation(snapshots, locationNames)
	const locations = addD3Path(groups);
	locations.sort((a, b) => a.name.localeCompare(b.name)); // sort by name

	return json(locations);
}

function groupByLocation(snapshots, locationNames) {
	return snapshots.reduce((acc, obj) => {
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
}

function addD3Path(locations) {
	return locations.map(location => {
		const points = [];

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

		return { ...location, path: path };
	});
}

function timeValue(timestamp) {
	const time = new Date(timestamp).toLocaleTimeString("de-DE");
	const [hours, minutes] = time.split(":");
	const totalSeconds = parseInt(hours) * 3600 + parseInt(minutes) * 60;
	const value = Math.round((totalSeconds / (24 * 60 * 60)) * 200);
	return value;
}