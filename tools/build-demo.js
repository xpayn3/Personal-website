/* ===================================================================
   tools/build-demo.js — copies the app's front end into apps/meshoptimiser/demo/
   so the site can offer "Try the demo": the real app, running in the
   browser from static files, with no server.

     node tools/build-demo.js [path to the app folder]

   The app folder defaults to C:/Users/Luka/Documents/MeshOptimiser/app-merged
   (or the MESHOPT_APP environment variable). What is copied: index.html
   and the scripts it loads, vendor/ and assets/. What is not: the server,
   the converter, the tests, the docs and any *.bak-* file. inbox/ is kept as
   it is (it holds the sample model, GearboxAssy.glb from Khronos's
   glTF-Sample-Models, credited on the site).

   index.html is patched in two places: demo-shim.js (from tools/demo/) is
   the first script, and the install manifest is dropped. The page also gets
   noindex. Re-run after changing the app, then commit the result.
   =================================================================== */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.resolve(process.argv[2] || process.env.MESHOPT_APP || 'C:/Users/Luka/Documents/MeshOptimiser/app-merged');
const OUT = path.join(ROOT, 'apps', 'meshoptimiser', 'demo');

if (!fs.existsSync(path.join(SRC, 'index.html'))) { console.error('No index.html in ' + SRC); process.exit(1); }

const copyDir = (from, to) => {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    if (/\.bak-/.test(entry.name)) continue;
    const a = path.join(from, entry.name), b = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(a, b); else fs.copyFileSync(a, b);
  }
};

// the scripts at the top level that the page (or a worker) loads
const html = fs.readFileSync(path.join(SRC, 'index.html'), 'utf8');
const scripts = fs.readdirSync(SRC).filter(f => /\.js$/.test(f) && !/\.bak-/.test(f));
fs.mkdirSync(OUT, { recursive: true });
for (const f of scripts) fs.copyFileSync(path.join(SRC, f), path.join(OUT, f));
for (const dir of ['vendor', 'assets']) {
  fs.rmSync(path.join(OUT, dir), { recursive: true, force: true });
  copyDir(path.join(SRC, dir), path.join(OUT, dir));
}
fs.copyFileSync(path.join(__dirname, 'demo', 'demo-shim.js'), path.join(OUT, 'demo-shim.js'));

let patched = html.replace('<meta charset="UTF-8">', '<meta charset="UTF-8">\n<meta name="robots" content="noindex">\n<script src="demo-shim.js"></script>');
if (patched === html) throw new Error('index.html: the charset line was not found');
const noManifest = patched.replace(/<link rel="manifest"[^>]*>\n?/, '');
if (noManifest === patched) throw new Error('index.html: the manifest line was not found');
patched = noManifest.replace('<title>MeshOptimiser</title>', '<title>MeshOptimiser demo</title>');
fs.writeFileSync(path.join(OUT, 'index.html'), patched);

const size = (dir) => fs.readdirSync(dir, { withFileTypes: true }).reduce((n, e) => n + (e.isDirectory() ? size(path.join(dir, e.name)) : fs.statSync(path.join(dir, e.name)).size), 0);
console.log('Wrote the demo to apps/meshoptimiser/demo/ (' + (size(OUT) / 1048576).toFixed(1) + ' MB, ' + scripts.length + ' scripts)');
