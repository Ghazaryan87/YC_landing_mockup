/* ============================================================
   assets/js/main.js
   Universal navbar behaviour — loaded by every page, including
   Foundry. Merged in place of the old css-sibling css/nav.js.
   Self-guarding: does nothing if .nav markup is absent.
   ============================================================ */
/* ============================================================
   THE NAVBAR — one behaviour, every page.

   Companion to css/nav.css. Owns the burger panel and the
   scrolled state, so no page has to implement its own. Both the
   pages built on app.js and the AI Foundry page (which has its own
   inline script) load this and nothing else for the bar.

   Self-guarding: if the markup is absent, it does nothing.
   ============================================================ */
(function () {
  var nav = document.querySelector('.nav');
  if (!nav) return;

  /* ---- burger panel ---- */
  var burger = nav.querySelector('[data-burger]');
  var panel = nav.querySelector('[data-mpanel]');

  if (burger && panel) {
    var iconOpen = burger.querySelector('[data-burger-open]');
    var iconClose = burger.querySelector('[data-burger-close]');

    // SVGElement.hidden doesn't reliably reflect to the DOM attribute in
    // every engine — assigning the IDL property silently no-ops instead
    // of adding [hidden], so both icons stayed visible at once. Toggle
    // the attribute directly instead.
    var showHide = function (el, hide) {
      if (!el) return;
      if (hide) el.setAttribute('hidden', ''); else el.removeAttribute('hidden');
    };

    var set = function (open) {
      panel.hidden = !open;
      burger.setAttribute('aria-expanded', String(open));
      showHide(iconOpen, open);
      showHide(iconClose, !open);
    };

    burger.addEventListener('click', function () {
      set(burger.getAttribute('aria-expanded') !== 'true');
    });

    /* following a link closes the panel behind you */
    panel.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { set(false); });
    });

    /* a resize back to desktop must not strand the panel open */
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1180) set(false);
    });
  }

  /* ---- solid once you leave the top ---- */
  function onScroll() {
    nav.classList.toggle('scrolled', (window.scrollY || 0) > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- hide the nav's own Get In Touch once the page's own CTA is in view ---- */
  if ('IntersectionObserver' in window) {
    var pageCtas = document.querySelectorAll('[data-page-cta]');
    if (pageCtas.length) {
      var visibleCtas = 0;
      var ctaIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          visibleCtas += en.isIntersecting ? 1 : -1;
        });
        nav.classList.toggle('nav--cta-hidden', visibleCtas > 0);
      }, { threshold: 0.4 });
      pageCtas.forEach(function (el) { ctaIO.observe(el); });
    }

    /* ---- hide the whole bar once the footer scrolls into view ---- */
    var footer = document.querySelector('.footer');
    if (footer) {
      var footerIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          var open = panel && !panel.hidden;
          nav.classList.toggle('nav--hidden', en.isIntersecting && !open);
        });
      }, { threshold: 0.35 });
      footerIO.observe(footer);
    }
  }
})();
