// tokens/tokens.json (the design-system source) → src/global/tokens.css (CSS custom properties per theme).
import { readFileSync, writeFileSync } from 'node:fs';

const tokens = JSON.parse(readFileSync(new URL('../tokens/tokens.json', import.meta.url), 'utf8'));
const themes = tokens.color.themes.map((t) => t.id);
const ref = (v) => (/^\{(.+)\}$/.test(v) ? `var(--${v.slice(1, -1)})` : v);

const perTheme = Object.fromEntries(themes.map((id) => [id, []]));
for (const t of [...tokens.color.tokens, ...(tokens.shadow?.tokens ?? [])]) {
  const value = typeof t.value === 'string' ? { [themes[0]]: t.value } : t.value;
  for (const id of themes) if (value[id] !== undefined) perTheme[id].push(`  --${t.name}: ${ref(value[id])};`);
}

const out = ['/* Kern — generated from tokens/tokens.json by scripts/build-tokens.mjs. Do not edit. */'];
out.push(`:root, [data-theme="${themes[0]}"] {`, ...perTheme[themes[0]], '}');
for (const id of themes.slice(1)) out.push(`[data-theme="${id}"] {`, ...perTheme[id], '}');

out.push(':root {');
for (const family of ['spacing', 'radius', 'size', 'layout']) {
  for (const t of tokens[family]?.tokens ?? []) out.push(`  --${t.name}: ${t.value};`);
}
for (const [key, stack] of Object.entries(tokens.type.families)) out.push(`  --font-${key}: ${stack};`);
out.push('}');

for (const group of tokens.type.groups) {
  for (const s of group.styles) {
    const rules = [
      `font-family: var(--font-${s.family ?? group.family})`,
      `font-size: ${s.fontSize}`,
      `line-height: ${s.lineHeight}`,
      `font-weight: ${s.fontWeight}`,
    ];
    if (s.letterSpacing) rules.push(`letter-spacing: ${s.letterSpacing}`);
    out.push(`.${s.name} { ${rules.join('; ')}; }`);
  }
}

writeFileSync(new URL('../src/global/tokens.css', import.meta.url), out.join('\n') + '\n');
console.log(`tokens.css: ${themes.length} themes, ${tokens.color.tokens.length} colors`);
