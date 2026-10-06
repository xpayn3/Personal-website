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
})();
