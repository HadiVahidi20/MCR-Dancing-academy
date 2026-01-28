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
      });

      header.querySelectorAll('.nav a').forEach(function (link) {
        link.addEventListener('click', function () {
          header.classList.remove('nav-open');
          toggle.setAttribute('aria-expanded', 'false');
        });
      });
    }

    var wasCompact = false;
    function onScroll() {
      var makeCompact = window.scrollY > 40;
      if (makeCompact !== wasCompact) {
        header.classList.toggle('compact', makeCompact);
        wasCompact = makeCompact;
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

  document.addEventListener('DOMContentLoaded', function () {
    include('#site-header', 'header.html')
      .then(function () {
        setActiveNav();
        initHeader();
        return include('#site-footer', 'footer.html');
      })
      .catch(function (err) {
        console.warn('Header/Footer include failed', err);
      });
  });
})();
