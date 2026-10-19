import { accepts, formatSize, parseSize } from './files';

describe('files', () => {
  it('parses sizes', () => {
    expect([parseSize(2048), parseSize('16MB'), parseSize('500 kb'), parseSize('1,5 GB'), parseSize(''), parseSize('viel')]).toEqual([
      2048,
      16 * 1024 ** 2,
      500 * 1024,
      Math.round(1.5 * 1024 ** 3),
      null,
      null,
    ]);
  });
  it('formats sizes', () => {
    expect([formatSize(512, 'en'), formatSize(1536, 'en'), formatSize(5 * 1024 ** 2, 'en')]).toEqual(['512 B', '1.5 KB', '5 MB']);
  });
  it('matches accept rules', () => {
    const fw = { name: 'shelly-1.4.4.ZIP', type: 'application/zip' };
    expect([accepts(fw, ''), accepts(fw, '.zip'), accepts(fw, '.bin,.json'), accepts(fw, 'application/*'), accepts(fw, 'image/*'), accepts(fw, 'application/zip')]).toEqual([
      true,
      true,
      false,
      true,
      false,
      true,
    ]);
  });
});
