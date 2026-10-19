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
});
