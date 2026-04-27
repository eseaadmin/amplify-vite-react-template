import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const DIST = resolve(process.cwd(), 'dist');

const pages = [
  'about',
  'blog',
  'briefing',
  'contact',
  'membership',
  'partnership',
  'transparency',
  'youtube',
];

for (const page of pages) {
  const src = resolve(DIST, `${page}.html`);
  if (!existsSync(src)) continue;

  const dir = resolve(DIST, page);
  mkdirSync(dir, { recursive: true });
  copyFileSync(src, resolve(dir, 'index.html'));
}
