import { dedent, tokenLines, tokenize } from './highlight';

const typed = (code: string, lang: Parameters<typeof tokenize>[1]) =>
  tokenize(code, lang)
    .filter((t) => t.type)
    .map((t) => `${t.type}:${t.text}`);

describe('highlight', () => {
  it('leaves text alone', () => {
    expect(tokenize('a # b', 'text')).toEqual([{ text: 'a # b' }]);
  });

  it('highlights shell', () => {
    expect(typed(`if [ "$HOST" ]; then curl -X POST http://\${IP}/rpc # neu starten`, 'shell')).toEqual([
      'keyword:if',
      'string:"$HOST"',
      'keyword:then',
      'variable:${IP}',
      'comment:# neu starten',
    ]);
  });

  it('highlights yaml keys, values and comments', () => {
    expect(typed(`mqtt:\n  enable: true # an\n  port: 1883\n  server: "192.168.1.5"`, 'yaml')).toEqual([
      'key:mqtt',
      'key:enable',
      'literal:true',
      'comment:# an',
      'key:port',
      'number:1883',
      'key:server',
      'string:"192.168.1.5"',
    ]);
  });

  it('highlights json and js without matching inside words', () => {
    expect(typed(`{"on": true, "id": 3}`, 'json')).toEqual(['key:"on"', 'literal:true', 'key:"id"', 'number:3']);
    expect(typed(`const ifx = await fetch('/rpc'); // x`, 'ts')).toEqual(['keyword:const', 'keyword:await', "string:'/rpc'", 'comment:// x']);
  });

  it('highlights html tags, attributes and values', () => {
    expect(typed(`<kern-button variant="primary" disabled>Save</kern-button><!-- x -->`, 'html')).toEqual([
      'keyword:<kern-button',
      'key:variant',
      'string:"primary"',
      'keyword:>',
      'keyword:</kern-button',
      'keyword:>',
      'comment:<!-- x -->',
    ]);
  });

  it('highlights ini sections and keys', () => {
    expect(typed(`[wifi]\nssid = Haus ; Kommentar`, 'ini')).toEqual(['section:[wifi]', 'key:ssid', 'comment:; Kommentar']);
  });

  it('splits multi-line tokens into lines', () => {
    const lines = tokenLines(`/* a\nb */ x`, 'js');
    expect(lines.map((l) => l.map((t) => `${t.type ?? '-'}:${t.text}`))).toEqual([['comment:/* a'], ['comment:b */', '-: x']]);
  });

  it('dedents code written inside HTML', () => {
    expect(dedent(`\n    a:\n      b: 1\n\n    c: 2\n  `)).toBe('a:\n  b: 1\n\nc: 2');
    // First line's leading whitespace collapsed by a minifier
    expect(dedent(` # Kommentar\n          curl -X POST\n            -d x `)).toBe('# Kommentar\ncurl -X POST\n  -d x');
  });
});
