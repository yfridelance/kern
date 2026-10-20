/** IPv4 in three forms: a single address, a range (first–last) or a CIDR block. */
export type KernIpKind = 'single' | 'range' | 'cidr';

export interface KernIpv4 {
  kind: KernIpKind;
  /** Normalised text: `192.168.1.10`, `192.168.1.10-192.168.1.50` or `192.168.1.0/24`. */
  value: string;
  /** First address. */
  first: string;
  /** Last address (inclusive). */
  last: string;
  /** Number of addresses. */
  count: number;
}

const OCTET = /^(0|[1-9]\d{0,2})$/;

/** `192.168.1.10` → 3232235786, or null. Rejects octets over 255 and leading zeros (`010` is ambiguous). */
export function ipv4ToInt(text: string): number | null {
  const parts = text.trim().split('.');
  if (parts.length !== 4 || !parts.every((p) => OCTET.test(p) && +p <= 255)) return null;
  return parts.reduce((n, p) => n * 256 + +p, 0);
}

/** 3232235786 → `192.168.1.10`. */
export function intToIpv4(n: number): string {
  return [24, 16, 8, 0].map((s) => Math.floor(n / 2 ** s) % 256).join('.');
}

/**
 * Parses an IPv4 address, range or CIDR block; null when invalid.
 * Ranges accept `-`/`–` with optional spaces and a short end (`192.168.1.10-50`, missing octets from the start);
 * a reversed range is swapped. A CIDR host address is normalised to its network (`192.168.1.5/24` → `192.168.1.0/24`).
 */
export function parseIpv4(text: string): KernIpv4 | null {
  const s = text.trim();
  if (!s) return null;

  const cidr = /^([\d.]+)\s*\/\s*(\d{1,2})$/.exec(s);
  if (cidr) {
    const ip = ipv4ToInt(cidr[1]);
    const bits = +cidr[2];
    if (ip === null || bits > 32) return null;
    const size = 2 ** (32 - bits);
    const first = Math.floor(ip / size) * size;
    return { kind: 'cidr', value: `${intToIpv4(first)}/${bits}`, first: intToIpv4(first), last: intToIpv4(first + size - 1), count: size };
  }

  const range = /^([\d.]+)\s*[-–—]\s*([\d.]+)$/.exec(s);
  if (range) {
    const start = ipv4ToInt(range[1]);
    const endParts = range[2].split('.');
    if (start === null || endParts.length > 4) return null;
    // Short end: take the missing leading octets from the start.
    const end = ipv4ToInt([...range[1].trim().split('.').slice(0, 4 - endParts.length), ...endParts].join('.'));
    if (end === null) return null;
    const [lo, hi] = start <= end ? [start, end] : [end, start];
    if (lo === hi) return single(lo);
    const first = intToIpv4(lo);
    const last = intToIpv4(hi);
    return { kind: 'range', value: `${first}-${last}`, first, last, count: hi - lo + 1 };
  }

  const ip = ipv4ToInt(s);
  return ip === null ? null : single(ip);
}

function single(n: number): KernIpv4 {
  const ip = intToIpv4(n);
  return { kind: 'single', value: ip, first: ip, last: ip, count: 1 };
}

export interface KernMask {
  /** Dotted mask: `255.255.255.0`. */
  mask: string;
  /** Prefix length 0–32. */
  prefix: number;
  /** Usable hosts: 2^(32−prefix)−2; /31 has 2 (point-to-point), /32 has 1. */
  hosts: number;
}

/**
 * Parses a subnet mask; null when invalid. Accepts a contiguous dotted mask (`255.255.252.0`) or a prefix
 * (`/22` or `22`, 0–32). Non-contiguous masks (`255.0.255.0`) and plain addresses (`192.168.1.1`) are rejected.
 */
export function parseMask(text: string): KernMask | null {
  const s = text.trim();
  const p = /^\/?\s*(\d{1,2})$/.exec(s);
  let prefix: number;
  if (p) {
    prefix = +p[1];
    if (prefix > 32) return null;
  } else {
    const n = ipv4ToInt(s);
    if (n === null) return null;
    const inverted = 2 ** 32 - 1 - n; // host bits: must be 0…01…1
    if (inverted & (inverted + 1)) return null;
    prefix = 32 - Math.log2(inverted + 1);
  }
  const hosts = prefix === 32 ? 1 : prefix === 31 ? 2 : 2 ** (32 - prefix) - 2;
  return { mask: intToIpv4(2 ** 32 - 2 ** (32 - prefix)), prefix, hosts };
}
