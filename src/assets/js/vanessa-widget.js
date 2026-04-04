/* ══════════════════════════════════════════
   VANESSA WIDGET · vanessa-widget.js

   Public-facing AI persona chatbot for Nimara.
   Currently runs on mock/local logic.

   TO CONNECT A REAL BACKEND:
   - Replace sendToBackend() with a fetch() to your n8n webhook or API
   - Replace VAPI_TOKEN and call vapiStart() for voice
   - Session events are logged to window.VANESSA_EVENTS for analytics
   ══════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Session tracking ─────────────────────── */
  const SESSION_ID = 'nv-' + Math.random().toString(36).slice(2, 6);
  window.VANESSA_EVENTS = window.VANESSA_EVENTS || [];

  function trackEvent(type, data) {
    const event = { type, data, t: new Date().toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit' }) };
    window.VANESSA_EVENTS.push(event);
    // TODO: POST to your analytics endpoint
    // fetch('/api/vanessa/event', { method:'POST', body: JSON.stringify({ sessionId: SESSION_ID, ...event }) });
  }

  /* ── DOM refs ─────────────────────────────── */
  const trigger   = document.getElementById('van-trigger');
  const panel     = document.getElementById('van-panel');
  const closeBtn  = document.getElementById('van-close');
  const messagesEl = document.getElementById('van-messages');
  const inputForm = document.getElementById('van-input-form');
  const inputEl   = document.getElementById('van-input');
  const quickReplies = document.getElementById('van-quick-replies');

  if (!trigger || !panel) return; // Widget not on this page

  /* ── State ────────────────────────────────── */
  let isOpen = false;
  let greeted = false;

  /* ── Open / Close ─────────────────────────── */
  function openPanel() {
    isOpen = true;
    trigger.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');
    panel.removeAttribute('hidden');
    requestAnimationFrame(() => panel.classList.add('is-visible'));
    inputEl.focus();
    if (!greeted) { greet(); greeted = true; }
    trackEvent('open', { sessionId: SESSION_ID });
  }

  function closePanel() {
    isOpen = false;
    trigger.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false');
    panel.classList.remove('is-visible');
    setTimeout(() => panel.setAttribute('hidden', ''), 350);
    trackEvent('close', {});
  }

  trigger.addEventListener('click', () => isOpen ? closePanel() : openPanel());
  closeBtn.addEventListener('click', closePanel);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) closePanel();
  });

  /* ── Message helpers ──────────────────────── */
  function appendMessage(role, text) {
    const wrap = document.createElement('div');
    wrap.className = `van-msg ${role}`;

    const avatarEl = document.createElement('div');
    if (role === 'van') {
      avatarEl.className = 'van-msg-avatar';
      avatarEl.innerHTML = `<img src="/assets/images/vanessa-avatar.png" alt="Vanessa" onerror="this.parentElement.className='van-msg-avatar-fb';this.parentElement.textContent='V'">`;
    } else {
      avatarEl.className = 'van-msg-avatar-fb';
      avatarEl.textContent = 'C';
    }

    const bubble = document.createElement('div');
    bubble.className = 'van-bubble';
    bubble.textContent = text;

    wrap.appendChild(avatarEl);
    wrap.appendChild(bubble);
    messagesEl.appendChild(wrap);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return wrap;
  }

  function showTyping() {
    const wrap = document.createElement('div');
    wrap.className = 'van-msg van van-typing';
    wrap.id = 'van-typing-indicator';
    const avatarEl = document.createElement('div');
    avatarEl.className = 'van-msg-avatar';
    avatarEl.innerHTML = `<img src="/assets/images/vanessa-avatar.png" alt="Vanessa" onerror="this.parentElement.className='van-msg-avatar-fb';this.parentElement.textContent='V'">`;
    const bubble = document.createElement('div');
    bubble.className = 'van-bubble';
    bubble.innerHTML = `<div class="van-dots"><span></span><span></span><span></span></div>`;
    wrap.appendChild(avatarEl);
    wrap.appendChild(bubble);
    messagesEl.appendChild(wrap);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return wrap;
  }

  function removeTyping() {
    const el = document.getElementById('van-typing-indicator');
    if (el) el.remove();
  }

  function setQuickReplies(replies) {
    quickReplies.innerHTML = '';
    replies.forEach((r) => {
      const btn = document.createElement('button');
      btn.className = 'van-qr-btn';
      btn.type = 'button';
      btn.textContent = r.label;
      btn.addEventListener('click', () => {
        trackEvent('button_click', { label: r.label });
        setQuickReplies([]);
        appendMessage('user', r.label);
        handleUserMessage(r.value || r.label, true);
      });
      quickReplies.appendChild(btn);
    });
  }

  /* ── Greeting ─────────────────────────────── */
  function greet() {
    setTimeout(() => {
      const typing = showTyping();
      setTimeout(() => {
        removeTyping();
        appendMessage('van', 'Bonjour et bienvenue chez Nimara 🌟 Je suis Vanessa, Directrice IA. Comment puis-je vous aider ?');
        setQuickReplies([
          { label: '🥐 Box petit-déjeuner', value: 'Je voudrais commander une box petit-déjeuner' },
          { label: '🍱 Box corporate', value: 'Je cherche une box corporate pour mon équipe' },
          { label: '🎉 Buffet événement', value: 'Je prépare un événement et je cherche un service traiteur' },
          { label: '📍 Points de retrait', value: 'Où puis-je récupérer ma commande ?' },
        ]);
        trackEvent('greeted', { sessionId: SESSION_ID });
      }, 900);
    }, 400);
  }

  /* ── Mock AI responses ────────────────────── */
  /* TODO: Replace with fetch() to your n8n/OpenAI/Vapi endpoint */
  const RESPONSES = [
    {
      triggers: ['petit-déjeuner', 'breakfast', 'matin', 'box', 'bircher', 'croissant'],
      reply: 'Parfait ! Nos box petit-déjeuner Oh Martine sont disponibles dès 10 personnes : Birchers, Banana Bread, Cinnamon Rolls, Croissants pur beurre. Vous souhaitez commander ou recevoir un devis ?',
      buttons: [
        { label: '📋 Demander un devis', value: 'Je souhaite recevoir un devis pour une box petit-déjeuner' },
        { label: '🛒 Commander sur WhatsApp', value: 'commander_whatsapp' },
      ],
      signal: 'hot',
    },
    {
      triggers: ['corporate', 'entreprise', 'bureau', 'équipe', 'team', 'lunch', 'déjeuner'],
      reply: 'Excellent choix ! Nos box corporate sont livrées dans tout Genève. Pour combien de personnes et à quelle fréquence ? Nous avons des formules récurrentes hebdomadaires très populaires.',
      buttons: [
        { label: '📋 Demander un devis', value: 'Je souhaite un devis corporate' },
        { label: '📱 Contacter par WhatsApp', value: 'commander_whatsapp' },
      ],
      signal: 'hot',
    },
    {
      triggers: ['buffet', 'événement', 'event', 'séminaire', 'cocktail', 'fête', 'anniversaire'],
      reply: 'Nimara excelle dans les événements ! Du cocktail Chavannes aux saveurs du monde au buffet desserts Oh Martine. Pour combien de personnes et quelle date envisagez-vous ?',
      buttons: [
        { label: '📋 Demander un devis', value: 'Je veux un devis pour un buffet événement' },
        { label: '📞 Être rappelé', value: 'Je souhaite être rappelé pour discuter de mon événement' },
      ],
      signal: 'hot',
    },
    {
      triggers: ['retrait', 'livraison', 'adresse', 'où', 'lieu', 'eaux-vives', 'montbrillant', 'chavannes'],
      reply: 'Nous avons deux points de retrait à Genève : Eaux-Vives et Montbrillant. Livraison disponible dans tout le canton. Quel point vous convient ?',
      buttons: [
        { label: '📍 Eaux-Vives', value: 'Eaux-Vives me convient mieux' },
        { label: '📍 Montbrillant', value: 'Montbrillant est plus pratique pour moi' },
      ],
      signal: 'warm',
    },
    {
      triggers: ['devis', 'prix', 'tarif', 'combien', 'cost'],
      reply: 'Pour vous établir un devis précis, pouvez-vous me préciser le nombre de personnes, le type de prestation (petit-déjeuner, déjeuner, buffet) et la date ? Je vous reviens sous 2h.',
      buttons: [
        { label: '📧 Envoyer par email', value: 'Je vais vous envoyer les détails par email' },
        { label: '💬 Continuer sur WhatsApp', value: 'commander_whatsapp' },
      ],
      signal: 'hot',
    },
    {
      triggers: ['allergie', 'allergène', 'sans gluten', 'vegan', 'végétarien', 'halal', 'intolérance'],
      reply: 'Nous prenons les allergies très au sérieux. Notre atelier manipule gluten, lactose, fruits à coque, œufs et sésame. Pour des besoins spécifiques, contactez-nous directement pour une adaptation sur mesure.',
      buttons: [
        { label: '📱 Parler à l\'équipe', value: 'commander_whatsapp' },
      ],
      signal: 'warm',
    },
    {
      triggers: ['chavannes', 'inde', 'indien', 'pakora', 'samosa', 'naan', 'épices'],
      reply: 'Le buffet Chavannes est notre offre saveurs du monde : samosas légumes, pakoras épinards, naans beurre-ail, wraps végé… Un voyage culinaire idéal pour vos événements multiculturels !',
      buttons: [
        { label: '🍛 Voir le menu Chavannes', value: 'Montrez-moi le menu Chavannes complet' },
        { label: '📋 Demander un devis', value: 'Je veux un devis pour le buffet Chavannes' },
      ],
      signal: 'warm',
    },
    {
      triggers: ['délices', 'pâtisserie', 'gâteau', 'macaron', 'tarte', 'cake'],
      reply: 'Nos Délices Oh Martine sont la signature de Marine : Paris-Brest praliné, Macarons assortis, Éclair Valrhona, Banana Bread… Chaque pièce est une invitation à la gourmandise.',
      buttons: [
        { label: '🎂 Voir les Délices', value: 'Je veux voir la gamme délices complète' },
        { label: '🛒 Commander', value: 'commander_whatsapp' },
      ],
      signal: 'warm',
    },
  ];

  function getResponse(text) {
    const lower = text.toLowerCase();
    for (const r of RESPONSES) {
      if (r.triggers.some((t) => lower.includes(t))) return r;
    }
    return {
      reply: 'Merci pour votre message ! Pour vous répondre au mieux, le plus simple est de nous contacter directement par WhatsApp. Notre équipe répond sous 15 minutes.',
      buttons: [
        { label: '💬 WhatsApp maintenant', value: 'commander_whatsapp' },
      ],
      signal: 'cold',
    };
  }

  /* ── Handle user message ──────────────────── */
  function handleUserMessage(text, isButton = false) {
    if (!isButton) appendMessage('user', text);

    // Special: redirect to WhatsApp
    if (text === 'commander_whatsapp') {
      const waUrl = 'https://wa.me/41225576020?text=Bonjour%20Nimara%2C%20je%20souhaite%20passer%20une%20commande%20%F0%9F%A5%90';
      window.open(waUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    setQuickReplies([]);
    const typing = showTyping();
    const response = getResponse(text);
    trackEvent('message', { text, signal: response.signal, sessionId: SESSION_ID });

    const delay = 600 + Math.random() * 600;
    setTimeout(() => {
      removeTyping();
      appendMessage('van', response.reply);
      if (response.buttons) setQuickReplies(response.buttons);
    }, delay);
  }

  /* ── Form submit ──────────────────────────── */
  inputForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = inputEl.value.trim();
    if (!text) return;
    inputEl.value = '';
    setQuickReplies([]);
    appendMessage('user', text);
    handleUserMessage(text, true);
  });

  /* ── Auto-open after delay (optional) ──────── */
  // Uncomment to auto-open after 8s on homepage only
  // if (window.location.pathname === '/') {
  //   setTimeout(() => { if (!isOpen) openPanel(); }, 8000);
  // }

})();
