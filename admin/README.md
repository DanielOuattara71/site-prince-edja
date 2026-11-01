# Admin Prince Edja

Espace d'administration du site Prince Edja : application React autonome, servie sur sa
propre adresse, qui parle à l'API `/admin/api/v1`. La forme des échanges est fixée par
[`docs/CONTRAT-API.md`](../docs/CONTRAT-API.md) (à la racine du dépôt), qui fait foi. Tant que
le back end n'existe pas, l'API est simulée par MSW.

> État : **étape 7** — distinctions, presse, archive (sources exigées), univers, jalons, offres, pages fixes ; **étape 6** — boutique (créateurs, bijoux et variantes, catégories), épisodes, projets, villes, destinations (formulaires déclaratifs) ; médiathèque ; articles de bout en bout sur les gabarits de liste et de formulaire
> (filtres dans l'adresse, actions groupées, brouillon automatique, aperçu avec articles liés,
> historique, circuit soumettre → publier → suivi de reconstruction). Critère G2 du lot 1 vérifié
> contre l'API réelle (`npm run test:e2e`). Composants transverses : étape 3 ; les autres écrans
> affichent leur étape de livraison.
>
> En développement, **`/composants`** montre chaque composant sur le faux serveur. Cette page
> n'existe pas dans le build.

## Faux serveur (développement)

`npm run dev` démarre l'admin avec un faux serveur qui applique les règles du contrat :
session (durée glissante), CSRF, versions et restauration des articles, transitions, RG-02,
RG-03, RG-04, RG-06, RG-08, créateurs en lecture. Il n'existe qu'en
développement : `verifier-dist` garantit qu'il n'atteint jamais le build.

| Compte d'essai         | Rôle        | Mot de passe           |
| ---------------------- | ----------- | ---------------------- |
| `editeur@exemple.test` | éditeur     | `exemple-mot-de-passe` |
| `admin@exemple.test`   | admin       | `exemple-mot-de-passe` |
| `super@exemple.test`   | super-admin | `exemple-mot-de-passe` |

Réglages par l'adresse de la page : `?latence=0` (réponses immédiates), `?echecs=0.1`
(10 % de pannes simulées). Les données d'exemple sont marquées « Exemple ».

## Prérequis

- Node.js **22.12 ou plus** (24 recommandé, utilisé en CI)
- npm

## Installation

```bash
cd admin
npm ci
cp .env.example .env.local   # facultatif : VITE_API_URL par défaut /admin/api/v1
```

## Scripts

| Commande                          | Rôle                                                                                                    |
| --------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `npm run dev`                     | Serveur de développement (port 5180)                                                                    |
| `npm run dev:api`                 | Idem, branché sur l'API locale (`prince-edja-api`, port 3000) au lieu du faux serveur (D-47)            |
| `npm run test:e2e`                | Playwright contre l'API réelle (`E2E_EMAIL`, `E2E_MOT_DE_PASSE`), bureau et mobile, audit axe complet   |
| `npm run build`                   | Typage, build de production, puis `verifier-dist`                                                       |
| `npm run preview`                 | Sert `dist` (port 5181, en-tête `X-Robots-Tag: noindex`)                                                |
| `npm run typecheck`               | `tsc -b` : application, tests et configuration                                                          |
| `npm run lint`                    | oxlint (react, typescript, jsx-a11y, import) — **aucun avertissement toléré**                           |
| `npm run format` / `format:check` | Prettier                                                                                                |
| `npm test`                        | Vitest (jsdom), dont l'audit axe et le contrôle des jetons                                              |
| `npm run verifier-dist`           | Refuse MSW, données d'exemple, comptes d'essai et toute `VITE_*` autre que `VITE_API_URL` dans le build |

Ordre de vérification : `npm run typecheck && npm run lint && npm test && npm run build`.

## Variables

| Variable       | Où           | Rôle                                                                               |
| -------------- | ------------ | ---------------------------------------------------------------------------------- |
| `VITE_API_URL` | client       | Adresse de l'API. **Seule** variable `VITE_*` autorisée.                           |
| `ADMIN_BASE`   | build (Node) | Chemin de base de l'application, `/` par défaut. Devient le `basename` du routeur. |

Aucun secret, identifiant ni mot de passe dans le code ou les variables : la session passe
par un cookie `HttpOnly` posé par le serveur.

## Structure

```text
admin/
  src/
    app/        routeur, fournisseurs, gabarits
    api/
      client.ts   seul endroit qui appelle fetch (CSRF en mémoire, rejeu unique, erreurs)
      erreurs.ts  ErreurApi et lecture des details (manquants RG-03, usages RG-08)
      schemas/    schémas Zod = contrat (lecture tolérante, écriture stricte)
      endpoints/  une fonction typée par route ; gabarit de ressource
      mocks/      faux serveur MSW : magasin, règles, handlers, jeux d'exemple
    auth/       peut(), session, gardes, verrou et inactivité
    components/ ui (primitives, dialogues, états), layout, formulaire, editeur, medias,
                listes, tags, versions, apercu, createurs, retours (notifications)
    features/   une famille de contenu par dossier                        (étapes 4-9)
    i18n/       fr.ts — tous les libellés de l'interface
    lib/        utilitaires purs ; preferences.ts, seul accès autorisé à localStorage (D-39)
    styles/     globals.css — jetons copiés du site public
    test/       outils de test (axe, setup, faux serveur des tests)
  scripts/      verifier-dist.mjs
  docs/         DECISIONS.md
```

## Choix de pile

Socle aligné sur les versions installées du site public ; ajouts figés à des versions
publiées depuis au moins 14 jours. Détail et justification des trois écarts au prompt
(oxlint au lieu d'ESLint + jsx-a11y, `@dnd-kit/react` au lieu de `@dnd-kit/core`, `axe-core`
au lieu de `vitest-axe`) : [`docs/DECISIONS.md`](docs/DECISIONS.md).

## Design system

Le bloc `@theme` et la couche `:root` de `src/styles/globals.css` sont **copiés à
l'identique** du site public ; un test échoue s'ils divergent. Les ajouts de l'admin se
placent après ce bloc, jamais dedans.
