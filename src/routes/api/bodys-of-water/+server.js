import { json } from '@sveltejs/kit'
import db from '$lib/database'

export async function GET({ setHeaders, url }) {

  setHeaders({
    'Cache-Control': 'public, max-age=604800' // cache for 1 week
  })

  const category_id = url.searchParams.get('category_id') || 0; // 0 = lakes, 1 = rivers
  const date = url.searchParams.get('date') || new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const results = await db.execute("SELECT * FROM water_temperatures WHERE category_id = ? AND DATE(date) = ?", [category_id, date]);

  return json(results.rows)
}