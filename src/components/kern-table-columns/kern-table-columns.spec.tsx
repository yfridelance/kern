import { newSpecPage } from '@stencil/core/testing';
import { KernTableColumns } from './kern-table-columns';
import { KernCheckbox } from '../kern-checkbox/kern-checkbox';

const columns = [
  { key: 'name', label: 'Name', hideable: false, pinned: 'start' as const },
  { key: 'ip', label: 'IP' },
  { key: 'firmware', label: 'Firmware', hidden: true },
  { key: 'status', label: 'Status' },
];

async function setup(props: Record<string, unknown> = {}) {
  const page = await newSpecPage({ components: [KernTableColumns, KernCheckbox], html: `<kern-table-columns></kern-table-columns>` });
  const el = page.root as any;
  Object.assign(el, { columns, ...props });
  await page.waitForChanges();
  const items = () => Array.from(el.shadowRoot.querySelectorAll('li')) as HTMLElement[];
  const keys = () => items().map((li) => li.getAttribute('data-key'));
  const item = (key: string) => items().find((li) => li.getAttribute('data-key') === key)!;
  const box = (key: string) => item(key).querySelector('kern-checkbox') as any;
  const buttons = (key: string) => Array.from(item(key).querySelectorAll('button')) as HTMLButtonElement[];
  const changes: any[] = [];
  el.addEventListener('kernColumnsChange', (e: CustomEvent) => changes.push(e.detail.state));
  return { page, el, keys, item, box, buttons, changes };
}

describe('kern-table-columns', () => {
  it('lists the columns in state order with checkboxes and marks pinned ones', async () => {
    const { keys, box, item, el } = await setup();
    expect(keys()).toEqual(['name', 'ip', 'firmware', 'status']);
    expect(box('ip').checked).toBe(true);
    expect(box('firmware').checked).toBe(false);
    expect(box('name').disabled).toBe(true); // hideable: false
    expect(item('name').querySelector('.pin')!.textContent).toBe('Pinned to start');
    expect(el.shadowRoot.querySelector('ul').getAttribute('aria-label')).toBe('Columns');
  });

  it('shows and hides a column and reports the complete state', async () => {
    const { page, box, changes, el } = await setup();
    box('firmware').dispatchEvent(new CustomEvent('kernChange', { detail: { checked: true } }));
    await page.waitForChanges();
    expect(changes[0]).toEqual([{ key: 'name', pinned: 'start' }, { key: 'ip' }, { key: 'firmware' }, { key: 'status' }]);
    expect(el.columnState).toEqual(changes[0]);
    expect(box('firmware').checked).toBe(true);
  });

  it('keeps the state when kernColumnsChange is cancelled', async () => {
    const { page, box, el } = await setup();
    el.addEventListener('kernColumnsChange', (e: Event) => e.preventDefault());
    const ip = box('ip');
    ip.checked = false; // as the checkbox does itself
    ip.dispatchEvent(new CustomEvent('kernChange', { detail: { checked: false } }));
    await page.waitForChanges();
    expect(el.columnState).toBeUndefined();
    expect(ip.checked).toBe(true);
  });

  it('keeps the minimum of visible columns', async () => {
    const { box } = await setup({ minVisibleColumns: 3 });
    expect([box('ip').disabled, box('status').disabled, box('firmware').disabled]).toEqual([true, true, false]);
  });

  it('moves columns within their pin group with the buttons and Alt+arrows, and announces it', async () => {
    const { page, keys, buttons, item, el, changes } = await setup();
    expect(buttons('name').map((b) => b.hasAttribute('disabled'))).toEqual([true, true]); // alone in its group
    expect(buttons('ip')[0].hasAttribute('disabled')).toBe(true);
    expect(buttons('status')[1].hasAttribute('disabled')).toBe(true);
    buttons('ip')[1].click();
    await page.waitForChanges();
    expect(keys()).toEqual(['name', 'firmware', 'ip', 'status']);
    expect(el.shadowRoot.querySelector('[role="status"]').textContent).toBe('IP: position 3 of 4');
    item('status').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', altKey: true, bubbles: true }));
    await page.waitForChanges();
    expect(keys()).toEqual(['name', 'firmware', 'status', 'ip']);
    expect(changes.length).toBe(2);
    // Plain arrows are left to the controls.
    item('status').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    await page.waitForChanges();
    expect(changes.length).toBe(2);
  });

  it('drops unknown keys and adds new columns from a stored state', async () => {
    const { keys, box } = await setup({ columnState: [{ key: 'status' }, { key: 'removed' }, { key: 'ip', hidden: true }] });
    expect(keys()).toEqual(['name', 'status', 'ip', 'firmware']);
    expect(box('ip').checked).toBe(false);
  });
});
