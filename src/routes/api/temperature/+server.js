import { json } from '@sveltejs/kit';

export async function GET() {

	const rows = [
		{
			date: "2023-06-01 14:15:00",
			temperature: 19.0,
		},
		{
			date: "2023-06-01 16:18:00",
			temperature: 20.0,
		},
		{
			date: "2023-06-01 17:19:00",
			temperature: 21,
		},
		{
			date: "2023-06-01 18:20:00",
			temperature: 5,
		}
	]
	return json(rows);
}

