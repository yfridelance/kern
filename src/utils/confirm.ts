import { kernText } from './i18n';
import { formatMac, parseMac } from './mac';

export interface ConfirmOptions {
  heading: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Confirm button in `danger` style. */
  danger?: boolean;
  /**
   * Confirm stays disabled until this text is typed, e.g. the MAC. With an array, any one of the alternatives
   * is enough (e.g. the device name or its MAC). Compared after `normalize`.
   */
  typeToConfirm?: string | string[];
  /**
   * Applied to the typed text and to every alternative before comparing. Default: `trim()` + `toUpperCase()`.
   * `'mac'` accepts a MAC in any notation (`A8:03:2A:B1:23:45`, `a8-03-…`, `A8032AB12345`) and falls back to the
   * default for text that is no MAC; the label then shows MACs as `A8:03:2A:B1:23:45`.
   */
  normalize?: ((text: string) => string) | 'mac';
  /** Label above the input. Default: the Kern text, e.g. «Type “A”, “B” or “C” to confirm». */
  typeToConfirmLabel?: string;
}

const defaultNormalize = (text: string) => text.trim().toUpperCase();

/** The comparison function for `normalize`. */
export function confirmNormalizer(normalize: ConfirmOptions['normalize']): (text: string) => string {
  if (normalize === 'mac') return (text) => parseMac(text) ?? defaultNormalize(text);
  return normalize ?? defaultNormalize;
}

/** Default label for `typeToConfirm` in the Kern language, e.g. «Type “A”, “B” or “C” to confirm». */
export function typeToConfirmText(alternatives: string[], normalize?: ConfirmOptions['normalize']): string {
  const shown = alternatives.map((alt) => {
    const hex = normalize === 'mac' ? parseMac(alt) : null;
    return kernText('confirm.quote').replace('{text}', hex ? formatMac(hex) : alt);
  });
  const list = shown.length > 1 ? `${shown.slice(0, -1).join(', ')} ${kernText('confirm.or')} ${shown[shown.length - 1]}` : shown[0];
  return kernText('confirm.typeToConfirmLabel').replace('{list}', list);
}

/**
 * Opens a kern-dialog asking for confirmation. Resolves `true` on confirm, `false` otherwise.
 * Requires the Kern components to be defined (loader or custom-elements build).
 */
export function confirm(opts: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    const dialog = document.createElement('kern-dialog') as HTMLElement & { heading?: string; show(): Promise<void>; close(v?: string): Promise<void> };
    dialog.heading = opts.heading;

    if (opts.message) {
      const p = document.createElement('p');
      p.textContent = opts.message;
      dialog.appendChild(p);
    }

    const ok = document.createElement('kern-button') as HTMLElement & { variant: string; disabled: boolean };
    ok.variant = opts.danger ? 'danger' : 'primary';
    ok.textContent = opts.confirmLabel ?? kernText('confirm.confirmLabel');
    ok.slot = 'footer';

    const cancel = document.createElement('kern-button');
    cancel.textContent = opts.cancelLabel ?? kernText('confirm.cancelLabel');
    cancel.slot = 'footer';

    let input: (HTMLElement & { value: string; setFocus(): Promise<void> }) | undefined;
    const alternatives = ([] as string[]).concat(opts.typeToConfirm ?? []).filter(Boolean);
    if (alternatives.length) {
      const norm = confirmNormalizer(opts.normalize);
      const expected = new Set(alternatives.map(norm));
      input = document.createElement('kern-input') as typeof input & HTMLElement;
      input!.setAttribute('label', opts.typeToConfirmLabel ?? typeToConfirmText(alternatives, opts.normalize));
      input!.setAttribute('mono', '');
      input!.setAttribute('autocomplete', 'off');
      ok.disabled = true;
      input!.addEventListener('kernInput', (e) => {
        ok.disabled = !expected.has(norm((e as CustomEvent<{ value: string }>).detail.value));
      });
      dialog.appendChild(input!);
    }

    dialog.append(cancel, ok);
    cancel.addEventListener('click', () => dialog.close('cancel'));
    ok.addEventListener('click', () => dialog.close('ok'));
    dialog.addEventListener('kernClose', (e) => {
      resolve((e as CustomEvent<{ returnValue: string }>).detail.returnValue === 'ok');
      dialog.remove();
    });

    document.body.appendChild(dialog);
    customElements.whenDefined('kern-dialog').then(async () => {
      await dialog.show();
      if (input) setTimeout(() => input?.setFocus(), 0);
    });
  });
}
