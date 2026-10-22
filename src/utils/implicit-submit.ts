import { fieldDisabled, type FormDisableable } from './form-disabled';

/**
 * Implicit submission for single-line fields: Enter in a native text field submits its form, but the input of a Kern
 * field sits in the shadow DOM and belongs to no form (#155). The field calls `implicitSubmit(this, ev)` from its
 * keydown handler after it has applied typed text, so value and validity are current.
 *
 * Like the browser, it clicks the form's default button (its first submit button), which does nothing while that
 * button is disabled; without a submit button it calls `form.requestSubmit()`. Both run constraint validation and
 * fire `submit`. The field's `no-implicit-submit` turns it off.
 */
export interface ImplicitSubmitter extends FormDisableable {
  internals?: ElementInternals;
  readonly: boolean;
  noImplicitSubmit: boolean;
}

/** Enter without modifier keys, outside IME composition, not handled by anyone else. */
export function isSubmitKey(ev: KeyboardEvent): boolean {
  return ev.key === 'Enter' && !ev.defaultPrevented && !ev.isComposing && !ev.shiftKey && !ev.ctrlKey && !ev.altKey && !ev.metaKey;
}

/** The form's default button: its first submit button, native or `kern-button type="submit"`. */
function defaultButton(form: HTMLFormElement): HTMLElement | undefined {
  return Array.from(form.elements as ArrayLike<Element>).find((el) => {
    const type: string = (el as HTMLButtonElement).type;
    return type === 'submit' || (type === 'image' && el.localName === 'input');
  }) as HTMLElement | undefined;
}

/** Submits the field's form on Enter, as the browser does for native fields. Returns whether it tried. */
export function implicitSubmit(field: ImplicitSubmitter, ev: KeyboardEvent): boolean {
  if (!isSubmitKey(ev) || field.noImplicitSubmit || field.readonly || fieldDisabled(field)) return false;
  const form = field.internals?.form;
  if (!form) return false;
  const button = defaultButton(form);
  if (!button) form.requestSubmit();
  // A native button ignores the click while disabled and submits with itself as submitter.
  else if (button.localName === 'button' || button.localName === 'input') button.click();
  else if (!button.matches(':disabled') && !button.hasAttribute('busy')) form.requestSubmit();
  return true;
}
