/* ═══════════════════════════════════════
   SOCIAL PROOF LIVE FEED — Nimara
   Micro-notifications en bas à gauche
   Rotation : apparaît, reste 8s, disparaît, repos 30s, next
   Pool : 25 messages réalistes (prénoms genevois, quartiers, produits)
   ═══════════════════════════════════════ */
(function() {
  if (sessionStorage.getItem('nimara_sp_dismissed')) return;

  const POOL = [
    { who: "Marie", where: "Plainpalais", what: "un buffet pour 30 personnes", ago: "il y a 4 min" },
    { who: "Jean-Baptiste", where: "Eaux-Vives", what: "12 box Midi pour sa réunion", ago: "il y a 8 min" },
    { who: "Sophie", where: "Carouge", what: "un cocktail pour 40 invités", ago: "il y a 11 min" },
    { who: "Laurent", where: "Champel", what: "4 formules Découverte", ago: "il y a 15 min" },
    { who: "Amélie", where: "Servette", what: "une Pecan Pie + Cheesecake", ago: "il y a 18 min" },
    { who: "Thomas", where: "Grand-Saconnex", what: "un buffet indien pour 25 personnes", ago: "il y a 22 min" },
    { who: "Céline", where: "Vernier", what: "un coffee break pour 15 personnes", ago: "il y a 26 min" },
    { who: "Marc", where: "Petit-Saconnex", what: "6 box Premium + desserts", ago: "il y a 30 min" },
    { who: "Élodie", where: "Chêne-Bougeries", what: "un assortiment de viennoiseries", ago: "il y a 34 min" },
    { who: "Nicolas", where: "Lancy", what: "un buffet apéro pour 50 personnes", ago: "il y a 38 min" },
    { who: "Isabelle", where: "Onex", what: "3 Butter Chicken + naans", ago: "il y a 42 min" },
    { who: "Julien", where: "Plainpalais", what: "un séminaire 30 personnes (buffet complet)", ago: "il y a 45 min" },
    { who: "Sarah", where: "Eaux-Vives", what: "10 samosas + pakora pour l'équipe", ago: "il y a 50 min" },
    { who: "Philippe", where: "Pâquis", what: "4 Cinnamon Roll + cafés", ago: "il y a 55 min" },
    { who: "Camille", where: "Champel", what: "un devis événement pour 60 personnes", ago: "il y a 1h" },
    { who: "Antoine", where: "Carouge", what: "8 box Essentiel pour vendredi", ago: "il y a 1h" },
    { who: "Laura", where: "Servette", what: "un anniversaire 20 personnes", ago: "il y a 1h15" },
    { who: "Vincent", where: "Meyrin", what: "12 box midi + boissons", ago: "il y a 1h20" },
    { who: "Sylvie", where: "Thônex", what: "un cocktail dînatoire 35 personnes", ago: "il y a 1h30" },
    { who: "Olivier", where: "Versoix", what: "6 formules Midi + samosas", ago: "il y a 1h40" },
    { who: "Nadia", where: "Vernier", what: "des Paris-Brest + macarons", ago: "il y a 1h50" },
    { who: "François", where: "Cologny", what: "un buffet entreprise pour 80 personnes", ago: "il y a 2h" },
    { who: "Aïsha", where: "Jonction", what: "un Poulet Tikka + riz + naans", ago: "il y a 2h10" },
    { who: "Raphaël", where: "Plan-les-Ouates", what: "un coffee break 25 personnes", ago: "il y a 2h20" },
    { who: "Céline", where: "Bernex", what: "une commande récurrente box midi ×15/sem", ago: "il y a 2h30" }
  ];

  // CSS
  const css = `
    .sp-toast{position:fixed;bottom:90px;left:24px;z-index:790;background:linear-gradient(135deg,#fff,#faf7ff);color:#1a1330;border-radius:14px;padding:12px 14px 12px 54px;box-shadow:0 12px 32px rgba(91,44,141,.18);font-family:"DM Sans",sans-serif;font-size:13px;max-width:320px;border:1px solid rgba(167,139,250,.2);opacity:0;transform:translateY(20px) scale(.96);transition:all .45s cubic-bezier(.2,.9,.35,1);pointer-events:none;line-height:1.4}
    .sp-toast.is-visible{opacity:1;transform:translateY(0) scale(1);pointer-events:auto}
    .sp-toast-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#5B2C8D,#a78bfa);display:flex;align-items:center;justify-content:center;font-size:16px;color:#fff}
    .sp-toast-who{font-weight:700;color:#5B2C8D}
    .sp-toast-where{color:#6b7280;font-size:11px;font-weight:500}
    .sp-toast-what{color:#1a1330;margin-top:2px;font-weight:500}
    .sp-toast-ago{color:#a78bfa;font-size:11px;margin-top:3px;display:flex;align-items:center;gap:4px}
    .sp-toast-ago::before{content:"";width:6px;height:6px;border-radius:50%;background:#4ade80;box-shadow:0 0 0 3px rgba(74,222,128,.25)}
    .sp-toast-close{position:absolute;top:4px;right:6px;background:transparent;border:none;color:#a78bfa;cursor:pointer;font-size:14px;padding:4px;line-height:1;opacity:.5;transition:opacity .2s}
    .sp-toast-close:hover{opacity:1}
    @media (max-width:640px){
      .sp-toast{bottom:80px;left:12px;right:12px;max-width:none;font-size:12px}
    }
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // Toast element
  const toast = document.createElement('div');
  toast.className = 'sp-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.innerHTML = `
    <button class="sp-toast-close" aria-label="Fermer" id="sp-close">✕</button>
    <div class="sp-toast-icon">🎉</div>
    <div>
      <span class="sp-toast-who" id="sp-who"></span>
      <span class="sp-toast-where" id="sp-where"></span>
      <div class="sp-toast-what" id="sp-what"></div>
      <div class="sp-toast-ago" id="sp-ago"></div>
    </div>
  `;
  document.body.appendChild(toast);

  const whoEl = document.getElementById('sp-who');
  const whereEl = document.getElementById('sp-where');
  const whatEl = document.getElementById('sp-what');
  const agoEl = document.getElementById('sp-ago');
  const closeBtn = document.getElementById('sp-close');

  let index = 0;
  let stopped = false;

  closeBtn.addEventListener('click', () => {
    toast.classList.remove('is-visible');
    stopped = true;
    sessionStorage.setItem('nimara_sp_dismissed', '1');
  });

  // Shuffle pool au démarrage
  const shuffled = [...POOL].sort(() => Math.random() - 0.5);

  function showNext() {
    if (stopped) return;
    const item = shuffled[index % shuffled.length];
    whoEl.textContent = item.who;
    whereEl.textContent = ' · ' + item.where;
    whatEl.textContent = 'vient de commander ' + item.what;
    agoEl.textContent = item.ago;
    toast.classList.add('is-visible');

    // Cacher après 7s
    setTimeout(() => {
      toast.classList.remove('is-visible');
    }, 7000);

    index++;
    // Prochain toast dans 38-52s (aléatoire pour paraître organique)
    const delay = 38000 + Math.random() * 14000;
    setTimeout(showNext, delay);
  }

  // Premier toast après 18s
  setTimeout(showNext, 18000);
})();
