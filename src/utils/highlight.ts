export type KernCodeLanguage = 'text' | 'shell' | 'yaml' | 'json' | 'js' | 'ts' | 'ini';
export type TokenType = 'comment' | 'string' | 'number' | 'keyword' | 'literal' | 'key' | 'variable' | 'section';

export interface Token {
  type?: TokenType;
  text: string;
}

type Rule = [TokenType, RegExp];

const JS_KEYWORDS =
  'as|async|await|break|case|catch|class|const|continue|default|delete|do|else|export|extends|finally|for|from|function|if|import|in|instanceof|interface|let|new|of|return|static|switch|throw|try|type|typeof|var|void|while|yield';

/** Rules per language, tried in order at each position (first match wins). */
const RULES: Record<Exclude<KernCodeLanguage, 'text'>, Rule[]> = {
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
  ini: [
    ['comment', /[;#][^\n]*/y],
    ['section', /\[[^\]\n]*\]/y],
    ['key', /[A-Za-z_][\w.\-]*(?=\s*=)/y],
    ['string', /"(?:\\.|[^"\\])*"/y],
    ['literal', /\b(?:true|false|yes|no|on|off)\b/y],
    ['number', /-?\b\d+(?:\.\d+)?\b/y],
  ],
};
RULES.ts = RULES.js;

/** Tokens of the whole text; plain text between matches has no type. */
export function tokenize(code: string, language: KernCodeLanguage = 'text'): Token[] {
  const rules = language === 'text' ? undefined : RULES[language];
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
