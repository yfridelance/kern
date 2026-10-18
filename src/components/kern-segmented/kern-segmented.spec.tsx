import { newSpecPage } from '@stencil/core/testing';
import { KernSegmented } from './kern-segmented';

const html = `<kern-segmented label="Generation" value="all">
  <option value="all">Alle</option><option value="1">Gen1</option><option value="2">Gen2</option>
</kern-segmented>`;

describe('kern-segmented', () => {
  it('builds radios from child options', async () => {
    const page = await newSpecPage({ components: [KernSegmented], html });
    const radios = page.root!.shadowRoot!.querySelectorAll('[role="radio"]');
    expect(Array.from(radios).map((r) => r.textContent)).toEqual(['Alle', 'Gen1', 'Gen2']);
    expect(radios[0].getAttribute('aria-checked')).toBe('true');
  });

  it('emits kernChange on click and arrow keys', async () => {
    const page = await newSpecPage({ components: [KernSegmented], html });
    const seen: string[] = [];
    page.root!.addEventListener('kernChange', (e) => seen.push((e as CustomEvent).detail.value));
    (page.root!.shadowRoot!.querySelectorAll('[role="radio"]')[2] as HTMLElement).click();
    await page.waitForChanges();
    page.root!.shadowRoot!.querySelector('.group')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    await page.waitForChanges();
    expect(seen).toEqual(['2', 'all']);
  });
});
