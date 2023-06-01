import { json } from '@sveltejs/kit';
import db from '$lib/database';

export async function GET({ url }) {

	const lake = url.searchParams.get('name');
	const result = await db.execute("SELECT water_temperature, date FROM water_temperatures WHERE category_id = 0 AND body_of_water = ? ORDER BY date DESC", [lake]);

	// Example data
	// const rows = [
	// {
	//   "water_temperature": 23.6,
	//   "date": "2023-06-01 18:00:00"
	// },
	// {
	//   "water_temperature": 24.1,
	//   "date": "2023-06-01 17:00:00"
	// },
	// {
	//   "water_temperature": 21.3,
	//   "date": "2023-06-01 15:00:00"
	// },
	// {
	//   "water_temperature": 21,
	//   "date": "2023-06-01 14:00:00"
	// },
	// ]
	return json(result.rows);
}

