import type { KernToastReason } from '../components/kern-toast/kern-toast';

export interface ToastOptions {
  message: string;
  heading?: string;
  tone?: 'neutral' | 'info' | 'ok' | 'warn' | 'danger';
  /** Text of an optional action, e.g. „Rückgängig“; resolves with `'action'` when clicked. */
  actionLabel?: string;
  /** Milliseconds until it closes itself; 0 keeps it until closed. Default 5000. */
  duration?: number;
  closeLabel?: string;
}

/** At most this many toasts at once; the oldest closes first. */
const MAX = 4;
let region: HTMLElement | undefined;
let regionLabel = 'Benachrichtigungen';

/**
 * Accessible name of the toast region (default „Benachrichtigungen“). Global, because all toasts share one region:
 * call it once at start and again when the language changes; an existing region is updated at once.
 */
export function setToastRegionLabel(label: string): void {
  regionLabel = label;
  if (region?.isConnected) region.setAttribute('aria-label', label);
}

/** The stack at the bottom right: a live region in the top layer, created on first use. */
function getRegion(): HTMLElement {
  if (region?.isConnected) return region;
  region = document.createElement('div');
  region.className = 'kern-toasts';
  region.setAttribute('role', 'region');
  region.setAttribute('aria-label', regionLabel);
  region.setAttribute('aria-live', 'polite');
  region.setAttribute('popover', 'manual');
  Object.assign(region.style, {
    position: 'fixed',
    inset: 'auto 16px 16px auto',
    margin: '0',
    padding: '0',
    border: '0',
    background: 'none',
    overflow: 'visible',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    width: 'min(380px, calc(100vw - 32px))',
  });
  document.body.appendChild(region);
  return region;
}

/** Bring the stack to the front, above dialogs opened after it. */
function raise(el: HTMLElement) {
  const p = el as HTMLElement & { showPopover?: () => void; hidePopover?: () => void };
  try {
    if (el.matches(':popover-open')) p.hidePopover?.();
    p.showPopover?.();
  } catch {
    // no popover support: stays a fixed element
  }
}

/**
 * Shows a kern-toast at the bottom right. Resolves when it closes with the reason: `'timeout'`, `'close'` or
 * `'action'`. Requires the Kern components to be defined (loader or custom-elements build).
 */
export function toast(opts: ToastOptions | string): Promise<KernToastReason> {
  const o: ToastOptions = typeof opts === 'string' ? { message: opts } : opts;
  return new Promise((resolve) => {
    const stack = getRegion();
    const el = document.createElement('kern-toast') as HTMLElement & { tone: string; heading?: string; actionLabel?: string; duration: number; closeLabel: string; close(r?: KernToastReason): Promise<void> };
    el.tone = o.tone ?? 'neutral';
    if (o.heading) el.heading = o.heading;
    if (o.actionLabel) el.actionLabel = o.actionLabel;
    el.duration = o.duration ?? 5000;
    if (o.closeLabel) el.closeLabel = o.closeLabel;
    el.textContent = o.message;
    el.addEventListener('kernClose', (e) => {
      resolve((e as CustomEvent<{ reason: KernToastReason }>).detail.reason);
      el.remove();
      if (!stack.children.length) {
        try {
          (stack as HTMLElement & { hidePopover?: () => void }).hidePopover?.();
        } catch {
          // ignore
        }
      }
    });
    stack.appendChild(el);
    const toasts = Array.from(stack.children) as (typeof el)[];
    toasts.slice(0, Math.max(0, toasts.length - MAX)).forEach((t) => t.close?.('close'));
    raise(stack);
  });
}
