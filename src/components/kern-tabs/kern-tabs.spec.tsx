import { newSpecPage } from '@stencil/core/testing';
import { KernTabs } from './kern-tabs';
import { KernTabPanel } from '../kern-tab-panel/kern-tab-panel';

describe('kern-tabs', () => {
  it('shows one panel at a time and switches on click', async () => {
    const page = await newSpecPage({
      components: [KernTabs, KernTabPanel],
      html: `<kern-tabs><kern-tab-panel name="config" label="Config">A</kern-tab-panel><kern-tab-panel name="status" label="Status" count="3">B</kern-tab-panel></kern-tabs>`,
    });
    const panels = page.root!.querySelectorAll('kern-tab-panel');
    expect(page.root!.getAttribute('value')).toBe('config');
    expect(panels[0].hasAttribute('hidden')).toBe(false);
    expect(panels[1].hasAttribute('hidden')).toBe(true);

    const tabs = page.root!.shadowRoot!.querySelectorAll('[role="tab"]');
    expect(tabs[1].textContent).toContain('Status');
    (tabs[1] as HTMLElement).click();
    await page.waitForChanges();
    expect(panels[0].hasAttribute('hidden')).toBe(true);
    expect(panels[1].hasAttribute('hidden')).toBe(false);
  });

  it('follows label, name and count set on panels after they were inserted', async () => {
    const page = await newSpecPage({ components: [KernTabs, KernTabPanel], html: `<kern-tabs></kern-tabs>` });
    const panel = page.doc.createElement('kern-tab-panel') as HTMLElement & { name?: string; label?: string; count?: string };
    page.root!.appendChild(panel);
    await page.waitForChanges();
    panel.name = 'config';
    panel.label = 'Config';
    await page.waitForChanges();
    const tab = () => page.root!.shadowRoot!.querySelector('[role="tab"]')!;
    expect(tab().textContent).toBe('Config');
    expect(page.root!.getAttribute('value')).toBe('config');

    panel.label = 'Konfiguration';
    await page.waitForChanges();
    expect(tab().textContent).toBe('Konfiguration');

    panel.setAttribute('count', '3');
    await page.waitForChanges();
    expect(tab().querySelector('kern-badge')!.textContent).toBe('3');
  });
});
