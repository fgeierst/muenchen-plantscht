import { parse } from 'node-html-parser';
import 'dotenv/config';
import { connect } from '@planetscale/database';

async function getFeringasee() {

	const selector = ".temperature-block";
	const url = "https://xn--wasserwacht-unterfhring-plc.de/feringasee/";

	function convertGermanDateToIso(dateStr) {
		const [day, month, year, hour, minute] = dateStr.split(/[.: ]/);
		const dateObj = new Date(year, month - 1, day, hour, minute);
		return dateObj.toISOString().slice(0, 19).replace("T", " ");
	}

	async function fetchUrl(url) {
		try {
			const response = await fetch(url);
			const html = await response.text();
			return html;
		} catch (error) {
			console.error(error);
			return null;
		}
	}

	async function parseHtml(html, selector) {
		const root = parse(html);
		const section = root.querySelector(selector);
		const items = [];

		const input = section?.textContent

		const regex = /vom (\d{2}\.\d{2}\.\d{4}\s\d{2}:\d{2}):\s([\d.]+) Grad Celius im Wasser und ([\d.]+) Grad Celsius an der Luft\./;

		const match = input?.match(regex);

		if (match) {
			items.push({
				category_id: 0,
				measurement_site: "Feringasee",
				body_of_water: "Feringasee",
				date: convertGermanDateToIso(match[1]),
				water_temperature: match[2],
			});
		} else {
			console.log('No match found');
		}

		return items;
	}


	async function storeLakeSnapshot(snapshots) {
		const config = {
			host: process.env.DATABASE_HOST,
			username: process.env.DATABASE_USERNAME,
			password: process.env.DATABASE_PASSWORD,
		};
		const conn = connect(config);

		const resultsArray = [];

		for (const snapshot of snapshots) {
			const result = await conn.execute(
				'INSERT INTO water_temperatures (category_id, measurement_site, body_of_water, date, water_temperature) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE water_temperature = VALUES(water_temperature)',
				[snapshot.category_id, snapshot.measurement_site, snapshot.body_of_water, snapshot.date, snapshot.water_temperature]
			);
			resultsArray.push(result);
		}

		return resultsArray;
	}

	const html = await fetchUrl(url);

	const snapshots = await parseHtml(html, selector);

	const results = await storeLakeSnapshot(snapshots);

	return results;

}