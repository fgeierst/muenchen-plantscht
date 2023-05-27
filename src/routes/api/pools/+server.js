import { json } from '@sveltejs/kit';
import { getLocations } from '$lib/locations.js';

export async function GET(event) {

	event.setHeaders({
		'Cache-Control': 'max-age=604800'
	})

	const date = event.url.searchParams.get('date');
	const locations = await getLocations(date);

	return json(locations);
}

