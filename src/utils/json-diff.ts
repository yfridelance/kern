export type KernJsonDiffKind = 'added' | 'removed' | 'changed';

export interface KernJsonDiffEntry {
  /** `sys.device.name`, `relays[0].ison`, `["odd key"]`; `''` for the root value itself. */
  path: string;
  kind: KernJsonDiffKind;
  /** Value before (missing for `added`). */
  before?: unknown;
  /** Value after (missing for `removed`). */
  after?: unknown;
}

export interface KernJsonDiffOptions {
  /** Paths that do not count, e.g. `time`, `sys.uptime`. A path also ignores everything below it. */
  ignore?: string[];
}

type Container = Record<string, unknown> | unknown[];

function shape(v: unknown): 'array' | 'object' | 'leaf' {
  if (Array.isArray(v)) return 'array';
  return v !== null && typeof v === 'object' ? 'object' : 'leaf';
}

function child(path: string, key: string | number): string {
  if (typeof key === 'number') return `${path}[${key}]`;
  if (/^[A-Za-z_$][\w$]*$/.test(key)) return path ? `${path}.${key}` : key;
  return `${path}[${JSON.stringify(key)}]`;
}

function has(v: Container, key: string | number): boolean {
  return Object.prototype.hasOwnProperty.call(v, key) && (v as any)[key] !== undefined;
}

/**
 * Structural diff of two JSON values down to the leaves: objects are compared by key, arrays by index. A change of
 * type (object → number, array → object) is one `changed` entry for the whole node; an added or removed subtree is
 * one entry too. The list is ordered by path (keys alphabetically, indexes numerically).
 */
export function diffJson(before: unknown, after: unknown, options: KernJsonDiffOptions = {}): KernJsonDiffEntry[] {
  const ignore = (options.ignore ?? []).map((p) => p.trim()).filter(Boolean);
  const ignored = (p: string) => ignore.some((i) => p === i || p.startsWith(`${i}.`) || p.startsWith(`${i}[`));
  const out: KernJsonDiffEntry[] = [];

  const walk = (path: string, a: unknown, b: unknown) => {
    if (ignored(path)) return;
    const sa = shape(a);
    if (sa === 'leaf' || sa !== shape(b)) {
      if (!Object.is(a, b)) out.push({ path, kind: 'changed', before: a, after: b });
      return;
    }
    const ca = a as Container;
    const cb = b as Container;
    const keys: (string | number)[] =
      sa === 'array'
        ? Array.from({ length: Math.max((ca as unknown[]).length, (cb as unknown[]).length) }, (_, i) => i)
        : [...new Set([...Object.keys(ca), ...Object.keys(cb)])].sort((x, y) => (x < y ? -1 : x > y ? 1 : 0));
    for (const k of keys) {
      const p = child(path, k);
      const inA = has(ca, k);
      const inB = has(cb, k);
      if (inA && inB) walk(p, (ca as any)[k], (cb as any)[k]);
      else if (ignored(p)) continue;
      else if (inA) out.push({ path: p, kind: 'removed', before: (ca as any)[k] });
      else if (inB) out.push({ path: p, kind: 'added', after: (cb as any)[k] });
    }
  };

  walk('', before, after);
  return out;
}
