import { newSpecPage } from '@stencil/core/testing';
import { KernButton } from '../components/kern-button/kern-button';
import { KernCheckbox } from '../components/kern-checkbox/kern-checkbox';
import { KernColorPicker } from '../components/kern-color-picker/kern-color-picker';
import { KernDatePicker } from '../components/kern-date-picker/kern-date-picker';
import { KernDateRangePicker } from '../components/kern-date-range-picker/kern-date-range-picker';
import { KernFileInput } from '../components/kern-file-input/kern-file-input';
import { KernInput } from '../components/kern-input/kern-input';
import { KernIpInput } from '../components/kern-ip-input/kern-ip-input';
import { KernMacInput } from '../components/kern-mac-input/kern-mac-input';
import { KernRadioGroup } from '../components/kern-radio-group/kern-radio-group';
import { KernRange } from '../components/kern-range/kern-range';
import { KernRating } from '../components/kern-rating/kern-rating';
import { KernSegmented } from '../components/kern-segmented/kern-segmented';
import { KernSelect } from '../components/kern-select/kern-select';
import { KernStepInput } from '../components/kern-step-input/kern-step-input';
import { KernSwitch } from '../components/kern-switch/kern-switch';
import { KernTextarea } from '../components/kern-textarea/kern-textarea';
import { KernTimePicker } from '../components/kern-time-picker/kern-time-picker';
import { fieldDisabled } from './form-disabled';

type Field = HTMLElement & { disabled: boolean; formDisabledCallback(disabled: boolean): void };

/** Every form-associated component. */
const FIELDS: [string, unknown][] = [
  ['kern-button', KernButton],
  ['kern-checkbox', KernCheckbox],
  ['kern-color-picker', KernColorPicker],
  ['kern-date-picker', KernDatePicker],
  ['kern-date-range-picker', KernDateRangePicker],
  ['kern-file-input', KernFileInput],
  ['kern-input', KernInput],
  ['kern-ip-input', KernIpInput],
  ['kern-mac-input', KernMacInput],
  ['kern-radio-group', KernRadioGroup],
  ['kern-range', KernRange],
  ['kern-rating', KernRating],
  ['kern-segmented', KernSegmented],
  ['kern-select', KernSelect],
  ['kern-step-input', KernStepInput],
  ['kern-switch', KernSwitch],
  ['kern-textarea', KernTextarea],
  ['kern-time-picker', KernTimePicker],
];

/** Disabled controls inside the shadow root (native `disabled` or `aria-disabled`). */
const lockedInside = (el: HTMLElement) => el.shadowRoot!.querySelectorAll('[disabled], [aria-disabled="true"]').length;

describe('fieldDisabled', () => {
  it('is true for the own prop or a disabled fieldset', () => {
    expect(fieldDisabled({ disabled: false, formDisabled: false })).toBe(false);
    expect(fieldDisabled({ disabled: true, formDisabled: false })).toBe(true);
    expect(fieldDisabled({ disabled: false, formDisabled: true })).toBe(true);
  });
});

describe.each(FIELDS)('%s in a disabled fieldset (#151)', (tag, component) => {
  const render = (attrs = '') => newSpecPage({ components: [component], html: `<${tag} label="Feld" ${attrs}></${tag}>` });

  it('locks while the fieldset is disabled and frees again, without touching `disabled`', async () => {
    const page = await render();
    const el = page.root as Field;
    const free = lockedInside(el);

    el.formDisabledCallback(true);
    await page.waitForChanges();
    expect(el.disabled).toBe(false);
    expect(el.hasAttribute('disabled')).toBe(false);
    expect(lockedInside(el)).toBeGreaterThan(free);

    el.formDisabledCallback(false);
    await page.waitForChanges();
    expect(el.disabled).toBe(false);
    expect(lockedInside(el)).toBe(free);
  });

  it('keeps its own `disabled` when the fieldset is freed', async () => {
    const page = await render('disabled');
    const el = page.root as Field;
    const locked = lockedInside(el);

    el.formDisabledCallback(true);
    await page.waitForChanges();
    el.formDisabledCallback(false);
    await page.waitForChanges();
    expect(el.disabled).toBe(true);
    expect(el.hasAttribute('disabled')).toBe(true);
    expect(lockedInside(el)).toBe(locked);
    expect(locked).toBeGreaterThan(0);
  });
});
