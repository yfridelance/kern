import { newSpecPage } from '@stencil/core/testing';
import { KernTimePicker } from './kern-time-picker';

const setup = async (attrs: string, locale = 'de-CH') => {
  const page = await newSpecPage({ components: [KernTimePicker], html: `<kern-time-picker locale="${locale}" label="Start" ${attrs}></kern-time-picker>` });
  const root = page.root!.shadowRoot!;
  const events: string[] = [];
  page.root!.addEventListener('kernChange', (e) => events.push((e as CustomEvent).detail.value));
  const seg = (name: string) => root.querySelector<HTMLElement>(`.seg.${name}`)!;
  const key = async (name: string, ...keys: string[]) => {
    for (const k of keys) {
      seg(name).dispatchEvent(new KeyboardEvent('keydown', { key: k }));
      await page.waitForChanges();
    }
  };
  const text = () => Array.from(root.querySelectorAll('.seg')).map((s) => s.textContent);
  return { page, root, events, seg, key, text, picker: page.root as unknown as KernTimePicker };
};

describe('kern-time-picker', () => {
  it('splits the value into segments', async () => {
    const { text, seg } = await setup(`value="06:30"`);
    expect(text()).toEqual(['06', '30']);
    expect(seg('hour').getAttribute('role')).toBe('spinbutton');
    expect(seg('hour').getAttribute('aria-valuenow')).toBe('6');
    expect(seg('minute').getAttribute('aria-label')).toBe('Start, Minutes');
  });

  it('types digits and fills a time', async () => {
    const { picker, key, events, text } = await setup(``);
    expect(text()).toEqual(['––', '––']);
    await key('hour', '0', '7');
    expect(picker.value).toBe('');
    await key('minute', '4', '5');
    expect(picker.value).toBe('07:45');
    await key('hour', '9');
    expect(picker.value).toBe('09:45');
    // Like <input type="time">, every complete intermediate time is reported.
    expect(events).toEqual(['07:04', '07:45', '09:45']);
  });

  it('spins minutes in steps and wraps', async () => {
    const { picker, key } = await setup(`value="06:07" step="900"`);
    await key('minute', 'ArrowUp');
    expect(picker.value).toBe('06:15');
    await key('minute', 'ArrowDown');
    expect(picker.value).toBe('06:00');
    await key('minute', 'ArrowDown');
    expect(picker.value).toBe('06:45');
    await key('hour', 'ArrowDown', 'ArrowDown', 'ArrowDown', 'ArrowDown', 'ArrowDown', 'ArrowDown', 'ArrowDown');
    expect(picker.value).toBe('23:45');
  });

  it('fills missing segments on the first arrow key and clears with Backspace', async () => {
    const { picker, key } = await setup(``);
    await key('minute', 'ArrowUp');
    expect(picker.value).toBe('00:00');
    await key('hour', 'Backspace');
    expect(picker.value).toBe('');
  });

  it('supports seconds', async () => {
    const { picker, key, text } = await setup(`value="06:30:05" seconds`);
    expect(text()).toEqual(['06', '30', '05']);
    await key('second', 'ArrowUp');
    expect(picker.value).toBe('06:30:06');
  });

  it('uses a 12-hour clock with AM/PM for en-US', async () => {
    const { picker, key, text } = await setup(`value="18:30"`, 'en-US');
    expect(text()).toEqual(['06', '30', 'PM']);
    await key('period', 'a');
    expect(picker.value).toBe('06:30');
    await key('hour', '1', '2');
    expect(picker.value).toBe('00:30');
  });

  it('flags times outside min/max', async () => {
    const { page, root } = await setup(`value="05:00" min="06:00" max="22:00"`);
    expect(root.querySelector('.error')!.textContent).toBe('Time not allowed');
    expect(page.root!.hasAttribute('invalid')).toBe(true);
  });

  it('offers a list of times within min/max', async () => {
    const { page, root, picker, events } = await setup(`value="08:00" list step="1800" min="08:00" max="10:00"`);
    const options = Array.from(root.querySelectorAll<HTMLElement>('[role="option"]'));
    expect(options.map((o) => o.textContent)).toEqual(['08:00', '08:30', '09:00', '09:30', '10:00']);
    expect(options[0].getAttribute('aria-selected')).toBe('true');
    options[3].click();
    await page.waitForChanges();
    expect(picker.value).toBe('09:30');
    expect(events).toEqual(['09:30']);
  });
});
