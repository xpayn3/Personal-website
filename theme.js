/* ===================================================================
   theme.js — the Dark / Light button in the nav on Work, Lab, the app
   pages and About. (The home page has its own in smoke.js; both share the
   saved choice.)

   Each page sets <html data-theme> before first paint from a small script
   in its <head>: the visitor's saved choice, else the page's own default
   (Work, Lab and apps are dark; About is light). This file only wires the
   button: it flips the attribute, keeps the nav's palette in step, and
   remembers the choice for every page. The colours themselves are CSS
   (tokens.css; gallery.css for Work, Lab and apps; about.css for About).
   =================================================================== */
(function () {
  var root = document.documentElement;
  var button = document.getElementById('themeToggle');

  function setTheme(theme, remember) {
    var dark = theme === 'dark';
    root.dataset.theme = dark ? 'dark' : 'light';
    if (document.body) document.body.classList.toggle('nav-light', !dark);   // the nav's palette (floating-nav.css)
    if (button) {
      button.setAttribute('aria-pressed', String(dark));
      button.textContent = dark ? 'Light' : 'Dark';       // says what a click switches to
    }
    if (!remember) return;
    try { localStorage.setItem('lg-theme', dark ? 'dark' : 'light'); } catch (e) { /* private mode: just not remembered */ }
  }

  // bring the button and the nav in line with what the <head> script chose
  setTheme(root.dataset.theme === 'light' ? 'light' : 'dark', false);
  if (button) {
    button.addEventListener('click', function () {
      setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', true);
    });
  }
})();
