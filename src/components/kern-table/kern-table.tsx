import { Component, Element, Event, EventEmitter, Method, Prop, Watch } from '@stencil/core';
import { resolveLocale } from '../../utils/datetime';
import { isBlank, sortByValue, type KernSortDirection, type KernTableColumn } from './sort';

/** Interactive elements inside a row: clicks on them are no row clicks. */
const INTERACTIVE = 'a, button, input, select, textarea, label, summary, [role="button"], [tabindex]';

/**
 * Dense data table: wraps a native `<table>` (light DOM, so cells can hold any markup and Angular bindings).
 * Sortable column: `<th sortable>`; `sorted="asc|desc"` is the current direction (the table sets `aria-sort`),
 * `data-key` names the column (else its index). `<td data-value="-71">` sorts by that value instead of the cell text.
 * Cells: `class="mono"` (IP, MAC, IDs), `class="num"` (right-aligned figures).
 * Rows: `class="clickable"`, `aria-selected="true"`, `class="dim"` (reset/inactive).
 * Empty state: `<td colspan="…" class="empty">`.
 *
 * Data mode: with `columns` (and `rows`) the table builds its own `<table>`; don't combine it with own markup.
 * Assign new arrays to update it.
 *
 * @slot - A native `<table>` (not in data mode)
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
   * sets `sorted` on the header (in data mode: new `rows` and `columns[].sorted`).
   */
  @Prop({ reflect: true }) controlled: 'internal' | 'external' = 'internal';
  /** Data mode: column definitions. The table builds its own `<table>` from them and `rows`. */
  @Prop() columns?: KernTableColumn[];
  /** Data mode: one object per row; each column reads `row[column.key]`. */
  @Prop() rows?: any[];
  /** Data mode: classes for a row, e.g. `clickable` or `dim`. */
  @Prop() getRowClass?: (row: any, index: number) => string | undefined;
  /** Data mode: classes for a cell. */
  @Prop() getCellClass?: (row: any, column: KernTableColumn, index: number) => string | undefined;
  /** Data mode: classes for a header cell. */
  @Prop() getHeaderCellClass?: (column: KernTableColumn) => string | undefined;
  /** Loading: content dimmed, a bar under the header, `aria-busy`; in data mode without rows, skeleton rows. */
  @Prop({ reflect: true }) loading = false;
  /** Data mode: number of skeleton rows while loading without rows. */
  @Prop() loadingRows = 3;
  /** Data mode: shown when `rows` is empty. */
  @Prop() labelEmpty = 'Keine Einträge';

  /** A sortable header was activated (or `sortBy()` called), with the requested direction. Cancelable: `preventDefault()` skips the built-in sort. */
  @Event({ cancelable: true }) kernSort!: EventEmitter<{ key: string; column: number; direction: KernSortDirection }>;
  /** Data mode: a row was clicked (not on a button, link or field in it). `index` is the position in `rows`. */
  @Event() kernRowClick!: EventEmitter<{ row: any; index: number }>;

  private observer?: MutationObserver;
  /** Data mode: current sort and the data behind each rendered row. */
  private sortKey?: string;
  private sortDir?: KernSortDirection;
  private rowData = new WeakMap<Element, { row: any; index: number }>();

  connectedCallback() {
    this.el.addEventListener('click', this.onClick);
    if (typeof MutationObserver === 'undefined') return; // server-side / test DOM
    // Header changes from outside (e.g. Angular `[attr.sorted]`): only aria-sort and buttons follow, rows are not re-sorted.
    this.observer = new MutationObserver(() => this.sync());
    this.observer.observe(this.el, { childList: true, subtree: true, attributes: true, attributeFilter: ['sortable', 'sorted'] });
  }

  disconnectedCallback() {
    this.observer?.disconnect();
    this.el.removeEventListener('click', this.onClick);
  }

  componentDidLoad() {
    if (this.columns) return this.onColumns();
    this.sync();
    this.busy();
    const th = this.headers().find((h) => this.direction(h));
    if (th && this.controlled === 'internal') this.sortRows(this.column(th), this.direction(th)!);
  }

  /** New columns: header rebuilt, sort taken from `columns[].sorted`. */
  @Watch('columns')
  @Watch('getHeaderCellClass')
  onColumns() {
    const sorted = this.columns?.find((c) => c.sortable && c.sorted);
    this.sortKey = sorted?.key;
    this.sortDir = sorted?.sorted;
    this.buildHead();
    this.buildBody();
  }

  @Watch('rows')
  @Watch('loading')
  @Watch('loadingRows')
  @Watch('labelEmpty')
  @Watch('getRowClass')
  @Watch('getCellClass')
  onRows() {
    this.buildBody();
    this.busy();
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
    if (th && this.sortable(th) && this.headers().includes(th)) return this.request(th, undefined);
    if (!this.columns) return;
    // Row click: the path up to the row must not contain an interactive element (also inside components' shadow DOM).
    const path = ev.composedPath?.() ?? [];
    for (const target of path.length ? path : this.ancestors(ev.target as Element | null)) {
      const node = target as Element;
      if (typeof node.matches !== 'function') continue;
      const data = this.rowData.get(node);
      if (data) return void this.kernRowClick.emit(data);
      if (node === this.el || node.matches(INTERACTIVE)) return;
    }
  };

  private ancestors(el: Element | null): Element[] {
    const list: Element[] = [];
    for (; el; el = el.parentElement) list.push(el);
    return list;
  }

  private request(th: HTMLTableCellElement, direction: KernSortDirection | undefined) {
    const next = direction ?? (this.direction(th) === 'asc' ? 'desc' : 'asc');
    const column = this.column(th);
    const key = th.getAttribute('data-key') ?? String(column);
    const ev = this.kernSort.emit({ key, column, direction: next });
    if (ev.defaultPrevented || this.controlled === 'external') return;
    for (const h of this.headers()) {
      if (h === th) h.setAttribute('sorted', next);
      else h.removeAttribute('sorted');
    }
    this.sync();
    if (this.columns) {
      this.sortKey = key;
      this.sortDir = next;
      this.buildBody(); // body only: the header button keeps focus
    } else this.sortRows(column, next);
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

  private busy() {
    const table = this.table();
    if (!table) return;
    if (this.loading) table.setAttribute('aria-busy', 'true');
    else table.removeAttribute('aria-busy');
  }

  private collator() {
    return new Intl.Collator(resolveLocale(), { numeric: true, sensitivity: 'base' });
  }

  private sortRows(column: number, direction: KernSortDirection) {
    for (const tbody of this.children(this.table(), 'tbody')) {
      const rows = this.children(tbody, 'tr');
      const filler = rows.filter((r) => this.isFiller(r));
      const sorted = sortByValue(rows.filter((r) => !this.isFiller(r)), (row) => this.value(this.children(row, 'td', 'th')[column]), direction, this.collator());
      tbody.append(...sorted, ...filler);
    }
  }

  /** `data-value`, else the cell text. */
  private value(cell: Element | undefined): string {
    return cell?.getAttribute('data-value') ?? cell?.textContent ?? '';
  }

  /** Empty state or a cell spanning the row: stays at the end, unsorted. */
  private isFiller(row: Element) {
    const cells = this.children(row, 'td', 'th');
    return cells.some((c) => c.classList.contains('empty')) || (cells.length === 1 && Number(cells[0].getAttribute('colspan') ?? 1) > 1);
  }

  /** The slotted table (not one nested in a cell); in data mode the generated one. */
  private table(): Element | undefined {
    const tables = this.children(this.el, 'table');
    return this.columns ? tables.find((t) => t.hasAttribute('data-kern-generated')) : tables[0];
  }

  // ---- data mode ----

  /** The generated table with one thead and one tbody, created on first use. */
  private generated() {
    let table = this.table() as HTMLTableElement | undefined;
    if (!table) {
      table = document.createElement('table');
      table.setAttribute('data-kern-generated', '');
      table.append(document.createElement('thead'), document.createElement('tbody'));
      this.el.append(table);
    }
    return { table, thead: this.children(table, 'thead')[0], tbody: this.children(table, 'tbody')[0] };
  }

  private classes(...parts: (string | undefined | false)[]) {
    return parts.filter(Boolean).join(' ');
  }

  private buildHead() {
    if (!this.columns) return;
    const { thead } = this.generated();
    // Rebuilt header (e.g. new `columns[].sorted` from outside): the focused sort button keeps focus.
    const active = document.activeElement;
    const focusKey = active && thead.contains(active) ? active.closest('th')?.getAttribute('data-key') : undefined;
    const tr = document.createElement('tr');
    for (const col of this.columns) {
      const th = document.createElement('th');
      th.setAttribute('data-key', col.key);
      const cls = this.classes(col.align === 'end' && 'num', this.getHeaderCellClass?.(col));
      if (cls) th.className = cls;
      if (col.width) th.style.width = col.width;
      th.textContent = col.label;
      if (col.sortable) {
        th.setAttribute('sortable', '');
        if (col.key === this.sortKey && this.sortDir) th.setAttribute('sorted', this.sortDir);
      }
      tr.append(th);
    }
    this.replace(thead, [tr]);
    this.sync();
    if (focusKey) (Array.from(tr.children).find((th) => th.getAttribute('data-key') === focusKey)?.querySelector('button') as HTMLElement | null)?.focus();
  }

  private buildBody() {
    if (!this.columns) return;
    const { tbody } = this.generated();
    const columns = this.columns;
    const items = (this.rows ?? []).map((row, index) => ({ row, index }));
    const col = columns.find((c) => c.key === this.sortKey);
    // External: the app delivers rows already in order.
    const ordered =
      col && this.sortDir && this.controlled === 'internal'
        ? sortByValue(items, ({ row }) => (col.sortValue ? col.sortValue(row) : row?.[col.key]), this.sortDir, this.collator())
        : items;

    const trs = ordered.map(({ row, index }) => {
      const tr = document.createElement('tr');
      const rowCls = this.getRowClass?.(row, index);
      if (rowCls) tr.className = rowCls;
      this.rowData.set(tr, { row, index });
      for (const c of columns) {
        const td = document.createElement('td');
        const cls = this.classes(c.align === 'end' && 'num', c.mono && 'mono', this.getCellClass?.(row, c, index));
        if (cls) td.className = cls;
        const content = c.cell ? c.cell(row, index) : row?.[c.key];
        if (content && typeof content === 'object' && 'nodeType' in content) td.append(content);
        else td.textContent = isBlank(content) ? '–' : String(content);
        tr.append(td);
      }
      return tr;
    });

    if (!trs.length && this.loading) {
      for (let i = 0; i < this.loadingRows; i++) {
        const tr = document.createElement('tr');
        tr.className = 'skeleton';
        for (const c of columns) {
          const td = document.createElement('td');
          if (c.align === 'end') td.className = 'num';
          td.append(document.createElement('kern-skeleton'));
          tr.append(td);
        }
        trs.push(tr);
      }
    } else if (!trs.length) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.className = 'empty';
      td.setAttribute('colspan', String(columns.length));
      td.textContent = this.labelEmpty;
      tr.append(td);
      trs.push(tr);
    }
    this.replace(tbody, trs);
    this.busy();
  }

  /** Like replaceChildren (not in every test DOM). */
  private replace(parent: Element, nodes: Element[]) {
    while (parent.firstChild) parent.removeChild(parent.firstChild);
    parent.append(...nodes);
  }

  private children(parent: Element | null | undefined, ...tags: string[]): Element[] {
    return parent ? Array.from(parent.children).filter((c) => tags.includes(c.tagName.toLowerCase())) : [];
  }
}
