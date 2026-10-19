// Serves site/ under /kern/ like GitHub Pages: node scripts/serve-docs.mjs [port]
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const site = fileURLToPath(new URL('../site/', import.meta.url));
const port = Number(process.argv[2] ?? 4321);
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.map': 'application/json' };

createServer((req, res) => {
  const url = decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname);
  if (!url.startsWith('/kern/')) {
    res.writeHead(302, { location: '/kern/' }).end();
    return;
  }
  let file = normalize(join(site, url.slice('/kern/'.length)));
  if (!file.startsWith(site)) return void res.writeHead(403).end();
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!existsSync(file)) return void res.writeHead(404).end('Not found');
  res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream', 'cache-control': 'no-store' }).end(readFileSync(file));
}).listen(port, () => console.log(`docs: http://localhost:${port}/kern/`));
