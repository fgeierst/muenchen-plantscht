import { error } from '@sveltejs/kit';
import { slugify } from '$lib/slugify';
import db from '$lib/database';

const result = await db.execute("SELECT * FROM locations WHERE category_id = 0", [1]);
const lakes = result.rows;


export async function load({ params }) {
	const lake = lakes.find(l => slugify(l.name) === params.name);
	if (lake) { return { lake }; }
	throw error(404, 'Not found');
}