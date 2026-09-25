import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Local static preview. Production email delivery is handled by /api/contato on Vercel.
const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 4173);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.jpg': 'image/jpeg', '.png': 'image/png', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json' };
http.createServer(async (req, res) => {
  if (req.url.split('?')[0] === '/api/contato') {
    res.writeHead(503, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Envio indisponível na prévia local. Use o e-mail comercial@orizonbenefits.com.br.' }));
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end(); }
  try {
    const name = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    let file = path.resolve(root, '.' + name);
    if (file !== root && !file.startsWith(root + path.sep)) throw new Error('Forbidden');
    if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
    if (!types[path.extname(file)] || file.includes(path.sep + 'api' + path.sep)) throw new Error('Forbidden');
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[path.extname(file)], 'Cache-Control': 'no-store' });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(port, '127.0.0.1', () => console.log(`Orizon Benefits: http://127.0.0.1:${port}`));
