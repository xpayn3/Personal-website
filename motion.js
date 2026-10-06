/* ===================================================================
   motion.js — loads the motion libraries (GSAP, ScrollTrigger, Lenis)
   only where they are used: smooth scrolling and parallax on desktop.

   Touch devices and visitors who ask for reduced motion skip them
   entirely. That is not just a smaller download: once ScrollTrigger is
   on a page it schedules a frame callback forever, whether or not
   anything is animating, which keeps a phone's screen and CPU from
   idling and drains the battery.

   Everything that uses these libraries checks that they exist first
   (overlay.js, the smooth-scroll setup in index.html), so the page works
   the same without them. A `motionlibs` event on window announces when
   they have all arrived.

   It also runs the page's own smooth scroll, so every page that includes
   this file scrolls with the same feel. The instance is window.pageLenis;
   overlay.js scrolls an open project through it. While the lightbox has
   the page locked (body.scroll-locked) it is torn down, and rebuilt when
   the page is free again.
   =================================================================== */
(function () {
  if (matchMedia('(pointer: coarse)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var CDN = 'https://cdn.jsdelivr.net/npm/';
  var libs = ['gsap@3.12.7/dist/gsap.min.js', 'gsap@3.12.7/dist/ScrollTrigger.min.js', 'lenis@1.1.18/dist/lenis.min.js'];
  var pending = libs.length;

  libs.forEach(function (path) {
    var script = document.createElement('script');
    script.src = CDN + path;
    script.async = false;   // keep their order: ScrollTrigger needs GSAP
    script.onload = function () {
      pending -= 1;
      if (pending === 0) window.dispatchEvent(new Event('motionlibs'));
    };
    document.head.appendChild(script);
  });

  // ---- one smooth scroll for the whole site ----
  window.SMOOTH_SCROLL = { lerp: 0.14, wheelMultiplier: 1.25, smoothWheel: true };
  window.PAGE_SMOOTH_SCROLL = true;        // tells overlay.js not to start one of its own

  // Boxes that scroll by themselves (dropdowns, panels, the contact form)
  // keep their own wheel instead of moving the page.
  function scrollsItself(node) {
    if (!node || node === document.body || node === document.documentElement) return false;
    if (node.scrollHeight <= node.clientHeight + 1) return false;
    var overflow = getComputedStyle(node).overflowY;
    return overflow === 'auto' || overflow === 'scroll';
  }

  var started = false;
  function start() {
    if (started || typeof Lenis === 'undefined' || !document.body) return;
    started = true;
    var options = { prevent: scrollsItself };
    for (var key in window.SMOOTH_SCROLL) options[key] = window.SMOOTH_SCROLL[key];
    var lenis = null;
    function sync() {
      var locked = document.body.classList.contains('scroll-locked');
      if (locked && lenis) { lenis.destroy(); lenis = null; }
      else if (!locked && !lenis) lenis = new Lenis(options);
      window.pageLenis = lenis;
    }
    new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    sync();
    requestAnimationFrame(function raf(time) {
      if (lenis) lenis.raf(time);
      requestAnimationFrame(raf);
    });
  }
  document.addEventListener('DOMContentLoaded', start);
  window.addEventListener('motionlibs', start);
})();
