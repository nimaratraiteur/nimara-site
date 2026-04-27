/* =========================================================================
   Vanessa — Widget de chat IA pour Nimara
   Path : /assets/js/vanessa-widget.js
   Auteur : Nimara
   Description : injecte le bouton + panneau de chat Vanessa, gère l'envoi de
                 messages vers le webhook n8n et l'affichage des réponses.
   ========================================================================= */
(function () {
  'use strict';

  // -------- Configuration ------------------------------------------------
  const CONFIG = {
    endpoint: 'https://nimarageneve.app.n8n.cloud/webhook/vanessa-nimara-v3/chat', // webhook n8n self-hosted
    avatar: '/assets/images/vanessa-avatar.png',
    inputMaxLength: 300,
    quickReplies: [
      'Passer une commande',
      'Voir la carte',
      'Calculer un devis',
      'Horaires & contact'
    ],
    welcome: "Bonjour, je suis Vanessa, l'assistante IA de Nimara. Comment puis-je vous aider aujourd'hui ?",
    storageKey: 'nimara_vanessa_session',
    stateKey: 'nimara_vanessa_state',
    autoOpenDelay: 4000,           // ouverture auto après 4s
    autoOpenedKey: 'nimara_vanessa_autoopened'  // évite de spammer à chaque page
  };

  // -------- Génère un ID de session simple ------------------------------
  function getSessionId() {
    let id = localStorage.getItem(CONFIG.storageKey);
    if (!id) {
      id = 'sess_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10);
      localStorage.setItem(CONFIG.storageKey, id);
    }
    return id;
  }

  // -------- Persistance de l'état du chat (pour survivre aux navigations)
  function loadState() {
    try {
      const raw = sessionStorage.getItem(CONFIG.stateKey);
      if (!raw) return { open: false, messages: [], greeted: false };
      const parsed = JSON.parse(raw);
      return {
        open: !!parsed.open,
        messages: Array.isArray(parsed.messages) ? parsed.messages : [],
        greeted: !!parsed.greeted
      };
    } catch (e) {
      return { open: false, messages: [], greeted: false };
    }
  }
  function saveState(state) {
    try { sessionStorage.setItem(CONFIG.stateKey, JSON.stringify(state)); }
    catch (e) { /* quota ou storage indispo */ }
  }

  // -------- Échappe le HTML ---------------------------------------------
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // -------- Injection du markup -----------------------------------------
  function buildMarkup() {
    const root = document.getElementById('vanessa-root');
    if (!root) return null;

    // Styles inline = priorité maximale, impossibles à override par le CSS du site
    const avatarWrapStyle36 = 'display:inline-block;width:36px;height:36px;min-width:36px;min-height:36px;max-width:36px;max-height:36px;flex-shrink:0;border-radius:50%;overflow:hidden;background:rgba(255,255,255,.18);position:relative;';
    const avatarWrapStyle40 = 'display:inline-block;width:40px;height:40px;min-width:40px;min-height:40px;max-width:40px;max-height:40px;flex-shrink:0;border-radius:50%;overflow:hidden;background:rgba(255,255,255,.22);border:2px solid rgba(255,255,255,.3);position:relative;';
    const avatarImgStyle = 'display:block;width:100%;height:100%;object-fit:cover;object-position:center;border-radius:50%;';
    const triggerStyle = 'position:fixed;bottom:24px;right:24px;z-index:2147483647;background:#5B2C8D;color:#fff;border:0;border-radius:999px;padding:8px 18px 8px 8px;display:inline-flex;align-items:center;gap:10px;width:auto;max-width:220px;height:auto;box-shadow:0 10px 30px rgba(91,44,141,.4);cursor:pointer;font-family:inherit;';
    const panelStyle = 'position:fixed;bottom:90px;right:24px;width:380px;max-width:calc(100vw - 32px);height:580px;max-height:calc(100vh - 120px);background:#fff;border-radius:18px;box-shadow:0 20px 60px rgba(7,4,15,.25);display:flex;flex-direction:column;overflow:hidden;z-index:2147483646;';

    root.innerHTML = `
      <button class="van-trigger" type="button"
              style="${triggerStyle}"
              aria-label="Ouvrir le chat avec Vanessa"
              aria-controls="van-panel"
              aria-expanded="false">
        <span class="van-trigger__avatar-wrap" style="${avatarWrapStyle36}">
          <img src="${CONFIG.avatar}" alt="" class="van-trigger__avatar"
               style="${avatarImgStyle}"
               onerror="this.style.display='none'">
        </span>
        <span class="van-trigger__pulse" aria-hidden="true"></span>
        <span class="van-trigger__label" style="font-weight:600;font-size:14px;white-space:nowrap;">Vanessa</span>
      </button>

      <aside class="van-panel" id="van-panel"
             style="${panelStyle}"
             role="dialog" aria-modal="true" aria-labelledby="van-title" hidden>
        <header class="van-header">
          <div class="van-header__left">
            <span class="van-header__avatar-wrap" style="${avatarWrapStyle40}">
              <img src="${CONFIG.avatar}" alt="" class="van-header__avatar"
                   style="${avatarImgStyle}"
                   onerror="this.style.display='none'">
            </span>
            <div>
              <p id="van-title" class="van-header__name">Vanessa</p>
              <p class="van-header__status">
                <span class="van-dot" aria-hidden="true"></span> En ligne — Nimara IA
              </p>
            </div>
          </div>
          <button class="van-close" type="button" aria-label="Fermer le chat">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </header>

        <div class="van-messages" role="log" aria-live="polite" aria-atomic="false"></div>

        <div class="van-quick-replies" role="group" aria-label="Réponses rapides"></div>

        <form class="van-input-area" autocomplete="off">
          <label class="sr-only" for="van-input">Votre message</label>
          <input type="text" id="van-input" class="van-input"
                 maxlength="${CONFIG.inputMaxLength}"
                 placeholder="Écrivez à Vanessa…"
                 aria-label="Message à Vanessa">
          <button type="submit" class="van-send" aria-label="Envoyer">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path d="M3 12l18-9-7 18-3-7-8-2z" fill="currentColor"/>
            </svg>
          </button>
        </form>

        <p class="van-footer-note">Propulsé par Claude • Nimara</p>
      </aside>
    `;
    return root;
  }

  // -------- Injecte les styles inline si CSS absent ---------------------
  // (le CSS principal vit dans /assets/css/vanessa-widget.css —
  //  ce bloc est un fallback minimal au cas où la feuille manque)
  function ensureFallbackStyles() {
    if (document.querySelector('link[href*="vanessa-widget.css"]')) return;
    const style = document.createElement('style');
    style.textContent = `
      #vanessa-root { font-family: 'DM Sans', system-ui, sans-serif; }
      .van-trigger { position: fixed !important; bottom: 24px !important; right: 24px !important;
        z-index: 9998 !important; background: #5B2C8D; color: #fff; border: 0; border-radius: 999px;
        padding: 8px 18px 8px 8px; display: inline-flex; align-items: center; gap: 10px;
        box-shadow: 0 10px 30px rgba(91,44,141,.4); cursor: pointer;
        width: auto !important; height: auto !important; max-width: 220px; }
      .van-trigger__avatar { display: block !important;
        width: 36px !important; height: 36px !important; min-width: 36px; min-height: 36px;
        max-width: 36px !important; max-height: 36px !important; flex-shrink: 0;
        border-radius: 50%; object-fit: cover; object-position: center;
        background: rgba(255,255,255,.18); }
      .van-trigger__label { font-weight: 600; font-size: 14px; white-space: nowrap; }
      .van-panel { position: fixed; bottom: 90px; right: 24px; width: min(380px, calc(100vw - 32px));
        height: min(560px, calc(100vh - 120px)); background: #fff; border-radius: 18px;
        box-shadow: 0 20px 60px rgba(7,4,15,.25); display: flex; flex-direction: column;
        overflow: hidden; z-index: 9999; }
      .van-panel[hidden] { display: none !important; }
      .van-header { background: linear-gradient(135deg,#5B2C8D,#a78bfa); color: #fff;
        padding: 14px 16px; display: flex; justify-content: space-between; align-items: center; }
      .van-header__left { display: flex; gap: 10px; align-items: center; }
      .van-header__avatar { display: block !important;
        width: 40px !important; height: 40px !important; min-width: 40px; min-height: 40px;
        max-width: 40px !important; max-height: 40px !important; flex-shrink: 0;
        border-radius: 50%; object-fit: cover; object-position: center;
        background: rgba(255,255,255,.22);
        border: 2px solid rgba(255,255,255,.3); }
      .van-header__name { margin: 0; font-weight: 600; font-size: 15px; }
      .van-header__status { margin: 2px 0 0; font-size: 12px; opacity: .9;
        display: flex; align-items: center; gap: 6px; }
      .van-dot { width: 8px; height: 8px; border-radius: 50%; background: #4ade80; }
      .van-close { background: transparent; border: 0; color: #fff; cursor: pointer;
        padding: 4px; display: flex; }
      .van-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex;
        flex-direction: column; gap: 10px; background: #faf8ff; }
      .van-msg { max-width: 80%; padding: 10px 14px; border-radius: 14px;
        font-size: 14px; line-height: 1.45; }
      .van-msg--bot { background: #fff; border: 1px solid #ece6f9; color: #07040f;
        border-bottom-left-radius: 4px; align-self: flex-start; }
      .van-msg--user { background: #5B2C8D; color: #fff;
        border-bottom-right-radius: 4px; align-self: flex-end; }
      .van-msg--typing { font-style: italic; color: #6b5c87; }
      .van-quick-replies { display: flex; flex-wrap: wrap; gap: 6px;
        padding: 8px 16px; background: #faf8ff; border-top: 1px solid #ece6f9; }
      .van-qr { background: #fff; border: 1px solid #d8c9f0; color: #5B2C8D;
        padding: 6px 12px; border-radius: 999px; font-size: 12px; cursor: pointer;
        font-family: inherit; }
      .van-qr:hover { background: #5B2C8D; color: #fff; }
      .van-input-area { display: flex; gap: 8px; padding: 12px 16px;
        border-top: 1px solid #ece6f9; background: #fff; }
      .van-input { flex: 1; border: 1px solid #d8c9f0; border-radius: 999px;
        padding: 10px 16px; font: inherit; font-size: 14px; outline: none; }
      .van-input:focus { border-color: #5B2C8D; }
      .van-send { background: #5B2C8D; color: #fff; border: 0; border-radius: 50%;
        width: 40px; height: 40px; display: flex; align-items: center;
        justify-content: center; cursor: pointer; }
      .van-footer-note { margin: 0; padding: 6px; text-align: center;
        font-size: 11px; color: #9b8bbf; background: #fff; }
      .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
        overflow: hidden; clip: rect(0,0,0,0); border: 0; }
      @media (max-width: 480px) {
        .van-panel { right: 8px; left: 8px; width: auto; bottom: 80px;
          height: calc(100vh - 100px); }
      }
    `;
    document.head.appendChild(style);
  }

  // -------- Logique du widget -------------------------------------------
  function initVanessa() {
    const root = buildMarkup();
    if (!root) return;
    ensureFallbackStyles();

    const trigger     = root.querySelector('.van-trigger');
    const panel       = root.querySelector('.van-panel');
    const closeBtn    = root.querySelector('.van-close');
    const messagesEl  = root.querySelector('.van-messages');
    const quickEl     = root.querySelector('.van-quick-replies');
    const form        = root.querySelector('.van-input-area');
    const input       = root.querySelector('.van-input');
    const sessionId   = getSessionId();
    const state       = loadState();

    let isOpen     = state.open;
    let hasGreeted = state.greeted;

    // --- Persistance ---
    function persist() {
      const messages = Array.from(messagesEl.querySelectorAll('.van-msg:not(.van-msg--typing)'))
        .map(el => ({
          role: el.classList.contains('van-msg--user') ? 'user' : 'bot',
          text: el.textContent
        }));
      saveState({ open: isOpen, messages, greeted: hasGreeted });
    }

    // --- Restauration de l'historique ---
    function restoreMessages() {
      state.messages.forEach(m => addMessage(m.text, m.role));
    }

    // --- Ouvrir / fermer ---
    function openPanel() {
      panel.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
      isOpen = true;
      if (!hasGreeted) {
        addBotMessage(CONFIG.welcome);
        renderQuickReplies();
        hasGreeted = true;
      }
      persist();
      setTimeout(() => input.focus(), 100);
    }
    function closePanel() {
      panel.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
      isOpen = false;
      persist();
      trigger.focus();
    }
    trigger.addEventListener('click', () => isOpen ? closePanel() : openPanel());
    closeBtn.addEventListener('click', closePanel);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) closePanel();
    });

    // --- Quick replies ---
    function renderQuickReplies() {
      quickEl.innerHTML = '';
      CONFIG.quickReplies.forEach((label) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'van-qr';
        btn.textContent = label;
        btn.addEventListener('click', () => sendMessage(label));
        quickEl.appendChild(btn);
      });
    }
    function clearQuickReplies() { quickEl.innerHTML = ''; }

    // --- Affichage des messages ---
    function addMessage(text, role) {
      const div = document.createElement('div');
      div.className = 'van-msg van-msg--' + role;
      div.innerHTML = escapeHtml(text).replace(/\n/g, '<br>');
      messagesEl.appendChild(div);
      messagesEl.scrollTop = messagesEl.scrollHeight;
      return div;
    }
    function addBotMessage(text) { return addMessage(text, 'bot'); }
    function addUserMessage(text) { return addMessage(text, 'user'); }
    function addTyping() {
      const div = document.createElement('div');
      div.className = 'van-msg van-msg--bot van-msg--typing';
      div.textContent = 'Vanessa écrit…';
      messagesEl.appendChild(div);
      messagesEl.scrollTop = messagesEl.scrollHeight;
      return div;
    }

    // --- Récupère l'historique courant pour l'envoyer à Claude ---
    function getHistory() {
      return Array.from(messagesEl.querySelectorAll('.van-msg:not(.van-msg--typing)'))
        .map(el => ({
          role: el.classList.contains('van-msg--user') ? 'user' : 'assistant',
          content: el.textContent
        }));
    }

    // --- Envoi vers n8n (qui appelle ensuite Claude API) ---
    async function sendToBackend(message) {
      try {
        const res = await fetch(CONFIG.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            message,
            history: getHistory(),    // historique complet
            page: window.location.pathname,
            referrer: document.referrer || null,
            timestamp: new Date().toISOString()
          })
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json().catch(() => ({}));
        return data.reply
          || data.message
          || "Merci pour votre message. Un membre de l'équipe Nimara vous répondra rapidement.";
      } catch (err) {
        console.error('[Vanessa] erreur backend :', err);
        return "Désolée, je rencontre un souci de connexion. Vous pouvez nous écrire sur WhatsApp au +41 22 557 60 20.";
      }
    }

    // --- Pipeline d'envoi ---
    async function sendMessage(text) {
      const clean = (text || '').trim();
      if (!clean) return;
      clearQuickReplies();
      addUserMessage(clean);
      input.value = '';
      persist();
      const typingEl = addTyping();
      const reply = await sendToBackend(clean);
      typingEl.remove();
      addBotMessage(reply);
      persist();
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      sendMessage(input.value);
    });
    input.addEventListener('input', () => {
      if (input.value.length > CONFIG.inputMaxLength) {
        input.value = input.value.slice(0, CONFIG.inputMaxLength);
      }
    });

    // --- Restauration au chargement ---
    if (state.messages.length) {
      restoreMessages();
    }
    if (isOpen) {
      panel.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
      if (!state.messages.length && !hasGreeted) {
        addBotMessage(CONFIG.welcome);
        renderQuickReplies();
        hasGreeted = true;
        persist();
      }
    }

    // --- Auto-ouverture après 4s (uniquement à la 1re visite de la session) ---
    const alreadyAutoOpened = sessionStorage.getItem(CONFIG.autoOpenedKey) === '1';
    if (!alreadyAutoOpened && !isOpen) {
      setTimeout(() => {
        if (!isOpen) {
          openPanel();
          sessionStorage.setItem(CONFIG.autoOpenedKey, '1');
        }
      }, CONFIG.autoOpenDelay);
    }
  }

  // -------- Boot ---------------------------------------------------------
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVanessa);
  } else {
    initVanessa();
  }
})();
