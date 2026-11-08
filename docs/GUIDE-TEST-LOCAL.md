# Tester tout le système sur sa machine

> Base de données, API, admin et site public, en local. Écrit le 08/11/2026 ; noms de scripts
> vérifiés dans les trois `package.json`. Les mots de passe des comptes de développement ne sont
> **pas** dans ce fichier : ils sont gardés hors du dépôt (`<…>` ci-dessous).

## 0. Avant de commencer

- Ouvre un terminal **dans WSL** (Ubuntu). Dans VS Code : « WSL: Open Folder in WSL ». Passer par
  `\\wsl.localhost` depuis Windows fait tomber le pont de fichiers dès que la machine est chargée.
- Docker doit tourner.
- Prévois **trois terminaux**, un par brique.
- WSL n'a que 3,8 Go de mémoire : ne lance pas les tests longs en même temps qu'un build.

| Brique | Dossier | Adresse |
|---|---|---|
| Base PostgreSQL 17 (Docker) | `~/projets/prince-edja-api` | port 5433 |
| API | `~/projets/prince-edja-api` | http://localhost:3000 |
| Admin | `~/projets/test/admin` | http://localhost:5180 |
| Site public (développement) | `~/projets/test` | http://localhost:5173/site-prince-edja/ |
| Site public (version construite) | `~/projets/test` | http://localhost:4173/site-prince-edja/ |

## 1. Base de données et API (terminal 1)

```bash
cd ~/projets/prince-edja-api
npm run db:demarrer      # démarre PostgreSQL (Docker)
npm run db:migrer        # applique les migrations en attente (sans effet si tout est à jour)
npm run dev              # API, redémarre à chaque modification
```

Vérification, dans un autre terminal :

```bash
curl http://127.0.0.1:3000/sante    # doit répondre 200
```

Première installation seulement (base vide) : `npm run db:semer` pose les données de départ, puis
`npm run bootstrap` crée le premier super-admin à partir des variables `BOOTSTRAP_SUPERADMIN_*` de
`.env` (voir `.env.example`).

## 2. Admin (terminal 2)

```bash
cd ~/projets/test/admin
npm run dev:api          # admin branché sur l'API locale (pas de faux serveur)
```

- Ouvre http://localhost:5180.
- Connecte-toi avec un compte de la base locale, par exemple `fondatrice@exemple.test` /
  `<mot de passe du compte fondatrice>`.
- `npm run dev` (sans `:api`) lance l'admin sur un **faux serveur** (MSW) : rien n'arrive dans la
  base. Pour tester le système, toujours `dev:api`.

## 3. Site public (terminal 3)

```bash
cd ~/projets/test
PUBLIC_API_URL=http://127.0.0.1:3000 npm run charger   # télécharge les contenus publiés
PUBLIC_DATA_SOURCE=api npm run dev                     # site avec les données de l'API
```

Ouvre http://localhost:5173/site-prince-edja/.

Le site lit l'API **au chargement seulement**, jamais pendant l'affichage (LIAISON § C.2). Après
chaque publication dans l'admin : `Ctrl+C`, puis relance les deux commandes.

Sans `PUBLIC_DATA_SOURCE=api`, le site affiche ses données de départ (`src/data/`), comme sur GitHub
Pages aujourd'hui.

## 4. Scénarios à tester à la main

| # | Dans l'admin | Puis sur le site, après rechargement |
|---|---|---|
| 1 | Journal : créer un article avec image et catégorie, le soumettre, le publier | `/journal` le liste ; sa page s'ouvre ; sa catégorie apparaît dans les filtres |
| 2 | Edja Shop : créer un bijou, confirmer son prix, le publier | `/boutique` le montre ; sa fiche affiche le prix en FCFA |
| 3 | Edja Shop : créer un livre (catégorie obligatoire, image), le publier | Section « Livres » de `/boutique` ; sa fiche s'ouvre |
| 4 | Projets : un projet, un épisode rattaché, une destination liée à l'épisode avec coordonnées et un tag de pays | `/histoires` (projet à la une), `/xplore` (point sur la carte), `/xplore/<épisode>`, `/destinations/<destination>` |
| 5 | Presse, distinctions, parcours, partenaires, offres : un élément de chaque | `/presse`, `/a-propos` |
| 6 | Dépublier un contenu | Il disparaît du site |
| 7 | — | Envoyer le formulaire de `/contact` : le terminal 1 journalise `POST /public/api/v1/contact` avec un code 2xx |

Pour le scénario 7 : si le navigateur signale une erreur CORS, ajoute `http://localhost:5173` à
`ALLOWED_ORIGINS` dans `prince-edja-api/.env`, puis relance l'API. Ce circuit n'a pas encore été
vérifié de bout en bout (`docs/PROMPT-SUITE-PRINCE-EDJA.md`, B3).

La lettre d'information et la demande de pièces d'Edja Shop ne passent pas encore par l'API : elles
préparent un e-mail.

## 5. Le site tel qu'il sera en ligne (version construite)

```bash
cd ~/projets/test
PUBLIC_API_URL=http://127.0.0.1:3000 npm run charger
PUBLIC_DATA_SOURCE=api npm run build
npm run preview          # http://localhost:4173/site-prince-edja/
```

En mode API, la construction **s'arrête** si les données n'ont pas été chargées : c'est voulu.

## 6. Tests automatiques

Un bloc à la fois.

### Back end (l'API n'a pas besoin de tourner, la base oui)

```bash
cd ~/projets/prince-edja-api
npm run lint && npm run typecheck && npm test   # tests unitaires, rapide
npm run test:integration                        # long (plus de 10 minutes) : lance-le seul
npm run build
```

### Admin (l'API doit tourner)

```bash
cd ~/projets/test/admin
npm run typecheck && npm run lint && npm test
```

Contrat : le client de l'admin face à la vraie API.

```bash
API_REELLE=1 VITE_API_URL=http://127.0.0.1:3000/admin/api/v1 \
ADMIN_EMAIL=fondatrice@exemple.test ADMIN_MOT_DE_PASSE='<mot de passe du compte fondatrice>' \
npx vitest run src/api/contrat-reel.test.ts
```

Parcours dans un vrai navigateur. Playwright démarre l'admin en mode `api` s'il ne tourne pas déjà.
Chaque passage publie un article « Exemple E2E » dans la base.

```bash
E2E_EDITEUR_EMAIL=redactrice@exemple.test E2E_EDITEUR_MDP='<mot de passe des comptes e2e>' \
E2E_ADMIN_EMAIL=relectrice@exemple.test E2E_ADMIN_MDP='<mot de passe des comptes e2e>' \
E2E_EMAIL=relectrice@exemple.test E2E_MOT_DE_PASSE='<mot de passe des comptes e2e>' \
npm run test:e2e
```

### Site public

```bash
cd ~/projets/test
npm run typecheck && npm run lint && npm test && npm run build
```

### Résultats attendus au 08/11/2026

| Brique | Résultat |
|---|---|
| Back end | Tout au vert (suite complète à relancer après B-66) |
| Admin | 276 tests ; contrat 39 sur 39 ; 12 parcours réussis, 8 ignorés |
| Site | 73 tests ; lint : 5 avertissements anciens, 0 erreur ; build vert |

## 7. Après les tests

- `Ctrl+C` dans chaque terminal.
- `npm run db:arreter` dans `prince-edja-api` pour couper la base.
- La base contient des contenus d'essai titrés « Exemple : » et « Exemple E2E » : supprime-les depuis
  l'admin quand ils ne servent plus.

## 8. Problèmes fréquents

| Symptôme | Cause et remède |
|---|---|
| « PUBLIC_DATA_SOURCE=api : aucune donnée chargée » | Lancer `npm run charger` (API démarrée) avant `dev` ou `build` |
| `npm run charger` échoue sur une réponse « hors contrat » | L'API ne renvoie pas la forme du contrat § 18.1 : l'API a changé, ou n'a pas redémarré après une modification |
| Port déjà pris | `lsof -i :3000` (ou `:5180`, `:5173`, `:4173`), puis arrêter le processus |
| L'admin refuse la connexion | API arrêtée, ou admin lancé avec `dev` au lieu de `dev:api` |
| Erreur CORS sur le formulaire de contact | Ajouter l'adresse du site à `ALLOWED_ORIGINS` (`prince-edja-api/.env`) |
| Commandes ou VS Code figés | Pont Windows ↔ WSL tombé : ouvrir le projet avec « WSL: Open Folder in WSL » |
| Un contenu publié n'apparaît pas sur le site | Relancer `npm run charger` puis le site : rien n'est lu en direct |
