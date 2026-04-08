# Vanessa Backend — Guide de Deploiement n8n

## Architecture

```
Visiteur nimara.io
    |
    v
[vanessa-widget.js] --POST--> [n8n Webhook /vanessa-chat]
    |                                    |
    |                                    v
    |                          [Claude API (Sonnet)]
    |                                    |
    |                                    v
    |                          [Parse JSON response]
    |                                    |
    |    <---JSON response---            |
    |                                    |
    |  ---analytics beacon--->  [n8n Webhook /vanessa-analytics]
    |                                    |
    |                                    v
    |                          [Static Data Storage]
    |                                    |
    v                                    v
[Dashboard /vanessa/] ---GET--> [Analytics Read Endpoint]
```

## Etape 1 : Variable d'environnement

Dans n8n (https://nimarageneve.app.n8n.cloud/) :
1. Aller dans **Settings > Variables** (ou Environment Variables)
2. Ajouter : `ANTHROPIC_API_KEY` = votre cle API Anthropic (sk-ant-...)

## Etape 2 : Importer le workflow Chat

1. Dans n8n, cliquer **Add workflow** > **Import from file**
2. Importer `vanessa-chat-workflow.json`
3. Verifier que le noeud **Claude API** utilise bien `{{ $env.ANTHROPIC_API_KEY }}`
4. **Activer** le workflow (toggle en haut a droite)
5. Noter l'URL du webhook : `https://nimarageneve.app.n8n.cloud/webhook/vanessa-chat`

## Etape 3 : Importer le workflow Analytics

1. Importer `vanessa-analytics-workflow.json`
2. **Activer** le workflow
3. Verifier les deux webhooks :
   - POST `/webhook/vanessa-analytics` (recoit les evenements)
   - GET `/webhook/vanessa-analytics` (sert les donnees au dashboard)

## Etape 4 : Tester

### Test du chat
```bash
curl -X POST https://nimarageneve.app.n8n.cloud/webhook/vanessa-chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Bonjour, vous faites des livraisons pour 20 personnes ?", "sessionId": "test-001", "page": "/"}'
```

Reponse attendue :
```json
{
  "reply": "Absolument ! Nos formules sont livrees dans tout Geneve...",
  "buttons": [{"label": "...", "value": "voir_calculateur"}],
  "signal": "hot",
  "sessionId": "test-001"
}
```

### Test des analytics
```bash
# Envoyer un evenement
curl -X POST https://nimarageneve.app.n8n.cloud/webhook/vanessa-analytics \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "test-001", "signal": "hot", "userMessage": "test", "page": "/"}'

# Lire les analytics
curl "https://nimarageneve.app.n8n.cloud/webhook/vanessa-analytics?range=7d"
```

## Etape 5 : Deployer le site

Apres avoir push les modifications sur GitHub, Netlify rebuild automatiquement.
Le widget Vanessa sur nimara.io appellera directement le webhook n8n.

## Structure des fichiers

```
n8n/
  vanessa-chat-workflow.json      # Workflow n8n a importer (chat)
  vanessa-analytics-workflow.json # Workflow n8n a importer (analytics)
  vanessa-system-prompt.txt       # System prompt complet (reference)
  GUIDE-DEPLOIEMENT.md            # Ce fichier

src/assets/js/vanessa-widget.js   # Widget modifie (appelle n8n)
src/vanessa.njk                   # Dashboard modifie (lit n8n)
```

## Couts estimes

- Claude Sonnet : ~$3/MTok input, ~$15/MTok output
- ~500 tokens/requete en moyenne
- 100 conversations/jour = ~$0.75/jour
- Budget mensuel estime : CHF 20-25

## Securite

- L'API key Anthropic est stockee comme variable d'environnement n8n (jamais dans le code)
- Les webhooks n8n ont des CORS configures pour nimara.io uniquement
- Aucune donnee personnelle n'est stockee (pas d'email, pas de nom)
- Les sessions expirent apres 24h
- Les stats sont gardees 90 jours maximum

## Troubleshooting

| Probleme | Solution |
|----------|----------|
| Widget ne repond pas | Verifier que le workflow n8n est actif |
| Erreur CORS | Verifier allowedOrigins dans le webhook n8n |
| Reponse mal formatee | Verifier le noeud "Parse Claude Response" |
| Dashboard vide | Verifier que le workflow analytics est actif |
| Cout eleve | Reduire max_tokens dans le noeud Claude API |
