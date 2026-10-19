import { newSpecPage } from '@stencil/core/testing';
import { KernLink } from './kern-link';

const link = async (attrs: string) => {
  const page = await newSpecPage({ components: [KernLink], html: `<kern-link ${attrs}>Doku</kern-link>` });
  return page.root!.shadowRoot!.querySelector('a')!;
};

describe('kern-link', () => {
  it('renders a link with href and target', async () => {
    const a = await link(`href="/devices/1" target="frame"`);
    expect([a.getAttribute('href'), a.getAttribute('target'), a.getAttribute('rel')]).toEqual(['/devices/1', 'frame', null]);
    expect(a.querySelector('.external')).toBeNull();
  });

  it('opens external links in a new tab with rel and a hint', async () => {
    const a = await link(`href="https://example.org" external`);
    expect([a.getAttribute('target'), a.getAttribute('rel')]).toEqual(['_blank', 'noopener noreferrer']);
    expect(a.querySelector('.external')).not.toBeNull();
    expect(a.querySelector('.sr')!.textContent).toBe('(öffnet in neuem Tab)');
  });

  it('keeps an explicit rel and supports download', async () => {
    const a = await link(`href="/log.txt" target="_blank" rel="noopener" download="log.txt"`);
    expect([a.getAttribute('rel'), a.getAttribute('download')]).toEqual(['noopener', 'log.txt']);
  });

  it('drops the link when disabled', async () => {
    const a = await link(`href="/x" disabled external`);
    expect([a.hasAttribute('href'), a.hasAttribute('target'), a.getAttribute('aria-disabled')]).toEqual([false, false, 'true']);
  });
});
