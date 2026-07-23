export interface SparklineDataPoint {
  timestamp: string;
  value: number;
}

const NOISE_THRESHOLD = 5;

const timeFormatter = new Intl.DateTimeFormat("de-DE", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Berlin",
});

function formatTime(timestamp: string): string {
  return timeFormatter.format(new Date(timestamp));
}

function round(value: number): number {
  return Math.round(value);
}

function countSlopeInversions(points: SparklineDataPoint[]): number {
  if (points.length < 2) return 0;

  let direction: "up" | "down" | null = null;
  let inversions = 0;

  for (let i = 1; i < points.length; i++) {
    const diff = points[i].value - points[i - 1].value;
    if (Math.abs(diff) < NOISE_THRESHOLD) continue;

    const newDirection = diff > 0 ? "up" : "down";
    if (direction !== null && newDirection !== direction) {
      inversions++;
    }
    direction = newDirection;
  }

  return inversions;
}

function findExtremum(
  points: SparklineDataPoint[],
  type: "min" | "max",
): { value: number; timestamp: string } {
  let extremum = points[0];
  for (let i = 1; i < points.length; i++) {
    if (type === "min" ? points[i].value < extremum.value : points[i].value > extremum.value) {
      extremum = points[i];
    }
  }
  return extremum;
}

export function sparklineAltText(
  data: SparklineDataPoint[],
  currentValue: number | null,
  unit: string,
): string {
  if (data.length === 0) {
    return "No trend data available.";
  }

  const current = currentValue ?? data[data.length - 1].value;

  if (data.length === 1) {
    return `Currently at ${round(current)}${unit}.`;
  }

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;

  if (range < NOISE_THRESHOLD) {
    return `Nearly constant at ${round(current)}${unit}.`;
  }

  const k = countSlopeInversions(data);
  const first = data[0].value;
  const last = data[data.length - 1].value;

  if (k === 0) {
    if (last > first) {
      return `Steadily increased from ${round(first)}${unit} to ${round(last)}${unit}.`;
    }
    return `Steadily decreased from ${round(first)}${unit} to ${round(last)}${unit}.`;
  }

  if (k === 1) {
    const isHill = max !== first && max !== last;
    if (isHill) {
      const peak = findExtremum(data, "max");
      return `Rose to a peak of ${round(peak.value)}${unit} at ${formatTime(peak.timestamp)}, now at ${round(current)}${unit}.`;
    }
    const trough = findExtremum(data, "min");
    return `Dropped to a low of ${round(trough.value)}${unit} at ${formatTime(trough.timestamp)}, now at ${round(current)}${unit}.`;
  }

  return `Fluctuated between ${round(min)}${unit} and ${round(max)}${unit}, currently at ${round(current)}${unit}.`;
}
