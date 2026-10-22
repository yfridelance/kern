import { Component, Element, Event, EventEmitter, Host, Listen, Prop, State, Watch, h } from '@stencil/core';
import { formatDate, isoDate, onTick, parseDateTime, resolveLocale, todayIso, addDays } from '../../utils/datetime';
import { kernTexts } from '../../utils/i18n';

type Item = HTMLElement & { datetime?: string | number | Date; dayLabel?: string; grouped?: boolean; dayEnd?: boolean };

/**
 * History of events, e.g. of a device: «Discovered → Firmware updated → Connection lost → Online again». A list
 * of kern-timeline-item children in the order the app gives them (newest or oldest first); screen readers read
 * them in the order they are shown. `group-by="day"` puts a day heading («Today», «Yesterday», a date) above the
 * first event of each day.
 *
 * `loading` shows placeholders while there are no events yet, `empty` (or the `empty` slot) when there are none.
 * With `has-more` a «Load more» button after the last event emits `kernLoadMore`; the app appends the next events
 * and clears `loading`. Focus and reading position stay where they are: new events at the top do not move the
 * events being read, and after loading more a short status names the number of new events. If the button goes
 * away, focus moves to the first new event.
 *
 * @slot - kern-timeline-item elements
 * @slot empty - Replaces the empty state, e.g. a kern-empty-state with `variant="error"` and «Try again»
 * @slot more - Replaces the «Load more» button, e.g. a link to the full history
 * @part list - The list
 * @part more - The area of the «Load more» button
 */
@Component({
  tag: 'kern-timeline',
  styleUrl: 'kern-timeline.css',
  shadow: true,
})
export class KernTimeline {
  @Element() el!: HTMLElement;

  /** Accessible name of the list, e.g. «History of Bathroom fan». */
  @Prop() label?: string;
  /** `day` = a day heading above the first event of each day; times then show without the date. */
  @Prop() groupBy: 'none' | 'day' = 'none';
  /** Events are being loaded: placeholders without events, a busy «Load more» button with them. */
  @Prop({ reflect: true }) loading = false;
  /** More events can be loaded: shows the «Load more» button. */
  @Prop() hasMore = false;
  /** Heading of the empty state; empty string shows nothing. Defaults to the Kern text. */
  @Prop() empty?: string;
  /** Text of the «Load more» button; defaults to the Kern text. */
  @Prop() labelMore?: string;
  /** Status after loading more, `{n}` = number of new events; defaults to the Kern text. */
  @Prop() labelLoaded?: string;
  private t = kernTexts(this, 'kern-timeline');

  /** «Load more» was pressed. Append the next events and set `loading` while fetching. */
  @Event() kernLoadMore!: EventEmitter<void>;

  @State() count = 0;
  @State() hasMoreSlot = false;
  @State() hasEmptySlot = false;
  @State() announcement = '';
  /** Bumped when items or their times change, so the day groups are recomputed. */
  @State() revision = 0;

  private items: Item[] = [];
  /** Pending «Load more»: number of items before, whether its button had the focus and `loading` was set since. */
  private pending?: { from: number; focused: boolean; loaded?: boolean };
  private today = todayIso();
  private unsubscribe?: () => void;
  private moreButton?: HTMLElement;
  /** Reading point: the first event in view and its top, noted after scrolling. */
  private anchor?: { item: Item; top: number };
  private anchorFrame = 0;
  private resizeObserver?: ResizeObserver;

  componentWillLoad() {
    this.collect();
    const slots = Array.from(this.el.children).map((c) => c.getAttribute('slot'));
    this.hasMoreSlot = slots.includes('more');
    this.hasEmptySlot = slots.includes('empty');
  }

  connectedCallback() {
    this.syncTicker();
    if (typeof ResizeObserver === 'undefined') return;
    // New events get their height only once they render, after the slotchange; so watch the size.
    document.addEventListener('scroll', this.onScroll, { capture: true, passive: true });
    this.resizeObserver ??= new ResizeObserver(() => this.keepReadingPoint());
    this.resizeObserver.observe(this.el);
  }

  disconnectedCallback() {
    this.unsubscribe?.();
    this.unsubscribe = undefined;
    document.removeEventListener('scroll', this.onScroll, { capture: true });
    this.resizeObserver?.disconnect();
    cancelAnimationFrame(this.anchorFrame);
  }

  @Watch('groupBy')
  syncTicker() {
    // Day headings say «Today»/«Yesterday», so they change at midnight.
    if (this.groupBy !== 'day') {
      this.unsubscribe?.();
      this.unsubscribe = undefined;
    } else
      this.unsubscribe ??= onTick(() => {
        if (todayIso() !== this.today) this.revision++;
      });
  }

  @Watch('loading')
  loadingChanged(now: boolean) {
    if (now && this.pending) this.pending.loaded = true;
    if (now || !this.pending) return;
    // Usually the app appends the events, then clears `loading`; if it does so the other way round, the new
    // events come in the same task.
    this.collect();
    if (this.count > this.pending.from) this.settle();
    else
      setTimeout(() => {
        this.collect();
        this.settle();
      });
  }

  @Listen('kern-timeline-item-change')
  itemChanged() {
    this.revision++;
  }

  private collect() {
    this.items = Array.from(this.el.children).filter((c) => c.localName === 'kern-timeline-item') as Item[];
    this.count = this.items.length;
  }

  private onSlotchange = () => {
    this.collect();
    this.revision++;
    this.settle();
  };

  private onMore = () => {
    if (this.loading) return;
    // The button lives in this shadow root, so the root knows whether it has the focus.
    const focused = !!this.moreButton && this.el.shadowRoot?.activeElement === this.moreButton;
    this.pending = { from: this.count, focused };
    this.announcement = '';
    this.kernLoadMore.emit();
  };

  /** After «Load more»: once loading is over, announce the new events and keep the focus in the timeline. */
  private settle() {
    const p = this.pending;
    if (!p || this.loading) return;
    const added = this.count - p.from;
    // Without `loading`, wait for the new events.
    if (added <= 0 && !p.loaded) return;
    this.pending = undefined;
    if (added > 0) this.announcement = this.t('labelLoaded').replace('{n}', String(added));
    if (p.focused && added > 0) {
      // The button is re-rendered (or gone) after this; check the focus once it is.
      requestAnimationFrame(() => {
        if (this.moreButton?.isConnected && this.hasMore) return;
        const first = this.items[p.from];
        if (!first) return;
        first.tabIndex = -1;
        first.addEventListener('blur', () => first.removeAttribute('tabindex'), { once: true });
        first.focus();
      });
    }
  }

  private onScroll = () => {
    cancelAnimationFrame(this.anchorFrame);
    this.anchorFrame = requestAnimationFrame(() => this.measureAnchor());
  };

  /** The first item reaching into the viewport, once the timeline's top has scrolled out of view. */
  private measureAnchor() {
    this.anchor = undefined;
    const box = scroller(this.el);
    const viewTop = box === document.scrollingElement ? 0 : box.getBoundingClientRect().top;
    if (this.el.getBoundingClientRect().top >= viewTop) return;
    for (const item of this.items) {
      const r = item.getBoundingClientRect();
      if (r.bottom > viewTop) {
        this.anchor = { item, top: r.top };
        return;
      }
    }
  }

  /**
   * Keeps the events being read in place when the timeline changes size above them (new events at the top).
   * Runs after layout: where the browser's CSS scroll anchoring already did this, the event has not moved and
   * nothing happens; Safari does not anchor inside a scrolling box, so the timeline scrolls it itself.
   */
  private keepReadingPoint() {
    const a = this.anchor;
    if (a?.item.isConnected) {
      const delta = a.item.getBoundingClientRect().top - a.top;
      if (Math.abs(delta) >= 1) scroller(this.el).scrollBy(0, delta);
    }
    this.measureAnchor();
  }

  /** Sets the day headings of the items (none without `group-by="day"`). */
  private group() {
    const grouped = this.groupBy === 'day';
    this.today = todayIso();
    const locale = resolveLocale();
    const days = this.items.map((item) => {
      const v = grouped ? parseDateTime(item.datetime) : null;
      return v ? { date: v.date, day: isoDate(v.date) } : undefined;
    });
    this.items.forEach((item, i) => {
      const d = days[i];
      const day = d?.day;
      item.grouped = !!d;
      item.dayLabel = d && day !== days[i - 1]?.day ? dayLabel(d.date, d.day, this.today, locale) : undefined;
      // The line stops before the next day heading.
      item.dayEnd = !!d && i < days.length - 1 && days[i + 1]?.day !== day;
    });
  }

  componentWillRender() {
    this.group();
  }

  render() {
    const placeholders = this.loading && !this.count;
    const showEmpty = !this.count && !this.loading;
    const empty = this.t('empty');
    return (
      <Host>
        <div class="list" part="list" role="list" aria-label={this.label} aria-busy={this.loading ? 'true' : undefined} hidden={!this.count}>
          <slot onSlotchange={this.onSlotchange} />
        </div>
        {placeholders && (
          <div class="placeholders" aria-hidden="true">
            {[0, 1, 2].map(() => (
              <div class="placeholder">
                <kern-skeleton variant="circle" size="10px" />
                <kern-skeleton lines={2} />
              </div>
            ))}
          </div>
        )}
        <div class="empty" hidden={!showEmpty || (!this.hasEmptySlot && !empty)}>
          <slot name="empty" onSlotchange={(e) => (this.hasEmptySlot = (e.target as HTMLSlotElement).assignedElements().length > 0)}>
            <kern-empty-state compact icon="clock" heading={empty} />
          </slot>
        </div>
        <div class="more" part="more" hidden={!this.count || (!this.hasMore && !this.hasMoreSlot)}>
          <slot name="more" onSlotchange={(e) => (this.hasMoreSlot = (e.target as HTMLSlotElement).assignedElements().length > 0)}>
            {this.hasMore && (
              <kern-button ref={(el) => (this.moreButton = el)} size="sm" busy={this.loading} onClick={this.onMore}>
                {this.t('labelMore')}
              </kern-button>
            )}
          </slot>
        </div>
        <div class="sr-only" role="status">
          {this.announcement}
        </div>
      </Host>
    );
  }
}

/** «Today», «Yesterday» (in the locale's words), else the full date. */
function dayLabel(date: Date, day: string, today: string, locale?: string): string {
  const offset = day === today ? 0 : day === addDays(today, -1) ? -1 : null;
  if (offset === null) return formatDate({ date, dateOnly: false }, { format: 'full', locale });
  const word = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(offset, 'day');
  return word.charAt(0).toLocaleUpperCase(locale) + word.slice(1);
}

/** The nearest scrolling ancestor (across shadow roots), else the page. */
function scroller(el: Element): Element {
  for (let n: Node | null = el.parentNode; n; n = (n as ShadowRoot).host ?? n.parentNode) {
    if (n.nodeType !== Node.ELEMENT_NODE) continue;
    const e = n as Element;
    const { overflowY } = getComputedStyle(e);
    if ((overflowY === 'auto' || overflowY === 'scroll') && e.scrollHeight > e.clientHeight) return e;
  }
  return document.scrollingElement ?? document.documentElement;
}
