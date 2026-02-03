/**
 * BLUEFORGE AI - Main JavaScript
 * Handles navigation, animations, and interactions
 * With security best practices
 */

(function () {
  'use strict';

  // ============================================
  // SECURITY: Content Security & Anti-Tampering
  // ============================================

  // Detect if page is embedded in iframe (clickjacking protection)
  if (window.self !== window.top) {
    // Page is in an iframe - show warning or redirect
    console.warn('Security: Page loaded in iframe');
    document.body.innerHTML = '<div style="padding: 50px; text-align: center;"><h1>Security Warning</h1><p>This page cannot be displayed in a frame.</p><a href="' + window.location.href + '" target="_top">Click here to view this page securely</a></div>';
    return;
  }

  // Disable right-click on sensitive areas (optional - can be removed)
  // document.addEventListener('contextmenu', function(e) {
  //   if (e.target.classList.contains('no-context')) {
  //     e.preventDefault();
  //   }
  // });

  // ============================================
  // DOM READY
  // ============================================
  document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initScrollAnimations();
    initHeaderScroll();
    initSmoothScroll();
    initFormValidation();
    initSecurityMeasures();
  });

  // ============================================
  // NAVIGATION
  // ============================================
  function initNavigation() {
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (mobileToggle && navLinks) {
      mobileToggle.addEventListener('click', function () {
        this.classList.toggle('active');
        navLinks.classList.toggle('active');

        // Update ARIA attributes
        const isExpanded = navLinks.classList.contains('active');
        mobileToggle.setAttribute('aria-expanded', isExpanded);
      });

      // Close menu when clicking outside
      document.addEventListener('click', function (e) {
        if (!mobileToggle.contains(e.target) && !navLinks.contains(e.target)) {
          mobileToggle.classList.remove('active');
          navLinks.classList.remove('active');
          mobileToggle.setAttribute('aria-expanded', 'false');
        }
      });

      // Close menu on escape key
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && navLinks.classList.contains('active')) {
          mobileToggle.classList.remove('active');
          navLinks.classList.remove('active');
          mobileToggle.setAttribute('aria-expanded', 'false');
        }
      });
    }

    // Set active nav link based on current page
    const currentPath = window.location.pathname;
    const navLinksItems = document.querySelectorAll('.nav-link');

    navLinksItems.forEach(function (link) {
      const href = link.getAttribute('href');
      if (currentPath.endsWith(href) || (currentPath === '/' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  }

  // ============================================
  // HEADER SCROLL EFFECT
  // ============================================
  function initHeaderScroll() {
    const header = document.querySelector('.header');

    if (!header) return;

    let lastScroll = 0;
    const scrollThreshold = 100;

    function handleScroll() {
      const currentScroll = window.pageYOffset;

      if (currentScroll > scrollThreshold) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }

      lastScroll = currentScroll;
    }

    // Throttle scroll event
    let ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  // ============================================
  // SCROLL ANIMATIONS
  // ============================================
  function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right, .scale-in');

    if (!animatedElements.length) return;

    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
      // Fallback: show all elements
      animatedElements.forEach(function (el) {
        el.classList.add('visible');
      });
      return;
    }

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    animatedElements.forEach(function (el) {
      observer.observe(el);
    });
  }

  // ============================================
  // SMOOTH SCROLL
  // ============================================
  function initSmoothScroll() {
    const scrollLinks = document.querySelectorAll('a[href^="#"]');

    scrollLinks.forEach(function (link) {
      link.addEventListener('click', function (e) {
        const href = this.getAttribute('href');

        if (href === '#') return;

        const target = document.querySelector(href);

        if (target) {
          e.preventDefault();

          const headerHeight = document.querySelector('.header')?.offsetHeight || 80;
          const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });

          // Update URL without triggering scroll
          history.pushState(null, null, href);
        }
      });
    });
  }

  // ============================================
  // FORM VALIDATION & SECURITY
  // ============================================
  function initFormValidation() {
    const contactForm = document.getElementById('contactForm');

    if (!contactForm) return;

    // Track form submission timing (bot detection)
    let formLoadTime = Date.now();

    // Rate limiting
    let submissionCount = 0;
    const maxSubmissions = 3;
    const submissionWindow = 60000; // 1 minute
    let firstSubmissionTime = null;

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      // Security checks
      const timeSinceLoad = Date.now() - formLoadTime;

      // Bot detection: Form submitted too quickly (less than 3 seconds)
      if (timeSinceLoad < 3000) {
        console.warn('Security: Form submitted too quickly');
        showFormStatus('error', 'Please take your time filling out the form.');
        return;
      }

      // Check honeypot field
      const honeypot = contactForm.querySelector('.hp-field input');
      if (honeypot && honeypot.value !== '') {
        console.warn('Security: Honeypot triggered');
        // Silently fail for bots
        showFormStatus('success', 'Thank you for your message!');
        return;
      }

      // Rate limiting check
      if (firstSubmissionTime && (Date.now() - firstSubmissionTime) < submissionWindow) {
        submissionCount++;
        if (submissionCount > maxSubmissions) {
          showFormStatus('error', 'Too many submissions. Please try again later.');
          return;
        }
      } else {
        firstSubmissionTime = Date.now();
        submissionCount = 1;
      }

      // Validate form fields
      if (!validateForm(contactForm)) {
        return;
      }

      // Show sending status
      showFormStatus('sending', 'Verifying and sending your message...');

      // Get reCAPTCHA token and submit
      // Check if grecaptcha is available (reCAPTCHA loaded)
      if (typeof grecaptcha !== 'undefined') {
        grecaptcha.ready(function () {
          // Replace YOUR_RECAPTCHA_SITE_KEY with your actual site key
          grecaptcha.execute('YOUR_RECAPTCHA_SITE_KEY', { action: 'contact_submit' })
            .then(function (token) {
              // Add token to form
              var recaptchaInput = document.getElementById('recaptchaResponse');
              if (recaptchaInput) {
                recaptchaInput.value = token;
              }
              // Now submit the form
              submitFormToWeb3Forms(contactForm, formLoadTime);
            })
            .catch(function (error) {
              console.error('reCAPTCHA error:', error);
              // Submit anyway if reCAPTCHA fails (honeypot still active)
              submitFormToWeb3Forms(contactForm, formLoadTime);
            });
        });
      } else {
        // reCAPTCHA not loaded, submit with other protections
        submitFormToWeb3Forms(contactForm, formLoadTime);
      }
    });

    // Real-time validation
    const inputs = contactForm.querySelectorAll('.form-input, .form-textarea');
    inputs.forEach(function (input) {
      input.addEventListener('blur', function () {
        validateField(this);
      });

      input.addEventListener('input', function () {
        // Remove invalid state on input
        this.classList.remove('invalid');
      });
    });
  }

  // Submit form to Web3Forms API
  function submitFormToWeb3Forms(contactForm, formLoadTime) {
    const formData = new FormData(contactForm);

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        if (data.success) {
          showFormStatus('success', 'Thank you! We\'ll get back to you within 24 hours.');
          contactForm.reset();
        } else {
          showFormStatus('error', 'Something went wrong. Please try again or email us directly.');
        }
      })
      .catch(function (error) {
        console.error('Form submission error:', error);
        showFormStatus('error', 'Connection error. Please try again or email us directly.');
      });
  }

  function validateForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(function (field) {
      if (!validateField(field)) {
        isValid = false;
      }
    });

    return isValid;
  }

  function validateField(field) {
    const value = field.value.trim();
    const type = field.type;
    const name = field.name;

    // Remove previous states
    field.classList.remove('valid', 'invalid');

    // Check required
    if (field.hasAttribute('required') && !value) {
      field.classList.add('invalid');
      return false;
    }

    // Email validation
    if (type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        field.classList.add('invalid');
        return false;
      }
    }

    // Check for potentially malicious content
    if (containsMaliciousContent(value)) {
      field.classList.add('invalid');
      return false;
    }

    // Check minimum length for message
    if (name === 'message' && value.length < 10) {
      field.classList.add('invalid');
      return false;
    }

    field.classList.add('valid');
    return true;
  }

  function containsMaliciousContent(str) {
    // Check for common XSS patterns
    const maliciousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe/gi,
      /<object/gi,
      /<embed/gi,
      /data:/gi
    ];

    for (let pattern of maliciousPatterns) {
      if (pattern.test(str)) {
        return true;
      }
    }

    return false;
  }

  function sanitizeInput(str) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    };
    return str.replace(/[&<>"'/]/g, function (char) {
      return map[char];
    });
  }

  function showFormStatus(type, message) {
    const statusEl = document.querySelector('.form-status');
    if (!statusEl) return;

    statusEl.className = 'form-status ' + type;
    statusEl.textContent = message;
    statusEl.style.display = 'block';

    // Auto-hide success/error after 5 seconds
    if (type !== 'sending') {
      setTimeout(function () {
        statusEl.style.display = 'none';
      }, 5000);
    }
  }

  // ============================================
  // ADDITIONAL SECURITY MEASURES
  // ============================================
  function initSecurityMeasures() {
    // Prevent form resubmission on refresh
    if (window.history.replaceState) {
      window.history.replaceState(null, null, window.location.href);
    }

    // Add rel="noopener noreferrer" to external links
    const externalLinks = document.querySelectorAll('a[target="_blank"]');
    externalLinks.forEach(function (link) {
      const rel = link.getAttribute('rel') || '';
      if (!rel.includes('noopener')) {
        link.setAttribute('rel', (rel + ' noopener noreferrer').trim());
      }
    });

    // Disable autocomplete on sensitive fields
    const sensitiveFields = document.querySelectorAll('input[type="password"], input[name="email"]');
    sensitiveFields.forEach(function (field) {
      if (!field.hasAttribute('autocomplete')) {
        field.setAttribute('autocomplete', 'off');
      }
    });
  }

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  // Debounce function for performance
  function debounce(func, wait) {
    let timeout;
    return function executedFunction() {
      const context = this;
      const args = arguments;
      const later = function () {
        timeout = null;
        func.apply(context, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Throttle function for scroll events
  function throttle(func, limit) {
    let inThrottle;
    return function () {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(function () {
          inThrottle = false;
        }, limit);
      }
    };
  }

})();

