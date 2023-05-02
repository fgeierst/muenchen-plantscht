import 'dotenv/config'
import { connect } from '@planetscale/database'

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {

	const config = {
		host: process.env.DATABASE_HOST,
		username: process.env.DATABASE_USERNAME,
		password: process.env.DATABASE_PASSWORD
	}
	const conn = connect(config)
	const results = await conn.execute('SELECT * FROM person_count_log;', [1])

	return {
			results: results
	};
}