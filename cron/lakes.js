import { parse } from 'node-html-parser';
import 'dotenv/config';
import { connect } from '@planetscale/database';

// lakes https://www.gkd.bayern.de/en/lakes/waterlevel/tables
// rivers https://www.gkd.bayern.de/en/rivers/watertemperature/tables
const url = 'https://www.gkd.bayern.de/en/lakes/waterlevel/tables';

function convertGermanDateToIso(dateStr) {
  // const dateStr = "24.05.2023 20:00";
  console.log(dateStr);
  
  const [day, month, year, hour, minute] = dateStr.split(/[.: ]/);
	const dateObj = new Date(year, month, day, hour, minute);	
  return dateObj.toISOString().slice(0, 19).replace("T", " ");
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
			`INSERT INTO lakes (location_name, timestamp, temperature) VALUES (?, ?, ?)`,
			[snapshot.location_name, snapshot.date, snapshot.temperature]
		);
		resultsArray.push(result);
	}
	
	return resultsArray;
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
  const items = [];
  root.querySelectorAll(selector).forEach((item) => {
    const line = item.structuredText;
		const parts = line.split("\n");
		
		const [checkpoint, location_name, region, date, temperature] = parts;
		if (date !== "--" && temperature !== "--") {
			items.push({
				location_name,
				date: convertGermanDateToIso(date),
				temperature,
			});
		}
  });
  return items;
}

const html = await fetchUrl(url);

const snapshots = await parseHtml( html, "#karteTabellen tr:not(:first-child)" );

// const results = await storeLakeSnapshot(snapshots);

console.log(snapshots);
