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

  it('highlights powershell: cmdlets, variables, operators, here-strings', () => {
    const ps = [
      '<# Shelly #>',
      '$ip = $env:SHELLY_IP # fallback',
      'if ($r.output -eq $true) { Get-ChildItem -Path "C:\\`$x" }',
      '$body = @"',
      '{"id": 0}',
      '"@',
      "Write-Host 'it''s' 0x1F 10MB",
    ].join('\n');
    expect(typed(ps, 'powershell')).toEqual([
      'comment:<# Shelly #>',
      'variable:$ip',
      'variable:$env:SHELLY_IP',
      'comment:# fallback',
      'keyword:if',
      'variable:$r',
      'keyword:-eq',
      'literal:$true',
      'key:Get-ChildItem',
      'string:"C:\\`$x"',
      'variable:$body',
      'string:@"\n{"id": 0}\n"@',
      'key:Write-Host',
      "string:'it''s'",
      'number:0x1F',
      'number:10MB',
    ]);
    expect(typed('foreach ($d in $devices) { $d.Name }', 'pwsh')).toEqual(['keyword:foreach', 'variable:$d', 'keyword:in', 'variable:$devices', 'variable:$d']);
    expect(typed('-Include x', 'ps1')).toEqual([]);
  });

  it('highlights ruby: symbols, instance variables, heredocs, keywords', () => {
    const rb = [
      '=begin',
      'Docs',
      '=end',
      'def toggle(id) # flip',
      '  @client.post("/rpc/Switch.Toggle?id=#{id}", timeout: 3)',
      '  body = <<~JSON',
      '    {"on": true}',
      '  JSON',
      '  return nil unless defined?(Foo::Bar)',
      'end',
    ].join('\n');
    expect(typed(rb, 'ruby')).toEqual([
      'comment:=begin\nDocs\n=end',
      'keyword:def',
      'comment:# flip',
      'variable:@client',
      'string:"/rpc/Switch.Toggle?id=#{id}"',
      'key:timeout',
      'number:3',
      'string:<<~JSON\n    {"on": true}\n  JSON',
      'keyword:return',
      'literal:nil',
      'keyword:unless',
      'keyword:defined?',
      'keyword:end',
    ]);
    expect(typed(`puts :on, 'a\\'b', %w[x y], $stdout, 1_000`, 'rb')).toEqual([
      'key:puts',
      'literal::on',
      "string:'a\\'b'",
      'string:%w[x y]',
      'variable:$stdout',
      'number:1_000',
    ]);
  });

  it('highlights go: keywords, builtins, raw strings, runes and numbers', () => {
    const go = [
      'func get(ip string) (int, error) { // GET',
      '\tre := `^\\d+$`',
      "\tif len(ip) == 0 || ip[0] == '\\n' {",
      '\t\treturn 0, nil',
      '\t}',
      '\treturn 0x1F + 1_000 + 2.5e3, fmt.Errorf("bad %q\\n", ip)',
      '}',
    ].join('\n');
    expect(typed(go, 'golang')).toEqual([
      'keyword:func',
      'key:string',
      'key:int',
      'key:error',
      'comment:// GET',
      'string:`^\\d+$`',
      'keyword:if',
      'key:len',
      'number:0',
      'number:0',
      "string:'\\n'",
      'keyword:return',
      'number:0',
      'literal:nil',
      'keyword:return',
      'number:0x1F',
      'number:1_000',
      'number:2.5e3',
      'string:"bad %q\\n"',
    ]);
    expect(typed('/* a */ var x = iota', 'go')).toEqual(['comment:/* a */', 'keyword:var', 'literal:iota']);
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
