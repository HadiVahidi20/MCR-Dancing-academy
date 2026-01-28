import { Application } from '@splinetool/runtime';

const canvas = document.getElementById('canvas3d');
const app = new Application(canvas);
app.load('https://prod.spline.design/FVPd0-V56bCHl9b3/scene.splinecode');

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

    var lastScrollY = window.scrollY;
    var wasCompact = false;
    var scrollThreshold = 60;

    function onScroll() {
      var currentY = window.scrollY;
      var scrollingUp = currentY < lastScrollY;
      var pastThreshold = currentY > scrollThreshold;

      // Compact when scrolling DOWN past threshold
      // Full nav when scrolling UP or at the very top
      var makeCompact = pastThreshold && !scrollingUp;

      if (makeCompact !== wasCompact) {
        header.classList.toggle('compact', makeCompact);
        wasCompact = makeCompact;

        // Close fullscreen menu when full nav reappears
        if (!makeCompact && header.classList.contains('nav-open')) {
          if (window.innerWidth > 960) {
            closeMenu();
          }
        }
      }

      lastScrollY = currentY;
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
    var cards = Array.prototype.slice.call(section.querySelectorAll('.hero-book-card'));
    if (!cards.length) return;

    var counterEl = section.querySelector('.hero-book-current');
    var hintEl = section.querySelector('.hero-book-hint');
    var total = cards.length;
    var ticking = false;

    // Smooth interpolation helper
    function lerp(a, b, t) {
      return a + (b - a) * t;
    }

    // Ease function (smoothstep)
    function ease(t) {
      t = Math.max(0, Math.min(1, t));
      return t * t * (3 - 2 * t);
    }

    function update() {
      ticking = false;
      var rect = section.getBoundingClientRect();
      var viewport = window.innerHeight || 0;
      var scrollable = rect.height - viewport;
      if (scrollable <= 0) return;

      // Overall progress: 0 = top of section, 1 = bottom
      var rawProgress = -rect.top / scrollable;
      var progress = Math.max(0, Math.min(1, rawProgress));

      // First 20% of scroll: no cards (just hero content visible)
      // Remaining 80%: distribute across cards
      var cardStart = 0.15;
      var cardProgress = Math.max(0, (progress - cardStart) / (1 - cardStart));
      var step = cardProgress * total;

      // Update counter
      var activeIndex = Math.min(Math.floor(step), total - 1);
      if (cardProgress > 0) {
        if (counterEl) counterEl.textContent = (activeIndex + 1).toString();
      }

      // Hide hint after first card starts appearing
      if (hintEl) {
        hintEl.style.opacity = cardProgress < 0.05 ? '1' : '0';
      }

      cards.forEach(function (card, i) {
        // Each card gets a segment of the scroll progress
        var cardLocal = step - i;

        if (cardLocal < -0.05) {
          // Not yet visible — folded forward below the bottom edge
          card.style.transform = 'rotateX(-90deg)';
          card.style.opacity = '0';
          card.style.zIndex = '0';
          return;
        }

        // --- ENTERING: card flips up from front (rotateX -90 → 0) ---
        if (cardLocal < 0.5) {
          var enterT = ease(Math.max(0, (cardLocal + 0.05) / 0.55));
          var rxIn = lerp(-90, 0, enterT);
          var opIn = lerp(0, 1, Math.min(enterT * 2, 1));

          card.style.transform = 'rotateX(' + rxIn.toFixed(2) + 'deg)';
          card.style.opacity = opIn.toFixed(3);
          card.style.zIndex = (i + 1).toString();
          return;
        }

        // --- RESTING: card stays flat, stacked on top of previous cards ---
        card.style.transform = 'rotateX(0deg)';
        card.style.opacity = '1';
        card.style.zIndex = (i + 1).toString();
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
