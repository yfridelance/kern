import { newSpecPage } from '@stencil/core/testing';
import { setKernLocale } from '../../utils/i18n';
import { KernPagination } from './kern-pagination';
import { pageItems } from './pages';

describe('pageItems', () => {
  it('shows all pages when they fit', () => {
    expect(pageItems(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(pageItems(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });
  it('keeps seven slots with gaps', () => {
    expect(pageItems(1, 20)).toEqual([1, 2, 3, 4, 5, '…', 20]);
    expect(pageItems(5, 20)).toEqual([1, '…', 4, 5, 6, '…', 20]);
    expect(pageItems(18, 20)).toEqual([1, '…', 16, 17, 18, 19, 20]);
    expect(pageItems(20, 20)).toEqual([1, '…', 16, 17, 18, 19, 20]);
  });
  it('widens with more siblings', () => {
    expect(pageItems(10, 20, 2)).toEqual([1, '…', 8, 9, 10, 11, 12, '…', 20]);
  });
});

const setup = async (attrs: string) => {
  const page = await newSpecPage({ components: [KernPagination], html: `<kern-pagination locale="de-CH" ${attrs}></kern-pagination>` });
  const root = page.root!.shadowRoot!;
  const events: unknown[] = [];
  page.root!.addEventListener('kernPageChange', (e) => events.push((e as CustomEvent).detail));
  const nums = () => Array.from(root.querySelectorAll('button.num, .gap')).map((b) => b.textContent);
  return { page, root, events, nums, el: page.root as unknown as KernPagination };
};

describe('kern-pagination', () => {
  it('shows the range and the pages', async () => {
    const { root, nums } = await setup(`total="380" page="1"`);
    expect(root.querySelector('nav')!.getAttribute('aria-label')).toBe('Pages');
    expect(root.querySelector('.range')!.textContent).toBe('1–25 of 380');
    expect(nums()).toEqual(['1', '2', '3', '4', '5', '…', '16']);
    expect(root.querySelector('button.current')!.getAttribute('aria-current')).toBe('page');
    expect(root.querySelector('.prev')!.hasAttribute('disabled')).toBe(true);
    expect(root.querySelector('.size')).toBeNull();
  });

  it('moves with the buttons and clamps', async () => {
    const { page, root, events, el } = await setup(`total="380"`);
    root.querySelector<HTMLButtonElement>('.next')!.click();
    await page.waitForChanges();
    root.querySelector<HTMLButtonElement>('.last')!.click();
    await page.waitForChanges();
    expect(root.querySelector('.range')!.textContent).toBe('376–380 of 380');
    expect(root.querySelector('.next')!.hasAttribute('disabled')).toBe(true);
    Array.from(root.querySelectorAll<HTMLButtonElement>('button.num')).find((b) => b.textContent === '1')!.click();
    await page.waitForChanges();
    expect(el.page).toBe(1);
    expect(events).toEqual([
      { page: 2, pageSize: 25 },
      { page: 16, pageSize: 25 },
      { page: 1, pageSize: 25 },
    ]);
  });

  it('keeps the first item on screen when the page size changes', async () => {
    const { page, root, events, el } = await setup(`total="380" page="5" page-sizes="10,25,50"`);
    root.querySelector('kern-select')!.dispatchEvent(new CustomEvent('kernChange', { detail: { value: '50' } }));
    await page.waitForChanges();
    expect([el.page, el.pageSize]).toEqual([3, 50]);
    expect(events).toEqual([{ page: 3, pageSize: 50 }]);
  });

  it('handles an empty list and a page beyond the end', async () => {
    const empty = await setup(`total="0"`);
    expect(empty.root.querySelector('.range')!.textContent).toBe('0–0 of 0');
    const beyond = await setup(`total="30" page="9"`);
    expect(beyond.el.page).toBe(2);
  });
});

describe('kern-pagination texts', () => {
  afterEach(() => setKernLocale());

  it('switches language at once and keeps texts set as properties', async () => {
    const page = await newSpecPage({ components: [KernPagination], html: `<kern-pagination locale="de-CH" total="380" label-next="Weiter"></kern-pagination>` });
    const root = page.root!.shadowRoot!;
    expect(root.querySelector('nav')!.getAttribute('aria-label')).toBe('Pages');
    setKernLocale('de');
    await page.waitForChanges();
    expect(root.querySelector('nav')!.getAttribute('aria-label')).toBe('Seiten');
    expect(root.querySelector('.range')!.textContent).toBe('1–25 von 380');
    expect(root.querySelector('.next')!.getAttribute('aria-label')).toBe('Weiter');
  });
});
