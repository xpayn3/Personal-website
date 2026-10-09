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
const CSS_V = 76;
const RP_V = 2;           // report.js
const JS_V = 26;

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
const DEMO_BTN = '<a class="btn is-large btn-demo" href="demo/index.html" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 4.5v15l12-7.5Z"/></svg>Try the demo</a>';
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
  <meta name="theme-color" content="#101010" />
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
${PAGES.filter(p => p.nav !== false).map(p => `        <a href="${p.file}"${p.key === page.key || p.key === page.under ? ' aria-current="page"' : ''}>${p.label}${p.soon && site.claude ? '<em class="nav-soon">Soon</em>' : ''}</a>`).join('\n')}
        <a class="nav-out" href="${repo}" rel="noopener">${GH_ICON}GitHub</a>
      </nav>
      <a class="btn is-primary bar-get" href="download.html"${page.key === 'download' ? ' aria-current="page"' : ''}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11"/><path d="m7 11 5 5 5-5"/><path d="M5 20h14"/></svg>Download</a>
      <button class="bar-menu" id="menu" type="button" aria-expanded="false" aria-controls="nav" aria-label="Menu"><span></span><span></span></button>
    </div>
  </header>
  <main id="main">`;

  const getBand = `
    <section class="band get">
      <div class="wrap get-in">
        <div>
          <h2>Run it on your own machine.</h2>
          <p>Free and open source under the ${esc(licence)} licence. ${esc(platform.replace(/\s*·\s*/g, ' and '))}; your files never leave the computer.</p>
        </div>
        <div class="actions">
          <a class="btn is-primary is-large" href="download.html">Download ${version ? 'v' + esc(version) : ''}</a>
          ${DEMO_BTN}
          <a class="btn is-large" href="${repo}" rel="noopener">View on GitHub</a>
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

  // hairline drawings for the three steps on the home page (strokes only, in the page's own colours)
  const STEP_ART = [
    `<svg viewBox="0 0 320 160" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect class="f" x="28" y="20" width="264" height="120" rx="8" stroke-dasharray="3 5"/>
      <path class="o" d="M138 36h44l22 22v66a2 2 0 0 1-2 2h-64a2 2 0 0 1-2-2V38a2 2 0 0 1 2-2Z"/>
      <path class="o" d="M182 36v22h22"/>
      <text x="160" y="100" text-anchor="middle" class="t a">.STEP</text>
      <path class="f" d="M160 6v13m-5-5 5 5 5-5"/>
    </svg>`,
    `<svg viewBox="0 0 320 160" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <g class="o"><circle cx="46" cy="50" r="7"/><circle cx="72" cy="50" r="7"/><circle cx="98" cy="50" r="7"/><circle cx="46" cy="80" r="7"/><circle cx="72" cy="80" r="7"/><circle cx="98" cy="80" r="7"/><circle cx="46" cy="110" r="7"/><circle cx="72" cy="110" r="7"/><circle cx="98" cy="110" r="7"/></g>
      <g class="f"><path d="M107 50 196 80M107 80h89M107 110 196 80"/></g>
      <circle class="a" cx="236" cy="80" r="26"/>
      <path class="a" d="m236 64 14 8v16l-14 8-14-8V72Z"/>
      <circle class="a" cx="236" cy="80" r="5"/>
      <text x="236" y="130" text-anchor="middle" class="t">1 mesh + 9 positions</text>
    </svg>`,
    `<svg viewBox="0 0 320 160" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect class="f" x="28" y="16" width="264" height="128" rx="8"/>
      <path class="f" d="M28 38h264"/>
      <circle class="f" cx="43" cy="27" r="3"/><circle class="f" cx="55" cy="27" r="3"/><circle class="f" cx="67" cy="27" r="3"/>
      <path class="a" d="M160 54 193 73v38l-33 19-33-19V73Z"/>
      <path class="a" d="m127 73 33 19 33-19M160 92v38"/>
      <text x="44" y="132" class="t">.GLB</text>
    </svg>`
  ];

  const pageHead = (kicker, title, lead) => `
    <section class="wrap page-head">
      <p class="kicker">${esc(kicker)}</p>
      <h1>${esc(title)}</h1>
      ${lead ? `<p class="lead">${esc(lead)}</p>` : ''}
    </section>`;

  // a picture that opens in the lightbox; `group` ties the pictures of one set together
  const shot = ([src, caption], group, eager) =>
    `<figure><a class="zoom" href="${asset(src)}" data-group="${group}" data-caption="${esc(caption)}"><img src="${asset(src)}" alt="${esc(app.title + ': ' + caption)}" width="2400" height="1350"${eager ? '' : ' loading="lazy"'} decoding="async" /></a><figcaption>${esc(caption)}</figcaption></figure>`;

  const clipCards = () => (app.clips || []).map(([name, line, src, doc], i) => `
        <figure class="clip">
          <video muted loop playsinline preload="none" disablepictureinpicture poster="${asset(src.replace(/\.(webm|mp4)$/, '_thumb.webp'))}" data-src="${asset(src)}" aria-label="${esc(app.title + ': ' + name)}" width="592" height="370"></video>
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
            <strong>v${esc(entry.version)}</strong>${entry.latest ? '<em>Latest</em>' : entry.next ? '<em>Next</em>' : ''}${entry.date ? `<span>${esc(entry.date)}</span>` : ''}${entry.fixes ? `<span>${entry.fixes} ${entry.fixes === 1 ? 'fix' : 'fixes'}</span>` : ''}
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
              <b>${fmtN(v)}</b><i></i><span>${esc(n)}</span>${cls ? '' : '<em>−' + pct(t0, v) + '%</em>'}
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
  const SOON = (c, large) => `<span class="tag-soon${large ? ' is-large' : ''}">${esc(c.badge)}</span>`;
  const claudeBand = () => {
    const c = site.claude;
    if (!c) return '';
    const [src, caption] = c.control.shots[0];
    return `
    <section class="band cl-band" id="claude">
      <div class="wrap cl-band-in">
        <div class="cl-band-copy">
          <p class="kicker">${esc(c.band.kicker)}<b>·</b>${SOON(c, true)}</p>
          <h2>${esc(c.band.title)}</h2>
          <p class="lead">${esc(c.band.line)}</p>
          <ul class="cl-say">
${c.band.prompts.map(p => `            <li>${esc(p)}</li>`).join('\n')}
          </ul>
          <div class="actions"><a class="btn is-large" href="claude.html">See how it works</a></div>
        </div>
        <figure class="cl-band-art">
          <a class="zoom" href="${asset(src)}" data-group="claude" data-caption="${esc(caption)}"><img src="${asset(src)}" alt="${esc(app.title + ': ' + caption)}" width="2400" height="1350" loading="lazy" decoding="async" /></a>
          <span class="soon-ribbon">${esc(c.badge)}</span>
          <figcaption>${esc(caption)}</figcaption>
        </figure>
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

  pages.home = (page) => head(page, `${app.title} — ${app.subtitle}`, site.lead) + header(page) + `
    <section class="wrap hero">
      <p class="kicker">${[version && 'v' + version, app.stage, licence, platform.replace(/\s*·\s*/g, ' and ')].filter(Boolean).map(esc).join('<b>·</b>')}</p>
      <h1>${esc(app.subtitle)}</h1>
      <p class="lead">${esc(site.lead)}</p>
      <div class="actions">
        <a class="btn is-primary is-large" href="download.html">Download</a>
        ${DEMO_BTN}
        <a class="btn is-large" href="${repo}" rel="noopener">View on GitHub</a>
        <a class="more" href="docs.html">Read the docs</a>
      </div>
    </section>

    <section class="band">
      <div class="wrap">
        <dl class="figures">
${app.highlights.map(([figure, line]) => `          <div><dt>${esc(figure)}</dt><dd>${esc(line)}</dd></div>`).join('\n')}
        </dl>
      </div>
    </section>

${popHero()}

    <section class="band">
      <div class="wrap split">
        <div class="split-head">
          <p class="kicker">Why</p>
          <h2>${esc(app.about[0])}</h2>
        </div>
        <div class="split-body">
${app.about.slice(1).map(p => `          <p>${esc(p)}</p>`).join('\n')}
          <table class="collapse">
            <caption>What the pipeline collapses</caption>
${site.collapse.map(([from, to], i, all) => `            <tr${i === all.length - 1 ? ' class="is-total"' : ''}><th scope="row">${esc(from)}</th><td aria-hidden="true">→</td><td>${esc(to)}</td></tr>`).join('\n')}
          </table>
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
        <div class="clips">${clipCards()}
        </div>
      </div>
    </section>

    <section class="band">
      <div class="wrap">
        <div class="band-head">
          <p class="kicker">How it works</p>
          <h2>Three steps to a lighter model.</h2>
        </div>
        <ol class="steps is-visual">
${app.steps.map(([name, line], i) => `          <li>${STEP_ART[i] ? `<div class="st-fig">${STEP_ART[i]}</div>` : ''}<i>${pad2(i + 1)}</i><h3>${esc(name)}</h3><p>${esc(line)}</p></li>`).join('\n')}
        </ol>
      </div>
    </section>

    <section class="band">
      <div class="wrap">
        <div class="band-head">
          <p class="kicker">A closer look</p>
          <h2>Built for assemblies with thousands of parts.</h2>
        </div>
        <div class="spots">${spotRows(app.spotlights.slice(0, 3), 'spots')}
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
      <div class="wrap">
        <div class="band-head">
          <p class="kicker">Screenshots</p>
          <h2>The whole app, one screen at a time.</h2>
        </div>
      </div>
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
          <h2>v${esc(latest.version)}</h2>
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
    <div class="soon-banner" role="note"><div class="wrap soon-banner-in"><strong>${esc(c.badge)}</strong><span>${esc(c.soon)}</span></div></div>
    <section class="wrap page-head">
      <p class="kicker">${esc(c.kicker)}<b>·</b>${SOON(c, true)}</p>
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

  pages.features = (page) => head(page, `Features — ${app.title}`, `Everything ${app.title} does: the STEP to GLB pipeline, the WebGPU viewer, mesh tools, hierarchy editing and export.`) + header(page) +
    pageHead('Features', 'A free, private viewer and optimiser for complex CAD and 3D files.', '') + `
    <section class="band is-first">
      <div class="strip" data-strip>
${app.spotlights.map(([name, line, image], i) => `        <figure><a class="zoom" href="${asset(image)}" data-group="spots" data-caption="${esc(name)}"><img src="${asset(image)}" alt="${esc(app.title + ': ' + name)}" width="2400" height="1350"${i < 2 ? '' : ' loading="lazy"'} decoding="async" /></a><figcaption><i>${pad2(i + 1)}</i><strong>${esc(name)}</strong><span>${esc(line)}</span></figcaption></figure>`).join('\n')}
      </div>
      <div class="dots" aria-hidden="true"></div>
    </section>
${savingsBand()}
${app.featureGroups.map((group, gi) => `
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
    </section>`).join('')}` + footer(page);


  // ---- docs: a knowledge base (docs-content.js) ----
  // Text in an article may hold: `code`, [[Ctrl + K]] for keys, {{Fill holes}}
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
      <p class="lead">The current code as a zip, straight from GitHub. Free, open source, ${esc(licence)} licence. ${esc(platform.replace(/\s*·\s*/g, ' and '))}.</p>
      <div class="actions">
        <a class="btn is-primary is-large" href="${zip}" download rel="noopener">Download .zip</a>
        ${DEMO_BTN}
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
          <li><i>01</i><h3>Download and unzip</h3><p>Unpack the folder anywhere. There is no installer: everything, its Python environment included, lives in that folder.</p></li>
          <li><i>02</i><h3>Start it</h3><p>${esc(app.start.text)}</p></li>
          <li><i>03</i><h3>Drop a file</h3><p>${esc(app.steps[0][1])}</p></li>
        </ol>${commands(app.start.commands)}
      </div>
    </section>

    <section class="band" id="versions">
      <div class="wrap split">
        <div class="split-head">
          <p class="kicker">Versions</p>
          <h2>The last three releases.</h2>
          <p class="split-note">Need an older one? Each is the exact code of that release, as a zip.</p>
        </div>
        <ol class="releases">
${releases.map(r => `          <li>
            <div class="rel-name"><strong>v${esc(r.version)}</strong>${r.latest ? '<em>Latest</em>' : ''}${r.date ? `<span>${esc(r.date.split(' · ')[0])}</span>` : ''}</div>
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
            <h2 id="rp-h2"><i>02</i>What happened?</h2>${rpField('f-title', 'A short title <b>needed</b>', rpInput('f-title', 'maxlength="120" placeholder="For example: Fill holes leaves one hole open on a bracket"'))}${rpField('f-where', 'Where in the app?', rpInput('f-where', 'maxlength="160" placeholder="The tool, the menu, the export format, or the window"'), 'Optional, but it saves a question.')}${rpField('f-steps', 'What did you do? <b>needed</b>', rpArea('f-steps', 5, 'placeholder="1. I opened a STEP file of 400 parts&#10;2. I pressed P to open Fill holes&#10;3. I pressed Enter"'), 'Step by step, as if you were telling someone who has never used the app.')}
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
