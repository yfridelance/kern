import { newSpecPage } from '@stencil/core/testing';
import { KernListItem } from './kern-list-item';

const item = async (attrs: string, children = '') => {
  const page = await newSpecPage({ components: [KernListItem], html: `<kern-list-item ${attrs}>${children}</kern-list-item>` });
  return { page, root: page.root!.shadowRoot!, host: page.root! };
};

describe('kern-list-item', () => {
  it('renders heading, description and meta from props', async () => {
    const { root, host } = await item(`heading="Bad Lüftung" description="Plus 1PM" meta="vor 3 Min."`);
    expect(host.getAttribute('role')).toBe('listitem');
    expect(root.querySelector('.heading')!.textContent).toBe('Bad Lüftung');
    expect(root.querySelector('.description')!.textContent).toBe('Plus 1PM');
    expect(root.querySelector('.meta')!.textContent).toBe('vor 3 Min.');
    expect(root.querySelector('div.row')).not.toBeNull();
    expect(root.querySelector('.start')!.hasAttribute('hidden')).toBe(true);
  });

  it('keeps the heading when children are separated by whitespace', async () => {
    const { root } = await item(`heading="Bad Lüftung"`, `
      <span slot="start">●</span>
      <span slot="meta">gestern</span>
    `);
    expect(root.querySelector('.heading')!.textContent!.trim()).toBe('Bad Lüftung');
  });

  it('hides empty description and meta, shows slotted parts', async () => {
    const { root, host } = await item(`heading="A"`, `<span slot="start">●</span><button slot="end">Neustart</button>`);
    expect(root.querySelector('.description')!.hasAttribute('hidden')).toBe(true);
    expect(root.querySelector('.meta')!.hasAttribute('hidden')).toBe(true);
    expect(root.querySelector('.start')!.hasAttribute('hidden')).toBe(false);
    expect(root.querySelector('.end')!.hasAttribute('hidden')).toBe(false);
    expect(host.classList.contains('has-end')).toBe(true);
  });

  it('becomes a link with href, actions stay outside it', async () => {
    const { root } = await item(`heading="A" href="/devices/1" selected`, `<button slot="end">X</button>`);
    const a = root.querySelector('a.row')!;
    expect(a.getAttribute('href')).toBe('/devices/1');
    expect(a.getAttribute('aria-current')).toBe('true');
    expect(a.querySelector('slot[name="end"]')).toBeNull();
  });

  it('emits kernItemClick when clickable, not when disabled or from actions', async () => {
    const { page, root, host } = await item(`heading="A" clickable`, `<button slot="end">X</button>`);
    let clicks = 0;
    host.addEventListener('kernItemClick', () => clicks++);
    root.querySelector<HTMLButtonElement>('button.row')!.click();
    host.querySelector('button')!.click();
    expect(clicks).toBe(1);
    host.setAttribute('disabled', '');
    await page.waitForChanges();
    expect(root.querySelector('button.row')!.hasAttribute('disabled')).toBe(true);
  });

  it('drops the link when disabled', async () => {
    const { root } = await item(`heading="A" href="/x" disabled`);
    expect(root.querySelector('a')).toBeNull();
  });
});
