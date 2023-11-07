// Run every 15 minutes
// Cron: */15 * * * *

import { connect } from "@planetscale/database";
import { isGermanBusinessHours } from "./german-business-hours.js";
import "dotenv/config";

export async function getMunichSwimCapacit() {
  const organizationUnitIds = [
    { id: 30182, name: "Olympia-Schwimmhalle" },
    { id: 30184, name: "Nordbad" },
    { id: 30185, name: "Müller’sches Volksbad" },
    { id: 30187, name: "Südbad" },
    { id: 30188, name: "Schwimmbad 5" },
    { id: 30190, name: "Schwimmbad 6" },
    { id: 30191, name: "Schwimmbad 7" },
    { id: 30194, name: "Schwimmbad 8" },
    { id: 30195, name: "Schwimmbad 9" },
    { id: 30197, name: "Schwimmbad 10" },
    { id: 30199, name: "Westbad" },
    { id: 30201, name: "Schwimmbad 12" },
    { id: 30203, name: "Schwimmbad 13" },
    { id: 30204, name: "Schwimmbad 14" },
    { id: 30207, name: "Bad Forstenrieder Park" },
    { id: 30208, name: "Michaelibad" },
    { id: 30200, name: "Dantebad Sauna" },
  ];
  async function fetchCount(id) {
    const endpoint = `https://functions.api.ticos-systems.cloud/api/gates/counter?organizationUnitIds=${id}`;
    const response = await fetch(endpoint, {
      headers: {
        "abp-tenantid": "69",
        accept: "application/json, text/plain, */*",
        "cache-control": "no-cache",
        pragma: "no-cache",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
      },
      referrer: "https://www.swm.de/",
      referrerPolicy: "strict-origin-when-cross-origin",
      body: null,
      method: "GET",
      mode: "cors",
      credentials: "omit",
    });
    const data = await response.json();
    const { personCount, maxPersonCount } = data[0];
    return { id, personCount, maxPersonCount };
  }
  async function populateUnits() {
    for (let unit of organizationUnitIds) {
      const populatedUnit = await fetchCount(unit.id);
      unit.personCount = populatedUnit.personCount;
      unit.maxPersonCount = populatedUnit.maxPersonCount;
    }
  }
  await populateUnits();
  return organizationUnitIds;
}

export async function addPersonCount(
  location_id,
  person_count,
  max_person_count
) {
  const config = {
    host: process.env.DATABASE_HOST,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
  };
  const conn = connect(config);
  const results = await conn.execute(
    `INSERT INTO person_count_log (location_id, person_count, max_person_count) VALUES(${location_id}, ${person_count}, ${max_person_count});`,
    [1]
  );
  return results;
}

export async function pushToArchive() {
  if (isGermanBusinessHours()) {
    const organizationUnitIds = await getMunichSwimCapacit();
    console.log(organizationUnitIds);

    const results = await Promise.all(
      organizationUnitIds.map(async (item) => {
        const result = await addPersonCount(
          item.id,
          item.personCount,
          item.maxPersonCount
        );
        return result;
      })
    );

    return {
      message: `Added ${results.length} rows to the database.`,
      results,
    };
  } else {
    return "Canceled because not in business hours.";
  }
}

// pushToArchive().then((data) => {
//   console.log(data);
// });

getMunichSwimCapacit().then((data) => {
  console.log(data);
});
