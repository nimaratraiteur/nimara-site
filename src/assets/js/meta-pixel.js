/* ═══════════════════════════════════════
   META PIXEL + TRACKING ÉVÉNEMENTS — Nimara
   Events custom envoyés à Meta pour retargeting et conversion
   ═══════════════════════════════════════ */
(function() {
  // Ne rien faire si fbq n'est pas chargé (snippet Meta absent)
  if (typeof window.fbq !== 'function') return;

  // Helper pour émettre un event Meta + GA4 en parallèle
  function track(eventName, params) {
    try {
      window.fbq('track', eventName, params || {});
      if (typeof gtag === 'function') {
        gtag('event', eventName.toLowerCase(), Object.assign({ event_category: 'conversion' }, params || {}));
      }
    } catch(e) { console.warn('tracking failed', e); }
  }

  // Détecte le type de page
  const path = window.location.pathname;

  // ── ViewContent automatique sur pages produits ──
  if (path.includes('/boutique')) {
    track('ViewContent', { content_category: 'shop', content_type: 'product_catalog' });
  }
  if (path.includes('/carte')) {
    track('ViewContent', { content_category: 'menu' });
  }
  if (path.includes('/chavannes')) {
    track('ViewContent', { content_category: 'chavannes' });
  }
  if (path.includes('/calculateur')) {
    track('ViewContent', { content_category: 'quote_tool' });
  }
  if (path.includes('/entreprises')) {
    track('ViewContent', { content_category: 'b2b' });
  }

  // ── InitiateCheckout quand on clique un bouton Stripe ──
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href*="buy.stripe.com"]');
    if (link) {
      const card = link.closest('.shop-card');
      const name = card ? card.querySelector('h3')?.textContent : 'product';
      const priceEl = card ? card.querySelector('.shop-price') : null;
      const priceText = priceEl ? priceEl.textContent.match(/(\d+(?:\.\d+)?)/) : null;
      track('InitiateCheckout', {
        content_name: name,
        value: priceText ? parseFloat(priceText[1]) : 0,
        currency: 'CHF'
      });
    }
  });

  // ── CTA WhatsApp → Contact ──
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href*="wa.me"]');
    if (link) {
      track('Contact', { channel: 'whatsapp', source: path });
    }
  });

  // ── Lead events sur les forms ──
  // Exit popup, calculateur email, quiz, airport → tous déclenchent Lead
  const formsToTrack = ['nimara-exit-capture', 'nimara-calc-capture', 'nimara-quiz'];
  document.addEventListener('submit', (e) => {
    const form = e.target;
    if (!form || !form.name) return;
    if (formsToTrack.includes(form.name)) {
      let content = 'email_capture';
      if (form.name === 'nimara-calc-capture') content = 'event_quote_email';
      else if (form.name === 'nimara-quiz') content = 'quiz_completed';
      else if (form.name === 'nimara-exit-capture') content = 'exit_popup';
      track('Lead', { content_name: content });
      track('CompleteRegistration', { content_name: content });
    }
  });

  // ── Expose helper pour tracking manuel depuis autres scripts ──
  window.nimaraTrack = track;
})();
