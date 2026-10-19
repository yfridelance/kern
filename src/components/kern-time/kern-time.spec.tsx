import { newSpecPage } from '@stencil/core/testing';
import { KernTime } from './kern-time';

const render = async (attrs: string) => {
  const page = await newSpecPage({ components: [KernTime], html: `<kern-time locale="de-CH" ${attrs}></kern-time>` });
  return page.root!.shadowRoot!;
};

describe('kern-time', () => {
  it('formats a time of day', async () => {
    const time = (await render(`value="06:30:05" seconds`)).querySelector('time')!;
    expect(time.textContent).toBe('06:30:05');
    expect(time.getAttribute('datetime')).toBe('06:30:05');
  });

  it('formats the time of a point in time', async () => {
    const time = (await render(`value="2026-10-19T08:15:00Z" time-zone="Europe/Zurich"`)).querySelector('time')!;
    expect(time.textContent).toBe('10:15');
    expect(time.getAttribute('datetime')).toBe('2026-10-19T08:15:00.000Z');
  });

  it('formats durations from ISO 8601 or seconds', async () => {
    const iso = (await render(`duration="PT1H23M"`)).querySelector('time')!;
    expect(iso.textContent).toBe('1 Std., 23 Min.');
    const secs = (await render(`duration="5025"`)).querySelector('time')!;
    expect(secs.textContent).toBe('1 Std., 23 Min. und 45 Sek.');
    expect(secs.getAttribute('datetime')).toBe('PT1H23M45S');
  });

  it('shows invalid values as given', async () => {
    const root = await render(`value="bald"`);
    expect(root.querySelector('time')).toBeNull();
    expect(root.textContent).toBe('bald');
  });
});
