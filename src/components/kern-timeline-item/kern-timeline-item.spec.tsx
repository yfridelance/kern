import { newSpecPage } from '@stencil/core/testing';
import { setKernLocale } from '../../utils/i18n';
import { KernTimelineItem } from './kern-timeline-item';

const setup = async (html: string) => {
  const page = await newSpecPage({ components: [KernTimelineItem], html });
  return { page, host: page.root!, root: page.root!.shadowRoot! };
};

describe('kern-timeline-item', () => {
  afterEach(() => setKernLocale());

  it('is a list item with heading, time and description', async () => {
    const { host, root } = await setup(`<kern-timeline-item heading="Firmware updated" datetime="2026-10-21T06:30:00Z" tone="ok">Version 1.4.2</kern-timeline-item>`);
    expect(host.getAttribute('role')).toBe('listitem');
    expect(root.querySelector('.heading')!.textContent).toBe('Firmware updated');
    const date = root.querySelector('.time kern-date')!;
    expect(date).not.toBeNull();
    expect(date.hasAttribute('relative')).toBe(false);
    expect(root.querySelector('.marker')!.getAttribute('aria-hidden')).toBe('true');
    expect(host.textContent).toContain('Version 1.4.2');
  });

  it('shows the time relative, or only the time of day inside a day group', async () => {
    const { page, host, root } = await setup(`<kern-timeline-item heading="A" datetime="2026-10-21T06:30:00Z" relative></kern-timeline-item>`);
    expect(root.querySelector('.time kern-date')!.hasAttribute('relative')).toBe(true);
    (host as unknown as KernTimelineItem).relative = false;
    (host as unknown as KernTimelineItem).grouped = true;
    await page.waitForChanges();
    expect(root.querySelector('.time kern-time')).not.toBeNull();
    expect(root.querySelector('.time kern-date')).toBeNull();
  });

  it('shows no time without datetime', async () => {
    const { root } = await setup(`<kern-timeline-item heading="A"></kern-timeline-item>`);
    expect(root.querySelector('.time')!.children.length).toBe(0);
  });

  it('says the state as a word with the tone and puts the icon in the marker', async () => {
    const { root } = await setup(`<kern-timeline-item heading="Connection lost" tone="danger" status="Offline" icon="wifi"></kern-timeline-item>`);
    const status = root.querySelector('kern-status')!;
    expect(status.getAttribute('tone')).toBe('danger');
    expect(status.textContent).toBe('Offline');
    expect(root.querySelector('.marker.icon svg')).not.toBeNull();
  });

  it('shows details inline without collapsible', async () => {
    const { root } = await setup(`<kern-timeline-item heading="A"><p slot="details">More</p></kern-timeline-item>`);
    expect(root.querySelector('.toggle')).toBeNull();
    expect(root.querySelector('.details')!.hasAttribute('hidden')).toBe(false);
  });

  it('hides collapsible details behind a button that toggles them', async () => {
    const { page, host, root } = await setup(`<kern-timeline-item heading="A" collapsible><p slot="details">More</p></kern-timeline-item>`);
    const toggle = () => root.querySelector('.toggle') as HTMLButtonElement;
    const details = root.querySelector('.details')!;
    expect(details.hasAttribute('hidden')).toBe(true);
    expect(toggle().getAttribute('aria-expanded')).toBe('false');
    expect(toggle().getAttribute('aria-controls')).toBe(details.id);
    expect(toggle().textContent).toBe('Show details');

    const spy = jest.fn();
    host.addEventListener('kernToggle', (e) => spy((e as CustomEvent).detail));
    toggle().click();
    await page.waitForChanges();
    expect(host.hasAttribute('open')).toBe(true);
    expect(details.hasAttribute('hidden')).toBe(false);
    expect(toggle().getAttribute('aria-expanded')).toBe('true');
    expect(toggle().textContent).toBe('Hide details');
    expect(spy).toHaveBeenCalledWith({ open: true });
  });

  it('has no toggle without details', async () => {
    const { root } = await setup(`<kern-timeline-item heading="A" collapsible></kern-timeline-item>`);
    expect(root.querySelector('.toggle')).toBeNull();
  });

  it('translates the toggle and takes its own label', async () => {
    setKernLocale('de');
    const { page, host, root } = await setup(`<kern-timeline-item heading="A" collapsible><p slot="details">Mehr</p></kern-timeline-item>`);
    expect(root.querySelector('.toggle')!.textContent).toBe('Details anzeigen');
    (host as unknown as KernTimelineItem).labelShow = 'Protokoll';
    await page.waitForChanges();
    expect(root.querySelector('.toggle')!.textContent).toBe('Protokoll');
  });

  it('shows the actions slot only with actions', async () => {
    const { root } = await setup(`<kern-timeline-item heading="A"><button slot="actions">Log</button></kern-timeline-item>`);
    expect(root.querySelector('.actions')!.hasAttribute('hidden')).toBe(false);
    const other = await setup(`<kern-timeline-item heading="A"></kern-timeline-item>`);
    expect(other.root.querySelector('.actions')!.hasAttribute('hidden')).toBe(true);
  });
});
