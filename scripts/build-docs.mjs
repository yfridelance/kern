// Documentation site: dist/docs.json (API + usage examples) + docs/pages (guides) + tokens → site/ (GitHub Pages).
// No dependencies; run after `npm run build` (`npm run docs` does both).
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'site');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const docs = JSON.parse(readFileSync(join(root, 'dist/docs.json'), 'utf8'));
const tokens = JSON.parse(readFileSync(join(root, 'tokens/tokens.json'), 'utf8'));
const REPO = 'https://github.com/yfridelance/kern';

// ---------- navigation ----------

/** Component groups (order = navigation order). Every component in docs.json must appear exactly once. */
const GROUPS = [
  ['Layout', ['kern-app-shell', 'kern-topbar', 'kern-page-header', 'kern-grid', 'kern-grid-item', 'kern-card', 'kern-toolbar', 'kern-accordion', 'kern-accordion-item']],
  ['Navigation', ['kern-tabs', 'kern-tab-panel', 'kern-link', 'kern-breadcrumb', 'kern-pagination', 'kern-language-select', 'kern-theme-toggle']],
  ['Actions', ['kern-button', 'kern-menu', 'kern-menu-item']],
  ['Forms', ['kern-input', 'kern-textarea', 'kern-select', 'kern-switch', 'kern-checkbox', 'kern-radio-group', 'kern-radio', 'kern-segmented', 'kern-ip-input', 'kern-mac-input', 'kern-file-input', 'kern-step-input', 'kern-range', 'kern-rating', 'kern-color-picker']],
  ['Date & time', ['kern-date', 'kern-time', 'kern-calendar', 'kern-date-picker', 'kern-date-range-picker', 'kern-time-picker']],
  ['Status', ['kern-badge', 'kern-status', 'kern-icon']],
  ['Feedback', ['kern-alert', 'kern-toast', 'kern-tooltip', 'kern-dialog', 'kern-drawer', 'kern-progress', 'kern-spinner', 'kern-skeleton']],
  ['Data', ['kern-table', 'kern-list', 'kern-list-item', 'kern-kv', 'kern-kv-item', 'kern-stat', 'kern-sparkline', 'kern-meter', 'kern-signal', 'kern-copy', 'kern-json', 'kern-json-diff', 'kern-code']],
];

/** Child elements documented together with their parent. */
const PARENT = {
  'kern-grid-item': 'kern-grid',
  'kern-accordion-item': 'kern-accordion',
  'kern-tab-panel': 'kern-tabs',
  'kern-menu-item': 'kern-menu',
  'kern-radio': 'kern-radio-group',
  'kern-list-item': 'kern-list',
  'kern-kv-item': 'kern-kv',
};

const GUIDES = [
  ['Getting started', [['getting-started', 'Getting started']]],
  [
    'Fundamentals',
    [
      ['fundamentals/theming', 'Theming'],
      ['fundamentals/tokens', 'Colour tokens'],
      ['fundamentals/typography-spacing', 'Typography & spacing'],
      ['fundamentals/layout', 'Layout'],
      ['fundamentals/naming', 'Naming'],
      ['fundamentals/forms', 'Forms'],
      ['fundamentals/accessibility', 'Accessibility'],
      ['fundamentals/localization', 'Localization'],
      ['fundamentals/icons', 'Icons'],
      ['fundamentals/overlays', 'Overlays'],
    ],
  ],
];

/**
 * Patterns: `docs/patterns/NN-slug.md` → `patterns/slug.html`, ordered by the number, titled by the `#` heading.
 * New pages need no change here.
 */
const PATTERNS = readdirSync(join(root, 'docs/patterns'))
  .filter((f) => /^\d+-[a-z0-9-]+\.md$/.test(f))
  .sort()
  .map((file) => {
    const md = readFileSync(join(root, 'docs/patterns', file), 'utf8').replace(/\r/g, '');
    const title = /^#\s+(.+)$/m.exec(md)?.[1]?.trim();
    if (!title) throw new Error(`docs/patterns/${file}: missing # title`);
    return { path: `patterns/${file.replace(/^\d+-/, '').replace(/\.md$/, '')}`, title, file, md };
  });
GUIDES.push(['Patterns', PATTERNS.map((p) => [p.path, p.title])]);

const byTag = new Map(docs.components.map((c) => [c.tag, c]));
const listed = GROUPS.flatMap(([, tags]) => tags);
const missing = docs.components.map((c) => c.tag).filter((t) => !listed.includes(t));
const unknown = listed.filter((t) => !byTag.has(t));
if (missing.length || unknown.length) {
  console.error(`Navigation out of date. Not listed: ${missing.join(', ') || '–'}. Unknown: ${unknown.join(', ') || '–'}`);
  process.exit(1);
}

// ---------- helpers ----------

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
/** Inline markdown of JSDoc texts: `code`, **bold**, line breaks. */
const inline = (s) =>
  esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\n{2,}/g, '</p><p>')
    .replace(/\n/g, ' ');

/**
 * Usage markdown → [{ title, text, html, js, snippets }] (one example per file, in file-name order). `html` and `js`
 * run in the demo; blocks with a heading after the language (```ts Angular) are shown as source only.
 */
function examples(usage) {
  return Object.keys(usage ?? {})
    .sort()
    .map((key) => parseExample(usage[key].replace(/\r/g, ''), /^#\s+(.+)$/m, key.replace(/^\d+-/, '').replace(/-/g, ' '), key));
}

/** One example from markdown: the title (by `heading`), text paragraphs, html/js blocks and source-only snippets. */
function parseExample(md, heading, fallbackTitle, key) {
  const title = heading.exec(md)?.[1]?.trim() ?? fallbackTitle;
  const block = (lang) => new RegExp('```' + lang + '\\s*\\n([\\s\\S]*?)\\n```').exec(md)?.[1] ?? '';
  const text = md
    .replace(heading, '')
    .replace(/```[\s\S]*?```/g, '')
    .trim()
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  const snippets = [...md.matchAll(/```(\w+)[ \t]+([^\n]+)\n([\s\S]*?)\n```/g)].map(([, lang, h, code]) => ({ lang, heading: h.trim(), code }));
  return { key, title, text, html: block('html'), js: block('js'), snippets };
}

/** Text paragraphs with simple markdown: `- ` lists, `code`, **bold**, [links](…). */
function prose(paragraphs) {
  const md = (s) => inline(s).replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, label, href) => `<a href="${href}">${label}</a>`);
  return paragraphs
    .map((p) =>
      /^- /.test(p)
        ? `<ul>${p
            .split(/\n(?=- )/)
            .map((li) => `<li>${md(li.replace(/^- /, ''))}</li>`)
            .join('')}</ul>`
        : `<p>${md(p)}</p>`,
    )
    .join('\n  ');
}

// ---------- page shell ----------

function nav(current, base) {
  const link = (path, label, extra = '') =>
    `<a href="${base}${path}.html"${path === current ? ' aria-current="page"' : ''}${extra}>${label}</a>`;
  const sections = GUIDES.map(
    ([title, pages]) => `<div class="nav-group"><span class="nav-title">${title}</span>${pages.map(([p, l]) => link(p, l)).join('')}</div>`,
  );
  for (const [title, tags] of GROUPS) {
    sections.push(
      `<div class="nav-group"><span class="nav-title">${title}</span>${tags
        .map((t) => link(`components/${t}`, `<code>${t}</code>`, PARENT[t] ? ' class="child"' : ''))
        .join('')}</div>`,
    );
  }
  return sections.join('');
}

function page({ path, title, body, source }) {
  const depth = path.split('/').length - 1;
  const base = '../'.repeat(depth);
  const navHtml = nav(path, base);
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title === 'Kern' ? 'Kern' : `${esc(title)} · Kern`}</title>
  <meta name="description" content="Kern – dark-first web components for device management, monitoring, network and smart home tools.">
  <script>try{document.documentElement.dataset.theme=localStorage.getItem('kern-theme')==='light'?'light':'dark'}catch(e){document.documentElement.dataset.theme='dark'}</script>
  <link rel="stylesheet" href="${base}kern/kern.css">
  <link rel="stylesheet" href="${base}assets/docs.css">
  <script type="module" src="${base}kern/kern.esm.js"></script>
  <script type="module" src="${base}assets/docs.js"></script>
</head>
<body>
  <kern-topbar class="topbar">
    <span slot="brand" class="brand-row">
      <kern-button class="menu-button" size="sm" variant="ghost" icon-only label="Navigation"><kern-icon name="menu"></kern-icon></kern-button>
      <a class="brand" href="${base}index.html"><span class="mark" aria-hidden="true"></span>Kern <span class="version">${esc(pkg.version)}</span></a>
    </span>
    <kern-input slot="end" class="search" type="search" size="sm" placeholder="Search components" aria-label-text="Search the navigation"></kern-input>
    <kern-link slot="end" href="${REPO}" external tone="muted">GitHub</kern-link>
    <kern-theme-toggle slot="end" small label-light="Switch to light theme" label-dark="Switch to dark theme"></kern-theme-toggle>
  </kern-topbar>
  <div class="layout">
    <nav class="sidebar" aria-label="Documentation">${navHtml}</nav>
    <main class="content" id="main">
${body}
      <footer class="page-footer">
        ${source ? `<kern-link href="${REPO}/blob/main/${source}" external tone="muted">Edit this page on GitHub</kern-link>` : ''}
        <span>Kern ${esc(pkg.version)} · MIT</span>
      </footer>
    </main>
  </div>
  <kern-drawer class="nav-drawer" heading="Kern" side="start" width="300"><nav aria-label="Documentation">${navHtml}</nav></kern-drawer>
</body>
</html>
`;
}

// ---------- component pages ----------

function table(head, rows) {
  if (!rows.length) return '';
  return `<kern-table><table><thead><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows
    .map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`)
    .join('')}</tbody></table></kern-table>`;
}

/** One API entry: name with facts (attribute, default) and badges, the type, the description. */
function apiItem(title, facts, badges, type, description) {
  const meta = facts.filter(Boolean).join(' · ');
  return `<div class="api-item">
  <div class="api-head"><code class="api-name">${esc(title)}</code>${badges}${meta ? `<span class="api-meta">${meta}</span>` : ''}</div>
  ${type ? `<code class="api-type">${esc(type)}</code>` : ''}
  ${description}
</div>`;
}

const apiList = (items) => (items.length ? `<div class="api-list">${items.join('')}</div>` : '');

function example(ex, id) {
  const script = ex.js
    ? `<script type="module">
await customElements.whenDefined('kern-code');
{
const root = document.getElementById(${JSON.stringify(id)});
${ex.js}
}
</script>`
    : '';
  return `<section class="example" aria-labelledby="${id}-title">
  <h3 id="${id}-title">${esc(ex.title)}</h3>
  ${prose(ex.text)}
  ${
    ex.html
      ? `<div class="demo" id="${id}">
${ex.html}
  </div>
  <kern-code class="source" language="html" heading="HTML">
${esc(ex.html)}
  </kern-code>`
      : ''
  }
  ${ex.js ? `<kern-code class="source" language="js" heading="JavaScript">\n${esc(ex.js)}\n  </kern-code>` : ''}
  ${ex.snippets.map((sn) => `<kern-code class="source" language="${esc(sn.lang)}" heading="${esc(sn.heading)}">\n${esc(sn.code)}\n  </kern-code>`).join('\n  ')}
  ${script}
</section>`;
}

/** Built-in Kern texts per language, read from the sources: `{ en: { key: text }, de: … }`. */
const TEXTS = Object.fromEntries(
  ['en', 'de'].map((l) => [l, Object.fromEntries([...readFileSync(join(root, `src/i18n/${l}.ts`), 'utf8').matchAll(/^  '([\w.-]+)': '(.*)',$/gm)].map((m) => [m[1], m[2]]))]),
);

/** Default of a text property: the Kern text in English, and in German. */
function textDefault(tag, prop) {
  const key = `${tag}.${prop}`;
  if (!(key in TEXTS.en)) return '';
  return `default <code>${esc(TEXTS.en[key])}</code> · de <code>${esc(TEXTS.de[key])}</code>`;
}

function componentPage(c) {
  const parent = PARENT[c.tag];
  const children = Object.entries(PARENT)
    .filter(([, p]) => p === c.tag)
    .map(([child]) => child);
  const exs = examples(c.usage);
  const flags = (p) =>
    [p.required && 'required', p.mutable && 'mutable', p.reflectToAttr && 'reflects'].filter(Boolean).map((f) => `<kern-badge>${f}</kern-badge>`).join('');
  const desc = (d) => (d ? `<p>${inline(d)}</p>` : '');
  const props = c.props.map((p) =>
    apiItem(
      p.name,
      [p.attr && p.attr !== p.name ? `attribute <code>${esc(p.attr)}</code>` : '', p.default !== undefined ? `default <code>${esc(p.default)}</code>` : textDefault(c.tag, p.name)],
      flags(p),
      p.type,
      desc(p.docs),
    ),
  );
  const events = c.events.map((e) => apiItem(e.event, [], '', `CustomEvent<${e.detail}>`, desc(e.docs)));
  const methods = c.methods.map((m) => apiItem(`${m.name}()`, [], '', m.signature, desc(m.docs)));
  const slots = c.slots.map((sl) => apiItem(sl.name || '(default)', [], '', '', desc(sl.docs)));
  const parts = c.parts.map((pt) => apiItem(pt.name, [], '', '', desc(pt.docs)));
  const related = [...new Set([...(parent ? [parent] : []), ...children])];
  const sections = [
    ['Examples', exs.length ? exs.map((e, i) => example(e, `ex-${i + 1}`)).join('\n') : parent ? `<p>See the examples on <a href="${parent}.html"><code>${parent}</code></a>.</p>` : '<p class="muted">Examples follow.</p>'],
    ['Properties', apiList(props)],
    ['Events', apiList(events)],
    ['Methods', apiList(methods)],
    ['Slots', apiList(slots)],
    ['CSS parts', apiList(parts)],
  ].filter(([, html]) => html);
  const toc = sections.map(([t]) => `<a href="#${t.toLowerCase().replace(/\W+/g, '-')}">${t}</a>`).join('');
  const body = `
      <header class="page-head">
        <span class="overline">${GROUPS.find(([, tags]) => tags.includes(c.tag))[0]}</span>
        <h1><code>&lt;${c.tag}&gt;</code></h1>
        <p class="lead">${inline(c.docs)}</p>
        ${related.length ? `<p class="related">${parent ? 'Used inside' : 'Children'}: ${related.map((t) => `<a href="${t}.html"><code>${t}</code></a>`).join(', ')}</p>` : ''}
        <nav class="toc" aria-label="On this page">${toc}</nav>
      </header>
      ${sections.map(([t, html]) => `<section class="block" id="${t.toLowerCase().replace(/\W+/g, '-')}"><h2>${t}</h2>${html}</section>`).join('\n')}`;
  return page({ path: `components/${c.tag}`, title: c.tag, body, source: c.filePath.replace(/^\.\//, '') });
}

// ---------- guide pages ----------

const swatch = (v) => `<span class="swatch" style="background:${esc(v)}"></span>`;

function colorTables() {
  const resolve = (v) => (/^\{(.+)\}$/.test(v) ? `var(--${v.slice(1, -1)})` : v);
  const rows = tokens.color.tokens.map((t) => {
    const v = typeof t.value === 'string' ? { dark: t.value, light: t.value } : t.value;
    return [
      `<code>--${esc(t.name)}</code>`,
      `<span class="pair" data-theme="dark">${swatch(resolve(v.dark))}<code>${esc(v.dark)}</code></span>`,
      `<span class="pair" data-theme="light">${swatch(resolve(v.light ?? v.dark))}<code>${esc(v.light ?? v.dark)}</code></span>`,
    ];
  });
  return table(['Token', 'Dark', 'Light'], rows);
}

function typeTables() {
  const rows = tokens.type.groups.flatMap((g) =>
    g.styles.map((s) => [
      `<code>.${esc(s.name)}</code>`,
      `<code>${esc(s.fontSize)} / ${esc(s.lineHeight)} · ${esc(s.fontWeight)}</code>`,
      `<span class="${esc(s.name)}">${esc(s.sample)}</span>`,
    ]),
  );
  return table(['Class', 'Size / line · weight', 'Sample'], rows);
}

function scaleTable(family) {
  return table(
    ['Token', 'Value', ''],
    (tokens[family]?.tokens ?? []).map((t) => [
      `<code>--${esc(t.name)}</code>`,
      `<code>${esc(t.value)}</code>`,
      family === 'spacing' ? `<span class="bar" style="width:${esc(t.value)}"></span>` : family === 'radius' ? `<span class="radius" style="border-radius:${esc(t.value)}"></span>` : '',
    ]),
  );
}

function iconGrid() {
  const src = readFileSync(join(root, 'src/utils/icons.tsx'), 'utf8');
  const names = [...src.matchAll(/^  '?([a-z-]+)'?: \(\) =>/gm)].map((m) => m[1]);
  return `<div class="icon-grid">${names
    .map((n) => `<div class="icon-cell"><kern-icon name="${n}"></kern-icon><kern-copy value="${n}">${n}</kern-copy></div>`)
    .join('')}</div>`;
}

function brandGrid() {
  const src = readFileSync(join(root, 'src/utils/brands.ts'), 'utf8');
  const names = [...src.matchAll(/^  '(brand-[a-z0-9-]+)': \{ title: "([^"]+)"/gm)];
  return `<div class="icon-grid">${names
    .map(([, n, title]) => `<div class="icon-cell"><kern-icon name="${n}" label="${esc(title)}"></kern-icon><kern-copy value="${n}">${n}</kern-copy></div>`)
    .join('')}</div>`;
}

/** All Kern texts with key, English and German, for `setKernStrings()`. */
function stringsTable() {
  return table(
    ['Key', 'en', 'de'],
    Object.keys(TEXTS.en).map((k) => [`<code>${esc(k)}</code>`, esc(TEXTS.en[k]), esc(TEXTS.de[k])]),
  );
}

function flagGrid() {
  const names = readFileSync(join(root, 'src/utils/flag-names.ts'), 'utf8').match(/'flag-[a-z]{2}'/g).map((n) => n.slice(1, -1));
  return `<div class="icon-grid">${names
    .map((n) => {
      const title = /title: "([^"]+)"/.exec(readFileSync(join(root, 'src/utils/flags', `${n.slice(5)}.ts`), 'utf8'))[1];
      return `<div class="icon-cell"><kern-icon name="${n}" label="${esc(title)}"></kern-icon><kern-copy value="${n}">${n}</kern-copy></div>`;
    })
    .join('')}</div>`;
}

function componentGrid() {
  return GROUPS.map(
    ([title, tags]) =>
      `<h3>${title}</h3><div class="component-grid">${tags
        .filter((t) => !PARENT[t])
        .map((t) => `<a class="component-card" href="components/${t}.html"><code>${t}</code><span>${inline(firstSentence(byTag.get(t).docs))}</span></a>`)
        .join('')}</div>`,
  ).join('');
}

function firstSentence(s) {
  const m = /^[\s\S]*?[.!?](\s|$)/.exec(String(s ?? '').replace(/\n/g, ' '));
  return (m ? m[0] : String(s ?? '')).trim();
}

const PLACEHOLDERS = {
  colors: colorTables,
  type: typeTables,
  spacing: () => scaleTable('spacing'),
  radius: () => scaleTable('radius'),
  layout: () => scaleTable('layout'),
  sizes: () => scaleTable('size'),
  icons: iconGrid,
  brands: brandGrid,
  flags: flagGrid,
  strings: stringsTable,
  components: componentGrid,
  version: () => esc(pkg.version),
};

/** Guide fragment: first line `<!-- title: … -->`; `<!--@name-->` placeholders; `<kern-code>` blocks keep whitespace. */
function guidePage(path, file) {
  const raw = readFileSync(join(root, 'docs/pages', file), 'utf8');
  const title = /<!--\s*title:\s*(.+?)\s*-->/.exec(raw)?.[1] ?? path;
  const body = raw.replace(/<!--@(\w+)-->/g, (m, key) => {
    if (!PLACEHOLDERS[key]) throw new Error(`${file}: unknown placeholder ${m}`);
    return PLACEHOLDERS[key]();
  });
  return page({ path, title, body, source: `docs/pages/${file}` });
}

// ---------- pattern pages ----------

/** Pattern page: `# Title`, intro, then one live example per `## Section` (text-only sections are fine). */
function patternPage(p) {
  const [head, ...parts] = p.md.split(/^(?=## )/m);
  const intro = parseExample(head, /^#\s+(.+)$/m, p.title, p.file);
  const sections = parts.map((part, i) => parseExample(part, /^##\s+(.+)$/m, `Section ${i + 1}`, `${p.file}#${i + 1}`));
  const slug = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const toc = sections.map((s) => `<a href="#${slug(s.title)}-title">${esc(s.title)}</a>`).join('');
  const body = `
      <header class="page-head">
        <span class="overline">Pattern</span>
        <h1>${esc(p.title)}</h1>
        <div class="lead">${prose(intro.text)}</div>
        ${sections.length > 1 ? `<nav class="toc" aria-label="On this page">${toc}</nav>` : ''}
      </header>
      ${sections.map((s) => example(s, slug(s.title))).join('\n')}`;
  return page({ path: p.path, title: p.title, body, source: `docs/patterns/${p.file}` });
}

// ---------- write ----------

rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, 'components'), { recursive: true });
mkdirSync(join(out, 'fundamentals'), { recursive: true });
mkdirSync(join(out, 'patterns'), { recursive: true });
cpSync(join(root, 'dist/kern'), join(out, 'kern'), { recursive: true });
cpSync(join(root, 'docs/assets'), join(out, 'assets'), { recursive: true });

const written = [];
const write = (path, html) => {
  writeFileSync(join(out, `${path}.html`), html);
  written.push(path);
};

write('index', guidePage('index', 'index.html'));
for (const [, pages] of GUIDES) for (const [path] of pages) if (!path.startsWith('patterns/')) write(path, guidePage(path, `${path.replace('/', '-')}.html`));
for (const p of PATTERNS) write(p.path, patternPage(p));
for (const c of docs.components) write(`components/${c.tag}`, componentPage(c));
writeFileSync(join(out, '.nojekyll'), '');

// ---------- checks ----------

let broken = 0;
for (const path of written) {
  const html = readFileSync(join(out, `${path}.html`), 'utf8');
  for (const [, href] of html.matchAll(/href="([^"#]+?\.html)(?:#[^"]*)?"/g)) {
    if (/^https?:/.test(href)) continue;
    const target = join(out, dirname(path), href);
    if (!existsSync(target)) {
      console.error(`Broken link in ${path}.html: ${href}`);
      broken++;
    }
  }
}
if (broken) process.exit(1);

const withExamples = docs.components.filter((c) => Object.keys(c.usage ?? {}).length).length;
const files = readdirSync(join(out, 'components')).length;
console.log(`docs: ${written.length} pages (${files} components, ${withExamples} with examples) → ${relative(root, out)}/`);
