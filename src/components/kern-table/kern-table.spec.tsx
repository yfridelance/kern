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
});
