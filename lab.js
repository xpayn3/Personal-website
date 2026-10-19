// ========== LAB PAGE — the apps showcase ==========
// One big plate for each app in apps.js (window.labApps), in that order:
// cover picture, then its icon, name, what it is, a few numbers and where to
// open it. Adding an app to apps.js adds its plate here. The animation and
// graphics that used to live on this page are on Sketch (sketch.js).
// Look: showcase.css.

(function initLab() {
  const list = document.getElementById('scList');
  const apps = window.labApps || [];
  if (!list || !apps.length) return;

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  };
  // an app's page, or its own site when it has one (apps.js: site)
  const pageOf = app => (app.site ? (app.site.url || app.site.path) : `apps/${app.id}.html`);
  // an address on another site opens in a tab of its own
  const away = (a, url) => { if (/^https?:/.test(url)) { a.target = '_blank'; a.rel = 'noopener'; } };
  const link = (href, className, text) => { const a = el('a', className, text); a.href = href; away(a, href); return a; };

  const count = document.getElementById('scCount');
  if (count) count.textContent = `${apps.length} ${apps.length === 1 ? 'app' : 'apps'}`;

  apps.forEach((app, i) => {
    const plate = el('article', 'sc-app');
    plate.id = `app-${app.id}`;

    // cover picture: the whole thing is a link to the app's page
    const cover = link(pageOf(app), 'sc-cover');
    cover.setAttribute('aria-label', `${app.title}: ${app.subtitle}`);
    if (app.cover) {
      const img = el('img');
      Object.assign(img, { src: app.labCover || app.cover, alt: `${app.title}: the app's interface`, loading: i === 0 ? 'eager' : 'lazy', decoding: 'async' });
      cover.append(img);
    }
    cover.append(el('span', 'sc-cover-cta', 'View'));

    const body = el('div', 'sc-body');

    const id = el('div', 'sc-id');
    const icon = window.labAppIcon ? window.labAppIcon(app) : el('span');
    icon.style.setProperty('--icon', '56px');
    const title = el('h2', 'sc-title', app.title);
    if (app.stage) title.append(el('span', 'app-stage is-' + app.stage.toLowerCase(), app.stage));
    const idText = el('div', 'sc-id-text');
    idText.append(el('span', 'sc-num', String(i + 1).padStart(2, '0')), title);
    id.append(icon, idText);

    body.append(id, el('p', 'sc-sub', app.subtitle));
    if (app.pitch) body.append(el('p', 'sc-pitch', app.pitch));

    if (app.stats && app.stats.length) {
      const stats = el('dl', 'sc-stats');
      app.stats.slice(0, 4).forEach(([label, value]) => {
        const row = el('div');
        row.append(el('dt', '', label), el('dd', '', value));
        stats.append(row);
      });
      body.append(stats);
    }

    // actions: where it runs (or its site), its page, its code
    const actions = el('div', 'sc-actions');
    const open = app.url || (app.site && app.site.url);
    if (open) actions.append(link(open, 'sc-btn is-main', app.url ? 'Open the app' : 'Visit the site'));
    if (!app.site) actions.append(link(`apps/${app.id}.html`, 'sc-btn', 'Details'));
    if (app.repo) actions.append(link(app.repo, 'sc-btn', 'GitHub'));
    body.append(actions);

    plate.append(cover, body);
    list.append(plate);
  });

  // plates rise in the first time they scroll into view
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
    const seen = new IntersectionObserver((hits) => {
      hits.forEach((hit) => { if (hit.isIntersecting) { hit.target.classList.add('in-view'); seen.unobserve(hit.target); } });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
    list.querySelectorAll('.sc-app').forEach((plate) => { plate.classList.add('will-rise'); seen.observe(plate); });
  }
})();
