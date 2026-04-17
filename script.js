// ========== GRID / FILTERS / LAYOUT (grid.html) ==========
// Project data + overlay/lightbox/mobile-list live in projects.js + overlay.js.
// This file owns the grid render, filter dropdowns, list-view toggle, grid
// slider, watermark rotation, and the #project=X auto-open handoff.

// Data lives in projects.js (wrapped in an IIFE) and is exposed via window.*
const IMG = window.IMG;
const projects = window.projects;
const COLOR_HEX = window.COLOR_HEX;
const gridItems = window.gridItems;

// ========== RENDER GRID ==========
const gridEl = document.getElementById('grid');

function renderGrid() {
  const frag = document.createDocumentFragment();
  for (const item of gridItems) {
    const div = document.createElement('div');
    const isVideo = item.src.endsWith('.webm') || item.src.endsWith('.mp4');
    const isAnim = item.src.includes('anim') || item.src.includes('Anim');

    div.className = 'grid-item loading';
    div.dataset.project = item.project;
    div.dataset.year = item.year;
    div.dataset.color = item.color;
    div.dataset.type = (isVideo || isAnim) ? 'video' : 'image';
    div.dataset.category = (item.category || []).join(',');

    // On mobile: use tiny 300px images, on desktop: use thumbs for videos, full for images
    let gridSrc;
    if (isMobile) {
      if (isVideo) {
        gridSrc = item.src.replace(/\.(webm|mp4)$/, '_thumb.webp');
      } else {
        gridSrc = item.src.replace('Images/', 'Images/mobile/');
      }
    } else {
      gridSrc = isVideo ? item.src.replace(/\.(webm|mp4)$/, '_thumb.webp') : item.src;
    }

    const media = document.createElement('img');
    media.alt = item.projectName;
    media.decoding = 'async';
    media.dataset.src = gridSrc;
    div.appendChild(media);
    media.addEventListener('load', () => {
      div.classList.remove('loading');
    });

    // Video hover — desktop only, with preload-on-hover
    if (isVideo && !isMobile) {
      let vid = null;
      let hoverTimer = null;
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
            div.appendChild(wrap);
          }
          vid.play().catch(() => {});
          wrap.style.opacity = '1';
        }, 150);
      });
      div.addEventListener('mouseleave', () => {
        clearTimeout(hoverTimer);
        if (vid) {
          vid.pause();
          vid.currentTime = 0;
          wrap.style.opacity = '0';
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
    label.className = 'item-label' + (item.project === 'lab' ? ' lab-label' : '');
    if (item.project === 'lab') {
      label.innerHTML = 'L<span style="font-weight:300">a</span>B';
      let labInterval = null;
      div.addEventListener('mouseenter', () => {
        labInterval = setInterval(() => {
          const chars = ['L','a','B'];
          label.innerHTML = chars.map(c => {
            const up = Math.random() > 0.5;
            const w = Math.random() > 0.5 ? '300' : '700';
            return `<span style="font-weight:${w}">${up ? c.toUpperCase() : c.toLowerCase()}</span>`;
          }).join('');
        }, 250);
      });
      div.addEventListener('mouseleave', () => {
        clearInterval(labInterval);
        label.innerHTML = 'L<span style="font-weight:300">a</span>B';
      });
    } else {
      label.textContent = item.projectName;
    }
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
      } else if (item.project === 'lab') {
        const labImages = projects.lab.images;
        window.setLightboxItems(labImages, true);
        const idx = labImages.indexOf(item.src);
        window.openLightbox(idx >= 0 ? idx : 0);
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
let activeFilters = { project: null, year: null, color: null, category: null };
window.activeFilters = activeFilters;

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

// Build color dropdown statically from project data
function buildColorDropdown() {
  const colorMenu = document.getElementById('menu-color');
  colorMenu.classList.add('color-grid');
  const colors = [...new Set(Object.values(projects).map(p => p.color).filter(Boolean))].sort();
  for (const name of colors) {
    const hex = COLOR_HEX[name] || '#888';
    const btn = document.createElement('button');
    btn.className = 'color-swatch-btn';
    btn.dataset.value = name;
    btn.style.background = hex;
    btn.title = name;
    btn.addEventListener('click', () => setFilter('color', name));
    colorMenu.appendChild(btn);
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

  items.forEach(item => {
    let show = true;
    if (activeFilters.project && item.dataset.project !== activeFilters.project) show = false;
    if (activeFilters.year && item.dataset.year !== String(activeFilters.year)) show = false;
    if (activeFilters.color && item.dataset.color !== activeFilters.color) show = false;
    if (activeFilters.category && !(item.dataset.category || '').split(',').includes(activeFilters.category)) show = false;

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

  // Show/hide no results
  const visibleCount = gridEl.querySelectorAll('.grid-item:not(.hidden)').length;
  const noMatch = visibleCount === 0;
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

  // Update project button text + thumbnail
  const projToggleText = document.getElementById('projToggleText');
  const projToggleThumb = document.getElementById('projToggleThumb');
  if (activeFilters.project) {
    const proj = projects[activeFilters.project];
    const name = proj.name;
    const maxLen = isMobile ? 10 : 18;
    projToggleText.textContent = name.length > maxLen ? name.slice(0, maxLen) + '...' : name;
    const firstSrc = proj.images[0];
    const isVid = firstSrc.endsWith('.webm') || firstSrc.endsWith('.mp4');
    projToggleThumb.src = isVid ? firstSrc.replace(/\.(webm|mp4)$/, '_thumb.webp') : firstSrc;
    projToggleThumb.classList.add('visible');
  } else {
    projToggleText.textContent = 'Projects';
    projToggleThumb.classList.remove('visible');
  }

  // Update category button text
  const categoryToggle = document.getElementById('categoryToggle');
  if (activeFilters.category) {
    categoryToggle.textContent = activeFilters.category;
  } else {
    categoryToggle.textContent = 'Type';
  }

  // Show/hide "All" reset button
  const hasAnyFilter = Object.values(activeFilters).some(v => v !== null);
  document.getElementById('resetFilters').style.display = hasAnyFilter ? 'flex' : 'none';

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
    activeFilters = { project: null, year: null, color: null, category: null };
    // Re-expose after reassignment so overlay.js sees the fresh object
    window.activeFilters = activeFilters;
    applyFilters();
    closeAllDropdowns();
    btn.style.animation = '';
  }, 250);
});


document.getElementById('clearFiltersBtn').addEventListener('click', () => {
  activeFilters = { project: null, year: null, color: null, category: null };
  window.activeFilters = activeFilters;
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
  if (!e.target.closest('.bottom-bar')) closeAllDropdowns();
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
gridSlider.value = _mobile ? 3 : 5;
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

function updateSlider() {
  const val = parseInt(gridSlider.value);
  gridEl.style.gridTemplateColumns = `repeat(${val}, 1fr)`;

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

// ========== MOBILE TOP SLIDER ==========
const mobileSlider = document.getElementById('mobileGridSlider');
const mobileDotsEl = document.getElementById('mobileSliderDots');
if (mobileSlider && mobileDotsEl) {
  const mMin = parseInt(mobileSlider.min);
  const mMax = parseInt(mobileSlider.max);
  for (let i = 0; i <= mMax - mMin; i++) {
    const dot = document.createElement('div');
    dot.className = 'slider-dot';
    mobileDotsEl.appendChild(dot);
  }
  mobileSlider.value = _mobile ? 3 : 5;

  function updateMobileSlider() {
    const val = parseInt(mobileSlider.value);
    gridEl.style.gridTemplateColumns = `repeat(${val}, 1fr)`;
    const pct = ((val - mMin) / (mMax - mMin)) * 100;
    mobileSlider.style.background = `linear-gradient(to right, #fff ${pct}%, rgba(0,0,0,0.1) ${pct}%)`;
    mobileDotsEl.querySelectorAll('.slider-dot').forEach((dot, i) => {
      dot.classList.toggle('filled', i <= val - mMin);
    });
  }

  mobileSlider.addEventListener('input', updateMobileSlider);
  if (_mobile) updateMobileSlider();
}

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


// ========== AUTO-OPEN FROM HASH ==========
// grid.html#project=X deep links open the overlay on page load.
const hashMatch = location.hash.match(/project=(\w+)/);
if (hashMatch) {
  setTimeout(() => window.openProject(hashMatch[1]), 100);
}
