/** Detail of `kernNavigate`: the `href` as written on the element and the click that triggered it. */
export interface KernNavigateDetail {
  href: string;
  event: MouseEvent;
}

/**
 * True for a plain left click that the browser would follow in the same tab: no modifier keys, no `download` and
 * `target` empty or `_self`. Ctrl/Cmd/middle click and "open in new tab" stay with the browser.
 */
export function isPlainNavigation(ev: MouseEvent, target?: string, download?: string | boolean): boolean {
  if (ev.button !== 0 || ev.ctrlKey || ev.metaKey || ev.shiftKey || ev.altKey) return false;
  if (download !== undefined && download !== false && download !== null) return false;
  return !target || target === '_self';
}
