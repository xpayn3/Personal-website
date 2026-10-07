// ========== GRID / FILTERS / LAYOUT (grid.html) ==========
// Project data + overlay/lightbox/mobile-list live in projects.js + overlay.js.
// This file owns the grid render, filter dropdowns, list-view toggle, grid
// slider, watermark rotation, and the #project=X auto-open handoff.

// Data lives in projects.js (wrapped in an IIFE) and is exposed via window.*
const projects = window.projects;
const COLOR_HEX = window.COLOR_HEX;
const gridItems = window.gridItems;

// ========== RENDER GRID ==========
const gridEl = document.getElementById('grid');
// a mouse or trackpad: hover effects are worth building
const canHoverFine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

function renderGrid() {
  const frag = document.createDocumentFragment();
  for (const item of gridItems) {
    // Lab experiments live on the Lab page — keep them out of the Work grid.
    if (item.project === 'lab') continue;
    const div = document.createElement('div');
    const isVideo = item.src.endsWith('.webm') || item.src.endsWith('.mp4');
    const isAnim = item.src.includes('anim') || item.src.includes('Anim');

    div.className = 'grid-item loading';
    div.dataset.project = item.project;
    div.dataset.year = item.year;
    div.dataset.color = item.color;
    div.dataset.type = (isVideo || isAnim) ? 'video' : 'image';
    div.dataset.category = (item.category || []).join(',');

    // Clips show their poster. Stills use the full picture, or the small
    // 300px copy on phones.
    const fullSrc = isVideo ? item.src.replace(/\.(webm|mp4)$/, '_thumb.webp') : item.src;
    const gridSrc = isMobile && !isVideo ? item.src.replace('Images/', 'Images/mobile/') : fullSrc;

    const media = document.createElement('img');
    // descriptive alt: what it is, what kind of work, whose
    media.alt = `${item.projectName} — ${(item.category || []).join(', ') || 'project'} by Luka Grčar`;
    media.decoding = 'async';
    media.dataset.src = gridSrc;
    div.appendChild(media);
    media.addEventListener('load', () => {
      div.classList.remove('loading');
    });
    // A phone-sized copy that was never generated: fall back to the full
    // picture once, rather than leaving an empty tile.
    media.addEventListener('error', () => {
      if (gridSrc !== fullSrc && media.getAttribute('src') === gridSrc) media.src = fullSrc;
    });

    // Video hover — desktop only, with preload-on-hover
    if (isVideo && !isMobile) {
      let vid = null;
      let hoverTimer = null;
      // a thin playbar along the bottom of the picture while the clip plays
      // (gallery.css: "reel bar"); filled from the clip's own clock each frame
      let fill = null;
      let barFrame = 0;
      const drawBar = () => {
        const done = vid && vid.duration ? vid.currentTime / vid.duration : 0;
        fill.style.transform = `scaleX(${done.toFixed(4)})`;
        barFrame = requestAnimationFrame(drawBar);
      };
      // Preload video element on hover with slight delay to avoid drive-by loads
      let wrap = null;
      div.addEventListener('mouseenter', () => {
        hoverTimer = setTimeout(() => {
          if (!vid) {
            wrap = document.createElement('div');
            wrap.className = 'hover-video-wrap';
            vid = document.createElement('video');
            vid.src = item.src;
            vid.muted = true;
            vid.loop = true;
            vid.playsInline = true;
            vid.preload = 'metadata';
            vid.className = 'hover-video';
            wrap.appendChild(vid);
            const bar = document.createElement('span');
            bar.className = 'reel-bar';
            fill = document.createElement('i');
            bar.appendChild(fill);
            wrap.appendChild(bar);
            div.appendChild(wrap);
          }
          vid.play().catch(() => {});
          wrap.style.opacity = '1';
          cancelAnimationFrame(barFrame);
          drawBar();
        }, 150);
      });
      div.addEventListener('mouseleave', () => {
        clearTimeout(hoverTimer);
        cancelAnimationFrame(barFrame);
        if (vid) {
          vid.pause();
          vid.currentTime = 0;
          wrap.style.opacity = '0';
          fill.style.transform = 'scaleX(0)';
        }
      });
    }

    // Preload project images on hover — limited to 3 links max per project
    if (!isMobile) {
      let preloaded = false;
      div.addEventListener('mouseenter', () => {
        if (preloaded) return;
        preloaded = true;
        const proj = projects[item.project];
        if (!proj || !proj.images) return;
        proj.images.slice(0, 3).forEach(src => {
          if (document.querySelector(`link[href="${src}"]`)) return;
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.href = src;
          document.head.appendChild(link);
        });
      }, { once: true, passive: true });
    }

    const label = document.createElement('span');
    label.className = 'item-label';
    // Caption under the picture: project name + year (gallery.css).
    const tag = document.createElement('span');
    tag.className = 'item-label-tag';
    // The year stays out of sight until the tile is hovered, then rolls in
    // like an odometer (gallery.css: "the year"). Each digit is a little
    // column that ends on the real digit, with the two before it above, so
    // it counts up into place. The columns are only built the first time a
    // tile is hovered: across the whole wall they would add thousands of
    // elements that most visitors never see.
    const year = String(item.year || '');
    tag.textContent = year;
    if (/^\d+$/.test(year) && canHoverFine) {
      tag.classList.add('is-year');
      const buildRoll = () => {
        tag.textContent = '';
        tag.classList.add('is-roll');
        tag.setAttribute('role', 'img');
        tag.setAttribute('aria-label', year);
        [...year].forEach((digit, i) => {
          const slot = document.createElement('span');
          slot.className = 'yr-slot';
          slot.setAttribute('aria-hidden', 'true');
          const roll = document.createElement('span');
          roll.className = 'yr-roll';
          roll.style.setProperty('--i', i);
          [2, 1, 0].forEach((back) => {
            const cell = document.createElement('b');
            cell.textContent = (Number(digit) + 10 - back) % 10;
            roll.appendChild(cell);
          });
          slot.appendChild(roll);
          tag.appendChild(slot);
        });
        void tag.offsetWidth;                              // let the parked digits register before they roll
      };
      div.addEventListener('mouseenter', () => {
        if (!tag.classList.contains('is-roll')) buildRoll();
        tag.classList.add('is-in');
      });
      div.addEventListener('mouseleave', () => tag.classList.remove('is-in'));
    }
    const name = document.createElement('span');
    name.className = 'item-label-name';
    name.textContent = item.projectName;
    label.append(tag, name);
    div.appendChild(label);

    // Meta info for list view
    const ext = item.src.split('.').pop().toUpperCase();
    const meta = document.createElement('div');
    meta.className = 'item-meta';
    meta.innerHTML = `<span>${ext}</span><span>${item.projectName}</span>`;
    div.appendChild(meta);

    div.addEventListener('click', () => {
      if (gridEl.classList.contains('list-view')) {
        window.setLightboxItems([item.src], false);
        window.openLightbox(0);
      } else {
        window.openProject(item.project);
      }
    });

    frag.appendChild(div);
  }
  gridEl.innerHTML = '';
  gridEl.appendChild(frag);
}

const isMobile = window.innerWidth < 768;
const isSlowConnection = navigator.connection && (navigator.connection.saveData || navigator.connection.effectiveType === '2g' || navigator.connection.effectiveType === 'slow-2g');

renderGrid();

// ========== FEATURES ==========
// A few projects get a full-width block in the wall: a large picture with the
// project's brief and description beside it, alternating sides. They break
// up the uniform tiles and give the page something to read. Blocks are woven
// in every few rows (placeFeatures) and step aside whenever the wall is
// filtered, searched or shown as a list.
const FEATURED = ['cestel', 'radenci', 'taf', 'accbox', 'natureta_renders', 'halloween'];

function buildFeature(id, index, total) {
  const p = projects[id];
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  };
  const cover = p.images.find(s => /cover/i.test(s) && /\.webp$/i.test(s))
    || p.images.find(s => /\.(webp|jpg|jpeg|png)$/i.test(s))
    || p.images[0].replace(/\.(webm|mp4)$/, '_thumb.webp');
  const pad = n => String(n).padStart(2, '0');
  const about = (p.desc && p.desc[0]) || '';

  const block = el('a', 'wall-feature' + (index % 2 ? ' is-flipped' : ''));
  block.href = 'work/' + id + '.html';   // the project's own page; the click below opens it in place

  const media = el('span', 'wall-feature-media');
  const img = el('img');
  Object.assign(img, { src: cover, loading: 'lazy', decoding: 'async', alt: `${p.name} — ${(p.category || []).join(', ')} by Luka Grčar` });
  media.appendChild(img);

  const text = el('span', 'wall-feature-text');
  text.append(
    el('span', 'wall-feature-kicker', `Featured ${pad(index + 1)} / ${pad(total)} · ${(p.category || []).join(' · ')}`),
    el('span', 'wall-feature-title', p.name),
    el('span', 'wall-feature-brief', p.brief || ''),
    el('span', 'wall-feature-about', about.length > 240 ? about.slice(0, 238).trim() + '…' : about),
    el('span', 'wall-feature-meta', [p.client, p.year].filter(Boolean).join(' · ')),
    el('span', 'wall-feature-cta', 'Open project'),
  );

  block.append(media, text);
  block.addEventListener('click', (e) => {
    e.preventDefault();
    window.openProject(id);
  });
  return block;
}

const features = FEATURED.filter(id => projects[id])
  .map((id, i, list) => buildFeature(id, i, list.length));

// each block wipes in the first time it scrolls into view
const featureObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-in');
    featureObserver.unobserve(entry.target);
  });
}, { threshold: 0.25 });
features.forEach(f => featureObserver.observe(f));

// Weave the blocks into the wall: the first after two rows of tiles, then one
// every three rows (four on a two-column phone). Counting in whole rows keeps
// the tile grid free of holes at any column count.
function placeFeatures() {
  features.forEach(f => f.remove());
  const filtered = !!(activeFilters.project || activeFilters.year || activeFilters.color || activeFilters.category || (activeFilters.search || '').trim());
  if (filtered || gridEl.classList.contains('list-view')) return;
  const cols = getComputedStyle(gridEl).gridTemplateColumns.split(' ').length || 4;
  const every = cols * (cols <= 2 ? 4 : 3);
  const tiles = gridEl.querySelectorAll('.grid-item');
  features.forEach((f, i) => {
    const before = tiles[cols * 2 + i * every];
    if (before) gridEl.insertBefore(f, before);
  });
}

// Page title small print: piece count and the span of years on show.
(function fillPageHead() {
  const shown = gridItems.filter(i => i.project !== 'lab');
  const years = shown.map(i => parseInt(i.year, 10)).filter(Boolean);
  const countEl = document.getElementById('workCount');
  const yearsEl = document.getElementById('workYears');
  if (countEl) countEl.textContent = shown.length;
  if (yearsEl && years.length) yearsEl.textContent = `${Math.min(...years)} — ${Math.max(...years)}`;
})();

// ========== STRUCTURED DATA ==========
// Tells search engines what is on this page: one CreativeWork per project,
// built from the same data as the wall so it can't drift out of date.
(function injectProjectList() {
  const origin = 'https://lukagrcar.com/';
  const poster = src => src.replace(/\.(webm|mp4)$/, '_thumb.webp');
  const works = Object.keys(projects).filter(id => id !== 'lab').map((id, i) => {
    const p = projects[id];
    return {
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'CreativeWork',
        name: p.name,
        url: `${origin}work/${id}`,
        image: origin + encodeURI(poster(p.images[0])),
        description: (p.desc && p.desc[0]) || p.brief || undefined,
        dateCreated: p.year ? String(p.year) : undefined,
        genre: p.category,
        creator: { '@type': 'Person', name: 'Luka Grčar', url: origin },
      },
    };
  });
  const tag = document.createElement('script');
  tag.type = 'application/ld+json';
  tag.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: works });
  document.head.appendChild(tag);
})();

// ========== TRUE LAZY LOAD ==========
const lazyObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target.querySelector('img[data-src]');
      if (img) {
        img.src = img.dataset.src;
        delete img.dataset.src;
      }
      lazyObserver.unobserve(entry.target);
    }
  });
}, { rootMargin: isSlowConnection ? '100px' : (isMobile ? '400px' : '200px') });

document.querySelectorAll('.grid-item').forEach(item => lazyObserver.observe(item));

// ========== FILTERS ==========
let activeFilters = { project: null, year: null, color: null, category: null, search: '' };
placeFeatures();
window.activeFilters = activeFilters;
let activeSort = 'newest'; // 'newest' | 'oldest' | 'random'

function buildDropdowns() {
  // Project dropdown
  const projMenu = document.getElementById('menu-project');
  const projNames = [...new Set(gridItems.map(i => i.project))].filter(id => id !== 'lab').sort();
  for (const id of projNames) {
    const btn = document.createElement('button');
    btn.className = 'proj-filter-btn';
    btn.dataset.value = id;

    const thumb = document.createElement('img');
    const firstSrc = projects[id].images[0];
    const isVid = firstSrc.endsWith('.webm') || firstSrc.endsWith('.mp4');
    thumb.src = isVid ? firstSrc.replace(/\.(webm|mp4)$/, '_thumb.webp') : firstSrc;
    thumb.alt = projects[id].name;
    thumb.className = 'proj-filter-thumb';
    btn.appendChild(thumb);

    const label = document.createElement('span');
    label.textContent = projects[id].name;
    btn.appendChild(label);

    btn.addEventListener('click', () => setFilter('project', id));
    projMenu.appendChild(btn);
  }


}

// Build color swatches inline in the control panel + a hidden dropdown
// twin so the existing applyFilters() loop (which toggles `.active` on
// dropdown buttons) keeps working without special-casing.
function buildColorDropdown() {
  const colorMenu = document.getElementById('menu-color');
  const inline = document.getElementById('cpSwatches');
  if (colorMenu) colorMenu.classList.add('color-grid');
  const colors = [...new Set(Object.values(projects).map(p => p.color).filter(Boolean))].sort();
  for (const name of colors) {
    const hex = COLOR_HEX[name] || '#888';
    if (inline) {
      const btn = document.createElement('button');
      btn.className = 'color-swatch-btn cp-swatch';
      btn.dataset.value = name;
      btn.style.background = hex;
      btn.title = name;
      btn.type = 'button';
      btn.addEventListener('click', (e) => { e.stopPropagation(); setFilter('color', name); });
      inline.appendChild(btn);
    }
    if (colorMenu) {
      // Twin button kept hidden — only used as the active-state tracker.
      const ghost = document.createElement('button');
      ghost.className = 'color-swatch-btn';
      ghost.dataset.value = name;
      ghost.style.background = hex;
      ghost.title = name;
      ghost.addEventListener('click', () => setFilter('color', name));
      colorMenu.appendChild(ghost);
    }
  }
}

buildDropdowns();
buildColorDropdown();

// Category filter dropdown
(function buildCategoryDropdown() {
  const catMenu = document.getElementById('menu-category');
  const allCats = new Set();
  Object.values(projects).forEach(p => (p.category || []).forEach(c => allCats.add(c)));
  const sorted = [...allCats].sort();
  for (const cat of sorted) {
    const btn = document.createElement('button');
    btn.dataset.value = cat;
    btn.textContent = cat;
    btn.addEventListener('click', (e) => { e.stopPropagation(); setFilter('category', cat); });
    catMenu.appendChild(btn);
  }
})();

// Year filter — pulled from project data.
(function buildYearDropdown() {
  const menu = document.getElementById('menu-year');
  if (!menu) return;
  const years = [...new Set(Object.values(projects).map(p => p.year).filter(Boolean))]
    .sort((a, b) => b - a);
  for (const y of years) {
    const btn = document.createElement('button');
    btn.dataset.value = String(y);
    btn.textContent = String(y);
    btn.addEventListener('click', (e) => { e.stopPropagation(); setFilter('year', y); });
    menu.appendChild(btn);
  }
})();

function setFilter(type, value) {
  if (activeFilters[type] === value) {
    activeFilters[type] = null;
  } else {
    activeFilters[type] = value;
  }
  applyFilters();
  closeAllDropdowns();
  setTimeout(() => window.scrollTo(0, 0), 50);
}
window.setFilter = setFilter;

function applyFilters() {
  const items = gridEl.querySelectorAll('.grid-item');
  const toShow = [];
  const toHide = [];

  const q = (activeFilters.search || '').trim().toLowerCase();
  items.forEach(item => {
    let show = true;
    if (activeFilters.project && item.dataset.project !== activeFilters.project) show = false;
    if (activeFilters.year && item.dataset.year !== String(activeFilters.year)) show = false;
    if (activeFilters.color && item.dataset.color !== activeFilters.color) show = false;
    if (activeFilters.category && !(item.dataset.category || '').split(',').includes(activeFilters.category)) show = false;
    if (q) {
      const proj = projects[item.dataset.project];
      const hay = ((proj && proj.name) || item.dataset.project || '').toLowerCase();
      if (!hay.includes(q)) show = false;
    }

    const isHidden = item.classList.contains('hidden');
    if (show && isHidden) toShow.push(item);
    else if (!show && !isHidden) toHide.push(item);
  });

  // Hide items instantly
  toHide.forEach(item => {
    item.classList.add('hidden');
    item.classList.remove('hiding', 'showing');
  });

  // Show items with staggered bounce
  toShow.forEach((item, i) => {
    item.classList.remove('hidden');
    item.classList.add('showing');
    item.style.animationDelay = Math.min(i * 20, 300) + 'ms';
    item.addEventListener('animationend', () => {
      item.classList.remove('showing');
      item.style.animationDelay = '';
    }, { once: true });
  });

  placeFeatures();

  // Show/hide no results
  const visibleCount = gridEl.querySelectorAll('.grid-item:not(.hidden)').length;
  const noMatch = visibleCount === 0;
  const countEl = document.getElementById('workCount');
  if (countEl) countEl.textContent = visibleCount;
  document.getElementById('noResults').classList.toggle('visible', noMatch);
  const footer = document.querySelector('.site-footer');
  if (footer) footer.style.display = noMatch ? 'none' : '';

  // Update toggle button states (skip nav)
  document.querySelectorAll('.bar-toggle').forEach(btn => {
    const menu = btn.dataset.menu;
    if (menu === 'nav') return;
    btn.classList.toggle('has-filter', activeFilters[menu] !== null);
  });

  // Update dropdown active states
  document.querySelectorAll('.bar-dropdown button').forEach(btn => {
    const parent = btn.closest('.bar-dropdown');
    if (!parent) return;
    const type = parent.id.replace('menu-', '');
    btn.classList.toggle('active', String(activeFilters[type]) === String(btn.dataset.value));
  });
  // Mirror the same active state to inline swatches in the control panel.
  document.querySelectorAll('#cpSwatches .cp-swatch').forEach(btn => {
    btn.classList.toggle('active', String(activeFilters.color) === String(btn.dataset.value));
  });

  // Update project button text + thumbnail
  const projToggleText = document.getElementById('projToggleText');
  const projToggleThumb = document.getElementById('projToggleThumb');
  if (activeFilters.project) {
    const proj = projects[activeFilters.project];
    const name = proj.name;
    const maxLen = 14;
    projToggleText.textContent = name.length > maxLen ? name.slice(0, maxLen) + '…' : name;
    const firstSrc = proj.images[0];
    const isVid = firstSrc.endsWith('.webm') || firstSrc.endsWith('.mp4');
    projToggleThumb.src = isVid ? firstSrc.replace(/\.(webm|mp4)$/, '_thumb.webp') : firstSrc;
    projToggleThumb.classList.add('visible');
  } else {
    projToggleText.textContent = 'All';
    projToggleThumb.classList.remove('visible');
  }

  // Update category button text — preserve the dropdown caret span.
  const categoryToggle = document.getElementById('categoryToggle');
  const catLabelSpan = categoryToggle && categoryToggle.querySelector('span:not(.cp-caret)');
  if (catLabelSpan) catLabelSpan.textContent = activeFilters.category || 'Any';

  // Year button text
  const yearText = document.getElementById('yearToggleText');
  if (yearText) yearText.textContent = activeFilters.year ? String(activeFilters.year) : 'Any';

  // Color button text mirrors color name
  const colorText = document.getElementById('colorToggleText');
  if (colorText) colorText.textContent = activeFilters.color || 'Any';

  // Show/hide reset button
  const hasAnyFilter = !!(activeFilters.project || activeFilters.year || activeFilters.color || activeFilters.category || (activeFilters.search && activeFilters.search.length));
  const resetBtn = document.getElementById('resetFilters');
  if (resetBtn) resetBtn.style.display = hasAnyFilter ? 'inline-block' : 'none';

  // Live counts in the control-panel meter
  const cpVisible = document.getElementById('cpVisible');
  const cpTotal = document.getElementById('cpTotal');
  if (cpVisible) cpVisible.textContent = String(visibleCount).padStart(3, '0');
  if (cpTotal) cpTotal.textContent = String(items.length).padStart(3, '0');
  const cpStatus = document.getElementById('cpStatus');
  if (cpStatus) cpStatus.textContent = hasAnyFilter ? '// FILTER' : '// IDLE';

  // Update color indicator
  const indicator = document.getElementById('colorIndicator');
  if (activeFilters.color) {
    indicator.style.background = COLOR_HEX[activeFilters.color] || '#888';
    indicator.classList.add('visible');
    indicator.style.animation = 'colorPop 0.4s cubic-bezier(0.34,1.56,0.64,1) both';
  } else if (indicator.classList.contains('visible')) {
    indicator.style.animation = 'colorPop 0.3s cubic-bezier(0.32,0.72,0,1) reverse forwards';
    setTimeout(() => {
      indicator.classList.remove('visible');
      indicator.style.animation = '';
    }, 300);
  }
}
window.applyFilters = applyFilters;

// Clear color via indicator click
document.getElementById('colorIndicator').addEventListener('click', (e) => {
  e.stopPropagation();
  activeFilters.color = null;
  applyFilters();
});

// Reset
document.getElementById('resetFilters').addEventListener('click', (e) => {
  const btn = e.currentTarget;
  btn.style.animation = 'barItemOut 0.3s cubic-bezier(0.32,0.72,0,1) forwards';
  setTimeout(() => {
    activeFilters = { project: null, year: null, color: null, category: null, search: '' };
    window.activeFilters = activeFilters;
    const searchEl = document.getElementById('cpSearch');
    if (searchEl) {
      searchEl.value = '';
      const wrap = searchEl.closest('.cp-search');
      if (wrap) wrap.classList.remove('has-text');
    }
    applyFilters();
    closeAllDropdowns();
    btn.style.animation = '';
  }, 250);
});


document.getElementById('clearFiltersBtn').addEventListener('click', () => {
  activeFilters = { project: null, year: null, color: null, category: null, search: '' };
  window.activeFilters = activeFilters;
  const searchEl = document.getElementById('cpSearch');
  if (searchEl) {
    searchEl.value = '';
    const wrap = searchEl.closest('.cp-search');
    if (wrap) wrap.classList.remove('has-text');
  }
  applyFilters();
  closeAllDropdowns();
});

// ========== DROPDOWN TOGGLE ==========
function closeAllDropdowns() {
  document.querySelectorAll('.bar-dropdown').forEach(d => d.classList.remove('open'));
  document.querySelectorAll('.bar-toggle').forEach(b => b.classList.remove('active'));
}

document.querySelectorAll('.bar-toggle').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const menuType = btn.dataset.menu;

    // On mobile, open fullscreen list for project filter
    if (isMobile && menuType === 'project') {
      closeAllDropdowns();
      window.openMobileProjectList();
      return;
    }

    const menuId = 'menu-' + menuType;
    const menu = document.getElementById(menuId);
    const isOpen = menu.classList.contains('open');
    closeAllDropdowns();
    if (!isOpen) {
      menu.classList.add('open');
      btn.classList.add('active');
    }
  });
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.control-panel')) closeAllDropdowns();
});

// ========== DROPDOWN MOUSE TILT ==========
document.querySelectorAll('.bar-dropdown').forEach(dropdown => {
  dropdown.addEventListener('mousemove', (e) => {
    if (!dropdown.classList.contains('open') || isMobile) return;
    const rect = dropdown.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    const tiltX = y * -4;
    const tiltY = x * 4;
    dropdown.style.transform = `translateX(-50%) scale(1) translateY(0) perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
  });
  dropdown.addEventListener('mouseleave', () => {
    if (!dropdown.classList.contains('open') || isMobile) return;
    dropdown.style.transform = '';
  });
});

// ========== GRID SIZE SLIDER ==========
window.scrollTo(0, 0);

const _mobile = window.innerWidth < 768;
const gridSlider = document.getElementById('gridSlider');
gridSlider.value = _mobile ? 2 : 3;
const sliderDotsEl = document.getElementById('sliderDots');
const sliderMin = parseInt(gridSlider.min);
const sliderMax = parseInt(gridSlider.max);
const sliderSteps = sliderMax - sliderMin + 1;

// Create dots
for (let i = 0; i < sliderSteps; i++) {
  const dot = document.createElement('div');
  dot.className = 'slider-dot';
  sliderDotsEl.appendChild(dot);
}

// The control panel is switched off when grid.html marks it `hidden`. Then the
// columns slider must not set the wall's column count: an inline value would
// pin it for the life of the page and override the stylesheet, which changes
// the count with the width of the window (gallery.css).
const panelOff = () => { const p = document.getElementById('controlPanel'); return !p || p.hidden; };

function updateSlider() {
  const val = parseInt(gridSlider.value);
  gridEl.style.gridTemplateColumns = panelOff() ? '' : `repeat(${val}, 1fr)`;
  placeFeatures();

  // Fill dots and track
  const pct = ((val - sliderMin) / (sliderMax - sliderMin)) * 100;
  gridSlider.style.background = `linear-gradient(to right, #111 ${pct}%, rgba(0,0,0,0.15) ${pct}%)`;

  const dots = sliderDotsEl.querySelectorAll('.slider-dot');
  dots.forEach((dot, i) => {
    dot.classList.toggle('filled', i <= val - sliderMin);
  });
}

gridSlider.addEventListener('input', updateSlider);
updateSlider();
// with the stylesheet in charge of the columns, re-weave the feature blocks
// when the window crosses the width where the count changes
window.matchMedia('(max-width: 768px)').addEventListener('change', () => { if (panelOff()) placeFeatures(); });

// ========== LIST VIEW TOGGLE ==========
const layoutGridBtn = document.getElementById('layoutGrid');
const layoutListBtn = document.getElementById('layoutList');

function switchLayout(toList) {
  gridEl.style.opacity = '0';
  gridEl.style.pointerEvents = 'none';
  gridEl.classList.add('switching');
  setTimeout(() => {
    gridEl.style.transition = 'none';
    if (toList) {
      gridEl.classList.add('list-view');
      gridEl.style.gridTemplateColumns = '';
      placeFeatures();
      layoutListBtn.classList.add('active');
      layoutGridBtn.classList.remove('active');
    } else {
      gridEl.classList.remove('list-view');
      updateSlider();
      layoutGridBtn.classList.add('active');
      layoutListBtn.classList.remove('active');
    }
    gridEl.offsetHeight;
    gridEl.style.transition = 'opacity 0.25s ease';
    gridEl.style.opacity = '1';
    gridEl.style.pointerEvents = '';
    setTimeout(() => gridEl.classList.remove('switching'), 300);
  }, 250);
}

layoutGridBtn.addEventListener('click', () => {
  if (!gridEl.classList.contains('list-view')) return;
  switchLayout(false);
});

layoutListBtn.addEventListener('click', () => {
  if (gridEl.classList.contains('list-view')) return;
  switchLayout(true);
});

// ========== WATERMARK LETTER ROTATION ==========
const wmEl = document.getElementById('watermarkText');
if (wmEl) {
  const text = wmEl.textContent;
  wmEl.innerHTML = '';
  const letters = [];
  for (const char of text) {
    const span = document.createElement('span');
    span.className = 'wm-letter';
    span.textContent = char === ' ' ? '\u00A0' : char;
    wmEl.appendChild(span);
    letters.push(span);
  }

  const MAX_ROT = 35;
  let lastScroll = 0;
  let resetTimer = null;

  let wmTick = false;
  window.addEventListener('scroll', () => {
    if (wmTick) return;
    wmTick = true;
    requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      const delta = scrollY - lastScroll;
      lastScroll = scrollY;

      for (let i = 0; i < letters.length; i++) {
        const raw = delta * -(1.2 + i * 0.12);
        const rot = Math.max(-MAX_ROT, Math.min(MAX_ROT, raw));
        letters[i].style.transition = 'none';
        letters[i].style.transform = `rotate(${rot}deg)`;
      }

      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => {
        for (let i = 0; i < letters.length; i++) {
          letters[i].style.transition = 'transform 0.6s cubic-bezier(0.34,1.56,0.64,1)';
          letters[i].style.transform = 'rotate(0deg)';
        }
      }, 80);
      wmTick = false;
    });
  }, { passive: true });
}


// (grid.html#project=X deep links are opened by overlay.js, on every page.)

// ========== CONTROL PANEL — sort / search / collapse =================
(function initControlPanelExtras() {
  // ---- Sort: reorders DOM children of the grid in place. -------------
  const sortBtns = document.querySelectorAll('.cp-sort-btn');
  function applySort() {
    const items = Array.from(gridEl.querySelectorAll('.grid-item'));
    let sorted;
    if (activeSort === 'random') {
      sorted = items.slice();
      for (let i = sorted.length - 1; i > 0; i--) {
        const j = (Math.random() * (i + 1)) | 0;
        [sorted[i], sorted[j]] = [sorted[j], sorted[i]];
      }
    } else {
      const dir = activeSort === 'oldest' ? 1 : -1;
      sorted = items.slice().sort((a, b) => {
        const ya = parseInt(a.dataset.year, 10) || 0;
        const yb = parseInt(b.dataset.year, 10) || 0;
        return (ya - yb) * dir;
      });
    }
    const frag = document.createDocumentFragment();
    sorted.forEach(el => frag.appendChild(el));
    gridEl.appendChild(frag);
    placeFeatures();
  }
  sortBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      activeSort = btn.dataset.sort || 'newest';
      sortBtns.forEach(b => b.classList.toggle('active', b === btn));
      applySort();
    });
  });

  // ---- Search: live name filter. -------------------------------------
  const searchEl = document.getElementById('cpSearch');
  const searchClear = document.getElementById('cpSearchClear');
  if (searchEl) {
    const wrap = searchEl.closest('.cp-search');
    let debounceTimer = null;
    searchEl.addEventListener('input', () => {
      activeFilters.search = searchEl.value;
      window.activeFilters = activeFilters;
      if (wrap) wrap.classList.toggle('has-text', !!searchEl.value);
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => applyFilters(), 80);
    });
    searchEl.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        searchEl.value = '';
        activeFilters.search = '';
        if (wrap) wrap.classList.remove('has-text');
        applyFilters();
      }
    });
  }
  if (searchClear && searchEl) {
    searchClear.addEventListener('click', (e) => {
      e.stopPropagation();
      searchEl.value = '';
      activeFilters.search = '';
      const wrap = searchEl.closest('.cp-search');
      if (wrap) wrap.classList.remove('has-text');
      applyFilters();
      searchEl.focus();
    });
  }

  // Keyboard shortcut: '/' or Ctrl/Cmd-K focuses search.
  window.addEventListener('keydown', (e) => {
    const inFormField = document.activeElement && (
      document.activeElement.tagName === 'INPUT' ||
      document.activeElement.tagName === 'TEXTAREA' ||
      document.activeElement.isContentEditable
    );
    if (inFormField) return;
    const panel = document.getElementById('controlPanel');
    if (!panel || panel.hidden) return;              // panel switched off: leave the keys alone
    if (e.key === '/' || ((e.ctrlKey || e.metaKey) && e.key === 'k')) {
      e.preventDefault();
      if (searchEl) searchEl.focus();
    }
  });

  // ---- Cols slider value display + integer chip. ---------------------
  const colsVal = document.getElementById('cpColsVal');
  const slider = document.getElementById('gridSlider');
  function syncColsVal() { if (colsVal && slider) colsVal.textContent = slider.value; }
  if (slider) { slider.addEventListener('input', syncColsVal); syncColsVal(); }

  // ---- Hide cols section when in list view. --------------------------
  const colsSection = document.getElementById('cpColsSection');
  const layoutGridBtn = document.getElementById('layoutGrid');
  const layoutListBtn = document.getElementById('layoutList');
  function syncColsVisibility() {
    if (!colsSection) return;
    const inList = gridEl.classList.contains('list-view');
    colsSection.style.display = inList ? 'none' : '';
  }
  if (layoutGridBtn) layoutGridBtn.addEventListener('click', () => requestAnimationFrame(syncColsVisibility));
  if (layoutListBtn) layoutListBtn.addEventListener('click', () => requestAnimationFrame(syncColsVisibility));
  syncColsVisibility();

  // ---- Collapse / handle toggle. -------------------------------------
  const panel = document.getElementById('controlPanel');
  const collapseBtn = document.getElementById('cpCollapse');
  const handle = document.getElementById('cpHandle');
  // The panel is switched off when grid.html marks it `hidden`: then neither
  // it nor its handle is ever shown.
  const panelOff = !panel || panel.hidden;
  function setCollapsed(yes) {
    if (panelOff || !handle) return;
    panel.classList.toggle('is-collapsed', yes);
    // Keep the handle in the DOM and toggle a class so it can animate
    // its scale/opacity in time with the panel pinch.
    handle.hidden = false;
    if (yes) {
      // Allow the handle to fade in after the panel finishes shrinking.
      requestAnimationFrame(() => handle.classList.add('is-visible'));
    } else {
      handle.classList.remove('is-visible');
    }
  }
  // Initial: panel collapsed by default — user opens it via the handle
  // when they want filters / layout / cols.
  if (handle && !panelOff) handle.hidden = false;
  setCollapsed(true);
  if (collapseBtn) collapseBtn.addEventListener('click', () => setCollapsed(true));
  if (handle) handle.addEventListener('click', () => setCollapsed(false));

  // ---- Initial count + label sync. ----------------------------------
  applyFilters();
})();
