import { newSpecPage } from '@stencil/core/testing';
import { KernDate } from './kern-date';

describe('kern-date', () => {
  it('renders a <time> with ISO datetime', async () => {
    const page = await newSpecPage({
      components: [KernDate],
      html: `<kern-date value="2026-10-19T08:15:00Z" time locale="de-CH" time-zone="Europe/Zurich"></kern-date>`,
    });
    const time = page.root!.shadowRoot!.querySelector('time')!;
    expect(time.getAttribute('datetime')).toBe('2026-10-19T08:15:00.000Z');
    expect(time.textContent).toBe('19.10.2026, 10:15');
    expect(time.hasAttribute('title')).toBe(false);
  });

  it('shows relative text with the absolute value as tooltip', async () => {
    const value = new Date(Date.now() - 3 * 60_000).toISOString();
    const page = await newSpecPage({ components: [KernDate], html: `<kern-date value="${value}" relative locale="de-CH"></kern-date>` });
    const time = page.root!.shadowRoot!.querySelector('time')!;
    expect(time.textContent).toBe('vor 3 Min.');
    expect(time.getAttribute('title')).toMatch(/^\d{2}\.\d{2}\.\d{4}, \d{2}:\d{2}$/);
    page.root!.remove(); // stops the shared timer
  });

  it('shows invalid values as given', async () => {
    const page = await newSpecPage({ components: [KernDate], html: `<kern-date value="gestern"></kern-date>` });
    expect(page.root!.shadowRoot!.querySelector('time')).toBeNull();
    expect(page.root!.shadowRoot!.textContent).toBe('gestern');
  });
});
