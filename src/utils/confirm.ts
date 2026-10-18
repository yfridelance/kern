export interface ConfirmOptions {
  heading: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Confirm button in `danger` style. */
  danger?: boolean;
  /** Confirm stays disabled until exactly this text is typed (case-insensitive), e.g. the MAC. */
  typeToConfirm?: string;
  typeToConfirmLabel?: string;
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
    ok.textContent = opts.confirmLabel ?? 'OK';
    ok.slot = 'footer';

    const cancel = document.createElement('kern-button');
    cancel.textContent = opts.cancelLabel ?? 'Abbrechen';
    cancel.slot = 'footer';

    let input: (HTMLElement & { value: string; setFocus(): Promise<void> }) | undefined;
    if (opts.typeToConfirm) {
      const expected = opts.typeToConfirm.trim().toUpperCase();
      input = document.createElement('kern-input') as typeof input & HTMLElement;
      input!.setAttribute('label', opts.typeToConfirmLabel ?? `Zur Bestätigung «${opts.typeToConfirm}» eintippen`);
      input!.setAttribute('mono', '');
      input!.setAttribute('autocomplete', 'off');
      ok.disabled = true;
      input!.addEventListener('kernInput', (e) => {
        ok.disabled = (e as CustomEvent<{ value: string }>).detail.value.trim().toUpperCase() !== expected;
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
