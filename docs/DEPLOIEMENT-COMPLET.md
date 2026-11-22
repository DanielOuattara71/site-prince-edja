# Déploiement complet — Prince EDJA (site public + admin + API)

> Guide opérationnel unique, valable au **22/11/2026**. Il remplace les indications divergentes
> du `README.md` (qui annonce Vercel alors que la CI déploie sur GitHub Pages) et résume
> `prince-edja-api/docs/DEPLOIEMENT.md`, `docs/IMAGES-CLOUDINARY.md` et
> `.github/workflows/deploy.yml`.
>
> **Règle d'or** : aucun secret dans le dépôt. Les secrets ne vivent que dans l'hébergeur / la CI.

---

## 0. État actuel — ce qui est réellement en ligne

| Brique | État au 22/11/2026 |
|---|---|
| **Site public — GitHub Pages** | Déployé : commit `9dab943` sur `recent`, workflow *Deploy to GitHub Pages* ✅ (`https://danielouattara71.github.io/site-prince-edja/`) |
| **Site public — Vercel** | Déployé **manuellement** via CLI (`vercel deploy --prod`) : `https://test-seven-jet-68.vercel.app/` ✅ — **pas lié au git** (`vercel git connect` non fait) |
| **Admin** | ❌ **pas hébergé** — local `http://localhost:5180/admin` seulement |
| **API** | ❌ **pas hébergée** — local `http://localhost:3000` seulement |
| **Cloudinary** | ❌ aucun compte / secret configuré en production |
| **Données du site** | Les builds publics tournent en **mode statique** (`src/data/`) → les images assignées dans l'admin ne sont pas visibles |
| **Correctif Vercel** | `vercel.json` réparé (assets servis avec les bons types MIME) et `.gitignore` (`.vercel`) : **non commités** |

**Conséquence concrète** : tant que l'API n'est pas en ligne, changer une image dans l'admin ne
change **rien** sur le site public. C'est le point de blocage n° 1.

---

## 1. Décisions à prendre AVANT de commencer (question Q-21)

Ces choix conditionnent toutes les variables ci-dessous :

1. **Hébergeur de l'API** (Node 24 + PostgreSQL 15+) : Render, Railway, Fly.io, VPS…
2. **Hébergeur du site public** : GitHub Pages (CI existante) **ou** Vercel.
3. **Hébergeur de l'admin** : Vercel / Netlify / même hébergeur que l'API.
4. **Domaine et origine canonique** (ex. `https://prince-edja.com` ou
   `https://danielouattara71.github.io/site-prince-edja/`) → `PUBLIC_SITE_ORIGIN`.
5. **Compte Cloudinary** (plan gratuit suffisant) et **compte Brevo** (e-mails).

---

## 2. Vue d'ensemble du flux

```
Admin (navigateur)
   │  upload / affectation d'une photo fixe
   ▼
API admin  ──►  PostgreSQL (clé de fichier seule)  ──►  Cloudinary (binaire)
   │
   │  publication → webhook (DEPLOY_HOOK_URL)
   ▼
CI / Vercel  ──►  npm run charger (API publique)  ──►  build PUBLIC_DATA_SOURCE=api
   ▼
Site public  ──►  URL Cloudinary dans les <img>
```

---

## 3. Étape 1 — Cloudinary

1. Créer le compte ; noter **cloud name**, **API key**, **API secret**.
2. Activer la livraison des PDF (Settings → Security).
3. Secrets à poser sur **l'API** : `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`,
   `CLOUDINARY_API_SECRET` (`CLOUDINARY_DOSSIER=prince-edja` par défaut).
4. Pousser les **images statiques** du dépôt :
   ```bash
   cd test
   CLOUDINARY_CLOUD_NAME=… CLOUDINARY_API_KEY=… CLOUDINARY_API_SECRET=… \
     node scripts/pousser-images-cloudinary.mjs
   CLOUDINARY_CLOUD_NAME=… CLOUDINARY_API_KEY=… CLOUDINARY_API_SECRET=… \
     node scripts/pousser-images-cloudinary.mjs --verifier
   # Pour remplacer un placeholder par une vraie photo (invalide le cache) :
   … node scripts/pousser-images-cloudinary.mjs --ecrase
   ```
5. Variable de build du site (si les statiques doivent venir du CDN) :
   ```
   PUBLIC_IMAGES_BASE_URL=https://res.cloudinary.com/<cloud>/image/upload/prince-edja/site
   ```
   Détails : `docs/IMAGES-CLOUDINARY.md`.

---

## 4. Étape 2 — PostgreSQL

- Version **15+**, base vide.
- **Deux rôles** :
  - propriétaire → migrations + seed (`DATABASE_MIGRATION_URL`) ;
  - connexion API, **non propriétaire**, sans `BYPASSRLS` (`DATABASE_URL`).
- Sauvegardes automatiques + **restauration testée**.

---

## 5. Étape 3 — API (`prince-edja-api`)

### 5.1 Construire / démarrer

```bash
cd prince-edja-api
npm ci
npm run build            # tsc + copie des données de seed
docker build -t prince-edja-api .   # image de production (pas de .env, pas de node_modules de dev)
# ou démarrage Node direct : npm start  (port 3000)
```

### 5.2 Variables d'environnement (production)

```dotenv
NODE_ENV=production
PORT=3000
DATABASE_URL=postgres://<rôle-api>:@<host>:5432/<db>
DATABASE_MIGRATION_URL=postgres://<propriétaire>:@<host>:5432/<db>
SESSION_SECRET=<≥32 caractères aléatoires>
ALLOWED_ORIGINS=https://<admin>,https://<site>
PUBLIC_SITE_URL=https://<site>
ADMIN_URL=https://<admin>                       # HTTPS obligatoire en prod
CLOUDINARY_CLOUD_NAME=…
CLOUDINARY_API_KEY=…
CLOUDINARY_API_SECRET=…
BREVO_API_KEY=…
MAIL_FROM=…@domaine vérifié
MAIL_TEAM_TO=…@domaine
DEPLOY_HOOK_URL=https://<hook de reconstruction du site>
DEPLOY_HOOK_FORMAT=generique                   # ou github
DEPLOY_HOOK_TOKEN=…                            # si requis
DEPLOY_HOOK_REF=recent                         # si format github
BUILD_CALLBACK_SECRET=<≥32 caractères>
DOCS_ACTIVES=false
BOOTSTRAP_SUPERADMIN_EMAIL=…                   # une seule fois, puis retirer
BOOTSTRAP_SUPERADMIN_NOM=…
```

### 5.3 Amorçage (une fois)

```bash
npm run start:migrer
npm run start:semer
BOOTSTRAP_SUPERADMIN_EMAIL=vous@exemple.test npm run start:bootstrap
# → changer immédiatement le mot de passe du super-admin créé
```

### 5.4 Vérifications

- `GET /sante` → 200 ; `GET /pret` → 200.
- Test d'envoi image **et** PDF → vérifier que l'URL renvoyée est `res.cloudinary.com/…`.
- Test d'e-mail (équipe + visiteur).
- En production, `StockageCloudinary` est sélectionné automatiquement (`NODE_ENV=production`).

---

## 6. Étape 4 — Site public

### Option A — GitHub Pages (CI existante, recommandée)

**Variables du dépôt GitHub (Repo settings → Secrets and variables → Actions → Variables)** :

| Variable | Rôle |
|---|---|
| `PUBLIC_API_URL` | adresse publique de l'API ; **si vide, le build reste en mode statique** |
| `PUBLIC_SITE_ORIGIN` | origine canonique (og:url, canonical) |
| `PUBLIC_IMAGES_BASE_URL` | base Cloudinary des images statiques |
| `API_URL` | base de l'API pour les callbacks de build (secrets) |
| `BUILD_CALLBACK_SECRET` | secret partagé pour `/internal/api/v1/publication/*` |

**Processus déclenché par un push sur `recent`** :
1. *Barrière de qualité* : `npm run lint` → `npm run typecheck` → `npm run test` ;
2. *Build* : `npm run charger` (si `PUBLIC_API_URL` renseigné) puis `npm run build` avec
   `PUBLIC_DATA_SOURCE=api` ;
3. *Deploy* : upload `dist/` → GitHub Pages.

### Option B — Vercel

```bash
cd test
vercel git connect          # déploiement automatique à chaque push
vercel deploy --prod        # déploiement manuel immédiat
```
Variables à poser dans le projet Vercel : `PUBLIC_API_URL`, `PUBLIC_SITE_ORIGIN`,
`PUBLIC_IMAGES_BASE_URL`. Le `vercel.json` corrigé (à committer) doit rester :

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [
    { "source": "/site-prince-edja/:path*", "destination": "/:path*" },
    { "source": "/((?!assets/|images/|favicon\\.svg|robots\\.txt).*)", "destination": "/index.html" }
  ]
}
```

⚠️ **Piège Vercel** : l'ancienne règle réécrivait *tous* les `.js`/`.css` en `index.html`
(`text/html`) → page sans styles ni JS. La règle ci-dessus corrige cela.
⚠️ Vérifier l'option *Deployment Protection* (`vercel_authentication`) si le client doit
accéder sans compte Vercel.

### Contrôle local avant poussée

```bash
cd test
npm run typecheck && npm run lint && npm run test
PUBLIC_API_URL=https://<api> npm run charger
PUBLIC_DATA_SOURCE=api npm run build
node scripts/servir-dist.mjs        # aperçu fidèle (pas `vite preview`)
```

`src/data/generated/` est **gitignoré** : la CI/Vercel doit toujours exécuter `npm run charger`
avant le build en mode API.

---

## 7. Étape 5 — Admin

```bash
cd test/admin
npm run build        # tsc -b && vite build && node scripts/verifier-dist.mjs
```

Héberger le contenu de `admin/dist/` :

- base path : `/admin/` (`ADMIN_BASE`);
- `VITE_API_URL=/admin/api/v1` (recommandé) avec **reverse proxy** `/admin/api/v1` → API,
  ou une URL absolue HTTPS ;
- **même origine** entre admin et API pour les cookies de session / CSRF ;
- `GET /connexion` → se connecter avec le super-admin créé à l'étape 5.3 ;
- modifier le mot de passe initial.

**Contrôle de contrat** (optionnel, contre une API réelle) :
```bash
cd admin && API_REELLE=1 VITE_API_URL=https://<api>/admin/api/v1 \
  ADMIN_EMAIL=… ADMIN_MOT_DE_PASSE=… npx vitest run src/api/contrat-reel.test.ts
```

---

## 8. Étape 6 — Domaine et SEO

- Poser `PUBLIC_SITE_ORIGIN=https://<domaine final>` pour les builds du site.
- **À corriger** : `public/robots.txt` et `public/sitemap.xml` pointent encore vers
  `https://prince-edja.vercel.app` **sans** le préfixe `/site-prince-edja/` → les aligner sur
  l'origine finale et régénérer le sitemap.
- `README.md` annonce Vercel : à mettre en accord avec l'hébergeur effectivement retenu.

---

## 9. Étape 7 — Vérification de bout en bout (checklist)

- [ ] `GET /sante` et `GET /pret` de l'API → 200.
- [ ] Connexion admin avec le super-admin.
- [ ] Upload d'une image dans la médiathèque → URL renvoyée en `res.cloudinary.com/…`.
- [ ] Affecter la photo à **« Accueil — portrait »** (Médiathèque › Sur le site) → publication.
- [ ] Build du site déclenché (webhook) → terminé en succès.
- [ ] Sur le **site public**, la page d'accueil affiche le nouveau portrait
      (`src/acces/site.ts` → `accueil.heros`, `IntroBio` → `accueil.portrait`).
- [ ] Assets CSS/JS servis avec `text/css` / `application/javascript` (piège Vercel).
- [ ] Routes `/`, `/a-propos`, une fiche boutique, `/histoires` → 200 + rendu correct.
- [ ] `npm run contraste` (site) et `npm run lint` (admin, zéro avertissement toléré).
- [ ] Sauvegarde PostgreSQL restaurée avec succès sur un environnement de test.

---

## 10. Retour arrière

- Redéployer l'image/le commit précédent de l'API ; si les migrations sont compatibles, la base
  ne bouge pas.
- Sinon : `prince-edja-api/docs/RETOUR-ARRIERE.md`.
- Site : repusher le commit précédent sur `recent` (Pages) ou `vercel deploy --prod` de
  l'identifiant précédent (Vercel).

---

## 11. Pièges déjà rencontrés (à ne pas reproduire)

| Piège | Solution |
|---|---|
| `vercel.json` réécrit les assets en HTML (site sans style ni JS) | rewrites corrigés au § 6 option B |
| Build API sans `src/data/generated/` → erreur | toujours `npm run charger` avant |
| `PUBLIC_API_URL` vide dans la CI → build statique (images CMS invisibles) | renseigner la variable |
| Contrat modifié sans mettre à jour empreinte/version | `docs/CONTRAT-API.md` + copie API **byte-identique** + SHA dans `tests/unitaires/contrat.test.ts` |
| `sitemap.xml` / `robots.txt` avec la mauvaise origine | voir § 8 |
| Workflow « Admin — contrôles » en échec sur `9dab943` | à diagnostiquer séparément (indépendant du déploiement) |

---

## 12. Commandes rapides (récapitulatif)

```bash
# Contrôles site
cd test && npm run typecheck && npm run lint && npm run test && npm run build

# Mode API local
PUBLIC_API_URL=http://127.0.0.1:3000 npm run charger
PUBLIC_DATA_SOURCE=api npm run build
node scripts/servir-dist.mjs

# Contrôles admin
cd test/admin && npm run typecheck && npm run lint && npm run test && npm run build

# Contrôles API
cd prince-edja-api && npm run typecheck && npm run lint && npm run test:tout

# Déploiements
cd test && git push origin HEAD:recent      # GitHub Pages
cd test && vercel deploy --prod             # Vercel
```
