/** WLAN signal bars (0–4) from RSSI in dBm. */
export function rssiLevel(rssi: number): 0 | 1 | 2 | 3 | 4 {
  if (Number.isNaN(rssi)) return 0;
  return rssi >= -55 ? 4 : rssi >= -67 ? 3 : rssi >= -75 ? 2 : rssi >= -85 ? 1 : 0;
}

/** Meter level from a percentage and thresholds (percent of max). */
export function meterLevel(pct: number, warn = 75, danger = 90): 'ok' | 'warn' | 'danger' {
  return pct >= danger ? 'danger' : pct >= warn ? 'warn' : 'ok';
}

/** Polyline points for a sparkline in a W×H box (2px vertical padding). */
export function sparklinePoints(values: number[], width: number, height: number, min?: number, max?: number): string {
  if (!values.length) return '';
  let lo = min ?? Math.min(...values);
  let hi = max ?? Math.max(...values);
  if (hi === lo) {
    hi += 1;
    lo -= 1;
  }
  return values
    .map((n, i) => {
      const x = values.length === 1 ? width : (i / (values.length - 1)) * width;
      const y = height - 2 - ((n - lo) / (hi - lo)) * (height - 4);
      return `${+x.toFixed(2)},${+y.toFixed(2)}`;
    })
    .join(' ');
}

/** Accepts `number[]`, a JSON array string or a comma-separated string. */
export function parseNumbers(input: number[] | string | undefined | null): number[] {
  if (Array.isArray(input)) return input.map(Number).filter((n) => !Number.isNaN(n));
  if (!input) return [];
  const s = input.trim();
  if (s.startsWith('[')) {
    try {
      return parseNumbers(JSON.parse(s) as number[]);
    } catch {
      return [];
    }
  }
  return s.split(',').map((n) => Number(n.trim())).filter((n) => !Number.isNaN(n));
}
