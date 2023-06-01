import { error } from '@sveltejs/kit';
import { slugify } from '$lib/slugify';

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
	const name = lakes.find(l => slugify(l) === params.name);
	if (name) { return { name }; }
	throw error(404, 'Not found');
}