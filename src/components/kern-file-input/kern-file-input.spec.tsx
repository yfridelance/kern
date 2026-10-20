import { newSpecPage } from '@stencil/core/testing';
import { KernFileInput } from './kern-file-input';

const file = (name: string, size: number, type = '') => ({ name, size, type, lastModified: 1 }) as unknown as File;

const setup = async (attrs: string) => {
  const page = await newSpecPage({ components: [KernFileInput], html: `<kern-file-input locale="en" label="Firmware" name="fw" ${attrs}></kern-file-input>` });
  const root = page.root!.shadowRoot!;
  const changes: number[] = [];
  page.root!.addEventListener('kernChange', (e) => changes.push((e as CustomEvent).detail.files.length));
  const el = page.root as unknown as KernFileInput;
  const add = async (...files: File[]) => {
    await el.addFiles(files);
    await page.waitForChanges();
  };
  return { page, root, changes, el, add, names: () => Array.from(root.querySelectorAll('.files .name')).map((n) => n.textContent) };
};

describe('kern-file-input', () => {
  it('shows the choice, limits and the label on the button', async () => {
    const { root } = await setup(`accept=".zip,.bin" max-size="16MB"`);
    expect(root.querySelector('.choose')!.textContent).toBe('Choose file');
    expect(root.querySelector('label')!.getAttribute('for')).toBe(root.querySelector('.choose')!.id);
    expect(root.querySelector('.limits')!.textContent).toBe('.zip, .bin · max. 16 MB');
    expect(root.querySelector('input[type="file"]')!.getAttribute('accept')).toBe('.zip,.bin');
  });

  it('replaces the file in single mode and lists name and size', async () => {
    const { root, add, names, changes } = await setup(``);
    await add(file('a.zip', 2048));
    await add(file('b.zip', 5 * 1024 * 1024));
    expect(names()).toEqual(['b.zip']);
    expect(root.querySelector('.files .size')!.textContent).toBe('5 MB');
    expect(changes).toEqual([1, 1]);
  });

  it('adds files without duplicates in multiple mode and removes with ×', async () => {
    const { page, root, add, names, el } = await setup(`multiple`);
    const a = file('a.json', 10);
    await add(a, file('b.json', 20));
    await add(a);
    expect(names()).toEqual(['a.json', 'b.json']);
    root.querySelector<HTMLButtonElement>('.remove')!.click();
    await page.waitForChanges();
    expect(names()).toEqual(['b.json']);
    expect(el.files.length).toBe(1);
    expect(root.querySelector('.remove')!.getAttribute('aria-label')).toBe('Remove b.json');
  });

  it('rejects wrong types and too large files with a message', async () => {
    const { root, add, names, page } = await setup(`multiple accept=".zip" max-size="1KB"`);
    await add(file('fw.zip', 512), file('notes.txt', 10), file('big.zip', 4096));
    expect(names()).toEqual(['fw.zip']);
    expect(root.querySelector('.error')!.textContent).toBe('“notes.txt” is not an allowed file type. “big.zip” is larger than 1 KB.');
    expect(page.root!.hasAttribute('invalid')).toBe(true);
    await add(file('ok.zip', 100));
    expect(root.querySelector('.error')).toBeNull();
  });
});
