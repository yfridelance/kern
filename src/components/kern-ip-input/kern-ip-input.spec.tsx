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
    expect(count()!.textContent).toBe('256 addresses');
    expect(count()!.getAttribute('title')).toBe('192.168.1.0 – 192.168.1.255');
  });

  it('normalises typed input and reports what it covers', async () => {
    const { ip, input, changes, inputs, type, count } = await setup(``);
    await type('192.168.1.10 - 50');
    expect(ip.value).toBe('192.168.1.10-192.168.1.50');
    expect(input.value).toBe('192.168.1.10-192.168.1.50');
    expect(count()!.textContent).toBe('41 addresses');
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
    expect(error()).toBe('Not a valid IPv4 address');
    expect(page.root!.hasAttribute('invalid')).toBe(true);
    await type('10.0.0.2', false);
    expect(error()).toBeUndefined();
  });

  it('enforces allow and max-addresses', async () => {
    const { type, error, ip } = await setup(`allow="single range" max-addresses="1024"`);
    await type('192.168.0.0/16');
    expect(ip.value).toBe('192.168.0.0/16');
    expect(error()).toBe('This form is not allowed here');
    await type('10.0.0.0-10.0.8.0');
    expect(error()).toBe(`At most ${new Intl.NumberFormat('de-CH').format(1024)} addresses`);
    await type('10.0.0.0-10.0.3.255');
    expect(error()).toBeUndefined();
  });

  it('uses an example of the first allowed form as placeholder and hides the count for single addresses', async () => {
    const { input, count, type } = await setup(`allow="single"`);
    expect(input.getAttribute('placeholder')).toBe('192.168.1.10');
    await type('192.168.1.1');
    expect(count()).toBeNull();
  });

  describe('mask', () => {
    it('accepts masks and prefixes, normalises to dotted and shows the hosts', async () => {
      const { ip, input, changes, type, count, error } = await setup(`allow="mask"`);
      expect(input.getAttribute('placeholder')).toBe('255.255.255.0');
      await type('/22');
      expect(ip.value).toBe('255.255.252.0');
      expect(input.value).toBe('255.255.252.0');
      expect(error()).toBeUndefined();
      expect(count()!.textContent).toBe(`/22 · ${new Intl.NumberFormat('de-CH').format(1022)} hosts`);
      expect(changes).toEqual([{ value: '255.255.252.0', kind: 'mask', mask: '255.255.252.0', prefix: 22, hosts: 1022 }]);
      await type('24');
      expect(ip.value).toBe('255.255.255.0');
    });

    it('rejects non-contiguous masks and addresses with its own message', async () => {
      const { page, ip, type, error } = await setup(`allow="mask" value="255.255.255.0"`);
      await type('255.0.255.0');
      expect(ip.value).toBe('255.255.255.0');
      expect(error()).toBe('Not a valid subnet mask');
      expect(page.root!.hasAttribute('invalid')).toBe(true);
      await type('192.168.1.1');
      expect(error()).toBe('Not a valid subnet mask');
      await type('255.255.0.0', false);
      expect(error()).toBeUndefined();
    });

    it('marks an invalid mask set from outside', async () => {
      const { error } = await setup(`allow="mask" value="255.0.255.0" label-invalid-mask="Not a subnet mask"`);
      expect(error()).toBe('Not a subnet mask');
    });

    it('normalises to a prefix with mask-format="prefix"', async () => {
      const { ip, input, type, count } = await setup(`allow="mask" mask-format="prefix" label-mask-count="{n} hosts (/{prefix})"`);
      expect(input.getAttribute('placeholder')).toBe('/24');
      await type('255.255.255.0');
      expect(ip.value).toBe('/24');
      expect(input.value).toBe('/24');
      expect(count()!.textContent).toBe('254 hosts (/24)');
      expect(count()!.getAttribute('title')).toBe('255.255.255.0');
    });

    it('treats a valid mask as mask and anything else as address when single is allowed too', async () => {
      const { changes, type, error } = await setup(`allow="single mask"`);
      await type('255.255.255.0');
      await type('192.168.1.1');
      expect(error()).toBeUndefined();
      await type('192.168.1.0/24');
      expect(error()).toBe('This form is not allowed here');
      await type('10.0.0.256');
      expect(error()).toBe('Not a valid IPv4 address');
      expect(changes.map((c) => (c as { kind: string }).kind)).toEqual(['mask', 'single', 'cidr']);
    });

    it('keeps masks as addresses when mask is not allowed', async () => {
      const { type, error, changes } = await setup(`allow="single"`);
      await type('255.255.255.0');
      await type('24');
      expect(error()).toBe('Not a valid IPv4 address');
      expect(changes).toEqual([{ value: '255.255.255.0', kind: 'single', first: '255.255.255.0', last: '255.255.255.0', count: 1 }]);
    });
  });
});
