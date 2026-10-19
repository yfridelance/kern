import { newSpecPage } from '@stencil/core/testing';
import { KernIpInput } from './kern-ip-input';

const setup = async (attrs: string) => {
  const page = await newSpecPage({ components: [KernIpInput], html: `<kern-ip-input locale="de-CH" label="IP-Bereich" ${attrs}></kern-ip-input>` });
  const root = page.root!.shadowRoot!;
  const input = root.querySelector('input')!;
  const changes: unknown[] = [];
  const inputs: string[] = [];
  page.root!.addEventListener('kernChange', (e) => changes.push((e as CustomEvent).detail));
  page.root!.addEventListener('kernInput', (e) => inputs.push((e as CustomEvent).detail.value));
  const type = async (text: string, commit = true) => {
    input.value = text;
    input.dispatchEvent(new Event('input'));
    if (commit) input.dispatchEvent(new Event('change'));
    await page.waitForChanges();
  };
  return {
    page,
    root,
    input,
    changes,
    inputs,
    type,
    ip: page.root as unknown as KernIpInput,
    error: () => root.querySelector('.error')?.textContent,
    count: () => root.querySelector('.count'),
  };
};

describe('kern-ip-input', () => {
  it('shows the value with the size of a block', async () => {
    const { input, count } = await setup(`value="192.168.1.0/24"`);
    expect(input.value).toBe('192.168.1.0/24');
    expect(count()!.textContent).toBe('256 Adressen');
    expect(count()!.getAttribute('title')).toBe('192.168.1.0 – 192.168.1.255');
  });

  it('normalises typed input and reports what it covers', async () => {
    const { ip, input, changes, inputs, type, count } = await setup(``);
    await type('192.168.1.10 - 50');
    expect(ip.value).toBe('192.168.1.10-192.168.1.50');
    expect(input.value).toBe('192.168.1.10-192.168.1.50');
    expect(count()!.textContent).toBe('41 Adressen');
    expect(inputs).toEqual(['192.168.1.10 - 50']);
    expect(changes).toEqual([{ value: '192.168.1.10-192.168.1.50', kind: 'range', first: '192.168.1.10', last: '192.168.1.50', count: 41 }]);
    await type('');
    expect(ip.value).toBe('');
    expect(changes[1]).toEqual({ value: '' });
  });

  it('marks invalid text and keeps the last value', async () => {
    const { page, ip, type, error } = await setup(`value="10.0.0.1"`);
    await type('10.0.0.256');
    expect(ip.value).toBe('10.0.0.1');
    expect(error()).toBe('Keine gültige IPv4-Adresse');
    expect(page.root!.hasAttribute('invalid')).toBe(true);
    await type('10.0.0.2', false);
    expect(error()).toBeUndefined();
  });

  it('enforces allow and max-addresses', async () => {
    const { type, error, ip } = await setup(`allow="single range" max-addresses="1024"`);
    await type('192.168.0.0/16');
    expect(ip.value).toBe('192.168.0.0/16');
    expect(error()).toBe('Diese Form ist hier nicht erlaubt');
    await type('10.0.0.0-10.0.8.0');
    expect(error()).toBe(`Höchstens ${new Intl.NumberFormat('de-CH').format(1024)} Adressen`);
    await type('10.0.0.0-10.0.3.255');
    expect(error()).toBeUndefined();
  });

  it('uses an example of the first allowed form as placeholder and hides the count for single addresses', async () => {
    const { input, count, type } = await setup(`allow="single"`);
    expect(input.getAttribute('placeholder')).toBe('192.168.1.10');
    await type('192.168.1.1');
    expect(count()).toBeNull();
  });
});
