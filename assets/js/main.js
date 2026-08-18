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

  /* ---- hide the nav's own Get In Touch once the page's own CTA is in view ---- */
  var CTA_THRESHOLD = 0.4;
  var pageCtas = document.querySelectorAll('[data-page-cta]');

  /* Same test the observer's threshold applies, done synchronously. The
     observer's first callback only arrives after the document has painted,
     which is too late to decide the CTA's *initial* state — CSS keeps it out
     of that first paint until this measurement sets .nav--cta-ready. */
  function ctaOnScreen(el) {
    var r = el.getBoundingClientRect();
    if (!r.width || !r.height) return false;
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var vw = window.innerWidth || document.documentElement.clientWidth;
    var y = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
    var x = Math.max(0, Math.min(r.right, vw) - Math.max(r.left, 0));
    return (x * y) / (r.width * r.height) >= CTA_THRESHOLD;
  }

  /* track which CTAs are on screen, not a running count — the first
     observer callback reports every element at once, so counting made
     one visible CTA and one off-screen CTA cancel out to zero */
  var onScreenCtas = [];
  for (var ci = 0; ci < pageCtas.length; ci++) {
    if (ctaOnScreen(pageCtas[ci])) onScreenCtas.push(pageCtas[ci]);
  }

  nav.classList.add('nav--cta-boot');
  nav.classList.toggle('nav--cta-hidden', onScreenCtas.length > 0);
  nav.classList.add('nav--cta-ready');
  /* two frames: the settled state has to be painted un-transitioned before
     transitions come back, or it animates in from the pre-ready state */
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { nav.classList.remove('nav--cta-boot'); });
  });


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

  if ('IntersectionObserver' in window) {
    if (pageCtas.length) {
      var ctaIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          var at = onScreenCtas.indexOf(en.target);
          if (en.isIntersecting) { if (at < 0) onScreenCtas.push(en.target); }
          else if (at >= 0) { onScreenCtas.splice(at, 1); }
        });
        nav.classList.toggle('nav--cta-hidden', onScreenCtas.length > 0);
      }, { threshold: CTA_THRESHOLD });
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
