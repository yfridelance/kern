import {
  addDays,
  addMonths,
  clampIso,
  datePlaceholder,
  dayPeriods,
  daysBetween,
  durationToIso,
  firstDayOfWeek,
  formatDate,
  formatDuration,
  formatInputDate,
  formatRelative,
  formatTime,
  isoTime,
  isoWeek,
  monthGrid,
  onTick,
  parseDateTime,
  parseDuration,
  parseInputDate,
  parseTime,
  rangeUntil,
  relativeParts,
  relativeRefresh,
  timeSteps,
  toIso,
  uses12h,
} from './datetime';

const NOW = new Date('2026-10-19T08:15:00Z').getTime();

describe('parseDateTime', () => {
  it('reads calendar dates as local days', () => {
    const v = parseDateTime('2026-10-19')!;
    expect(v.dateOnly).toBe(true);
    expect([v.date.getFullYear(), v.date.getMonth(), v.date.getDate()]).toEqual([2026, 9, 19]);
    expect(toIso(v)).toBe('2026-10-19');
  });
  it('reads ISO points in time, epoch ms and Dates', () => {
    expect(toIso(parseDateTime('2026-10-19T08:15:00Z')!)).toBe('2026-10-19T08:15:00.000Z');
    expect(parseDateTime(NOW)!.date.getTime()).toBe(NOW);
    expect(parseDateTime(String(NOW))!.date.getTime()).toBe(NOW);
    expect(parseDateTime(new Date(NOW))!.dateOnly).toBe(false);
  });
  it('rejects empty and invalid values', () => {
    expect([undefined, null, '', 'gestern', '2026-02-31', new Date('x')].map(parseDateTime)).toEqual([null, null, null, null, null, null]);
  });
});

describe('formatDate', () => {
  it('formats by locale, style and time zone', () => {
    const v = parseDateTime('2026-10-19T08:15:00Z')!;
    expect(formatDate(v, { locale: 'de-CH', timeZone: 'Europe/Zurich' })).toBe('19.10.2026');
    expect(formatDate(v, { locale: 'de-CH', timeZone: 'Europe/Zurich', time: true })).toBe('19.10.2026, 10:15');
    expect(formatDate(v, { locale: 'en-US', timeZone: 'UTC', format: 'long' })).toBe('October 19, 2026');
  });
  it('keeps calendar dates on their day and without time', () => {
    const v = parseDateTime('2026-10-19')!;
    expect(formatDate(v, { locale: 'de-CH', timeZone: 'Pacific/Kiritimati', time: true })).toBe('19.10.2026');
  });
});

describe('relative', () => {
  const at = (offsetS: number) => parseDateTime(NOW + offsetS * 1000)!;
  it('picks the largest sensible unit', () => {
    expect(relativeParts(at(-20), NOW)).toEqual([-20, 'second']);
    expect(relativeParts(at(-180), NOW)).toEqual([-3, 'minute']);
    expect(relativeParts(at(2 * 3600), NOW)).toEqual([2, 'hour']);
    expect(relativeParts(at(-3 * 86400), NOW)).toEqual([-3, 'day']);
    expect(relativeParts(at(-400 * 86400), NOW)).toEqual([-1, 'year']);
  });
  it('counts calendar days for dates', () => {
    const today = new Date(NOW);
    const iso = (d: number) => toIso({ date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + d), dateOnly: true });
    expect(formatRelative(parseDateTime(iso(-1))!, NOW, 'de-CH')).toBe('gestern');
    expect(formatRelative(parseDateTime(iso(0))!, NOW, 'de-CH')).toBe('heute');
  });
  it('formats short texts', () => {
    expect(formatRelative(at(-180), NOW, 'de-CH')).toBe('vor 3 Min.');
    expect(formatRelative(at(0), NOW, 'en-US')).toBe('now');
  });
  it('refreshes more often for recent values', () => {
    expect([at(-10), at(-600), at(-7200), at(-200000)].map((v) => relativeRefresh(v, NOW))).toEqual([1000, 10000, 60000, 3600000]);
  });
});

describe('time', () => {
  it('parses HH:mm[:ss]', () => {
    expect(parseTime('06:30')).toBe(23400);
    expect(parseTime('23:59:59')).toBe(86399);
    expect([parseTime('24:00'), parseTime('6:30'), parseTime('')]).toEqual([null, null, null]);
  });
  it('formats times of day and points in time', () => {
    expect(formatTime('06:30', { locale: 'de-CH' })).toBe('06:30');
    expect(formatTime('06:30:05', { locale: 'de-CH', seconds: true })).toBe('06:30:05');
    expect(formatTime('18:30', { locale: 'en-US', hour12: true })).toBe('06:30 PM');
    expect(formatTime('2026-10-19T08:15:00Z', { locale: 'de-CH', timeZone: 'Europe/Zurich' })).toBe('10:15');
    expect(formatTime('2026-10-19', { locale: 'de-CH' })).toBeNull();
    expect(formatTime('kaputt', { locale: 'de-CH' })).toBeNull();
  });
});

describe('duration', () => {
  it('parses ISO 8601 and seconds', () => {
    expect(parseDuration('PT1H23M')).toEqual({ hours: 1, minutes: 23 });
    expect(parseDuration('P1DT0.5S')).toEqual({ days: 1, seconds: 0.5 });
    expect(parseDuration(5025)).toEqual({ days: 0, hours: 1, minutes: 23, seconds: 45 });
    expect(parseDuration('90061')).toEqual({ days: 1, hours: 1, minutes: 1, seconds: 1 });
    expect(['P', 'PT', 'PT1H2', '1h', '', -5].map((v) => parseDuration(v))).toEqual([null, null, null, null, null, null]);
  });
  it('writes ISO 8601', () => {
    expect(durationToIso({ days: 0, hours: 1, minutes: 23, seconds: 45 })).toBe('PT1H23M45S');
    expect(durationToIso({ days: 2 })).toBe('P2D');
    expect(durationToIso({ seconds: 0 })).toBe('PT0S');
  });
  it('formats non-zero parts', () => {
    expect(formatDuration({ days: 0, hours: 1, minutes: 23, seconds: 0 }, 'de-CH')).toBe('1 Std., 23 Min.');
    expect(formatDuration({ hours: 1, minutes: 23 }, 'en-US')).toBe('1 hr, 23 min');
    expect(formatDuration({ days: 0, seconds: 0 }, 'de-CH')).toBe('0 Sek.');
  });
});

describe('onTick', () => {
  it('shares one timer and stops it with the last subscriber', () => {
    jest.useFakeTimers();
    const a = jest.fn();
    const b = jest.fn();
    const offA = onTick(a);
    const offB = onTick(b);
    jest.advanceTimersByTime(2000);
    expect([a.mock.calls.length, b.mock.calls.length]).toEqual([2, 2]);
    offA();
    offB();
    expect(jest.getTimerCount()).toBe(0);
    jest.useRealTimers();
  });
});

describe('calendar', () => {
  it('adds days and months, clamping to the month end', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(addMonths('2026-01-31', 1)).toBe('2026-02-28');
    expect(addMonths('2028-01-31', 1)).toBe('2028-02-29');
    expect(addMonths('2026-10-19', -12)).toBe('2025-10-19');
  });
  it('clamps to bounds', () => {
    expect([clampIso('2026-01-01', '2026-02-01'), clampIso('2026-12-01', undefined, '2026-11-30'), clampIso('2026-06-01', '2026-01-01', '2026-12-31')]).toEqual([
      '2026-02-01',
      '2026-11-30',
      '2026-06-01',
    ]);
  });
  it('builds 6 weeks starting on the first day of the week', () => {
    const mon = monthGrid(2026, 9, 1); // October 2026 starts on a Thursday
    expect([mon[0], mon[3], mon[41], mon.length]).toEqual(['2026-09-28', '2026-10-01', '2026-11-08', 42]);
    expect(monthGrid(2026, 9, 0)[0]).toBe('2026-09-27');
    expect(monthGrid(2026, 1, 0)[0]).toBe('2026-02-01'); // February 2026 starts on a Sunday
  });
  it('reads the first day of the week from the locale', () => {
    expect([firstDayOfWeek('de-CH'), firstDayOfWeek('en-US')]).toEqual([1, 0]);
  });
  it('counts ISO weeks', () => {
    expect([isoWeek('2026-01-01'), isoWeek('2026-10-19'), isoWeek('2026-12-31'), isoWeek('2027-01-03'), isoWeek('2027-01-04')]).toEqual([1, 43, 53, 53, 1]);
  });
});

describe('picker input', () => {
  it('formats and parses dates in the locale order', () => {
    expect(formatInputDate('2026-10-05', 'de-CH')).toBe('05.10.2026');
    expect(formatInputDate('2026-10-05', 'en-US')).toBe('10/05/2026');
    expect(parseInputDate('5.10.2026', 'de-CH')).toBe('2026-10-05');
    expect(parseInputDate('05/10/26', 'en-US')).toBe('2026-05-10');
    expect(parseInputDate('2026-10-05', 'en-US')).toBe('2026-10-05');
    expect(parseInputDate('5.10.', 'de-CH', NOW)).toBe('2026-10-05');
    expect(['31.02.2026', '1.13.2026', 'heute', '', '1'].map((t) => parseInputDate(t, 'de-CH'))).toEqual([null, null, null, null, null]);
  });
  it('builds localised placeholders', () => {
    expect([datePlaceholder('de-CH'), datePlaceholder('en-US'), datePlaceholder('fr-CH')]).toEqual(['TT.MM.JJJJ', 'MM/DD/YYYY', 'JJ.MM.AAAA']);
  });
  it('knows 12-hour locales and day periods', () => {
    expect([uses12h('de-CH'), uses12h('en-US')]).toEqual([false, true]);
    expect(dayPeriods('en-US')).toEqual(['AM', 'PM']);
  });
  it('writes ISO times and step lists', () => {
    expect([isoTime(23400), isoTime(23405, true)]).toEqual(['06:30', '06:30:05']);
    expect(timeSteps(1800, parseTime('08:00')!, parseTime('09:15')!).map((t) => isoTime(t))).toEqual(['08:00', '08:30', '09:00']);
  });
});

describe('ranges', () => {
  it('counts days between dates', () => {
    expect([daysBetween('2026-10-01', '2026-10-15'), daysBetween('2026-10-15', '2026-10-01'), daysBetween('2026-03-28', '2026-03-30')]).toEqual([14, -14, 2]);
  });
  it('builds ranges ending today from durations', () => {
    expect(rangeUntil('P7D', '2026-10-19')).toEqual({ start: '2026-10-13', end: '2026-10-19' });
    expect(rangeUntil('P1D', '2026-10-19')).toEqual({ start: '2026-10-19', end: '2026-10-19' });
    expect(rangeUntil('P1M', '2026-10-19')).toEqual({ start: '2026-09-20', end: '2026-10-19' });
    expect(rangeUntil('P1W', '2026-10-19')).toEqual({ start: '2026-10-13', end: '2026-10-19' });
    expect([rangeUntil('PT1H', '2026-10-19'), rangeUntil('86400', '2026-10-19'), rangeUntil('x', '2026-10-19')]).toEqual([null, null, null]);
  });
});
