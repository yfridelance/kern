import { newSpecPage } from '@stencil/core/testing';
import { KernRange } from './kern-range';

const setup = async (attrs: string) => {
  const page = await newSpecPage({ components: [KernRange], html: `<kern-range locale="de-CH" label="Helligkeit" ${attrs}></kern-range>` });
  const root = page.root!.shadowRoot!;
  const changes: unknown[] = [];
  page.root!.addEventListener('kernChange', (e) => changes.push((e as CustomEvent).detail.value));
  const thumbs = () => Array.from(root.querySelectorAll<HTMLElement>('[role="slider"]'));
  const key = async (i: number, k: string) => {
    thumbs()[i].dispatchEvent(new KeyboardEvent('keydown', { key: k }));
    await page.waitForChanges();
  };
  return { page, root, changes, thumbs, key, el: page.root as unknown as KernRange };
};

describe('kern-range', () => {
  it('renders a labelled slider with the value', async () => {
    const { root, thumbs } = await setup(`value="40" unit="%"`);
    const t = thumbs()[0];
    expect([t.getAttribute('aria-valuemin'), t.getAttribute('aria-valuemax'), t.getAttribute('aria-valuenow'), t.getAttribute('aria-valuetext')]).toEqual(['0', '100', '40', '40 %']);
    expect(t.getAttribute('aria-labelledby')).toBe(root.querySelector('.label')!.id);
    expect(root.querySelector('.shown')!.textContent).toBe('40 %');
    expect(t.getAttribute('style')).toContain('left: 40%');
  });

  it('steps with the keyboard and stays within the limits', async () => {
    const { el, key, changes } = await setup(`value="98" step="1"`);
    await key(0, 'ArrowRight');
    await key(0, 'PageUp');
    await key(0, 'PageUp');
    expect(el.value).toBe(100);
    await key(0, 'Home');
    await key(0, 'PageDown');
    expect(el.value).toBe(0);
    expect(changes).toEqual([99, 100, 0]);
  });

  it('snaps to the step and its decimals', async () => {
    const { el, key } = await setup(`value="2.3" min="0" max="5" step="0.5"`);
    expect(el.value).toBe('2.3');
    await key(0, 'ArrowUp');
    expect(el.value).toBe(3);
  });

  it('keeps two handles from crossing in range mode', async () => {
    const { root, el, thumbs, key, changes } = await setup(`range value="20/30" step="5"`);
    expect(thumbs().map((t) => t.getAttribute('aria-label'))).toEqual(['Helligkeit, Von', 'Helligkeit, Bis']);
    expect(thumbs()[0].getAttribute('aria-valuemax')).toBe('30');
    await key(0, 'ArrowRight');
    await key(0, 'ArrowRight');
    await key(0, 'ArrowRight');
    expect(el.value).toBe('30/30');
    await key(1, 'End');
    expect(el.value).toBe('30/100');
    expect(root.querySelector('.shown')!.textContent).toBe('30 – 100');
    expect(changes).toEqual(['25/30', '30/30', '30/100']);
  });

  it('shows marks within the limits', async () => {
    const { root } = await setup(`value="50" marks="0,50,100,150"`);
    expect(Array.from(root.querySelectorAll('.marks span')).map((s) => s.textContent)).toEqual(['0', '50', '100']);
    expect(root.querySelectorAll('.tick.on').length).toBe(2);
  });
});
