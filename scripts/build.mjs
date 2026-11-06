import { build } from 'esbuild';
import { mkdir, copyFile, readFile, writeFile } from 'node:fs/promises';

await mkdir('lib', { recursive: true });
await mkdir('preview/dist', { recursive: true });
const pkg = JSON.parse(await readFile('package.json', 'utf8'));
await copyFile('src/index.js', 'lib/index.js');
// DSH 使用延迟执行的 CommonJS 工厂；React 由宿主提供。
await build({
  entryPoints: ['src/client.jsx'], outfile: 'lib/client.js', bundle: true,
  platform: 'browser', format: 'cjs', target: 'es2022', minify: true,
  external: ['react'], loader: { '.png': 'dataurl', '.css': 'text' },
  banner: { js: `window.__ModuleLoader__.load({id:${JSON.stringify(pkg.name)},factory:(require)=>{var module={exports:{}};var exports=module.exports;` },
  footer: { js: 'return module.exports;}});' },
});
await build({
  entryPoints: ['preview/main.jsx'], outfile: 'preview/dist/main.js', bundle: true,
  format: 'esm', target: 'es2022', minify: true,
  loader: { '.png': 'dataurl', '.css': 'text' },
  define: { 'process.env.NODE_ENV': '"production"' },
});
await writeFile('preview/dist/build.json', JSON.stringify({ name: pkg.name, version: pkg.version }));
console.log('已构建 DSH 客户端包与独立预览。');
