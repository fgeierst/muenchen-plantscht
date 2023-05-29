import { json } from '@sveltejs/kit';
import { getLocations } from '$lib/locations.js';

export async function GET(event) {

	event.setHeaders({
		'Cache-Control': 'public, max-age=600' // cache for 10 minutes
	})

	const date = event.url.searchParams.get('date');
	const locations = await getLocations(date);

	return json(locations);
}

