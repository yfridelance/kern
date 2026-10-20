import { newSpecPage } from '@stencil/core/testing';
import { KernInput } from './kern-input';

describe('kern-input', () => {
  it('links label, shows error instead of hint and marks invalid', async () => {
    const page = await newSpecPage({ components: [KernInput], html: `<kern-input label="Passwort" hint="Hinweis" error="Zugangsdaten falsch" type="password"></kern-input>` });
    const sr = page.root!.shadowRoot!;
    const input = sr.querySelector('input')!;
    expect(sr.querySelector('label')!.getAttribute('for')).toBe(input.id);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('autocomplete')).toBe('off');
    expect(sr.querySelector('.error')!.textContent).toBe('Zugangsdaten falsch');
    expect(sr.querySelector('.hint')).toBeNull();
    expect(page.root!.hasAttribute('invalid')).toBe(true);
  });

  it('updates value and emits on input', async () => {
    const page = await newSpecPage({ components: [KernInput], html: `<kern-input></kern-input>` });
    const seen: string[] = [];
    page.root!.addEventListener('kernChange', (e) => seen.push((e as CustomEvent).detail.value));
    const input = page.root!.shadowRoot!.querySelector('input')!;
    input.value = '10.0.0.0/24';
    input.dispatchEvent(new Event('input'));
    await page.waitForChanges();
    expect(page.root!.value).toBe('10.0.0.0/24');
    expect(seen).toEqual(['10.0.0.0/24']);
  });
});

describe('kern-input limits', () => {
  it('passes maxlength, min, max and step to the native input', async () => {
    const page = await newSpecPage({ components: [KernInput], html: `<kern-input type="number" min="1" max="10" step="0.5" maxlength="4"></kern-input>` });
    const input = page.root!.shadowRoot!.querySelector('input')!;
    expect(input.getAttribute('min')).toBe('1');
    expect(input.getAttribute('max')).toBe('10');
    expect(input.getAttribute('step')).toBe('0.5');
    expect(input.getAttribute('maxlength')).toBe('4');
  });
});

describe('kern-input suggestions', () => {
  const setup = async (attrs = '') => {
    const page = await newSpecPage({ components: [KernInput], html: `<kern-input label="Floor" suggestions="Ground floor, First floor, Basement, Attic" ${attrs}></kern-input>` });
    const sr = page.root!.shadowRoot!;
    const input = sr.querySelector('input')!;
    const seen: string[] = [];
    page.root!.addEventListener('kernInput', (e) => seen.push(`input:${(e as CustomEvent).detail.value}`));
    page.root!.addEventListener('kernChange', (e) => seen.push(`change:${(e as CustomEvent).detail.value}`));
    const type = async (text: string) => {
      input.value = text;
      input.dispatchEvent(new Event('input'));
      await page.waitForChanges();
    };
    const key = async (k: string) => {
      const ev = new KeyboardEvent('keydown', { key: k, cancelable: true });
      input.dispatchEvent(ev);
      await page.waitForChanges();
      return ev;
    };
    const options = () => Array.from(sr.querySelectorAll('[role="option"]'));
    return { page, sr, input, seen, type, key, options };
  };

  it('is a combobox with a listbox, splitting a comma-separated string', async () => {
    const { sr, input, options } = await setup();
    const list = sr.querySelector('[role="listbox"]')!;
    expect(input.getAttribute('role')).toBe('combobox');
    expect(input.getAttribute('aria-autocomplete')).toBe('list');
    expect(input.getAttribute('aria-expanded')).toBe('false');
    expect(input.getAttribute('aria-controls')).toBe(list.id);
    expect(input.getAttribute('autocomplete')).toBe('off');
    expect(options().map((o) => o.textContent)).toEqual(['Ground floor', 'First floor', 'Basement', 'Attic']);
  });

  it('accepts an array', async () => {
    const { page, options } = await setup();
    page.root!.suggestions = ['Kitchen', 'Office'];
    await page.waitForChanges();
    expect(options().map((o) => o.textContent)).toEqual(['Kitchen', 'Office']);
  });

  it('filters by substring, ignoring case, and highlights the match', async () => {
    const { input, type, options } = await setup();
    await type('FLOOR');
    expect(options().map((o) => o.textContent)).toEqual(['Ground floor', 'First floor']);
    expect(options()[0].querySelector('mark')!.textContent).toBe('floor');
    expect(input.getAttribute('aria-expanded')).toBe('true');
  });

  it('closes when nothing matches and keeps free text', async () => {
    const { page, input, seen, type, key, options } = await setup();
    await type('Garage');
    expect(options().length).toBe(0);
    expect(input.getAttribute('aria-expanded')).toBe('false');
    const enter = await key('Enter');
    expect(enter.defaultPrevented).toBe(false);
    expect(page.root!.value).toBe('Garage');
    expect(seen).toEqual(['input:Garage', 'change:Garage']);
  });

  it('moves with the arrow keys and takes the active suggestion on Enter', async () => {
    const { page, input, seen, type, key, options } = await setup();
    await type('fl');
    expect(input.hasAttribute('aria-activedescendant')).toBe(false);
    await key('ArrowDown');
    await key('ArrowDown');
    expect(input.getAttribute('aria-activedescendant')).toBe(options()[1].id);
    expect(options()[1].classList.contains('active')).toBe(true);
    await key('ArrowUp');
    expect(input.getAttribute('aria-activedescendant')).toBe(options()[0].id);
    const enter = await key('Enter');
    expect(enter.defaultPrevented).toBe(true);
    expect(page.root!.value).toBe('Ground floor');
    expect(input.value).toBe('Ground floor');
    expect(input.getAttribute('aria-expanded')).toBe('false');
    expect(seen).toEqual(['input:fl', 'change:fl', 'input:Ground floor', 'change:Ground floor']);
  });

  it('opens with ArrowUp on the last suggestion', async () => {
    const { input, key, options } = await setup();
    await key('ArrowUp');
    expect(input.getAttribute('aria-expanded')).toBe('true');
    expect(input.getAttribute('aria-activedescendant')).toBe(options()[3].id);
  });

  it('closes on Escape and Tab without taking a suggestion', async () => {
    const { page, input, type, key } = await setup();
    await type('b');
    await key('ArrowDown');
    const esc = await key('Escape');
    expect(esc.defaultPrevented).toBe(true);
    expect(input.getAttribute('aria-expanded')).toBe('false');
    await key('ArrowDown');
    expect(input.getAttribute('aria-expanded')).toBe('true');
    await key('Tab');
    expect(input.getAttribute('aria-expanded')).toBe('false');
    expect(page.root!.value).toBe('b');
  });

  it('takes a suggestion on click and emits like typing', async () => {
    const { page, seen, key, options } = await setup();
    await key('ArrowDown');
    (options()[2] as HTMLElement).click();
    await page.waitForChanges();
    expect(page.root!.value).toBe('Basement');
    expect(seen).toEqual(['input:Basement', 'change:Basement']);
  });

  it('does not offer suggestions for other types or when disabled', async () => {
    const num = await setup('type="number"');
    expect(num.input.hasAttribute('role')).toBe(false);
    expect(num.options().length).toBe(0);
    const off = await setup('disabled');
    await off.key('ArrowDown');
    expect(off.input.getAttribute('aria-expanded')).toBe('false');
  });
});
