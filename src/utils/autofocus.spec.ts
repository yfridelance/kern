import { focusAutofocus } from './autofocus';

type Field = HTMLElement & { setFocus?: () => Promise<void>; componentOnReady?: () => Promise<unknown> };

function field(html: string) {
  document.body.innerHTML = html;
  const host = document.querySelector('kern-drawer') as HTMLElement;
  const calls: string[] = [];
  for (const el of Array.from(document.querySelectorAll('[name]')) as Field[]) {
    if (!el.hasAttribute('data-plain')) el.setFocus = async () => void calls.push(el.getAttribute('name')!);
    el.focus = () => void calls.push(`${el.getAttribute('name')}:focus`);
  }
  return { host, calls };
}

describe('focusAutofocus', () => {
  it('focuses the first Kern field with autofocus, also nested and in the footer', async () => {
    const { host, calls } = field(`<kern-drawer><kern-input name="a"></kern-input><div><kern-select name="b" autofocus></kern-select></div><kern-button slot="footer" name="c" autofocus></kern-button></kern-drawer>`);
    await focusAutofocus(host, () => true);
    expect(calls).toEqual(['b']);
  });

  it('finds a field in the footer', async () => {
    const { host, calls } = field(`<kern-drawer><kern-input name="a"></kern-input><kern-button slot="footer" name="c" autofocus></kern-button></kern-drawer>`);
    await focusAutofocus(host, () => true);
    expect(calls).toEqual(['c']);
  });

  it('waits for the field and falls back to focus() without setFocus()', async () => {
    const { host, calls } = field(`<kern-drawer><kern-switch name="a" data-plain autofocus></kern-switch></kern-drawer>`);
    const el = host.querySelector('kern-switch') as Field;
    let ready!: () => void;
    el.componentOnReady = () => new Promise<void>((r) => (ready = r));
    const done = focusAutofocus(host, () => true);
    await Promise.resolve();
    expect(calls).toEqual([]);
    ready();
    await done;
    expect(calls).toEqual(['a:focus']);
  });

  it('does nothing once the modal closed while waiting', async () => {
    const { host, calls } = field(`<kern-drawer><kern-input name="a" autofocus></kern-input></kern-drawer>`);
    await focusAutofocus(host, () => false);
    expect(calls).toEqual([]);
  });

  it('leaves native elements and fields of a nested modal alone', async () => {
    const { host, calls } = field(`<kern-drawer><kern-dialog><kern-input name="a" autofocus></kern-input></kern-dialog><input name="b" autofocus><kern-input name="c" autofocus></kern-input></kern-drawer>`);
    await focusAutofocus(host, () => true);
    expect(calls).toEqual([]);
  });
});
