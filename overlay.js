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
    if (isMobile && !fullRes) {
      const mobileSrc = src.replace('Images/', 'Images/mobile/');
      return `<img src="${mobileSrc}" alt="${alt || ''}" loading="lazy" decoding="async" />`;
    }
    return `<img src="${src}" alt="${alt || ''}" loading="lazy" decoding="async" />`;
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

  function initOverlayParallax() {
    // Lenis smooth scroll on the overlay container
    overlayLenis = new Lenis({
      wrapper: overlay,
      content: overlayInner,
      lerp: 0.07,
      smoothWheel: true,
    });

    overlayLenis.on('scroll', ScrollTrigger.update);
    overlayTickerFn = (time) => { if (overlayLenis) overlayLenis.raf(time * 1000); };
    gsap.ticker.add(overlayTickerFn);
    gsap.ticker.lagSmoothing(0);

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
          scroller: overlay,
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
    ScrollTrigger.getAll().forEach(st => st.kill());
  }

  function cleanupOverlay() {
    cleanupOverlayParallax();
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

  const loremPool = [
    'The creative process began with extensive research into the brand\'s visual language, exploring how motion and form could communicate the core message.',
    'Every detail was carefully considered — from color grading to timing — ensuring each frame contributed to a cohesive narrative.',
    'The project pushed the boundaries of what\'s possible with real-time rendering, combining procedural techniques with hand-crafted animation.',
    'Working closely with the client, we iterated through multiple visual directions before arriving at a concept that felt both fresh and authentic.',
    'Typography and motion were treated as equal partners in the design, each reinforcing the other to create a unified visual experience.',
    'The final deliverables included a full suite of animated assets optimized for social media, web, and large-format display.',
  ];

  function openProject(projId) {
    const projects = window.projects;
    const proj = projects[projId];
    if (!proj) return;

    cleanupOverlay();

    const isLab = projId === 'lab';

    if (isLab) {
      // Lab keeps simple gallery layout
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
      overlayInner.innerHTML = html;
      setTimeout(() => {
        const splash = document.getElementById('labSplash');
        if (splash) splash.classList.add('fade-out');
      }, 2500);
    } else {
      // Hero — fullscreen background
      const heroSrc = proj.images[0];
      const isHeroVid = heroSrc.endsWith('.webm') || heroSrc.endsWith('.mp4');
      let html = `<div class="proj-hero-bg">`;
      if (isHeroVid && !isMobile) {
        html += `<video data-src="${heroSrc}" muted loop playsinline preload="none" class="proj-hero-bg-media"></video>`;
      } else {
        const thumbSrc = isHeroVid ? heroSrc.replace(/\.(webm|mp4)$/, '_thumb.webp') : heroSrc;
        html += `<img src="${thumbSrc}" class="proj-hero-bg-media" alt="${proj.name}" />`;
      }
      html += '</div>';

      // White sheet — title, meta, description, images, tools at bottom
      html += '<div class="proj-white-sheet">';

      // Header: thumbnail on left, title + meta on right
      const thumbSrcHeader = heroSrc.endsWith('.webm') || heroSrc.endsWith('.mp4')
        ? heroSrc.replace(/\.(webm|mp4)$/, '_thumb.webp')
        : heroSrc;
      html += '<div class="proj-header">';
      html += `<img src="${thumbSrcHeader}" alt="${proj.name}" class="proj-header-thumb" />`;
      html += '<div class="proj-header-info">';
      html += `<h1 class="proj-title-white">${proj.name}</h1>`;
      html += '<div class="proj-meta-white">';
      if (proj.client) html += `<span>${proj.client}</span>`;
      if (proj.year) html += `<span>${proj.year}</span>`;
      if (proj.collab) html += `<span>${proj.collab}</span>`;
      if (proj.location) html += `<span>${proj.location}</span>`;
      if (proj.theme) html += `<span>${proj.theme}</span>`;
      if (proj.type) html += `<span>${proj.type}</span>`;
      if (proj.award) html += `<span>${proj.award}</span>`;
      html += '</div>';
      html += '</div></div>';

      const descTexts = proj.desc && proj.desc.length > 0 ? proj.desc : [loremPool[0], loremPool[1]];
      html += '<div class="proj-intro">';
      if (proj.brief) {
        html += '<div class="proj-brief"><span class="proj-brief-label">Brief</span><p>' + proj.brief + '</p></div>';
      }
      descTexts.forEach(p => html += `<p>${p}</p>`);
      if (proj.link) {
        html += `<p><a href="${proj.link}" target="_blank" rel="noopener noreferrer">${proj.link} ↗</a></p>`;
      }
      html += '</div>';

      // Tools — right after description
      const toolIcons = {
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
      if (proj.tools) {
        html += '<div class="proj-tools-inline"><span class="proj-tools-label">Tools</span><div class="proj-tools-list">';
        proj.tools.forEach(t => {
          const iconSrc = toolIcons[t];
          const icon = iconSrc ? `<img src="${iconSrc}" alt="${t}" class="tool-icon" />` : '';
          html += `<span>${icon}${t}</span>`;
        });
        html += '</div></div>';
      }

      // Dynamic 2-column grid layout with white space
      const remaining = proj.images.slice(1);
      html += '<div class="proj-media-grid">';
      // Pattern: left, right, left, full, right, left, right, full...
      const pattern = ['left', 'right', 'left', 'full', 'right', 'left', 'right', 'full'];
      for (let i = 0; i < remaining.length; i++) {
        const pos = pattern[i % pattern.length];
        html += `<div class="media-cell ${pos}">${mediaTag(remaining[i], proj.name, true)}</div>`;
      }
      html += '</div>';

      html += `<div class="proj-copyright">&copy; ${proj.year || new Date().getFullYear()} Luka Grčar. All rights reserved. All work shown is original and may not be reproduced without permission.</div>`;

      html += '</div>';
      overlayInner.innerHTML = html;

      // Autoplay hero video if present
      const heroVid = overlayInner.querySelector('.proj-hero-bg-media[data-src]');
      if (heroVid) {
        heroVid.src = heroVid.dataset.src;
        heroVid.play().catch(() => {});
      }
    }

    // Lazy-load overlay videos when they scroll into view
    currentOverlayObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const vid = entry.target;
        if (entry.isIntersecting) {
          if (!vid.src && vid.dataset.src) {
            vid.src = vid.dataset.src;
          }
          vid.play().catch(() => {});
        } else {
          vid.pause();
        }
      });
    }, { root: overlay, rootMargin: '200px' });

    overlayInner.querySelectorAll('video[data-src]').forEach(vid => currentOverlayObs.observe(vid));

    // Wire up lightbox on all clickable media
    lightboxItems = proj.images;
    const allMedia = overlayInner.querySelectorAll('.media-cell img, .media-cell video, .proj-row-full img, .proj-row-full video, .proj-gallery img, .proj-gallery video');
    allMedia.forEach((el) => {
      const src = el.src || el.dataset.src;
      const idx = proj.images.indexOf(src);
      el.addEventListener('click', () => { lbIsLab = (projId === 'lab'); openLightbox(idx >= 0 ? idx : 0); });
    });


    // Floating title pill — appears when scrolling past project header
    const existingPill = document.getElementById('projFloatingPill');
    if (existingPill) existingPill.remove();
    if (!isLab) {
      const pill = document.createElement('div');
      pill.id = 'projFloatingPill';
      pill.className = 'proj-floating-pill';
      const firstSrc = proj.images[0];
      const pillThumb = firstSrc.endsWith('.webm') || firstSrc.endsWith('.mp4')
        ? firstSrc.replace(/\.(webm|mp4)$/, '_thumb.webp') : firstSrc;
      pill.innerHTML = `<div class="proj-pill-icon"><svg class="proj-pill-progress" viewBox="0 0 36 36"><circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="2.5"/><circle class="proj-pill-ring" cx="18" cy="18" r="16" fill="none" stroke="#fff" stroke-width="2.5" stroke-dasharray="100.53" stroke-dashoffset="100.53" stroke-linecap="round" transform="rotate(-90 18 18)"/></svg><img src="${pillThumb}" alt="" class="proj-pill-thumb" /></div><span class="proj-pill-name">${proj.name}</span>`;
      pill.style.cursor = 'pointer';
      pill.addEventListener('click', () => {
        if (overlayLenis) {
          overlayLenis.scrollTo(0, { duration: 1.2 });
        } else {
          overlay.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
      overlay.appendChild(pill);

      const ring = pill.querySelector('.proj-pill-ring');
      const circumference = 2 * Math.PI * 16; // 100.53

      const header = overlayInner.querySelector('.proj-header');
      if (header) {
        const pillObs = new IntersectionObserver((entries) => {
          pill.classList.toggle('visible', !entries[0].isIntersecting);
        }, { root: overlay, threshold: 0 });
        pillObs.observe(header);
      }

      // Update scroll progress ring
      overlay.addEventListener('scroll', function pillScroll() {
        if (!pill.parentNode) { overlay.removeEventListener('scroll', pillScroll); return; }
        const scrollTop = overlay.scrollTop;
        const scrollHeight = overlay.scrollHeight - overlay.clientHeight;
        const progress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
        ring.style.strokeDashoffset = circumference * (1 - progress);
      });
    }

    overlay.classList.add('open');
    overlayClose.classList.add('visible');
    lockScroll();
    const tc = document.getElementById('themeColor');
    if (tc) tc.content = '#111111';
    overlay.scrollTop = 0;

    // Update page meta for sharing
    document.title = proj.name + ' — Luka Grčar';
    let ogTitle = document.querySelector('meta[property="og:title"]');
    let ogDesc = document.querySelector('meta[property="og:description"]');
    let ogImg = document.querySelector('meta[property="og:image"]');
    if (ogTitle) ogTitle.content = proj.name + ' — Luka Grčar';
    if (ogDesc) ogDesc.content = (proj.desc && proj.desc[0]) ? proj.desc[0].substring(0, 160) : 'Portfolio of Luka Grčar';
    const ogThumb = proj.images[0].endsWith('.webm') || proj.images[0].endsWith('.mp4')
      ? proj.images[0].replace(/\.(webm|mp4)$/, '_thumb.webp')
      : proj.images[0];
    if (ogImg) ogImg.content = 'https://lukagrcar.com/' + ogThumb;

    // Init smooth scroll + parallax after DOM settles
    requestAnimationFrame(() => initOverlayParallax());
  }

  function closeOverlay() {
    overlayClose.style.display = 'none';
    cleanupOverlay();
    const pill = document.getElementById('projFloatingPill');
    if (pill) pill.remove();
    overlay.classList.remove('open');
    overlayClose.classList.remove('visible');
    // Force unlock in case count got out of sync
    scrollLockCount = 1;
    unlockScroll();
    document.title = 'Luka Grčar — Portfolio';
    let ogTitle = document.querySelector('meta[property="og:title"]');
    let ogDesc = document.querySelector('meta[property="og:description"]');
    let ogImg = document.querySelector('meta[property="og:image"]');
    if (ogTitle) ogTitle.content = 'Luka Grčar — Portfolio';
    if (ogDesc) ogDesc.content = '3D generalist & motion designer based in Ljubljana, Slovenia.';
    if (ogImg) ogImg.content = 'https://lukagrcar.com/og-image.png';
    const tc = document.getElementById('themeColor');
    if (tc) tc.content = '#ffffff';
    setTimeout(() => { overlayClose.style.display = ''; }, 500);
  }

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
    const active = lightboxStrip.querySelector('.active');
    if (active) active.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }

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
    if (!overlay.classList.contains('open')) {
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
      lightboxContent.innerHTML = `<img src="${src}" />`;
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
