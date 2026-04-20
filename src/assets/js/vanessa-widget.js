/* ═══════════════════════════════════════
   VANESSA — Nimara AI Sales Assistant
   Uses existing HTML from vanessa-widget.njk
   Conversation persists via localStorage
   ═══════════════════════════════════════ */
(function() {
  const WA = 'https://wa.me/41225576020';
  const STORAGE_KEY = 'nimara_vanessa_chat';
  const STORAGE_TTL = 30 * 60 * 1000; // 30 min session

  /* ── KNOWLEDGE BASE ── */
  const KB = {
    boxMidi: {
      essentiel: { name: 'Essentiel', price: '15.90', desc: '1 protéine au choix + riz basmati + 1 accompagnement. Livraison & récupération inclus.' },
      decouverte: { name: 'Découverte', price: '19.90', desc: '1 protéine + riz + 1 accompagnement + 1 entrée OU dessert. Livraison inclus.', popular: true },
      premium: { name: 'Premium', price: '26.90', desc: '1 protéine + riz + accompagnement + entrée + dessert + boisson. Tout inclus.' }
    },
    proteines: ['Butter Chicken', 'Poulet Tikka Masala', 'Poulet Vindaloo', 'Poulet Mangue', 'Boeuf aux 8 Épices', 'Saag Paneer (végétarien)', 'Chana Masala (vegan)'],
    accompagnements: ['Lentilles jaunes', 'Dal rouge', 'Saag Aloo (vegan)', 'Légumes du jour (vegan)'],
    entrees: ['Samosas légumes', 'Samosas boeuf', 'Pakora épinards', 'Aloo Tikki', 'Naan ail', 'Naan fromage'],
    desserts: ['Cheesecake spéculos', 'Brookie', 'Brownie', 'Cinnamon Roll', 'Pecan Pie', 'Banana Bread'],
    boissons: ['Mango Lassi', 'Jus de gingembre', 'Jus d\'hibiscus', 'Eau aromatisée'],
    allergenes: { 'Banana Bread':'Gluten, Lait, Œufs', 'Brownie':'Gluten, Lait, Œufs', 'Brookie':'Gluten, Lait, Œufs, Fruits à coque', 'Samosas':'Gluten, Sésame', 'Naans':'Gluten, Lait', 'Pakora':'Gluten (vegan)', 'Butter Chicken':'Lait' },
    info: { adresse:'Rue des Délices 3, 1203 Genève', tel:'022 300 52 20', whatsapp:'+41 22 557 60 20', horaires:'Lun-Ven 7h-19h, Sam 7h30-18h', livraison:'Livraison gratuite à Genève pour entreprises. Contenants consignés récupérés.', halal:'Toutes nos viandes sont halal.', vegan:'Options vegan : Chana Masala, Pakora, Saag Aloo, Dal rouge, Légumes du jour.' }
  };

  /* ── CONTEXT GREETING ── */
  function getContextGreeting() {
    const p = window.location.pathname;
    if (p.includes('/carte')) return { text:'Vous explorez notre carte ! 🍛 Dites-moi ce qui vous tente ou vos restrictions alimentaires — je compose pour vous.', buttons:['Box midi entreprise', 'Événement', 'Allergènes'] };
    if (p.includes('/entreprise')) return { text:'Bienvenue ! 📦 Nos box repas midi pour équipes :\n\n⭐ **Découverte** CHF 19.90/pers. — le plus populaire\nProtéine + riz + accompagnement + entrée ou dessert\n\nPour combien de personnes ?', buttons:['5-10 personnes', '10-20 personnes', '20+ personnes'] };
    if (p.includes('/chavannes')) return { text:'Bienvenue dans nos saveurs du monde ! 🍛\n\nNotre butter chicken est le n°1 — onctueux, épices maison.\n\nVous cherchez pour vous ou pour un groupe ?', buttons:['Pour moi', 'Pour mon équipe', 'Événement'] };
    if (p.includes('/calculateur')) return { text:'Je peux vous aider à composer votre menu ! 🎉\n\nQuelle est l\'occasion et combien d\'invités ?', buttons:['Mariage', 'Séminaire', 'Apéro'] };
    if (p.includes('/ambassadeur')) return { text:'Bienvenue dans le programme Ambassadeur ! 🌟 Inscrivez-vous et partagez Nimara avec votre réseau.', buttons:['Comment ça marche ?', 'S\'inscrire'] };
    return { text:'Bonjour ! Je suis Vanessa, votre conseillère Nimara. 🌟\n\nCuisine indienne authentique et pâtisseries artisanales, livrées à Genève.\n\nQu\'est-ce qui vous ferait plaisir ?', buttons:['🍛 Box repas midi', '🎉 Organiser un événement', '📋 Voir la carte'] };
  }

  /* ── INTENT DETECTION ── */
  function detectIntent(msg) {
    const m = msg.toLowerCase();
    if (/prix|co[uû]t|tarif|combien|budget|devis/.test(m)) return 'price';
    if (/box|midi|entreprise|bureau|corporate|lunch|déjeuner|équipe|team|collègue|personnes/.test(m)) return 'box_midi';
    if (/événement|event|mariage|wedding|séminaire|cocktail|apéro|buffet|fête|party|anniversaire/.test(m)) return 'event';
    if (/menu|carte|produit|plat|dish|curry|samosa|naan|pakora|butter|tikka/.test(m)) return 'menu';
    if (/végé|vegan|halal|sans gluten|allergi|intolér|régime/.test(m)) return 'dietary';
    if (/livra|deliver|commander|order|commande/.test(m)) return 'order';
    if (/horaire|ouvert|heure|quand|where|où|adresse|location/.test(m)) return 'info';
    if (/sucr|dessert|gâteau|cake|brownie|cookie|cheesecake|pâtisserie|banana/.test(m)) return 'desserts';
    if (/boisson|drink|lassi|jus|juice|hibiscus/.test(m)) return 'drinks';
    if (/bonjour|hello|hi|salut|hey|coucou/.test(m)) return 'greeting';
    if (/merci|thank|super|parfait|genial/.test(m)) return 'thanks';
    if (/comment.*marche|how|fonctionn/.test(m)) return 'how';
    if (/5.*10|10.*20|20\+|\d+\s*pers/.test(m)) return 'quote';
    return 'general';
  }

  /* ── RESPONSE ENGINE ── */
  function getResponse(intent, msg) {
    const m = msg.toLowerCase();
    const numMatch = m.match(/(\d+)/);
    const numPeople = numMatch ? parseInt(numMatch[1]) : 0;

    switch(intent) {
      case 'greeting':
        return getContextGreeting();

      case 'box_midi':
      case 'quote':
        if (numPeople > 0) {
          const ess = (numPeople * 15.9).toFixed(2);
          const dec = (numPeople * 19.9).toFixed(2);
          const prem = (numPeople * 26.9).toFixed(2);
          return {
            text: `Pour **${numPeople} personnes**, voici votre estimation :\n\n📦 **Essentiel** : CHF ${ess}\n(protéine + riz + accompagnement)\n\n⭐ **Découverte** : CHF ${dec}\n(+ entrée ou dessert au choix)\n\n💎 **Premium** : CHF ${prem}\n(+ entrée + dessert + boisson)\n\nTout inclus : livraison, contenants consignés, récupération.\n\nQuelle formule vous intéresse ?`,
            buttons: ['Essentiel', 'Découverte ⭐', 'Premium']
          };
        }
        return {
          text: `Nos box repas midi pour équipes :\n\n📦 **Essentiel** CHF 15.90/pers.\nProtéine + riz + accompagnement\n\n⭐ **Découverte** CHF 19.90/pers.\n+ entrée OU dessert au choix\n\n💎 **Premium** CHF 26.90/pers.\n+ entrée + dessert + boisson\n\nLivraison & récupération incluses. Dès 10 personnes.\n\nCombien êtes-vous ?`,
          buttons: ['10 personnes', '20 personnes', '30 personnes']
        };

      case 'event':
        if (numPeople > 0) {
          const cocktail = (numPeople * 28).toFixed(0);
          const buffet = (numPeople * 42).toFixed(0);
          return {
            text: `Pour **${numPeople} invités**, voici les formules :\n\n🥂 **Cocktail** : CHF ${cocktail}.— (CHF 28/pers.)\nSamosas, pakora, naans, bouchées tandoori\n\n🍛 **Buffet complet** : CHF ${buffet}.— (CHF 42/pers.)\nCurries + entrées + riz + naans + desserts + boissons\n\nService, livraison et matériel inclus.\n\nQuelle formule préférez-vous ?`,
            buttons: ['Cocktail', 'Buffet', 'Sur mesure']
          };
        }
        if (/mariage|wedding/.test(m)) {
          return { text:'Félicitations ! 🥂\n\nNous proposons des apéros dînatoires sur mesure :\n• Sélection indienne + options internationales\n• Pâtisseries artisanales\n• Boissons maison\n\nÀ partir de **CHF 28/pers.** tout compris.\n\nCombien d\'invités prévoyez-vous ?', buttons:['30 invités', '50 invités', '80 invités'] };
        }
        return { text:'Pour votre événement :\n\n🥂 **Cocktail** dès CHF 28/pers. (30+ invités)\n🍛 **Buffet** dès CHF 42/pers. (20+ invités)\n📦 **Box individuelles** dès CHF 15.90/pers. (10+)\n\nService, livraison, matériel — tout inclus.\n\nQuelle est l\'occasion et combien de personnes ?', buttons:['Cocktail', 'Buffet', 'Box midi'] };

      case 'price':
        return {
          text: '💰 **Nos tarifs tout compris :**\n\n📦 **Box repas midi**\n• Essentiel : CHF 15.90/pers.\n• Découverte : CHF 19.90/pers. ⭐\n• Premium : CHF 26.90/pers.\n\n🎉 **Événements**\n• Cocktail : CHF 28/pers.\n• Buffet : CHF 42/pers.\n\nLivraison, service et récupération inclus.\n\nDites-moi le nombre de personnes et je calcule pour vous !',
          buttons: ['Devis box midi', 'Devis événement']
        };

      case 'menu':
        return { text:'Notre carte 🍛\n\n**Protéines** : Butter Chicken, Tikka Masala, Vindaloo, Poulet Mangue, Boeuf 8 Épices, Saag Paneer 🌿, Chana Masala 🌱\n\n**Entrées** : Samosas, Pakora, Aloo Tikki, Naans\n\n**Desserts** : Cheesecake, Brookie, Banana Bread, Cinnamon Roll\n\nTout fait maison, épices torréfiées à la main.\n\nUn produit vous intéresse ?', buttons:['Box midi', 'Allergènes', 'Commander'] };

      case 'dietary':
        if (/vegan/.test(m)) return { text:'Options 100% vegan 🌱 :\n\n• Chana Masala\n• Pakora épinards\n• Saag Aloo\n• Dal rouge\n• Légumes du jour\n\nToutes nos box sont disponibles en version vegan !', buttons:['Box vegan', 'Prix'] };
        if (/halal/.test(m)) return { text:'Toutes nos viandes sont halal ✅\n\nButter Chicken, Tikka Masala, Vindaloo, Boeuf 8 Épices — tout certifié.', buttons:['Voir le menu', 'Commander'] };
        return { text:'🌿 Végétarien : Saag Paneer, Dal, légumes\n🌱 Vegan : Chana Masala, Pakora, Saag Aloo\n🕌 Halal : toutes nos viandes\n\nAllergens :\n' + Object.entries(KB.allergenes).map(([k,v])=>`• ${k}: ${v}`).join('\n'), buttons:['Commander', 'Menu'] };

      case 'desserts':
        return { text:'Nos pâtisseries maison 🍰\n\n• **Cheesecake Spéculos** — onctueux\n• **Banana Bread** — signature !\n• **Brookie** — brownie × cookie\n• **Cinnamon Roll** — glaçage vanille\n• **Pecan Pie** — caramel, noix de pécan\n• **Brownie** — chocolat noir intense\n\nInclus dans la formule Premium ou en supplément !', buttons:['Formule Premium', 'Box midi'] };

      case 'drinks':
        return { text:'Nos boissons maison 🍹\n\n• Mango Lassi\n• Jus de gingembre\n• Jus d\'hibiscus\n• Eaux aromatisées\n\nIncluses dans le Premium ou +CHF 4 en supplément.', buttons:['Formule Premium', 'Menu'] };

      case 'order':
        return { text:'Pour commander :\n\n📦 **Box midi entreprise** → nimara.io/commander\n🎉 **Événement** → je peux calculer votre devis maintenant !\n📍 **Sur place** → Rue des Délices 3, Genève\n\nQue préférez-vous ?', buttons:['Devis maintenant', 'Commander en ligne'] };

      case 'info':
        return { text:`📍 ${KB.info.adresse}\n📞 ${KB.info.tel}\n🕐 ${KB.info.horaires}\n\n🚚 ${KB.info.livraison}`, buttons:['Commander', 'Menu'] };

      case 'thanks':
        return { text:'Avec plaisir ! 😊 On a hâte de vous régaler. N\'hésitez pas si vous avez d\'autres questions !', buttons:['Menu', 'Commander'] };

      case 'how':
        return { text:'C\'est simple ! 📦\n\n1. Choisissez votre formule\n2. On vous livre le jour même\n3. Vous savourez\n4. On récupère les contenants\n\nDites-moi pour combien de personnes et je calcule !', buttons:['10 personnes', '20 personnes', '50 personnes'] };

      default:
        return { text:'Je peux vous aider avec :\n\n🍛 Nos plats — curries, samosas, naans\n📦 Box repas midi — dès CHF 15.90/pers.\n🎉 Événements — cocktails, buffets, mariages\n🍰 Pâtisseries — cheesecake, brookies\n\nQue souhaitez-vous ?', buttons:['Box midi', 'Événement', 'Menu'] };
    }
  }

  /* ── SESSION PERSISTENCE ── */
  function loadSession() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved && Date.now() - saved.timestamp < STORAGE_TTL) return saved.messages;
    } catch(e) {}
    return [];
  }

  function saveSession(msgs) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages: msgs, timestamp: Date.now() }));
  }

  /* ── UI ── */
  const trigger = document.getElementById('van-trigger');
  const panel = document.getElementById('van-panel');
  const closeBtn = document.getElementById('van-close');
  const msgContainer = document.getElementById('van-messages');
  const quickReplies = document.getElementById('van-quick-replies');
  const form = document.getElementById('van-input-form');
  const input = document.getElementById('van-input');

  if (!trigger || !panel) return;

  let messages = loadSession();
  let isOpen = false;

  function render() {
    if (!msgContainer) return;
    msgContainer.innerHTML = '';
    messages.forEach(m => {
      const div = document.createElement('div');
      div.className = 'van-msg ' + (m.role === 'van' ? 'van-msg--bot' : 'van-msg--user');
      let html = m.text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
      div.innerHTML = `<div class="van-bubble">${html}</div>`;
      msgContainer.appendChild(div);
    });
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }

  function showButtons(btns) {
    if (!quickReplies) return;
    quickReplies.innerHTML = btns.map(b => `<button class="van-qr-btn" data-msg="${b}">${b}</button>`).join('');
    quickReplies.querySelectorAll('.van-qr-btn').forEach(btn => {
      btn.onclick = () => handleUserMessage(btn.dataset.msg);
    });
  }

  function addMsg(role, text) {
    messages.push({ role, text });
    saveSession(messages);
    render();
  }

  function handleUserMessage(msg) {
    addMsg('user', msg);
    const intent = detectIntent(msg);
    const resp = getResponse(intent, msg);
    setTimeout(() => {
      addMsg('van', resp.text);
      if (resp.buttons) showButtons(resp.buttons);
    }, 500);
    if (typeof gtag === 'function') gtag('event', 'vanessa_interact', { event_label: intent });
  }

  // Toggle
  trigger.onclick = () => {
    isOpen = true;
    panel.hidden = false;
    panel.classList.add('is-open');
    trigger.style.display = 'none';
    if (messages.length === 0) {
      const greeting = getContextGreeting();
      addMsg('van', greeting.text);
      if (greeting.buttons) showButtons(greeting.buttons);
    } else {
      render();
    }
  };

  if (closeBtn) closeBtn.onclick = () => {
    panel.hidden = true;
    panel.classList.remove('is-open');
    trigger.style.display = '';
    isOpen = false;
  };

  // Form submit
  if (form) form.onsubmit = (e) => {
    e.preventDefault();
    const msg = input.value.trim();
    if (!msg) return;
    input.value = '';
    handleUserMessage(msg);
  };

  // Restore session on page load
  if (messages.length > 0) {
    render();
  }

  // Proactive: auto-open after 4s if no previous session
  setTimeout(() => {
    if (!isOpen && messages.length === 0) {
      trigger.classList.add('van-trigger--pulse');
    }
  }, 4000);

  /* ── PROACTIVE BUBBLE : message qui apparaît après 25s ── */
  function showProactiveBubble() {
    if (isOpen || messages.length > 0) return;
    if (sessionStorage.getItem('nimara_van_bubble_dismissed')) return;

    const p = window.location.pathname;
    let bubbleText = "👋 Besoin d'aide pour votre commande ?";
    if (p.includes('/calculateur')) bubbleText = "💡 Besoin d'aide pour composer votre devis ?";
    else if (p.includes('/carte')) bubbleText = "🍛 Une question sur notre carte ?";
    else if (p.includes('/entreprise')) bubbleText = "📦 Je vous aide à choisir votre formule ?";
    else if (p.includes('/chavannes')) bubbleText = "🌶️ Envie de saveurs indiennes ?";

    const bubble = document.createElement('div');
    bubble.className = 'van-proactive-bubble';
    bubble.innerHTML = '<button class="van-bubble-close" aria-label="Fermer">✕</button><div class="van-bubble-text">' + bubbleText + '</div>';
    document.body.appendChild(bubble);

    const style = document.createElement('style');
    style.textContent = '.van-proactive-bubble{position:fixed;bottom:100px;right:24px;background:#fff;color:#1a1330;padding:14px 18px;border-radius:18px;box-shadow:0 12px 32px rgba(91,44,141,.25);font-family:"DM Sans",sans-serif;font-size:14px;font-weight:500;max-width:260px;z-index:799;cursor:pointer;border:1px solid rgba(167,139,250,.25);animation:vbubbleIn .5s cubic-bezier(.2,.9,.35,1);line-height:1.4}.van-proactive-bubble::after{content:"";position:absolute;bottom:-8px;right:30px;width:16px;height:16px;background:#fff;border-right:1px solid rgba(167,139,250,.25);border-bottom:1px solid rgba(167,139,250,.25);transform:rotate(45deg)}.van-bubble-close{position:absolute;top:-8px;right:-8px;background:#5B2C8D;color:#fff;border:2px solid #fff;width:24px;height:24px;border-radius:50%;cursor:pointer;font-size:11px;line-height:1;padding:0;box-shadow:0 2px 8px rgba(0,0,0,.15)}.van-bubble-close:hover{background:#4a2374}.van-bubble-text{padding-right:4px}@keyframes vbubbleIn{from{opacity:0;transform:translateY(10px) scale(.9)}to{opacity:1;transform:translateY(0) scale(1)}}@media (max-width:640px){.van-proactive-bubble{bottom:90px;right:16px;max-width:220px;font-size:13px;padding:12px 16px}}';
    document.head.appendChild(style);

    const closeBtn = bubble.querySelector('.van-bubble-close');
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      bubble.remove();
      sessionStorage.setItem('nimara_van_bubble_dismissed', '1');
    });
    bubble.addEventListener('click', () => {
      bubble.remove();
      trigger.click();
      if (typeof gtag === 'function') gtag('event', 'vanessa_bubble_click', { event_category: 'conversion' });
    });
    if (typeof gtag === 'function') gtag('event', 'vanessa_bubble_shown', { event_category: 'conversion' });
  }

  // Sur calculateur : bubble après 35s / Ailleurs : 25s
  const bubbleDelay = window.location.pathname.includes('/calculateur') ? 35000 : 25000;
  setTimeout(showProactiveBubble, bubbleDelay);

})();
