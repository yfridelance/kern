// Browser tests (#128): copies e2e/fixtures/ and the built dist/kern to site/e2e/, served by scripts/serve-docs.mjs
// under /kern/e2e/. Separate from scripts/build-docs.mjs so the tests do not depend on the docs texts.
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const out = `${root}site/e2e/`;

if (!existsSync(`${root}dist/kern/kern.esm.js`)) {
  console.error('dist/kern fehlt: zuerst npm run build');
  process.exit(1);
}
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
cpSync(`${root}e2e/fixtures`, out, { recursive: true });
cpSync(`${root}dist/kern`, `${out}kern`, { recursive: true });
console.log('e2e: Fixtures nach site/e2e/ kopiert');
