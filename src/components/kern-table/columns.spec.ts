import { resolveColumnState } from './columns';

const columns = [
  { key: 'name', label: 'Name', hideable: false },
  { key: 'ip', label: 'IP' },
  { key: 'status', label: 'Status', pinned: 'end' as const },
  { key: 'firmware', label: 'Firmware', hidden: true },
];

describe('resolveColumnState', () => {
  it('derives the default state from the columns', () => {
    expect(resolveColumnState(columns)).toEqual([{ key: 'name' }, { key: 'ip' }, { key: 'firmware', hidden: true }, { key: 'status', pinned: 'end' }]);
  });

  it('keeps the order of the state, drops unknown and repeated keys and adds new columns at their place', () => {
    const state = [{ key: 'firmware' }, { key: 'gone', hidden: true }, { key: 'name' }, { key: 'firmware', hidden: true }] as any;
    expect(resolveColumnState(columns, state)).toEqual([{ key: 'firmware' }, { key: 'name' }, { key: 'ip' }, { key: 'status', pinned: 'end' }]);
  });

  it('groups pinned columns at the start and end', () => {
    const state = [{ key: 'ip', pinned: 'end' }, { key: 'name' }, { key: 'firmware', pinned: 'start' }, { key: 'status', pinned: 'sideways' }] as any;
    expect(resolveColumnState(columns, state)).toEqual([{ key: 'firmware', pinned: 'start' }, { key: 'name' }, { key: 'status' }, { key: 'ip', pinned: 'end' }]);
  });

  it('shows columns that cannot be hidden and keeps the minimum visible', () => {
    const all = columns.map((c) => ({ key: c.key, hidden: true }));
    expect(resolveColumnState(columns, all).filter((s) => !s.hidden).map((s) => s.key)).toEqual(['name']);
    expect(resolveColumnState(columns, all, 3).filter((s) => !s.hidden).map((s) => s.key)).toEqual(['name', 'ip', 'status']);
  });

  it('ignores a state that is no array or has broken entries', () => {
    expect(resolveColumnState(columns, 'x' as any)).toEqual(resolveColumnState(columns));
    expect(resolveColumnState(columns, [null, { key: 3 }, { key: 'ip', hidden: true }] as any)[1]).toEqual({ key: 'ip', hidden: true });
  });
});
