/* Nimara — Google Analytics Event Tracking */
(function() {
  if (typeof gtag !== 'function') return;

  // Track all WhatsApp clicks
  document.addEventListener('click', function(e) {
    const link = e.target.closest('a[href*="wa.me"], .btn-whatsapp, .btn-wa, .nav-wa');
    if (link) {
      gtag('event', 'whatsapp_click', {
        event_category: 'contact',
        event_label: document.title,
        page_path: window.location.pathname
      });
    }
  });

  // Track phone clicks
  document.addEventListener('click', function(e) {
    const link = e.target.closest('a[href^="tel:"]');
    if (link) {
      gtag('event', 'phone_click', {
        event_category: 'contact',
        event_label: link.href
      });
    }
  });

  // Track page-specific events
  var path = window.location.pathname;

  // Entreprises page viewed
  if (path.includes('/entreprises')) {
    gtag('event', 'page_entreprises_vue', {
      event_category: 'b2b',
      event_label: 'entreprises'
    });
  }

  // Commander page viewed
  if (path.includes('/commander')) {
    var params = new URLSearchParams(window.location.search);
    gtag('event', 'commander_vue', {
      event_category: 'b2b',
      event_label: params.get('name') || 'direct',
      company_id: params.get('id') || 'none'
    });
  }

  // Ambassadeur page viewed (QR code scan)
  if (path.includes('/ambassadeur')) {
    gtag('event', 'ambassadeur_scan', {
      event_category: 'acquisition',
      event_label: 'qr_code',
      referrer: document.referrer || 'direct'
    });
  }

  // Carte page viewed
  if (path.includes('/carte')) {
    gtag('event', 'carte_vue', {
      event_category: 'menu',
      event_label: 'carte'
    });
  }

  // Chavannes page viewed
  if (path.includes('/chavannes')) {
    gtag('event', 'chavannes_vue', {
      event_category: 'menu',
      event_label: 'chavannes'
    });
  }

  // Delices POS viewed
  if (path.includes('/delices-pos')) {
    gtag('event', 'pos_vue', {
      event_category: 'pos',
      event_label: 'delices'
    });
  }

  // Track scroll depth (25%, 50%, 75%, 100%)
  var scrollMarks = { 25: false, 50: false, 75: false, 100: false };
  window.addEventListener('scroll', function() {
    var scrollPct = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
    [25, 50, 75, 100].forEach(function(mark) {
      if (scrollPct >= mark && !scrollMarks[mark]) {
        scrollMarks[mark] = true;
        gtag('event', 'scroll_depth', {
          event_category: 'engagement',
          event_label: mark + '%',
          page_path: path
        });
      }
    });
  });

  // Track time on page (30s, 60s, 120s, 300s)
  [30, 60, 120, 300].forEach(function(sec) {
    setTimeout(function() {
      gtag('event', 'time_on_page', {
        event_category: 'engagement',
        event_label: sec + 's',
        page_path: path
      });
    }, sec * 1000);
  });

  // Track outbound link clicks
  document.addEventListener('click', function(e) {
    var link = e.target.closest('a[href^="http"]');
    if (link && !link.href.includes('nimara.io')) {
      gtag('event', 'outbound_click', {
        event_category: 'outbound',
        event_label: link.href,
        page_path: path
      });
    }
  });
})();
