# Nimara Site — Eleventy Build System

Static site for **nimara.io** built with [Eleventy (11ty)](https://www.11ty.dev/) and Nunjucks templates.

## Quick start

```bash
npm install
npm start        # dev server at http://localhost:8080
npm run build    # production build → _site/
```

## Project structure

```
nimara-site/
├── src/
│   ├── _includes/
│   │   ├── layouts/
│   │   │   ├── base.njk        # Full HTML shell (head, header, footer, scripts)
│   │   │   ├── page.njk        # base + standard page hero (title, subtitle)
│   │   │   └── standalone.njk  # No layout wrapper (used by /vanessa)
│   │   └── partials/
│   │       ├── header.njk      # Fixed nav bar
│   │       ├── footer.njk      # Footer with links, hours, contact
│   │       ├── whatsapp-cta.njk    # Floating WhatsApp button
│   │       ├── vanessa-widget.njk  # Vanessa AI chat widget
│   │       └── team-profile.njk    # Reusable team member profile
│   ├── _data/
│   │   ├── site.json   # Site config, nav, contact info, social links
│   │   ├── menu.json   # All 44 products with prices, allergens, categories
│   │   └── team.json   # Team members with bio, specialties, quote
│   ├── assets/
│   │   ├── css/
│   │   │   ├── main.css            # Full Nimara brand stylesheet
│   │   │   └── vanessa-widget.css  # Vanessa chat widget styles
│   │   ├── js/
│   │   │   ├── main.js             # Nav, scroll, menu filter, lang toggle
│   │   │   └── vanessa-widget.js   # Vanessa chat logic
│   │   └── images/                 # Place product/team photos here
│   ├── index.njk       # Landing page
│   ├── carte.njk       # Full menu (FR/EN bilingual switcher)
│   ├── chavannes.njk   # Manor Chavannes stand VD
│   ├── delices.njk     # Rue des Délices 3 Geneva / Oh Martine
│   ├── vanessa.njk     # Analytics dashboard (dark theme)
│   └── equipe/
│       ├── marine.njk  # Marine Dubois — Chef Pâtissière
│       ├── rahma.njk   # Rahma Benali — Boulangère
│       ├── inga.njk    # Inga Müller — Chef Traiteur
│       └── nino.njk    # Nino Kapanadze — Accueil & Ventes
├── .eleventy.js    # Eleventy config (filters, passthrough, output dir)
├── netlify.toml    # Build command, redirects, cache headers
└── package.json
```

---

## How to add a new page

1. Create `src/my-page.njk`
2. Add front matter at the top:

```njk
---
layout: page          # or "base" for a blank layout
title: My Page Title
subtitle: "Optional subtitle shown under the title"
description: "Meta description for SEO"
eyebrow: "Category · Label"   # small text above the title
permalink: /my-page/
---

<!-- Your HTML content here -->
<section class="section">
  <div class="container">
    <h2>Hello</h2>
  </div>
</section>
```

3. Add it to `src/_data/site.json` → `nav` array if it should appear in the menu.

---

## How to edit the menu

Open `src/_data/menu.json`. Each product has:

```json
{
  "id": 45,
  "category": "viennoiseries",
  "name": { "fr": "Nom en français", "en": "Name in English" },
  "description": { "fr": "Description FR", "en": "Description EN" },
  "price": 4.50,
  "unit": "pièce",
  "allergens": ["gluten", "lactose"],
  "available": true,
  "badge": "Nouveau"
}
```

**Categories:** `pains` · `viennoiseries` · `patisseries` · `traiteur` · `formules`

**Allergen keys:** `gluten` · `lactose` · `oeufs` · `fruits_a_coque` · `sesame` · `soja` · `arachides` · `celeri` · `moutarde` · `poisson`

**Badge values:** `Signature` · `Bestseller` · `Nouveau` · `Oh Martine` · `Chavannes` · `Corporate` · `Sur Mesure`

For a product priced "on quote" instead of a fixed price:
```json
"price": null,
"priceLabel": { "fr": "Sur devis", "en": "On quote" }
```

---

## How to add a team member

1. Add an entry to `src/_data/team.json`:

```json
{
  "id": "prenom",
  "name": "Prénom Nom",
  "role": "Titre du poste",
  "bio": "Biographie...",
  "specialties": ["Spécialité 1", "Spécialité 2"],
  "quote": "Citation personnelle.",
  "image": "/assets/images/team/prenom.jpg",
  "instagram": "https://instagram.com/handle"
}
```

2. Create `src/equipe/prenom.njk`:

```njk
---
layout: base
title: Prénom Nom — Titre
description: "Description SEO"
permalink: /equipe/prenom/
---

{% set member = team | selectattr("id", "equalto", "prenom") | first %}
{% include "partials/team-profile.njk" %}
```

3. Optionally add a redirect in `netlify.toml`:

```toml
[[redirects]]
  from   = "/prenom"
  to     = "/equipe/prenom/"
  status = 301
```

---

## Brand tokens

| Token | Value | Usage |
|---|---|---|
| `--violet` | `#5B2C8D` | Primary colour |
| `--lavender` | `#a78bfa` | Accents, eyebrows |
| `--lavender-lt` | `#c4b5fd` | Dark bg accents |
| `--cream` | `#faf8f5` | Light section bg |
| `--dark` | `#1a0d30` | Dark sections |
| `--gold` | `#c9a96e` | Premium accents |
| `--green-wa` | `#25D366` | WhatsApp CTA |
| `--font-body` | DM Sans | All body text |
| `--font-display` | Playfair Display | Headings & quotes |

---

## Deploying to Netlify

Push to your connected GitHub repo — Netlify auto-deploys on every push to `main`.

Manual deploy:
```bash
npm run build
# Then drag _site/ into the Netlify UI, or use the CLI:
netlify deploy --prod --dir=_site
```

Build settings (already in `netlify.toml`):
- **Build command:** `npm run build`
- **Publish directory:** `_site`
- **Node version:** 18

---

## WhatsApp ordering

All CTAs link to `https://wa.me/41225576020` with pre-filled messages.
To change the default message, edit `whatsappMessage` in `src/_data/site.json`.
