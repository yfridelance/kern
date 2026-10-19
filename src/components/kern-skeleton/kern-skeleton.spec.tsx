import { newSpecPage } from '@stencil/core/testing';
import { KernSkeleton } from './kern-skeleton';

describe('kern-skeleton', () => {
  it('draws text lines, the last one shorter, hidden from assistive technology', async () => {
    const page = await newSpecPage({ components: [KernSkeleton], html: `<kern-skeleton lines="3" width="70%"></kern-skeleton>` });
    expect(page.root!.getAttribute('aria-hidden')).toBe('true');
    const lines = page.root!.shadowRoot!.querySelectorAll('.line');
    expect(lines.length).toBe(3);
    expect(lines[2].classList.contains('last')).toBe(true);
    expect(lines[0].classList.contains('last')).toBe(false);
    expect(page.root!.style.width).toBe('70%');
  });

  it('keeps a single line full width', async () => {
    const page = await newSpecPage({ components: [KernSkeleton], html: `<kern-skeleton></kern-skeleton>` });
    expect(page.root!.shadowRoot!.querySelector('.line.last')).toBeNull();
  });

  it('sizes blocks and circles', async () => {
    const block = await newSpecPage({ components: [KernSkeleton], html: `<kern-skeleton variant="block" height="120px"></kern-skeleton>` });
    expect(block.root!.style.height).toBe('120px');
    const circle = await newSpecPage({ components: [KernSkeleton], html: `<kern-skeleton variant="circle" size="24px"></kern-skeleton>` });
    expect([circle.root!.style.width, circle.root!.style.height]).toEqual(['24px', '24px']);
  });
});
