/**
 * Places a fixed popover below its anchor, or above when there is not enough room, inside the viewport.
 * `matchWidth` makes it at least as wide as the anchor (lists); `maxHeight` caps it (scrolling lists).
 */
export function positionPopup(anchor: HTMLElement, popup: HTMLElement, opts: { matchWidth?: boolean; maxHeight?: number } = {}) {
  const r = anchor.getBoundingClientRect();
  const gap = 4;
  const below = window.innerHeight - r.bottom - gap - 8;
  const above = r.top - gap - 8;
  // Scrolling lists need ~200px below, fixed-size panels (calendar) their full height.
  const needed = opts.maxHeight ? Math.min(200, popup.offsetHeight || 200) : popup.offsetHeight;
  const up = below < needed && above > below;
  const width = opts.matchWidth ? r.width : 0;
  if (opts.matchWidth) {
    popup.style.minWidth = `${r.width}px`;
    popup.style.maxWidth = `${Math.max(r.width, window.innerWidth - 16)}px`;
  }
  if (opts.maxHeight) popup.style.maxHeight = `${Math.max(120, Math.min(opts.maxHeight, up ? above : below))}px`;
  popup.style.left = `${Math.max(8, Math.min(r.left, window.innerWidth - Math.max(width, popup.offsetWidth) - 8))}px`;
  if (up) {
    popup.style.top = 'auto';
    popup.style.bottom = `${window.innerHeight - r.top + gap}px`;
  } else {
    popup.style.bottom = 'auto';
    popup.style.top = `${r.bottom + gap}px`;
  }
}
