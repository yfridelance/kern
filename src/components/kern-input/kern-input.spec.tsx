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

describe('kern-input validity', () => {
  const VALID = { valueMissing: false, typeMismatch: false, patternMismatch: false, tooLong: false, tooShort: false, rangeUnderflow: false, rangeOverflow: false, stepMismatch: false, badInput: false };

  /** Mock DOM has no constraint validation: stub internals and the inner input's validity. */
  const setup = async (attrs = '') => {
    const page = await newSpecPage({ components: [KernInput], html: `<kern-input label="Mail" type="email" ${attrs}></kern-input>` });
    const root = page.root as HTMLElement;
    const input = root.shadowRoot!.querySelector('input')!;
    const comp = page.rootInstance as KernInput;
    const internals = { setFormValue: jest.fn(), setValidity: jest.fn() };
    comp.internals = internals as unknown as ElementInternals;
    const state = { flags: { ...VALID }, message: '' };
    Object.defineProperty(input, 'willValidate', { configurable: true, get: () => true });
    Object.defineProperty(input, 'validity', { configurable: true, get: () => ({ ...state.flags, valid: !Object.values(state.flags).some(Boolean) }) });
    Object.defineProperty(input, 'validationMessage', { configurable: true, get: () => state.message });
    const setNative = (flags: Partial<typeof VALID>, message: string) => {
      state.flags = { ...VALID, ...flags };
      state.message = message;
    };
    const type = async (text: string, change = false) => {
      input.value = text;
      input.dispatchEvent(new Event('input'));
      if (change) input.dispatchEvent(new Event('change'));
      await page.waitForChanges();
    };
    const errorText = () => root.shadowRoot!.querySelector('.error')?.textContent ?? null;
    return { page, root, input, comp, internals, setNative, type, errorText };
  };

  it('passes native flags and message to the form', async () => {
    const { input, internals, setNative, type } = await setup();
    setNative({ typeMismatch: true }, 'Enter an email address.');
    await type('nope');
    expect(internals.setValidity).toHaveBeenLastCalledWith({ ...VALID, typeMismatch: true }, 'Enter an email address.', input);
    expect(internals.setFormValue).toHaveBeenLastCalledWith('nope');
    setNative({}, '');
    await type('a@b.ch');
    expect(internals.setValidity).toHaveBeenLastCalledWith({});
  });

  it('gives error priority over native problems', async () => {
    const { page, root, input, internals, setNative, type, errorText } = await setup();
    setNative({ typeMismatch: true }, 'Enter an email address.');
    root.setAttribute('error', 'Address taken');
    await type('nope', true);
    expect(internals.setValidity).toHaveBeenLastCalledWith({ customError: true }, 'Address taken', input);
    expect(errorText()).toBe('Address taken');
    root.removeAttribute('error');
    await page.waitForChanges();
    expect(errorText()).toBe('Enter an email address.');
  });

  it('skips fields that do not validate (readonly, disabled)', async () => {
    const { input, internals, setNative, type } = await setup();
    Object.defineProperty(input, 'willValidate', { configurable: true, get: () => false });
    setNative({ typeMismatch: true }, 'Enter an email address.');
    await type('nope');
    expect(internals.setValidity).toHaveBeenLastCalledWith({});
  });

  it('shows the native message only after a change', async () => {
    const { root, input, setNative, type, errorText } = await setup();
    setNative({ typeMismatch: true }, 'Enter an email address.');
    await type('nope');
    expect(errorText()).toBeNull();
    expect(root.hasAttribute('invalid')).toBe(false);
    await type('nope', true);
    expect(errorText()).toBe('Enter an email address.');
    expect(root.hasAttribute('invalid')).toBe(true);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe(root.shadowRoot!.querySelector('.error')!.id);
    setNative({}, '');
    await type('a@b.ch');
    expect(errorText()).toBeNull();
    expect(root.hasAttribute('invalid')).toBe(false);
    expect(input.hasAttribute('aria-invalid')).toBe(false);
  });

  it('shows the native message after a failed submit (invalid event)', async () => {
    const { page, root, setNative, type, errorText } = await setup();
    setNative({ valueMissing: true }, 'Fill out this field.');
    await type('');
    expect(errorText()).toBeNull();
    root.dispatchEvent(new Event('invalid'));
    await page.waitForChanges();
    expect(errorText()).toBe('Fill out this field.');
  });

  it('form reset hides the message again', async () => {
    const { page, root, comp, setNative, type, errorText } = await setup('value="x"');
    setNative({ typeMismatch: true }, 'Enter an email address.');
    await type('nope', true);
    expect(errorText()).toBe('Enter an email address.');
    comp.formResetCallback();
    await page.waitForChanges();
    expect((root as HTMLKernInputElement).value).toBe('x');
    expect(errorText()).toBeNull();
  });
});
