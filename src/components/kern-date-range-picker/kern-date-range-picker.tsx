import { AttachInternals, Component, Element, Event, EventEmitter, Host, Listen, Method, Prop, State, Watch, h } from '@stencil/core';
import { fieldDisabled } from '../../utils/form-disabled';
import { Icon } from '../../utils/icons';
import { positionPopup } from '../../utils/popover';
import { clampIso, datePlaceholder, daysBetween, formatInputDate, fromIsoDate, parseInputDate, rangeUntil } from '../../utils/datetime';
import { kernTexts } from '../../utils/i18n';

let nextId = 0;

/**
 * Date range field: two dates („Von“ – „Bis“) with a calendar popover (two months, one on narrow screens),
 * form-associated. `start` and `end` are ISO dates; `value` and the form value are the ISO 8601 interval
 * `start/end` (empty until both are set). Typed dates are applied on Enter or when leaving a field; an end before
 * the start is swapped.
 *
 * Presets: elements in the `presets` slot with `data-range` (ISO 8601 duration ending today, e.g. `P7D` = the last
 * 7 days incl. today) or `data-start`/`data-end` set the range on click.
 *
 * @slot presets - Quick choices beside the calendar, e.g. `<kern-button variant="ghost" size="sm" data-range="P7D">`
 * @slot footer - Actions below the calendar
 * @part control - The field box
 * @part calendar - The popover panel
 */
@Component({
  tag: 'kern-date-range-picker',
  styleUrl: 'kern-date-range-picker.css',
  shadow: { delegatesFocus: true },
  formAssociated: true,
})
export class KernDateRangePicker {
  @Element() el!: HTMLElement;
  @AttachInternals() internals!: ElementInternals;

  @Prop() label?: string;
  @Prop() hint?: string;
  @Prop() error?: string;
  /** First day, ISO `YYYY-MM-DD`. */
  @Prop({ mutable: true }) start = '';
  /** Last day (inclusive), ISO `YYYY-MM-DD`. */
  @Prop({ mutable: true }) end = '';
  /** ISO 8601 interval `start/end`, empty until both are set; kept in sync with `start`/`end`. */
  @Prop({ mutable: true }) value = '';
  @Prop() name?: string;
  /** Earliest allowed date. */
  @Prop() min?: string;
  /** Latest allowed date. */
  @Prop() max?: string;
  /** Longest allowed range in days (inclusive). */
  @Prop() maxDays?: number;
  /** Additional rule for unselectable days. */
  @Prop() isDateDisabled?: (iso: string) => boolean;
  /** Show a button that empties both dates. */
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
  @Prop() labelStart?: string;
  @Prop() labelEnd?: string;
  @Prop() labelOpen?: string;
  @Prop() labelClear?: string;
  @Prop() labelInvalid?: string;
  @Prop() labelOutOfRange?: string;
  /** Shown when only one date is set. */
  @Prop() labelIncomplete?: string;
  /** Shown when the range is longer than `maxDays`; `{n}` is replaced by it. */
  @Prop() labelTooLong?: string;
  private t = kernTexts(this, 'kern-date-range-picker', 'sync');

  /** When the range is complete or cleared. */
  @Event() kernChange!: EventEmitter<{ start: string; end: string; value: string }>;

  @State() textStart = '';
  @State() textEnd = '';
  @State() open = false;
  @State() months: 1 | 2 = 2;
  @State() hasPresets = false;
  @State() hasFooter = false;
  /** Name of the text property of the own validation message, shown when `error` is not set. */
  @State() problem?: string;
  /** New calendar per opening, so a half-picked range does not survive closing. */
  @State() opening = 0;

  private inputStart?: HTMLInputElement;
  private box?: HTMLElement;
  private popup?: HTMLElement;
  private calendar?: HTMLKernCalendarElement;
  private uid = `kern-date-range-picker-${++nextId}`;
  private initial: [string, string] = ['', ''];
  private wasOpen = false;

  componentWillLoad() {
    if (this.value && !this.start && !this.end) this.fromValue();
    this.initial = [this.start, this.end];
    const slots = Array.from(this.el.children).map((c) => c.getAttribute('slot'));
    this.hasPresets = slots.includes('presets');
    this.hasFooter = slots.includes('footer');
    this.refresh();
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

  /** `value` set from outside (e.g. Angular forms) → start/end. */
  @Watch('value')
  fromValue() {
    if (this.value === this.interval) return;
    const [s = '', e = ''] = (this.value || '').split('/');
    if (this.value && !(fromIsoDate(s) && fromIsoDate(e))) return;
    this.start = s;
    this.end = e;
  }

  @Watch('start')
  @Watch('end')
  @Watch('locale')
  refresh() {
    this.value = this.interval;
    this.textStart = formatInputDate(this.start, this.locale);
    this.textEnd = formatInputDate(this.end, this.locale);
    this.problem = this.check();
    this.sync();
  }

  @Watch('min')
  @Watch('max')
  @Watch('maxDays')
  onBounds() {
    this.problem = this.check();
    this.sync();
  }

  @Watch('error')
  @Watch('required')
  @Watch('problem')
  sync() {
    this.internals?.setFormValue?.(this.value ?? '');
    const message = this.error ?? this.problemText();
    if (message) this.internals?.setValidity?.({ customError: true }, message, this.inputStart);
    else if (this.required && !this.value) this.internals?.setValidity?.({ valueMissing: true }, 'required', this.inputStart);
    else this.internals?.setValidity?.({});
  }

  formResetCallback() {
    [this.start, this.end] = this.initial;
  }

  formDisabledCallback(disabled: boolean) {
    this.formDisabled = disabled;
  }

  @Method()
  async setFocus() {
    this.inputStart?.focus();
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

  private get interval(): string {
    return this.start && this.end ? `${this.start}/${this.end}` : '';
  }

  private notAllowed(iso: string): boolean {
    return (!!this.min && iso < this.min) || (!!this.max && iso > this.max) || !!this.isDateDisabled?.(iso);
  }

  private check(): string | undefined {
    const { start, end } = this;
    if (!start && !end) return undefined;
    if ((start && !fromIsoDate(start)) || (end && !fromIsoDate(end))) return 'labelInvalid';
    if (!start || !end) return 'labelIncomplete';
    if (this.notAllowed(start) || this.notAllowed(end)) return 'labelOutOfRange';
    if (this.maxDays && daysBetween(start, end) + 1 > this.maxDays) return 'labelTooLong';
    return undefined;
  }

  /** Set both dates (swapped if reversed); emits when the range is complete or cleared and changed. */
  private setRange(start: string, end: string) {
    if (start && end && end < start) [start, end] = [end, start];
    const changed = start !== this.start || end !== this.end;
    this.start = start;
    this.end = end;
    if (!changed) return this.refresh(); // normalise the text, e.g. „5.10.“ → „05.10.2026“
    if ((start && end) || (!start && !end)) this.kernChange.emit({ start, end, value: this.interval });
  }

  /** Apply both typed texts. */
  private commit() {
    const parse = (t: string) => (t.trim() ? parseInputDate(t, this.locale) : '');
    const s = parse(this.textStart);
    const e = parse(this.textEnd);
    if (s === null || e === null) {
      this.problem = 'labelInvalid';
      return;
    }
    this.setRange(s, e);
  }

  // ---------- popover ----------

  private openCalendar() {
    if (fieldDisabled(this) || this.readonly || this.open || !this.popup) return;
    this.commit();
    this.opening++;
    this.months = typeof window !== 'undefined' && window.innerWidth < 640 ? 1 : 2;
    (this.popup as HTMLElement & { showPopover?: () => void }).showPopover?.();
  }

  private closeCalendar(refocus = true) {
    if (!this.open) return;
    (this.popup as HTMLElement & { hidePopover?: () => void }).hidePopover?.();
    if (refocus) this.inputStart?.focus();
  }

  private onToggle(e: ToggleEvent) {
    this.open = e.newState === 'open';
    if (this.open) {
      this.position();
      this.startTracking();
      const target = this.start || this.min || '';
      requestAnimationFrame(async () => {
        if (target) await this.calendar?.goTo(target);
        this.position();
        this.calendar?.setFocus();
      });
    } else {
      this.stopTracking();
      const focused = this.el.shadowRoot?.activeElement;
      if (focused && this.popup?.contains(focused)) this.inputStart?.focus();
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
    if (this.wasOpen) {
      this.wasOpen = false;
      return;
    }
    this.openCalendar();
  };

  private onPick = (ev: CustomEvent<{ value: string } | { start: string; end: string }>) => {
    ev.stopPropagation();
    if (!('start' in ev.detail)) return;
    this.setRange(ev.detail.start, ev.detail.end);
    this.closeCalendar();
  };

  /** Clicks on slotted presets (light DOM, so they reach the host directly). */
  @Listen('click')
  onPreset(ev: MouseEvent) {
    const el = (ev.target as Element).closest?.('[data-range], [data-start]');
    if (!el || !el.closest('[slot="presets"]')) return;
    const range = el.hasAttribute('data-range')
      ? rangeUntil(el.getAttribute('data-range')!)
      : { start: el.getAttribute('data-start') ?? '', end: el.getAttribute('data-end') ?? '' };
    if (!range || !fromIsoDate(range.start) || !fromIsoDate(range.end)) return;
    this.setRange(clampIso(range.start, this.min, this.max), clampIso(range.end, this.min, this.max));
    this.closeCalendar();
  }

  private onClear = () => {
    this.setRange('', '');
    this.inputStart?.focus();
  };

  private onPopupFocusOut = (ev: FocusEvent) => {
    const next = ev.relatedTarget as Node | null;
    if (!next || this.popup?.contains(next) || this.el.contains(next)) return;
    this.closeCalendar(false);
  };

  private renderInput(which: 'start' | 'end', describedBy?: string, invalid?: boolean) {
    const isStart = which === 'start';
    const name = isStart ? this.t('labelStart') : this.t('labelEnd');
    return (
      <input
        ref={(el) => isStart && (this.inputStart = el)}
        id={isStart ? this.uid : `${this.uid}-end`}
        class={{ text: true, [which]: true }}
        type="text"
        inputMode="numeric"
        autocomplete="off"
        spellcheck={false}
        value={isStart ? this.textStart : this.textEnd}
        placeholder={datePlaceholder(this.locale)}
        disabled={fieldDisabled(this)}
        readOnly={this.readonly}
        aria-label={[this.label ?? this.ariaLabelText, name].filter(Boolean).join(', ')}
        aria-invalid={invalid ? 'true' : undefined}
        aria-describedby={describedBy}
        aria-haspopup="dialog"
        aria-expanded={this.open ? 'true' : 'false'}
        onInput={(e) => {
          const t = (e.target as HTMLInputElement).value;
          if (isStart) this.textStart = t;
          else this.textEnd = t;
          if (this.problem === 'labelInvalid') this.problem = undefined;
        }}
        onChange={() => this.commit()}
        onKeyDown={this.onKey}
      />
    );
  }

  /** The own validation message in the current language; `problem` holds the text property's name. */
  private problemText(): string | undefined {
    return this.problem && this.t(this.problem).replace('{n}', String(this.maxDays));
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
          {this.renderInput('start', describedBy, !!message)}
          <span class="dash" aria-hidden="true">
            –
          </span>
          {this.renderInput('end', describedBy, !!message)}
          {this.clearable && (this.start || this.end) && !locked && (
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
          <div class="body">
            <div class="presets" hidden={!this.hasPresets}>
              <slot name="presets" onSlotchange={(e) => (this.hasPresets = (e.target as HTMLSlotElement).assignedElements().length > 0)} />
            </div>
            <kern-calendar
              key={this.opening}
              ref={(el) => (this.calendar = el)}
              range
              start={this.start || undefined}
              end={this.end || undefined}
              min={this.min}
              max={this.max}
              maxDays={this.maxDays}
              isDateDisabled={this.isDateDisabled}
              firstDayOfWeek={this.firstDayOfWeek}
              showWeekNumbers={this.showWeekNumbers}
              months={this.months}
              locale={this.locale}
              label={this.label ?? this.ariaLabelText}
              onKernChange={this.onPick}
              onKernMonthChange={(e) => {
                e.stopPropagation();
                requestAnimationFrame(this.position);
              }}
            />
          </div>
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
