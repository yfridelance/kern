import { newSpecPage } from '@stencil/core/testing';
import { setKernLocale } from '../../utils/i18n';
import { KernEmptyState } from './kern-empty-state';

const setup = async (html: string) => {
  const page = await newSpecPage({ components: [KernEmptyState], html });
  const root = page.root!.shadowRoot!;
  return { page, root, host: page.root!, heading: () => root.querySelector('.heading') };
};

describe('kern-empty-state', () => {
  afterEach(() => setKernLocale());

  it('shows the default heading and icon of each variant', async () => {
    const { page, root, host, heading } = await setup(`<kern-empty-state></kern-empty-state>`);
    expect(host.getAttribute('variant')).toBe('empty');
    expect(heading()!.textContent).toBe('No entries yet');
    expect(root.querySelector('.icon svg')).not.toBeNull();
    const empty = root.querySelector('.icon svg')!.innerHTML;

    host.setAttribute('variant', 'no-results');
    await page.waitForChanges();
    expect(heading()!.textContent).toBe('No matches');
    expect(root.querySelector('.icon svg')!.innerHTML).not.toBe(empty);

    host.setAttribute('variant', 'error');
    await page.waitForChanges();
    expect(heading()!.textContent).toBe('Could not load');
  });

  it('is a live region only for errors', async () => {
    const { page, host } = await setup(`<kern-empty-state></kern-empty-state>`);
    expect(host.hasAttribute('role')).toBe(false);
    host.setAttribute('variant', 'error');
    await page.waitForChanges();
    expect(host.getAttribute('role')).toBe('status');
    host.setAttribute('variant', 'no-results');
    await page.waitForChanges();
    expect(host.hasAttribute('role')).toBe(false);
  });

  it('takes its own heading and icon, or none', async () => {
    const { page, root, host, heading } = await setup(`<kern-empty-state heading="No devices found" icon="wifi"></kern-empty-state>`);
    expect(heading()!.textContent).toBe('No devices found');
    expect(root.querySelector('.icon')).not.toBeNull();
    host.setAttribute('icon', 'none');
    await page.waitForChanges();
    expect(root.querySelector('.icon')).toBeNull();
  });

  it('keeps the heading out of the outline unless a level is given', async () => {
    const { page, host, heading } = await setup(`<kern-empty-state></kern-empty-state>`);
    expect(heading()!.tagName).toBe('DIV');
    expect(heading()!.hasAttribute('role')).toBe(false);
    host.setAttribute('heading-level', '2');
    await page.waitForChanges();
    expect(heading()!.getAttribute('role')).toBe('heading');
    expect(heading()!.getAttribute('aria-level')).toBe('2');
    host.setAttribute('heading-level', '9');
    await page.waitForChanges();
    expect(heading()!.hasAttribute('role')).toBe(false);
  });

  it('hides the actions row without actions', async () => {
    const { root } = await setup(`<kern-empty-state>Add your first device.</kern-empty-state>`);
    expect(root.querySelector('.actions')!.hasAttribute('hidden')).toBe(true);
    const withActions = await setup(`<kern-empty-state><kern-button slot="actions">Add device</kern-button></kern-empty-state>`);
    expect(withActions.root.querySelector('.actions')!.hasAttribute('hidden')).toBe(false);
  });

  it('follows the language', async () => {
    setKernLocale('de');
    const { heading } = await setup(`<kern-empty-state variant="no-results"></kern-empty-state>`);
    expect(heading()!.textContent).toBe('Keine Treffer');
  });
});
