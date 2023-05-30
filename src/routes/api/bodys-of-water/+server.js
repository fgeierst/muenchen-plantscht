import { json } from '@sveltejs/kit'
import db from '$lib/database'

export async function GET({ setHeaders, url }) {

  setHeaders({
    'Cache-Control': 'public, max-age=604800' // cache for 1 week
  })

  const category_id = url.searchParams.get('category_id') || 0; // 0 = lakes, 1 = rivers
  const date = url.searchParams.get('date') || new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const results = await db.execute("SELECT t1.* FROM water_temperatures t1 INNER JOIN ( SELECT category_id, measurement_site, body_of_water, MAX(date) AS max_date FROM water_temperatures GROUP BY category_id, measurement_site, body_of_water ) t2 ON t1.category_id = t2.category_id AND t1.measurement_site = t2.measurement_site AND t1.body_of_water = t2.body_of_water AND t1.date = t2.max_date WHERE t1.category_id = ? AND DATE(t1.date) = ?", [category_id, date]);

  return json(results.rows)
}