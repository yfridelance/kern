import { newSpecPage } from '@stencil/core/testing';
import { KernColorPicker } from '../components/kern-color-picker/kern-color-picker';
import { KernDatePicker } from '../components/kern-date-picker/kern-date-picker';
import { KernDateRangePicker } from '../components/kern-date-range-picker/kern-date-range-picker';
import { KernInput } from '../components/kern-input/kern-input';
import { KernIpInput } from '../components/kern-ip-input/kern-ip-input';
import { KernMacInput } from '../components/kern-mac-input/kern-mac-input';
import { KernStepInput } from '../components/kern-step-input/kern-step-input';
import { KernTextarea } from '../components/kern-textarea/kern-textarea';
import { KernTimePicker } from '../components/kern-time-picker/kern-time-picker';
import { implicitSubmit, isSubmitKey, type ImplicitSubmitter } from './implicit-submit';

/** The submit runs in a task after the keydown. */
const tick = () => new Promise((resolve) => setTimeout(resolve));

const enter = (init: KeyboardEventInit = {}) => new KeyboardEvent('keydown', { key: 'Enter', cancelable: true, ...init });

/** A stand-in form: the mock DOM has no `requestSubmit()` or `form.elements`. */
const fakeForm = (elements: object[] = []) => ({ elements, requestSubmit: jest.fn() });

const field = (form: unknown, own: Partial<ImplicitSubmitter> = {}): ImplicitSubmitter => ({
  internals: { form } as unknown as ElementInternals,
  disabled: false,
  formDisabled: false,
  readonly: false,
  noImplicitSubmit: false,
  ...own,
});

describe('isSubmitKey', () => {
  it('is plain Enter only', () => {
    expect(isSubmitKey(enter())).toBe(true);
    expect(isSubmitKey(new KeyboardEvent('keydown', { key: 'a' }))).toBe(false);
    expect(isSubmitKey(enter({ shiftKey: true }))).toBe(false);
    expect(isSubmitKey(enter({ ctrlKey: true }))).toBe(false);
    expect(isSubmitKey(enter({ altKey: true }))).toBe(false);
    expect(isSubmitKey(enter({ metaKey: true }))).toBe(false);
  });

  it('is false once someone called preventDefault()', () => {
    const ev = enter();
    ev.preventDefault();
    expect(isSubmitKey(ev)).toBe(false);
  });
});

describe('implicitSubmit', () => {
  it('submits the form when it has no submit button, after the event was handled', async () => {
    const form = fakeForm([{ localName: 'kern-input', type: 'text' }]);
    implicitSubmit(field(form), enter());
    expect(form.requestSubmit).not.toHaveBeenCalled();
    await tick();
    expect(form.requestSubmit).toHaveBeenCalledTimes(1);
  });

  it('does not submit when a later listener calls preventDefault()', async () => {
    const form = fakeForm();
    const ev = enter();
    implicitSubmit(field(form), ev);
    ev.preventDefault();
    await tick();
    expect(form.requestSubmit).not.toHaveBeenCalled();
  });

  it('clicks a native default button, which skips the submit while disabled', async () => {
    const button = { localName: 'button', type: 'submit', click: jest.fn() };
    const form = fakeForm([{ localName: 'kern-input', type: 'text' }, { localName: 'button', type: 'button' }, button]);
    implicitSubmit(field(form), enter());
    await tick();
    expect(button.click).toHaveBeenCalledTimes(1);
    expect(form.requestSubmit).not.toHaveBeenCalled();
  });

  it('clicks the inner button of a kern-button default button', async () => {
    const inner = { click: jest.fn() };
    const button = { localName: 'kern-button', type: 'submit', click: jest.fn(), shadowRoot: { querySelector: () => inner } };
    const form = fakeForm([button]);
    implicitSubmit(field(form), enter());
    await tick();
    expect(inner.click).toHaveBeenCalledTimes(1);
    expect(button.click).not.toHaveBeenCalled();
    expect(form.requestSubmit).not.toHaveBeenCalled();
  });

  it('does nothing without a form, for other keys, or when the field is off', async () => {
    const form = fakeForm();
    implicitSubmit(field(null), enter());
    implicitSubmit(field(form), new KeyboardEvent('keydown', { key: 'Tab' }));
    implicitSubmit(field(form, { disabled: true }), enter());
    implicitSubmit(field(form, { formDisabled: true }), enter());
    implicitSubmit(field(form, { readonly: true }), enter());
    implicitSubmit(field(form, { noImplicitSubmit: true }), enter());
    await tick();
    expect(form.requestSubmit).not.toHaveBeenCalled();
  });
});

type Comp = { internals: ElementInternals; value: unknown };

/** Single-line fields: tag, component, typed text, and the value it applies before the submit. */
const FIELDS: [string, unknown, string, unknown][] = [
  ['kern-input', KernInput, 'nas-01', 'nas-01'],
  ['kern-ip-input', KernIpInput, ' 192.168.1.0/24 ', '192.168.1.0/24'],
  ['kern-mac-input', KernMacInput, 'c82b961a3f00', 'C8:2B:96:1A:3F:00'],
  ['kern-step-input', KernStepInput, '7', 7],
  ['kern-date-picker', KernDatePicker, '2026-10-19', '2026-10-19'],
  ['kern-color-picker', KernColorPicker, '#3cc8cc', '#3cc8cc'],
];

const render = async (tag: string, component: unknown, attrs = '') => {
  const page = await newSpecPage({ components: [component], html: `<${tag} label="Feld" ${attrs}></${tag}>` });
  const comp = page.rootInstance as Comp;
  const form = fakeForm();
  const seen: unknown[] = [];
  // Record the value the form gets at submit time.
  form.requestSubmit.mockImplementation(() => seen.push(comp.value));
  comp.internals = { form, setFormValue: jest.fn(), setValidity: jest.fn() } as unknown as ElementInternals;
  return { page, form, seen, sr: page.root!.shadowRoot! };
};

describe.each(FIELDS)('%s: Enter submits the form (#155)', (tag, component, typed, applied) => {
  it('applies the typed text first, then submits', async () => {
    const { page, form, seen, sr } = await render(tag, component);
    const input = sr.querySelector('input')!;
    input.value = typed;
    input.dispatchEvent(new Event('input'));
    await page.waitForChanges();
    input.dispatchEvent(enter());
    await tick();
    expect(form.requestSubmit).toHaveBeenCalledTimes(1);
    expect(seen).toEqual([applied]);
  });

  it('does not submit with no-implicit-submit, readonly, disabled or a modifier', async () => {
    for (const attrs of ['no-implicit-submit', 'readonly', 'disabled']) {
      const { form, sr } = await render(tag, component, attrs);
      sr.querySelector('input')!.dispatchEvent(enter());
      await tick();
      expect(form.requestSubmit).not.toHaveBeenCalled();
    }
    const { form, sr } = await render(tag, component);
    sr.querySelector('input')!.dispatchEvent(enter({ shiftKey: true }));
    await tick();
    expect(form.requestSubmit).not.toHaveBeenCalled();
  });
});

describe('kern-date-range-picker: Enter submits the form (#155)', () => {
  it('from both fields, after applying the typed date', async () => {
    const { page, form, seen, sr } = await render('kern-date-range-picker', KernDateRangePicker, 'start="2026-10-01"');
    const [, end] = Array.from(sr.querySelectorAll('input'));
    end.value = '2026-10-19';
    end.dispatchEvent(new Event('input'));
    await page.waitForChanges();
    end.dispatchEvent(enter());
    await tick();
    expect(seen).toEqual(['2026-10-01/2026-10-19']);
    sr.querySelector('input')!.dispatchEvent(enter());
    await tick();
    expect(form.requestSubmit).toHaveBeenCalledTimes(2);
  });
});

describe('kern-time-picker: Enter submits the form (#155)', () => {
  it('from a segment', async () => {
    const { form, sr } = await render('kern-time-picker', KernTimePicker, 'value="08:30"');
    sr.querySelector<HTMLElement>('[role="spinbutton"]')!.dispatchEvent(enter());
    await tick();
    expect(form.requestSubmit).toHaveBeenCalledTimes(1);
  });
});

describe('kern-input suggestions: Enter submits only with the list closed', () => {
  it('takes the suggestion while the list is open and submits once it is closed', async () => {
    const { page, form, seen, sr } = await render('kern-input', KernInput, 'suggestions="Ground floor, First floor"');
    const input = sr.querySelector('input')!;
    const key = async (ev: KeyboardEvent) => {
      input.dispatchEvent(ev);
      await page.waitForChanges();
      await tick();
    };
    input.value = 'floor';
    input.dispatchEvent(new Event('input'));
    await page.waitForChanges();
    expect(input.getAttribute('aria-expanded')).toBe('true');

    // Open without an active suggestion: Enter only closes the list.
    await key(enter());
    expect(input.getAttribute('aria-expanded')).toBe('false');
    expect(form.requestSubmit).not.toHaveBeenCalled();

    await key(new KeyboardEvent('keydown', { key: 'ArrowDown', cancelable: true }));
    await key(enter());
    expect((page.rootInstance as Comp).value).toBe('Ground floor');
    expect(form.requestSubmit).not.toHaveBeenCalled();

    await key(enter());
    expect(seen).toEqual(['Ground floor']);
  });
});

describe('kern-textarea', () => {
  it('keeps Enter for a new line', async () => {
    const { form, sr } = await render('kern-textarea', KernTextarea);
    sr.querySelector('textarea')!.dispatchEvent(enter());
    await tick();
    expect(form.requestSubmit).not.toHaveBeenCalled();
  });
});
