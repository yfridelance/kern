import { Component, Element, Event, EventEmitter, Host, Listen, Method, Prop, State, h } from '@stencil/core';
import { positionPopup } from '../../utils/popover';

type Item = HTMLElement & { value?: string; disabled?: boolean };

/**
 * Action menu behind a trigger (e.g. a „⋯“ kern-button): kern-menu-item children, `<hr>` as separator. Opens on click,
 * Enter, Space or Arrow Down (Arrow Up starts at the end); Arrow keys, Home/End and letters move, Enter picks, Escape
 * or Tab closes. Picking emits `kernSelect` and returns the focus to the trigger.
 *
 * @slot trigger - The element that opens the menu
 * @slot - kern-menu-item elements and `<hr>` separators
 * @part menu - The popover panel
 */
@Component({
  tag: 'kern-menu',
  styleUrl: 'kern-menu.css',
  shadow: true,
})
export class KernMenu {
  @Element() el!: HTMLElement;

  /** Which edges line up with the trigger. */
  @Prop() align: 'start' | 'end' = 'start';
  /** Accessible name of the menu (defaults to the trigger's text). */
  @Prop() label?: string;

  /** An item was picked. */
  @Event() kernSelect!: EventEmitter<{ value: string }>;

  @State() open = false;

  private popup?: HTMLElement;
  private wasOpen = false;
  private typed = '';
  private typedAt = 0;

  private get trigger(): HTMLElement | null {
    return (Array.from(this.el.children).find((c) => c.getAttribute('slot') === 'trigger') as HTMLElement | undefined) ?? null;
  }

  private get items(): Item[] {
    return Array.from(this.el.children).filter((c): c is Item => c.localName === 'kern-menu-item');
  }

  /** Focused element in the tree the items live in (the document, or a shadow root when nested in a component). */
  private get focused(): Element | null {
    return (this.el.getRootNode() as Document | ShadowRoot).activeElement ?? null;
  }

  private get enabled(): Item[] {
    return this.items.filter((i) => !(i.disabled ?? i.hasAttribute('disabled')));
  }

  componentDidLoad() {
    const p = this.popup;
    if (!p) return;
    p.setAttribute('popover', 'auto');
    p.addEventListener('toggle', (e) => this.onToggle(e as ToggleEvent));
    this.syncTrigger();
    const t = this.trigger;
    t?.addEventListener('pointerdown', () => (this.wasOpen = this.open));
    t?.addEventListener('click', this.onTriggerClick);
    t?.addEventListener('keydown', this.onTriggerKey);
  }

  /** Opens the menu and focuses the first item. */
  @Method()
  async show() {
    this.openMenu(0);
  }

  /** Closes the menu. */
  @Method()
  async hide() {
    this.closeMenu();
  }

  private syncTrigger() {
    const t = this.trigger;
    if (!t) return;
    t.setAttribute('aria-haspopup', 'menu');
    t.setAttribute('aria-expanded', this.open ? 'true' : 'false');
  }

  private focusItem: number | 'last' = 0;

  private openMenu(at: number | 'last') {
    if (this.open || !this.popup) return;
    this.focusItem = at;
    (this.popup as HTMLElement & { showPopover?: () => void }).showPopover?.();
  }

  private closeMenu(refocus = true) {
    if (!this.open) return;
    (this.popup as HTMLElement & { hidePopover?: () => void }).hidePopover?.();
    if (refocus) this.focusTrigger();
  }

  private focusTrigger() {
    const t = this.trigger as (HTMLElement & { setFocus?: () => Promise<void> }) | null;
    if (t?.setFocus) t.setFocus();
    else t?.focus();
  }

  private onToggle(e: ToggleEvent) {
    this.open = e.newState === 'open';
    this.syncTrigger();
    if (this.open) {
      this.position();
      window.addEventListener('scroll', this.reposition, true);
      window.addEventListener('resize', this.reposition);
      const list = this.enabled;
      requestAnimationFrame(() => (this.focusItem === 'last' ? list[list.length - 1] : list[0])?.focus());
    } else {
      window.removeEventListener('scroll', this.reposition, true);
      window.removeEventListener('resize', this.reposition);
      // Light dismiss (Escape, click outside) while focus was inside: give it back to the trigger.
      const f = this.focused;
      if (this.items.some((i) => i === f || i.contains(f))) this.focusTrigger();
    }
  }

  private reposition = () => this.position();

  private position() {
    const t = this.trigger;
    if (t && this.popup) positionPopup(t, this.popup, { maxHeight: 360, align: this.align });
  }

  private onTriggerClick = () => {
    // A click while open first light-dismisses the popover; do not reopen it.
    if (this.wasOpen) {
      this.wasOpen = false;
      return;
    }
    this.openMenu(0);
  };

  private onTriggerKey = (ev: KeyboardEvent) => {
    if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
      ev.preventDefault();
      this.wasOpen = false;
      this.openMenu(ev.key === 'ArrowUp' ? 'last' : 0);
    }
  };

  @Listen('kernMenuItemSelect')
  onItemSelect(ev: CustomEvent<{ value: string }>) {
    ev.stopPropagation();
    this.closeMenu();
    this.kernSelect.emit({ value: ev.detail.value });
  }

  private onMenuKey = (ev: KeyboardEvent) => {
    const list = this.enabled;
    if (!list.length) return;
    const f = this.focused;
    const i = list.findIndex((it) => it === f || it.contains(f));
    const moves: Record<string, number> = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: list.length - 1 };
    if (ev.key in moves) {
      ev.preventDefault();
      list[(moves[ev.key] + list.length) % list.length].focus();
    } else if (ev.key === 'Tab') {
      this.closeMenu(false);
    } else if (ev.key.length === 1 && /\S/.test(ev.key) && !ev.ctrlKey && !ev.metaKey && !ev.altKey) {
      // Type-ahead on the item text.
      const now = Date.now();
      this.typed = now - this.typedAt > 700 ? ev.key : this.typed + ev.key;
      this.typedAt = now;
      const q = this.typed.toLowerCase();
      for (let n = 1; n <= list.length; n++) {
        const it = list[(i + (this.typed.length === 1 ? n : n - 1) + list.length) % list.length];
        if ((it.textContent ?? '').trim().toLowerCase().startsWith(q)) {
          it.focus();
          break;
        }
      }
    }
  };

  render() {
    return (
      <Host>
        <slot name="trigger" />
        <div ref={(el) => (this.popup = el)} class="menu" part="menu" role="menu" aria-label={this.label ?? this.trigger?.textContent?.trim()} onKeyDown={this.onMenuKey}>
          <slot />
        </div>
      </Host>
    );
  }
}
