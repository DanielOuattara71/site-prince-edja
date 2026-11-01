# Reprise du chantier admin + back end — Prince EDJA

> Prompt de passation, écrit le 01/11/2026. Il s'adresse à un agent IA qui reprend le travail sans
> l'historique de la conversation. Lis-le en entier avant toute commande.

## 1. Ta mission

Tu continues la construction de deux livrables :

- **l'administration** (`admin/`, dans le dépôt du site : `/home/ouattara_nadin/projets/test`) ;
- **le back end** (`/home/ouattara_nadin/projets/prince-edja-api`, dépôt séparé).

L'utilisateur a demandé d'**enchaîner toutes les étapes sans s'arrêter pour validation**, et de ne
le contacter que pour un point **très critique** (décision qui engage le client, risque de perte de
données, secret manquant). Le reste se tranche avec l'hypothèse la plus prudente, consignée dans
`DECISIONS.md` (admin : `admin/docs/DECISIONS.md` ; back end : `docs/DECISIONS.md`) et, s'il faut
une réponse du client, dans `docs/QUESTIONS.md` du back end.

## 2. Documents qui font foi (à lire d'abord)

| Document | Rôle |
| --- | --- |
| `docs/CONTRAT-API.md` (v1.3.0, dépôt du site) | **Fait foi** entre l'admin et le back end. Aucun code ne précède la version du contrat qui le décrit |
| `docs/PROMPT-ADMIN-PRINCE-EDJA.md` | Cahier de l'admin ; écrans § 9, règles § 11, étapes § 13 |
| `docs/PROMPT-BACKEND-PRINCE-EDJA.md` | Cahier du back end |
| `prince-edja-api/docs/PLAN.md` | Étapes 1 à 12 du back end et leur ordre |
| `admin/docs/DECISIONS.md` | Décisions D-01 à D-56 |
| `prince-edja-api/docs/DECISIONS.md` | Décisions B-01 à B-45 |
| `AGENTS.md` (racine du site) | Conventions du site public |

## 3. Où en est-on

### Admin — étapes 0 à 7 faites

- Socle, couche `api/` et faux serveur MSW, `peut()`, coquille, composants transverses.
- Gabarits `ListePage` / `useCycleContenu` (`src/features/gabarits/`), articles de bout en bout
  (`src/features/articles/`), médiathèque (`src/features/medias/`).
- Parcours G2 vérifié en navigateur contre la vraie API (`e2e/g2-article.spec.ts`).
- **Étape 6, partie boutique faite** (D-57 à D-61) :
  - gabarit de formulaire extrait (`features/gabarits/useEditeurContenu.ts` et `editeur.tsx`,
    avec `PageFormulaire`), articles migrés dessus ;
  - `ListePage` accepte des filtres propres ;
  - écrans `/createurs`, `/bijoux` (variantes, galerie, aperçu « sur demande ») et
    `/categories` (liste ordonnable) ;
  - faux serveur de la boutique (`mocks/handlers/{categories,createurs,bijoux}.ts`,
    `mocks/regles-boutique.ts`, `mocks/cycle.ts`) ;
  - e2e `e2e/boutique.spec.ts` vert contre la vraie API.
- **Fin de l'étape 6 faite** (D-62 à D-65) : épisodes, projets, villes, destinations sur des
  **formulaires déclaratifs** (`features/gabarits/declaratif.ts`, `EcransDeclaratifs.tsx`,
  `champs.tsx`) et une fabrique de ressources simulées (`mocks/ressource-simulee.ts`). Une
  famille de plus = une description dans `features/editorial/specs.ts` + une configuration dans
  `mocks/handlers/editorial.ts`. **C'est le patron à suivre pour l'étape 7.**
- **Étape 7 faite** (D-67, D-68) : distinctions, presse, archive, univers, jalons, offres, pages, toutes déclaratives (`features/editorial/specs.ts`, `mocks/handlers/editorial-lot3.ts`). Nouveaux types de champ : `booleen`, `sources`, `blocs` ; ensembles fermés (`fermee`).
- Dernier état : 185 tests sur 185 (deux exécutions stables), lint et typecheck propres, build et `verifier-dist` OK, e2e
  8 sur 8 contre l'API (`g2.sh`).

### Back end — étapes 0 à 6 et 9 faites, étape 4 étendue

- Socle, schéma (79 tables), accès (sessions, CSRF, Argon2id), articles, tags, journal, versions,
  médias, publication du site (file de tâches maison `tache`, pas pg-boss, B-34).
- **Étape 6 (boutique) terminée** : modules `categories`, `createurs`, `bijoux` (+ variantes),
  aide commune `src/modules/contenus/transition.ts`, tests `tests/integration/boutique.test.ts`.
  Décisions B-39 à B-45.
- **Suite de l'étape 4, première partie faite** : épisodes, projets, villes, destinations sur la
  **fabrique** `src/modules/contenus/fabrique.ts` (B-47) ; une ressource = une configuration dans
  `src/modules/editorial/configurations.ts` + ses schémas dans `schemas.ts`, branchés en boucle
  dans `serveur.ts`. Migration `0003` (coordonnées vides en brouillon, B-46). Contrat passé en
  **1.2.0** (copie dans `docs/contrat/`, `contratApi` dans `package.json`).
- **Lot 3 éditorial fait** (B-48) : archive, distinctions, presse, univers, jalons, offres, pages
  sur la fabrique (`configurations-lot3.ts`), migration `0004`, contrat **1.3.0**. Reste au lot 3 :
  galerie, études de cas, partenaires, pages légales (pas encore d'écran admin non plus).
- Dernier état : 142 tests sur 142, lint, formatage et build OK ; e2e de l'admin 10 sur 10 contre
  l'API. Question ouverte Q-45 (clés de bloc des pages).

### Rien n'est commité

L'utilisateur commite lui-même. **Ne commite ni ne pousse sans demande explicite.**

## 4. Tâches restantes, dans l'ordre

1. ~~Admin étape 6~~ : **faite** (voir § 3). Ce qui suit dans ce point la décrit, pour mémoire.
   À reporter côté back end avec le lot 2 éditorial : coordonnées vides en brouillon, code de tag
   `cote-d-ivoire`, `tri=ordre` (D-64, D-65 de l'admin).
   - Commencer par la boutique : elle correspond au back end tout juste livré.
   - Existant : `src/api/schemas/createurs.ts` et `src/api/mocks/handlers/createurs.ts` ne font
     que **lire** (sélecteurs). Ajouter les schémas Zod (createurs complets, `bijoux` + `Variante`,
     `categories`) conformes au § 10 du contrat **et** au back end réel. Par exemple, la liste des
     catégories renvoie des objets complets (B-45), les montants sont des entiers FCFA, et
     `prixConfirme` est réservé à l'admin.
   - Étendre le faux serveur (handlers, `magasin`, données `__PE_EXEMPLE__`), puis les écrans sur
     les gabarits existants : ne pas recopier le code des articles.
   - Règles à rendre visibles :
     - prix masqué tant que `prixConfirme` est faux (« sur demande ») ;
     - bloc variantes et exigences de vente selon `boutiqueEnLigne` ;
     - créateur principal marqué « Plateforme », impossible à supprimer ou désactiver (RG-21) ;
     - un créateur avec des bijoux propose la désactivation et explique la dépublication (RG-27) ;
     - sélecteur et filtre de créateur masqués tant que `multiVendeurs` est faux ;
     - compteur de bijoux par catégorie, RG-09 ;
     - réordonnancement au glisser-déposer avec alternative clavier (@dnd-kit/react).
   - Épisodes, projets, villes et destinations (contrat § 9.2 à 9.5) : sur MSW seulement, le
     back end ne les a pas encore.
   - Validation de l'étape : mode « sur demande », prix masqué, créateur principal protégé (fait).
     Ajouter si possible un e2e Playwright contre la vraie API, sur le modèle de G2.
2. **Back end, suite de l'étape 4 (lot 3)** : épisodes, projets, villes, destinations **faits**.
   Restent les autres ressources éditoriales (archive, distinctions, presse, galerie, univers, jalons, offres,
   études de cas, partenaires, pages, pages légales).
   - Reprendre le patron de `bijoux` / `createurs` (service, dépôt, schémas, routes,
     `transition.ts`).
   - Ajouter chaque table dans `TABLES_PROGRAMMABLES` (`publication/service.ts`), ses
     restaurateurs (`serveur.ts`) et le tableau de bord (`SourceTableau`).
   - Règles propres : archive (au moins une source), destination (coordonnées dans le pays,
     `COORDONNEES_HORS_PAYS`), page légale (corps non vide), `PATCH /{r}/ordre` pour les
     ressources ordonnables.
3. ~~**Admin étape 7**~~ **faite** : distinctions, presse, archive, univers, jalons, offres, pages. Validation :
   une entrée d'archive sans source n'est pas publiable.
4. **Back end étape 8** : audience et e-mails (contact, collaboration, newsletter à double
   consentement, demandes à plusieurs lignes, modèles FR/EN, purges). Côté admin : `messages`,
   `demandes`, `abonnes`.
5. **Admin étape 8** : messages, demandes, abonnés, navigation, textes d'interface, pages légales,
   paramètres. Validation : export CSV, confirmation du manifeste.
6. **Back end étape 7** : lecture publique (`/public/api/v1/contenus`, `/site`, `/sitemap`,
   RG-07, catégories vides masquées RG-09).
7. **Admin étape 9** : comptes, journal, publication, profil, tableau de bord (parcours
   super-admin).
8. **Back end étapes 10, 11, 12** : multi-vendeurs verrouillé, migration de `src/data/*` (une
   variante par pièce, tout en brouillon, rapport à blanc), clôture (sécurité, documentation,
   passation).
9. **Admin étape 10** : audit d'accessibilité, performance, nettoyage, documentation, critères
   d'acceptation globaux (25 écrans, trois états chacun, axe sans violation sérieuse).

Questions déjà ouvertes chez le client : `prince-edja-api/docs/QUESTIONS.md`, Q-01 à Q-44.
Notamment le domaine de production, l'hébergement de l'API et le workflow de build (Q-21, Q-22,
Q-44).

## 5. Règles non négociables

- **Ne jamais inventer** un prix, une matière, un créateur, un chiffre d'audience, une source ou un
  texte juridique. Vide ≠ zéro : un champ inconnu est `null` et apparaît dans `champsAFournir`.
- Aucun secret, aucune clé, aucun identifiant par défaut dans le code ni dans un bundle.
- Admin : `VITE_API_URL` est la **seule** variable `VITE_*`. Aucun contenu en `localStorage` ou
  `sessionStorage`, sauf `src/lib/preferences.ts` (D-39).
- MSW, les données `__PE_EXEMPLE__` et les comptes `@exemple.test` ne doivent **jamais** atteindre
  `dist` : `scripts/verifier-dist.mjs` le contrôle à chaque build.
- Back end : le rôle de l'API n'est **jamais** propriétaire des tables. Toute opération passe par
  `enTransaction` (sécurité par ligne : `app.role`, `app.createur_id`). Toute écriture laisse une
  ligne de journal et, pour un contenu versionné, un instantané, **dans la même transaction**. Un
  module n'importe jamais le dépôt d'un autre : il passe par les fonctions exportées de son service.
- Comptes et mots de passe e2e : variables d'environnement, jamais dans le dépôt.
- Admin : appliquer le motif « ajustement d'état pendant le rendu », pas un `useEffect` de remise
  à zéro. `peut()` est le seul endroit qui teste un rôle. Sa copie dans
  `prince-edja-api/src/droits/peut.ts` doit rester **identique** (un test le vérifie).
- Ne pas toucher à `admin/dump2.mjs` : ce script n'appartient pas au chantier, et il fait échouer
  `prettier --check .`. Formater `src docs e2e README.md` seulement.

## 6. Environnement et pièges

- Windows + WSL. Les commandes passent par :
  `MSYS_NO_PATHCONV=1 wsl.exe -d Ubuntu-24.04 -- bash -lc 'cd … && …'`.
  Les accents graves et certains guillemets sont mangés dans `bash -lc`. Pour une modification
  complexe, écrire un script Python dans le dossier temporaire et l'exécuter avec `python3`, ou
  utiliser l'outil d'édition sur le chemin `\\wsl.localhost\Ubuntu-24.04\…`.
- Base locale : `npm run db:demarrer` dans le back end (PostgreSQL 17 en Docker, port 5433). Les
  tests d'intégration utilisent `prince_edja_test`.
- Base de dev : super-admin d'essai `fondatrice@exemple.test` / « la pirogue rentre au port »
  (développement seulement).
- Admin contre la vraie API : `npm run dev:api` (proxy vers `localhost:3000`, sans MSW).
- Tests admin sous jsdom :
  - un `FormData` avec fichier ne passe pas le `fetch` de Node : simuler l'appel et vérifier
    l'envoi réel en e2e (D-56) ;
  - le premier chargement de l'éditeur riche est lent : attente de Testing Library à 10 s,
    `testTimeout` à 20 s.
- Le tableau de bord compte désormais articles, bijoux et créateurs : le créateur principal semé
  y apparaît comme brouillon « à fournir ».
- Jamais de `<form>` imbriqué : un dialogue avec formulaire se rend hors du `<form>` de la page
  (D-60, bug invisible sous jsdom). Boutons répétés par ligne : `aria-label` complet plutôt qu'un
  complément `sr-only`.
- Le script `g2.sh` (dossier temporaire de la session) rejoue tous les e2e contre l'API locale.
  Il dépend de comptes de dev (`redactrice@` et `relectrice@exemple.test`) : les recréer s'il a
  disparu.

## 7. Barrière de qualité à chaque étape

```bash
# admin/
npx prettier --check src docs e2e README.md && npm run typecheck && npm run lint && npm test && npm run build
# prince-edja-api/
npm run format:check && npm run typecheck && npm run lint && npx vitest run && npm run build
```

À la fin de chaque étape :

- consigner les décisions (D-57 et suivantes côté admin, B-46 et suivantes côté back end) ;
- mettre à jour la ligne « État » des deux `README.md` ;
- ne déclarer un test « vert » que sur la sortie réelle de la commande.

## 8. Prochaine action concrète

> Les quatre points ci-dessous (boutique) sont **faits**, l'étape 6 de l'admin aussi. Prochaine
> action : **back end étape 8** (audience et e-mails : messages, demandes à plusieurs lignes,
> abonnés à double consentement, purges), puis **admin étape 8** (messages, demandes, abonnés,
> navigation, textes d'interface, pages légales, paramètres).

1. Relire le contrat, § 10, et `prince-edja-api/src/modules/{categories,createurs,bijoux}/schemas.ts`
   pour la forme exacte des corps et réponses.
2. Dans l'admin, écrire `src/api/schemas/{categories,bijoux}.ts`, compléter
   `src/api/schemas/createurs.ts` et ajouter les points d'accès dans `src/api/endpoints/`.
3. Étendre le faux serveur avec ces ressources et leurs règles (RG-09, RG-10, RG-11, RG-20, RG-21,
   RG-27, `SLUG_FIGE`, `MULTI_VENDEURS_INACTIF`), puis ses tests dans `faux-serveur.test.ts`.
4. Brancher `/createurs`, `/bijoux` et `/categories` dans `ECRANS_LIVRES` (`src/app/routeur.tsx`)
   et construire les écrans sur `ListePage` et `useCycleContenu`.
