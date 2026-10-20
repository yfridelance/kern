import { diffJson } from './json-diff';

describe('diffJson', () => {
  it('compares objects by key down to the leaves', () => {
    const a = { sys: { device: { name: 'Fan', mac: 'C82B961A3F00' }, debug: true }, mqtt: { enable: false } };
    const b = { sys: { device: { name: 'Bath fan', mac: 'C82B961A3F00' }, eco: true }, mqtt: { enable: false } };
    expect(diffJson(a, b)).toEqual([
      { path: 'sys.debug', kind: 'removed', before: true },
      { path: 'sys.device.name', kind: 'changed', before: 'Fan', after: 'Bath fan' },
      { path: 'sys.eco', kind: 'added', after: true },
    ]);
  });

  it('returns an empty list for equal values', () => {
    expect(diffJson({ a: [1, { b: null }] }, { a: [1, { b: null }] })).toEqual([]);
  });

  it('compares arrays by index and orders indexes numerically', () => {
    const a = { relays: Array.from({ length: 11 }, (_, i) => ({ ison: false, id: i })) };
    const b = { relays: a.relays.map((r) => ({ ...r, ison: r.id === 2 || r.id === 10 })).concat({ ison: true, id: 11 }) };
    expect(diffJson(a, b).map((d) => d.path)).toEqual(['relays[2].ison', 'relays[10].ison', 'relays[11]']);
    expect(diffJson([1, 2, 3], [1, 2])).toEqual([{ path: '[2]', kind: 'removed', before: 3 }]);
  });

  it('treats a change of type as a change of the whole node', () => {
    expect(diffJson({ wifi: { ip: '1.2.3.4' } }, { wifi: 5 })).toEqual([{ path: 'wifi', kind: 'changed', before: { ip: '1.2.3.4' }, after: 5 }]);
    expect(diffJson({ a: [1] }, { a: { 0: 1 } })).toEqual([{ path: 'a', kind: 'changed', before: [1], after: { 0: 1 } }]);
    expect(diffJson({ a: null }, { a: {} })).toEqual([{ path: 'a', kind: 'changed', before: null, after: {} }]);
    expect(diffJson(1, 2)).toEqual([{ path: '', kind: 'changed', before: 1, after: 2 }]);
  });

  it('ignores exact paths and everything below them', () => {
    const a = { time: '08:00', unixtime: 1, sys: { uptime: 10, name: 'x', updates: { stable: '1.0' } }, sysx: 1 };
    const b = { time: '09:00', unixtime: 2, sys: { uptime: 20, name: 'y', updates: { stable: '1.1', beta: '1.2' } }, sysx: 2, relays: [{ a: 1 }] };
    expect(diffJson(a, b, { ignore: ['time', 'unixtime', 'sys.uptime', 'sys.updates', 'relays'] }).map((d) => d.path)).toEqual(['sys.name', 'sysx']);
    expect(diffJson({ r: [1, 2] }, { r: [3, 4] }, { ignore: ['r[0]'] }).map((d) => d.path)).toEqual(['r[1]']);
  });

  it('escapes keys that are not identifiers', () => {
    const d = diffJson({ 'odd key': 1, n: { 'a.b': 1, 'x"y': 1 } }, { 'odd key': 2, n: { 'a.b': 2, 'x"y': 2 } });
    expect(d.map((e) => e.path)).toEqual(['n["a.b"]', 'n["x\\"y"]', '["odd key"]']);
    expect(diffJson({}, { $id: 1, _a: 1, '1x': 1 }).map((e) => e.path)).toEqual(['$id', '["1x"]', '_a']);
  });

  it('treats undefined like a missing key', () => {
    expect(diffJson({ a: undefined }, {})).toEqual([]);
    expect(diffJson({ a: undefined }, { a: 1 })).toEqual([{ path: 'a', kind: 'added', after: 1 }]);
  });
});
