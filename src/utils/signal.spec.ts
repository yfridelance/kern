import { meterLevel, parseNumbers, rssiLevel, sparklinePoints } from './signal';

describe('rssiLevel', () => {
  it('maps dBm to bars', () => {
    expect([-40, -55, -56, -67, -70, -75, -80, -85, -86, -100].map(rssiLevel)).toEqual([4, 4, 3, 3, 2, 2, 1, 1, 0, 0]);
  });
  it('treats NaN as no signal', () => {
    expect(rssiLevel(NaN)).toBe(0);
  });
});

describe('meterLevel', () => {
  it('uses default thresholds 75/90', () => {
    expect([10, 74.9, 75, 89, 90, 100].map((p) => meterLevel(p))).toEqual(['ok', 'ok', 'warn', 'warn', 'danger', 'danger']);
  });
  it('accepts custom thresholds', () => {
    expect(meterLevel(50, 40, 60)).toBe('warn');
  });
});

describe('parseNumbers', () => {
  it('reads arrays, JSON and comma lists', () => {
    expect(parseNumbers([1, 2])).toEqual([1, 2]);
    expect(parseNumbers('[3,4]')).toEqual([3, 4]);
    expect(parseNumbers(' 5, 6 ,x')).toEqual([5, 6]);
    expect(parseNumbers(undefined)).toEqual([]);
  });
});

describe('sparklinePoints', () => {
  it('spreads points over the width and keeps 2px padding', () => {
    expect(sparklinePoints([0, 10], 100, 32)).toBe('0,30 100,2');
  });
  it('centres a flat series', () => {
    expect(sparklinePoints([5, 5, 5], 100, 32)).toBe('0,16 50,16 100,16');
  });
  it('is empty without values', () => {
    expect(sparklinePoints([], 100, 32)).toBe('');
  });
});
