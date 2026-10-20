import { intToIpv4, ipv4ToInt, parseIpv4, parseMask } from './ip';

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

describe('parseMask', () => {
  it('reads contiguous dotted masks', () => {
    expect(parseMask(' 255.255.255.0 ')).toEqual({ mask: '255.255.255.0', prefix: 24, hosts: 254 });
    expect(parseMask('255.255.252.0')).toEqual({ mask: '255.255.252.0', prefix: 22, hosts: 1022 });
    expect(parseMask('255.128.0.0')!.prefix).toBe(9);
  });

  it('reads prefixes with and without slash', () => {
    expect(parseMask('/24')).toEqual({ mask: '255.255.255.0', prefix: 24, hosts: 254 });
    expect(parseMask('24')).toEqual(parseMask('/24'));
    expect(parseMask('/ 16')!.mask).toBe('255.255.0.0');
  });

  it('handles the limits /0, /31 and /32', () => {
    expect(parseMask('0.0.0.0')).toEqual({ mask: '0.0.0.0', prefix: 0, hosts: 4294967294 });
    expect(parseMask('/0')!.mask).toBe('0.0.0.0');
    expect(parseMask('/31')).toEqual({ mask: '255.255.255.254', prefix: 31, hosts: 2 });
    expect(parseMask('255.255.255.255')).toEqual({ mask: '255.255.255.255', prefix: 32, hosts: 1 });
    expect(parseMask('32')!.hosts).toBe(1);
  });

  it('rejects non-contiguous masks, addresses and bad prefixes', () => {
    expect(['255.0.255.0', '192.168.1.1', '255.255.255.1', '0.255.255.255', '255.255.256.0', '33', '/33', '/-1', '24/', '', 'x', '/', '255.255.255'].map(parseMask)).toEqual(
      Array(13).fill(null),
    );
  });
});
