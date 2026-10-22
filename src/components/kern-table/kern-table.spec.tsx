import { newSpecPage } from '@stencil/core/testing';
import { KernTable } from './kern-table';

const rows = [
  ['Kitchen light', '192.168.1.34', '-71', '412'],
  ['Bathroom fan', '192.168.1.21', '-58', '99'],
  ['Shutter south', '192.168.1.52', '-84', '7'],
  ['Garage door', '–', '', '–'],
];

function html(attrs = '', head = ['', '', '', '']) {
  const th = ['Name', 'IP', 'Signal', 'Uptime'].map((t, i) => `<th sortable data-key="${t.toLowerCase()}"${head[i]}>${t}</th>`).join('');
  const body = rows
    .map((r) => `<tr><td>${r[0]}</td><td>${r[1]}</td><td data-value="${r[2]}"><span>icon</span></td><td>${r[3]}</td></tr>`)
    .join('');
  return `<kern-table${attrs}><table><thead><tr>${th}</tr></thead><tbody>${body}<tr><td colspan="4" class="empty">More</td></tr></tbody></table></kern-table>`;
}

async function setup(attrs = '', head?: string[]) {
  const page = await newSpecPage({ components: [KernTable], html: html(attrs, head) });
  const names = () => Array.from(page.root!.querySelectorAll('tbody tr')).map((r) => r.firstElementChild!.textContent);
  const ths = Array.from(page.root!.querySelectorAll('th')) as HTMLElement[];
  const click = async (i: number) => {
    ths[i].querySelector('button')!.click();
    await page.waitForChanges();
  };
  return { page, names, ths, click };
}

describe('kern-table', () => {
  it('wraps sortable header content in a button', async () => {
    const { ths } = await setup();
    expect(ths[0].querySelector('button')!.textContent).toBe('Name');
    expect(ths[0].querySelector('button')!.getAttribute('type')).toBe('button');
  });

  it('sorts text, toggles direction and keeps the filler row last', async () => {
    const { names, ths, click } = await setup();
    await click(0);
    expect(names()).toEqual(['Bathroom fan', 'Garage door', 'Kitchen light', 'Shutter south', 'More']);
    expect(ths[0].getAttribute('sorted')).toBe('asc');
    expect(ths[0].getAttribute('aria-sort')).toBe('ascending');
    await click(0);
    expect(names()).toEqual(['Shutter south', 'Kitchen light', 'Garage door', 'Bathroom fan', 'More']);
    expect(ths[0].getAttribute('aria-sort')).toBe('descending');
  });

  it('sorts numbers numerically and by data-value, empty values last', async () => {
    const { names, ths, click } = await setup();
    await click(3);
    expect(names()).toEqual(['Shutter south', 'Bathroom fan', 'Kitchen light', 'Garage door', 'More']);
    await click(2);
    expect(names()).toEqual(['Shutter south', 'Kitchen light', 'Bathroom fan', 'Garage door', 'More']);
    expect(ths[3].hasAttribute('sorted')).toBe(false);
    expect(ths[3].hasAttribute('aria-sort')).toBe(false);
    await click(2);
    expect(names()).toEqual(['Bathroom fan', 'Kitchen light', 'Shutter south', 'Garage door', 'More']);
  });

  it('applies an initial sorted attribute', async () => {
    const { names, ths } = await setup('', ['', '', '', ' sorted="desc"']);
    expect(names()).toEqual(['Kitchen light', 'Bathroom fan', 'Shutter south', 'Garage door', 'More']);
    expect(ths[3].getAttribute('aria-sort')).toBe('descending');
  });

  it('only emits kernSort when controlled externally', async () => {
    const { page, names, ths, click } = await setup(' controlled="external"', ['', '', '', ' sorted="desc"']);
    expect(names()[0]).toBe('Kitchen light'); // initial order untouched
    const spy = jest.fn();
    page.root!.addEventListener('kernSort', (e: Event) => spy((e as CustomEvent).detail));
    await click(1);
    expect(spy).toHaveBeenCalledWith({ key: 'ip', column: 1, direction: 'asc' });
    expect(names()[0]).toBe('Kitchen light');
    expect(ths[1].hasAttribute('sorted')).toBe(false);
  });

  it('skips the built-in sort when kernSort is cancelled', async () => {
    const { page, names, click } = await setup();
    page.root!.addEventListener('kernSort', (e) => e.preventDefault());
    await click(0);
    expect(names()[0]).toBe('Kitchen light');
  });

  it('sorts by key or index via sortBy()', async () => {
    const { page, names, ths } = await setup();
    const table = page.root as HTMLElement & { sortBy(c: string | number, d?: string): Promise<void> };
    await table.sortBy('uptime', 'asc');
    await page.waitForChanges();
    expect(names()[0]).toBe('Shutter south');
    await table.sortBy(0, 'desc');
    await page.waitForChanges();
    expect(names()[0]).toBe('Shutter south');
    expect(ths[0].getAttribute('sorted')).toBe('desc');
    expect(ths[3].hasAttribute('sorted')).toBe(false);
  });

  it('ignores headers without sortable', async () => {
    const page = await newSpecPage({
      components: [KernTable],
      html: `<kern-table><table><thead><tr><th>Name</th></tr></thead><tbody><tr><td>B</td></tr><tr><td>A</td></tr></tbody></table></kern-table>`,
    });
    expect(page.root!.querySelector('th button')).toBeNull();
  });

  describe('data mode', () => {
    const data = [
      { name: 'Kitchen light', rssi: -71, power: 9 },
      { name: 'Bathroom fan', rssi: -58, power: 42 },
      { name: 'Shutter south', rssi: -84, power: null },
    ];
    async function build(props: Record<string, unknown> = {}) {
      const page = await newSpecPage({ components: [KernTable], html: `<kern-table></kern-table>` });
      const el = page.root as any;
      el.columns = [
        { key: 'name', label: 'Name', sortable: true },
        {
          key: 'rssi',
          label: 'Signal',
          sortable: true,
          cell: (r: any) => Object.assign(page.doc.createElement('span'), { textContent: `${r.rssi} dBm` }),
          sortValue: (r: any) => -r.rssi,
        },
        { key: 'power', label: 'Power', sortable: true, align: 'end' },
      ];
      el.rows = data;
      Object.assign(el, props);
      await page.waitForChanges();
      const cells = (col: number) => Array.from(el.querySelectorAll('tbody tr')).map((r: any) => r.children[col]?.textContent);
      const ths = () => Array.from(el.querySelectorAll('th')) as HTMLElement[];
      return { page, el, cells, ths };
    }

    it('builds header and rows from columns and rows', async () => {
      const { el, cells, ths } = await build({
        getRowClass: (r: any) => (r.power ? 'clickable' : 'dim'),
        getCellClass: (_r: any, c: any) => (c.key === 'name' ? 'strong' : undefined),
        getHeaderCellClass: (c: any) => `col-${c.key}`,
      });
      expect(ths().map((t) => t.textContent)).toEqual(['Name', 'Signal', 'Power']);
      expect(ths()[2].className).toBe('num col-power');
      expect(ths()[0].querySelector('button')).not.toBeNull();
      expect(cells(1)).toEqual(['-71 dBm', '-58 dBm', '-84 dBm']);
      expect(cells(2)).toEqual(['9', '42', '–']);
      const trs = el.querySelectorAll('tbody tr');
      expect(trs[0].className).toBe('clickable');
      expect(trs[2].className).toBe('dim');
      expect(trs[0].children[0].className).toBe('strong');
      expect(trs[0].children[2].className).toBe('num');
    });

    it('sorts a copy of rows, by sortValue, blanks last', async () => {
      const { page, el, cells, ths } = await build();
      ths()[1].querySelector('button')!.click();
      await page.waitForChanges();
      expect(cells(0)).toEqual(['Bathroom fan', 'Kitchen light', 'Shutter south']); // sortValue -rssi: 58, 71, 84
      expect(ths()[1].getAttribute('aria-sort')).toBe('ascending');
      ths()[2].querySelector('button')!.click();
      await page.waitForChanges();
      expect(cells(2)).toEqual(['9', '42', '–']);
      await el.sortBy('power', 'desc');
      await page.waitForChanges();
      expect(cells(2)).toEqual(['42', '9', '–']);
      expect(el.rows.map((r: any) => r.name)).toEqual(['Kitchen light', 'Bathroom fan', 'Shutter south']);
    });

    it('applies columns[].sorted initially', async () => {
      const page = await newSpecPage({ components: [KernTable], html: `<kern-table></kern-table>` });
      const el = page.root as any;
      el.columns = [{ key: 'name', label: 'Name', sortable: true, sorted: 'desc' }];
      el.rows = data;
      await page.waitForChanges();
      expect(Array.from(el.querySelectorAll('tbody td')).map((t: any) => t.textContent)).toEqual(['Shutter south', 'Kitchen light', 'Bathroom fan']);
      expect(el.querySelector('th').getAttribute('aria-sort')).toBe('descending');
    });

    it('only emits kernSort when controlled externally', async () => {
      const { page, el, cells, ths } = await build({ controlled: 'external' });
      const spy = jest.fn();
      el.addEventListener('kernSort', (e: CustomEvent) => spy(e.detail));
      ths()[0].querySelector('button')!.click();
      await page.waitForChanges();
      expect(spy).toHaveBeenCalledWith({ key: 'name', column: 0, direction: 'asc' });
      expect(cells(0)[0]).toBe('Kitchen light');
    });

    it('emits kernRowClick, not for buttons in the row', async () => {
      const { page, el } = await build();
      el.columns = [...el.columns, { key: 'x', label: 'Act', cell: () => Object.assign(page.doc.createElement('button'), { textContent: 'Go' }) }];
      await page.waitForChanges();
      const spy = jest.fn();
      el.addEventListener('kernRowClick', (e: CustomEvent) => spy(e.detail.index));
      (el.querySelectorAll('tbody tr')[1].children[0] as HTMLElement).click();
      (el.querySelectorAll('tbody tr')[1].querySelector('button') as HTMLElement).click();
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(1);
    });

    it('shows the empty label, skeleton rows while loading and aria-busy', async () => {
      const { page, el } = await build({ rows: [], labelEmpty: 'Nothing' });
      expect(el.querySelector('tbody td.empty').textContent).toBe('Nothing');
      expect(el.querySelector('tbody td.empty').getAttribute('colspan')).toBe('3');
      el.loading = true;
      el.loadingRows = 2;
      await page.waitForChanges();
      expect(el.querySelectorAll('tbody tr.skeleton').length).toBe(2);
      expect(el.querySelectorAll('tbody kern-skeleton').length).toBe(6);
      expect(el.querySelector('table').getAttribute('aria-busy')).toBe('true');
      el.rows = data;
      el.loading = false;
      await page.waitForChanges();
      expect(el.querySelectorAll('tbody tr').length).toBe(3);
      expect(el.querySelector('table').hasAttribute('aria-busy')).toBe(false);
    });
  });

  it('sets aria-busy on own markup while loading', async () => {
    const { page } = await setup(' loading');
    expect(page.root!.querySelector('table')!.getAttribute('aria-busy')).toBe('true');
    (page.root as any).loading = false;
    await page.waitForChanges();
    expect(page.root!.querySelector('table')!.hasAttribute('aria-busy')).toBe(false);
  });

  describe('pagination', () => {
    const many = Array.from({ length: 12 }, (_, i) => ({ n: i + 1 }));
    async function data(attrs = '') {
      const page = await newSpecPage({ components: [KernTable], html: `<kern-table${attrs}></kern-table>` });
      const el = page.root as any;
      el.columns = [{ key: 'n', label: 'N', sortable: true }];
      el.rows = many;
      await page.waitForChanges();
      const shown = () => Array.from(el.querySelectorAll('tbody td')).map((t: any) => t.textContent);
      const pager = () => el.querySelector('kern-pagination[data-kern-generated]');
      const turn = async (p: number, size = el.pageSize) => {
        pager().dispatchEvent(new CustomEvent('kernPageChange', { detail: { page: p, pageSize: size }, bubbles: true }));
        await page.waitForChanges();
      };
      return { page, el, shown, pager, turn };
    }

    it('adds no pagination without page-size', async () => {
      const { pager, shown } = await data();
      expect(pager()).toBeNull();
      expect(shown().length).toBe(12);
    });

    it('pages data internally, follows kernPageChange and clamps', async () => {
      const { page, el, shown, pager, turn } = await data(' page-size="5"');
      expect(shown()).toEqual(['1', '2', '3', '4', '5']);
      expect(pager().total).toBe(12);
      expect(pager().pageSize).toBe(5);
      await turn(3);
      expect(shown()).toEqual(['11', '12']);
      expect(el.page).toBe(3);
      el.rows = many.slice(0, 7);
      await page.waitForChanges();
      expect(el.page).toBe(2);
      expect(shown()).toEqual(['6', '7']);
      await turn(1, 10);
      expect(shown().length).toBe(7);
    });

    it('goes back to page 1 after sorting', async () => {
      const { page, el, shown, turn } = await data(' page-size="5"');
      await turn(2);
      el.querySelector('th button').click();
      await page.waitForChanges();
      expect(el.page).toBe(1);
      expect(shown()).toEqual(['1', '2', '3', '4', '5']);
      el.querySelector('th button').click();
      await page.waitForChanges();
      expect(shown()).toEqual(['12', '11', '10', '9', '8']);
    });

    it('shows all given rows and the app total when external', async () => {
      const { page, el, shown, pager } = await data(' controlled="external" page-size="5"');
      el.total = 120;
      el.page = 4;
      await page.waitForChanges();
      expect(shown().length).toBe(12);
      expect(pager().total).toBe(120);
      expect(pager().page).toBe(4);
    });

    it('pages own markup with data-kern-paged-out, keeping filler and hidden rows out of the count', async () => {
      const page = await newSpecPage({
        components: [KernTable],
        html: `<kern-table page-size="2"><table><thead><tr><th>N</th></tr></thead><tbody>
          <tr><td>a</td></tr><tr hidden><td>x</td></tr><tr><td>b</td></tr><tr><td>c</td></tr><tr><td colspan="2" class="empty">-</td></tr>
        </tbody></table></kern-table>`,
      });
      const el = page.root as any;
      const visible = () => Array.from(el.querySelectorAll('tbody tr:not([data-kern-paged-out]):not([hidden])')).map((r: any) => r.textContent.trim());
      expect(visible()).toEqual(['a', 'b', '-']);
      expect(el.querySelector('kern-pagination').total).toBe(3);
      el.page = 2;
      await page.waitForChanges();
      expect(visible()).toEqual(['c', '-']);
      el.pageSize = undefined;
      await page.waitForChanges();
      expect(visible()).toEqual(['a', 'b', 'c', '-']);
      expect(el.querySelector('kern-pagination')).toBeNull();
    });
  });

  describe('selection', () => {
    const keyed = `<table><thead><tr><th sortable data-key="name">Name</th><th sortable>N</th></tr></thead><tbody>
      <tr data-key="a"><td>Alpha</td><td>3</td></tr><tr data-key="b"><td>Bravo</td><td>1</td></tr>
      <tr data-key="c"><td>Charlie</td><td>2</td></tr><tr hidden data-key="x"><td>Hidden</td><td>9</td></tr>
      <tr><td colspan="2" class="empty">More</td></tr></tbody></table>`;
    async function markup(attrs = '') {
      const page = await newSpecPage({ components: [KernTable], html: `<kern-table selectable${attrs}>${keyed}</kern-table>` });
      const el = page.root as any;
      const head = () => el.querySelector('thead [data-kern-select] kern-checkbox');
      const box = (key: string) => el.querySelector(`tr[data-key="${key}"] > [data-kern-select] kern-checkbox`);
      const check = async (cb: Element, checked: boolean) => {
        cb.dispatchEvent(new CustomEvent('kernChange', { detail: { checked }, bubbles: true, composed: true }));
        await page.waitForChanges();
      };
      const changes: string[][] = [];
      el.addEventListener('kernSelectionChange', (e: CustomEvent) => changes.push(e.detail.selected));
      const names = () => Array.from(el.querySelectorAll('tbody tr:not([hidden])')).map((r: any) => r.querySelector('td:not([data-kern-generated])').textContent);
      return { page, el, head, box, check, changes, names };
    }

    it('adds a selection column without shifting columns or the empty row', async () => {
      const { page, el, head } = await markup();
      expect(head()).not.toBeNull();
      expect(head().label).toBe('Select all');
      expect(el.querySelectorAll('tbody [data-kern-select] kern-checkbox').length).toBe(4);
      expect(el.querySelector('tr[data-key="a"]').firstElementChild.hasAttribute('data-kern-select')).toBe(true);
      expect(el.querySelector('td.empty').getAttribute('colspan')).toBe('3');
      const spy = jest.fn();
      el.addEventListener('kernSort', (e: CustomEvent) => spy(e.detail.column));
      el.querySelectorAll('th button')[1].click();
      await page.waitForChanges();
      expect(spy).toHaveBeenCalledWith(1);
      expect(Array.from(el.querySelectorAll('tbody tr[data-key]:not([hidden])')).map((r: any) => r.dataset.key)).toEqual(['b', 'c', 'a']);
      el.selectable = false;
      await page.waitForChanges();
      expect(el.querySelector('[data-kern-select]')).toBeNull();
      expect(el.querySelector('td.empty').getAttribute('colspan')).toBe('2');
    });

    it('selects rows by data-key, sets aria-selected and keeps the selection when sorting', async () => {
      const { page, el, head, box, check, changes, names } = await markup();
      const outer = jest.fn();
      page.body.addEventListener('kernChange', outer);
      await check(box('b'), true);
      expect(el.selected).toEqual(['b']);
      expect(changes).toEqual([['b']]);
      expect(outer).not.toHaveBeenCalled();
      expect(el.querySelector('tr[data-key="b"]').getAttribute('aria-selected')).toBe('true');
      expect(box('b').checked).toBe(true);
      expect(head().indeterminate).toBe(true);
      expect(head().checked).toBe(false);
      await el.sortBy('name', 'desc');
      await page.waitForChanges();
      expect(names()).toEqual(['Charlie', 'Bravo', 'Alpha', 'More']);
      expect(box('b').checked).toBe(true);
      await check(box('b'), false);
      expect(el.selected).toEqual([]);
      expect(el.querySelector('tr[data-key="b"]').hasAttribute('aria-selected')).toBe(false);
    });

    it('selects all visible rows from the header, keeping hidden ones', async () => {
      const { page, el, head, check } = await markup();
      el.selected = ['x'];
      await page.waitForChanges();
      expect(head().checked).toBe(false);
      expect(head().indeterminate).toBe(false);
      await check(head(), true);
      expect([...el.selected].sort()).toEqual(['a', 'b', 'c', 'x']);
      expect(head().checked).toBe(true);
      await check(head(), false);
      expect(el.selected).toEqual(['x']);
    });

    it('limits the header checkbox to the current page', async () => {
      const { page, el, head, box, check } = await markup(' page-size="2"');
      await check(head(), true);
      expect(el.selected).toEqual(['a', 'b']);
      el.page = 2;
      await page.waitForChanges();
      expect(head().checked).toBe(false);
      expect(head().indeterminate).toBe(false);
      await check(box('c'), true);
      expect(head().checked).toBe(true);
      el.page = 1;
      await page.waitForChanges();
      expect(head().checked).toBe(true);
      expect(el.selected).toEqual(['a', 'b', 'c']);
    });

    it('keeps selected when kernSelectionChange is cancelled', async () => {
      const { el, box, check } = await markup();
      el.addEventListener('kernSelectionChange', (e: Event) => e.preventDefault());
      await check(box('a'), true);
      expect(el.selected).toEqual([]);
      expect(box('a').checked).toBe(false);
    });

    it('toggles on a click beside the checkbox', async () => {
      const { page, el } = await markup();
      el.querySelector('tr[data-key="c"] > [data-kern-select]').click();
      await page.waitForChanges();
      expect(el.selected).toEqual(['c']);
    });

    it('works with controlled="external"', async () => {
      const { el, head, box, check } = await markup(' controlled="external" page-size="2"');
      await check(head(), true);
      expect([...el.selected].sort()).toEqual(['a', 'b', 'c']); // external: all given rows are the page
      await check(box('a'), false);
      expect(head().indeterminate).toBe(true);
    });

    describe('data mode', () => {
      const devices = [
        { id: 'k', name: 'Kitchen light', power: 9 },
        { id: 'b', name: 'Bathroom fan', power: 42 },
        { id: 's', name: 'Shutter south', power: 3 },
      ];
      async function data(props: Record<string, unknown> = {}) {
        const page = await newSpecPage({ components: [KernTable], html: `<kern-table selectable></kern-table>` });
        const el = page.root as any;
        el.columns = [
          { key: 'name', label: 'Name', sortable: true },
          { key: 'power', label: 'Power', sortable: true },
        ];
        el.rows = devices;
        Object.assign(el, props);
        await page.waitForChanges();
        const boxes = () => Array.from(el.querySelectorAll('tbody [data-kern-select] kern-checkbox')) as any[];
        const head = () => el.querySelector('thead [data-kern-select] kern-checkbox');
        const names = () => Array.from(el.querySelectorAll('tbody tr')).map((r: any) => r.children[1]?.textContent);
        const check = async (cb: Element, checked: boolean) => {
          cb.dispatchEvent(new CustomEvent('kernChange', { detail: { checked }, bubbles: true }));
          await page.waitForChanges();
        };
        return { page, el, boxes, head, names, check };
      }

      it('uses row.id as key and keeps the selection through sorting and new rows', async () => {
        const { page, el, boxes, names, check } = await data();
        expect(el.querySelectorAll('thead th').length).toBe(3);
        await check(boxes()[1], true);
        expect(el.selected).toEqual(['b']);
        el.querySelectorAll('th button')[0].click();
        await page.waitForChanges();
        expect(names()).toEqual(['Bathroom fan', 'Kitchen light', 'Shutter south']);
        expect(boxes().map((b) => b.checked)).toEqual([true, false, false]);
        expect(el.querySelector('tbody tr').getAttribute('aria-selected')).toBe('true');
        el.rows = devices.slice(2);
        await page.waitForChanges();
        expect(el.selected).toEqual(['b']);
        el.rows = devices;
        await page.waitForChanges();
        expect(boxes().map((b) => b.checked)).toEqual([true, false, false]);
      });

      it('uses rowKey, else a key per object, else the index', async () => {
        const plain = devices.map(({ name, power }) => ({ name, power }));
        const { page, el, boxes, check } = await data({ rows: plain });
        await check(boxes()[2], true);
        expect(el.selected).toEqual([expect.stringMatching(/^~\d+$/)]);
        el.rowKey = (r: any) => r.name;
        await page.waitForChanges();
        await check(boxes()[0], true);
        expect(el.selected[1]).toBe('Kitchen light');
        el.rowKey = undefined;
        el.rows = ['a', 'b'];
        el.columns = [{ key: 'x', label: 'X', cell: (r: any) => r }];
        el.selected = [];
        await page.waitForChanges();
        await check(boxes()[1], true);
        expect(el.selected).toEqual(['1']);
      });

      it('without id: the selection stays with the object when the rows are swapped or filtered', async () => {
        const plain = devices.map(({ name, power }) => ({ name, power }));
        const { page, el, boxes, names, check } = await data({ rows: plain });
        await check(boxes()[1], true);
        el.rows = [plain[2], plain[1], plain[0]];
        await page.waitForChanges();
        expect(names()).toEqual(['Shutter south', 'Bathroom fan', 'Kitchen light']);
        expect(boxes().map((b) => b.checked)).toEqual([false, true, false]);
        el.rows = [plain[0], plain[2]];
        await page.waitForChanges();
        expect(el.selected.length).toBe(1);
        expect(boxes().map((b) => b.checked)).toEqual([false, false]);
        el.rows = plain;
        await page.waitForChanges();
        expect(boxes().map((b) => b.checked)).toEqual([false, true, false]);
      });

      it('without id: new objects do not take over the selection', async () => {
        const plain = () => devices.map(({ name, power }) => ({ name, power }));
        const { page, el, boxes, check } = await data({ rows: plain() });
        await check(boxes()[0], true);
        el.rows = plain();
        await page.waitForChanges();
        expect(boxes().map((b) => b.checked)).toEqual([false, false, false]);
        expect(el.querySelector('tbody tr[aria-selected="true"]')).toBeNull();
      });

      it('with ids: filtering and external pages keep the selection', async () => {
        const { page, el, boxes, check } = await data({ controlled: 'external', pageSize: 2, total: 3 });
        await check(boxes()[1], true);
        el.rows = [{ ...devices[2] }];
        await page.waitForChanges();
        expect(boxes().map((b) => b.checked)).toEqual([false]);
        el.rows = devices.slice(0, 2).map((d) => ({ ...d }));
        await page.waitForChanges();
        expect(el.selected).toEqual(['b']);
        expect(boxes().map((b) => b.checked)).toEqual([false, true]);
      });

      it('warns once about duplicate keys and rowKey without a key', async () => {
        const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
        try {
          const { page, el } = await data({ rows: [devices[0], { ...devices[0] }] });
          expect(warn).toHaveBeenCalledTimes(1);
          expect(warn.mock.calls[0][0]).toContain('rowKey');
          el.rows = [...el.rows];
          el.rowKey = () => undefined;
          await page.waitForChanges();
          expect(warn).toHaveBeenCalledTimes(1);
          const other = await data({ rowKey: () => null });
          expect(warn).toHaveBeenCalledTimes(2);
          expect(warn.mock.calls[1][0]).toContain('rowKey returned null');
          expect(other.el.querySelectorAll('tbody tr').length).toBe(3);
        } finally {
          warn.mockRestore();
        }
      });

      it('does not warn with unique keys', async () => {
        const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
        try {
          await data();
          await data({ rows: devices.map(({ name }) => ({ name })) });
          expect(warn).not.toHaveBeenCalled();
        } finally {
          warn.mockRestore();
        }
      });

      it('pages: the header covers the current page only', async () => {
        const { page, el, boxes, head, check } = await data({ pageSize: 2 });
        await check(head(), true);
        expect(el.selected).toEqual(['k', 'b']);
        el.page = 2;
        await page.waitForChanges();
        expect(boxes().length).toBe(1);
        expect(head().checked).toBe(false);
        await check(boxes()[0], true);
        expect(head().checked).toBe(true);
      });

      it('is no row click and widens the empty row', async () => {
        const { page, el } = await data();
        const spy = jest.fn();
        el.addEventListener('kernRowClick', spy);
        el.querySelector('tbody [data-kern-select]').click();
        el.querySelector('tbody [data-kern-select] kern-checkbox').click();
        await page.waitForChanges();
        expect(spy).not.toHaveBeenCalled();
        expect(el.selected).toEqual(['k']);
        el.rows = [];
        await page.waitForChanges();
        expect(el.querySelector('td.empty').getAttribute('colspan')).toBe('3');
        expect(el.querySelector('thead kern-checkbox').disabled).toBe(true);
      });
    });
  });

  describe('detail rows', () => {
    const body = `<table><thead><tr><th sortable data-key="name">Name</th><th sortable>N</th></tr></thead><tbody>
      <tr data-key="a"><td><button kern-expand>Alpha</button></td><td>3</td></tr><tr kern-details><td>Details A</td></tr>
      <tr data-key="b"><td>Bravo</td><td>1</td></tr>
      <tr data-key="c"><td><button kern-expand>Charlie</button></td><td>2</td></tr><tr kern-details><td>Details C</td></tr>
      <tr><td colspan="2" class="empty">More</td></tr></tbody></table>`;
    async function markup(attrs = '') {
      const page = await newSpecPage({ components: [KernTable], html: `<kern-table${attrs}>${body}</kern-table>` });
      const el = page.root as any;
      const order = () => Array.from(el.querySelectorAll('tbody tr')).map((r: any) => r.dataset.key ?? (r.hasAttribute('kern-details') ? r.textContent.trim() : 'filler'));
      const open = () => Array.from(el.querySelectorAll('tr[kern-details][data-kern-open]')).map((r: any) => r.textContent.trim());
      const button = (key: string) => el.querySelector(`tr[data-key="${key}"] [kern-expand]`) as HTMLElement;
      const toggles: unknown[] = [];
      el.addEventListener('kernRowToggle', (e: CustomEvent) => toggles.push(e.detail));
      return { page, el, order, open, button, toggles };
    }

    it('hides detail rows, spans all columns and wires the toggle', async () => {
      const { page, el, open, button, toggles } = await markup();
      expect(open()).toEqual([]);
      const details = el.querySelector('tr[kern-details]');
      expect(details.firstElementChild.getAttribute('colspan')).toBe('2');
      expect(button('a').getAttribute('aria-expanded')).toBe('false');
      expect(button('a').getAttribute('aria-controls')).toBe(details.id);
      expect(details.id).toBeTruthy();
      button('a').click();
      await page.waitForChanges();
      expect(open()).toEqual(['Details A']);
      expect(el.expanded).toEqual(['a']);
      expect(toggles).toEqual([{ key: 'a', open: true }]);
      expect(button('a').getAttribute('aria-expanded')).toBe('true');
      button('a').click();
      await page.waitForChanges();
      expect(open()).toEqual([]);
      expect(toggles[1]).toEqual({ key: 'a', open: false });
    });

    it('moves detail rows with their row when sorting, not counted as rows', async () => {
      const { page, el, order } = await markup();
      el.querySelectorAll('th button')[1].click();
      await page.waitForChanges();
      expect(order()).toEqual(['b', 'c', 'Details C', 'a', 'Details A', 'filler']);
      await el.sortBy('name', 'desc');
      await page.waitForChanges();
      expect(order()).toEqual(['c', 'Details C', 'b', 'a', 'Details A', 'filler']);
    });

    it('pages without counting detail rows and hides them with their row', async () => {
      const { page, el, open } = await markup(' page-size="2"');
      expect(el.querySelector('kern-pagination').total).toBe(3);
      await el.toggleRow('a');
      await el.toggleRow('c', true);
      await page.waitForChanges();
      expect(el.expanded).toEqual(['a', 'c']);
      expect(open()).toEqual(['Details A']);
      expect(el.querySelector('tr[data-key="b"]').hasAttribute('data-kern-paged-out')).toBe(false);
      el.page = 2;
      await page.waitForChanges();
      expect(open()).toEqual(['Details C']);
      await el.toggleRow('c', true); // no change, no event
      await el.toggleRow('c', false);
      await page.waitForChanges();
      expect(open()).toEqual([]);
    });

    it('keeps expanded when kernRowToggle is cancelled', async () => {
      const { page, el, button, open } = await markup();
      el.addEventListener('kernRowToggle', (e: Event) => e.preventDefault());
      button('c').click();
      await page.waitForChanges();
      expect(el.expanded).toEqual([]);
      expect(open()).toEqual([]);
    });

    it('spans the selection column and gets no checkbox', async () => {
      const { page, el, button, open } = await markup(' selectable controlled="external"');
      expect(el.querySelectorAll('tbody [data-kern-select] kern-checkbox').length).toBe(3);
      expect(el.querySelector('tr[kern-details]').querySelector('[data-kern-select]')).toBeNull();
      expect(el.querySelector('tr[kern-details] td').getAttribute('colspan')).toBe('3');
      button('a').click();
      await page.waitForChanges();
      expect(open()).toEqual(['Details A']);
      const head = el.querySelector('thead kern-checkbox');
      head.dispatchEvent(new CustomEvent('kernChange', { detail: { checked: true }, bubbles: true }));
      await page.waitForChanges();
      expect(el.selected).toEqual(['a', 'b', 'c']);
    });

    describe('data mode', () => {
      const devices = [
        { id: 'k', name: 'Kitchen light' },
        { id: 'b', name: 'Bathroom fan' },
        { id: 's', name: 'Shutter south' },
      ];
      async function data(props: Record<string, unknown> = {}) {
        const page = await newSpecPage({ components: [KernTable], html: `<kern-table></kern-table>` });
        const el = page.root as any;
        const detail = jest.fn((r: any) => `Details ${r.name}`);
        el.columns = [{ key: 'name', label: 'Name', sortable: true }];
        el.rows = devices;
        el.detail = detail;
        Object.assign(el, props);
        await page.waitForChanges();
        const order = () => Array.from(el.querySelectorAll('tbody tr')).map((r: any) => (r.hasAttribute('kern-details') ? `[${r.hasAttribute('data-kern-open') ? r.textContent : ''}]` : r.textContent));
        const toggle = async (i: number) => {
          (el.querySelectorAll('tbody tr:not([kern-details]) [kern-expand]')[i] as HTMLElement).click();
          await page.waitForChanges();
        };
        return { page, el, detail, order, toggle };
      }

      it('adds a toggle column and builds details on first opening', async () => {
        const { page, el, detail, order, toggle } = await data();
        expect(el.querySelectorAll('thead th').length).toBe(2);
        expect(el.querySelector('th[data-kern-expand]')).not.toBeNull();
        expect(el.querySelector('tbody [kern-expand]').getAttribute('aria-label')).toBe('Show details');
        expect(detail).not.toHaveBeenCalled();
        const spy = jest.fn();
        el.addEventListener('kernRowClick', spy);
        await toggle(1);
        expect(spy).not.toHaveBeenCalled();
        expect(el.expanded).toEqual(['b']);
        expect(detail).toHaveBeenCalledTimes(1);
        expect(order()).toEqual(['Kitchen light', '[]', 'Bathroom fan', '[Details Bathroom fan]', 'Shutter south', '[]']);
        expect(el.querySelector('tr[kern-details] td').getAttribute('colspan')).toBe('2');
        el.querySelector('th:not([data-kern-generated]) button').click();
        await page.waitForChanges();
        expect(order()).toEqual(['Bathroom fan', '[Details Bathroom fan]', 'Kitchen light', '[]', 'Shutter south', '[]']);
        expect(el.querySelector('tbody [kern-expand]').getAttribute('aria-expanded')).toBe('true');
      });

      it('keeps expanded with paging, selection and new rows', async () => {
        const { page, el, order, toggle } = await data({ pageSize: 2, selectable: true });
        expect(el.querySelector('tr[kern-details] td').getAttribute('colspan')).toBe('3');
        await toggle(0);
        el.page = 2;
        await page.waitForChanges();
        expect(order()).toEqual(['Shutter south', '[]']);
        expect(el.querySelector('kern-pagination').total).toBe(3);
        el.page = 1;
        el.rows = [...devices];
        await page.waitForChanges();
        expect(order()[1]).toBe('[Details Kitchen light]');
        await el.toggleRow('k');
        await page.waitForChanges();
        expect(order()[1]).toBe('[]');
      });

      it('without id: expanded follows the object, not its position', async () => {
        const plain = devices.map(({ name }) => ({ name }));
        const { page, el, order, toggle } = await data({ rows: plain });
        await toggle(0);
        el.rows = [plain[1], plain[0], plain[2]];
        await page.waitForChanges();
        expect(order()).toEqual(['Bathroom fan', '[]', 'Kitchen light', '[Details Kitchen light]', 'Shutter south', '[]']);
        el.rows = plain.map((r) => ({ ...r }));
        await page.waitForChanges();
        expect(order().filter((t: string) => t.startsWith('[Details'))).toEqual([]);
      });

      it('widens the empty row by the toggle column', async () => {
        const { el, page } = await data();
        el.rows = [];
        await page.waitForChanges();
        expect(el.querySelector('td.empty').getAttribute('colspan')).toBe('2');
      });
    });
  });

  describe('data mode: kept rows', () => {
    const devices = [
      { id: 'k', name: 'Kitchen light', power: 9 },
      { id: 'b', name: 'Bathroom fan', power: 42 },
      { id: 's', name: 'Shutter south', power: 3 },
      { id: 'g', name: 'Garage door', power: 0 },
    ];
    async function data(props: Record<string, unknown> = {}) {
      const page = await newSpecPage({ components: [KernTable], html: `<kern-table></kern-table>` });
      const el = page.root as any;
      const made = jest.fn();
      el.columns = [
        { key: 'name', label: 'Name', sortable: true },
        { key: 'power', label: 'Power', sortable: true, align: 'end' },
        {
          key: 'action',
          label: 'Action',
          // Keeps its button: updates the one it gets, creates one only the first time.
          cell: (r: any, _i: number, current?: HTMLButtonElement) => {
            const b = current ?? (made(r.id), page.doc.createElement('button'));
            b.textContent = `Restart ${r.name}`;
            return b;
          },
        },
      ];
      el.rows = devices;
      Object.assign(el, props);
      await page.waitForChanges();
      const trs = () => Array.from(el.querySelectorAll('tbody tr:not([kern-details])')) as HTMLTableRowElement[];
      const row = (name: string) => trs().find((tr) => tr.textContent!.includes(name))!;
      const names = () => trs().map((tr) => tr.querySelector('td:not([data-kern-generated])')!.textContent);
      const update = async (rows: any[]) => {
        el.rows = rows;
        await page.waitForChanges();
      };
      return { page, el, made, trs, row, names, update };
    }

    it('keeps the <tr> of a key and only touches changed cells', async () => {
      const { el, made, trs, row, update } = await data({ getRowClass: (r: any) => (r.power ? undefined : 'dim') });
      const before = trs();
      const kitchen = row('Kitchen light');
      const name = kitchen.children[0].firstChild;
      const power = kitchen.children[1].firstChild;
      expect(row('Garage door').className).toBe('dim');
      await update(devices.map((d) => (d.id === 'k' ? { ...d, power: 11 } : d.id === 'g' ? { ...d, power: 5 } : { ...d })));
      expect(trs()).toEqual(before);
      expect(kitchen.children[0].firstChild).toBe(name); // same text: not set again
      expect(kitchen.children[1].firstChild).not.toBe(power);
      expect(kitchen.children[1].textContent).toBe('11');
      expect(kitchen.children[1].className).toBe('num');
      expect(row('Garage door').hasAttribute('class')).toBe(false);
      expect(made).toHaveBeenCalledTimes(4);
      expect(el.querySelectorAll('tbody button').length).toBe(4);
    });

    // Focus itself is checked in a browser (e2e/table.spec.ts): the test DOM has no focus.
    it('keeps the button a cell returns again through new rows', async () => {
      const { made, row, names, update } = await data();
      const button = row('Bathroom fan').querySelector('button')!;
      // Moved to the top and renamed.
      await update([{ ...devices[1], name: 'Fan' }, devices[0], devices[2], devices[3]]);
      expect(names()).toEqual(['Fan', 'Kitchen light', 'Shutter south', 'Garage door']);
      expect(row('Fan').querySelector('button') === button).toBe(true);
      expect(button.textContent).toBe('Restart Fan');
      expect(made).toHaveBeenCalledTimes(4);
    });

    it('replaces a node that cell() returns anew and removes the old one', async () => {
      const { page, el, row, update } = await data();
      el.columns = [{ key: 'name', label: 'Name', cell: (r: any) => Object.assign(page.doc.createElement('b'), { textContent: r.name }) }];
      await page.waitForChanges();
      const tr = row('Kitchen light');
      const old = tr.querySelector('b')!;
      await update(devices.map((d) => ({ ...d })));
      expect(row('Kitchen light')).toBe(tr);
      expect(tr.querySelectorAll('b').length).toBe(1);
      expect(tr.querySelector('b')).not.toBe(old);
      expect(old.parentNode).toBeNull();
    });

    it('moves rows when sorting and paging, drops rows no longer shown', async () => {
      const { page, el, trs, row, names, update } = await data({ pageSize: 3 });
      const kept = { k: row('Kitchen light'), b: row('Bathroom fan'), s: row('Shutter south') };
      el.querySelector('th[data-key="power"] button').click();
      await page.waitForChanges();
      expect(names()).toEqual(['Garage door', 'Shutter south', 'Kitchen light']);
      expect(row('Shutter south')).toBe(kept.s);
      expect(row('Kitchen light')).toBe(kept.k);
      expect(trs()).not.toContain(kept.b);
      el.page = 2;
      await page.waitForChanges();
      expect(names()).toEqual(['Bathroom fan']);
      expect(trs()).not.toContain(kept.k); // left with its page
      el.page = 1;
      await page.waitForChanges();
      const kitchen = row('Kitchen light');
      await update(devices.filter((d) => d.id !== 's'));
      expect(names()).toEqual(['Garage door', 'Kitchen light', 'Bathroom fan']);
      expect(row('Kitchen light') === kitchen).toBe(true);
      expect(el.querySelector('tbody').textContent).not.toContain('Shutter south');
      await update([]);
      expect(el.querySelectorAll('tbody tr').length).toBe(1);
      expect(el.querySelector('td.empty')).not.toBeNull();
      el.loading = true;
      await update([]);
      expect(el.querySelectorAll('tbody tr.skeleton').length).toBe(3);
      await update(devices);
      expect(el.querySelectorAll('tbody tr.skeleton').length).toBe(0);
      expect(names()).toEqual(['Garage door', 'Shutter south', 'Kitchen light']);
    });

    it('keeps open details, their content and the selection', async () => {
      const detail = jest.fn((r: any) => Object.assign(document.createElement('pre'), { textContent: `Log ${r.name}` }));
      const { page, el, row, update } = await data({ detail, selectable: true, selected: ['b'], expanded: ['b'] });
      const tr = row('Bathroom fan');
      const box = tr.querySelector('[data-kern-select] kern-checkbox');
      const toggle = tr.querySelector('[kern-expand]');
      const log = el.querySelector('tr[kern-details][data-kern-open] pre');
      expect(log.textContent).toBe('Log Bathroom fan');
      await update([...devices].reverse().map((d) => ({ ...d, power: d.power + 1 })));
      expect(row('Bathroom fan')).toBe(tr);
      expect(tr.querySelector('[data-kern-select] kern-checkbox')).toBe(box);
      expect(tr.querySelector('[kern-expand]')).toBe(toggle);
      expect(tr.getAttribute('aria-selected')).toBe('true');
      expect((box as any).checked).toBe(true);
      expect(tr.nextElementSibling!.hasAttribute('data-kern-open')).toBe(true);
      expect(tr.nextElementSibling!.querySelector('pre')).toBe(log);
      expect(detail).toHaveBeenCalledTimes(1);
      // Each row keeps its detail row right after it.
      const rows = Array.from(el.querySelectorAll('tbody tr')) as Element[];
      rows.forEach((r, i) => expect(r.hasAttribute('kern-details')).toBe(i % 2 === 1));
      expect(page.root!.querySelectorAll('tbody [data-kern-select]').length).toBe(4);
    });

    it('builds the rows anew for new columns', async () => {
      const { page, el, row } = await data();
      const tr = row('Kitchen light');
      el.columns = [{ key: 'name', label: 'Name' }];
      await page.waitForChanges();
      expect(row('Kitchen light')).not.toBe(tr);
      expect(row('Kitchen light').children.length).toBe(1);
    });
  });

  describe('data mode: column state', () => {
    const devices = [
      { id: 'k', name: 'Kitchen light', ip: '192.168.1.34', power: 9 },
      { id: 'b', name: 'Bathroom fan', ip: '192.168.1.21', power: 42 },
      { id: 's', name: 'Shutter south', ip: '192.168.1.52', power: 7 },
    ];
    async function data(props: Record<string, unknown> = {}) {
      const page = await newSpecPage({ components: [KernTable], html: `<kern-table></kern-table>` });
      const el = page.root as any;
      el.columns = [
        { key: 'name', label: 'Name', sortable: true, hideable: false, minWidth: '160px' },
        {
          key: 'ip',
          label: 'IP',
          cell: (d: any, _i: number, current?: Node) => {
            const b = (current as HTMLButtonElement) ?? page.doc.createElement('button');
            b.textContent = d.ip;
            return b;
          },
        },
        { key: 'power', label: 'Power', sortable: true, align: 'end' },
      ];
      el.rows = devices;
      Object.assign(el, props);
      await page.waitForChanges();
      const heads = () => Array.from(el.querySelectorAll('thead th:not([data-kern-generated])')).map((t: any) => t.getAttribute('data-key'));
      const row = (name: string) => Array.from(el.querySelectorAll('tbody tr')).find((r: any) => r.textContent.includes(name)) as HTMLElement;
      const own = (tr: Element) => Array.from(tr.children).filter((c) => !c.hasAttribute('data-kern-generated')).map((c) => c.textContent);
      const set = async (state: unknown) => {
        el.columnState = state;
        await page.waitForChanges();
      };
      return { page, el, heads, row, own, set };
    }

    it('shows, hides and orders columns by key, keeping rows and cells', async () => {
      const { el, heads, row, own, set } = await data();
      expect(heads()).toEqual(['name', 'ip', 'power']);
      expect(el.querySelector('th[data-key="name"]').style.minWidth).toBe('160px');
      const tr = row('Kitchen light');
      const button = tr.querySelector('button');
      await set([{ key: 'power' }, { key: 'name' }, { key: 'ip', hidden: true }, { key: 'nope' }]);
      expect(heads()).toEqual(['power', 'name']);
      expect(own(tr)).toEqual(['9', 'Kitchen light']);
      expect(row('Kitchen light')).toBe(tr);
      // Columns the state doesn't name come after their neighbour in `columns`.
      await set([{ key: 'ip' }, { key: 'name' }]);
      expect(heads()).toEqual(['ip', 'power', 'name']);
      expect(own(tr)).toEqual(['192.168.1.34', '9', 'Kitchen light']);
      expect(tr.querySelector('button')).not.toBe(button); // hidden cells go with their content
      const shown = tr.querySelector('button');
      await set([{ key: 'name' }, { key: 'ip' }]);
      expect(tr.querySelector('button')).toBe(shown); // a moved cell keeps its content
      expect(row('Kitchen light')).toBe(tr);
    });

    it('keeps columns that cannot be hidden and the minimum of visible columns', async () => {
      const { el, page, heads, set } = await data();
      await set([{ key: 'name', hidden: true }, { key: 'ip', hidden: true }, { key: 'power', hidden: true }]);
      expect(heads()).toEqual(['name']);
      el.minVisibleColumns = 2;
      await page.waitForChanges();
      expect(heads()).toEqual(['name', 'ip']);
      expect(el.querySelector('tbody tr').children.length).toBe(2);
    });

    it('takes the default state from columns[].hidden and .pinned', async () => {
      const { el, page, heads } = await data();
      el.columns = [
        { key: 'power', label: 'Power', pinned: 'end' },
        { key: 'name', label: 'Name' },
        { key: 'ip', label: 'IP', hidden: true },
      ];
      await page.waitForChanges();
      expect(heads()).toEqual(['name', 'power']);
      expect(el.querySelector('th[data-key="power"]').getAttribute('data-kern-pin')).toBe('end');
    });

    it('sorts, pages, selects and expands across column changes', async () => {
      const { el, page, heads, row, own, set } = await data({ selectable: true, selected: ['b'], detail: (d: any) => d.name, expanded: ['b'], pageSize: 2 });
      await el.sortBy('power', 'desc');
      await page.waitForChanges();
      await set([{ key: 'power', hidden: true }]);
      expect(heads()).toEqual(['name', 'ip']);
      // Still sorted by the hidden column, page 1 of 2.
      expect(Array.from(el.querySelectorAll('tbody tr:not([kern-details])')).map((r: any) => own(r)[0])).toEqual(['Bathroom fan', 'Kitchen light']);
      const tr = row('Bathroom fan');
      expect(tr.getAttribute('aria-selected')).toBe('true');
      expect(Array.from(tr.children).slice(0, 2).map((c) => c.hasAttribute('data-kern-select') || c.hasAttribute('data-kern-expand'))).toEqual([true, true]);
      const details = tr.nextElementSibling!;
      expect(details.hasAttribute('data-kern-open')).toBe(true);
      expect(details.firstElementChild!.getAttribute('colspan')).toBe('4');
      expect(el.querySelector('kern-pagination').total).toBe(3);
    });

    it('pins columns and the generated cells before them', async () => {
      const { el, set } = await data({ selectable: true, detail: (d: any) => d.name });
      await set([{ key: 'name', pinned: 'start' }, { key: 'power', pinned: 'end' }]);
      for (const tr of Array.from(el.querySelectorAll('thead tr, tbody tr:not([kern-details])')) as Element[]) {
        expect(Array.from(tr.children).map((c) => c.getAttribute('data-kern-pin'))).toEqual(['start', 'start', 'start', null, 'end']);
        expect(Array.from(tr.children).map((c) => c.getAttribute('data-kern-pin-edge'))).toEqual([null, null, 'start', null, 'end']);
      }
      await set([]);
      expect(el.querySelectorAll('[data-kern-pin], [data-kern-pin-edge]').length).toBe(0);
    });

    it('is not used for own markup', async () => {
      const page = await newSpecPage({
        components: [KernTable],
        html: `<kern-table><table><thead><tr><th>Name</th><th>IP</th></tr></thead><tbody><tr><td>a</td><td>b</td></tr></tbody></table></kern-table>`,
      });
      (page.root as any).columnState = [{ key: 'name', hidden: true }];
      await page.waitForChanges();
      expect(page.root!.querySelectorAll('th').length).toBe(2);
    });
  });
});
