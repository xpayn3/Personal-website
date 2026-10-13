/* ===================================================================
   tools/build-app-site.js — writes an app's own site.

     node tools/build-app-site.js

   An app in apps.js that has a `site` gets a small site of its own in
   site.path instead of one page drawn by app-page.js: a home page and
   pages for features, screenshots, docs, download and the changelog,
   with their own header, footer, look (site.css) and script (site.js).
   The words and pictures all come from the app's entry in apps.js, so
   run this after editing it and commit the result. tools/build-pages.js
   runs it too, and lists the pages in the sitemap.

   The docs are a knowledge base: <site.path>docs-content.js holds its
   groups and articles (the block types are listed at docBlock below);
   docs.html lists them and each article is a page in <site.path>docs/.

   The old one-page address (apps/<id>.html) is rewritten as a page that
   forwards to the site, so links to it keep working.
   =================================================================== */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const ORIGIN = 'https://lukagrcar.com/';
// bump when site.css / site.js change, then re-run
// the features page shows these categories, up to six features each with an icon; the accordion lists every feature by name
const SHOWCASE = [
  { title: 'Open and convert', note: 'Import', names: ['Reads the whole assembly', 'Finds repeats', 'Rebuilds the surfaces', 'You set the tessellation', 'Smooth from the CAD surfaces', 'Compresses'] },
  { title: 'Clean up and optimise', note: 'Make it light', names: ['Smart optimise', 'Fasteners', 'Select hidden parts', 'Remove hidden faces', 'Quick remesh (B)', 'Fit to budget'] },
  { title: 'Repair and tidy', note: 'Make it right', names: ['Remove holes', 'Remove floating pieces', 'Repair mesh', 'Split', 'Stacked copies', 'Align to floor'] },
  { title: 'Edit mesh', note: 'Go inside', names: ['Points, edges, polygons', 'Click, Box, Brush', 'Move what you picked', 'Dissolve', 'Weld and Fill', 'Planarize and Straighten'] },
  { title: 'Find and organise', note: 'Big assemblies', names: ['Built for big assemblies', 'Search and filters', 'Search (Shift + C)', 'Batch rename (F2)', 'Select by rule', 'Typo-proof part search'] },
  { title: 'Build and arrange', note: 'Make new parts', names: ['A Draw tool (L)', 'Align parts', 'Sweep', 'A library of 112 parts', 'Exploded view', 'Dynamic place (D)'] },
  { title: 'Export and deliver', note: 'Send it on', names: ['GLB and glTF', 'FBX, USDZ, OBJ, STL, PLY', 'Check against where it’s going', 'Parts list', 'Lighter, or just faster to draw'] },
  { title: 'Work with Claude', note: 'Ask for it', names: ['Just ask', 'You decide', 'Try it first', 'One request, a whole job', 'A whole folder', 'Pictures for a client'] },
];
const CSS_V = 269;
const RP_V = 2;           // report.js
const JS_V = 44;

// The pages of an app's site, in the order of its navigation. `file` is
// written into site.path; `nav` is false for a page the header leaves out.
const PAGES = [
  { key: 'home', file: 'index.html', label: 'Overview', nav: false },
  { key: 'features', file: 'features.html', label: 'Features' },
  { key: 'claude', file: 'claude.html', label: 'Claude', soon: true },
  { key: 'docs', file: 'docs.html', label: 'Docs' },
  { key: 'changelog', file: 'changelog.html', label: 'Changelog' },
  { key: 'download', file: 'download.html', label: 'Download', nav: false },
  { key: 'report', file: 'report.html', label: 'Report a problem', nav: false },
];

const GH_ICON = '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"/></svg>';
const LITE_BTN = '<a class="btn is-large btn-lite" href="lite/index.html" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 4.5v15l12-7.5Z"/></svg>Open Lite</a>';
const esc = text => String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const clamp = (text, max) => (text.length > max ? text.slice(0, max - 1).trim() + '…' : text);
const slug = text => String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const pad2 = n => String(n).padStart(2, '0');

function siteFor(app, docs) {
  const site = app.site;
  const depth = site.path.replace(/\/+$/, '').split('/').length;
  const up = '../'.repeat(depth);                       // from a page of the site to the repository root
  const asset = file => up + encodeURI(file);
  const absolute = file => ORIGIN + encodeURI(file);
  const home = ORIGIN + site.path;
  const version = (app.stats.find(([label]) => label === 'Version') || [])[1] || '';
  const platform = (app.stats.find(([label]) => label === 'Platform') || [])[1] || '';
  const licence = (app.info.find(([label]) => label === 'Licence') || [])[1] || '';
  const repo = app.repo.replace(/\/+$/, '');
  const zip = app.download || repo + '/archive/HEAD.zip';
  const latest = app.changelog.versions.find(v => v.latest) || app.changelog.versions[0];
  // the last three tagged releases, each as GitHub's zip of that tag
  const releases = app.changelog.versions.filter(v => !v.next).slice(0, 3);

  // the address of the docs article whose slug matches, or the docs home
  // the tool icons (Lucide, ISC): a small JSON next to the pages, drawn inline so they take the colour of their group
  const iconFile = path.join(ROOT, site.path, 'icons.json');
  const ICONS = fs.existsSync(iconFile) ? JSON.parse(fs.readFileSync(iconFile, 'utf8')) : { icons: {}, items: {} };
  const GROUP_COLOURS = ['#f5a524', '#0d99ff', '#2fd180', '#a78bfa', '#ff8a4c', '#2dd4bf', '#f472b6'];
  // A release may carry a name beside its number (`name` on a changelog version), as macOS releases do.
  const relName = (v) => (v && v.name ? `<b class="rel-code">${esc(v.name)}</b>` : '');
  const svgIcon = (name) => { const nodes = ICONS.icons[name]; if (!nodes) return ''; return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + nodes.map(([tag, attrs]) => '<' + tag + Object.entries(attrs).map(([k, v]) => ' ' + k + '="' + v + '"').join('') + '/>').join('') + '</svg>'; };

  const docLink = (re) => { const hit = docs && docs.articles.find(a => re.test(a.slug)); return hit ? `docs/${hit.slug}.html` : 'docs.html'; };

  // ---- pieces shared by the pages ----
  const head = (page, title, description) => {
    const url = home + (page.file === 'index.html' ? '' : page.file.replace(/\.html$/, ''));   // (docs/<slug>.html → docs/<slug>)
    const structured = page.key !== 'home' ? '' : `
  <script type="application/ld+json">
${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: app.title,
    description: site.lead,
    applicationCategory: 'DesignApplication',
    operatingSystem: platform.replace(/\s*·\s*/g, ', '),
    softwareVersion: version,
    url: home,
    image: absolute(app.cover),
    downloadUrl: zip,
    license: 'https://opensource.org/licenses/MIT',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    author: { '@type': 'Person', '@id': ORIGIN + '#person', name: 'Luka Grčar', url: ORIGIN },
  }, null, 2)}
  </script>`;
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <!-- Generated by tools/build-app-site.js from apps.js. Do not edit by hand. -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <meta name="theme-color" content="#131314" />
  <meta name="color-scheme" content="dark" />
  <meta name="robots" content="noai, noimageai" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(clamp(description, 160))}" />
  <link rel="icon" type="image/svg+xml" href="${asset(app.icon)}" />
  <link rel="canonical" href="${url}" />
  <meta property="og:site_name" content="${esc(app.title)}" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(clamp(description, 160))}" />
  <meta property="og:image" content="${absolute(app.cover)}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="site.css?v=${CSS_V}" />${(page.key === 'home' && site.pop) || (page.key === 'claude' && site.claude && site.claude.view) ? `
  <script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.172.0/build/three.module.min.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.172.0/examples/jsm/"}}</script>` : ''}
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-RXZ65KVMCQ"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-RXZ65KVMCQ');</script>${structured}
</head>`;
  };

  const header = (page) => `
<body class="page-${page.key}">
  <a class="skip" href="#main">Skip to content</a>
  <header class="bar" id="bar">
    <div class="bar-in">
      <a class="brand" href="./"${page.key === 'home' ? ' aria-current="page"' : ''}>
        <img src="${asset(app.icon)}" alt="" width="26" height="26" />
        <span>${esc(app.title)}</span>${app.stage ? `<i>${esc(app.stage)}</i>` : ''}
      </a>
      <nav class="nav" id="nav" aria-label="${esc(app.title)}">
${PAGES.filter(p => p.nav !== false).map(p => `        <a href="${p.file}"${p.key === page.key || p.key === page.under ? ' aria-current="page"' : ''}>${p.label}${p.soon && site.claude && (site.claude.badge || site.claude.tag) ? `<em class="${site.claude.badge ? 'nav-soon' : 'nav-new'}">${site.claude.badge ? 'Soon' : esc(site.claude.tag)}</em>` : ''}</a>`).join('\n')}
        <a class="nav-out" href="${repo}" rel="noopener">${GH_ICON}GitHub</a>
      </nav>
      <a class="btn is-primary bar-get" href="download.html"${page.key === 'download' ? ' aria-current="page"' : ''}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11"/><path d="m7 11 5 5 5-5"/><path d="M5 20h14"/></svg>Download</a>
      <button class="bar-menu" id="menu" type="button" aria-expanded="false" aria-controls="nav" aria-label="Menu"><span></span><span></span></button>
    </div>
  </header>
  <main id="main">`;

  // the last band of the site, white, in the manner of a model comparison: the online version beside the installed app
  const cmpIcon = (d) => `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const CMP = {
    window: '<rect x="4" y="6" width="24" height="20" rx="3"/><path d="M4 12h24"/><circle cx="8.5" cy="9" r=".6"/><circle cx="11.5" cy="9" r=".6"/>',
    lock: '<rect x="7" y="14" width="18" height="12" rx="3"/><path d="M11 14v-3a5 5 0 0 1 10 0v3"/>',
    cube: '<path d="M16 4l11 6v12l-11 6-11-6V10z"/><path d="M5 10l11 6 11-6M16 16v12"/>',
    step: '<path d="M8 4h11l6 6v18H8z"/><path d="M19 4v6h6"/><path d="M12 18h9M12 22h6"/>',
    free: '<circle cx="16" cy="16" r="11"/><path d="M11 16.5l3.5 3.5L21 12"/>',
    folder: '<path d="M4 9a2 2 0 0 1 2-2h6l3 3h11a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/>',
    spark: '<path d="M16 4v6M16 22v6M4 16h6M22 16h6M8 8l4 4M20 20l4 4M24 8l-4 4M12 20l-4 4"/>',
    update: '<path d="M26 16a10 10 0 1 1-3-7.1"/><path d="M26 5v6h-6"/>',
    pc: '<rect x="4" y="6" width="24" height="16" rx="2"/><path d="M12 27h8M16 22v5"/>',
  };
  const CHECK = '<svg class="cmp-yes" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="currentColor"/><path d="M7 12.4l3.4 3.4L17 8.6" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  // each row is one question, answered for both versions side by side: true is a tick, false a dash, a string its own words
  const cmpCell = (v, label) => v === true ? `<span class="cmp-on">${CHECK}<span>${label}</span></span>` : v === false ? `<span class="cmp-off"><span class="cmp-no" aria-hidden="true">—</span><span>${label}</span></span>` : `<span class="cmp-on">${CHECK}<span>${v}</span></span>`;
  const cmpRows = (rows) => rows.map(([, label, a, b]) => `
          <div class="cmp-row" role="row">
            <div class="cmp-a">${cmpCell(a, label)}</div>
            <div class="cmp-a">${cmpCell(b, label)}</div>
          </div>`).join('');
  const getBand = `
    <section class="band get compare">
      <div class="wrap">
        <h2>Pick how you run it.</h2>
        <div class="cmp">
          <div class="cmp-head">
            <div class="cmp-col">
              <p class="cmp-tag">In your browser</p>
              <h3>${esc(app.title)} Lite</h3>
              <p class="cmp-sub">Try the app in a tab. Nothing to install.</p>
              <div class="cmp-act"><a class="cmp-btn btn-lite" href="lite/index.html" target="_blank" rel="noopener">Open Lite</a><a class="cmp-link" href="${docLink(/what-it-is/)}">What is it</a></div>
            </div>
            <div class="cmp-col">
              <p class="cmp-tag">On your machine</p>
              <h3>${esc(app.title)}</h3>
              <p class="cmp-sub">The full app. ${esc(platform.replace(/\s*·\s*/g, ' and '))}.</p>
              <div class="cmp-act"><a class="cmp-btn" href="download.html">Download ${version ? 'v' + esc(version) : ''}</a><a class="cmp-link" href="changelog.html">What is new</a></div>
            </div>
          </div>
          <div class="cmp-table" role="table">${cmpRows([
            ['pc', 'Price', 'Free', 'Free'],
            ['window', 'Where it runs', 'Browser tab', 'Your computer'],
            ['lock', 'Files stay local', true, true],
            ['step', 'STEP to GLB', false, true],
            ['cube', 'Clean-up tools', true, true],
            ['cube', 'Part library', true, true],
            ['folder', 'Folders and CLI', false, true],
            ['spark', 'Claude', false, true],
            ['pc', 'Works offline', false, true],
          ])}
          </div>
          <p class="cmp-note">Lite opens a sample gearbox first and needs a window 960 px wide.</p>
        </div>
      </div>
    </section>`;

  const footer = (page) => `${page.key === 'download' || page.key === 'report' ? '' : getBand}
  </main>
  <footer class="foot">
    <div class="wrap foot-in">
      <div class="foot-brand">
        <a class="brand" href="./"><img src="${asset(app.icon)}" alt="" width="26" height="26" /><span>${esc(app.title)}</span></a>
        <p>${esc(app.subtitle)}</p>
      </div>
      <nav aria-label="Product">
        <h2>Product</h2>
        <a href="./">Overview</a>
        <a href="features.html">Features</a>
${site.claude ? '        <a href="claude.html">Work with Claude</a>\n' : ''}        <a href="download.html">Download</a>
      </nav>
      <nav aria-label="Resources">
        <h2>Resources</h2>
        <a href="docs.html">Docs</a>
        <a href="${docLink(/shortcut/)}">Keyboard shortcuts</a>
        <a href="changelog.html">Changelog</a>
        <a href="${docLink(/troubleshoot/)}">Troubleshooting</a>
      </nav>
      <nav aria-label="Project">
        <h2>Project</h2>
        <a href="${repo}" rel="noopener">Source on GitHub</a>
        <a href="report.html">Report a problem</a>
        <a href="${repo}/issues" rel="noopener">Issues on GitHub</a>
        <a href="${repo}/blob/main/LICENSE" rel="noopener">${esc(licence)} licence</a>
      </nav>
    </div>
    <div class="wrap foot-end">
      <span>Made by <a href="${up}index.html">Luka Grčar</a> · <a href="${up}lab.html">More from the Lab</a></span>
      <span><a href="${up}privacy.html">Privacy</a></span>
    </div>
  </footer>
  <script defer src="site.js?v=${JS_V}"></script>
</body>
</html>
`;


  const pageHead = (kicker, title, lead) => `
    <section class="wrap page-head">
      <p class="kicker">${esc(kicker)}</p>
      <h1>${esc(title)}</h1>
      ${lead ? `<p class="lead">${esc(lead)}</p>` : ''}
    </section>`;

  // a picture that opens in the lightbox; `group` ties the pictures of one set together
  const shot = ([src, caption], group, eager) =>
    `<figure><a class="zoom" href="${asset(src)}" data-group="${group}" data-caption="${esc(caption)}"><img src="${asset(src)}" alt="${esc(app.title + ': ' + caption)}" width="2400" height="1350"${eager ? '' : ' loading="lazy"'} decoding="async" /></a><figcaption>${esc(caption)}</figcaption></figure>`;

  const clipColours = ['#35c9c0', '#fb923c', '#a78bfa', '#f472b6', '#fbbf24'];
  const clipCards = () => (app.clips || []).map(([name, line, src, doc], i) => `
        <figure class="clip" style="--tile-c:${clipColours[i % clipColours.length]}">
          ${tileArt[5 + i] ? tileArt[5 + i].replace('<svg ', `<svg role="img" aria-label="${esc(app.title + ': ' + name)}" `).replace(' aria-hidden="true"', '') : ''}
          <figcaption><i>${pad2(i + 1)}</i><strong>${esc(name)}</strong><span>${esc(line)}</span>${doc ? `<a class="clip-more" href="docs/${esc(doc)}.html">Read more<span aria-hidden="true"> →</span><span class="sr"> about ${esc(name)}</span></a>` : ''}</figcaption>
        </figure>`).join('');

  const spotRows = (list, group) => list.map(([name, line, image], i) => `
        <article class="spot${i % 2 ? ' is-flipped' : ''}">
          <a class="zoom" href="${asset(image)}" data-group="${group}" data-caption="${esc(name)}"><img src="${asset(image)}" alt="${esc(app.title + ': ' + name)}" width="2400" height="1350" loading="lazy" decoding="async" /></a>
          <div>
            <i>${pad2(i + 1)}</i>
            <h3>${esc(name)}</h3>
            <p>${esc(line)}</p>
          </div>
        </article>`).join('');

  const logEntry = (entry, open) => `
        <li id="v${esc(entry.version)}">
          <div class="log-head">
            <strong>v${esc(entry.version)}${relName(entry)}</strong>${entry.latest ? '<em>Latest</em>' : entry.next ? '<em>Next</em>' : ''}${entry.date ? `<span>${esc(entry.date)}</span>` : ''}${entry.fixes ? `<span>${entry.fixes} ${entry.fixes === 1 ? 'fix' : 'fixes'}</span>` : ''}
          </div>
          <div class="log-body">
            <p>${esc(entry.summary)}</p>${entry.items && entry.items.length && open ? `
            <ul>
${entry.items.map(([tag, line]) => `              <li><b class="is-${tag.toLowerCase()}">${esc(tag)}</b><span>${esc(line)}</span></li>`).join('\n')}
            </ul>` : ''}
          </div>
        </li>`;

  const commands = (rows) => `
        <dl class="commands">
${rows.map(([label, command]) => `          <div><dt>${esc(label)}</dt><dd><code>${esc(command)}</code><button type="button" class="copy" data-copy="${esc(command)}">Copy</button></dd></div>`).join('\n')}
        </dl>`;

  // The opening picture. With `site.pop` it is two layers that come apart as
  // the page scrolls (site.js sets --p, 0 to 1): the app without its model,
  // and the model on its own, cut out and placed exactly where it was, so at
  // rest it is the app as it is and a little further down the part steps out
  // of the window. `pop.box` = [left, top, width] of the cut-out, in % of the frame.
  const popHero = () => {
    const pop = site.pop;
    const cover = app.shots.find(([src]) => src === app.cover) || app.shots[0];
    if (!pop) return `    <section class="wrap hero-shot">
      ${shot(cover, 'hero', true)}
    </section>`;
    const [left, top, width] = pop.box;
    return `    <section class="pop" data-pop aria-label="${esc(pop.label)}">
      <div class="pop-pin">
        <div class="wrap pop-stage">
          <div class="pop-art">
            <a class="zoom pop-frame" href="${asset(cover[0])}" data-group="hero" data-caption="${esc(cover[1])}">
              <img class="pop-ui" src="${asset(pop.ui)}?v=${pop.v || 1}" alt="${esc(app.title + ': ' + cover[1])}" width="${pop.size[0]}" height="${pop.size[1]}" decoding="async" fetchpriority="high" />
            </a>
            <img class="pop-model" src="${asset(pop.model)}?v=${pop.v || 1}" alt="" width="${pop.modelSize[0]}" height="${pop.modelSize[1]}" decoding="async" style="left:${left}%;top:${top}%;width:${width}%" />
          </div>
          <ul class="pop-parts" aria-hidden="true">${(() => { const pl = pop.panels || [], top = Math.max(...pl.slice(1).map(x => x[1])), n = (v) => Number(v).toLocaleString('en-US'); return pl.map(([name, tris, verts, parts], i) => `<li${i === 0 ? ' class="is-count"' : ''} style="--k:${i}"><div class="pp-h"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 4 7.5v9L12 21l8-4.5v-9L12 3Z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/></svg><b>${esc(name)}</b></div><div class="pp-n"><strong>${n(tris)}</strong><small>tris</small></div><div class="pp-bar"><s style="--w:${i === 0 ? 100 : Math.max(4, Math.round(tris / top * 100))}%"></s></div><div class="pp-r"><span>${i === 0 ? 'Parts' : 'Vertices'}</span><em>${n(i === 0 ? parts : verts)}</em></div>${i === 0 ? `<div class="pp-r"><span>Vertices</span><em>${n(verts)}</em></div>` : ''}</li>`).join(''); })()}</ul>
          <div class="pop-copy" aria-hidden="false">
            <p class="kicker">${esc(pop.kicker)}</p>
            <h2>${esc(pop.title)}</h2>
            <p>${esc(pop.line)}</p>
          </div>
        </div>
      </div>
    </section>`;
  };

  // The search of the app, working on the page. The words and lists are in
  // `site.demo` (apps.js); site.js does the rest (filter, arrows, Enter, sums).
  const searchDemo = () => {
    const d = site.demo;
    if (!d) return '';
    return `
    <section class="band" id="try-search">
      <div class="wrap">
        <div class="band-head">
          <p class="kicker">${esc(d.kicker)}</p>
          <h2>${esc(d.title)}</h2>
        </div>
        <div class="demo-row">
          <div class="demo-copy">
            <p>${esc(d.line)}</p>
            <ul>
${d.tips.map(([key, line]) => `              <li><kbd>${esc(key)}</kbd><span>${esc(line)}</span></li>`).join('\n')}
            </ul>
          </div>
          <div class="demo" data-demo>
            <div class="demo-stage" aria-hidden="true"><i></i></div>
            <div class="pal" role="search">
              <label class="pal-in">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
                <input type="text" value="${esc(d.start)}" placeholder="${esc(d.placeholder)}" aria-label="${esc(d.placeholder)}" spellcheck="false" autocomplete="off" autocapitalize="off" role="combobox" aria-expanded="true" aria-controls="palList" />
              </label>
              <ul class="pal-list" id="palList" role="listbox"></ul>
              <div class="pal-foot"><span><kbd>↑</kbd><kbd>↓</kbd> choose</span><span><kbd>↵</kbd> run</span><span><kbd>Esc</kbd> clear</span><em>${esc(d.hint)}</em></div>
            </div>
            <p class="demo-out" aria-live="polite"></p>
            <script type="application/json" data-demo-data>${JSON.stringify({ parts: d.parts, library: d.library, commands: d.commands })}</script>
          </div>
        </div>
      </div>
    </section>`;
  };

  // The Quick wand of the app, working on the page: a ring that opens round the
  // pointer on three parts. The words and parts are in `site.wand` (apps.js);
  // site.js draws the ring and does what each slice says.
  const wandDemo = () => {
    const d = site.wand;
    if (!d) return '';
    const shapes = ['plate', 'pulley', 'bolt'];
    return `
    <section class="band wand-band" id="try-wand">
      <div class="wrap">
        <div class="band-head">
          <p class="kicker">${esc(d.kicker)}</p>
          <h2>${esc(d.title)}</h2>
        </div>
        <p class="lead wand-lead">${esc(d.line)}</p>
        <div class="wand-demo" data-wand>
          <div class="wand-stage" data-wand-stage role="group" aria-label="The Quick wand ring, open in the middle. Point at a slice and click a command."></div>
          <p class="wand-out" aria-live="polite" data-wand-out></p>
          <div class="wand-modes" role="group" aria-label="What the ring works on">
            <button type="button" data-wand-mode="none" aria-pressed="true">Nothing selected</button>
            <button type="button" data-wand-mode="part" aria-pressed="false">A part selected</button>
            <button type="button" class="wand-reset" data-wand-reset>Start over</button>
          </div>
          <script type="application/json" data-wand-data>${JSON.stringify({ parts: d.parts, icons: ICONS.wand || {} })}</script>
        </div>
        <ul class="wand-tips">
${d.tips.map(([key, line]) => `          <li><kbd>${esc(key)}</kbd><span>${esc(line)}</span></li>`).join('\n')}
        </ul>
      </div>
    </section>`;
  };

  // The library, working on the page: shelves of the app's own part pictures,
  // dragged (or double-clicked) into a scene. site.js does the dragging.
  const libraryBand = () => {
    const l = site.library;
    if (!l) return '';
    // two rows of ten, a few from every shelf, so the strip shows the range without the whole catalogue
    const pick = [];
    for (let i = 0; pick.length < 20 && i < 20; i++) l.shelves.forEach(([, items]) => { if (items[i] && pick.length < 20) pick.push(items[i]); });
    return `
    <section class="band" id="library">
      <div class="wrap">
        <div class="band-head">
          <p class="kicker">${esc(l.kicker)}</p>
          <h2>${esc(l.title)}</h2>
        </div>
        <p class="lead lib-lead">${esc(l.line)}</p>
        <div class="lib-show">
          <ul class="lib-tiles">
${pick.map(([key, label]) => `            <li><img src="library/${esc(key)}.webp" alt="" width="192" height="192" loading="lazy" decoding="async" /><span>${esc(label)}</span></li>`).join('\n')}
          </ul>
        </div>
      </div>
    </section>`;
  };

  // The design band: close-ups of the controls, the app's layout drawn as a
  // plan, and the numbers it is built from. `site.design` holds the words.
  // What the optimiser saves, drawn as bars from numbers measured in the app (site.savings in apps.js)
// Compression: the same models as a plain GLB, with Meshopt and with Draco (site.compression, bytes)
  const compressionBand = () => {
    const c = site.compression;
    if (!c) return '';
    const mb = (b) => (b / 1e6).toFixed(2) + ' MB';
    const left = (a, b) => Math.round((b / a) * 100);
    const [first] = c.models;
    const rows = c.models.map(([name, plain, mo, dr]) => `
          <div class="sv-row">
            <div class="sv-label"><span>${esc(name)}</span><em>−${100 - left(plain, mo)}% · −${100 - left(plain, dr)}%</em></div>
            <div class="sv-bar is-before"><i style="--w:100%"></i><b>Plain GLB ${mb(plain)}</b></div>
            <div class="sv-bar is-after"><i style="--w:${(mo / plain * 100).toFixed(1)}%"></i><b>Meshopt ${mb(mo)}</b></div>
            <div class="sv-bar is-draco"><i style="--w:${(dr / plain * 100).toFixed(1)}%"></i><b>Draco ${mb(dr)}</b></div>
          </div>`).join('');
    const cols = [['Plain GLB', first[1], 'is-original'], ['Meshopt', first[2], ''], ['Draco', first[3], 'is-draco']].map(([n, v, cls], i) => `
            <div class="sv-col ${cls}" style="--h:${(v / first[1] * 100).toFixed(1)}%;--i:${i}">
              <b>${mb(v)}</b><i>${i ? '<em>−' + (100 - left(first[1], v)) + '%</em>' : ''}</i><span>${esc(n)}</span>
            </div>`).join('');
    return `
    <section class="band savings" id="compression">
      <div class="wrap">
        <div class="band-head">
          <p class="kicker">${esc(c.kicker)}</p>
          <h2>${esc(c.title)}</h2>
        </div>
        <p class="lead sv-lead">${esc(c.line)}</p>
        <div class="sv" data-reveal>
          <div class="sv-big">
            <p class="sv-sub">${esc(first[0])}, Meshopt</p>
            <b>−${100 - left(first[1], first[2])}<small>%</small></b>
            <span>file size</span>
            <em>${mb(first[1])} → ${mb(first[2])}</em>
          </div>
          <div class="sv-rows">
            <p class="sv-sub">Three sample models</p>${rows}
          </div>
          <div class="sv-levels" role="img" aria-label="File size of the ${esc(first[0])} as a plain GLB, with Meshopt and with Draco">
            <p class="sv-sub">${esc(first[0])}, file size</p>
            <div class="sv-cols" style="--n:3">${cols}
            </div>
          </div>
        </div>
        <dl class="cp-points">
${c.points.map(([t, d]) => `          <div><dt>${esc(t)}</dt><dd>${esc(d)}</dd></div>`).join('\n')}
        </dl>
        <p class="sv-note">${esc(c.note)}</p>
      </div>
    </section>`;
  };

  // a drawing for each star, from the same set as the cards on the home page: Remove holes, Select hidden parts, Fasteners, Smart fit, Split, Smart optimise
  const starArt = (i, name) => {
    const at = [5, 7, 8, 9, 6, 10, 11, 12, 13, 14, 15, 16][i], art = tileArt[at];
    if (!art) return '';
    return art.replace('<svg ', `<svg role="img" aria-label="${esc(app.title + ': ' + name)}" style="--tile-c:${['#35c9c0', '#a78bfa', '#f472b6', '#fbbf24', '#fb923c', '#0d99ff', '#2fd180', '#a78bfa', '#fbbf24', '#f472b6', '#35c9c0', '#fb923c'][i]}" `).replace(' aria-hidden="true"', '');
  };

  // The clean-up tools, as the stars of the page (site.cleanup)
  const cleanupBand = () => {
    const c = site.cleanup;
    if (!c) return '';
    const media = (src, name) => /\.(webm|mp4)$/.test(src)
      ? `<video muted loop playsinline preload="none" disablepictureinpicture poster="${asset(src.replace(/\.(webm|mp4)$/, '_thumb.webp'))}" data-src="${asset(src)}" aria-label="${esc(app.title + ': ' + name)}" width="592" height="370"></video>`
      : `<img src="${asset(src)}" alt="${esc(app.title + ': ' + name)}" width="2400" height="1350" loading="lazy" decoding="async" />`;
    const link = (doc, name) => doc ? `<a class="clip-more" href="docs/${esc(doc)}.html">Read more<span aria-hidden="true"> →</span><span class="sr"> about ${esc(name)}</span></a>` : '';
    return `
    <section class="band" id="clean-up-tools">
      <div class="wrap">
        <div class="band-head">
          <p class="kicker">${esc(c.kicker)}</p>
          <h2>${esc(c.title)}</h2>
        </div>
        <p class="lead sv-lead">${esc(c.line)}</p>
        <div class="fcar fcar-stars" data-fcar>
        <div class="stars fcar-track">${c.stars.concat(c.more.map(([n, l, d]) => [n, l, '', d])).map(([name, line, src, doc], i) => `
          <figure class="star">
            ${starArt(i, name)}
            <figcaption><i>${pad2(i + 1)}</i><strong>${esc(name)}</strong><span>${esc(line)}</span>${link(doc, name)}</figcaption>
          </figure>`).join('')}
        </div>
        <div class="fcar-nav"><button type="button" data-dir="-1" aria-label="Previous"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button><button type="button" data-dir="1" aria-label="Next"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button></div>
        </div>
      </div>
    </section>`;
  };

  const savingsBand = () => {
    const s = site.savings;
    if (!s) return '';
    const fmtN = (n) => (n >= 100 ? Math.round(n).toLocaleString('en-US') : String(Math.round(n * 10) / 10));
    const pct = (a, b) => Math.round((1 - b / a) * 100);
    const [t0, t1] = [s.metrics[0][1], s.metrics[0][2]];
    const rows = s.metrics.map(([name, a, b, unit]) => `
          <div class="sv-row">
            <div class="sv-label"><span>${esc(name)}</span><em>−${pct(a, b)}%</em></div>
            <div class="sv-bar is-before"><i style="--w:100%"></i><b>${fmtN(a)}${unit ? ' ' + esc(unit) : ''}</b></div>
            <div class="sv-bar is-after"><i style="--w:${(b / a * 100).toFixed(1)}%"></i><b>${fmtN(b)}${unit ? ' ' + esc(unit) : ''}</b></div>
          </div>`).join('');
    const top = Math.max(t0, ...s.levels.map(l => l[1]));
    const cols = [['Original', t0, 'is-original']].concat(s.levels.map(([n, v]) => [n, v, ''])).map(([n, v, cls], i) => `
            <div class="sv-col ${cls}" style="--h:${(v / top * 100).toFixed(1)}%;--i:${i}">
              <b>${fmtN(v)}</b><i>${cls ? '' : '<em>−' + pct(t0, v) + '%</em>'}</i><span>${esc(n)}</span>
            </div>`).join('');
    return `
    <section class="band savings" id="savings">
      <div class="wrap">
        <div class="band-head">
          <p class="kicker">${esc(s.kicker)}</p>
          <h2>${esc(s.title)}</h2>
        </div>
        <p class="lead sv-lead">${esc(s.line)}</p>
        <div class="sv" data-reveal>
          <div class="sv-big">
            <p class="sv-sub">Result</p>
            <b>−${pct(t0, t1)}<small>%</small></b>
            <span>triangles</span>
            <em>${fmtN(t0)} → ${fmtN(t1)}</em>
          </div>
          <div class="sv-rows">
            <p class="sv-sub">Before and after</p>${rows}
          </div>
          <div class="sv-levels" role="img" aria-label="Triangles left after Smart optimise at each level">
            <p class="sv-sub">Triangles left, by level</p>
            <div class="sv-cols" style="--n:${s.levels.length + 1}">${cols}
            </div>
          </div>
        </div>
        <p class="sv-note">${esc(s.note)}</p>
      </div>
    </section>`;
  };

  // Claude: the strip on the home page and the page of its own (claude.html). All words are `site.claude` in apps.js.
  // Coming soon (amber) while `badge` is set; once it ships, `tag` ('New') shows in the accent colour; neither: nothing
  const SOON = (c, large) => (c.badge || c.tag) ? `<b>·</b><span class="${c.badge ? 'tag-soon' : 'tag-new'}${large ? ' is-large' : ''}">${esc(c.badge || c.tag)}</span>` : '';
  const claudeBand = () => {
    const c = site.claude;
    if (!c) return '';
    const [src, caption] = c.control.shots[0];
    return `
    <section class="band cl-band" id="claude">
      <div class="cl-hero">
        <div class="wrap cl-hero-in">
          <p class="kicker">${esc(c.band.kicker)}${SOON(c, true)}</p>
          <h2>${esc(c.band.title)}</h2>
          <div class="cl-hero-side">
            <p class="lead">${esc(c.band.line)}</p>
            <div class="actions"><a class="btn is-large" href="claude.html">See how it works</a></div>
          </div>
        </div>
        <div class="cl-shot">
          <video muted loop playsinline preload="none" disablepictureinpicture poster="${asset('Images/apps/meshoptimiser-claude-clip_thumb.webp')}" data-src="${asset('Images/apps/meshoptimiser-claude-clip.webm')}" aria-label="${esc(app.title + ': turning Claude on in Settings, then the Claude pill in the top bar')}" width="1600" height="940"></video>
          <ul class="cl-say">
${c.band.prompts.map(p => `            <li>${esc(p)}</li>`).join('\n')}
          </ul>
        </div>
      </div>
    </section>`;
  };

  const claudeBadge = () => {
    const b = site.claude.control.badge, [src, caption, w, h] = b.shot;
    return `
        <div class="cl-badge">
          <figure><a class="zoom" href="${asset(src)}" data-group="claude" data-caption="${esc(caption)}"><img src="${asset(src)}" alt="${esc(app.title + ': ' + caption)}" width="${w}" height="${h}" loading="lazy" decoding="async" /></a><figcaption>${esc(caption)}</figcaption></figure>
          <div>
            <p class="kicker">${esc(b.kicker)}</p>
            <h3>${esc(b.title)}</h3>
            <p class="lead">${esc(b.line)}</p>
            <dl class="cl-points is-one">
${b.points.map(([name, line]) => `              <div><dt>${esc(name)}</dt><dd>${esc(line)}</dd></div>`).join('\n')}
            </dl>
          </div>
        </div>`;
  };

  const claudeRenders = () => {
    const r = site.claude.renders;
    return `
    <section class="band" id="renders">
      <div class="wrap">
        <div class="band-head">
          <p class="kicker">${esc(r.kicker)}</p>
          <h2>${esc(r.title)}</h2>
        </div>
        <p class="lead">${esc(r.line)}</p>
        <div class="cl-shots cl-renders">
          ${r.shots.map(s => shot(s, 'renders')).join('\n          ')}
        </div>
        <dl class="cl-points cl-points-3">
${r.points.map(([name, line]) => `          <div><dt>${esc(name)}</dt><dd>${esc(line)}</dd></div>`).join('\n')}
        </dl>
      </div>
    </section>`;
  };

  const claudeJobs = () => {
    const r = site.claude.jobs;
    return `
    <section class="band" id="jobs">
      <div class="wrap">
        <div class="band-head">
          <p class="kicker">${esc(r.kicker)}</p>
          <h2>${esc(r.title)}</h2>
        </div>
        <p class="lead">${esc(r.line)}</p>
        <div class="cl-shots cl-renders">
          ${r.shots.map(s => shot(s, 'jobs')).join('\n          ')}
        </div>
        <dl class="cl-points cl-points-3">
${r.points.map(([name, line]) => `          <div><dt>${esc(name)}</dt><dd>${esc(line)}</dd></div>`).join('\n')}
        </dl>
      </div>
    </section>`;
  };

  const claudeKnows = () => {
    const k = site.claude.knows;
    return `
    <section class="band" id="knows">
      <div class="wrap">
        <div class="band-head">
          <p class="kicker">${esc(k.kicker)}</p>
          <h2>${esc(k.title)}</h2>
        </div>
        <p class="lead">${esc(k.line)}</p>
        <div class="kn-grid">
          <article class="kn-card">
            <h3>Six playbooks</h3>
            <ol class="kn-list">
${k.playbooks.map(([name, line]) => `              <li><strong>${esc(name)}</strong><span>${esc(line)}</span></li>`).join('\n')}
            </ol>
          </article>
          <article class="kn-card">
            <h3>The help articles</h3>
${k.articles.map(t => `            <p>${esc(t)}</p>`).join('\n')}
            <h3 class="kn-sub">Ready-made jobs</h3>
            <ul class="kn-jobs">
${k.jobs.map(([name, line]) => `              <li><strong>${esc(name)}</strong><span>${esc(line)}</span></li>`).join('\n')}
            </ul>
          </article>
        </div>
        <dl class="kn-figures">
${k.figures.map(([figure, label]) => `          <div><dt>${esc(figure)}</dt><dd>${esc(label)}</dd></div>`).join('\n')}
        </dl>
        <p class="cl-fine">${esc(k.note)}</p>
      </div>
    </section>`;
  };

  const claudeChat = () => {
    const c = site.claude;
    const SPARK = '<svg class="cx-spark" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 1.5c.7 0 1.2.5 1.3 1.2l.5 5.1 3.6-3.7c.5-.5 1.3-.5 1.8 0s.5 1.3 0 1.8l-3.7 3.6 5.1.5c.7.1 1.2.6 1.2 1.3s-.5 1.2-1.2 1.3l-5.1.5 3.7 3.6c.5.5.5 1.3 0 1.8s-1.3.5-1.8 0l-3.6-3.7-.5 5.1c-.1.7-.6 1.2-1.3 1.2s-1.2-.5-1.3-1.2l-.5-5.1-3.6 3.7c-.5.5-1.3.5-1.8 0s-.5-1.3 0-1.8l3.7-3.6-5.1-.5C2 13.4 1.5 12.9 1.5 12.2s.5-1.2 1.2-1.3l5.1-.5-3.7-3.6c-.5-.5-.5-1.3 0-1.8s1.3-.5 1.8 0l3.6 3.7.5-5.1c.1-.7.6-1.2 1.3-1.2Z"/></svg>';
    const TOOL = '<svg class="cx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94Z"/></svg>';
    const CHEV = '<svg class="cx-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>';
    const lastAi = c.chat.map(m => m[0]).lastIndexOf('claude');
    const v = c.view;
    let stageNo = 0;
    const viewer = v ? `
        <aside class="cx-view" data-cx3d hidden aria-hidden="true">
          <canvas></canvas>
          <div class="cx3d-hud"><b data-hud-tris>${v.tris[0].toLocaleString('en-US')}</b><span>triangles</span><em data-hud-note>${v.parts} parts</em></div>
          <div class="cx3d-tool" data-hud-tool hidden></div>
          <script type="application/json" data-cx3d-data>${JSON.stringify(v)}</script>
        </aside>` : '';
    return `
      <div class="cx-grid" data-cx-grid>
        <figure class="cx-wrap">
          <div class="cx">
            <div class="cx-bar"><span>${esc(c.chatTitle || 'Lighten the gearbox')}</span></div>
            <ol class="cx-thread">
${c.chat.map(([who, text, tools, ask, result], i) => who === 'you'
    ? `              <li class="cx-you"><p>${esc(text)}</p></li>`
    : `              <li class="cx-ai" data-stage="${++stageNo}"><p>${esc(text)}</p>${tools ? `
                <ul class="cx-tools">${tools.map(([name, out]) => `<li>${TOOL}<code>${esc(name)}</code><span>${esc(out)}</span>${CHEV}</li>`).join('')}</ul>` : ''}${ask ? `
                <div class="cx-app"><p class="cx-wait"><i></i>Waiting for you to allow it in MeshOptimiser</p><div class="cx-ask"><small>Claude wants to</small><b>${esc(ask[0])}</b><span>${esc(ask[1])}</span><div><em>Don’t allow</em><em class="is-yes">Allow</em></div></div></div>` : ''}${result ? `
                <p class="cx-result">${esc(result)}</p>` : ''}${i === lastAi ? SPARK : ''}</li>`).join('\n')}
            </ol>
            <div class="cx-composer"><span>Reply to Claude…</span><i><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg></i></div>
          </div>
          <figcaption>${esc(c.chatNote)}</figcaption>
        </figure>${viewer}
      </div>`;
  };

  const designBand = () => {
    const d = site.design;
    if (!d) return '';
    const L = d.layout;
    return `
    <section class="band design" id="design">
      <div class="wrap">
        <div class="band-head">
          <p class="kicker">${esc(d.kicker)}</p>
          <h2>${esc(d.title)}</h2>
        </div>
        <p class="lead design-lead">${esc(d.lead)}</p>
        <div class="appui" data-appui>
          <div class="appui-stage">
${d.stage.map(([part, x, y, z, r, delay]) => `            <div class="ap ap-${part}" data-part="${part}" style="--x:${x}px;--y:${y}px;--z:${z};--r:${r}deg;--d:${delay}ms"></div>`).join('\n')}
          </div>
        </div>
        <p class="appui-note">${esc(d.note)}</p>

        <div class="plan" data-reveal>
          <div class="plan-head">
            <h3>${esc(L.title)}</h3>
            <p>${esc(L.line)}</p>
          </div>
          <div class="plan-art" role="img" aria-label="${esc(L.alt)}">
            <div class="plan-window" style="grid-template-columns:${L.left}fr ${L.view}fr ${L.right}fr;grid-template-rows:${L.top}fr ${1117 - L.top - L.status}fr ${L.status}fr">
              <div class="plan-top"><span>${esc(L.names[0])}</span><b>${L.top}</b></div>
              <div class="plan-left"><span>${esc(L.names[1])}</span><b>${L.left}</b></div>
              <div class="plan-view"><span>${esc(L.names[2])}</span><b>${L.view}</b>
                <i class="plan-dock"><u></u><u></u><u></u><u></u><u></u><u></u><u></u></i>
                <i class="plan-card"></i>
                <i class="plan-cube"></i>
              </div>
              <div class="plan-right"><span>${esc(L.names[3])}</span><b>${L.right}</b></div>
              <div class="plan-foot"><span>${esc(L.names[4])}</span><b>${L.status}</b></div>
            </div>
          </div>
          <ol class="plan-notes">
${L.notes.map(([name, line]) => `            <li><strong>${esc(name)}</strong><span>${esc(line)}</span></li>`).join('\n')}
          </ol>
        </div>

        <dl class="tokens" data-reveal>
${d.tokens.map(([figure, line]) => `          <div><dt>${esc(figure)}</dt><dd>${esc(line)}</dd></div>`).join('\n')}
        </dl>
      </div>
    </section>`;
  };

  // ---- the pages ----
  const pages = {};

  // line drawings for the tiles: bolts, nuts and gears in thin strokes, one scene per claim (they move only while their tile is on screen)
  const tileArt = (() => {
    const f = n => Math.round(n * 10) / 10;
    // every drawing is drawn to fill about the same part of the card: those drawn small are scaled up about the centre (strokes keep their width)
    const FILL = { 'art-stack': 1.25, 'art-small': 1 };
    const wrap = (cls, inner) => { const k = FILL[(cls.match(/art-\w+$/) || [])[0]]; return `<svg class="tile-art ${cls}" viewBox="0 0 360 200" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${k ? `<g class="art-scaled" transform="translate(180 100) scale(${k}) translate(-180 -100)">${inner}</g>` : inner}</svg>`; };
    // an isometric box: the outline, and the three edges that meet in front
    const cube = (cx, cy, s) => {
      const w = 0.866 * s, h = s / 2;
      const P = [[0, -s], [w, -h], [w, h], [0, s], [-w, h], [-w, -h]].map(([x, y]) => [f(cx + x), f(cy + y)]);
      return `M${P.map(p => p.join(' ')).join(' L')} Z M${P[5].join(' ')} L${cx} ${cy} L${P[1].join(' ')} M${cx} ${cy} L${P[3].join(' ')}`;
    };
    // wire meshes of a sphere, a cylinder and a box: the same solid with many facets and with few
    const ell = (cx, cy, rx, ry) => `M${f(cx - rx)} ${f(cy)} A${f(rx)} ${f(ry)} 0 1 0 ${f(cx + rx)} ${f(cy)} A${f(rx)} ${f(ry)} 0 1 0 ${f(cx - rx)} ${f(cy)}`;
    const sphereFine = (cx, cy, r) => [20, 40, 60, 80].map(d => ell(cx, cy, r * Math.sin(d * Math.PI / 180), r)).join(' ') + ' ' + [-60, -35, -12, 12, 35, 60].map(d => { const k = Math.sin(d * Math.PI / 180), c = Math.cos(d * Math.PI / 180); return ell(cx, cy + r * k, r * c, r * c * 0.3); }).join(' ');
    const sphereLow = (cx, cy, r) => `${ell(cx, cy, r * 0.62, r)} ${ell(cx, cy, r, r * 0.3)}`;
    const cylFine = (cx, cy, rx, ry, h) => {
      let d = '';
      for (let i = 1; i < 16; i++) { const x = cx - rx + i * 2 * rx / 16; const e = ry * Math.sqrt(1 - Math.pow((x - cx) / rx, 2)); d += ` M${f(x)} ${f(cy - h / 2 + e)} V${f(cy + h / 2 + e)}`; }
      for (let k = 1; k < 5; k++) d += ` M${f(cx - rx)} ${f(cy - h / 2 + k * h / 5)} A${rx} ${ry} 0 0 0 ${f(cx + rx)} ${f(cy - h / 2 + k * h / 5)}`;
      return d;
    };
    const cylLow = (cx, cy, rx, ry, h) => ` M${f(cx - rx * 0.5)} ${f(cy - h / 2 + ry * 0.87)} V${f(cy + h / 2 + ry * 0.87)} M${f(cx + rx * 0.5)} ${f(cy - h / 2 + ry * 0.87)} V${f(cy + h / 2 + ry * 0.87)} M${f(cx)} ${f(cy - h / 2 + ry)} V${f(cy + h / 2 + ry)}`;
    const cylBody = (cx, cy, rx, ry, h) => `${ell(cx, cy - h / 2, rx, ry)} M${f(cx - rx)} ${f(cy - h / 2)} V${f(cy + h / 2)} A${rx} ${ry} 0 0 0 ${f(cx + rx)} ${f(cy + h / 2)} V${f(cy - h / 2)}`;
    const boxFine = (cx, cy, s) => {
      const w = 0.866 * s, h = s / 2, n = 4, pt = (x, y) => [cx + x, cy + y];
      const faces = [[[0, -s], [w, -h], [0, 0], [-w, -h]], [[-w, -h], [0, 0], [0, s], [-w, h]], [[0, 0], [w, -h], [w, h], [0, s]]];
      let d = '';
      for (const [a, b, c, e] of faces) for (let k = 1; k < n; k++) {
        const m = (p, q, t) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
        const l1 = [m(a, b, k / n), m(e, c, k / n)], l2 = [m(a, e, k / n), m(b, c, k / n)];
        for (const [p, q] of [l1, l2]) d += ` M${f(cx + p[0])} ${f(cy + p[1])} L${f(cx + q[0])} ${f(cy + q[1])}`;
      }
      return d;
    };
    const boxLow = (cx, cy, s) => { const w = 0.866 * s, h = s / 2; return ` M${f(cx)} ${f(cy - s)} L${f(cx)} ${f(cy)} M${f(cx - w)} ${f(cy - h)} L${f(cx + w)} ${f(cy + h)} M${f(cx - w)} ${f(cy + h)} L${f(cx + w)} ${f(cy - h)}`; };
    // a barrel-shaped part turned on a lathe: rings from bottom to top, and the triangles between them
    const rings = (() => {
      const cx = 286, n = 13, out = [];
      for (let k = 0; k < n; k++) { const t = k / (n - 1), y = 164 - k * 10, r = 12 + 29 * Math.pow(Math.sin(Math.PI * t), 0.8); out.push({ k, y, r }); }
      return { cx, list: out };
    })();
    const ringPaths = () => rings.list.map(({ k, y, r }) => `<path class="art-ring" style="--k:${k}" d="${ell(rings.cx, y, r, r * 0.28)}"/>`).join('');
    const meshPath = () => {
      let d = '';
      for (let k = 0; k < rings.list.length - 1; k++) {
        const a = rings.list[k], b = rings.list[k + 1];
        for (let j = 0; j <= 8; j++) {
          const th = j * Math.PI / 8, pa = [rings.cx + a.r * Math.cos(th), a.y + a.r * 0.28 * Math.sin(th)], pb = [rings.cx + b.r * Math.cos(th), b.y + b.r * 0.28 * Math.sin(th)];
          d += ` M${f(pa[0])} ${f(pa[1])} L${f(pb[0])} ${f(pb[1])}`;
          if (j < 8) { const th2 = (j + 1) * Math.PI / 8; d += ` M${f(pa[0])} ${f(pa[1])} L${f(rings.cx + b.r * Math.cos(th2))} ${f(b.y + b.r * 0.28 * Math.sin(th2))}`; }
        }
      }
      return d;
    };
    // a detailed turned part (flanges and grooves), for Smart fit: its rings, its profile and its facets
    const knurl = (() => {
      const cx = 180, R = [44, 44, 31, 38, 31, 38, 31, 38, 31, 38, 31, 38, 31, 44, 44], rows = R.map((r, k) => ({ y: 30 + k * 10, r }));
      let d = rows.map(({ y, r }) => ell(cx, y, r, r * 0.3)).join(' ');
      d += ' M' + rows.map(({ y, r }) => `${f(cx - r)} ${f(y)}`).join(' L') + ' M' + rows.map(({ y, r }) => `${f(cx + r)} ${f(y)}`).join(' L');
      for (let j = 1; j < 8; j++) { const th = j * Math.PI / 8; d += ' M' + rows.map(({ y, r }) => `${f(cx + r * Math.cos(th))} ${f(y + r * 0.3 * Math.sin(th))}`).join(' L'); }
      return d;
    })();
    // 3D boxes and points on them, for the guide drawings: a box with half-sizes a and b along the two floor directions, h tall
    const isoU = (a) => [0.866 * a, 0.5 * a], isoV = (b) => [-0.866 * b, 0.5 * b];
    const isoPt = (cx, cy, a, b, s, t) => { const U = isoU(a), V = isoV(b); return [f(cx + s * U[0] + t * V[0]), f(cy + s * U[1] + t * V[1])]; };
    const isoBox = (cx, cy, a, b, h) => {
      const P = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([s, t]) => isoPt(cx, cy, a, b, s, t));
      return `M${P.map(p => p.join(' ')).join(' L')} Z M${P[1][0]} ${P[1][1]} V${f(P[1][1] + h)} M${P[2][0]} ${P[2][1]} V${f(P[2][1] + h)} M${P[3][0]} ${P[3][1]} V${f(P[3][1] + h)} M${P[1][0]} ${f(P[1][1] + h)} L${P[2][0]} ${f(P[2][1] + h)} L${P[3][0]} ${f(P[3][1] + h)}`;
    };
    // a torus drawn as a wire mesh, seen from a little above: nu lines around the ring, nv lines around the tube
    const torus = (cx, cy, R, r, nu, nv) => {
      const el = 38 * Math.PI / 180, S = Math.sin(el), C = Math.cos(el);
      const pt = (u, v) => { const x = (R + r * Math.cos(v)) * Math.cos(u), y = (R + r * Math.cos(v)) * Math.sin(u), z = r * Math.sin(v); return `${f(cx + x)} ${f(cy + y * S - z * C)}`; };
      const line = (fn, n) => `M${Array.from({ length: n + 1 }, (_, k) => fn(k / n * 2 * Math.PI)).join(' L')}`;
      let d = '';
      for (let i = 0; i < nu; i++) d += ' ' + line(v => pt(i / nu * 2 * Math.PI, v), 24);
      for (let j = 0; j < nv; j++) d += ' ' + line(u => pt(u, j / nv * 2 * Math.PI), 48);
      return d;
    };
    // a long beam lying along the floor: top face, the long side and the end
    const beam = (cx, cy) => {
      const P = (s, tt, z) => lPt(cx, cy, 80, s, tt, z), W = 15, H = 20;
      const A = P(-1, -W, H), B = P(1, -W, H), C = P(1, W, H), D = P(-1, W, H), C0 = P(1, W, 0), D0 = P(-1, W, 0), B0 = P(1, -W, 0);
      return `M${A.join(' ')} L${B.join(' ')} L${C.join(' ')} L${D.join(' ')} Z M${D.join(' ')} V${D0[1]} L${C0.join(' ')} V${C[1]} M${C0.join(' ')} L${B0.join(' ')} V${B[1]}`;
    };
    // an angle bracket: an L-shaped section pulled out along the floor; points on it are found from (along, across, up)
    const lPt = (cx, cy, a, s, t, z) => [f(cx + s * a * 0.866 - t * 0.866), f(cy + s * a * 0.5 + t * 0.5 - z)];
    const lSection = [[-44, 0], [44, 0], [44, 10], [-36, 10], [-36, 42], [-44, 42]];
    // the edges of the bracket that are behind it, for the darker grey
    const lBracketBack = (cx, cy, a) => {
      const A = lSection[0], B = lSection[1], seg = (p, q) => `M${p.join(' ')} L${q.join(' ')}`;
      return [seg(lPt(cx, cy, a, -1, ...A), lPt(cx, cy, a, 1, ...A)), seg(lPt(cx, cy, a, -1, ...A), lPt(cx, cy, a, -1, ...B)), seg(lPt(cx, cy, a, -1, ...A), lPt(cx, cy, a, -1, lSection[5][0], lSection[5][1]))].join(' ');
    };
    const lBracket = (cx, cy, a) => {
      // only the edges that can be seen: the whole near end, the far end's edges that border a face we see, and the edges along the length
      const near = lSection.map(([t, z]) => lPt(cx, cy, a, 1, t, z)), far = lSection.map(([t, z]) => lPt(cx, cy, a, -1, t, z));
      const seg = (p, q) => `M${p.join(' ')} L${q.join(' ')}`;
      let d = `M${near.map(p => p.join(' ')).join(' L')} Z`;
      for (const [x, y] of [[1, 2], [2, 3], [3, 4], [4, 5]]) d += ' ' + seg(far[x], far[y]);
      for (const k of [1, 2, 3, 4, 5]) d += ' ' + seg(near[k], far[k]);
      return d;
    };
    // the outline of a box as one closed shape (to paint it solid, so the lines of what is behind it do not show through)
    const isoSil = (cx, cy, a, b, h) => {
      const P = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([s, t]) => isoPt(cx, cy, a, b, s, t));
      return `M${P[0].join(' ')} L${P[1].join(' ')} L${P[1][0]} ${f(P[1][1] + h)} L${P[2][0]} ${f(P[2][1] + h)} L${P[3][0]} ${f(P[3][1] + h)} L${P[3].join(' ')} Z`;
    };
    // real fasteners standing on a plate, each with a solid shape (sil) that hides what is behind it, and its lines
    const hexV = (x, y, r, k) => [f(x + r * Math.cos(k * Math.PI / 3)), f(y + 0.5 * r * Math.sin(k * Math.PI / 3))];
    const hexPrism = (x, y, r, h) => {
      const T = [0, 1, 2, 3, 4, 5].map(k => hexV(x, y - h, r, k)), B = [0, 1, 2, 3].map(k => hexV(x, y, r, k));
      return {
        sil: `M${T.map(p => p.join(' ')).join(' L')} Z M${T.slice(0, 4).map(p => p.join(' ')).join(' L')} L${B.slice().reverse().map(p => p.join(' ')).join(' L')} Z`,
        line: `M${T.map(p => p.join(' ')).join(' L')} Z ${[0, 1, 2, 3].map(k => `M${T[k].join(' ')} L${B[k].join(' ')}`).join(' ')} M${B.map(p => p.join(' ')).join(' L')}`,
      };
    };
    const fBolt = (x, y) => {
      const r = 11, hh = 8, sr = 6, sh = 24, head = hexPrism(x, y, r, hh), yT = y - hh - sh, yH = y - hh;
      let thread = '';
      for (let i = 0; i < 6; i++) thread += ` M${f(x - sr)} ${f(yT + 5 + i * 3.4)} L${f(x + sr)} ${f(yT + 5 + i * 3.4 + 2.6)}`;
      return {
        sil: `${head.sil} ${ell(x, yT, sr, sr * 0.5)} M${f(x - sr)} ${f(yT)} V${f(yH)} H${f(x + sr)} V${f(yT)} Z`,
        line: `${head.line} ${ell(x, yT, sr, sr * 0.5)} ${ell(x, yT, sr * 0.55, sr * 0.28)} M${f(x - sr)} ${f(yT)} V${f(yH)} M${f(x + sr)} ${f(yT)} V${f(yH)}${thread}`,
      };
    };
    const fNut = (x, y) => {
      const r = 11, h = 9, p = hexPrism(x, y, r, h);
      return { sil: p.sil, line: `${p.line} ${ell(x, y - h, r * 0.48, r * 0.24)}` };
    };
    const fWasher = (x, y) => {
      const R = 14, h = 3;
      return {
        sil: `${ell(x, y - h, R, R * 0.5)} M${f(x - R)} ${f(y - h)} V${f(y)} A${R} ${f(R * 0.5)} 0 0 0 ${f(x + R)} ${f(y)} V${f(y - h)} Z`,
        line: `${ell(x, y - h, R, R * 0.5)} ${ell(x, y - h, R * 0.5, R * 0.25)} M${f(x - R)} ${f(y - h)} V${f(y)} A${R} ${f(R * 0.5)} 0 0 0 ${f(x + R)} ${f(y)} V${f(y - h)}`,
      };
    };
    const fasteners = [['bolt', -0.55, -6], ['nut', 0.5, -6], ['washer', -0.5, 26], ['bolt', 0.55, 26], ['nut', 0.02, 10]]
      .map(([kind, s, t]) => { const [x, y] = lPt(180, 124, 70, s, t, 10); return { kind, x, y }; })
      .sort((a, b) => a.y - b.y)
      .map(({ kind, x, y }, i) => { const o = kind === 'bolt' ? fBolt(x, y) : kind === 'nut' ? fNut(x, y) : fWasher(x, y); return `<g class="art-fnd art-hot" style="--i:${i}"><path class="art-sil" d="${o.sil}"/><path d="${o.line}"/></g>`; })
      .join('\n        ');
    // a bolt standing on a box: a head with its flats, as a short drum
    const isoBolt = (x, y, r, h) => `${ell(x, y - h, r, r * 0.5)} ${ell(x, y - h, r * 0.45, r * 0.22)} M${f(x - r)} ${f(y - h)} V${f(y)} A${f(r)} ${f(r * 0.5)} 0 0 0 ${f(x + r)} ${f(y)} V${f(y - h)}`;
    // a hex bolt seen from the side, pointing right: head, shank and thread
    const bolt = (x, y, len, d) => {
      const hw = d * 0.9, hh = d * 1.7, sx = x + hw, ex = sx + len;
      let t = '';
      for (let tx = sx + len * 0.35; tx < ex - d * 0.25; tx += d * 0.4) t += ` M${f(tx)} ${f(y - d / 2)} L${f(tx + d * 0.25)} ${f(y + d / 2)}`;
      return `M${f(x)} ${f(y - hh / 2)} H${f(sx)} V${f(y + hh / 2)} H${f(x)} Z M${f(x + hw * 0.3)} ${f(y - hh / 2)} V${f(y + hh / 2)} M${f(sx)} ${f(y - d / 2)} H${f(ex)} V${f(y + d / 2)} H${f(sx)}${t}`;
    };
    // a hex nut seen from above: the hexagon and its hole
    const nut = (cx, cy, r) => `M${[0, 1, 2, 3, 4, 5].map(i => `${f(cx + r * Math.cos(i * Math.PI / 3 + Math.PI / 6))} ${f(cy + r * Math.sin(i * Math.PI / 3 + Math.PI / 6))}`).join(' L')} Z M${f(cx + r * 0.45)} ${f(cy)} A${f(r * 0.45)} ${f(r * 0.45)} 0 1 0 ${f(cx - r * 0.45)} ${f(cy)} A${f(r * 0.45)} ${f(r * 0.45)} 0 1 0 ${f(cx + r * 0.45)} ${f(cy)} Z`;
    // a gear: n teeth between the radii r and R, and a hub
    const gear = (cx, cy, r, R, n) => {
      const pts = [];
      for (let i = 0; i < n; i++) {
        const a = i * 2 * Math.PI / n, w1 = Math.PI / n * 0.62, w2 = Math.PI / n * 0.34;
        for (const [rad, da] of [[r, -w1], [R, -w2], [R, w2], [r, w1]]) pts.push(`${f(cx + rad * Math.cos(a + da))} ${f(cy + rad * Math.sin(a + da))}`);
      }
      return `M${pts.join(' L')} Z M${f(cx + r * 0.35)} ${f(cy)} A${f(r * 0.35)} ${f(r * 0.35)} 0 1 0 ${f(cx - r * 0.35)} ${f(cy)} A${f(r * 0.35)} ${f(r * 0.35)} 0 1 0 ${f(cx + r * 0.35)} ${f(cy)} Z`;
    };
    return [
      // Convert: a STEP sheet streams out as data and is turned into a mesh, ring by ring
      wrap('art-convert', `
        <path class="art-dim" d="M34 28 V20 H108 L134 46 V164 H124"/>
        <path d="M24 28 H98 L124 54 V172 H24 Z M98 28 V54 H124"/>
        <path d="${cube(48, 70, 13)}"/>
        <path class="art-dim" d="M72 66 H104 M72 78 H92 M36 98 H100 M36 112 H86 M36 126 H60"/>
        <path d="${bolt(42, 152, 44, 9)}"/>
        <path class="art-dots art-hot" d="M138 100 C170 100 176 100 214 100"/>
        ${ringPaths()}
        <path class="art-mesh art-hot" pathLength="1" d="${meshPath()}"/>`),
      // Clean: a boxy casing with detailed parts inside; the scan line wipes them away as it passes
      wrap('art-clean', `
        <defs><clipPath id="clean-wipe"><rect class="art-wipeclip" x="46" y="0" width="276" height="200"/></clipPath></defs>
        <rect x="46" y="30" width="268" height="140" rx="7"/>
        <rect x="56" y="40" width="248" height="120" rx="3" class="art-dim"/>
        <path class="art-dim" d="M46 56 H56 M46 144 H56 M304 56 H314 M304 144 H314" />
        <path class="art-dim" d="M58 100 H302" stroke-dasharray="2 5"/>
        <g class="art-parts art-hot" clip-path="url(#clean-wipe)">
          <path d="${nut(72, 56, 7)}"/><path d="${nut(72, 144, 7)}"/><circle cx="104" cy="100" r="26"/><circle cx="104" cy="100" r="19"/><circle cx="104" cy="100" r="11"/><circle cx="104" cy="100" r="4"/><path d="M104 74 V81 M104 119 V126 M78 100 H85 M123 100 H130"/>
          <path d="${gear(158, 100, 19, 26, 10)}"/><path d="${gear(210, 100, 19, 26, 10)}"/>
          <path d="${nut(288, 56, 7)}"/><path d="${nut(288, 144, 7)}"/><circle cx="256" cy="100" r="26"/><circle cx="256" cy="100" r="19"/><circle cx="256" cy="100" r="11"/><circle cx="256" cy="100" r="4"/><path d="M256 74 V81 M256 119 V126 M230 100 H237 M275 100 H282"/>
        </g>
        <g class="art-scan art-hot"><path d="M46 22 V178"/><path d="M39 28 V172" opacity="0.5" stroke-dasharray="4 5"/><path d="M32 34 V166" opacity="0.28" stroke-dasharray="2 7"/><path d="M25 40 V160" opacity="0.14" stroke-dasharray="1 9"/><path d="M40 22 H52 M40 178 H52"/></g>`),
      // Shrink: a sphere, a cylinder and a box, each as a fine mesh that thins out to a few facets
      wrap('art-shrink', `
        <path d="${ell(66, 100, 52, 52)}"/>
        <path d="${cylBody(184, 100, 44, 14, 96)}"/>
        <path d="${cube(298, 100, 54)}"/>
        <g class="art-fine art-dim"><path d="${sphereFine(66, 100, 52)}"/><path d="${cylFine(184, 100, 44, 14, 96)}"/><path d="${boxFine(298, 100, 54)}"/></g>
        <g class="art-low art-hot"><path d="${sphereLow(66, 100, 52)}"/><path d="${cylLow(184, 100, 44, 14, 96)}"/><path d="${boxLow(298, 100, 54)}"/></g>`),
      // Trust: boxes of data bounce around a computer, hop inside one after another, and then the lock closes
      wrap('art-trust', `
        <g transform="translate(-21.6 -10.3) scale(1.12)" stroke-width="1.34">
          <rect x="104" y="34" width="152" height="104" rx="8"/><path d="M180 138 V160 M150 160 H210"/>
          <g class="art-boxes art-hot">
            <g class="art-box" style="--tx:76px;--ty:2px;--s:0.48;--i:0"><g class="art-bounce" style="--b:0s"><path d="${cube(52, 62, 21)}"/></g></g>
            <g class="art-box" style="--tx:-76px;--ty:8px;--s:0.5;--i:1"><g class="art-bounce" style="--b:-0.35s"><path d="${cube(308, 56, 20)}"/></g></g>
            <g class="art-box" style="--tx:66px;--ty:-12px;--s:0.55;--i:2"><g class="art-bounce" style="--b:-0.7s"><path d="${cube(64, 128, 18)}"/></g></g>
            <g class="art-box" style="--tx:-68px;--ty:-8px;--s:0.43;--i:3"><g class="art-bounce" style="--b:-0.2s"><path d="${cube(298, 124, 23)}"/></g></g>
            <g class="art-box" style="--tx:26px;--ty:32px;--s:0.67;--i:4"><g class="art-bounce" style="--b:-0.55s"><path d="${cube(180, 20, 15)}"/></g></g>
          </g>
          <g class="art-lockg">
            <path class="art-shackle" d="M171 84 V72 a9 9 0 0 1 18 0 V84"/>
            <g class="art-lockbody"><rect x="164" y="84" width="32" height="26" rx="4"/><circle cx="180" cy="95" r="3"/><path d="M180 98 V103"/></g>
          </g>
        </g>`),
      // Claude: a prompt, and the parts it puts to work
      wrap('art-claude', `
        <g transform="translate(-27 -15) scale(1.15)" stroke-width="1.3">
          <path d="M42 56 H136 a12 12 0 0 1 12 12 V104 a12 12 0 0 1-12 12 H66 L44 136 V116 H42 a12 12 0 0 1-12-12 V68 a12 12 0 0 1 12-12 Z"/>
          <path class="art-dim" d="M46 78 H118 M46 94 H92"/><path class="art-cursor art-hot" d="M100 90 V100"/>
          <path class="art-flow art-hot" d="M148 86 C190 86 192 38 232 38 M148 86 C190 86 192 92 232 92 M148 86 C190 86 192 148 232 148"/>
          <g class="art-gear"><path d="${gear(262, 38, 15, 21, 8)}"/></g>
          <path d="${nut(262, 92, 16)}"/>
          <path d="${bolt(246, 148, 30, 10)}"/>
        </g>`),
      // Remove holes: a plate seen from above at an angle, with holes of every size, none touching, and each one closes
      wrap('clip-art art-holes', `
        ${(() => {
          // the edges behind (far end underneath and behind, the inside of the tube) are drawn in the darker grey, under the ones in front
          const P = (s, t, z) => lPt(180, 126, 80, s, t, z).join(' '), seg = (a, b) => `M${a} L${b}`;
          const O = [[-22, 0], [22, 0], [22, 44], [-22, 44]], I = [[-15, 7], [15, 7], [15, 37], [-15, 37]];
          const ring = (s, q, ids) => ids.map(([a, b]) => seg(P(s, ...q[a]), P(s, ...q[b]))).join(' ');
          const all = [[0, 1], [1, 2], [2, 3], [3, 0]];
          const back = [ring(-1, O, [[0, 1], [3, 0]]), seg(P(-1, ...O[0]), P(1, ...O[0])), ring(-1, I, all), I.map(([t, z]) => seg(P(1, t, z), P(-1, t, z))).join(' ')].join(' ');
          const front = [ring(1, O, all), ring(-1, O, [[1, 2], [2, 3]]), [1, 2, 3].map(k => seg(P(1, ...O[k]), P(-1, ...O[k]))).join(' '), ring(1, I, all)].join(' ');
          return `<path class="art-dim" d="${back}"/><path d="${front}"/>`;
        })()}
        <g>${[[-0.66, 0], [-0.33, 1], [0, 2], [0.33, 3], [0.66, 4]].map(([sv, i]) => { const [x, y] = lPt(180, 126, 80, sv, 0, 44); return `<g class="art-hole" style="--i:${i}"><g transform="matrix(0.866 0.5 -0.866 0.5 ${x} ${y})"><circle r="8.5"/></g></g>`; }).join('')}</g>`),
      // Split: a block held together by bolts is two parts fused; the bolts come out, a cutting plane passes through, and the parts slide apart
      wrap('clip-art art-split', `
        <g class="art-sa"><path class="art-solid" d="${isoSil(...isoPt(180, 86, 64, 40, -0.5, 0), 32, 40, 34)}"/><path d="${isoBox(...isoPt(180, 86, 64, 40, -0.5, 0), 32, 40, 34)}"/><g class="art-bolt"><path d="${isoBolt(...isoPt(180, 86, 64, 40, -0.5, -0.3), 8, 7)}"/><path d="${isoBolt(...isoPt(180, 86, 64, 40, -0.5, 0.35), 8, 7)}"/></g><path class="art-face" d="M${isoPt(180, 86, 64, 40, 0, -1).join(' ')} L${isoPt(180, 86, 64, 40, 0, 1).join(' ')} V${f(isoPt(180, 86, 64, 40, 0, 1)[1] + 34)} L${isoPt(180, 86, 64, 40, 0, -1)[0]} ${f(isoPt(180, 86, 64, 40, 0, -1)[1] + 34)} Z"/></g>
        <g class="art-sb"><path class="art-face" d="M${isoPt(180, 86, 64, 40, 0, -1).join(' ')} L${isoPt(180, 86, 64, 40, 0, 1).join(' ')} V${f(isoPt(180, 86, 64, 40, 0, 1)[1] + 34)} L${isoPt(180, 86, 64, 40, 0, -1)[0]} ${f(isoPt(180, 86, 64, 40, 0, -1)[1] + 34)} Z"/><path class="art-solid" d="${isoSil(...isoPt(180, 86, 64, 40, 0.5, 0), 32, 40, 34)}"/><path d="${isoBox(...isoPt(180, 86, 64, 40, 0.5, 0), 32, 40, 34)}"/><g class="art-bolt"><path d="${isoBolt(...isoPt(180, 86, 64, 40, 0.5, -0.3), 8, 7)}"/><path d="${isoBolt(...isoPt(180, 86, 64, 40, 0.5, 0.35), 8, 7)}"/></g></g>
        <path class="art-plane art-hot" pathLength="1" d="M${isoPt(180, 86, 64, 40, 0, -1.12)[0]} ${f(isoPt(180, 86, 64, 40, 0, -1.12)[1] - 9)} L${isoPt(180, 86, 64, 40, 0, 1.12)[0]} ${f(isoPt(180, 86, 64, 40, 0, 1.12)[1] - 9)} V${f(isoPt(180, 86, 64, 40, 0, 1.12)[1] + 43)} L${isoPt(180, 86, 64, 40, 0, -1.12)[0]} ${f(isoPt(180, 86, 64, 40, 0, -1.12)[1] + 43)} Z"/>`),
      // Select hidden parts: the shell goes see-through and what was inside is picked
      wrap('clip-art art-hidden', `
        <g class="art-shell"><g class="art-shell-solid"><path d="${isoBox(180, 78, 70, 44, 38)} ${ell(...isoPt(180, 78, 70, 44, -0.82, -0.78), 4, 2.1)} ${ell(...isoPt(180, 78, 70, 44, 0.82, -0.78), 4, 2.1)} ${ell(...isoPt(180, 78, 70, 44, -0.82, 0.78), 4, 2.1)} ${ell(...isoPt(180, 78, 70, 44, 0.82, 0.78), 4, 2.1)}"/></g><g class="art-shell-dash"><path d="${isoBox(180, 78, 70, 44, 38)} ${ell(...isoPt(180, 78, 70, 44, -0.82, -0.78), 4, 2.1)} ${ell(...isoPt(180, 78, 70, 44, 0.82, -0.78), 4, 2.1)} ${ell(...isoPt(180, 78, 70, 44, -0.82, 0.78), 4, 2.1)} ${ell(...isoPt(180, 78, 70, 44, 0.82, 0.78), 4, 2.1)}"/></g></g>
        <g class="art-found art-hot" transform="matrix(0.866 0.5 -0.866 0.5 180 97)">
          <g transform="translate(-25 0)"><g class="art-spin"><path d="${gear(0, 0, 21, 28, 12)}"/><circle r="9"/><circle r="4"/></g></g>
          <g transform="translate(25 0)"><g class="art-spinr"><path d="${gear(0, 0, 21, 28, 12)}"/><circle r="9"/><circle r="4"/></g></g>
        </g>
        <path class="art-brk art-hot" pathLength="1" d="M74 14 h16 M74 14 v16 M286 14 h-16 M286 14 v16 M74 186 h16 M74 186 v-16 M286 186 h-16 M286 186 v-16"/>`),
      // Fasteners: a plate with bolts standing on it, each found by its shape
      wrap('clip-art art-fast', `
        <path class="art-dim" d="${lBracketBack(180, 124, 70)}"/>
        <path d="${lBracket(180, 124, 70)}"/>
        ${fasteners}`),
      // Smart fit: a detailed part becomes a plain cylinder, in place, and keeps its outline
      wrap('clip-art art-smart', `
        <g transform="rotate(-60 180 100)">
          <g class="art-dense2"><path d="${knurl}"/></g>
          <path class="art-fit art-hot" pathLength="1" d="${cylBody(180, 100, 46, 14, 140)}"/>
        </g>`),
      // Smart optimise: one press, and a heavy part gets lighter: the same gear with half the detail
      wrap('clip-art art-optimise', `
        <g class="art-fine art-dim"><path d="${torus(180, 104, 66, 29, 36, 14)}"/></g>
        <g class="art-low art-hot"><path d="${torus(180, 104, 66, 29, 12, 6)}"/></g>`),
      // Remove floating pieces: stray bits around a body drift away, the body stays
      wrap('clip-art art-floating', `
        <path d="${lBracket(180, 124, 70)}"/>
        ${[[76, 56, 9, 0, 6, -9], [290, 66, 8, 1, -7, -6], [92, 150, 7, 2, 8, 7], [280, 150, 10, 3, -6, 9], [236, 34, 6, 4, 7, 6]].map(([x, y, r, i, bx, by]) => `<g class="art-m-away art-hot" style="--i:${i}"><g class="art-m-bob" style="--bx:${bx}px;--by:${by}px;--bd:${-i * 0.7}s"><path d="${nut(x, y, r)}"/></g></g>`).join('')}`),
      // Remove hidden faces: the faces inside a housing light up, then they are gone
      wrap('clip-art art-faces', `
        <path class="art-solid" d="${isoSil(180, 124, 64, 40, 18)}"/>
        <path d="${isoBox(180, 124, 64, 40, 18)}"/>
        <path class="art-solid" d="${isoSil(180, 88, 64, 40, 18)}"/>
        <path d="${isoBox(180, 88, 64, 40, 18)}"/>
        <g class="art-m-flash art-hot">${[124, 106].map(y => `<path d="M${[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([s, tt]) => isoPt(180, y, 64, 40, s, tt).join(' ')).join(' L')} Z"/>`).join('')}</g>`),
      // Remesh: a flat face drawn with a crowd of triangles is rebuilt with a few
      wrap('clip-art art-remesh', `
        <g class="art-fine art-dim"><path d="${sphereFine(180, 100, 58)}"/></g>
        <path d="${ell(180, 100, 58, 58)}"/>
        <path class="art-m-draw art-hot" pathLength="1" d="${(() => {
          const R = 58, hex = Array.from({ length: 6 }, (_, k) => [180 + R * Math.cos(k * Math.PI / 3), 100 + R * Math.sin(k * Math.PI / 3)]);
          const inner = [90, 210, 330].map(d => [180 + R * 0.46 * Math.cos(d * Math.PI / 180), 100 + R * 0.46 * Math.sin(d * Math.PI / 180)]);
          const P = ([x, y]) => `${f(x)} ${f(y)}`;
          const links = [[0, 1, 2], [1, 3, 4], [2, 5, 0]].map(([i, p, q]) => ({ i, p, q }));
          return `M${P(hex[0])} ` + hex.slice(1).map(p => `L${P(p)}`).join(' ') + ' Z' +
            ' M' + inner.map(P).join(' L') + ' Z' +
            [[0, 1, 2], [1, 3, 4], [2, 5, 0]].map(([i, p, q]) => ` M${P(inner[i])} L${P(hex[p])} M${P(inner[i])} L${P(hex[q])}`).join('');
        })()}"/>`),
      // Delete small parts: big parts stay, the tiny ones vanish one by one
      wrap('clip-art art-small', `
        <path class="art-solid" d="${isoSil(180, 84, 78, 48, 46)}"/>
        <path d="${isoBox(180, 84, 78, 48, 46)}"/>
        <path class="art-solid" d="M154 84 V66 A26 13 0 0 1 206 66 V84 A26 13 0 0 1 154 84 Z"/>
        <path d="M154 84 V66 M206 84 V66 M154 84 A26 13 0 0 0 206 84"/>
        <path d="${ell(180, 66, 26, 13)} ${ell(180, 66, 15, 7.5)}"/>
        <path d="${ell(180, 66, 7, 3.5)}"/>
        ${[[-0.82, -0.8], [0.82, -0.8], [-0.82, 0.8], [0.82, 0.8], [0, -0.82], [0, 0.82], [-0.82, 0], [0.82, 0]].map(([s, tt], i) => { const [x, y] = isoPt(180, 84, 78, 48, s, tt); return `<g class="art-m-small art-hot" style="--i:${i};fill: var(--card-bg, var(--surface))"><path d="${nut(x, y, 4.2)}"/></g>`; }).join('')}
        ${[[-0.7, 1], [-0.2, 1], [0.3, 1], [0.7, 1]].map(([s, tt], i) => { const [x, y] = isoPt(180, 84, 78, 48, s, tt); return `<g class="art-m-small art-hot" style="--i:${i + 8};fill: var(--card-bg, var(--surface))"><path d="${ell(x, y + 22, 3.2, 3.2)} M${f(x - 5)} ${f(y + 22)} H${f(x + 5)}"/></g>`; }).join('')}`),
      // Repair mesh: a patch with a torn edge and a gap is healed
      wrap('clip-art art-repair', `
        <path d="M92 100 L180 56 L268 100 L180 144 Z"/>
        <g class="art-dim"><path d="${[1, 2, 3, 4, 5, 6, 7].map(k => `M${f(92 + k * 11)} ${f(100 - k * 5.5)} L${f(180 + k * 11)} ${f(144 - k * 5.5)} M${f(92 + k * 11)} ${f(100 + k * 5.5)} L${f(180 + k * 11)} ${f(56 + k * 5.5)}`).join(' ')}"/></g>
        <g class="art-fine"><path d="M158 80 L190 98 L170 112 L150 100 Z" style="fill: var(--card-bg, var(--surface))"/></g>
        <g class="art-low art-hot"><path d="M158 80 L190 98 L170 112 L150 100 Z"/></g>`),
      // Stacked copies: a second copy sits on the first; it slides in and is removed
      wrap('clip-art art-stack', `
        <path d="${beam(180, 104)}"/>
        <g class="art-m-stack art-hot"><path d="${beam(180, 104)}"/></g>`),
    ];
  })();

  // the claims at the top of the home page, as tiles
  const strengthsBand = () => {
    const st = site.strengths;
    if (!st) return `    <section class="band">
      <div class="wrap">
        <dl class="figures">
${app.highlights.map(([figure, line]) => `          <div><dt>${esc(figure)}</dt><dd>${esc(line)}</dd></div>`).join('\n')}
        </dl>
      </div>
    </section>`;
    return `    <section class="band is-first">
      <div class="wrap">
        <div class="bento">
${st.tiles.map(([label, claim, rest, line, colour], i) => `          <article class="tile"${colour ? ` style="--tile-c:${esc(colour)}"` : ''}>${tileArt[i] || ''}<p class="tile-label">${esc(label)}</p><h2>${esc(claim)} <span>${esc(rest)}</span></h2><p class="tile-line">${esc(line)}</p></article>`).join('\n')}
        </div>
      </div>
    </section>`;
  };

  pages.home = (page) => head(page, `${app.title} — ${app.subtitle}`, site.lead) + header(page) + `
    <section class="wrap hero">
      <p class="kicker">${[version && 'v' + version, app.stage, licence, platform.replace(/\s*·\s*/g, ' and ')].filter(Boolean).map(esc).join('<b>·</b>')}</p>
      <h1>${esc(app.subtitle)}</h1>
      <p class="lead">${esc(site.lead)}</p>
      <div class="actions">
        <a class="btn is-primary is-large" href="download.html">Download</a>
        ${LITE_BTN}
      </div>
    </section>

${strengthsBand()}

${popHero()}

    <section class="band why">
      <div class="wrap split">
        <div class="split-head">
          <p class="kicker">${esc(site.why.kicker)}</p>
          <h2>${esc(site.why.title)}</h2>
        </div>
        <div class="split-body">
${site.why.paragraphs.map(p => `          <p>${esc(p)}</p>`).join('\n')}
        </div>
      </div>
    </section>

    <section class="band">
      <div class="wrap">
        <div class="band-head">
          <p class="kicker">Clean-up tools</p>
          <h2>Advanced STEP clean-up tools, free in your browser.</h2>
          <a class="more" href="features.html">All features</a>
        </div>
        <div class="fcar fcar-clips" data-fcar>
        <div class="clips fcar-track">${clipCards()}
        </div>
        <div class="fcar-nav"><button type="button" data-dir="-1" aria-label="Previous"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button><button type="button" data-dir="1" aria-label="Next"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button></div>
        </div>
      </div>
    </section>

${savingsBand()}
${/* designBand() is switched off: the band is not shown on the home page */ ''}
${libraryBand()}
${searchDemo()}
${wandDemo()}
${claudeBand()}
    <section class="band">
      <div class="strip" data-strip>
        ${app.shots.map(s => shot(s, 'strip')).join('\n        ')}
      </div>
      <div class="dots" aria-hidden="true"></div>
      <div class="wrap">
        <p class="credit">The assembly in these pictures is Gearbox Assy from Khronos’s <a href="https://github.com/KhronosGroup/glTF-Sample-Models/tree/main/2.0/GearboxAssy" rel="noopener">glTF-Sample-Models</a>, a JT CAD sample converted by Okino Computer Graphics. The bolts, nuts, washers and gears come from the app’s own library.</p>
      </div>
    </section>

    <section class="band">
      <div class="wrap split">
        <div class="split-head">
          <p class="kicker">Latest release</p>
          <h2>v${esc(latest.version)}${relName(latest)}</h2>
          <a class="more" href="changelog.html">Full changelog</a>
        </div>
        <div class="split-body">
          <p>${esc(latest.summary)}</p>
          <ul class="changes">
${(latest.items || []).slice(0, 4).map(([tag, line]) => `            <li><b class="is-${tag.toLowerCase()}">${esc(tag)}</b><span>${esc(line)}</span></li>`).join('\n')}
          </ul>
        </div>
      </div>
    </section>` + footer(page);

  pages.claude = (page) => {
    const c = site.claude;
    const docsLink = docs && docs.articles.some(a => a.slug === 'work-with-claude') ? 'docs/work-with-claude.html' : 'docs.html';
    return head(page, c.titleTag, c.description) + header(page) + `
${c.badge ? `    <div class="soon-banner" role="note"><div class="wrap soon-banner-in"><strong>${esc(c.badge)}</strong><span>${esc(c.soon)}</span></div></div>
` : ''}    <section class="wrap page-head">
      <p class="kicker">${esc(c.kicker)}${SOON(c, true)}</p>
      <h1>${esc(c.headline)}</h1>
      <p class="lead">${esc(c.lead)}</p>
      <div class="actions">
        <a class="btn is-primary is-large" href="#how">How it works</a>
        <a class="btn is-large" href="${docsLink}">Read the docs</a>
      </div>
    </section>

    <section class="band is-first">
      <div class="wrap">${claudeChat()}
      </div>
    </section>

    <section class="band" id="how">
      <div class="wrap">
        <div class="band-head">
          <p class="kicker">How it works</p>
          <h2>Three steps, then just ask.</h2>
        </div>
        <ol class="steps">
${c.steps.map(([name, line], i) => `          <li><i>${pad2(i + 1)}</i><h3>${esc(name)}</h3><p>${esc(line)}</p></li>`).join('\n')}
        </ol>${commands([['Add it to Claude', c.command]])}
        <p class="cl-fine">The command is for Claude Code. Another program that can add an HTTP MCP server takes the same address: <code>http://localhost:4242/mcp</code>. If the launcher printed a different port, use that number.</p>
      </div>
    </section>

    <section class="band" id="can">
      <div class="wrap">
        <div class="band-head">
          <p class="kicker">What Claude can do</p>
          <h2>The app’s own tools, in Claude’s hands.</h2>
        </div>
        <div class="cl-groups">
${c.groups.map(([title, icon, note, tools], gi) => `          <article class="cl-group" style="--ico: ${GROUP_COLOURS[gi % GROUP_COLOURS.length]}">
            <header><i class="ico">${svgIcon(icon)}</i><div><h3>${esc(title)}</h3><p>${esc(note)}</p></div></header>
            <ul>
${tools.map(([name, line, asks]) => `              <li><code>${esc(name)}</code><span>${esc(line)}</span>${asks ? '<em class="cl-asks">asks</em>' : ''}</li>`).join('\n')}
            </ul>
          </article>`).join('\n')}
        </div>
      </div>
    </section>

${c.jobs ? claudeJobs() : ''}
${c.renders ? claudeRenders() : ''}
${c.knows ? claudeKnows() : ''}
    <section class="band" id="control">
      <div class="wrap">
        <div class="band-head">
          <p class="kicker">${esc(c.control.kicker)}</p>
          <h2>${esc(c.control.title)}</h2>
        </div>
        <p class="lead">${esc(c.control.line)}</p>
        <dl class="cl-points">
${c.control.points.map(([name, line]) => `          <div><dt>${esc(name)}</dt><dd>${esc(line)}</dd></div>`).join('\n')}
        </dl>
        <div class="cl-shots">
          ${c.control.shots.map(s => shot(s, 'claude')).join('\n          ')}
        </div>
${c.control.badge ? claudeBadge() : ''}
        <div class="cl-privacy">
          <h3>${esc(c.privacy.title)}</h3>
${c.privacy.lines.map(l => `          <p>${esc(l)}</p>`).join('\n')}
        </div>
      </div>
    </section>

    <section class="band" id="ask">
      <div class="wrap">
        <div class="band-head">
          <p class="kicker">Try asking</p>
          <h2>Plain words are enough.</h2>
        </div>
        <ul class="cl-asklist">
${c.prompts.map(p => `          <li><p>${esc(p)}</p><button type="button" class="copy" data-copy="${esc(p)}">Copy</button></li>`).join('\n')}
        </ul>
      </div>
    </section>

    <section class="band" id="faq">
      <div class="wrap split">
        <div class="split-head">
          <p class="kicker">Questions</p>
          <h2>Before you try it.</h2>
        </div>
        <div class="split-body">
          <dl class="table cl-faq">
${c.faq.map(([q, a]) => `            <div><dt>${esc(q)}</dt><dd>${esc(a)}</dd></div>`).join('\n')}
          </dl>
        </div>
      </div>
    </section>` + footer(page);
  };

  // the features page's categories: each name in SHOWCASE is looked up in featureGroups (items and more)
  const showcase = () => {
    const all = new Map(app.featureGroups.flatMap(g => g.items.concat(g.more || [])).map(i => [i[0], i]));
    return SHOWCASE.map(g => ({ ...g, items: g.names.map(n => { if (!all.has(n)) throw new Error('SHOWCASE: no feature named ' + n); return all.get(n); }) }));
  };
  pages.features = (page) => head(page, `Features — ${app.title}`, `Everything ${app.title} does: the STEP to GLB pipeline, the WebGPU viewer, mesh tools, hierarchy editing and export.`) + header(page) +
    pageHead('Features', 'Make heavy CAD models light. Free, private, on your own machine.', '') + `
    <section class="band is-first">
      <div class="strip" data-strip>
${app.spotlights.map(([name, line, image], i) => `        <figure><a class="zoom" href="${asset(image)}" data-group="spots" data-caption="${esc(name)}"><img src="${asset(image)}" alt="${esc(app.title + ': ' + name)}" width="2400" height="1350"${i < 2 ? '' : ' loading="lazy"'} decoding="async" /></a><figcaption><i>${pad2(i + 1)}</i><strong>${esc(name)}</strong><span>${esc(line)}</span></figcaption></figure>`).join('\n')}
      </div>
      <div class="dots" aria-hidden="true"></div>
    </section>
${cleanupBand()}
${compressionBand()}
${showcase().map((group, gi) => `
    <section class="band" id="${slug(group.title)}" style="--ico: ${GROUP_COLOURS[gi % GROUP_COLOURS.length]}">
      <div class="wrap tools-wrap">
        <div class="split-head">
          <p class="kicker">${esc(group.note || 'Features')}</p>
          <h2>${esc(group.title)}</h2>
        </div>
        <ul class="tools">
${group.items.map(([name, line, flag]) => `          <li><i class="ico">${svgIcon(ICONS.items[name])}</i><div><strong>${esc(name)}${flag === 'new' ? '<em class="tag-new">New</em>' : ''}</strong><span>${esc(line)}</span></div></li>`).join('\n')}
        </ul>
      </div>
    </section>`).join('') + `
    <section class="band" id="all-features">
      <div class="wrap tools-wrap">
        <div class="split-head">
          <p class="kicker">${app.allFeatures ? 'The whole list' : 'And more'}</p>
          <h2>${app.allFeatures ? 'Every feature, by name.' : 'Everything else, by name.'}</h2>
          <p class="split-note">Every capability of the app, grouped. The best of it is above.</p>
        </div>
        <details class="allfeat">
          <summary>${app.allFeatures ? `All ${app.allFeatures.reduce((n, g) => n + g.items.length, 0)} features` : `${app.featureGroups.reduce((n, g) => n + g.items.length + (g.more || []).length, 0)} features`}<i aria-hidden="true"></i></summary>
          <div class="allfeat-body">
${app.allFeatures
  ? app.allFeatures.filter(g => g.items.length).map(g => `            <div><h3>${esc(g.title)}</h3><ul>${g.items.map(name => `<li>${esc(name)}</li>`).join('')}</ul></div>`).join('\n')
  : app.featureGroups.map(group => ({ group, rest: group.items.concat(group.more || []) })).filter(x => x.rest.length).map(({ group, rest }) => `            <div><h3>${esc(group.title)}</h3><ul>${rest.map(([name, , flag]) => `<li>${esc(name)}${flag === 'new' ? '<em class="tag-new">New</em>' : ''}</li>`).join('')}</ul></div>`).join('\n')}
          </div>
        </details>
      </div>
    </section>`}` + footer(page);


  // ---- docs: a knowledge base (docs-content.js) ----
  // Text in an article may hold: `code`, [[Ctrl + K]] for keys, {{Remove holes}}
  // for the name of something in the app, [words](#slug) for another article
  // and [words](https://…) for a link out.
  const rich = (text) => esc(text)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[\[([^\]]+)\]\]/g, (_, keys) => keys.split(/\s+\+\s+/).map(k => `<kbd>${k}</kbd>`).join(''))
    .replace(/\{\{([^}]+)\}\}/g, '<span class="ui">$1</span>')
    .replace(/\[([^\]]+)\]\(#([a-z0-9-]+)\)/g, '<a href="docs/$2.html">$1</a>')
    .replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" rel="noopener">$1</a>');
  const bySlug = new Map(docs ? docs.articles.map(a => [a.slug, a]) : []);
  // One block of an article: [type, …]
  //   p, note        a string            h      a sub-heading
  //   steps, list    strings             terms  [term, meaning] pairs
  //   keys           [keys, what] pairs  code   one command, with a Copy button
  //   img            file, caption       see    slugs of related articles
  const docBlock = ([type, a, b]) => {
    if (type === 'p') return `<p>${rich(a)}</p>`;
    if (type === 'h') return `<h2 id="${slug(a)}">${rich(a)}</h2>`;
    if (type === 'steps') return `<ol class="kb-steps">\n${a.map(x => `            <li>${rich(x)}</li>`).join('\n')}\n          </ol>`;
    if (type === 'list') return `<ul class="kb-points">\n${a.map(x => `            <li>${rich(x)}</li>`).join('\n')}\n          </ul>`;
    if (type === 'terms') return `<dl class="table">\n${a.map(([t, d]) => `            <div><dt>${rich(t)}</dt><dd>${rich(d)}</dd></div>`).join('\n')}\n          </dl>`;
    if (type === 'keys') return `<dl class="kb-keys">\n${a.map(([k, d]) => `            <div><dt>${k.split(/\s+\+\s+/).map(x => `<kbd>${esc(x)}</kbd>`).join('')}</dt><dd>${rich(d)}</dd></div>`).join('\n')}\n          </dl>`;
    if (type === 'code') return `<div class="kb-code"><code>${esc(a)}</code><button type="button" class="copy" data-copy="${esc(a)}">Copy</button></div>`;
    if (type === 'note') return `<aside class="kb-note"><p>${rich(a)}</p></aside>`;
    if (type === 'img') return `<figure class="kb-figure"><a class="zoom" href="${asset(a)}" data-group="article" data-caption="${esc(b || '')}"><img src="${asset(a)}" alt="${esc(app.title + ': ' + (b || ''))}" width="2400" height="1350" loading="lazy" decoding="async" /></a>${b ? `<figcaption>${rich(b)}</figcaption>` : ''}</figure>`;
    if (type === 'see') return `<div class="kb-see"><h2>Related</h2><ul>\n${a.filter(x => bySlug.has(x)).map(x => `            <li><a href="docs/${x}.html">${esc(bySlug.get(x).title)}</a></li>`).join('\n')}\n          </ul></div>`;
    throw new Error('docs-content.js: unknown block type ' + type);
  };
  // what the search on the docs home looks through: an article's title, summary, headings and terms
  const docWords = (article) => [article.title, article.summary]
    .concat(article.blocks.filter(([t]) => t === 'h').map(([, a]) => a))
    .concat(article.blocks.filter(([t]) => t === 'terms' || t === 'keys').flatMap(([, rows]) => rows.map(r => r[0] + ' ' + r[1])))
    .join(' ').replace(/[`\[\]{}]/g, '').toLowerCase();
  const groupOf = (article) => docs.groups.find(g => g.id === article.group);
  const docsNav = (current) => `
      <nav class="kb-nav" aria-label="Docs">
        <a class="kb-nav-home" href="docs.html">All docs</a>
${docs.groups.map(group => `        <h2>${esc(group.title)}</h2>
${docs.articles.filter(a => a.group === group.id).map(a => `        <a href="docs/${a.slug}.html"${a === current ? ' aria-current="page"' : ''}>${esc(a.title)}</a>`).join('\n')}`).join('\n')}
      </nav>`;

  // quick links in a rail beside the docs: the places people go next
  const docsRail = () => `
      <aside class="kb-rail" aria-label="Quick links">
        <h2>Quick links</h2>
        <a href="${repo}" rel="noopener">${GH_ICON}GitHub</a>
        <a href="${repo}/releases" rel="noopener"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>Releases</a>
        <a href="download.html"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/></svg>Download</a>
        <a href="changelog.html"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>Changelog</a>
        <a href="report.html"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 8v4"/><path d="M12 16h.01"/><circle cx="12" cy="12" r="10"/></svg>Report a problem</a>
        <h2>Popular</h2>
        <a href="docs/shortcuts.html">Shortcuts</a>
        <a href="docs/troubleshooting.html">Troubleshooting</a>
        <a href="docs/faq.html">FAQ</a>
      </aside>`;

  pages.docs = (page) => head(page, `Docs — ${app.title}`, `The ${app.title} knowledge base: ${docs.articles.length} short articles for beginners, from installing it to exporting a lighter model.`) + header(page) +
    pageHead('Docs', 'Everything, from the first download.', `${docs.articles.length} short articles, written for someone who has never opened a CAD file in a browser. Start at the top and read down, or search.`) + `
    <section class="wrap kb-layout">
     <div class="kb">
      <div class="kb-search">
        <input type="search" id="kbSearch" placeholder="Search the docs" aria-label="Search the docs" autocomplete="off" spellcheck="false" />
        <p class="kb-none" id="kbNone" hidden>Nothing matches. Try a single word, or <a href="${repo}/issues" rel="noopener">ask on GitHub</a>.</p>
      </div>
${docs.groups.map(group => `      <section class="kb-group" id="${esc(group.id)}">
        <div class="kb-group-head">
          <h2>${esc(group.title)}</h2>
          ${group.blurb ? `<p>${rich(group.blurb)}</p>` : ''}
        </div>
        <ol class="kb-list">
${docs.articles.filter(a => a.group === group.id).map(a => `          <li data-words="${esc(docWords(a))}"><a href="docs/${a.slug}.html"><strong>${esc(a.title)}</strong><span>${esc(a.summary)}</span></a></li>`).join('\n')}
        </ol>
      </section>`).join('\n')}
     </div>${docsRail()}
    </section>` + footer(page);

  // an article: the index of all of them beside it, the one before and after under it
  const articlePage = (article) => {
    const page = { key: 'article', under: 'docs', file: `docs/${article.slug}.html` };
    const at = docs.articles.indexOf(article), before = docs.articles[at - 1], after = docs.articles[at + 1];
    const html = head(page, `${article.title} — ${app.title} Docs`, article.summary) + header(page) + `
    <section class="wrap kb-page">${docsNav(article)}
      <article class="kb-article">
        <p class="kicker"><a href="docs.html">Docs</a><b>·</b><a href="docs.html#${esc(article.group)}">${esc(groupOf(article).title)}</a></p>
        <h1>${esc(article.title)}</h1>
        <p class="lead">${rich(article.summary)}</p>
        <div class="kb-body">
          ${article.blocks.map(docBlock).join('\n          ')}
        </div>
        <nav class="kb-turn" aria-label="More articles">
          ${before ? `<a class="is-before" href="docs/${before.slug}.html"><span>Before</span><strong>${esc(before.title)}</strong></a>` : '<span></span>'}
          ${after ? `<a class="is-after" href="docs/${after.slug}.html"><span>Next</span><strong>${esc(after.title)}</strong></a>` : '<span></span>'}
        </nav>
      </article>${docsRail()}
    </section>` + footer(page);
    // the page was written as if it stood beside the others; it stands one folder down
    return html.replace(/\b(href|src|poster|data-src)="(?!https?:|#|mailto:|data:)([^"]*)"/g, (_, attr, to) => `${attr}="../${to === './' ? '' : to}"`);
  };

  pages.changelog = (page) => head(page, `Changelog — ${app.title}`, `What changed in each version of ${app.title}, newest first. Latest: v${latest.version}.`) + header(page) +
    pageHead('Changelog', 'What changed.', 'Every release, with the fixes that went into it. The app’s own change log on GitHub has 150 fixes in it, and the ones that mattered most are here.') + `
    <section class="wrap">
      <ol class="log">${app.changelog.versions.map(entry => logEntry(entry, true)).join('')}
      </ol>
      ${app.changelog.link ? `<p class="log-more"><a class="more" href="${app.changelog.link}" rel="noopener">Every change, on GitHub</a></p>` : ''}
    </section>` + footer(page);

  pages.download = (page) => head(page, `Download — ${app.title}`, `Download ${app.title} ${version ? 'v' + version : ''} for ${platform.replace(/\s*·\s*/g, ' and ')}. Free and open source; it runs locally with Python and a browser.`) + header(page) + `
    <section class="wrap page-head is-get">
      <p class="kicker">Download</p>
      <h1>${esc(app.title)}${version ? ` <span>v${esc(version)}</span>` : ''}</h1>
      <p class="lead">A zip straight from GitHub. Free, open source, ${esc(licence)}. ${esc(platform.replace(/\s*·\s*/g, ' and '))}.</p>
      <div class="actions">
        <a class="btn is-primary is-large" href="${zip}" download rel="noopener">Download .zip</a>
        ${LITE_BTN}
        <a class="btn is-large" href="${repo}" rel="noopener">View on GitHub</a>
        <a class="more" href="changelog.html">What is new in v${esc(latest.version)}</a>
      </div>
    </section>

    <section class="band is-first">
      <div class="wrap">
        <div class="band-head">
          <p class="kicker">Get started</p>
          <h2>Unzip, start, drop a file.</h2>
        </div>
        <ol class="steps">
          <li><i>01</i><h3>Download and unzip</h3><p>Unpack it anywhere. No installer: everything lives in that folder.</p></li>
          <li><i>02</i><h3>Start it</h3><p>${esc(app.start.text)}</p></li>
          <li><i>03</i><h3>Drop a file</h3><p>${esc(app.steps[0][1])}</p></li>
        </ol>${commands(app.start.commands)}
        <p class="steps-note">From 0.22.0 the app updates itself in Settings › Updates, and keeps the old version. Older versions need one manual update first. <a href="${docLink(/stop-restart/)}">How updating works</a></p>
      </div>
    </section>

    <section class="band" id="online">
      <div class="wrap">
        <div class="band-head">
          <p class="kicker">Online or full app</p>
          <h2>Try it online. Download it for the rest.</h2>
        </div>
        <p class="steps-note">The online version is the same app running in your browser, with nothing uploaded. It opens GLB, glTF, FBX, OBJ, 3MF and STL and has the same tools. The full app adds what a browser cannot do.</p>
        <dl class="tokens">
          <div><dt>CAD files</dt><dd>STEP import, with parts, colours and CAD data.</dd></div>
          <div><dt>Claude</dt><dd>The connection that lets Claude work with the open scene.</dd></div>
          <div><dt>Folders</dt><dd>Open a folder, optimise many files in one go.</dd></div>
          <div><dt>Big models</dt><dd>Large assemblies, without the browser running out of memory.</dd></div>
          <div><dt>Your computer</dt><dd>Saved scenes, crash recovery, updates and offline use.</dd></div>
        </dl>
      </div>
    </section>

    <section class="band" id="versions">
      <div class="wrap split">
        <div class="split-head">
          <p class="kicker">Versions</p>
          <h2>The last three releases.</h2>
          <p class="split-note">Each is the exact code of that release, as a zip.</p>
        </div>
        <ol class="releases">
${releases.map(r => `          <li>
            <div class="rel-name"><strong>v${esc(r.version)}${relName(r)}</strong>${r.latest ? '<em>Latest</em>' : ''}${r.date ? `<span>${esc(r.date.split(' · ')[0])}</span>` : ''}</div>
            <div class="rel-actions"><a class="more" href="changelog.html#v${esc(r.version)}">What changed</a><a class="btn" href="${repo}/archive/refs/tags/v${esc(r.version)}.zip" download rel="noopener" aria-label="Download v${esc(r.version)} as a zip">Download .zip</a></div>
          </li>`).join('\n')}
        </ol>
      </div>
    </section>

    <section class="band">
      <div class="wrap split">
        <div class="split-head">
          <p class="kicker">Requirements</p>
          <h2>What it needs.</h2>
          <a class="more" href="${docLink(/troubleshoot/)}">Troubleshooting</a>
        </div>
        <dl class="table">
${site.requirements.map(([label, value]) => `          <div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('\n')}
        </dl>
      </div>
    </section>

    <section class="band">
      <div class="wrap split">
        <div class="split-head">
          <p class="kicker">Information</p>
          <h2>About this release.</h2>
        </div>
        <dl class="table">
${app.info.map(([label, value]) => `          <div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('\n')}
        </dl>
      </div>
    </section>` + footer(page);

  // The report page: a form that is put together in the browser (report.js). There is no server behind the site,
  // so it ends in a zip to attach, a text through the portfolio's form service, a GitHub issue, or an email.
  const reportKinds = [
    ['install', 'It will not install or start'],
    ['open', 'A file will not open or convert'],
    ['looks', 'The model looks wrong'],
    ['slow', 'It is slow, or freezes'],
    ['export', 'An export is wrong'],
    ['tool', 'A tool gives a wrong result'],
    ['crash', 'It crashed or shows an error'],
    ['other', 'Something else'],
  ];
  const rpField = (id, label, control, hint) => `
            <div class="rp-field">
              <label for="${id}">${label}</label>${control}${hint ? `
              <p class="rp-hint">${hint}</p>` : ''}
            </div>`;
  const rpInput = (id, attrs = '') => `<input id="${id}" type="text" autocomplete="off" spellcheck="false" ${attrs} />`;
  const rpArea = (id, rows, attrs = '') => `<textarea id="${id}" rows="${rows}" spellcheck="false" ${attrs}></textarea>`;
  const rpLog = (tab, label, hint, placeholder) => `
              <div class="rp-panel" role="tabpanel" id="rp-panel-${tab}" aria-labelledby="rp-tab-${tab}" data-tab="${tab}"${tab === 'conv' ? '' : ' hidden'}>
                <p class="rp-hint">${hint}</p>
                <textarea id="f-log-${tab}" class="mono" rows="9" spellcheck="false" placeholder="${placeholder}" aria-label="${label}"></textarea>
              </div>`;

  pages.report = (page) => head(page, `Report a problem — ${app.title}`, `Report a problem with ${app.title}. Describe it, paste the details and the log, add pictures and the file, and send it or download it as one zip.`) + header(page) + `
    <section class="wrap page-head">
      <p class="kicker">Report a problem</p>
      <h1>Tell us what went wrong.</h1>
      <p class="lead">Fill in what you can. The list on the right shows what is still missing, and what is missing depends on the kind of problem. Everything is put together here, in your browser: nothing leaves your computer until you press a send button, and your model never does unless you add it yourself.</p>
    </section>

    <section class="wrap rp" id="report">
      <noscript><aside class="kb-note"><p>This form needs JavaScript. Without it, you can <a href="${repo}/issues/new">open a GitHub issue</a> or write to <a href="mailto:luka.grcar@me.com">luka.grcar@me.com</a>, and say what you did, what you expected and what happened.</p></aside></noscript>
      <p class="rp-restored" id="rp-restored" hidden>Your unfinished report from earlier is back. Pictures and files are not kept between visits: add them again.</p>
      <div class="rp-grid">
        <form class="rp-form" id="rp-form" novalidate autocomplete="off">

          <section class="rp-card" aria-labelledby="rp-h1">
            <h2 id="rp-h1"><i>01</i>What kind of problem is it?</h2>
            <div class="rp-chips" role="radiogroup" aria-labelledby="rp-h1">
${reportKinds.map(([key, label]) => `              <label class="rp-chip"><input type="radio" name="cat" value="${key}" /><span>${esc(label)}</span></label>`).join('\n')}
            </div>
            <p class="rp-tip" id="rp-cat-tip" data-set="0">Pick the one that is closest. It decides what the list asks for.</p>
          </section>

          <section class="rp-card" aria-labelledby="rp-h2">
            <h2 id="rp-h2"><i>02</i>What happened?</h2>${rpField('f-title', 'A short title <b>needed</b>', rpInput('f-title', 'maxlength="120" placeholder="For example: Remove holes leaves one hole open on a bracket"'))}${rpField('f-where', 'Where in the app?', rpInput('f-where', 'maxlength="160" placeholder="The tool, the menu, the export format, or the window"'), 'Optional, but it saves a question.')}${rpField('f-steps', 'What did you do? <b>needed</b>', rpArea('f-steps', 5, 'placeholder="1. I opened a STEP file of 400 parts&#10;2. I pressed P to open Remove holes&#10;3. I pressed Enter"'), 'Step by step, as if you were telling someone who has never used the app.')}
            <div class="rp-two">${rpField('f-expected', 'What did you expect?', rpArea('f-expected', 3))}${rpField('f-actual', 'What happened instead?', rpArea('f-actual', 3, 'placeholder="The exact words of any message are the most useful part."'))}
            </div>
            <div class="rp-two">${rpField('f-often', 'How often does it happen?', '<select id="f-often"><option value="">I am not sure</option><option>Every time</option><option>Sometimes</option><option>Only once</option></select>')}${rpField('f-before', 'Did it work before?', '<select id="f-before"><option value="">I do not know</option><option>Yes, in an earlier version</option><option>No, it never worked</option></select>')}
            </div>
          </section>

          <section class="rp-card" aria-labelledby="rp-h3">
            <h2 id="rp-h3"><i>03</i>Your setup</h2>
            <p class="rp-lead">The quickest way: in ${esc(app.title)} press <kbd>Ctrl</kbd> <kbd>,</kbd> to open Settings, choose <span class="ui">About</span>, press <span class="ui">Copy details</span>, and paste below. The boxes under it fill in by themselves.</p>${rpField('f-details', 'Details copied from the app', rpArea('f-details', 5, 'class="mono" placeholder="MeshOptimiser details&#10;Version: …"'))}
            <div class="rp-detect"><button type="button" class="btn" id="rp-detect">Or fill in from this browser</button><span id="rp-detect-note" class="rp-hint">Use it on the computer where the problem happens. It only fills boxes that are empty.</span></div>
            <div class="rp-fields">${rpField('f-version', 'App version', rpInput('f-version', 'maxlength="24" placeholder="0.14.0"'), 'Settings, About')}${rpField('f-os', 'System', rpInput('f-os', 'maxlength="60" placeholder="Windows 11, macOS 14.5"'))}${rpField('f-browser', 'Browser', rpInput('f-browser', 'maxlength="60" placeholder="Chrome 130"'))}${rpField('f-renderer', 'Renderer', '<select id="f-renderer"><option value="">I do not know</option><option>WebGPU</option><option>WebGL2</option></select>', 'Settings, Performance')}${rpField('f-gpu', 'Graphics card', rpInput('f-gpu', 'maxlength="100" placeholder="NVIDIA GeForce RTX 3060"'))}${rpField('f-python', 'Python version', rpInput('f-python', 'maxlength="24" placeholder="3.12.7"'), 'Printed by the launcher')}${rpField('f-scene', 'Size of the scene', rpInput('f-scene', 'maxlength="80" placeholder="1,583 parts, 5.4 million triangles"'))}
            </div>
          </section>

          <section class="rp-card" aria-labelledby="rp-h4">
            <h2 id="rp-h4"><i>04</i>Logs and messages</h2>
            <p class="rp-lead">Paste text into the box, or drop a <code>.txt</code> or <code>.log</code> file below it. Keep long logs whole: the plain-text send cuts them short, the .zip keeps every word.</p>
            <div class="rp-tabs" role="tablist" aria-label="Which log">
              <button type="button" class="rp-tab" role="tab" id="rp-tab-conv" data-tab="conv" aria-controls="rp-panel-conv" aria-selected="true">Conversion log</button>
              <button type="button" class="rp-tab" role="tab" id="rp-tab-launch" data-tab="launch" aria-controls="rp-panel-launch" aria-selected="false" tabindex="-1">Launcher window</button>
              <button type="button" class="rp-tab" role="tab" id="rp-tab-console" data-tab="console" aria-controls="rp-panel-console" aria-selected="false" tabindex="-1">Browser console</button>
            </div>${rpLog('conv', 'Conversion log', 'When a STEP conversion fails, its progress card has a <span class="ui">Copy log</span> button.', 'Paste the conversion log here')}${rpLog('launch', 'Launcher window', 'The black window on Windows, the Terminal on a Mac. On Windows: right-click its title bar, choose <span class="ui">Edit</span>, then <span class="ui">Select All</span>, press <kbd>Enter</kbd>, and paste. On a Mac: select the text and press <kbd>Cmd</kbd> <kbd>C</kbd>.', 'Paste the text of the launcher window here')}${rpLog('console', 'Browser console', 'In the app, press <span class="ui">Console</span> at the bottom right and use its copy button.', 'Paste the console text here')}
            <label class="rp-drop is-slim" id="rp-drop-logs"><input type="file" accept=".txt,.log,text/*" multiple /><span>Drop a <code>.txt</code> or <code>.log</code> file here. It goes into the box of the tab that is open.</span></label>
          </section>

          <section class="rp-card" aria-labelledby="rp-h5">
            <h2 id="rp-h5"><i>05</i>Pictures and recordings <span class="rp-count" id="rp-shots-count"></span></h2>
            <label class="rp-drop" id="rp-drop-shots"><input type="file" accept="image/*,video/*" multiple /><strong>Drop pictures or a screen recording here</strong><span>or click to choose. You can also paste a screenshot with <kbd>Ctrl</kbd> <kbd>V</kbd>. Up to 50 MB each.</span></label>
            <ul class="rp-files is-shots" id="rp-shots"></ul>
          </section>

          <section class="rp-card" aria-labelledby="rp-h6">
            <h2 id="rp-h6"><i>06</i>The model</h2>
            <p class="rp-lead">A problem with a file is easiest to fix with the file. It is yours: it is only added if you add it here, and the <span class="ui">Send</span> button never carries it. Only the .zip does.</p>
            <div class="rp-chips" role="radiogroup" aria-labelledby="rp-h6">
              <label class="rp-chip"><input type="radio" name="model" value="attach" /><span>I can attach it</span></label>
              <label class="rp-chip"><input type="radio" name="model" value="link" /><span>I can share a link to it</span></label>
              <label class="rp-chip"><input type="radio" name="model" value="nofile" /><span>I cannot share it</span></label>
            </div>
            <div id="rp-model-attach" hidden>
              <label class="rp-drop" id="rp-drop-models"><input type="file" multiple /><strong>Drop the file here</strong><span>or click to choose. Up to 50 MB goes into the zip. A bigger file is listed with its name, size and fingerprint, so send it through a link.</span></label>
              <ul class="rp-files" id="rp-models"></ul>
            </div>
            <div id="rp-model-link" hidden>${rpField('f-modellink', 'Link to the file', '<input id="f-modellink" type="url" autocomplete="off" spellcheck="false" maxlength="300" placeholder="https://" />', 'A shared folder or a transfer link. Make sure it is open for at least two weeks.')}
            </div>
            <div id="rp-model-info" hidden>${rpField('f-modelinfo', 'About the file', rpArea('f-modelinfo', 3, 'maxlength="600" placeholder="Format and size, the program it came from, how many parts it has, anything unusual about it"'), 'When you cannot share the file, this is what makes up for it.')}
            </div>
          </section>

          <section class="rp-card" aria-labelledby="rp-h7">
            <h2 id="rp-h7"><i>07</i>How to reach you <span class="rp-count">optional</span></h2>
            <p class="rp-lead">Only used to answer this report. Without it there is no way to ask a question, so a report that needs one may wait.</p>
            <div class="rp-two">${rpField('f-name', 'Name', rpInput('f-name', 'maxlength="60" autocomplete="name"'))}${rpField('f-email', 'Email', '<input id="f-email" type="email" autocomplete="email" spellcheck="false" maxlength="120" />')}
            </div>
            <input type="text" id="f-botcheck" name="botcheck" class="rp-trap" tabindex="-1" autocomplete="off" aria-hidden="true" />
          </section>
        </form>

        <aside class="rp-rail" aria-label="What is still needed, and how to send it">
          <section class="rp-card">
            <h2>What we still need</h2>
            <p class="rp-meter"><span id="rp-meter">0 of 0 covered</span></p>
            <div class="rp-track" aria-hidden="true"><i id="rp-bar"></i></div>
            <ul class="rp-check" id="rp-check"></ul>
          </section>
          <section class="rp-card" aria-labelledby="rp-hs">
            <h2 id="rp-hs">Send it</h2>
            <p class="rp-ref">Your reference: <b id="rp-ref"></b></p>
            <label class="rp-consent"><input type="checkbox" id="f-consent" /><span>I have read what is below. It can contain what I typed, pasted and added, and nothing else.</span></label>
            <p class="rp-why" id="rp-why" role="status"></p>
            <div class="rp-send">
              <button type="button" class="btn is-primary is-large" data-act="send" disabled>Send the report</button>
              <p class="rp-note">The text only, privately, to the person who fixes it. No pictures and no files.</p>
              <button type="button" class="btn" data-act="download" disabled>Download everything as a .zip</button>
              <p class="rp-note">The text, logs, pictures and files in one file. Attach it to an email or an issue.</p>
              <div class="rp-row">
                <button type="button" class="btn" data-act="github" disabled>Open a GitHub issue</button>
                <button type="button" class="btn" data-act="email" disabled>Write an email</button>
                <button type="button" class="btn" data-act="copy" disabled>Copy as text</button>
              </div>
              <p class="rp-note">A GitHub issue is public. An email needs the .zip attached by you.</p>
            </div>
            <p class="rp-status" id="rp-status" role="status" aria-live="polite"></p>
            <aside class="rp-after" id="rp-after" hidden><p>Pictures and files travel only in the .zip. If you have not sent it yet, send it to <a href="mailto:luka.grcar@me.com">luka.grcar@me.com</a> or drag it into your GitHub issue, and mention the reference above.</p></aside>
            <details class="rp-preview" id="rp-preview"><summary>See exactly what the text will say</summary><pre id="rp-preview-text"></pre></details>
            <button type="button" class="rp-reset" id="rp-start-over">Start over</button>
          </section>
        </aside>
      </div>
    </section>` + footer(page).replace('</body>', `  <script defer src="report.js?v=${RP_V}"></script>\n</body>`);

  // the old one-page address forwards to the site
  const forward = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <!-- Generated by tools/build-app-site.js. ${esc(app.title)} has a site of its own; this address forwards to it. -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(app.title)}</title>
  <meta name="robots" content="noindex" />
  <link rel="canonical" href="${home}" />
  <meta http-equiv="refresh" content="0; url=${app.id}/" />
  <script>location.replace('${app.id}/' + location.hash);</script>
</head>
<body>
  <p><a href="${app.id}/">${esc(app.title)}</a></p>
</body>
</html>
`;

  return { pages, forward, articlePage };
}

// The addresses of an app's site, for the sitemap (tools/build-pages.js).
function docsFor(app) {
  const file = path.join(ROOT, app.site.path, 'docs-content.js');
  if (!fs.existsSync(file)) throw new Error(app.site.path + 'docs-content.js is missing');
  delete require.cache[require.resolve(file)];
  return require(file);
}
function urlsFor(app) {
  return PAGES.map(page => app.site.path + (page.file === 'index.html' ? '' : page.file.replace(/\.html$/, '')))
    .concat(docsFor(app).articles.map(article => app.site.path + 'docs/' + article.slug));
}

function build() {
  if (!global.window) global.window = {};
  require(path.join(ROOT, 'apps.js'));
  const apps = (global.window.labApps || []).filter(app => app.site);
  apps.forEach((app) => {
    const dir = path.join(ROOT, app.site.path);
    fs.mkdirSync(dir, { recursive: true });
    const docs = docsFor(app);
    const { pages, forward, articlePage } = siteFor(app, docs);
    PAGES.forEach(page => fs.writeFileSync(path.join(dir, page.file), pages[page.key](page)));
    const docsDir = path.join(dir, 'docs');
    fs.mkdirSync(docsDir, { recursive: true });
    const keep = new Set(docs.articles.map(article => article.slug + '.html').concat('index.html'));
    fs.readdirSync(docsDir).forEach((name) => { if (name.endsWith('.html') && !keep.has(name)) fs.unlinkSync(path.join(docsDir, name)); });   // article removed
    docs.articles.forEach(article => fs.writeFileSync(path.join(docsDir, article.slug + '.html'), articlePage(article)));
    // the folder's own address (docs/) forwards to the docs home (docs.html)
    fs.writeFileSync(path.join(docsDir, 'index.html'), `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <!-- Generated by tools/build-app-site.js. The docs home is ../docs.html; this address forwards to it. -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Docs — ${esc(app.title)}</title>
  <meta name="robots" content="noindex" />
  <link rel="canonical" href="${ORIGIN}${app.site.path}docs" />
  <meta http-equiv="refresh" content="0; url=../docs.html" />
  <script>location.replace('../docs.html' + location.hash);</script>
</head>
<body>
  <p><a href="../docs.html">Docs</a></p>
</body>
</html>
`);
    fs.writeFileSync(path.join(ROOT, 'apps', app.id + '.html'), forward);
    console.log(`Wrote ${PAGES.length} pages and ${docs.articles.length} docs articles to ${app.site.path}`);
  });
  return apps;
}

module.exports = { PAGES, urlsFor, build };
if (require.main === module) build();
