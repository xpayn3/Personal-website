/* ===================================================================
   tools/build-admin.js — scans the site and writes admin-data.js,
   which admin.html displays. Commit both after running it. admin.html is
   published but noindex; it also opens straight from disk.

     node tools/build-admin.js

   Run it before you push (it only reads files; nothing is changed
   except admin-data.js). Counts only what is deployed: git-ignored
   folders and file types are skipped.

   Optional: put traffic numbers in admin-traffic.json
   ({ "updated": "2026-10-07", "visitors30d": 0, "pageviews30d": 0,
      "top": [{ "path": "/", "views": 0 }] }) and they are merged in.
   =================================================================== */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SKIP_DIRS = new Set(['.git', '.claude', 'node_modules', 'gameboy_backup', 'home_cover_backup']);
const SKIP_EXT = new Set(['.mp4', '.gif', '.m4v']);
const IMG_EXT = new Set(['.webp', '.png', '.jpg', '.jpeg', '.svg', '.ico']);
const VID_EXT = new Set(['.webm']);
const CODE_EXT = new Set(['.html', '.css', '.js', '.json', '.xml', '.txt', '.md']);
const BIG = 1.5 * 1024 * 1024;

const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    const rel = path.relative(ROOT, full).split(path.sep).join('/');
    if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name)) walk(full); continue; }
    if (SKIP_EXT.has(path.extname(e.name).toLowerCase())) continue;
    if (rel === 'admin-data.js' || rel === 'admin.html') continue;
    files.push({ rel, bytes: fs.statSync(full).size, ext: path.extname(e.name).toLowerCase() });
  }
})(ROOT);

const kindOf = f => IMG_EXT.has(f.ext) ? 'images' : VID_EXT.has(f.ext) ? 'video'
  : CODE_EXT.has(f.ext) ? 'code' : f.ext === '.pdf' ? 'documents' : f.ext === '.woff2' ? 'fonts' : 'other';

// ---- storage ---------------------------------------------------------
const byKind = {};
for (const f of files) {
  const k = kindOf(f);
  (byKind[k] = byKind[k] || { count: 0, bytes: 0 });
  byKind[k].count++; byKind[k].bytes += f.bytes;
}
const total = files.reduce((s, f) => s + f.bytes, 0);

// ---- pages -----------------------------------------------------------
const read = rel => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const sitemap = fs.existsSync(path.join(ROOT, 'sitemap.xml')) ? read('sitemap.xml') : '';
const pages = files.filter(f => f.ext === '.html' && f.rel !== 'admin.html').map(f => {
  const html = read(f.rel);
  const title = (html.match(/<title>([^<]*)<\/title>/i) || [])[1] || '';
  const desc = /<meta[^>]+name=["']description["'][^>]+content=["'][^"']+/i.test(html);
  const section = f.rel.includes('/') ? f.rel.split('/')[0] : 'main';
  // a folder's index.html is listed by the folder's address
  const url = f.rel === 'index.html' ? '' : f.rel.replace(/\/index\.html$/, '/');
  // a page that only forwards to another (noindex) needs neither a description nor a sitemap entry
  const forwards = /<meta[^>]+name=["']robots["'][^>]+noindex/i.test(html) && /http-equiv=["']refresh["']/i.test(html);
  return { path: f.rel, section, title: title.trim(), hasDescription: desc, forwards,
    inSitemap: sitemap.includes('<loc>https://lukagrcar.com/' + url + '</loc>') || sitemap.includes('<loc>https://lukagrcar.com/' + url.replace(/.html$/, '') + '</loc>') || (f.rel === 'index.html' && /lukagrcar\.com\/?<\/loc>/.test(sitemap)),
    bytes: f.bytes };
}).sort((a, b) => a.path.localeCompare(b.path));
const sections = {};
for (const p of pages) sections[p.section] = (sections[p.section] || 0) + 1;

// ---- media per folder ------------------------------------------------
const folders = {};
for (const f of files) {
  const k = kindOf(f);
  if (k !== 'images' && k !== 'video') continue;
  const parts = f.rel.split('/');
  const name = parts[0] === 'Images' ? (parts[1] === 'mobile' ? 'mobile/' + (parts[2] || '') : parts[1]) : '(root)';
  if (parts[0] === 'Images' && parts.length === 2) continue;
  const d = (folders[name] = folders[name] || { images: 0, video: 0, bytes: 0 });
  d[k]++; d.bytes += f.bytes;
}
const folderList = Object.entries(folders).map(([name, d]) => ({ name, ...d }))
  .sort((a, b) => b.bytes - a.bytes);

// ---- health ----------------------------------------------------------
global.window = {};
require(path.join(ROOT, 'projects.js'));
const projects = global.window.projects || {};
const exists = rel => fs.existsSync(path.join(ROOT, rel));
const missing = [];
for (const p of Object.values(projects)) for (const s of p.images || []) {
  const t = s.replace(/\.(webm|mp4)$/, '_thumb.webp');
  const clip = /\.(webm|mp4)$/.test(s);
  for (const f of clip ? [s, t] : [s]) if (!exists(f)) missing.push(f);
}

// Orphans: images no source file mentions (by file name).
const source = files.filter(f => ['.html', '.css', '.js', '.json'].includes(f.ext))
  .map(f => read(f.rel)).join('\n');
const orphans = files.filter(f => kindOf(f) === 'images' && f.rel.startsWith('Images/')
  && !f.rel.startsWith('Images/mobile/') && !f.rel.endsWith('_thumb.webp'))
  .filter(f => !source.includes(path.basename(f.rel)))
  .map(f => ({ path: f.rel, bytes: f.bytes }));

const noMobile = files.filter(f => f.ext === '.webp' && f.rel.startsWith('Images/')
  && !f.rel.startsWith('Images/mobile/') && !f.rel.endsWith('_thumb.webp')
  && f.rel.split('/').length >= 3 && !exists(f.rel.replace('Images/', 'Images/mobile/')))
  .map(f => f.rel);

const large = files.filter(f => f.bytes > BIG && ['images', 'video'].includes(kindOf(f)))
  .sort((a, b) => b.bytes - a.bytes).map(f => ({ path: f.rel, bytes: f.bytes }));

const health = {
  missingAssets: missing,
  orphanedImages: orphans,
  largeFiles: large,
  pagesWithoutDescription: pages.filter(p => !p.hasDescription && !p.forwards).map(p => p.path),
  pagesNotInSitemap: pages.filter(p => !p.inSitemap && !p.forwards).map(p => p.path),
  imagesWithoutMobileCopy: noMobile,
};

const traffic = exists('admin-traffic.json') ? JSON.parse(read('admin-traffic.json')) : null;

// Every deployed file for the Files view; thumb = a small preview to show.
const thumbOf = f => {
  const k = kindOf(f);
  if (k === 'video') { const t = f.rel.replace(/.webm$/, '_thumb.webp'); return exists(t) ? t : null; }
  if (k !== 'images' || f.ext === '.ico') return k === 'images' ? f.rel : null;
  const m = f.rel.replace('Images/', 'Images/mobile/');
  return f.rel.startsWith('Images/') && !f.rel.startsWith('Images/mobile/') && exists(m) ? m : f.rel;
};
const fileList = files.filter(f => !f.rel.startsWith('Images/mobile/') && !f.rel.endsWith('_thumb.webp'))
  .map(f => ({ path: f.rel, bytes: f.bytes, kind: kindOf(f), thumb: thumbOf(f) }))
  .sort((a, b) => b.bytes - a.bytes);

const out = {
  files: fileList,
  generated: new Date().toISOString(),
  pages: { total: pages.length, sections, list: pages },
  projects: Object.keys(projects).length,
  media: {
    images: byKind.images || { count: 0, bytes: 0 },
    video: byKind.video || { count: 0, bytes: 0 },
    folders: folderList,
    largest: files.filter(f => ['images', 'video'].includes(kindOf(f)))
      .sort((a, b) => b.bytes - a.bytes).slice(0, 12).map(f => ({ path: f.rel, bytes: f.bytes })),
  },
  storage: { total, byKind, limitBytes: 1024 ** 3 }, // GitHub Pages soft limit: 1 GB
  health,
  traffic,
};

fs.writeFileSync(path.join(ROOT, 'admin-data.js'), 'window.ADMIN_DATA = ' + JSON.stringify(out) + ';\n');
const mb = n => (n / 1048576).toFixed(1) + ' MB';
console.log(`pages ${pages.length} · projects ${out.projects} · images ${out.media.images.count} · video ${out.media.video.count} · ${mb(total)}`);
console.log(`health: missing ${missing.length}, orphans ${orphans.length}, large ${large.length}, no-desc ${health.pagesWithoutDescription.length}, not-in-sitemap ${health.pagesNotInSitemap.length}, no-mobile ${noMobile.length}`);
