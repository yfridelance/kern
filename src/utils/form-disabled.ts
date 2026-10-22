/**
 * Disabled state of a form-associated component.
 *
 * `disabled` is the author's own (reflected) prop. `formDisabled` is a `@State()` set only by `formDisabledCallback`
 * when a disabled `<fieldset>` (or form) locks the field. The callback must not write `disabled`: the reflected
 * attribute would lock the host on its own, so the browser would not call the callback again when the fieldset is
 * enabled, and the field would stay disabled (#151).
 *
 * Use `fieldDisabled(this)` wherever the component asks whether it is disabled; style with `:host(:disabled)`, which
 * matches both cases.
 */
export interface FormDisableable {
  disabled: boolean;
  formDisabled: boolean;
}

/** The field is disabled by its own `disabled` or by a disabled fieldset or form. */
export function fieldDisabled(c: FormDisableable): boolean {
  return !!c.disabled || !!c.formDisabled;
}
