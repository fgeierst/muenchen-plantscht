// eslint-disable-next-line vite-plus/prefer-vite-plus-imports -- vitest browser mode doesn't support vite-plus/test
import { describe, expect, it } from "vitest";
import { sparklineAltText } from "./sparklineAltText";
import { busyArea, mediumArea, quietArea, noDataArea } from "../components/areaCard.fixtures";
import { warmRiver, coldRiver } from "../components/waterCard.fixtures";

function berlinTime(iso: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Berlin",
  }).format(new Date(iso));
}

function ts(hour: number): string {
  return `2026-07-18T${String(hour).padStart(2, "0")}:00:00.000Z`;
}

describe("sparklineAltText", () => {
  describe("edge cases", () => {
    it("returns no-data message for empty array", () => {
      expect(sparklineAltText([], null, "% free")).toBe("No trend data available.");
    });

    it("returns single-point message for one data point", () => {
      const points = [{ timestamp: ts(10), value: 75 }];
      expect(sparklineAltText(points, 75, "% free")).toBe("Currently at 75% free.");
    });

    it("falls back to last data point when currentValue is null", () => {
      const points = [{ timestamp: ts(10), value: 75 }];
      expect(sparklineAltText(points, null, "% free")).toBe("Currently at 75% free.");
    });

    it("returns no-data message when both data and currentValue are empty/null", () => {
      expect(sparklineAltText([], null, "% free")).toBe("No trend data available.");
    });
  });

  describe("flat archetype", () => {
    it("returns nearly-constant when all values are identical", () => {
      const points = [
        { timestamp: ts(7), value: 100 },
        { timestamp: ts(12), value: 100 },
        { timestamp: ts(18), value: 100 },
      ];
      expect(sparklineAltText(points, 100, "% free")).toBe("Nearly constant at 100% free.");
    });

    it("returns nearly-constant when range is below noise threshold", () => {
      const points = [
        { timestamp: ts(7), value: 98 },
        { timestamp: ts(12), value: 99 },
        { timestamp: ts(18), value: 97 },
      ];
      expect(sparklineAltText(points, 98, "% free")).toBe("Nearly constant at 98% free.");
    });
  });

  describe("linear trend archetype", () => {
    it("returns steadily-decreased for monotonic decrease (k=0)", () => {
      const points = [
        { timestamp: ts(7), value: 100 },
        { timestamp: ts(12), value: 80 },
        { timestamp: ts(18), value: 60 },
      ];
      expect(sparklineAltText(points, 60, "% free")).toBe(
        "Steadily decreased from 100% free to 60% free.",
      );
    });

    it("returns steadily-increased for monotonic increase (k=0)", () => {
      const points = [
        { timestamp: ts(7), value: 60 },
        { timestamp: ts(12), value: 80 },
        { timestamp: ts(18), value: 100 },
      ];
      expect(sparklineAltText(points, 100, "% free")).toBe(
        "Steadily increased from 60% free to 100% free.",
      );
    });

    it("ignores jitter when classifying as linear", () => {
      const points = [
        { timestamp: ts(7), value: 100 },
        { timestamp: ts(9), value: 97 },
        { timestamp: ts(11), value: 80 },
        { timestamp: ts(13), value: 78 },
        { timestamp: ts(15), value: 60 },
      ];
      expect(sparklineAltText(points, 60, "% free")).toBe(
        "Steadily decreased from 100% free to 60% free.",
      );
    });
  });

  describe("hill archetype", () => {
    it("returns rose-to-peak for single mid-series maximum (k=1, up then down)", () => {
      const points = [
        { timestamp: ts(7), value: 50 },
        { timestamp: ts(11), value: 90 },
        { timestamp: ts(15), value: 60 },
      ];
      const expectedTime = berlinTime(ts(11));
      expect(sparklineAltText(points, 60, "% free")).toBe(
        `Rose to a peak of 90% free at ${expectedTime}, now at 60% free.`,
      );
    });
  });

  describe("dip archetype", () => {
    it("returns dropped-to-low for single mid-series minimum (k=1, down then up)", () => {
      const points = [
        { timestamp: ts(7), value: 100 },
        { timestamp: ts(11), value: 40 },
        { timestamp: ts(15), value: 80 },
      ];
      const expectedTime = berlinTime(ts(11));
      expect(sparklineAltText(points, 80, "% free")).toBe(
        `Dropped to a low of 40% free at ${expectedTime}, now at 80% free.`,
      );
    });
  });

  describe("wave archetype", () => {
    it("returns fluctuated for high volatility (k>=2)", () => {
      const points = [
        { timestamp: ts(7), value: 100 },
        { timestamp: ts(9), value: 40 },
        { timestamp: ts(11), value: 90 },
        { timestamp: ts(13), value: 30 },
        { timestamp: ts(15), value: 80 },
      ];
      expect(sparklineAltText(points, 80, "% free")).toBe(
        "Fluctuated between 30% free and 100% free, currently at 80% free.",
      );
    });
  });

  describe("area fixtures", () => {
    it("classifies busyArea as Dip", () => {
      const points = busyArea.data.map((d) => ({
        timestamp: d.recorded_at,
        value: d.capacity_free_pct,
      }));
      const current = busyArea.latest?.capacity_free_pct ?? null;
      const minPoint = busyArea.data.reduce((min, d) =>
        d.capacity_free_pct < min.capacity_free_pct ? d : min,
      );
      const expectedTime = berlinTime(minPoint.recorded_at);
      expect(sparklineAltText(points, current, "% free")).toBe(
        `Dropped to a low of 13% free at ${expectedTime}, now at 51% free.`,
      );
    });

    it("classifies mediumArea as Wave", () => {
      const points = mediumArea.data.map((d) => ({
        timestamp: d.recorded_at,
        value: d.capacity_free_pct,
      }));
      const current = mediumArea.latest?.capacity_free_pct ?? null;
      expect(sparklineAltText(points, current, "% free")).toBe(
        "Fluctuated between 71% free and 100% free, currently at 75% free.",
      );
    });

    it("classifies quietArea as Flat", () => {
      const points = quietArea.data.map((d) => ({
        timestamp: d.recorded_at,
        value: d.capacity_free_pct,
      }));
      const current = quietArea.latest?.capacity_free_pct ?? null;
      expect(sparklineAltText(points, current, "% free")).toBe("Nearly constant at 100% free.");
    });

    it("classifies noDataArea as Dip with null latest falling back to last data point", () => {
      const points = noDataArea.data.map((d) => ({
        timestamp: d.recorded_at,
        value: d.capacity_free_pct,
      }));
      const minPoint = noDataArea.data.reduce((min, d) =>
        d.capacity_free_pct < min.capacity_free_pct ? d : min,
      );
      const expectedTime = berlinTime(minPoint.recorded_at);
      expect(sparklineAltText(points, null, "% free")).toBe(
        `Dropped to a low of 13% free at ${expectedTime}, now at 51% free.`,
      );
    });
  });

  describe("water fixtures", () => {
    it("classifies warmRiver as Flat (temperature range below threshold)", () => {
      const points = warmRiver.data.map((d) => ({
        timestamp: d.measured_at,
        value: d.water_temperature,
      }));
      expect(sparklineAltText(points, warmRiver.water_temperature, "°")).toBe(
        "Nearly constant at 25°.",
      );
    });

    it("classifies coldRiver as Flat (2 data points, small range)", () => {
      const points = coldRiver.data.map((d) => ({
        timestamp: d.measured_at,
        value: d.water_temperature,
      }));
      expect(sparklineAltText(points, coldRiver.water_temperature, "°")).toBe(
        "Nearly constant at 11°.",
      );
    });
  });
});
