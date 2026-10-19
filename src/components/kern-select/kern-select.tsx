import { AttachInternals, Component, Element, Event, EventEmitter, Host, Method, Prop, State, Watch, h } from '@stencil/core';
import { Icon } from '../../utils/icons';
import { optionOf } from '../../utils/options';
import { positionPopup } from '../../utils/popover';

let nextId = 0;

export interface KernOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/**
 * Labelled single choice with its own dropdown list, form-associated. Options come from the `options`
 * property or from child `<option>` elements (kept in sync, so `@for` / `*ngFor` over options works).
 * Elements in the `footer` slot appear below the list, e.g. a button "Standorte bearbeiten"; clicking
 * one closes the list.
 *
 * Keyboard: Enter, Space or Arrow keys open; Arrow keys, Home, End and typing a letter move; Enter
 * or Space picks; Escape closes; Tab moves on to the footer.
 *
 * @slot - `<option>` elements (read, not shown)
 * @slot footer - Actions below the list (kern-button variant="ghost" size="sm")
 * @part control - The trigger button
 * @part listbox - The dropdown panel
 * @part option - Each option
 */
@Component({
  tag: 'kern-select',
  styleUrl: 'kern-select.css',
  shadow: { delegatesFocus: true },
  formAssociated: true,
})
export class KernSelect {
  @Element() el!: HTMLElement;
  @AttachInternals() internals!: ElementInternals;

  @Prop() label?: string;
  @Prop() hint?: string;
  @Prop() error?: string;
  @Prop({ mutable: true }) value = '';
  @Prop() name?: string;
  /** Takes precedence over child `<option>` elements. */
  @Prop() options?: KernOption[];
  /** Shown when no option is selected. */
  @Prop() placeholder?: string;
  @Prop({ reflect: true }) size: 'md' | 'sm' = 'md';
  @Prop({ reflect: true }) disabled = false;
  @Prop() required = false;
  /** Accessible name when there is no visible label. */
  @Prop() ariaLabelText?: string;

  /** When the user picks an option. */
  @Event() kernChange!: EventEmitter<{ value: string }>;

  @State() childOptions: KernOption[] = [];
  @State() open = false;
  @State() active = -1;
  @State() hasFooter = false;

  private trigger?: HTMLButtonElement;
  private popup?: HTMLElement;
  private listbox?: HTMLElement;
  private observer?: MutationObserver;
  private id = `kern-select-${++nextId}`;
  private initial = '';
  private wasOpen = false;
  private typed = '';
  private typedAt = 0;

  connectedCallback() {
    this.readChildren();
    if (typeof MutationObserver === 'undefined') return; // server-side / test DOM
    this.observer = new MutationObserver(() => this.readChildren());
    this.observer.observe(this.el, { childList: true, subtree: true, characterData: true, attributes: true });
  }

  disconnectedCallback() {
    this.observer?.disconnect();
    this.stopTracking();
  }

  componentWillLoad() {
    this.initial = this.value ?? '';
    this.hasFooter = Array.from(this.el.children).some((c) => c.getAttribute('slot') === 'footer');
  }

  componentDidLoad() {
    this.sync();
    const p = this.popup;
    if (!p) return;
    p.setAttribute('popover', 'auto');
    p.addEventListener('toggle', (e) => this.onToggle(e as ToggleEvent));
  }

  private readChildren() {
    const opts = Array.from(this.el.children).filter((c) => c.localName === 'option');
    this.childOptions = opts.map((o) => optionOf(o));
    const selected = opts.find((o) => o.hasAttribute('selected'));
    if (selected && !this.value) this.value = optionOf(selected).value;
    if (!this.value && !this.options && !this.placeholder && this.childOptions.length) this.value = this.childOptions[0].value;
  }

  private get list(): KernOption[] {
    return this.options ?? this.childOptions;
  }

  @Watch('value')
  @Watch('error')
  sync() {
    this.internals?.setFormValue?.(this.value ?? '');
    if (this.error) this.internals?.setValidity?.({ customError: true }, this.error, this.trigger);
    else if (this.required && !this.value) this.internals?.setValidity?.({ valueMissing: true }, 'required', this.trigger);
    else this.internals?.setValidity?.({});
  }

  formResetCallback() {
    this.value = this.initial;
  }

  formDisabledCallback(disabled: boolean) {
    this.disabled = disabled;
  }

  @Method()
  async setFocus() {
    this.trigger?.focus();
  }

  /** Opens the dropdown. */
  @Method()
  async show() {
    this.openList();
  }

  /** Closes the dropdown. */
  @Method()
  async hide() {
    this.closeList();
  }

  // ---------- open / close ----------

  private openList() {
    if (this.disabled || this.open || !this.popup) return;
    const i = this.list.findIndex((o) => o.value === this.value);
    this.active = i >= 0 ? i : this.step(-1, 1);
    this.position();
    (this.popup as HTMLElement & { showPopover?: () => void }).showPopover?.();
  }

  private closeList(refocus = true) {
    if (!this.open) return;
    (this.popup as HTMLElement & { hidePopover?: () => void }).hidePopover?.();
    if (refocus) this.trigger?.focus();
  }

  private onToggle(e: ToggleEvent) {
    this.open = e.newState === 'open';
    if (this.open) {
      this.position();
      this.startTracking();
      requestAnimationFrame(() => {
        this.listbox?.focus();
        this.scrollActive();
      });
    } else {
      this.stopTracking();
      // Light dismiss (Escape, click outside) while focus was inside: give it back to the trigger.
      const focused = this.el.shadowRoot?.activeElement;
      if (focused && this.popup?.contains(focused)) this.trigger?.focus();
    }
  }

  private reposition = () => this.position();

  private startTracking() {
    window.addEventListener('scroll', this.reposition, true);
    window.addEventListener('resize', this.reposition);
  }

  private stopTracking() {
    window.removeEventListener('scroll', this.reposition, true);
    window.removeEventListener('resize', this.reposition);
  }

  private position() {
    if (this.trigger && this.popup) positionPopup(this.trigger, this.popup, { matchWidth: true, maxHeight: 360 });
  }

  // ---------- selection ----------

  private pick(i: number) {
    const o = this.list[i];
    if (!o || o.disabled) return;
    if (o.value !== this.value) {
      this.value = o.value;
      this.kernChange.emit({ value: this.value });
    }
    this.closeList();
  }

  /** Next enabled index from `from` in direction `dir`, or `from` when there is none. */
  private step(from: number, dir: 1 | -1): number {
    const l = this.list;
    for (let i = from + dir; i >= 0 && i < l.length; i += dir) if (!l[i].disabled) return i;
    return from;
  }

  private scrollActive() {
    const el = this.listbox?.querySelector<HTMLElement>(`#${this.id}-opt-${this.active}`);
    el?.scrollIntoView?.({ block: 'nearest' });
  }

  private moveTo(i: number) {
    this.active = i;
    requestAnimationFrame(() => this.scrollActive());
  }

  /** Index of the next option whose label starts with what was typed in the last 0.7 s, or -1. */
  private typeahead(key: string): number {
    const now = Date.now();
    this.typed = now - this.typedAt > 700 ? key : this.typed + key;
    this.typedAt = now;
    const l = this.list;
    const q = this.typed.toLowerCase();
    const start = this.typed.length === 1 ? this.active + 1 : Math.max(this.active, 0);
    for (let n = 0; n < l.length; n++) {
      const i = (start + n) % l.length;
      if (!l[i].disabled && l[i].label.toLowerCase().startsWith(q)) return i;
    }
    return -1;
  }

  private isPrintable(ev: KeyboardEvent): boolean {
    return ev.key.length === 1 && ev.key !== ' ' && !ev.ctrlKey && !ev.metaKey && !ev.altKey;
  }

  // ---------- events ----------

  private onTriggerPointerDown = () => {
    this.wasOpen = this.open;
  };

  private onTriggerClick = () => {
    // A click on the trigger while open first light-dismisses the popover; do not reopen it.
    if (this.wasOpen) {
      this.wasOpen = false;
      return;
    }
    this.openList();
  };

  private onTriggerKey = (ev: KeyboardEvent) => {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(ev.key)) {
      ev.preventDefault();
      this.wasOpen = false;
      this.openList();
    } else if (this.isPrintable(ev)) {
      // Type to pick without opening, like a native select.
      const i = this.typeahead(ev.key);
      if (i >= 0) {
        this.active = i;
        const o = this.list[i];
        if (o.value !== this.value) {
          this.value = o.value;
          this.kernChange.emit({ value: this.value });
        }
      }
    }
  };

  private onListKey = (ev: KeyboardEvent) => {
    const l = this.list;
    switch (ev.key) {
      case 'ArrowDown':
        ev.preventDefault();
        this.moveTo(this.step(this.active, 1));
        break;
      case 'ArrowUp':
        ev.preventDefault();
        this.moveTo(this.step(this.active, -1));
        break;
      case 'Home':
        ev.preventDefault();
        this.moveTo(this.step(-1, 1));
        break;
      case 'End':
        ev.preventDefault();
        this.moveTo(this.step(l.length, -1));
        break;
      case 'Enter':
      case ' ':
        ev.preventDefault();
        this.pick(this.active);
        break;
      default:
        if (this.isPrintable(ev)) {
          const i = this.typeahead(ev.key);
          if (i >= 0) this.moveTo(i);
        }
    }
  };

  private onPopupFocusOut = (ev: FocusEvent) => {
    const next = ev.relatedTarget as Node | null;
    if (!next || this.popup?.contains(next) || this.el.contains(next)) return;
    this.closeList(false);
  };

  private onFooterClick = () => this.closeList(false);

  render() {
    const list = this.list;
    const selected = list.find((o) => o.value === this.value);
    const describedBy = this.error ? `${this.id}-error` : this.hint ? `${this.id}-hint` : undefined;
    const listId = `${this.id}-list`;
    return (
      <Host invalid={!!this.error}>
        {this.label && (
          <label class="label" htmlFor={this.id}>
            {this.label}
            {this.required && <span class="req" aria-hidden="true">*</span>}
          </label>
        )}
        <button
          ref={(el) => (this.trigger = el)}
          id={this.id}
          type="button"
          class={{ control: true, trigger: true, empty: !selected }}
          part="control"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={this.open ? 'true' : 'false'}
          aria-controls={listId}
          aria-label={this.label ? undefined : this.ariaLabelText}
          aria-invalid={this.error ? 'true' : undefined}
          aria-describedby={describedBy}
          disabled={this.disabled}
          onPointerDown={this.onTriggerPointerDown}
          onClick={this.onTriggerClick}
          onKeyDown={this.onTriggerKey}
        >
          <span class="value">{selected ? selected.label : (this.placeholder ?? '')}</span>
          <Icon name="chevron-down" class="chevron" />
        </button>
        <div ref={(el) => (this.popup = el)} class="popup" part="listbox" onFocusout={this.onPopupFocusOut}>
          <div
            ref={(el) => (this.listbox = el)}
            id={listId}
            class="listbox"
            role="listbox"
            tabIndex={-1}
            aria-label={this.label ?? this.ariaLabelText}
            aria-activedescendant={this.active >= 0 ? `${this.id}-opt-${this.active}` : undefined}
            onKeyDown={this.onListKey}
          >
            {list.map((o, i) => (
              <div
                id={`${this.id}-opt-${i}`}
                class={{ option: true, active: i === this.active, selected: o.value === this.value }}
                part="option"
                role="option"
                aria-selected={o.value === this.value ? 'true' : 'false'}
                aria-disabled={o.disabled ? 'true' : undefined}
                onPointerMove={() => {
                  if (!o.disabled && i !== this.active) this.active = i;
                }}
                onClick={() => this.pick(i)}
              >
                <span class="text">{o.label}</span>
                {o.value === this.value && <Icon name="check" class="check" />}
              </div>
            ))}
          </div>
          <div class="footer" hidden={!this.hasFooter} onClick={this.onFooterClick}>
            <slot name="footer" onSlotchange={(e) => (this.hasFooter = (e.target as HTMLSlotElement).assignedElements().length > 0)} />
          </div>
        </div>
        {this.error ? (
          <span class="error" id={`${this.id}-error`}>
            {this.error}
          </span>
        ) : (
          this.hint && (
            <span class="hint" id={`${this.id}-hint`}>
              {this.hint}
            </span>
          )
        )}
        <div hidden>
          <slot />
        </div>
      </Host>
    );
  }
}
