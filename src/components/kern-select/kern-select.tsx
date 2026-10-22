import { AttachInternals, Component, Element, Event, EventEmitter, Host, Method, Prop, State, Watch, h } from '@stencil/core';
import { fieldDisabled } from '../../utils/form-disabled';
import { Icon } from '../../utils/icons';
import type { IconName } from '../../utils/icon-names';
import { optionOf } from '../../utils/options';
import { positionPopup } from '../../utils/popover';
import { kernTexts } from '../../utils/i18n';

let nextId = 0;
/** Up to this many options size the trigger by the longest one; beyond that the hidden copies would bloat the DOM of long searchable lists. */
const SIZER_MAX = 100;

export interface KernOption {
  value: string;
  label: string;
  disabled?: boolean;
  /** Icon before the label, e.g. a flag (`flag-ch`); from `data-icon` on an `<option>`. */
  icon?: IconName;
  /** Accessible name when the label alone says too little, e.g. «Deutsch» for «DE»; from `aria-label`. */
  ariaLabel?: string;
  /** Language of the label, e.g. for language names; from `lang`. */
  lang?: string;
}

/**
 * Labelled choice with its own dropdown list, form-associated. Options come from the `options`
 * property or from child `<option>` elements (kept in sync, so `@for` / `*ngFor` over options works).
 * Elements in the `footer` slot appear below the list, e.g. a button "Standorte bearbeiten"; clicking
 * one closes the list.
 *
 * `searchable` adds a search field to the list (filters by label). `multiple` makes `value` a `string[]`: the field
 * shows chips (× removes, Backspace removes the last), the list stays open and toggles options; the form gets one
 * entry per value.
 *
 * Keyboard: Enter, Space or Arrow keys open; Arrow keys, Home, End and typing a letter move; Enter
 * or Space picks; Escape closes; Tab moves on to the footer.
 *
 * @slot - `<option>` elements (read, not shown)
 * @slot footer - Actions below the list (kern-button variant="ghost" size="sm")
 * @part control - The trigger
 * @part listbox - The dropdown panel
 * @part option - Each option
 * @part chip - Each chip (multiple)
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
  /** The picked value; with `multiple` a `string[]` (a comma-separated attribute is accepted). */
  @Prop({ mutable: true }) value: string | string[] = '';
  @Prop() name?: string;
  /** Takes precedence over child `<option>` elements. */
  @Prop() options?: KernOption[];
  /** Shown when no option is selected. */
  @Prop() placeholder?: string;
  /** Search field in the list; filters options by label. */
  @Prop() searchable = false;
  /** Several values; `value` becomes a `string[]`. */
  @Prop({ reflect: true }) multiple = false;
  @Prop({ reflect: true }) size: 'md' | 'sm' = 'md';
  @Prop({ reflect: true }) disabled = false;
  /** Set by a disabled fieldset or form; `disabled` stays the author's own. */
  @State() formDisabled = false;
  @Prop() required = false;
  /** Accessible name when there is no visible label. */
  @Prop() ariaLabelText?: string;
  @Prop() labelSearch?: string;
  @Prop() labelNoResults?: string;
  /** Accessible name of a chip's ×; `{label}` is replaced. */
  @Prop() labelRemove?: string;
  private t = kernTexts(this, 'kern-select');

  /** When the user picks (or, with `multiple`, toggles) an option. */
  @Event() kernChange!: EventEmitter<{ value: string | string[] }>;

  @State() childOptions: KernOption[] = [];
  @State() open = false;
  @State() active = -1;
  @State() hasFooter = false;
  @State() query = '';

  private trigger?: HTMLElement;
  private popup?: HTMLElement;
  private listbox?: HTMLElement;
  private search?: HTMLInputElement;
  private observer?: MutationObserver;
  private uid = `kern-select-${++nextId}`;
  private initial: string | string[] = '';
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
    this.initial = this.multiple ? [...this.values] : ((this.value as string) ?? '');
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
    const selected = opts.filter((o) => o.hasAttribute('selected')).map((o) => optionOf(o).value);
    if (this.multiple) {
      if (selected.length && !this.values.length) this.value = selected;
      return;
    }
    if (selected.length && !this.value) this.value = selected[0];
    if (!this.value && !this.options && !this.placeholder && this.childOptions.length) this.value = this.childOptions[0].value;
  }

  private get list(): KernOption[] {
    return this.options ?? this.childOptions;
  }

  /** Selected values as an array (also for single choice). */
  private get values(): string[] {
    const v = this.value;
    if (Array.isArray(v)) return v;
    if (!v) return [];
    return this.multiple ? v.split(',').map((s) => s.trim()).filter(Boolean) : [v];
  }

  private isSelected(o: KernOption): boolean {
    return this.values.includes(o.value);
  }

  /** Indices of options matching the search. */
  private get visible(): Set<number> {
    const q = this.query.trim().toLowerCase();
    return new Set(this.list.map((o, i) => (!q || o.label.toLowerCase().includes(q) ? i : -1)).filter((i) => i >= 0));
  }

  @Watch('value')
  @Watch('error')
  @Watch('required')
  sync() {
    if (this.multiple && typeof this.value === 'string') {
      // Attribute or form reset with a string: keep the property an array.
      this.value = this.values;
      return;
    }
    const vals = this.values;
    if (this.multiple) {
      let data: FormData | null = null;
      if (this.name && vals.length && typeof FormData !== 'undefined') {
        data = new FormData();
        vals.forEach((v) => data!.append(this.name!, v));
      }
      this.internals?.setFormValue?.(data);
    } else {
      this.internals?.setFormValue?.((this.value as string) ?? '');
    }
    if (this.error) this.internals?.setValidity?.({ customError: true }, this.error, this.trigger);
    else if (this.required && !vals.length) this.internals?.setValidity?.({ valueMissing: true }, 'required', this.trigger);
    else this.internals?.setValidity?.({});
  }

  formResetCallback() {
    this.value = Array.isArray(this.initial) ? [...this.initial] : this.initial;
  }

  formDisabledCallback(disabled: boolean) {
    this.formDisabled = disabled;
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

  private openList(query = '') {
    if (fieldDisabled(this) || this.open || !this.popup) return;
    this.query = query;
    const vis = this.visible;
    const i = this.list.findIndex((o, idx) => this.isSelected(o) && vis.has(idx));
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
        if (this.searchable && this.search) {
          this.search.focus();
          const end = this.search.value.length;
          this.search.setSelectionRange(end, end);
        } else {
          this.listbox?.focus();
        }
        this.scrollActive();
      });
    } else {
      this.stopTracking();
      this.query = '';
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
    if (this.multiple) {
      // Toggle and keep the list open.
      const vals = this.values;
      this.value = vals.includes(o.value) ? vals.filter((v) => v !== o.value) : [...vals, o.value];
      this.kernChange.emit({ value: this.value });
      this.active = i;
      return;
    }
    if (o.value !== this.value) {
      this.value = o.value;
      this.kernChange.emit({ value: this.value });
    }
    this.closeList();
  }

  private removeValue(value: string) {
    if (fieldDisabled(this)) return;
    this.value = this.values.filter((v) => v !== value);
    this.kernChange.emit({ value: this.value });
  }

  /** Next enabled, visible index from `from` in direction `dir`, or `from` when there is none. */
  private step(from: number, dir: 1 | -1): number {
    const l = this.list;
    const vis = this.visible;
    for (let i = from + dir; i >= 0 && i < l.length; i += dir) if (!l[i].disabled && vis.has(i)) return i;
    return from;
  }

  private scrollActive() {
    const el = this.listbox?.querySelector<HTMLElement>(`#${this.uid}-opt-${this.active}`);
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

  /** Arrow keys and Enter shared by the list and the search field. */
  private navigate(ev: KeyboardEvent, homeEnd: boolean): boolean {
    const l = this.list;
    const moves: Record<string, () => number> = {
      ArrowDown: () => this.step(this.active, 1),
      ArrowUp: () => this.step(this.active, -1),
      ...(homeEnd ? { Home: () => this.step(-1, 1), End: () => this.step(l.length, -1) } : {}),
    };
    if (moves[ev.key]) {
      ev.preventDefault();
      this.moveTo(moves[ev.key]());
      return true;
    }
    if (ev.key === 'Enter') {
      ev.preventDefault();
      if (this.visible.has(this.active)) this.pick(this.active);
      return true;
    }
    return false;
  }

  // ---------- events ----------

  private onTriggerPointerDown = () => {
    this.wasOpen = this.open;
  };

  private onTriggerClick = (ev: MouseEvent) => {
    if ((ev.target as HTMLElement).closest?.('.chip-remove')) return;
    // A click on the trigger while open first light-dismisses the popover; do not reopen it.
    if (this.wasOpen) {
      this.wasOpen = false;
      return;
    }
    this.openList();
  };

  private onTriggerKey = (ev: KeyboardEvent) => {
    if (fieldDisabled(this)) return;
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(ev.key)) {
      ev.preventDefault();
      this.wasOpen = false;
      this.openList();
    } else if (this.multiple && ev.key === 'Backspace' && this.values.length) {
      ev.preventDefault();
      this.removeValue(this.values[this.values.length - 1]);
    } else if (this.isPrintable(ev)) {
      if (this.searchable) {
        // Start searching with the typed letter.
        ev.preventDefault();
        this.wasOpen = false;
        this.openList(ev.key);
        return;
      }
      if (this.multiple) return;
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
    if (this.navigate(ev, true)) return;
    if (ev.key === ' ') {
      ev.preventDefault();
      this.pick(this.active);
    } else if (this.isPrintable(ev)) {
      const i = this.typeahead(ev.key);
      if (i >= 0) this.moveTo(i);
    }
  };

  private onSearchInput = (ev: Event) => {
    this.query = (ev.target as HTMLInputElement).value;
    const first = this.step(-1, 1);
    this.active = this.visible.has(first) ? first : -1;
  };

  private onSearchKey = (ev: KeyboardEvent) => {
    this.navigate(ev, false);
  };

  private onPopupFocusOut = (ev: FocusEvent) => {
    const next = ev.relatedTarget as Node | null;
    if (!next || this.popup?.contains(next) || this.el.contains(next)) return;
    this.closeList(false);
  };

  private onFooterClick = () => this.closeList(false);

  private renderTriggerContent() {
    if (this.multiple) {
      const chosen = this.list.filter((o) => this.isSelected(o));
      return [
        <span class="chips">
          {chosen.length
            ? chosen.map((o) => (
                <span class="chip" part="chip">
                  {o.icon && <kern-icon name={o.icon} class="option-icon" />}
                  <span class="chip-label" lang={o.lang} aria-label={o.ariaLabel}>
                    {o.label}
                  </span>
                  <button
                    type="button"
                    class="chip-remove"
                    tabindex={-1}
                    aria-label={this.t('labelRemove').replace('{label}', o.label)}
                    title={this.t('labelRemove').replace('{label}', o.label)}
                    disabled={fieldDisabled(this)}
                    onClick={(e) => {
                      e.stopPropagation();
                      this.removeValue(o.value);
                    }}
                  >
                    <Icon name="close" />
                  </button>
                </span>
              ))
            : <span class="value">{this.placeholder ?? ''}</span>}
        </span>,
        <Icon name="chevron-down" class="chevron" />,
      ];
    }
    const list = this.list;
    const selected = list.find((o) => o.value === this.value);
    // Hidden copies of every option in the same grid cell keep the trigger as wide as the longest one.
    const sizers = list.length <= SIZER_MAX && [
      ...list.map((o) => (
        <span class="sizer" aria-hidden="true" lang={o.lang}>
          {o.icon && <kern-icon name={o.icon} class="option-icon" />}
          <span class="text">{o.label}</span>
        </span>
      )),
      this.placeholder && (
        <span class="sizer" aria-hidden="true">
          <span class="text">{this.placeholder}</span>
        </span>
      ),
    ];
    return [
      <span class="value">
        {sizers}
        <span class="current" lang={selected?.lang}>
          {selected?.icon && <kern-icon name={selected.icon} class="option-icon" />}
          <span class="text">{selected ? this.optionText(selected) : (this.placeholder ?? '')}</span>
        </span>
      </span>,
      <Icon name="chevron-down" class="chevron" />,
    ];
  }

  /** The label, or the label shown and the accessible name read when they differ (e.g. «DE» / «Deutsch»). */
  private optionText(o: KernOption) {
    if (!o.ariaLabel) return o.label;
    return [<span aria-hidden="true">{o.label}</span>, <span class="sr">{o.ariaLabel}</span>];
  }

  render() {
    const list = this.list;
    const vis = this.visible;
    const empty = !this.values.some((v) => list.some((o) => o.value === v));
    const describedBy = this.error ? `${this.uid}-error` : this.hint ? `${this.uid}-hint` : undefined;
    const listId = `${this.uid}-list`;
    const activeId = this.active >= 0 && vis.has(this.active) ? `${this.uid}-opt-${this.active}` : undefined;
    const triggerProps = {
      ref: (el?: HTMLElement) => (this.trigger = el),
      id: this.uid,
      class: { control: true, trigger: true, empty, multi: this.multiple },
      part: 'control',
      role: 'combobox',
      'aria-haspopup': 'listbox',
      'aria-expanded': this.open ? 'true' : 'false',
      'aria-controls': listId,
      'aria-label': this.label ? undefined : this.ariaLabelText,
      'aria-invalid': this.error ? 'true' : undefined,
      'aria-describedby': describedBy,
      onPointerDown: this.onTriggerPointerDown,
      onClick: this.onTriggerClick,
      onKeyDown: this.onTriggerKey,
    };
    return (
      <Host invalid={!!this.error}>
        {this.label && (
          <label class="label" htmlFor={this.uid}>
            {this.label}
            {this.required && <span class="req" aria-hidden="true">*</span>}
          </label>
        )}
        {this.multiple ? (
          // A div, not a button: the chips contain their own × buttons.
          <div {...triggerProps} tabindex={fieldDisabled(this) ? -1 : 0} aria-disabled={fieldDisabled(this) ? 'true' : undefined} aria-multiselectable="true">
            {this.renderTriggerContent()}
          </div>
        ) : (
          <button {...triggerProps} type="button" disabled={fieldDisabled(this)}>
            {this.renderTriggerContent()}
          </button>
        )}
        <div ref={(el) => (this.popup = el)} class="popup" part="listbox" onFocusout={this.onPopupFocusOut}>
          {this.searchable && (
            <div class="search">
              <Icon name="search" class="search-icon" />
              <input
                ref={(el) => (this.search = el)}
                type="text"
                role="combobox"
                aria-autocomplete="list"
                aria-expanded="true"
                aria-controls={listId}
                aria-activedescendant={activeId}
                aria-label={this.t('labelSearch')}
                placeholder={this.t('labelSearch')}
                autocomplete="off"
                spellcheck={false}
                value={this.query}
                onInput={this.onSearchInput}
                onKeyDown={this.onSearchKey}
              />
            </div>
          )}
          <div
            ref={(el) => (this.listbox = el)}
            id={listId}
            class="listbox"
            role="listbox"
            tabIndex={-1}
            aria-label={this.label ?? this.ariaLabelText}
            aria-multiselectable={this.multiple ? 'true' : undefined}
            aria-activedescendant={this.searchable ? undefined : activeId}
            onKeyDown={this.onListKey}
          >
            {list.map((o, i) => {
              if (!vis.has(i)) return null;
              const sel = this.isSelected(o);
              return (
                <div
                  id={`${this.uid}-opt-${i}`}
                  class={{ option: true, active: i === this.active, selected: sel }}
                  part="option"
                  role="option"
                  lang={o.lang}
                  aria-label={o.ariaLabel}
                  aria-selected={sel ? 'true' : 'false'}
                  aria-disabled={o.disabled ? 'true' : undefined}
                  onPointerMove={() => {
                    if (!o.disabled && i !== this.active) this.active = i;
                  }}
                  onClick={() => this.pick(i)}
                >
                  {this.multiple && <span class={{ box: true, on: sel }} aria-hidden="true">{sel && <Icon name="check" />}</span>}
                  {o.icon && <kern-icon name={o.icon} class="option-icon" />}
                  <span class="text">{o.label}</span>
                  {!this.multiple && sel && <Icon name="check" class="check" />}
                </div>
              );
            })}
            {!vis.size && <div class="no-results">{this.t('labelNoResults')}</div>}
          </div>
          <div class="footer" hidden={!this.hasFooter} onClick={this.onFooterClick}>
            <slot name="footer" onSlotchange={(e) => (this.hasFooter = (e.target as HTMLSlotElement).assignedElements().length > 0)} />
          </div>
        </div>
        {this.error ? (
          <span class="error" id={`${this.uid}-error`}>
            {this.error}
          </span>
        ) : (
          this.hint && (
            <span class="hint" id={`${this.uid}-hint`}>
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
