import { json } from '@sveltejs/kit'
import db from '$lib/database'

export async function GET(event) {

  event.setHeaders({
    'Cache-Control': 'public, max-age=604800' // cache for 1 week
  })

  const results = await db.execute("SELECT * FROM lakes", [1])

  return json(results.rows)
}