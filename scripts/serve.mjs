import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve('.');
const port = Number(process.env.PORT || 4173);
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.json': 'application/json' };
const server = http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = resolve(root, '.' + (pathname === '/' ? '/preview/index.html' : pathname));
    // 仅开放独立预览及其构建结果，避免暴露工程外文件。
    if (!file.startsWith(root + sep + 'preview' + sep) || !(await stat(file)).isFile()) {
      res.writeHead(404).end(); return;
    }
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(await readFile(file));
  } catch { res.writeHead(404).end(); }
});
server.listen(port, '127.0.0.1', () => console.log(`蛊真人皮肤预览：http://127.0.0.1:${port}`));
