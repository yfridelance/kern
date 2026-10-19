import { Component, Element, Event, EventEmitter, Host, Method, Prop, State, Watch, h } from '@stencil/core';
import { Icon } from '../../utils/icons';
import {
  addDays,
  addMonths,
  clampIso,
  daysBetween,
  firstDayOfWeek,
  fromIsoDate,
  isoDate,
  isoWeek,
  monthGrid,
  resolveLocale,
  todayIso,
} from '../../utils/datetime';

/**
 * Month view for picking a date or a range, inline or inside a picker. Values are ISO dates (`2026-10-19`).
 * Keyboard (one tab stop): arrows move by day/week, Home/End to the start/end of the week, Page Up/Down by month,
 * with Shift by year, Enter or Space picks. In range mode the first pick sets `start`, the second `end`
 * (swapped if earlier); the range is previewed on hover and focus until then, Escape discards it.
 *
 * @slot footer - Actions below the month, e.g. a „Heute“ button
 * @part day - Each day button
 */
@Component({
  tag: 'kern-calendar',
  styleUrl: 'kern-calendar.css',
  shadow: true,
})
export class KernCalendar {
  @Element() el!: HTMLElement;

  /** Selected date (single mode). */
  @Prop({ mutable: true }) value?: string;
  /** Pick a range (`start`/`end`) instead of a single `value`. */
  @Prop() range = false;
  /** Range start (range mode). */
  @Prop({ mutable: true }) start?: string;
  /** Range end (range mode). */
  @Prop({ mutable: true }) end?: string;
  /** Earliest selectable date. */
  @Prop() min?: string;
  /** Latest selectable date. */
  @Prop() max?: string;
  /** Additional rule for unselectable days, e.g. weekends. */
  @Prop() isDateDisabled?: (iso: string) => boolean;
  /** Range mode: longest range in days (inclusive); farther days are locked once `start` is picked. */
  @Prop() maxDays?: number;
  /** 0 = Sunday … 6 = Saturday; defaults to the locale (Monday for de). */
  @Prop() firstDayOfWeek?: number;
  /** ISO week numbers in front of each row. */
  @Prop() showWeekNumbers = false;
  /** Months shown side by side. */
  @Prop() months: 1 | 2 = 1;
  /** BCP 47 locale; defaults to `<html lang>`, then the browser language. */
  @Prop() locale?: string;
  /** Accessible name of the calendar. */
  @Prop() label = 'Kalender';
  @Prop() labelPrev = 'Vorheriger Monat';
  @Prop() labelNext = 'Nächster Monat';
  /** Column header of the week numbers. */
  @Prop() labelWeek = 'KW';

  /** A date was picked (`{ value }`), or a range completed (`{ start, end }`). */
  @Event() kernChange!: EventEmitter<{ value: string } | { start: string; end: string }>;
  /** The shown month changed (`month` 1–12). */
  @Event() kernMonthChange!: EventEmitter<{ year: number; month: number }>;

  @State() viewYear = 0;
  @State() viewMonth = 0;
  /** The day with the tab stop. */
  @State() active = '';
  /** Range preview end while only `start` is picked. */
  @State() preview?: string;
  @State() pending = false;
  @State() hasFooter = false;

  private focusAfterRender = false;
  /** Range before a new pick started, restored by Escape. */
  private previous: [string?, string?] = [];

  componentWillLoad() {
    this.hasFooter = Array.from(this.el.children).some((c) => c.getAttribute('slot') === 'footer');
    this.show(clampIso((this.range ? this.start : this.value) || todayIso(), this.min, this.max), false);
  }

  componentDidRender() {
    if (!this.focusAfterRender) return;
    this.focusAfterRender = false;
    this.activeButton()?.focus();
  }

  @Watch('value')
  @Watch('start')
  onValue(next?: string) {
    if (next && fromIsoDate(next)) this.show(next, false);
  }

  /** Focus the active day. */
  @Method()
  async setFocus() {
    this.activeButton()?.focus();
  }

  /** Show the month of an ISO date and move the tab stop there (does not select). */
  @Method()
  async goTo(iso: string) {
    if (fromIsoDate(iso)) this.show(iso, true);
  }

  private activeButton() {
    return this.el.shadowRoot?.querySelector<HTMLButtonElement>('button[data-iso][tabindex="0"]');
  }

  /** Make `iso` the active day; shift the view only if it is not visible. */
  private show(iso: string, emit: boolean) {
    this.active = iso;
    const d = fromIsoDate(iso)!;
    const index = d.getFullYear() * 12 + d.getMonth();
    const first = this.viewYear * 12 + this.viewMonth;
    if (this.viewYear && index >= first && index < first + this.months) return;
    this.setView(d.getFullYear(), d.getMonth(), emit);
  }

  private setView(year: number, month: number, emit: boolean) {
    // Keep all shown months within min/max where possible (two months ending at max, not one empty month).
    const index = (iso?: string) => {
      const d = fromIsoDate(iso);
      return d ? d.getFullYear() * 12 + d.getMonth() : undefined;
    };
    let i = year * 12 + month;
    const hi = index(this.max);
    const lo = index(this.min);
    if (hi !== undefined) i = Math.min(i, hi - this.months + 1);
    if (lo !== undefined) i = Math.max(i, lo);
    const d = new Date(Math.floor(i / 12), i % 12, 1);
    this.viewYear = d.getFullYear();
    this.viewMonth = d.getMonth();
    if (emit) this.kernMonthChange.emit({ year: this.viewYear, month: this.viewMonth + 1 });
  }

  private disabled(iso: string): boolean {
    if (this.range && this.pending && this.maxDays && this.start && Math.abs(daysBetween(this.start, iso)) >= this.maxDays) return true;
    return (!!this.min && iso < this.min) || (!!this.max && iso > this.max) || !!this.isDateDisabled?.(iso);
  }

  private step(months: number) {
    this.setView(this.viewYear, this.viewMonth + months, true);
    const moved = addMonths(this.active, months);
    this.active = clampIso(moved, this.min, this.max);
  }

  private pick(iso: string) {
    if (this.disabled(iso)) return;
    this.show(iso, true); // an outside day switches the month
    if (!this.range) {
      this.value = iso;
      this.kernChange.emit({ value: iso });
      return;
    }
    if (!this.pending) {
      this.previous = [this.start, this.end];
      this.start = iso;
      this.end = undefined;
      this.pending = true;
      this.preview = iso;
      return;
    }
    const [start, end] = [this.start!, iso].sort();
    this.start = start;
    this.end = end;
    this.pending = false;
    this.preview = undefined;
    this.kernChange.emit({ start, end });
  }

  private move(iso: string) {
    const target = clampIso(iso, this.min, this.max);
    this.show(target, true);
    if (this.pending) this.preview = target;
    this.focusAfterRender = true;
  }

  private onKey = (ev: KeyboardEvent) => {
    const a = this.active;
    const weekday = (fromIsoDate(a)!.getDay() - this.firstDay + 7) % 7;
    const keys: Record<string, () => string> = {
      ArrowLeft: () => addDays(a, -1),
      ArrowRight: () => addDays(a, 1),
      ArrowUp: () => addDays(a, -7),
      ArrowDown: () => addDays(a, 7),
      Home: () => addDays(a, -weekday),
      End: () => addDays(a, 6 - weekday),
      PageUp: () => addMonths(a, ev.shiftKey ? -12 : -1),
      PageDown: () => addMonths(a, ev.shiftKey ? 12 : 1),
    };
    if (ev.key === 'Escape' && this.pending) {
      // Abandon a half-picked range.
      ev.stopPropagation();
      this.pending = false;
      this.preview = undefined;
      [this.start, this.end] = this.previous;
      return;
    }
    if (keys[ev.key]) {
      ev.preventDefault();
      this.move(keys[ev.key]());
    }
  };

  private get firstDay(): number {
    return this.firstDayOfWeek ?? firstDayOfWeek(this.locale);
  }

  private renderMonth(offset: number, today: string, loc?: string) {
    const first = new Date(this.viewYear, this.viewMonth + offset, 1);
    const year = first.getFullYear();
    const month = first.getMonth();
    const days = monthGrid(year, month, this.firstDay);
    const titleId = `title-${offset}`;
    const weekdayShort = new Intl.DateTimeFormat(loc, { weekday: 'short' });
    const weekdayLong = new Intl.DateTimeFormat(loc, { weekday: 'long' });
    const dayLabel = new Intl.DateTimeFormat(loc, { dateStyle: 'full' });
    const multi = this.months > 1;
    const [lo, hi] = [this.start, this.pending ? this.preview : this.end].filter(Boolean).sort() as string[];
    const isFirst = offset === 0;
    const isLast = offset === this.months - 1;
    const prevDisabled = !!this.min && isoDate(new Date(year, month, 0)) < this.min;
    const nextDisabled = !!this.max && isoDate(new Date(year, month + 1, 1)) > this.max;

    return (
      <div class="month">
        <div class="header">
          {isFirst ? (
            <button type="button" class="nav prev" aria-label={this.labelPrev} title={this.labelPrev} disabled={prevDisabled} onClick={() => this.step(-1)}>
              <Icon name="chevron-left" />
            </button>
          ) : (
            <span class="nav" />
          )}
          <span class="title" id={titleId} aria-live="polite">
            {new Intl.DateTimeFormat(loc, { month: 'long', year: 'numeric' }).format(first)}
          </span>
          {isLast ? (
            <button type="button" class="nav next" aria-label={this.labelNext} title={this.labelNext} disabled={nextDisabled} onClick={() => this.step(1)}>
              <Icon name="chevron-right" />
            </button>
          ) : (
            <span class="nav" />
          )}
        </div>
        <table role="grid" aria-labelledby={titleId} aria-multiselectable={this.range ? 'true' : undefined}>
          <thead>
            <tr>
              {this.showWeekNumbers && (
                <th scope="col" class="week" abbr={this.labelWeek}>
                  {this.labelWeek}
                </th>
              )}
              {days.slice(0, 7).map((iso) => {
                const d = fromIsoDate(iso)!;
                return (
                  <th scope="col" abbr={weekdayLong.format(d)}>
                    {weekdayShort.format(d).replace(/\.$/, '')}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {[0, 1, 2, 3, 4, 5].map((row) => (
              <tr>
                {this.showWeekNumbers && <td class="week">{isoWeek(days[row * 7])}</td>}
                {days.slice(row * 7, row * 7 + 7).map((iso) => {
                  const d = fromIsoDate(iso)!;
                  const outside = d.getMonth() !== month;
                  // Several months: outside days belong to the neighbour, leave them empty.
                  if (outside && multi) return <td role="gridcell" class="empty" />;
                  const selected = this.range ? iso === this.start || (!this.pending && iso === this.end) : iso === this.value;
                  const inRange = this.range && !!lo && !!hi && iso >= lo && iso <= hi;
                  const disabled = this.disabled(iso);
                  return (
                    <td
                      role="gridcell"
                      aria-selected={selected || (inRange && !this.pending) ? 'true' : 'false'}
                      class={{ 'in-range': inRange && lo !== hi, 'range-start': inRange && iso === lo, 'range-end': inRange && iso === hi, preview: inRange && this.pending }}
                    >
                      <button
                        type="button"
                        part="day"
                        data-iso={iso}
                        tabindex={iso === this.active ? 0 : -1}
                        class={{ day: true, outside, selected, today: iso === today }}
                        aria-label={dayLabel.format(d)}
                        aria-current={iso === today ? 'date' : undefined}
                        aria-disabled={disabled ? 'true' : undefined}
                        onClick={() => this.pick(iso)}
                        onFocus={() => (this.active = iso)}
                        onMouseEnter={() => this.pending && !disabled && (this.preview = iso)}
                      >
                        {d.getDate()}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  render() {
    const loc = resolveLocale(this.locale);
    const today = todayIso();
    return (
      <Host role="group" aria-label={this.label}>
        <div class="months" onKeyDown={this.onKey}>
          {Array.from({ length: this.months }, (_, i) => this.renderMonth(i, today, loc))}
        </div>
        <div class="footer" hidden={!this.hasFooter}>
          <slot name="footer" onSlotchange={(e) => (this.hasFooter = (e.target as HTMLSlotElement).assignedElements().length > 0)} />
        </div>
      </Host>
    );
  }
}
