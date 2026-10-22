type Focusable = HTMLElement & { componentOnReady?: () => Promise<unknown>; setFocus?: () => Promise<void> };

/**
 * Moves the focus to the first `[autofocus]` element in the light DOM of a modal `host` (body and footer, also nested),
 * after its native `<dialog>` opened. The dialog focusing steps of the browser only find native controls: a custom
 * element with `delegatesFocus` is skipped, so the focus would land on the close button. Native elements are left to
 * the browser. A field that is not hydrated yet is awaited; the focus moves only while `isOpen()` still holds.
 */
export async function focusAutofocus(host: HTMLElement, isOpen: () => boolean) {
  // Fields of a nested modal belong to that one.
  const target = Array.from(host.querySelectorAll<Focusable>('[autofocus]')).find((el) => el.parentElement?.closest('kern-dialog, kern-drawer') === host);
  if (!target || !target.localName.includes('-')) return;
  const registry = typeof customElements !== 'undefined' ? customElements : undefined;
  if (!target.componentOnReady && !target.setFocus && registry && !registry.get(target.localName)) await registry.whenDefined(target.localName);
  await target.componentOnReady?.();
  if (!isOpen()) return;
  if (target.setFocus) await target.setFocus();
  else target.focus();
}
