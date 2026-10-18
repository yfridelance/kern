import type { KernOption } from '../components/kern-select/kern-select';

/** Reads an `<option>` through attributes, so it also works before upgrade and in server/test DOMs. */
export function optionOf(o: Element): KernOption {
  const label = o.textContent?.trim() ?? '';
  return { value: o.getAttribute('value') ?? label, label, disabled: o.hasAttribute('disabled') };
}
