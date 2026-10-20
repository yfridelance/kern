import { newSpecPage } from '@stencil/core/testing';
import { KernStepInput } from './kern-step-input';

const setup = async (attrs: string, locale = 'de-DE') => {
  const page = await newSpecPage({ components: [KernStepInput], html: `<kern-step-input locale="${locale}" label="Zieltemperatur" ${attrs}></kern-step-input>` });
  const root = page.root!.shadowRoot!;
  const input = root.querySelector('input')!;
  const events: (number | null)[] = [];
  page.root!.addEventListener('kernChange', (e) => events.push((e as CustomEvent).detail.value));
  const key = async (k: string) => {
    input.dispatchEvent(new KeyboardEvent('keydown', { key: k }));
    await page.waitForChanges();
  };
  const type = async (text: string) => {
    input.value = text;
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('change'));
    await page.waitForChanges();
  };
  const press = async (cls: 'increase' | 'decrease') => {
    const b = root.querySelector<HTMLButtonElement>(`.${cls}`)!;
    b.dispatchEvent(new MouseEvent('pointerdown', { button: 0 }));
    b.dispatchEvent(new MouseEvent('pointerup'));
    await page.waitForChanges();
  };
  return { page, root, input, events, key, type, press, el: page.root as unknown as KernStepInput };
};

describe('kern-step-input', () => {
  it('shows the value with the step decimals, comma and unit', async () => {
    const { root, input } = await setup(`value="21.5" step="0.5" unit="°C" min="5" max="30"`);
    expect(input.value).toBe('21,5');
    expect(input.getAttribute('role')).toBe('spinbutton');
    expect([input.getAttribute('aria-valuenow'), input.getAttribute('aria-valuemin'), input.getAttribute('aria-valuemax')]).toEqual(['21.5', '5', '30']);
    expect(input.getAttribute('aria-valuetext')).toBe('21,5 °C');
    expect(root.querySelector('.unit')!.textContent).toBe('°C');
  });

  it('uses the decimal point of de-CH', async () => {
    const { input, type, el } = await setup(`value="21.5" step="0.5"`, 'de-CH');
    expect(input.value).toBe('21.5');
    await type('22,5');
    expect(el.value).toBe(22.5);
  });

  it('steps with buttons and keys, clamped to min/max', async () => {
    const { el, input, key, press, events } = await setup(`value="29" step="0.5" max="30" min="5"`);
    await press('increase');
    await key('ArrowUp');
    await key('ArrowUp');
    expect(el.value).toBe(30);
    await key('PageDown');
    expect(el.value).toBe(25);
    await key('Home');
    expect(input.value).toBe('5,0');
    await press('decrease');
    expect(events).toEqual([29.5, 30, 25, 5]);
  });

  it('disables the buttons at the limits', async () => {
    const { root } = await setup(`value="30" max="30"`);
    expect(root.querySelector('.increase')!.hasAttribute('disabled')).toBe(true);
    expect(root.querySelector('.decrease')!.hasAttribute('disabled')).toBe(false);
  });

  it('applies typed numbers with comma, clamps and rounds', async () => {
    const { el, input, type, events } = await setup(`step="0.5" min="5" max="30"`);
    await type('21,25');
    expect([el.value, input.value]).toEqual([21.3, '21,3']);
    await type('99');
    expect(el.value).toBe(30);
    await type('');
    expect(el.value).toBe('');
    expect(events).toEqual([21.3, 30, null]);
  });

  it('marks text that is not a number', async () => {
    const { page, root, el, type } = await setup(`value="3"`);
    await type('drei');
    expect(el.value).toBe(3);
    expect(root.querySelector('.error')!.textContent).toBe('Not a valid number');
    expect(page.root!.hasAttribute('invalid')).toBe(true);
  });

  it('starts at min from empty and uses typed text for steps', async () => {
    const { el, input, key } = await setup(`min="10"`);
    await key('ArrowUp');
    expect(el.value).toBe(10);
    input.value = '20';
    input.dispatchEvent(new Event('input'));
    await key('ArrowUp');
    expect(el.value).toBe(21);
  });

  it('leaves Home/End to the caret without min/max', async () => {
    const { el, key } = await setup(`value="4"`);
    await key('Home');
    await key('End');
    expect(el.value).toBe(4);
  });
});
