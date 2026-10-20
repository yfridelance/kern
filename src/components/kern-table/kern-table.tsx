import { Component, Element, Event, EventEmitter, Listen, Method, Prop, Watch } from '@stencil/core';
import { resolveLocale } from '../../utils/datetime';
import { isBlank, sortByValue, type KernSortDirection, type KernTableColumn } from './sort';

/** Interactive elements inside a row: clicks on them are no row clicks. */
const INTERACTIVE = 'a, button, input, select, textarea, label, summary, [role="button"], [tabindex]';
/** Cells the table adds itself (selection column): no column of the app's table, skipped for sorting and `column`. */
const GENERATED = 'data-kern-generated';

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
 * Pagination: `page-size` adds a `kern-pagination` below the rows. `internal` pages the rows itself (back to page 1
 * after sorting); `external` shows the rows it gets and the app loads a page on `kernPageChange` (bubbles from the
 * embedded pagination) and sets `total`. Labels: set them on `table.querySelector('kern-pagination')`.
 *
 * Selection: `selectable` adds a first column with a `kern-checkbox` per row and one in the header for the visible rows
 * of the current page. Rows are identified by `data-key` on the `<tr>` (data mode: `rowKey`, default `row.id` or the
 * index). `selected` holds the keys and survives sorting, paging and new rows; selected rows get `aria-selected="true"`.
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
  /** Rows per page; turns the pagination on. */
  @Prop({ mutable: true }) pageSize?: number;
  /** Current page, from 1. */
  @Prop({ mutable: true }) page = 1;
  /** Offered page sizes, e.g. `10,25,50`; empty hides the choice. */
  @Prop() pageSizes: number[] | string = '';
  /** `controlled="external"`: number of all rows (the table only gets the current page). */
  @Prop() total?: number;
  /** Adds a first column with a checkbox per row and a header checkbox for the visible rows of the current page. */
  @Prop({ reflect: true }) selectable = false;
  /** Keys of the selected rows (`data-key`, in data mode `rowKey`). Keys of rows not shown (filtered, other page) stay. */
  @Prop({ mutable: true }) selected: string[] = [];
  /** Data mode: key of a row for `selected`. Default: `row.id`, else the index in `rows`. */
  @Prop() rowKey?: (row: any, index: number) => string;
  /** Accessible name of the header checkbox. */
  @Prop() labelSelectAll = 'Alle auswählen';
  /** Accessible name of a row checkbox. */
  @Prop() labelSelectRow = 'Zeile auswählen';

  /** A sortable header was activated (or `sortBy()` called), with the requested direction. Cancelable: `preventDefault()` skips the built-in sort. */
  @Event({ cancelable: true }) kernSort!: EventEmitter<{ key: string; column: number; direction: KernSortDirection }>;
  /** Data mode: a row was clicked (not on a button, link or field in it). `index` is the position in `rows`. */
  @Event() kernRowClick!: EventEmitter<{ row: any; index: number }>;
  /** The selection was changed with a checkbox. Cancelable: `preventDefault()` keeps `selected` as it is. */
  @Event({ cancelable: true }) kernSelectionChange!: EventEmitter<{ selected: string[] }>;

  private observer?: MutationObserver;
  /** Data mode: current sort and the data behind each rendered row. */
  private sortKey?: string;
  private sortDir?: KernSortDirection;
  private rowData = new WeakMap<Element, { row: any; index: number }>();
  /** Row keys: data mode from `rowKey`; markup rows without `data-key` get their first position. */
  private rowKeys = new WeakMap<Element, string>();
  private nextKey = 0;

  connectedCallback() {
    this.el.addEventListener('click', this.onClick);
    if (typeof MutationObserver === 'undefined') return; // server-side / test DOM
    // Header changes from outside (e.g. Angular `[attr.sorted]`): only aria-sort and buttons follow, rows are not re-sorted.
    this.observer = new MutationObserver((records) => {
      this.sync();
      // Rows added or replaced by the app: page them again (moving rows only, no attributes it watches).
      if (records.some((r) => r.type === 'childList' && /^(TBODY|TABLE)$/.test((r.target as Element).nodeName))) this.applyPaging();
      // New cells or keys: selection cells and states follow (changes nothing when they are in place).
      else if (this.selectable) this.syncSelection();
    });
    this.observer.observe(this.el, { childList: true, subtree: true, attributes: true, attributeFilter: ['sortable', 'sorted', 'data-key'] });
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
    this.applyPaging();
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
  @Watch('rowKey')
  onRows() {
    this.buildBody();
    this.busy();
  }

  @Watch('page')
  @Watch('pageSize')
  @Watch('pageSizes')
  @Watch('total')
  onPaging() {
    if (this.columns) this.buildBody();
    else this.applyPaging();
  }

  @Watch('selectable')
  @Watch('selected')
  @Watch('labelSelectAll')
  @Watch('labelSelectRow')
  onSelected() {
    this.syncSelection();
  }

  /** A checkbox of the selection column changed: the table reports the new selection, not the checkbox. */
  @Listen('kernChange')
  onCheck(ev: CustomEvent<{ checked: boolean }>) {
    const cell = (ev.target as Element | null)?.closest?.('[data-kern-select]');
    if (!cell || cell.closest('kern-table') !== this.el) return;
    ev.stopPropagation();
    this.choose(cell, ev.detail.checked);
  }

  /** The embedded pagination changed page or size; the event keeps bubbling for the app. */
  @Listen('kernPageChange')
  onPageChange(ev: CustomEvent<{ page: number; pageSize: number }>) {
    if (ev.target !== this.pager()) return;
    this.pageSize = ev.detail.pageSize;
    this.page = ev.detail.page;
  }

  /** Sorts by a column (`data-key` or index); without `direction` it toggles, starting with `asc`. With `controlled="external"` it only emits `kernSort`. */
  @Method()
  async sortBy(column: string | number, direction?: KernSortDirection) {
    const th = this.headers().find((h, i) => (typeof column === 'number' ? i === column : h.getAttribute('data-key') === column));
    if (th && this.sortable(th)) this.request(th, direction);
  }

  private onClick = (ev: Event) => {
    // A click beside the checkbox in its cell toggles it, too.
    const target = ev.target as Element | null;
    if (target?.matches?.('[data-kern-select]')) {
      const box = target.querySelector('kern-checkbox') as any;
      if (box && !box.disabled) this.choose(target, !box.checked);
      return;
    }
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
      if (node === this.el || node.matches(INTERACTIVE) || node.hasAttribute(GENERATED)) return;
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
    } else this.sortRows(column, next);
    if (this.page !== 1) this.page = 1; // the watcher re-pages
    else this.onPaging(); // data mode: body only, so the header button keeps focus
  }

  /** Internal paging: first and last+1 index of the current page among `count` rows; clamps `page`. */
  private range(count: number): [number, number] {
    const size = Math.max(1, this.pageSize!);
    const pages = Math.max(1, Math.ceil(count / size));
    const page = Math.min(Math.max(1, this.page || 1), pages);
    if (page !== this.page) this.page = page;
    return [(page - 1) * size, page * size];
  }

  private paged() {
    return !!this.pageSize && this.controlled === 'internal';
  }

  /** The embedded pagination; created, updated or removed with `page-size`. */
  private pager(count?: number): HTMLElement | undefined {
    let p = this.childrenOf(this.el, 'kern-pagination').find((x) => x.hasAttribute('data-kern-generated')) as any;
    if (count === undefined) return p;
    if (!this.pageSize) return void p?.remove();
    if (!p) {
      p = document.createElement('kern-pagination');
      p.setAttribute('data-kern-generated', '');
      this.el.append(p);
    }
    Object.assign(p, {
      total: this.controlled === 'external' ? this.total ?? 0 : count,
      page: this.page,
      pageSize: this.pageSize,
      pageSizes: this.pageSizes,
    });
    return p;
  }

  /** Markup mode: rows outside the page get `data-kern-paged-out` (the app's own `hidden` rows don't count). */
  private applyPaging() {
    if (this.columns) return;
    const rows = this.dataRows().filter((r) => !r.hasAttribute('hidden'));
    const [from, to] = this.paged() ? this.range(rows.length) : [0, rows.length];
    rows.forEach((r, i) => {
      const out = i < from || i >= to;
      if (out !== r.hasAttribute('data-kern-paged-out')) {
        if (out) r.setAttribute('data-kern-paged-out', '');
        else r.removeAttribute('data-kern-paged-out');
      }
    });
    this.pager(rows.length);
    this.syncSelection();
  }

  /** Header cells of the last header row (the one that names the columns). */
  private headers(): HTMLTableCellElement[] {
    const rows = this.childrenOf(this.childrenOf(this.table(), 'thead')[0], 'tr');
    return this.cellsOf(rows[rows.length - 1]) as HTMLTableCellElement[];
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
    for (const tbody of this.childrenOf(this.table(), 'tbody')) {
      const rows = this.childrenOf(tbody, 'tr');
      const filler = rows.filter((r) => this.isFiller(r));
      const sorted = sortByValue(rows.filter((r) => !this.isFiller(r)), (row) => this.value(this.cellsOf(row)[column]), direction, this.collator());
      tbody.append(...sorted, ...filler);
    }
  }

  /** `data-value`, else the cell text. */
  private value(cell: Element | undefined): string {
    return cell?.getAttribute('data-value') ?? cell?.textContent ?? '';
  }

  /** Empty state or a cell spanning the row: stays at the end, unsorted. */
  private isFiller(row: Element) {
    const cells = this.cellsOf(row);
    return cells.some((c) => c.classList.contains('empty')) || (cells.length === 1 && Number(cells[0].getAttribute('colspan') ?? 1) > 1);
  }

  /** The app's cells of a row, without the generated ones. */
  private cellsOf(row: Element | undefined): Element[] {
    return this.childrenOf(row, 'td', 'th').filter((c) => !c.hasAttribute(GENERATED));
  }

  /** Body rows that hold data: no filler, empty or skeleton rows. */
  private dataRows(): Element[] {
    return this.childrenOf(this.table(), 'tbody')
      .flatMap((tb) => this.childrenOf(tb, 'tr'))
      .filter((r) => !this.isFiller(r) && !r.classList.contains('skeleton'));
  }

  /** Data rows the user sees now: not hidden by the app, on the current page. */
  private visibleRows(): Element[] {
    return this.dataRows().filter((r) => !r.hasAttribute('hidden') && !r.hasAttribute('data-kern-paged-out'));
  }

  // ---- selection ----

  /** `data-key`, in data mode `rowKey`; markup rows without one keep their first position as key. */
  private keyOf(tr: Element): string {
    const key = this.columns ? undefined : tr.getAttribute('data-key');
    if (key != null) return key;
    let auto = this.rowKeys.get(tr);
    if (auto === undefined) this.rowKeys.set(tr, (auto = String(this.nextKey++)));
    return auto;
  }

  private selection(): Set<string> {
    return new Set(Array.isArray(this.selected) ? this.selected.map(String) : []);
  }

  /** A row checkbox or the header one (all visible rows) was set to `checked`. */
  private choose(cell: Element, checked: boolean) {
    const keys = this.selection();
    const rows = cell.closest('thead') ? this.visibleRows() : [cell.parentElement!];
    for (const r of rows) {
      if (checked) keys.add(this.keyOf(r));
      else keys.delete(this.keyOf(r));
    }
    const next = Array.from(keys);
    if (!this.kernSelectionChange.emit({ selected: next }).defaultPrevented) this.selected = next;
    this.syncSelection(); // also resets the checkbox when cancelled
  }

  /** Selection column: added to or removed from every row; checkbox states and `aria-selected` from `selected`. */
  private syncSelection() {
    const table = this.table();
    if (!table) return;
    const on = this.selectable;
    const keys = this.selection();
    const head = this.childrenOf(this.childrenOf(table, 'thead')[0], 'tr');
    head.forEach((tr, i) => {
      const cell = this.selectCell(tr, on && i === 0, 'th', true);
      if (cell && head.length > 1) cell.setAttribute('rowspan', String(head.length));
    });
    const data = new Set(this.dataRows());
    for (const tr of this.childrenOf(table, 'tbody').flatMap((tb) => this.childrenOf(tb, 'tr'))) {
      if (data.has(tr)) {
        const box = this.selectCell(tr, on, 'td', true)?.firstElementChild as any;
        const selected = on && keys.has(this.keyOf(tr));
        if (box) Object.assign(box, { checked: selected, label: this.labelSelectRow });
        if (selected) {
          if (tr.getAttribute('aria-selected') !== 'true') tr.setAttribute('aria-selected', 'true');
        } else if (on && tr.hasAttribute('aria-selected')) tr.removeAttribute('aria-selected');
      } else if (this.isFiller(tr)) this.widen(tr, on ? 1 : 0);
      else this.selectCell(tr, on, 'td', false); // skeleton row
    }
    for (const tr of this.childrenOf(this.childrenOf(table, 'tfoot')[0], 'tr')) this.selectCell(tr, on, 'td', false);

    const box = this.childrenOf(head[0], 'th').find((c) => c.hasAttribute('data-kern-select'))?.firstElementChild as any;
    if (box) {
      const visible = this.visibleRows();
      const count = visible.filter((r) => keys.has(this.keyOf(r))).length;
      Object.assign(box, {
        checked: count > 0 && count === visible.length,
        indeterminate: count > 0 && count < visible.length,
        disabled: !visible.length,
        label: this.labelSelectAll,
      });
    }
  }

  /** The selection cell of a row: created first in the row when `on`, else removed. */
  private selectCell(tr: Element, on: boolean, tag: 'td' | 'th', checkbox: boolean): Element | undefined {
    let cell = this.childrenOf(tr, 'td', 'th').find((c) => c.hasAttribute('data-kern-select'));
    if (!on) {
      if (cell) {
        tr.removeChild(cell);
        tr.removeAttribute('aria-selected');
      }
      return undefined;
    }
    if (!cell) {
      cell = document.createElement(tag);
      cell.setAttribute(GENERATED, '');
      cell.setAttribute('data-kern-select', '');
      if (checkbox) cell.append(document.createElement('kern-checkbox'));
      tr.insertBefore(cell, tr.firstElementChild);
    }
    return cell;
  }

  /** A filler row's spanning cell covers `extra` generated columns, too; the app's `colspan` is kept to restore it. */
  private widen(tr: Element, extra: number) {
    const cell = this.cellsOf(tr).find((c) => c.classList.contains('empty') || c.hasAttribute('colspan'));
    if (!cell) return;
    const own = cell.getAttribute('data-kern-colspan') ?? cell.getAttribute('colspan') ?? '1';
    const span = String(Number(own) + extra);
    if (cell.getAttribute('colspan') !== span) cell.setAttribute('colspan', span);
    if (!extra) cell.removeAttribute('data-kern-colspan');
    else if (cell.getAttribute('data-kern-colspan') !== own) cell.setAttribute('data-kern-colspan', own);
  }

  /** The slotted table (not one nested in a cell); in data mode the generated one. */
  private table(): Element | undefined {
    const tables = this.childrenOf(this.el, 'table');
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
      this.el.insertBefore(table, this.pager() ?? null);
    }
    return { table, thead: this.childrenOf(table, 'thead')[0], tbody: this.childrenOf(table, 'tbody')[0] };
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
    const visible = this.paged() ? ordered.slice(...this.range(ordered.length)) : ordered;
    // Rebuilt rows (new `rows`, page, sort): a focused row checkbox keeps focus.
    const active = document.activeElement;
    const focusKey = active && tbody.contains(active) && active.closest('[data-kern-select]') ? this.keyOf(active.closest('tr')!) : undefined;

    const trs = visible.map(({ row, index }) => {
      const tr = document.createElement('tr');
      const rowCls = this.getRowClass?.(row, index);
      if (rowCls) tr.className = rowCls;
      this.rowData.set(tr, { row, index });
      this.rowKeys.set(tr, String(this.rowKey ? this.rowKey(row, index) : row?.id ?? index));
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
    this.pager(ordered.length);
    this.syncSelection();
    if (focusKey !== undefined) this.focusLater(trs.find((tr) => this.rowKeys.get(tr) === focusKey)?.querySelector('[data-kern-select] > *'));
  }

  /** Focuses a new component once it has rendered (before, a host delegating focus has nothing to focus). */
  private focusLater(el: Element | null | undefined) {
    const c = el as (HTMLElement & { componentOnReady?: () => Promise<unknown> }) | null | undefined;
    if (c?.componentOnReady) c.componentOnReady().then(() => c.focus());
    else c?.focus();
  }

  /** Like replaceChildren (not in every test DOM). */
  private replace(parent: Element, nodes: Element[]) {
    while (parent.firstChild) parent.removeChild(parent.firstChild);
    parent.append(...nodes);
  }

  private childrenOf(parent: Element | null | undefined, ...tags: string[]): Element[] {
    return parent ? Array.from(parent.children).filter((c) => tags.includes(c.tagName.toLowerCase())) : [];
  }
}
