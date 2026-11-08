# Prompt de reprise — Prince EDJA : tout ce qui reste à faire

> Rédigé le 08/11/2026, branche `correctifs-site`. Destiné à l'agent IA ou au développeur qui reprend
> le projet. Lis ce fichier en entier avant de toucher au code, puis `AGENTS.md`,
> `docs/PLAN-DE-LANCEMENT.md`, `docs/CONTRAT-API.md` et `docs/QUESTIONS.md`.

## 0. Ton rôle et les règles du projet

Tu es ingénieur principal et designer produit sur Prince EDJA (site d'un créateur de récits de
voyage ivoirien, son espace d'administration et son API). Tu corriges, simplifies et termines : tu ne
repars jamais de zéro.

Règles non négociables :

1. **Le contrat fait foi.** `docs/CONTRAT-API.md` (version 1.5.0 arrêtée) décrit tout échange entre
   l'admin, le site et l'API. Aucun code ne précède la version du contrat qui le décrit. Sa copie
   `prince-edja-api/docs/contrat/CONTRAT-API.md` doit rester identique octet pour octet (un test du
   back end le vérifie).
2. **Rien n'est supprimé sans confirmation écrite** du client (fichiers, tables, tests, contenus).
   Les étapes C8 et C9 n'ont lieu que sur ordre écrit.
3. **Aucun contenu inventé.** Un texte, un prix, une date ou une provenance absents restent vides et
   s'affichent « à fournir ». Une incertitude va dans `docs/QUESTIONS.md`.
4. **Migrations additives seulement**, chacune avec sa descente testée.
5. **Aucun secret** dans le code, les tests, les journaux ou les commits (`.env` est ignoré).
6. **Aucune dépendance** sans une ligne dans `docs/DEPENDANCES.md` (nom, rôle, alternative écartée).
7. **Chaque étape se termine** par : types, lint, tests, build — avec le résultat réel des commandes —
   puis une vérification dans un vrai navigateur pour tout ce qui touche l'interface.
8. **Commit et push seulement sur demande.** Un push sur `recent` **déploie** le site en production
   (GitHub Pages) : ne jamais pousser sur `recent` sans ordre explicite.
9. Chaque décision prise est consignée : `admin/docs/DECISIONS.md` (D-xx, site et admin) ou
   `prince-edja-api/docs/DECISIONS.md` (B-xx, back end).

## 1. État au 08/11/2026 (vérifié)

| Brique | Dépôt | État |
|---|---|---|
| Site public | `~/projets/test` (racine), GitHub `site-prince-edja` | Toutes les pages existent. Couche d'accès `src/acces/` (porte G1). Lit l'API **à la construction** en mode `PUBLIC_DATA_SOURCE=api` (S2, première moitié) ; par défaut, données de départ de `src/data/`. 73 tests. |
| Admin | `~/projets/test/admin` | 9 entrées de menu, tourne sur l'API réelle (`npm run dev:api`). 276 tests unitaires, 12 parcours Playwright sur 12 contre l'API, test de contrat 39 sur 39. |
| Back end | `~/projets/prince-edja-api`, GitHub `backend_prince_edja` | Fastify, Drizzle, PostgreSQL 17 (Docker, port 5433). Lots 0 à 4 écrits, migrations 0001 à 0011. Vue publique § 18.1. **Jamais déployé.** |

Circuit vérifié sur la machine de développement :
- admin ↔ API : lecture et écriture dans les deux sens ;
- API → site : `npm run charger` puis construction en mode API, 19 pages contrôlées en navigateur ;
- site → API : les formulaires **contact** et **collaboration** envoient à `POST /public/api/v1/contact`
  et `/collaboration` quand `PUBLIC_API_URL` est défini (en développement : `http://localhost:3000`
  par défaut). **Jamais vérifié de bout en bout.** Sans adresse, ils préparent un e-mail.

Le travail des sessions S0, S1, S2, des étapes admin C2 à C7, E1, D-81 à D-83 et du back end B-61 à
B-66 **n'est pas encore commité** au moment où ce fichier est écrit (le client s'en charge).

## 2. Environnement et pièges de la machine

- Projets sous WSL (Ubuntu 24.04). **Ouvre-les dans WSL** (VS Code : « WSL: Open Folder in WSL »). En
  passant par `\\wsl.localhost` depuis Windows, le pont de fichiers tombe dès que la machine est
  chargée (WSL n'a que 3,8 Go de mémoire) : les commandes sont alors refusées en bloc.
- **Une commande lourde à la fois** : la suite d'intégration du back end, un build, Playwright. Un
  processus `openclaw gateway` tourne en permanence dans WSL et consomme aussi.
- Lancer les trois briques :
  ```bash
  # Base : conteneur Docker prince-edja-api-postgres-1 (port 5433), déjà démarré en général
  cd ~/projets/prince-edja-api && npx tsx --env-file=.env src/index.ts      # API, port 3000
  cd ~/projets/test/admin && npm run dev:api                                 # admin, port 5180
  cd ~/projets/test && PUBLIC_API_URL=http://127.0.0.1:3000 npm run charger   # données du site
  cd ~/projets/test && PUBLIC_DATA_SOURCE=api npm run dev                     # site
  ```
- Vérifications : site `npm run typecheck && npm run lint && npm run test && npm run build` ;
  admin idem dans `admin/` (+ `npm run test:e2e` avec l'API) ; back end `npm run lint`,
  `npm run typecheck`, `npx vitest run` (long : plus de 10 minutes), `npm run build`.
- **Prettier** : la configuration ne précise pas `semi`, donc `prettier --write` ajoute des
  points-virgules alors que tout le code n'en a pas. Toujours `npx prettier --no-semi --write`, ou
  mieux, ajouter `"semi": false` à `.prettierrc` (tâche A3).
- La base de développement contient des contenus d'essai titrés « Exemple : » (un de chaque famille,
  plus des articles « Exemple E2E » publiés par les parcours Playwright). Ils servent aux
  vérifications ; à retirer depuis l'admin avant toute reprise de données réelles en développement.
- Pièges de code déjà documentés dans `AGENTS.md` (Leaflet, `var(--color-*)` dans un attribut SVG,
  `StrictMode`, valeurs arbitraires Tailwind avec virgules, échelle z-index) : à relire.

## 3. Tâches, par ordre de priorité

Chaque tâche indique son **critère de fin**. Ne passe à la suivante qu'une fois le critère atteint et
vérifié.

### A. Remise au propre (avant tout le reste)

- **A1 · Suite complète du back end.** Elle n'a pas été relancée après B-66 (catalogue public).
  Fin : `npx vitest run` vert dans `prince-edja-api`, résultat noté dans B-66.
- **A2 · Vérifications du site après reformatage.** Fin : types, lint (5 avertissements anciens
  tolérés), 73 tests, build par défaut et build en mode API verts.
- **A3 · Style Prettier.** Ajouter `"semi": false` à `.prettierrc` (site) pour que l'outil suive le
  code existant ; vérifier que `npx prettier --check src` ne signale plus de fichiers.
- **A4 · `AGENTS.md`.** Ajouter `npm run charger`, `PUBLIC_DATA_SOURCE`, `src/acces/source.ts` et
  `adaptateurs.ts`, et retirer la mention « Reste pour S2 : les adaptateurs » devenue fausse.
- **A5 · Fichiers parasites de `docs/`** (dans les deux dépôts) : fichiers `*:Zone.Identifier`
  (métadonnées Windows) et doublons « (1) », « (2) » de documents de référence. **Ne rien supprimer** :
  dresser la liste, la soumettre au client, puis les ignorer ou les retirer selon sa réponse.
- **A6 · Commits** (si le client le demande) : site + admin sur `correctifs-site`, back end sur sa
  branche ; jamais `src.zip` ; vérifier qu'aucun `.env` n'est suivi.

### B. Site public — finir S2 (porte G4)

- **B1 · Prérendu.** Aujourd'hui le HTML d'une page ne contient que la coquille ; le contenu arrive
  par JavaScript. Générer à la construction une page HTML par route publique (y compris chaque
  `/journal/:slug`, `/xplore/:slug`, `/boutique/:objet`, `/destinations/:slug`), avec `title`,
  `description`, balises `og:*` et contenu. Choisir l'outil (rendu React côté serveur au build, ou
  un outil de prérendu), le justifier dans `docs/DEPENDANCES.md` s'il est nouveau, garder
  `BrowserRouter basename="/site-prince-edja"` fonctionnel. Fin : porte G4 — `curl` d'une page
  montre son titre, sa description et son texte ; navigation client toujours fluide.
- **B2 · Familles encore lues dans `src/data/`.** Les charger depuis l'API et les adapter comme les
  autres (`src/acces/adaptateurs.ts` + tests) : villes et programme Taste & Travel
  (`/contenus/villes`), archive (`/contenus/archive`), univers, audience, motifs de contact, études
  de cas, galeries accueil et boutique, photos fixes (`/photos-fixes`), identité, navigation,
  textes d'interface et pages (`/site`, `/reglages`). Chaque route doit d'abord exister **et**
  figurer au contrat (sinon : question au contrat, version 1.6.0). Fin : en mode API, plus aucune
  donnée de départ affichée hors fond de carte.
- **B3 · Formulaires.** Vérifier de bout en bout contact et collaboration (message en base, visible
  dans l'admin). Brancher la **lettre d'information** (`POST /newsletter`, double confirmation) et la
  **demande de pièces** d'Edja Shop (`POST /demandes`, aujourd'hui un e-mail préparé dans
  `src/lib/demande.tsx`). Fin : chaque formulaire écrit dans l'API ; repli e-mail conservé si l'API
  est absente.
- **B4 · CI de déploiement** (`.github/workflows/deploy.yml`, push sur `recent`). Ajouter lint,
  typecheck et tests avant le build ; puis, une fois l'API en ligne : `npm run charger` avec
  `PUBLIC_API_URL` (variable du dépôt, pas un secret) et build en `PUBLIC_DATA_SOURCE=api`. Ajouter
  le déclenchement par l'API (`workflow_dispatch`, Q-22 et Q-44 du back end, exemple dans
  `prince-edja-api/docs/PUBLICATION.md`). Fin : une publication dans l'admin reconstruit le site.
- **B5 · Domaine et référencement.** Une fois le domaine choisi : `public/sitemap.xml` et
  `public/robots.txt` cohérents avec l'adresse réelle (aujourd'hui une adresse Vercel fausse),
  sitemap généré depuis les routes et les contenus chargés, `README.md` corrigé (il annonce Vercel).
- **B6 · Questions 35 à 37** (`docs/QUESTIONS.md` § 17) : étiquettes `pays`/`theme` absentes des
  listes publiques, produits publics sans identifiant, textes d'interface qui comptent les contenus
  en dur (« Six routes. Six histoires. »). Proposer les changements de contrat (1.6.0), les faire
  valider, puis coder.
- **B7 · Brique morte** : `src/components/brand/Embleme.tsx`, exporté mais jamais importé. À
  brancher dans l'en-tête ou à proposer à la suppression (C9).

### C. Back end

- **C1 · Pagination mixte du catalogue** (`GET /boutique/produits`, B-66) : bijoux et livres sont
  paginés chacun de leur côté ; une page peut porter deux fois `pageSize` et le tri n'est pas
  global. Écrire une requête unique triée (`UNION`). Fin : test d'intégration avec plus d'une page de
  produits mêlés, total et tri exacts.
- **C2 · Routes publiques manquantes ou à trancher** : Q-53 à Q-56 du back end (`/contenus/articles`
  déjà servi ; `/galeries/:emplacement`, `/etiquettes`, `/contenus/createurs`), `GET /site`
  (identité, navigation, textes d'interface, langues). Contrat d'abord.
- **C3 · E-mails** : brancher Brevo (Q-25) pour les accusés de contact, la double confirmation de la
  lettre et les demandes ; doubles en test, vraie clé en préproduction seulement.
- **C4 · Reconstruction du site** : `DEPLOY_HOOK_URL` vers le `workflow_dispatch` de GitHub (Q-22),
  retour d'état `BUILD_CALLBACK_SECRET` ; suivi visible dans l'admin (`/site/etat-reconstruction`).
- **C5 · Déploiement** selon `prince-edja-api/docs/DEPLOIEMENT.md` (procédure écrite, jamais
  exécutée) : hébergeur Node, PostgreSQL géré, Cloudinary, Brevo, domaine `api.<domaine>`,
  migrations par `npm run start:migrer`, premier super-admin par `BOOTSTRAP_SUPERADMIN_*`,
  sauvegardes **et essai de restauration** (Q-50). Fin : `GET /sante` et `GET /pret` en
  préproduction, l'admin s'y connecte, un contenu publié apparaît sur le site reconstruit.
- **C6 · Exploitation** : suivi des erreurs (Q-24, point d'entrée `signalerErreur()` déjà prévu),
  compteur d'échecs de connexion à partager si plusieurs instances (Q-38).
- **C7 · CI du back end** : vérifier qu'elle lance lint, types, tests unitaires et d'intégration
  (PostgreSQL de service) et le test d'identité du contrat.

### D. Admin

- **D1 · Parcours Playwright sur l'API en CI** : aujourd'hui ils tournent à la main. Les lancer en CI
  contre l'API et une base de test, comptes fournis par l'environnement.
- **D2 · C8, suppression douce** (optionnelle, `docs/PROMPT-CORRECTION-PRINCE-EDJA.md` § 7.5) :
  **seulement sur confirmation**.
- **D3 · C9, nettoyage** : à partir de `docs/ELEMENTS-RETIRES.md`, un élément à la fois, tests verts
  entre chaque. **Seulement sur confirmation écrite.** Aucune table supprimée sans descente testée.
- **D4 · Lettre d'information** : option 1 ou 2 (`docs/PROMPT-CORRECTION-PRINCE-EDJA.md` § 9) à faire
  trancher, puis écran correspondant.

### E. Contenus (fournis par la maison, jamais inventés)

- **E1 · Reprise des contenus existants** : `npm run migrer:contenus` (back end) les importe **en
  brouillons** ; la maison les complète et les publie depuis l'admin. Vérifier le rapport
  (`docs/RAPPORT-MIGRATION.md`) : aucun objet perdu sans explication.
- **E2 · À fournir** : textes des cinq pages légales (Q-35 back end), prix et matières confirmés,
  créateurs, sources de l'archive, chiffres d'audience datés, corps des articles, guides PDF des
  épisodes (Q-47), liste réelle des livres (Q-48), photos, logos des partenaires, durées de
  conservation (Q-23), textes des offres, signature et manifeste confirmés.
- **E3 · Anglais** : le site et l'admin le prévoient, aucun contenu éditorial n'est traduit (M-01).

### F. Tests et qualité à ajouter

- **F1 · Test du chargeur** (`scripts/charger-donnees.ts`) avec un `fetch` simulé : pagination,
  dédoublonnage des produits, échec sur réponse hors contrat.
- **F2 · Test de contrat du site** contre l'API de développement, sur le modèle de
  `admin/src/api/contrat-reel.test.ts` (ignoré sans `API_REELLE=1`).
- **F3 · Accessibilité** (WCAG 2.1 AA) et performance (Lighthouse) sur les pages principales, en mode
  API ; `npm run contraste` reste vert.
- **F4 · Parcours de bout en bout du site** : publier dans l'admin → charger → construire → la page
  existe, avec son prérendu (après B1).

### G. Mise en ligne (recette G5)

Dans l'ordre : C5 (API en préproduction) → B4 (CI qui charge l'API) → B1 (prérendu) → B5 (domaine,
sitemap) → E1/E2 (contenus publiés) → recette signée par le client → push sur `recent`.

## 4. Décisions en attente (à poser, pas à deviner)

| Sujet | Qui | Référence |
|---|---|---|
| Hébergeur de l'API, domaine du site et de l'API, médias | Client | Q-21, Q-42, Q-50 (back end) |
| Site : rester sur GitHub Pages ou changer d'hébergeur | Client | Q-22 |
| Lettre d'information : option 1 ou 2 | Client | PROMPT-CORRECTION § 9 |
| C8 et C9 | Client, par écrit | PROMPT-CORRECTION § 12 |
| Étiquettes, identifiant des produits, textes qui comptent | Responsable du contrat | Questions 35 à 37 |
| Routes publiques galeries, étiquettes, créateurs | Responsable technique | Q-53 à Q-56 |
| Fichiers parasites de `docs/` | Client | Tâche A5 |
| Questions plus anciennes encore ouvertes | Client / technique | `docs/QUESTIONS.md` § 6 et suivants |

## 5. Compte rendu attendu à la fin de chaque étape

1. **Fait** : ce qui a changé, fichier par fichier, en une ligne chacun.
2. **Vérifié** : les commandes lancées et leur résultat réel (nombre de tests, erreurs), plus ce qui a
   été regardé dans le navigateur.
3. **Non fait** : ce qui reste, et pourquoi.
4. **Questions** : ajoutées à `docs/QUESTIONS.md`, numérotées à la suite.
5. **Décisions** : consignées (D-xx ou B-xx).
