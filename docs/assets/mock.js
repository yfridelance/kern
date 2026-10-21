// Example data for the pattern pages: deterministic devices and a fake server with delay, errors and paging.
// Nothing here is part of Kern – an app brings its own data and API. Import from a pattern example:
//   const { devices, fakeServer, simulateTargets } = await import('../assets/mock.js');

/** Small seeded random generator, so every page load shows the same data. */
function random(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}

const SITES = ['Haus Seeblick', 'Ferienwohnung', 'Büro Bern'];
const ROOMS = ['Kitchen', 'Bathroom', 'Living room', 'Bedroom', 'Office', 'Hallway', 'Garage', 'Garden', 'Attic', 'Basement'];
const KINDS = [
  ['light', 'Shelly 1 Mini Gen3'],
  ['fan', 'Shelly Plus 1PM'],
  ['shutter', 'Shelly Plus 2PM'],
  ['socket', 'Shelly Plug S'],
  ['sensor', 'Shelly H&T Gen3'],
  ['heating', 'Shelly Pro 3EM'],
];
const FIRMWARE = ['1.4.4', '1.4.4', '1.4.2', '1.3.3'];
/** Fixed reference time, so relative times stay comparable between examples. */
export const NOW = Date.parse('2026-10-20T08:00:00Z');

/** @typedef {{ id: string, name: string, model: string, kind: string, site: string, ip: string, mac: string, status: 'online' | 'offline' | 'update', firmware: string, rssi: number | null, lastSeen: string }} Device */

/** 60 devices across three sites. `id` is the MAC without separators (stable row key). */
export const devices = (() => {
  const rnd = random(42);
  /** @type {Device[]} */
  const list = [];
  for (let i = 0; i < 60; i++) {
    const [kind, model] = KINDS[Math.floor(rnd() * KINDS.length)];
    const room = ROOMS[i % ROOMS.length];
    const mac = Array.from({ length: 6 }, (_, j) => (j < 3 ? [0xa8, 0x03, 0x2a][j] : Math.floor(rnd() * 256)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();
    const r = rnd();
    const status = r < 0.12 ? 'offline' : r < 0.25 ? 'update' : 'online';
    list.push({
      id: mac,
      name: `${room} ${kind}${i >= ROOMS.length ? ` ${Math.floor(i / ROOMS.length) + 1}` : ''}`,
      model,
      kind,
      site: SITES[i % SITES.length],
      ip: `192.168.${1 + (i % 3)}.${20 + i}`,
      mac,
      status,
      firmware: status === 'update' ? FIRMWARE[2 + (i % 2)] : FIRMWARE[i % 2],
      rssi: status === 'offline' ? null : -45 - Math.floor(rnd() * 45),
      lastSeen: new Date(NOW - Math.floor(rnd() * (status === 'offline' ? 6 * 24 * 60 : 30)) * 60_000).toISOString(),
    });
  }
  return list;
})();

export const sites = SITES;
export const statuses = ['online', 'offline', 'update'];

const aborted = () => new DOMException('Aborted', 'AbortError');
const wait = (ms, signal) =>
  new Promise((resolve, reject) => {
    // Also when the signal was aborted before the call (e.g. inside an onUpdate callback).
    if (signal?.aborted) return reject(aborted());
    const t = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(t);
      reject(aborted());
    }, { once: true });
  });

/** Numbers numerically, text with the collator; empty values last. */
const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
function compare(a, b) {
  const ea = a === null || a === undefined || a === '';
  const eb = b === null || b === undefined || b === '';
  if (ea || eb) return ea === eb ? 0 : ea ? 1 : -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return collator.compare(String(a), String(b));
}

/**
 * A pretend backend over `devices` (or your own rows).
 * - `query({ search, filters, sort, page, pageSize, signal })` → `{ rows, total }` after `delay` ms (± `jitter`, so
 *   answers can arrive out of order – the stale-response case).
 * - `failNext(n = 1)` makes the next n calls reject; `failRate` (0–1) fails at random; `offline = true` fails all.
 * @param {{ rows?: object[], delay?: number, jitter?: number, failRate?: number, seed?: number }} [options]
 */
export function fakeServer({ rows = devices, delay = 400, jitter = 0, failRate = 0, seed = 7 } = {}) {
  const rnd = random(seed);
  let failures = 0;
  const server = {
    offline: false,
    calls: 0,
    failNext(n = 1) {
      failures += n;
    },
    /** @param {{ search?: string, filters?: Record<string, string | string[]>, sort?: { key: string, direction: 'asc' | 'desc' }, page?: number, pageSize?: number, signal?: AbortSignal }} [q] */
    async query({ search = '', filters = {}, sort, page = 1, pageSize = 10, signal } = {}) {
      server.calls++;
      await wait(delay + Math.round((rnd() * 2 - 1) * jitter), signal);
      if (server.offline) throw new Error('Server not reachable');
      if (failures > 0 || rnd() < failRate) {
        failures = Math.max(0, failures - 1);
        throw new Error('Request failed (500)');
      }
      const s = search.trim().toLowerCase();
      let result = rows.filter((r) => {
        if (s && !Object.values(r).some((v) => String(v ?? '').toLowerCase().includes(s))) return false;
        return Object.entries(filters).every(([k, v]) => {
          const want = Array.isArray(v) ? v : v ? [v] : [];
          return !want.length || want.includes(String(r[k]));
        });
      });
      if (sort?.key) {
        const sign = sort.direction === 'desc' ? -1 : 1;
        result = [...result].sort((a, b) => {
          const c = compare(a[sort.key], b[sort.key]);
          // Empty values stay last in both directions, as in kern-table.
          return a[sort.key] == null || b[sort.key] == null ? c : sign * c;
        });
      }
      const start = (page - 1) * pageSize;
      return { rows: result.slice(start, start + pageSize), total: result.length };
    },
  };
  return server;
}

/**
 * Runs a pretend job over targets (a scan, an update, a bulk action): each target goes
 * `pending → running (progress 0–100) → done | failed | skipped`, a few at a time.
 * `onUpdate(states)` gets a fresh array after every step; the promise resolves with the final states.
 * Abort with `signal`: running and pending targets end as `cancelled`.
 * @param {string[]} keys
 * @param {{ onUpdate?: (states: { key: string, status: string, progress: number, error?: string, startedAt?: number, endedAt?: number }[]) => void, parallel?: number, stepMs?: number, fail?: (key: string, i: number) => boolean, skip?: (key: string, i: number) => boolean, signal?: AbortSignal }} [options]
 */
export async function simulateTargets(keys, { onUpdate = () => {}, parallel = 3, stepMs = 250, fail = (_, i) => i % 7 === 3, skip = () => false, signal } = {}) {
  const states = keys.map((key) => ({ key, status: 'pending', progress: 0 }));
  const emit = () => onUpdate(states.map((s) => ({ ...s })));
  emit();
  let next = 0;
  const worker = async () => {
    while (next < states.length) {
      const i = next++;
      const st = states[i];
      if (signal?.aborted) break;
      if (skip(st.key, i)) {
        Object.assign(st, { status: 'skipped', endedAt: Date.now() });
        emit();
        continue;
      }
      Object.assign(st, { status: 'running', startedAt: Date.now() });
      emit();
      try {
        for (let p = 25; p <= 100; p += 25) {
          await wait(stepMs, signal);
          st.progress = p;
          if (fail(st.key, i) && p >= 50) throw new Error('Device did not respond (timeout)');
          emit();
        }
        Object.assign(st, { status: 'done', endedAt: Date.now() });
      } catch (e) {
        Object.assign(st, e?.name === 'AbortError' ? { status: 'cancelled' } : { status: 'failed', error: String(e?.message ?? e) }, { endedAt: Date.now() });
      }
      emit();
    }
  };
  await Promise.all(Array.from({ length: Math.min(parallel, keys.length) }, worker));
  for (const st of states) if (st.status === 'pending' || st.status === 'running') Object.assign(st, { status: 'cancelled', endedAt: Date.now() });
  emit();
  return states;
}
