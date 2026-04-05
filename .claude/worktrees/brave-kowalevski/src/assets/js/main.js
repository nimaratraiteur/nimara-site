/* ══════════════════════════════════════════
   NIMARA · main.js
   ══════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Header scroll state ─────────────────── */
  const header = document.getElementById('site-header');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Mobile nav toggle ───────────────────── */
  const navToggle = document.getElementById('nav-toggle');
  const siteNav = document.getElementById('site-nav');
  if (navToggle && siteNav) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      siteNav.classList.toggle('is-open', !expanded);
    });
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!navToggle.contains(e.target) && !siteNav.contains(e.target)) {
        navToggle.setAttribute('aria-expanded', 'false');
        siteNav.classList.remove('is-open');
      }
    });
    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        navToggle.setAttribute('aria-expanded', 'false');
        siteNav.classList.remove('is-open');
      }
    });
  }

  /* ── Scroll animation (Intersection Observer) ─ */
  const animEls = document.querySelectorAll('.animate-fade-up');
  if (animEls.length > 0 && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    animEls.forEach((el) => observer.observe(el));
  }

  /* ── Menu filter tabs ────────────────────── */
  const filterTabs = document.querySelectorAll('.filter-tab');
  const menuCards = document.querySelectorAll('.menu-card');
  const menuSections = document.querySelectorAll('.menu-section');

  if (filterTabs.length > 0) {
    filterTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        filterTabs.forEach((t) => t.classList.remove('is-active'));
        tab.classList.add('is-active');

        const filter = tab.dataset.filter;

        if (filter === 'all') {
          menuSections.forEach((s) => s.classList.remove('hidden'));
          menuCards.forEach((c) => c.classList.remove('hidden'));
        } else {
          menuSections.forEach((section) => {
            const hasMatch = section.dataset.category === filter;
            section.classList.toggle('hidden', !hasMatch);
          });
        }
      });
    });
  }

  /* ── Language toggle (menu page) ────────────── */
  const langBtns = document.querySelectorAll('.lang-btn');
  if (langBtns.length > 0) {
    langBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        langBtns.forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        const lang = btn.dataset.lang;
        document.querySelectorAll('[data-lang-fr]').forEach((el) => {
          el.textContent = lang === 'en' ? el.dataset.langEn : el.dataset.langFr;
        });
      });
    });
  }

  /* ── Date range button active state ─────────── */
  document.querySelectorAll('.dr-btn').forEach((btn) => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.dr-btn').forEach((b) => b.classList.remove('active'));
      this.classList.add('active');
    });
  });

  /* ── WhatsApp FAB show after scroll ─────────── */
  const fab = document.getElementById('whatsapp-fab');
  if (fab) {
    let fabVisible = false;
    const toggleFab = () => {
      const shouldShow = window.scrollY > 300;
      if (shouldShow !== fabVisible) {
        fabVisible = shouldShow;
        fab.style.transform = shouldShow
          ? 'translateY(0) scale(1)'
          : 'translateY(80px) scale(0.8)';
        fab.style.opacity = shouldShow ? '1' : '0';
        fab.style.pointerEvents = shouldShow ? '' : 'none';
      }
    };
    // Start hidden
    fab.style.transform = 'translateY(80px) scale(0.8)';
    fab.style.opacity = '0';
    fab.style.transition = 'transform 0.35s cubic-bezier(.22,1,.36,1), opacity 0.35s ease';
    fab.style.pointerEvents = 'none';
    window.addEventListener('scroll', toggleFab, { passive: true });
    toggleFab();
  }

  /* ── WhatsApp KPI tracking ───────────────────── */
  const WA_KEY = 'nimara_wa_clicks';

  function getWaStats() {
    try {
      return JSON.parse(localStorage.getItem(WA_KEY) || '{"total":0,"clicks":[]}');
    } catch (_) { return { total: 0, clicks: [] }; }
  }

  function trackWaClick(source) {
    const stats = getWaStats();
    stats.total = (stats.total || 0) + 1;
    stats.clicks.push({ t: new Date().toISOString(), source, url: location.pathname });
    // Keep last 200 entries
    if (stats.clicks.length > 200) stats.clicks = stats.clicks.slice(-200);
    try { localStorage.setItem(WA_KEY, JSON.stringify(stats)); } catch (_) {}
    // Also push to Vanessa events if widget present
    if (window.VANESSA_EVENTS) {
      window.VANESSA_EVENTS.push({ type: 'whatsapp_click', data: { source, page: location.pathname } });
    }
  }

  // Attach to all WhatsApp CTAs
  document.querySelectorAll('a[href*="wa.me"]').forEach((el) => {
    el.addEventListener('click', () => {
      const source = el.dataset.waTrack || el.className || 'generic';
      trackWaClick(source);
    });
  });

  // Expose stats globally for Vanessa dashboard
  window.NIMARA_WA_STATS = {
    get: getWaStats,
    reset: () => localStorage.removeItem(WA_KEY),
  };

})();
