import { intToIpv4, ipv4ToInt, parseIpv4 } from './ip';

describe('ipv4ToInt / intToIpv4', () => {
  it('converts both ways', () => {
    expect(ipv4ToInt('192.168.1.10')).toBe(3232235786);
    expect([ipv4ToInt('0.0.0.0'), ipv4ToInt('255.255.255.255')]).toEqual([0, 4294967295]);
    expect([intToIpv4(3232235786), intToIpv4(4294967295)]).toEqual(['192.168.1.10', '255.255.255.255']);
  });
  it('rejects bad octets, leading zeros and wrong lengths', () => {
    expect(['256.1.1.1', '192.168.01.1', '192.168.1', '1.2.3.4.5', '1.2.3.x', '', '1..2.3'].map(ipv4ToInt)).toEqual([null, null, null, null, null, null, null]);
  });
});

describe('parseIpv4', () => {
  it('reads single addresses', () => {
    expect(parseIpv4(' 10.0.0.1 ')).toEqual({ kind: 'single', value: '10.0.0.1', first: '10.0.0.1', last: '10.0.0.1', count: 1 });
  });

  it('reads ranges with separators, short ends and reversed order', () => {
    const r = { kind: 'range', value: '192.168.1.10-192.168.1.50', first: '192.168.1.10', last: '192.168.1.50', count: 41 };
    expect(parseIpv4('192.168.1.10-192.168.1.50')).toEqual(r);
    expect(parseIpv4('192.168.1.10 – 192.168.1.50')).toEqual(r);
    expect(parseIpv4('192.168.1.10-50')).toEqual(r);
    expect(parseIpv4('192.168.1.50-10')).toEqual(r);
    expect(parseIpv4('10.0.0.250-1.10')!.value).toBe('10.0.0.250-10.0.1.10');
    expect(parseIpv4('10.0.0.5-5')!.kind).toBe('single');
  });

  it('reads CIDR blocks and normalises host addresses', () => {
    expect(parseIpv4('192.168.1.0/24')).toEqual({ kind: 'cidr', value: '192.168.1.0/24', first: '192.168.1.0', last: '192.168.1.255', count: 256 });
    expect(parseIpv4('192.168.1.77 / 24')!.value).toBe('192.168.1.0/24');
    expect(parseIpv4('10.1.2.3/8')!.last).toBe('10.255.255.255');
    expect(parseIpv4('0.0.0.0/0')!.count).toBe(4294967296);
    expect(parseIpv4('192.168.1.5/32')!.count).toBe(1);
  });

  it('rejects everything else', () => {
    expect(['', 'heute', '192.168.1.0/33', '192.168.1.300-10', '192.168.1.10-300', '192.168.1.10-1.2.3.4.5', '192.168.1.10/', 'fe80::1'].map(parseIpv4)).toEqual([
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    ]);
  });
});
