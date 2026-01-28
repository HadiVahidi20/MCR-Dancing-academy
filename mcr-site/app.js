(function () {
  function normalizePath(pathname) {
    var path = pathname.split('?')[0].split('#')[0];
    if (path.endsWith('/')) path = path.slice(0, -1);
    var file = path.split('/').pop();
    if (!file) return 'index.html';
    var map = {
      'index': 'index.html',
      'index.html': 'index.html',
      'classes': 'classes.html',
      'classes.html': 'classes.html',
      'class-detail': 'class-detail.html',
      'class-detail.html': 'class-detail.html',
      'about': 'about.html',
      'about.html': 'about.html',
      'contact': 'contact.html',
      'contact.html': 'contact.html',
      'faq': 'faq.html',
      'faq.html': 'faq.html',
      'booking': 'booking.html',
      'booking.html': 'booking.html',
      'confirmation': 'confirmation.html',
      'confirmation.html': 'confirmation.html',
      'free-trial': 'free-trial.html',
      'free-trial.html': 'free-trial.html',
      'manage-booking': 'manage-booking.html',
      'manage-booking.html': 'manage-booking.html'
    };
    return map[file] || file;
  }

  function setActiveNav() {
    var activeHref = normalizePath(window.location.pathname);
    var links = document.querySelectorAll('.nav a');
    links.forEach(function (link) {
      if (link.getAttribute('href') === activeHref) {
        link.classList.add('active');
      }
    });
  }

  function initHeader() {
    var header = document.querySelector('.header');
    if (!header) return;

    var toggle = header.querySelector('.nav-toggle');
    if (toggle) {
      toggle.addEventListener('click', function () {
        var isOpen = header.classList.toggle('nav-open');
        toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        // Lock body scroll when mobile menu is open
        document.body.style.overflow = isOpen ? 'hidden' : '';
      });

      header.querySelectorAll('.nav a').forEach(function (link) {
        link.addEventListener('click', function () {
          header.classList.remove('nav-open');
          toggle.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        });
      });

      // Close menu on Escape key
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && header.classList.contains('nav-open')) {
          header.classList.remove('nav-open');
          toggle.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        }
      });
    }

    function closeMenu() {
      header.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    var wasCompact = false;
    function onScroll() {
      var makeCompact = window.scrollY > 60;
      if (makeCompact !== wasCompact) {
        header.classList.toggle('compact', makeCompact);
        wasCompact = makeCompact;
        // Close menu when transitioning out of compact (scrolled back to top)
        if (!makeCompact && header.classList.contains('nav-open')) {
          // Only auto-close on desktop; on mobile the menu stays
          if (window.innerWidth > 960) {
            closeMenu();
          }
        }
      }
    }

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  function include(selector, url) {
    var target = document.querySelector(selector);
    if (!target) return Promise.resolve();
    return fetch(url)
      .then(function (res) { return res.text(); })
      .then(function (html) { target.outerHTML = html; });
  }

  function initHeroWheel() {
    var section = document.querySelector('[data-hero-wheel]');
    if (!section) return;
    var items = Array.prototype.slice.call(section.querySelectorAll('.hero-wheel-item'));
    if (!items.length) return;

    var ticking = false;

    function update() {
      ticking = false;
      var rect = section.getBoundingClientRect();
      var viewport = window.innerHeight || 0;
      var scrollable = rect.height - viewport;
      if (scrollable <= 0) return;

      var progress = (viewport - rect.top) / scrollable;
      progress = Math.max(0, Math.min(1, progress));
      var total = items.length;
      var step = progress * total;

      items.forEach(function (item, index) {
        var dist = Math.abs(step - (index + 0.5));
        var visible = Math.max(0, 1 - dist / 0.6);
        var eased = visible * visible * (3 - 2 * visible);
        var spin = (1 - eased) * 16;
        var rise = (1 - eased) * 60;
        item.style.setProperty('--spin', spin.toFixed(2) + 'deg');
        item.style.setProperty('--rise', rise.toFixed(1) + 'px');
        item.style.opacity = eased.toFixed(2);
        item.style.zIndex = Math.round(eased * 10);
      });
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
  }

  document.addEventListener('DOMContentLoaded', function () {
    include('#site-header', 'header.html')
      .then(function () {
        setActiveNav();
        initHeader();
        initHeroWheel();
        return include('#site-footer', 'footer.html');
      })
      .catch(function (err) {
        console.warn('Header/Footer include failed', err);
      });
  });
})();
