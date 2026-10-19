import { Component, Element, Event, EventEmitter, Method, Prop } from '@stencil/core';
import { resolveLocale } from '../../utils/datetime';

export type KernSortDirection = 'asc' | 'desc';

/**
 * Dense data table: wraps a native `<table>` (light DOM, so cells can hold any markup and Angular bindings).
 * Sortable column: `<th sortable>`; `sorted="asc|desc"` is the current direction (the table sets `aria-sort`),
 * `data-key` names the column (else its index). `<td data-value="-71">` sorts by that value instead of the cell text.
 * Cells: `class="mono"` (IP, MAC, IDs), `class="num"` (right-aligned figures).
 * Rows: `class="clickable"`, `aria-selected="true"`, `class="dim"` (reset/inactive).
 * Empty state: `<td colspan="…" class="empty">`.
 *
 * @slot - A native `<table>`
 */
@Component({
  tag: 'kern-table',
  styleUrl: 'kern-table.css',
  // No encapsulation on purpose: the slotted table's th/td must be styleable.
  shadow: false,
  scoped: false,
})
export class KernTable {
  @Element() el!: HTMLElement;

  /** 30px rows instead of 36px. */
  @Prop({ reflect: true }) compact = false;
  /**
   * `internal`: the table sorts its rows itself. `external`: it only emits `kernSort`; the app orders the rows and
   * sets `sorted` on the header.
   */
  @Prop({ reflect: true }) controlled: 'internal' | 'external' = 'internal';

  /** A sortable header was activated (or `sortBy()` called), with the requested direction. Cancelable: `preventDefault()` skips the built-in sort. */
  @Event({ cancelable: true }) kernSort!: EventEmitter<{ key: string; column: number; direction: KernSortDirection }>;

  private observer?: MutationObserver;

  componentDidLoad() {
    this.sync();
    const th = this.headers().find((h) => this.direction(h));
    if (th && this.controlled === 'internal') this.sortRows(this.column(th), this.direction(th)!);
  }

  disconnectedCallback() {
    this.observer?.disconnect();
    this.el.removeEventListener('click', this.onClick);
  }

  connectedCallback() {
    this.el.addEventListener('click', this.onClick);
    if (typeof MutationObserver === 'undefined') return; // server-side / test DOM
    // Header changes from outside (e.g. Angular `[attr.sorted]`): only aria-sort and buttons follow, rows are not re-sorted.
    this.observer = new MutationObserver(() => this.sync());
    this.observer.observe(this.el, { childList: true, subtree: true, attributes: true, attributeFilter: ['sortable', 'sorted'] });
  }

  /** Sorts by a column (`data-key` or index); without `direction` it toggles, starting with `asc`. With `controlled="external"` it only emits `kernSort`. */
  @Method()
  async sortBy(column: string | number, direction?: KernSortDirection) {
    const th = this.headers().find((h, i) => (typeof column === 'number' ? i === column : h.getAttribute('data-key') === column));
    if (th && this.sortable(th)) this.request(th, direction);
  }

  private onClick = (ev: Event) => {
    const button = (ev.target as Element | null)?.closest?.('button');
    const th = button?.closest('th');
    if (th && this.sortable(th) && this.headers().includes(th)) this.request(th, undefined);
  };

  private request(th: HTMLTableCellElement, direction: KernSortDirection | undefined) {
    const next = direction ?? (this.direction(th) === 'asc' ? 'desc' : 'asc');
    const column = this.column(th);
    const ev = this.kernSort.emit({ key: th.getAttribute('data-key') ?? String(column), column, direction: next });
    if (ev.defaultPrevented || this.controlled === 'external') return;
    for (const h of this.headers()) {
      if (h === th) h.setAttribute('sorted', next);
      else h.removeAttribute('sorted');
    }
    this.sync();
    this.sortRows(column, next);
  }

  /** Header cells of the last header row (the one that names the columns). */
  private headers(): HTMLTableCellElement[] {
    const rows = this.children(this.children(this.table(), 'thead')[0], 'tr');
    return this.children(rows[rows.length - 1], 'th', 'td') as HTMLTableCellElement[];
  }

  private sortable(th: Element) {
    return th.hasAttribute('sortable') && th.getAttribute('sortable') !== 'false';
  }

  private direction(th: Element): KernSortDirection | undefined {
    const d = th.getAttribute('sorted');
    return this.sortable(th) && (d === 'asc' || d === 'desc') ? d : undefined;
  }

  private column(th: Element) {
    return this.headers().indexOf(th as HTMLTableCellElement);
  }

  /** aria-sort from `sorted`, a button in every sortable header. Headers without `sortable` are left alone. */
  private sync() {
    for (const th of this.headers()) {
      if (!this.sortable(th)) continue;
      const d = this.direction(th);
      const aria = d === 'asc' ? 'ascending' : d === 'desc' ? 'descending' : null;
      if (aria) {
        if (th.getAttribute('aria-sort') !== aria) th.setAttribute('aria-sort', aria);
      } else if (th.hasAttribute('aria-sort')) th.removeAttribute('aria-sort');
      if (!th.querySelector('button')) {
        const button = document.createElement('button');
        button.type = 'button';
        button.append(...Array.from(th.childNodes)); // moved, not copied: bindings on the text keep working
        th.append(button);
      }
    }
  }

  private sortRows(column: number, direction: KernSortDirection) {
    const collator = new Intl.Collator(resolveLocale(), { numeric: true, sensitivity: 'base' });
    const sign = direction === 'asc' ? 1 : -1;
    for (const tbody of this.children(this.table(), 'tbody')) {
      const rows = this.children(tbody, 'tr');
      const filler = rows.filter((r) => this.isFiller(r));
      const keyed = rows.filter((r) => !this.isFiller(r)).map((row) => ({ row, value: this.value(this.children(row, 'td', 'th')[column]) }));
      keyed.sort((a, b) => {
        // Empty values last in both directions.
        if (!a.value || !b.value) return a.value ? -1 : b.value ? 1 : 0;
        const na = Number(a.value);
        const nb = Number(b.value);
        return sign * (Number.isFinite(na) && Number.isFinite(nb) ? na - nb : collator.compare(a.value, b.value));
      });
      tbody.append(...keyed.map((k) => k.row), ...filler);
    }
  }

  /** `data-value`, else the trimmed text; dashes count as empty. */
  private value(cell: Element | undefined): string {
    const v = (cell?.getAttribute('data-value') ?? cell?.textContent ?? '').trim();
    return /^[-–—]?$/.test(v) ? '' : v;
  }

  /** Empty state or a cell spanning the row: stays at the end, unsorted. */
  private isFiller(row: Element) {
    const cells = this.children(row, 'td', 'th');
    return cells.some((c) => c.classList.contains('empty')) || (cells.length === 1 && Number(cells[0].getAttribute('colspan') ?? 1) > 1);
  }

  /** The slotted table (not one nested in a cell). */
  private table() {
    return this.children(this.el, 'table')[0];
  }

  private children(parent: Element | null | undefined, ...tags: string[]): Element[] {
    return parent ? Array.from(parent.children).filter((c) => tags.includes(c.tagName.toLowerCase())) : [];
  }
}
