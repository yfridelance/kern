import { hexToRgb, hsvToRgb, kelvinToRgb, parseHex, rgbToHex, rgbToHsv } from './color';

describe('color', () => {
  it('parses hex in short and long form', () => {
    expect([parseHex('#ABC'), parseHex('3cc8cc'), parseHex(' #3CC8CC '), parseHex('#12345'), parseHex('red')]).toEqual(['#aabbcc', '#3cc8cc', '#3cc8cc', null, null]);
  });
  it('converts between hex, rgb and hsv', () => {
    expect(hexToRgb('#3cc8cc')).toEqual([60, 200, 204]);
    expect(rgbToHex([60, 200, 204])).toBe('#3cc8cc');
    const hsv = rgbToHsv([255, 0, 0]);
    expect(hsv).toEqual({ h: 0, s: 1, v: 1 });
    expect(rgbToHex(hsvToRgb({ h: 120, s: 1, v: 1 }))).toBe('#00ff00');
    expect(rgbToHex(hsvToRgb(rgbToHsv(hexToRgb('#3cc8cc'))))).toBe('#3cc8cc');
    expect(rgbToHsv([0, 0, 0])).toEqual({ h: 0, s: 0, v: 0 });
  });
  it('approximates white light by kelvin', () => {
    const warm = kelvinToRgb(2700);
    const cold = kelvinToRgb(6500);
    expect(warm[0]).toBe(255);
    expect(warm[2]).toBeLessThan(200);
    expect(cold[2]).toBeGreaterThan(240);
  });
});
