/* ═══════════════════════════════════════
   VANESSA — Nimara AI Sales Assistant
   She CONVERTS. She never redirects.
   ═══════════════════════════════════════ */
(function() {
  const WA = 'https://wa.me/41225576020';
  const SITE = 'nimara.io';

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
    boissons: ['Mango Lassi', 'Jus de gingembre maison', 'Jus d\'hibiscus', 'Eau aromatisée'],
    evenements: {
      cocktail: { price: '28', desc: 'Samosas, pakora, naans, bouchées. Dès 30 pers.' },
      buffet: { price: '42', desc: 'Curries + entrées + desserts + boissons. Dès 20 pers.' },
      midi: { price: '15.90-26.90', desc: 'Box individuelles livrées. Dès 10 pers.' }
    },
    allergenes: {
      'Banana Bread': 'Gluten, Lait, Œufs',
      'Brownie': 'Gluten, Lait, Œufs',
      'Brookie': 'Gluten, Lait, Œufs, Fruits à coque',
      'Cheesecake': 'Gluten, Lait, Œufs',
      'Samosas': 'Gluten, Sésame',
      'Naans': 'Gluten, Lait',
      'Pakora': 'Gluten (vegan)',
      'Butter Chicken': 'Lait',
      'Tikka Masala': 'Lait'
    },
    info: {
      adresse: 'Rue des Délices 3, 1203 Genève',
      tel: '022 300 52 20',
      whatsapp: '+41 22 557 60 20',
      horaires: 'Lun-Ven 7h-19h, Sam 7h30-18h',
      livraison: 'Livraison gratuite à Genève pour les commandes entreprise. Contenants consignés récupérés.',
      halal: 'Toutes nos viandes sont halal.',
      vegan: 'Nous proposons plusieurs options vegan : Chana Masala, Pakora, Saag Aloo, Dal rouge, Légumes du jour.'
    }
  };

  /* ── INTENT DETECTION ── */
  function detectIntent(msg) {
    const m = msg.toLowerCase();
    if (/prix|co[uû]t|tarif|combien|budget/.test(m)) return 'price';
    if (/box|midi|entreprise|bureau|corporate|lunch|déjeuner|équipe|team|collègue/.test(m)) return 'box_midi';
    if (/événement|event|mariage|wedding|séminaire|cocktail|apéro|buffet|fête|party|anniversaire/.test(m)) return 'event';
    if (/menu|carte|produit|plat|dish|curry|samosa|naan|pakora/.test(m)) return 'menu';
    if (/végé|vegan|halal|sans gluten|allergi|intolér|régime/.test(m)) return 'dietary';
    if (/livra|deliver|commander|order|commande/.test(m)) return 'order';
    if (/horaire|ouvert|heure|quand|where|où|adresse|location/.test(m)) return 'info';
    if (/sucr|dessert|gâteau|cake|brownie|cookie|cheesecake|pâtisserie|banana/.test(m)) return 'desserts';
    if (/boisson|drink|lassi|jus|juice/.test(m)) return 'drinks';
    if (/bonjour|hello|hi|salut|hey|coucou/.test(m)) return 'greeting';
    if (/merci|thank/.test(m)) return 'thanks';
    return 'general';
  }

  /* ── RESPONSE ENGINE ── */
  function getResponse(intent, msg) {
    const m = msg.toLowerCase();

    switch(intent) {
      case 'greeting':
        return {
          text: 'Bonjour ! Je suis Vanessa, votre conseillère Nimara. 🌟\n\nCuisine indienne authentique et pâtisseries artisanales, livrées à Genève.\n\nQu\'est-ce qui vous ferait plaisir ?',
          buttons: ['🍛 Box repas midi', '🎉 Événement', '📋 Notre carte', '📍 Nous trouver']
        };

      case 'box_midi':
        return {
          text: `Nos box repas midi sont parfaites pour les équipes ! Tout est livré et récupéré.\n\n📦 **Essentiel** — CHF ${KB.boxMidi.essentiel.price}/pers.\n${KB.boxMidi.essentiel.desc}\n\n⭐ **Découverte** — CHF ${KB.boxMidi.decouverte.price}/pers.\n${KB.boxMidi.decouverte.desc}\n\n💎 **Premium** — CHF ${KB.boxMidi.premium.price}/pers.\n${KB.boxMidi.premium.desc}\n\nPour combien de personnes souhaitez-vous commander ?`,
          buttons: ['Voir les protéines', 'Commander sur WhatsApp', 'Page entreprises']
        };

      case 'event':
        let eventType = 'cocktail';
        if (/buffet/.test(m)) eventType = 'buffet';
        if (/midi|lunch|déjeuner/.test(m)) eventType = 'midi';
        if (/mariage|wedding/.test(m)) {
          return {
            text: 'Félicitations pour votre mariage ! 🥂\n\nNous proposons des formules apéro dînatoire sur mesure :\n\n🍛 Sélection indienne : samosas, pakora, tandoori, naans\n🍰 Pâtisseries : cheesecakes, brookies, cinnamon rolls\n🍹 Boissons maison : lassi mangue, jus de gingembre, hibiscus\n\nÀ partir de **CHF 28/pers.** tout compris (livraison, service, matériel).\n\nCombien d\'invités prévoyez-vous ?',
            buttons: ['Demander un devis', 'Voir le menu', 'Contacter Nikhil']
          };
        }
        const ev = KB.evenements[eventType];
        return {
          text: `Pour votre événement, voici notre formule ${eventType} :\n\n**À partir de CHF ${ev.price}/pers.**\n${ev.desc}\n\nNous nous occupons de tout : livraison, mise en place, service et récupération.\n\nQuelle est la date et combien de personnes ?`,
          buttons: ['Demander un devis', 'Voir les formules', 'Contacter Nikhil']
        };

      case 'price':
        return {
          text: 'Voici nos tarifs :\n\n📦 **Box repas midi** (entreprise)\n• Essentiel : CHF 15.90/pers.\n• Découverte : CHF 19.90/pers. ⭐\n• Premium : CHF 26.90/pers.\n\n🎉 **Événements**\n• Cocktail : dès CHF 28/pers.\n• Buffet complet : dès CHF 42/pers.\n\n🍰 **Pâtisseries** (à la pièce)\n• Cheesecake : CHF 32\n• Banana Bread : CHF 27.50\n• Brookie : CHF 4.50\n\nTout inclus : livraison, contenants, récupération.\n\nQuelle formule vous intéresse ?',
          buttons: ['Box midi', 'Événement', 'Commander']
        };

      case 'menu':
        return {
          text: 'Notre carte est riche en saveurs ! 🍛\n\n**Protéines** : ' + KB.proteines.slice(0,4).join(', ') + '...\n\n**Entrées** : ' + KB.entrees.slice(0,4).join(', ') + '\n\n**Desserts** : ' + KB.desserts.slice(0,4).join(', ') + '\n\nTout est fait maison, chaque jour, avec des épices torréfiées à la main.\n\nVoulez-vous voir la carte complète ?',
          buttons: ['Voir la carte', 'Box midi', 'Allergènes']
        };

      case 'dietary':
        if (/vegan/.test(m)) {
          return { text: 'Nous avons plusieurs options 100% vegan ! 🌱\n\n• Chana Masala (pois chiches)\n• Pakora (épinards, oignon)\n• Saag Aloo (épinards, pommes de terre)\n• Dal rouge (lentilles)\n• Légumes du jour\n\nToutes nos box peuvent être composées en version vegan. Voulez-vous commander ?', buttons: ['Commander vegan', 'Voir les prix'] };
        }
        if (/halal/.test(m)) {
          return { text: 'Toutes nos viandes sont halal. ✅\n\nPoulet tikka masala, butter chicken, poulet vindaloo, boeuf aux 8 épices — tout est certifié halal.\n\nNous proposons aussi de nombreuses options végétariennes et vegan.', buttons: ['Voir le menu', 'Commander'] };
        }
        if (/allergi|gluten/.test(m)) {
          return { text: 'Voici les allergènes de nos produits principaux :\n\n' + Object.entries(KB.allergenes).map(([k,v]) => `• ${k} : ${v}`).join('\n') + '\n\nN\'hésitez pas à me demander pour un produit spécifique !', buttons: ['Commander', 'Voir la carte'] };
        }
        return { text: KB.info.vegan + '\n\n' + KB.info.halal + '\n\nNous adaptons nos menus à vos besoins. Dites-moi vos restrictions et je compose pour vous !', buttons: ['Options vegan', 'Voir le menu'] };

      case 'desserts':
        return {
          text: 'Nos pâtisseries sont faites maison chaque jour ! 🍰\n\n• **Cheesecake Spéculos** — onctueux, base croustillante\n• **Banana Bread** — moelleux, pépites de chocolat (signature !)\n• **Brookie** — le meilleur du brownie et du cookie\n• **Cinnamon Roll** — cannelle, glaçage vanille\n• **Pecan Pie** — caramel, noix de pécan\n• **Brownie** — fondant, chocolat noir intense\n\nIdéal en dessert dans nos box midi ou pour un coffee break !',
          buttons: ['Ajouter à une box', 'Commander des desserts', 'Voir les prix']
        };

      case 'drinks':
        return {
          text: 'Nos boissons maison : 🍹\n\n• **Mango Lassi** — yaourt, mangue, crémeux\n• **Jus de gingembre** — frais, piquant\n• **Jus d\'hibiscus** — floral, vibrant\n• **Eaux aromatisées** — concombre-menthe, citron-basilic\n\nIncluses dans la formule Premium (CHF 26.90/pers.) ou en supplément (+CHF 4).',
          buttons: ['Formule Premium', 'Commander']
        };

      case 'order':
        return {
          text: 'Pour commander, c\'est simple ! 📦\n\n**Entreprises (box midi)** :\n→ Rendez-vous sur nimara.io/commander\n→ Choisissez formule + protéine + accompagnement\n→ Livraison le jour même !\n\n**Événements & traiteur** :\n→ Contactez Nikhil directement\n→ Devis en 2h\n\n**Particuliers** :\n→ Passez nous voir au stand Délices !\n→ Rue des Délices 3, Genève',
          buttons: ['Commander en ligne', 'WhatsApp Nikhil', 'Nos adresses']
        };

      case 'info':
        return {
          text: `📍 **Adresse** : ${KB.info.adresse}\n📞 **Téléphone** : ${KB.info.tel}\n💬 **WhatsApp** : ${KB.info.whatsapp}\n🕐 **Horaires** : ${KB.info.horaires}\n\n🚚 ${KB.info.livraison}`,
          buttons: ['Commander', 'Voir la carte', 'WhatsApp']
        };

      case 'thanks':
        return {
          text: 'Avec plaisir ! 😊 N\'hésitez pas si vous avez d\'autres questions. On a hâte de vous régaler !',
          buttons: ['Commander', 'Voir la carte']
        };

      default:
        return {
          text: 'Je peux vous aider avec :\n\n🍛 **Nos plats** — curries, samosas, naans et plus\n📦 **Box repas midi** — livraison en entreprise dès CHF 15.90/pers.\n🎉 **Événements** — cocktails, buffets, mariages\n🍰 **Pâtisseries** — cheesecake, brookies, banana bread\n\nQue souhaitez-vous découvrir ?',
          buttons: ['🍛 Menu', '📦 Box midi', '🎉 Événement', '💰 Prix']
        };
    }
  }

  /* ── UI RENDERING ── */
  const page = window.location.pathname;
  let contextGreeting = 'Bienvenue chez Nimara ! Je suis Vanessa. Comment puis-je vous aider ?';
  if (page.includes('/carte')) contextGreeting = 'Vous explorez notre carte ! 🍛 Dites-moi ce qui vous tente — je peux vous conseiller selon vos goûts ou vos allergies.';
  if (page.includes('/entreprise')) contextGreeting = 'Vous cherchez une solution repas pour votre équipe ? Nos box midi sont livrées chaque jour dès CHF 15.90/pers. Combien de personnes êtes-vous ?';
  if (page.includes('/chavannes')) contextGreeting = 'Bienvenue dans l\'univers des saveurs ! 🍛 Curries mijotés, samosas croustillants, naans frais... Que puis-je vous proposer ?';
  if (page.includes('/calculateur')) contextGreeting = 'Besoin d\'aide pour composer votre menu événement ? Dites-moi le nombre d\'invités et l\'occasion !';
  if (page.includes('/ambassadeur')) contextGreeting = 'Bienvenue dans le programme Ambassadeur Nimara ! 🌟 Inscrivez-vous et partagez la bonne cuisine avec votre réseau.';

  let chatOpen = false;
  let messages = [];

  function createWidget() {
    // Trigger button
    const trigger = document.createElement('div');
    trigger.className = 'van-trigger';
    trigger.innerHTML = '<img src="/assets/images/vanessa-avatar.png" alt="Vanessa" onerror="this.style.display=\'none\';this.parentElement.innerHTML=\'<div style=\\'width:100%;height:100%;background:linear-gradient(135deg,#a78bfa,#5B2C8D);border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:20px;font-weight:700\\'>V</div>\'">'
    + '<div class="van-dot"></div>';
    trigger.onclick = toggleChat;

    // Panel
    const panel = document.createElement('div');
    panel.className = 'van-panel';
    panel.id = 'vanPanel';
    panel.innerHTML = `
      <div class="van-header">
        <div class="van-header-info">
          <div class="van-av">V</div>
          <div><div class="van-name">Vanessa</div><div class="van-status">● En ligne</div></div>
        </div>
        <button class="van-close" onclick="document.getElementById('vanPanel').classList.remove('open');document.querySelector('.van-trigger').style.display='flex'">✕</button>
      </div>
      <div class="van-messages" id="vanMessages"></div>
      <div class="van-quick" id="vanQuick"></div>
      <div class="van-input-area">
        <input type="text" id="vanInput" placeholder="Posez votre question..." maxlength="300">
        <button id="vanSend" onclick="vanSendMessage()">→</button>
      </div>`;

    document.body.appendChild(trigger);
    document.body.appendChild(panel);

    // Enter key
    setTimeout(() => {
      const input = document.getElementById('vanInput');
      if (input) input.addEventListener('keypress', e => { if (e.key === 'Enter') vanSendMessage(); });
    }, 500);

    // Auto-open after 4 seconds with context greeting
    setTimeout(() => {
      if (!chatOpen) {
        addMessage('van', contextGreeting);
        showButtons(['🍛 Menu', '📦 Box midi', '🎉 Événement', '💰 Prix']);
      }
    }, 4000);
  }

  function toggleChat() {
    chatOpen = !chatOpen;
    const panel = document.getElementById('vanPanel');
    const trigger = document.querySelector('.van-trigger');
    if (chatOpen) {
      panel.classList.add('open');
      trigger.style.display = 'none';
      if (messages.length === 0) {
        addMessage('van', contextGreeting);
        showButtons(['🍛 Menu', '📦 Box midi', '🎉 Événement', '💰 Prix']);
      }
    } else {
      panel.classList.remove('open');
      trigger.style.display = 'flex';
    }
  }

  function addMessage(role, text) {
    messages.push({ role, text });
    const container = document.getElementById('vanMessages');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'van-msg van-msg-' + role;
    // Convert **bold** to <strong>
    let html = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
    div.innerHTML = `<div class="van-bubble">${html}</div>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  function showButtons(btns) {
    const quick = document.getElementById('vanQuick');
    if (!quick) return;
    quick.innerHTML = btns.map(b => {
      let action = '';
      if (b.includes('WhatsApp') || b.includes('Contacter Nikhil')) action = `onclick="window.open('${WA}','_blank')"`;
      else if (b.includes('carte') || b.includes('Menu')) action = `onclick="window.location='/carte/'"`;
      else if (b.includes('entreprises') || b.includes('Page entreprises')) action = `onclick="window.location='/entreprises/'"`;
      else if (b.includes('Commander en ligne')) action = `onclick="window.location='/commander/'"`;
      else if (b.includes('Nos adresses') || b.includes('Nous trouver')) action = `onclick="vanHandleButton('info')"`;
      else action = `onclick="vanHandleButton('${b}')"`;
      return `<button class="van-qr" ${action}>${b}</button>`;
    }).join('');
  }

  window.vanHandleButton = function(btn) {
    addMessage('user', btn);
    const intent = detectIntent(btn);
    const resp = getResponse(intent, btn);
    setTimeout(() => {
      addMessage('van', resp.text);
      if (resp.buttons) showButtons(resp.buttons);
    }, 400);
    // GA tracking
    if (typeof gtag === 'function') gtag('event', 'vanessa_button', { event_label: btn });
  };

  window.vanSendMessage = function() {
    const input = document.getElementById('vanInput');
    const msg = input.value.trim();
    if (!msg) return;
    input.value = '';
    addMessage('user', msg);
    const intent = detectIntent(msg);
    const resp = getResponse(intent, msg);
    setTimeout(() => {
      addMessage('van', resp.text);
      if (resp.buttons) showButtons(resp.buttons);
    }, 600);
    // GA tracking
    if (typeof gtag === 'function') gtag('event', 'vanessa_message', { event_label: intent });
  };

  window.toggleChat = toggleChat;

  // Init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget);
  } else {
    createWidget();
  }
})();
