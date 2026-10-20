import { newSpecPage } from '@stencil/core/testing';
import { KernCode } from './kern-code';

describe('kern-code', () => {
  it('dedents the text content and highlights it line by line', async () => {
    const page = await newSpecPage({
      components: [KernCode],
      html: `<kern-code language="yaml" heading="config.yaml" line-numbers>
        mqtt:
          enable: true
      </kern-code>`,
    });
    const root = page.root!.shadowRoot!;
    const lines = Array.from(root.querySelectorAll('.line')).map((l) => l.textContent);
    expect(lines).toEqual(['mqtt:', '  enable: true']);
    expect(root.querySelector('.heading')!.textContent).toBe('config.yaml');
    expect(root.querySelector('pre')!.classList.contains('numbered')).toBe(true);
    expect(Array.from(root.querySelectorAll('.key')).map((k) => k.textContent)).toEqual(['mqtt', 'enable']);
    expect(root.querySelector('.literal')!.textContent).toBe('true');
  });

  it('prefers the code property and keeps empty lines', async () => {
    const page = await newSpecPage({ components: [KernCode], html: `<kern-code>ignored</kern-code>` });
    (page.root as unknown as KernCode).code = 'a\n\nb';
    await page.waitForChanges();
    expect(page.root!.shadowRoot!.querySelectorAll('.line').length).toBe(3);
  });

  it('shows the copy button unless no-copy, and limits the height', async () => {
    const page = await newSpecPage({ components: [KernCode], html: `<kern-code max-height="120px">x</kern-code>` });
    const root = page.root!.shadowRoot!;
    expect(root.querySelector('.copy')!.getAttribute('aria-label')).toBe('Copy');
    expect(root.querySelector('pre')!.getAttribute('style')).toContain('max-height: 120px');
    const bare = await newSpecPage({ components: [KernCode], html: `<kern-code no-copy>x</kern-code>` });
    expect(bare.root!.shadowRoot!.querySelector('.copy')).toBeNull();
  });

  it('renders inline code without block parts', async () => {
    const page = await newSpecPage({ components: [KernCode], html: `<p>Pfad <kern-code inline> /etc/shelly.yaml </kern-code></p>` });
    const el = page.body.querySelector('kern-code')!;
    expect(el.shadowRoot!.querySelector('pre')).toBeNull();
    expect(el.shadowRoot!.querySelector('.copy')).toBeNull();
    expect(el.shadowRoot!.querySelector('code')!.textContent).toBe('/etc/shelly.yaml');
  });
});
