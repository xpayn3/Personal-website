/* ===================================================================
   demo-shim.js — loaded first by the hosted demo (apps/meshoptimiser/demo/).

   The app is a web page that talks to a small local server for three
   things: a heartbeat, STEP conversion, and the inbox/ folder. On the site
   there is no server, so this file answers those requests itself:
     - /api/alive         404, so the app leaves the heartbeat alone
     - /api/convert       501 with a plain explanation of what the demo opens
     - /api/job, cancel   404
   and opens a sample model (inbox/GearboxAssy.glb by default; the note has a picker
   for the others, all from Khronos's glTF-Sample-Models) the first time the
   demo is opened in a tab. A small note at the top says where it is running
   and links to the download. Nothing is uploaded: the files stay in the page.
   =================================================================== */
(function () {
  'use strict';
  window.__MESHOPT_DEMO = true;

  var STEP_NOTE = 'STEP files are read by the full app, which runs on your computer. This demo opens GLB, glTF, FBX, OBJ, 3MF and STL files, and the sample model.';
  var json = function (status, body) { return new Response(JSON.stringify(body), { status: status, headers: { 'Content-Type': 'application/json' } }); };

  var SAMPLES = [
    ['GearboxAssy', 'Gearbox assembly'],
    ['2CylinderEngine', 'Two-cylinder engine'],
    ['ReciprocatingSaw', 'Reciprocating saw']
  ];

  var realFetch = window.fetch.bind(window);
  window.fetch = function (input, init) {
    try {
      var url = typeof input === 'string' ? input : (input && input.url) || '';
      var path = new URL(url, location.href).pathname;
      if (/\/api\/convert$/.test(path)) return Promise.resolve(json(501, { error: STEP_NOTE }));
      if (/\/api\/(alive|job\/|cancel\/|quit)/.test(path)) return Promise.resolve(json(404, { error: 'demo' }));
    } catch (_) { /* fall through to the real fetch */ }
    return realFetch(input, init);
  };

  // the first time this tab opens the demo, open the sample model (the app removes ?file= again once it has loaded it)
  var top = window.top === window;
  var q = new URLSearchParams(location.search);
  if (top && !q.has('file') && !q.has('tab') && !q.has('selftest') && !q.has('safe')) {
    try {
      if (!sessionStorage.getItem('meshopt-demo-sample')) {
        sessionStorage.setItem('meshopt-demo-sample', '1');
        q.set('file', 'inbox/GearboxAssy.glb');
        history.replaceState(null, '', location.pathname + '?' + q.toString() + location.hash);
      }
    } catch (_) { /* storage blocked: the demo opens on the start screen */ }
  }

  // the note
  if (!top) return;

  // the welcome: what the demo is, what it leaves out, what the installed app adds. Once per tab; the note's "About" opens it again.
  var WELCOME = [
    ['Try it here', [
      'Open GLB, glTF, FBX, OBJ, 3MF and STL files, or one of three sample models.',
      'Smart optimise, Decimate, Remove holes, Fasteners, Hidden parts and Smart fit.',
      'Edit mesh, Draw and Sweep, and the library of 86 parts.',
      'Exploded view, measuring, search, and export.'
    ]],
    ['Left out of the demo', [
      'STEP, IGES and BREP files. The CAD reader runs on your computer.',
      'Folder and command-line conversion.',
      'The Claude connection.',
      'Updates inside the app.'
    ]],
    ['On your PC you also get', [
      'Full CAD conversion, with names, colours and part numbers kept and repeats stored once.',
      'Whole folders in one go, with size and detail targets.',
      'Claude doing the clean-up for you, with 65 tools.',
      'Updates in the app, and the old version kept.',
      'Free, open source, works offline. Windows and macOS.'
    ]]
  ];

  function showWelcome() {
    if (document.getElementById('meshopt-demo-welcome')) return;
    var calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var wrap = document.createElement('div');
    wrap.id = 'meshopt-demo-welcome';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.setAttribute('aria-labelledby', 'meshopt-demo-welcome-title');
    wrap.style.cssText = 'position:fixed;inset:0;z-index:2147483100;display:grid;place-items:center;padding:16px;background:rgba(8,8,9,.72);opacity:0;transition:opacity .25s ease;font-family:Inter,system-ui,-apple-system,Segoe UI,sans-serif;';
    var cols = WELCOME.map(function (c, i) {
      return '<section style="min-width:0;padding-top:16px;border-top:1px solid ' + (i === 2 ? 'rgba(13,153,255,.55)' : 'rgba(255,255,255,.14)') + '">' +
        '<h3 style="margin:0 0 12px;font:400 11px/1 ui-monospace,Menlo,Consolas,monospace;letter-spacing:.09em;text-transform:uppercase;color:' + (i === 2 ? '#3aadff' : '#8a8a8f') + '">' + c[0] + '</h3>' +
        '<ul style="margin:0;padding:0;list-style:none;display:grid;gap:10px">' +
        c[1].map(function (t) { return '<li style="font-size:14px;line-height:1.45;color:' + (i === 1 ? '#a3a3a8' : '#e6e6e8') + '">' + t + '</li>'; }).join('') +
        '</ul></section>';
    }).join('');
    wrap.innerHTML =
      '<div style="width:min(960px,100%);max-height:100%;overflow:auto;box-sizing:border-box;padding:clamp(20px,3vw,36px);border-radius:14px;background:#19191a;box-shadow:0 30px 80px rgba(0,0,0,.6),0 0 0 1px rgba(255,255,255,.1);color:#e6e6e8">' +
        '<h2 id="meshopt-demo-welcome-title" style="margin:0;font:500 clamp(22px,3vw,30px)/1.15 Inter,system-ui,sans-serif;letter-spacing:-.01em">Try MeshOptimiser in your browser.</h2>' +
        '<p style="margin:10px 0 0;max-width:62ch;font-size:15px;line-height:1.5;color:#a3a3a8">This is the real app, running right here. Nothing is uploaded: your files stay in this page.</p>' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:24px;margin-top:26px">' + cols + '</div>' +
        '<div style="display:flex;flex-wrap:wrap;align-items:center;gap:12px;margin-top:28px">' +
          '<button type="button" data-go style="all:unset;cursor:pointer;box-sizing:border-box;display:inline-flex;align-items:center;height:40px;padding:0 18px;border-radius:8px;background:#0d99ff;color:#fff;font:500 14px/1 Inter,system-ui,sans-serif">Start exploring</button>' +
          '<a href="../download.html" style="display:inline-flex;align-items:center;height:40px;padding:0 16px;border-radius:8px;background:#212123;color:#e6e6e8;font:500 14px/1 Inter,system-ui,sans-serif;text-decoration:none">Download the app</a>' +
        '</div>' +
      '</div>';
    var prev = document.activeElement;
    function close() {
      document.removeEventListener('keydown', onKey, true);
      wrap.style.opacity = '0';
      setTimeout(function () { wrap.remove(); }, calm ? 0 : 250);
      try { if (prev && prev.focus) prev.focus(); } catch (_) {}
    }
    function onKey(e) {
      if (e.key === 'Escape') { e.stopPropagation(); e.preventDefault(); close(); }
      else if (e.key === 'Tab') {
        var f = wrap.querySelectorAll('button,a[href]');
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    wrap.addEventListener('mousedown', function (e) { if (e.target === wrap) close(); });
    wrap.querySelector('[data-go]').addEventListener('click', close);
    document.addEventListener('keydown', onKey, true);
    document.body.appendChild(wrap);
    if (calm) wrap.style.transition = 'none';
    requestAnimationFrame(function () { wrap.style.opacity = '1'; wrap.querySelector('[data-go]').focus(); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    try { if (sessionStorage.getItem('meshopt-demo-welcome')) return; sessionStorage.setItem('meshopt-demo-welcome', '1'); } catch (_) {}
    setTimeout(showWelcome, 400);
  });

  document.addEventListener('DOMContentLoaded', function () {
    try { if (sessionStorage.getItem('meshopt-demo-note') === 'gone') return; } catch (_) {}
    var bar = document.createElement('div');
    bar.setAttribute('role', 'note');
    bar.style.cssText = 'position:fixed;left:50%;top:6px;transform:translate(-50%,-14px);opacity:0;transition:transform .6s cubic-bezier(.2,.8,.2,1),opacity .4s ease;z-index:2147483000;display:flex;align-items:center;gap:14px;max-width:calc(100vw - 24px);height:32px;padding:0 4px 0 12px;border-radius:10px;background:#161616;box-shadow:inset 0 0 0 1px rgba(255,255,255,.09),0 14px 36px rgba(0,0,0,.5),0 2px 8px rgba(0,0,0,.4);color:#a8a8a8;font:400 12.5px/1 Inter,system-ui,sans-serif;white-space:nowrap';
    bar.innerHTML =
      '<span style="display:inline-flex;align-items:center;gap:8px;color:#e9e9e9;letter-spacing:.09em;font:400 10.5px/1 ui-monospace,Menlo,Consolas,monospace;text-transform:uppercase">Demo</span>' +
      '<span style="width:1px;height:14px;background:rgba(255,255,255,.12)"></span>' +
      '<span style="overflow:hidden;text-overflow:ellipsis">Runs in your browser. Nothing is uploaded.</span>' +
      '<button type="button" data-about style="all:unset;cursor:pointer;padding:0 4px;color:#a3a3a8;font:400 12px/1 Inter,system-ui,sans-serif">About</button>' +
      '<select aria-label="Open a sample model" style="height:24px;max-width:170px;padding:0 6px;border-radius:6px;border:0;background:#262626;color:#e9e9e9;font:400 12px/1 Inter,system-ui,sans-serif;box-shadow:inset 0 0 0 1px rgba(255,255,255,.09)"><option value="">Samples</option>' + SAMPLES.map(function (m) { return '<option value="' + m[0] + '">' + m[1] + '</option>'; }).join('') + '</select>' +
      '<a href="../download.html" style="display:inline-flex;align-items:center;gap:6px;height:24px;padding:0 10px;border-radius:6px;background:#0d99ff;color:#fff;font-weight:500;text-decoration:none">Get the full app</a>' +
      '<button type="button" aria-label="Hide this note" style="all:unset;cursor:pointer;display:grid;place-items:center;width:24px;height:24px;border-radius:6px;color:#7d7d7d;"><svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" aria-hidden="true" style="display:block"><path d="M1.5 1.5l7 7M8.5 1.5l-7 7"/></svg></button>';
    bar.querySelector('select').addEventListener('change', function (e) {
      if (!e.target.value) return;
      var p = new URLSearchParams(location.search);
      p.set('file', 'inbox/' + e.target.value + '.glb');
      location.search = p.toString();
    });
    bar.querySelector('[data-about]').addEventListener('click', showWelcome);
    bar.querySelector('button[aria-label]').addEventListener('click', function () { bar.remove(); try { sessionStorage.setItem('meshopt-demo-note', 'gone'); } catch (_) {} });
    document.body.appendChild(bar);
    // it drifts down into place a moment after the app has drawn its first frame
    var calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (calm) bar.style.transition = 'none';
    setTimeout(function () { bar.style.opacity = '1'; bar.style.transform = 'translate(-50%,0)'; }, calm ? 0 : 1200);
  });
})();
