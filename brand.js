/* ===================================================================
   SINGLE SOURCE OF TRUTH — professional title / role.

   Change ROLE below and it updates everywhere on every page:
   - any element marked  data-role   (cover role, about role, footer tagline)
   - the JSON-LD Person "jobTitle" (SEO / Google structured data)

   (Static HTML keeps a sensible fallback for no-JS crawlers; this script
   overwrites it from the single constant at runtime.)
   =================================================================== */
(function () {
  var ROLE = 'Interaction & Product Designer';

  function apply() {
    // 1) Visible role text
    var nodes = document.querySelectorAll('[data-role]');
    for (var i = 0; i < nodes.length; i++) nodes[i].textContent = ROLE;

    // 2) JSON-LD Person jobTitle
    var scripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (var j = 0; j < scripts.length; j++) {
      try {
        var data = JSON.parse(scripts[j].textContent);
        var people = [];
        if (data && Array.isArray(data['@graph'])) {
          data['@graph'].forEach(function (n) { if (n && n['@type'] === 'Person') people.push(n); });
        } else if (data && data['@type'] === 'Person') {
          people.push(data);
        }
        if (people.length) {
          people.forEach(function (p) { p.jobTitle = ROLE; });
          scripts[j].textContent = JSON.stringify(data, null, 2);
        }
      } catch (e) { /* ignore malformed JSON-LD */ }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply);
  } else {
    apply();
  }

  // Expose for quick console tweaks / other scripts.
  window.SITE_ROLE = ROLE;
})();
