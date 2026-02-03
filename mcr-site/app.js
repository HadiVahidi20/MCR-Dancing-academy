import { Application } from '@splinetool/runtime';

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

  function initSplineScene() {
    if (normalizePath(window.location.pathname) !== 'index.html') return;
    var canvas = document.getElementById('canvas3d');
    if (!canvas) return;

    var app = new Application(canvas);
    app.load('https://prod.spline.design/FVPd0-V56bCHl9b3/scene.splinecode')
      .then(function () {
        var bee = app.findObjectByName('Bee');
        if (!bee || !bee.scale) return;
        bee.scale.x = 20;
        bee.scale.y = 20;
        bee.scale.z = 20;
      })
      .catch(function (err) {
        console.warn('Spline scene failed to load', err);
      });
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

  function initScheduleTimeline() {
    var timeline = document.querySelector('[data-schedule-timeline]');
    if (!timeline) return;

    var cards = Array.prototype.slice.call(timeline.querySelectorAll('.schedule-day-card'));
    var progressBar = document.querySelector('[data-schedule-progress]');
    var hint = document.querySelector('.schedule-scroll-hint');
    
    if (!cards.length) return;

    // Update card scale/opacity based on scroll position
    function updateCards() {
      var scrollLeft = timeline.scrollLeft;
      var timelineWidth = timeline.scrollWidth - timeline.clientWidth;
      
      // Hide hint after initial scroll
      if (hint && scrollLeft > 10) {
        hint.classList.add('hidden');
      } else if (hint && scrollLeft <= 10) {
        hint.classList.remove('hidden');
      }

      // Update progress bar
      if (progressBar && timelineWidth > 0) {
        var progress = (scrollLeft / timelineWidth) * 100;
        progressBar.style.width = Math.min(100, Math.max(0, progress)) + '%';
      }

      // Update card states based on visibility
      cards.forEach(function(card) {
        var rect = card.getBoundingClientRect();
        var timelineRect = timeline.getBoundingClientRect();
        
        // Card is considered "in view" when its center is visible in the timeline
        var cardCenter = rect.left + rect.width / 2;
        var timelineCenter = timelineRect.left + timelineRect.width / 2;
        var distanceFromCenter = Math.abs(cardCenter - timelineCenter);
        var threshold = timelineRect.width * 0.4;
        
        if (distanceFromCenter < threshold) {
          card.classList.add('in-view');
        } else {
          card.classList.remove('in-view');
        }
      });
    }

    // Smooth scroll on wheel for better UX
    var isScrolling = false;
    
    timeline.addEventListener('wheel', function(e) {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        // Horizontal scroll - let it work naturally
        return;
      }
      
      // Convert vertical scroll to horizontal
      e.preventDefault();
      timeline.scrollLeft += e.deltaY;
    }, { passive: false });

    // Touch/scroll listeners
    timeline.addEventListener('scroll', updateCards, { passive: true });
    
    // Initial update
    updateCards();
    
    // Auto-highlight first card on load
    setTimeout(function() {
      if (cards[0]) {
        cards[0].classList.add('in-view');
      }
    }, 100);
  }

  function initStickySchedule() {
    var section = document.querySelector('[data-sticky-schedule]');
    if (!section) return;

    var panels = Array.prototype.slice.call(section.querySelectorAll('.sticky-day-panel'));
    var progressIndicator = section.querySelector('[data-progress-indicator]');
    var progressLabels = Array.prototype.slice.call(section.querySelectorAll('[data-day-nav]'));
    
    if (!panels.length) return;

    var ticking = false;

    // Initialize parallax for schedule images
    var scheduleParallaxContainers = Array.prototype.slice.call(section.querySelectorAll('[data-schedule-parallax]'));
    
    function updateProgress() {
      ticking = false;
      
      var sectionRect = section.getBoundingClientRect();
      var sectionTop = sectionRect.top;
      var sectionHeight = sectionRect.height;
      var viewportHeight = window.innerHeight;
      
      // Calculate overall progress through the section
      var scrollProgress = Math.max(0, Math.min(1, -sectionTop / (sectionHeight - viewportHeight)));
      
      // Update each panel's visibility and parallax
      var activeIndex = -1;
      panels.forEach(function(panel, index) {
        var rect = panel.getBoundingClientRect();
        var panelCenter = rect.top + rect.height / 2;
        var viewportCenter = viewportHeight / 2;
        
        // Panel is in view if its center is near viewport center
        if (Math.abs(panelCenter - viewportCenter) < viewportHeight * 0.4) {
          panel.classList.add('in-view');
          panel.classList.add('active');
          activeIndex = index;
        } else if (rect.top > viewportHeight) {
          panel.classList.remove('in-view');
        }

        // Apply parallax to image columns within each panel
        if (rect.top < viewportHeight && rect.bottom > 0) {
          var imageContainer = panel.querySelector('[data-schedule-parallax]');
          if (imageContainer) {
            var columns = Array.prototype.slice.call(imageContainer.querySelectorAll('.schedule-image-column'));
            
            // Calculate parallax based on panel position relative to viewport
            var panelProgress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
            panelProgress = Math.max(0, Math.min(1, panelProgress));
            
            columns.forEach(function(column) {
              var speed = parseFloat(column.getAttribute('data-parallax-speed')) || 0;
              // Multiply by larger value for more noticeable effect
              var yPos = (panelProgress - 0.5) * 200 * speed;
              column.style.transform = 'translateY(' + yPos + 'px)';
            });
          }
        }
      });

      // Update progress indicator position
      if (progressIndicator && panels.length > 0) {
        var progressHeight = 100 / panels.length;
        var progressPosition = scrollProgress * 100;
        
        progressIndicator.style.height = progressHeight + '%';
        progressIndicator.style.transform = 'translateY(' + (progressPosition * (panels.length - 1)) + '%)';
      }

      // Update active label
      progressLabels.forEach(function(label, index) {
        if (index === activeIndex) {
          label.classList.add('active');
        } else {
          label.classList.remove('active');
        }
      });
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(updateProgress);
        ticking = true;
      }
    }

    // Click navigation
    progressLabels.forEach(function(label, index) {
      label.addEventListener('click', function() {
        if (panels[index]) {
          var panel = panels[index];
          var rect = panel.getBoundingClientRect();
          var offsetTop = rect.top + window.pageYOffset - window.innerHeight / 2 + panel.offsetHeight / 2;
          
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }
      });
    });

    updateProgress();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    window.addEventListener('resize', onScroll);
  }

  function initStaggerSchedule() {
    var section = document.querySelector('[data-stagger-schedule]');
    if (!section) return;

    var cards = Array.prototype.slice.call(section.querySelectorAll('[data-stagger-card]'));
    if (!cards.length) return;

    var ticking = false;
    var animated = false;

    function checkVisibility() {
      ticking = false;
      
      var rect = section.getBoundingClientRect();
      var viewportHeight = window.innerHeight;
      
      // Trigger when section is 30% visible in viewport
      var triggerPoint = viewportHeight * 0.7;
      
      if (rect.top < triggerPoint && rect.bottom > 0 && !animated) {
        // Trigger stagger animation
        cards.forEach(function(card) {
          card.classList.add('animated');
        });
        animated = true;
      }
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(checkVisibility);
        ticking = true;
      }
    }

    checkVisibility();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
  }

  // ── Free Trial Split Screen Scroll Effects ─────────────
  function initTrialScrollEffects() {
    var section = document.querySelector('[data-scroll-section]');
    if (!section) return;

    var imageColumns = section.querySelectorAll('.trial-image-column');
    var overlay = section.querySelector('[data-scroll-fade]');
    var divider = section.querySelector('[data-scroll-reveal]');
    var staggerElements = section.querySelectorAll('[data-scroll-stagger]');
    var checkItems = section.querySelectorAll('.trial-check-item');

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          // Trigger scale animation for all image columns
          imageColumns.forEach(function (column) {
            column.classList.add('scroll-active');
          });

          if (overlay) {
            overlay.classList.add('scroll-active');
          }
          if (divider) {
            divider.classList.add('scroll-active');
          }
          
          // Stagger animation for content elements
          staggerElements.forEach(function (el, index) {
            setTimeout(function () {
              el.classList.add('scroll-active');
            }, index * 80);
          });

          // Animate check icons
          checkItems.forEach(function (item, index) {
            setTimeout(function () {
              item.classList.add('scroll-active');
            }, 500 + (index * 100));
          });
        }
      });
    }, {
      threshold: 0.2,
      rootMargin: '0px'
    });

    observer.observe(section);

    // Multi-column parallax effect on scroll
    var handleParallax = function () {
      var rect = section.getBoundingClientRect();
      var viewportHeight = window.innerHeight;
      
      if (rect.top < viewportHeight && rect.bottom > 0) {
        // Calculate scroll progress through the section (0 to 1)
        var sectionProgress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
        sectionProgress = Math.max(0, Math.min(1, sectionProgress));
        
        imageColumns.forEach(function (column) {
          var speed = parseFloat(column.getAttribute('data-parallax-speed')) || 0;
          // Center the effect and multiply by 250 for more dramatic movement
          var yPos = (sectionProgress - 0.5) * 250 * speed;
          column.style.transform = 'translateY(' + yPos + 'px)';
        });
      }
    };

    window.addEventListener('scroll', handleParallax, { passive: true });
    handleParallax(); // Initial call
  }

  // ── Free Trial Magnetic Button Effect (Legacy cleanup) ────
  function initMagneticButton() {
    // This function is no longer needed but kept for compatibility
    // The magnetic effect was for Option 1 which has been removed
  }

  // ── Free Trial Glass Card Tilt Effect (Legacy cleanup) ────
  function initGlassTilt() {
    // This function is no longer needed but kept for compatibility
    // The glass tilt was for Option 3 which has been removed
  }

  // ──────────────────────────────────────────────────────────────
  // Why MCR Section - Split Diagonal Layout with Parallax
  // ──────────────────────────────────────────────────────────────

  function initWhyMCR() {
    var section = document.querySelector('[data-why-mcr]');
    if (!section) return;

    var images = section.querySelectorAll('[data-parallax-diagonal]');
    if (images.length === 0) return;

    function updateDiagonalParallax() {
      images.forEach(function (img) {
        var rect = img.getBoundingClientRect();
        var viewportHeight = window.innerHeight;

        if (rect.top < viewportHeight && rect.bottom > 0) {
          var progress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
          var movement = (progress - 0.5) * 60;
          img.style.transform = 'scale(1.1) translateY(' + movement + 'px)';
        }
      });
    }

    window.addEventListener('scroll', updateDiagonalParallax, { passive: true });
    updateDiagonalParallax();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initSplineScene();
    include('#site-header', 'header.html')
      .then(function () {
        setActiveNav();
        initHeader();
        initHeroWheel();
        initScheduleTimeline();
        initStickySchedule();
        initStaggerSchedule();
        initTrialScrollEffects();
        initWhyMCR();
        initMagneticButton();
        initGlassTilt();
        return include('#site-footer', 'footer.html');
      })
      .catch(function (err) {
        console.warn('Header/Footer include failed', err);
      });
  });
})();
