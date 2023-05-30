import { parse } from 'node-html-parser';
import 'dotenv/config';
import { connect } from '@planetscale/database';

async function getBodyOfWater(category_id = 0) {  // 0 = lakes, 1 = rivers

  const categories = [
    { name: "lakes", url: "https://www.gkd.bayern.de/en/lakes/watertemperature/tables" },
    { name: "rivers", url: "https://www.gkd.bayern.de/en/rivers/watertemperature/tables" },
  ]

  const url = categories[category_id].url;

  function convertGermanDateToIso(dateStr) {
    // const dateStr = "24.05.2023 20:00";
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
    const items = [];
    root.querySelectorAll(selector).forEach((item) => {
      const children = item.querySelectorAll("td")

      const measurement_site = children[0].textContent
      const body_of_water = children[1].textContent
      const date = children[3].textContent
      const water_temperature = children[4].textContent

      if (date !== "--" && water_temperature !== "--") {
        items.push({
          category_id,
          measurement_site,
          body_of_water,
          date: convertGermanDateToIso(date),
          water_temperature,
        });
      }
    });
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

  const snapshots = await parseHtml(html, "#karteTabellen tr:not(:first-child)");

  const results = await storeLakeSnapshot(snapshots);

  return results;

}
