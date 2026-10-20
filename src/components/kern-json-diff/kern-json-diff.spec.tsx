import { newSpecPage } from '@stencil/core/testing';
import { KernJsonDiff } from './kern-json-diff';

describe('kern-json-diff', () => {
  it('renders one row per difference with summary and badges', async () => {
    const page = await newSpecPage({ components: [KernJsonDiff], html: '<kern-json-diff></kern-json-diff>' });
    page.root!.from = { sys: { name: 'Fan', debug: true }, time: '08:00' };
    page.root!.to = { sys: { name: 'Bath fan' }, mqtt: { enable: true }, time: '09:00' };
    page.root!.ignore = 'time';
    await page.waitForChanges();
    const sr = page.root!.shadowRoot!;
    expect(sr.querySelector('.summary')!.textContent).toBe('3 Unterschiede: 1 geändert, 1 neu, 1 entfernt');
    const rows = [...sr.querySelectorAll('tbody tr')];
    expect(rows.map((r) => r.querySelector('.path')!.textContent)).toEqual(['mqtt', 'sys.debug', 'sys.name']);
    expect([...rows[2].querySelectorAll('.value')].map((td) => td.textContent)).toEqual(['"Fan"', '"Bath fan"']);
    expect(rows[1].querySelectorAll('.none').length).toBe(1);
    expect(rows.map((r) => r.querySelector('kern-badge')!.getAttribute('tone'))).toEqual(['ok', 'danger', 'warn']);
    expect(rows[0].querySelector('kern-badge')!.textContent).toBe('neu');
  });

  it('parses JSON strings and shows the empty label', async () => {
    const page = await newSpecPage({
      components: [KernJsonDiff],
      html: `<kern-json-diff from='{"a":1,"t":1}' to='{"a":1,"t":2}' ignore="t" label-none="No differences"></kern-json-diff>`,
    });
    const sr = page.root!.shadowRoot!;
    expect(sr.querySelector('.summary')!.textContent).toBe('No differences');
    expect(sr.querySelector('table')).toBeNull();
  });

  it('cuts long values and keeps the whole value in the tooltip', async () => {
    const page = await newSpecPage({ components: [KernJsonDiff], html: '<kern-json-diff max-value-length="10"></kern-json-diff>' });
    page.root!.from = { note: 'short' };
    page.root!.to = { note: 'a much longer value' };
    await page.waitForChanges();
    const [before, after] = [...page.root!.shadowRoot!.querySelectorAll('td.value')];
    expect(before.textContent).toBe('"short"');
    expect(before.hasAttribute('title')).toBe(false);
    expect(after.textContent).toBe('"a much l…');
    expect(after.getAttribute('title')).toBe('"a much longer value"');
  });

  it('accepts ignore as an array', async () => {
    const page = await newSpecPage({ components: [KernJsonDiff], html: '<kern-json-diff></kern-json-diff>' });
    page.root!.from = { a: 1, b: { c: 1 } };
    page.root!.to = { a: 2, b: { c: 2 } };
    page.root!.ignore = ['b'];
    await page.waitForChanges();
    expect(page.root!.shadowRoot!.querySelector('.summary')!.textContent).toBe('1 Unterschiede: 1 geändert, 0 neu, 0 entfernt');
  });
});
