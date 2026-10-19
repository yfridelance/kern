import { Component, Element, Host, Prop, State, Watch, h } from '@stencil/core';

let nextId = 0;

/**
 * Short hint for a control or an abbreviated value, shown on hover (after `delay`) and immediately on keyboard focus;
 * Escape hides it. Wrap the trigger (`<kern-tooltip text="Neustart"><kern-button …></kern-tooltip>`) or point at it
 * with `for="id"`. The trigger gets `aria-describedby` to a hidden copy of the text. Not for essential information:
 * touch devices never see it.
 *
 * @slot - The trigger (when `for` is not used)
 * @part tooltip - The bubble
 */
@Component({
  tag: 'kern-tooltip',
  styleUrl: 'kern-tooltip.css',
  shadow: true,
})
export class KernTooltip {
  @Element() el!: HTMLElement;

  @Prop() text = '';
  /** Id of the trigger in the same document, instead of wrapping it. */
  @Prop() for?: string;
  /** Preferred side; flips when there is no room. */
  @Prop() placement: 'top' | 'bottom' = 'top';
  /** Hover delay in milliseconds. */
  @Prop() delay = 400;
  @Prop() disabled = false;

  @State() open = false;

  private popup?: HTMLElement;
  private trigger?: HTMLElement | null;
  private timer?: ReturnType<typeof setTimeout>;
  private descId = `kern-tooltip-${++nextId}`;
  private desc?: HTMLSpanElement;

  connectedCallback() {
    // Hidden copy of the text in the light DOM: aria-describedby cannot point into a shadow root.
    this.desc = document.createElement('span');
    this.desc.id = this.descId;
    this.desc.hidden = true;
    this.desc.slot = 'description';
    this.desc.textContent = this.text;
    this.el.appendChild(this.desc);
  }

  componentDidLoad() {
    this.popup?.setAttribute('popover', 'manual');
    this.attach();
  }

  disconnectedCallback() {
    this.detach();
    this.desc?.remove();
    clearTimeout(this.timer);
  }

  @Watch('text')
  onText() {
    if (this.desc) this.desc.textContent = this.text;
  }

  @Watch('for')
  attach() {
    this.detach();
    const t = this.for
      ? ((this.el.getRootNode() as Document | ShadowRoot).getElementById?.(this.for) ?? null)
      : (Array.from(this.el.children).find((c) => c !== this.desc) as HTMLElement | undefined) ?? null;
    this.trigger = t;
    if (!t) return;
    t.addEventListener('mouseenter', this.onEnter);
    t.addEventListener('mouseleave', this.onLeave);
    t.addEventListener('focusin', this.onFocus);
    t.addEventListener('focusout', this.onLeave);
    t.addEventListener('pointerdown', this.hide);
    const ids = (t.getAttribute('aria-describedby') ?? '').split(/\s+/).filter((id) => id && id !== this.descId);
    t.setAttribute('aria-describedby', [...ids, this.descId].join(' '));
  }

  private detach() {
    const t = this.trigger;
    if (!t) return;
    t.removeEventListener('mouseenter', this.onEnter);
    t.removeEventListener('mouseleave', this.onLeave);
    t.removeEventListener('focusin', this.onFocus);
    t.removeEventListener('focusout', this.onLeave);
    t.removeEventListener('pointerdown', this.hide);
    const ids = (t.getAttribute('aria-describedby') ?? '').split(/\s+/).filter((id) => id && id !== this.descId);
    if (ids.length) t.setAttribute('aria-describedby', ids.join(' '));
    else t.removeAttribute('aria-describedby');
    this.trigger = undefined;
  }

  private onEnter = () => {
    clearTimeout(this.timer);
    this.timer = setTimeout(this.show, this.delay);
  };

  private onFocus = () => {
    clearTimeout(this.timer);
    this.show();
  };

  private onLeave = () => {
    clearTimeout(this.timer);
    this.hide();
  };

  private show = () => {
    if (this.disabled || !this.text) return;
    this.open = true;
  };

  private hide = () => {
    clearTimeout(this.timer);
    this.open = false;
  };

  private onKey = (ev: KeyboardEvent) => {
    if (ev.key === 'Escape' && this.open) this.hide();
  };

  componentDidRender() {
    const p = this.popup as (HTMLElement & { showPopover?: () => void; hidePopover?: () => void; matches(s: string): boolean }) | undefined;
    if (!p) return;
    let isOpen = false;
    try {
      isOpen = p.matches(':popover-open');
    } catch {
      // no popover support (test DOM)
    }
    if (this.open && !isOpen) {
      p.showPopover?.();
      this.position();
      document.addEventListener('keydown', this.onKey);
      window.addEventListener('scroll', this.hide, true);
    } else if (!this.open && isOpen) {
      p.hidePopover?.();
    }
    if (!this.open) {
      document.removeEventListener('keydown', this.onKey);
      window.removeEventListener('scroll', this.hide, true);
    }
  }

  /** Centered above (or below) the trigger, flipped when there is no room, kept inside the viewport. */
  private position() {
    const t = this.trigger;
    const p = this.popup;
    if (!t || !p) return;
    const r = t.getBoundingClientRect();
    const gap = 6;
    const w = p.offsetWidth;
    const hgt = p.offsetHeight;
    const roomTop = r.top - gap - 8 >= hgt;
    const roomBottom = window.innerHeight - r.bottom - gap - 8 >= hgt;
    const top = this.placement === 'top' ? roomTop || !roomBottom : !roomBottom && roomTop;
    p.style.left = `${Math.max(8, Math.min(r.left + r.width / 2 - w / 2, window.innerWidth - w - 8))}px`;
    p.style.top = `${top ? r.top - gap - hgt : r.bottom + gap}px`;
    p.dataset.side = top ? 'top' : 'bottom';
  }

  render() {
    return (
      <Host>
        <slot />
        <div ref={(el) => (this.popup = el)} class={{ tooltip: true, open: this.open }} part="tooltip" role="tooltip" aria-hidden="true">
          {this.text}
        </div>
      </Host>
    );
  }
}
