import { json } from '@sveltejs/kit'
import db from '$lib/database'

export async function GET(event) {

  event.setHeaders({
    'Cache-Control': 'max-age=604800'
  })

  const results = await db.execute("SELECT * FROM lakes", [1])
  
  return json(results.rows)
}