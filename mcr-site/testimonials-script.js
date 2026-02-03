/* ══════════════════════════════════════════════════════════
   TESTIMONIALS INTERACTIONS - ALL 3 OPTIONS
   ══════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  // ══════════════════════════════════════════════════════════
  // OPTION 1: HORIZONTAL SCROLL MARQUEE
  // ══════════════════════════════════════════════════════════

  function initMarquee() {
    var section = document.querySelector('[data-testimonial-marquee]');
    if (!section) return;

    var container = section.querySelector('[data-marquee-scroll]');
    var cards = Array.from(container.querySelectorAll('.marquee-card'));
    var prevBtn = section.querySelector('.marquee-prev');
    var nextBtn = section.querySelector('.marquee-next');
    var dotsContainer = section.querySelector('[data-marquee-dots]');

    if (!container || !cards.length) return;

    // Create dots
    cards.forEach(function(card, index) {
      var dot = document.createElement('div');
      dot.className = 'marquee-dot';
      dot.setAttribute('data-dot-index', index);
      dot.addEventListener('click', function() {
        scrollToCard(index);
      });
      dotsContainer.appendChild(dot);
    });

    var dots = Array.from(dotsContainer.querySelectorAll('.marquee-dot'));

    // Update active card and dot based on scroll position
    function updateActiveCard() {
      var containerRect = container.getBoundingClientRect();
      var containerCenter = containerRect.left + containerRect.width / 2;

      var closest = null;
      var closestDistance = Infinity;

      cards.forEach(function(card, index) {
        var rect = card.getBoundingClientRect();
        var cardCenter = rect.left + rect.width / 2;
        var distance = Math.abs(cardCenter - containerCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closest = index;
        }

        // Add/remove in-view class
        if (distance < containerRect.width * 0.4) {
          card.classList.add('in-view');
        } else {
          card.classList.remove('in-view');
        }
      });

      // Update dots
      dots.forEach(function(dot, index) {
        if (index === closest) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    }

    // Scroll to specific card
    function scrollToCard(index) {
      if (!cards[index]) return;
      var card = cards[index];
      var containerRect = container.getBoundingClientRect();
      var cardRect = card.getBoundingClientRect();
      var scrollLeft = container.scrollLeft + (cardRect.left - containerRect.left) - (containerRect.width / 2) + (cardRect.width / 2);

      container.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      });
    }

    // Navigation buttons
    if (prevBtn) {
      prevBtn.addEventListener('click', function() {
        container.scrollBy({
          left: -400,
          behavior: 'smooth'
        });
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function() {
        container.scrollBy({
          left: 400,
          behavior: 'smooth'
        });
      });
    }

    // Drag to scroll
    var isDown = false;
    var startX;
    var scrollLeft;

    container.addEventListener('mousedown', function(e) {
      isDown = true;
      container.style.cursor = 'grabbing';
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
    });

    container.addEventListener('mouseleave', function() {
      isDown = false;
      container.style.cursor = 'grab';
    });

    container.addEventListener('mouseup', function() {
      isDown = false;
      container.style.cursor = 'grab';
    });

    container.addEventListener('mousemove', function(e) {
      if (!isDown) return;
      e.preventDefault();
      var x = e.pageX - container.offsetLeft;
      var walk = (x - startX) * 2;
      container.scrollLeft = scrollLeft - walk;
    });

    // Update on scroll
    container.addEventListener('scroll', updateActiveCard, { passive: true });

    // Initial update
    updateActiveCard();

    // Auto-scroll (optional - pauses on hover)
    var autoScrollInterval;
    var isHovering = false;

    function startAutoScroll() {
      autoScrollInterval = setInterval(function() {
        if (!isHovering) {
          var maxScroll = container.scrollWidth - container.clientWidth;
          if (container.scrollLeft >= maxScroll - 10) {
            container.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            container.scrollBy({ left: 1, behavior: 'auto' });
          }
        }
      }, 30);
    }

    container.addEventListener('mouseenter', function() {
      isHovering = true;
    });

    container.addEventListener('mouseleave', function() {
      isHovering = false;
    });

    // Uncomment to enable auto-scroll
    // startAutoScroll();
  }

  // ══════════════════════════════════════════════════════════
  // OPTION 2: SCROLL-DRIVEN STICKY TESTIMONIALS
  // ══════════════════════════════════════════════════════════

  function initFadeThrough() {
    var section = document.querySelector('[data-testimonial-fade]');
    if (!section) return;

    var container = section.querySelector('.fade-through-container');
    var testimonials = Array.from(section.querySelectorAll('.fade-testimonial'));
    var progressDots = Array.from(section.querySelectorAll('.fade-progress-dot'));

    if (!testimonials.length || !container) return;

    var currentIndex = -1;
    var previousIndex = -1;

    function updateActiveTestimonial(index) {
      if (index === currentIndex) return;

      previousIndex = currentIndex;
      currentIndex = index;

      // Add exiting class to previous testimonial
      testimonials.forEach(function(testimonial, i) {
        var dataIndex = parseInt(testimonial.getAttribute('data-fade-index'));
        testimonial.classList.remove('active', 'exiting');

        if (dataIndex === previousIndex && previousIndex !== -1) {
          testimonial.classList.add('exiting');
        }

        if (dataIndex === index) {
          testimonial.classList.add('active');
        }
      });

      // Update progress dots
      progressDots.forEach(function(dot, i) {
        var dotIndex = parseInt(dot.getAttribute('data-dot'));
        if (dotIndex === index) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    }

    // Scroll-driven testimonial change
    function handleScroll() {
      var sectionRect = section.getBoundingClientRect();
      var sectionTop = sectionRect.top;
      var sectionHeight = sectionRect.height;
      var viewportHeight = window.innerHeight;

      // Calculate scroll progress through the section
      // Starts when section top hits top of viewport
      var scrollProgress = -sectionTop / (sectionHeight - viewportHeight);

      // Clamp between 0 and 1
      scrollProgress = Math.max(0, Math.min(1, scrollProgress));

      // Map scroll progress to testimonial index
      var totalTestimonials = testimonials.length;
      var testimonialIndex = Math.floor(scrollProgress * totalTestimonials);

      // Clamp to valid range
      testimonialIndex = Math.max(0, Math.min(totalTestimonials - 1, testimonialIndex));

      updateActiveTestimonial(testimonialIndex);
    }

    // Throttled scroll handler
    var ticking = false;
    window.addEventListener('scroll', function() {
      if (!ticking) {
        window.requestAnimationFrame(function() {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    // Initial call
    handleScroll();

    // Click dots to scroll to testimonial
    progressDots.forEach(function(dot) {
      dot.style.cursor = 'pointer';
      dot.addEventListener('click', function() {
        var dotIndex = parseInt(dot.getAttribute('data-dot'));
        var totalTestimonials = testimonials.length;

        // Calculate target scroll position
        var sectionRect = section.getBoundingClientRect();
        var sectionTop = section.offsetTop;
        var sectionHeight = section.offsetHeight;
        var viewportHeight = window.innerHeight;

        var progress = dotIndex / totalTestimonials;
        var targetScroll = sectionTop + (progress * (sectionHeight - viewportHeight));

        window.scrollTo({
          top: targetScroll,
          behavior: 'smooth'
        });
      });
    });
  }

  // ══════════════════════════════════════════════════════════
  // OPTION 3: STAGGERED REVEAL GRID
  // ══════════════════════════════════════════════════════════

  function initGridReveal() {
    var section = document.querySelector('[data-testimonial-grid]');
    if (!section) return;

    var cards = Array.from(section.querySelectorAll('[data-grid-card]'));
    if (!cards.length) return;

    // IntersectionObserver for reveal animation
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          cards.forEach(function(card) {
            card.classList.add('animated');
          });
          observer.disconnect();
        }
      });
    }, {
      threshold: 0.2
    });

    observer.observe(section);

    // 3D Tilt Effect on Hover
    cards.forEach(function(card) {
      card.addEventListener('mousemove', function(e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;

        var centerX = rect.width / 2;
        var centerY = rect.height / 2;

        var rotateX = (y - centerY) / centerY * -5; // Max 5 degrees
        var rotateY = (x - centerX) / centerX * 5;

        card.style.transform = 'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-8px) scale(1.02)';
      });

      card.addEventListener('mouseleave', function() {
        card.style.transform = '';
      });
    });
  }

  // ══════════════════════════════════════════════════════════
  // INITIALIZE ALL
  // ══════════════════════════════════════════════════════════

  document.addEventListener('DOMContentLoaded', function() {
    initMarquee();
    initFadeThrough();
    initGridReveal();
  });

})();
