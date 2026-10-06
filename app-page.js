// ========== APP PAGE (apps/<id>.html) ==========
// Draws one app's page from the list in apps.js, laid out like a store's
// product page: icon and buttons, a strip of facts, previews, the
// description, what's new, and an information table. Look: apps.css.

(function initAppPage() {
  const root = document.getElementById('appPage');
  const app = (window.labApps || []).find(a => a.id === window.APP_PAGE);
  if (!root || !app) return;

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  };
  const link = (href, className, text) => {
    const a = el('a', className, text);
    Object.assign(a, { href, target: '_blank', rel: 'noopener noreferrer' });
    return a;
  };
  const section = (title, aside) => {
    const sec = el('section', 'app-section');
    const head = el('div', 'app-section-head');
    head.append(el('h2', '', title));
    if (aside) head.append(el('span', '', aside));
    sec.append(head);
    return sec;
  };

  // ---- header: icon, name, buttons ----
  const hero = el('header', 'app-hero');
  const text = el('div', 'app-hero-text');
  const actions = el('div', 'app-actions');
  if (app.url) actions.append(link(app.url, 'app-btn is-primary', 'Open app ↗'));
  if (app.repo) actions.append(link(app.repo, 'app-btn', 'GitHub ↗'));
  text.append(el('h1', 'app-title', app.title), el('p', 'app-subtitle', app.subtitle), actions);
  hero.append(window.labAppIcon(app), text);

  // ---- strip of facts ----
  const stats = el('dl', 'app-stats');
  (app.stats || []).forEach(([label, value]) => {
    const item = el('div');
    item.append(el('dt', '', label), el('dd', '', value));
    stats.append(item);
  });

  const back = el('a', 'app-back', '← Lab');
  back.href = 'lab.html';
  root.replaceChildren(back, hero, stats);

  // ---- previews ----
  if (app.shots && app.shots.length) {
    const sec = section('Preview');
    const strip = el('div', 'app-shots');
    app.shots.forEach(([src, caption]) => {
      const figure = el('figure');
      const img = el('img');
      Object.assign(img, { src, alt: `${app.title}: ${caption}`, loading: 'lazy', decoding: 'async' });
      figure.append(img, el('figcaption', '', caption));
      strip.append(figure);
    });
    sec.append(strip);
    root.append(sec);
  }

  // ---- description ----
  const about = section('About');
  (app.about || []).forEach(p => about.append(el('p', 'app-text', p)));
  root.append(about);

  if (app.features && app.features.length) {
    const sec = section('Features');
    const list = el('ul', 'app-features');
    app.features.forEach(([name, line]) => {
      const item = el('li');
      item.append(el('strong', '', name), el('span', '', line));
      list.append(item);
    });
    sec.append(list);
    root.append(sec);
  }

  if (app.whatsNew) {
    const sec = section("What's new", `Version ${app.whatsNew.version}`);
    sec.append(el('p', 'app-text', app.whatsNew.text));
    root.append(sec);
  }

  if (app.info && app.info.length) {
    const sec = section('Information');
    const table = el('dl', 'app-info');
    app.info.forEach(([label, value]) => {
      const row = el('div');
      row.append(el('dt', '', label), el('dd', '', value));
      table.append(row);
    });
    sec.append(table);
    root.append(sec);
  }
})();
