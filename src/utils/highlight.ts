export type KernCodeLanguage =
  | 'text'
  | 'shell'
  | 'yaml'
  | 'json'
  | 'js'
  | 'ts'
  | 'ini'
  | 'html'
  | 'powershell'
  | 'ps1'
  | 'pwsh'
  | 'ruby'
  | 'rb'
  | 'go'
  | 'golang';

/** Other names for a language. */
const ALIASES: Partial<Record<KernCodeLanguage, KernCodeLanguage>> = { ps1: 'powershell', pwsh: 'powershell', rb: 'ruby', golang: 'go' };
type RuledLanguage = Exclude<KernCodeLanguage, 'text' | 'ps1' | 'pwsh' | 'rb' | 'golang'>;
export type TokenType = 'comment' | 'string' | 'number' | 'keyword' | 'literal' | 'key' | 'variable' | 'section';

export interface Token {
  type?: TokenType;
  text: string;
}

type Rule = [TokenType, RegExp];

const JS_KEYWORDS =
  'as|async|await|break|case|catch|class|const|continue|default|delete|do|else|export|extends|finally|for|from|function|if|import|in|instanceof|interface|let|new|of|return|static|switch|throw|try|type|typeof|var|void|while|yield';

const PS_KEYWORDS =
  'begin|break|catch|class|continue|data|do|dynamicparam|else|elseif|end|enum|exit|filter|finally|for|foreach|function|if|in|param|process|return|switch|throw|trap|try|until|using|while';
const PS_OPERATORS =
  'eq|ne|gt|ge|lt|le|like|notlike|match|notmatch|contains|notcontains|in|notin|replace|split|join|and|or|not|xor|is|isnot|as|band|bor|bxor|bnot|shl|shr|f';
/** Common verbs of `Verb-Noun` cmdlets and functions (Get-ChildItem, Invoke-RestMethod, ConvertTo-Json …). */
const PS_VERBS =
  'Add|Approve|Assert|Backup|Block|Checkpoint|Clear|Close|Compare|Complete|Compress|Confirm|Connect|ConvertFrom|ConvertTo|Copy|Debug|Deny|Disable|Disconnect|Dismount|Edit|Enable|Enter|Exit|Expand|Export|Find|ForEach|Format|Get|Grant|Group|Import|Initialize|Install|Invoke|Join|Limit|Lock|Measure|Merge|Mount|Move|New|Open|Optimize|Out|Ping|Pop|Protect|Publish|Push|Read|Receive|Redo|Register|Remove|Rename|Repair|Request|Reset|Resize|Resolve|Restart|Restore|Resume|Revoke|Save|Search|Select|Send|Set|Show|Skip|Sort|Split|Start|Step|Stop|Submit|Suspend|Switch|Sync|Tee|Test|Trace|Unblock|Undo|Uninstall|Unlock|Unprotect|Unpublish|Unregister|Update|Use|Wait|Watch|Where|Write';

const RUBY_KEYWORDS =
  'BEGIN|END|alias|and|begin|break|case|class|def|do|else|elsif|end|ensure|for|if|in|module|next|not|or|redo|rescue|retry|return|super|then|undef|unless|until|when|while|yield';
const RUBY_BUILTINS =
  'attr_accessor|attr_reader|attr_writer|extend|format|gets|include|lambda|loop|prepend|print|printf|private|proc|protected|public|puts|raise|require|require_relative|sleep|warn';

const GO_KEYWORDS =
  'break|case|chan|const|continue|default|defer|else|fallthrough|for|func|go|goto|if|import|interface|map|package|range|return|select|struct|switch|type|var';
/** Predeclared types and functions. */
const GO_BUILTINS =
  'any|append|bool|byte|cap|clear|close|comparable|complex|complex64|complex128|copy|delete|error|float32|float64|imag|int|int8|int16|int32|int64|len|make|max|min|new|panic|print|println|real|recover|rune|string|uint|uint8|uint16|uint32|uint64|uintptr';

const words = (list: string, flags = 'y') => new RegExp(`\\b(?:${list})\\b`, flags);

/**
 * Rules per language, tried in order at each position (first match wins). Operators that are words (PowerShell's
 * `-eq`) count as keywords; builtins and cmdlets use `key`.
 */
const RULES: Record<RuledLanguage, Rule[]> = {
  shell: [
    ['comment', /#[^\n]*/y],
    ['string', /"(?:\\.|[^"\\])*"|'[^']*'/y],
    ['variable', /\$(?:\{[^}\n]*\}|[A-Za-z_][\w]*|[0-9@#?*$!-])/y],
    ['keyword', /\b(?:if|then|else|elif|fi|for|while|until|do|done|case|esac|in|function|return|export|local|sudo)\b/y],
    ['number', /\b\d+(?:\.\d+)?\b/y],
  ],
  yaml: [
    ['comment', /#[^\n]*/y],
    ['key', /[A-Za-z_][\w.\-/]*(?=\s*:(?:\s|$))/y],
    ['string', /"(?:\\.|[^"\\])*"|'(?:''|[^'])*'/y],
    ['literal', /\b(?:true|false|yes|no|on|off|null)\b|~/y],
    ['number', /-?\b\d+(?:\.\d+)?\b/y],
  ],
  json: [
    ['key', /"(?:\\.|[^"\\])*"(?=\s*:)/y],
    ['string', /"(?:\\.|[^"\\])*"/y],
    ['literal', /\b(?:true|false|null)\b/y],
    ['number', /-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/y],
  ],
  js: [
    ['comment', /\/\/[^\n]*|\/\*[\s\S]*?\*\//y],
    ['string', /"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`/y],
    ['keyword', new RegExp(`\\b(?:${JS_KEYWORDS})\\b`, 'y')],
    ['literal', /\b(?:true|false|null|undefined|this)\b/y],
    ['number', /\b\d+(?:\.\d+)?\b/y],
  ],
  ts: [],
  html: [
    ['comment', /<!--[\s\S]*?-->/y],
    // Tag names (with the angle bracket), attribute names and quoted values.
    ['keyword', /<\/?[A-Za-z][\w-]*|\/?>/y],
    ['key', /[A-Za-z_:@][\w:.@-]*(?=\s*=)/y],
    ['string', /"[^"]*"|'[^']*'/y],
  ],
  ini: [
    ['comment', /[;#][^\n]*/y],
    ['section', /\[[^\]\n]*\]/y],
    ['key', /[A-Za-z_][\w.\-]*(?=\s*=)/y],
    ['string', /"(?:\\.|[^"\\])*"/y],
    ['literal', /\b(?:true|false|yes|no|on|off)\b/y],
    ['number', /-?\b\d+(?:\.\d+)?\b/y],
  ],
  powershell: [
    ['comment', /<#[\s\S]*?#>|#[^\n]*/y],
    // Here-strings (`@"` … `"@` with the closing quote at a line start), then strings with backtick escapes.
    ['string', /@"[ \t]*\n[\s\S]*?\n"@|@'[ \t]*\n[\s\S]*?\n'@|"(?:`[\s\S]|""|[^"`])*"|'(?:''|[^'])*'/y],
    ['literal', /\$(?:true|false|null)\b/iy],
    ['variable', /\$(?:\{[^}\n]*\}|(?:env|global|script|local|private|using):\w+|[A-Za-z_]\w*|[$?^_])/y],
    ['key', new RegExp(`\\b(?:${PS_VERBS})-[A-Za-z]\\w*`, 'iy')],
    ['keyword', new RegExp(`-(?:${PS_OPERATORS})\\b`, 'iy')],
    ['keyword', words(PS_KEYWORDS, 'iy')],
    ['number', /\b0x[0-9a-f]+\b|\b\d+(?:\.\d+)?(?:e[+-]?\d+)?(?:[kmgtp]b)?\b/iy],
  ],
  ruby: [
    ['comment', /^=begin\b[\s\S]*?^=end\b[^\n]*|#[^\n]*/my],
    // Heredocs (`<<~EOS` … `EOS`), strings with escapes and `#{…}`, %w[] / %i[] lists and backtick commands.
    [
      'string',
      /<<[~-]?(["'`]?)([A-Za-z_]\w*)\1[^\n]*\n[\s\S]*?^[ \t]*\2$|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|%[qQwWiI]?(?:\[[^\]]*\]|\([^)]*\)|\{[^}]*\})/my,
    ],
    ['key', /[A-Za-z_]\w*(?=:\s)/y],
    ['literal', /(?<!:):(?:[A-Za-z_]\w*[?!=]?|"(?:\\.|[^"\\])*")|\b(?:true|false|nil|self)\b/y],
    ['variable', /@@?[A-Za-z_]\w*|\$(?:[A-Za-z_]\w*|\d+|[!@&~?$:;,.<>*_\/\\])/y],
    ['keyword', new RegExp(`\\bdefined\\?|\\b(?:${RUBY_KEYWORDS})\\b`, 'y')],
    ['key', words(RUBY_BUILTINS)],
    ['number', /\b0x[0-9a-f_]+\b|\b0b[01_]+\b|\b\d[\d_]*(?:\.\d[\d_]*)?(?:e[+-]?\d+)?\b/iy],
  ],
  go: [
    ['comment', /\/\/[^\n]*|\/\*[\s\S]*?\*\//y],
    // Interpreted strings with escapes, raw strings in backticks, runes.
    ['string', /"(?:\\.|[^"\\\n])*"|`[^`]*`|'(?:\\.|[^'\\\n])+'/y],
    ['keyword', words(GO_KEYWORDS)],
    ['literal', /\b(?:true|false|nil|iota)\b/y],
    ['key', words(GO_BUILTINS)],
    ['number', /\b0x[0-9a-f_]+(?:\.[0-9a-f_]*)?(?:p[+-]?\d+)?i?\b|\b0[bo][0-7_]+\b|\b\d[\d_]*(?:\.\d[\d_]*)?(?:e[+-]?\d+)?i?\b|\.\d[\d_]*(?:e[+-]?\d+)?\b/iy],
  ],
};
RULES.ts = RULES.js;

/** Tokens of the whole text; plain text between matches has no type. */
export function tokenize(code: string, language: KernCodeLanguage = 'text'): Token[] {
  const lang = ALIASES[language] ?? language;
  const rules = lang === 'text' ? undefined : RULES[lang as RuledLanguage];
  if (!rules?.length) return [{ text: code }];
  const out: Token[] = [];
  let plain = '';
  let i = 0;
  while (i < code.length) {
    let hit: Token | undefined;
    for (const [type, re] of rules) {
      re.lastIndex = i;
      const m = re.exec(code);
      if (m && m[0]) {
        hit = { type, text: m[0] };
        break;
      }
    }
    if (hit) {
      if (plain) out.push({ text: plain });
      plain = '';
      out.push(hit);
      i += hit.text.length;
    } else {
      // Skip a whole word at once, so keywords are only matched at word starts.
      const word = /^[A-Za-z_]\w*/.exec(code.slice(i, i + 64));
      const step = word ? word[0].length : 1;
      plain += code.slice(i, i + step);
      i += step;
    }
  }
  if (plain) out.push({ text: plain });
  return out;
}

/** Tokens split into lines (tokens spanning several lines are cut at the line breaks). */
export function tokenLines(code: string, language: KernCodeLanguage = 'text'): Token[][] {
  const lines: Token[][] = [[]];
  for (const tok of tokenize(code, language)) {
    tok.text.split('\n').forEach((part, n) => {
      if (n > 0) lines.push([]);
      if (part) lines[lines.length - 1].push({ type: tok.type, text: part });
    });
  }
  return lines;
}

/**
 * Remove common indentation, trailing spaces and blank first/last lines (code written indented inside HTML).
 * When the code starts on the same line as the tag (or a minifier collapsed the line break before it), the first
 * line's indentation says nothing, so only the other lines decide.
 */
export function dedent(text: string): string {
  const firstReliable = /^[ \t]*\n/.test(text);
  const lines = text
    .replace(/\t/g, '  ')
    .split('\n')
    .map((l) => l.trimEnd());
  while (lines.length && !lines[0].trim()) lines.shift();
  while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
  if (!lines.length) return '';
  const width = (l: string) => /^ */.exec(l)![0].length;
  const measured = (firstReliable ? lines : lines.slice(1)).filter((l) => l.trim());
  const indent = measured.length ? Math.min(...measured.map(width)) : 0;
  return lines.map((l, i) => (i === 0 && !firstReliable ? l.trimStart() : l.slice(Math.min(indent, width(l))))).join('\n');
}
