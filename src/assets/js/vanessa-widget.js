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
        appendMessage('van', 'Bonjour et bienvenue chez Nimara 🌟 Je suis Vanessa, votre guide gourmand. Dites-moi ce qui vous ferait plaisir !');
        setQuickReplies([
          { label: '🍛 Découvrir notre carte', value: 'Je veux voir ce que vous proposez' },
          { label: '🎉 Organiser un événement', value: 'Je prépare un événement et je cherche un service traiteur' },
          { label: '🏪 Venir au stand Délices', value: 'Je veux venir au stand' },
          { label: '🍰 Les pâtisseries Oh Martine', value: 'Parlez-moi des pâtisseries' },
        ]);
        trackEvent('greeted', { sessionId: SESSION_ID });
      }, 900);
    }, 400);
  }

  /* ── Mock AI responses ────────────────────── */
  /* TODO: Replace with fetch() to your n8n/OpenAI/Vapi endpoint */
  const RESPONSES = [
    {
      triggers: ['voir', 'carte', 'menu', 'proposez', 'quoi'],
      reply: 'Avec plaisir ! Notre carte mélange deux univers : la cuisine indienne authentique Chavannes (samosas, naans, curries…) et les pâtisseries maison Oh Martine (banana bread, cheesecake, brownies…). Tout est fait maison à Genève !',
      buttons: [
        { label: '🍛 Voir la carte complète', value: 'voir_carte' },
        { label: '🍰 Les pâtisseries', value: 'Parlez-moi des pâtisseries' },
        { label: '🎉 Pour un événement', value: 'Je prépare un événement et je cherche un service traiteur' },
      ],
      signal: 'warm',
    },
    {
      triggers: ['petit-déjeuner', 'breakfast', 'matin', 'box', 'bircher', 'croissant'],
      reply: 'Nos box petit-déjeuner sont parfaites dès 10 personnes : Birchers, Banana Bread, Cinnamon Rolls… Tout frais du matin ! Vous pouvez calculer votre budget directement sur notre carte.',
      buttons: [
        { label: '🧮 Calculer mon budget', value: 'voir_calculateur' },
        { label: '🍰 Voir les pâtisseries', value: 'Parlez-moi des pâtisseries' },
      ],
      signal: 'hot',
    },
    {
      triggers: ['corporate', 'entreprise', 'bureau', 'équipe', 'team', 'lunch', 'déjeuner'],
      reply: 'Nos formules corporate sont livrées dans tout Genève : lunch box individuelles, buffets d\'équipe, coffee breaks… Le mieux c\'est de lancer le calculateur pour voir les options et les prix !',
      buttons: [
        { label: '🧮 Calculer mon budget', value: 'voir_calculateur' },
        { label: '🍛 Voir le menu salé', value: 'voir_carte' },
      ],
      signal: 'hot',
    },
    {
      triggers: ['buffet', 'événement', 'event', 'séminaire', 'cocktail', 'fête', 'anniversaire', 'traiteur'],
      reply: 'Super ! Notre calculateur d\'événements vous guide pas à pas : choisissez l\'occasion, le nombre d\'invités, vos préférences… et recevez un récap complet avec estimation. Essayez-le !',
      buttons: [
        { label: '🧮 Lancer le calculateur', value: 'voir_calculateur' },
        { label: '🍛 Voir la carte d\'abord', value: 'voir_carte' },
      ],
      signal: 'hot',
    },
    {
      triggers: ['stand', 'retrait', 'venir', 'adresse', 'où', 'lieu', 'délices'],
      reply: 'Notre stand se trouve au Rue des Délices 3, 1203 Genève ! Vous y trouverez nos pâtisseries Oh Martine et notre cuisine indienne Chavannes à emporter. Venez nous voir !',
      buttons: [
        { label: '🏪 Voir la page du stand', value: 'voir_delices' },
        { label: '🍛 Voir la carte', value: 'voir_carte' },
      ],
      signal: 'warm',
    },
    {
      triggers: ['devis', 'prix', 'tarif', 'combien', 'cost'],
      reply: 'Le plus simple pour avoir une estimation : utilisez notre calculateur d\'événements. Vous choisissez vos options et recevez un récap avec prix que vous pourrez nous envoyer directement.',
      buttons: [
        { label: '🧮 Calculer mon budget', value: 'voir_calculateur' },
        { label: '🍛 Voir les prix à la carte', value: 'voir_carte' },
      ],
      signal: 'hot',
    },
    {
      triggers: ['allergie', 'allergène', 'sans gluten', 'vegan', 'végétarien', 'halal', 'intolérance'],
      reply: 'Bonne question ! Toutes nos viandes sont Halal. Nos brownies sont sans gluten. Notre atelier manipule gluten, lactose, fruits à coque, œufs et sésame. Pour des besoins spécifiques, n\'hésitez pas à nous contacter.',
      buttons: [
        { label: '🍛 Voir la carte (allergènes indiqués)', value: 'voir_carte' },
        { label: '💬 Nous contacter', value: 'commander_whatsapp' },
      ],
      signal: 'warm',
    },
    {
      triggers: ['chavannes', 'inde', 'indien', 'pakora', 'samosa', 'naan', 'épices', 'curry', 'salé'],
      reply: 'Notre cuisine indienne Chavannes, c\'est des recettes familiales authentiques : samosas, pakoras, naans, butter chicken, dal, poulet tikka masala… Tout est cuisiné avec amour par notre cheffe Inga.',
      buttons: [
        { label: '🍛 Voir la carte complète', value: 'voir_carte' },
        { label: '🎉 Pour un événement', value: 'Je prépare un événement' },
      ],
      signal: 'warm',
    },
    {
      triggers: ['pâtisserie', 'gâteau', 'macaron', 'tarte', 'cake', 'sucré', 'banana', 'brownie', 'cheesecake', 'cinnamon', 'brookie', 'pecan', 'martine'],
      reply: 'Les pâtisseries Oh Martine, c\'est notre fierté ! Banana bread, cheesecake spéculoos, pecan pie, brownies sans gluten, brookies, cinnamon rolls… Tout est fait maison chaque jour.',
      buttons: [
        { label: '🍰 Voir les pâtisseries', value: 'voir_carte' },
        { label: '🏪 Venir au stand', value: 'voir_delices' },
      ],
      signal: 'warm',
    },
    {
      triggers: ['commander', 'commande', 'whatsapp', 'contact', 'contacter', 'appeler', 'téléphone'],
      reply: 'Prêt à commander ? Le mieux c\'est de d\'abord jeter un œil à notre carte pour choisir ce qui vous fait envie, et ensuite nous envoyer votre sélection !',
      buttons: [
        { label: '🍛 Voir la carte', value: 'voir_carte' },
        { label: '💬 J\'ai déjà choisi, WhatsApp', value: 'commander_whatsapp' },
      ],
      signal: 'hot',
    },
  ];

  function getResponse(text) {
    const lower = text.toLowerCase();
    for (const r of RESPONSES) {
      if (r.triggers.some((t) => lower.includes(t))) return r;
    }
    return {
      reply: 'Bonne question ! Le mieux c\'est de découvrir notre carte pour voir tout ce qu\'on propose. Si vous avez une demande spéciale, on est là pour vous aider.',
      buttons: [
        { label: '🍛 Découvrir la carte', value: 'voir_carte' },
        { label: '🎉 Organiser un événement', value: 'voir_calculateur' },
        { label: '💬 Parler à l\'équipe', value: 'commander_whatsapp' },
      ],
      signal: 'cold',
    };
  }

  /* ── Handle user message ──────────────────── */
  function handleUserMessage(text, isButton = false) {
    if (!isButton) appendMessage('user', text);

    // Special: navigation actions
    if (text === 'commander_whatsapp') {
      const waUrl = 'https://wa.me/41225576020?text=Bonjour%20Nimara%2C%20je%20souhaite%20passer%20une%20commande%20%F0%9F%A5%90';
      window.open(waUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    if (text === 'voir_carte') {
      window.location.href = '/carte/';
      return;
    }
    if (text === 'voir_calculateur') {
      window.location.href = '/carte/#routing';
      return;
    }
    if (text === 'voir_delices') {
      window.location.href = '/delices/';
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
