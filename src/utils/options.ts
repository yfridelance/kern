import type { KernOption } from '../components/kern-select/kern-select';

/**
 * Reads an `<option>` through attributes, so it also works before upgrade and in server/test DOMs. `data-icon`,
 * `aria-label` and `lang` become `icon`, `ariaLabel` and `lang` when present.
 */
export function optionOf(o: Element): KernOption {
  const label = o.textContent?.trim() ?? '';
  const opt: KernOption = { value: o.getAttribute('value') ?? label, label, disabled: o.hasAttribute('disabled') };
  const icon = o.getAttribute('data-icon');
  const ariaLabel = o.getAttribute('aria-label');
  const lang = o.getAttribute('lang');
  if (icon) opt.icon = icon as KernOption['icon'];
  if (ariaLabel) opt.ariaLabel = ariaLabel;
  if (lang) opt.lang = lang;
  return opt;
}
