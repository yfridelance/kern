import { newSpecPage } from '@stencil/core/testing';
import { KernTooltip } from './kern-tooltip';

const setup = async (html: string) => {
  const page = await newSpecPage({ components: [KernTooltip], html });
  const tip = page.body.querySelector('kern-tooltip')!;
  const bubble = () => tip.shadowRoot!.querySelector('.tooltip')!;
  return { page, tip, bubble };
};

describe('kern-tooltip', () => {
  it('describes the wrapped trigger with a hidden copy of the text', async () => {
    const { tip } = await setup(`<kern-tooltip text="Gerät neu starten"><button aria-describedby="x">⏻</button></kern-tooltip>`);
    const button = tip.querySelector('button')!;
    const ids = button.getAttribute('aria-describedby')!.split(' ');
    expect(ids[0]).toBe('x');
    const desc = tip.querySelector(`#${ids[1]}`)!;
    expect([desc.textContent, desc.hasAttribute('hidden')]).toEqual(['Gerät neu starten', true]);
  });

  it('shows on focus at once and hides on Escape', async () => {
    const { page, tip, bubble } = await setup(`<kern-tooltip text="Neustart"><button>⏻</button></kern-tooltip>`);
    tip.querySelector('button')!.dispatchEvent(new Event('focusin'));
    await page.waitForChanges();
    expect(bubble().classList.contains('open')).toBe(true);
    tip.querySelector('button')!.dispatchEvent(new Event('focusout'));
    await page.waitForChanges();
    expect(bubble().classList.contains('open')).toBe(false);
  });

  it('shows on hover only after the delay', async () => {
    const { page, tip, bubble } = await setup(`<kern-tooltip text="Neustart" delay="60"><button>⏻</button></kern-tooltip>`);
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    tip.querySelector('button')!.dispatchEvent(new Event('mouseenter'));
    await wait(20);
    await page.waitForChanges();
    expect(bubble().classList.contains('open')).toBe(false);
    await wait(80);
    await page.waitForChanges();
    expect(bubble().classList.contains('open')).toBe(true);
    tip.querySelector('button')!.dispatchEvent(new Event('mouseleave'));
    await page.waitForChanges();
    expect(bubble().classList.contains('open')).toBe(false);
  });

  it('attaches to an element by id and cleans up when removed', async () => {
    const { page, tip } = await setup(`<span id="mac">C82B…</span><kern-tooltip for="mac" text="C8:2B:96:1A:3F:00"></kern-tooltip>`);
    const target = page.body.querySelector('#mac')!;
    expect(target.getAttribute('aria-describedby')).toMatch(/^kern-tooltip-\d+$/);
    tip.remove();
    await page.waitForChanges();
    expect(target.hasAttribute('aria-describedby')).toBe(false);
  });

  it('stays hidden when disabled or empty', async () => {
    const { page, tip, bubble } = await setup(`<kern-tooltip text="X" disabled><button>a</button></kern-tooltip>`);
    tip.querySelector('button')!.dispatchEvent(new Event('focusin'));
    await page.waitForChanges();
    expect(bubble().classList.contains('open')).toBe(false);
  });
});
