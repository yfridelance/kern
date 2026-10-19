import { newSpecPage } from '@stencil/core/testing';
import { KernRating } from './kern-rating';

const setup = async (attrs: string) => {
  const page = await newSpecPage({ components: [KernRating], html: `<kern-rating label="Zuverlässigkeit" ${attrs}></kern-rating>` });
  const root = page.root!.shadowRoot!;
  const events: number[] = [];
  page.root!.addEventListener('kernChange', (e) => events.push((e as CustomEvent).detail.value));
  const stars = () => Array.from(root.querySelectorAll<HTMLElement>('.star'));
  const key = async (k: string) => {
    root.querySelector('[role="radiogroup"]')!.dispatchEvent(new KeyboardEvent('keydown', { key: k }));
    await page.waitForChanges();
  };
  return { page, root, events, stars, key, rating: page.root as unknown as KernRating };
};

describe('kern-rating', () => {
  it('renders a radio group with one tab stop', async () => {
    const { root, stars } = await setup(`value="3"`);
    expect(root.querySelector('[role="radiogroup"]')!.getAttribute('aria-labelledby')).toBe(root.querySelector('.label')!.id);
    expect(stars().map((s) => s.classList.contains('filled'))).toEqual([true, true, true, false, false]);
    expect(stars().map((s) => s.getAttribute('aria-checked'))).toEqual(['false', 'false', 'true', 'false', 'false']);
    expect(stars().map((s) => s.getAttribute('tabindex'))).toEqual(['-1', '-1', '0', '-1', '-1']);
    expect(stars()[0].getAttribute('aria-label')).toBe('1 von 5 Sternen');
  });

  it('picks on click and clears the current star when clearable', async () => {
    const { page, rating, stars, events } = await setup(`value="2" clearable`);
    stars()[3].click();
    await page.waitForChanges();
    expect(rating.value).toBe(4);
    stars()[3].click();
    await page.waitForChanges();
    expect(rating.value).toBe(0);
    expect(events).toEqual([4, 0]);
  });

  it('does not clear without clearable', async () => {
    const { page, rating, stars, key, events } = await setup(`value="2"`);
    stars()[1].click();
    await page.waitForChanges();
    await key('Backspace');
    await key('ArrowLeft');
    await key('ArrowLeft');
    expect(rating.value).toBe(1);
    expect(events).toEqual([1]);
  });

  it('moves with the keyboard', async () => {
    const { rating, key, events } = await setup(`value="2" clearable`);
    await key('ArrowRight');
    await key('End');
    await key('ArrowRight');
    await key('Home');
    await key('4');
    await key('0');
    expect(rating.value).toBe(0);
    expect(events).toEqual([3, 5, 1, 4, 0]);
  });

  it('previews on hover', async () => {
    const { page, root, stars } = await setup(`value="1"`);
    stars()[2].dispatchEvent(new MouseEvent('mouseenter'));
    await page.waitForChanges();
    expect(stars().filter((s) => s.classList.contains('filled')).length).toBe(3);
    root.querySelector('.stars')!.dispatchEvent(new MouseEvent('mouseleave'));
    await page.waitForChanges();
    expect(stars().filter((s) => s.classList.contains('filled')).length).toBe(1);
  });

  it('only shows the rating when readonly', async () => {
    const { root, stars } = await setup(`value="4" readonly`);
    expect(root.querySelector('[role="radiogroup"]')).toBeNull();
    expect(root.querySelector('[role="img"]')!.getAttribute('aria-label')).toBe('Zuverlässigkeit: 4 von 5 Sternen');
    expect(stars().some((s) => s.hasAttribute('tabindex'))).toBe(false);
  });

  it('respects max and clamps the value', async () => {
    const { stars } = await setup(`value="12" max="10"`);
    expect(stars().length).toBe(10);
    expect(stars().filter((s) => s.classList.contains('filled')).length).toBe(10);
  });
});
