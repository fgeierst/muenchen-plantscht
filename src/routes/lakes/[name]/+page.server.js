import { error } from '@sveltejs/kit';
import { slugify } from '$lib/slugify';
import db from '$lib/database';

const lakes = [
	'Abtsdorfer See',
	'Ammersee',
	'Bodensee',
	'Chiemsee',
	'Kleiner Brombachsee',
	'Königssee',
	'Pilsensee',
	'Rottachsee',
	'Schliersee',
	'StarnbergerSee',
	'Tegernsee',
	'Waginger See',
	'Weitsee',
	'Wörthsee'
]

export async function load({ params }) {
	const lake = lakes.find(l => slugify(l) === params.name);
	if (lake) {

		const result = await db.execute("SELECT water_temperature, measurement_site, date FROM water_temperatures WHERE category_id = 0 AND body_of_water = ? ORDER BY date DESC", [lake]);

		return {
			title: lake,
			result
		};
	}

	throw error(404, 'Not found');
}