import { AttachInternals, Component, Element, Event, EventEmitter, Host, Method, Prop, State, Watch, h } from '@stencil/core';
import { fieldDisabled } from '../../utils/form-disabled';
import { Icon } from '../../utils/icons';
import { positionPopup } from '../../utils/popover';
import { datePlaceholder, formatInputDate, fromIsoDate, parseInputDate } from '../../utils/datetime';
import { kernTexts } from '../../utils/i18n';

let nextId = 0;

/**
 * Date field with a calendar popover, form-associated. The value is an ISO date (`2026-10-19`); the field shows
 * and accepts the locale's numeric format („19.10.2026“, also „19.10.“ or ISO). Typed text is applied on Enter or
 * when leaving the field; invalid or out-of-range dates mark the field invalid.
 *
 * Keyboard: Arrow Down or Alt+Arrow Down opens the calendar (keyboard as in kern-calendar), Enter or Space picks,
 * Escape closes. Elements in the `footer` slot appear below the calendar; clicking one closes it.
 *
 * @slot footer - Actions below the calendar, e.g. „Heute“
 * @part control - The field box
 * @part calendar - The popover panel
 */
@Component({
  tag: 'kern-date-picker',
  styleUrl: 'kern-date-picker.css',
  shadow: { delegatesFocus: true },
  formAssociated: true,
})
export class KernDatePicker {
  @Element() el!: HTMLElement;
  @AttachInternals() internals!: ElementInternals;

  @Prop() label?: string;
  @Prop() hint?: string;
  @Prop() error?: string;
  /** ISO date `YYYY-MM-DD`, empty when none. */
  @Prop({ mutable: true }) value = '';
  @Prop() name?: string;
  /** Earliest allowed date. */
  @Prop() min?: string;
  /** Latest allowed date. */
  @Prop() max?: string;
  /** Additional rule for unselectable days, e.g. weekends. */
  @Prop() isDateDisabled?: (iso: string) => boolean;
  /** Defaults to the locale's format, e.g. „TT.MM.JJJJ“. */
  @Prop() placeholder?: string;
  /** Show a button that empties the field. */
  @Prop() clearable = false;
  /** 0 = Sunday … 6 = Saturday; defaults to the locale. */
  @Prop() firstDayOfWeek?: number;
  /** ISO week numbers in the calendar. */
  @Prop() showWeekNumbers = false;
  /** BCP 47 locale; defaults to `<html lang>`, then the browser language. */
  @Prop() locale?: string;
  @Prop({ reflect: true }) size: 'md' | 'sm' = 'md';
  @Prop({ reflect: true }) disabled = false;
  /** Set by a disabled fieldset or form; `disabled` stays the author's own. */
  @State() formDisabled = false;
  @Prop() readonly = false;
  @Prop() required = false;
  /** Accessible name when there is no visible label. */
  @Prop() ariaLabelText?: string;
  @Prop() labelOpen?: string;
  @Prop() labelClear?: string;
  /** Shown for text that is not a date. */
  @Prop() labelInvalid?: string;
  /** Shown for a date outside min/max or disabled. */
  @Prop() labelOutOfRange?: string;
  private t = kernTexts(this, 'kern-date-picker', 'sync');

  /** When the date changes (picked, typed and applied, or cleared). */
  @Event() kernChange!: EventEmitter<{ value: string }>;

  @State() text = '';
  @State() open = false;
  @State() hasFooter = false;
  /** Name of the text property of the own validation message, shown when `error` is not set. */
  @State() problem?: string;

  private input?: HTMLInputElement;
  private box?: HTMLElement;
  private popup?: HTMLElement;
  private calendar?: HTMLKernCalendarElement;
  private uid = `kern-date-picker-${++nextId}`;
  private initial = '';
  private wasOpen = false;

  componentWillLoad() {
    this.initial = this.value ?? '';
    this.hasFooter = Array.from(this.el.children).some((c) => c.getAttribute('slot') === 'footer');
    this.text = formatInputDate(this.value, this.locale);
    this.problem = this.check(this.value);
  }

  componentDidLoad() {
    this.sync();
    const p = this.popup;
    if (!p) return;
    p.setAttribute('popover', 'auto');
    p.addEventListener('toggle', (e) => this.onToggle(e as ToggleEvent));
  }

  disconnectedCallback() {
    this.stopTracking();
  }

  @Watch('value')
  @Watch('locale')
  onValue() {
    this.text = formatInputDate(this.value, this.locale);
    this.problem = this.check(this.value);
    this.sync();
  }

  @Watch('min')
  @Watch('max')
  onBounds() {
    if (this.value) this.problem = this.check(this.value);
    this.sync();
  }

  @Watch('error')
  @Watch('required')
  @Watch('problem')
  sync() {
    this.internals?.setFormValue?.(this.value ?? '');
    const message = this.error ?? this.problemText();
    if (message) this.internals?.setValidity?.({ customError: true }, message, this.input);
    else if (this.required && !this.value) this.internals?.setValidity?.({ valueMissing: true }, 'required', this.input);
    else this.internals?.setValidity?.({});
  }

  formResetCallback() {
    this.value = this.initial;
    this.onValue();
  }

  formDisabledCallback(disabled: boolean) {
    this.formDisabled = disabled;
  }

  @Method()
  async setFocus() {
    this.input?.focus();
  }

  /** Opens the calendar. */
  @Method()
  async show() {
    this.openCalendar();
  }

  /** Closes the calendar. */
  @Method()
  async hide() {
    this.closeCalendar();
  }

  private check(iso: string): string | undefined {
    if (!iso) return undefined;
    if (!fromIsoDate(iso)) return 'labelInvalid';
    if ((this.min && iso < this.min) || (this.max && iso > this.max) || this.isDateDisabled?.(iso)) return 'labelOutOfRange';
    return undefined;
  }

  private setValue(iso: string) {
    if (iso === this.value) {
      this.onValue(); // normalise the text, e.g. „5.10.“ → „05.10.2026“
      return;
    }
    this.value = iso;
    this.kernChange.emit({ value: iso });
  }

  /** Apply the typed text. */
  private commit() {
    const t = this.text.trim();
    if (!t) return this.setValue('');
    const iso = parseInputDate(t, this.locale);
    if (!iso) {
      this.problem = 'labelInvalid';
      return;
    }
    this.setValue(iso);
  }

  // ---------- popover ----------

  private openCalendar() {
    if (fieldDisabled(this) || this.readonly || this.open || !this.popup) return;
    this.commit();
    (this.popup as HTMLElement & { showPopover?: () => void }).showPopover?.();
  }

  private closeCalendar(refocus = true) {
    if (!this.open) return;
    (this.popup as HTMLElement & { hidePopover?: () => void }).hidePopover?.();
    if (refocus) this.input?.focus();
  }

  private onToggle(e: ToggleEvent) {
    this.open = e.newState === 'open';
    if (this.open) {
      this.position();
      this.startTracking();
      const target = this.value || this.min || '';
      requestAnimationFrame(async () => {
        if (target) await this.calendar?.goTo(target);
        this.position(); // the panel has its real size now
        this.calendar?.setFocus();
      });
    } else {
      this.stopTracking();
      const focused = this.el.shadowRoot?.activeElement;
      if (focused && this.popup?.contains(focused)) this.input?.focus();
    }
  }

  private position = () => {
    if (this.box && this.popup) positionPopup(this.box, this.popup);
  };

  private startTracking() {
    window.addEventListener('scroll', this.position, true);
    window.addEventListener('resize', this.position);
  }

  private stopTracking() {
    window.removeEventListener('scroll', this.position, true);
    window.removeEventListener('resize', this.position);
  }

  // ---------- events ----------

  private onInput = (ev: Event) => {
    this.text = (ev.target as HTMLInputElement).value;
    if (this.problem === 'labelInvalid') this.problem = undefined;
  };

  private onKey = (ev: KeyboardEvent) => {
    if (ev.key === 'ArrowDown') {
      ev.preventDefault();
      this.openCalendar();
    } else if (ev.key === 'Enter') {
      this.commit();
    }
  };

  private onButtonPointerDown = () => {
    this.wasOpen = this.open;
  };

  private onButtonClick = () => {
    // A click on the button while open first light-dismisses the popover; do not reopen it.
    if (this.wasOpen) {
      this.wasOpen = false;
      return;
    }
    this.openCalendar();
  };

  private onPick = (ev: CustomEvent<{ value: string } | { start: string; end: string }>) => {
    ev.stopPropagation();
    if ('value' in ev.detail) this.setValue(ev.detail.value);
    this.closeCalendar();
  };

  private onClear = () => {
    this.setValue('');
    this.input?.focus();
  };

  private onPopupFocusOut = (ev: FocusEvent) => {
    const next = ev.relatedTarget as Node | null;
    if (!next || this.popup?.contains(next) || this.el.contains(next)) return;
    this.closeCalendar(false);
  };

  /** The own validation message in the current language; `problem` holds the text property's name. */
  private problemText(): string | undefined {
    return this.problem && this.t(this.problem);
  }

  render() {
    const message = this.error ?? this.problemText();
    const describedBy = message ? `${this.uid}-error` : this.hint ? `${this.uid}-hint` : undefined;
    const locked = fieldDisabled(this) || this.readonly;
    return (
      <Host invalid={!!message}>
        {this.label && (
          <label class="label" htmlFor={this.uid}>
            {this.label}
            {this.required && <span class="req" aria-hidden="true">*</span>}
          </label>
        )}
        <div ref={(el) => (this.box = el)} class={{ control: true, box: true, disabled: fieldDisabled(this) }} part="control">
          <input
            ref={(el) => (this.input = el)}
            id={this.uid}
            class="text"
            type="text"
            inputMode="numeric"
            autocomplete="off"
            spellcheck={false}
            value={this.text}
            placeholder={this.placeholder ?? datePlaceholder(this.locale)}
            disabled={fieldDisabled(this)}
            readOnly={this.readonly}
            required={this.required}
            aria-label={this.label ? undefined : this.ariaLabelText}
            aria-invalid={message ? 'true' : undefined}
            aria-describedby={describedBy}
            aria-haspopup="dialog"
            aria-expanded={this.open ? 'true' : 'false'}
            onInput={this.onInput}
            onChange={() => this.commit()}
            onKeyDown={this.onKey}
          />
          {this.clearable && this.value && !locked && (
            <button type="button" class="icon clear" tabindex={-1} aria-label={this.t('labelClear')} title={this.t('labelClear')} onClick={this.onClear}>
              <Icon name="close" />
            </button>
          )}
          <button
            type="button"
            class="icon open"
            aria-label={this.t('labelOpen')}
            title={this.t('labelOpen')}
            aria-expanded={this.open ? 'true' : 'false'}
            disabled={locked}
            onPointerDown={this.onButtonPointerDown}
            onClick={this.onButtonClick}
          >
            <Icon name="calendar" />
          </button>
        </div>
        <div ref={(el) => (this.popup = el)} class="popup" part="calendar" role="dialog" aria-label={this.label ?? this.ariaLabelText} onFocusout={this.onPopupFocusOut}>
          <kern-calendar
            ref={(el) => (this.calendar = el)}
            value={this.value || undefined}
            min={this.min}
            max={this.max}
            isDateDisabled={this.isDateDisabled}
            firstDayOfWeek={this.firstDayOfWeek}
            showWeekNumbers={this.showWeekNumbers}
            locale={this.locale}
            label={this.label ?? this.ariaLabelText}
            onKernChange={this.onPick}
            onKernMonthChange={(e) => {
              e.stopPropagation();
              requestAnimationFrame(this.position);
            }}
          />
          <div class="footer" hidden={!this.hasFooter} onClick={() => this.closeCalendar(false)}>
            <slot name="footer" onSlotchange={(e) => (this.hasFooter = (e.target as HTMLSlotElement).assignedElements().length > 0)} />
          </div>
        </div>
        {message ? (
          <span class="error" id={`${this.uid}-error`}>
            {message}
          </span>
        ) : (
          this.hint && (
            <span class="hint" id={`${this.uid}-hint`}>
              {this.hint}
            </span>
          )
        )}
      </Host>
    );
  }
}
