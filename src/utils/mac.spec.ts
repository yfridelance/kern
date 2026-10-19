import { formatMac, parseMac } from './mac';

describe('parseMac', () => {
  it('reads all common notations', () => {
    for (const t of ['C82B961A3F00', 'c8:2b:96:1a:3f:00', 'C8-2B-96-1A-3F-00', 'c82b.961a.3f00', ' c8 2b 96 1a 3f 00 ']) expect(parseMac(t)).toBe('c82b961a3f00');
  });
  it('rejects wrong lengths, letters and mixed separators', () => {
    expect(['', 'c82b961a3f0', 'c82b961a3f000', 'g82b961a3f00', 'c8:2b-96:1a:3f:00', 'c8:2b961a3f00', 'c82b:961a:3f00'].map(parseMac)).toEqual([null, null, null, null, null, null, null]);
  });
});

describe('formatMac', () => {
  it('writes the requested format and case', () => {
    expect(formatMac('c82b961a3f00')).toBe('C8:2B:96:1A:3F:00');
    expect(formatMac('c82b961a3f00', 'dash', false)).toBe('c8-2b-96-1a-3f-00');
    expect(formatMac('c82b961a3f00', 'dot', false)).toBe('c82b.961a.3f00');
    expect(formatMac('c82b961a3f00', 'plain')).toBe('C82B961A3F00');
  });
});
