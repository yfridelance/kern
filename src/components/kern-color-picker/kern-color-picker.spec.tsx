import { newSpecPage } from '@stencil/core/testing';
import { KernColorPicker } from './kern-color-picker';

const setup = async (attrs: string) => {
  const page = await newSpecPage({ components: [KernColorPicker], html: `<kern-color-picker label="Farbe" ${attrs}></kern-color-picker>` });
  const root = page.root!.shadowRoot!;
  const input = root.querySelector<HTMLInputElement>('input.text')!;
  const changes: unknown[] = [];
  page.root!.addEventListener('kernChange', (e) => changes.push((e as CustomEvent).detail.value));
  const type = async (text: string) => {
    input.value = text;
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('change'));
    await page.waitForChanges();
  };
  const key = async (sel: string, k: string, shiftKey = false) => {
    root.querySelector(sel)!.dispatchEvent(new KeyboardEvent('keydown', { key: k, shiftKey }));
    await page.waitForChanges();
  };
  return { page, root, input, changes, type, key, el: page.root as unknown as KernColorPicker };
};

describe('kern-color-picker', () => {
  it('normalises the value and shows it in the swatch and the field', async () => {
    const { el, root, input } = await setup(`value="#3CC"`);
    expect(el.value).toBe('#33cccc');
    expect(input.value).toBe('#33cccc');
    expect(root.querySelector('.swatch')!.getAttribute('style')).toContain('#33cccc');
  });

  it('applies typed hex and flags invalid text', async () => {
    const { el, type, changes, root } = await setup(`value="#000000"`);
    await type('3cc8cc');
    expect(el.value).toBe('#3cc8cc');
    await type('türkis');
    expect(el.value).toBe('#3cc8cc');
    expect(root.querySelector('.error')!.textContent).toBe('Not a valid color');
    expect(changes).toEqual(['#3cc8cc']);
  });

  it('changes saturation, brightness and hue with the keyboard', async () => {
    const { el, key, root } = await setup(`value="#ff0000"`);
    await key('.area', 'ArrowDown', true);
    expect(el.value).toBe('#e60000');
    await key('.hue', 'End');
    expect(root.querySelector('.hue')!.getAttribute('aria-valuenow')).toBe('359');
    expect(root.querySelector('.area')!.getAttribute('aria-valuetext')).toBe('Sättigung 100 %, Helligkeit 90 %');
  });

  it('picks swatches', async () => {
    const { el, root, page, changes } = await setup(`value="#000000" swatches="#ff8a3c, #3cc8cc"`);
    const presets = root.querySelectorAll<HTMLButtonElement>('.preset');
    expect(presets[1].getAttribute('aria-label')).toBe('#3cc8cc');
    presets[1].click();
    await page.waitForChanges();
    expect(el.value).toBe('#3cc8cc');
    expect(root.querySelectorAll('.preset')[1].getAttribute('aria-pressed')).toBe('true');
    expect(changes).toEqual(['#3cc8cc']);
  });

  it('handles colour temperatures in Kelvin', async () => {
    const { el, root, input, type, key } = await setup(`mode="temperature" value="4000" swatches="2700,6500"`);
    expect(input.value).toBe('4000');
    expect(root.querySelector('.unit')!.textContent).toBe('K');
    const bar = root.querySelector('.kelvin')!;
    expect([bar.getAttribute('aria-valuenow'), bar.getAttribute('aria-valuetext')]).toEqual(['4000', '4000 K']);
    await key('.kelvin', 'ArrowRight');
    expect(el.value).toBe(4100);
    await type('3333 K');
    expect(el.value).toBe(3300);
    await type('9000');
    expect(el.value).toBe(6500);
  });
});
