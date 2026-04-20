/* ═══════════════════════════════════════
   EXIT INTENT POPUP — Nimara
   Déclencheur : mouse-out (desktop) ou inactivité 30s (mobile)
   Offre : code BIENVENUE10 (-10% sur 1ère commande)
   Fréquence : 1× par session (localStorage)
   ═══════════════════════════════════════ */
(function() {
  const STORAGE_KEY = 'nimara_exit_shown';
  const STORAGE_SUBMIT_KEY = 'nimara_exit_submitted';
  const SESSION_TTL = 7 * 24 * 60 * 60 * 1000; // 7 jours
  const COUNTDOWN_MINUTES = 5;

  // Ne pas s'afficher si déjà vu cette semaine ou déjà soumis
  try {
    const shown = localStorage.getItem(STORAGE_KEY);
    if (shown && Date.now() - parseInt(shown) < SESSION_TTL) return;
    const submitted = localStorage.getItem(STORAGE_SUBMIT_KEY);
    if (submitted) return;
  } catch(e) {}

  // CSS injecté
  const css = `
    .nx-popup-overlay{position:fixed;inset:0;background:rgba(10,5,26,.78);z-index:9999;display:none;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(6px);animation:nxfade .3s ease}
    .nx-popup-overlay.is-open{display:flex}
    @keyframes nxfade{from{opacity:0}to{opacity:1}}
    @keyframes nxslide{from{opacity:0;transform:translateY(30px) scale(.95)}to{opacity:1;transform:translateY(0) scale(1)}}
    .nx-popup{background:linear-gradient(160deg,#1a0a2e,#2d1054);color:#fff;border-radius:20px;max-width:460px;width:100%;padding:40px 36px;position:relative;box-shadow:0 30px 80px rgba(0,0,0,.5);border:1px solid rgba(167,139,250,.25);animation:nxslide .4s cubic-bezier(.2,.9,.35,1);font-family:"DM Sans",sans-serif}
    .nx-popup-close{position:absolute;top:14px;right:14px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);color:rgba(255,255,255,.7);width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:16px;line-height:1;display:flex;align-items:center;justify-content:center;transition:all .2s}
    .nx-popup-close:hover{background:rgba(255,255,255,.15);color:#fff;transform:rotate(90deg)}
    .nx-popup-emoji{font-size:44px;text-align:center;margin-bottom:8px;filter:drop-shadow(0 4px 12px rgba(245,158,11,.4))}
    .nx-popup-title{font-family:"Cormorant Garamond","Playfair Display",serif;font-size:30px;font-weight:400;text-align:center;line-height:1.15;margin:0 0 12px}
    .nx-popup-title em{font-style:italic;color:#f0c46a}
    .nx-popup-sub{text-align:center;font-size:15px;color:rgba(255,255,255,.75);margin-bottom:22px;line-height:1.5}
    .nx-popup-offer{background:linear-gradient(135deg,rgba(245,158,11,.18),rgba(200,151,58,.1));border:1.5px solid rgba(245,158,11,.4);border-radius:14px;padding:20px 18px;text-align:center;margin-bottom:18px}
    .nx-popup-code{font-family:"SF Mono",Consolas,monospace;font-size:22px;font-weight:700;color:#f0c46a;letter-spacing:.14em;margin:4px 0 8px;display:block}
    .nx-popup-code-label{font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:rgba(240,196,106,.7);font-weight:600}
    .nx-popup-value{font-family:"Cormorant Garamond","Playfair Display",serif;font-size:38px;font-weight:500;color:#fff;line-height:1;margin:10px 0 4px}
    .nx-popup-value-sub{font-size:13px;color:rgba(255,255,255,.65);font-style:italic}
    .nx-popup-countdown{text-align:center;font-size:13px;color:#ff8f8f;margin-bottom:18px;font-weight:600}
    .nx-popup-countdown strong{background:rgba(255,107,107,.15);border:1px solid rgba(255,107,107,.3);padding:3px 10px;border-radius:6px;color:#ffd4d4;font-family:"SF Mono",Consolas,monospace;font-size:15px;margin-left:6px}
    .nx-popup-form{display:flex;flex-direction:column;gap:10px}
    .nx-popup-input{background:rgba(255,255,255,.08);border:1.5px solid rgba(167,139,250,.2);color:#fff;padding:13px 16px;border-radius:10px;font-family:inherit;font-size:15px;outline:none;transition:all .2s}
    .nx-popup-input::placeholder{color:rgba(255,255,255,.4)}
    .nx-popup-input:focus{border-color:rgba(167,139,250,.55);background:rgba(255,255,255,.12)}
    .nx-popup-submit{background:linear-gradient(135deg,#f59e0b,#d97706);color:#1a0a2e;padding:14px 20px;border-radius:10px;font-family:inherit;font-weight:700;font-size:15px;border:none;cursor:pointer;transition:all .25s;box-shadow:0 4px 16px rgba(245,158,11,.3)}
    .nx-popup-submit:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(245,158,11,.5)}
    .nx-popup-submit:disabled{opacity:.6;cursor:not-allowed;transform:none}
    .nx-popup-decline{background:transparent;border:none;color:rgba(255,255,255,.4);cursor:pointer;font-family:inherit;font-size:12px;text-decoration:underline;margin-top:8px;text-align:center;padding:8px}
    .nx-popup-decline:hover{color:rgba(255,255,255,.7)}
    .nx-popup-success{text-align:center;padding:20px 0}
    .nx-popup-success-icon{font-size:52px;margin-bottom:12px}
    .nx-popup-success h3{font-family:"Cormorant Garamond","Playfair Display",serif;font-size:26px;margin:0 0 8px;font-weight:500}
    .nx-popup-success p{font-size:14px;color:rgba(255,255,255,.75);margin:0 0 8px}
    .nx-popup-footer-note{font-size:11px;color:rgba(255,255,255,.35);text-align:center;margin-top:10px}
    @media (max-width:480px){
      .nx-popup{padding:30px 24px}
      .nx-popup-title{font-size:26px}
      .nx-popup-value{font-size:32px}
    }
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // HTML injecté
  const overlay = document.createElement('div');
  overlay.className = 'nx-popup-overlay';
  overlay.innerHTML = `
    <div class="nx-popup" role="dialog" aria-modal="true" aria-labelledby="nx-popup-title">
      <button class="nx-popup-close" aria-label="Fermer" id="nx-popup-close">✕</button>
      <div id="nx-popup-main">
        <div class="nx-popup-emoji">🌸</div>
        <h2 class="nx-popup-title" id="nx-popup-title">Attendez — un <em>cadeau</em><br>avant de partir</h2>
        <p class="nx-popup-sub">Un petit geste pour votre visite. Recevez votre code de bienvenue par email.</p>
        <div class="nx-popup-offer">
          <div class="nx-popup-code-label">Votre code</div>
          <span class="nx-popup-code">BIENVENUE10</span>
          <div class="nx-popup-value">-10%</div>
          <div class="nx-popup-value-sub">sur votre première commande</div>
        </div>
        <div class="nx-popup-countdown">⏱️ Ce code expire dans <strong id="nx-popup-timer">05:00</strong></div>
        <form class="nx-popup-form" id="nx-popup-form" name="nimara-exit-capture" method="POST" data-netlify="true" netlify-honeypot="bot-field">
          <input type="hidden" name="form-name" value="nimara-exit-capture">
          <input type="hidden" name="page" id="nx-popup-page" value="">
          <p style="display:none"><input name="bot-field"></p>
          <input type="email" class="nx-popup-input" name="email" id="nx-popup-email" placeholder="votre@email.com" required>
          <button type="submit" class="nx-popup-submit" id="nx-popup-submit">✉️ Recevoir mon code</button>
        </form>
        <button class="nx-popup-decline" id="nx-popup-decline">Non merci, je continue ma visite</button>
        <div class="nx-popup-footer-note">Pas de spam. Jamais. Uniquement votre code + offres très occasionnelles.</div>
      </div>
      <div id="nx-popup-success" style="display:none">
        <div class="nx-popup-success">
          <div class="nx-popup-success-icon">🎁</div>
          <h3>Votre code est en route !</h3>
          <p>Vérifiez votre boîte mail dans les 2 prochaines minutes.</p>
          <p style="color:#f0c46a;font-weight:700;margin-top:14px">Code : BIENVENUE10</p>
          <p style="font-size:12px;color:rgba(255,255,255,.5);margin-top:8px">Utilisable sur WhatsApp lors de votre commande.</p>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const closeBtn = document.getElementById('nx-popup-close');
  const declineBtn = document.getElementById('nx-popup-decline');
  const form = document.getElementById('nx-popup-form');
  const emailInput = document.getElementById('nx-popup-email');
  const submitBtn = document.getElementById('nx-popup-submit');
  const timerEl = document.getElementById('nx-popup-timer');
  const mainBox = document.getElementById('nx-popup-main');
  const successBox = document.getElementById('nx-popup-success');
  const pageInput = document.getElementById('nx-popup-page');

  let shown = false;
  let countdownInterval = null;

  function showPopup() {
    if (shown) return;
    shown = true;
    try { localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch(e) {}
    if (pageInput) pageInput.value = window.location.pathname;
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    startCountdown();
    if (typeof gtag === 'function') gtag('event', 'exit_popup_shown', { event_category: 'conversion' });
  }

  function hidePopup() {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    if (countdownInterval) clearInterval(countdownInterval);
  }

  function startCountdown() {
    let secondsLeft = COUNTDOWN_MINUTES * 60;
    const tick = () => {
      const m = Math.floor(secondsLeft / 60);
      const s = secondsLeft % 60;
      timerEl.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
      secondsLeft--;
      if (secondsLeft < 0) {
        timerEl.textContent = 'Expiré';
        timerEl.style.textDecoration = 'line-through';
        clearInterval(countdownInterval);
      }
    };
    tick();
    countdownInterval = setInterval(tick, 1000);
  }

  closeBtn.addEventListener('click', hidePopup);
  declineBtn.addEventListener('click', hidePopup);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) hidePopup();
  });

  // Form submit — envoie à Netlify Forms
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = 'Envoi...';

    const formData = new FormData(form);
    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(formData).toString()
    }).then(() => {
      try { localStorage.setItem(STORAGE_SUBMIT_KEY, emailInput.value); } catch(e) {}
      if (typeof gtag === 'function') gtag('event', 'exit_popup_submit', { event_category: 'conversion' });
      mainBox.style.display = 'none';
      successBox.style.display = 'block';
      setTimeout(() => hidePopup(), 5000);
    }).catch(() => {
      // Fallback : accepter quand même côté client
      try { localStorage.setItem(STORAGE_SUBMIT_KEY, emailInput.value); } catch(e) {}
      mainBox.style.display = 'none';
      successBox.style.display = 'block';
      setTimeout(() => hidePopup(), 5000);
    });
  });

  // Trigger desktop : mouse-out vers le haut
  let mouseOutTriggered = false;
  document.addEventListener('mouseout', (e) => {
    if (mouseOutTriggered) return;
    if (!e.toElement && !e.relatedTarget && e.clientY < 10) {
      mouseOutTriggered = true;
      showPopup();
    }
  });

  // Trigger mobile : inactivité 45s OU scroll rapide vers le haut
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  if (isMobile) {
    let lastActivity = Date.now();
    const resetActivity = () => lastActivity = Date.now();
    ['touchstart','scroll','click','keydown'].forEach(ev => document.addEventListener(ev, resetActivity, { passive: true }));
    setInterval(() => {
      if (!shown && Date.now() - lastActivity > 45000) {
        showPopup();
      }
    }, 5000);
  }

  // Fallback desktop : après 60s sans interaction, afficher quand même
  if (!isMobile) {
    setTimeout(() => {
      if (!shown) showPopup();
    }, 60000);
  }
})();
