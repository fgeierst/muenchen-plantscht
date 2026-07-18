import type { AreaWithComparison } from "$lib/pools";

/**
 * Realistic fixture data captured from the live backend
 * (https://muenchen-plantscht-pools.val.run) on 2026-07-18.
 * `path2` values are the same areas' `path` from 2026-07-17.
 * `data` arrays are sampled (every 3rd point) from the real time-series.
 * Paths use the business-hours x-axis (07:00–23:00 → x=0–200).
 */

export const busyArea: AreaWithComparison = {
  area_id: 3,
  area_name: "Michaelibad Hallenbad",
  path: "M3,100C4.03,100.783,5.061,101.567,6,100C6.939,98.433,7.788,94.517,9,92C10.212,89.483,11.789,88.366,13,88C14.211,87.634,15.056,88.019,16,87C16.944,85.981,17.985,83.557,19,82C20.015,80.443,21.003,79.755,22,80C22.997,80.245,24.003,81.425,25,82C25.997,82.575,26.985,82.545,28,82C29.015,81.455,30.057,80.396,31,79C31.943,77.604,32.789,75.87,34,75C35.211,74.13,36.789,74.125,38,74C39.211,73.875,40.057,73.629,41,73C41.943,72.371,42.985,71.358,44,70C45.015,68.642,46.003,66.937,47,66C47.997,65.063,49.003,64.892,50,65C50.997,65.108,51.985,65.493,53,65C54.015,64.507,55.057,63.135,56,62C56.943,60.865,57.789,59.967,59,59C60.211,58.033,61.789,56.995,63,57C64.211,57.005,65.057,58.051,66,57C66.943,55.949,67.985,52.799,69,52C70.015,51.201,71.003,52.753,72,53C72.997,53.247,74.003,52.191,75,51C75.997,49.809,76.985,48.484,78,48C79.015,47.516,80.057,47.873,81,48C81.943,48.127,82.789,48.022,84,47C85.211,45.978,86.789,44.038,88,43C89.211,41.962,90.057,41.827,91,41C91.943,40.173,92.985,38.655,94,38C95.015,37.345,96.003,37.554,97,36C97.997,34.446,99.002,31.129,100,29C100.998,26.871,101.988,25.931,103,25C104.012,24.069,105.044,23.146,106,22C106.956,20.854,107.834,19.485,109,18C110.166,16.515,111.619,14.915,113,14C114.381,13.085,115.691,12.855,116,13C116.309,13.145,115.619,13.664,116,13C116.381,12.336,117.834,10.489,119,11C120.166,11.511,121.043,14.38,122,15C122.957,15.62,123.992,13.989,125,13C126.008,12.011,126.988,11.663,128,13C129.012,14.337,130.056,17.36,131,19C131.944,20.64,132.789,20.896,134,22C135.211,23.104,136.789,25.056,138,26C139.211,26.944,140.057,26.88,141,28C141.943,29.12,142.984,31.426,144,32C145.016,32.574,146.008,31.418,147,32C147.992,32.582,148.986,34.901,150,36C151.014,37.099,152.05,36.976,153,36C153.95,35.024,154.815,33.194,156,36C157.185,38.806,158.689,46.247,159,49C159.311,51.753,158.43,49.818,159,49C159.57,48.182,161.591,48.481,163,49C164.409,49.519,165.204,50.26,166,51",
  path2:
    "M169,71C169.268,71.309,169.536,71.618,170,72C170.464,72.382,171.123,72.837,172,73C172.877,73.163,173.971,73.034,175,73C176.029,72.966,176.994,73.025,178,74C179.006,74.975,180.054,76.864,181,78C181.946,79.136,182.789,79.52,184,81C185.211,82.48,186.788,85.057,188,86C189.212,86.943,190.057,86.254,191,87C191.943,87.746,192.984,89.927,194,91C195.016,92.073,196.008,92.036,197,92",
  latest: {
    recorded_at: "2026-07-18T18:15:54.682Z",
    customer_amount: 282,
    customer_amount_max: 570,
    capacity_free_pct: 51,
  },
  data: [
    {
      recorded_at: "2026-07-18T05:15:22.187Z",
      customer_amount: 0,
      customer_amount_max: 570,
      capacity_free_pct: 100,
    },
    {
      recorded_at: "2026-07-18T06:01:11.167Z",
      customer_amount: 66,
      customer_amount_max: 570,
      capacity_free_pct: 88,
    },
    {
      recorded_at: "2026-07-18T06:45:15.156Z",
      customer_amount: 114,
      customer_amount_max: 570,
      capacity_free_pct: 80,
    },
    {
      recorded_at: "2026-07-18T07:30:05.477Z",
      customer_amount: 121,
      customer_amount_max: 570,
      capacity_free_pct: 79,
    },
    {
      recorded_at: "2026-07-18T08:15:26.006Z",
      customer_amount: 152,
      customer_amount_max: 570,
      capacity_free_pct: 73,
    },
    {
      recorded_at: "2026-07-18T09:00:07.297Z",
      customer_amount: 199,
      customer_amount_max: 570,
      capacity_free_pct: 65,
    },
    {
      recorded_at: "2026-07-18T09:45:08.588Z",
      customer_amount: 232,
      customer_amount_max: 570,
      capacity_free_pct: 59,
    },
    {
      recorded_at: "2026-07-18T10:30:27.644Z",
      customer_amount: 272,
      customer_amount_max: 570,
      capacity_free_pct: 52,
    },
    {
      recorded_at: "2026-07-18T11:16:28.081Z",
      customer_amount: 298,
      customer_amount_max: 570,
      capacity_free_pct: 48,
    },
    {
      recorded_at: "2026-07-18T12:00:17.605Z",
      customer_amount: 324,
      customer_amount_max: 570,
      capacity_free_pct: 43,
    },
    {
      recorded_at: "2026-07-18T12:45:02.809Z",
      customer_amount: 365,
      customer_amount_max: 570,
      capacity_free_pct: 36,
    },
    {
      recorded_at: "2026-07-18T13:30:40.239Z",
      customer_amount: 447,
      customer_amount_max: 570,
      capacity_free_pct: 22,
    },
    {
      recorded_at: "2026-07-18T14:15:00.307Z",
      customer_amount: 494,
      customer_amount_max: 570,
      capacity_free_pct: 13,
    },
    {
      recorded_at: "2026-07-18T14:45:34.235Z",
      customer_amount: 484,
      customer_amount_max: 570,
      capacity_free_pct: 15,
    },
    {
      recorded_at: "2026-07-18T15:31:11.367Z",
      customer_amount: 463,
      customer_amount_max: 570,
      capacity_free_pct: 19,
    },
    {
      recorded_at: "2026-07-18T16:15:24.231Z",
      customer_amount: 410,
      customer_amount_max: 570,
      capacity_free_pct: 28,
    },
    {
      recorded_at: "2026-07-18T17:01:10.853Z",
      customer_amount: 365,
      customer_amount_max: 570,
      capacity_free_pct: 36,
    },
    {
      recorded_at: "2026-07-18T17:45:01.184Z",
      customer_amount: 288,
      customer_amount_max: 570,
      capacity_free_pct: 49,
    },
    {
      recorded_at: "2026-07-18T18:15:54.682Z",
      customer_amount: 282,
      customer_amount_max: 570,
      capacity_free_pct: 51,
    },
  ],
};

export const mediumArea: AreaWithComparison = {
  area_id: 84,
  area_name: "Müller'sches Volksbad Hallenbad",
  path: "M47,100C48.002,100.509,49.004,101.019,50,99C50.996,96.981,51.985,92.435,53,90C54.015,87.565,55.057,87.243,56,86C56.943,84.757,57.789,82.592,59,80C60.211,77.408,61.789,74.387,63,73C64.211,71.613,65.057,71.86,66,73C66.943,74.14,67.985,76.174,69,77C70.015,77.826,71.003,77.444,72,77C72.997,76.556,74.003,76.05,75,76C75.997,75.95,76.985,76.358,78,77C79.015,77.642,80.057,78.52,81,80C81.943,81.48,82.789,83.564,84,84C85.211,84.436,86.789,83.225,88,83C89.211,82.775,90.057,83.538,91,84C91.943,84.462,92.985,84.624,94,85C95.015,85.376,96.003,85.967,97,86C97.997,86.033,99.002,85.509,100,85C100.998,84.491,101.988,83.997,103,84C104.012,84.003,105.044,84.502,106,84C106.956,83.498,107.834,81.995,109,82C110.166,82.005,111.619,83.52,113,84C114.381,84.48,115.691,83.926,116,84C116.309,84.074,115.619,84.775,116,84C116.381,83.225,117.834,80.973,119,79C120.166,77.027,121.043,75.332,122,75C122.957,74.668,123.992,75.697,125,76C126.008,76.303,126.988,75.878,128,76C129.012,76.122,130.056,76.79,131,77C131.944,77.21,132.789,76.961,134,77C135.211,77.039,136.789,77.367,138,77C139.211,76.633,140.057,75.572,141,76C141.943,76.428,142.984,78.345,144,79C145.016,79.655,146.008,79.048,147,79C147.992,78.952,148.986,79.465,150,79C151.014,78.535,152.05,77.093,153,77C153.95,76.907,154.815,78.163,156,77C157.185,75.837,158.689,72.255,159,71C159.311,69.745,158.43,70.816,159,71C159.57,71.184,161.591,70.481,163,71C164.409,71.519,165.204,73.259,166,75",
  path2:
    "M169,86C169.268,85.738,169.536,85.476,170,86C170.464,86.524,171.125,87.833,172,90C172.875,92.167,173.964,95.19,175,97C176.036,98.81,177.018,99.405,178,100",
  latest: {
    recorded_at: "2026-07-18T18:15:54.682Z",
    customer_amount: 45,
    customer_amount_max: 177,
    capacity_free_pct: 75,
  },
  data: [
    {
      recorded_at: "2026-07-18T08:46:03.888Z",
      customer_amount: 0,
      customer_amount_max: 177,
      capacity_free_pct: 100,
    },
    {
      recorded_at: "2026-07-18T09:30:05.481Z",
      customer_amount: 25,
      customer_amount_max: 177,
      capacity_free_pct: 86,
    },
    {
      recorded_at: "2026-07-18T10:16:10.038Z",
      customer_amount: 47,
      customer_amount_max: 177,
      capacity_free_pct: 73,
    },
    {
      recorded_at: "2026-07-18T11:00:39.662Z",
      customer_amount: 43,
      customer_amount_max: 177,
      capacity_free_pct: 76,
    },
    {
      recorded_at: "2026-07-18T11:45:04.819Z",
      customer_amount: 28,
      customer_amount_max: 177,
      capacity_free_pct: 84,
    },
    {
      recorded_at: "2026-07-18T12:30:12.434Z",
      customer_amount: 26,
      customer_amount_max: 177,
      capacity_free_pct: 85,
    },
    {
      recorded_at: "2026-07-18T13:15:04.868Z",
      customer_amount: 29,
      customer_amount_max: 177,
      capacity_free_pct: 84,
    },
    {
      recorded_at: "2026-07-18T14:00:06.470Z",
      customer_amount: 29,
      customer_amount_max: 177,
      capacity_free_pct: 84,
    },
    {
      recorded_at: "2026-07-18T14:30:13.629Z",
      customer_amount: 38,
      customer_amount_max: 177,
      capacity_free_pct: 79,
    },
    {
      recorded_at: "2026-07-18T15:15:29.008Z",
      customer_amount: 42,
      customer_amount_max: 177,
      capacity_free_pct: 76,
    },
    {
      recorded_at: "2026-07-18T16:00:49.206Z",
      customer_amount: 41,
      customer_amount_max: 177,
      capacity_free_pct: 77,
    },
    {
      recorded_at: "2026-07-18T16:45:24.913Z",
      customer_amount: 38,
      customer_amount_max: 177,
      capacity_free_pct: 79,
    },
    {
      recorded_at: "2026-07-18T17:30:10.399Z",
      customer_amount: 40,
      customer_amount_max: 177,
      capacity_free_pct: 77,
    },
    {
      recorded_at: "2026-07-18T18:00:56.028Z",
      customer_amount: 52,
      customer_amount_max: 177,
      capacity_free_pct: 71,
    },
  ],
};

export const quietArea: AreaWithComparison = {
  area_id: 90,
  area_name: "Hallenbad Bad Giesing-Harlaching",
  path: "M13,100C14,100,15,100,16,100C17,100,18,100,19,100C20,100,20.999,100,22,100C23.001,100,24.004,100,25,100C25.996,100,26.985,100,28,100C29.015,100,30.057,100,31,100C31.943,100,32.789,100,34,100C35.211,100,36.789,100,38,100C39.211,100,40.057,100,41,100C41.943,100,42.985,100,44,100C45.015,100,46.003,100,47,100C47.997,100,49.003,100,50,100C50.997,100,51.985,100,53,100C54.015,100,55.057,100,56,100C56.943,100,57.789,100,59,100C60.211,100,61.789,100,63,100C64.211,100,65.057,100,66,100C66.943,100,67.985,100,69,100C70.015,100,71.003,100,72,100C72.997,100,74.003,100,75,100C75.997,100,76.985,100,78,100C79.015,100,80.057,100,81,100C81.943,100,82.789,100,84,100C85.211,100,86.789,100,88,100C89.211,100,90.057,100,91,100C91.943,100,92.985,100,94,100C95.015,100,96.003,100,97,100C97.997,100,99.002,100,100,100C100.998,100,101.988,100,103,100C104.012,100,105.044,100,106,100C106.956,100,107.834,100,109,100C110.166,100,111.619,100,113,100C114.381,100,115.691,100,116,100C116.309,100,115.619,100,116,100C116.381,100,117.834,100,119,100C120.166,100,121.043,100,122,100C122.957,100,123.992,100,125,100C126.008,100,126.988,100,128,100C129.012,100,130.055,100,131,100C131.945,100,132.793,100,134,100C135.207,100,136.773,100,138,100C139.227,100,140.113,100,141,100",
  path2:
    "M169,100C169.268,100,169.536,100,170,100C170.464,100,171.125,100,172,100C172.875,100,173.964,100,175,100C176.036,100,177.018,100,178,100",
  latest: {
    recorded_at: "2026-07-18T16:15:24.231Z",
    customer_amount: 0,
    customer_amount_max: 311,
    capacity_free_pct: 100,
  },
  data: [
    {
      recorded_at: "2026-07-18T06:01:11.167Z",
      customer_amount: 0,
      customer_amount_max: 311,
      capacity_free_pct: 100,
    },
    {
      recorded_at: "2026-07-18T06:45:15.156Z",
      customer_amount: 0,
      customer_amount_max: 311,
      capacity_free_pct: 100,
    },
    {
      recorded_at: "2026-07-18T07:30:05.477Z",
      customer_amount: 0,
      customer_amount_max: 311,
      capacity_free_pct: 100,
    },
    {
      recorded_at: "2026-07-18T08:15:26.006Z",
      customer_amount: 0,
      customer_amount_max: 311,
      capacity_free_pct: 100,
    },
    {
      recorded_at: "2026-07-18T09:00:07.297Z",
      customer_amount: 0,
      customer_amount_max: 311,
      capacity_free_pct: 100,
    },
    {
      recorded_at: "2026-07-18T09:45:08.588Z",
      customer_amount: 0,
      customer_amount_max: 311,
      capacity_free_pct: 100,
    },
    {
      recorded_at: "2026-07-18T10:30:27.644Z",
      customer_amount: 0,
      customer_amount_max: 311,
      capacity_free_pct: 100,
    },
    {
      recorded_at: "2026-07-18T11:16:28.081Z",
      customer_amount: 0,
      customer_amount_max: 311,
      capacity_free_pct: 100,
    },
    {
      recorded_at: "2026-07-18T12:00:17.605Z",
      customer_amount: 0,
      customer_amount_max: 311,
      capacity_free_pct: 100,
    },
    {
      recorded_at: "2026-07-18T12:45:02.809Z",
      customer_amount: 0,
      customer_amount_max: 311,
      capacity_free_pct: 100,
    },
    {
      recorded_at: "2026-07-18T13:30:40.239Z",
      customer_amount: 0,
      customer_amount_max: 311,
      capacity_free_pct: 100,
    },
    {
      recorded_at: "2026-07-18T14:15:00.307Z",
      customer_amount: 0,
      customer_amount_max: 311,
      capacity_free_pct: 100,
    },
    {
      recorded_at: "2026-07-18T14:45:34.235Z",
      customer_amount: 0,
      customer_amount_max: 311,
      capacity_free_pct: 100,
    },
    {
      recorded_at: "2026-07-18T15:31:11.367Z",
      customer_amount: 0,
      customer_amount_max: 311,
      capacity_free_pct: 100,
    },
    {
      recorded_at: "2026-07-18T16:15:24.231Z",
      customer_amount: 0,
      customer_amount_max: 311,
      capacity_free_pct: 100,
    },
  ],
};

export const noDataArea: AreaWithComparison = {
  area_id: 999,
  area_name: "Praterbad Hallenbad",
  path: "M3,100C4.03,100.783,5.061,101.567,6,100C6.939,98.433,7.788,94.517,9,92C10.212,89.483,11.789,88.366,13,88C14.211,87.634,15.056,88.019,16,87C16.944,85.981,17.985,83.557,19,82C20.015,80.443,21.003,79.755,22,80C22.997,80.245,24.003,81.425,25,82C25.997,82.575,26.985,82.545,28,82C29.015,81.455,30.057,80.396,31,79C31.943,77.604,32.789,75.87,34,75C35.211,74.13,36.789,74.125,38,74C39.211,73.875,40.057,73.629,41,73C41.943,72.371,42.985,71.358,44,70C45.015,68.642,46.003,66.937,47,66C47.997,65.063,49.003,64.892,50,65C50.997,65.108,51.985,65.493,53,65C54.015,64.507,55.057,63.135,56,62C56.943,60.865,57.789,59.967,59,59C60.211,58.033,61.789,56.995,63,57C64.211,57.005,65.057,58.051,66,57C66.943,55.949,67.985,52.799,69,52C70.015,51.201,71.003,52.753,72,53C72.997,53.247,74.003,52.191,75,51C75.997,49.809,76.985,48.484,78,48C79.015,47.516,80.057,47.873,81,48C81.943,48.127,82.789,48.022,84,47C85.211,45.978,86.789,44.038,88,43C89.211,41.962,90.057,41.827,91,41C91.943,40.173,92.985,38.655,94,38C95.015,37.345,96.003,37.554,97,36C97.997,34.446,99.002,31.129,100,29C100.998,26.871,101.988,25.931,103,25C104.012,24.069,105.044,23.146,106,22C106.956,20.854,107.834,19.485,109,18C110.166,16.515,111.619,14.915,113,14C114.381,13.085,115.691,12.855,116,13C116.309,13.145,115.619,13.664,116,13C116.381,12.336,117.834,10.489,119,11C120.166,11.511,121.043,14.38,122,15C122.957,15.62,123.992,13.989,125,13C126.008,12.011,126.988,11.663,128,13C129.012,14.337,130.056,17.36,131,19C131.944,20.64,132.789,20.896,134,22C135.211,23.104,136.789,25.056,138,26C139.211,26.944,140.057,26.88,141,28C141.943,29.12,142.984,31.426,144,32C145.016,32.574,146.008,31.418,147,32C147.992,32.582,148.986,34.901,150,36C151.014,37.099,152.05,36.976,153,36C153.95,35.024,154.815,33.194,156,36C157.185,38.806,158.689,46.247,159,49C159.311,51.753,158.43,49.818,159,49C159.57,48.182,161.591,48.481,163,49C164.409,49.519,165.204,50.26,166,51",
  path2:
    "M169,71C169.268,71.309,169.536,71.618,170,72C170.464,72.382,171.123,72.837,172,73C172.877,73.163,173.971,73.034,175,73C176.029,72.966,176.994,73.025,178,74C179.006,74.975,180.054,76.864,181,78C181.946,79.136,182.789,79.52,184,81C185.211,82.48,186.788,85.057,188,86C189.212,86.943,190.057,86.254,191,87C191.943,87.746,192.984,89.927,194,91C195.016,92.073,196.008,92.036,197,92",
  latest: null,
  data: [
    {
      recorded_at: "2026-07-18T05:15:22.187Z",
      customer_amount: 0,
      customer_amount_max: 570,
      capacity_free_pct: 100,
    },
    {
      recorded_at: "2026-07-18T06:01:11.167Z",
      customer_amount: 66,
      customer_amount_max: 570,
      capacity_free_pct: 88,
    },
    {
      recorded_at: "2026-07-18T06:45:15.156Z",
      customer_amount: 114,
      customer_amount_max: 570,
      capacity_free_pct: 80,
    },
    {
      recorded_at: "2026-07-18T07:30:05.477Z",
      customer_amount: 121,
      customer_amount_max: 570,
      capacity_free_pct: 79,
    },
    {
      recorded_at: "2026-07-18T08:15:26.006Z",
      customer_amount: 152,
      customer_amount_max: 570,
      capacity_free_pct: 73,
    },
    {
      recorded_at: "2026-07-18T09:00:07.297Z",
      customer_amount: 199,
      customer_amount_max: 570,
      capacity_free_pct: 65,
    },
    {
      recorded_at: "2026-07-18T09:45:08.588Z",
      customer_amount: 232,
      customer_amount_max: 570,
      capacity_free_pct: 59,
    },
    {
      recorded_at: "2026-07-18T10:30:27.644Z",
      customer_amount: 272,
      customer_amount_max: 570,
      capacity_free_pct: 52,
    },
    {
      recorded_at: "2026-07-18T11:16:28.081Z",
      customer_amount: 298,
      customer_amount_max: 570,
      capacity_free_pct: 48,
    },
    {
      recorded_at: "2026-07-18T12:00:17.605Z",
      customer_amount: 324,
      customer_amount_max: 570,
      capacity_free_pct: 43,
    },
    {
      recorded_at: "2026-07-18T12:45:02.809Z",
      customer_amount: 365,
      customer_amount_max: 570,
      capacity_free_pct: 36,
    },
    {
      recorded_at: "2026-07-18T13:30:40.239Z",
      customer_amount: 447,
      customer_amount_max: 570,
      capacity_free_pct: 22,
    },
    {
      recorded_at: "2026-07-18T14:15:00.307Z",
      customer_amount: 494,
      customer_amount_max: 570,
      capacity_free_pct: 13,
    },
    {
      recorded_at: "2026-07-18T14:45:34.235Z",
      customer_amount: 484,
      customer_amount_max: 570,
      capacity_free_pct: 15,
    },
    {
      recorded_at: "2026-07-18T15:31:11.367Z",
      customer_amount: 463,
      customer_amount_max: 570,
      capacity_free_pct: 19,
    },
    {
      recorded_at: "2026-07-18T16:15:24.231Z",
      customer_amount: 410,
      customer_amount_max: 570,
      capacity_free_pct: 28,
    },
    {
      recorded_at: "2026-07-18T17:01:10.853Z",
      customer_amount: 365,
      customer_amount_max: 570,
      capacity_free_pct: 36,
    },
    {
      recorded_at: "2026-07-18T17:45:01.184Z",
      customer_amount: 288,
      customer_amount_max: 570,
      capacity_free_pct: 49,
    },
    {
      recorded_at: "2026-07-18T18:15:54.682Z",
      customer_amount: 282,
      customer_amount_max: 570,
      capacity_free_pct: 51,
    },
  ],
};
