// ========== SHARED OVERLAY / LIGHTBOX / MOBILE LIST / SCROLL LOCK ==========
// Lifted out of script.js so both grid.html and index.html can use the same
// slide-up project overlay. Depends on projects.js (window.projects etc.)
// and GSAP + ScrollTrigger + Lenis CDN libs.

(function () {
  const isMobile = window.innerWidth < 768;

  // ---- Ensure overlay/lightbox/mobile-list DOM exists ----------------------
  // grid.html hard-codes the markup. index.html does not — inject if missing.
  function ensureMarkup() {
    if (!document.getElementById('overlay')) {
      const closeBtn = document.createElement('button');
      closeBtn.className = 'overlay-close';
      closeBtn.id = 'overlayClose';
      closeBtn.setAttribute('aria-label', 'Close');
      closeBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="1" y1="1" x2="17" y2="17"/><line x1="17" y1="1" x2="1" y2="17"/></svg>';
      document.body.appendChild(closeBtn);

      const ov = document.createElement('div');
      ov.className = 'overlay';
      ov.id = 'overlay';
      ov.innerHTML = '<div class="overlay-inner" id="overlayInner"></div>';
      document.body.appendChild(ov);
    }
    if (!document.getElementById('lightbox')) {
      const lb = document.createElement('div');
      lb.className = 'lightbox';
      lb.id = 'lightbox';
      lb.innerHTML = `
        <button class="lightbox-close" id="lightboxClose"><svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="1" y1="1" x2="17" y2="17"/><line x1="17" y1="1" x2="1" y2="17"/></svg></button>
        <div class="lightbox-content" id="lightboxContent"></div>
        <div class="lightbox-info" id="lightboxInfo"></div>
        <canvas class="lightbox-histogram" id="lightboxHistogram" width="200" height="80"></canvas>
        <div class="lightbox-bottom">
          <div class="lightbox-strip" id="lightboxStrip"></div>
          <div class="lightbox-controls">
            <button class="lb-ctrl-btn" id="lightboxPrev"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="15,4 7,12 15,20"/></svg></button>
            <span class="lightbox-counter" id="lightboxCounter"></span>
            <button class="lb-ctrl-btn" id="lightboxNext"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="9,4 17,12 9,20"/></svg></button>
          </div>
        </div>`;
      document.body.appendChild(lb);
    }
    if (!document.getElementById('mobileProjList')) {
      const mpl = document.createElement('div');
      mpl.className = 'mobile-proj-list';
      mpl.id = 'mobileProjList';
      mpl.innerHTML = `
        <div class="mobile-proj-bg" id="mobileProjBg"></div>
        <button class="mobile-proj-close" id="mobileProjClose"><svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="1" y1="1" x2="17" y2="17"/><line x1="17" y1="1" x2="1" y2="17"/></svg></button>
        <div class="mobile-proj-scroll" id="mobileProjScroll"></div>`;
      document.body.appendChild(mpl);
    }
  }
  ensureMarkup();

  const overlay = document.getElementById('overlay');
  const overlayInner = document.getElementById('overlayInner');
  const overlayClose = document.getElementById('overlayClose');
  const lightbox = document.getElementById('lightbox');
  const lightboxContent = document.getElementById('lightboxContent');
  const lightboxCounter = document.getElementById('lightboxCounter');
  const lightboxStrip = document.getElementById('lightboxStrip');
  const mobileProjList = document.getElementById('mobileProjList');
  const mobileProjScroll = document.getElementById('mobileProjScroll');
  const mobileProjClose = document.getElementById('mobileProjClose');
  const mobileProjBg = document.getElementById('mobileProjBg');

  function mediaTag(src, alt, fullRes) {
    if (src.endsWith('.webm') || src.endsWith('.mp4')) {
      const thumb = src.replace(/\.(webm|mp4)$/, '_thumb.webp');
      return `<video data-src="${src}" poster="${thumb}" muted loop playsinline preload="none"></video>`;
    }
    // NOTE: no loading="lazy" here. The overlay is a fixed container that
    // starts off-screen (top:100%) and slides up with its own Lenis scroll —
    // native lazy-loading misjudges visibility there, so below-the-fold images
    // never load on first open (they only appeared after a lightbox reflow).
    // These <img>s are created only when a project opens, so eager is fine.
    if (isMobile && !fullRes) {
      const mobileSrc = src.replace('Images/', 'Images/mobile/');
      return `<img src="${mobileSrc}" alt="${alt || ''}" decoding="async" />`;
    }
    return `<img src="${src}" alt="${alt || ''}" decoding="async" />`;
  }

  // ---- Scroll lock ---------------------------------------------------------
  let savedScrollY = 0;
  let scrollLockCount = 0;

  function lockScroll() {
    if (scrollLockCount === 0) {
      savedScrollY = window.scrollY;
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${savedScrollY}px`;
      document.body.style.width = '100%';
      document.body.classList.add('scroll-locked');
    }
    scrollLockCount++;
  }

  function unlockScroll() {
    scrollLockCount = Math.max(0, scrollLockCount - 1);
    if (scrollLockCount === 0) {
      const y = savedScrollY;
      // Remove overflow first so scrollTo works
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.classList.remove('scroll-locked');
      // Remove fixed positioning and restore scroll in one go
      document.body.style.cssText = '';
      window.scrollTo({ top: y, behavior: 'instant' });
    }
  }

  // iOS bfcache / navigation cleanup: if the page is restored from back-forward
  // cache while scroll was locked (overlay open), body stays position:fixed with
  // a negative top offset — touch hit-testing then registers above the visual
  // position, making the top items of bar dropdowns unclickable. Reset here.
  function resetStaleScrollLock() {
    if (document.body.classList.contains('scroll-locked') || document.body.style.position === 'fixed') {
      scrollLockCount = 0;
      document.documentElement.style.overflow = '';
      document.body.style.cssText = '';
      document.body.classList.remove('scroll-locked');
    }
  }
  window.addEventListener('pageshow', resetStaleScrollLock);
  document.addEventListener('DOMContentLoaded', resetStaleScrollLock);

  // iOS scroll leak prevention — block touchmove on non-scrollable areas,
  // prevent bounce at scroll boundaries
  let _touchStartY = 0;
  document.addEventListener('touchstart', (e) => {
    _touchStartY = e.touches[0].clientY;
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    if (scrollLockCount === 0) return;
    // the lightbox thumbnail strip scrolls sideways; let it
    if (e.target.closest && e.target.closest('.lightbox-strip')) return;

    // Find nearest scrollable ancestor
    let scrollable = null;
    let el = e.target;
    while (el && el !== document.body && el !== document.documentElement) {
      const style = getComputedStyle(el);
      const isScrollable = el.scrollHeight > el.clientHeight + 1 &&
        (style.overflowY === 'auto' || style.overflowY === 'scroll');
      if (isScrollable) { scrollable = el; break; }
      el = el.parentElement;
    }

    // No scrollable parent — block
    if (!scrollable) { e.preventDefault(); return; }

    // At scroll boundary — block to prevent rubber-band leak
    const dy = _touchStartY - e.touches[0].clientY;
    const st = scrollable.scrollTop;
    const atTop = st <= 0 && dy < 0;
    const atBottom = st + scrollable.clientHeight >= scrollable.scrollHeight - 1 && dy > 0;
    if (atTop || atBottom) e.preventDefault();
  }, { passive: false });

  // ---- Overlay parallax ---------------------------------------------------
  let overlayLenis = null;
  let overlayScrollTriggers = [];
  let overlayTickerFn = null;
  let currentOverlayObs = null;

  // A project is shown as the page itself, not as a panel scrolling inside
  // the page: the rest of the page is hidden (body.project-page) and the
  // window does the scrolling. That is what lets phone browsers draw the
  // content under their translucent bars, exactly as on the home page, and
  // it needs no scroll lock. (Only the Lab view still uses the fixed panel.)
  let pageMode = false;
  let pageScrollY = 0;        // where the host page was, to return to on close

  const viewH = () => (pageMode ? window.innerHeight : overlay.clientHeight);
  const viewTop = () => (pageMode ? 0 : overlay.getBoundingClientRect().top);
  const viewScrollY = () => (pageMode ? window.scrollY : overlay.scrollTop);
  const viewRange = () => (pageMode ? document.documentElement.scrollHeight : overlay.scrollHeight) - viewH();
  const viewScroller = () => (pageMode ? window : overlay);
  const viewRoot = () => (pageMode ? null : overlay);     // IntersectionObserver root
  // the smooth-scroll instance driving the current view, if any
  const viewLenis = () => overlayLenis || (pageMode && window.pageLenis) || null;
  function jumpTo(y) {
    if (!pageMode) { overlay.scrollTop = y; return; }
    if (window.pageLenis) window.pageLenis.scrollTo(y, { immediate: true, force: true });
    window.scrollTo({ top: y, behavior: 'instant' });
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const coarsePointer = window.matchMedia('(pointer: coarse)');

  // One smooth-scroll feel for the whole site: the home page's own scroll
  // (index.html) and the project view both use these settings.
  const SMOOTH_SCROLL = { lerp: 0.14, wheelMultiplier: 1.25, smoothWheel: true };
  window.SMOOTH_SCROLL = SMOOTH_SCROLL;

  // Browser UI tint (address bar / status bar areas on phones).
  let themeColorBefore;
  function setThemeColor(color) {
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      document.head.appendChild(meta);
    }
    if (themeColorBefore === undefined) themeColorBefore = meta.content || '';
    meta.content = color;
  }
  function restoreThemeColor() {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta && themeColorBefore !== undefined) {
      if (themeColorBefore) meta.content = themeColorBefore; else meta.remove();
    }
    themeColorBefore = undefined;
  }
  const pageBg = () => getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#ffffff';

  function initOverlayParallax() {
    // Smooth scroll and parallax are desktop enhancements. Skip them when the
    // CDN libraries didn't load, the visitor prefers reduced motion, or the
    // device is touch-first: phones scroll natively, which is both smoother
    // and much cheaper than scrubbing a transform on every picture.
    const libs = typeof Lenis !== 'undefined' && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
    const enhance = libs && !reducedMotion.matches && !coarsePointer.matches;
    overlay.classList.toggle('no-parallax', !enhance);   // drops the parallax over-scale (overlay.css)
    if (!enhance) return;

    // Page mode scrolls the window: reuse the page's own smooth scroll when
    // it has one (home), otherwise run one for as long as the project is open.
    if (!pageMode) overlayLenis = new Lenis(Object.assign({ wrapper: overlay, content: overlayInner }, SMOOTH_SCROLL));
    else if (!window.pageLenis) overlayLenis = new Lenis(SMOOTH_SCROLL);

    if (overlayLenis) {
      overlayLenis.on('scroll', ScrollTrigger.update);
      overlayTickerFn = (time) => { if (overlayLenis) overlayLenis.raf(time * 1000); };
      gsap.ticker.add(overlayTickerFn);
      gsap.ticker.lagSmoothing(0);
    }

    // Parallax: images drift up inside their cropped container
    gsap.registerPlugin(ScrollTrigger);
    overlayInner.querySelectorAll('.media-cell img, .media-cell video').forEach(el => {
      const st = gsap.fromTo(el, {
        yPercent: -5,
      }, {
        yPercent: 5,
        ease: 'none',
        scrollTrigger: {
          trigger: el.parentElement,
          scroller: pageMode ? window : overlay,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        }
      });
      overlayScrollTriggers.push(st.scrollTrigger || ScrollTrigger.getAll().pop());
    });
  }

  function cleanupOverlayParallax() {
    if (overlayTickerFn) {
      gsap.ticker.remove(overlayTickerFn);
      overlayTickerFn = null;
    }
    if (overlayLenis) {
      overlayLenis.destroy();
      overlayLenis = null;
    }
    overlayScrollTriggers.forEach(st => st && st.kill());
    overlayScrollTriggers = [];
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.getAll().forEach(st => st.kill());
  }

  // Teardown callbacks registered by whatever view is currently in the
  // overlay (scroll listeners, observers). Run on every open and close.
  const viewCleanups = [];

  function cleanupOverlay() {
    cleanupOverlayParallax();
    viewCleanups.splice(0).forEach(fn => fn());
    // Disconnect old observer
    if (currentOverlayObs) {
      currentOverlayObs.disconnect();
      currentOverlayObs = null;
    }
    // Pause and destroy all videos
    overlayInner.querySelectorAll('video').forEach(vid => {
      vid.pause();
      vid.removeAttribute('src');
    });
    overlayInner.innerHTML = '';
  }

  // ---- Project view --------------------------------------------------------
  // intro (counter · title · fact sheet) → hero → labelled rows (brief /
  // about / tools / gallery) with a stacking section index → next project.
  // Styles: "PROJECT VIEW" in overlay.css.

  const TOOL_ICONS = {
    'Cinema 4D': 'Images/tools/Cinema4D-Logo-Icon-Small.png',
    'Redshift': 'Images/tools/Redshift-Logo-Icon-Small.png',
    'AfterEffects': 'Images/tools/after-effects-1.svg',
    'Photoshop': 'Images/tools/adobe-photoshop.svg',
    'InDesign': 'Images/tools/adobe-indesign-cc-icon.svg',
    'Illustrator': 'Images/tools/adobe-illustrator-cc-3.svg',
    'Houdini': 'Images/tools/Houdini3D_icon.png',
    'ZBrush': 'Images/tools/ZBrush-new-logo.jpg 1.png',
    'Substance 3D': 'Images/tools/substance-3d-painter-1.svg',
  };
  // Gallery rhythm: column spans (of 12) per row, cycled.
  const GALLERY_ROWS = [[12], [7, 5], [5, 7], [12], [4, 4, 4], [6, 6]];

  const isVideo = src => /\.(webm|mp4)$/i.test(src);
  const posterOf = src => (isVideo(src) ? src.replace(/\.(webm|mp4)$/i, '_thumb.webp') : src);
  const pad2 = n => String(n).padStart(2, '0');
  const metaLine = p => [(p.category || []).join(', '), p.year].filter(Boolean).join(' · ');

  // Gallery media downloads only as it nears the viewport (see lazy observer
  // in wireProjectView). Cells have fixed aspect ratios, so nothing shifts
  // when it arrives.
  function lazyMedia(src) {
    return isVideo(src)
      ? `<video data-src="${src}" poster="${posterOf(src)}" muted loop playsinline preload="none"></video>`
      : `<img data-src="${src}" alt="" decoding="async" />`;
  }

  function galleryHTML(media) {
    let html = '<div class="proj-media-grid pv-grid">';
    for (let i = 0, r = 0; i < media.length; r++) {
      let row = GALLERY_ROWS[r % GALLERY_ROWS.length];
      const left = media.length - i;
      if (left < row.length) row = left === 2 ? [6, 6] : [12];
      for (const span of row) {
        html += `<div class="media-cell pv-reveal span-${span}">${lazyMedia(media[i++])}</div>`;
      }
    }
    return html + '</div>';
  }

  function projectViewHTML(projId) {
    const projects = window.projects;
    const proj = projects[projId];
    const ids = Object.keys(projects).filter(id => id !== 'lab');
    const pos = ids.indexOf(projId);
    const nextId = ids[(pos + 1) % ids.length];
    const next = projects[nextId];

    // each title word sits in a clipping box and rises into it (.pv-word)
    const title = proj.name.split(/\s+/).map((w, i) =>
      `<span class="pv-word"><span style="--i:${i}">${w}</span></span>`).join(' ');

    const facts = [
      ['Client', proj.client], ['Year', proj.year], ['With', proj.collab], ['Location', proj.location],
      ['Theme', proj.theme], ['Type', proj.type], ['Award', proj.award],
    ].filter(f => f[1]).map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');

    // Labelled rows. Each becomes a sticky label + a content cell on one
    // shared grid, which is what lets the labels pile up (see .pv-body).
    const rows = [];
    if (proj.brief) rows.push(['Brief', `<p class="pv-statement">${proj.brief}</p>`]);
    if ((proj.desc && proj.desc.length) || proj.link) {
      const paras = (proj.desc || []).map(t => `<p>${t}</p>`).join('');
      const link = proj.link
        ? `<p><a href="${proj.link}" target="_blank" rel="noopener noreferrer">${proj.link} ↗</a></p>` : '';
      rows.push(['About', `<div class="pv-text">${paras}${link}</div>`]);
    }
    if (proj.tools && proj.tools.length) {
      const chips = proj.tools.map(t =>
        `<span>${TOOL_ICONS[t] ? `<img src="${TOOL_ICONS[t]}" alt="" class="tool-icon" />` : ''}${t}</span>`).join('');
      rows.push(['Tools', `<div class="pv-tools">${chips}</div>`]);
    }
    if (proj.images.length > 1) rows.push(['Gallery', galleryHTML(proj.images.slice(1))]);

    const body = rows.map(([label, content], i) =>
      `<h2 class="pv-label" style="--r:${i + 1}"><button type="button" class="pv-jump"><i>${pad2(i + 1)}</i>${label}</button></h2>` +
      `<div class="pv-cell" data-row="${label.toLowerCase()}" style="--r:${i + 1}">${content}</div>`).join('');

    const html = `
      <article class="pv">
        <header class="pv-intro">
          <div class="pv-kicker"><span>Project ${pad2(pos + 1)} / ${pad2(ids.length)}</span><span>${(proj.category || []).join(' · ')}</span></div>
          <h1 class="pv-title">${title}</h1>
          ${facts ? `<dl class="pv-facts">${facts}</dl>` : ''}
          <div class="pv-foot" aria-hidden="true"><span>Luka Grčar</span><span>Scroll down</span></div>
        </header>

        <div class="media-cell pv-hero pv-reveal">${mediaTag(proj.images[0], proj.name, true)}</div>

        <div class="pv-body" style="--n:${rows.length}">
          ${body}
          <div class="pv-progress" aria-hidden="true"><i></i><span>0%</span></div>
        </div>

        <a class="pv-next" href="#project=${nextId}">
          <span class="pv-label">Next project</span>
          <span class="pv-next-card">
            <span class="pv-next-thumb"><img src="${posterOf(next.images[0])}" alt="" loading="lazy" /></span>
            <span class="pv-next-text">
              <span class="pv-next-name">${next.name}</span>
              <span class="pv-next-meta">${metaLine(next)}</span>
            </span>
            <span class="pv-next-arrow" aria-hidden="true">→</span>
          </span>
        </a>
        <div class="pv-colophon">
          <span>&copy; ${proj.year || new Date().getFullYear()} Luka Grčar. All rights reserved. All work shown is original and may not be reproduced without permission.</span>
          <button type="button" class="pv-top">Back to top ↑</button>
        </div>
      </article>`;
    return { html, nextId };
  }

  function wireProjectView(nextId) {
    const scrollToY = (y, duration) => {
      const lenis = viewLenis();
      if (lenis) lenis.scrollTo(y, { duration });
      else viewScroller().scrollTo({ top: y, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    };

    overlayInner.querySelector('.pv-next').addEventListener('click', (e) => {
      e.preventDefault();
      openProject(nextId, { replace: true });
    });
    overlayInner.querySelector('.pv-top').addEventListener('click', () => scrollToY(0, 1.2));

    // The stacked labels are a section index: click one to glide to its row.
    const labels = overlayInner.querySelectorAll('.pv-body > .pv-label');
    const cells = overlayInner.querySelectorAll('.pv-body > .pv-cell');
    const gallery = overlayInner.querySelector('.pv-cell[data-row="gallery"]');
    const progress = overlayInner.querySelector('.pv-progress');
    const progressPct = progress.querySelector('span');
    const cellTop = c => c.getBoundingClientRect().top - viewTop();
    labels.forEach((label, i) => {
      label.querySelector('.pv-jump').addEventListener('click', () => {
        scrollToY(viewScrollY() + cellTop(cells[i]) + 1, 1.1);
      });
    });

    // One scroll handler keeps three things in step with the scroll position:
    // the active label, the progress read, and gallery (dark) mode. Scroll
    // events are already delivered at most once per frame.
    const onScroll = () => {
      const h = viewH();
      let active = 0;
      cells.forEach((c, i) => { if (cellTop(c) <= h * 0.45) active = i; });
      labels.forEach((l, i) => l.classList.toggle('is-active', i === active));

      const range = viewRange();
      const p = range > 0 ? Math.min(1, Math.max(0, viewScrollY() / range)) : 0;
      progress.style.setProperty('--p', p.toFixed(4));
      progressPct.textContent = Math.round(p * 100) + '%';

      // lights down once the gallery has risen past the lower part of the screen
      const dark = !!gallery && cellTop(gallery) <= h * 0.6;
      if (dark !== document.body.classList.contains('project-dark')) {
        document.body.classList.toggle('project-dark', dark);
        setThemeColor(dark ? '#000000' : pageBg());
      }
    };
    const scroller = viewScroller();
    scroller.addEventListener('scroll', onScroll, { passive: true });
    viewCleanups.push(() => scroller.removeEventListener('scroll', onScroll));
    onScroll();

    // Media rises into place the first time it scrolls into view.
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        revealObs.unobserve(entry.target);
      });
    }, { root: viewRoot(), threshold: 0.08 });
    overlayInner.querySelectorAll('.pv-reveal').forEach(el => revealObs.observe(el));

    // Gallery images start downloading about a screen before they are needed.
    const lazyObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.src = entry.target.dataset.src;
        lazyObs.unobserve(entry.target);
      });
    }, { root: viewRoot(), rootMargin: '100% 0px' });
    overlayInner.querySelectorAll('img[data-src]').forEach(img => lazyObs.observe(img));

    viewCleanups.push(() => { revealObs.disconnect(); lazyObs.disconnect(); });
  }

  // Lab keeps its simple dark-hero gallery layout.
  function labViewHTML(proj) {
    let html = `<div class="proj-hero-dark"><div class="proj-hero-content">`;
    html += `<h1 class="proj-title">${proj.name}</h1>`;
    if (proj.desc) proj.desc.forEach(p => html += `<p class="proj-desc">${p}</p>`);
    if (proj.tools) {
      html += '<div class="proj-tools">';
      proj.tools.forEach(t => html += `<span class="proj-tag">${t}</span>`);
      html += '</div>';
    }
    html += '</div></div>';
    html += '<div class="proj-white-sheet"><div class="proj-gallery">';
    for (const row of proj.layout) {
      html += `<div class="gallery-row row-${row.cols}">`;
      for (const idx of row.imgs) {
        if (proj.images[idx]) html += mediaTag(proj.images[idx], proj.name, true);
      }
      html += '</div>';
    }
    html += '</div></div>';
    html += '<div class="lab-splash" id="labSplash">L<span>a</span>B</div>';
    return html;
  }

  // ---- Deep links + back button --------------------------------------------
  // An open project lives in the URL as #project=<id>, so it can be shared
  // and the browser's back button closes it instead of leaving the site.
  const projectInHash = () => {
    const m = location.hash.match(/project=([\w-]+)/);
    return m ? m[1] : null;
  };
  function recordOpenInHistory(projId, replace) {
    const current = projectInHash();
    if (current === projId) return;                 // came from the URL or back/forward
    // moving between projects replaces the entry, so one "back" always closes
    const push = !current && !replace;
    const pushed = push || !!(history.state && history.state.pushed);
    history[push ? 'pushState' : 'replaceState']({ project: projId, pushed }, '', '#project=' + projId);
  }
  function recordCloseInHistory(y) {
    if (!projectInHash()) return;
    if (history.state && history.state.pushed) {
      pendingScrollY = y;              // re-applied after the browser's own scroll restoration
      history.back();                  // popstate has nothing left to close
    }
    else history.replaceState(null, '', location.pathname + location.search);
  }

  // ---- Open / close ---------------------------------------------------------
  let currentProjectId = null;
  let pageMeta = null;        // the host page's title / og tags, restored on close
  let focusBeforeOpen = null;
  const metaTag = prop => document.querySelector(`meta[property="og:${prop}"]`);
  const setMeta = (prop, value) => { const el = metaTag(prop); if (el) el.content = value; };

  function openProject(projId, opts) {
    const proj = window.projects && window.projects[projId];
    if (!proj) return;
    const wasOpen = overlay.classList.contains('open');
    const isLab = projId === 'lab';

    // Must happen before the page is scroll-locked: the browser remembers the
    // page's scroll position for the history entry at this moment, and
    // restores it when "back" closes the project.
    recordOpenInHistory(projId, opts && opts.replace);

    cleanupOverlay();

    if (!wasOpen) {
      focusBeforeOpen = document.activeElement;
      pageMeta = {
        title: document.title,
        ogTitle: (metaTag('title') || {}).content,
        ogDesc: (metaTag('description') || {}).content,
        ogImg: (metaTag('image') || {}).content,
      };
      if (isLab) lockScroll();
      else pageScrollY = window.scrollY;
    }
    pageMode = !isLab;
    document.body.classList.toggle('project-page', pageMode);   // hides the rest of the page (overlay.css)
    document.body.classList.remove('project-dark');
    overlay.setAttribute('role', pageMode ? 'region' : 'dialog');
    overlay.setAttribute('aria-modal', String(!pageMode));

    if (isLab) {
      overlayInner.innerHTML = labViewHTML(proj);
      setTimeout(() => {
        const splash = document.getElementById('labSplash');
        if (splash) splash.classList.add('fade-out');
      }, 2500);
    } else {
      const view = projectViewHTML(projId);
      overlayInner.innerHTML = view.html;
      wireProjectView(view.nextId);
    }

    // Videos load when they near the viewport, play while visible, pause after.
    currentOverlayObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const vid = entry.target;
        if (entry.isIntersecting) {
          if (!vid.src && vid.dataset.src) vid.src = vid.dataset.src;
          vid.play().catch(() => {});
        } else {
          vid.pause();
        }
      });
    }, { root: viewRoot(), rootMargin: '200px' });
    overlayInner.querySelectorAll('video[data-src]').forEach(vid => currentOverlayObs.observe(vid));

    // Every piece of media opens the lightbox at its own index.
    lightboxItems = proj.images;
    overlayInner.querySelectorAll('.media-cell img, .media-cell video, .proj-gallery img, .proj-gallery video').forEach((el) => {
      const idx = proj.images.indexOf(el.getAttribute('src') || el.dataset.src);
      el.addEventListener('click', () => { lbIsLab = isLab; openLightbox(idx >= 0 ? idx : 0); });
    });

    overlay.classList.add('open');
    overlay.setAttribute('aria-label', proj.name);
    overlayClose.classList.add('visible');
    document.body.classList.add('project-open');
    jumpTo(0);
    overlayClose.focus({ preventScroll: true });
    setThemeColor(isLab ? '#111111' : pageBg());

    // Page meta for sharing
    document.title = proj.name + ' — Luka Grčar';
    setMeta('title', proj.name + ' — Luka Grčar');
    setMeta('description', (proj.desc && proj.desc[0]) ? proj.desc[0].substring(0, 160) : 'Portfolio of Luka Grčar');
    setMeta('image', 'https://lukagrcar.com/' + posterOf(proj.images[0]));

    currentProjectId = projId;

    // Init smooth scroll + parallax after DOM settles
    requestAnimationFrame(() => initOverlayParallax());
  }

  // `fromHistory` is true only when the browser's back/forward triggered the
  // close (the URL has already changed then). Used as an event handler too,
  // in which case the argument is an event and counts as false.
  function closeOverlay(fromHistory) {
    if (!overlay.classList.contains('open')) return;
    overlayClose.style.display = 'none';
    cleanupOverlay();
    overlay.classList.remove('open');
    overlayClose.classList.remove('visible');
    const y = pageMode ? pageScrollY : savedScrollY;   // where the host page was
    pageMode = false;
    document.body.classList.remove('project-open', 'project-page', 'project-dark');
    currentProjectId = null;
    // Always fully clear the body-fixed state. If `scrollLockCount` drifted
    // (e.g. lightbox/mobile-list flows nested on top) a counter decrement is
    // not enough — the body would stay `position: fixed; top: -Ypx` and
    // touch-event coordinates would register offset, making the bar
    // dropdowns' lower items unreachable.
    scrollLockCount = 0;
    document.documentElement.style.overflow = '';
    document.body.classList.remove('scroll-locked');
    document.body.style.cssText = '';
    if (window.pageLenis) window.pageLenis.scrollTo(y, { immediate: true, force: true });
    window.scrollTo({ top: y, behavior: 'instant' });

    if (pageMeta) {
      document.title = pageMeta.title;
      if (pageMeta.ogTitle != null) setMeta('title', pageMeta.ogTitle);
      if (pageMeta.ogDesc != null) setMeta('description', pageMeta.ogDesc);
      if (pageMeta.ogImg != null) setMeta('image', pageMeta.ogImg);
      pageMeta = null;
    }
    restoreThemeColor();
    if (focusBeforeOpen && focusBeforeOpen.focus) focusBeforeOpen.focus({ preventScroll: true });
    focusBeforeOpen = null;
    setTimeout(() => { overlayClose.style.display = ''; }, 500);

    if (fromHistory !== true) recordCloseInHistory(y);
  }

  // Back / forward: follow the URL.
  let pendingScrollY = null;
  window.addEventListener('popstate', () => {
    if (pendingScrollY != null) {
      const y = pendingScrollY;
      pendingScrollY = null;
      requestAnimationFrame(() => window.scrollTo({ top: y, behavior: 'instant' }));
    }
    const id = projectInHash();
    if (id && window.projects && window.projects[id]) {
      if (id !== currentProjectId) openProject(id);
    } else {
      closeOverlay(true);
    }
  });
  // Deep link: <page>#project=<id> opens that project on load.
  if (projectInHash()) setTimeout(() => openProject(projectInHash()), 100);

  overlayClose.addEventListener('click', closeOverlay);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeOverlay();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (lightbox.classList.contains('open')) closeLightbox();
      else if (mobileProjList.classList.contains('open')) closeMobileList();
      else if (overlay.classList.contains('open')) closeOverlay();
    }
  });

  // ========== MOBILE PROJECT LIST ==========
  function openMobileProjectList() {
    const projects = window.projects;
    const activeFilters = window.activeFilters || { project: null };
    mobileProjScroll.innerHTML = '';

    // "All" option
    const allItem = document.createElement('div');
    allItem.className = 'mobile-proj-item' + (activeFilters.project === null ? ' active' : '');
    allItem.innerHTML = '<div class="mobile-proj-item-inner"><div class="mobile-proj-name">All Projects</div></div>';
    allItem.addEventListener('click', () => {
      if (typeof window.setFilter === 'function') window.setFilter('project', null);
      const af = window.activeFilters;
      if (af) af.project = null;
      if (typeof window.applyFilters === 'function') window.applyFilters();
      closeMobileList();
    });
    mobileProjScroll.appendChild(allItem);

    const projIds = Object.keys(projects);
    projIds.forEach(id => {
      const proj = projects[id];
      const item = document.createElement('div');
      item.className = 'mobile-proj-item';
      item.dataset.projId = id;
      if (activeFilters.project === id) item.classList.add('active');

      const inner = document.createElement('div');
      inner.className = 'mobile-proj-item-inner';

      const name = document.createElement('div');
      name.className = 'mobile-proj-name';
      name.textContent = proj.name;
      inner.appendChild(name);

      if (proj.year) {
        const year = document.createElement('div');
        year.className = 'mobile-proj-year';
        year.textContent = proj.year;
        inner.appendChild(year);
      }

      item.appendChild(inner);
      item.addEventListener('click', () => {
        if (typeof window.setFilter === 'function') window.setFilter('project', id);
        closeMobileList();
      });

      mobileProjScroll.appendChild(item);
    });

    // Add spacers top/bottom so first/last can center
    const topSpacer = document.createElement('div');
    topSpacer.className = 'mobile-proj-spacer';
    mobileProjScroll.prepend(topSpacer);
    const bottomSpacer = document.createElement('div');
    bottomSpacer.className = 'mobile-proj-spacer';
    mobileProjScroll.appendChild(bottomSpacer);

    mobileProjList.classList.add('open');
    lockScroll();

    // Scroll to active item
    requestAnimationFrame(() => {
      const active = mobileProjScroll.querySelector('.active');
      if (active) active.scrollIntoView({ block: 'center', behavior: 'instant' });
      updateCenterItem();
    });
  }

  // Single scroll listener for project picker
  let pickerTick = false;
  mobileProjScroll.addEventListener('scroll', () => {
    if (!pickerTick) {
      requestAnimationFrame(() => {
        updateCenterItem();
        pickerTick = false;
      });
      pickerTick = true;
    }
  }, { passive: true });

  let currentBgProjId = null;

  function updateCenterItem() {
    const projects = window.projects;
    const items = mobileProjScroll.querySelectorAll('.mobile-proj-item');
    const scrollRect = mobileProjScroll.getBoundingClientRect();
    const center = scrollRect.top + scrollRect.height / 2;
    let closest = null;
    let closestDist = Infinity;

    items.forEach(item => {
      const rect = item.getBoundingClientRect();
      const itemCenter = rect.top + rect.height / 2;
      const dist = Math.abs(itemCenter - center);
      item.classList.remove('center');
      if (dist < closestDist) {
        closestDist = dist;
        closest = item;
      }
    });

    if (closest) {
      closest.classList.add('center');
      const projId = closest.dataset.projId;
      if (projId && projId !== currentBgProjId && projects[projId]) {
        currentBgProjId = projId;
        const proj = projects[projId];
        const firstSrc = proj.images[0];
        const isVid = firstSrc.endsWith('.webm') || firstSrc.endsWith('.mp4');
        const src = isVid ? firstSrc.replace(/\.(webm|mp4)$/, '_thumb.webp') : firstSrc;
        const mobileSrcFinal = isMobile ? src.replace('Images/', 'Images/mobile/') : src;
        mobileProjBg.innerHTML = `<img src="${mobileSrcFinal}" alt="" />`;
        mobileProjBg.classList.add('visible');
      } else if (!projId) {
        mobileProjBg.classList.remove('visible');
        currentBgProjId = null;
      }
    }
  }

  function closeMobileList() {
    mobileProjList.classList.remove('open');
    unlockScroll();
  }

  mobileProjClose.addEventListener('click', closeMobileList);

  // ========== LIGHTBOX ==========
  let lightboxItems = [];
  let lightboxIndex = 0;
  let lbFrameRAF = null;
  let lbDirection = 'init';
  let lbIsLab = false;

  function drawHistogram(source, canvas) {
    try {
      const ctx = canvas.getContext('2d');
      const w = canvas.width, h = canvas.height;

      // Sample source to small canvas
      const tmp = document.createElement('canvas');
      tmp.width = 100; tmp.height = 100;
      const tctx = tmp.getContext('2d', { willReadFrequently: true });
      tctx.drawImage(source, 0, 0, 100, 100);
      const data = tctx.getImageData(0, 0, 100, 100).data;

      // Build RGB histograms
      const rHist = new Uint32Array(256);
      const gHist = new Uint32Array(256);
      const bHist = new Uint32Array(256);

      for (let i = 0; i < data.length; i += 4) {
        rHist[data[i]]++;
        gHist[data[i + 1]]++;
        bHist[data[i + 2]]++;
      }

      // Find max for scaling
      let max = 1;
      for (let i = 0; i < 256; i++) {
        max = Math.max(max, rHist[i], gHist[i], bHist[i]);
      }

      // Draw
      ctx.clearRect(0, 0, w, h);
      const barW = w / 256;

      // Draw each channel
      function drawChannel(hist, color) {
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let i = 0; i < 256; i++) {
          const x = i * barW;
          const barH = (hist[i] / max) * h;
          ctx.lineTo(x, h - barH);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
      }

      ctx.globalCompositeOperation = 'screen';
      drawChannel(rHist, 'rgba(255,60,60,0.6)');
      drawChannel(gHist, 'rgba(60,255,60,0.6)');
      drawChannel(bHist, 'rgba(60,60,255,0.6)');
      ctx.globalCompositeOperation = 'source-over';
    } catch (e) {
      // canvas tainted — skip
    }
  }

  function buildLightboxStrip() {
    lightboxStrip.innerHTML = '';
    lightboxItems.forEach((src, i) => {
      const isVid = src.endsWith('.webm') || src.endsWith('.mp4');
      const thumbSrc = isVid ? src.replace(/\.(webm|mp4)$/, '_thumb.webp') : src;
      const item = document.createElement('div');
      item.className = 'lightbox-strip-item' + (i === lightboxIndex ? ' active' : '') + (isVid ? ' is-film' : '');
      item.innerHTML = `<img src="${thumbSrc}" alt="" />`;
      item.addEventListener('click', () => {
        lbDirection = i > lightboxIndex ? 'right' : 'left';
        lightboxIndex = i;
        renderLightbox();
        updateStripActive();
      });
      lightboxStrip.appendChild(item);
    });
  }

  function updateStripActive() {
    const items = lightboxStrip.querySelectorAll('.lightbox-strip-item');
    items.forEach((item, i) => {
      item.classList.toggle('active', i === lightboxIndex);
    });
    // while a finger is scrubbing the strip, don't pull it back to centre
    const active = lightboxStrip.querySelector('.active');
    if (active && !stripScrubbing) active.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }

  // ---- Strip scrubbing (touch) ----------------------------------------------
  // Like the Photos app on a phone: swipe the thumbnail strip and whichever
  // thumbnail sits under its centre becomes the picture on screen. Momentum
  // after the finger lifts keeps scrubbing; when it settles the strip snaps
  // the current thumbnail to the centre.
  let stripScrubbing = false;
  let stripTouching = false;
  let stripIdleTimer = 0;
  let stripRenderedAt = 0;

  lightboxStrip.addEventListener('touchstart', () => {
    stripScrubbing = stripTouching = true;
    clearTimeout(stripIdleTimer);
  }, { passive: true });
  const stripTouchEnd = () => {
    stripTouching = false;
    clearTimeout(stripIdleTimer);
    stripIdleTimer = setTimeout(settleStrip, 160);
  };
  lightboxStrip.addEventListener('touchend', stripTouchEnd, { passive: true });
  lightboxStrip.addEventListener('touchcancel', stripTouchEnd, { passive: true });

  function settleStrip() {
    if (stripTouching) return;
    stripScrubbing = false;
    renderLightbox();          // full render of where we landed (also re-centres)
  }

  lightboxStrip.addEventListener('scroll', () => {
    if (!stripScrubbing) return;
    const box = lightboxStrip.getBoundingClientRect();
    const mid = box.left + box.width / 2;
    let best = lightboxIndex, bestDist = Infinity;
    lightboxStrip.querySelectorAll('.lightbox-strip-item').forEach((item, i) => {
      const r = item.getBoundingClientRect();
      const dist = Math.abs(r.left + r.width / 2 - mid);
      if (dist < bestDist) { bestDist = dist; best = i; }
    });
    if (best !== lightboxIndex) {
      lightboxIndex = best;
      lbDirection = 'init';   // no slide animation while scrubbing
      // swapping the big picture is the costly part: at most ~10 times a second
      const now = performance.now();
      if (now - stripRenderedAt > 90) { stripRenderedAt = now; renderLightbox(); }
      else updateStripActive();
    }
    clearTimeout(stripIdleTimer);
    stripIdleTimer = setTimeout(settleStrip, 160);
  }, { passive: true });

  function openLightbox(index) {
    lightboxIndex = index;
    lbDirection = 'init';
    buildLightboxStrip();
    renderLightbox();
    lightbox.classList.add('open');
    lockScroll();
  }

  function closeLightbox() {
    const vid = lightboxContent.querySelector('video');
    if (vid) { vid.pause(); vid.removeAttribute('src'); }
    lightbox.classList.remove('open');
    lightboxContent.innerHTML = '';
    if (lbFrameRAF) cancelAnimationFrame(lbFrameRAF);
    lbFrameRAF = null;
    // the Lab panel keeps the page locked itself; otherwise release it
    if (pageMode || !overlay.classList.contains('open')) {
      unlockScroll();
    }
  }

  function renderLightbox() {
    // Pause any playing video before switching
    const oldVid = lightboxContent.querySelector('video');
    if (oldVid) { oldVid.pause(); oldVid.removeAttribute('src'); }

    // Bounds check
    if (lightboxIndex < 0) lightboxIndex = 0;
    if (lightboxIndex >= lightboxItems.length) lightboxIndex = lightboxItems.length - 1;

    const src = lightboxItems[lightboxIndex];
    const isVid = src.endsWith('.webm') || src.endsWith('.mp4');
    lightboxContent.className = 'lightbox-content slide-' + lbDirection;
    if (isVid) {
      lightboxContent.innerHTML = `<video src="${src}" autoplay muted loop playsinline></video>`;
    } else {
      lightboxContent.innerHTML = `<img src="${src}" alt="" />`;
    }
    lightboxCounter.textContent = `${lightboxIndex + 1} / ${lightboxItems.length}`;

    updateStripActive();

    // File info + histogram — only for Lab
    const info = document.getElementById('lightboxInfo');
    const histCanvas = document.getElementById('lightboxHistogram');
    if (lbFrameRAF) cancelAnimationFrame(lbFrameRAF);

    if (!lbIsLab) {
      info.style.display = 'none';
      histCanvas.style.display = 'none';
      return;
    }

    info.style.display = '';
    histCanvas.style.display = '';
    const filename = src.split('/').pop();
    const ext = filename.split('.').pop().toUpperCase();
    const folder = src.split('/').slice(-2, -1)[0] || '';
    const isVidFile = ext === 'WEBM' || ext === 'MP4';
    info.innerHTML = `${filename}<br>${ext} ${isVidFile ? '· VIDEO' : '· IMAGE'}<br>${folder}`;

    if (isVidFile) {
      const vid = lightboxContent.querySelector('video');
      if (vid) {
        const fps = 24;
        function updateFrameCount() {
          const current = Math.floor(vid.currentTime * fps);
          const total = Math.floor((vid.duration || 0) * fps);
          info.innerHTML = `${filename}<br>${ext} · VIDEO<br>${folder}<br>F ${current} / ${total}`;
          lbFrameRAF = requestAnimationFrame(updateFrameCount);
        }
        vid.addEventListener('loadeddata', updateFrameCount, { once: true });
        if (vid.readyState >= 2) updateFrameCount();
      }
    }

    if (!isVidFile) {
      const imgEl = lightboxContent.querySelector('img');
      if (imgEl) {
        const drawHist = () => drawHistogram(imgEl, histCanvas);
        if (imgEl.complete) drawHist();
        else imgEl.addEventListener('load', drawHist, { once: true });
      }
    } else {
      const vid = lightboxContent.querySelector('video');
      if (vid) {
        vid.addEventListener('loadeddata', () => drawHistogram(vid, histCanvas), { once: true });
      }
    }
  }

  document.getElementById('lightboxClose').addEventListener('click', closeLightbox);

  // Swipe in lightbox — reactive drag down to close
  let lbTouchX = 0, lbTouchY = 0, lbDragging = false, lbDragY = 0;

  // "Swipe down to close" hint behind the content
  const lbSwipeHint = document.createElement('div');
  lbSwipeHint.className = 'lb-swipe-hint';
  lbSwipeHint.innerHTML = '<span>↓</span> Swipe to close';
  lightbox.appendChild(lbSwipeHint);

  lightboxContent.addEventListener('touchstart', (e) => {
    lbTouchX = e.touches[0].clientX;
    lbTouchY = e.touches[0].clientY;
    lbDragging = true;
    lbDragY = 0;
    lightboxContent.style.transition = 'none';
  }, { passive: true });

  lightboxContent.addEventListener('touchmove', (e) => {
    if (!lbDragging) return;
    const dy = e.touches[0].clientY - lbTouchY;
    const dx = e.touches[0].clientX - lbTouchX;
    // Only track vertical drag downward
    if (dy > 0 && Math.abs(dy) > Math.abs(dx)) {
      lbDragY = dy;
      const progress = Math.min(dy / 200, 1);
      const scale = 1 - progress * 0.1;
      lightboxContent.style.transform = `translateY(${dy}px) scale(${scale})`;
      lightboxContent.style.opacity = 1 - progress * 0.3;
      lbSwipeHint.style.opacity = progress;
    }
  }, { passive: true });

  lightboxContent.addEventListener('touchend', (e) => {
    if (!lbDragging) return;
    lbDragging = false;
    const diffX = lbTouchX - e.changedTouches[0].clientX;

    if (lbDragY > 100) {
      // Commit close — animate out
      lightboxContent.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
      lightboxContent.style.transform = 'translateY(100vh) scale(0.8)';
      lightboxContent.style.opacity = '0';
      lbSwipeHint.style.opacity = '0';
      setTimeout(() => {
        closeLightbox();
        lightboxContent.style.transform = '';
        lightboxContent.style.opacity = '';
        lightboxContent.style.transition = '';
      }, 300);
      return;
    }

    // Snap back
    lightboxContent.style.transition = 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease';
    lightboxContent.style.transform = '';
    lightboxContent.style.opacity = '';
    lbSwipeHint.style.opacity = '0';
    setTimeout(() => { lightboxContent.style.transition = ''; }, 300);

    // Horizontal swipe for prev/next (only if no vertical drag)
    if (lbDragY < 20 && Math.abs(diffX) > 50) {
      if (diffX > 0) { lbDirection = 'right'; lightboxIndex = (lightboxIndex + 1) % lightboxItems.length; }
      else { lbDirection = 'left'; lightboxIndex = (lightboxIndex - 1 + lightboxItems.length) % lightboxItems.length; }
      renderLightbox();
    }
    lbDragY = 0;
  }, { passive: true });
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Mouse wheel navigation in lightbox
  lightbox.addEventListener('wheel', (e) => {
    if (!lightbox.classList.contains('open')) return;
    e.preventDefault();
    if (e.deltaY > 0) { lbDirection = 'right'; lightboxIndex = (lightboxIndex + 1) % lightboxItems.length; }
    else { lbDirection = 'left'; lightboxIndex = (lightboxIndex - 1 + lightboxItems.length) % lightboxItems.length; }
    renderLightbox();
  }, { passive: false });

  document.getElementById('lightboxPrev').addEventListener('click', () => {
    lbDirection = 'left';
    lightboxIndex = (lightboxIndex - 1 + lightboxItems.length) % lightboxItems.length;
    renderLightbox();
  });

  document.getElementById('lightboxNext').addEventListener('click', () => {
    lbDirection = 'right';
    lightboxIndex = (lightboxIndex + 1) % lightboxItems.length;
    renderLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'ArrowRight') { lbDirection = 'right'; lightboxIndex = (lightboxIndex + 1) % lightboxItems.length; renderLightbox(); }
    if (e.key === 'ArrowLeft') { lbDirection = 'left'; lightboxIndex = (lightboxIndex - 1 + lightboxItems.length) % lightboxItems.length; renderLightbox(); }
  });

  // ---- Expose API ---------------------------------------------------------
  window.openProject = openProject;
  window.closeOverlay = closeOverlay;
  window.openLightbox = openLightbox;
  window.closeLightbox = closeLightbox;
  window.openMobileProjectList = openMobileProjectList;
  window.setLightboxItems = function (items, isLab) {
    lightboxItems = items || [];
    lbIsLab = !!isLab;
  };
  window._overlayLockScroll = lockScroll;
  window._overlayUnlockScroll = unlockScroll;
})();
