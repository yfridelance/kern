import { confirmNormalizer, typeToConfirmText } from './confirm';

const matches = (text: string, alternatives: string[], normalize?: Parameters<typeof confirmNormalizer>[0]) => {
  const norm = confirmNormalizer(normalize);
  return alternatives.map(norm).includes(norm(text));
};

describe('confirmNormalizer', () => {
  it('trims and ignores case by default', () => {
    expect(matches('  boiler ', ['Boiler'])).toBe(true);
    expect(matches('Boile', ['Boiler'])).toBe(false);
  });
  it('accepts any one of several alternatives', () => {
    expect(matches('boiler', ['Boiler', 'A8032AB12345'])).toBe(true);
    expect(matches('a8032ab12345', ['Boiler', 'A8032AB12345'])).toBe(true);
    expect(matches('Küche', ['Boiler', 'A8032AB12345'])).toBe(false);
  });
  it("'mac' accepts every notation and falls back to the default for other text", () => {
    const alts = ['Boiler', 'A8:03:2A:B1:23:45'];
    for (const t of ['A8:03:2A:B1:23:45', 'a8-03-2a-b1-23-45', 'A8032AB12345', ' a803.2ab1.2345 ', 'BOILER']) expect(matches(t, alts, 'mac')).toBe(true);
    expect(matches('A8032AB12346', alts, 'mac')).toBe(false);
    expect(matches('a8-03-2a-b1-23-45', alts)).toBe(false);
  });
  it('uses a custom function', () => {
    const digits = (s: string) => s.replace(/\D/g, '');
    expect(matches('12 34', ['1234'], digits)).toBe(true);
    expect(matches('1235', ['1234'], digits)).toBe(false);
  });
});

describe('typeToConfirmText', () => {
  it('names one, two or more alternatives', () => {
    expect(typeToConfirmText(['A4CF12F45B21'])).toBe('Type “A4CF12F45B21” to confirm');
    expect(typeToConfirmText(['Boiler', 'A8:03:2A:B1:23:45'])).toBe('Type “Boiler” or “A8:03:2A:B1:23:45” to confirm');
    expect(typeToConfirmText(['A', 'B', 'C'])).toBe('Type “A”, “B” or “C” to confirm');
  });
  it("formats MACs with 'mac'", () => {
    expect(typeToConfirmText(['Boiler', 'a8032ab12345'], 'mac')).toBe('Type “Boiler” or “A8:03:2A:B1:23:45” to confirm');
  });
});
