import { newSpecPage } from '@stencil/core/testing';
import { KernButton } from './kern-button';

const button = async (attrs: string, cancel = false) => {
  const page = await newSpecPage({ components: [KernButton], html: `<kern-button ${attrs}>Neu</kern-button>` });
  const detail = jest.fn();
  page.root!.addEventListener('kernNavigate', (e) => {
    detail((e as CustomEvent).detail.href);
    if (cancel) e.preventDefault();
  });
  const click = (init: MouseEventInit = {}) => {
    const ev = new MouseEvent('click', { bubbles: true, cancelable: true, ...init });
    page.root!.shadowRoot!.querySelector('.control')!.dispatchEvent(ev);
    return ev;
  };
  return { click, detail };
};

describe('kern-button kernNavigate', () => {
  it('emits on a plain click and leaves the navigation to the browser', async () => {
    const { click, detail } = await button(`href="/templates/neu"`);
    expect(click().defaultPrevented).toBe(false);
    expect(detail).toHaveBeenCalledWith('/templates/neu');
  });

  it('stops the navigation when kernNavigate is cancelled', async () => {
    const { click } = await button(`href="/templates/neu"`, true);
    expect(click().defaultPrevented).toBe(true);
  });

  it('skips modified clicks, other buttons, target and download', async () => {
    for (const [attrs, init] of [
      [`href="/x"`, { ctrlKey: true }],
      [`href="/x"`, { metaKey: true }],
      [`href="/x"`, { shiftKey: true }],
      [`href="/x"`, { button: 1 }],
      [`href="/x" target="_blank"`, {}],
      [`href="/x" download`, {}],
      [`href="/x" download="x.json"`, {}],
    ] as [string, MouseEventInit][]) {
      const { click, detail } = await button(attrs, true);
      expect(click(init).defaultPrevented).toBe(false);
      expect(detail).not.toHaveBeenCalled();
    }
  });

  it('emits for target="_self" but not without href', async () => {
    const self = await button(`href="/x" target="_self"`);
    self.click();
    expect(self.detail).toHaveBeenCalledWith('/x');
    const plain = await button(``);
    plain.click();
    expect(plain.detail).not.toHaveBeenCalled();
  });
});
