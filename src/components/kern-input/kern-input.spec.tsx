import { newSpecPage } from '@stencil/core/testing';
import { KernInput } from './kern-input';

describe('kern-input', () => {
  it('links label, shows error instead of hint and marks invalid', async () => {
    const page = await newSpecPage({ components: [KernInput], html: `<kern-input label="Passwort" hint="Hinweis" error="Zugangsdaten falsch" type="password"></kern-input>` });
    const sr = page.root!.shadowRoot!;
    const input = sr.querySelector('input')!;
    expect(sr.querySelector('label')!.getAttribute('for')).toBe(input.id);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('autocomplete')).toBe('off');
    expect(sr.querySelector('.error')!.textContent).toBe('Zugangsdaten falsch');
    expect(sr.querySelector('.hint')).toBeNull();
    expect(page.root!.hasAttribute('invalid')).toBe(true);
  });

  it('updates value and emits on input', async () => {
    const page = await newSpecPage({ components: [KernInput], html: `<kern-input></kern-input>` });
    const seen: string[] = [];
    page.root!.addEventListener('kernChange', (e) => seen.push((e as CustomEvent).detail.value));
    const input = page.root!.shadowRoot!.querySelector('input')!;
    input.value = '10.0.0.0/24';
    input.dispatchEvent(new Event('input'));
    await page.waitForChanges();
    expect(page.root!.value).toBe('10.0.0.0/24');
    expect(seen).toEqual(['10.0.0.0/24']);
  });
});
