import { fieldDisabled, type FormDisableable } from './form-disabled';

/**
 * Implicit submission for single-line fields: Enter in a native text field submits its form, but the input of a Kern
 * field sits in the shadow DOM and belongs to no form (#155). The field calls `implicitSubmit(this, ev)` from its
 * keydown handler after it has applied typed text, so value and validity are current.
 *
 * Like the browser, the submit is the default action of the key: it runs after the event has reached every listener
 * (on the host, the form, the document), so any of them can stop it with `preventDefault()`. It then activates the
 * form's default button (its first submit button in document order) as a click would, which does nothing while that
 * button is disabled or busy; without a submit button it calls `form.requestSubmit()`. Both run constraint
 * validation and fire `submit`. The field's `no-implicit-submit` turns it off.
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

const isSubmitButton = (el: Element) => {
  const type: string = (el as HTMLButtonElement).type;
  return type === 'submit' || (type === 'image' && el.localName === 'input');
};

/**
 * The form's default button: its first submit button in document order, native, `kern-button type="submit"` or
 * `<input type="image">`. Image inputs are not in `form.elements`, so they are looked up in the form's tree,
 * including those tied to it with `form="…"`.
 */
export function defaultButton(form: HTMLFormElement): HTMLElement | undefined {
  const root = form.getRootNode?.() as ParentNode | undefined;
  const images = Array.from(root?.querySelectorAll?.('input[type="image"]') ?? []).filter((el) => (el as HTMLInputElement).form === form);
  // form.elements is in document order already; only image inputs need sorting in.
  const buttons = Array.from(form.elements as ArrayLike<Element>).filter(isSubmitButton);
  if (images.length) {
    buttons.push(...images);
    buttons.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
  }
  return buttons[0] as HTMLElement | undefined;
}

/**
 * Activates a button like a click. `kern-button` is clicked on its inner button, so the click reaches the host's
 * listeners and the component's own checks (disabled, busy) apply.
 */
function activate(button: HTMLElement) {
  const inner = button.localName === 'kern-button' ? button.shadowRoot?.querySelector('button') : null;
  (inner ?? button).click();
}

/** On Enter, submits the field's form once the event has been handled, as the browser does for native fields. */
export function implicitSubmit(field: ImplicitSubmitter, ev: KeyboardEvent): void {
  if (!isSubmitKey(ev)) return;
  setTimeout(() => {
    if (ev.defaultPrevented || field.noImplicitSubmit || field.readonly || fieldDisabled(field)) return;
    const form = field.internals?.form;
    if (!form) return;
    const button = defaultButton(form);
    // A disabled button ignores the click.
    if (button) activate(button);
    else form.requestSubmit();
  });
}
