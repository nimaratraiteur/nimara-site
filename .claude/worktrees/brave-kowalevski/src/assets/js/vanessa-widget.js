/* ══════════════════════════════════════════
   VANESSA WIDGET · vanessa-widget.js

   Vanessa — Directrice IA RH, Médias, Marketing Digital & Relations Publiques
   Public-facing AI persona chatbot for Nimara.

   TO CONNECT A REAL BACKEND:
   - Replace sendToBackend() with a fetch() to your n8n webhook or API
   - Replace VAPI_TOKEN and call vapiStart() for voice
   - Session events are logged to window.VANESSA_EVENTS and localStorage
   ══════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Session & Analytics ─────────────────── */
  const SESSION_ID = 'nv-' + Math.random().toString(36).slice(2, 8);
  window.VANESSA_EVENTS = window.VANESSA_EVENTS || [];

  function trackEvent(type, data) {
    const event = {
      type,
      data,
      sessionId: SESSION_ID,
      page: window.location.pathname,
      t: new Date().toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit' }),
      ts: Date.now(),
    };
    window.VANESSA_EVENTS.push(event);

    // Persist to localStorage for analytics dashboard
    try {
      const stored = JSON.parse(localStorage.getItem('vanessa_events') || '[]');
      stored.push(event);
      // Keep last 200 events
      if (stored.length > 200) stored.splice(0, stored.length - 200);
      localStorage.setItem('vanessa_events', JSON.stringify(stored));
    } catch (e) {
      // localStorage unavailable, ignore
    }
  }

  /* ── DOM refs ─────────────────────────────── */
  const trigger     = document.getElementById('van-trigger');
  const panel       = document.getElementById('van-panel');
  const closeBtn    = document.getElementById('van-close');
  const messagesEl  = document.getElementById('van-messages');
  const inputForm   = document.getElementById('van-input-form');
  const inputEl     = document.getElementById('van-input');
  const quickReplies = document.getElementById('van-quick-replies');

  if (!trigger || !panel) return;

  /* ── State ────────────────────────────────── */
  let isOpen = false;
  let greeted = false;
  const conversationSummary = [];

  /* ── Page detection ───────────────────────── */
  function detectPage() {
    const path = window.location.pathname;
    if (path.includes('/calculateur')) return 'calculator';
    if (path.includes('/carte')) return 'carte';
    if (path.includes('/delices') || path.includes('/douceurs')) return 'douceurs';
    if (path.includes('/chavannes')) return 'saveurs';
    return 'landing';
  }

  /* ── Contextual greeting ──────────────────── */
  function getGreeting() {
    const page = detectPage();
    const greetings = {
      landing: 'Bonjour et bienvenue chez Nimara! Je suis Vanessa, votre conseillère. Vous organisez un événement, cherchez un traiteur, ou souhaitez découvrir nos créations?',
      carte: 'Vous explorez notre carte! Dites-moi ce qui vous tente, je peux vous conseiller selon vos goûts ou vos allergies.',
      calculator: 'Besoin d\'aide pour composer votre menu? Dites-moi le nombre d\'invités et l\'occasion!',
      douceurs: 'Bienvenue dans notre univers sucré! Nos pâtisseries sont préparées chaque matin. Cherchez-vous un assortiment pour un événement ou pour le plaisir?',
      saveurs: 'Vous explorez nos Saveurs du Monde! Samosas, pakoras, currys, naans… Dites-moi pour combien de personnes et je vous compose un buffet sur mesure.',
    };
    return greetings[page] || greetings.landing;
  }

  /* ── Initial quick replies ────────────────── */
  function getInitialQuickReplies() {
    return [
      { label: 'Organiser un événement', value: 'Je souhaite organiser un événement' },
      { label: 'Buffet événement', value: 'Parlez-moi des buffets événement' },
      { label: 'Box petit-déjeuner', value: 'Je voudrais une box petit-déjeuner' },
      { label: 'Voir la carte', value: 'Je veux voir la carte complète' },
      { label: 'Nous contacter', value: 'commander_whatsapp' },
    ];
  }

  /* ── Open / Close ─────────────────────────── */
  function openPanel() {
    isOpen = true;
    trigger.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');
    panel.removeAttribute('hidden');
    requestAnimationFrame(() => panel.classList.add('is-visible'));
    inputEl.focus();
    if (!greeted) { greet(); greeted = true; }
    trackEvent('open', { page: detectPage() });
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
      avatarEl.textContent = 'V';
    }

    const bubble = document.createElement('div');
    bubble.className = 'van-bubble';
    bubble.textContent = text;

    wrap.appendChild(avatarEl);
    wrap.appendChild(bubble);
    messagesEl.appendChild(wrap);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    // Track for WhatsApp handoff summary
    conversationSummary.push({ role, text });

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
        trackEvent('button_click', { label: r.label, page: detectPage() });
        setQuickReplies([]);
        if (r.value !== 'commander_whatsapp') {
          appendMessage('user', r.label);
        }
        handleUserMessage(r.value || r.label, true);
      });
      quickReplies.appendChild(btn);
    });
  }

  /* ── Greeting ─────────────────────────────── */
  function greet() {
    setTimeout(() => {
      showTyping();
      setTimeout(() => {
        removeTyping();
        const greeting = getGreeting();
        appendMessage('van', greeting);
        setQuickReplies(getInitialQuickReplies());
        trackEvent('greeted', { page: detectPage() });
      }, 900);
    }, 400);
  }

  /* ── WhatsApp handoff ─────────────────────── */
  function buildWhatsAppUrl(summary) {
    const lines = summary
      .slice(-6)
      .map((m) => (m.role === 'user' ? `Moi: ${m.text}` : `Vanessa: ${m.text}`))
      .join('\n');
    const intro = 'Bonjour Nimara, je vous contacte suite à ma conversation avec Vanessa.';
    const message = lines.length > 0 ? `${intro}\n\n${lines}` : intro;
    return `https://wa.me/41225576020?text=${encodeURIComponent(message)}`;
  }

  /* ── Response engine ──────────────────────── */
  const RESPONSES = [
    {
      triggers: ['événement', 'organiser', 'organisation', 'séminaire', 'anniversaire', 'fête', 'conférence', 'inauguration'],
      reply: 'Parfait ! Pour votre événement, j\'ai besoin de quelques informations : combien de personnes attendez-vous, et quel est le type de prestation souhaitée (cocktail, buffet déjeuner, petit-déjeuner, desserts) ?',
      buttons: [
        { label: 'Moins de 20 personnes', value: 'Nous serons moins de 20 personnes' },
        { label: '20 à 50 personnes', value: 'Nous serons entre 20 et 50 personnes' },
        { label: 'Plus de 50 personnes', value: 'Nous serons plus de 50 personnes' },
        { label: 'Demander un devis', value: 'commander_whatsapp' },
      ],
      signal: 'hot',
    },
    {
      triggers: ['buffet', 'cocktail', 'saveurs', 'monde', 'traiteur', 'indien', 'asiatique', 'épices', 'naan', 'samosa', 'pakora', 'curry'],
      reply: 'Notre buffet Saveurs du Monde est idéal pour vos événements multiculturels : samosas légumes-menthe, pakoras épinards, naans beurre-ail, currys mijotés, dal rouge... Un voyage culinaire pour vos invités ! Formules dès 30 personnes à partir de CHF 780.',
      buttons: [
        { label: 'Formule 30 personnes', value: 'Je souhaite la formule cocktail saveurs du monde pour 30 personnes' },
        { label: 'Plus de 50 personnes', value: 'Nous serons plus de 50 personnes pour le buffet' },
        { label: 'Demander un devis', value: 'commander_whatsapp' },
      ],
      signal: 'hot',
    },
    {
      triggers: ['petit-déjeuner', 'breakfast', 'matin', 'box', 'bircher', 'cinnamon', 'banana bread', 'brookie'],
      reply: 'Nos box petit-déjeuner sont disponibles dès 10 personnes : Bircher muesli framboise & mangue, Banana Bread signature, Cinnamon Rolls, croissants pur beurre, pains au chocolat. CHF 145 pour 10 personnes, livraison Genève incluse.',
      buttons: [
        { label: 'Commander pour 10 pers.', value: 'Je veux commander une box petit-déjeuner pour 10 personnes' },
        { label: 'Plus de 20 personnes', value: 'Nous sommes plus de 20 pour le petit-déjeuner' },
        { label: 'Voir sur WhatsApp', value: 'commander_whatsapp' },
      ],
      signal: 'hot',
    },
    {
      triggers: ['corporate', 'entreprise', 'bureau', 'équipe', 'team', 'lunch', 'déjeuner', 'hebdomadaire', 'récurrent'],
      reply: 'Nos formules corporate sont livrées dans tout Genève. Déjeuners hebdomadaires, box équipe, petits-déjeuners de meeting… Pour combien de collaborateurs et à quelle fréquence (ponctuel ou récurrent) ?',
      buttons: [
        { label: 'Commande ponctuelle', value: 'Je cherche une commande corporate ponctuelle' },
        { label: 'Abonnement hebdomadaire', value: 'Je souhaite un abonnement corporate hebdomadaire' },
        { label: 'Discuter sur WhatsApp', value: 'commander_whatsapp' },
      ],
      signal: 'hot',
    },
    {
      triggers: ['carte', 'menu', 'produit', 'voir', 'consulter', 'gamme'],
      reply: 'Notre carte complète est disponible en ligne ! Sucré : Banana Bread, Brookie, Brownie, Carrot Cake, Cheesecake Spéculos, Cinnamon Roll, Pecan Pie... Salé : Naans, Samosas, Pakoras, Currys, Dal... Voulez-vous que je vous guide ?',
      buttons: [
        { label: 'Voir la carte complète', value: '' },
        { label: 'Pâtisseries sucrées', value: 'Parlez-moi des pâtisseries sucrées' },
        { label: 'Cuisine du monde', value: 'Parlez-moi de la cuisine du monde' },
      ],
      signal: 'warm',
      action: 'carte',
    },
    {
      triggers: ['sucré', 'pâtisserie', 'gâteau', 'cake', 'douceur', 'dessert', 'chocolat', 'brownie', 'cheesecake', 'carrot', 'citron', 'marbré', 'pomme'],
      reply: 'Nos Douceurs sont préparées chaque matin dans notre atelier : Banana Bread caramélisé, Brookie (brownie + cookie), Brownie fondant chocolat noir, Cheesecake Spéculos, Cinnamon Roll glaçage vanille, Carrot Cake aux épices, Cake Citron acidulé, Pecan Pie caramel... Quel type de gourmandise vous attire ?',
      buttons: [
        { label: 'Assortiment événement', value: 'Je voudrais un assortiment de pâtisseries pour un événement' },
        { label: 'Commander sur WhatsApp', value: 'commander_whatsapp' },
        { label: 'Voir la carte', value: '' },
      ],
      signal: 'warm',
      action: 'carte',
    },
    {
      triggers: ['allergie', 'allergène', 'sans gluten', 'vegan', 'végétarien', 'halal', 'intolérance', 'végé'],
      reply: 'Nous prenons les allergies très au sérieux. De nombreux plats salés sont végétariens et halal (currys, dal, pakoras, samosas). Pour des adaptations spécifiques sans gluten ou vegan, contactez-nous directement — nous adaptons sur mesure.',
      buttons: [
        { label: 'Parler à l\'équipe', value: 'commander_whatsapp' },
        { label: 'Voir la carte avec filtres', value: '' },
      ],
      signal: 'warm',
      action: 'carte',
    },
    {
      triggers: ['prix', 'tarif', 'devis', 'combien', 'coût', 'budget'],
      reply: 'Pour vous établir un devis précis, pouvez-vous me préciser : (1) le nombre de personnes, (2) le type de prestation (petit-déjeuner, déjeuner, buffet cocktail), (3) la date ? Je vous reviens sous 2h avec une proposition détaillée.',
      buttons: [
        { label: 'Envoyer les détails', value: 'commander_whatsapp' },
        { label: 'Voir les formules', value: 'Quelles sont vos formules événements ?' },
      ],
      signal: 'hot',
    },
    {
      triggers: ['formule', 'forfait', 'package', 'offre', 'prestation'],
      reply: 'Nos formules événements :\n• Box Petit-Déjeuner dès 10 pers. — à partir de CHF 145\n• Formule Déjeuner dès 15 pers. — sur devis\n• Buffet Complet dès 20 pers. — sur devis\n• Cocktail Saveurs du Monde dès 30 pers. — à partir de CHF 780',
      buttons: [
        { label: 'Je veux un devis', value: 'commander_whatsapp' },
        { label: 'Voir la carte complète', value: '' },
      ],
      signal: 'hot',
      action: 'carte',
    },
    {
      triggers: ['livraison', 'retrait', 'adresse', 'où', 'lieu', 'genève', 'eaux-vives'],
      reply: 'Nous livrons dans tout le canton de Genève pour les commandes traiteur. Pour les pâtisseries et la boulangerie, retrait possible en boutique. Quelle est votre adresse de livraison ?',
      buttons: [
        { label: 'Préciser l\'adresse', value: 'commander_whatsapp' },
        { label: 'En savoir plus', value: 'Quelles sont vos conditions de livraison ?' },
      ],
      signal: 'warm',
    },
    {
      triggers: ['contacter', 'contact', 'appeler', 'téléphone', 'email', 'rappel'],
      reply: 'Le plus rapide pour nous joindre est WhatsApp — notre équipe répond en moins de 15 minutes. Vous pouvez aussi envoyer un email à bonjour@nimara.io. Souhaitez-vous qu\'on vous rappelle ?',
      buttons: [
        { label: 'WhatsApp maintenant', value: 'commander_whatsapp' },
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
      reply: 'Merci pour votre message ! Pour vous répondre au mieux et vous préparer une offre personnalisée, le plus simple est de nous contacter directement sur WhatsApp. Notre équipe répond sous 15 minutes.',
      buttons: [
        { label: 'WhatsApp maintenant', value: 'commander_whatsapp' },
        { label: 'Voir nos formules', value: 'Quelles sont vos formules événements ?' },
      ],
      signal: 'cold',
    };
  }

  /* ── Handle user message ──────────────────── */
  function handleUserMessage(text, isButton = false) {
    if (!isButton) appendMessage('user', text);

    // Navigate to carte page
    if (text === '') {
      window.location.href = '/carte/';
      return;
    }

    // WhatsApp handoff with conversation summary
    if (text === 'commander_whatsapp') {
      const waUrl = buildWhatsAppUrl(conversationSummary);
      window.open(waUrl, '_blank', 'noopener,noreferrer');
      trackEvent('whatsapp_handoff', { page: detectPage() });
      setTimeout(() => {
        appendMessage('van', 'Je vous redirige vers WhatsApp avec le résumé de notre conversation. Notre équipe vous répond sous 15 minutes !');
      }, 300);
      return;
    }

    setQuickReplies([]);
    showTyping();
    const response = getResponse(text);
    trackEvent('message', { text: text.slice(0, 60), signal: response.signal, page: detectPage() });

    const delay = 600 + Math.random() * 500;
    setTimeout(() => {
      removeTyping();
      appendMessage('van', response.reply);
      if (response.action === 'carte') {
        // Replace empty-string button value with navigation
        const btns = (response.buttons || []).map((b) => ({
          ...b,
          value: b.value === '' ? 'nav_carte' : b.value,
        }));
        setQuickReplies(btns);
      } else if (response.buttons) {
        setQuickReplies(response.buttons);
      }
    }, delay);
  }

  // Handle nav_carte action
  const origHandleUserMessage = handleUserMessage;
  function handleNav(text, isButton) {
    if (text === 'nav_carte') {
      window.location.href = '/carte/';
      return;
    }
    origHandleUserMessage(text, isButton);
  }

  /* ── Form submit ──────────────────────────── */
  inputForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = inputEl.value.trim();
    if (!text) return;
    inputEl.value = '';
    setQuickReplies([]);
    appendMessage('user', text);
    handleNav(text, true);
  });

  // Patch quick reply clicks to use handleNav
  const origSetQuickReplies = setQuickReplies;
  function setQuickReplies(replies) {
    quickReplies.innerHTML = '';
    replies.forEach((r) => {
      const btn = document.createElement('button');
      btn.className = 'van-qr-btn';
      btn.type = 'button';
      btn.textContent = r.label;
      btn.addEventListener('click', () => {
        trackEvent('button_click', { label: r.label, page: detectPage() });
        quickReplies.innerHTML = '';
        const val = r.value || r.label;
        if (val !== 'commander_whatsapp' && val !== 'nav_carte' && val !== '') {
          appendMessage('user', r.label);
        }
        handleNav(val, true);
      });
      quickReplies.appendChild(btn);
    });
  }

  /* ── Auto-open after 3 seconds ─────────────── */
  setTimeout(() => {
    if (!isOpen) openPanel();
  }, 3000);

})();
