import { Component, Element, Event, EventEmitter, Host, Method, Prop, State, Watch, h } from '@stencil/core';
import { parseDateTime, resolveLocale } from '../../utils/datetime';
import { Icon } from '../../utils/icons';
import { kernTexts } from '../../utils/i18n';
import { LOG_LEVELS, detailsText, entryText, isoTime, levelOf, logFilter, splitMatches, type KernLogEntry, type KernLogFilter } from './log';

/** A row kept per key: its `<li>` and what it was built from. */
interface Row {
  li: HTMLLIElement;
  entry: KernLogEntry;
  query: string;
  open: boolean;
}

/** Screen reader hints about new entries: at most one per this many milliseconds. */
const ANNOUNCE_EVERY = 5000;
/** Rows moved by PageUp / PageDown. */
const PAGE = 10;

/**
 * Structured log viewer: time, level, source and message per entry, a search and level/source filters that combine,
 * a live mode that follows new entries, pause, copy and download. Entries are always shown as text, never as HTML.
 *
 * **Data and buffer.** The app owns the data and its transport (WebSocket, SSE, polling) and assigns new arrays to
 * `entries`, oldest first. The log shows at most the newest `max-entries` of them and never changes the app's array:
 * trim it in the app with the same limit (`entries = [...entries, ...added].slice(-1000)`), so memory stays bounded.
 * Rows are kept per `id`: an update moves, adds and removes rows instead of rebuilding them, so text selection, open
 * details and the focused row survive. When old entries drop out at the top while you read further down, the rows
 * you look at stay in place.
 *
 * **Live mode.** With `follow` the log stays at its latest entry while it is scrolled to the end. Scroll up and the
 * position stays; a button counts the new entries below («23 new») and jumps back. `paused` freezes the rows shown
 * while the app keeps delivering: the button then counts the waiting entries and resumes.
 *
 * **Keyboard.** One row is in the tab order: Arrow keys, Page Up/Down, Home and End move between rows, Enter opens
 * the details of a row, Ctrl/Cmd+C copies it (without a text selection); Tab reaches the row's buttons. Screen
 * readers hear summaries only: «New log entries: 23» (at most every 5 seconds while not following) and the number of
 * matches after a filter change, never every row.
 *
 * @part toolbar - Search, filters and actions above the rows
 * @part list - The scrolling list of rows
 * @part latest - The «Jump to latest» / «Resume» button
 */
@Component({
  tag: 'kern-log',
  styleUrl: 'kern-log.css',
  shadow: true,
})
export class KernLog {
  @Element() el!: HTMLElement;

  /** The entries, oldest first. Assign a new array for updates; `id` keeps each row. */
  @Prop() entries: KernLogEntry[] = [];
  /** At most this many entries are shown (the newest). Trim the app's array with the same limit. */
  @Prop() maxEntries = 1000;
  /** Follow new entries while scrolled to the end; scrolled up, the position stays. */
  @Prop() follow = false;
  /** Freeze the rows shown; new entries wait and are counted. Set by the Pause button too. */
  @Prop({ mutable: true, reflect: true }) paused = false;
  /** Search text: case-insensitive, in message, source and details. */
  @Prop({ mutable: true }) query = '';
  /** Levels shown (`debug`, `info`, `warn`, `error`); empty shows all. */
  @Prop({ mutable: true }) levels: string[] = [];
  /** Sources shown; empty shows all. */
  @Prop({ mutable: true }) sources: string[] = [];
  /** Hide the search and the filters (pause, copy and download stay). */
  @Prop() noFilters = false;
  /** Wrap long messages instead of scrolling sideways. */
  @Prop() wrap = false;
  /** Scroll beyond this height, e.g. `320px`. Alternatively give the element a height. */
  @Prop() maxHeight?: string;
  /** File name of the download. */
  @Prop() fileName = 'log.txt';
  /** Accessible name of the list. */
  @Prop() label?: string;
  @Prop() labelSearch?: string;
  @Prop() labelLevel?: string;
  @Prop() labelAllLevels?: string;
  @Prop() labelSource?: string;
  @Prop() labelAllSources?: string;
  @Prop() labelDebug?: string;
  @Prop() labelInfo?: string;
  @Prop() labelWarn?: string;
  @Prop() labelError?: string;
  @Prop() labelPause?: string;
  @Prop() labelResume?: string;
  @Prop() labelCopy?: string;
  @Prop() labelCopyEntry?: string;
  @Prop() labelCopied?: string;
  @Prop() labelDownload?: string;
  @Prop() labelDetails?: string;
  @Prop() labelLatest?: string;
  /** Button text for new or waiting entries; `{n}` is replaced. */
  @Prop() labelNew?: string;
  /** Screen reader hint for new entries; `{n}` is replaced. */
  @Prop() labelAnnounce?: string;
  /** Number of matches; `{n}` and `{total}` are replaced. */
  @Prop() labelCount?: string;
  @Prop() labelReset?: string;
  private t = kernTexts(this, 'kern-log', 'relabel');

  /** Search, levels or sources changed by the user. */
  @Event() kernFilter!: EventEmitter<KernLogFilter>;
  /** Paused or resumed by the user. */
  @Event() kernPause!: EventEmitter<{ paused: boolean }>;
  /** After a successful copy of one entry or of all entries shown. */
  @Event() kernCopy!: EventEmitter<{ value: string; count: number }>;
  /** Before the download of the entries shown; cancel it to export the text yourself. */
  @Event({ cancelable: true }) kernDownload!: EventEmitter<{ value: string; count: number; fileName: string }>;

  /** With `follow`: scrolled away from the end. */
  @State() away = false;
  /** Live region text. */
  @State() announcement = '';
  /** Key of the entry just copied; `*` for all. */
  @State() copiedKey?: string;

  private rows = new Map<string, Row>();
  /** Arrival order per key, to count new entries. */
  private seq = new Map<string, number>();
  private seqFor?: KernLogEntry[];
  private nextSeq = 0;
  /** Newest arrival seen at the end (follow) and at pausing. */
  private readSeq = 0;
  private pauseSeq = 0;
  /** The entries frozen by `paused`. */
  private frozen?: KernLogEntry[];
  /** What the next sync shows, with keys; `fresh` = new entries below or waiting. */
  private view: KernLogEntry[] = [];
  private keys: string[] = [];
  private total = 0;
  private fresh = 0;
  private open = new Set<string>();
  private activeKey?: string;
  private scroller?: HTMLDivElement;
  private list?: HTMLOListElement;
  private stick = true;
  private warned = false;
  private lastAnnounced = 0;
  private announcedFresh = 0;
  private announceTimer?: ReturnType<typeof setTimeout>;
  private countTimer?: ReturnType<typeof setTimeout>;
  private copyTimer?: ReturnType<typeof setTimeout>;
  private sourceOptions: { value: string; label: string }[] = [];
  private levelOptions: { value: string; label: string }[] = [];
  private timeFormat?: { locale?: string; short: Intl.DateTimeFormat; full: Intl.DateTimeFormat };

  disconnectedCallback() {
    clearTimeout(this.announceTimer);
    clearTimeout(this.countTimer);
    clearTimeout(this.copyTimer);
  }

  /** After a language change: the rows are rebuilt with the new labels and time format on the next render. */
  relabel() {
    for (const row of this.rows.values()) row.query = '\u0000';
  }

  @Watch('paused')
  pausedChanged(paused: boolean) {
    if (paused) {
      this.frozen = this.clip(this.entries).slice(); // a copy: the app may still change its old array
      this.track(); // entries set in the same tick get their arrival order before the boundary
      this.pauseSeq = this.nextSeq;
    } else {
      this.frozen = undefined;
    }
  }

  /** Scroll to the latest entry. */
  @Method()
  async scrollToEnd() {
    if (this.scroller) this.scroller.scrollTop = this.scroller.scrollHeight;
    this.stick = true;
    this.away = false;
  }

  /** The entries shown (after the filters), as text: one line per entry, details indented. */
  @Method()
  async getText(): Promise<string> {
    return this.view.map(entryText).join('\n');
  }

  componentWillLoad() {
    if (this.paused) this.pausedChanged(true);
  }

  componentWillRender() {
    // Measured before the new rows are in: only a log that was at the end follows them.
    this.stick = !this.scroller || this.atEnd();
    this.compute();
  }

  componentDidRender() {
    this.sync();
  }

  // ---------- data ----------

  private clip(list: KernLogEntry[] | undefined): KernLogEntry[] {
    const all = Array.isArray(list) ? list : [];
    const max = Math.max(1, Math.floor(this.maxEntries) || 1);
    return all.length > max ? all.slice(-max) : all;
  }

  /** Keys of a list: `id`, with duplicates made unique (and reported once). */
  private keysOf(list: KernLogEntry[]): string[] {
    const seen = new Set<string>();
    return list.map((e, i) => {
      let key = String(e?.id);
      if (seen.has(key)) {
        if (!this.warned) console.warn(`kern-log: duplicate entry id "${key}"; ids must be unique.`);
        this.warned = true;
        key = `${key}~${i}`;
      }
      seen.add(key);
      return key;
    });
  }

  /** Arrival order of the current entries: new keys get the next numbers, keys no longer there are dropped. */
  private track(): string[] {
    const keys = this.keysOf(this.clip(this.entries));
    if (this.seqFor !== this.entries) {
      const next = new Map<string, number>();
      for (const key of keys) next.set(key, this.seq.get(key) ?? ++this.nextSeq);
      this.seq = next;
      this.seqFor = this.entries;
    }
    return keys;
  }

  private compute() {
    const live = this.clip(this.entries);
    const liveKeys = this.track();
    const shown = this.frozen ? this.clip(this.frozen) : live;
    // Sources of the rows shown (also while paused), of the waiting ones, and the selected ones, so no chip disappears.
    const names = new Set(this.filter.sources);
    for (const list of this.frozen ? [shown, live] : [live]) for (const e of list) if (e?.source) names.add(e.source);
    const sorted = [...names].sort((a, b) => a.localeCompare(b));
    if (sorted.join('\n') !== this.sourceOptions.map((o) => o.value).join('\n')) this.sourceOptions = sorted.map((v) => ({ value: v, label: v }));
    const keep = logFilter(this.filter);
    const shownKeys = this.frozen ? this.keysOf(shown) : liveKeys;
    this.view = [];
    this.keys = [];
    shown.forEach((e, i) => {
      if (!e || !keep(e)) return;
      this.view.push(e);
      this.keys.push(shownKeys[i]);
    });
    this.total = shown.length;
    if (this.paused) {
      this.fresh = live.filter((e, i) => (this.seq.get(liveKeys[i]) ?? 0) > this.pauseSeq && keep(e)).length;
    } else if (this.follow && this.away) {
      this.fresh = this.keys.filter((k) => (this.seq.get(k) ?? 0) > this.readSeq).length;
    } else {
      this.fresh = 0;
    }
  }

  private get filter(): KernLogFilter {
    const list = (v: unknown) => (Array.isArray(v) ? v.map(String) : typeof v === 'string' && v ? v.split(',').map((s) => s.trim()) : []);
    return { query: this.query ?? '', levels: list(this.levels), sources: list(this.sources) };
  }

  private get filtered() {
    const f = this.filter;
    return !!(f.query.trim() || f.levels.length || f.sources.length);
  }

  // ---------- rows ----------

  private atEnd() {
    const sc = this.scroller!;
    return !(sc.scrollHeight > sc.clientHeight) || sc.scrollTop + sc.clientHeight >= sc.scrollHeight - 4;
  }

  /** First row reaching into the visible area (binary search; rows are in order). */
  private firstVisible(): HTMLElement | undefined {
    const rows = this.list!.children as HTMLCollectionOf<HTMLElement>;
    const top = this.scroller!.scrollTop;
    let lo = 0;
    let hi = rows.length - 1;
    let found: HTMLElement | undefined;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      const r = rows[mid];
      if (r.offsetTop + r.offsetHeight > top) {
        found = r;
        hi = mid - 1;
      } else lo = mid + 1;
    }
    return found;
  }

  private sync() {
    const sc = this.scroller;
    const ol = this.list;
    if (!sc || !ol) return;
    const anchor = this.stick && this.follow ? undefined : this.firstVisible();
    const offset = anchor ? anchor.offsetTop - sc.scrollTop : 0;
    const focused = (this.el.shadowRoot?.activeElement as HTMLElement | null)?.closest?.('li')?.dataset.key;

    const next = new Map<string, Row>();
    const order: HTMLLIElement[] = [];
    this.view.forEach((entry, i) => {
      const key = this.keys[i];
      let row = this.rows.get(key);
      const open = this.open.has(key);
      if (!row) row = { li: document.createElement('li'), entry, query: '', open: false };
      if (!row.li.firstChild || row.entry !== entry || row.query !== this.query || row.open !== open) this.fill(row, key, entry, open);
      next.set(key, row);
      order.push(row.li);
    });
    for (const [key, row] of this.rows) if (!next.has(key)) row.li.remove();
    this.rows = next;
    let at = ol.firstChild;
    for (const li of order) {
      if (li === at) at = at.nextSibling;
      else ol.insertBefore(li, at);
    }
    for (const key of this.open) if (!next.has(key) && !this.seq.has(key)) this.open.delete(key);

    this.rove(focused);
    if (this.follow && this.stick && !this.paused) sc.scrollTop = sc.scrollHeight;
    else if (anchor?.isConnected) sc.scrollTop = anchor.offsetTop - offset;

    const away = this.follow && !this.atEnd();
    if (!away) this.readSeq = Math.max(this.readSeq, ...this.keys.slice(-1).map((k) => this.seq.get(k) ?? 0));
    if (away !== this.away) this.away = away;
    this.announceFresh();
  }

  /** Builds a row's content, as text nodes only. */
  private fill(row: Row, key: string, entry: KernLogEntry, open: boolean) {
    const li = row.li;
    const level = levelOf(entry);
    const details = detailsText(entry);
    // Rebuilding removes a focused button: remember it and focus its successor (or the row) afterwards.
    const focused = this.el.shadowRoot?.activeElement as HTMLElement | null | undefined;
    const refocus = focused && li.contains(focused) ? (['toggle', 'copy'].find((c) => focused.classList?.contains(c)) ?? '') : undefined;
    li.className = `entry ${level}`;
    li.dataset.key = key;
    li.tabIndex = -1;
    li.textContent = '';
    const add = <K extends keyof HTMLElementTagNameMap>(tag: K, cls: string, text?: string) => {
      const el = document.createElement(tag);
      el.className = cls;
      if (text != null) el.textContent = text;
      li.appendChild(el);
      return el;
    };
    if (details) {
      const toggle = add('button', 'toggle');
      toggle.type = 'button';
      toggle.tabIndex = -1;
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', this.t('labelDetails'));
      toggle.title = this.t('labelDetails');
    } else add('span', 'toggle-space');
    const time = add('time', 'time', this.formatTime(entry, 'short'));
    const iso = isoTime(entry);
    if (iso !== String(entry.time ?? '')) time.setAttribute('datetime', iso);
    time.title = this.formatTime(entry, 'full');
    add('span', 'level', String(entry.level ?? '').toUpperCase());
    const source = add('span', 'source', entry.source ?? '');
    if (entry.source) source.title = entry.source;
    const message = add('span', 'message');
    splitMatches(String(entry.message ?? ''), this.query ?? '').forEach((part, i) => {
      if (!part) return;
      if (i % 2) {
        const mark = document.createElement('mark');
        mark.textContent = part;
        message.appendChild(mark);
      } else message.appendChild(document.createTextNode(part));
    });
    const copy = add('button', 'copy');
    copy.type = 'button';
    copy.tabIndex = -1;
    copy.setAttribute('aria-label', this.t('labelCopyEntry'));
    copy.title = this.t('labelCopyEntry');
    if (details && open) add('pre', 'details', details);
    if (refocus !== undefined) ((refocus && li.querySelector<HTMLElement>(`.${refocus}`)) || li).focus({ preventScroll: true });
    row.entry = entry;
    row.query = this.query;
    row.open = open;
  }

  private formatTime(entry: KernLogEntry, style: 'short' | 'full'): string {
    const v = parseDateTime(entry.time);
    if (!v || v.dateOnly) return String(entry.time ?? '');
    const locale = resolveLocale();
    if (!this.timeFormat || this.timeFormat.locale !== locale) {
      this.timeFormat = {
        locale,
        short: new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        full: new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'medium' }),
      };
    }
    return this.timeFormat[style].format(v.date);
  }

  /** One row in the tab order (with its buttons): the active one, else the newest. */
  private rove(focusedKey?: string) {
    const rows = this.list!.children as HTMLCollectionOf<HTMLLIElement>;
    if (!rows.length) return;
    let active = this.activeKey ? this.rows.get(this.activeKey)?.li : undefined;
    if (!active) {
      active = rows[rows.length - 1];
      if (focusedKey && !this.rows.has(focusedKey)) active.focus({ preventScroll: true }); // the focused row was removed
    }
    for (const li of this.list!.querySelectorAll<HTMLElement>('[tabindex="0"]')) if (li !== active && li.parentElement !== active) li.tabIndex = -1;
    active.tabIndex = 0;
    for (const b of active.querySelectorAll('button')) b.tabIndex = 0;
  }

  private activate(li: HTMLElement | null | undefined, focus = true) {
    if (!li?.dataset.key) return;
    this.activeKey = li.dataset.key;
    this.rove();
    if (focus) li.focus();
  }

  private toggleDetails(key: string) {
    if (this.open.has(key)) this.open.delete(key);
    else this.open.add(key);
    const row = this.rows.get(key);
    if (row) {
      this.fill(row, key, row.entry, this.open.has(key));
      this.rove();
    }
  }

  private onListClick = (ev: MouseEvent) => {
    const target = ev.target as HTMLElement;
    const li = target.closest('li');
    const key = li?.dataset.key;
    if (!key) return;
    this.activeKey = key;
    if (target.closest('.toggle')) this.toggleDetails(key);
    else if (target.closest('.copy')) this.copyEntry(key);
    this.rove();
  };

  private onListFocus = (ev: FocusEvent) => {
    const li = (ev.target as HTMLElement).closest('li');
    if (li?.dataset.key && li.dataset.key !== this.activeKey) this.activate(li, false);
  };

  private onListKey = (ev: KeyboardEvent) => {
    const target = ev.target as HTMLElement;
    if (target.tagName !== 'LI') return;
    const rows = Array.from(this.list!.children) as HTMLElement[];
    const i = rows.indexOf(target);
    const go = (n: number) => {
      ev.preventDefault();
      this.activate(rows[Math.max(0, Math.min(rows.length - 1, n))]);
    };
    const key = target.dataset.key!;
    switch (ev.key) {
      case 'ArrowDown':
        return go(i + 1);
      case 'ArrowUp':
        return go(i - 1);
      case 'PageDown':
        return go(i + PAGE);
      case 'PageUp':
        return go(i - PAGE);
      case 'Home':
        return go(0);
      case 'End':
        go(rows.length - 1);
        if (this.follow) this.scrollToEnd();
        return;
      case 'Enter':
        if (this.rows.get(key) && detailsText(this.rows.get(key)!.entry)) {
          ev.preventDefault();
          this.toggleDetails(key);
        }
        return;
    }
    if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 'c' && !String(window.getSelection?.() ?? '')) {
      ev.preventDefault();
      this.copyEntry(key);
    }
  };

  private onScroll = () => {
    if (!this.follow) return;
    const away = !this.atEnd();
    if (away !== this.away) this.away = away;
  };

  // ---------- actions ----------

  private async writeClipboard(value: string, count: number, key: string) {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      return; // clipboard blocked (no secure context)
    }
    this.copiedKey = key;
    for (const b of this.list?.querySelectorAll('.copy.done') ?? []) b.classList.remove('done');
    this.rows.get(key)?.li.querySelector('.copy')?.classList.add('done');
    clearTimeout(this.copyTimer);
    this.copyTimer = setTimeout(() => {
      this.copiedKey = undefined;
      for (const b of this.list?.querySelectorAll('.copy.done') ?? []) b.classList.remove('done');
    }, 1200);
    this.kernCopy.emit({ value, count });
  }

  private copyEntry(key: string) {
    const row = this.rows.get(key);
    if (row) this.writeClipboard(entryText(row.entry), 1, key);
  }

  private copyAll = () => this.writeClipboard(this.view.map(entryText).join('\n'), this.view.length, '*');

  private download = () => {
    const value = this.view.map(entryText).join('\n');
    const ev = this.kernDownload.emit({ value, count: this.view.length, fileName: this.fileName });
    if (ev.defaultPrevented || typeof URL.createObjectURL !== 'function') return;
    const url = URL.createObjectURL(new Blob([value + '\n'], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = this.fileName;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  private setPaused(paused: boolean) {
    this.paused = paused;
    this.kernPause.emit({ paused });
  }

  private togglePause = () => this.setPaused(!this.paused);

  private jumpToLatest = () => {
    // The button removes itself; focus moves to the newest row first, so keyboard use continues there.
    if (this.paused) this.setPaused(false);
    this.activeKey = undefined;
    const last = this.list?.lastElementChild as HTMLElement | null;
    last?.focus({ preventScroll: true });
    if (!last) this.scroller?.focus({ preventScroll: true });
    this.scrollToEnd();
  };

  private setFilter(change: Partial<KernLogFilter>) {
    if (change.query !== undefined) this.query = change.query;
    if (change.levels) this.levels = change.levels;
    if (change.sources) this.sources = change.sources;
    this.kernFilter.emit(this.filter);
    clearTimeout(this.countTimer);
    this.countTimer = setTimeout(() => {
      this.announcement = this.t('labelCount').replace('{n}', String(this.view.length)).replace('{total}', String(this.total));
    }, 700);
  }

  private reset = () => this.setFilter({ query: '', levels: [], sources: [] });

  /** «New log entries: n» while not following, at most every few seconds and only when the number changed. */
  private announceFresh() {
    if (!this.fresh) {
      this.announcedFresh = 0;
      return;
    }
    if (this.fresh === this.announcedFresh || this.announceTimer) return;
    const wait = Math.max(0, this.lastAnnounced + ANNOUNCE_EVERY - Date.now());
    this.announceTimer = setTimeout(() => {
      this.announceTimer = undefined;
      if (!this.fresh || this.fresh === this.announcedFresh) return;
      this.announcedFresh = this.fresh;
      this.lastAnnounced = Date.now();
      this.announcement = this.t('labelAnnounce').replace('{n}', String(this.fresh));
    }, wait);
  }

  // ---------- render ----------

  private renderToolbar() {
    const f = this.filter;
    const labels = LOG_LEVELS.map((l) => this.t(`label${l[0].toUpperCase()}${l.slice(1)}`));
    if (labels.join('\n') !== this.levelOptions.map((o) => o.label).join('\n')) this.levelOptions = LOG_LEVELS.map((l, i) => ({ value: l, label: labels[i] }));
    return (
      <div class="bar" part="toolbar">
        {!this.noFilters && [
          <kern-input
            class="search"
            type="search"
            size="sm"
            value={f.query}
            placeholder={this.t('labelSearch')}
            ariaLabelText={this.t('labelSearch')}
            noImplicitSubmit
            onKernInput={(ev: CustomEvent<{ value: string }>) => this.setFilter({ query: ev.detail.value })}
          />,
          <kern-select
            class="levels"
            multiple
            size="sm"
            options={this.levelOptions}
            value={Array.isArray(this.levels) ? this.levels : f.levels}
            placeholder={this.t('labelAllLevels')}
            ariaLabelText={this.t('labelLevel')}
            onKernChange={(ev: CustomEvent<{ value: string | string[] }>) => this.setFilter({ levels: [ev.detail.value].flat() })}
          />,
          this.sourceOptions.length > 0 && (
            <kern-select
              class="sources"
              multiple
              searchable={this.sourceOptions.length > 8}
              size="sm"
              options={this.sourceOptions}
              value={Array.isArray(this.sources) ? this.sources : f.sources}
              placeholder={this.t('labelAllSources')}
              ariaLabelText={this.t('labelSource')}
              onKernChange={(ev: CustomEvent<{ value: string | string[] }>) => this.setFilter({ sources: [ev.detail.value].flat() })}
            />
          ),
        ]}
        <span class="spacer" />
        {this.filtered && (
          <span class="count">
            {this.t('labelCount').replace('{n}', String(this.view.length)).replace('{total}', String(this.total))}
            <kern-button size="sm" variant="ghost" onClick={this.reset}>
              {this.t('labelReset')}
            </kern-button>
          </span>
        )}
        <span class="actions">
          <kern-button size="sm" class="pause" onClick={this.togglePause}>
            {this.paused ? this.t('labelResume') : this.t('labelPause')}
          </kern-button>
          <kern-button size="sm" variant="ghost" class="copy-all" onClick={this.copyAll} disabled={!this.view.length}>
            {this.copiedKey === '*' ? this.t('labelCopied') : this.t('labelCopy')}
          </kern-button>
          <kern-button size="sm" variant="ghost" class="download" onClick={this.download} disabled={!this.view.length}>
            {this.t('labelDownload')}
          </kern-button>
        </span>
      </div>
    );
  }

  private renderJump() {
    const n = this.fresh;
    const more = this.t('labelNew').replace('{n}', String(n));
    if (this.paused) {
      return (
        <button type="button" class="latest" part="latest" onClick={this.jumpToLatest}>
          <Icon name="chevron-down" />
          {this.t('labelResume')}
          {n > 0 && <span class="fresh">{more}</span>}
        </button>
      );
    }
    if (!this.follow || !this.away) return null;
    return (
      <button type="button" class="latest" part="latest" onClick={this.jumpToLatest}>
        <Icon name="chevron-down" />
        {n > 0 ? more : this.t('labelLatest')}
      </button>
    );
  }

  render() {
    const empty = !this.view.length;
    return (
      <Host>
        {this.renderToolbar()}
        <div class="frame">
          <div class={{ scroller: true, wrap: this.wrap }} part="list" style={{ maxHeight: this.maxHeight }} tabindex={empty ? 0 : -1} ref={(el) => (this.scroller = el)} onScroll={this.onScroll}>
            <ol
              class={{ rows: true, sources: this.sourceOptions.length > 0 }}
              aria-label={this.label ?? this.t('label')}
              ref={(el) => (this.list = el)}
              onClick={this.onListClick}
              onKeyDown={this.onListKey}
              onFocusin={this.onListFocus}
            ></ol>
            {empty &&
              (this.total ? (
                <kern-empty-state variant="no-results" compact>
                  <kern-button slot="actions" size="sm" onClick={this.reset}>
                    {this.t('labelReset')}
                  </kern-button>
                </kern-empty-state>
              ) : (
                <kern-empty-state compact />
              ))}
          </div>
          {this.renderJump()}
        </div>
        <span class="sr" aria-live="polite">
          {this.announcement}
        </span>
      </Host>
    );
  }
}
