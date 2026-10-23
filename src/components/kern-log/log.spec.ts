import { entryText, levelOf, logFilter, splitMatches, type KernLogEntry } from './log';

const e = (over: Partial<KernLogEntry>): KernLogEntry => ({ id: 1, time: '2026-10-20T08:00:00Z', level: 'info', message: 'Relay on', ...over });

describe('kern-log helpers', () => {
  it('treats unknown levels as info', () => {
    expect(levelOf(e({ level: 'WARN' }))).toBe('warn');
    expect(levelOf(e({ level: 'notice' }))).toBe('info');
  });

  it('combines search, levels and sources', () => {
    const keep = logFilter({ query: 'RELAY', levels: ['warn', 'info'], sources: ['mqtt'] });
    expect(keep(e({ source: 'mqtt' }))).toBe(true);
    expect(keep(e({ source: 'scanner' }))).toBe(false);
    expect(keep(e({ source: 'mqtt', level: 'debug' }))).toBe(false);
    expect(keep(e({ source: 'mqtt', message: 'Ping' }))).toBe(false);
    expect(logFilter({ query: 'timeout', levels: [], sources: [] })(e({ message: 'Failed', details: { error: 'timeout' } }))).toBe(true);
    expect(logFilter({ query: '', levels: [], sources: [] })(e({}))).toBe(true);
  });

  it('formats an entry as a line with indented details', () => {
    expect(entryText(e({ source: 'mqtt', level: 'warn' }))).toBe('2026-10-20T08:00:00.000Z WARN [mqtt] Relay on');
    expect(entryText(e({ details: 'line 1\nline 2' }))).toBe('2026-10-20T08:00:00.000Z INFO Relay on\n  line 1\n  line 2');
    expect(entryText(e({ time: 'gestern' }))).toBe('gestern INFO Relay on');
  });

  it('splits around matches, ignoring case', () => {
    expect(splitMatches('Relay on, relay off', 'relay')).toEqual(['', 'Relay', ' on, ', 'relay', ' off']);
    expect(splitMatches('Relay', '')).toEqual(['Relay']);
    expect(splitMatches('Relay', 'x')).toEqual(['Relay']);
  });
});
