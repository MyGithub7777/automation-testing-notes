// Prepare the plain static website for a GitHub Pages project URL.
// Uses Node.js built-ins only; local development still requires no build.
import { readFile, writeFile, mkdir, readdir, cp } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'docs');
const base = '/automation-testing-notes/';

async function exportFile(relative) {
  const input = path.join(root, relative);
  const output = path.join(out, relative);
  await mkdir(path.dirname(output), { recursive: true });
  if (relative.endsWith('.html')) {
    let html = await readFile(input, 'utf8');
    html = html.replace(/\b(href|src)="\/(?!\/)/g, '$1="' + base);
    await writeFile(output, html);
  } else if (relative.endsWith('.css')) {
    let css = await readFile(input, 'utf8');
    css = css.replace(/url\((['"]?)\/(?!\/)/g, 'url($1' + base);
    await writeFile(output, css);
  } else await cp(input, output);
}
async function exportDirectory(relative) {
  for (const entry of await readdir(path.join(root, relative), { withFileTypes: true })) {
    const child = path.join(relative, entry.name);
    if (entry.isDirectory()) await exportDirectory(child);
    else if (entry.isFile()) await exportFile(child);
  }
}
await mkdir(out, { recursive: true });
for (const file of ['index.html', '404.html', 'favicon.svg']) await exportFile(file);
for (const directory of ['assets', 'bdd-framework', 'images']) await exportDirectory(directory);
await writeFile(path.join(out, '.nojekyll'), '');
console.log('Prepared docs/ for https://mygithub7777.github.io/automation-testing-notes/');
