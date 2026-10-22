import { newSpecPage } from '@stencil/core/testing';
import { addDays, todayIso } from '../../utils/datetime';
import { setKernLocale } from '../../utils/i18n';
import { KernTimelineItem } from '../kern-timeline-item/kern-timeline-item';
import { KernTimeline } from './kern-timeline';

/** Noon of the local day `offset` days from today, as ISO point in time. */
const noon = (offset: number) => new Date(`${addDays(todayIso(), offset)}T12:00:00`).toISOString();

let hosts: HTMLElement[] = [];
const setup = async (html: string) => {
  const page = await newSpecPage({ components: [KernTimeline, KernTimelineItem], html });
  const host = page.root!;
  hosts.push(host);
  const items = () => Array.from(host.querySelectorAll('kern-timeline-item')) as unknown as KernTimelineItem[];
  return { page, host, root: host.shadowRoot!, items, timeline: host as unknown as KernTimeline };
};

describe('kern-timeline', () => {
  afterEach(() => {
    setKernLocale();
    hosts.forEach((h) => h.remove()); // stops the shared timer of day groups
    hosts = [];
  });

  it('is a named list of its items in DOM order', async () => {
    const { root, host } = await setup(`<kern-timeline label="History"><kern-timeline-item heading="B"></kern-timeline-item><kern-timeline-item heading="A"></kern-timeline-item></kern-timeline>`);
    const list = root.querySelector('[role="list"]')!;
    expect(list.getAttribute('aria-label')).toBe('History');
    expect(list.hasAttribute('hidden')).toBe(false);
    expect(Array.from(host.children).map((c) => c.getAttribute('heading'))).toEqual(['B', 'A']);
    expect(root.querySelector('.empty')!.hasAttribute('hidden')).toBe(true);
    expect(root.querySelector('.more')!.hasAttribute('hidden')).toBe(true);
  });

  it('puts a day heading above the first event of each day', async () => {
    const { items } = await setup(`<kern-timeline group-by="day">
      <kern-timeline-item heading="a" datetime="${noon(0)}"></kern-timeline-item>
      <kern-timeline-item heading="b" datetime="${noon(0)}"></kern-timeline-item>
      <kern-timeline-item heading="c" datetime="${noon(-1)}"></kern-timeline-item>
      <kern-timeline-item heading="d" datetime="2026-01-05T12:00:00"></kern-timeline-item>
    </kern-timeline>`);
    const [a, b, c, d] = items();
    expect(a.dayLabel).toBe('Today');
    expect(b.dayLabel).toBeUndefined();
    expect(c.dayLabel).toBe('Yesterday');
    expect(d.dayLabel).toContain('2026');
    expect(items().map((i) => i.grouped)).toEqual([true, true, true, true]);
    expect(items().map((i) => i.dayEnd)).toEqual([false, true, true, false]);
  });

  it('says the day in the page language', async () => {
    const { page, items, timeline } = await setup(`<kern-timeline group-by="day"><kern-timeline-item heading="a" datetime="${noon(-1)}"></kern-timeline-item></kern-timeline>`);
    page.doc.documentElement.lang = 'de';
    timeline.groupBy = 'none';
    await page.waitForChanges();
    timeline.groupBy = 'day';
    await page.waitForChanges();
    expect(items()[0].dayLabel).toBe('Gestern');
    page.doc.documentElement.lang = '';
  });

  it('has no day headings without group-by', async () => {
    const { items } = await setup(`<kern-timeline><kern-timeline-item heading="a" datetime="${noon(0)}"></kern-timeline-item></kern-timeline>`);
    expect(items()[0].dayLabel).toBeUndefined();
    expect(items()[0].grouped).toBe(false);
  });

  it('shows placeholders while loading without events', async () => {
    const { page, root, timeline } = await setup(`<kern-timeline loading></kern-timeline>`);
    expect(root.querySelector('.placeholders')!.getAttribute('aria-hidden')).toBe('true');
    expect(root.querySelector('[role="list"]')!.getAttribute('aria-busy')).toBe('true');
    expect(root.querySelector('.empty')!.hasAttribute('hidden')).toBe(true);
    timeline.loading = false;
    await page.waitForChanges();
    expect(root.querySelector('.placeholders')).toBeNull();
    expect(root.querySelector('.empty')!.hasAttribute('hidden')).toBe(false);
  });

  it('shows the empty state with the Kern text, its own heading or nothing', async () => {
    setKernLocale('de');
    const { page, root, timeline } = await setup(`<kern-timeline></kern-timeline>`);
    expect(root.querySelector('.empty kern-empty-state')!.getAttribute('heading')).toBe('Noch keine Ereignisse');
    timeline.empty = 'Keine Ereignisse in 30 Tagen';
    await page.waitForChanges();
    expect(root.querySelector('.empty kern-empty-state')!.getAttribute('heading')).toBe('Keine Ereignisse in 30 Tagen');
    timeline.empty = '';
    await page.waitForChanges();
    expect(root.querySelector('.empty')!.hasAttribute('hidden')).toBe(true);
  });

  it('shows its own empty slot', async () => {
    const { root } = await setup(`<kern-timeline empty=""><kern-empty-state slot="empty" variant="error"></kern-empty-state></kern-timeline>`);
    expect(root.querySelector('.empty')!.hasAttribute('hidden')).toBe(false);
  });

  it('emits kernLoadMore once and announces the new events', async () => {
    const { page, host, root, timeline } = await setup(`<kern-timeline has-more><kern-timeline-item heading="a"></kern-timeline-item></kern-timeline>`);
    const button = () => root.querySelector('.more kern-button') as HTMLElement;
    expect(button().textContent).toBe('Load more');
    const spy = jest.fn();
    host.addEventListener('kernLoadMore', spy);
    button().click();
    expect(spy).toHaveBeenCalledTimes(1);

    timeline.loading = true;
    await page.waitForChanges();
    expect(button().hasAttribute('busy')).toBe(true);
    button().click();
    expect(spy).toHaveBeenCalledTimes(1);

    for (const h of ['b', 'c']) {
      const el = page.doc.createElement('kern-timeline-item');
      el.setAttribute('heading', h);
      host.appendChild(el);
    }
    await page.waitForChanges();
    root.querySelector('[role="list"] slot')!.dispatchEvent(new Event('slotchange'));
    timeline.loading = false;
    await page.waitForChanges();
    expect(root.querySelector('[role="status"]')!.textContent).toBe('2 more events loaded');
  });

  it('counts only the events after the old end, not live events at the top', async () => {
    const { page, host, root, timeline } = await setup(`<kern-timeline has-more><kern-timeline-item heading="a"></kern-timeline-item><kern-timeline-item heading="b"></kern-timeline-item></kern-timeline>`);
    const slotchange = () => root.querySelector('[role="list"] slot')!.dispatchEvent(new Event('slotchange'));
    const item = (h: string) => {
      const el = page.doc.createElement('kern-timeline-item');
      el.setAttribute('heading', h);
      return el;
    };
    (root.querySelector('.more kern-button') as HTMLElement).click();
    timeline.loading = true;
    await page.waitForChanges();
    // A live event at the top while loading: no announcement yet.
    host.prepend(item('live'));
    slotchange();
    await page.waitForChanges();
    expect(root.querySelector('[role="status"]')!.textContent).toBe('');

    host.append(item('c'), item('d'));
    slotchange();
    timeline.loading = false;
    await page.waitForChanges();
    expect(root.querySelector('[role="status"]')!.textContent).toBe('2 more events loaded');
  });

  it('hides the button without has-more and takes the more slot', async () => {
    const { root } = await setup(`<kern-timeline><kern-timeline-item heading="a"></kern-timeline-item><a slot="more" href="#all">Full history</a></kern-timeline>`);
    expect(root.querySelector('.more')!.hasAttribute('hidden')).toBe(false);
    expect(root.querySelector('.more kern-button')).toBeNull();
  });
});
