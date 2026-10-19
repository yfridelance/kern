import { newSpecPage } from '@stencil/core/testing';
import { KernMacInput } from './kern-mac-input';

const setup = async (attrs: string) => {
  const page = await newSpecPage({ components: [KernMacInput], html: `<kern-mac-input label="MAC" ${attrs}></kern-mac-input>` });
  const root = page.root!.shadowRoot!;
  const input = root.querySelector('input')!;
  const changes: string[] = [];
  page.root!.addEventListener('kernChange', (e) => changes.push((e as CustomEvent).detail.value));
  const type = async (text: string) => {
    input.value = text;
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('change'));
    await page.waitForChanges();
  };
  return { page, root, input, changes, type, el: page.root as unknown as KernMacInput, error: () => root.querySelector('.error')?.textContent };
};

describe('kern-mac-input', () => {
  it('normalises an initial value and shows a placeholder in the format', async () => {
    const { el, input } = await setup(`value="c82b961a3f00"`);
    expect([el.value, input.value]).toEqual(['C8:2B:96:1A:3F:00', 'C8:2B:96:1A:3F:00']);
    const empty = await setup(`format="dash" letter-case="lower"`);
    expect(empty.input.getAttribute('placeholder')).toBe('c8-2b-96-1a-3f-00');
  });

  it('applies typed notations in the configured format', async () => {
    const { el, input, type, changes } = await setup(`format="plain"`);
    await type('c8:2b:96:1a:3f:00');
    expect([el.value, input.value]).toEqual(['C82B961A3F00', 'C82B961A3F00']);
    await type('C8-2B-96-1A-3F-00');
    await type('');
    expect(changes).toEqual(['C82B961A3F00', '']);
  });

  it('marks invalid text and keeps the value', async () => {
    const { page, el, type, error } = await setup(`value="C8:2B:96:1A:3F:00"`);
    await type('C8:2B:96:1A:3F');
    expect(el.value).toBe('C8:2B:96:1A:3F:00');
    expect(error()).toBe('Keine gültige MAC-Adresse');
    expect(page.root!.hasAttribute('invalid')).toBe(true);
  });
});
