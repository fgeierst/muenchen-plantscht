import type { SparklineDataPoint } from "./sparklineAltText";

/**
 * Raw time-series inputs for sparklineAltText, extracted from the real
 * captures that previously lived in the card fixtures. These exercise the
 * classification archetypes (Dip, Wave, Flat) independently of the card
 * component fixtures, which no longer carry a `data` array.
 */

export const busyAreaSeries: SparklineDataPoint[] = [
  { timestamp: "2026-07-18T05:15:22.187Z", value: 100 },
  { timestamp: "2026-07-18T06:01:11.167Z", value: 88 },
  { timestamp: "2026-07-18T06:45:15.156Z", value: 80 },
  { timestamp: "2026-07-18T07:30:05.477Z", value: 79 },
  { timestamp: "2026-07-18T08:15:26.006Z", value: 73 },
  { timestamp: "2026-07-18T09:00:07.297Z", value: 65 },
  { timestamp: "2026-07-18T09:45:08.588Z", value: 59 },
  { timestamp: "2026-07-18T10:30:27.644Z", value: 52 },
  { timestamp: "2026-07-18T11:16:28.081Z", value: 48 },
  { timestamp: "2026-07-18T12:00:17.605Z", value: 43 },
  { timestamp: "2026-07-18T12:45:02.809Z", value: 36 },
  { timestamp: "2026-07-18T13:30:40.239Z", value: 22 },
  { timestamp: "2026-07-18T14:15:00.307Z", value: 13 },
  { timestamp: "2026-07-18T14:45:34.235Z", value: 15 },
  { timestamp: "2026-07-18T15:31:11.367Z", value: 19 },
  { timestamp: "2026-07-18T16:15:24.231Z", value: 28 },
  { timestamp: "2026-07-18T17:01:10.853Z", value: 36 },
  { timestamp: "2026-07-18T17:45:01.184Z", value: 49 },
  { timestamp: "2026-07-18T18:15:54.682Z", value: 51 },
];

export const mediumAreaSeries: SparklineDataPoint[] = [
  { timestamp: "2026-07-18T08:46:03.888Z", value: 100 },
  { timestamp: "2026-07-18T09:30:05.481Z", value: 86 },
  { timestamp: "2026-07-18T10:16:10.038Z", value: 73 },
  { timestamp: "2026-07-18T11:00:39.662Z", value: 76 },
  { timestamp: "2026-07-18T11:45:04.819Z", value: 84 },
  { timestamp: "2026-07-18T12:30:12.434Z", value: 85 },
  { timestamp: "2026-07-18T13:15:04.868Z", value: 84 },
  { timestamp: "2026-07-18T14:00:06.470Z", value: 84 },
  { timestamp: "2026-07-18T14:30:13.629Z", value: 79 },
  { timestamp: "2026-07-18T15:15:29.008Z", value: 76 },
  { timestamp: "2026-07-18T16:00:49.206Z", value: 77 },
  { timestamp: "2026-07-18T16:45:24.913Z", value: 79 },
  { timestamp: "2026-07-18T17:30:10.399Z", value: 77 },
  { timestamp: "2026-07-18T18:00:56.028Z", value: 71 },
];

export const quietAreaSeries: SparklineDataPoint[] = Array.from({ length: 15 }, (_, i) => ({
  timestamp: `2026-07-18T${String(6 + i).padStart(2, "0")}:00:00.000Z`,
  value: 100,
}));

export const warmRiverSeries: SparklineDataPoint[] = [
  { timestamp: "2026-07-19T17:00:00.000Z", value: 25.4 },
  { timestamp: "2026-07-19T20:45:00.000Z", value: 24.8 },
  { timestamp: "2026-07-20T01:45:00.000Z", value: 24.1 },
  { timestamp: "2026-07-20T06:45:00.000Z", value: 23.9 },
  { timestamp: "2026-07-20T11:15:00.000Z", value: 25.2 },
  { timestamp: "2026-07-20T14:45:00.000Z", value: 26 },
  { timestamp: "2026-07-20T19:45:00.000Z", value: 24.8 },
  { timestamp: "2026-07-21T00:45:00.000Z", value: 23.7 },
  { timestamp: "2026-07-21T06:45:00.000Z", value: 23.4 },
  { timestamp: "2026-07-21T10:45:00.000Z", value: 25 },
  { timestamp: "2026-07-21T15:45:00.000Z", value: 25.7 },
  { timestamp: "2026-07-21T19:45:00.000Z", value: 24.7 },
  { timestamp: "2026-07-21T22:45:00.000Z", value: 24.1 },
  { timestamp: "2026-07-22T03:45:00.000Z", value: 23.3 },
  { timestamp: "2026-07-22T08:45:00.000Z", value: 23.8 },
  { timestamp: "2026-07-22T14:45:00.000Z", value: 25.1 },
];

export const coldRiverSeries: SparklineDataPoint[] = [
  { timestamp: "2026-07-22T13:00:00.000Z", value: 10.3 },
  { timestamp: "2026-07-22T14:45:00.000Z", value: 11.2 },
];
