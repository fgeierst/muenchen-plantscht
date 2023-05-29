import { json } from '@sveltejs/kit';
import { getLocations } from '$lib/locations.js';

export async function GET({ url, setHeaders }) {

	setHeaders({
		'Cache-Control': 'public, max-age=600' // cache for 10 minutes
	})

	const date = url.searchParams.get('date');
	const locations = await getLocations(date);

	return json(locations);
}

